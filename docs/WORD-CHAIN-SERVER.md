# Máy chủ phòng Nối Từ (word-chain)

**Trạng thái:** máy chủ, giao diện online và test đã có, **chưa triển khai**. Trong game, các nút Ghép trận, Tạo phòng và Nhập mã vẫn báo "đang chờ bật máy chủ" vì `src/games/word-chain/online-config.json` đang `enabled: false`. Luyện với bot chơi được ngay, kể cả khi offline.

## Cách hoạt động

Máy chủ làm trọng tài, theo mẫu Battleship và Duel. Trình duyệt không bao giờ đọc hay ghi dữ liệu phòng trực tiếp.

| Phần | File |
|---|---|
| Luật trận: chuẩn bị 30 giây, đếm 3-2-1, kiểm tra từ, rút giờ theo vòng, loại người, xếp hạng | `src/games/word-chain/rules.ts` (dùng chung với chế độ bot) |
| Phòng 2–4 ghế: tạo phòng có mã, vào bằng mã, ghép trận, chủ phòng bắt đầu sớm, ghép trận tự bắt đầu 20 giây sau khi có người thứ hai, CAS theo version, biên nhận chống gửi lặp, vắng 90 giây thì bị loại, rời phòng, tái đấu bằng bỏ phiếu 60 giây, biểu cảm | `src/games/word-chain/server.ts` |
| Edge Function: xác thực tài khoản (không nhận tài khoản ẩn danh), lấy tên từ tài khoản, hạn mức request, kiểm tra từ bằng cùng từ điển | `supabase/functions/word-chain-room/` (`npm run prepare:word-chain-server` chép code từ `src/` và từ điển từ `public/`) |
| SQL: schema riêng chỉ `service_role` gọi được, `wc_room_create/read/by_code/cas/touch/match/due/rate` | `supabase/word-chain/schema.sql` |
| Lịch gọi `tick` mỗi 10 giây (mẫu, chưa áp) | `supabase/word-chain/scheduler.sql` |

Ghép trận: dưới một khoá chung cho hàng đợi, người chơi vào ghế trống đầu tiên của phòng công khai cũ nhất. Phòng đó phải chưa quá 10 phút, còn chỗ, và có người hoạt động trong 90 giây qua. Nếu không có phòng như vậy thì tạo phòng mới. Gửi lại yêu cầu sẽ nhận lại đúng phòng cũ.

Mỗi người chỉ được ở một phòng đang mở. Rời phòng (hoặc bị mời ra vì không sẵn sàng) là được vào phòng khác ngay.

## Kiểm thử

`npm run test:word-chain` (nằm trong `test:fast`) chạy:
- luật trận;
- phòng với bộ lưu trong bộ nhớ;
- schema trên PGlite: quyền, CAS, chống ghi đè khi vắng mặt, heartbeat, ghép trận 4 ghế, hàng đợi hẹn giờ, hạn mức;
- Edge Function chạy end to end qua schema thật, với Auth và PostgREST giả.

Test Edge cũng kiểm tra bản code đã chép trùng với `src/`.

## Triển khai (chủ dự án làm)

1. Áp `supabase/word-chain/schema.sql` lên **project staging** trước, rồi chạy lại `npm run test:word-chain`. Không áp thẳng lên production `whjatkhhupeqfngakmee` khi chưa thử.
2. Chạy `npm run prepare:word-chain-server`, rồi deploy `supabase/functions/word-chain-room` với `verify_jwt` mặc định. Biến môi trường `SUPABASE_URL` và `SUPABASE_SERVICE_ROLE_KEY` do Supabase cấp.
3. Tạo secret `wc_room_service_key` trong Vault của database, thay URL trong `supabase/word-chain/scheduler.sql`, rồi chạy file này.
4. Áp `supabase/migrations/20261102090000_word_chain_catalog.sql` để game hiện trong danh mục production.
5. Đặt `enabled: true` trong `src/games/word-chain/online-config.json`, build lại, rồi thử với 2–4 tài khoản thật.

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
