-- Additive worker authentication. The random worker credential stays encrypted in Vault.
create table if not exists battleship_private.worker_auth (
 singleton boolean primary key default true check(singleton),token_hash bytea not null
);
alter table battleship_private.worker_auth enable row level security;
revoke all on battleship_private.worker_auth from public,anon,authenticated;
grant select on battleship_private.worker_auth to service_role;
create or replace function public.bs_room_worker(p_token text) returns boolean
language sql security invoker set search_path='' as $$
 select exists(select 1 from battleship_private.worker_auth where token_hash=sha256(convert_to(p_token,'UTF8')) and length(p_token)=64);
$$;
revoke all on function public.bs_room_worker(text) from public,anon,authenticated;
grant execute on function public.bs_room_worker(text) to service_role;
-- Vault bootstrap is deployment-only and must be run as the migration owner.
do $$ declare token text; begin
 if not exists(select 1 from vault.secrets where name='bs_room_worker_token') then
  token:=encode(extensions.gen_random_bytes(32),'hex');
  perform vault.create_secret(token,'bs_room_worker_token','Battleship timeout worker only');
 else
  select decrypted_secret into token from vault.decrypted_secrets where name='bs_room_worker_token';
 end if;
 insert into battleship_private.worker_auth(singleton,token_hash) values(true,sha256(convert_to(token,'UTF8')))
 on conflict(singleton) do update set token_hash=excluded.token_hash;
end $$;
