# Bàn giao · 07/11/2026

**Gameplay đang phát hành:** main c705100. **Nhánh:** codex/tank-clash-release-verification, PR#17; kiểm git status/log trước sửa. DOC-01 và QA/sửa nguồn Auth đã tóm tắt ở COMPLETED.

## Hiện tại · sửa Netlify để tiếp tục TC-R0

- Chủ dự án báo preview lỗi TS2307 thiếu ws trong server/tank-clash-room/node_modules khi lint. CI cài dependency server trước lint nhưng Netlify chưa có. [Bằng chứng/sửa](qa/NETLIFY-BUILD-2026-11-07.md).
- Sửa deps:tank-clash dùng chung CI và Netlify production/preview; giữ lint, build và Snake preview. Checkout sạch tái hiện đúng lỗi; sau sửa lint/build/Snake preview exit0. Tiếp: commit/push, kiểm build Netlify mới + full CI trước merge. Không dùng CI head cũ thay cho head mới.
- Auth xuyên tab: listener giữ identity riêng, authEpoch hủy restore cũ; regression5/5 (4fail trước sửa), lint/build/bundle/fast qua; UI AuthProvider fixture A→guest→B qua. Chưa merge/deploy. [Chi tiết](qa/BUG-AUTH-CROSS-TAB.md).
- Account B thật khác A; tab game nhận B, mã A cũ không còn, B tạo phòng mới qua. Race logout cần retest sau phát hành. Giữ phiên cho chủ dự án; không tự logout khi chưa vào ca. Quan sát bảng kết quả2hiệp không đủ TC-R1.
- Netlify dashboard07/11 xác nhận Published main/c705100, deploy6aed73038b5150c7c4541f75 lúc06/11 13:26 UTC+7. Render main/c705100 Live06/11, Free/cap16/registered-free; health/origin/token/review404 đã qua. Không deploy lại server vô cớ; Blueprint cũ paused.
- Nối Từ có source+test trong main/nhánh, không bị bỏ sót merge. RPC catalog công khai trả23mục, không có word-chain; fallback chỉ DEV, online flagfalse. [Audit](qa/WC-R0-2026-11-07.md). Chưa sửa DB; WC-R0 staging/history còn dở.

## Giới hạn và quy tắc giữ lại

- Chủ dự án cho phép public thư viện Game Studio và metadata báo cáo TC-R0. Không lưu định danh tài khoản/token/secret.
- TC-R1 ≥10trận mỗi format/2thiết bị/2mạng/soak30phút chưa đạt. P2 wire cũ: chỉ port phần thiếu sang P3, không merge nguyên nhánh.
- Duel UI còn tích hợp, Snake preview, commerce tắt; không SQL production/chi phí thêm. deliverables/ local không commit.
- Đọc tối thiểu: AGENTS → bàn giao → một thẻ plans; Studio chỉ nạp skill cần. Trước đổi việc: COMPLETED, WORKLOG≤3, archive nguyên văn và doc checker theo WORKFLOW.
