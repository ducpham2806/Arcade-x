-- Word Cross v2: server-created random boards and replay-validated rankings.
begin;
create table public.word_cross_packs(version integer primary key,lexicon jsonb not null,source text not null);
create table public.word_cross_runs(id uuid primary key default gen_random_uuid(),owner_id uuid not null references auth.users(id) on delete cascade,pack_version integer not null default 1 references public.word_cross_packs(version),level integer not null check(level between 1 and 200),puzzle jsonb not null,daily_key text,started_at timestamptz not null default clock_timestamp(),finished_at timestamptz,elapsed_ms bigint,hints integer,mistakes integer,stars integer,score integer);
create index word_cross_owner on public.word_cross_runs(owner_id,started_at desc);
create index word_cross_rank on public.word_cross_runs(level,score desc,elapsed_ms) where finished_at is not null;
alter table public.word_cross_packs enable row level security;
alter table public.word_cross_runs enable row level security;
revoke all on public.word_cross_packs,public.word_cross_runs from public,anon,authenticated;
grant select on public.word_cross_runs to authenticated;
create policy word_cross_owner on public.word_cross_runs for select to authenticated using(owner_id=auth.uid());
create function public.word_cross_generate(p_level integer,p_seed bigint,p_avoid text[] default '{}'::text[]) returns jsonb language plpgsql security definer set search_path=public,pg_temp as $$
declare n integer;cnt integer;mode text;minlen integer;maxlen integer;budget integer;mistake_limit integer;par integer;pack jsonb;pool text[];chosen text[]='{}';grid text[];words jsonb='[]';path jsonb;board jsonb='[]';w text;state bigint;dr integer;dc integer;rr integer;cc integer;er integer;ec integer;k integer;i integer;j integer;t integer;r integer;c integer;d integer;attempt integer;ok boolean;fallback boolean=false;rows integer[];rev boolean;startcol integer;dirs integer[][]=array[[0,1],[1,0],[1,1],[-1,1],[0,-1],[-1,0],[-1,-1],[1,-1]];
begin
 if p_level is null or p_level<1 or p_level>200 or p_seed is null or p_seed<0 or p_seed>4294967295 or p_avoid is null or cardinality(p_avoid)>120 then raise exception 'Invalid generator input' using errcode='22023';end if;
 n=case when p_level<=25 then 6 when p_level<=60 then 8 when p_level<=120 then 10 else 12 end;
 cnt=least(n,4+(p_level-1)/22);
 mode=case when p_level<=3 then 'classic' else (array['classic','timed','precision','mystery','sequence'])[1+mod(p_level*17+(p_level/7)*3,5)] end;
 minlen=case when p_level<=25 then 3 when p_level<=120 then 4 else 5 end;maxlen=least(n,case when p_level<=25 then 5 when p_level<=60 then 7 else 10 end);
 budget=case when mode='timed' then greatest(90000,cnt*18000) else null end;mistake_limit=case when mode='precision' then greatest(3,ceil(cnt/2.0)::integer) else null end;par=cnt*9000+n*2000;
 select lexicon into pack from public.word_cross_packs where version=1;
 if pack is null then raise exception 'Dictionary not installed';end if;
 select array_agg(wd order by wd collate "C") into pool from jsonb_array_elements_text(case when p_level<=120 then pack->'common' else (pack->'common')||(pack->'extended') end) as e(wd) where length(wd) between minlen and maxlen and not(wd=any(p_avoid));
 if coalesce(cardinality(pool),0)<cnt then raise exception 'Insufficient dictionary';end if;
 state=p_seed # mod(p_level::bigint*2654435761,4294967296);
 while cardinality(chosen)<cnt loop state=mod(state*1664525+1013904223,4294967296);w=pool[1+mod(state/256,cardinality(pool))::integer];if not(w=any(chosen)) and not(reverse(w)=any(chosen)) then chosen=array_append(chosen,w);end if;end loop;
 select array_agg(value order by length(value) desc,value collate "C") into chosen from unnest(chosen) as e(value);
 grid=array_fill(''::text,array[n*n]);
 foreach w in array chosen loop
  ok=false;
  for attempt in 1..200 loop
   state=mod(state*1664525+1013904223,4294967296);d=1+mod(state/256,8)::integer;dr=dirs[d][1];dc=dirs[d][2];
   state=mod(state*1664525+1013904223,4294967296);r=mod(state/256,n)::integer;state=mod(state*1664525+1013904223,4294967296);c=mod(state/256,n)::integer;
   ok=true;
   for k in 0..length(w)-1 loop rr=r+k*dr;cc=c+k*dc;if rr<0 or cc<0 or rr>=n or cc>=n or (grid[1+rr*n+cc]<>'' and grid[1+rr*n+cc]<>substr(w,k+1,1)) then ok=false;exit;end if;end loop;
   if not ok then continue;end if;
   path='[]';for k in 0..length(w)-1 loop rr=r+k*dr;cc=c+k*dc;grid[1+rr*n+cc]=substr(w,k+1,1);path=path||jsonb_build_array(jsonb_build_object('r',rr,'c',cc));end loop;
   words=words||jsonb_build_array(jsonb_build_object('word',w,'path',path));exit;
  end loop;
  if not ok then fallback=true;exit;end if;
 end loop;
 if fallback then
  grid=array_fill(''::text,array[n*n]);words='[]';select array_agg(x) into rows from generate_series(0,n-1) e(x);
  for i in reverse n..2 loop state=mod(state*1664525+1013904223,4294967296);j=1+mod(state/256,i)::integer;t=rows[i];rows[i]=rows[j];rows[j]=t;end loop;
  for i in 1..cnt loop w=chosen[i];state=mod(state*1664525+1013904223,4294967296);rev=mod(state/256,2)=1;state=mod(state*1664525+1013904223,4294967296);startcol=mod(state/256,n-length(w)+1)::integer;path='[]';
   for k in 0..length(w)-1 loop rr=rows[i];cc=startcol+case when rev then length(w)-1-k else k end;grid[1+rr*n+cc]=substr(w,k+1,1);path=path||jsonb_build_array(jsonb_build_object('r',rr,'c',cc));end loop;
   words=words||jsonb_build_array(jsonb_build_object('word',w,'path',path));
  end loop;
 end if;
 for r in 0..n-1 loop for c in 0..n-1 loop if grid[1+r*n+c]='' then state=mod(state*1664525+1013904223,4294967296);grid[1+r*n+c]=substr('ABCDEFGHIJKLMNOPQRSTUVWXYZ',1+mod(state/256,26)::integer,1);end if;end loop;board=board||jsonb_build_array(to_jsonb(grid[1+r*n:(r+1)*n]));end loop;
 return jsonb_build_object('level',p_level,'size',n,'count',cnt,'mode',mode,'timeLimitMs',budget,'mistakeLimit',mistake_limit,'parMs',par,'minLength',minlen,'maxLength',maxlen,'version',2,'seed',p_seed,'avoid',to_jsonb(p_avoid),'grid',board,'words',words,'fallback',fallback);
