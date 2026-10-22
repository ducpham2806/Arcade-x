# Dungeon Titan — UX một tay v6.1

Yêu cầu: vùng thông tin dưới trận đánh quá lớn và có thể mở màn quản lý khi chạm nhầm; thao tác đánh phải đưa tay lên cao.

- Bốn chỉ số trở thành một hàng cao 23px, chỉ đọc, không có liên kết/nút hay tab stop. Giữ nhãn truy cập cho trình đọc màn hình.
- Thanh mana mảnh; năm nút kỹ năng vẫn có vùng chạm 48px.
- Nút giữ chém chiếm toàn bộ chiều ngang khả dụng, cao 64px; giảm còn 58px trên màn hình thấp. Có pointer capture và kết thúc giữ khi thả/hủy/mất focus.
- Không đặt nút nâng cấp cạnh nút chém. Nâng cấp ở tab Anh hùng bên dưới; nhịp chơi không mở nhầm màn quản lý từ các chỉ số.
- Khi đấu boss, nút đỡ có vùng riêng 60×64px bên phải. Năm tab quản lý giữ ở đáy màn hình; có khoảng cách với hàng chém.
- Màn hình ngang dùng hàng chỉ số 2×2 thụ động và nút kỹ năng tối thiểu 44px do cột điều khiển hẹp.

Giữ nguyên kinh tế, đội quái, asset và schema lưu v6. Bản thử tiếp tục dùng khóa lưu riêng dungeon_titan_v6_review_isolated.

Đã qua kiểm tra TypeScript và DOM: chỉ số không tương tác, không còn nâng cấp trong hàng điều khiển, giữ chém, kỹ năng, nâng cấp trong màn Anh hùng, menu, lưu và boss. Chưa xác nhận vị trí thực tế, độ dễ đọc hoặc độ thuận tay trên điện thoại; không suy ra kiểm thử bố cục từ DOM.
