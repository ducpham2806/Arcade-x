# Tank Clash — P2 review (online 1v1)

Ngày: 03/11/2026. Phạm vi: phòng riêng 1v1 chạy trên máy chủ quyết định gameplay, client dự đoán/đối soát/làm mượt, giao diện online trong bản preview. **Chưa deploy, chưa chọn hosting, chưa có trong launcher.** Đây không phải thông báo phát hành.

## Đã làm

| Phần | File | Nội dung |
|---|---|---|
| Giao thức | `src/games/tank-clash/protocol.ts` | `tank-clash.p2.v1`. Client chỉ gửi ý định (lái, ngắm, bắn, khiên) theo lô ≤ 4 input có số thứ tự. Server gửi `joined`, `room`, `start`, `snapshot` (20 Hz, có `ack`), `result`, `error` (mã + câu tiếng Việt). Kiểm tra gói tin chặt: loại lạ, field thừa, giá trị ngoài khoảng đều bị từ chối. |
| Máy chủ phòng | `src/games/tank-clash/room.ts` | Không phụ thuộc mạng, đồng hồ truyền vào. Vòng đời: sảnh → sẵn sàng → đếm ngược 3 s → trận → kết quả → đấu lại hoặc về sảnh. |
| Client | `src/games/tank-clash/net-client.ts` | Dự đoán xe mình bằng `driveTank` (chung luật với server), đối soát theo `ack`; xe đối thủ nội suy lùi 100 ms; tự nối lại và quay về ghế. |
| Server WebSocket | `server/tank-clash-room/server.mjs` | Tiến trình Node chạy lâu, `ws@8.22.1`. Origin allowlist, gói ≤ 2 KB, heartbeat, `/health`. Xác thực Supabase tuỳ chọn. |
| Giao diện | `src/games/tank-clash/runtime.ts`, `tank-clash.css` | Thẻ "03 / Online 1v1" ở menu; tạo phòng, nhập mã hoặc mở link mời (`?room=MÃ`); sảnh có ghế, chủ phòng, sẵn sàng, đếm ngược, giữ ghế; trận online không tạm dừng được; màn kết quả do server xác nhận; ping và trạng thái nối lại ở chân trang. |

### Luật phòng đã cài (theo PLAN §5)
- Mã 6 ký tự, không có 0/O/1/I/L; nhập thường hay có gạch đều được. Mã không phải bằng chứng danh tính.
- Lỗi rõ ràng: không tìm thấy phòng, phòng đầy, phòng đang trong trận, khác phiên bản, phiên đăng nhập hỏng, gửi quá nhanh.
- Khóa người mới khi trận đã bắt đầu. Hai người tranh ghế cuối: đúng một người vào (kiểm cả khi xác thực bất đồng bộ).
- Chủ phòng rời sảnh: chuyển cho ghế còn lại. Trong trận chủ phòng không có quyền gì thêm.
- **Mất mạng:** giữ ghế 20 s; xe đứng yên nhưng **vẫn trúng đạn**; quay lại đúng ghế với HP hiện tại. Hết 20 s: xử thua. Cả hai cùng hết: hủy trận, không ai thắng. Rời giữa trận: xử thua ngay. Thiết bị khác cầm resume token có thể chiếm ghế, kết nối cũ bị báo và ngắt.
- Đấu lại cần cả hai sẵn sàng; mỗi trận có `matchId` mới. `onResult` chỉ được gọi **một lần** cho mỗi `matchId`.
- Một tài khoản (không phải khách) không giữ hai phòng cùng lúc.
- Phòng không còn ai kết nối 60 s thì đóng; sảnh không có trận 10 phút thì đóng.

### Chống gian lận cơ bản
- Server consume tối đa 1 input/nhịp, cộng **tín dụng input**: thiếu input thì xe đứng yên, input tới trễ (jitter, TCP gửi lại) được bù tối đa 2/nhịp trong giới hạn 30 nhịp đã tích. Tổng input áp dụng ≤ số nhịp đã trôi + 30, nên gửi dồn không làm xe chạy nhanh hơn.
- Số thứ tự cũ hoặc lặp bị bỏ. Bắn/khiên trong input bị gộp không bao giờ mất, nhưng cũng không lặp lại.
- Giới hạn 120 gói/giây/kết nối; vượt gấp đôi thì ngắt.

## Số đo (mạng ảo, `tests/tank-clash/netcode.test.mjs`)

Hai client chơi một trận đủ hiệp với input theo kịch bản. "Mất gói" được mô phỏng như TCP: gói tới trễ thêm một lần gửi lại (≥ 200 ms) và chặn các gói sau, không bị rơi.

| Mạng | Tải xuống/client | Tải lên/client | Hiệu chỉnh xe mình khi đang đánh | Lệch hiển thị xe đối thủ so với server (TB / p95) |
|---|---|---|---|---|
| RTT 80 ms, jitter 30 ms, mất 1 % | 11,5 KB/s | 4,2 KB/s | 0 | 15 / 28 px |
| RTT 150 ms, jitter 30 ms, mất 2 % | 11,3 KB/s | 4,1 KB/s | 0 | 19 / 40 px |
| RTT 250 ms, jitter 30 ms, mất 3 % | 10,2 KB/s | 3,9 KB/s | 0 | 32 / 86 px |

