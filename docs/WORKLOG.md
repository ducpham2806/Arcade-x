# Nhật ký công việc

Một nhật ký chính, tối đa 3 mục. [Log trước FD-ON2](archive/WORKLOG-2026-11-19-before-fd-on2.md).

## 26/11/2026 · Snake Legend · Xem đường

- Nhánh `codex/snake-trial-scouting` dựa trên PR #49 tại `6d9a729`. Xem đường đánh số quả trên Canvas lúc chuẩn bị/tạm dừng. Bảng chơi có kỷ lục, mốc Dash và khoảng thời gian cần cải thiện. Chromium 15/15, kiểm lại tương phản, build và preview qua. [QA](qa/SNAKE-SCOUTING-2026-11-26.md). [Log Blossom](./archive/WORKLOG-2026-11-26-before-snake-scouting.md).

## 26/11/2026 · Snake Legend · Đồng Cỏ

- Nhánh `codex/snake-meadow-expansion` từ `95c8fda` (PR #48). Có ba đường thử tùy chọn, đánh dấu quả kế tiếp, cầu và bờ nước rõ hơn, atlas PixelFX 32 khung đóng gói qua Agent Sprite Forge. [QA](qa/SNAKE-MEADOW-2026-11-26.md). [Log giao diện Blossom](archive/WORKLOG-2026-11-26-before-snake-meadow.md).
- Cả ba đường đạt lượt thường và mốc Dash qua Engine. Chromium bản sảnh 8/8, điều khiển 7/7, gói catalog/preview và lượt HTML offline qua. CI #95 vấp fixture còn đòi bốn atlas. Đã kiểm đủ năm atlas và Canvas vẽ hiệu ứng trên preview. Chromium chơi hết ba đường, tải lại ba kỷ lục. Đồng bộ nút Bắt đầu, Tiếp tục và Chơi lại. CI #96 đã qua. Thiết bị thật còn chờ.

## 26/11/2026 · Snake Legend · SN-R1a

- Nhánh `codex/snake-touch-resume` từ `main@5cd1539`. Tích hợp nội dung R01 từ `b9f7134`: sổ tay 10 màn, kết chương và chuyển động Canvas của Tiểu Xà/Nhện Mẹ. Sửa sở hữu ngón, trạng thái dừng và hành trình núm joystick trong Hành trình/Sân thử. [QA](qa/SNAKE-R01-RESUME-2026-11-26.md). [Log VFX ba bàn cờ](archive/WORKLOG-2026-11-26-before-snake-touch.md).
- `test:snake-ui` 14/14, `test:snake-player` 6/6, sáu nhóm local, build/bundle/catalog/preview và HTML offline qua Chromium. CI, thiết bị thật và duyệt phát hành còn chờ.
