# Nhật ký công việc

Một nhật ký chính, tối đa 3 mục. [Log trước FD-ON2](archive/WORKLOG-2026-11-19-before-fd-on2.md).

## 26/11/2026 · Snake Legend · Đồng Cỏ

- Nhánh `codex/snake-meadow-expansion` từ `95c8fda` (PR #48). Có ba đường thử tùy chọn, đánh dấu quả kế tiếp, cầu và bờ nước rõ hơn, atlas PixelFX 32 khung đóng gói qua Agent Sprite Forge. [QA](qa/SNAKE-MEADOW-2026-11-26.md). [Log giao diện Blossom](archive/WORKLOG-2026-11-26-before-snake-meadow.md).
- Cả ba đường đạt lượt thường và mốc Dash qua Engine. Chromium bản sảnh 8/8, điều khiển 7/7, gói catalog/preview và lượt HTML offline qua. CI #95 vấp fixture còn đòi bốn atlas. Đã kiểm đủ năm atlas và Canvas vẽ hiệu ứng trên preview. Chromium chơi hết ba đường, tải lại ba kỷ lục. Đồng bộ nút Bắt đầu, Tiếp tục và Chơi lại. Chờ CI mới và thiết bị thật.

## 26/11/2026 · Snake Legend · SN-R1a

- Nhánh `codex/snake-touch-resume` từ `main@5cd1539`. Tích hợp nội dung R01 từ `b9f7134`: sổ tay 10 màn, kết chương và chuyển động Canvas của Tiểu Xà/Nhện Mẹ. Sửa sở hữu ngón, trạng thái dừng và hành trình núm joystick trong Hành trình/Sân thử. [QA](qa/SNAKE-R01-RESUME-2026-11-26.md). [Log VFX ba bàn cờ](archive/WORKLOG-2026-11-26-before-snake-touch.md).
- `test:snake-ui` 14/14, `test:snake-player` 6/6, sáu nhóm local, build/bundle/catalog/preview và HTML offline qua Chromium. CI, thiết bị thật và duyệt phát hành còn chờ.

## 26/11/2026 · Blossom Blast · hiệu ứng lượt đi

- `codex/blossom-vivid-effects` bổ sung liên kết ghép, mầm nở, vệt cổng, dấu vùng tác động theo engine và số tăng trên HUD. PixelFX dựng ảnh, Agent Sprite Forge kiểm và đóng gói khung hình. Playwright 66/66, engine 21/21, HTML chạy cả ba cảnh khi tắt mạng. [QA](qa/BLOSSOM-VIVID-EFFECTS-2026-11-26.md).
- Chuyển báo cáo cũ sang [archive xem lại nước đi](archive/WORKLOG-2026-11-26-board-review.md). Sửa kiểm art của #46 tại `b916d33` để dò đúng stylesheet 9-slice và đường dẫn ảnh offline.
- PR #47 chuyển đích sang `main`. CI #90 phát hiện sáu hiệu ứng mất nhịp đổi khung hình khi hệ điều hành bật giảm chuyển động. `VFX.tsx` và CSS giữ hai khung tại chỗ cho hiệu ứng chính. Tùy chọn trong game giữ ảnh tĩnh. #47 đã merge vào `main@5cd1539` sau CI #92. Đã đối chiếu cây Git của commit merge với bản chạy CI.
