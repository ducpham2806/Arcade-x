-- Nối Từ (word-chain) rooms for the word-chain-room Edge Function (src/games/word-chain/server.ts).
-- Same pattern as supabase/duel: private schema, service-only RPCs, the browser never reads or
-- writes these rows. NOT APPLIED to any project; see docs/WORD-CHAIN-SERVER.md.
create schema if not exists wc_private;
revoke all on schema wc_private from public, anon, authenticated;
grant usage on schema wc_private to service_role;

create table if not exists wc_private.rooms (
 id text primary key,
 code text not null unique check (code ~ '^[A-Z2-9]{6}$'),
 version integer not null check (version >= 0),
 active boolean not null,
 doc jsonb not null,
 updated_at timestamptz not null default clock_timestamp()
);
alter table wc_private.rooms enable row level security;
revoke all on wc_private.rooms from public, anon, authenticated;
grant select, insert, update on wc_private.rooms to service_role;
create index if not exists wc_rooms_active on wc_private.rooms(active) where active;

create or replace function public.wc_room_read(p_id text) returns jsonb language sql security invoker set search_path='' as $$
 select doc from wc_private.rooms where id = p_id;
$$;
create or replace function public.wc_room_by_code(p_code text) returns jsonb language sql security invoker set search_path='' as $$
 select doc from wc_private.rooms where code = p_code;
$$;

-- One active room per identity (per-identity advisory lock); retrying a request id returns it.
create or replace function public.wc_room_create(p_room jsonb) returns jsonb language plpgsql security invoker set search_path='' as $$
declare owner_uid text := p_room->'members'->>'P1'; existing jsonb;
begin
 if owner_uid is null or p_room->>'status' <> 'waiting' or (p_room->>'version')::int <> 0
    or (p_room->>'capacity')::int not between 2 and 4 then raise exception 'invalid initial room'; end if;
 perform pg_advisory_xact_lock(hashtextextended(owner_uid, 0));
 select doc into existing from wc_private.rooms where id = p_room->>'id';
 if existing is not null then
  if existing->'members'->>'P1' is distinct from owner_uid then raise exception 'room ID conflict'; end if;
  return existing;
 end if;
 if exists(select 1 from wc_private.rooms r, jsonb_each_text(r.doc->'members') m where r.active and m.value = owner_uid) then
  raise exception 'identity already has an active room';
 end if;
 insert into wc_private.rooms(id, code, version, active, doc) values (p_room->>'id', p_room->>'code', 0, true, p_room);
 return p_room;
end;$$;

-- Version-checked replace. Rejects an absence removal when a guarded seat was seen after its
-- cutoff (a heartbeat raced the scheduler) and keeps the newest lastSeen per remaining seat.
create or replace function public.wc_room_cas(p_version integer, p_room jsonb) returns jsonb language plpgsql security invoker set search_path='' as $$
declare v_uid text; current_version integer; current_doc jsonb; v_seat text; latest_seen jsonb;
begin
 if (p_room->>'version')::int <> p_version + 1 then raise exception 'invalid version'; end if;
 for v_uid in select value from jsonb_each_text(p_room->'members') order by value loop
  perform pg_advisory_xact_lock(hashtextextended(v_uid, 0));
 end loop;
 select version, doc into current_version, current_doc from wc_private.rooms where id = p_room->>'id' for update;
 if current_version is null or current_version <> p_version then return null; end if;
 if p_room ? 'expiryGuard' then
  for v_seat in select jsonb_array_elements_text(p_room->'expiryGuard'->'seats') loop
   if coalesce((current_doc->'lastSeen'->>v_seat)::bigint, (current_doc->>'createdAt')::bigint) > (p_room->'expiryGuard'->>'cutoff')::bigint then return null; end if;
  end loop;
 end if;
 if p_room->>'status' <> 'closed' and exists(
  select 1 from wc_private.rooms r, jsonb_each_text(r.doc->'members') old_member
  where r.active and r.id <> p_room->>'id' and old_member.value in (select value from jsonb_each_text(p_room->'members'))
 ) then raise exception 'identity already has an active room'; end if;
 select coalesce(jsonb_object_agg(k, greatest(
  coalesce((current_doc->'lastSeen'->>k)::bigint, (current_doc->>'createdAt')::bigint),
  coalesce((p_room->'lastSeen'->>k)::bigint, (p_room->>'createdAt')::bigint)
 )), '{}'::jsonb) into latest_seen from jsonb_object_keys(p_room->'members') k;
 p_room := (p_room - 'expiryGuard') || jsonb_build_object('lastSeen', latest_seen);
 update wc_private.rooms set doc = p_room, version = p_version + 1, active = p_room->>'status' <> 'closed', updated_at = clock_timestamp() where id = p_room->>'id';
 return p_room;
