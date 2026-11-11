# Quyền riêng tư trên ArcadeX
Trang này mô tả các nhóm dữ liệu và lựa chọn hiện có khi sử dụng ArcadeX. Thông tin được cập nhật ngày 11/11/2026; cần đọc lại khi dự án bổ sung tính năng trực tuyến hoặc quảng cáo.
## Dữ liệu trên thiết bị
Trình duyệt lưu hồ sơ người chơi, tiến trình và điểm số của trò có hỗ trợ, tùy chọn âm thanh, game yêu thích và trạng thái phiên. Local storage, session storage và bộ nhớ đệm phục vụ việc mở lại thư viện, tiếp tục ván chơi và tải gói game offline.
Xóa dữ liệu trang trong cài đặt trình duyệt sẽ xóa bản lưu cục bộ và gói offline trên thiết bị đó. Hành động này không tự xóa dữ liệu tài khoản đã lưu trên máy chủ. Duyệt riêng tư, giới hạn dung lượng hoặc thao tác dọn bộ nhớ có thể làm mất dữ liệu cục bộ.
## Tài khoản và dịch vụ trực tuyến
Các tính năng tài khoản và đồng bộ sử dụng Supabase. Khi đăng ký hoặc đăng nhập, dịch vụ xử lý thông tin tài khoản như email, thông tin xác thực phiên và hồ sơ liên quan. Một số chức năng online có thể tạo phiên khách ẩn danh để liên kết dữ liệu người chơi; chế độ khách không có nghĩa mọi thao tác đều diễn ra trên thiết bị.
Khi dùng đồng bộ, bảng xếp hạng, lịch sử trận, bạn bè hoặc chat, dữ liệu cần cho chức năng tương ứng được gửi tới dịch vụ dự án. Tên hiển thị, điểm hoặc nội dung bạn gửi trong phần cộng đồng có thể được người chơi khác nhìn thấy. Không đưa thông tin riêng tư vào tên hiển thị hoặc tin nhắn.
Trận trực tuyến gửi thao tác và trạng thái trận tới máy chủ phòng. Việc tải website và kết nối dịch vụ cũng cung cấp cho nhà cung cấp hạ tầng các thông tin kết nối như địa chỉ IP và đặc điểm trình duyệt theo cách dịch vụ đó vận hành.
## Nhà cung cấp hạ tầng
Website sử dụng Netlify; tài khoản và dữ liệu online sử dụng Supabase; một số máy chủ trận sử dụng Render. Xem chính sách của [Netlify](https://www.netlify.com/privacy/), [Supabase](https://supabase.com/privacy) và [Render](https://render.com/privacy) để biết cách các nhà cung cấp xử lý dữ liệu của họ.
## Quảng cáo
Phiên bản này chưa bật quảng cáo Google, chưa tải SDK AdSense và không yêu cầu bạn đồng ý quảng cáo. Nếu dự án bật quảng cáo sau này, trang này sẽ cần cập nhật thông tin về đối tác, cookie, lựa chọn đồng ý và cách thay đổi lựa chọn trước khi phát hành.
## Lựa chọn của bạn
Bạn có thể chơi các tính năng hỗ trợ chế độ khách, hạn chế chia sẻ thông tin trong cộng đồng, đăng xuất khỏi thiết bị dùng chung và xóa dữ liệu cục bộ qua cài đặt trình duyệt. Đăng xuất hoặc xóa dữ liệu trình duyệt không phải yêu cầu xóa tài khoản trên máy chủ.
Để hỏi về dữ liệu hoặc yêu cầu xử lý tài khoản, xem [liên hệ](/thong-tin/lien-he/). Kênh công khai chỉ dùng để hỏi phương thức liên lạc riêng; không gửi dữ liệu nhận dạng vào issue. Dự án chưa công bố một thời hạn lưu trữ chung cho mọi nhóm dữ liệu hoặc quy trình xóa tài khoản tự phục vụ.
