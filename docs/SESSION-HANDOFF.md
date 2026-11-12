# Bàn giao · 12/11/2026 · Rắn Săn Mồi ứng viên catalog

## Kết quả local

Nhánh `codex/snake-catalog-candidate` từ 3a3db28. Chủ dự án duyệt preview trước và cho tiếp. Mode riêng có một thẻ game với icon/banner, yêu thích, chơi gần đây và thoát đúng sảnh. Gói 16 JS/CSS + 20 media tải theo yêu cầu. Chrome kiểm tải trước khi chơi, tắt mạng, reload, vào 1-1, sprite/âm thanh, joystick/Dash và save khách/tài khoản riêng. [QA và cách mở](qa/SNAKE-CATALOG-2026-11-12.md).

`npm run build:snake-catalog` → `npm run preview:snake-catalog` tại cổng 4343. Output local nằm ngoài `dist`. Build mặc định vẫn 24 game. Candidate lưu theo thiết bị và owner. Preview xác thực có riêng theo SN-R0b. Engine/save format và chính sách thưởng chung giữ như trước.

## Việc tiếp theo

- Đọc [thẻ Snake](plans/SNAKE.md). Còn M2, Android/iPhone thật, duyệt art/audio và thử điều khiển ba cầu/pha 3 Nhện Mẹ.
- SN-R0b cần staging có verifier/schema, fixture hợp lệ và ca live save/ACK/đổi account/ghi cạnh tranh/JWT. [Runbook](snake/UI-SAVE-RUNBOOK.md).
- Khi chủ dự án chọn phát hành, xác định phạm vi catalog public, full CI trên head tích hợp, pilot và rollback về build mặc định nếu cần. Giữ các save trên thiết bị.

Một WORKLOG tối đa ba mục. Archive giữ nguyên văn. Studio đã cài đủ. AD-03, commerce và ONLINE-V1 theo thẻ riêng.
