# Nhật ký công việc

Nhật ký chính duy nhất; giữ≤3mục. Chi tiết trước chốt release giữ [nguyên văn](archive/WORKLOG-2026-11-07-before-release-close.md); DOC-01 ở [archive riêng](archive/WORKLOG-2026-11-06-DOC-01.md). Tóm tắt kết quả ở COMPLETED, quy trình ở WORKFLOW.

## 07/11/2026 · WC-PLAN / SN-PLAN DONE tài liệu · codex/word-chain-launcher-release

- Chủ dự án yêu cầu plan phòng/ghép trận/PK Nối Từ và phần còn thiếu của Rắn. Đối chiếu source5a64fef, core/Edge/UI và live-save QA; dùng playbook game-production-scrum, không nạp lại cả thư viện.
- [Nối Từ](word-chain/ONLINE-PLAN.md): ON1staging/tắt thưởng pilot→phòng riêng→FIFO→PK/đầu hàng→mạng/Auth/IME→nghiệm thu. Điểm thưởng chỉ có ref chống lặp cần gate; đầu hàng đã qua leave/server forfeit, cần kiểm toàn luồng thay vì nối thêm lệnh trùng. Không triển khai backend từ yêu cầu lập plan.
- [Snake](snake/CONTINUATION-PLAN.md): baseline/bundle→UI chơi-lưu-reload/JWT thật→thiết bị→R01/art/audio/playtest→candidate/phát hành. Cloud core và icon/banner đã có, không làm lại; chưa public.
- Build preview/test:snake-preview local qua; chunk game1,92MB raw/~1,35MB gzip là gap đóng gói public, sau đó6suite cloud/session/journey/boss/props/audio local cùng qua; chưa kiểm UI/thiết bị/live mới. [Số đo](qa/SNAKE-PLAN-BASELINE-2026-11-07.md).
- Đã cập nhật thẻ/roadmap/bàn giao, giữ tài liệu chi tiết đọc theo task. TC-R0 do chủ dự án để sau, log giữ [nguyên văn](archive/WORKLOG-2026-11-07-TC-R0-deferred.md). WC-L0 đã xong/merge3f943d9/Published sau CI24success; checkpoint báo cáo sau release tiếp ở nhánh.

## 07/11/2026 · WC-L0 DONE bot/offline · codex/word-chain-launcher-release

- Bundled-free Nối Từ,2master ImageGen/icon/banner/hash/offline package; giữ policy server và online=false, không SQL production. Local lint/build/bundle/fast/36check engine và CUA PC/phone qua; hẹp320–390 không clipping.
- CI23fail nhập suffix desktop; fixture chờ focus/caret và assert value, không nới kiểm từ/kết quả. Full CI24/head5882adf success/run42342747871; PR18 merge3f943d9. Netlify6aeebb61665214227ba314ef Published;4JS+2ảnh byte-match.
- CUA production24game/7slide, artwork/menu bot, nhập “cấm địa” nhận/bot “địa giới”, exit gỡ game và recent đúng. [Báo cáo](qa/WC-L0-2026-11-07.md); CI24ảnh bị suite sau dọn nên không ZIP, cần bảo trì upload. Không claim online/thiết bị thật. Log trước publish giữ [nguyên văn](archive/WORKLOG-2026-11-07-WC-L0-prepublish.md).
- Hai plan đã vào PR18; tiếp WC-ON1 theo plan, chưa bắt đầu backend. Game Studio đủ297blob/116skill/21role/4rules, không cài lại.

## 07/11/2026 · NETLIFY-BUILD DONE / WC-R0 audit · codex/tank-clash-release-verification

- Tái hiện TS2307 thiếu ws trong nested server dependencies trên checkout sạch. Dùng deps:tank-clash chung CI/Netlify trước lint/build, giữ test/Snake preview; local exit0.
- Preview b644da2 success; full CI run42311533962 success; PR#17 merge main1131927. Production deploy6aee682dc2bd2dba16385690 Published,4bundle JS đầu trùng byte build đã kiểm. [Báo cáo](qa/NETLIFY-BUILD-2026-11-07.md).
- [Nối Từ](qa/WC-R0-2026-11-07.md) có source/test trong main/nhánh, CI engine/UI qua. Catalog public23mục không trả word-chain; fallback chỉ DEV, online flagfalse. Chưa thay catalog/DB/online; không thiếu merge game.
- DOC-01/thư viện116skill/21role/4rules đã vào main cùng PR#17. Checkpoint sau release cập nhật ở nhánh hiện tại, không thay runtime.
