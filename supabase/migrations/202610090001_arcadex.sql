-- ArcadeX document-shaped data on Postgres. Browser writes ONLY through checked RPCs.
-- Existing JSON game states do not need to be rewritten. Not a Firestore emulator.
begin;

create table public.arcadex_player_bindings (
  player_id text primary key check (length(player_id) between 1 and 160),
  owner_id uuid not null references auth.users(id) on delete cascade,
  created_at timestamptz not null default now()
);
create index on public.arcadex_player_bindings(owner_id);
create sequence public.arcadex_document_version;
create table public.arcadex_documents (
  path text primary key,
  collection_path text generated always as (regexp_replace(path, '/[^/]+$', '')) stored,
  data jsonb not null check (jsonb_typeof(data) = 'object'),
  version bigint not null default nextval('public.arcadex_document_version'),
  owner_id uuid not null references auth.users(id),
  updated_at timestamptz not null default now(),
  check (length(path) <= 600 and path ~ '^[^/]+(/[^/]+)+$')
);
create index on public.arcadex_documents(collection_path);
create index on public.arcadex_documents(owner_id);
create index on public.arcadex_documents using gin(data jsonb_path_ops);
create unique index arcadex_room_code on public.arcadex_documents ((data->>'roomCode'))
  where collection_path = 'game_rooms';

alter table public.arcadex_documents enable row level security;
alter table public.arcadex_player_bindings enable row level security;
revoke all on public.arcadex_documents, public.arcadex_player_bindings from anon, authenticated;
grant select on public.arcadex_documents to authenticated;

create function public.arcadex_owns(p_player_id text) returns boolean
language sql stable security definer set search_path = public, pg_temp as $$
  select auth.uid() is not null and exists (
    select 1 from public.arcadex_player_bindings where player_id = p_player_id and owner_id = auth.uid()
  )
$$;

create function public.arcadex_bind_player(p_player_id text) returns void
language plpgsql security definer set search_path = public, pg_temp as $$
begin
  if auth.uid() is null then raise exception 'Authentication required' using errcode = '42501'; end if;
  if p_player_id is null or length(p_player_id) not between 1 and 160 or p_player_id like '%/%' then
    raise exception 'Invalid player ID';
  end if;
  insert into public.arcadex_player_bindings(player_id, owner_id) values (p_player_id, auth.uid())
    on conflict (player_id) do nothing;
  if not public.arcadex_owns(p_player_id) then
    raise exception 'Player belongs to another identity' using errcode = '42501';
  end if;
end
$$;

