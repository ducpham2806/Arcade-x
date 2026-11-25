# Ô Ăn Quan, Cờ vua và Cờ tướng · 25/11/2026

Nhánh `codex/three-board-games-polish` nối từ `1b2183e`. Thay đổi nằm ở trình diễn và cấu hình tải tài nguyên của ba game. Điểm, thời hạn lượt, lượt hợp lệ, tính thưởng, phòng online và định dạng save tiếp tục dùng luồng hiện hành.

| Game | Bàn và bộ quân | Chuyển động |
|---|---|---|
| Ô Ăn Quan | Đồng Cỏ Biên Ải, Sa Mạc, Sơn Ải, Thành Trì và Sân Đình. Hai phe lính giáo và Tướng cưỡi ngựa. Kho trang phục xem trước trên bàn Chiến Trường, giữ ID và ví Kẹo. | Đội hình cúi chuẩn bị, hành quân từng ô, nhảy qua ô trống để đánh, quân ngã rồi về khay. HUD cộng 1 điểm mỗi Lính, 10 điểm mỗi Tướng. |
| Cờ vua | Chính Điện Đá, Pháo Đài Băng, Sa Mạc Cổ, Hắc Thành Dung Nham và bàn cổ điển. Bộ Ngà Vàng và Hắc Thạch giữ hình và dấu loại quân. | Đi theo loại quân, ăn quân qua khay, nhập thành đồng thời, bắt Tốt qua đường và đổi hình khi phong cấp. |
| Cờ tướng | Bến Sông Sở Hán, Thành Môn, Sơn Ải, Sa Mạc và bàn cổ điển. Đỏ/xanh, nhãn Việt/Hán. | Di chuyển, đánh trúng, Pháo vượt ngòi và đưa quân bị ăn vào khay. |

Bộ chọn địa hình và chuyển động lưu cục bộ theo từng game. Công tắc mặc định theo hệ điều hành và người chơi có thể ghi đè. Tắt giữa lượt chốt ngay trạng thái đã được luật chấp nhận. Tài nguyên ảnh khai báo trong `packageAssets.json`.

## Nguồn hình và kỹ thuật

- Mở Game Feel, Generate 2D Sprite và PixelFX trong bộ Studio. Graphify AST theo `src/games/o-an-quan` ở `1b2183e`, 115 nút/288 cạnh. Truy vấn `useOaqAnimation` ở độ sâu 1 xác nhận lớp dựng trace và Canvas độc lập với thao tác đi.
- Ô Ăn Quan lấy art gốc hai phe, tách nền và chuẩn hóa 96×96 qua `art/o-an-quan/campaign/prepare_units.py`. Agent Sprite Forge xuất 4 frame RGBA đã qua QA. Các tư thế hành quân/ngã dùng sprite kết hợp nghiêng, nảy, bụi và đổi vị trí theo trace. Trang phục cũ đổi nhẹ sắc vải, viền, khay hoặc hạt theo loại.
- Mỗi nhóm địa hình dùng art mới và vạch bàn vẽ độc lập. Ô Ăn Quan dùng lại va chạm PixelFX 16 frame của Cờ tướng. Bản quyền theo `public/games/xiangqi/battlefield/PIXELFX-LICENSE.txt`. Cờ vua giữ hiệu ứng vỡ PixelFX từ Chính Điện Đá.

## Kiểm thử

- Fixture Ô Ăn Quan ăn kép xác minh HUD lần lượt 22 → 23 → 24 → 25 → 35. Cùng ca kiểm ghi nhớ Sa Mạc và tắt chuyển động giữa lượt, ván chỉ tăng một lượt.
- Chromium trên ba HTML offline ở 390×844 và 844×390. Đổi đủ 13 lựa chọn, chế độ cổ điển, đổi thông số độc lập, xem và mua trang phục bằng Kẹo thử. Ảnh nằm trong HTML, kiểm trang không gọi mạng lấy tài nguyên.
- Chromium kiểm thêm Cờ vua ở 1440×900, Cờ tướng ở 320×568, cả hai ở 844×390 bật giảm chuyển động, và hai đường vào bàn cổ điển từ launcher. Các mẫu có nước đặc trưng để thử nhanh.
- Lint, build, bundle budget, bộ kiểm Folk, Duel, Duel Server, artwork và package PWA. Kiểm thiết bị thật và hai tài khoản trên môi trường đích vẫn là nghiệm thu riêng của bản phát hành.
