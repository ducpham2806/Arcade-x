# Bàn giao · 06/11/2026

**Nguồn gameplay:** `main@c705100` (PR #16 đã merge, xác minh qua GitHub). **Đợt tài liệu:** `codex/docs-game-studio-handoff`; xem `git status`/`git log -1` để biết mốc checkout thực tế. Không có gameplay đang code trong đợt này.

**DOC-01 DONE:** cập nhật roadmap, nhật ký và quy trình thu gọn; cài đủ Game Studio Agent từ `c5dac462` (116 skill, 21 vai trò, 4 rules). Chi tiết cài ở [studio/INSTALLATION](studio/INSTALLATION.md). Không có “bộ nhớ model” đảm bảo ngoài file dự án.

## Bước tiếp theo

1. Chọn **TC-R0** tại [plans/TANK-CLASH](plans/TANK-CLASH.md): đọc release/runbook đúng mục, xác minh commit frontend/backend đang Live và bot/online/Auth. Chưa làm kiểm tra deployment trong đợt docs.
2. Sau đó TC-R1: nhiều tài khoản, hai thiết bị/hai mạng, tải ≥30 phút trên Render. Phép đo local cũ không thay nghiệm thu này.
3. Thứ tự tiếp: Nối Từ → Duel → Snake → QA/polish. Chỉ mở [PROJECT-PLAN](PROJECT-PLAN.md) nếu đổi ưu tiên.

## Giữ lại để không làm sai

- Tank bot/1v1/2v2/catalog đã merge. Không còn task “chờ merge PR #16”. Render từng deploy thủ công; trạng thái đang Live phải kiểm lại. Giữ một Free/cap16, không chi phí thêm.
- P2 staging cũ có wire khác P3. Chỉ port cải tiến còn thiếu, không merge nguyên nhánh.
- Nối Từ online flag tắt; Duel UI chưa dùng hết trọng tài mới; Snake còn preview. Commerce checkout tắt; không migration production.
- Lượt audit 06/11: lint/build/bundle/fast và 18 WS/ops qua; full browser không chạy lại trong lượt đó. Doc check của DOC-01 ghi ở WORKLOG; không suy thành nghiệm thu thiết bị.
- `deliverables/` có artifact local từ trước; không đưa vào commit tài liệu.

**Đọc tối thiểu:** AGENTS → file này → một thẻ plans. Khi cần công nghệ đọc [project](../project.md); skill qua [studio/INDEX](studio/INDEX.md). Trước chuyển việc: tóm tắt task xong, thu gọn log và checkpoint theo [WORKFLOW](WORKFLOW.md).
