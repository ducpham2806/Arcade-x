# Nhật ký công việc

Một nhật ký chính, tối đa ba mục. [Log trước SN-R2a](archive/WORKLOG-2026-11-12-before-snake-r2a.md). Quy trình ở WORKFLOW, kết quả bền vững ở COMPLETED.

## 12/11/2026 · SN-R2a gói preview local · codex/snake-r2a-preview-assets

- Từ 2f82945, tách 6 atlas và 14 WAV nguyên byte. Game JS giảm từ 1.917.496 xuống 151.769 byte, chunk lớn nhất preview 420.125 byte. Tải ảnh khi vào màn, WAV khi bật tiếng.
- Chrome preview qua ảnh chậm, hình thay thế rồi sprite, retry một WAV lỗi, thoát hủy 14 request. Standalone HTML chơi 1-1 khi offline. Build, 6 suite, 10 UI và 3 guard qua. [QA](qa/SNAKE-R2A-2026-11-12.md).
- Chủ dự án nghiệm thu sau. Còn kiểm thật thiết bị, người mới, save/JWT và gói tích hợp catalog khi chọn phát hành.

## 12/11/2026 · SN-R1b kiểm nội dung local · codex/snake-r1b-content-review

- Từ bad1d56, tiếp phần nội dung sau SN-R1a local. Suite journey dùng Engine thật đi hết 10 màn, lưu và đọc lại 28/30 sao, 10 receipt và ngọc R01. Kiểm rơi cầu, lượt mới qua đủ ba cầu, Nhện Mẹ 6 hit/3 pha.
- Chrome preview dùng Auth/Edge fixture kiểm 1-7 rơi nước, chơi lại qua ba cầu, lưu một lần và mở 1-8. Nghe thử báo đã phát.
- Xem 16 cảnh renderer desktop và khung dọc/ngang. Sửa nút Bắt đầu ở 568×320 bị cắt sát mép khi cuộn. Ca layout chạy lại đạt toàn bộ, giữ tỷ lệ hiện 100%. Typecheck, build/budget, 6 suite Snake, 10 UI và 3 guard qua.
- Còn human playtest, duyệt art/animation/audio, thiết bị thật và live save/JWT. [Báo cáo và bước tiếp](qa/SNAKE-R1B-2026-11-12.md).

## 12/11/2026 · SN-R1a local fixes · codex/snake-r1a-controls-runtime

- User cho làm phần không cần live, test thật sau; từ79cf133/PR27CI43 success. Checkpoint ad7aa50 và archive trước chuyển task. Red audio resume muộn/stale rejection, lab pagehide và Dash cắt ở844×390 đã sửa; thêm orientation clear, safe-area riêng Snake, dock landscape2cột/Dash SVG. Không đổi engine/save/wallet/SQL/flags.
- 10UI/3guard,6suite local/audio race, lint,root/preview build/package/bundle và5nhóm guest/SW qua.3vòng play/exit:RAF/RO/listener/audio1/1/9/1→0;5viewport+native inset/touch/rotation qua, đã xem ảnh trước/sau. Render p95 16,8–33,4ms ở headless, không suy60FPS/heap/thiết bị thật. CI Snake bao gồm controls mới; verify thêm check-docs budget/link.
- Graphify642/1462, seed/contextcall/budget700,0LLM/upload; không nạp payload lớn. [Report/giới hạn](qa/SNAKE-R1A-2026-11-12.md); user giữ nghiệm thu điện thoại/live/human sau, R1a/R0b chưa DONE toàn bộ. Chưa merge/deploy/public/commerce/ads thật. [Log trước nguyên văn](archive/WORKLOG-2026-11-12-before-snake-r1a.md).