create function public.arcadex_host(d jsonb) returns text language sql immutable as $$
  select coalesce(d#>>'{players,host,uid}', d#>>'{hostPlayer,uid}')
$$;
create function public.arcadex_guest(d jsonb) returns text language sql immutable as $$
  select coalesce(d#>>'{players,guest,uid}', d#>>'{guestPlayer,uid}')
$$;
create function public.arcadex_member(d jsonb) returns boolean
language sql stable security definer set search_path = public, pg_temp as $$
  select public.arcadex_owns(public.arcadex_host(d)) or public.arcadex_owns(public.arcadex_guest(d))
$$;

create function public.arcadex_can_read(p_path text, d jsonb, p_owner uuid) returns boolean
language sql stable security definer set search_path = public, pg_temp as $$
  select auth.uid() is not null and (
    p_owner = auth.uid()
    or split_part(p_path, '/', 1) in ('chat_messages', 'leaderboards', 'daily_leaderboards')
    or (split_part(p_path, '/', 1) = 'game_rooms' and (d->>'status' = 'waiting' or public.arcadex_member(d)))
    or (split_part(p_path, '/', 1) = 'matchmaking_queue' and d->>'status' = 'waiting')
    or (split_part(p_path, '/', 1) = 'friend_challenges' and public.arcadex_owns(d->>'targetUid'))
  )
$$;
create policy arcadex_read_documents on public.arcadex_documents for select to authenticated
  using (public.arcadex_can_read(path, data, owner_id));
-- No insert/update/delete policies: all changes go through arcadex_commit.

create function public.arcadex_read(
  p_collection text, p_id text default null, p_filters jsonb default '[]',
  p_order_field text default null, p_desc boolean default false, p_limit integer default 100
) returns table(path text, data jsonb, version bigint)
language plpgsql stable security definer set search_path = public, pg_temp as $$
begin
  if auth.uid() is null then raise exception 'Authentication required' using errcode = '42501'; end if;
  return query
  select x.path, x.visible, x.version from (
    select d.path, d.version,
      case when d.collection_path = 'players' and d.owner_id <> auth.uid() then
        (select coalesce(jsonb_object_agg(k,v),'{}'::jsonb) from jsonb_each(d.data) e(k,v)
          where k = any(array['id','username','avatar','currentTitle','level','exp','stats','isOnline','lastSeen','customStatus','favoriteGameId','createdAt']))
      else d.data end as visible
    from public.arcadex_documents d
    where d.collection_path = p_collection and (p_id is null or d.path = p_collection || '/' || p_id)
      and (public.arcadex_can_read(d.path, d.data, d.owner_id) or d.collection_path = 'players')
  ) x
  where not exists (
    select 1 from jsonb_array_elements(p_filters) f
    where (x.visible #> string_to_array(f->>'field', '.')) is distinct from f->'value'
  )
  order by
    case when not p_desc then x.visible #> string_to_array(p_order_field, '.') end asc nulls last,
    case when p_desc then x.visible #> string_to_array(p_order_field, '.') end desc nulls last,
    x.path
  limit greatest(1, least(p_limit, 100));
end
$$;

-- Resolve transforms against the current value INSIDE the locked transaction.
create function public.arcadex_value(old_value jsonb, new_value jsonb) returns jsonb
language plpgsql as $$
declare result jsonb; k text; v jsonb; item jsonb;
begin
  if jsonb_typeof(new_value) = 'object' and new_value ? '__arcadex_transform' then
    case new_value->>'__arcadex_transform'
      when 'timestamp' then return to_jsonb(floor(extract(epoch from clock_timestamp()) * 1000)::bigint);
      when 'increment' then return to_jsonb(coalesce((old_value#>>'{}')::numeric, 0) + (new_value->>'amount')::numeric);
      when 'union' then
        result := case when jsonb_typeof(old_value) = 'array' then old_value else '[]'::jsonb end;
        for item in select value from jsonb_array_elements(new_value->'values') loop
          if not result @> jsonb_build_array(item) then result := result || jsonb_build_array(item); end if;
        end loop;
        return result;
      when 'remove' then
        select coalesce(jsonb_agg(value), '[]'::jsonb) into result
        from jsonb_array_elements(coalesce(old_value, '[]'::jsonb))
        where not (new_value->'values') @> jsonb_build_array(value);
        return result;
      else raise exception 'Unknown transform';
    end case;
  elsif jsonb_typeof(new_value) = 'object' then
    result := '{}';
    for k, v in select * from jsonb_each(new_value) loop
      result := result || jsonb_build_object(k, public.arcadex_value(old_value->k, v));
    end loop;
    return result;
  end if;
  return new_value;
end
$$;
create function public.arcadex_merge(old_value jsonb, patch jsonb) returns jsonb
language plpgsql as $$
declare result jsonb := case when jsonb_typeof(old_value) = 'object' then old_value else '{}'::jsonb end; k text; v jsonb;
begin
  for k, v in select * from jsonb_each(patch) loop
    if jsonb_typeof(v) = 'object' and not v ? '__arcadex_transform' then
      result := result || jsonb_build_object(k, public.arcadex_merge(result->k, v));
    else
      result := result || jsonb_build_object(k, public.arcadex_value(result->k, v));
    end if;
  end loop;
  return result;
end
$$;
create function public.arcadex_update(old_value jsonb, patch jsonb) returns jsonb
language plpgsql as $$
declare result jsonb := old_value; k text; v jsonb; parts text[]; i integer;
begin
  for k, v in select * from jsonb_each(patch) loop
    parts := string_to_array(k, '.');
    for i in 1..cardinality(parts)-1 loop
      if result #> parts[1:i] is null then result := jsonb_set(result, parts[1:i], '{}', true); end if;
    end loop;
    result := jsonb_set(result, parts, public.arcadex_value(result #> parts, v), true);
  end loop;
  return result;
end
$$;

create function public.arcadex_check_write(p_path text, old_data jsonb, new_data jsonb, p_owner uuid, writes jsonb)
returns void language plpgsql security definer set search_path = public, pg_temp as $$
declare kind text := split_part(p_path, '/', 1); player text := split_part(p_path, '/', 2);
  host_id text; guest_id text; actor text; old_turn text; room_data jsonb; terminal_winner text; offer_id text;
begin
  if kind in ('players','leaderboards','daily_leaderboards') then
    if kind <> 'players' and cardinality(string_to_array(p_path,'/')) <> 4 then raise exception 'Invalid score path'; end if;
  elsif cardinality(string_to_array(p_path,'/')) <> 2 then raise exception 'Invalid document path'; end if;
  if new_data is null then
    if old_data is not null and p_owner = auth.uid() and kind = 'matchmaking_queue' then return; end if;
    raise exception 'Deletion denied' using errcode = '42501';
  end if;
  if kind = 'players' then
    if not public.arcadex_owns(player) then raise exception 'Not your player' using errcode = '42501'; end if;
    if cardinality(string_to_array(p_path, '/')) not in (2,4) then raise exception 'Invalid player path'; end if;
    if cardinality(string_to_array(p_path, '/')) = 4 and split_part(p_path,'/',3) not in ('inventory_data','game_sessions') then
      raise exception 'Unknown player data';
    end if;
    return;
  elsif kind = 'daily_challenges' then
    if public.arcadex_owns(new_data->>'userId') and (old_data is null or p_owner = auth.uid()) then return; end if;
  elsif kind in ('leaderboards','daily_leaderboards') then
    if old_data is null and public.arcadex_owns(new_data->>'playerId')
      and jsonb_typeof(new_data->'score') = 'number' and (new_data->>'score')::numeric >= 0 then return; end if;
  elsif kind = 'chat_messages' then
    if old_data is null and public.arcadex_owns(new_data->>'senderId')
      and length(new_data->>'text') between 1 and 2000
      and coalesce((new_data->>'likes')::integer, 0) = 0
      and coalesce(new_data->'likedBy', '[]') = '[]'::jsonb then return; end if;
    -- Any authenticated player may toggle ONLY their own like, not edit a message.
    if old_data is not null and (new_data - 'likes' - 'likedBy') = (old_data - 'likes' - 'likedBy') then
      if jsonb_typeof(new_data->'likedBy') <> 'array' then raise exception 'Invalid likes'; end if;
      if exists (
        select 1 from (
          (select value from jsonb_array_elements(coalesce(new_data->'likedBy','[]'))
           except select value from jsonb_array_elements(coalesce(old_data->'likedBy','[]')))
          union all
          (select value from jsonb_array_elements(coalesce(old_data->'likedBy','[]'))
           except select value from jsonb_array_elements(coalesce(new_data->'likedBy','[]')))
        ) changes where not public.arcadex_owns(changes.value#>>'{}')
      ) then raise exception 'Cannot change another player like' using errcode = '42501'; end if;
      if (new_data->>'likes')::integer = jsonb_array_length(new_data->'likedBy') then return; end if;
    end if;
  elsif kind = 'friend_challenges' then
    if old_data is null and public.arcadex_owns(new_data->>'senderUid') and new_data->>'status' = 'pending' then return; end if;
    if old_data is not null and public.arcadex_owns(old_data->>'targetUid')
      and (new_data - 'status' - 'respondedAt') = (old_data - 'status' - 'respondedAt')
      and old_data->>'status' = 'pending' and new_data->>'status' in ('accepted','declined') then return; end if;
  elsif kind = 'matchmaking_queue' then
    if public.arcadex_owns(new_data->>'uid') and (old_data is null or p_owner = auth.uid()) then return; end if;
    if old_data->>'status' = 'waiting' and new_data->>'status' = 'matched'
      and (new_data - 'status' - 'matchedRoomId') = (old_data - 'status' - 'matchedRoomId') then
      select w->'data' into room_data from jsonb_array_elements(writes) w
        where w->>'path' = 'game_rooms/' || (new_data->>'matchedRoomId') and w->>'operation' = 'set' limit 1;
      if public.arcadex_host(room_data) = old_data->>'uid' and public.arcadex_owns(public.arcadex_guest(room_data))
        and room_data->>'gameId' = old_data->>'gameId' then return; end if;
    end if;
  elsif kind = 'game_rooms' then
    host_id := public.arcadex_host(new_data); guest_id := public.arcadex_guest(new_data);
    if old_data is null then
      if new_data->>'roomId' <> player or host_id is null then raise exception 'Invalid room'; end if;
      if public.arcadex_owns(host_id) and guest_id is null and new_data->>'status' = 'waiting' then return; end if;
      if public.arcadex_owns(guest_id) and exists (
        select 1 from public.arcadex_documents q where q.collection_path = 'matchmaking_queue'
          and q.data->>'uid' = host_id and q.data->>'status' = 'waiting' and q.data->>'gameId' = new_data->>'gameId'
          and exists (select 1 from jsonb_array_elements(writes) claim
            where claim->>'path'=q.path and claim->>'operation'='update'
              and claim#>>'{data,status}'='matched' and claim#>>'{data,matchedRoomId}'=new_data->>'roomId')
      ) then return; end if;
    else
      if host_id is distinct from public.arcadex_host(old_data)
        or new_data->>'roomId' is distinct from old_data->>'roomId'
        or new_data->>'roomCode' is distinct from old_data->>'roomCode'
        or new_data->>'gameId' is distinct from old_data->>'gameId' then raise exception 'Room identity is immutable'; end if;
      if old_data->>'status' = 'waiting' and public.arcadex_guest(old_data) is null
        and public.arcadex_owns(guest_id) then
        if (new_data - array['players','guestPlayer','status','turnDeadline','updatedAt','messages','quickMessages'])
          is distinct from (old_data - array['players','guestPlayer','status','turnDeadline','updatedAt','messages','quickMessages'])
          or new_data#>'{players,host}' is distinct from old_data#>'{players,host}'
          or new_data->'hostPlayer' is distinct from old_data->'hostPlayer'
          or new_data->>'status' not in ('ready','playing') then raise exception 'Invalid room join'; end if;
        return;
      end if;
      if not public.arcadex_member(old_data) or guest_id is distinct from public.arcadex_guest(old_data) then
        raise exception 'Not a room participant' using errcode = '42501';
      end if;
      if ((new_data#>'{players,host}') - 'color') is distinct from ((old_data#>'{players,host}') - 'color')
        or ((new_data#>'{players,guest}') - 'color') is distinct from ((old_data#>'{players,guest}') - 'color')
        or ((new_data->'hostPlayer') - 'symbol') is distinct from ((old_data->'hostPlayer') - 'symbol')
        or ((new_data->'guestPlayer') - 'symbol') is distinct from ((old_data->'guestPlayer') - 'symbol') then
        raise exception 'Player identity/rating is immutable' using errcode = '42501';
      end if;
      actor := case when public.arcadex_owns(host_id) then host_id else guest_id end;
      if new_data->'boardState' is distinct from old_data->'boardState' and old_data->>'status' not in ('ended','finished') then
        old_turn := case old_data->>'currentTurn' when 'host' then host_id when 'guest' then guest_id else old_data->>'currentTurn' end;
        if actor is distinct from old_turn or old_data->>'status' not in ('playing','ready') then
          raise exception 'Not your turn' using errcode = '42501';
        end if;
        if new_data->>'currentTurn' = old_data->>'currentTurn' then raise exception 'Turn must advance'; end if;
      end if;
      if new_data->>'status' in ('ended','finished') and old_data->>'status' not in ('ended','finished') then
        terminal_winner := case new_data->>'winner' when 'host' then host_id when 'guest' then guest_id else new_data->>'winner' end;
        if new_data->>'endReason' = 'SURRENDER' or new_data->>'winReason' = 'forfeit' then
          if terminal_winner is distinct from (case when actor=host_id then guest_id else host_id end) then
            raise exception 'Only the actor may surrender' using errcode='42501';
          end if;
        end if;
        if (new_data->>'endReason' = 'DRAW_AGREEMENT' or new_data->>'winReason' = 'draw_agreement')
          and new_data->'boardState' is not distinct from old_data->'boardState' then
          offer_id := coalesce(old_data->>'drawOfferBy',case old_data->>'drawOfferFrom' when 'host' then host_id when 'guest' then guest_id end);
          if offer_id is null or offer_id=actor or terminal_winner not in ('draw','DRAW') then
            raise exception 'Invalid draw acceptance' using errcode='42501';
          end if;
        end if;
        if new_data->>'endReason' = 'TIMEOUT' or new_data->>'winReason' = 'timeout' then
          old_turn := case old_data->>'currentTurn' when 'host' then host_id when 'guest' then guest_id else old_data->>'currentTurn' end;
          if terminal_winner is distinct from actor or actor = old_turn or (old_data->>'turnDeadline')::numeric > extract(epoch from clock_timestamp()) * 1000 then
            raise exception 'Invalid timeout claim';
          end if;
        end if;
      end if;
      return;
    end if;
  end if;
  raise exception 'Write denied for %', p_path using errcode = '42501';
end
$$;

create function public.arcadex_commit(p_writes jsonb, p_reads jsonb default '[]') returns void
language plpgsql security definer set search_path = public, pg_temp as $$
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
      raise exception 'Concurrent modification, retry transaction' using errcode = '40001';
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
$$;

-- SECURITY DEFINER helpers must not become an alternate browser write API.
do $$ declare fn record; begin
  for fn in select p.oid::regprocedure as signature from pg_proc p join pg_namespace n on n.oid=p.pronamespace
    where n.nspname='public' and p.proname like 'arcadex_%' loop
    execute format('revoke execute on function %s from public, anon, authenticated', fn.signature);
  end loop;
end $$;
grant execute on function public.arcadex_bind_player(text),
  public.arcadex_read(text,text,jsonb,text,boolean,integer), public.arcadex_commit(jsonb,jsonb),
  public.arcadex_can_read(text,jsonb,uuid), public.arcadex_owns(text), public.arcadex_member(jsonb),
  public.arcadex_host(jsonb), public.arcadex_guest(jsonb) to authenticated;

-- Supabase Realtime uses the SELECT policy above; polling handles deletes/reconnects.
do $$ begin
  if exists (select 1 from pg_publication where pubname = 'supabase_realtime') then
    alter publication supabase_realtime add table public.arcadex_documents;
  end if;
end $$;
commit;
