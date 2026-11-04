# Nhật ký công việc

Mỗi phần hoàn tất ghi ngay: ngày/nhánh, việc + file, kiểm tra/kết quả thật, phần còn dở; commit cùng thay đổi (`AGENTS.md`). Mới nhất ở trên; chỉ giữ tối đa 3 mục, chuyển nguyên văn phần cũ sang `archive/WORKLOG-YYYY-MM.md`. Đầu phiên chỉ đọc mục mới nhất; trạng thái hiện tại ở `SESSION-HANDOFF.md`.

## 04/11/2026 · `codex/fix-battleship-dungeon-polish` — căn tàu, radar, chuyển động Dungeon và lưu nền

- Theo ảnh/lỗi chủ dự án: Battleship lệch hàng, lửa dưới tàu, gạch chéo lệch; Dungeon giật, chữ có ô đen; bỏ thông báo lưu/đồng bộ thành công. Giữ bản test riêng, chưa phát hành.
- Battleship `scene`/`Board`: thu beam trong một ô, đăng ký mặt boong theo tâm lưới; hiệu ứng dùng chung điểm chiếu, vẽ sau thân tàu; giảm bob/roll. `FleetStatus` đặt tâm ảnh và gạch chéo vào cùng khung. Thêm `Radar` quay 3,2 s/vòng, hai beep hữu hạn sau thao tác mở âm thanh; dùng chính sách mute/pause/ẩn tab/thoát hiện có. Sửa thêm race mở audio ở capture-phase khiến nút mute/resume đổi nghĩa giữa pointerdown và click; Chrome kiểm chuỗi pause/resume/mute/thoát qua 3 lần liên tiếp.
- Dungeon `TitanArt`/`CombatArt`/`polish.css`: hòa hai tư thế liên tiếp, chuyển động/flipbook do CSS nội suy; giữ hướng riêng mỗi khung, dừng khi pause/giảm chuyển động. Tick 50 ms giảm nhịp giữ chém lệch 200/300 ms; bỏ đòn đánh ngẫu nhiên của lính. Đổi vật liệu nền/chữ trên header, tab, nhãn cảnh để bộ tương phản không chèn ô đen.
- Bỏ indicator cloud thành công và status lưu thường ở `App`, `GameSaveGate`, `ResumeCard`, Battleship online/Word Cross; giữ xử lý lưu, cảnh báo lỗi và chọn bản lưu xung đột.
- Qua Node 24: lint, build/bundle, `test:fast`, `test:battleship`, `test:dungeon`; 5.664 cách đặt tàu (10×10/14×14, ngang/dọc, chìm/nổi) giữ boong trong ô. Chrome macOS: motion 46/46 (23 game × 2 chế độ), VFX 16/16, polish 9/9, Battleship UI 2/2; radar 3 lượt liên tiếp; smoke 7, offline 4, modal 22. Đã kiểm 8 màn Dungeon PC/mobile viewport × normal/reduced, thêm boss/đồ/đồng đội/kỹ năng tiến trình cao và đổi atlas cùng số khung; lưu thật vẫn hoạt động, hình còn rõ khi pause.
- Test mới nằm trong `test:animations`/CI; fixture dùng renderer/audio thật và chặn backend. Bản riêng `/private/tmp/arcadex-battleship-dungeon-review`, `http://localhost:4337/`, ZIP `ArcadeX-Battleship-Dungeon-test-2026-11-04.zip` có hướng dẫn/script. Kiểm build gói: đủ 23 game, radar 3,2 s, save Dungeon thật, 0 request API backend, 0 lỗi JS.
- Chưa kiểm điện thoại thật, nghe loa thật, tài khoản/phòng online thật; không thay luật/save schema/backend, không push/merge/deploy Netlify.

## 04/11/2026 · `fix/desktop-game-animation` — khôi phục VFX Chrome, bản test cục bộ

