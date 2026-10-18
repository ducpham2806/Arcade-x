begin;
create table launcher_private.offers (
 id uuid primary key default gen_random_uuid(),title text not null check(length(trim(title)) between 3 and 100),
 scope text not null check(scope in ('game','bundle','all')),game_ids text[] not null default '{}',
 term text not null check(term in ('7d','14d','30d','3m','6m','1y')),
 price_vnd bigint not null check(price_vnd between 1 and 100000000),active boolean not null default false,
 updated_at timestamptz not null default now(),
 check((scope='all' and cardinality(game_ids)=0) or (scope='game' and cardinality(game_ids)=1) or (scope='bundle' and cardinality(game_ids)>=2))
);
create table launcher_private.trial_config (
 game_id text primary key references public.launcher_games(id) check(game_id='tile-2048'),
 enabled boolean not null default false,max_runs integer not null default 1 check(max_runs between 1 and 10)
);
-- Config starts disabled, and is inserted only if the catalog has the implemented game.
insert into launcher_private.trial_config(game_id) select id from public.launcher_games where id='tile-2048';
create table launcher_private.trial_runs (
 id uuid primary key default gen_random_uuid(),owner_id uuid not null references auth.users(id),
 game_id text not null references public.launcher_games(id),started_at timestamptz not null default now(),
 resume_until timestamptz not null default now()+interval '24 hours',finished_at timestamptz,
 saved_state jsonb,revision integer not null default 0
);
create index trial_runs_owner_game on launcher_private.trial_runs(owner_id,game_id);
do $$declare t text;begin foreach t in array array['offers','trial_config','trial_runs'] loop
 execute format('alter table launcher_private.%I enable row level security',t);
 execute format('revoke all on launcher_private.%I from public,anon,authenticated',t);
end loop;end$$;
create function launcher_private.require_registered() returns uuid language plpgsql stable security definer set search_path='' as $$
begin
 if auth.uid() is null or coalesce((auth.jwt()->>'is_anonymous')::boolean,false) or not exists(select 1 from auth.users where id=auth.uid() and not coalesce(is_anonymous,false)) then raise exception 'Đăng nhập để sử dụng tính năng này' using errcode='42501';end if;
 return auth.uid();
end$$;
create function launcher_private.is_pilot() returns boolean language sql stable security definer set search_path='' as $$
 select auth.uid() is not null and (select mode='pilot' from launcher_private.rollout where id) and exists(select 1 from launcher_private.pilots where user_id=auth.uid())
$$;
create function launcher_private.store_catalog() returns jsonb language plpgsql stable security definer set search_path='' as $$
begin
 perform launcher_private.require_registered();
 return jsonb_build_object('checkoutEnabled',false,'pilot',launcher_private.is_pilot(),
 'offers',(select coalesce(jsonb_agg(to_jsonb(o) order by title,price_vnd),'[]') from launcher_private.offers o where active and (launcher_private.is_pilot() or launcher_private.is_admin())
 and not exists(select 1 from unnest(game_ids) x left join public.launcher_games g on g.id=x where g.id is null or g.status<>'published')),
 'trials',(select coalesce(jsonb_agg(jsonb_build_object('game_id',c.game_id,'max_runs',c.max_runs,
 'used',(select count(*) from launcher_private.trial_runs where owner_id=auth.uid() and game_id=c.game_id),
 'resumable',exists(select 1 from launcher_private.trial_runs where owner_id=auth.uid() and game_id=c.game_id and finished_at is null and resume_until>now()))),'[]') from launcher_private.trial_config c where enabled and launcher_private.is_pilot() and launcher_private.evaluate_access(auth.uid(),c.game_id)->>'reason'='locked'));
end$$;
create function public.launcher_store_catalog() returns jsonb language sql stable security invoker set search_path='' as $$select launcher_private.store_catalog()$$;
create function launcher_private.store_admin() returns jsonb language plpgsql stable security definer set search_path='' as $$
begin perform launcher_private.require_admin();return jsonb_build_object(
 'offers',(select coalesce(jsonb_agg(to_jsonb(o) order by updated_at desc),'[]') from launcher_private.offers o),
 'trials',(select coalesce(jsonb_agg(to_jsonb(c)),'[]') from launcher_private.trial_config c));end$$;
