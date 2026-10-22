-- Consent and child-room creation are one transaction. Service-only, invoker privileges.
create or replace function public.bs_room_rematch(p_id text,p_uid text,p_version integer,p_action text,p_fingerprint text,p_agree boolean,p_now bigint,p_next_id text,p_next_code text,p_state jsonb) returns jsonb
language plpgsql security invoker set search_path='' as $$
declare old_doc jsonb; next_doc jsonb; old_version integer; actor text; v_uid text; receipt jsonb; votes jsonb; seats integer;
begin
 select doc into old_doc from battleship_private.rooms where id=p_id;
 if old_doc is null then raise exception 'rematch not found'; end if;
 for v_uid in select value from jsonb_each_text(old_doc->'members') order by value loop
  perform pg_advisory_xact_lock(hashtextextended(v_uid,0));
 end loop;
 select doc,version into old_doc,old_version from battleship_private.rooms where id=p_id for update;
 select key into actor from jsonb_each_text(old_doc->'members') where value=p_uid;
 if actor is null then raise exception 'rematch not member'; end if;
 select r into receipt from jsonb_array_elements(old_doc->'receipts') r where r->>'id'=p_action and r->>'actor'=p_uid limit 1;
 if receipt is not null and receipt->>'fingerprint'<>p_fingerprint then raise exception 'rematch action reused'; end if;
 if old_doc->>'rematchRoomId' is not null then
  select doc into next_doc from battleship_private.rooms where id=old_doc->>'rematchRoomId';
  return next_doc;
 end if;
 if receipt is not null then return old_doc; end if;
 if old_version<>p_version then raise exception 'rematch version conflict'; end if;
 if old_doc->>'status' is distinct from 'closed' or old_doc->'state'->>'phase' is distinct from 'finished'
 or old_doc->>'closeReason' is not null or coalesce(jsonb_array_length(old_doc->'departed'),0)>0
 or p_now>=coalesce((old_doc->>'closedAt')::bigint,0)+120000 then raise exception 'rematch unavailable'; end if;
 votes:=coalesce(old_doc->'rematchVotes','[]'::jsonb);
 select coalesce(jsonb_agg(s),'[]'::jsonb) into votes from jsonb_array_elements_text(votes) s where s<>actor;
 if p_agree then votes:=votes||to_jsonb(actor); end if;
 old_doc:=old_doc||jsonb_build_object('rematchVotes',votes,'version',old_version+1,'receipts',(old_doc->'receipts')||jsonb_build_array(jsonb_build_object('id',p_action,'actor',p_uid,'fingerprint',p_fingerprint,'version',old_version+1)));
 select count(*) into seats from jsonb_each_text(old_doc->'members');
 if jsonb_array_length(votes)=seats then
  if exists(select 1 from battleship_private.rooms r,jsonb_each_text(r.doc->'members') m where r.active
   and not coalesce(r.doc->'departed' ? m.key,false)
   and m.value in(select value from jsonb_each_text(old_doc->'members'))) then raise exception 'identity already has an active room'; end if;
  next_doc:=jsonb_build_object('id',p_next_id,'code',p_next_code,'mode',old_doc->'state'->>'mode','version',0,'status','active',
   'members',old_doc->'members','state',p_state,'lastSeen',(select jsonb_object_agg(key,p_now) from jsonb_each_text(old_doc->'members')),
   'createdAt',p_now,'receipts','[]'::jsonb,'rematchOf',p_id);
  insert into battleship_private.rooms(id,code,version,active,doc) values(p_next_id,p_next_code,0,true,next_doc);
  old_doc:=old_doc||jsonb_build_object('rematchRoomId',p_next_id);
 end if;
 update battleship_private.rooms set doc=old_doc,version=old_version+1,updated_at=clock_timestamp() where id=p_id;
 return coalesce(next_doc,old_doc);
end;$$;
revoke all on function public.bs_room_rematch(text,text,integer,text,text,boolean,bigint,text,text,jsonb) from public,anon,authenticated;
grant execute on function public.bs_room_rematch(text,text,integer,text,text,boolean,bigint,text,text,jsonb) to service_role;
