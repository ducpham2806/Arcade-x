-- ArcadeX Phase A supplementary upgrade.
-- Apply ONLY after the original eleven schema/seed migrations.
-- Re-runnable; no player data is deleted or rewritten.
-- Applied to whjatkhhupeqfngakmee on 2026-10-12.
begin;
-- Harden installed helper functions without changing data or RPC contracts.
alter function public.arcadex_update(jsonb,jsonb) set search_path=public,pg_temp;
alter function public.arcadex_merge(jsonb,jsonb) set search_path=public,pg_temp;
alter function public.arcadex_value(jsonb,jsonb) set search_path=public,pg_temp;
alter function public.arcadex_host(jsonb) set search_path=public,pg_temp;
alter function public.arcadex_guest(jsonb) set search_path=public,pg_temp;
revoke execute on function public.rls_auto_enable() from public,anon,authenticated;
-- Internal functions must not inherit direct browser EXECUTE from Supabase defaults.
revoke all on function public.arcadex_canonical_identity(),public.shikaku_daily_puzzle(date,integer) from public,anon,authenticated;
notify pgrst,'reload schema';
-- Supabase default ACLs grant roles directly; revoking PUBLIC alone is insufficient.
revoke all on function public.shikaku_start(integer,uuid),public.shikaku_hint(uuid,uuid,uuid),public.shikaku_submit(uuid,jsonb,uuid),public.shikaku_ranking(integer,boolean,date) from public,anon,authenticated;
grant execute on function public.shikaku_start(integer,uuid),public.shikaku_hint(uuid,uuid,uuid),public.shikaku_submit(uuid,jsonb,uuid) to authenticated;
grant execute on function public.shikaku_ranking(integer,boolean,date) to authenticated,anon;
-- Preserve data and owner access; cache Auth lookups per statement.
alter policy own_library on public.launcher_library using(owner_id=(select auth.uid()) and not coalesce(((select auth.jwt())->>'is_anonymous')::boolean,false));
alter policy own_sessions on public.launcher_sessions using(owner_id=(select auth.uid()) and not coalesce(((select auth.jwt())->>'is_anonymous')::boolean,false));
alter policy own_orders on public.launcher_orders using(owner_id=(select auth.uid()) and not coalesce(((select auth.jwt())->>'is_anonymous')::boolean,false));
alter policy own_entitlements on public.launcher_entitlements using(owner_id=(select auth.uid()) and not coalesce(((select auth.jwt())->>'is_anonymous')::boolean,false));
alter policy car_escape_owner on public.car_escape_runs using(owner_id=(select auth.uid()) and not coalesce(((select auth.jwt())->>'is_anonymous')::boolean,false));
alter policy word_cross_owner on public.word_cross_runs using(owner_id=(select auth.uid()) and not coalesce(((select auth.jwt())->>'is_anonymous')::boolean,false));
alter policy cosmic_owner_read on public.cosmic_runs using(owner_id=(select auth.uid()) and not coalesce(((select auth.jwt())->>'is_anonymous')::boolean,false));
create index if not exists car_escape_runs_campaign_fk on public.car_escape_runs(level,campaign_version);
create index if not exists launcher_entitlements_game_fk on public.launcher_entitlements(game_id);
create index if not exists launcher_library_game_fk on public.launcher_library(game_id);
create index if not exists launcher_orders_product_fk on public.launcher_orders(product_id);
create index if not exists launcher_payment_events_order_fk on public.launcher_payment_events(order_id);
create index if not exists launcher_product_games_game_fk on public.launcher_product_games(game_id);
create index if not exists launcher_sessions_game_fk on public.launcher_sessions(game_id);
create index if not exists word_cross_runs_pack_fk on public.word_cross_runs(pack_version);
notify pgrst,'reload schema';
commit;
