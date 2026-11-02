-- Deployment template for the Nối Từ room scheduler (NOT APPLIED). Substitute the project URL and
-- store the service-role key in Vault on the database itself; it never appears in the repository
-- or the browser. Every 10 s, and only when wc_room_due() has rows, POST {"type":"tick"} to the
-- word-chain-room Edge Function, which settles ready/turn deadlines, auto-starts and absences.
create extension if not exists pg_cron;
create extension if not exists pg_net with schema extensions;
do $$ begin
 if not exists(select 1 from vault.secrets where name='wc_room_project_url') then
  perform vault.create_secret('__WC_PROJECT_URL__','wc_room_project_url','Nối Từ API URL');
 end if;
 if not exists(select 1 from vault.secrets where name='wc_room_service_key') then
  raise exception 'Create the wc_room_service_key Vault secret (service-role key) before the scheduler';
 end if;
end $$;
select cron.schedule('word-chain-room-timeouts','10 seconds',$job$
 select net.http_post(
  url := (select decrypted_secret from vault.decrypted_secrets where name='wc_room_project_url') || '/functions/v1/word-chain-room',
  headers := jsonb_build_object('Content-Type','application/json',
   'Authorization','Bearer '||(select decrypted_secret from vault.decrypted_secrets where name='wc_room_service_key')),
  body := '{"type":"tick"}'::jsonb, timeout_milliseconds := 5000
 ) where exists(select 1 from public.wc_room_due((extract(epoch from clock_timestamp())*1000)::bigint));
$job$);
-- Pause: select cron.alter_job((select jobid from cron.job where jobname='word-chain-room-timeouts'),active:=false);
