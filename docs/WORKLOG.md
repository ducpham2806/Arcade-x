# Nhật ký công việc

Mỗi phần hoàn tất ghi ngay: ngày/nhánh, việc + file, kiểm tra/kết quả thật, phần còn dở; commit cùng thay đổi (`AGENTS.md`). Mới nhất ở trên; chỉ giữ tối đa 3 mục, chuyển nguyên văn phần cũ sang `archive/WORKLOG-YYYY-MM.md`. Đầu phiên chỉ đọc mục mới nhất; trạng thái hiện tại ở `SESSION-HANDOFF.md`.

## 04/11/2026 · `docs/project-plan-and-handoff` — kế hoạch và tài liệu đầu vào

- Yêu cầu: lập kế hoạch chi tiết, kiểm tra lịch sử, giảm token tài liệu mà vẫn đủ tiếp quản. Đã xác nhận có WORKLOG và archive; không tạo sổ lịch sử trùng.
- Thêm `docs/PROJECT-PLAN.md` (đầu việc/phụ thuộc/đầu ra/nghiệm thu), `docs/INDEX.md` (đọc theo nhiệm vụ), `docs/DOCUMENTATION-AUDIT.md` (phạm vi, số đo, chính sách giữ tài liệu).
- Rút gọn `AGENTS.md`, `CLAUDE.md`, `README.md`, handoff/owner/decisions và Tank README/PLAN/P3-SPEC; sửa mốc main PR #15, P3 protocol, vị trí nút online; giữ nguyên quyết định/luật đã duyệt.
- Sửa backlog PvP lỗi thời; bỏ số 22 game cũ trong 19 mô tả agent, không đổi vai trò/skill.
- Chuyển nguyên văn 6 mục cũ vào `archive/WORKLOG-2026-11.md`; giữ nguyên bản Tank PLAN v1.4/P3-SPEC v0.4 trong archive. Lịch sử P3a–P3c và bằng chứng test không bị xóa.
- Kiểm tra qua: `node tests/claude/structure.cjs` (19 agent/11 skill); `git diff --check`; kiểm 40 link local, 2 archive nguyên byte, 6 mục log nguyên văn và đủ số mục PLAN/SPEC + D1–D7. Chỉ file Markdown thay đổi. Không chạy build/gameplay; CI main là lần chạy trước.
- Chỉ sửa tài liệu; chưa triển khai TC1 hay dịch vụ/database, chưa merge main. Backend production chưa được kiểm trực tiếp.

Lịch sử 02–03/11: [archive/WORKLOG-2026-11.md](archive/WORKLOG-2026-11.md).
