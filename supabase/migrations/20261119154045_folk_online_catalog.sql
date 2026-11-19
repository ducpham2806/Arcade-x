alter table public.launcher_games
  add column folk_online_enabled boolean not null default false,
  add constraint launcher_games_folk_online_id
    check (not folk_online_enabled or id in ('o-an-quan', 'nhay-lo-co'));
