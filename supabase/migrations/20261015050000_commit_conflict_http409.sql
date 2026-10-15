CREATE OR REPLACE FUNCTION public.arcadex_commit(p_writes jsonb, p_reads jsonb DEFAULT '[]'::jsonb)
 RETURNS void
 LANGUAGE plpgsql
 SECURITY DEFINER
 SET search_path TO 'public', 'pg_temp'
AS $function$
declare w jsonb; r jsonb; existing public.arcadex_documents; new_data jsonb; op text; current_version bigint;
  host_id text; guest_id text; old_host numeric; old_guest numeric; outcome numeric; delta integer; winner text; elo jsonb; elo_fields jsonb; score_fields jsonb;
begin
  if auth.uid() is null then raise exception 'Authentication required' using errcode = '42501'; end if;
  if jsonb_typeof(p_writes) <> 'array' or jsonb_array_length(p_writes) > 20 then raise exception 'Invalid write batch'; end if;
  -- Serialize short commits. CAS reads prevent stale moves and double matchmaking.
  perform pg_advisory_xact_lock(hashtextextended('arcadex-commit',0));
  for r in select value from jsonb_array_elements(p_reads) loop
    select version into current_version from public.arcadex_documents where path = r->>'path';
    if coalesce(current_version,0) <> (r->>'version')::bigint then
      raise exception 'Concurrent modification, retry transaction' using errcode = 'PT409';
    end if;
  end loop;
  for w in select value from jsonb_array_elements(p_writes) loop
    select * into existing from public.arcadex_documents where path = w->>'path';
    op := w->>'operation';
    if op = 'delete' then new_data := null;
    elsif op = 'update' then
      if existing.path is null then raise exception 'Document not found'; end if;
      new_data := public.arcadex_update(existing.data, w->'data');
    elsif op = 'set' then
      new_data := case when coalesce((w->>'merge')::boolean,false)
        then public.arcadex_merge(existing.data,w->'data') else public.arcadex_value(existing.data,w->'data') end;
    else raise exception 'Invalid operation'; end if;
    if split_part(w->>'path','/',1)='players' and cardinality(string_to_array(w->>'path','/'))=2 and new_data is not null then
      -- A delayed profile sync must not overwrite ratings awarded by a room commit.
      select coalesce(jsonb_object_agg(key,value),'{}') into elo_fields
        from jsonb_each(coalesce(existing.data#>'{stats,highScores}','{}')) where key like '%-elo';
      if new_data#>'{stats,highScores}' is not null or elo_fields <> '{}'::jsonb then
        select coalesce(jsonb_object_agg(key,value),'{}') into score_fields
          from jsonb_each(coalesce(new_data#>'{stats,highScores}','{}')) where key not like '%-elo';
        new_data := public.arcadex_merge(new_data,jsonb_build_object('stats',jsonb_build_object('highScores',score_fields||elo_fields)));
        -- Replace the map: recursive merge alone would retain forged incoming rating keys.
        new_data := jsonb_set(new_data,'{stats,highScores}',score_fields||elo_fields);
      end if;
    end if;
    perform public.arcadex_check_write(w->>'path', existing.data, new_data, existing.owner_id, p_writes);
    if op = 'delete' then delete from public.arcadex_documents where path = w->>'path';
    else
      -- ELO is derived on the server, atomically and exactly once per room ending.
      if split_part(w->>'path','/',1) = 'game_rooms' and existing.data->>'status' not in ('ended','finished')
        and new_data->>'status' in ('ended','finished') then
        host_id := public.arcadex_host(new_data); guest_id := public.arcadex_guest(new_data);
        old_host := coalesce((new_data#>>'{players,host,elo}')::numeric,(new_data#>>'{hostPlayer,elo}')::numeric,1200);
        old_guest := coalesce((new_data#>>'{players,guest,elo}')::numeric,(new_data#>>'{guestPlayer,elo}')::numeric,1200);
        winner := new_data->>'winner';
        if winner in ('DRAW','draw') then outcome := 0.5;
        elsif winner in ('host',host_id) then outcome := 1;
        elsif winner in ('guest',guest_id) then outcome := 0;
        else raise exception 'Invalid winner'; end if;
        delta := round(32 * (outcome - 1/(1+power(10,(old_guest-old_host)/400))));
        elo := jsonb_build_object('newHostElo',greatest(100,old_host+delta),'newGuestElo',greatest(100,old_guest-delta),'hostDelta',delta,'guestDelta',-delta);
        new_data := new_data || jsonb_build_object('eloChange',elo);
        update public.arcadex_documents set data = public.arcadex_merge(data,
          jsonb_build_object('stats',jsonb_build_object('highScores',jsonb_build_object((new_data->>'gameId')||'-elo',elo->'newHostElo')))),
          version=nextval('public.arcadex_document_version'), updated_at=now() where path='players/'||host_id;
        update public.arcadex_documents set data = public.arcadex_merge(data,
          jsonb_build_object('stats',jsonb_build_object('highScores',jsonb_build_object((new_data->>'gameId')||'-elo',elo->'newGuestElo')))),
          version=nextval('public.arcadex_document_version'), updated_at=now() where path='players/'||guest_id;
      end if;
      insert into public.arcadex_documents(path,data,owner_id) values(w->>'path',new_data,auth.uid())
        on conflict(path) do update set data=excluded.data, version=nextval('public.arcadex_document_version'), updated_at=now();
    end if;
  end loop;
end
$function$;