- Chủ dự án báo Chrome hầu như mất VFX (Blossom/Battleship), yêu cầu kiểm toàn bộ, commit và đưa bản test; không deploy trước khi duyệt. Đã giữ P3d riêng ở checkpoint `6721df6` trên `feat/tank-clash-p3d`.
- Tái hiện CSS `.arcade-app *` ép animation còn 0,01 ms khi OS giảm chuyển động; test build gốc fail `1e-05s !== 2s`. Sửa phạm vi thành `.arcade-launcher`; Battleship reduced vẫn có khung nổ/cột nước đứng yên ngắn thay vì bỏ hết VFX. Không đổi luật/save/backend.
- Thêm `tests/motion/desktop.cjs`, `vfx.test.ts` + fixture renderer thật, `test:animations` trong CI; smoke giờ đối chiếu đủ engine, chặn backend để không ghi production. Bổ sung quy tắc CSS vào AGENTS và báo cáo `docs/DESKTOP-MOTION-FIX.md`; cập nhật handoff/plan.
- Qua: lint/build/bundle, test:fast, test:battleship; test:games 23/23, motion 46/46 (23 game × 2 chế độ OS), VFX 16/16 (12 Blossom trong launcher + 4 Battleship, ảnh decode/timeline/flipbook/Canvas thật); smoke 7, offline 4, modal 22; perf 3,5 render/s <20. Node 24.22.2, Chrome macOS 156.0.8078.80; đã xem ảnh VFX. Không tuyên bố chơi hết mọi màn hoặc đã thử Windows/máy của chủ dự án.
- Bản test riêng `/private/tmp/arcadex-pc-animation-review`, `http://localhost:4335/`: 23 game, 0 request API backend, 0 lỗi JS trong kiểm tra mở Battleship; offline/bot và save trên origin test. Có ZIP + script chạy lại. Chỉ commit cục bộ, không push/merge/deploy để giữ bước phát hành chờ chủ dự án duyệt.

## 04/11/2026 · `docs/project-plan-and-handoff` — kế hoạch và tài liệu đầu vào

- Yêu cầu: lập kế hoạch chi tiết, kiểm tra lịch sử, giảm token tài liệu mà vẫn đủ tiếp quản. Đã xác nhận có WORKLOG và archive; không tạo sổ lịch sử trùng.
- Thêm `docs/PROJECT-PLAN.md` (đầu việc/phụ thuộc/đầu ra/nghiệm thu), `docs/INDEX.md` (đọc theo nhiệm vụ), `docs/DOCUMENTATION-AUDIT.md` (phạm vi, số đo, chính sách giữ tài liệu).
- Rút gọn `AGENTS.md`, `CLAUDE.md`, `README.md`, handoff/owner/decisions và Tank README/PLAN/P3-SPEC; sửa mốc main PR #15, P3 protocol, vị trí nút online; giữ nguyên quyết định/luật đã duyệt.
- Sửa backlog PvP lỗi thời; bỏ số 22 game cũ trong 19 mô tả agent, không đổi vai trò/skill.
- Chuyển nguyên văn 6 mục cũ vào `archive/WORKLOG-2026-11.md`; giữ nguyên bản Tank PLAN v1.4/P3-SPEC v0.4 trong archive. Lịch sử P3a–P3c và bằng chứng test không bị xóa.
- Kiểm tra qua: `node tests/claude/structure.cjs` (19 agent/11 skill); `git diff --check`; kiểm 40 link local, 2 archive nguyên byte, 6 mục log nguyên văn và đủ số mục PLAN/SPEC + D1–D7. Chỉ file Markdown thay đổi. Không chạy build/gameplay; CI main là lần chạy trước.
- Chỉ sửa tài liệu; chưa triển khai TC1 hay dịch vụ/database, chưa merge main. Backend production chưa được kiểm trực tiếp.

Lịch sử 02–03/11: [archive/WORKLOG-2026-11.md](archive/WORKLOG-2026-11.md).
