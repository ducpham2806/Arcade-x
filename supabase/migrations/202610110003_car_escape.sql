-- Car Escape v2: authoritative boards and replay-validated per-level rankings.
begin;
create table public.car_escape_levels(level integer not null check(level between 1 and 100),campaign_version integer not null default 2,board jsonb not null,optimal_moves integer not null check(optimal_moves>=5),mode text not null check(mode in ('classic','turns','timed','endless')),move_limit integer,time_limit_ms integer,primary key(level,campaign_version));
create table public.car_escape_runs(id uuid primary key default gen_random_uuid(),owner_id uuid not null references auth.users(id) on delete cascade,level integer not null,campaign_version integer not null default 2,started_at timestamptz not null default clock_timestamp(),finished_at timestamptz,moves integer,elapsed_ms bigint,hints integer,stars integer,score integer,foreign key(level,campaign_version) references public.car_escape_levels(level,campaign_version));
create index car_escape_runs_owner on public.car_escape_runs(owner_id,started_at desc);
create index car_escape_rank on public.car_escape_runs(level,score desc,moves,elapsed_ms) where finished_at is not null;
alter table public.car_escape_levels enable row level security;
alter table public.car_escape_runs enable row level security;
revoke all on public.car_escape_levels,public.car_escape_runs from public,anon,authenticated;
grant select on public.car_escape_runs to authenticated;
create policy car_escape_owner on public.car_escape_runs for select to authenticated using(owner_id=auth.uid());
create function public.car_escape_start(p_level integer,p_expected_owner uuid default null) returns uuid language plpgsql security definer set search_path=public,pg_temp as $$
declare id uuid;
begin
 if auth.uid() is null or coalesce((auth.jwt()->>'is_anonymous')::boolean,false) or (p_expected_owner is not null and p_expected_owner is distinct from auth.uid()) then raise exception 'Sign in required / account changed' using errcode='42501'; end if;
 if not exists(select 1 from public.car_escape_levels where level=p_level and campaign_version=2) then raise exception 'Unknown level' using errcode='22023'; end if;
 if (select count(*) from public.car_escape_runs where owner_id=auth.uid() and started_at>now()-interval '1 minute')>=20 then raise exception 'Too many starts' using errcode='22023'; end if;
 insert into public.car_escape_runs(owner_id,level) values(auth.uid(),p_level) returning car_escape_runs.id into id;return id;
