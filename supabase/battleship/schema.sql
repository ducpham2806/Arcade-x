-- Canonical room persistence; applied to Arcade-x by battleship_online_room_backend_v1.
-- Service-only persistence. The browser has no access to the private Room documents.
create schema if not exists battleship_private;
revoke all on schema battleship_private from public, anon, authenticated;
grant usage on schema battleship_private to service_role;
create table if not exists battleship_private.rooms (
 id text primary key,
 code text not null unique check (code ~ '^[A-Z2-9]{6}$'),
 version integer not null check(version>=0),
 active boolean not null,
 doc jsonb not null,
 updated_at timestamptz not null default clock_timestamp()
);
alter table battleship_private.rooms enable row level security;
revoke all on battleship_private.rooms from public,anon,authenticated;
grant select,insert,update on battleship_private.rooms to service_role;
create index if not exists bs_rooms_active on battleship_private.rooms(active) where active;

create or replace function public.bs_room_read(p_id text) returns jsonb language sql security invoker set search_path='' as $$
 select doc from battleship_private.rooms where id=p_id;
$$;
create or replace function public.bs_room_by_code(p_code text) returns jsonb language sql security invoker set search_path='' as $$
 select doc from battleship_private.rooms where code=p_code;
$$;
create or replace function public.bs_room_create(p_room jsonb) returns jsonb language plpgsql security invoker set search_path='' as $$
declare owner_uid text := p_room->'members'->>'A1'; existing jsonb;
begin
 if owner_uid is null or p_room->>'status'<>'waiting' or (p_room->>'version')::int<>0 then raise exception 'invalid initial room'; end if;
 perform pg_advisory_xact_lock(hashtextextended(owner_uid,0));
 select doc into existing from battleship_private.rooms where id=p_room->>'id';
 if existing is not null then
  if existing->'members'->>'A1' <> owner_uid then raise exception 'room ID conflict'; end if;
  return existing;
 end if;
 if exists(select 1 from battleship_private.rooms r,jsonb_each_text(r.doc->'members') m where r.active and m.value=owner_uid and not coalesce(r.doc->'departed' ? m.key,false)) then raise exception 'identity already has an active room'; end if;
 insert into battleship_private.rooms(id,code,version,active,doc) values(p_room->>'id',p_room->>'code',0,true,p_room);
 return p_room;
end;$$;
create or replace function public.bs_room_cas(p_version integer,p_room jsonb) returns jsonb language plpgsql security invoker set search_path='' as $$
declare v_uid text; current_version integer;
begin
 if (p_room->>'version')::int<>p_version+1 then raise exception 'invalid version'; end if;
 -- Shared identities lock in a stable order before taking the room row lock.
 for v_uid in select value from jsonb_each_text(p_room->'members') order by value loop
  perform pg_advisory_xact_lock(hashtextextended(v_uid,0));
 end loop;
 select version into current_version from battleship_private.rooms where id=p_room->>'id' for update;
 if current_version is null or current_version<>p_version then return null; end if;
 if p_room->>'status'<>'closed' and exists(
  select 1 from battleship_private.rooms r,jsonb_each_text(r.doc->'members') old_member
  where r.active and r.id<>p_room->>'id' and old_member.value in (select value from jsonb_each_text(p_room->'members'))
 ) then raise exception 'identity already has an active room'; end if;
 update battleship_private.rooms set doc=p_room,version=p_version+1,active=p_room->>'status'<>'closed',updated_at=clock_timestamp() where id=p_room->>'id';
 return p_room;
end;$$;
create or replace function public.bs_room_due(p_now bigint) returns setof jsonb language sql security invoker set search_path='' as $$
 select doc from battleship_private.rooms where active and
 (case when doc->>'status'='waiting' then (doc->>'createdAt')::bigint+600000 else (doc->'state'->>'deadline')::bigint end)<=p_now
 order by updated_at limit 100;
$$;
revoke all on function public.bs_room_read(text),public.bs_room_by_code(text),public.bs_room_create(jsonb),public.bs_room_cas(integer,jsonb),public.bs_room_due(bigint) from public,anon,authenticated;
grant execute on function public.bs_room_read(text),public.bs_room_by_code(text),public.bs_room_create(jsonb),public.bs_room_cas(integer,jsonb),public.bs_room_due(bigint) to service_role;

-- Atomic per-identity request budget shared by every Edge isolate.
create table if not exists battleship_private.request_budget(
 uid text not null,kind text not null,window_start timestamptz not null,hits integer not null,
 primary key(uid,kind)
);
alter table battleship_private.request_budget enable row level security;
revoke all on battleship_private.request_budget from public,anon,authenticated;
grant select,insert,update on battleship_private.request_budget to service_role;
create or replace function public.bs_room_rate(p_uid text,p_kind text) returns boolean
language plpgsql security invoker set search_path='' as $$
declare current_window timestamptz := date_trunc('minute',clock_timestamp()); used integer;
begin
 if p_uid is null or length(p_uid)>128 or p_kind not in ('read','write') then return false; end if;
 insert into battleship_private.request_budget(uid,kind,window_start,hits) values(p_uid,p_kind,current_window,1)
 on conflict(uid,kind) do update set
 hits=case when request_budget.window_start=excluded.window_start then request_budget.hits+1 else 1 end,
 window_start=excluded.window_start
 returning hits into used;
 return used<=case when p_kind='read' then 90 else 30 end;
end;$$;
revoke all on function public.bs_room_rate(text,text) from public,anon,authenticated;
grant execute on function public.bs_room_rate(text,text) to service_role;

-- Apply presence.sql after this bootstrap for the current heartbeat/CAS behavior.
