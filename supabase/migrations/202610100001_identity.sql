-- Apply after 202610090001_arcadex.sql. Existing progress is preserved.
begin;
create table public.arcadex_identities (
  owner_id uuid primary key references auth.users(id) on delete cascade,
  display_name text not null check (char_length(display_name) between 3 and 24),
  name_key text generated always as (lower(display_name)) stored unique,
  avatar text not null check (avatar in ('🎮','🐱','🦊','🤖','🚀','⚡')),
  updated_at timestamptz not null default now()
);
alter table public.arcadex_identities enable row level security;
revoke all on public.arcadex_identities from anon, authenticated;
create function public.arcadex_get_identity() returns jsonb
language sql stable security definer set search_path = public, pg_temp as $$
  select jsonb_build_object('display_name',display_name,'avatar',avatar)
  from public.arcadex_identities where owner_id = auth.uid()
$$;
create function public.arcadex_save_identity(p_display_name text, p_avatar text) returns jsonb
language plpgsql security definer set search_path = public, pg_temp as $$
declare clean_name text;
begin
  if auth.uid() is null or coalesce((auth.jwt()->>'is_anonymous')::boolean,false) then
    raise exception 'Đăng nhập bằng email để lưu hồ sơ.' using errcode = '42501';
  end if;
  clean_name := btrim(regexp_replace(normalize(p_display_name, NFKC), '[[:space:]]+', ' ', 'g'));
  if clean_name is null or char_length(clean_name) not between 3 and 24 or clean_name ~ '[[:cntrl:]]' then
    raise exception 'Tên hiển thị cần từ 3 đến 24 ký tự và không chứa ký tự điều khiển.' using errcode = '22023';
  end if;
  insert into public.arcadex_identities(owner_id,display_name,avatar)
    values(auth.uid(),clean_name,p_avatar)
    on conflict(owner_id) do update set display_name=excluded.display_name,avatar=excluded.avatar,updated_at=now();
  -- Canonical identity is also written into the existing player document.
  update public.arcadex_documents set data=data || jsonb_build_object('username',clean_name,'avatar',p_avatar),updated_at=now(),version=nextval('public.arcadex_document_version')
    where path='players/' || auth.uid()::text and owner_id=auth.uid();
  return public.arcadex_get_identity();
end
$$;
-- Prevent older clients/cloud snapshots from overriding a claimed name in player records.
create function public.arcadex_canonical_identity() returns trigger
language plpgsql security definer set search_path = public, pg_temp as $$
declare identity public.arcadex_identities;
begin
  if new.path ~ '^players/[^/]+$' then
    select * into identity from public.arcadex_identities where owner_id=new.owner_id and new.path='players/'||owner_id::text;
    if found then new.data := new.data || jsonb_build_object('username',identity.display_name,'avatar',identity.avatar); end if;
  end if;
  return new;
end
$$;
create trigger arcadex_identity_guard before insert or update on public.arcadex_documents for each row execute function public.arcadex_canonical_identity();
revoke all on function public.arcadex_get_identity(), public.arcadex_save_identity(text,text),public.arcadex_canonical_identity() from public, anon;
grant execute on function public.arcadex_get_identity(), public.arcadex_save_identity(text,text) to authenticated;
commit;
