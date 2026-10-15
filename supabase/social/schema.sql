-- Private storage; no direct Data API access. Only the checked RPC below is exposed.
create schema if not exists arcadex_social;
revoke all on schema arcadex_social from public, anon;
grant usage on schema arcadex_social to authenticated;
create table if not exists arcadex_social.relations (
 sender text not null, target text not null, status text not null check(status in ('pending','accepted','blocked')),
 updated_at timestamptz not null default now(), primary key(sender,target), check(sender<>target)
);
create index if not exists social_relation_target on arcadex_social.relations(target,status);
create table if not exists arcadex_social.messages (
 id uuid primary key default gen_random_uuid(), sender text not null, scope text not null, target text not null default '',
 text text not null check(length(text) between 1 and 1000), created_at timestamptz not null default now()
);
create index if not exists social_message_channel on arcadex_social.messages(scope,target,created_at desc);
create index if not exists social_message_sender on arcadex_social.messages(sender,created_at desc);
create table if not exists arcadex_social.profiles (
 player text primary key, bio text not null default '', favorite text not null default '', seen_at timestamptz not null default now()
);
alter table arcadex_social.relations enable row level security;
alter table arcadex_social.messages enable row level security;
alter table arcadex_social.profiles enable row level security;
revoke all on all tables in schema arcadex_social from public,anon,authenticated;

