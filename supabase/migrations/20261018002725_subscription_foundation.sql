-- Stage 1/2: additive access-control foundation. No prices, paid games or admin are seeded.
begin;
create schema if not exists launcher_private;
revoke all on schema launcher_private from public, anon;
grant usage on schema launcher_private to authenticated;
create table launcher_private.admins (
 user_id uuid primary key references auth.users(id), created_at timestamptz not null default now()
);
create table launcher_private.rollout (
 id boolean primary key default true check(id), mode text not null default 'off' check(mode in ('off','pilot'))
);
insert into launcher_private.rollout(id) values(true);
create table launcher_private.pilots (user_id uuid primary key references auth.users(id));
create table launcher_private.starter_config (
 id boolean primary key default true check(id), enabled boolean not null default false,
 game_ids text[] not null default '{}' check(cardinality(game_ids) in (0,3))
);
insert into launcher_private.starter_config(id) values(true);
create table launcher_private.starter_claims (
 user_id uuid primary key references auth.users(id), game_ids text[] not null check(cardinality(game_ids)=3),
 claimed_at timestamptz not null default now()
);
create table launcher_private.blocks (
 id uuid primary key default gen_random_uuid(), user_id uuid not null references auth.users(id),
 game_id text references public.launcher_games(id), starts_at timestamptz not null default now(),
 expires_at timestamptz, revoked_at timestamptz, reason text not null check(length(trim(reason)) between 3 and 500),
 check(expires_at is null or expires_at>starts_at)
);
create index launcher_blocks_owner on launcher_private.blocks(user_id);
create table launcher_private.audit (
 id bigint generated always as identity primary key, actor_id uuid not null references auth.users(id),
 action text not null, target_id text, reason text not null,
 before_state jsonb, after_state jsonb, created_at timestamptz not null default now()
);
alter table public.launcher_entitlements alter column order_id drop not null;
alter table public.launcher_entitlements add column source text not null default 'payment' check(source in ('payment','admin','starter'));
alter table public.launcher_entitlements add constraint entitlement_source_order check((source='payment' and order_id is not null) or (source<>'payment' and order_id is null));
-- Existing payment rows and RPCs retain their defaults and behavior.
do $$declare t text;begin
 foreach t in array array['admins','rollout','pilots','blocks','audit','starter_config','starter_claims'] loop
  execute format('alter table launcher_private.%I enable row level security',t);
  execute format('revoke all on launcher_private.%I from public,anon,authenticated',t);
 end loop;
end$$;

create function launcher_private.is_admin() returns boolean language sql stable security definer set search_path='' as $$
 select auth.uid() is not null and not coalesce((auth.jwt()->>'is_anonymous')::boolean,false)
 and exists(select 1 from launcher_private.admins where user_id=auth.uid())
$$;
create function launcher_private.require_admin() returns void language plpgsql stable security definer set search_path='' as $$
begin
 if not launcher_private.is_admin() then raise exception 'Admin required' using errcode='42501';end if;
end$$;

-- Not exposed as RPC. The caller identity is selected by the authenticated wrapper below.
create function launcher_private.evaluate_access(p_user uuid,p_game text) returns jsonb language plpgsql stable security definer set search_path='' as $$
declare g public.launcher_games; permitted boolean;
begin
 if auth.uid() is null then raise exception 'Sign in required' using errcode='42501';end if;
 if p_user is distinct from auth.uid() and not launcher_private.is_admin() then raise exception 'Owner mismatch' using errcode='42501';end if;
 if exists(select 1 from launcher_private.blocks where user_id=p_user and game_id is null and revoked_at is null and starts_at<=now() and (expires_at is null or expires_at>now())) then
  return jsonb_build_object('allowed',false,'reason','account_blocked');end if;
 select * into g from public.launcher_games where id=p_game;
 if not found or g.status<>'published' then return jsonb_build_object('allowed',false,'reason','unavailable');end if;
 if exists(select 1 from launcher_private.blocks where user_id=p_user and game_id=p_game and revoked_at is null and starts_at<=now() and (expires_at is null or expires_at>now())) then
  return jsonb_build_object('allowed',false,'reason','game_blocked');end if;
 if g.access_model='free' then return jsonb_build_object('allowed',true,'reason','free');end if;
 select exists(select 1 from public.launcher_entitlements where owner_id=p_user and (game_id=p_game or all_games) and revoked_at is null and starts_at<=now() and (expires_at is null or expires_at>now())) into permitted;
 return jsonb_build_object('allowed',permitted,'reason',case when permitted then 'owned' else 'locked' end);
