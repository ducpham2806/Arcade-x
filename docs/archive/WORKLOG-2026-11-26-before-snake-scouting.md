## 26/11/2026 · Blossom Blast · hiệu ứng lượt đi

- `codex/blossom-vivid-effects` bổ sung liên kết ghép, mầm nở, vệt cổng, dấu vùng tác động theo engine và số tăng trên HUD. PixelFX dựng ảnh, Agent Sprite Forge kiểm và đóng gói khung hình. Playwright 66/66, engine 21/21, HTML chạy cả ba cảnh khi tắt mạng. [QA](qa/BLOSSOM-VIVID-EFFECTS-2026-11-26.md).
- Chuyển báo cáo cũ sang [archive xem lại nước đi](archive/WORKLOG-2026-11-26-board-review.md). Sửa kiểm art của #46 tại `b916d33` để dò đúng stylesheet 9-slice và đường dẫn ảnh offline.
- PR #47 chuyển đích sang `main`. CI #90 phát hiện sáu hiệu ứng mất nhịp đổi khung hình khi hệ điều hành bật giảm chuyển động. `VFX.tsx` và CSS giữ hai khung tại chỗ cho hiệu ứng chính. Tùy chọn trong game giữ ảnh tĩnh. #47 đã merge vào `main@5cd1539` sau CI #92. Đã đối chiếu cây Git của commit merge với bản chạy CI.
