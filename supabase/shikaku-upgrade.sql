-- Shikaku pack 3. Requires the existing ArcadeX identity migration.
create or replace function public.shikaku_daily_puzzle(p_day date,p_size integer) returns jsonb
language plpgsql immutable set search_path=public,pg_temp as $$
declare state bigint; seed bigint; rects jsonb; next_rects jsonb; hints jsonb:='[]'; solutions jsonb:='[]'; q jsonb; rr integer; cc integer; ww integer; hh integer; cut integer; lim integer; horizontal boolean; i integer:=0; splitting boolean;
begin
 if p_size not in (4,5,6,8) or p_day is null then raise exception 'Invalid daily config'; end if;
 seed:=mod(mod(((p_day-date '1970-01-01')::bigint*1103515245+p_size*12345+3*97),4294967296)+4294967296,4294967296); state:=seed;
 rects:=jsonb_build_array(jsonb_build_object('r',0,'c',0,'w',p_size,'h',p_size)); lim:=case p_size when 4 then 6 when 5 then 8 else 12 end;
 loop
  next_rects:='[]'; splitting:=false;
  for q in select value from jsonb_array_elements(rects) loop
   rr:=(q->>'r')::int;cc:=(q->>'c')::int;ww:=(q->>'w')::int;hh:=(q->>'h')::int;
   if ww*hh<=lim then next_rects:=next_rects||jsonb_build_array(q); continue; end if;
   splitting:=true;state:=mod(state*1664525+1013904223,4294967296); horizontal:=state>=2147483648;
   if ww=1 then horizontal:=true; end if;if hh=1 then horizontal:=false;end if;
   state:=mod(state*1664525+1013904223,4294967296);
   cut:=floor(state::numeric/4294967296*(case when horizontal then hh else ww end-1))::int+1;
   if horizontal then
    next_rects:=next_rects||jsonb_build_array(jsonb_build_object('r',rr,'c',cc,'w',ww,'h',cut),jsonb_build_object('r',rr+cut,'c',cc,'w',ww,'h',hh-cut));
   else
    next_rects:=next_rects||jsonb_build_array(jsonb_build_object('r',rr,'c',cc,'w',cut,'h',hh),jsonb_build_object('r',rr,'c',cc+cut,'w',ww-cut,'h',hh));
   end if;
  end loop;
  rects:=next_rects;exit when not splitting;
 end loop;
 for q in select value from jsonb_array_elements(rects) loop
  rr:=(q->>'r')::int;cc:=(q->>'c')::int;ww:=(q->>'w')::int;hh:=(q->>'h')::int;
  solutions:=solutions||jsonb_build_array(q||jsonb_build_object('id','daily-'||i));i:=i+1;
  state:=mod(state*1664525+1013904223,4294967296);rr:=rr+floor(state::numeric/4294967296*hh)::int;
  state:=mod(state*1664525+1013904223,4294967296);cc:=cc+floor(state::numeric/4294967296*ww)::int;
  hints:=hints||jsonb_build_array(jsonb_build_object('r',rr,'c',cc,'value',ww*hh));
 end loop;
 return jsonb_build_object('size',p_size,'seed',seed,'contentVersion',3,'solution',solutions,'hints',hints);
end $$;
revoke all on function public.shikaku_daily_puzzle(date,integer) from public;

create table if not exists public.shikaku_runs (
 id uuid primary key default gen_random_uuid(),owner_id uuid not null references auth.users(id) on delete cascade,
 day date not null,size integer not null check(size in (4,5,6,8)),pack_version integer not null default 3 check(pack_version=3),
 puzzle jsonb not null,started_at timestamptz not null default now(),finished_at timestamptz,
 hint_events jsonb not null default '[]',hints integer not null default 0 check(hints between 0 and 200),
 stars integer check(stars between 1 and 3),elapsed_ms bigint check(elapsed_ms>=0),rectangles jsonb,
 unique(owner_id,day,size,pack_version)
);
alter table public.shikaku_runs enable row level security;
revoke all on public.shikaku_runs from anon,authenticated;
create index if not exists shikaku_ranking_idx on public.shikaku_runs(day,size,pack_version,stars desc,elapsed_ms) where finished_at is not null;

create or replace function public.shikaku_start(p_size integer,p_expected_owner uuid) returns jsonb
language plpgsql security definer set search_path=public,pg_temp as $$
declare u uuid:=auth.uid();d date:=(now() at time zone 'UTC')::date;v public.shikaku_runs;
begin
 if u is null or u is distinct from p_expected_owner or coalesce((auth.jwt()->>'is_anonymous')::boolean,false) then raise exception 'Sign in required/account changed'; end if;
 if p_size not in(4,5,6,8) then raise exception 'Invalid size';end if;
 insert into public.shikaku_runs(owner_id,day,size,puzzle) values(u,d,p_size,public.shikaku_daily_puzzle(d,p_size)) on conflict(owner_id,day,size,pack_version) do nothing;
 select * into v from public.shikaku_runs where owner_id=u and day=d and size=p_size and pack_version=3;
 return jsonb_build_object('id',v.id,'day',v.day,'puzzle',v.puzzle,'hints',v.hints,'finished',v.finished_at is not null);
end $$;

