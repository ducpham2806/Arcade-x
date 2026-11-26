# Nhật ký công việc

Một nhật ký chính, tối đa 3 mục. [Log trước FD-ON2](archive/WORKLOG-2026-11-19-before-fd-on2.md).

## 26/11/2026 · Snake Legend · SN-R1a

- Nhánh `codex/snake-touch-resume` từ `main@5cd1539`. Rà điều khiển cảm ứng khi đang chơi và lúc tạm dừng trong Hành trình và Sân thử. [Log VFX ba bàn cờ](archive/WORKLOG-2026-11-26-before-snake-touch.md).

## 26/11/2026 · Blossom Blast · hiệu ứng lượt đi

- `codex/blossom-vivid-effects` bổ sung liên kết ghép, mầm nở, vệt cổng, dấu vùng tác động theo engine và số tăng trên HUD. PixelFX dựng ảnh, Agent Sprite Forge kiểm và đóng gói khung hình. Playwright 66/66, engine 21/21, HTML chạy cả ba cảnh khi tắt mạng. [QA](qa/BLOSSOM-VIVID-EFFECTS-2026-11-26.md).
- Chuyển báo cáo cũ sang [archive xem lại nước đi](archive/WORKLOG-2026-11-26-board-review.md). Sửa kiểm art của #46 tại `b916d33` để dò đúng stylesheet 9-slice và đường dẫn ảnh offline.
- PR #47 chuyển đích sang `main`. CI #90 phát hiện sáu hiệu ứng mất nhịp đổi khung hình khi hệ điều hành bật giảm chuyển động. `VFX.tsx` và CSS giữ hai khung tại chỗ cho hiệu ứng chính. Tùy chọn trong game giữ ảnh tĩnh. #47 đã merge vào `main@5cd1539` sau CI #92. Đã đối chiếu cây Git của commit merge với bản chạy CI.

## 26/11/2026 · Blossom Blast · giao diện và ghép tại bàn

- `codex/blossom-garden-ui` thay giao diện Hành trình, HUD, bàn, chuẩn bị và các hộp thoại bằng khung 9-slice từ bộ art Blossom. Ghép được bằng chạm, vuốt hoặc bàn phím; đánh dấu các ô đủ điều kiện và hủy chọn miễn phí. Playwright 64/64, engine 21/21, HTML chạy khi tắt mạng sau tải. [QA](qa/BLOSSOM-GARDEN-UI-2026-11-26.md).
- PR #45 đã vào `main` tại `fc8bb2f` sau CI #86. Ghi chú gốc bản thử bàn cờ giữ trong [archive](archive/WORKLOG-2026-11-25-three-board-polish.md).
- PR #46 đã merge vào `main@657ec42` sau CI #89. Đã đối chiếu cây Git của commit merge với bản chạy CI.
