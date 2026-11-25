# Bến Sông Sở Hán · kiểm bản chơi thử Cờ tướng

Ngày 25/11/2026, từ `main@3e2f5b9` trên `codex/xiangqi-battlefield-preview`. Trong Cờ tướng, chọn nút **Bàn cổ điển** để chuyển sang **Bàn chiến trận**, rồi mở ván. Mỗi bản bàn dùng cùng trạng thái trận. Nút bàn và lựa chọn chữ lưu theo trình duyệt.

## Phần đã tích hợp

- Bến Sông Sở Hán có 9×10 điểm đặt quân, vạch Cửu Cung và sông. Bộ quân chiến trận có 7 loại cho mỗi phe. Phe đỏ dùng đế tròn và son nâu, phe đen dùng đế góc và thép chàm. Bộ quân hiện cả tên hoặc chữ Hán quen thuộc.
- Renderer diễn lại một nước nếu phát hiện đúng một quân rời nguồn tới đích trong hai trạng thái kế tiếp. Tính ngòi Pháo từ bàn trước nước. Quân bị ăn bay về khay của bên ăn và bộ đếm cập nhật. Mã đổi hướng giữa chuyển động. Bộ luật, AI, nhận nước online và kết quả vẫn lấy từ game hiện tại.
- Lưới tương tác có nhãn hàng, cột, quân và phe. Dùng phím mũi tên để di chuyển focus, Enter để chọn. Cờ hiệu chiếu được suy từ engine. Chế độ giảm chuyển động chốt bàn và khay trực tiếp.

## Asset và bản dựng

- Nguồn hình quân và nền do ArcadeX vẽ bằng Pillow tại `art/xiangqi/battlefield/build.py`. Agent Sprite Forge tại `25203d0` tách và kiểm 14 sprite, QA báo pass. PixelFX `5294518` xuất 16 frame `impacts/hit-spark`, giấy phép MIT đi cùng asset. Ba WebP cộng 51.560 byte và có trong danh sách cache Cờ tướng.
- Game Studio dùng Create Game Assets, Game UI/UX và PixelFX. Graphify trước sửa phủ `src/games/xiangqi`, 4 file, 69 nút và 107 cạnh. Đối chiếu trực tiếp selector `currentBoard`, `handleCellClick` và các nhánh bot/local/online trước khi nối render.
- Tạo lại atlas bằng `python3 art/xiangqi/battlefield/build.py --forge /đường/dẫn/forge --pixelfx /đường/dẫn/pixelfx`.

## QA

- `test:duel`, `test:artwork`, lint và build production qua. Chromium qua 3/3 ca mở từ launcher tại 1440×900, 320×568, 844×390. Kiểm đủ 90 điểm và 32 quân, keyboard desktop, nền sông, Pháo đỏ ăn Mã đen qua đúng Pháo ngòi, khay tăng 0→1, chuyển bàn giữ trạng thái và giảm chuyển động ở khung ngang. Không có page error. Bản HTML độc lập cũng qua cùng nước khi tắt mạng.
- Nghiệm thu thiết bị thật, phòng hai tài khoản và vòng polish art còn chờ. Bước làm tiếp của kế hoạch giao diện là bộ quân và nước đặc biệt của Cờ vua.
