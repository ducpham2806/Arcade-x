# Tóm tắt công việc đã hoàn tất

Đây là bộ nhớ kết quả theo module, không phải nhật ký thứ hai. Chỉ đọc mục liên quan; nguồn đang làm ở SESSION-HANDOFF. “Đã merge” là trạng thái mã nguồn, không đảm bảo production/thiết bị.

## NETLIFY-BUILD · DONE · 07/11/2026

- Tái hiện TS2307 thiếu nested ws trên checkout sạch; dùng deps:tank-clash chung CI/Netlify trước lint/build, giữ Snake preview và mọi test.
- Local chuỗi preview exit0, Netlify Preview success; full CI b644da2 success, PR#17 merge main1131927. [Báo cáo](qa/NETLIFY-BUILD-2026-11-07.md).
- Production deploy6aee682dc2bd2dba16385690 Published,4bundle đầu trùng byte build đã kiểm; không đổi DB/server wire/chi phí.

## AUTH-XTAB phần sửa nguồn / logout release · 07/11/2026

- Nhánh codex/tank-clash-release-verification: sửa listener Auth giữ identity riêng, hủy restore cũ; thêm test:auth-session vào fast.
- Red/green:4/5 fail trước sửa,5/5 qua sau sửa; lint/build/bundle/fast qua; UI AuthProvider thật với fixture A→guest→B qua.
- Production hai account thật: B khác A, tab game nhận B, phòng A cũ không còn, tạo phòng B qua. [Chi tiết](qa/BUG-AUTH-CROSS-TAB.md).
- PR#17 đã merge/phát hành1131927. Hai tab bundle mới/B thật: tạo phòng→logout tab kia→về thư viện→Online hiện login, không còn hồ sơ B. Chủ dự án để ca đăng nhập A/mã B cũ sau; TC-R0 còn WAITING, TC-R1 chưa đạt.

## WC-PLAN / SN-PLAN · DONE tài liệu · 07/11/2026

- Nhánh codex/word-chain-launcher-release; đối chiếu source5a64fef và báo cáo live-save. [Nối Từ](word-chain/ONLINE-PLAN.md): staging/reward gate→phòng riêng→ghép trận→PK→mạng/Auth→nghiệm thu. [Snake](snake/CONTINUATION-PLAN.md): baseline→UI/save thật→thiết bị/nội dung→candidate phát hành.
- Đã phân biệt core có sẵn với gap, chia task/file/AC/bằng chứng/ước lượng; thẻ gọn và roadmap ưu tiên cập nhật. Không deploy backend, SQL production hay bật flag từ plan; WC-L0 chờ CI/deploy riêng.

## WC-L0 phần art/catalog/local QA · 07/11/2026

- Nhánh codex/word-chain-launcher-release/PR#18: bundled-free bot/offline, policy server giữ ưu tiên;2master ImageGen, icon512/banner1280×640, hash/package/provenance đồng bộ.
- Local lint/build/bundle/fast, engine36check/artwork qua; CUA PC/phone kiểm bot/từ sai-đúng/favorite/recent/exit. Sửa clipping7controls ở≤399px, bounds320/360/375/390 qua.
- b0e0c44 Preview success và offline check qua; sửa narrow cần CI head mới. [Báo cáo](qa/WC-L0-2026-11-07.md). Chưa merge/phát hành WC-L0; checkpoint trước chuyển sang lập plan online/Snake theo yêu cầu mới.

## WC-R0 phần xác minh nhánh/catalog · 07/11/2026

- Nối Từ đã có source/test trong main c705100 và nhánh TC-R0; không bỏ sót merge game. Catalog public trả23mục, không trả word-chain; fallback chỉ DEV, Netlify Preview cũng production mode.
- [Audit](qa/WC-R0-2026-11-07.md) giữ bằng chứng và giới hạn: chưa đọc migration history/staging, chưa thay DB hoặc bật online. Tiếp theo thẻ WORD-CHAIN/quyết định#7/#8.

## TC-R0 phần deploy/Auth cơ bản · 06/11/2026