end$$;
create function public.word_cross_start(p_level integer,p_expected_owner uuid default null,p_daily boolean default false) returns jsonb language plpgsql security definer set search_path=public,pg_temp as $$
declare ticket uuid;board jsonb;seed bigint;day text;avoid text[]='{}';lv integer;
begin
 if auth.uid() is null or coalesce((auth.jwt()->>'is_anonymous')::boolean,false) or (p_expected_owner is not null and p_expected_owner is distinct from auth.uid()) then raise exception 'Sign in required / account changed' using errcode='42501';end if;
 if p_daily is null then raise exception 'Invalid mode' using errcode='22023';end if;
 perform pg_advisory_xact_lock(hashtextextended(auth.uid()::text,7));
 if (select count(*) from public.word_cross_runs where owner_id=auth.uid() and started_at>now()-interval '1 minute')>=20 then raise exception 'Too many starts' using errcode='22023';end if;
 if p_daily then lv=91;day=to_char(clock_timestamp() at time zone 'UTC','YYYY-MM-DD');seed=replace(day,'-','')::bigint;
 else lv=p_level;seed=('x'||substr(md5(gen_random_uuid()::text),1,8))::bit(32)::bigint;
  select coalesce(array_agg(word),'{}') into avoid from (select distinct w->>'word' as word from (select puzzle from public.word_cross_runs where owner_id=auth.uid() and daily_key is null order by started_at desc limit 10) r cross join lateral jsonb_array_elements(r.puzzle->'words') w limit 120) recent;
 end if;
 board=public.word_cross_generate(lv,seed,avoid);
 insert into public.word_cross_runs(owner_id,level,puzzle,daily_key) values(auth.uid(),lv,board,day) returning id into ticket;
 return jsonb_build_object('id',ticket,'puzzle',board,'daily',day);
