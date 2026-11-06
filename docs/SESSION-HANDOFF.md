# Bàn giao · 07/11/2026

**Nguồn gameplay:** main c705100; tài liệu 9eff18c. **Nhánh hiện tại:** codex/tank-clash-release-verification; kiểm git status/log trước sửa. DOC-01 đã xong; tóm tắt ở COMPLETED.

## TC-R0 ACTIVE — đang sửa lỗi Auth xuyên tab

- Render/main c705100 đã Live06/11, Free/cap16/registered-free; basic real account create/leave1v1, create2v2/exit/logout sau exit đã qua. Health/TLS/origin/token âm và review/config/metrics404 đã kiểm. Không deploy lại vô cớ.
- Ngày07/11 tái hiện logout **khi game đang giữ ghế**: tab điều khiển thành guest, Tank tab game về menu nhưng EntryScreen vẫn hồ sơ A. Nguyên nhân AuthService.listen dùng localStorage chung để so ID, bỏ qua event khi tab kia đã sửa key.
- Bản sửa local: identity riêng listener + authEpoch hủy restore cũ. 5/5 regression qua (4fail trước sửa); TypeScript/build/bundle qua, fast qua (exit0). UI fixture AuthProvider thật đã thấy A→guest→B. Chưa merge/deploy sửa Auth.
- Đầu vào tiếp: [BUG-AUTH-CROSS-TAB](qa/BUG-AUTH-CROSS-TAB.md) → src/services/auth.ts + tests/auth/cross-tab.mjs. Local fast/commit đã xong; push và chạy CI đầy đủ trước merge code.
- B thật đã xác nhận khác A; tab game nhận B, mã phòng A cũ không còn, B tạo phòng mới qua. Race logout cần retest sau phát hành. IAB tab1/2 giữ phiên cho chủ dự án; không tự logout. Quan sát bảng kết quả2hiệp nhưng chưa đủ TC-R1.
- GitHub check verify c705100 success, run42174413262. Netlify deploy ID/commit dashboard còn thiếu; bundle source đã byte-match. Chrome native bị chuyển cửa sổ/timeout, không đọc project riêng khác.
- Chủ dự án cho phép public báo cáo TC-R0/metadata Render-Supabase. [Báo cáo release](tank-clash/TC-R0-2026-11-06.md) giữ mốc06/11. Blueprint cũ vẫn paused, không sync ghi đè service main.

## Giữ lại để không làm sai

- Tank bot/1v1/2v2/catalog đã merge và Render/main đã Live; giữ một Free/cap16, không chi phí thêm.
- P2 staging cũ có wire khác P3. Chỉ port cải tiến còn thiếu, không merge nguyên nhánh.
- Nối Từ online flag tắt; Duel UI chưa dùng hết trọng tài mới; Snake còn preview. Commerce checkout tắt; không migration production.
- Lượt audit trước TC-R0 ngày 06/11: lint/build/bundle/fast và 18 WS/ops qua; full browser không chạy lại trong lượt đó. Doc check của DOC-01 ghi ở WORKLOG; không suy thành nghiệm thu thiết bị.
- `deliverables/` có artifact local từ trước; không đưa vào commit tài liệu.

**Đọc tối thiểu:** AGENTS → file này → một thẻ plans. Khi cần công nghệ đọc [project](../project.md); skill qua [studio/INDEX](studio/INDEX.md). Trước chuyển việc: tóm tắt task xong, thu gọn log và checkpoint theo [WORKFLOW](WORKFLOW.md).