end$$;
create function launcher_private.check_access(p_game_id text) returns jsonb language plpgsql stable security definer set search_path='' as $$
begin
 if auth.uid() is null or coalesce((auth.jwt()->>'is_anonymous')::boolean,false) then return public.launcher_check_access(p_game_id);end if;
 if (select mode from launcher_private.rollout where id)='pilot' and exists(select 1 from launcher_private.pilots where user_id=auth.uid()) then
  return launcher_private.evaluate_access(auth.uid(),p_game_id);
 end if;
 return public.launcher_check_access(p_game_id);
end$$;
create function public.launcher_check_access_v2(p_game_id text) returns jsonb language sql stable security invoker set search_path='' as $$select launcher_private.check_access(p_game_id)$$;

create function launcher_private.admin_state(p_user uuid default null) returns jsonb language plpgsql stable security definer set search_path='' as $$
begin
 perform launcher_private.require_admin();
 return jsonb_build_object('mode',(select mode from launcher_private.rollout where id),
 'games',(select coalesce(jsonb_agg(jsonb_build_object('id',id,'title',title,'status',status,'access_model',access_model) order by sort_order,id),'[]') from public.launcher_games),
 'pilot',exists(select 1 from launcher_private.pilots where user_id=p_user),
 'starter',(select jsonb_build_object('enabled',enabled,'game_ids',game_ids) from launcher_private.starter_config where id),
 'entitlements',(select coalesce(jsonb_agg(to_jsonb(e) order by starts_at desc),'[]') from public.launcher_entitlements e where owner_id=p_user),
 'blocks',(select coalesce(jsonb_agg(to_jsonb(b) order by starts_at desc),'[]') from launcher_private.blocks b where user_id=p_user),
 'audit',(select coalesce(jsonb_agg(to_jsonb(a) order by id desc),'[]') from (select * from launcher_private.audit order by id desc limit 50) a));
end$$;
create function public.launcher_admin_state(p_user uuid default null) returns jsonb language sql stable security invoker set search_path='' as $$select launcher_private.admin_state(p_user)$$;
create function public.launcher_is_admin() returns boolean language sql stable security invoker set search_path='' as $$select launcher_private.is_admin()$$;
create function launcher_private.admin_access(p_user uuid,p_game text) returns jsonb language plpgsql stable security definer set search_path='' as $$
begin perform launcher_private.require_admin();return launcher_private.evaluate_access(p_user,p_game);end$$;
create function public.launcher_admin_check_access(p_user uuid,p_game text) returns jsonb language sql stable security invoker set search_path='' as $$select launcher_private.admin_access(p_user,p_game)$$;

