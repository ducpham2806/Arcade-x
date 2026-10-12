-- Visual update only; preserves campaign version 2 and all game saves.
begin;
update public.launcher_games
set short_description = '100 màn giải đố trên bãi xe 2D, xe đồ chơi và 3 sao',
    content_version = greatest(content_version, 3),
    updated_at = now()
where id = 'car-escape';
commit;
