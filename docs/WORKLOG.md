# Nhật ký công việc

Một nhật ký chính, tối đa ba mục. [Log trước ứng viên catalog](archive/WORKLOG-2026-11-12-before-snake-catalog.md). Quy trình ở WORKFLOW, kết quả bền vững ở COMPLETED.

## 12/11/2026 · SN-R2a ứng viên catalog local · codex/snake-catalog-candidate

- Từ 3a3db28, chủ dự án duyệt preview và cho tiếp. Mode ứng viên có một thẻ Rắn Săn Mồi, yêu thích/gần đây/thoát, save khách và tài khoản riêng. Build mặc định vẫn 24 game.
- Gói tải theo yêu cầu gồm 16 tệp mã/CSS, 20 media. Sửa danh sách sinh trước pass CSS và cache tệp hash khi mở module offline. Chrome kiểm tải, tắt mạng, reload, vào màn và nghe thử. Thông báo offline không che joystick/Dash.
- [QA và cách mở](qa/SNAKE-CATALOG-2026-11-12.md). Còn thiết bị thật, playtest người mới, staging save/JWT và quyết định phát hành.

## 12/11/2026 · SN-R2a gói preview local · codex/snake-r2a-preview-assets

- Từ 2f82945, tách 6 atlas và 14 WAV nguyên byte. Game JS giảm từ 1.917.496 xuống 151.769 byte, chunk lớn nhất preview 420.125 byte. Tải ảnh khi vào màn, WAV khi bật tiếng.
- Chrome preview qua ảnh chậm, hình thay thế rồi sprite, retry một WAV lỗi, thoát hủy 14 request. Standalone HTML chơi 1-1 khi offline. Build, 6 suite, 10 UI và 3 guard qua. [QA](qa/SNAKE-R2A-2026-11-12.md).
- Chủ dự án nghiệm thu sau. Còn kiểm thật thiết bị, người mới, save/JWT và gói tích hợp catalog khi chọn phát hành.

## 12/11/2026 · SN-R1b kiểm nội dung local · codex/snake-r1b-content-review

- Từ bad1d56, tiếp phần nội dung sau SN-R1a local. Suite journey dùng Engine thật đi hết 10 màn, lưu và đọc lại 28/30 sao, 10 receipt và ngọc R01. Kiểm rơi cầu, lượt mới qua đủ ba cầu, Nhện Mẹ 6 hit/3 pha.
- Chrome preview dùng Auth/Edge fixture kiểm 1-7 rơi nước, chơi lại qua ba cầu, lưu một lần và mở 1-8. Nghe thử báo đã phát.
- Xem 16 cảnh renderer desktop và khung dọc/ngang. Sửa nút Bắt đầu ở 568×320 bị cắt sát mép khi cuộn. Ca layout chạy lại đạt toàn bộ, giữ tỷ lệ hiện 100%. Typecheck, build/budget, 6 suite Snake, 10 UI và 3 guard qua.
- Còn human playtest, duyệt art/animation/audio, thiết bị thật và live save/JWT. [Báo cáo và bước tiếp](qa/SNAKE-R1B-2026-11-12.md).
