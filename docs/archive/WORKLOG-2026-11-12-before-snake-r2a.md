# Nhật ký công việc

Một nhật ký chính, tối đa ba mục. [Log trước SN-R1b](archive/WORKLOG-2026-11-12-before-snake-r1b.md). Quy trình ở WORKFLOW, kết quả bền vững ở COMPLETED.

## 12/11/2026 · SN-R1b kiểm nội dung local · codex/snake-r1b-content-review

- Từ bad1d56, tiếp phần nội dung sau SN-R1a local. Suite journey dùng Engine thật đi hết 10 màn, lưu và đọc lại 28/30 sao, 10 receipt và ngọc R01. Kiểm rơi cầu, lượt mới qua đủ ba cầu, Nhện Mẹ 6 hit/3 pha.
- Chrome preview dùng Auth/Edge fixture kiểm 1-7 rơi nước, chơi lại qua ba cầu, lưu một lần và mở 1-8. Nghe thử báo đã phát.
- Xem 16 cảnh renderer desktop và khung dọc/ngang. Sửa nút Bắt đầu ở 568×320 bị cắt sát mép khi cuộn. Ca layout chạy lại đạt toàn bộ, giữ tỷ lệ hiện 100%. Typecheck, build/budget, 6 suite Snake, 10 UI và 3 guard qua.
- Còn human playtest, duyệt art/animation/audio, thiết bị thật và live save/JWT. [Báo cáo và bước tiếp](qa/SNAKE-R1B-2026-11-12.md).

## 12/11/2026 · SN-R1a local fixes · codex/snake-r1a-controls-runtime

- User cho làm phần không cần live, test thật sau; từ79cf133/PR27CI43 success. Checkpoint ad7aa50 và archive trước chuyển task. Red audio resume muộn/stale rejection, lab pagehide và Dash cắt ở844×390 đã sửa; thêm orientation clear, safe-area riêng Snake, dock landscape2cột/Dash SVG. Không đổi engine/save/wallet/SQL/flags.
- 10UI/3guard,6suite local/audio race, lint,root/preview build/package/bundle và5nhóm guest/SW qua.3vòng play/exit:RAF/RO/listener/audio1/1/9/1→0;5viewport+native inset/touch/rotation qua, đã xem ảnh trước/sau. Render p95 16,8–33,4ms ở headless, không suy60FPS/heap/thiết bị thật. CI Snake bao gồm controls mới; verify thêm check-docs budget/link.
- Graphify642/1462, seed/contextcall/budget700,0LLM/upload; không nạp payload lớn. [Report/giới hạn](qa/SNAKE-R1A-2026-11-12.md); user giữ nghiệm thu điện thoại/live/human sau, R1a/R0b chưa DONE toàn bộ. Chưa merge/deploy/public/commerce/ads thật. [Log trước nguyên văn](archive/WORKLOG-2026-11-12-before-snake-r1a.md).

## 12/11/2026 · SN-R0b local UI · codex/snake-r0b-ui-save

- Từ8690fb9/PR26, parent CI42 success. Sáu ca UI local qua (3,3phút): login/pointer win/save/new-device/stars/best/unlock, offline, lostACK/reload/idempotent, account switch, cạnh tranh hai context/revision, fixture-expiry refresh giữ engine. Ví riêng0/shared wallet giữ nguyên; không đổi code sản phẩm. 3guard live, lint,6suite local cũ, structure/diff/link active qua; snapshot verifier v2 cùng6/6 qua (3,2phút), không skip/flaky.
- Connector đọc Edge ACTIVE/v2/verify_jwt/digest khớp, không SQL/deploy/actor/grant. Snapshot private ngoài git; replay reference vẫn Auth/store local, không chứng minh DB/JWT/flags thật. Đã xem saved-result/actions/restore screenshots, card cuộn tới CTA đầy đủ.
- Thêm CLI live dùng existing fixture, preflight thiếu binding exit2 trước network; toàn path live chưa chạy. Network revision1 chưa allow Supabase/không binding; câu hỏi fixture còn chờ. PR27/79cf133: CI43 success, cả snake_ui/verify; CI job riêng lưu evidence; [report](qa/SNAKE-R0B-2026-11-12.md)/[runbook](snake/UI-SAVE-RUNBOOK.md). R0b LIVE WAITING, không public/rewards/commerce/ads thật/merge/deploy.
- Graphify703node/1608edge localAST, seed/contextcall/budget700; query3/2 và6/6, inline parser thiếu dùng rg hẹp; không nạp assets/base64, không LLM/upload. [Log trước nguyên văn](archive/WORKLOG-2026-11-12-before-snake-r0b.md).