-- Single audited command surface. No payment confirmation or admin-role changes here.
create function launcher_private.admin_command(p_action text,p_payload jsonb,p_reason text) returns jsonb language plpgsql security definer set search_path='' as $$
declare u uuid; gid text; rid uuid; expiry timestamptz; term text; before_row jsonb; after_row jsonb; target text; scope_all boolean;
begin
 perform launcher_private.require_admin();
 if p_reason is null or length(trim(p_reason)) not between 3 and 500 then raise exception 'Reason required (3–500 characters)' using errcode='22023';end if;
 if p_payload is null or jsonb_typeof(p_payload)<>'object' then raise exception 'Invalid payload' using errcode='22023';end if;
 if p_action in ('grant','block','pilot') then
  u:=(p_payload->>'user_id')::uuid;
  if u is null or not exists(select 1 from auth.users where id=u and not coalesce(is_anonymous,false)) then raise exception 'Registered user required' using errcode='22023';end if;
  target:=u::text;
 end if;
 if p_action='grant' then
  gid:=nullif(p_payload->>'game_id','');scope_all:=coalesce((p_payload->>'all_games')::boolean,false);
  if (scope_all and gid is not null) or (not scope_all and gid is null) then raise exception 'Choose game or all games' using errcode='22023';end if;
  term:=p_payload->>'term';
  expiry:=case term when '7d' then now()+interval '168 hours' when '14d' then now()+interval '336 hours' when '30d' then now()+interval '720 hours'
   when '3m' then ((now() at time zone 'Asia/Ho_Chi_Minh')+interval '3 months') at time zone 'Asia/Ho_Chi_Minh'
   when '6m' then ((now() at time zone 'Asia/Ho_Chi_Minh')+interval '6 months') at time zone 'Asia/Ho_Chi_Minh'
   when '1y' then ((now() at time zone 'Asia/Ho_Chi_Minh')+interval '1 year') at time zone 'Asia/Ho_Chi_Minh' else null end;
  if expiry is null then raise exception 'Invalid term' using errcode='22023';end if;
  insert into public.launcher_entitlements(owner_id,game_id,all_games,expires_at,source) values(u,gid,scope_all,expiry,'admin') returning id,to_jsonb(launcher_entitlements.*) into rid,after_row;
  target:=rid::text;
 elsif p_action='revoke' then
  rid:=(p_payload->>'id')::uuid;
  select to_jsonb(e) into before_row from public.launcher_entitlements e where id=rid for update;
  if not found then raise exception 'Entitlement not found' using errcode='22023';end if;
  if before_row->>'source'<>'admin' then raise exception 'Only manual grants can be revoked here; payments need refund workflow' using errcode='22023';end if;
  update public.launcher_entitlements set revoked_at=coalesce(revoked_at,now()) where id=rid returning to_jsonb(launcher_entitlements.*) into after_row;target:=rid::text;
 elsif p_action='block' then
  gid:=nullif(p_payload->>'game_id','');expiry:=nullif(p_payload->>'expires_at','')::timestamptz;
  if expiry is not null and expiry<=now() then raise exception 'Expiry must be in future' using errcode='22023';end if;
  insert into launcher_private.blocks(user_id,game_id,expires_at,reason) values(u,gid,expiry,trim(p_reason)) returning id,to_jsonb(blocks.*) into rid,after_row;target:=rid::text;
 elsif p_action='unblock' then
  rid:=(p_payload->>'id')::uuid;
  select to_jsonb(b) into before_row from launcher_private.blocks b where id=rid for update;
  if not found then raise exception 'Block not found' using errcode='22023';end if;
  update launcher_private.blocks set revoked_at=coalesce(revoked_at,now()) where id=rid returning to_jsonb(blocks.*) into after_row;target:=rid::text;
 elsif p_action='pilot' then
  before_row:=jsonb_build_object('enabled',exists(select 1 from launcher_private.pilots where user_id=u));
  if not p_payload ? 'enabled' or jsonb_typeof(p_payload->'enabled')<>'boolean' then raise exception 'enabled required' using errcode='22023';end if;
  if (p_payload->>'enabled')::boolean then insert into launcher_private.pilots values(u) on conflict do nothing;else delete from launcher_private.pilots where user_id=u;end if;
  after_row:=jsonb_build_object('enabled',(p_payload->>'enabled')::boolean);
 elsif p_action='mode' then
  if p_payload->>'mode' is null or p_payload->>'mode' not in ('off','pilot') then raise exception 'Only off/pilot supported in this release' using errcode='22023';end if;
  select to_jsonb(r) into before_row from launcher_private.rollout r where id for update;
  update launcher_private.rollout set mode=p_payload->>'mode' where id returning to_jsonb(rollout.*) into after_row;target:='rollout';
 elsif p_action='maintenance' then
  gid:=p_payload->>'game_id';
  if p_payload->>'status' is null or p_payload->>'status' not in ('published','maintenance') then raise exception 'Invalid status' using errcode='22023';end if;
  select to_jsonb(g) into before_row from public.launcher_games g where id=gid and status in ('published','maintenance') for update;
  if not found then raise exception 'Published game required' using errcode='22023';end if;
  update public.launcher_games set status=p_payload->>'status',updated_at=now() where id=gid returning to_jsonb(launcher_games.*) into after_row;target:=gid;
 else raise exception 'Unknown action' using errcode='22023';end if;
 insert into launcher_private.audit(actor_id,action,target_id,reason,before_state,after_state) values(auth.uid(),p_action,target,trim(p_reason),before_row,after_row);
 return jsonb_build_object('ok',true,'id',target);
end$$;
create function public.launcher_admin_command(p_action text,p_payload jsonb,p_reason text) returns jsonb language sql security invoker set search_path='' as $$select launcher_private.admin_command(p_action,p_payload,p_reason)$$;

-- Session creation uses the same authority as the launch UI; clients cannot bypass a pilot block.
create function launcher_private.session_start(p_game_id text,p_session_id uuid,p_expected_owner uuid) returns void language plpgsql security definer set search_path='' as $$
begin
 if p_expected_owner is not null and p_expected_owner is distinct from auth.uid() then raise exception 'Account changed' using errcode='42501';end if;
 if auth.uid() is null or coalesce((auth.jwt()->>'is_anonymous')::boolean,false) then raise exception 'Sign in required' using errcode='42501';end if;
 if not (launcher_private.check_access(p_game_id)->>'allowed')::boolean then raise exception 'Game access denied' using errcode='42501';end if;
 insert into public.launcher_sessions(id,owner_id,game_id) values(p_session_id,auth.uid(),p_game_id) on conflict(id) do nothing;
 if not exists(select 1 from public.launcher_sessions where id=p_session_id and owner_id=auth.uid() and game_id=p_game_id) then raise exception 'Session owner mismatch' using errcode='42501';end if;
 insert into public.launcher_library(owner_id,game_id,last_played_at) values(auth.uid(),p_game_id,now()) on conflict(owner_id,game_id) do update set last_played_at=now(),updated_at=now();
