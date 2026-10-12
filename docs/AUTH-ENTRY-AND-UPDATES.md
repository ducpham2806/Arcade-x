# Màn hình vào ứng dụng, hồ sơ và cập nhật ArcadeX

## Cần làm trên Supabase trước khi dùng bản mới

Bạn đã chạy SQL nền tảng trước đây. Chỉ chạy thêm file [202610100001_identity.sql](../supabase/migrations/202610100001_identity.sql) **một lần**:

1. Mở [SQL Editor của dự án](https://supabase.com/dashboard/project/whjatkhhupeqfngakmee/sql/new).
2. Sao chép toàn bộ file SQL trên, dán vào ô soạn thảo và bấm **Run**.
3. Khi chạy thành công, tải lại ứng dụng.

File mới tạo bảng tên hiển thị và hai API đọc/lưu hồ sơ. Không xóa hay làm lại tiến trình game. Migration chạy trong một giao dịch; nếu có lỗi thì các thay đổi của lần chạy đó được hoàn tác. Không chạy lại migration nền tảng đã có.

Publishable key không có quyền tạo bảng/hàm hoặc sửa cấu hình Authentication. Môi trường này chưa áp dụng migration lên dự án thật, chưa xác nhận email thật hoặc phát hành ứng dụng lên hosting.

Trong **Authentication → URL Configuration**, đặt Site URL và thêm Redirect URL của địa chỉ hosting thực tế để liên kết xác nhận email quay về đúng ứng dụng. Giữ provider Email bật. Với Confirm email bật, người dùng cần xác nhận email trước khi đăng nhập. Anonymous Sign-Ins dùng cho các chức năng online của khách; game offline không cần đăng ký.

## Luồng sử dụng

- Mở ứng dụng: splash kiểm tra phiên bản và khôi phục dữ liệu, sau đó hiển thị màn hình riêng. Launcher chưa được gắn vào giao diện lúc này.
- Chọn **Đăng nhập**, **Đăng ký**, hoặc **Chơi như khách**. Không thể đóng màn hình này bằng Escape hoặc bấm nền để bỏ qua lựa chọn.
- Đăng ký: email, mật khẩu ít nhất 8 ký tự, nhập lại mật khẩu và tùy chọn giữ tiến trình khách. Mật khẩu do Supabase Auth xử lý; không lưu mật khẩu trong hồ sơ/localStorage của ứng dụng.
- Sau khi xác nhận email và đăng nhập lần đầu: đặt tên hiển thị và chọn một trong sáu ảnh đại diện. Chỉ vào launcher sau khi lưu thành công. Nếu Supabase không yêu cầu xác nhận email, bước này xuất hiện ngay sau đăng ký.
- Tên dài 3–24 ký tự, chuẩn hóa Unicode NFKC, khoảng trắng và không phân biệt hoa/thường. Ràng buộc UNIQUE trong PostgreSQL quyết định người giữ tên, kể cả khi hai người lưu cùng lúc.
- Tài khoản đã hoàn tất hồ sơ: lần mở tiếp theo có nút **Tiếp tục vào launcher**, không cần nhập lại mật khẩu nếu phiên đăng nhập còn hiệu lực.
- Tài khoản cũ chưa có bản ghi tên duy nhất: chọn tên một lần khi dùng bản mới. Điểm, phiên đang dừng và tiến trình được giữ.
- **Tài khoản** trong launcher cho sửa tên/ảnh đại diện; tài khoản đăng nhập luôn lưu và kiểm tra tên trên máy chủ. Khi trùng hoặc mất kết nối, không ghi đè tên cũ bằng tên chưa lưu.
- Khách vào chơi ngay, dữ liệu lưu trên trình duyệt. Đăng xuất trở về màn hình lựa chọn. Đổi tài khoản và phục hồi dữ liệu tiếp tục dùng cơ chế tách tiến trình đã có.

Email nằm trong Supabase Auth; tên, ảnh đại diện và thời điểm cập nhật nằm trong `arcadex_identities`, gắn với UID của tài khoản. Chỉ chủ tài khoản được đọc/lưu bản ghi của mình qua RPC. Trigger giữ tên/ảnh đại diện của bản ghi player theo danh tính đã được xác nhận, ngăn bản ứng dụng cũ ghi đè tên hợp lệ. Bảng danh tính không cho trình duyệt ghi trực tiếp; khách anonymous không được giữ tên tài khoản.

## Splash và cập nhật

Thanh tiến trình phản ánh các bước khởi động/kiểm tra service worker/khôi phục hồ sơ. Đây là tiến trình theo bước, không phải phần trăm byte tải xuống. Không còn số ngẫu nhiên hay thông báo kiểm tra toàn vẹn/cập nhật thành công giả.

Bản production PWA kiểm tra `sw.js` ở cùng hosting khi mở, mỗi 60 giây khi online và khi mạng trở lại. Nội dung build mới tạo service worker mới; không cần hardcode một số phiên bản tương lai.

- Lúc mở ứng dụng, cập nhật sẵn sàng được kích hoạt trên splash nếu bật tự cập nhật.
- Khi đang chơi, bản mới ở trạng thái chờ, không chặn game hay tự tải lại.
- Quay về launcher: bấm **Cập nhật & khởi động lại** để lưu tiến trình, kích hoạt worker và tải lại một lần sau khi worker thực sự `activated`.
- Tải/kích hoạt lỗi: hiện lỗi và nút thử lại; trên splash có lựa chọn tiếp tục dùng bản hiện tại. Không xóa cache của bản đang chơi để giả lập cập nhật.
- Tắt tự cập nhật: splash không tự kích hoạt; launcher vẫn hiện bản mới sẵn sàng.
- Cài PWA và cập nhật cần HTTPS hoặc localhost và một trình duyệt hỗ trợ service worker. Trong Vite dev, splash hoạt động nhưng cập nhật service worker được kiểm tra bằng build production/preview.

Để phát hành bản tiếp theo: build và đưa toàn bộ `dist/` lên cùng hosting, bảo đảm `sw.js` được kiểm tra lại (khuyến nghị `Cache-Control: no-cache`), giữ các asset hash cũ trong lúc chuyển bản. Không đưa HTML của một bản và JS/SW của bản khác lên hosting trong các thời điểm tách rời.

## Kiểm tra

- `npm run lint`, `npm run build`.
- `npm run test:supabase`: PostgreSQL 16 tách biệt, áp dụng cả hai migration; kiểm tra quyền, chuẩn hóa, dữ liệu cũ không ghi đè tên và hai giao dịch thực tranh một tên. Không dùng database production.
- `npm run test:auth`: SDK Supabase thật qua API mô phỏng; đăng ký, xác nhận email, đăng nhập, khách, bước đặt tên, trùng tên, sửa tên, mất kết nối, nhiều thiết bị và tách tiến trình.
- `npm run test:qc`: mở/chơi/dừng 18 game, UI desktop/mobile, launcher, hồ sơ và luật game. Các test vào game chọn khách bằng nút thật trên màn hình riêng.
- `npm run test:pwa`: build PWA và chơi 2048 ngoại tuyến qua preview cổng 4173.
- `npm run test:update`: Chromium và server HTTP tạm, thật sự cài/đổi service worker, tải HTML bản mới, trì hoãn trong game, cập nhật ở splash, phục hồi khi HTTP 503 và tiếp tục phiên offline. Chỉ sửa nội dung release của bản build được phục vụ trong server test; không sửa file build hoặc giả trạng thái SW trong ứng dụng. Font bên ngoài bị loại khỏi HTML test để phép thử không phụ thuộc mạng Google Fonts.

Kết quả và ảnh nằm trong `/workspace/arcadex-auth-entry/`. Thử nghiệm browser Auth không gửi email thật; kiểm tra SQL chạy trên PostgreSQL tách biệt; thử cập nhật chạy trên HTTP localhost, chưa phải hosting production.

## Kết quả ngày 11/10/2026

- TypeScript và build production đạt; vẫn có cảnh báo bundle lớn đã tồn tại.
- 111 ca browser duy nhất đã được xác nhận đạt qua các lượt bên dưới, không còn lỗi chưa giải quyết.
- Lượt đầy đủ: 107/109 đạt. Hai ca Mummy desktop và Sudoku campaign bị Vite tải lại trang khi file tài liệu/package được sửa. Log Vite xác nhận lần tải lại; ảnh/trace cho thấy trang trở về màn hình lựa chọn.
- Lượt hồi quy cuối: 9/9 đạt, gồm hai ca trên, hồ sơ desktop/mobile, sửa tên tài khoản và hai ca mới về tên chuẩn hóa và SQL chưa được áp dụng.
- Lượt bố cục cuối: 3/3 đạt ở 1440, 390 và 320px; trên 390px nút chơi khách nằm trong viewport ngay khi mở màn hình.
- PostgreSQL: 41 kiểm tra đạt, gồm hai giao dịch thật giữ cùng tên và chỉ một giao dịch thành công.
- PWA: worker mới được cài/kích hoạt thật; cập nhật ở splash và launcher đạt, không chặn khi đang chơi, phục hồi từ HTTP 503 và tiếp tục phiên offline đạt.
- Bản PWA preview: service worker kiểm soát trang, tải lại khi offline và chơi 2048 có điểm > 0, không có lỗi JavaScript.

Đây là tổng hợp ca duy nhất từ lượt đầy đủ và các lượt hồi quy, không phải một lượt 111/111 liên tục. JSON gốc: `full-results.json`, `final-results.json`, `mobile-results.json`; tổng hợp: `verification-summary.json` trong thư mục bằng chứng. Lượt kiểm tra bị dừng để sửa updater cũng được giữ riêng, không tính là một lượt đạt.

Các ảnh tài khoản dùng email demo qua API mô phỏng; chưa tạo tài khoản demo, chạy migration mới hay triển khai bản này trên dự án production của người dùng.
