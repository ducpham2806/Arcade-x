# ArcadeX · 2.12.x

Launcher mini-game dạng PWA (React 19 + Vite + Supabase) với 22 game, chơi được offline và đồng bộ tài khoản. Quy tắc giao diện và trải nghiệm trong game nằm ở `AGENTS.md`.

## Chạy và build

Dùng Node.js 24 (`.nvmrc`).

```bash
npm ci
npm run dev        # http://localhost:3000
npm run lint       # tsc --noEmit
npm run build      # dist/
```

Muốn kết nối backend riêng: sao chép `.env.example` thành `.env.local`, điền URL và publishable key của project Supabase. Không dùng mật khẩu database hoặc service-role key trong frontend. Các flag `VITE_*` của commerce mặc định tắt. SQL migrations và Edge Functions trong `supabase/` là backend đã triển khai, giữ để tham khảo hoặc cài mới; không chạy lại migrations lên project đang dùng.

Netlify build bằng `npm run build`; deploy preview chạy thêm `lint` và `build:snake-preview`. Cấu hình Vercel nằm ở `vercel.json`.

## Cấu trúc

| Thư mục | Nội dung |
|---|---|
| `src/App.tsx`, `src/launcher/` | Khung launcher, thư viện game, carousel |
| `src/context/` | `GameContext` (chia slice: `useGameSession`, `useLauncherUi`, `useLibrary`, `useAudioSettings`, `useProgression`, `useSocial`), `PlayerContext`, `InventoryContext`, `AuthContext` |
| `src/services/storage/` | `StorageService` (localStorage) chia theo domain, dữ liệu mặc định trong `catalog/` |
| `src/services/supabase/` | `SupabaseService`: chat, đồng bộ cloud, bảng xếp hạng, bạn bè |
| `src/games/` | Mỗi game một thư mục; `registry.ts` đăng ký, `gamePackages.tsx` tải gói theo nhu cầu, `packageAssets.json` liệt kê asset từng gói |
| `src/games/duel/` | AI cờ, và trọng tài + phòng đấu phía server cho Chess/Xiangqi/Caro (chưa deploy, xem `docs/DUEL-SERVER.md`) |
| `src/commerce/`, `server/commerce/`, `shared/` | Thuê game, thanh toán, duyệt admin (đang tắt bằng flag) |
| `supabase/` | Migrations, Edge Functions (`battleship-room`, `cosmic-verify`, `duel-room` chưa deploy), SQL Battleship, duel và mạng xã hội |
| `public/` | Asset tĩnh: art launcher, asset game, từ điển Word Cross (`games/word-cross/lexicon.v1.json`) |
| `standalone/` | Game build sẵn nhúng vào launcher (Chronicles Realms) |
| `preview/` | Bản preview riêng (Snake Legend, gallery Dungeon) |
| `art/` | Art nguồn: `launcher/`, `dungeon-titan/source-v5\|v6`, `block-breaker/boss-v6` |
| `review/` | Trang duyệt tĩnh: gallery art toàn bộ game, `demos/` (blocker, chess, mummy-escape) |
| `scripts/`, `tests/`, `docs/` | Công cụ build/export, kiểm thử, tài liệu thiết kế từng game |

Cosmic Defend giữ các engine `legacy-*` có chủ đích: engine hiện tại xây trên chúng và `cosmic-verify` vẫn replay vé phiên bản cũ.

## Kiểm thử

CI (`.github/workflows/ci.yml`) chạy trên mọi PR: `lint` → `build` → `test:bundle` → `test:fast` → `test:perf` → `test:smoke` → `test:games` → `test:offline` → `test:modals`, rồi kiểm tra không còn file sinh ra bị bỏ lại.

| Lệnh | Phạm vi |
|---|---|
| `npm run test:fast` | Các bộ không cần trình duyệt hay Docker: readability, tương thích save (`test:storage`), engine 8 game (`test:engines`), duel AI và duel server (`test:duel-server`), sync, commerce, subscriptions, battleship, social, artwork, cosmic, startup/PWA, boom, eat, dungeon, full-release |
| `npm run test:smoke` | Luồng launcher trên bản build: yêu thích, chi tiết game, âm thanh, chat, vào/thoát game, Word Cross |
| `npm run test:games` | Mở cả 22 game, chạm/nhấn phím vài giây, không lỗi JS, thoát về thư viện |
| `npm run test:offline` | Tắt mạng sau khi service worker precache: tải lại, mở modal, chơi game đã cache |
| `npm run test:modals` | Khung modal theo `AGENTS.md` ở điện thoại/tablet/desktop, không đổi kích thước khi chuyển tab; cấm bottom sheet ngắn trong mã nguồn |
| `npm run test:perf` | Launcher đứng yên không vượt 20 lượt render/giây |
| `npm run test:bundle` | Không chunk nào > 500 kB, JS tải đầu ≤ 400 kB gzip |
| `npm run analyze:bundle`, `npm run perf:first-load` | Báo cáo bundle và dung lượng lần tải đầu |
| `npm run test:supabase` | SQL fixtures; cần Docker, chạy trên database test riêng, không kết nối production |

`test:perf`, `test:smoke`, `test:offline` cần `npm run build` trước và Chromium (`npx playwright install chromium`, hoặc đặt `CHROMIUM_EXECUTABLE`). Một số bộ Playwright cũ (`tests/launcher`, `tests/auth/entry`, `tests/blossom/launcher`) đang lệch so với giao diện hiện tại và fail cả trên bản gốc 2.12.2.

`tests/storage/*-golden.json` ghi lại hành vi của `StorageService` và `SupabaseService`; chỉ cập nhật bằng `--update` khi cố ý đổi hành vi lưu trữ.

## Bản duyệt và file sinh ra

- `npm run preview:blossom`, `preview:rainbow`, `preview:launcher`, `preview:eat`, `preview:battleship`: bản duyệt từng phần.
- `npm run export:dungeon-review`: sinh `dungeon-titan-equipment-v6-3-playtest.html` một file, chạy offline (không lưu trong git).
- `blossom-review.html`, `eat-review.html` ở thư mục gốc là trang entry cho dev server (`/blossom-review.html`).

## Lịch sử

Ghi chú phát hành 2.12.0 ở `docs/RELEASE-2.12.0.md`, kèm mã SHA-256 các file nguồn lúc đó trong `docs/RELEASE-2.12.0-SOURCE-MANIFEST.json`. Các đường dẫn đã dọn trong lần đóng gói trước nằm ở `docs/CLEANUP.json`.
