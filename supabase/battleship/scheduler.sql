-- STAGED ONLY. Install on a development backend after schema.sql and the Edge function.
-- Provision Vault records bs_room_project_url and bs_room_service_jwt privately first.
-- The latter must be the project's server-only legacy service_role JWT, never a browser key.
-- No secrets or Vault decrypted values belong in Git, browser bundles or query output.
create extension if not exists pg_cron;
create extension if not exists pg_net with schema extensions;
do $$ begin
 if not exists(select 1 from vault.secrets where name='bs_room_project_url')
 or not exists(select 1 from vault.secrets where name='bs_room_service_jwt') then
 raise exception 'Provision Battleship scheduler Vault credentials before activation';
 end if;
end $$;
select cron.schedule('battleship-room-timeouts','10 seconds',$job$
 select net.http_post(
 url := (select decrypted_secret from vault.decrypted_secrets where name='bs_room_project_url') || '/functions/v1/battleship-room',
 headers := jsonb_build_object('Content-Type','application/json','Authorization','Bearer '||(select decrypted_secret from vault.decrypted_secrets where name='bs_room_service_jwt')),
 body := '{"type":"tick"}'::jsonb,timeout_milliseconds := 5000
 ) where exists(select 1 from public.bs_room_due((extract(epoch from clock_timestamp())*1000)::bigint));
$job$);
-- verify_jwt MUST remain true on battleship-room. Tick also checks the exact service credential.
-- Watch cron history + net HTTP response statuses. Never treat a scheduled request as proof of success.
-- Pause without deleting history: select cron.alter_job((select jobid from cron.job where jobname='battleship-room-timeouts'),active:=false);
