-- Staging template; substitute only the public project URL. Requires schema.sql.
-- The tick-only token is generated/stored inside Vault; no service-role key is copied.
-- The Edge handler verifies registered-user JWTs with Auth, or this token through
-- a service-only hash RPC. Deploy with handler-managed authentication (verify_jwt=false).
create extension if not exists pg_cron;
create extension if not exists pg_net with schema extensions;
do $$ begin
 if not exists(select 1 from vault.secrets where name='wc_room_project_url') then
  perform vault.create_secret('__WC_PROJECT_URL__','wc_room_project_url','Nối Từ API URL');
 end if;
 if not exists(select 1 from vault.secrets where name='wc_room_tick_token') then
  perform vault.create_secret(encode(extensions.gen_random_bytes(32),'hex'),'wc_room_tick_token','Nối Từ tick only');
 end if;
 insert into wc_private.scheduler_auth(singleton,token_hash)
 select true,encode(extensions.digest(decrypted_secret,'sha256'),'hex')
 from vault.decrypted_secrets where name='wc_room_tick_token'
 on conflict(singleton) do update set token_hash=excluded.token_hash;
end $$;
select cron.schedule('word-chain-room-timeouts','10 seconds',$job$
 select net.http_post(
  url := (select decrypted_secret from vault.decrypted_secrets where name='wc_room_project_url') || '/functions/v1/word-chain-room',
  headers := jsonb_build_object('Content-Type','application/json',
   'Authorization','Bearer '||(select decrypted_secret from vault.decrypted_secrets where name='wc_room_tick_token')),
  body := '{"type":"tick"}'::jsonb, timeout_milliseconds := 5000
 ) where exists(select 1 from public.wc_room_due((extract(epoch from clock_timestamp())*1000)::bigint));
$job$);
-- Pause: select cron.alter_job((select jobid from cron.job where jobname='word-chain-room-timeouts'),active:=false);
