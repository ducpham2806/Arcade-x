# ArcadeX — Đợt B: luồng tài khoản
Ngày 12/10/2026. Source gốc: ba3919c648fcf3e3122c7ce7a444901ca5892462.
Supabase mục tiêu: whjatkhhupeqfngakmee.

## Phần đã triển khai trong mã nguồn
- Quên mật khẩu: email được chuẩn hóa, gửi resetPasswordForEmail với redirect cùng origin vào /?auth=recovery.
- Gửi lại xác nhận email: resend(type=signup), xuất hiện sau đăng ký cần xác nhận hoặc đăng nhập báo email chưa xác nhận.
- Cooldown gửi email 60 giây được đặt trước request; phản hồi trung lập không xác nhận tài khoản có tồn tại hay không.
- Màn đặt mật khẩu mới riêng: bắt PASSWORD_RECOVERY, kiểm chủ phiên bằng getUser trước updateUser, đối chiếu mật khẩu mới và xác nhận.
- URL có marker recovery không được xem là quyền đổi mật khẩu; chỉ sự kiện recovery của SDK hoặc phiên recovery đã ghi nhận và xác minh lại mới cho nhập mật khẩu.
- Tải lại trang trong phiên khôi phục được hỗ trợ bằng marker owner trong sessionStorage tối đa 30 phút; JWT/session vẫn do Supabase quản lý.
- Chặn account restore/checkpoint và cloud identity trong lúc khôi phục; sau thành công mới tải tài khoản.
- Link xác nhận/khôi phục hết hạn có thông báo để yêu cầu lại; tham số token và lỗi được loại khỏi URL.
- Trong hồ sơ tài khoản có nút gửi email đổi mật khẩu.
- Giữ luồng lựa chọn tiến trình khách và hồ sơ/tên duy nhất hiện có.

Không thay đổi schema, mật khẩu database, SMTP hoặc URL Auth production trong lượt này. Không có khóa server hay mật khẩu database trong các file thay đổi.

## Kiểm thử
TypeScript (npm run lint): PASS.
Vite production build: PASS. Các cảnh báo chunk lớn/PWA hiện có vẫn còn; không phải đợt tối ưu tải game.
Checkout phục vụ kiểm thử gồm source/config/lockfile; gói public asset lớn không tải đầy đủ, vì vậy build này không phải gói website hoàn chỉnh để phát hành.

Bộ Playwright Auth: **23/23 PASS** trong một lượt chạy (1,8 phút), dùng Chromium thật và API Supabase mô phỏng:
- Đăng ký, xác nhận email, đăng nhập/đăng xuất, lựa chọn khách, chuyển tài khoản.
- Khôi phục trên trình duyệt mới, offline logout, lỗi cloud không ghi đè và hủy hydrate muộn.
- Tên duy nhất, chuẩn hóa tên, chỉnh avatar giữ draft.
- Quên mật khẩu, redirect cùng origin và cooldown không gửi request lặp.
- Gửi lại email xác nhận và email_not_confirmed.
- Recovery hợp lệ, mismatch, updateUser, tải lại recovery.
- Recovery hết hạn và marker giả không cho update.
- Giao diện 320/390 px không tràn ngang, giữ draft khi server báo weak_password.
- Phiên hết hạn kích hoạt refresh_token rồi khôi phục đúng owner.
- Confirmation callback hết hạn có thông báo và xóa tham số lỗi.

Các fixture là mock trong browser context; không gửi email đến hộp thư thật, không tạo/xóa tài khoản production. Không gọi kiểm thử mock là nghiệm thu Auth production.

## Phần phải xác minh tiếp trên môi trường thật
Đợt B chưa được nghiệm thu end-to-end production cho đến khi có:
1. URL HTTPS đang dùng cho Arcade-x và bản source này được deploy.
2. Hộp thư thử được chỉ định để nhận email xác nhận/recovery.

Trong Supabase Authentication → URL Configuration:
- Site URL là origin HTTPS của website.
- Redirect URLs cho phép /?auth=confirmation và /?auth=recovery (có thể dùng https://YOUR-HOST/** cho đúng host).
- Không tự thay Site URL bằng localhost hoặc website của CRM/podcast.
- Khi thay domain/preview host, cập nhật allowlist trước khi kiểm email.

Công cụ Supabase MCP hiện có không cung cấp thao tác đọc/ghi Auth URL Configuration hoặc SMTP; chưa kiểm được cấu hình này chỉ bằng publishable key hoặc mật khẩu PostgreSQL.
Hai kết nối Netlify hiện có không tìm thấy project có tên arcade; không suy đoán URL production.

Đăng ký Email/Anonymous vẫn bật và email yêu cầu xác nhận theo kiểm tra API công khai của project. Điều này không chứng minh thư đã đến hộp thư.
Theo tài liệu Supabase, SMTP mặc định phục vụ thử nghiệm và giới hạn người nhận/tần suất; khi cho người chơi công khai, cần kiểm cấu hình SMTP riêng:
https://supabase.com/docs/guides/auth/auth-smtp

## Trình tự nghiệm thu production
1. Deploy nhánh đợt B lên URL thử; xác nhận Site URL/allowlist khớp.
2. Đăng ký bằng hộp thư thử, xem confirmation_required và mở link trên tab/trình duyệt mới.
3. Hoàn tất tên, lưu tiến trình thử, logout, login và reload.
4. Cho phiên hết hạn/refresh; account UUID và save vẫn đúng.
5. Gửi recovery, mở link, kiểm chỉ thấy form password; mismatch không gửi update.
6. Đổi password, logout; password cũ thất bại và password mới thành công.
7. Mở lại link đã dùng/hết hạn: lỗi rõ, không tải/ghi nhầm tài khoản.
8. Kiểm tài khoản A/B, guest registration keep/no-keep và backend read lỗi.
9. Kiểm thư rác, SMTP delivery/log và rate limit thực tế; không tắt xác nhận email để bỏ qua kiểm thử.

Luồng save Dungeon, snapshot CAS và nhiều tab/hai thiết bị nằm trong đợt C. PR đợt A vẫn độc lập; backend A đã triển khai.

