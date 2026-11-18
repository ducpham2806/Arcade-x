-- Apply only after the Folk schema and Edge Function are available in the intended environment.
-- The tick-only credential stays in Vault. The Edge Function receives only its hash via RPC.
do $$
begin
  if not exists (select 1 from vault.secrets where name = 'folk_room_tick_token') then
    perform vault.create_secret(replace(gen_random_uuid()::text || gen_random_uuid()::text, '-', ''), 'folk_room_tick_token');
  end if;
end $$;

insert into folk_duel.scheduler_auth (singleton, token_hash)
select true, encode(sha256(convert_to(decrypted_secret, 'UTF8')), 'hex')
from vault.decrypted_secrets where name = 'folk_room_tick_token'
on conflict (singleton) do update set token_hash = excluded.token_hash;

-- Derive the project URL from the existing environment secret instead of recording a credential.
select cron.schedule('folk-duel-room-timeouts', '10 seconds', $job$
  select net.http_post(
    url := (select decrypted_secret from vault.decrypted_secrets where name = 'wc_room_project_url') || '/functions/v1/folk-duel-room',
    headers := jsonb_build_object('Content-Type', 'application/json',
      'Authorization', 'Bearer ' || (select decrypted_secret from vault.decrypted_secrets where name = 'folk_room_tick_token')),
    body := '{"type":"tick"}'::jsonb,
    timeout_milliseconds := 5000
  );
$job$);
