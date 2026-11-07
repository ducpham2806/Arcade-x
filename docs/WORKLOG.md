# Nhật ký công việc

Nhật ký chính duy nhất; giữ≤3mục. Chi tiết trước chốt release giữ [nguyên văn](archive/WORKLOG-2026-11-07-before-release-close.md); DOC-01 ở [archive riêng](archive/WORKLOG-2026-11-06-DOC-01.md). Tóm tắt kết quả ở COMPLETED, quy trình ở WORKFLOW.

## 07/11/2026 · WC-PLAN / SN-PLAN DONE tài liệu · codex/word-chain-launcher-release

- Chủ dự án yêu cầu plan phòng/ghép trận/PK Nối Từ và phần còn thiếu của Rắn. Đối chiếu source5a64fef, core/Edge/UI và live-save QA; dùng playbook game-production-scrum, không nạp lại cả thư viện.
- [Nối Từ](word-chain/ONLINE-PLAN.md): ON1staging/tắt thưởng pilot→phòng riêng→FIFO→PK/đầu hàng→mạng/Auth/IME→nghiệm thu. Điểm thưởng chỉ có ref chống lặp cần gate; đầu hàng đã qua leave/server forfeit, cần kiểm toàn luồng thay vì nối thêm lệnh trùng. Không triển khai backend từ yêu cầu lập plan.
- [Snake](snake/CONTINUATION-PLAN.md): baseline/bundle→UI chơi-lưu-reload/JWT thật→thiết bị→R01/art/audio/playtest→candidate/phát hành. Cloud core và icon/banner đã có, không làm lại; chưa public.
- Build preview/test:snake-preview local qua; chunk game1,92MB raw/~1,35MB gzip là gap đóng gói public, chưa chạy toàn bộ suite/thiết bị/live trong lượt lập plan. [Số đo](qa/SNAKE-PLAN-BASELINE-2026-11-07.md).
- Đã cập nhật thẻ/roadmap/bàn giao, giữ tài liệu chi tiết đọc theo task. TC-R0 do chủ dự án để sau, log giữ [nguyên văn](archive/WORKLOG-2026-11-07-TC-R0-deferred.md). WC-L0 vẫn ACTIVE: Preview5a64fef success,CI23 fail suffix desktop. Thêm focus/caret/value assertions trước gõ, cần full CI head mới.

## 07/11/2026 · WC-L0 ACTIVE · codex/word-chain-launcher-release

- Chủ dự án yêu cầu đưa Nối Từ ra sảnh với icon/banner. Chọn bundled-free bot/offline như Tank, giữ online=false và policy maintenance/premium server; không SQL production.
-2master ImageGen đã tích hợp; icon22KB/banner30KB, URL hash/offline package, regeneration deterministic. Local lint/build/bundle/fast, engine36check, artwork qua; CUA desktop/phone kiểm bot, từ sai/đúng, favorite/recent/exit. [Bằng chứng](qa/WC-L0-2026-11-07.md); chờ full CI/production. Log Render06/11 giữ [nguyên văn](archive/WORKLOG-2026-11-06-Render-release-summary.md).
- GitHub compare xác nhận Game_Studio_Agent main vẫn c5dac462, không có update; doc checker297blob/116skill/21role/4rules qua. Thư viện đã có đủ, dùng theo nhu cầu, không tạo21tiến trình.
- PR#18/b0e0c44 Preview success, offline check qua. CUA320 phát hiện Next bị cắt; sửa controls2hàng≤399px,320/360/375/390 bounds qua, thêm regression. Cần full CI head mới; chủ dự án thêm yêu cầu plan online Nối Từ và Snake, chưa triển khai online.

## 07/11/2026 · NETLIFY-BUILD DONE / WC-R0 audit · codex/tank-clash-release-verification

- Tái hiện TS2307 thiếu ws trong nested server dependencies trên checkout sạch. Dùng deps:tank-clash chung CI/Netlify trước lint/build, giữ test/Snake preview; local exit0.
- Preview b644da2 success; full CI run42311533962 success; PR#17 merge main1131927. Production deploy6aee682dc2bd2dba16385690 Published,4bundle JS đầu trùng byte build đã kiểm. [Báo cáo](qa/NETLIFY-BUILD-2026-11-07.md).
- [Nối Từ](qa/WC-R0-2026-11-07.md) có source/test trong main/nhánh, CI engine/UI qua. Catalog public23mục không trả word-chain; fallback chỉ DEV, online flagfalse. Chưa thay catalog/DB/online; không thiếu merge game.
- DOC-01/thư viện116skill/21role/4rules đã vào main cùng PR#17. Checkpoint sau release cập nhật ở nhánh hiện tại, không thay runtime.
