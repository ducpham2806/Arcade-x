# Chuyển ArcadeX sang Supabase

Mã nguồn hiện dùng `@supabase/supabase-js`. Firebase SDK, cấu hình và rules cũ đã được bỏ khỏi repository. Chat, lượt thích, hồ sơ/presence, bảng xếp hạng ngày/tổng, kho đồ, phiên chơi, thử thách và cả hai dịch vụ PvP đều gọi Supabase.

## Kích hoạt dự án của bạn

Dự án đã được cấu hình trong `.env.local` của môi trường hiện tại. File này bị Git bỏ qua. Khi chuyển sang môi trường triển khai khác, đặt:

```dotenv
VITE_SUPABASE_URL=https://YOUR_PROJECT.supabase.co
VITE_SUPABASE_PUBLISHABLE_KEY=YOUR_PUBLISHABLE_KEY
```

Có thể dùng `VITE_SUPABASE_ANON_KEY` thay cho publishable key với dự án dùng key cũ. Không dùng secret/service_role key trong biến `VITE_*`. Những biến này được Vite đưa vào ứng dụng khi build; cần build lại khi đổi dự án.

Với dự án `whjatkhhupeqfngakmee`:

1. Mở [SQL Editor](https://supabase.com/dashboard/project/whjatkhhupeqfngakmee/sql/new), sao chép toàn bộ [bản SQL](../supabase/migrations/202610090001_arcadex.sql), dán vào và bấm **Run**. Chạy một lần. Toàn bộ migration nằm trong giao dịch; nếu có lỗi, các thay đổi trong lần chạy đó được hoàn tác.
2. Vào **Authentication → Sign In / Providers**, bật **Anonymous Sign-Ins**. Ứng dụng dùng danh tính Supabase của trình duyệt để bảo vệ dữ liệu của người chơi khách và các hồ sơ cục bộ.
3. Tải lại ứng dụng. Kiểm tra gửi chat và nút đồng bộ kho đồ. Nếu vẫn báo lỗi, kiểm tra SQL đã chạy thành công, anonymous sign-in đã bật và biến môi trường đã được áp dụng trước build.

Publishable key chỉ cấp quyền gọi API ứng dụng, **không cấp quyền tạo bảng, tạo hàm SQL hoặc sửa thiết lập Auth**. Vì vậy không thể hoàn thành bước 1–2 chỉ với URL và key này. Không gửi service_role key hoặc mật khẩu database vào chat.

## Cách lưu dữ liệu

Để giữ nguyên dữ liệu JSON của 18 trò, Postgres lưu tài liệu trong bảng `arcadex_documents`:

| Đường dẫn | Dữ liệu |
|---|---|
| `players/{id}` | Hồ sơ, thống kê, trạng thái online |
| `players/{id}/inventory_data/main` | Kho đồ, rương, thông thạo, bản thiết kế |
| `players/{id}/game_sessions/current` | Phiên chơi được lưu |
| `chat_messages/{id}` | Tin nhắn và lượt thích |
| `leaderboards/{game}/scores/{id}` | Điểm của trò |
| `daily_leaderboards/{game_date}/scores/{id}` | Điểm ngày |
| `daily_challenges/{id}` | Tiến trình thử thách ngày |
| `friend_challenges/{id}` | Lời thách đấu bạn bè |
| `game_rooms/{id}` | Phòng PvP |
| `matchmaking_queue/{id}` | Hàng chờ ghép trận |

`arcadex_player_bindings` gắn mã hồ sơ với `auth.uid()` của Supabase. Tài khoản đăng ký dùng UID Supabase làm mã hồ sơ; khách có mã riêng và tiến trình trên thiết bị. Khi chuyển sang khách sau đăng xuất, mã khách được đổi để không dùng nhầm danh tính anonymous cũ, đồng thời khôi phục dữ liệu khách đã lưu.

## Đăng ký, đăng nhập và chơi khách

Bản màn hình tài khoản mới cần chạy thêm [migration tên hiển thị duy nhất](../supabase/migrations/202610100001_identity.sql) một lần sau migration nền tảng. Xem [hướng dẫn màn hình tài khoản và cập nhật](AUTH-ENTRY-AND-UPDATES.md). Trước launcher có màn hình riêng với ba lựa chọn: **Chơi như khách**, **Đăng nhập**, **Đăng ký**. Cửa sổ đăng nhập cũng có nút chơi khách.

- Đăng ký bằng tên hiển thị, email, mật khẩu ít nhất 8 ký tự và ảnh đại diện. Nếu bật xác nhận email trong Supabase, ứng dụng yêu cầu mở thư xác nhận trước khi đăng nhập; người chơi vẫn có thể chơi khách trong lúc chờ.
- Đăng nhập bằng **email và mật khẩu** qua Supabase Auth. Tên hiển thị không phải tên đăng nhập. Không lưu mật khẩu hay hàm băm tự viết trong localStorage; session/token do SDK Supabase quản lý.
- Checkbox giữ tiến trình khách chuyển dữ liệu của thiết bị này vào tài khoản mới khi đăng nhập lần đầu. Nếu cần xác nhận email, hãy đăng nhập lần đầu trên thiết bị đã đăng ký để lấy tiến trình khách đó. Không dùng dữ liệu khách để ghi đè một tài khoản đã có dữ liệu cloud.
- Đăng xuất trở về hồ sơ khách riêng. Đổi sang tài khoản khác cần đăng xuất rồi nhập email/mật khẩu, không còn nút chuyển tài khoản bỏ qua xác thực.
- Hồ sơ, kho đồ, rương, phiên tạm dừng và tiến trình riêng của các trò được lưu tách theo tài khoản. Snapshot đầy đủ nằm trong trường riêng tư `players/{uid}/inventory_data/main.accountState`, dùng các quyền SQL hiện có. Dữ liệu được khôi phục trước khi các provider trò chơi được khởi tạo, tránh ghi hồ sơ trắng đè lên dữ liệu đã lưu.
- Checkpoint lưu local và thử đồng bộ mỗi 5 giây, khi mạng trở lại, khi rời trang và lúc đăng xuất. Đóng trang đột ngột không bảo đảm request cloud kịp hoàn tất; bản local vẫn dùng lại trên thiết bị. Khi offline có thể tiếp tục chơi và đăng xuất cục bộ; việc thu hồi session phía máy chủ không thể thực hiện trong lúc mất mạng.
- Nếu không tải được dữ liệu trên thiết bị mới, ứng dụng cho thử lại hoặc chơi khách; không tự tạo hồ sơ trắng và đồng bộ đè lên tài khoản.
- Hai thiết bị cùng thay đổi tiến trình một lúc chưa có cơ chế hợp nhất toàn bộ snapshot: bản mới hơn được ưu tiên khi đăng nhập. Không nên chơi đồng thời một tài khoản trên nhiều thiết bị nếu cần bảo đảm mọi thay đổi đều được giữ.

Trong Supabase, kiểm tra **Authentication → Providers → Email** đã bật. Với xác nhận email, vào **Authentication → URL Configuration**, đặt **Site URL** và thêm địa chỉ ứng dụng vào **Redirect URLs**. Liên kết xác nhận gửi về `window.location.origin + '/'`; địa chỉ ứng dụng cần được Supabase cho phép. Anonymous Sign-Ins dùng cho các chức năng online của khách; khách vẫn chơi các trò offline nếu chưa bật chức năng này.

Tài khoản cũ được tạo cục bộ chưa trở thành tài khoản Supabase. Cần đăng ký email mới; tiến trình đang có trên máy có thể giữ bằng checkbox lúc đăng ký. Mật khẩu cũ không được chấp nhận thay cho Supabase Auth.

Mã mới không tự lấy các bản ghi đã tồn tại trên Firestore. LocalStorage hiện có được giữ và tiếp tục dùng. **Chưa di chuyển dữ liệu cloud cũ.** Nếu cần chuyển lịch sử Firestore, phải xuất dữ liệu bằng quyền quản trị, lập bản đồ người sở hữu sang Supabase Auth và nhập riêng; không gán toàn bộ dữ liệu cũ cho người khách đầu tiên.

## Quyền truy cập và giao dịch

- Bật RLS, không cho trình duyệt insert/update/delete trực tiếp vào bảng.
- Ghi dữ liệu qua `arcadex_commit`; danh tính lấy từ JWT Supabase, không tin mã người dùng do client tự khai.
- Kho đồ và phiên chơi chỉ chủ danh tính đọc được. Danh bạ công khai trả về các trường cho phép, bỏ xu/ngọc. Chat và bảng điểm đọc được bởi người dùng đã xác thực, gồm khách anonymous.
- Phòng đang đấu chỉ các thành viên đọc được; phòng chờ có thể được tìm để tham gia. Phòng riêng dùng mã mời, không phải dữ liệu bí mật có thể giấu khỏi toàn bộ người dùng đã xác thực.
- Giao dịch khóa ngắn phía Postgres và so sánh phiên bản trước khi ghi. Xung đột khiến client đọc lại và thử lại tối đa 5 lần. Số phiên bản tăng toàn cục, tránh dùng lại phiên bản sau khi xóa/tạo tài liệu.
- Máy chủ kiểm tra thành viên, lượt đi, thay đổi danh tính, nhận hòa/đầu hàng/timeout; cập nhật ELO hai người cùng giao dịch khi phòng kết thúc.
- Realtime dùng `postgres_changes` với quyền SELECT. Có đọc ban đầu và polling mỗi 5 giây để phục hồi sau mất kết nối hoặc xóa tài liệu. Hủy subscription chặn callback muộn.
- Dữ liệu offline vẫn lưu trên thiết bị; dịch vụ không trả `true` cho đồng bộ cloud thất bại. Chưa có hàng đợi bảo đảm gửi lại toàn bộ chat/điểm đã phát sinh offline.

Chuyển backend không tự giải quyết chống gian lận điểm số hoặc luật cờ hoàn toàn phía máy chủ. Điểm và một phần kết quả thắng vẫn xuất phát từ client; chưa nên coi bảng xếp hạng là hệ thống thi đấu có giá trị tiền thưởng. Các lỗi trò chơi trong báo cáo đánh giá trước cũng chưa được sửa trong thay đổi này.

Khóa giao dịch chung phù hợp quy mô thử nghiệm. Khi có nhiều trận đồng thời, cần chuyển sang khóa theo phòng/hàng chờ và các RPC riêng cho từng thao tác.

## Kiểm tra

```bash
bun install --frozen-lockfile
npm run lint
npm run build
npm run test:supabase
npm run test:auth
```

`test:supabase` cần Docker. Script tạo PostgreSQL 16 riêng, giả lập vai trò và `auth.uid()` để kiểm tra migration/quyền/giao dịch; không dùng URL hoặc key dự án thật, không mở cổng mạng và tự xóa container. Phép kiểm tra bao gồm lưu phiên, kho đồ riêng, thông tin công khai, chống sửa hồ sơ/tin nhắn người khác, lượt thích, tham gia phòng, sai lượt, xung đột phiên bản, ELO, ghép trận và thách đấu. Đây chưa phải thử nghiệm toàn bộ dịch vụ Supabase Auth/Realtime đang triển khai.

Trong môi trường này còn kiểm tra ứng dụng bằng Chromium qua API mô phỏng nối đến PostgreSQL thật: hai danh tính, lưu/đọc phiên, chat/lượt thích, phòng riêng và nước đi, retry sau xung đột, đọc subscription ban đầu và chơi 2048. Việc phát sự kiện websocket Realtime thật chưa được xác nhận.

Kết nối đọc tới dự án thật bị proxy môi trường trả `403 Forbidden` khi mở kết nối HTTPS. Vì vậy chưa xác minh cấu hình Auth, sự tồn tại của bảng hoặc hoạt động live của dự án đã cung cấp, và chưa chạy migration lên dự án đó.

`test:auth` dùng Playwright và API Supabase mô phỏng, không gửi email hay sửa dữ liệu dự án thật. Kiểm tra chơi khách, xác thực form, đăng ký/xác nhận email, mật khẩu sai, tách dữ liệu khi đăng xuất/đổi tài khoản, khôi phục trên trình duyệt mới, đăng xuất offline, lỗi tải cloud và hủy kết quả tải tài khoản muộn. Nếu chưa có Chromium, chạy `npx playwright install chromium` hoặc đặt `CHROMIUM_EXECUTABLE`.
