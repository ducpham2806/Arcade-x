# S1 · Gameplay catalog dùng nhầm storage guest · 14/11/2026

Nguồn trước sửa2ca0b3c, Chromium156/Node24, launcher mode snake-catalog/Auth fixture local. Source public8320385 có cùng đường gọi thiếu storage. Đã merge PR34/main533c0e7, chưa deploy vì Netlify HOLD theo user. [QA](../../../docs/qa/SNAKE-FINISH-2026-11-14.md).

1. Guest có thành tích màn1. Đăng nhập tài khoản mới chưa có thành tích Snake.
2. Hành trình hiện0màn, màn2khóa. Bắt đầu màn1.
3. Story lại cho mở màn2 và hiện sao guest. Chơi/lưu sẽ ghi unscoped guest, còn Journey đọc account nên không khớp.

Mong đợi: journey/gameplay/checkpoint/tùy chỉnh đều cùng owner; B/guest không nhận lượt thắng của A. Thực tế `app.showStory` không chuyển store sang `mountStory`, hàm rơi về window.localStorage khi public không có completion hook. Catalogtest cũ chỉ seed/checkJourney nên bỏ sót.

Red browser bắt đúng enabled != disabled tại navmàn2. Sau sửa truyền store qua story/lab, ưu tiên completion.storage giữ nguyên, test bằng pointer thắng/reload và checkpoint/settings theoA, Btrống, guestbyte-identical. Không tự gán dữ liệu guest cũ cho một account vì không có bằng chứng owner; không đổi key/format hoặc xóa dữ liệu cũ. Trace/ảnh ở evidence local và artifact CI; không pageerror liên quan.
