# Kiểm thử và bản duyệt

Cập nhật chỉ mục ngày 06/11/2026; tách từ README ngày 04/11/2026; lệnh hiện hành tra `package.json`, thứ tự CI tra `.github/workflows/ci.yml`. Cần Node 24. Chỉ đọc mục phù hợp thay đổi.

## Kiểm thử

CI (`.github/workflows/ci.yml`) là nguồn thứ tự chính xác: cài dependency root + hai room server → lint → build → bundle → fast → Tank WS/ops → Chromium → perf/smoke/all-games → motion/VFX → Neon/offline/modal → Blossom/Battleship/Nối Từ/Tank UI → kiểm working tree sạch. Không dùng danh sách rút gọn này thay workflow.

Tài liệu/Studio: `python3 scripts/check-docs.py` kiểm link, budget, Markdown entrypoints, nhật ký và snapshot nguồn; `npm run test:claude` kiểm adapter cũ. Đổi prose/thư viện chưa dùng không phải thay gameplay; chỉ chạy full game CI khi phạm vi cần. Kết quả gameplay trước đợt docs không được tính thành nghiệm thu mới.

| Lệnh | Phạm vi |
|---|---|
| `npm run test:fast` | Các bộ không cần trình duyệt hay Docker: readability, cấu trúc agent/skill (`test:claude`), tương thích save (`test:storage`), engine 8 game (`test:engines`), engine Blossom Blast (`test:blossom-engine`), duel AI và duel server (`test:duel-server`), Nối Từ (`test:word-chain`: luật, từ điển, bot, máy chủ phòng, schema PGlite, Edge Function), sync, commerce, subscriptions, battleship, social, artwork, cosmic, startup/PWA, boom, eat, dungeon, full-release |
| `npm run test:smoke` | Luồng launcher trên bản build: yêu thích, chi tiết game, âm thanh, chat, vào/thoát game, Word Cross |
| `npm run test:games` | Mở cả 24 game, chạm/nhấn phím vài giây, không lỗi JS, thoát về thư viện |
| `npm run test:offline` | Tắt mạng sau khi service worker precache: tải lại, mở modal, chơi game đã cache |
| `npm run test:modals` | Khung modal theo `AGENTS.md` ở điện thoại/tablet/desktop, không đổi kích thước khi chuyển tab; cấm bottom sheet ngắn trong mã nguồn |
| `npm run test:blossom-ui` | Blossom Blast trên dev server: hướng dẫn, chuẩn bị màn, kết quả, lưu, sprite, bố cục màn chơi ở 320×568 đến 1280×760 (8 bộ, 55 test) |
| `npm run test:battleship-ui` | Battleship trên dev server: chạm đúng ô trên bàn phối cảnh ở điện thoại và desktop, nút xoay cạnh tàu |
| `npm run test:word-chain-ui` | Nối Từ: trận luyện với bot trong launcher (gõ có dấu, gõ lại khi sai, kết quả) và chơi online 3 người, ghép trận qua phòng thử 4 người |
| `npm run test:perf` | Launcher đứng yên không vượt 20 lượt render/giây |
| `npm run test:bundle` | Không chunk nào > 500 kB, JS tải đầu ≤ 400 kB gzip |
| `npm run analyze:bundle`, `npm run perf:first-load` | Báo cáo bundle và dung lượng lần tải đầu |
| `npm run test:sql` | Mọi migration và bộ SQL (gồm subscription/commerce) trên PostgreSQL trong tiến trình, không cần Docker; nằm trong `test:fast` |
| `npm run test:supabase` | SQL fixtures; cần Docker, chạy trên database test riêng, không kết nối production |

`test:perf`, `test:smoke`, `test:offline` cần `npm run build` trước và Chromium (`npx playwright install chromium`, hoặc đặt `CHROMIUM_EXECUTABLE`). Một số bộ Playwright cũ (`tests/launcher`, `tests/auth/entry`, `tests/blossom/launcher`, `tests/blossom/branding-integration`) chờ màn đăng nhập `#auth-entry-screen` không còn hiện, nên đang lệch so với giao diện hiện tại và fail cả trên bản gốc 2.12.2. Ca đầu của `tests/blossom/branding-integration` còn lỗi vì `import.meta.env` không có khi chạy ngoài Vite; `tests/blossom/standalone` cần file `../blossom-blast-review.html` nằm ngoài repo.

`tests/storage/*-golden.json` ghi lại hành vi của `StorageService` và `SupabaseService`; chỉ cập nhật bằng `--update` khi cố ý đổi hành vi lưu trữ.

## Bản duyệt và file sinh ra

- `npm run preview:blossom`, `preview:rainbow`, `preview:launcher`, `preview:eat`, `preview:battleship`, `preview:word-chain` (phòng thử Nối Từ 4 người trên một máy): bản duyệt từng phần.
- `npm run export:dungeon-review`: sinh `dungeon-titan-equipment-v6-3-playtest.html` một file, chạy offline (không lưu trong git).
- `blossom-review.html`, `eat-review.html` ở thư mục gốc là trang entry cho dev server (`/blossom-review.html`).