- Cả ba mức: kết quả, tỉ số và người thắng trên hai client trùng với server; không có bước nhảy hình ảnh lớn hơn 2,5 khung (đo được tối đa 5,3 px/khung).
- Tải xuống dưới trần thử 20 KB/s (PLAN §9).
- Hiệu chỉnh chỉ xảy ra lúc hết hiệp hoặc khi xe mình vừa bị loại (2–3 lần/trận): server ngừng nhận input nên phần đã dự đoán bị lùi lại. Không gây hậu quả gameplay.
- Lệch hiển thị xe đối thủ là do vẽ lùi 100 ms cộng độ trễ một chiều. Ở 250 ms, người chơi sẽ thấy đối thủ "trễ" khoảng 1/4 giây; **chưa có bù trễ khi bắn (lag compensation)**, nên bắn vào xe đang chạy ở RTT cao sẽ khó hơn chơi cục bộ.

## Kiểm thử

| Lệnh | Nội dung | Kết quả 03/11/2026 |
|---|---|---|
| `npm run test:tank-clash` (trong `test:fast`) | 12 ca engine + 10 ca phòng + 5 ca mạng ảo | 27/27 qua |
| `npm run test:tank-clash-server` | WebSocket thật: 2 client vào phòng, chơi, server cắt socket → tự nối lại đúng ghế/HP, chiếm ghế bằng token, rời trận → xử thua, `/health`; chặn origin lạ (403) và gói quá cỡ (1009); bộ xác thực Supabase với fetch giả; spike P0 | 4/4 qua |
| `npm run test:tank-clash-ui` | Playwright: 2 trang trình duyệt + server thật; tạo phòng, nhập mã, sẵn sàng, đếm ngược, lái bằng bàn phím, hai bên thấy xe di chuyển, Escape → rời trận → bên kia thắng | 1/1 qua |
| `npm run lint`, `npm run build`, `npm run test:bundle`, `npm run test:fast` | Toàn dự án | Qua |

Đã xem ảnh chụp màn hình menu, form online, sảnh và trận ở 1280×760, 390×844 và 844×390.

## Giới hạn và phần chưa làm
- **Chưa thử trên mạng Internet thật hoặc hai thiết bị thật.** Mạng ảo chỉ chứng minh logic giao thức; PLAN §9 yêu cầu 10 trận thật mỗi quy mô.
- **Chưa chọn nơi chạy server** (xem dưới). Bản preview mặc định nối `ws://<máy hiện tại>:3223/tank`.
- Kết quả trận chỉ ghi log. Lưu kết quả/thống kê vào Supabase (theo `matchId`, chống ghi trùng) để lại cho mốc tích hợp P4.
- Chưa có lag compensation, chưa có chơi nhanh/ghép trận (P3), chưa có 2v2 (P3).
- Thời gian đếm ngược, giữ ghế, tốc độ snapshot… vẫn là [PLACEHOLDER] cho tới khi chơi thật.
- Server giữ phòng trong bộ nhớ một tiến trình: khởi động lại là mất các phòng đang chơi (trận bị hủy, không ai được tính thắng). Chạy nhiều tiến trình cần định tuyến theo mã phòng.

## Cần chủ dự án quyết định: nơi chạy room server
Server cần một **tiến trình chạy liên tục** giữ kết nối WebSocket và mô phỏng 60 Hz. Netlify Functions không giữ WebSocket; Supabase Edge Functions có thời gian sống giới hạn cho mỗi lần gọi nên không hợp để giữ một trận dài vài phút trong bộ nhớ (cần kiểm lại tài liệu hiện hành trước khi kết luận cuối). Các hướng phù hợp: một máy chủ nhỏ chạy Node (VPS), hoặc dịch vụ chạy container có hỗ trợ WebSocket. **Chưa kiểm giá, chưa đăng ký dịch vụ nào.** Khi anh chọn hướng, Claude sẽ trình chi phí cụ thể và các bước trước khi đăng ký.

Cấu hình khi deploy: `NODE_ENV=production`, `HOST=0.0.0.0`, `PORT`, `TANK_ALLOWED_ORIGINS=<domain launcher>`, `SUPABASE_URL` + `SUPABASE_ANON_KEY` của **staging** trước. Đặt sau TLS (wss://). Không cần service-role key.

## Chạy thử cục bộ
```bash
npm ci --prefix server/tank-clash-room
npm run dev:tank-server               # ws://127.0.0.1:3223/tank
node scripts/export-tank-review.mjs   # rồi mở deliverables/Tank_Clash_P1_Playtest.html ở 2 cửa sổ
```
Chọn "03 / Online 1v1", tạo phòng ở cửa sổ một, nhập mã ở cửa sổ hai. Muốn thử hai máy trong cùng mạng LAN: chạy server với `HOST=0.0.0.0` và mở file với `?server=ws://<IP máy chạy server>:3223/tank` (origin `null` của file chỉ được nhận khi server bind loopback, nên khi bind LAN hãy phục vụ file qua `http://` và thêm origin đó vào `TANK_ALLOWED_ORIGINS`).

## Bước tiếp theo
1. Anh chọn nơi chạy server → deploy staging → chơi thử 10 trận trên hai thiết bị thật, ghi RTT/FPS/cảm nhận.
2. Nếu bắn vào xe đang chạy ở RTT cao thấy khó chịu: thêm lag compensation (server tua lại vị trí theo thời điểm client thấy).
3. P3: 2v2, tổ đội, chơi nhanh 2v2, xem trận, đấu lại theo đội.
