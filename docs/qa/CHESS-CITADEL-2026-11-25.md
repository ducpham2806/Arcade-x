# Cờ vua · Chính Điện Đá · 25/11/2026

Nhánh `codex/chess-citadel-preview` nối từ `b22b6be` của Cờ tướng. Trong ván Cờ vua chọn **Bàn cổ điển** để chuyển sang **Bàn Thành Trì**. Tùy chọn lưu theo trình duyệt. Bản HTML độc lập có đấu hai người tại chỗ và ba thế thử nhập thành, bắt Tốt qua đường, phong cấp.

## Hình ảnh và luồng trình diễn

- 12 sprite top-down Ngà Vàng và Hắc Thạch, nền đá 8×8, nhãn tọa độ theo hướng bàn, viền lượt trước và cảnh báo chiếu. Có phím mũi tên di chuyển focus và Enter chọn ô.
- Dùng `Move.after` của `chess.js` để xác nhận một lần chuyển giữa hai FEN đã nhận. Hai quân di chuyển khi nhập thành, Mã nhảy, Tốt đổi hình theo quân đã chọn. Bắt qua đường cho hiệu ứng tại ô Tốt bị bắt. Khay lấy đúng `move.captured` theo lịch sử SAN, hiện dấu gạch ngang nếu thiếu lịch sử để xác nhận. Khi giảm chuyển động, nhảy ngay tới thế đã nhận.
- Cờ vua giữ bộ luật và luồng bot/online hiện tại. Đồng hồ không bị khóa bởi hiệu ứng. Bản thử dùng art và UI mới theo tùy chọn của người chơi.
- Game Studio dùng Create Game Assets, Game UI/UX, PixelFX. Graphify Cờ vua trước sửa phủ 3 file, 75 nút, 95 cạnh. Đối chiếu luồng FEN, lịch sử và nước đi với các điểm gọi trong UI.
- Nguồn quân và nền trong `art/chess/citadel/build.py`. Agent Sprite Forge `25203d0` kiểm và xuất 12 sprite. PixelFX `5294518` xuất `impacts/crit-hit`, lấy 16 frame cho animation vỡ đá. Giấy phép MIT đi cùng asset. Ba WebP cộng 65.166 byte, thêm vào danh sách cache Cờ vua.

## Kiểm tra

- `tests/duel/citadel.mjs` kiểm bốn ca nhập thành, bắt qua đường, tám ca phong cấp gồm đi thường và ăn quân, lịch sử thiếu và nước nhảy lùi khi đồng bộ.
- Lint, Duel, Artwork, build, bundle budget và kiểm tài liệu qua. Chromium qua ca mở từ launcher ở 390×844, đi Tốt trong ván bot, đổi về bàn cổ điển và xác nhận giữ quân. HTML khi tắt mạng qua 3 khung 1440×900, 320×568, 844×390, gồm nhập thành, bắt qua đường, phong cấp ăn Xe, đổi hướng bàn và giảm chuyển động. Đã xem ảnh ở desktop và khung hẹp.
- Cờ tướng Bến Sông Sở Hán có cùng trong nhánh này. [QA bàn Cờ tướng](XIANGQI-BATTLEFIELD-2026-11-25.md)
- Còn kiểm phòng hai tài khoản, máy thật và vòng duyệt hình ảnh. Hướng tiếp theo là duyệt hai bàn mẫu rồi hoàn thiện UI, bộ skin và bàn phụ theo plan.

## Bộ quân pixel full-body · nhánh codex/chess-pixel-polish

- Sáu dáng từ ImageGen, góc nhìn chéo cao. Vua có vương miện chữ thập, Hậu dùng vương miện nhiều chóp, Tượng đội mũ chẻ khe, Mã có ngựa, Xe có thân tháp và Tốt có khiên tròn. Hai màu vải làm rõ Ngà Vàng và Hắc Thạch.
- `art/chess/citadel/prepare_masters.py` tách nền 4×2, căn chân, đặt lại màu vải và lưu master 12 ô. `build.py` dựng atlas `pieces-v2.webp` với Agent Sprite Forge và xuất VFX PixelFX. Kiểm 12 sprite 96×96, alpha nhị phân, không cắt biên và khác bảng màu giữa hai phe. Bản HTML nhúng atlas mới, game tải qua URL theo phiên bản.
- Chromium kiểm ván bot từ launcher ở 390×844 và đổi bàn giữ thế cờ. HTML offline qua 1440×900, 320×568 và 844×390, gồm nhập thành, bắt Tốt qua đường, phong cấp và giảm chuyển động. Lint, Duel, Artwork, build và bundle budget qua.
- Còn nghiệm thu trên thiết bị thật và phòng online hai tài khoản.