end$$;
create function public.word_cross_submit(p_run_id uuid,p_attempts jsonb,p_elapsed_ms bigint,p_hints integer,p_expected_owner uuid default null) returns jsonb language plpgsql security definer set search_path=public,pg_temp as $$
declare run public.word_cross_runs;p jsonb;a jsonb;field text;sr integer;sc integer;er integer;ec integer;dr integer;dc integer;len integer;n integer;k integer;word text;rev text;target text;found_words text[]='{}';v_mistakes integer=0;elapsed bigint;budget bigint;par bigint;limit_errors integer;awarded_stars integer;points integer;cnt integer;
begin
 if auth.uid() is null or coalesce((auth.jwt()->>'is_anonymous')::boolean,false) or (p_expected_owner is not null and p_expected_owner is distinct from auth.uid()) then raise exception 'Sign in required / account changed' using errcode='42501';end if;
 select * into run from public.word_cross_runs where id=p_run_id and owner_id=auth.uid() for update;
 if not found then raise exception 'Run not owned' using errcode='42501';end if;
 if run.finished_at is not null then return jsonb_build_object('stars',run.stars,'score',run.score);end if;
 if jsonb_typeof(p_attempts) is distinct from 'array' or jsonb_array_length(p_attempts)>3000 or p_elapsed_ms is null or p_elapsed_ms<0 or p_elapsed_ms>86400000 or p_hints is null or p_hints<0 or p_hints>1000 then raise exception 'Invalid submission' using errcode='22023';end if;
 p=run.puzzle;n=(p->>'size')::integer;cnt=(p->>'count')::integer;limit_errors=(p->>'mistakeLimit')::integer;
 for a in select value from jsonb_array_elements(p_attempts) loop
  if cardinality(found_words)=cnt then raise exception 'Selection after completion' using errcode='22023';end if;
  if jsonb_typeof(a) is distinct from 'object' then raise exception 'Invalid selection' using errcode='22023';end if;
  foreach field in array array['sr','sc','er','ec'] loop if jsonb_typeof(a->field) is distinct from 'number' or (a->>field)!~ '^\d{1,2}$' or (a->>field)::integer>=n then raise exception 'Invalid coordinate' using errcode='22023';end if;end loop;
  sr=(a->>'sr')::integer;sc=(a->>'sc')::integer;er=(a->>'er')::integer;ec=(a->>'ec')::integer;dr=er-sr;dc=ec-sc;len=greatest(abs(dr),abs(dc))+1;
  if len<2 or (dr<>0 and dc<>0 and abs(dr)<>abs(dc)) then raise exception 'Not a straight line' using errcode='22023';end if;
  word='';for k in 0..len-1 loop word=word||(p->'grid'->(sr+k*sign(dr)::integer)->>(sc+k*sign(dc)::integer));end loop;rev=reverse(word);
  target=null;select w->>'word' into target from jsonb_array_elements(p->'words') w where w->>'word' in (word,rev) limit 1;
  if target=any(found_words) then raise exception 'Repeated word' using errcode='22023';end if;
  if target is not null and (p->>'mode'<>'sequence' or p->'words'->cardinality(found_words)->>'word'=target) then found_words=array_append(found_words,target);
  else v_mistakes=v_mistakes+1;if limit_errors is not null and v_mistakes>=limit_errors then raise exception 'Mistake limit exceeded' using errcode='22023';end if;end if;
 end loop;
 if cardinality(found_words)<>cnt then raise exception 'Not complete' using errcode='22023';end if;
 elapsed=greatest(p_elapsed_ms,ceil(extract(epoch from (clock_timestamp()-run.started_at))*1000)::bigint);budget=(p->>'timeLimitMs')::bigint;par=(p->>'parMs')::bigint;
 if elapsed>86400000 or (budget is not null and elapsed>budget) then raise exception 'Time limit exceeded' using errcode='22023';end if;
 awarded_stars=case when p_hints>0 then 1 when v_mistakes=0 and elapsed<=par and (budget is null or elapsed<=budget*.75) then 3 when v_mistakes<=2 and elapsed<=par*1.75 then 2 else 1 end;
 points=greatest(100,awarded_stars*1000+cnt*100+greatest(0,600-floor(elapsed/1000.0)::integer*2)-v_mistakes*40-p_hints*100);
 update public.word_cross_runs set finished_at=clock_timestamp(),elapsed_ms=elapsed,hints=p_hints,mistakes=v_mistakes,stars=awarded_stars,score=points where id=run.id;
 return jsonb_build_object('stars',awarded_stars,'score',points);
