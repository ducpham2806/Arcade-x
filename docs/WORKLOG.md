# Nhật ký công việc

Mỗi phần hoàn tất ghi ngay: ngày/nhánh, việc + file, kiểm tra/kết quả thật, phần còn dở; commit cùng thay đổi (`AGENTS.md`). Mới nhất ở trên; chỉ giữ tối đa 3 mục, chuyển nguyên văn phần cũ sang `archive/WORKLOG-YYYY-MM.md`. Đầu phiên chỉ đọc mục mới nhất; trạng thái hiện tại ở `SESSION-HANDOFF.md`.

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
