# Tóm tắt công việc đã hoàn tất

[Bản trước sửa badge](archive/COMPLETED-2026-11-13-before-hosting-badge.md). Đây là bộ nhớ kết quả theo module, không phải nhật ký thứ hai. Chỉ đọc mục liên quan; nguồn đang làm ở SESSION-HANDOFF. “Đã merge” là trạng thái mã nguồn, không đảm bảo production/thiết bị.

## Snake R01 · kỹ thuật ứng viên · 14/11/2026

- Nhánh codex/snake-r01-finish từ2ca0b3c/PR33: sửa S1accountsave cùng store xuyên Story/Journey/Lab, giữ guest/format và audio prefs. [QA](qa/SNAKE-FINISH-2026-11-14.md).
- Sửa nativekeyboard/focus/Escape và boss marker đúng tơ/táo/cột/điểm yếu/cổng; không đổi physics/replay/rewards.
- UI10/10thắng/29sao qua pointer/time thật, boss6hit/3pha, reload/cleanup0/pageerror0. Giữ V1driverFAIL, V2PASS, không gọi humanplaytest.
- Player3ca và Labprefs red→green; unit6suite/lint/build/rollback/preview/bundle/catalog/storage qua; CI đúnghead và merge/deploy còn riêng.
- [Phiếu nghiệm thu](snake/R01-ACCEPTANCE.md) sẵn sàng; Android/iPhone/người mới/art/audio thật cònWAITING. Livepreflight thiếu4binding, không login/ghiDB. [Trước task](archive/COMPLETED-2026-11-14-before-snake-finish.md).

## Snake R01 / Auth / Studio · phát hành · 13/11/2026

- PR29 đưaR01 vào sảnh; PR31/head1909fa6 qua fullCI50 rồi merge8320385, gồmPR30. [QA phát hành](qa/SNAKE-PUBLIC-2026-11-13.md). Netlify6af6f590d7b4bd3516a37885 Published18:34GMT+7 đúng8320385.
- Public36tệp/3.047.410byte khớp build; guest/card/detail/download/cache/offline reload/input/audio/exit qua, không pageerror/fixture. Tâm CTA/joystick/Dash online tới được; S3badge che một phần nhãn mobile còn theo dõi.
- Badge S3: ứng viên `codex/fix-hosting-badge-safe-area` chừa vùng HUD giữ branding; hosting5/5/modal36/catalog/animation50+25/SnakeUI11+3guard qua. [QA ứng viên](qa/SNAKE-BADGE-2026-11-13.md); CI55/head2ca0b3c success cảverify/snake_ui, PR33 READY; merge/deploy còn riêng.
- Auth6RPC bind tokenSession; unit7/7,UI11/11+3guard và save/sync qua. [QA Auth](qa/SNAKE-AUTH-XTAB-2026-11-13.md). Registered public/live JWT và thiết bị/humanQA còn riêng; FullCI51 sau merge success.
- Studio116skill/21role/297blob + Graphify0.9.108 đã vào main; [nguồn/cách dùng](studio/GRAPHIFY.md). Bộ nhớ theo checkout, không nạp toàn bộ mỗi phiên.
- Nguồn/bằng chứng local trước phát hành và tóm tắt cũ giữ [nguyên văn](archive/COMPLETED-2026-11-13-before-snake-release-close.md); không đổi engine/save/backend/rewards/commerce.

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

## MERGE-AUDIT · 06/11/2026

- Mainc705100/PR16 đã tích hợp; audit24nhánh phân biệt nhánh đã có, docs tương đương và P2 cần port theoTC-R2. [Chi tiết nguyên văn](archive/COMPLETED-2026-11-14-before-snake-finish.md).

## Tank Clash / Battleship / Dungeon · các mốc trước

- PR16 gồm P3b/c/d, adapter Tank và motion PC/polish Battleship/Dungeon; chưa kết luận thiết bị/backend/reward. [Chi tiết nguyên văn](archive/COMPLETED-2026-11-14-before-snake-finish.md), [thẻ Tank](plans/TANK-CLASH.md).

## Snake / nền tảng / các game khác

- Snake R01 đã public client; cloud preview/thiết bị/human QA còn riêng. [Live-save](SNAKE_LIVE_SAVE_QA.md), [thẻ tiếp tục](plans/SNAKE.md).
- Launcher M0–M8, Neon NR1–NR4, các đợt Boom/Cosmic/Eat/Block/Blossom/Rainbow đã có trong nguồn; không mặc định coi ghi chú “chưa merge” ở báo cáo cũ là hiện trạng.
- Nối Từ đã public phần phòng/PK/queue, còn ON5/ON6; Duel/commerce chưa hoàn tất triển khai, xem đúng thẻ; payment vẫn tắt.
