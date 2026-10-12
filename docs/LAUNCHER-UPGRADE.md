# Launcher: thiết kế, dữ liệu và phát hành

## Trải nghiệm mới

Launcher dùng nền sáng, thẻ game rõ ràng, tìm kiếm không phân biệt dấu tiếng Việt, bộ lọc, yêu thích và game gần đây. Hồ sơ chỉ giữ thông tin tài khoản cơ bản; không đưa nhiệm vụ, cấp độ, tiền ảo hay trang bị vào launcher.

Luồng chính: splash kiểm tra cập nhật → chọn đăng nhập/đăng ký/chơi khách → đặt tên hiển thị duy nhất khi tài khoản mới chưa hoàn tất hồ sơ → thư viện → hướng dẫn lần đầu → chủ động bấm bắt đầu → chơi → lưu và về thư viện hoặc xem kết quả → chơi lại/về thư viện. Hướng dẫn không tự đếm ngược ép người dùng vào game. Cập nhật không ngắt ván đang chơi.

Game đang dở có nút tiếp tục. Tìm kiếm và bộ lọc được giữ khi quay lại. Màn kết quả hiển thị điểm và kỷ lục, không thêm tiến trình nhập vai của nền tảng. Dialog hỗ trợ bàn phím, giữ focus và chiếm toàn màn hình trên điện thoại.

## Cấu trúc mở

- `src/launcher/catalog.ts`: ghép metadata từ cơ sở dữ liệu với engine đã có trong bản ứng dụng; bỏ game lạ, bản nháp và game đã rút khỏi thư viện.
- `repository.ts`: RPC, cache catalog, hàng đợi đồng bộ yêu thích theo tài khoản, ghi phiên chơi.
- `LauncherContext.tsx`: nguồn trạng thái chung, kiểm tra quyền chơi, yêu thích, gần đây, phiên chơi.
- `launcher.css`: giao diện launcher; không áp bảng màu mới lên bàn chơi của từng game.
- `GameContext` và `GameWrapper`: tích hợp mở/tiếp tục/kết thúc game và màn kết quả.

Bảng `launcher_games` quản lý ID ổn định, engine, tên, mô tả, loại, thứ tự, nổi bật, trạng thái, phiên bản nội dung và hình thức truy cập. Có thể ẩn, bảo trì, rút hoặc xuất bản engine đã tích hợp bằng dữ liệu. Thêm một engine hoàn toàn mới vẫn cần đăng ký module và phát hành ứng dụng; cơ sở dữ liệu không thực thi JavaScript tùy ý.

Không xóa game đã có người mua hoặc dữ liệu lưu: chuyển `status` sang `retired`. Không đổi ID game để đổi tên hiển thị. Catalog rỗng từ máy chủ được tôn trọng, không tự khôi phục game đã rút. Nếu migration chưa chạy hoặc mạng lỗi, thư viện miễn phí tích hợp vẫn dùng được; game premium không được mở bằng cơ chế dự phòng này.

## Dữ liệu Supabase

| Bảng | Vai trò |
|---|---|
| launcher_games | Danh mục và trạng thái game |
| launcher_settings | Cờ thương mại, thông tin ủng hộ đã cấu hình |
| launcher_library | Yêu thích, lần chơi gần nhất theo tài khoản/game |
| launcher_sessions | Phiên chơi, thời điểm kết thúc, điểm tự báo cáo |
| launcher_products / launcher_product_games | Sản phẩm và tập game được mở |
| launcher_orders | Đơn hàng chụp giá và quyền tại thời điểm tạo |
| launcher_payment_events | Sự kiện thanh toán chống xử lý lặp |
| launcher_entitlements | Quyền chơi có thời hạn hoặc vĩnh viễn, có thể thu hồi |

RLS tách dữ liệu từng tài khoản. Client không được sửa giá, danh mục, đơn hàng hay tự cấp quyền. RPC lấy chủ sở hữu từ JWT; RPC thư viện/yêu thích/phiên chơi kiểm tra thêm tài khoản dự kiến để từ chối thao tác đang chờ khi đổi tài khoản. Điểm phiên chơi do client gửi chỉ phục vụ thống kê, không phải bằng chứng để trả thưởng hoặc xác nhận thanh toán.

Khách lưu trên thiết bị. Tài khoản có hàng đợi yêu thích để thử lại khi có mạng. Phiên chơi được ghi theo khả năng kết nối, chưa có hàng đợi phiên chơi offline; đóng tab đột ngột có thể để phiên chưa kết thúc. Lịch sử gần đây ưu tiên các game lưu trên thiết bị rồi bổ sung máy chủ, chưa phải lịch sử liên thiết bị sắp xếp tuyệt đối theo thời gian. Save game và tên hiển thị tiếp tục dùng các migration hiện có.

## Áp dụng trên dự án thật

Đã chuẩn bị SQL, chưa chạy migration launcher trên Supabase thật: môi trường chỉ có publishable key, không có quyền quản trị cơ sở dữ liệu.

1. Sao lưu cơ sở dữ liệu và xác nhận các migration nền tảng/tài khoản/save hiện có đã được áp dụng.
2. Mở SQL Editor của dự án Supabase, chạy toàn bộ `supabase/launcher-upgrade.sql` **một lần**. Đây là bản gộp trong một transaction của hai migration ngày 11/10/2026; không chạy thêm bản gộp nếu đã áp dụng hai migration tương ứng bằng CLI.
3. Kiểm tra catalog có 18 game, tất cả miễn phí; `commerce_enabled` và `donation_enabled` mặc định tắt.
4. Phát hành bản frontend cùng thay đổi rồi kiểm tra đăng ký, xác nhận email theo cấu hình Supabase, đặt tên, đăng nhập lại, yêu thích giữa hai thiết bị và chơi game thật. Kiểm tra Site URL/Redirect URLs theo tên miền triển khai.
5. Nếu cần ngừng một game, đổi trạng thái metadata; không xóa dữ liệu mua hàng/save. Khi sự cố thương mại, tắt cờ thương mại và xử lý quyền đã mua theo chính sách đã công bố.

Các bài kiểm tra dùng PostgreSQL cục bộ và Supabase giả lập trong trình duyệt; chúng không chứng minh cấu hình email, mạng hoặc database production đang hoạt động.

## Bản chơi thử

Ứng dụng đã chạy trong môi trường phát triển và có thể build thành website tĩnh/PWA. Cổng nội bộ không phải link chia sẻ. Cần một đích hosting HTTPS để cung cấp bản chơi thử công khai; hiện chưa có URL triển khai được xác minh. Không đặt service_role key vào frontend hoặc gói build.
