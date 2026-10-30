-- Authoritative Chess / Xiangqi / Caro rooms for the duel-room Edge Function
-- (src/games/duel/server.ts). Modelled on supabase/battleship: service-only persistence, the
-- browser never reads or writes these rows. NOT APPLIED to any project yet.
create schema if not exists duel_private;
revoke all on schema duel_private from public, anon, authenticated;
grant usage on schema duel_private to service_role;

create table if not exists duel_private.rooms (
 id text primary key,
 code text not null unique check (code ~ '^[A-Z2-9]{6}$'),
 game text not null check (game in ('chess','xiangqi','caro')),
 version integer not null check (version >= 0),
 active boolean not null,
 doc jsonb not null,
 updated_at timestamptz not null default clock_timestamp()
);
alter table duel_private.rooms enable row level security;
revoke all on duel_private.rooms from public, anon, authenticated;
grant select, insert, update on duel_private.rooms to service_role;
create index if not exists duel_rooms_active on duel_private.rooms(active) where active;

create or replace function public.duel_room_read(p_id text) returns jsonb language sql security invoker set search_path='' as $$
 select doc from duel_private.rooms where id = p_id;
$$;
create or replace function public.duel_room_by_code(p_code text) returns jsonb language sql security invoker set search_path='' as $$
 select doc from duel_private.rooms where code = p_code;
$$;

-- One active room per identity, serialized by a per-identity advisory lock. Retrying the same
-- request id returns the existing room.
create or replace function public.duel_room_create(p_room jsonb) returns jsonb language plpgsql security invoker set search_path='' as $$
declare owner_uid text := p_room->'members'->>'host'; existing jsonb;
begin
 if owner_uid is null or p_room->>'status' <> 'waiting' or (p_room->>'version')::int <> 0 then raise exception 'invalid initial room'; end if;
 perform pg_advisory_xact_lock(hashtextextended(owner_uid, 0));
 select doc into existing from duel_private.rooms where id = p_room->>'id';
 if existing is not null then
  if existing->'members'->>'host' <> owner_uid then raise exception 'room ID conflict'; end if;
  return existing;
 end if;
 if exists(select 1 from duel_private.rooms r, jsonb_each_text(r.doc->'members') m where r.active and m.value = owner_uid) then
  raise exception 'identity already has an active room';
 end if;
 insert into duel_private.rooms(id, code, game, version, active, doc) values (p_room->>'id', p_room->>'code', p_room->>'game', 0, true, p_room);
 return p_room;
end;$$;

-- Version-checked replace. Rejects a forfeit when any seat in expiryGuard was seen after its
-- cutoff (a heartbeat raced the scheduler), and keeps the newest lastSeen per seat.
create or replace function public.duel_room_cas(p_version integer, p_room jsonb) returns jsonb language plpgsql security invoker set search_path='' as $$
declare v_uid text; current_version integer; current_doc jsonb; seat text; latest_seen jsonb;
begin
 if (p_room->>'version')::int <> p_version + 1 then raise exception 'invalid version'; end if;
 for v_uid in select value from jsonb_each_text(p_room->'members') order by value loop
  perform pg_advisory_xact_lock(hashtextextended(v_uid, 0));
 end loop;
 select version, doc into current_version, current_doc from duel_private.rooms where id = p_room->>'id' for update;
 if current_version is null or current_version <> p_version then return null; end if;
 if p_room ? 'expiryGuard' then
  for seat in select jsonb_array_elements_text(p_room->'expiryGuard'->'seats') loop
   if coalesce((current_doc->'lastSeen'->>seat)::bigint, (current_doc->>'createdAt')::bigint) > (p_room->'expiryGuard'->>'cutoff')::bigint then return null; end if;
  end loop;
 end if;
 if p_room->>'status' <> 'closed' and exists(
  select 1 from duel_private.rooms r, jsonb_each_text(r.doc->'members') old_member
  where r.active and r.id <> p_room->>'id' and old_member.value in (select value from jsonb_each_text(p_room->'members'))
 ) then raise exception 'identity already has an active room'; end if;
 select coalesce(jsonb_object_agg(k, greatest(
  coalesce((current_doc->'lastSeen'->>k)::bigint, (current_doc->>'createdAt')::bigint),
  coalesce((p_room->'lastSeen'->>k)::bigint, (p_room->>'createdAt')::bigint)
 )), '{}'::jsonb) into latest_seen from jsonb_object_keys(p_room->'members') k;
 p_room := (p_room - 'expiryGuard') || jsonb_build_object('lastSeen', latest_seen);
 update duel_private.rooms set doc = p_room, version = p_version + 1, active = p_room->>'status' <> 'closed', updated_at = clock_timestamp() where id = p_room->>'id';
 return p_room;
