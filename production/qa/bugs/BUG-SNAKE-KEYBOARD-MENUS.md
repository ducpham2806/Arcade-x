# S2 · Space/menu keyboard và focus · 14/11/2026

Nguồn trước sửa2ca0b3c, Chromium156/Node24, launcher Snake local. Đã sửa ứng viên, chưa merge/deploy. [QA](../../../docs/qa/SNAKE-FINISH-2026-11-14.md).

1. Mở Story, focus nút Bắt đầu bằng bàn phím rồi nhấn Space.
2. Controls gọi preventDefault trên window, nên native click không phát; overlay không đóng.
3. Mở Tùy chỉnh bằng chuột, Tab ra ngoài hoặc Escape: focus không giữ trong dialog và Escape không đóng settings như mong đợi.

Mong đợi: Space/Enter thao tác nút tự nhiên; phím game chỉ điều khiển khi đang chơi; Tab/ShiftTab nằm trong dialog, Escape đóng settings rồi trở lại pause, tiếp tục đưa focus về canvas. Red test thất bại đúng overlay phải hidden. Bản sửa thêm focus theo lớp dialog, giữ native input/select/button và cleanup bằng AbortSignal; role/name/aria-hidden phản ánh lớp hiển thị. Browser kiểm cả bắt đầu, mở settings, wrap focus hai chiều, Escape và tiếp tục. Ảnh/trace local và artifact CI; không đổi physics/replay.