end;$$;

-- Presence pulse: row lock, no version change, never revives a seat past the 90 s grace.
create or replace function public.wc_room_touch(p_id text, p_uid text, p_now bigint) returns jsonb language plpgsql security invoker set search_path='' as $$
declare current_doc jsonb; v_seat text; seen bigint;
begin
 select doc into current_doc from wc_private.rooms where id = p_id for update;
 if current_doc is null then return null; end if;
 select key into v_seat from jsonb_each_text(current_doc->'members') where value = p_uid;
 if v_seat is null then raise exception 'not a room member'; end if;
 if current_doc->>'status' = 'closed' then return current_doc; end if;
 seen := coalesce((current_doc->'lastSeen'->>v_seat)::bigint, (current_doc->>'createdAt')::bigint);
 if seen <= p_now - 90000 then return current_doc; end if;
 if p_now - seen >= 5000 then
  current_doc := jsonb_set(current_doc, '{lastSeen}', coalesce(current_doc->'lastSeen', '{}'::jsonb) || jsonb_build_object(v_seat, p_now));
  update wc_private.rooms set doc = current_doc where id = p_id;
 end if;
 return current_doc;
end;$$;

-- Matchmaking for 2–4 players. Under one global queue lock: a player already in an active room
-- gets that room back (replayed request); otherwise they take the first free seat of the oldest
-- public waiting room that is under 10 minutes old, has room and someone seen in the last 90 s;
-- otherwise p_room (a fresh public room with them in P1) is created. Starting is decided by the
-- room server (full room, or 20 s after `pairAt`).
create or replace function public.wc_room_match(p_uid text, p_room jsonb, p_name text, p_now bigint) returns jsonb language plpgsql security invoker set search_path='' as $$
declare v_doc jsonb; r record; v_seat text; v_count integer;
begin
 if p_uid is null or p_room->'members'->>'P1' is distinct from p_uid or not coalesce((p_room->>'public')::boolean, false) or (p_room->>'capacity')::int <> 4 then
  raise exception 'invalid matchmaking request';
 end if;
 perform pg_advisory_xact_lock(hashtextextended('word-chain-matchmaking-v1', 0));
 perform pg_advisory_xact_lock(hashtextextended(p_uid, 0));
 select x.doc into v_doc from wc_private.rooms x, jsonb_each_text(x.doc->'members') m where x.active and m.value = p_uid limit 1;
 if v_doc is not null then return v_doc; end if;
 for r in select id, version, doc from wc_private.rooms
   where active and doc->>'status' = 'waiting' and coalesce((doc->>'public')::boolean, false) and (doc->>'createdAt')::bigint > p_now - 600000
   order by (doc->>'createdAt')::bigint, id for update skip locked loop
  select count(*) into v_count from jsonb_object_keys(r.doc->'members');
  continue when v_count >= (r.doc->>'capacity')::int;
  continue when not exists(select 1 from jsonb_each_text(r.doc->'members') m
    where coalesce((r.doc->'lastSeen'->>m.key)::bigint, (r.doc->>'createdAt')::bigint) > p_now - 90000);
  select s into v_seat from unnest(array['P1','P2','P3','P4']) with ordinality as t(s, n) where not (r.doc->'members' ? s) order by n limit 1;
  v_doc := r.doc
   || jsonb_build_object('version', r.version + 1)
   || jsonb_build_object('members', (r.doc->'members') || jsonb_build_object(v_seat, p_uid))
   || jsonb_build_object('chatMembers', coalesce(r.doc->'chatMembers', '{}'::jsonb) || jsonb_build_object(v_seat, (r.doc->>'id') || ':' || v_seat || ':' || ((r.doc->>'version')::int+1)::text))
   || jsonb_build_object('names', coalesce(r.doc->'names', '{}'::jsonb) || jsonb_build_object(v_seat, left(coalesce(p_name, ''), 18)))
   || jsonb_build_object('lastSeen', coalesce(r.doc->'lastSeen', '{}'::jsonb) || jsonb_build_object(v_seat, p_now));
  if v_count + 1 >= 2 and not (r.doc ? 'pairAt') then v_doc := v_doc || jsonb_build_object('pairAt', p_now); end if;
  update wc_private.rooms set doc = v_doc, version = r.version + 1, updated_at = clock_timestamp() where id = r.id;
  return v_doc;
 end loop;
 return public.wc_room_create(p_room);
