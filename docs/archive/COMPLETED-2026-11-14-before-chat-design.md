# Tóm tắt công việc đã hoàn tất

Đây là bộ nhớ kết quả theo module, không phải nhật ký thứ hai. Chỉ đọc mục liên quan; nguồn đang làm ở SESSION-HANDOFF. “Đã merge” là trạng thái mã nguồn, không đảm bảo production/thiết bị.

## NETLIFY-BUILD / AUTH-XTAB · đã phát hành · 07/11/2026

- PR17/main1131927: deps:tank-clash trước lint/build sửa TS2307 nestedws; fullCIb644da2, NetlifyPublished/4bundlebyte-match. [BuildQA](qa/NETLIFY-BUILD-2026-11-07.md).
- Auth giữ identity riêng, hủy restore cũ;5regression và fixture A→guest→B qua. Production B tạo phòng, logout xuyên tab→về thư viện/login; [QA](qa/BUG-AUTH-CROSS-TAB.md). Ca đăng nhậpA/mãB cũ user để sau, TC-R0 vẫn thiếu ca này.

## WC-PLAN / SN-PLAN · DONE tài liệu · 07/11/2026

- Nhánh codex/word-chain-launcher-release/nguồn5a64fef: [NốiTừ](word-chain/ONLINE-PLAN.md) staging→phòng→queue→PK→mạng/Auth; [Snake](snake/CONTINUATION-PLAN.md) baseline→UI/save→thiết bị/nội dung→release. Có task/file/AC; plan không tự cấp quyền deploy.

## SN-R2b · đã phát hành R01 · 13/11/2026

- `codex/snake-public-release`, PR #29, CI #47 qua, main `19af480`, Netlify Published.
- R01 miễn phí, 10 màn, icon/banner đã duyệt. Lưu riêng theo người chơi trên thiết bị.
- Public Chrome qua tải gói, reload offline, màn 1/âm thanh/thoát. JS game và 20 media khớp build.
- Còn nghiệm thu Android/iPhone, người mới chơi và live save/JWT. [QA phát hành](qa/SNAKE-PUBLIC-2026-11-13.md).

## SN-R2a · ứng viên Snake local · 12/11/2026

- Nhánh codex/snake-catalog-candidate tại 4432a0e. Kiểm 10 màn, lazy media, gói offline 36 tệp, favorite/recent, save khách và tài khoản riêng. [QA](qa/SNAKE-CATALOG-2026-11-12.md). SN-R2b thực hiện từ main ngày 13/11.

## ONLINE-ERROR · đã phát hành · 08/11/2026

- PR21 full CI36 → main9061bfd, Netlify Published và bundle byte-match. Nối Từ tạo/rời phòng, Tank tự nối lại sau khôi phục. [QA](qa/ONLINE-ERROR-2026-11-08.md).
- Tank Render Free phục hồi thủ công c705100, chủ dự án chọn giữ Free. 409 cũ thiếu body, ON5/ON6 còn QA. [Tóm tắt nguyên văn trước phát hành Snake](archive/COMPLETED-2026-11-13-before-snake-public.md).

## WC-L0 · DONE bot/offline ra sảnh · 07/11/2026

- PR18/main3f943d9: bundled-free/policy server, icon512/banner1280×640 từ2master ImageGen, hash/offline package. Online=false, không SQL production.
- Full CI24/head5882adf success,5UI Nối Từ/13Tank/generated clean; CUA PC/phone320–390 qua. Netlify6aeebb61665214227ba314ef Published,4JS+2ảnh byte-match; bot “cấm địa”→“địa giới”, exit qua. [QA](qa/WC-L0-2026-11-07.md).
- Audit WC-R0 xác nhận source đã ở main, catalog thiếu game; WC-L0 xử lý bằng bundled entry. CI24ảnh bị dọn, đã sửa upload trong PR19/CI26–28. Lịch sử chi tiết giữ [nguyên văn](archive/COMPLETED-2026-11-08-before-word-chain-pilot.md).

## WC-ON1–ON4 / WC-PUBLIC · pilot và phát hành · 08/11/2026

- PR19/CI29→merge256620c; PR20/head970a941/CI32→merge086d6ac. NetlifyPublished,34.512từ publicbyte-match. Mốc này trước incident mới ở mụcONLINE-ERROR.
- Staging2account qua phòng/PK/hosttransfer/mãđóng, queue/hủy/reset20s/timeout/2phiếu rematch; cron đóng phòng hết rematch khi đóngtab. [QA](qa/WC-STAGING-2026-11-08.md).
- User duyệt exception production riêng: schema/Edge/handlerAuth/CORSexact/legacyJWT OFF/cronVault. Đã áp/probeAuth/CORS/tick/RPCdenial; tick200. PublicX9FL8R tạo-rời vàqueue-hủy qua; [release](word-chain/PUBLIC-RELEASE-2026-11-08.md).
- Không đổi save/Auth/commerce; online chưaXP/xu, cầnreceipt bền vững. User bỏ gate thật3/4; ON5/ON6 cònQA. Chi tiết cũ giữ trong archive trước đóngONLINE-ERROR.

## TC-R0 phần deploy/Auth cơ bản · 06/11/2026

- Đã phát hiện và sửa Render còn staging3950abb; service main/c705100 đã Live14:54, Free/cap16/Node24, registered-free đúng ArcadeX.
- Health/TLS/origin/token âm qua; review/config/metrics public404. Không đổi SQL/key/chi phí.
- Account thật tạo/rời1v1, tạo2v2/exit dọn phòng, logout sau exit chặn online lại; không bắt đầu trận nhiều người.
- Bằng chứng: [TC-R0 report](tank-clash/TC-R0-2026-11-06.md). Cập nhật07/11: Netlify/Auth đã phát hành, logout retest qua; còn ca A/mã B cũ được chủ dự án để sau. TC-R1 chưa làm.
- Giữ Blueprint cũ paused, không sync ghi đè service main; lần sau tiếp QA còn thiếu, không deploy lại vô cớ.

## DOC-01 · DONE · 06/11/2026

- codex/docs-game-studio-handoff→PR17: thẻ game/project.md/một WORKLOG/bàn giao ngắn, thu gọn trước đổi việc và checker budget.
- Studio c5dac462:116skill/21role/4rules/297blob; discovery theo task, không nạp cả thư viện. [Chi tiết](archive/WORKLOG-2026-11-06-DOC-01.md). Không đổi runtime/schema.

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
- Nối Từ đã public phần phòng/PK/queue, còn ON5/ON6; Duel/commerce chưa hoàn tất triển khai, xem đúng thẻ; payment vẫn tắt.
