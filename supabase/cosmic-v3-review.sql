-- Reviewed rollout candidate, NOT applied to any server.
-- Deploy the dual-version verifier FIRST; apply this transaction SECOND; frontend LAST.
begin;
alter table public.cosmic_runs drop constraint cosmic_runs_pack_version_check;
alter table public.cosmic_runs add constraint cosmic_runs_pack_version_check check(pack_version in (2,3));
create or replace function public.cosmic_start_v3(p_mode text,p_level integer default 1,p_expected_owner uuid default null) returns jsonb language plpgsql security definer set search_path=public,pg_temp as $$
declare uid uuid:=auth.uid(); seed bigint; lvl integer; cfg jsonb; period_key text; ticket uuid; u jsonb; sl integer;
begin
 if uid is null or coalesce((auth.jwt()->>'is_anonymous')::boolean,false) or p_expected_owner is distinct from uid then raise exception 'Sign in required / account changed' using errcode='42501';end if;
 if p_mode not in ('daily','weekly','endless','rush') or p_level not between 1 and 100 then raise exception 'Invalid mode/level' using errcode='22023';end if;
 perform pg_advisory_xact_lock(hashtext(uid::text));
 if (select count(*) from cosmic_runs where owner_id=uid and started_at>clock_timestamp()-interval '1 minute')>=10 then raise exception 'Rate limit' using errcode='54000';end if;
 period_key:=case when p_mode='daily' then to_char(now() at time zone 'UTC','YYYY-MM-DD') when p_mode='weekly' then to_char(date_trunc('week',now() at time zone 'UTC'),'YYYY-MM-DD') else 'all' end;
 if p_mode='daily' and (select count(*) from cosmic_runs where owner_id=uid and mode='daily' and period=period_key and pack_version=3)>=3 then raise exception 'Daily attempt limit' using errcode='54000';end if;
 seed:=case when p_mode in ('daily','weekly') then replace(period_key,'-','')::bigint else floor(random()*4294967296)::bigint end;
 lvl:=case when p_mode='daily' then 11+(seed%9)::integer when p_mode='weekly' then 10*((seed%10)::integer+1) when p_mode='rush' then 10 else 91 end;
 sl:=case when p_mode in ('daily','weekly') then 5 else 6 end;
 u:=jsonb_build_object('cannon',case when sl=6 then 7 else sl end,'hull',case when sl=6 then 7 else sl end,'reactor',case when sl=6 then 7 else sl end,'magnet',case when sl=6 then 7 else sl end,'thrusters',sl,'core',sl);
 cfg:=jsonb_build_object('version',3,'level',lvl,'seed',seed,'mode',p_mode,'upgrades',u,'integrity',100,'boosters','[]'::jsonb,'mutators',case when p_mode='daily' then '["fast"]'::jsonb else '[]'::jsonb end,'ship','nova');
 insert into cosmic_runs(owner_id,mode,period,level,config,pack_version) values(uid,p_mode,period_key,lvl,cfg,3) returning id into ticket;
 return jsonb_build_object('id',ticket,'config',cfg);
end $$;
create or replace function public.cosmic_ranking_v3(p_mode text default 'daily') returns jsonb language sql stable security definer set search_path=public,pg_temp as $$
 select coalesce(jsonb_agg(to_jsonb(t)),'[]'::jsonb) from (
 select owner,name,score,frames from (
 select distinct on (r.owner_id) r.owner_id as owner,i.display_name as name,r.score,r.frames,r.finished_at
 from cosmic_runs r join arcadex_identities i on i.owner_id=r.owner_id
 where r.pack_version=3 and r.finished_at is not null and r.mode=p_mode and r.period=case when p_mode='daily' then to_char(now() at time zone 'UTC','YYYY-MM-DD') when p_mode='weekly' then to_char(date_trunc('week',now() at time zone 'UTC'),'YYYY-MM-DD') else 'all' end
 order by r.owner_id,r.score desc,r.frames,r.finished_at
 ) b order by score desc,case when p_mode='rush' then frames else 0 end,finished_at limit 100
 ) t
$$;
revoke all on function public.cosmic_start_v3(text,integer,uuid),public.cosmic_ranking_v3(text) from public,anon,authenticated;
grant execute on function public.cosmic_start_v3(text,integer,uuid) to authenticated;
grant execute on function public.cosmic_ranking_v3(text) to authenticated,anon;
create or replace function public.cosmic_ranking(p_mode text default 'daily') returns jsonb language sql stable security definer set search_path=public,pg_temp as $$
 select coalesce(jsonb_agg(to_jsonb(t)),'[]'::jsonb) from (
 select owner,name,score,frames from (
 select distinct on (r.owner_id) r.owner_id as owner,i.display_name as name,r.score,r.frames,r.finished_at
 from cosmic_runs r join arcadex_identities i on i.owner_id=r.owner_id
 where r.pack_version=2 and r.finished_at is not null and r.mode=p_mode and r.period=case when p_mode='daily' then to_char(now() at time zone 'UTC','YYYY-MM-DD') when p_mode='weekly' then to_char(date_trunc('week',now() at time zone 'UTC'),'YYYY-MM-DD') else 'all' end
 order by r.owner_id,r.score desc,r.frames,r.finished_at
 ) b order by score desc,case when p_mode='rush' then frames else 0 end,finished_at limit 100
 ) t
$$;
commit;
