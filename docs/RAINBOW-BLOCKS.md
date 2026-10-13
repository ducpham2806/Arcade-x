# Rainbow Blocks · Bản duyệt 13/10/2026

Được xây trên source đã dọn gần nhất, dùng GDD v1.0, 5 wireframe và bộ SVG `rainbow_blocks_assets.zip` người dùng cung cấp. Bản source đã hợp nhất; không publish Netlify hoặc thay đổi database production.

## Đã thực hiện

- Engine TypeScript độc lập DOM: bàn 10×20 + 2 hàng ẩn, 7-bag Mulberry32 có seed, SRS với bảng kick I/JLSTZ, ghost, Hold một lần/khối, lock delay 500 ms/15 reset, fixed tick 60 Hz.
- Điểm Single/Double/Triple/Rainbow, T-Spin 3-corner, Perfect Clear, combo, B2B, soft/hard drop, mốc level và hệ số Custom Speed theo JSON asset gốc.
- Năm mode: Điểm cao, Thư giãn (3 Undo), Đua thời gian 1/2/3/5 phút, Tốc độ riêng 1–20 và Sprint 40 hàng. Tốc độ tăng/tắt theo mode; Sprint xếp kỷ lục thời gian.
- Bàn phím (DAS/ARR riêng, ưu tiên hướng cuối, không dùng OS repeat, đổi phím), gesture (tap, drag, flick, hai ngón), nút ảo đa chạm và Gamepad API.
- Menu, chọn mode, countdown, hướng dẫn 5 bước trên board thật, pause/resume, xác nhận chơi lại/kết thúc, popup tổng kết duy nhất sau hiệu ứng, VI/EN, cài đặt ghost/lưới/mù màu/giảm chuyển động/chất lượng/âm thanh/rung.
- Khối, ghost, ký hiệu màu, 5 nền level, streak/shard/ring/rainbow sweep/confetti dùng bộ SVG đã gửi. Audio gốc sinh bằng Web Audio; không tải âm thanh ngoài.
- Lưu ván mỗi 5 giây và khi pause, cài đặt và kỷ lục theo mode/biến thể trên thiết bị; tải ảnh kết quả và replay JSON. Replay cùng seed + input tick tạo lại đúng state và điểm.
- Tích hợp registry, artwork, hướng dẫn launcher, thẻ game. Carousel 6 slide: Rainbow Blocks → Blossom Blast → Car Escape → 2048 → Word Cross → Blocker. Tự trượt phải sang trái mỗi 15 giây, gồm chuyển từ slide cuối về đầu. Có chấm, nút điều hướng và pause; tạm ngưng khi người dùng hover/focus hoặc tab ẩn. Reduced motion bỏ trượt.

## Giới hạn bản duyệt

Bảng kỷ lục trong game là **trên thiết bị**, chưa phải bảng online. Không nộp điểm Rainbow Blocks vào bảng chung khi chưa có backend xác thực replay và phân mode. Tài khoản launcher/backend cũ được giữ. Catalog cloud đang chạy cần đăng ký `rainbow-blocks` sau khi duyệt; bản bundled/offline hiện có đủ 19 game. Không thay quyền truy cập hay status trong cloud bằng fallback ở client.

Các hạng mục M3/Phase 2 còn để bước phát hành: xác thực replay server, bảng online có phân mode/phạm vi/country, thống kê đồng bộ, theme mở khoá/nhiệm vụ, kéo đổi vị trí nút và chọn kích thước nút. Gesture và layout nút hiện tự thích nghi dọc/ngang; Gamepad cần kiểm tra thêm với tay cầm vật lý. Chưa thử thiết bị iOS/Safari thật.

## Chạy bản duyệt

```bash
npm ci
npm run dev
npm run lint
npm run build
npm run preview:rainbow
npm run preview:launcher
npx playwright install chromium
npm run test:rainbow
```

`rainbow-blocks-review.html` là bản game đầy đủ offline, nhúng 98 SVG; nằm ở thư mục cha của source. `arcadex-launcher-review.html` dùng để duyệt launcher/carousel và chơi Rainbow Blocks. Các game khác có worker hoặc asset ngoài nên kiểm thử bằng dev server.

Input/level/scoring/effects/modes được giữ trong `src/games/rainbow-blocks/data/`. Engine không đọc đồng hồ, DOM hoặc Math.random. Renderer/audio/input nằm riêng để dễ cân bằng và mở rộng.

## Cập nhật popup chuẩn bị

Khung chọn chế độ dùng kích thước của cấu hình lớn nhất (desktop tối đa 840 px, giới hạn theo viewport). Header/footer và vị trí Bắt đầu giữ nguyên giữa các mode. Vùng tùy chọn thời gian/tốc độ được dành sẵn chỗ; mobile dùng lưới thẻ 2 cột và landscape dùng 3 cột để không phải cuộn trên các kích thước đã kiểm thử.

“Dự đoán vị trí rơi” nằm ngay trong màn chuẩn bị và Cài đặt, cùng lưu vào một preference. Hồ sơ mới mặc định tắt; lựa chọn đã lưu được giữ nguyên. Đổi lựa chọn khi pause cập nhật lớp ghost ngay và áp dụng cho ván sau. Hướng dẫn thả khối không còn phụ thuộc vào ghost.