end$$;
create or replace function public.launcher_session_start(p_game_id text,p_session_id uuid,p_expected_owner uuid default null) returns void language sql security invoker set search_path='' as $$select launcher_private.session_start(p_game_id,p_session_id,p_expected_owner)$$;

-- Signup gift is claimed once per registered account, only inside the pilot.
create function launcher_private.my_access(p_expected_owner uuid) returns jsonb language plpgsql security definer set search_path='' as $$
declare uid uuid:=auth.uid(); cfg launcher_private.starter_config; claimed uuid; in_pilot boolean;
begin
 if uid is null or p_expected_owner is null or uid is distinct from p_expected_owner or coalesce((auth.jwt()->>'is_anonymous')::boolean,false) or not exists(select 1 from auth.users where id=uid and not coalesce(is_anonymous,false)) then
  raise exception 'Registered account required or account changed' using errcode='42501';end if;
 in_pilot:=(select mode='pilot' from launcher_private.rollout where id) and exists(select 1 from launcher_private.pilots where user_id=uid);
 if in_pilot then
  select * into cfg from launcher_private.starter_config where id for share;
  if cfg.enabled and cardinality(cfg.game_ids)=3 then
   insert into launcher_private.starter_claims(user_id,game_ids) values(uid,cfg.game_ids) on conflict(user_id) do nothing returning user_id into claimed;
   if claimed is not null then
    insert into public.launcher_entitlements(owner_id,game_id,source) select uid,unnest(cfg.game_ids),'starter';
   end if;
  end if;
 end if;
 return jsonb_build_object('serverTime',now(),'pilot',in_pilot,
  'starterGames',coalesce((select to_jsonb(game_ids) from launcher_private.starter_claims where user_id=uid),'[]'),
  'entitlements',(select coalesce(jsonb_agg(to_jsonb(e) order by starts_at desc,id),'[]') from public.launcher_entitlements e where owner_id=uid),
  'games',(select coalesce(jsonb_agg(jsonb_build_object('id',g.id,'title',g.title,'access',launcher_private.check_access(g.id)) order by g.sort_order,g.id),'[]') from public.launcher_games g where g.status<>'draft'));
end$$;
create function public.launcher_my_access(p_expected_owner uuid) returns jsonb language sql security invoker set search_path='' as $$select launcher_private.my_access(p_expected_owner)$$;

create function launcher_private.set_starter(p_game_ids text[],p_enabled boolean,p_reason text) returns void language plpgsql security definer set search_path='' as $$
declare before_row jsonb;after_row jsonb;
begin
 perform launcher_private.require_admin();
 if p_reason is null or length(trim(p_reason)) not between 3 and 500 then raise exception 'Reason required (3–500 characters)' using errcode='22023';end if;
 if p_enabled is null or cardinality(p_game_ids) is distinct from 3 or (select count(distinct x) from unnest(p_game_ids) x)<>3 or (select count(*) from public.launcher_games where id=any(p_game_ids) and status='published')<>3 then
  raise exception 'Select exactly three distinct published games' using errcode='22023';end if;
 select to_jsonb(c) into before_row from launcher_private.starter_config c where id for update;
 update launcher_private.starter_config set game_ids=p_game_ids,enabled=p_enabled returning to_jsonb(starter_config.*) into after_row;
 insert into launcher_private.audit(actor_id,action,target_id,reason,before_state,after_state) values(auth.uid(),'starter_config','starter',trim(p_reason),before_row,after_row);
end$$;
create function public.launcher_admin_set_starter(p_game_ids text[],p_enabled boolean,p_reason text) returns void language sql security invoker set search_path='' as $$select launcher_private.set_starter(p_game_ids,p_enabled,p_reason)$$;

-- Explicit least-privilege function grants, including private implementations.
revoke all on all functions in schema launcher_private from public,anon,authenticated;
grant execute on function launcher_private.my_access(uuid),launcher_private.set_starter(text[],boolean,text),launcher_private.session_start(text,uuid,uuid),launcher_private.is_admin(),launcher_private.admin_state(uuid),launcher_private.admin_command(text,jsonb,text),launcher_private.check_access(text),launcher_private.admin_access(uuid,text) to authenticated;
revoke all on function public.launcher_my_access(uuid),public.launcher_admin_set_starter(text[],boolean,text),public.launcher_check_access_v2(text),public.launcher_is_admin(),public.launcher_admin_state(uuid),public.launcher_admin_command(text,jsonb,text),public.launcher_admin_check_access(uuid,text) from public,anon,authenticated;
grant execute on function public.launcher_my_access(uuid),public.launcher_admin_set_starter(text[],boolean,text),public.launcher_check_access_v2(text),public.launcher_is_admin(),public.launcher_admin_state(uuid),public.launcher_admin_command(text,jsonb,text),public.launcher_admin_check_access(uuid,text) to authenticated;
commit;
