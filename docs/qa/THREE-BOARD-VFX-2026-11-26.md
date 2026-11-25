# VFX ba game bàn cờ · 26/11/2026

| Game | Hoàn thiện |
|---|---|
| Ô Ăn Quan | Lấy đà trước cú nhảy, bóng bám mặt bàn, gợn khi tập hợp và hạ chân. Hai dải quét giáo màu hổ phách và xanh ngọc, xung va chạm mạnh hơn khi ăn Tướng, báo điểm và vòng sáng khi quân về khay. |
| Cờ vua | Vòng ấn phong cấp theo phe, đặt ở ô đích và hiện sau khi Tốt tới. Nhịp lóe nhẹ khi quân bị ăn đáp xuống khay. |
| Cờ tướng | Ánh đầu nòng, đường đạn qua ngòi, bụi và mảnh đất ở ô trúng Pháo. Vòng sáng nhìn thấy ở khay bất kể phe ăn. |

Tất cả các hiệu ứng dùng nút chuyển động riêng từng trò. Tắt giữa chừng hủy lớp trình diễn. Thế bàn, điểm và khay chốt theo nước đi đã được xác nhận. Cờ vua và Cờ tướng đợi chuyển động nước cuối xong mới mở bảng kết quả. Xem lại ván vẫn cho chuyển từng thế bàn ở dạng tĩnh.

## Dựng lại tài nguyên

Ảnh được kết xuất với PixelFX `5294518` theo hiệu ứng `melee/sword-slash`, `arcane/mana-burst` và `impacts/blunt-hit`. Quy trình dựng nằm ở `art/board-vfx/build.py`. Các dải WebP trong suốt có 16 khung mỗi màu. Bản quyền nguồn xem tại `public/games/xiangqi/battlefield/PIXELFX-LICENSE.txt`.

```sh
python3 art/board-vfx/build.py --pixelfx /path/to/pixelfx --out public/games
```

## Kiểm

- Game Studio Game Feel và PixelFX. Không cần cập nhật đồ thị quan hệ luật vì thay đổi trình diễn dùng điểm vào chuyển động hiện có.
- Playwright trên ba bản HTML offline ở 390×844 và 1440×900. Vòng ấn và vụ nổ đổi khung theo thời gian, quét giáo vẽ từ nhiều khung atlas, tắt giữa chừng vẫn thấy đúng quân và điểm. Đã xem ảnh runtime của ba cảnh.
- Bốn ca launcher gồm xem lại chiếu bí, Pháo ăn Mã và khay, lịch sử Ô Ăn Quan, ăn kép tuyến điểm 22→23→24→25→35. Đã kiểm lint, luật Cờ vua/Cờ tướng, Folk Duel, gói offline và ngân sách bundle.
- Kiểm thiết bị thật và phòng với hai tài khoản thật vẫn là bước nghiệm thu riêng.