end$$;
create function public.word_cross_ranking(p_kind text default 'campaign',p_level integer default 1,p_assisted boolean default false) returns jsonb language plpgsql stable security definer set search_path=public,pg_temp as $$
declare result jsonb;
begin
 if p_kind not in ('campaign','level','daily') or p_kind is null or p_level is null or p_level<1 or p_level>200 or p_assisted is null then raise exception 'Invalid ranking' using errcode='22023';end if;
 if p_kind='campaign' then
 select coalesce(jsonb_agg(to_jsonb(t)),'[]') into result from (
  select i.display_name,sum(b.stars)::integer as stars,sum(b.score)::integer as score,count(*)::integer as levels,0::bigint as elapsed_ms from (
   select distinct on(owner_id,level) owner_id,level,stars,score from public.word_cross_runs where finished_at is not null and daily_key is null and (hints>0)=p_assisted order by owner_id,level,stars desc,score desc
  ) b join public.arcadex_identities i on i.owner_id=b.owner_id group by b.owner_id,i.display_name order by sum(b.stars) desc,sum(b.score) desc,i.display_name limit 20) t;
 else
 select coalesce(jsonb_agg(to_jsonb(t)),'[]') into result from (
  select display_name,score,stars,elapsed_ms from (
   select distinct on(r.owner_id) i.display_name,r.score,r.stars,r.elapsed_ms from public.word_cross_runs r join public.arcadex_identities i on i.owner_id=r.owner_id where r.finished_at is not null and (r.hints>0)=p_assisted and ((p_kind='level' and r.level=p_level and r.daily_key is null) or (p_kind='daily' and r.daily_key=to_char(now() at time zone 'UTC','YYYY-MM-DD'))) order by r.owner_id,r.score desc,r.elapsed_ms
  ) b order by score desc,elapsed_ms,display_name limit 20) t;
 end if;return result;
end$$;
revoke all on function public.word_cross_generate(integer,bigint,text[]),public.word_cross_start(integer,uuid,boolean),public.word_cross_submit(uuid,jsonb,bigint,integer,uuid),public.word_cross_ranking(text,integer,boolean) from public,anon,authenticated;
grant execute on function public.word_cross_start(integer,uuid,boolean),public.word_cross_submit(uuid,jsonb,bigint,integer,uuid) to authenticated;
grant execute on function public.word_cross_ranking(text,integer,boolean) to anon,authenticated;
commit;