create or replace function arcadex_social.profile(p_id text) returns jsonb
language sql stable security definer set search_path='' as $$
 select jsonb_build_object('id',p_id,'username',left(coalesce(d.data->>'username','Người chơi'),80), 'avatar',coalesce(d.data->>'avatar','🎮'),
 'level',case when jsonb_typeof(d.data->'level')='number' then least(greatest((d.data->>'level')::numeric,1),1000000) else 1 end,
 'currentTitle',left(d.data->>'currentTitle',100),
 'stats',jsonb_build_object('totalGamesPlayed',case when jsonb_typeof(d.data#>'{stats,totalGamesPlayed}')='number' then d.data#>'{stats,totalGamesPlayed}' else '0'::jsonb end,
 'highScores',coalesce((select jsonb_object_agg(key,value) from jsonb_each(case when jsonb_typeof(d.data#>'{stats,highScores}')='object' then d.data#>'{stats,highScores}' else '{}'::jsonb end) where jsonb_typeof(value)='number'),'{}'::jsonb)),
 'bio',coalesce(s.bio,''),'favorite',coalesce(s.favorite,''),'online',coalesce(s.seen_at>now()-interval '2 minutes',false),'lastSeen',s.seen_at)
 from public.arcadex_documents d left join arcadex_social.profiles s on s.player=p_id where d.path='players/'||p_id
$$;
revoke all on function arcadex_social.profile(text) from public,anon,authenticated;

create or replace function arcadex_social.action(p_actor text,p_action text,p_target text,p_text text,p_scope text) returns jsonb
language plpgsql security definer set search_path='' as $$
declare result jsonb; channel text:=coalesce(p_scope,'global'); dest text:=coalesce(p_target,''); room jsonb;
begin
 if auth.uid() is null or not public.arcadex_owns(p_actor) then raise exception 'Không có quyền sử dụng hồ sơ này.' using errcode='42501'; end if;
 if p_action='heartbeat' then
  insert into arcadex_social.profiles(player) values(p_actor) on conflict(player) do update set seen_at=now(); return '{}'::jsonb;
 elsif p_action='profile_save' then
  if length(coalesce(p_text,''))>240 or length(dest)>80 then raise exception 'Thông tin hồ sơ quá dài.'; end if;
  insert into arcadex_social.profiles(player,bio,favorite) values(p_actor,coalesce(p_text,''),dest)
   on conflict(player) do update set bio=excluded.bio,favorite=excluded.favorite,seen_at=now();
  return coalesce(arcadex_social.profile(p_actor),'{}'::jsonb);
 elsif p_action='profile' then return coalesce(arcadex_social.profile(dest),'{}'::jsonb);
 elsif p_action='search' then
  if length(trim(coalesce(p_text,'')))<2 then return '[]'::jsonb; end if;
  select coalesce(jsonb_agg(arcadex_social.profile(id)),'[]'::jsonb) into result from (
   select substr(path,9) id from public.arcadex_documents where collection_path='players'
   and (strpos(lower(data->>'username'),lower(trim(p_text)))>0 or substr(path,9)=trim(p_text)) order by path limit 20) q;
  return result;
 elsif p_action='relations' then
  select coalesce(jsonb_agg(jsonb_build_object('sender',sender,'target',target,'status',status,'profile',arcadex_social.profile(case when sender=p_actor then target else sender end)) order by updated_at desc),'[]'::jsonb)
  into result from arcadex_social.relations where sender=p_actor or (target=p_actor and status<>'blocked'); return result;
 elsif p_action in ('request','accept','decline','remove','block','unblock') then
  if dest='' or dest=p_actor or not exists(select 1 from public.arcadex_player_bindings where player_id=dest) then raise exception 'Không tìm thấy người chơi.'; end if;
  perform pg_advisory_xact_lock(hashtextextended(least(p_actor,dest)||':'||greatest(p_actor,dest),0));
  if p_action='unblock' then delete from arcadex_social.relations where sender=p_actor and target=dest and status='blocked';
  elsif p_action='block' then
   delete from arcadex_social.relations where (sender=p_actor and target=dest) or (sender=dest and target=p_actor and status<>'blocked');
   insert into arcadex_social.relations(sender,target,status) values(p_actor,dest,'blocked') on conflict(sender,target) do update set status='blocked',updated_at=now();
  elsif p_action='decline' then delete from arcadex_social.relations where sender=dest and target=p_actor and status='pending';
  elsif p_action='remove' then delete from arcadex_social.relations where ((sender=p_actor and target=dest) or (sender=dest and target=p_actor)) and status<>'blocked';
  else
   if exists(select 1 from arcadex_social.relations where ((sender=p_actor and target=dest) or (sender=dest and target=p_actor)) and status='blocked') then raise exception 'Không thể liên hệ người chơi này.'; end if;
   if p_action='accept' then
    update arcadex_social.relations set status='accepted',updated_at=now() where sender=dest and target=p_actor and status='pending';
    if not found then raise exception 'Lời mời không còn hiệu lực.'; end if;
   elsif not exists(select 1 from arcadex_social.relations where (sender=p_actor and target=dest) or (sender=dest and target=p_actor)) then
    insert into arcadex_social.relations(sender,target,status) values(p_actor,dest,'pending');
   end if;
  end if; return '{}'::jsonb;
 elsif p_action='inbox' then
  select coalesce(jsonb_agg(jsonb_build_object('peer',peer,'profile',arcadex_social.profile(peer),'text',text,'created_at',created_at) order by created_at desc),'[]'::jsonb) into result from (
   select distinct on (case when sender=p_actor then target else sender end) case when sender=p_actor then target else sender end peer,text,created_at
   from arcadex_social.messages where scope='dm' and (sender=p_actor or target=p_actor)
   order by case when sender=p_actor then target else sender end,created_at desc) q;
  return result;
 elsif p_action in ('read','send') then
  if channel='dm' then
   if dest='' or dest=p_actor then raise exception 'Hãy chọn người nhận.'; end if;
   if p_action='send' and (not exists(select 1 from public.arcadex_player_bindings where player_id=dest) or exists(select 1 from arcadex_social.relations where ((sender=p_actor and target=dest) or (sender=dest and target=p_actor)) and status='blocked')) then raise exception 'Không thể gửi tin nhắn cho người này.'; end if;
  elsif channel='room' then
   select data into room from public.arcadex_documents where path='game_rooms/'||dest;
   if room is null or not (p_actor=public.arcadex_host(room) or p_actor=public.arcadex_guest(room)) then raise exception 'Chỉ người trong trận được chat.' using errcode='42501'; end if;
  elsif channel='global' then dest:='';
  elsif channel='game' then
   if dest='' or length(dest)>80 or dest!~'^[a-z0-9_-]+$' then raise exception 'Kênh game không hợp lệ.'; end if;
  else raise exception 'Kênh chat không hợp lệ.'; end if;
  if p_action='send' then
   if length(trim(coalesce(p_text,''))) not between 1 and 1000 then raise exception 'Tin nhắn cần từ 1 đến 1000 ký tự.'; end if;
   -- Serialize same-identity sends so parallel requests cannot evade the rate limit.
   perform pg_advisory_xact_lock(hashtextextended(auth.uid()::text,1));
   if (select count(*) from arcadex_social.messages where sender in (select player_id from public.arcadex_player_bindings where owner_id=auth.uid()) and created_at>now()-interval '10 seconds')>=8 then raise exception 'Bạn gửi quá nhanh. Hãy chờ vài giây.'; end if;
   insert into arcadex_social.messages(sender,scope,target,text) values(p_actor,channel,dest,trim(p_text));
   return '{}'::jsonb;
  end if;
  select coalesce(jsonb_agg(jsonb_build_object('id',id,'sender',sender,'profile',arcadex_social.profile(sender),'text',text,'created_at',created_at) order by created_at,id),'[]'::jsonb) into result from (
   select * from arcadex_social.messages m where scope=channel and
   ((channel='dm' and ((sender=p_actor and target=dest) or (sender=dest and target=p_actor))) or (channel<>'dm' and target=dest))
   and not exists(select 1 from arcadex_social.relations r where r.sender=p_actor and r.target=m.sender and r.status='blocked')
   order by created_at desc,id desc limit 100) q;
  return result;
 end if;
 raise exception 'Thao tác không hợp lệ.';
end $$;
revoke all on function arcadex_social.action(text,text,text,text,text) from public,anon;
grant execute on function arcadex_social.action(text,text,text,text,text) to authenticated;
create or replace function public.arcadex_social_action(p_actor text,p_action text,p_target text default '',p_text text default '',p_scope text default 'global') returns jsonb
language sql security invoker set search_path='' as $$ select arcadex_social.action(p_actor,p_action,p_target,p_text,p_scope) $$;
revoke all on function public.arcadex_social_action(text,text,text,text,text) from public,anon;
grant execute on function public.arcadex_social_action(text,text,text,text,text) to authenticated;