create function public.launcher_store_admin() returns jsonb language sql stable security invoker set search_path='' as $$select launcher_private.store_admin()$$;
create function launcher_private.save_offer(p_id uuid,p_title text,p_scope text,p_game_ids text[],p_term text,p_price bigint,p_active boolean,p_reason text) returns uuid language plpgsql security definer set search_path='' as $$
declare rid uuid;before_row jsonb;after_row jsonb;
begin
 perform launcher_private.require_admin();
 if p_reason is null or length(trim(p_reason)) not between 3 and 500 then raise exception 'Cần lý do từ 3–500 ký tự' using errcode='22023';end if;
 if p_game_ids is null or (select count(distinct x) from unnest(p_game_ids) x)<>cardinality(p_game_ids) or (select count(*) from public.launcher_games where id=any(p_game_ids))<>cardinality(p_game_ids) then raise exception 'Danh sách game không hợp lệ' using errcode='22023';end if;
 if p_id is not null then select to_jsonb(o) into before_row from launcher_private.offers o where id=p_id for update;if not found then raise exception 'Không tìm thấy gói' using errcode='22023';end if;end if;
 if p_id is null then insert into launcher_private.offers(title,scope,game_ids,term,price_vnd,active) values(trim(p_title),p_scope,p_game_ids,p_term,p_price,p_active) returning id,to_jsonb(offers.*) into rid,after_row;
 else update launcher_private.offers set title=trim(p_title),scope=p_scope,game_ids=p_game_ids,term=p_term,price_vnd=p_price,active=p_active,updated_at=now() where id=p_id returning id,to_jsonb(offers.*) into rid,after_row;end if;
 insert into launcher_private.audit(actor_id,action,target_id,reason,before_state,after_state) values(auth.uid(),'offer_save',rid::text,trim(p_reason),before_row,after_row);return rid;
end$$;
create function public.launcher_admin_save_offer(p_id uuid,p_title text,p_scope text,p_game_ids text[],p_term text,p_price bigint,p_active boolean,p_reason text) returns uuid language sql security invoker set search_path='' as $$select launcher_private.save_offer(p_id,p_title,p_scope,p_game_ids,p_term,p_price,p_active,p_reason)$$;
create function launcher_private.configure_trial(p_enabled boolean,p_max_runs integer,p_reason text) returns void language plpgsql security definer set search_path='' as $$
declare b jsonb;a jsonb;
begin perform launcher_private.require_admin();
 if p_reason is null or length(trim(p_reason)) not between 3 and 500 then raise exception 'Cần lý do' using errcode='22023';end if;
 select to_jsonb(c) into b from launcher_private.trial_config c where game_id='tile-2048' for update;
 insert into launcher_private.trial_config(game_id,enabled,max_runs) values('tile-2048',p_enabled,p_max_runs) on conflict(game_id) do update set enabled=excluded.enabled,max_runs=excluded.max_runs returning to_jsonb(trial_config.*) into a;
 insert into launcher_private.audit(actor_id,action,target_id,reason,before_state,after_state) values(auth.uid(),'trial_config','tile-2048',trim(p_reason),b,a);
end$$;
create function public.launcher_admin_configure_trial(p_enabled boolean,p_max_runs integer,p_reason text) returns void language sql security invoker set search_path='' as $$select launcher_private.configure_trial(p_enabled,p_max_runs,p_reason)$$;

create function launcher_private.trial_start(p_game_id text,p_expected_owner uuid) returns jsonb language plpgsql security definer set search_path='' as $$
declare uid uuid:=launcher_private.require_registered();cfg launcher_private.trial_config;r launcher_private.trial_runs;access jsonb;
begin
 if p_expected_owner is distinct from uid or not launcher_private.is_pilot() then raise exception 'Tài khoản chưa có quyền thử' using errcode='42501';end if;
 access:=launcher_private.evaluate_access(uid,p_game_id);
 if access->>'reason'<>'locked' then raise exception 'Game đã mở hoặc đang bị hạn chế truy cập' using errcode='42501';end if;
 select * into cfg from launcher_private.trial_config where game_id=p_game_id and enabled;
 if not found then raise exception 'Game chưa mở chơi thử' using errcode='22023';end if;
 perform pg_advisory_xact_lock(hashtextextended(uid::text||p_game_id,17));
 select * into r from launcher_private.trial_runs where owner_id=uid and game_id=p_game_id and finished_at is null and resume_until>now() order by started_at desc limit 1;
 if found then return to_jsonb(r);end if;
 if (select count(*) from launcher_private.trial_runs where owner_id=uid and game_id=p_game_id)>=cfg.max_runs then raise exception 'Bạn đã dùng hết lượt chơi thử' using errcode='22023';end if;
 insert into launcher_private.trial_runs(owner_id,game_id) values(uid,p_game_id) returning * into r;return to_jsonb(r);
