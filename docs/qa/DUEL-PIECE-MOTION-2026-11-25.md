# Animation nước đi và ăn quân của Cờ vua và Cờ tướng

Ngày 25/11/2026. Nhánh `codex/duel-piece-motion` tiếp từ `669a982`, gồm hai bộ quân pixel full-body đã làm trước đó.

- Cờ vua có nhịp bước cho quân người, Mã bật nhảy, Xe lăn và Vua/Xe di chuyển cùng lúc khi nhập thành. Cảnh ăn có lấy đà, vệt đánh, vỡ đá PixelFX và quân bị ăn bay về khay. Bắt Tốt qua đường hiện va chạm đúng ô quân bị bắt. Phong cấp đổi sang quân đã chọn.
- Cờ tướng có nhịp bước, vó ngựa, Xe/Pháo lăn, đường chữ L của Mã và nòng Pháo giật trước khi đạn bay qua ngòi tới mục tiêu. Quân bị ăn phản ứng và bay về khay. Kiểu quân chữ và kiểu quân pixel dùng chung chuyển động tương ứng.
- Nút **Chuyển động** lưu riêng mỗi game. Mặc định theo hệ điều hành cho tới khi người chơi đặt lựa chọn. Tắt giữa nhịp đi hoặc ăn thì hiện bàn và khay cuối ngay, bật lại chỉ áp dụng từ nước tiếp theo. Tùy chọn dành cho chuyển động quân và hiệu ứng ăn quân.
- Diễn tiến ván là nguồn đúng. Hai timer độc lập cho chuyển quân và cảnh ăn để nước đi kế tiếp có thể bắt đầu khi hiệu ứng quân trước về khay. Nếu có một cảnh ăn mới trước khi cảnh trước kết thúc, khay chốt quân trước và phát cảnh mới. Đổi phòng hoặc sửa thế ngoài một nước hợp lệ thì chốt thẳng.
- Hướng mỹ thuật theo Game Feel và Game UI/UX, dùng lại sprite của Agent Sprite Forge và atlas va chạm PixelFX. Graphify phạm vi Cờ vua 5 file/100 node, Cờ tướng 5 file/95 node tại lúc kiểm chuyển động. Xác nhận call site trong hai game và playtest.

## Kiểm chứng

- Chromium kiểm hai HTML tự chứa ở 1440×900, 320×568 và hai ca 844×390 với hệ điều hành giảm chuyển động. Đo vị trí CSS ở hai mốc của nước Mã, thử va chạm và quỹ đạo về khay, tắt trong cảnh ăn, ăn quân từ trạng thái tắt, tải lại và đổi game để kiểm hai tùy chọn độc lập. Các bản HTML không gửi request tài nguyên.
- Chromium chạy mỗi game từ launcher 390×844, chuyển sang bàn cổ điển và kiểm animation cùng nút tắt. Lint, Duel, Artwork, build và bundle budget qua.
- Còn nghiệm thu bằng hai tài khoản online và thiết bị thật. Phiên này kiểm trên Chromium mô phỏng.
