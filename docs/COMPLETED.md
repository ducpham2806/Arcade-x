# Tóm tắt công việc đã hoàn tất

[Bản trước sửa badge](archive/COMPLETED-2026-11-13-before-hosting-badge.md). Đây là bộ nhớ kết quả theo module, không phải nhật ký thứ hai. Chỉ đọc mục liên quan; nguồn đang làm ở SESSION-HANDOFF. “Đã merge” là trạng thái mã nguồn, không đảm bảo production/thiết bị.

## Folk FD-4A · asset/UI candidate · 15/11/2026

- codex/folk-oaq-art-ui-20261115 từa4d1a9c/PR37; theo user ưu tiên asset/UI trước. Studio mới fa7b1db:340 blob đúng nguồn/125 skill; không nhập cache graph. Giới hạn upstream validator giữ rõ.
- Bốn master,12 skin OAQ, art trong bàn/shop/HUD; home/lượt/điểm/số quân/mobile/focus/pause và copy thoát chính xác. Source/provenance/ảnh/stamp đủ; không bật online/tiền chung/catalog production.
- 9 browser/9 unit+artguard/lint/build/package/budget/fast/catalog PASS; QA độc lập + Graphify scoped. [QA](qa/FOLK-OAQ-ART-2026-11-15.md).
- Full CI của nhánh mới còn chờ, chưa merge/deploy; Netlify HOLD. Not yet played by a person; palette32/launcherart, FD-1 đầy đủ, Lò Cò/owner/receipt/backend còn gate riêng.
- Bản trước task giữ [nguyên văn](archive/COMPLETED-2026-11-15-before-folk-art.md).

## Folk FD-0 · baseline local · 15/11/2026

- Nhánh codex/folk-fd0-baseline-20261115 từ a55af6e: sửa build/runner/docs, OAQ reducer bất biến; hai prototype chỉ ở folk-preview.
- Online khóa; reward chỉ Kẹo, không gọi Xu/XP/quest/loot; shop và Canvas đọc rõ. Giữ quyết định Ô Ăn Quan trước/Lò Cò sau.
- 9 unit, 2 browser desktop/mobile, lint/build/budget/package/fast và Dungeon4 ca qua; full-release24 game giữ nguyên. [QA](qa/FOLK-FD0-2026-11-15.md).
- GDD giữ nguyên văn, QA độc lập và Graphify scoped đã dùng. Full CI63/head a4d1a9c success; PR37 chưa merge/deploy. Netlify HOLD/[skip netlify].
- FD-1/2 hoàn thiện gameplay; FD-3 owner/save/receipt; FD-4 art và online còn riêng. [Bản trước FD-0 nguyên văn](archive/COMPLETED-2026-11-15-before-folk-fd0.md).

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

## WC-L0 · DONE · 07/11/2026

PR18/main3f943d9 đưa bot/offline ra sảnh, CI24 và public byte-match đã qua; online=false. [Chi tiết nguyên văn trước FD-0](archive/COMPLETED-2026-11-15-before-folk-fd0.md).

## Nối Từ / Tank · các mốc online trước

WC-ON1–ON4/PR19–20 đã public phòng/PK/queue và34512 từ, staging hai account/timeout/rematch qua; user duyệt riêng schema/Edge/JWT/cron. Chưa XP/Xu/receipt; ON5/ON6 cònQA. Tank giữ Render Free c705100/cap16, Auth cơ bản và logout retest qua; chưa load/device QA, Blueprint cũ paused. [Chi tiết nguyên văn trước FD-4A](archive/COMPLETED-2026-11-15-before-folk-art.md), [thẻ Tank](plans/TANK-CLASH.md).

## Các mốc trước · đã tích hợp

DOC-01/PR17 cài Studio và workflow; audit24 nhánh đã đóng. Tank P3b/c/d, adapter và motion/polish Battleship/Dungeon vào PR16. Không suy ra thiết bị/backend/reward đã nghiệm thu. [Chi tiết nguyên văn](archive/COMPLETED-2026-11-15-before-folk-fd0.md), [thẻ Tank](plans/TANK-CLASH.md).

## Snake / nền tảng / các game khác

- Snake R01 đã public client; cloud preview/thiết bị/human QA còn riêng. [Live-save](SNAKE_LIVE_SAVE_QA.md), [thẻ tiếp tục](plans/SNAKE.md).
- Launcher M0–M8, Neon NR1–NR4, các đợt Boom/Cosmic/Eat/Block/Blossom/Rainbow đã có trong nguồn; không mặc định coi ghi chú “chưa merge” ở báo cáo cũ là hiện trạng.
- Nối Từ đã public phần phòng/PK/queue, còn ON5/ON6; Duel/commerce chưa hoàn tất triển khai, xem đúng thẻ; payment vẫn tắt.