end;$$;

-- Presence pulse: shares the row lock, never bumps the gameplay version, never revives a seat
-- that has already passed the 90 s reconnect grace.
create or replace function public.duel_room_touch(p_id text, p_uid text, p_now bigint) returns jsonb language plpgsql security invoker set search_path='' as $$
declare current_doc jsonb; seat text; seen bigint;
begin
 select doc into current_doc from duel_private.rooms where id = p_id for update;
 if current_doc is null then return null; end if;
 select key into seat from jsonb_each_text(current_doc->'members') where value = p_uid;
 if seat is null then raise exception 'not a room member'; end if;
 if current_doc->>'status' = 'closed' then return current_doc; end if;
 seen := coalesce((current_doc->'lastSeen'->>seat)::bigint, (current_doc->>'createdAt')::bigint);
 if seen <= p_now - 90000 then return current_doc; end if;
 if p_now - seen >= 5000 then
  current_doc := jsonb_set(current_doc, '{lastSeen}', coalesce(current_doc->'lastSeen', '{}'::jsonb) || jsonb_build_object(seat, p_now));
  update duel_private.rooms set doc = current_doc where id = p_id;
 end if;
 return current_doc;
end;$$;

-- Rooms the scheduler must settle: stale waiting rooms, expired turns and absent seats.
create or replace function public.duel_room_due(p_now bigint) returns setof jsonb language sql security invoker set search_path='' as $$
 select doc from duel_private.rooms where active and (
  (case when doc->>'status' = 'waiting' then (doc->>'createdAt')::bigint + 600000 else (doc->'state'->>'deadline')::bigint end) <= p_now
  or (doc->>'status' = 'active' and exists(select 1 from jsonb_each_text(doc->'members') m
      where coalesce((doc->'lastSeen'->>m.key)::bigint, (doc->>'createdAt')::bigint) <= p_now - 90000))
 ) order by updated_at limit 100;
$$;

-- Atomic per-identity request budget shared by every Edge isolate.
create table if not exists duel_private.request_budget(
 uid text not null, kind text not null, window_start timestamptz not null, hits integer not null,
 primary key (uid, kind)
);
alter table duel_private.request_budget enable row level security;
revoke all on duel_private.request_budget from public, anon, authenticated;
grant select, insert, update on duel_private.request_budget to service_role;
create or replace function public.duel_room_rate(p_uid text, p_kind text) returns boolean language plpgsql security invoker set search_path='' as $$
declare current_window timestamptz := date_trunc('minute', clock_timestamp()); used integer;
begin
 if p_uid is null or length(p_uid) > 128 or p_kind not in ('read','write') then return false; end if;
 insert into duel_private.request_budget(uid, kind, window_start, hits) values (p_uid, p_kind, current_window, 1)
 on conflict (uid, kind) do update set
  hits = case when request_budget.window_start = excluded.window_start then request_budget.hits + 1 else 1 end,
  window_start = excluded.window_start
 returning hits into used;
 return used <= case when p_kind = 'read' then 120 else 60 end;
end;$$;

revoke all on function public.duel_room_read(text), public.duel_room_by_code(text), public.duel_room_create(jsonb),
 public.duel_room_cas(integer,jsonb), public.duel_room_touch(text,text,bigint), public.duel_room_due(bigint),
 public.duel_room_rate(text,text) from public, anon, authenticated;
grant execute on function public.duel_room_read(text), public.duel_room_by_code(text), public.duel_room_create(jsonb),
 public.duel_room_cas(integer,jsonb), public.duel_room_touch(text,text,bigint), public.duel_room_due(bigint),
 public.duel_room_rate(text,text) to service_role;
