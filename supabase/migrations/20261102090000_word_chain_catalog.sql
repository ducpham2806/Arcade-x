-- Nối Từ Đối Kháng (word-chain): add the game to the launcher catalog. Practice with bots works
-- offline; online rooms stay off until the word-chain-room Edge Function is deployed (see
-- docs/WORD-CHAIN-SERVER.md). Not applied to production by this repository; the owner applies it.
insert into public.launcher_games(id,engine_key,title,category,short_description,status,sort_order,featured) values
('word-chain','word-chain','Nối Từ Đối Kháng','Multiplayer','Đấu trí nối từ tiếng Việt 2–4 người, ai bí từ hay hết giờ thì bị loại','published',23,true)
on conflict (id) do nothing;
