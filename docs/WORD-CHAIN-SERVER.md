# Máy chủ phòng Nối Từ (word-chain)

**Cập nhật08/11/2026:** phòng/PK/ghép trận đã public cùng34.512từ; main086d6ac/NetlifyPublished sau full CI32. Production schema/Edge/handlerAuth/CORS/cron/Vault đã áp theo exception hẹp user duyệt; [bằng chứng](word-chain/PUBLIC-RELEASE-2026-11-08.md). [Pilot2account](qa/WC-STAGING-2026-11-08.md) không thay QA ON5/ON6; online chưa thưởng XP/xu. Các lệnh dưới là runbook staging, không cấp quyền SQL production mới.

## Cách hoạt động

Máy chủ làm trọng tài, theo mẫu Battleship và Duel. Trình duyệt không bao giờ đọc hay ghi dữ liệu phòng trực tiếp.

| Phần | File |
|---|---|
| Luật trận: chuẩn bị 30 giây, đếm 3-2-1, kiểm tra từ, rút giờ theo vòng, loại người, xếp hạng | `src/games/word-chain/rules.ts` (dùng chung với chế độ bot) |
| Phòng 2–4 ghế: tạo phòng có mã, vào bằng mã, ghép trận, chủ phòng bắt đầu sớm, ghép trận tự bắt đầu 20 giây sau khi có người thứ hai, CAS theo version, biên nhận chống gửi lặp, vắng 90 giây thì bị loại, rời phòng, tái đấu bằng bỏ phiếu 60 giây, biểu cảm | `src/games/word-chain/server.ts` |
| Edge Function: xác thực tài khoản (không nhận tài khoản ẩn danh), lấy tên từ tài khoản, hạn mức request, kiểm tra từ bằng cùng từ điển | `supabase/functions/word-chain-room/` (`npm run prepare:word-chain-server` chép code từ `src/` và từ điển từ `public/`) |
| SQL: schema riêng chỉ `service_role` gọi được, `wc_room_create/read/by_code/cas/touch/match/due/rate` | `supabase/word-chain/schema.sql` |
| Lịch `tick` mỗi 10 giây, đã áp staging và gói production được duyệt; chỉ POST khi có room đến hạn | `supabase/word-chain/scheduler.sql` |

Ghép trận: dưới một khoá chung cho hàng đợi, người chơi vào ghế trống đầu tiên của phòng công khai cũ nhất. Phòng đó phải chưa quá 10 phút, còn chỗ, và có người hoạt động trong 90 giây qua. Nếu không có phòng như vậy thì tạo phòng mới. Gửi lại yêu cầu sẽ nhận lại đúng phòng cũ.

Mỗi người chỉ được ở một phòng đang mở. Rời phòng (hoặc bị mời ra vì không sẵn sàng) là được vào phòng khác ngay.

## Kiểm thử

`npm run test:word-chain` (nằm trong `test:fast`) chạy:

- luật trận;
- phòng với bộ lưu trong bộ nhớ;
- schema trên PGlite: quyền, CAS, chống ghi đè khi vắng mặt, heartbeat, ghép trận 4 ghế, hàng đợi hẹn giờ, hạn mức;
- Edge Function chạy end to end qua schema thật, với Auth và PostgREST giả.
- client lifecycle/retry/mất ACK/leave; tổng50check hiện tại. Fixture không thay nhiều tài khoản hoặc thiết bị thật.

Test Edge cũng kiểm tra bản code đã chép trùng với `src/`.

## Mẫu triển khai staging (đối chiếu plan hiện hành)

1. Áp `supabase/word-chain/schema.sql` lên **staging khqipuipeawzlkqmdzdg**; kiểm quyền và `npm run test:word-chain`. Không chạy SQL/script production `whjatkhhupeqfngakmee` theo AGENTS.
2. Chạy `npm run prepare:word-chain-server`, deploy `word-chain-room`; có thể dùng `build:word-chain-edge` tạo artifact một file cho dashboard. Handler xác minh registered user qua Auth.getUser; `supabase/config.toml` đặt `verify_jwt=false` tương ứng. User đã duyệt và dashboard staging đã lưu/reload OFF; không tự áp sang môi trường khác. Giữ biến server do Supabase cấp ở server.
3. WORD_CHAIN_ALLOWED_ORIGINS phải là danh sách exact origin, không wildcard; pilot chỉ127.0.0.1/localhost:4335. Thay public URL staging trong scheduler.sql rồi áp: script tự sinh token tick riêng trong Vault, DB giữ SHA256. Không dùng `wc_room_service_key`, không copy service-role key vào cron/browser. Không đọc/xuất giá trị Vault khi kiểm; chỉ kiểm hash_ready, job active và phản hồi HTTP.
4. Nếu cần thử migration catalog, chỉ thử riêng trên staging. Không chạy SQL/script lên production theo AGENTS; bundled catalog đã giải quyết hiển thị game.
5. Build thử phải dùng URL/key/Auth cùng staging; `preview:word-chain-staging` giữ session RAM riêng từng tab, không reload khi đang giữ tester login. Online pilot không thưởng chung. Thử2–4account theo plan; hai account đã qua,3/4 và thiết bị/mạng thật còn thiếu. Production đã cutover theo gói08/11; không tự triển khai lại từ mẫu staging này.

## Giao diện online (WC4)

- `online-client.ts`: một thao tác gửi tại một thời điểm. Thao tác đợi lần đồng bộ đang chạy xong rồi mới gửi. Nếu người khác vừa đổi phòng (lỗi `VERSION_CONFLICT`, máy chủ chưa áp dụng gì) thì client đồng bộ rồi gửi lại.
- Hỏi trạng thái mỗi giây khi đang có đồng hồ (chuẩn bị, đếm ngược, lượt, tự bắt đầu, tái đấu), 3 giây khi chờ. Hỏi lại ngay khi quay lại tab hoặc có mạng lại.
- `online-platform.ts`: chỉ cho tài khoản đã đăng ký. Nhớ phòng để vào lại sau khi tải lại trang.
- `OnlineRoom.tsx` gồm các màn:
  - tạo phòng (2–4 người), nhập mã, hàng ghép trận;
  - phòng chờ có mã và nút sao chép, ghế trống, nút Bắt đầu cho chủ phòng;
  - trận đấu (dùng chung `MatchView` với chế độ bot);
  - biểu cảm khi đang xem; tái đấu kèm số phiếu và thời gian còn lại.
- Thử không cần máy chủ: `npm run preview:word-chain` tạo `review/word-chain-room-lab.html`. Đó là 4 người chơi trên một màn hình, chạy máy chủ thật với bộ lưu trong trình duyệt. File chỉ dùng để duyệt, không nằm trong bản build.
