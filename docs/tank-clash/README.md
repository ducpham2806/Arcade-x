# Tank Clash — bản thử

P0–P3d đã có code/test cục bộ: sân tập, 1v1 bot, 2v2 bot, online 1v1/2v2, tổ đội/queue/người xem. **Chủ dự án duyệt đưa vào sảnh 05/11; tích hợp launcher và Render Free đang qua cổng CI/phát hành.** Xem [LAUNCHER-RELEASE](LAUNCHER-RELEASE.md) cho trạng thái/phạm vi mới. Bằng chứng: [P3-review](P3-review.md); tiếp quản: [PLAN §10–§12](PLAN.md). Wire `tank-clash.p3.v1`.

Node 24, từ thư mục gốc:

```bash
npm ci
npm ci --prefix server/tank-clash-room --ignore-scripts
npm ci --prefix server/tank-clash-spike --ignore-scripts
node scripts/export-tank-review.mjs
npm run dev:tank-server
```

Mở `deliverables/Tank_Clash_P3_Playtest.html` hoặc bản đang phục vụ `http://localhost:4338/`, chọn **04 / Online**. Mở bốn tab mới trước khi vào phòng để thử 2v2; không nhân bản tab đang giữ ghế. P1/P2 vẫn là alias cùng nội dung, đều do script sinh. WS mặc định `ws://127.0.0.1:3223/tank`; đổi bằng `?server=wss://...`, mời `?room=MÃ`.

Queue thường cần đăng nhập. Để duyệt queue bằng khách **chỉ trên máy cục bộ**: `NODE_ENV=development TANK_QUEUE_GUESTS=1 npm run dev:tank-server` (production từ chối cờ khách). Bản staging đã có 4 tester; bản public dùng tài khoản ArcadeX theo LAUNCHER-RELEASE. PC WASD/mũi tên, chuột ngắm/bắn, Space khiên, P/Escape tạm dừng; touch cần trái lái, cần phải ngắm/nhả bắn, nút khiên. Online mở menu chỉ trung hòa input, server vẫn chạy; mất focus xóa input.

Test: `npm run test:tank-clash`, `test:tank-clash-server`, `test:tank-clash-ui` (Chromium). Hosting, package, Auth và soak: [TC2-RUNBOOK](TC2-RUNBOOK.md). Chơi local không chứng minh chất lượng Internet; tuning còn tạm. Phần đo hai mạng/thiết bị và tải Render vẫn theo TC2; chưa có thưởng hoặc bảng xếp hạng.
