# Nhật ký công việc

Mỗi phần hoàn tất ghi ngay: ngày/nhánh, việc + file, kiểm tra/kết quả thật, phần còn dở; commit cùng thay đổi (`AGENTS.md`). Mới nhất ở trên; chỉ giữ tối đa 3 mục, chuyển nguyên văn phần cũ sang `archive/WORKLOG-YYYY-MM.md`. Đầu phiên chỉ đọc mục mới nhất; trạng thái hiện tại ở `SESSION-HANDOFF.md`.

## 04/11/2026 · `codex/tank-clash-tc2-readiness` — TC2: staging/Auth và chuẩn bị vận hành

- Chủ dự án yêu cầu tiếp TC2, tạo Supabase staging; chọn organization Nam A Uniform. Đã tạo `arcade-x-staging` ref `khqipuipeawzlkqmdzdg`, Singapore, xác minh `ACTIVE_HEALTHY`, organization Free, public schema rỗng, Auth 0 user, security advisors không có lint. Chỉ đọc kiểm tra staging; không migration/copy dữ liệu/secret từ production. Public env riêng `.env.tank-staging.local` bị Git ignore.
- Server thêm `config.mjs`: production bắt buộc Auth/UUID tester/exact HTTPS origins/metrics token, từ chối guest flags, staging chặn ref production; Auth kiểm registered user và allowlist từ id đã xác minh, cache không vượt JWT exp. Health public tối giản, metrics token chỉ nội bộ, cap socket; SIGTERM báo `ROOM_CLOSED`, client xóa room/result/solo queue. Bỏ Set match ID lịch sử vô hạn; once-only vẫn theo result của phòng sống.
- Đã qua Node 24: 15/15 WS/ops (gồm 9 case mới Auth/config/origin/cap/health/timeout/package/restart/log không token), 9/9 Chrome UI; lint/build/bundle/test:fast. Template systemd/Caddy, preflight, package chỉ 13 file + manifest; chạy isolated release thật. Caddy chính thức 2.11.7 validate qua; WSS local với CA tin trong test, origin/health/metrics 404/restart 1012 qua; không cài CA hệ thống/public ACME.
- Soak 1.802,3 giây thực qua: 204 trận 1v1, 167 trận 2v2 (83 queue), mọi client cùng kết quả; thực đo max 48 socket/14 phòng, RSS 177,3 MiB, CPU interval max 17,4% một core Mac arm64, p95 histogram 21,82 ms/resolution 20 ms. Cuối test room/peer/user/queue/socket về 0, 2 listener không tăng; JSON gốc + source digest ở `tank-clash/evidence/`. Mục tiêu 60 socket/20 phòng chưa đạt; JSONL mất phần đầu do Playwright dọn output, summary vẫn tính đủ 142 mẫu trong RAM. Chưa đo VPS/Internet/thiết bị thật hoặc session Auth thật.
- Runbook `tank-clash/TC2-RUNBOOK.md`, báo cáo `TC2-review.md`; cập nhật README/PLAN/env/test CI. Bản 4338 dùng query server loopback 3224 đã kiểm HTML/health/create/join/leave, server 3223 giữ nguyên. Hosting/domain/tester còn phải hoàn tất, gate pilot chưa entitlement TC3; không push/merge/deploy Netlify, không đăng ký VPS trả phí. Chuyển nguyên văn mục VFX cũ vào archive, giữ tối đa 3 mục.

## 04/11/2026 · `codex/tank-clash-p3d` — TC1: UI online 2v2 và bản duyệt P3

