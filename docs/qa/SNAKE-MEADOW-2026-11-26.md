# Snake Legend · Đường thử Thảo Nguyên Xanh · 26/11/2026

Nhánh `codex/snake-meadow-expansion` tiếp trên PR #48 tại `95c8fda`. Mở **Hành trình → Đường thử** trong bản sảnh hoặc HTML độc lập. Ba đường có thể chọn ngay, thắng khi thu đủ quả theo thứ tự. Dash rút ngắn lượt chơi để đạt mốc thời gian. Kỷ lục tách khỏi sao và checkpoint của 10 màn R01, theo khách hoặc tài khoản hiện tại trên thiết bị.

## Thiết kế và kiểm đường

| Đường thử | Bố cục và nhịp chơi | Chạy thường | Chạy Dash / Mốc |
|---|---|---:|---:|
| Vườn Quanh Co | 10 quả, đoạn thẳng tập lái, bẻ qua hai hàng rào rồi quay về phía nam | 14,55 giây | 12,32 / 13,5 giây |
| Suối Hai Nhịp | 12 quả, qua cầu rộng, lượn trên bờ đông rồi trở về bằng cầu hẹp | 18,42 giây | 15,77 / 17 giây |
| Vòng Gai Cổ Thụ | 15 quả, hai cầu lệch hướng, cồn để căn đầu và lối vòng ngoài cụm gai | 21,23 giây | 18,33 / 19,5 giây |

Số liệu do Engine chạy ở 60 Hz, lượt thường cập nhật hướng mỗi 12 tick, Dash mỗi 8 tick. Ba lượt mỗi kiểu đều về đích đủ tim. Đầu có bán kính 0,42 đơn vị, cầu có mặt rộng 3,2–3,8 đơn vị. Test xác nhận bốn lần qua cầu và thua khi lệch xuống nước. Bộ R01 vẫn hoàn thành 10 màn qua Engine. Mã bản đồ, mô phỏng, checkpoint, save và golden so khớp nhánh cơ sở.

## Đồ họa và nguồn

Bốn bảng màu Canvas cho vườn, suối, bụi gai và tổ nhện. Bờ nước, mép cầu gỗ và gai có hình riêng. Quả tiếp theo có vòng nổi bật, đường nối và dấu trên bản đồ nhỏ. Atlas gồm hiệu ứng nhặt quả, Dash, mở cổng và hoàn thành. Giảm chuyển động bỏ vệt Dash và dùng khung tĩnh ngắn cho các dấu chính.

Game Studio Level Design, Create Game Assets, PixelFX, vai trò Team Level và Art & UI Lead. PixelFX `5294518` tạo khung màu riêng, Agent Sprite Forge `25203d0` kiểm và ráp khung. RGBA 512×256, 32 khung, 60.158 byte WebP, build lại trùng byte. [Nguồn, giấy phép và lệnh dựng](../../art/snake-legend/meadow-fx/README.md).

Graphify AST `src/games/snake-legend` có 482 nút, 1.263 cạnh. Dùng `mountJourney` và `trialForArena` để đối chiếu tuyến vào màn, renderer và bản đồ nhỏ. Ảnh thực thi Canvas gồm ba đường, bốn hiệu ứng và giảm chuyển động, ở `test-results/snake-meadow-visuals/` và bản sao bỏ qua trong thư mục bằng chứng Studio.

## Kiểm chứng tích hợp

- `test:snake-player` 8/8, gồm chơi thắng bằng joystick, lưu và tải lại kỷ lục, dùng cài đặt toàn khung ở 320×568, 390×844 và 568×320. `test:snake-controls` 7/7. Một lượt thử trùng máy chủ Vite gặp HTTP 504 từ cache phụ thuộc, lần chạy tuần tự sạch.
- Sáu nhóm `test:snake-local`, `lint`, `test:storage`, `test:readability` và báo cáo hình của Studio qua.
- Build production, bundle, rollback, catalog và preview đều qua. Catalog có 21 tệp media, JS tải đầu 307.802 byte gzip, chunk lớn nhất 484.949 byte. WebP mới khớp byte giữa đầu ra preview và nguồn nhúng.
- `export:snake-journey` sinh HTML 2.292.623 byte. Chromium tải đúng HTML qua loopback rồi ngắt mạng trong lúc mở Suối Hai Nhịp, chơi, dừng và về R01. Không có yêu cầu bên ngoài hoặc lỗi trang.

## Giới hạn nghiệm thu

Kiểm Chromium desktop, khổ điện thoại và màn ngang. Điện thoại thật, lượt chơi người mới và production còn chờ.