end$$;
create function public.car_escape_submit(p_run_id uuid,p_moves jsonb,p_elapsed_ms bigint,p_hints integer,p_expected_owner uuid default null) returns jsonb language plpgsql security definer set search_path=public,pg_temp as $$
declare r public.car_escape_runs;l public.car_escape_levels; fleet jsonb; m jsonb; v jsonb;o jsonb; idx integer; oi integer; k integer; q integer; p integer; dest integer; axis boolean; n integer; len integer; rr integer; cc integer; orr integer; occ integer; count_moves integer; elapsed bigint; awarded_stars integer; points integer; target jsonb;
begin
 if auth.uid() is null or coalesce((auth.jwt()->>'is_anonymous')::boolean,false) or (p_expected_owner is not null and p_expected_owner is distinct from auth.uid()) then raise exception 'Sign in required / account changed' using errcode='42501'; end if;
 select * into r from public.car_escape_runs where id=p_run_id and owner_id=auth.uid() for update;
 if not found then raise exception 'Run not owned' using errcode='42501'; end if;
 if r.finished_at is not null then return jsonb_build_object('score',r.score,'stars',r.stars); end if;
 if jsonb_typeof(p_moves) is distinct from 'array' or jsonb_array_length(p_moves)>1000 or p_hints is null or p_hints<0 or p_hints>1000 or p_elapsed_ms is null or p_elapsed_ms<0 or p_elapsed_ms>86400000 then raise exception 'Invalid submission' using errcode='22023'; end if;
 select * into l from public.car_escape_levels where level=r.level and campaign_version=r.campaign_version;
 if not found then raise exception 'Campaign unavailable' using errcode='22023'; end if;
 fleet=l.board->'vehicles';n=(l.board->>'size')::integer;count_moves=jsonb_array_length(p_moves);
 if count_moves<l.optimal_moves or (l.move_limit is not null and count_moves>l.move_limit) then raise exception 'Invalid move count' using errcode='22023'; end if;
 for m in select value from jsonb_array_elements(p_moves) loop
  if jsonb_typeof(m) is distinct from 'object' or jsonb_typeof(m->'vehicleId') is distinct from 'number' or jsonb_typeof(m->'to') is distinct from 'number' or (m->>'vehicleId') !~ '^\d+$' or (m->>'to') !~ '^\d+$' or not (m ? 'vehicleId' and m ? 'to') then raise exception 'Invalid move' using errcode='22023'; end if;
  idx=null;for k in 0..jsonb_array_length(fleet)-1 loop if (fleet->k->>'id')::integer=(m->>'vehicleId')::integer then idx=k;exit;end if;end loop;
  if idx is null then raise exception 'Unknown vehicle' using errcode='22023'; end if;
  v=fleet->idx;axis=(v->>'isHorizontal')::boolean;len=(v->>'length')::integer;p=(v->>case when axis then 'col' else 'row' end)::integer;dest=(m->>'to')::integer;
  if dest=p or dest<0 or dest+len>n then raise exception 'Out of bounds / no-op' using errcode='22023'; end if;
  -- Check every intermediate position, so a long slide cannot tunnel through another car.
  for q in least(p,dest)..greatest(p,dest) loop
   for k in 0..len-1 loop rr=case when axis then (v->>'row')::integer else q+k end;cc=case when axis then q+k else (v->>'col')::integer end;
    for oi in 0..jsonb_array_length(fleet)-1 loop if oi=idx then continue;end if;o=fleet->oi;
     if (o->>'isHorizontal')::boolean then orr=(o->>'row')::integer;occ=(o->>'col')::integer;if rr=orr and cc>=occ and cc<occ+(o->>'length')::integer then raise exception 'Collision' using errcode='22023';end if;
     else orr=(o->>'row')::integer;occ=(o->>'col')::integer;if cc=occ and rr>=orr and rr<orr+(o->>'length')::integer then raise exception 'Collision' using errcode='22023';end if;end if;
    end loop;
   end loop;
  end loop;
  fleet=jsonb_set(fleet,array[idx::text,case when axis then 'col' else 'row' end],to_jsonb(dest));
 end loop;
 select value into target from jsonb_array_elements(fleet) where (value->>'isTarget')::boolean;
 if target is null or ((target->>'col')::integer+(target->>'length')::integer) is distinct from n then raise exception 'Not solved' using errcode='22023';end if;
 elapsed=greatest(p_elapsed_ms,ceil(extract(epoch from (clock_timestamp()-r.started_at))*1000)::bigint);
 if elapsed>86400000 or (l.time_limit_ms is not null and elapsed>l.time_limit_ms) then raise exception 'Time limit exceeded' using errcode='22023';end if;
 awarded_stars=case when p_hints>0 then 1 when count_moves<=l.optimal_moves+greatest(1,floor(l.optimal_moves*.15)::integer) and (l.time_limit_ms is null or elapsed<=l.time_limit_ms*.7) then 3 when count_moves<=l.optimal_moves+ceil(l.optimal_moves*.5)::integer then 2 else 1 end;
 points=greatest(100,round(l.optimal_moves*1000.0/greatest(l.optimal_moves,count_moves)+l.optimal_moves*40+greatest(0,300-floor(elapsed/1000.0)*2)-p_hints*150)::integer);
 update public.car_escape_runs set finished_at=clock_timestamp(),moves=count_moves,elapsed_ms=elapsed,hints=p_hints,stars=awarded_stars,score=points where id=r.id;
 return jsonb_build_object('score',points,'stars',awarded_stars);
end$$;
create function public.car_escape_ranking(p_level integer,p_assisted boolean default false) returns jsonb language sql stable security definer set search_path=public,pg_temp as $$
 select coalesce(jsonb_agg(to_jsonb(t)),'[]'::jsonb) from (
 select display_name,moves,elapsed_ms,stars,score from (
 select distinct on (r.owner_id) i.display_name,r.moves,r.elapsed_ms,r.stars,r.score from public.car_escape_runs r join public.arcadex_identities i on i.owner_id=r.owner_id
 where r.level=p_level and r.campaign_version=2 and r.finished_at is not null and (r.hints>0)=p_assisted order by r.owner_id,r.score desc,r.moves,r.elapsed_ms
 ) best order by score desc,moves,elapsed_ms,display_name limit 20) t
$$;
revoke all on function public.car_escape_start(integer,uuid),public.car_escape_submit(uuid,jsonb,bigint,integer,uuid),public.car_escape_ranking(integer,boolean) from public,anon,authenticated;
grant execute on function public.car_escape_start(integer,uuid),public.car_escape_submit(uuid,jsonb,bigint,integer,uuid) to authenticated;
grant execute on function public.car_escape_ranking(integer,boolean) to anon,authenticated;
commit;
