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

- Nhánh codex/word-chain-launcher-release, nguồn5a64fef: [Nối Từ](word-chain/ONLINE-PLAN.md) staging→phòng→queue→PK→mạng/Auth→nghiệm thu; [Snake](snake/CONTINUATION-PLAN.md) baseline→UI/save→thiết bị/nội dung→release. Có task/file/AC/bằng chứng/ước lượng; lập plan không tự deploy hay bật flag.

## WC-L0 · DONE bot/offline ra sảnh · 07/11/2026

- PR18/main3f943d9: bundled-free/policy server, icon512/banner1280×640 từ2master ImageGen, hash/offline package. Online=false, không SQL production.
- Full CI24/head5882adf success,5UI Nối Từ/13Tank/generated clean; CUA PC/phone320–390 qua. Netlify6aeebb61665214227ba314ef Published,4JS+2ảnh byte-match; bot “cấm địa”→“địa giới”, exit qua. [QA](qa/WC-L0-2026-11-07.md).
- Audit WC-R0 xác nhận source đã ở main, catalog thiếu game; WC-L0 xử lý bằng bundled entry. CI24ảnh bị dọn, đã sửa upload trong PR19/CI26–28. Lịch sử chi tiết giữ [nguyên văn](archive/COMPLETED-2026-11-08-before-word-chain-pilot.md).

## WC-ON1–ON4 / WC-PUBLIC · đã pilot và phát hành · 08/11/2026

- Nhánh codex/word-chain-online→codex/word-chain-public-release: PR19 merge256620c/CI29; PR20 head970a941/full CI32 success, merge086d6ac. Netlify6af00f400397c396a118ca39 Published/main086d6ac đã đọc live;34.512từ public byte-match.
- Staging2account thật qua tạo/join/start2/cap4/PK, đầu hàng/kết quả, host transfer/mã đóng, queue/hủy/reset20s/timeout/2phiếu rematch; cron đóng phòng hết rematch khi đóng tab. [QA](qa/WC-STAGING-2026-11-08.md).
- User duyệt gói production riêng: schema/Edge/handlerAuth, CORS exact, legacyJWT OFF, cron10s/Vault. Đã áp và probe Auth/CORS/tick/RPC denial; tick thật200. Không lộ secret, không thay save/Auth/commerce.
- Public registered thật: tạo X9FL8R1/2→rời; queue1/4→hủy về menu. Lần đầu lỗi tải game, hard reload rồi mở được, nguyên nhân chưa xác định. [Bằng chứng cuối](word-chain/PUBLIC-RELEASE-2026-11-08.md).
- User bỏ gate3/4người, không nhận đã kiểm; ON5/ON6 (2thiết bị/2mạng/soak/Auth/IME/no-client turn) còn backlog. Online không XP/xu, cần receipt bền vững trước mở thưởng.
- Checkpoint codex/word-chain-release-handoff chỉ tài liệu; lịch sử [nguyên văn](archive/COMPLETED-2026-11-08-before-public-release-close.md). Tiếp Snake theo roadmap, chưa bắt đầu.

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