end$$;
create function public.launcher_trial_start(p_game_id text,p_expected_owner uuid) returns jsonb language sql security invoker set search_path='' as $$select launcher_private.trial_start(p_game_id,p_expected_owner)$$;
create function launcher_private.trial_save(p_run uuid,p_revision integer,p_state jsonb) returns integer language plpgsql security definer set search_path='' as $$
declare uid uuid:=launcher_private.require_registered();r launcher_private.trial_runs;next_revision integer;
begin
 select * into r from launcher_private.trial_runs where id=p_run and owner_id=uid for update;
 if not found or r.finished_at is not null then raise exception 'Phiên thử không hợp lệ' using errcode='42501';end if;
 -- Retrying an acknowledged-but-lost response must not strand a valid board.
 if p_revision=r.revision-1 and p_state=r.saved_state then return r.revision;end if;
 if p_revision is distinct from r.revision then raise exception 'Bàn chơi đã thay đổi ở tab khác; hãy tải lại' using errcode='40001';end if;
 if p_state is null or jsonb_typeof(p_state)<>'object' or octet_length(p_state::text)>65536 or p_state->>'gameMode' is distinct from 'classic' or p_state->>'version' is distinct from '1' then raise exception 'Dữ liệu thử không hợp lệ' using errcode='22023';end if;
 -- Saving an already-started board remains allowed during maintenance/offline recovery.
 -- A new launch always rechecks quota, access and resume_until. Client state is not a trusted score.
 update launcher_private.trial_runs set saved_state=p_state,revision=revision+1 where id=r.id returning revision into next_revision;return next_revision;
end$$;
create function public.launcher_trial_save(p_run uuid,p_revision integer,p_state jsonb) returns integer language sql security invoker set search_path='' as $$select launcher_private.trial_save(p_run,p_revision,p_state)$$;
create function launcher_private.trial_finish(p_run uuid) returns void language plpgsql security definer set search_path='' as $$
declare uid uuid:=launcher_private.require_registered();begin
 update launcher_private.trial_runs set finished_at=coalesce(finished_at,now()) where id=p_run and owner_id=uid;
 if not found then raise exception 'Phiên thử không hợp lệ' using errcode='42501';end if;
end$$;
create function public.launcher_trial_finish(p_run uuid) returns void language sql security invoker set search_path='' as $$select launcher_private.trial_finish(p_run)$$;
revoke all on function launcher_private.require_registered(),launcher_private.is_pilot(),launcher_private.store_catalog(),launcher_private.store_admin(),launcher_private.save_offer(uuid,text,text,text[],text,bigint,boolean,text),launcher_private.configure_trial(boolean,integer,text),launcher_private.trial_start(text,uuid),launcher_private.trial_save(uuid,integer,jsonb),launcher_private.trial_finish(uuid) from public,anon,authenticated;
grant execute on function launcher_private.store_catalog(),launcher_private.store_admin(),launcher_private.save_offer(uuid,text,text,text[],text,bigint,boolean,text),launcher_private.configure_trial(boolean,integer,text),launcher_private.trial_start(text,uuid),launcher_private.trial_save(uuid,integer,jsonb),launcher_private.trial_finish(uuid) to authenticated;
revoke all on function public.launcher_store_catalog(),public.launcher_store_admin(),public.launcher_admin_save_offer(uuid,text,text,text[],text,bigint,boolean,text),public.launcher_admin_configure_trial(boolean,integer,text),public.launcher_trial_start(text,uuid),public.launcher_trial_save(uuid,integer,jsonb),public.launcher_trial_finish(uuid) from public,anon,authenticated;
grant execute on function public.launcher_store_catalog(),public.launcher_store_admin(),public.launcher_admin_save_offer(uuid,text,text,text[],text,bigint,boolean,text),public.launcher_admin_configure_trial(boolean,integer,text),public.launcher_trial_start(text,uuid),public.launcher_trial_save(uuid,integer,jsonb),public.launcher_trial_finish(uuid) to authenticated;
commit;
