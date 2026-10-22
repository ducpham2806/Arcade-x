-- Deployment template. Substitute only the project URL and legacy PUBLIC anon JWT.
-- The distinct 256-bit worker token is generated in worker.sql and never leaves Vault.
create extension if not exists pg_cron;
create extension if not exists pg_net with schema extensions;
do $$ begin
 if not exists(select 1 from vault.secrets where name='bs_room_project_url') then
  perform vault.create_secret('__BS_PROJECT_URL__','bs_room_project_url','Battleship API URL');
 end if;
 if not exists(select 1 from vault.secrets where name='bs_room_anon_jwt') then
  perform vault.create_secret('__BS_ANON_JWT__','bs_room_anon_jwt','Public anon JWT for Edge gateway; no worker privileges');
 end if;
 if not exists(select 1 from vault.secrets where name='bs_room_worker_token') then
  raise exception 'Install worker.sql before the scheduler';
 end if;
end $$;
select cron.schedule('battleship-room-timeouts','10 seconds',$job$
 select net.http_post(
 url := (select decrypted_secret from vault.decrypted_secrets where name='bs_room_project_url') || '/functions/v1/battleship-room',
 headers := jsonb_build_object('Content-Type','application/json',
 'Authorization','Bearer '||(select decrypted_secret from vault.decrypted_secrets where name='bs_room_anon_jwt'),
 'x-battleship-worker',(select decrypted_secret from vault.decrypted_secrets where name='bs_room_worker_token')),
 body := '{"type":"tick"}'::jsonb,timeout_milliseconds := 5000
 ) where exists(select 1 from public.bs_room_due((extract(epoch from clock_timestamp())*1000)::bigint));
$job$);
-- verify_jwt remains true. The public anon JWT only passes the gateway; the separate worker
-- token must match the private digest before any timeout can run. Browser users cannot call tick.
-- Observe cron history AND net response statuses. The job makes no HTTP request when nothing is due.
-- Pause: select cron.alter_job((select jobid from cron.job where jobname='battleship-room-timeouts'),active:=false);