create or replace function public.shikaku_hint(p_ticket uuid,p_event uuid,p_expected_owner uuid) returns integer
language plpgsql security definer set search_path=public,pg_temp as $$
declare v public.shikaku_runs;u uuid:=auth.uid();
begin
 if u is null or u is distinct from p_expected_owner or coalesce((auth.jwt()->>'is_anonymous')::boolean,false) then raise exception 'Account changed';end if;
 if p_event is null then raise exception 'Missing event';end if;
 select * into v from public.shikaku_runs where id=p_ticket and owner_id=u for update;
 if not found or v.finished_at is not null or now()-v.started_at>interval '24 hours' then raise exception 'Ticket expired/finished';end if;
 if v.hint_events ? p_event::text then return v.hints;end if;
 if v.hints>=200 then raise exception 'Hint limit';end if;
 update public.shikaku_runs set hint_events=hint_events||jsonb_build_array(p_event::text),hints=hints+1 where id=v.id returning hints into v.hints;
 return v.hints;
end $$;

create or replace function public.shikaku_submit(p_ticket uuid,p_rectangles jsonb,p_expected_owner uuid) returns jsonb
language plpgsql security definer set search_path=public,pg_temp as $$
declare v public.shikaku_runs;u uuid:=auth.uid();q jsonb;k jsonb;rr int;cc int;ww int;hh int;x int;y int;clues int;area int:=0;used integer[]:='{}';cell int;elapsed bigint;s int;
begin
 if u is null or u is distinct from p_expected_owner or coalesce((auth.jwt()->>'is_anonymous')::boolean,false) then raise exception 'Account changed';end if;
 select * into v from public.shikaku_runs where id=p_ticket and owner_id=u for update;
 if not found then raise exception 'Invalid ticket';end if;
 if v.finished_at is not null then return jsonb_build_object('verified',true,'stars',v.stars,'elapsed_ms',v.elapsed_ms,'hints',v.hints);end if;
 if now()-v.started_at>interval '24 hours' or now()<v.started_at then raise exception 'Expired ticket';end if;
 if jsonb_typeof(p_rectangles) is distinct from 'array' or jsonb_array_length(p_rectangles) not between 1 and 200 then raise exception 'Invalid rectangles';end if;
 for q in select value from jsonb_array_elements(p_rectangles) loop
  if jsonb_typeof(q->'r') is distinct from 'number' or jsonb_typeof(q->'c') is distinct from 'number' or jsonb_typeof(q->'w') is distinct from 'number' or jsonb_typeof(q->'h') is distinct from 'number' then raise exception 'Invalid coordinates';end if;
  rr:=(q->>'r')::int;cc:=(q->>'c')::int;ww:=(q->>'w')::int;hh:=(q->>'h')::int;
  if rr<0 or cc<0 or ww<1 or hh<1 or ww>v.size or hh>v.size or rr>=v.size or cc>=v.size or rr+hh>v.size or cc+ww>v.size then raise exception 'Outside board';end if;
  clues:=0;
  for k in select value from jsonb_array_elements(v.puzzle->'hints') loop
   if (k->>'r')::int>=rr and (k->>'r')::int<rr+hh and (k->>'c')::int>=cc and (k->>'c')::int<cc+ww then
    clues:=clues+1;if (k->>'value')::int<>ww*hh then raise exception 'Incorrect area';end if;
   end if;
  end loop;
  if clues<>1 then raise exception 'One clue required';end if;
  for y in rr..rr+hh-1 loop for x in cc..cc+ww-1 loop cell:=y*v.size+x;if cell=any(used) then raise exception 'Overlap';end if;used:=array_append(used,cell);end loop;end loop;
  area:=area+ww*hh;
 end loop;
 if area<>v.size*v.size then raise exception 'Incomplete board';end if;
 elapsed:=greatest(0,ceil(extract(epoch from(now()-v.started_at))*1000)::bigint);s:=greatest(1,3-least(2,v.hints));
 update public.shikaku_runs set finished_at=now(),elapsed_ms=elapsed,stars=s,rectangles=p_rectangles where id=v.id;
 return jsonb_build_object('verified',true,'stars',s,'elapsed_ms',elapsed,'hints',v.hints);
end $$;

create or replace function public.shikaku_ranking(p_size integer,p_assisted boolean default false,p_day date default (now() at time zone 'UTC')::date) returns jsonb
language plpgsql stable security definer set search_path=public,pg_temp as $$
declare rows jsonb;
begin
 if p_size not in (4,5,6,8) or p_day is null then raise exception 'Invalid ranking';end if;
 select coalesce(jsonb_agg(to_jsonb(t)),'[]') into rows from (
  select i.display_name,r.stars,r.elapsed_ms,r.hints from public.shikaku_runs r join public.arcadex_identities i on i.owner_id=r.owner_id
  where r.day=p_day and r.size=p_size and r.pack_version=3 and r.finished_at is not null and (r.hints>0)=p_assisted
  order by r.stars desc,r.elapsed_ms,r.hints,r.finished_at,r.id limit 20
 ) t;
 return rows;
end $$;
revoke all on function public.shikaku_start(integer,uuid),public.shikaku_hint(uuid,uuid,uuid),public.shikaku_submit(uuid,jsonb,uuid),public.shikaku_ranking(integer,boolean,date) from public;
grant execute on function public.shikaku_start(integer,uuid),public.shikaku_hint(uuid,uuid,uuid),public.shikaku_submit(uuid,jsonb,uuid) to authenticated;
grant execute on function public.shikaku_ranking(integer,boolean,date) to authenticated,anon;
