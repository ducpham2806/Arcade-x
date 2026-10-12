-- Launcher upgrade: run ONCE after existing base migrations.
-- Generated from 202610110001 + 202610110002; commerce remains disabled.
begin;
-- Additive launcher and future commerce schema. Existing profiles/game saves stay intact.

create table public.launcher_games (
 id text primary key check(id ~ '^[a-z0-9][a-z0-9-]{1,63}$'),
 engine_key text not null,
 title text not null check(char_length(title) between 1 and 100),
 short_description text not null default '',
 category text not null default 'Arcade' check(category in ('Arcade','Puzzle','Action','Reflex','Multiplayer')),
 status text not null default 'draft' check(status in ('draft','published','maintenance','retired')),
 access_model text not null default 'free' check(access_model in ('free','premium')),
 sort_order integer not null default 100,
 featured boolean not null default false,
 supports_offline boolean not null default true,
 content_version integer not null default 1 check(content_version > 0),
 updated_at timestamptz not null default now()
);
create table public.launcher_settings (
 id boolean primary key default true check(id),
 commerce_enabled boolean not null default false,
 donation_enabled boolean not null default false,
 bank_name text, bank_account text, bank_beneficiary text,
 support_message text not null default 'Cảm ơn bạn đã ủng hộ ArcadeX.',
 check(not donation_enabled or (nullif(bank_name,'') is not null and nullif(bank_account,'') is not null and nullif(bank_beneficiary,'') is not null))
);
insert into public.launcher_settings(id) values(true);
create table public.launcher_library (
 owner_id uuid not null references auth.users(id) on delete cascade,
 game_id text not null references public.launcher_games(id),
 favorite boolean not null default false,
 last_played_at timestamptz,
 updated_at timestamptz not null default now(),
 primary key(owner_id,game_id)
);
create table public.launcher_sessions (
 id uuid primary key,
 owner_id uuid not null references auth.users(id) on delete cascade,
 game_id text not null references public.launcher_games(id),
 started_at timestamptz not null default now(),
 ended_at timestamptz,
 outcome text not null default 'playing' check(outcome in ('playing','completed','left')),
 reported_score bigint check(reported_score between 0 and 1000000000000),
 check(ended_at is null or ended_at >= started_at)
);
create index launcher_sessions_owner_started on public.launcher_sessions(owner_id,started_at desc);
create table public.launcher_products (
 id text primary key,
 title text not null,
 kind text not null check(kind in ('game','subscription','donation')),
 amount_minor bigint not null check(amount_minor > 0),
 currency text not null default 'VND' check(currency ~ '^[A-Z]{3}$'),
 active boolean not null default false,
 all_games boolean not null default false,
 duration_days integer,
 check((kind='subscription' and duration_days is not null and duration_days between 1 and 366 and all_games) or (kind<>'subscription' and duration_days is null and not all_games))
);
create table public.launcher_product_games (
 product_id text not null references public.launcher_products(id),
 game_id text not null references public.launcher_games(id),
 primary key(product_id,game_id)
);
create table public.launcher_orders (
 id uuid primary key default gen_random_uuid(),
 owner_id uuid not null references auth.users(id),
 product_id text not null references public.launcher_products(id),
 kind text not null check(kind in ('game','subscription','donation')),
 amount_minor bigint not null check(amount_minor>0),
 currency text not null,
 game_ids text[] not null,
 all_games boolean not null,
 duration_days integer,
 status text not null default 'pending' check(status in ('pending','paid','refunded','cancelled')),
 created_at timestamptz not null default now(), paid_at timestamptz
);
create index launcher_orders_owner on public.launcher_orders(owner_id,created_at desc);
create table public.launcher_payment_events (
 provider text not null, event_id text not null,
 order_id uuid not null references public.launcher_orders(id),
 status text not null check(status in ('paid','refunded')),
 amount_minor bigint not null, currency text not null,
 received_at timestamptz not null default now(), primary key(provider,event_id)
);
create table public.launcher_entitlements (
 id uuid primary key default gen_random_uuid(),
 owner_id uuid not null references auth.users(id),
 order_id uuid not null references public.launcher_orders(id),
 game_id text references public.launcher_games(id),
 all_games boolean not null default false,
 starts_at timestamptz not null default now(), expires_at timestamptz, revoked_at timestamptz,
 check((all_games and game_id is null and expires_at is not null) or (not all_games and game_id is not null)),
 check(expires_at is null or expires_at>starts_at)
);
create unique index launcher_entitlement_order_game on public.launcher_entitlements(order_id,coalesce(game_id,'*'));
create index launcher_entitlements_owner on public.launcher_entitlements(owner_id);