- Chủ dự án yêu cầu tiếp tục plan; đã nối lại checkpoint `6721df6` trên nền `bfb6732`, giữ các sửa VFX/Battleship/Dungeon. Không phát hành và không đưa Tank vào catalog.
- Hoàn thiện `online-ui.ts` + runtime/CSS: phòng 1v1/2v2, sảnh 4 ghế/đội/host/ready/link/người xem, queue lẻ/tổ và lựa chọn 60 s, HUD bốn HP/tên/viền, toast nối lại/rời, đầu hàng xác nhận, kết quả và hai loại rematch. Khung fullscreen mobile, desktop 92dvh/4xl–5xl; giữ focus, nội dung cuộn riêng.
- Sửa đồng hồ countdown/giữ ghế/rematch đứng do metadata chỉ đến theo sự kiện: `timedRoom` tính thời gian trôi, giữ nguyên `room`/wire/snapshot 20 Hz. Lỗi hủy queue giữ online để thử lại, không mở bot khi chưa hủy; bot chỉ chạy cục bộ.
- Thêm WS 4 client và 6 UI kịch bản P3d vào `test:tank-clash-ui`/CI, dùng server loopback/fixture, không gọi Supabase. Qua Node 24/Chrome macOS: lint/build/bundle, test:fast, core 66/66, WS 6/6, UI 9/9 (cả 1v1 cũ và bot), smoke 7, modal 22; ảnh lobby/queue/match/result ở 1280×760, 390×844, 844×390. Mạng mô phỏng max 19,26 KB/s/client <20; không thay giao thức.
- Thêm `docs/tank-clash/P3-review.md` đối chiếu D1–D7, số đo/giới hạn; cập nhật handoff/plan/spec/README. Chuyển nguyên văn mục docs cũ sang archive, WORKLOG giữ 3 mục. Export mới `deliverables/Tank_Clash_P3_Playtest.html`; P1/P2 vẫn là alias sinh từ script.
- Bản duyệt riêng `http://localhost:4338/`, WS `ws://127.0.0.1:3223/tank`; host thử local cho phép khách queue, server thường vẫn bắt đăng nhập. Chưa có tài khoản staging, hosting/mạng/điện thoại thật, soak/load hoặc nghiệm thu cảm giác chơi; TC2 còn quyết định #9. VFX 4337 vẫn chờ chủ dự án duyệt. Không push/merge/deploy Netlify.

## 04/11/2026 · `codex/fix-battleship-dungeon-polish` — căn tàu, radar, chuyển động Dungeon và lưu nền

- Theo ảnh/lỗi chủ dự án: Battleship lệch hàng, lửa dưới tàu, gạch chéo lệch; Dungeon giật, chữ có ô đen; bỏ thông báo lưu/đồng bộ thành công. Giữ bản test riêng, chưa phát hành.
- Battleship `scene`/`Board`: thu beam trong một ô, đăng ký mặt boong theo tâm lưới; hiệu ứng dùng chung điểm chiếu, vẽ sau thân tàu; giảm bob/roll. `FleetStatus` đặt tâm ảnh và gạch chéo vào cùng khung. Thêm `Radar` quay 3,2 s/vòng, hai beep hữu hạn sau thao tác mở âm thanh; dùng chính sách mute/pause/ẩn tab/thoát hiện có. Sửa thêm race mở audio ở capture-phase khiến nút mute/resume đổi nghĩa giữa pointerdown và click; Chrome kiểm chuỗi pause/resume/mute/thoát qua 3 lần liên tiếp.
- Dungeon `TitanArt`/`CombatArt`/`polish.css`: hòa hai tư thế liên tiếp, chuyển động/flipbook do CSS nội suy; giữ hướng riêng mỗi khung, dừng khi pause/giảm chuyển động. Tick 50 ms giảm nhịp giữ chém lệch 200/300 ms; bỏ đòn đánh ngẫu nhiên của lính. Đổi vật liệu nền/chữ trên header, tab, nhãn cảnh để bộ tương phản không chèn ô đen.
- Bỏ indicator cloud thành công và status lưu thường ở `App`, `GameSaveGate`, `ResumeCard`, Battleship online/Word Cross; giữ xử lý lưu, cảnh báo lỗi và chọn bản lưu xung đột.
- Qua Node 24: lint, build/bundle, `test:fast`, `test:battleship`, `test:dungeon`; 5.664 cách đặt tàu (10×10/14×14, ngang/dọc, chìm/nổi) giữ boong trong ô. Chrome macOS: motion 46/46 (23 game × 2 chế độ), VFX 16/16, polish 9/9, Battleship UI 2/2; radar 3 lượt liên tiếp; smoke 7, offline 4, modal 22. Đã kiểm 8 màn Dungeon PC/mobile viewport × normal/reduced, thêm boss/đồ/đồng đội/kỹ năng tiến trình cao và đổi atlas cùng số khung; lưu thật vẫn hoạt động, hình còn rõ khi pause.
- Test mới nằm trong `test:animations`/CI; fixture dùng renderer/audio thật và chặn backend. Bản riêng `/private/tmp/arcadex-battleship-dungeon-review`, `http://localhost:4337/`, ZIP `ArcadeX-Battleship-Dungeon-test-2026-11-04.zip` có hướng dẫn/script. Kiểm build gói: đủ 23 game, radar 3,2 s, save Dungeon thật, 0 request API backend, 0 lỗi JS.
- Chưa kiểm điện thoại thật, nghe loa thật, tài khoản/phòng online thật; không thay luật/save schema/backend, không push/merge/deploy Netlify.



Lịch sử trước đó: [archive/WORKLOG-2026-11.md](archive/WORKLOG-2026-11.md).
