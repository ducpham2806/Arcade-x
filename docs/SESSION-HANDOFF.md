# Bàn giao · 06/11/2026

**Nguồn gameplay:** main c705100; tài liệu 9eff18c. **Nhánh hiện tại:** codex/tank-clash-release-verification; kiểm git status/log trước sửa. DOC-01 đã xong; tóm tắt ở COMPLETED.

## TC-R0 WAITING — điểm tiếp tục

- 06/11 khoảng 14:35–14:41: Netlify bundle tải đầu trùng byte build local; Tank có icon/banner, vào trận bot và khách chọn Online tới form login. Chưa có phiên đăng nhập thật.
- Render Live vẫn **3950abb**, nhánh service/Blueprint staging cũ. Env đã lưu là production/registered-free/ArcadeX/cap16/review0 nhưng process Live vẫn Auth staging; review và config200, metrics404, health200/P3; token giả bị từ chối, origin lạ/null/thiếu403.
- Chrome bị thao tác đồng thời rồi timeout; chưa lưu settings hoặc deploy. Cần fresh Render state, chuyển service nhánh main/build command đúng render.yaml, kiểm public key đúng project rồi manual deploy trong quyền đã duyệt. Giữ Free/manual/cap16, không mở guest/wildcard.
- Sau deploy: xác nhận Live commit/instance mới, review/config404, kiểm Auth thật/create/leave/logout/đổi account. Không xin mật khẩu/JWT qua chat. Đã hỏi người dùng đăng nhập và để Render không bị thao tác trong lúc kiểm.
- Chi tiết và hash/bước triển khai: [TC-R0 report](tank-clash/TC-R0-2026-11-06.md); chỉ đọc [thẻ Tank](plans/TANK-CLASH.md) nếu cần tiêu chí. Chưa DONE; không chuyển TC-R1 trước khi gate này đạt.

## Giữ lại để không làm sai

- Tank bot/1v1/2v2/catalog đã merge. Không còn task “chờ merge PR #16”. Render từng deploy thủ công; trạng thái đang Live phải kiểm lại. Giữ một Free/cap16, không chi phí thêm.
- P2 staging cũ có wire khác P3. Chỉ port cải tiến còn thiếu, không merge nguyên nhánh.
- Nối Từ online flag tắt; Duel UI chưa dùng hết trọng tài mới; Snake còn preview. Commerce checkout tắt; không migration production.
- Lượt audit trước TC-R0 ngày 06/11: lint/build/bundle/fast và 18 WS/ops qua; full browser không chạy lại trong lượt đó. Doc check của DOC-01 ghi ở WORKLOG; không suy thành nghiệm thu thiết bị.
- `deliverables/` có artifact local từ trước; không đưa vào commit tài liệu.

**Đọc tối thiểu:** AGENTS → file này → một thẻ plans. Khi cần công nghệ đọc [project](../project.md); skill qua [studio/INDEX](studio/INDEX.md). Trước chuyển việc: tóm tắt task xong, thu gọn log và checkpoint theo [WORKFLOW](WORKFLOW.md).
