# Tank Clash P2 — phòng riêng 1v1

Bản kỹ thuật để duyệt, hình khối tạm. Sân tập và đấu bot vẫn chơi offline. Phòng riêng dùng hai kết nối WebSocket thật; chưa đăng ký catalog, matchmaking, thưởng hoặc bảng xếp hạng.

## Chạy bản thử

Dùng Node 22.18+ (khuyến nghị 24), cài dependencies của repository theo lockfile rồi:

```bash
npm ci --prefix server/tank-clash --ignore-scripts
npm run export:tank-clash
TANK_REVIEW_MODE=1 npm start --prefix server/tank-clash
```

Mở `http://localhost:3000`, chọn **Phòng riêng** → **Tạo phòng**. Người thứ hai mở cùng máy chủ, nhập mã sáu ký tự hoặc dùng link mời. Cả hai bấm **Sẵn sàng**; đếm ngược 3 giây rồi đấu. `/room-lab.html` mở hai iframe với hai ghế/kết nối riêng để kiểm tra trên một màn hình.

`deliverables/Tank_Clash_P2_Playtest.html` là UI tự chứa. Mở trực tiếp vẫn chơi được sân tập/bot; phòng online cần nhập địa chỉ server đang chạy. Không có server Internet được phát hành cùng file. Muốn chơi LAN cần bind HOST phù hợp, cấu hình `TANK_ALLOWED_ORIGINS` chính xác; khi dùng tài khoản ngoài loopback cần HTTPS/WSS qua reverse proxy.

- PC: WASD/mũi tên lái, chuột ngắm/giữ trái bắn, Space khiên.
- Touch: cần trái lái; kéo cần phải ngắm, nhả bắn; nút khiên riêng.
- Offline: mất focus tạm dừng. Online: xóa input, trận vẫn chạy. Rời trận nhận thua.
- Mất kết nối: giữ ghế 20 giây [PLACEHOLDER], xe không nhận input nhưng vẫn chịu sát thương; vào lại đúng xe/HP. Hết hạn xử thua nếu đối thủ còn; cả hai mất kết nối thì hủy trận.
- Reload: mở Phòng riêng → **Vào lại ghế cũ** với cùng endpoint/tab; resume token chỉ lưu trong sessionStorage, không nằm trong link mời.
- Sau trận: cần hai phiếu **Đấu lại**, hoặc về sảnh để mời người mới.

Thông số gameplay vẫn là [PLACEHOLDER] theo GDD và bảng tuning P1.

## Auth và vận hành

`TANK_REVIEW_MODE=1` cho phép khách thử cục bộ, luôn gắn nhãn máy chủ thử nghiệm. Mặc định server từ chối chạy nếu thiếu bộ xác minh tài khoản hoặc danh sách origin. Xem `server/tank-clash/.env.example`.

Chế độ tài khoản gọi Supabase `auth.getUser(jwt)` tại admission, kiểm `user.id` đã xác minh với allowlist thử nghiệm. Không tin role từ user_metadata, không dùng service-role key và không query DB trong simulation. Client nhúng nhận callback `getAccessToken`; việc nối quyền gói chơi và launcher thuộc P4, allowlist chưa thay thế entitlement sản phẩm. Không truyền JWT qua URL hoặc lưu vào resume storage.

Phòng nằm trong RAM của một tiến trình. Khởi động lại hủy trận, không khôi phục dữ liệu hoặc cấp thưởng. P2 chưa hỗ trợ nhiều instance, routing vùng, lưu kết quả hoặc reconnect qua server restart. Chưa chọn/đăng ký hosting có phí.

## Kiểm thử

```bash
npm ci --prefix server/tank-clash-spike --ignore-scripts
npm ci --prefix server/tank-clash --ignore-scripts
npm run test:tank-clash
npm run export:tank-clash
```

Các server trong test chỉ mở loopback và tự đóng. Test proxy mô phỏng RTT 80/150/250 ms, jitter ±30 ms mỗi chiều, bỏ 1–3% snapshot ở lớp ứng dụng và lặp lệnh điều khiển; TCP thực vẫn đáng tin cậy. Đây chưa phải chơi thử hai người qua Internet hoặc đo FPS điện thoại.

## Module

| Module | Trách nhiệm |
|---|---|
| `engine.ts` | Luật thuần, va chạm/đạn/khiên/hiệp; thống kê mỗi người |
| `protocol.ts` | Version, input sequence/epoch, snapshot động gọn và revision tường |
| `online-client.ts` | Transport, control command idempotent, resume, prediction xe mình, reconcile, interpolation xe khác |
| `runtime.ts` | Offline/online UI, keyboard/touch, HUD, dialog và cleanup |
| `server/tank-clash/rooms.mjs` | Phòng, ghế, ready/rematch, fixed step 60 Hz, timeout/forfeit |
| `server/tank-clash/server.mjs` | HTTP/WS, auth admission, origin, giới hạn payload/rate/backpressure, snapshot 12 Hz |
| `server/tank-clash/auth.mjs` | Supabase verified identity + test allowlist |

Tham số mạng cũng đang thử nghiệm. Client chỉ gửi input, server quyết định HP/đạn/hiệp/kết quả. Tường được gửi lại đến khi client xác nhận revision. Gói tin/ý định cũ không chạy sang hiệp mới; lệnh ready/rematch có opId và ack, input chuyển động không phát lại sau reconnect. Tick mô phỏng không bị đẩy nhanh bởi tốc độ gửi input; vòng catch-up có giới hạn để tránh quá tải. Dùng timestamp monotonic cho thời gian hiệp.

`destroy()` hủy listener/RAF/timer/socket và xóa input. Chưa sửa hệ thống PvP của game khác. Chưa phát hành công khai; xem `P2-review.md` cho bằng chứng và phần còn thiếu.
