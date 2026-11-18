-- FD-ON1. Private tables and restricted PostgREST RPCs for the authenticated Folk Edge Function.
create schema if not exists folk_duel;
revoke all on schema folk_duel from public, anon, authenticated;

create table folk_duel.room_documents (
  id uuid primary key,
  code text not null check (code ~ '^[A-Z2-9]{6}$'),
  game text not null check (game in ('o-an-quan', 'nhay-lo-co')),
  revision integer not null check (revision > 0),
  active_until bigint not null,
  created_at bigint not null,
  document jsonb not null,
  unique (game, code)
);

create index folk_room_queue on folk_duel.room_documents (game, created_at)
  where document->>'phase' = 'lobby' and document->>'isPublic' = 'true';
create index folk_room_due on folk_duel.room_documents (((document->>'deadlineAt')::bigint))
  where document->>'phase' <> 'finished';
create index folk_room_live on folk_duel.room_documents (game, active_until);

create table folk_duel.outcomes (
  room_id uuid not null references folk_duel.room_documents (id),
  round integer not null check (round > 0),
  winner text,
  reason text not null,
  scores jsonb not null,
  primary key (room_id, round)
);

create table folk_duel.request_budget (
  uid uuid not null,
  kind text not null check (kind in ('read', 'write')),
  expires_at bigint not null,
  hit_count integer not null,
  primary key (uid, kind)
);

alter table folk_duel.room_documents enable row level security;
alter table folk_duel.outcomes enable row level security;
alter table folk_duel.request_budget enable row level security;
revoke all on all tables in schema folk_duel from public, anon, authenticated;
grant usage on schema folk_duel to service_role;
grant select, insert, update on all tables in schema folk_duel to service_role;

create function public.folk_room_lookup(p_game text, p_uid uuid, p_kind text, p_value text, p_now bigint)
returns jsonb language sql stable security invoker set search_path = ''
as $$
  select r.document from folk_duel.room_documents r
  where r.game = p_game and case p_kind
    when 'member' then r.id = p_value::uuid and
      r.document->'players' @> jsonb_build_array(jsonb_build_object('uid', p_uid))
    when 'code' then r.code = p_value
    when 'resume' then r.active_until > p_now and
      r.document->'players' @> jsonb_build_array(jsonb_build_object('uid', p_uid, 'left', false))
    when 'queue' then r.active_until > p_now and r.document->>'phase' = 'lobby' and r.document->>'isPublic' = 'true'
    else false end
  order by r.created_at, r.id limit 1
$$;

create function public.folk_room_commit(p_expected integer, p_room jsonb, p_now bigint)
returns boolean language plpgsql security invoker set search_path = ''
as $$
declare
  v_id uuid := (p_room->>'roomId')::uuid;
  v_game text := p_room->>'game';
  v_revision integer := (p_room->>'revision')::integer;
  v_until bigint := (p_room->>'activeUntil')::bigint;
begin
  -- Serialize short writes per game. This makes the queue and the one-live-room check atomic.
  perform pg_advisory_xact_lock(hashtextextended('arcadex:folk:' || v_game, 0));
  if v_revision <> p_expected + 1 then return false; end if;
  if v_until > p_now and exists (
    select 1 from folk_duel.room_documents r
    cross join lateral jsonb_array_elements(p_room->'players') player
    where r.game = v_game and r.id <> v_id and r.active_until > p_now
      and player->>'left' = 'false'
      and r.document->'players' @> jsonb_build_array(jsonb_build_object('uid', player->>'uid', 'left', false))
  ) then return false; end if;
  if p_expected = 0 then
    if p_room->>'isPublic' = 'true' and exists (
      select 1 from folk_duel.room_documents r where r.game = v_game and r.active_until > p_now
        and r.document->>'phase' = 'lobby' and r.document->>'isPublic' = 'true'
    ) then return false; end if;
    insert into folk_duel.room_documents (id, code, game, revision, active_until, created_at, document)
    values (v_id, p_room->>'code', v_game, v_revision, v_until, (p_room->>'createdAt')::bigint, p_room)
    on conflict do nothing;
  else
    update folk_duel.room_documents set revision = v_revision, active_until = v_until, document = p_room
    where id = v_id and game = v_game and revision = p_expected;
  end if;
  if not found then return false; end if;
  if p_room->>'phase' = 'finished' and p_room->>'winner' is not null then
    insert into folk_duel.outcomes (room_id, round, winner, reason, scores)
    values (v_id, (p_room->>'round')::integer, p_room->>'winner', p_room->>'finishReason', p_room->'state'->'scores')
    on conflict (room_id, round) do nothing;
  end if;
  return true;
end;
$$;

create function public.folk_room_budget(p_uid uuid, p_kind text, p_now bigint)
returns boolean language sql security invoker set search_path = ''
as $$
  insert into folk_duel.request_budget as b (uid, kind, expires_at, hit_count)
  values (p_uid, p_kind, p_now + 10000, 1)
  on conflict (uid, kind) do update set
    expires_at = case when b.expires_at <= p_now then excluded.expires_at else b.expires_at end,
    hit_count = case when b.expires_at <= p_now then 1 else least(b.hit_count + 1, 61) end
  returning hit_count <= case when p_kind = 'read' then 22 else 60 end
$$;

revoke all on function public.folk_room_lookup(text, uuid, text, text, bigint) from public, anon, authenticated;
revoke all on function public.folk_room_commit(integer, jsonb, bigint) from public, anon, authenticated;
revoke all on function public.folk_room_budget(uuid, text, bigint) from public, anon, authenticated;
grant execute on function public.folk_room_lookup(text, uuid, text, text, bigint) to service_role;
grant execute on function public.folk_room_commit(integer, jsonb, bigint) to service_role;
grant execute on function public.folk_room_budget(uuid, text, bigint) to service_role;

create function public.folk_room_due(p_now bigint)
returns jsonb language sql stable security invoker set search_path = ''
as $$
  select coalesce(jsonb_agg(d.document), '[]'::jsonb) from (
    select document from folk_duel.room_documents where document->>'phase' <> 'finished'
      and (document->>'deadlineAt')::bigint <= p_now
    order by (document->>'deadlineAt')::bigint limit 200
  ) d
$$;
revoke all on function public.folk_room_due(bigint) from public, anon, authenticated;
grant execute on function public.folk_room_due(bigint) to service_role;

create table folk_duel.scheduler_auth (
  singleton boolean primary key default true check (singleton),
  token_hash text not null check (length(token_hash) = 64)
);
alter table folk_duel.scheduler_auth enable row level security;
revoke all on folk_duel.scheduler_auth from public, anon, authenticated;
grant select, insert, update on folk_duel.scheduler_auth to service_role;
create function public.folk_room_authorize_tick(p_hash text)
returns boolean language sql stable security invoker set search_path = ''
as $$
  select exists (select 1 from folk_duel.scheduler_auth where singleton and token_hash = p_hash)
$$;
revoke all on function public.folk_room_authorize_tick(text) from public, anon, authenticated;
grant execute on function public.folk_room_authorize_tick(text) to service_role;
