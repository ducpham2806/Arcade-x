# Kiểm thử launcher — 11/10/2026

- TypeScript (`npm run lint`): đạt.
- Build production (`npm run build`): đạt.
- Toàn bộ Playwright: 138 bài chạy, 137 đạt, 1 thất bại vì bài cũ đòi carousel đã bỏ. Không bỏ qua bài nào.
- Bài thay thế cho game gợi ý cố định: kiểm tra reduced motion, nội dung không tự đổi, mở thông tin, thoát bằng Escape, vào Car Escape, chọn cấp độ và tạm dừng. Lần chạy cuối đạt 1/1. Lần chạy đầu của bài thay thế thiếu thao tác chọn cấp độ; đã bổ sung thao tác theo flow thực tế.
- Không chạy lại toàn bộ suite sau thay đổi chỉ ở bài kiểm tra, SQL và tài liệu. Kết quả là 137 bài đạt trong lượt toàn bộ + 1 bài đã sửa và chạy lại đạt, không phải một lượt 138/138 duy nhất.
- PostgreSQL 16: 72 kiểm tra đạt, gồm RLS, tên duy nhất, quyền chơi, đơn hàng, sự kiện trùng, hoàn tiền, cách ly tài khoản, tài khoản thay đổi giữa thao tác và yêu cầu thời hạn thuê bao.
- PWA/service worker thực: cập nhật hoãn trong game, kích hoạt ở launcher, cập nhật lúc khởi động, phục hồi khi cập nhật lỗi, reload offline và tiếp tục ván đều đạt; không có page error trong các lượt này.
- Kiểm tra ảnh desktop 1440, mobile 390 và 320; sửa nền ô tìm kiếm và lớp phủ màn kết quả.

Giới hạn: trình duyệt Chromium tự động; Supabase trình duyệt dùng backend giả lập, SQL chạy database cục bộ. Chưa kiểm tra production, Safari/iOS thật, thiết bị cấu hình thấp hoặc thanh toán thực. Kiểm tra launcher mở/tạm dừng cả 18 game và gameplay đại diện không tương đương hoàn thành mọi màn chơi của mọi game.
