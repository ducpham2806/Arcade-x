# Tóm tắt công việc đã hoàn tất

[Bản trước sửa badge](archive/COMPLETED-2026-11-13-before-hosting-badge.md). Đây là bộ nhớ kết quả theo module, không phải nhật ký thứ hai. Chỉ đọc mục liên quan; nguồn đang làm ở SESSION-HANDOFF. “Đã merge” là trạng thái mã nguồn, không đảm bảo production/thiết bị.

## Blossom Blast · 26/11/2026

- PR #46 có 9-slice, ghép tại bàn, UI 64/64 và engine 21/21. Merge `657ec42` sau CI #89. [QA](qa/BLOSSOM-GARDEN-UI-2026-11-26.md).

- PR #47 có vùng nổ, ghép, cổng và HUD. Sửa giảm chuyển động; 25 ca Playwright chuyển động, 60 ca UI Blossom và CI #92 qua. Merge `5cd1539`. Production và thiết bị thật còn chờ xác nhận. [QA](qa/BLOSSOM-VIVID-EFFECTS-2026-11-26.md).

## Ba bàn cờ chiến trường · 25–26/11/2026

- Bốn địa hình, quân pixel, bàn cổ điển và HTML offline. [QA](qa/THREE-BOARD-GAMES-2026-11-25.md).
- Xem lại thế bàn, khay và điểm theo nước đã vào `main` qua #44, CI #84. [QA](qa/THREE-BOARD-REVIEW-2026-11-26.md).
- Quét giáo, vòng phong cấp, hiệu ứng Pháo và khay vào `main@fc8bb2f` qua #45, CI #86. Lượt kiểm thêm 18/18 Chromium và `test:duel`/`test:folk-duel` qua. Thiết bị thật, hai tài khoản và trạng thái production còn chờ xác minh. [QA](qa/THREE-BOARD-VFX-2026-11-26.md).

## FD-ON2 và sửa lỗi QA Folk · 19/11/2026

- PR 42 sửa vạch lực online, khung thấp, focus, Chơi lại offline và xác nhận bỏ cuộc. [QA](qa/FOLK-POLISH-2026-11-19.md).
- FD-ON2 kiểm bật và thu hồi online từng game, mặc định tắt. 21 ca Folk Node/PGlite, SQL và hồi quy trình duyệt. [Kiểm tra](WORKLOG.md).
- Ngày 20/11 anh bỏ test staging và duyệt phát hành launcher offline. [Nhật ký](WORKLOG.md).

## Folk và chat · merge/phát hành 19/11/2026

- FD-L0/L1 có artwork, ván offline lưu/đấu lại và nhặt Chàm. Ô Ăn Quan thêm bốc/rải từng viên, mẹt và lịch sử hai ghế. Folk 12/12, UI 5/5. [Thẻ Folk](plans/FOLK-GAMES-PLAN.md), PR40/main `f154795` đã merge sau CI71, Netlify Published `6afe368bb6e8bc96958e23e5`. [Release](qa/FOLK-CHAT-RELEASE-2026-11-19.md).
- FD-ON1 trên `codex/folk-duel-foundation` có Edge/Auth, CAS/PostgreSQL, queue, resume, rematch, scheduler và chat riêng. NLC server nhận từng thao tác. 21 ca Node và 7 ca browser cục bộ qua. Staging ref `khqipuipeawzlkqmdzdg` có Edge v2/scheduler 200 và RPC denial. Còn hai tài khoản thật, latency/thiết bị và duyệt, giữ cấp thưởng online tắt. [Báo cáo](qa/FOLK-ONLINE-2026-11-19.md).
- Studio `fa7b1db`. PR 38 chat 27/27, preview Snake và native 3/3 cục bộ. PR38 đã vào main qua PR40. Staging hai tester do anh kiểm sau.
- [Tóm tắt trước animation Ô Ăn Quan](archive/COMPLETED-2026-11-18-before-oaq-turn-art.md).

## Snake Legend · 26/11/2026

- PR #48 R01 + sửa cảm ứng, CI #94 qua. [QA](qa/SNAKE-R01-RESUME-2026-11-26.md).
- PR #49 thêm ba đường thử và atlas VFX. Engine và Chromium qua ba đường, CI #96 qua trên `6d9a729`. Chờ duyệt/thiết bị. [QA](qa/SNAKE-MEADOW-2026-11-26.md).

## Snake R01 · kỹ thuật · 14/11/2026

- PR #34 merge `533c0e7`. Lưu theo owner xuyên Story/Journey/Lab, bàn phím/focus và chỉ dấu boss. UI thắng 10/10 màn, 29 sao, boss 6 hit/3 pha, reload và cleanup qua. [QA kỹ thuật](qa/SNAKE-FINISH-2026-11-14.md).
- Điện thoại, người mới, art/audio và backend thật còn chờ. [Nghiệm thu](snake/R01-ACCEPTANCE.md).

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

[Kết quả TC-R0 và danh mục cũ](archive/COMPLETED-2026-11-25-before-xiangqi-battlefield.md).
