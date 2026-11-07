# Nhật ký công việc

Nhật ký chính duy nhất; giữ≤3mục. Chi tiết trước chốt release giữ [nguyên văn](archive/WORKLOG-2026-11-07-before-release-close.md); DOC-01 ở [archive riêng](archive/WORKLOG-2026-11-06-DOC-01.md). Tóm tắt kết quả ở COMPLETED, quy trình ở WORKFLOW.

## 07/11/2026 · WC-L0 ACTIVE · codex/word-chain-launcher-release

- Chủ dự án yêu cầu đưa Nối Từ ra sảnh với icon/banner. Chọn bundled-free bot/offline như Tank, giữ online=false và policy maintenance/premium server; không SQL production.
-2master ImageGen đã tích hợp; icon22KB/banner30KB, URL hash/offline package, regeneration deterministic. Local lint/build/bundle/fast, engine36check, artwork qua; CUA desktop/phone kiểm bot, từ sai/đúng, favorite/recent/exit. [Bằng chứng](qa/WC-L0-2026-11-07.md); chờ full CI/production. Log Render06/11 giữ [nguyên văn](archive/WORKLOG-2026-11-06-Render-release-summary.md).
- GitHub compare xác nhận Game_Studio_Agent main vẫn c5dac462, không có update; doc checker297blob/116skill/21role/4rules qua. Thư viện đã có đủ, dùng theo nhu cầu, không tạo21tiến trình.

## 07/11/2026 · NETLIFY-BUILD DONE / WC-R0 audit · codex/tank-clash-release-verification

- Tái hiện TS2307 thiếu ws trong nested server dependencies trên checkout sạch. Dùng deps:tank-clash chung CI/Netlify trước lint/build, giữ test/Snake preview; local exit0.
- Preview b644da2 success; full CI run42311533962 success; PR#17 merge main1131927. Production deploy6aee682dc2bd2dba16385690 Published,4bundle JS đầu trùng byte build đã kiểm. [Báo cáo](qa/NETLIFY-BUILD-2026-11-07.md).
- [Nối Từ](qa/WC-R0-2026-11-07.md) có source/test trong main/nhánh, CI engine/UI qua. Catalog public23mục không trả word-chain; fallback chỉ DEV, online flagfalse. Chưa thay catalog/DB/online; không thiếu merge game.
- DOC-01/thư viện116skill/21role/4rules đã vào main cùng PR#17. Checkpoint sau release cập nhật ở nhánh hiện tại, không thay runtime.

## 07/11/2026 · TC-R0 WAITING ca A sau release

- Auth xuyên tab: 4/5 fail trước sửa,5/5 qua sau sửa; AuthProvider fixture A→guest→B qua; sửa đã phát hành1131927. [Chi tiết](qa/BUG-AUTH-CROSS-TAB.md).
- Hai account thật trước release: B khác A, tab nhận B, mã A cũ không còn, phòng B tạo được. Sau release: cả2tab bundle mới/B thật, tạo phòng9FNNVT→logout tab kia→tab game về thư viện→Online mở login, không còn B/Welcome cũ. Health200/ok.
- Chủ dự án chọn “Để kiểm ca này sau” với đăng nhập lại A/kiểm mã B cũ sau release; giữ WAITING, không đánh TC-R0 DONE. Không lưu định danh/password/JWT; các tab mới còn guest. TC-R1 nhiều thiết bị/mạng/soak chưa đạt.
