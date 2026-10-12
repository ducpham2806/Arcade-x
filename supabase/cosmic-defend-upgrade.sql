-- Cosmic v2: only an Edge Function which replays the shared simulation can publish scores.
begin;
create table public.cosmic_runs(
 id uuid primary key default gen_random_uuid(),owner_id uuid not null references auth.users(id) on delete cascade,
 mode text not null check(mode in ('daily','weekly','endless','rush')),
 period text not null,level integer not null check(level between 1 and 100),pack_version integer not null default 2 check(pack_version=2),
 config jsonb not null,started_at timestamptz not null default clock_timestamp(),finished_at timestamptz,
 frames integer,score integer,won boolean,replay text,
 check(frames is null or frames between 1 and 36000),check(score is null or score between 0 and 100000000)
);
alter table public.cosmic_runs enable row level security;
create policy cosmic_owner_read on public.cosmic_runs for select to authenticated using(owner_id=auth.uid());
revoke all on public.cosmic_runs from anon,authenticated;
grant select on public.cosmic_runs to authenticated;
grant all on public.cosmic_runs to service_role;
create index cosmic_runs_owner_time on public.cosmic_runs(owner_id,started_at desc);
create index cosmic_runs_ranking on public.cosmic_runs(mode,period,score desc) where finished_at is not null;
create function public.cosmic_start(p_mode text,p_level integer default 1,p_expected_owner uuid default null) returns jsonb language plpgsql security definer set search_path=public,pg_temp as $$
declare uid uuid:=auth.uid(); seed bigint; lvl integer; cfg jsonb; period_key text; ticket uuid; u jsonb; sl integer;
begin
 if uid is null or coalesce((auth.jwt()->>'is_anonymous')::boolean,false) or p_expected_owner is distinct from uid then raise exception 'Sign in required / account changed' using errcode='42501';end if;
 if p_mode not in ('daily','weekly','endless','rush') or p_level not between 1 and 100 then raise exception 'Invalid mode/level' using errcode='22023';end if;
 perform pg_advisory_xact_lock(hashtext(uid::text));
 if (select count(*) from cosmic_runs where owner_id=uid and started_at>clock_timestamp()-interval '1 minute')>=10 then raise exception 'Rate limit' using errcode='54000';end if;
 period_key:=case when p_mode='daily' then to_char(now() at time zone 'UTC','YYYY-MM-DD') when p_mode='weekly' then to_char(date_trunc('week',now() at time zone 'UTC'),'YYYY-MM-DD') else 'all' end;
 if p_mode='daily' and (select count(*) from cosmic_runs where owner_id=uid and mode='daily' and period=period_key)>=3 then raise exception 'Daily attempt limit' using errcode='54000';end if;
 seed:=case when p_mode in ('daily','weekly') then replace(period_key,'-','')::bigint else floor(random()*4294967296)::bigint end;
 lvl:=case when p_mode='daily' then 11+(seed%9)::integer when p_mode='weekly' then 10*((seed%10)::integer+1) when p_mode='rush' then 10 else 91 end;
 sl:=case when p_mode in ('daily','weekly') then 5 else 6 end;
 u:=jsonb_build_object('cannon',case when sl=6 then 7 else sl end,'hull',case when sl=6 then 7 else sl end,'reactor',case when sl=6 then 7 else sl end,'magnet',case when sl=6 then 7 else sl end,'thrusters',sl,'core',sl);
 cfg:=jsonb_build_object('version',2,'level',lvl,'seed',seed,'mode',p_mode,'upgrades',u,'integrity',100,'boosters','[]'::jsonb,'mutators',case when p_mode='daily' then '["fast"]'::jsonb else '[]'::jsonb end,'ship','nova');
 insert into cosmic_runs(owner_id,mode,period,level,config) values(uid,p_mode,period_key,lvl,cfg) returning id into ticket;
 return jsonb_build_object('id',ticket,'config',cfg);
end $$;
-- Trusted server-only endpoint. Browser never supplies an authoritative score or Credits.
create function public.cosmic_accept(p_ticket uuid,p_owner uuid,p_frames integer,p_score integer,p_won boolean,p_replay text) returns jsonb language plpgsql security definer set search_path=public,pg_temp as $$
declare r cosmic_runs%rowtype;
begin
 select * into r from cosmic_runs where id=p_ticket for update;
 if not found or r.owner_id is distinct from p_owner then raise exception 'Invalid ticket' using errcode='42501';end if;
 if r.finished_at is not null then return jsonb_build_object('score',r.score,'verified',true);end if;
 if r.started_at<clock_timestamp()-interval '24 hours' or p_frames not between 1 and 36000 or p_frames>extract(epoch from clock_timestamp()-r.started_at)*60+120 or p_score not between 0 and 100000000 or length(p_replay)>100000 then raise exception 'Invalid result/time' using errcode='22023';end if;
 update cosmic_runs set finished_at=clock_timestamp(),frames=p_frames,score=p_score,won=p_won,replay=p_replay where id=p_ticket;
 return jsonb_build_object('score',p_score,'verified',true);
end $$;
create function public.cosmic_ranking(p_mode text default 'daily') returns jsonb language sql stable security definer set search_path=public,pg_temp as $$
 select coalesce(jsonb_agg(to_jsonb(t)),'[]'::jsonb) from (
 select owner,name,score,frames from (
 select distinct on (r.owner_id) r.owner_id as owner,i.display_name as name,r.score,r.frames,r.finished_at
 from cosmic_runs r join arcadex_identities i on i.owner_id=r.owner_id
 where r.finished_at is not null and r.mode=p_mode and r.period=case when p_mode='daily' then to_char(now() at time zone 'UTC','YYYY-MM-DD') when p_mode='weekly' then to_char(date_trunc('week',now() at time zone 'UTC'),'YYYY-MM-DD') else 'all' end
 order by r.owner_id,r.score desc,r.frames,r.finished_at
 ) b order by score desc,case when p_mode='rush' then frames else 0 end,finished_at limit 100
 ) t
$$;
revoke all on function public.cosmic_start(text,integer,uuid),public.cosmic_accept(uuid,uuid,integer,integer,boolean,text),public.cosmic_ranking(text) from public,anon,authenticated;
grant execute on function public.cosmic_start(text,integer,uuid) to authenticated;
grant execute on function public.cosmic_accept(uuid,uuid,integer,integer,boolean,text) to service_role;
grant execute on function public.cosmic_ranking(text) to authenticated,anon;
update public.launcher_games set title='Cosmic Defend',short_description='100 nhiệm vụ pixel, 10 hành tinh và 10 boss',content_version=greatest(content_version,2),updated_at=now() where id='cosmic-defense';
commit;
