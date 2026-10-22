-- Atomic casual 1vs1 matching. Private room codes never enter the public queue.
create index if not exists bs_rooms_queue on battleship_private.rooms(updated_at)
 where active and doc->>'status'='waiting' and doc->>'matchmaking'='true';
create or replace function public.bs_room_match(p_uid text,p_id text,p_code text,p_state jsonb,p_now bigint) returns jsonb
language plpgsql security invoker set search_path='' as $$
declare candidate jsonb; own_room jsonb; v_uid text; result jsonb;
begin
 if p_uid is null or length(p_uid)=0 or p_id is null or p_code !~ '^[A-Z2-9]{6}$' then raise exception 'invalid queue request'; end if;
 -- Serialize queue claims; gameplay uses sorted per-identity locks before room locks.
 perform pg_advisory_xact_lock(hashtextextended('battleship-matchmaking-v1',0));
 select doc into candidate from battleship_private.rooms
 where active and doc->>'status'='waiting' and doc->>'matchmaking'='true'
 and doc->'members'->>'A1'<>p_uid and not(doc->'members' ? 'B1')
 and coalesce((doc->'lastSeen'->>'A1')::bigint,(doc->>'createdAt')::bigint)>p_now-90000
 and (doc->>'createdAt')::bigint>p_now-600000
 order by (doc->>'createdAt')::bigint,id limit 1;
 for v_uid in select distinct x from unnest(array[p_uid,candidate->'members'->>'A1']) x where x is not null order by x loop
  perform pg_advisory_xact_lock(hashtextextended(v_uid,0));
 end loop;
 -- Retrying an uncertain request returns its original match, even after it closes.
 select doc into own_room from battleship_private.rooms where doc->'matchRequests'->>p_uid=p_id limit 1;
 if own_room is not null then return own_room; end if;
 select doc into own_room from battleship_private.rooms r where active and exists(select 1 from jsonb_each_text(r.doc->'members') m where m.value=p_uid and not coalesce(r.doc->'departed' ? m.key,false)) limit 1;
 if own_room is not null then
  -- A different request ID must not be accepted as an unrecorded alias: its late
  -- retry after this match closes could otherwise silently open a new search.
  raise exception 'identity already has an active room';
 end if;
 if exists(select 1 from battleship_private.rooms where id=p_id) then raise exception 'room ID conflict'; end if;
 if candidate is not null then
  select doc into candidate from battleship_private.rooms where id=candidate->>'id' and active
  and doc->>'status'='waiting' and doc->>'matchmaking'='true'
  and coalesce((doc->'lastSeen'->>'A1')::bigint,(doc->>'createdAt')::bigint)>p_now-90000 for update;
 end if;
 if candidate is not null then
  result:=candidate||jsonb_build_object('version',(candidate->>'version')::int+1,'status','active',
   'members',(candidate->'members')||jsonb_build_object('B1',p_uid),
   'lastSeen',coalesce(candidate->'lastSeen','{}'::jsonb)||jsonb_build_object('B1',p_now),
   'matchRequests',coalesce(candidate->'matchRequests','{}'::jsonb)||jsonb_build_object(p_uid,p_id),'state',p_state);
  update battleship_private.rooms set doc=result,version=(result->>'version')::int,updated_at=clock_timestamp() where id=result->>'id';
 else
  result:=jsonb_build_object('id',p_id,'code',p_code,'version',0,'status','waiting','matchmaking',true,
   'members',jsonb_build_object('A1',p_uid),'matchRequests',jsonb_build_object(p_uid,p_id),
   'lastSeen',jsonb_build_object('A1',p_now),'state',null,'createdAt',p_now,'receipts','[]'::jsonb);
  insert into battleship_private.rooms(id,code,version,active,doc) values(p_id,p_code,0,true,result);
 end if;
 return result;
end;$$;
revoke all on function public.bs_room_match(text,text,text,jsonb,bigint) from public,anon,authenticated;
grant execute on function public.bs_room_match(text,text,text,jsonb,bigint) to service_role;