- Đã phát hiện và sửa Render còn staging3950abb; service main/c705100 đã Live14:54, Free/cap16/Node24, registered-free đúng ArcadeX.
- Health/TLS/origin/token âm qua; review/config/metrics public404. Không đổi SQL/key/chi phí.
- Account thật tạo/rời1v1, tạo2v2/exit dọn phòng, logout sau exit chặn online lại; không bắt đầu trận nhiều người.
- Bằng chứng: [TC-R0 report](tank-clash/TC-R0-2026-11-06.md). Cập nhật07/11: Netlify/Auth đã phát hành, logout retest qua; còn ca A/mã B cũ được chủ dự án để sau. TC-R1 chưa làm.
- Giữ Blueprint cũ paused, không sync ghi đè service main; lần sau tiếp QA còn thiếu, không deploy lại vô cớ.

## DOC-01 · 06/11/2026 · chuẩn hóa đầu vào phiên

- Nhánh `codex/docs-game-studio-handoff`, nền gameplay `c705100`.
- Roadmap chia thẻ theo game; project.md; một nhật ký chính WORKLOG; bàn giao ngắn và mẫu task.
- Quy trình bắt buộc đóng/tóm tắt trước đổi việc; archive giữ nguyên chi tiết; budget ký tự có checker.
- Cài toàn bộ Game Studio Agent `c5dac462`: 116 skill, 21 vai trò, 4 rules; 297 blob đối chiếu nguồn. Chỉ một skill đầu mối tự discovery để giảm metadata đầu vào.
- Kiểm tra/giới hạn ở [log DOC-01 lưu trữ](archive/WORKLOG-2026-11-06-DOC-01.md); phần cài tài liệu không đổi gameplay/runtime/schema. Đã merge qua PR#17.

## MERGE-AUDIT · 06/11/2026 · main c705100

- PR #16 đã merge; fast-forward checkout từ affc5e8 thêm 13 commit. Không tạo merge mới trên remote.
- Đối chiếu 24 nhánh; docs f834e3e tương đương 41d1862; WIP P3d đã có bản hoàn chỉnh 6eb394c; nhánh P3 song song không nhập lẫn implementation.
- Riêng bdc6f85/P2 staging chưa tích hợp hết: epoch/control receipts/bounded reconnect cần chuyển sang P3; theo TC-R2.
- Node24: lint, build, budget, fast, WS/ops 18/18 qua; không chạy lại full browser, không xác minh production hay thiết bị.

## Tank Clash / Battleship / Dungeon · PR #16 và các mốc trước

- P3b/P3c/P3d có phòng 2v2, tổ đội/queue, spectator, surrender/rematch; adapter account/WSS/cleanup và game thứ 24 trong sảnh đã merge.
- Motion PC không bị launcher reduced-motion tắt nhầm; Battleship căn tàu/lửa/dấu chìm/radar; Dungeon sửa chuyển động/chữ.
- Giữ token chỉ tới WSS tin cậy, không thưởng/DB result/commerce. Quyền phát hành bot + online tài khoản và Render Free đã được duyệt.
- Bằng chứng lịch sử: [log đầy đủ](archive/WORKLOG-2026-11-05-before-doc-refresh.md), [release local](tank-clash/evidence/LAUNCHER-local-2026-11-05.json).
- Còn nghiệm thu host/mạng/thiết bị, art/audio và kết quả backend; xem thẻ Tank, không mở lại task merge.

## Snake / nền tảng / các game khác

- Snake: hành trình, cloud progress/session, boss/props/audio đã được tích hợp nguồn; vẫn giới hạn preview, chưa đủ release sign-off. [Bằng chứng live-save](SNAKE_LIVE_SAVE_QA.md), [thẻ tiếp tục](plans/SNAKE.md).
- Launcher M0–M8, Neon NR1–NR4, các đợt Boom/Cosmic/Eat/Block/Blossom/Rainbow đã có trong nguồn; không mặc định coi ghi chú “chưa merge” ở báo cáo cũ là hiện trạng.
- Nối Từ/Duel/commerce có core/test, chưa hoàn tất triển khai sản phẩm; xem đúng thẻ. Không tóm tắt chúng thành “đã xong online/payment”.