-- No browser can directly mutate catalog, prices, orders, events or entitlements.
do $$declare t text; begin
 foreach t in array array['launcher_games','launcher_settings','launcher_library','launcher_sessions','launcher_products','launcher_product_games','launcher_orders','launcher_payment_events','launcher_entitlements'] loop
  execute format('alter table public.%I enable row level security',t);
  execute format('revoke all on public.%I from public,anon,authenticated',t);
 end loop;
end$$;
grant select on public.launcher_library,public.launcher_sessions,public.launcher_orders,public.launcher_entitlements to authenticated;
create policy own_library on public.launcher_library for select to authenticated using(owner_id=auth.uid());
create policy own_sessions on public.launcher_sessions for select to authenticated using(owner_id=auth.uid());
create policy own_orders on public.launcher_orders for select to authenticated using(owner_id=auth.uid());
create policy own_entitlements on public.launcher_entitlements for select to authenticated using(owner_id=auth.uid());

create function public.launcher_catalog() returns jsonb language sql stable security definer set search_path=public,pg_temp as $$
 select jsonb_build_object('schemaVersion',1,'games',coalesce((select jsonb_agg(to_jsonb(g) order by g.sort_order,g.id) from public.launcher_games g where status<>'draft'),'[]'::jsonb),
 'commerceEnabled',s.commerce_enabled,'support',jsonb_build_object('enabled',s.donation_enabled,'message',s.support_message,
 'bankName',case when s.donation_enabled then s.bank_name end,'account',case when s.donation_enabled then s.bank_account end,'beneficiary',case when s.donation_enabled then s.bank_beneficiary end)) from public.launcher_settings s where id
$$;
create function public.launcher_check_access(p_game_id text) returns jsonb language plpgsql stable security definer set search_path=public,pg_temp as $$
declare g public.launcher_games; allowed boolean;
begin
 select * into g from public.launcher_games where id=p_game_id;
 if not found or g.status<>'published' then return jsonb_build_object('allowed',false,'reason','unavailable'); end if;
 if g.access_model='free' then return jsonb_build_object('allowed',true,'reason','free'); end if;
 if auth.uid() is null or coalesce((auth.jwt()->>'is_anonymous')::boolean,false) then return jsonb_build_object('allowed',false,'reason','sign_in'); end if;
 select exists(select 1 from public.launcher_entitlements e where e.owner_id=auth.uid() and (e.game_id=g.id or e.all_games) and e.revoked_at is null and e.starts_at<=now() and (e.expires_at is null or e.expires_at>now())) into allowed;
 return jsonb_build_object('allowed',allowed,'reason',case when allowed then 'owned' else 'locked' end);
end$$;
create function public.launcher_library_state(p_expected_owner uuid default null) returns jsonb language plpgsql stable security definer set search_path=public,pg_temp as $$
begin
 if p_expected_owner is not null and p_expected_owner is distinct from auth.uid() then raise exception 'Account changed' using errcode='42501'; end if;
 if auth.uid() is null or coalesce((auth.jwt()->>'is_anonymous')::boolean,false) then raise exception 'Sign in required' using errcode='42501'; end if;
 return coalesce((select jsonb_agg(to_jsonb(l)) from public.launcher_library l where owner_id=auth.uid()),'[]'::jsonb);
end$$;
create function public.launcher_set_favorite(p_game_id text,p_favorite boolean,p_expected_owner uuid default null) returns void language plpgsql security definer set search_path=public,pg_temp as $$
begin
 if p_expected_owner is not null and p_expected_owner is distinct from auth.uid() then raise exception 'Account changed' using errcode='42501'; end if;
 if auth.uid() is null or coalesce((auth.jwt()->>'is_anonymous')::boolean,false) then raise exception 'Sign in required' using errcode='42501'; end if;
 insert into public.launcher_library(owner_id,game_id,favorite) values(auth.uid(),p_game_id,p_favorite)
 on conflict(owner_id,game_id) do update set favorite=excluded.favorite,updated_at=now();
end$$;
create function public.launcher_session_start(p_game_id text,p_session_id uuid,p_expected_owner uuid default null) returns void language plpgsql security definer set search_path=public,pg_temp as $$
begin
 if p_expected_owner is not null and p_expected_owner is distinct from auth.uid() then raise exception 'Account changed' using errcode='42501'; end if;
 if auth.uid() is null or coalesce((auth.jwt()->>'is_anonymous')::boolean,false) then raise exception 'Sign in required' using errcode='42501'; end if;
 if not (public.launcher_check_access(p_game_id)->>'allowed')::boolean then raise exception 'Game access denied' using errcode='42501'; end if;
 insert into public.launcher_sessions(id,owner_id,game_id) values(p_session_id,auth.uid(),p_game_id) on conflict(id) do nothing;
 if not exists(select 1 from public.launcher_sessions where id=p_session_id and owner_id=auth.uid() and game_id=p_game_id) then raise exception 'Session owner mismatch' using errcode='42501'; end if;
 insert into public.launcher_library(owner_id,game_id,last_played_at) values(auth.uid(),p_game_id,now())
 on conflict(owner_id,game_id) do update set last_played_at=now(),updated_at=now();
