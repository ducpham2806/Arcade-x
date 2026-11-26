# Blossom Blast · giao diện vườn hoa · 26/11/2026

Nhánh `codex/blossom-garden-ui`. Phạm vi gồm giao diện trong ArcadeX và bản HTML duyệt. Tham chiếu Candy Crush về cách ưu tiên mục tiêu, số lượt, bàn và vật phẩm. Khung thực hiện bằng art Blossom sẵn có, với nền chương, nhân vật và bảng màu vườn hoa riêng. [Candy Crush Saga trên App Store](https://apps.apple.com/us/app/candy-crush-saga/id553834731).

## Thay đổi

- Hành trình dùng cảnh theo chương và phân biệt màn đã đạt sao, còn khóa và boss. HUD đưa lượt, mục tiêu và điểm sát bàn. Khung 9-slice giữ tỉ lệ góc khi nội dung đổi chiều rộng hoặc cao. Dùng chung cho nút, HUD, hộp thoại, bản đồ, thử thách, cài đặt và kết quả.
- Chuẩn bị, tạm dừng, hướng dẫn và kết quả dùng bề mặt theo ngữ cảnh. Hộp thoại chiếm toàn khung trên điện thoại và giữ nút chính trong vùng nhìn. Phím Escape đóng hộp chuẩn bị, tạm dừng hoặc trợ giúp và trả focus.
- Chạm một vật phẩm có thể ghép để thấy các ô đích. Chạm ô đích hoặc vuốt trực tiếp để ghép. Chạm lại ô đã chọn để dùng riêng. Escape, Hủy chọn hoặc thả vào ô khác không trừ lượt. Ký hiệu cặp và viền ô đích không phụ thuộc màu đơn thuần.
- Luồng ghép và hướng dẫn dùng cùng điều kiện kề ngang/dọc và khả dụng của engine. Bản HTML nhúng cảnh chương và ảnh 9-slice để mở offline.

## Kiểm chứng

- Graphify AST theo `src/games/hex-match` (191 nút/518 cạnh) xác nhận cả chạm và vuốt gọi `perform` → `act`; CSS kiểm riêng trên bản chạy.
- Chromium giả lập cảm ứng và bàn phím. Đã xem ảnh Hành trình, bàn và hộp thoại. Nghiệm thu thiết bị vật lý và cảm giác chơi người thật còn chờ.
- 64/64 Playwright, gồm Chromium portrait/landscape/desktop, 100 bố cục chuẩn bị, badge giả lập ở launcher, kết quả và lưu ván, chạm/vuốt/phím, và bản HTML. `test:blossom-engine` 21/21; typecheck, build và bundle budget qua.
- Chromium Cloud chặn `file://`. Bản HTML 27,6 MB được tải qua loopback, sau đó tắt mạng, mở chương và vào ván. Ảnh và 9-slice nạp từ dữ liệu nhúng, không có yêu cầu HTTP bổ sung.