end;$$;

-- Rooms the scheduler must settle: stale or ready-to-start lobbies, ready/turn deadlines,
-- expired rematch votes and absent seats.
create or replace function public.wc_room_due(p_now bigint) returns setof jsonb language sql security invoker set search_path='' as $$
 select doc from wc_private.rooms where active and (
  (doc->>'status' = 'waiting' and (
    (doc->>'createdAt')::bigint + 600000 <= p_now
    or (coalesce((doc->>'public')::boolean, false) and doc ? 'pairAt' and (doc->>'pairAt')::bigint + 20000 <= p_now)
    or (select count(*) from jsonb_object_keys(doc->'members')) >= (doc->>'capacity')::int))
  or (doc->>'status' = 'active' and doc->'match'->>'phase' <> 'finished' and (doc->'match'->>'deadline')::bigint <= p_now)
  or (doc->>'status' = 'active' and doc->'match'->>'phase' = 'finished' and coalesce((doc->'rematch'->>'until')::bigint, 0) <= p_now)
  or exists(select 1 from jsonb_each_text(doc->'members') m
      where coalesce((doc->'lastSeen'->>m.key)::bigint, (doc->>'createdAt')::bigint) <= p_now - 90000)
 ) order by updated_at limit 100;
$$;

-- Atomic per-identity request budget shared by every Edge isolate. Turns poll about once a second.
create table if not exists wc_private.request_budget(
 uid text not null, kind text not null, window_start timestamptz not null, hits integer not null,
 primary key (uid, kind)
);
alter table wc_private.request_budget enable row level security;
revoke all on wc_private.request_budget from public, anon, authenticated;
grant select, insert, update on wc_private.request_budget to service_role;
create or replace function public.wc_room_rate(p_uid text, p_kind text) returns boolean language plpgsql security invoker set search_path='' as $$
declare current_window timestamptz := date_trunc('minute', clock_timestamp()); used integer;
begin
 if p_uid is null or length(p_uid) > 128 or p_kind not in ('read','write') then return false; end if;
 insert into wc_private.request_budget(uid, kind, window_start, hits) values (p_uid, p_kind, current_window, 1)
 on conflict (uid, kind) do update set
  hits = case when request_budget.window_start = excluded.window_start then request_budget.hits + 1 else 1 end,
  window_start = excluded.window_start
 returning hits into used;
 return used <= case when p_kind = 'read' then 150 else 60 end;
end;$$;

-- Cron uses a tick-only credential generated inside Vault, never the service-role key.
create table if not exists wc_private.scheduler_auth(
 singleton boolean primary key default true check(singleton),
 token_hash text not null check(token_hash ~ '^[0-9a-f]{64}$')
);
alter table wc_private.scheduler_auth enable row level security;
revoke all on wc_private.scheduler_auth from public, anon, authenticated;
grant select on wc_private.scheduler_auth to service_role;
create or replace function public.wc_room_tick_authorized(p_hash text) returns boolean
 language sql security invoker set search_path='' as $$
 select exists(select 1 from wc_private.scheduler_auth where token_hash=p_hash);
$$;

revoke all on function public.wc_room_tick_authorized(text) from public, anon, authenticated;
grant execute on function public.wc_room_tick_authorized(text) to service_role;
revoke all on function public.wc_room_read(text), public.wc_room_by_code(text), public.wc_room_create(jsonb),
 public.wc_room_cas(integer,jsonb), public.wc_room_touch(text,text,bigint), public.wc_room_match(text,jsonb,text,bigint),
 public.wc_room_due(bigint), public.wc_room_rate(text,text) from public, anon, authenticated;
grant execute on function public.wc_room_read(text), public.wc_room_by_code(text), public.wc_room_create(jsonb),
 public.wc_room_cas(integer,jsonb), public.wc_room_touch(text,text,bigint), public.wc_room_match(text,jsonb,text,bigint),
 public.wc_room_due(bigint), public.wc_room_rate(text,text) to service_role;
