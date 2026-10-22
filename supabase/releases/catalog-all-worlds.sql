-- Apply when releasing against an existing launcher catalog.
-- Preserve existing access, maintenance and pricing decisions.
begin;
insert into public.launcher_games(id,engine_key,title,short_description,category,status,access_model,sort_order,featured,supports_offline,content_version)
values ('battleship','battleship','Battleship · Naval Warfare','Hải chiến · online 1vs1, 2vs2 và luyện tập với bot','Multiplayer','published','free',-2,true,true,1)
on conflict (id) do nothing;
update public.launcher_games set title='Neon Run · Luma',short_description='40 màn platformer · 5 thế giới và hành trình khôi phục Luma',content_version=greatest(content_version,14),featured=true,updated_at=now()
where id='neon-runner' and title in ('Neon Runner 2099','Neon Run · Luma');
commit;