end$$;
create function public.launcher_session_finish(p_session_id uuid,p_outcome text,p_score bigint default null,p_expected_owner uuid default null) returns void language plpgsql security definer set search_path=public,pg_temp as $$
begin
 if p_expected_owner is not null and p_expected_owner is distinct from auth.uid() then raise exception 'Account changed' using errcode='42501'; end if;
 if auth.uid() is null or coalesce((auth.jwt()->>'is_anonymous')::boolean,false) then raise exception 'Sign in required' using errcode='42501'; end if;
 if p_outcome not in ('completed','left') then raise exception 'Invalid outcome' using errcode='22023'; end if;
 update public.launcher_sessions set ended_at=now(),outcome=p_outcome,reported_score=p_score where id=p_session_id and owner_id=auth.uid() and ended_at is null;
end$$;
create function public.launcher_create_order(p_product_id text) returns uuid language plpgsql security definer set search_path=public,pg_temp as $$
declare p public.launcher_products; new_id uuid; games text[];
begin
 if auth.uid() is null or coalesce((auth.jwt()->>'is_anonymous')::boolean,false) then raise exception 'Sign in required' using errcode='42501'; end if;
 if not (select commerce_enabled from public.launcher_settings where id) then raise exception 'Payments are not enabled' using errcode='42501'; end if;
 select * into p from public.launcher_products where id=p_product_id and active;
 if not found then raise exception 'Product unavailable' using errcode='22023'; end if;
 select coalesce(array_agg(game_id),'{}'::text[]) into games from public.launcher_product_games where product_id=p.id;
 if p.kind='game' and cardinality(games)=0 then raise exception 'Empty game product' using errcode='22023'; end if;
 insert into public.launcher_orders(owner_id,product_id,kind,amount_minor,currency,game_ids,all_games,duration_days)
 values(auth.uid(),p.id,p.kind,p.amount_minor,p.currency,games,p.all_games,p.duration_days) returning id into new_id;
 return new_id;
end$$;
-- Trusted payment adapter only, AFTER verifying provider signature and settled amount.
-- Renewals use a new order. Donations never create entitlements. No automatic bank polling here.
create function public.launcher_record_payment(p_provider text,p_event_id text,p_order_id uuid,p_amount_minor bigint,p_currency text,p_status text) returns void language plpgsql security definer set search_path=public,pg_temp as $$
declare o public.launcher_orders; e public.launcher_payment_events; end_at timestamptz;
begin
 if nullif(p_provider,'') is null or nullif(p_event_id,'') is null or p_status not in ('paid','refunded') then raise exception 'Invalid payment event' using errcode='22023'; end if;
 -- Serialize same event and same owner so duplicate deliveries and subscription renewals are safe.
 perform pg_advisory_xact_lock(hashtextextended(p_provider||':'||p_event_id,0));
 select * into o from public.launcher_orders where id=p_order_id for update;
 if not found then raise exception 'Order not found' using errcode='22023'; end if;
 if p_amount_minor is distinct from o.amount_minor or p_currency is distinct from o.currency then raise exception 'Payment amount/currency mismatch' using errcode='22023'; end if;
 select * into e from public.launcher_payment_events where provider=p_provider and event_id=p_event_id;
 if found then
  if e.order_id<>o.id or e.status<>p_status or e.amount_minor<>p_amount_minor or e.currency<>p_currency then raise exception 'Event collision' using errcode='22023'; end if;
  return;
 end if;
 if p_status='paid' and o.status not in ('pending','paid') then raise exception 'Invalid order transition' using errcode='22023'; end if;
 if p_status='refunded' and o.status not in ('paid','refunded') then raise exception 'Invalid refund transition' using errcode='22023'; end if;
 insert into public.launcher_payment_events(provider,event_id,order_id,status,amount_minor,currency) values(p_provider,p_event_id,o.id,p_status,p_amount_minor,p_currency);
 if p_status='refunded' then
  update public.launcher_orders set status='refunded' where id=o.id;
  update public.launcher_entitlements set revoked_at=now() where order_id=o.id;
 elsif o.status='pending' then
  update public.launcher_orders set status='paid',paid_at=now() where id=o.id;
  if o.kind='game' then
   insert into public.launcher_entitlements(owner_id,order_id,game_id) select o.owner_id,o.id,unnest(o.game_ids);
  elsif o.kind='subscription' then
   perform pg_advisory_xact_lock(hashtextextended(o.owner_id::text,1));
   select greatest(now(),coalesce(max(expires_at),now())) into end_at from public.launcher_entitlements where owner_id=o.owner_id and all_games and revoked_at is null;
   insert into public.launcher_entitlements(owner_id,order_id,all_games,starts_at,expires_at) values(o.owner_id,o.id,true,end_at,end_at+make_interval(days=>o.duration_days));
  end if;
 end if;
