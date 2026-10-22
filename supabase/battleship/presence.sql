-- Presence writes share the room row lock but never increment its gameplay version.
-- Clients cannot call these persistence functions directly.
create or replace function public.bs_room_touch(p_id text,p_uid text,p_now bigint) returns jsonb
language plpgsql security invoker set search_path='' as $$
declare current_doc jsonb; seat text; seen bigint;
begin
 select doc into current_doc from battleship_private.rooms where id=p_id for update;
 if current_doc is null then return null; end if;
 select key into seat from jsonb_each_text(current_doc->'members') where value=p_uid;
 if seat is null then raise exception 'not a room member'; end if;
 if current_doc->>'status'='closed' then return current_doc; end if;
 seen:=coalesce((current_doc->'lastSeen'->>seat)::bigint,(current_doc->>'createdAt')::bigint);
 -- The service checks expiry before this call. Do not resurrect a late arrival even if
 -- another state update happened while it was waiting for this lock.
 if current_doc->'departed' ? seat then return current_doc; end if;
 if seen<=p_now-90000 and not coalesce((current_doc->'state'->>'mode'='squad' and current_doc->'state'->>'phase'='battle'),false) then return current_doc; end if;
 if p_now-seen>=5000 or current_doc->'lastSeen'->>seat is null then
  current_doc:=jsonb_set(current_doc,'{lastSeen}',coalesce(current_doc->'lastSeen','{}'::jsonb)||jsonb_build_object(seat,p_now));
  update battleship_private.rooms set doc=current_doc where id=p_id;
 end if;
 return current_doc;
end;$$;
revoke all on function public.bs_room_touch(text,text,bigint) from public,anon,authenticated;
grant execute on function public.bs_room_touch(text,text,bigint) to service_role;

create or replace function public.bs_room_cas(p_version integer,p_room jsonb) returns jsonb
language plpgsql security invoker set search_path='' as $$
declare v_uid text; current_version integer; current_doc jsonb; seat text; latest_seen jsonb;
begin
 if (p_room->>'version')::int<>p_version+1 then raise exception 'invalid version'; end if;
 for v_uid in select value from jsonb_each_text(p_room->'members') order by value loop
  perform pg_advisory_xact_lock(hashtextextended(v_uid,0));
 end loop;
 select version,doc into current_version,current_doc from battleship_private.rooms where id=p_room->>'id' for update;
 if current_version is null or current_version<>p_version then return null; end if;
 -- A heartbeat can race an expiry worker without changing gameplay version. Recheck
 -- every seat used to justify forfeiture under the same lock as the final state write.
 if p_room ? 'takeoverGuard' then
  seat:=p_room->'takeoverGuard'->>'seat';
  if coalesce((current_doc->'lastSeen'->>seat)::bigint,(current_doc->>'createdAt')::bigint)>(p_room->'takeoverGuard'->>'cutoff')::bigint then return null; end if;
 end if;
 if p_room ? 'expiryGuard' then
  for seat in select jsonb_array_elements_text(p_room->'expiryGuard'->'seats') loop
   if coalesce((current_doc->'lastSeen'->>seat)::bigint,(current_doc->>'createdAt')::bigint)>(p_room->'expiryGuard'->>'cutoff')::bigint then return null; end if;
  end loop;
 end if;
 if p_room->>'status'<>'closed' and exists(
  select 1 from battleship_private.rooms r,jsonb_each_text(r.doc->'members') old_member
  where r.active and r.id<>p_room->>'id' and not coalesce(r.doc->'departed' ? old_member.key,false)
  and old_member.value in (select value from jsonb_each_text(p_room->'members') m where not coalesce(p_room->'departed' ? m.key,false))
 ) then raise exception 'identity already has an active room'; end if;
 select coalesce(jsonb_object_agg(k,greatest(
  coalesce((current_doc->'lastSeen'->>k)::bigint,(current_doc->>'createdAt')::bigint),
  coalesce((p_room->'lastSeen'->>k)::bigint,(p_room->>'createdAt')::bigint)
 )),'{}'::jsonb) into latest_seen from jsonb_object_keys(p_room->'members') k;
 p_room:=(p_room-'expiryGuard'-'takeoverGuard')||jsonb_build_object('lastSeen',latest_seen);
 update battleship_private.rooms set doc=p_room,version=p_version+1,active=p_room->>'status'<>'closed',updated_at=clock_timestamp() where id=p_room->>'id';
 return p_room;
end;$$;
revoke all on function public.bs_room_cas(integer,jsonb) from public,anon,authenticated;
grant execute on function public.bs_room_cas(integer,jsonb) to service_role;

create or replace function public.bs_room_due(p_now bigint) returns setof jsonb
language sql security invoker set search_path='' as $$
 select doc from battleship_private.rooms where active and (
 (case when doc->>'status'='waiting' then (doc->>'createdAt')::bigint+600000 else (doc->'state'->>'deadline')::bigint end)<=p_now
 or case when doc->'state'->>'mode'='squad' and doc->'state'->>'phase'='battle' then
 exists(select 1 from (values('A1','A2'),('B1','B2')) t(s1,s2) where
 (coalesce(doc->'departed' ? t.s1,false) or coalesce((doc->'lastSeen'->>t.s1)::bigint,(doc->>'createdAt')::bigint)<=p_now-90000) and
 (coalesce(doc->'departed' ? t.s2,false) or coalesce((doc->'lastSeen'->>t.s2)::bigint,(doc->>'createdAt')::bigint)<=p_now-90000))
 else exists(select 1 from jsonb_each_text(doc->'members') m where
 coalesce((doc->'lastSeen'->>m.key)::bigint,(doc->>'createdAt')::bigint)<=p_now-90000) end
 ) order by updated_at limit 100;
$$;
revoke all on function public.bs_room_due(bigint) from public,anon,authenticated;
grant execute on function public.bs_room_due(bigint) to service_role;
