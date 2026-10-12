# Kiếm tiền: đề xuất và nền tảng đã chuẩn bị

## Khuyến nghị

Bắt đầu với game miễn phí và **mua một lần để mở game/gói game** khi chất lượng đủ tốt. Mô hình này dễ hiểu, ít đòi hỏi vận hành nội dung đều đặn hơn thuê bao. Giữ trải nghiệm chơi khách miễn phí; yêu cầu tài khoản khi mua để khôi phục quyền trên thiết bị khác.

Ủng hộ chuyển khoản là tính năng bổ sung có thể mở sớm khi chủ dự án cung cấp thông tin ngân hàng công khai phù hợp. Không coi đây là nguồn thu chính và không gắn chuyển khoản tự khai với quyền chơi. Thuê bao nên triển khai sau khi có thư viện đủ giá trị, lịch cập nhật đều và dữ liệu quay lại chơi chứng minh nhu cầu. Đây là đề xuất sản phẩm, chưa phải kết luận từ khảo sát thị trường hay dự báo doanh thu.

| Phương án | Phù hợp | Điều kiện / hạn chế |
|---|---|---|
| Mua một lần | Game hoặc bộ game có giá trị rõ ràng | Cần bảo vệ nội dung, phục hồi mua hàng, hoàn tiền |
| Thuê bao tháng | Thư viện thường xuyên có nội dung mới | Cần gia hạn, hủy, hết hạn, xử lý thu tiền thất bại và giữ chân |
| Ủng hộ ngân hàng | Người chơi muốn hỗ trợ dự án | Thu nhập khó dự đoán; không mặc định cấp quyền |

Chưa đặt giá thật. Thử nghiệm giá sau khi đo số người chơi quay lại, phiên chơi, tỷ lệ quan tâm sản phẩm và phản hồi; không ép mua trong lần đầu vào app.

## Đã chuẩn bị

- Danh mục phân biệt miễn phí/premium và kiểm tra quyền trước khi mở game.
- Sản phẩm game/gói game, thuê bao toàn thư viện có thời hạn, ủng hộ.
- Đơn hàng lấy giá từ máy chủ, lưu bản chụp giá/quyền; client không quyết định số tiền.
- RPC xác nhận sự kiện dành riêng cho backend tin cậy, chống xử lý trùng và kiểm tra số tiền/tiền tệ. Thanh toán mở quyền; hoàn tiền thu hồi quyền thuộc đơn đó; ủng hộ không mở game.
- Thuê bao nối tiếp thời hạn, kiểm tra ngày bắt đầu/kết thúc. Chưa có thu phí định kỳ tự động.
- Khu vực ủng hộ chỉ xuất hiện khi có cấu hình hợp lệ. Không giả lập thanh toán thành công. Tất cả cờ thu tiền mặc định tắt.

## Bắt buộc hoàn thành trước khi bán

**Đây chưa phải hệ thống thu tiền sẵn sàng phát hành.** Hiện bundle của cả 18 game vẫn công khai và được PWA precache. Kiểm tra quyền ở launcher/RPC chỉ là nền tảng luồng sản phẩm, không bảo vệ mã/nội dung trả phí trước người cố tình vượt qua giao diện.

1. Tách tài nguyên/nội dung premium khỏi bundle công khai và danh sách precache; cung cấp qua backend kiểm tra entitlement, hoặc chuyển giá trị trả phí sang nội dung/chức năng do máy chủ cung cấp. Nếu hỗ trợ offline premium, cần xác định giới hạn license offline và khả năng thu hồi; không thể hứa chống sao chép tuyệt đối.
2. Chọn nhà cung cấp thanh toán hỗ trợ thị trường mục tiêu. Viết backend/Edge Function tạo giao dịch, xác minh chữ ký webhook và trạng thái tiền đã nhận, rồi mới gọi `launcher_record_payment`. RPC này không phải webhook công khai và không tự xác minh ngân hàng. Không tin thông báo chuyển khoản do trình duyệt gửi.
3. Lưu khóa bí mật ở backend; thêm đối soát, log, cảnh báo, chống lạm dụng, thử giao dịch trùng/sai số tiền/hoàn tiền và khôi phục khi webhook chậm.
4. Xây giao diện sản phẩm, đơn đang xử lý, lịch sử mua, phục hồi quyền; hướng dẫn hỗ trợ khi đã trừ tiền nhưng chưa mở game. Làm rõ người đang chơi được xử lý thế nào khi quyền hết hạn.
5. Chốt chính sách hoàn tiền, hủy thuê bao, thuế/hóa đơn và bảo vệ dữ liệu. Hoàn tiền từng phần và quản lý gia hạn tự động chưa được triển khai.
6. Kiểm tra staging với tài khoản thử, hoàn tiền và lỗi mạng rồi mới mở cờ thương mại. Không bật cờ chỉ vì SQL đã chạy thành công.

Không chuyển game miễn phí hiện có sang trả phí mà thiếu thông báo và quyết định quyền của người chơi cũ. Rút game khỏi catalog cần chính sách cho khách đã mua; trạng thái dữ liệu đơn thuần không giải quyết nghĩa vụ này.
