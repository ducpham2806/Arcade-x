# Bàn giao: những gì đã làm (session 10/2026 – 11/2026)

Tài liệu tóm tắt cho người làm tiếp. Việc chủ dự án cần tự làm nằm ở `docs/OWNER-TODO.md`.

## Trạng thái nhánh
- Cập nhật 03/11/2026: Tank Clash P0/P1/P2 đã hợp nhất lịch sử vào main `2d6b33e`. Lượt tiếp tục đang trên `feat/tank-clash-p2-staging-readiness` (wire v2), không tự merge main. Điểm tiếp quản: `docs/tank-clash/PLAN.md` v1.4 §16.
- Baseline trước đó 02/11/2026: nhánh `claude/busy-edison-1clj3h` đã merge vào `main` (PR #11). `main` (`c8aac24`) có thêm Tank Clash P0/P1 và Snake journey.
- Nhật ký chi tiết từng việc, mới nhất ở trên: `docs/WORKLOG.md` (bắt buộc cập nhật).
- Netlify deploy production từ `main`. Chỉ merge khi chủ dự án yêu cầu, và chạy đủ CI trước khi merge.

## Đã làm, theo thứ tự

### 1. Nền tảng M0–M8 (đã merge vào `main`)
- **M1:** tách `storage.ts` và `supabase.ts` theo miền, giữ nguyên API. Test golden nằm trong `tests/storage/*-golden.json`.
- **M2:** chia `GameContext` thành các context nhỏ và chuyển nơi dùng sang hook hẹp, nên launcher không còn render lại khi đứng yên.
- **M3:** lazy-load panel, cửa hàng và dữ liệu; chia vendor chunk; thêm công cụ đo bundle (`analyze:bundle`, `perf:first-load`).
- **M4:** ngừng track file sinh ra; gom art nguồn vào `art/`, demo vào `review/demos`; README 2.12.x.
- **M5:** khung `AppModal` theo AGENTS.md; test `test:modals`.
- **M6:** smoke test mở mọi game (`test:games`), test thuộc tính cho 8 engine, sửa phòng Mummy không thắng được.
- **M7:** Duel server làm trọng tài cho Cờ vua, Cờ tướng, Caro (`docs/DUEL-SERVER.md`). **Chưa deploy.**
- **M8:** chạy SQL trên PGlite không cần Docker (`test:sql`), runbook commerce, script kiểm tra staging chỉ đọc.

### 2. Neon Run
- Review: `docs/NEON-RUN-REVIEW.md`.
- **NR1:** âm thanh và phản hồi khi trúng đòn.
- **NR2:** điều khiển dễ hơn.
- **NR3:** art đổi sang WebP, từ 11,8 MB còn 6,1 MB.
- **NR4** (`5bc450f`, chưa merge): chỉnh màn bằng `scripts/neon/tune-levels.mjs`, thêm checkpoint dày hơn, cơ chế riêng cho từng thế giới, thử thách 3 sao đa dạng.

### 3. Agent và skill (`76833d1`)
Lấy từ Claude Code Game Studios và chỉnh cho web; nằm trong `.claude/`, nguồn ghi ở `.claude/CCGS-NOTICE.md`. Danh sách agent và skill có trong `CLAUDE.md`.

### 4. Blossom Blast
- `/game-review`: `docs/BLOSSOM-BLAST-REVIEW.md`.
- Bỏ nền đen của lớp readability, ẩn dòng seed debug.
- Màn chơi vừa khung, 2 cột trên màn rộng thấp.
- Test `test:blossom-ui` đã vào CI.

### 5. Art từ Gemini
- **Công cụ:** `scripts/art/import-gemini.py` đọc `art/gemini/<game>/crops.json`.
  - Các cách tách nền: `flood`, `chroma`, `alpha`, `compose`, `flipbook`, `none`.
  - Kết quả luôn giống nhau với cùng đầu vào; `--check` báo lỗi khi file đã lệch.
  - Test: `tests/artwork/gemini.mjs`. Icon raster đăng ký bằng `scripts/art/raster-launcher-art.py`.
- **Game đã thay art:** Blocker, Mummy Escape, Chess, Cờ Tướng, Caro, Cyber Blade, Blossom Blast.
- **Blossom thay art cũ theo đường dẫn**, qua bảng `src/games/hex-match/blossom/painted.json`.
- **11 hiệu ứng Blossom** (nổ 6 màu, bom, mặt trời, cầu vồng, ghép đôi, tia điện) được dựng thành dải khung hình từ bảng VFX tĩnh (`3f6aecb`).

### 6. Battleship (`8456109`)
- **Bàn chơi nghiêng phối cảnh** (`src/games/battleship/projection.ts`), với **tàu giả 3D** (`scene.ts`).
  - Tàu có mạn, bóng, bọt sóng; tàu chìm lún xuống; tên lửa bay theo đường cong.
  - Tàu được vẽ sẵn thành ảnh để nhẹ máy.
- **Giao diện thép & đồng:** đồng hồ mặt số, radar, hàng tàu hai bên, sảnh vẽ hạm đội.
- **Test:** `test:battleship-ui` (chạm đúng ô) và `tests/battleship/projection.mjs`.
- **Prompt Gemini** cho ảnh tàu: `docs/battleship/GEMINI-SHIP-PROMPTS.md`.

### 7. Nối Từ Đối Kháng, game #23 (`6a518a6`, `d106778`, `6d9982d`)
Code nằm trong `src/games/word-chain/`. Luật chơi:
- 2–4 người; mỗi người gõ một từ 2 âm tiết bắt đầu bằng âm tiết cuối của từ trước;
- gõ sai được gõ lại; hết giờ thì bị loại;
- giờ mỗi lượt 30 giây, từ vòng 4 còn 20 giây, từ vòng 7 còn 15 giây.

| Module | Đã làm |
|---|---|
| **WC1** | Từ điển 17.522 từ, lấy từ Wiktionary qua gói `which-dialect-vi@0.2.0` (CC BY-SA 4.0). File `public/games/word-chain/words.v1.json`, sinh bằng `scripts/word-chain/build-lexicon.mjs`. Thêm `normalize.ts` ("hoà" = "hòa"), `rules.ts`, `bot.ts` (Dễ/Khó), chơi với 1–3 bot, thưởng qua `bridge.submitScore`. |
| **WC2** | Đưa vào sảnh: registry, icon và banner vẽ bằng code, gói offline, đổi số game 22 thành 23 trong test và tài liệu. Viết migration danh mục `supabase/migrations/20261102090000_word_chain_catalog.sql` (**chưa áp**). |
| **WC3** | Máy chủ phòng `server.ts`: phòng có mã, ghép trận N ghế, chuẩn bị 30 giây, vắng 90 giây thì bị loại, tái đấu, biểu cảm. Kèm `supabase/word-chain/schema.sql`, Edge Function `supabase/functions/word-chain-room`, mẫu lịch hẹn giờ `scheduler.sql`. **Chưa deploy.** |
| **WC4** | Client `online-client.ts`, giao diện `OnlineRoom.tsx`, trang duyệt `RoomLab.tsx` mô phỏng 4 người trên một máy (`npm run preview:word-chain`). Các nút online đang tắt (`online-config.json`, `enabled: false`). |

Tài liệu máy chủ: `docs/WORD-CHAIN-SERVER.md`.

### 8. Tank Clash P2 — online 1v1 (03/11/2026, nhánh `ccr-ff972ce9-1yqkwu`)
- Giao thức `protocol.ts`, máy chủ phòng `room.ts`, netcode `net-client.ts`, server WebSocket `server/tank-clash-room/`, giao diện online trong bản preview.
- Test: `test:tank-clash` (trong `test:fast`), `test:tank-clash-server`, `test:tank-clash-ui` (đã thêm vào CI).
- **Chưa deploy, chưa chọn hosting, chưa vào launcher.** Báo cáo và số đo: `docs/tank-clash/P2-review.md`.

- Bàn giao cập nhật 03/11: xem `docs/tank-clash/PLAN.md` v1.3 §15. Hợp nhất lịch sử nhánh `feat/tank-clash-p2-rooms`; giữ bộ PR #13 hiện hành (`room.ts`, `net-client.ts`, `server/tank-clash-room`). Bộ P2 cũ và test cũ có thể xem ở commit `1efae4587d68b524fd1ea03f3422750c1bcb6bac`; không trộn wire hai bộ.

### 9. Tank Clash P2 staging readiness — 03/11/2026
- Auth đã đăng ký/refresh/pin WSS endpoint, production tester allowlist, không anonymous/bypass. Online React vẫn tắt; không sửa catalog/DB production.
- Wire v2: epoch hiệp, receipt/ack ready/leave, stale snapshot/start guards, bounded input/control queues/reconnect, half-open detection, shutdown hủy trận đúng một lần. Key ghế `tank-clash.seat:v2` ràng buộc protocol+endpoint, không JWT.
- Optional staging login và static HTML cùng WS; Docker/Caddy/Render proposal, chưa deploy hoặc chạy image. Xem `STAGING-RUNBOOK.md` và `P2-staging-review-2026-11-03.md`.
- 39 core + 12 WS tests, lint/build/budget qua; toàn test:fast qua (exit 0). CUA hai tab create/join/ready/reload/forfeit qua; load 16 phòng/32 WS/60 giây và soak 30 phút mô phỏng qua. Chưa live Auth/Internet/10 trận hai máy/soak thực/FPS thật. P3 chưa bắt đầu.

## Sổ tay kỹ thuật
- **CI:** thứ tự các bước trong `.github/workflows/ci.yml`. Lệnh mới của session này:
  - `test:battleship-ui`;
  - `test:word-chain` (nằm trong `test:fast`);
  - `test:word-chain-ui`.
- **Trình duyệt trong máy cloud:** đặt `CHROMIUM_EXECUTABLE=/opt/pw-browsers/chromium-1243/chrome-linux64/chrome`.
- **File sinh ra:** chỉ sửa bằng script, và kiểm tra bằng `--check` hoặc test:
  - `node scripts/word-chain/build-lexicon.mjs --check`;
  - `python3 -I scripts/art/import-gemini.py art/gemini/<game>/crops.json --check`;
  - `npm run prepare:word-chain-server` và `prepare:duel-server` (có test so khớp bản đã chép);
  - `scripts/build-launcher-art.mjs` (cần `sharp`; máy cloud chưa có).
- **Quy ước:**
  - Tiền tố CSS phải riêng cho từng game. Nối Từ dùng `nt-`, vì `wc-` đã thuộc Word Cross.
  - Game mới chỉ hiện ở production khi có dòng trong bảng `launcher_games`. Khi chạy dev thì thêm id vào `LOCAL_REVIEW_GAME_IDS`.
  - Ba test cố định số lượng game: `tests/integration/full-release.mjs`, `tests/artwork/catalog.mjs`, `tests/readability/contrast.mjs`.
- **Phòng online:** máy chủ làm trọng tài, ghi bằng CAS theo version, biên nhận chống gửi lặp, vắng 90 giây. Xem `docs/DUEL-SERVER.md` và `docs/WORD-CHAIN-SERVER.md`. Mẫu này đã bị chép 3 lần (`docs/TECH-DEBT.md`).
- **An toàn:** không chạy migration hay script lên Supabase production (`whjatkhhupeqfngakmee`); dùng PGlite hoặc staging.

## Chưa làm hoặc còn yếu
- **Block Breaker:** vẫn chờ ảnh độ phân giải đầy đủ (mới có ảnh 512×286).
- **Blossom:** mỗi nhân vật mới có một biểu cảm; huy hiệu, icon nhỏ, khung bàn và ô bàn vẫn là art cũ. Bản duyệt offline vẫn hiện art cũ.
- **Battleship:** chưa chạy `/ux-review`, chưa đo trên điện thoại thật. Renderer tốn CPU khoảng 1,6 lần bản cũ (đo không có GPU).
- **Banner launcher:** banner cũ còn vệt đen phía trên. Mẫu đã sửa trong `scripts/build-launcher-art.mjs`, nhưng sinh lại cần `sharp`.
- **Nối Từ:**
  - chưa thử bộ gõ Telex/VNI trên máy thật;
  - từ điển còn thiếu một số từ thông dụng;
  - online chỉ chạy được sau khi deploy máy chủ.