end$$;
revoke all on function public.launcher_catalog(),public.launcher_check_access(text),public.launcher_library_state(uuid),public.launcher_set_favorite(text,boolean,uuid),public.launcher_session_start(text,uuid,uuid),public.launcher_session_finish(uuid,text,bigint,uuid),public.launcher_create_order(text),public.launcher_record_payment(text,text,uuid,bigint,text,text) from public,anon,authenticated;
grant execute on function public.launcher_catalog(),public.launcher_check_access(text) to anon,authenticated;
grant execute on function public.launcher_library_state(uuid),public.launcher_set_favorite(text,boolean,uuid),public.launcher_session_start(text,uuid,uuid),public.launcher_session_finish(uuid,text,bigint,uuid),public.launcher_create_order(text) to authenticated;
do $$begin if exists(select 1 from pg_roles where rolname='service_role') then grant execute on function public.launcher_record_payment(text,text,uuid,bigint,text,text) to service_role; end if; end$$;

-- Initial catalog only; future availability and merchandising are managed in Supabase.
insert into public.launcher_games(id,engine_key,title,category,short_description,status,sort_order,featured) values
('word-cross','word-cross','Word Cross','Arcade','Nối chữ tìm từ vựng tiếng Anh, thử thách Daily Puzzle toàn cầu','published',0,false),
('car-escape','car-escape','Car Escape','Puzzle','Giải đố kẹt xe đỉnh cao, di chuyển xe để mở đường cho xe cứu thương thoát hiểm.','published',1,true),
('dungeon-tap','dungeon-tap','Dungeon Titan','Action','Nhập vai RPG chém boss khổng lồ, săn đồ & chiêu mộ đồng đội','published',2,false),
('mummy-escape','mummy-escape','Mummy Escape','Puzzle','Game giải đố chiến thuật vượt ngục Kim Tự Tháp Pharaoh kinh điển theo lượt','published',3,false),
('shikaku','shikaku','Shikaku','Puzzle','Vẽ các hình chữ nhật để lấp đầy bảng theo số ô cho sẵn','published',4,false),
('eat-em-all','eat-em-all','Eat ''Em All - Nuốt Chửng Nguyên Tố','Arcade','Điều khiển nhân vật hứng nuốt các item rơi, chuyển đổi Băng/Lửa và bão cuồng nộ Fury x10','published',5,false),
('scoodoku','scoodoku','Scoodoku','Puzzle','Game Sudoku đa cấp độ từ ô vuông 3x3 đến ma trận IQ 180 bậc thang','published',6,false),
('fill-the-space','fill-the-space','Lấp Đầy Khoảng Trống','Puzzle','Xếp các khối gỗ 3D lấp đầy khuôn rỗng chạm khắc trên mặt bàn','published',7,false),
('blocker','blocker','Xếp Gạch','Puzzle','Xếp gạch, phá hàng ngang dọc và ghi điểm','published',8,true),
('chess','chess','Cờ Vua Quốc Tế','Multiplayer','Đấu trí Cờ Vua đỉnh cao, ghép trận PvP thời gian thực, chế độ AI Đại Kiện Tướng và xếp hạng ELO','published',9,false),
('xiangqi','xiangqi','Cờ Tướng Online','Multiplayer','Đấu trí Cờ Tướng đối kháng trực tuyến thời gian thực, xếp hạng ELO và tạo phòng 6 số','published',10,false),
('caro-gomoku','caro-gomoku','Cờ Caro Gomoku Online','Multiplayer','Đấu trí 15x15 nhiều người chơi, ghép trận PvP thời gian thực và xếp hạng ELO','published',11,false),
('neon-runner','neon-runner','Neon Runner 2099','Arcade','Game chạy vô tận Cyberpunk tốc độ cao né bẫy nhặt ngọc','published',12,false),
('cosmic-defense','cosmic-defense','Cosmic Defense','Action','Bắn ruồi không gian retro và tiêu diệt hạm đội Boss','published',13,false),
('cyber-slice','cyber-slice','Cyber Blade Slice','Reflex','Chém quả cầu năng lượng tốc độ cao tránh bom tử thần','published',14,false),
('hex-match','hex-match','Hex Collapse Puzzle','Puzzle','Xếp hình tổ ong ghép màu nổ dây chuyền','published',15,false),
('tile-2048','tile-2048','Xếp Gạch 2048','Puzzle','Vuốt ghép các ô số, chinh phục mốc 2048','published',16,true),
('draw-a-shape','draw-a-shape','Draw A Shape','Puzzle','Nối các điểm màu và lấp đầy bảng.','published',17,false)
on conflict(id) do nothing;

commit;
