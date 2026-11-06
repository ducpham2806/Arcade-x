# Tank Clash · phát hành vào sảnh · 05/11/2026

> **Mốc tài liệu lịch sử:** các trạng thái/giới hạn bên dưới thuộc thời điểm báo cáo. Hiện trạng 06/11/2026 và việc tiếp theo ở [PROJECT-PLAN](../PROJECT-PLAN.md); PR #16 đã merge vào main c705100. Không dùng câu “chưa merge/deploy” cũ để suy ra trạng thái hiện tại; production vẫn cần xác minh trực tiếp.

Chủ dự án đã duyệt bản chơi thử, yêu cầu merge `main`, đưa icon ra sảnh và mở **bot + online cho tài khoản ArcadeX**, tiếp tục Render Free, không phát sinh phí. Quyết định này mở phạm vi tích hợp/phát hành; không biến các phép đo TC2 còn thiếu thành đã đạt.

## Phạm vi

- Game thứ 24: registry tải lười, icon/banner SVG + WebP sinh bằng `build-launcher-art.mjs --only=tank-clash`, package/offline, banner game mới; giữ palette/menu riêng.
- Catalog cũ thiếu Tank Clash được bổ sung game miễn phí ngay trong bản web. Dòng catalog hợp lệ của server luôn ưu tiên (kể cả maintenance/premium); không chạy SQL/migration production. Yêu thích/lịch sử của Tank giữ trên thiết bị trong đợt này; các game khác giữ đường đồng bộ cũ.
- Adapter đợi Auth khởi tạo, chỉ gửi token registered tới WSS cố định `wss://arcadex-tank-staging.onrender.com/tank`. Link mời `?game=tank-clash&room=CODE` không chọn máy chủ. Khách chơi bot; chọn online mở đăng nhập ArcadeX. Refresh token không khởi tạo lại game; logout/đổi tài khoản/thoát game rời phòng và xóa resume. Không nhận ghế cũ từ bản staging.
- Tái dùng **một** service Render Free/Singapore/Node24, cap 16 socket, Auto Sync No/deploy thủ công. `NODE_ENV=production`, `TANK_ENV=production`, `TANK_ACCESS_MODE=registered-free`, Supabase URL/key public của ArcadeX, review/metrics public tắt. Chỉ gọi Auth `/auth/v1/user` để xác minh; không SQL production, service-role key, thưởng, ghi kết quả hoặc mở commerce.
- Mặc định server vẫn là chính sách tester; chỉ cấu hình production tường minh mới cho toàn bộ tài khoản ArcadeX registered. Staging tiếp tục chặn ref production. Tên hostname có “staging” được giữ để tái dùng service, không phải nguồn Auth sau chuyển đổi.

## Kiểm chứng và giới hạn

Node24/Chrome macOS: lint/build/bundle, fast suites và 18 WS/ops qua. Kiểm tra catalog production không cần DB và không vượt server maintenance/premium qua. UI từ sảnh kiểm lái/tạm dừng/thoát/đăng nhập; fixture adapter kiểm WSS cố định, chờ Auth và rời phòng khi logout. 13/13 Chrome UI qua, adapter đã chạy lại sau khi hoàn thiện bridge fixture. Các bộ kiểm tra còn lại của workflow đã chạy cục bộ; [kết quả/giới hạn](evidence/LAUNCHER-local-2026-11-05.json). Nhánh đã push, PR #16 đang qua CI/Linux; lượt đầu dừng vì WS chưa được cài trước Typecheck, đã sửa thứ tự cài. Merge/deploy chờ CI head cuối; trạng thái tiếp theo ghi ở WORKLOG/PR.

Free có thể ngủ sau 15 phút không có inbound, thức lại khoảng một phút, restart mất phòng/hàng chờ RAM. Chưa đo tải Render 30 phút, ≥10 trận mỗi format/hai thiết bị/hai mạng, hoặc nghiệm thu phần thưởng/DB result. Các phép đo cục bộ cũ ở [TC2-review](TC2-review.md) không chứng minh các tiêu chí này.

Sau CI đạt: merge vào main để Netlify phát hành; chuyển Blueprint/service sang code main + cấu hình trên, đổi publishable key sang đúng project trước khởi động. Kiểm Free/commit/health/TLS, review404/metrics404, origin và token giả; sau đó xác minh icon/chơi bot trên `https://arcade-x.netlify.app`. Giữ bản cũ nếu build thất bại; sửa tiến về trước bằng commit, không tắt test/scan hoặc mở guest/wildcard.
