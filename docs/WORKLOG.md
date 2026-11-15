# Nhật ký công việc

Một nhật ký chính, tối đa ba mục. [Nguyên văn trước FD-0](archive/WORKLOG-2026-11-15-before-folk-fd0.md). Xem WORKFLOW và COMPLETED.

## 15/11/2026 · FD-4A · codex/folk-oaq-art-ui-20261115

- User ưu tiên asset/UI Ô Ăn Quan và update Studio. Từ a4d1a9c/PR37 (CI63 success), cập nhật fa7b1db:340 blob/125 skill/21 role/4 rule/7 template, nguồn đúng hash; cache graph upstream không nhập. Giới hạn validator/trigger nguồn giữ trong INSTALLATION.
- Bốn master ImageGen, WebP lossless/source/provenance,12 skin OAQ dùng trong bàn/shop/HUD;5,63MB runtime/25,16MB decoded trong budget. Home, labels P1/P2/số quân, native select/focus, modal và pause mới. Chữa320px overlap và nhãn shop mobile. Launcher không quảng bá lưu ván Folk chưa hỗ trợ resume; legacy envelope và owner/receipt vẫn FD-3.
- 9 browser/9 unit+artguard, lint/build/package/budget/fast/Snakecatalog qua; Look Rule ảnh/stamp và QA độc lập. [QA](qa/FOLK-OAQ-ART-2026-11-15.md), Graphify OAQ7/82/170 + shared11/97/198. FullCI nhánh mới còn chờ; chưa merge/deploy, giữ [skip netlify]. Not yet played by a person; palette32, launcherart, FD-1 và Lò Cò còn riêng. [Nguyên văn trước task](archive/WORKLOG-2026-11-15-before-folk-art.md).

## 15/11/2026 · FD-0 · codex/folk-fd0-baseline-20261115

- Theo quyết định Ô Ăn Quan trước/Lò Cò sau, Kẹo trước/tiền chung sau: từ a55af6e sửa JSX, runner TypeScript, reducer OAQ bất biến; khóa hai prototype trong folk-preview. Online disabled; không gọi grant Xu/XP/quest/loot. Shop và nhãn Canvas đọc rõ, modal vừa khung game.
- Folk 9 unit và 2 browser desktop/mobile qua; local 2p, bot trả nước, mua Kẹo, mở sân NLC/exit, zero pageerror. Lint/build/guard package/budget/fast qua; full-release giữ 24 game. Dungeon atomic quota từ 7785d71 được kiểm 4 ca, không mang code Snake. [QA](qa/FOLK-FD0-2026-11-15.md).
- game-production-scrum/game-qa-playtest, Technical Director/QA độc lập; Graphify mới theo ba module. GDD và ba đầu vào cũ giữ nguyên văn trong archive. Full CI63/head a4d1a9c success cả verify/snake_ui; PR37 chưa merge/deploy, giữ [skip netlify]. Tiếp FD-1; pause, owner/save/receipt, backend và art/content đầy đủ còn theo từng gate.

## 14/11/2026 · SN-R01-FINISH · codex/snake-r01-finish

- User yêu cầu làm tiếp Snake cho xong. Từ2ca0b3c/PR33(CI55xanh), sửa S1 Story ghi guest dù Journey theo owner; truyền store Story/Lab, giữ audio settings. Red/green account win/checkpoint/reload/B/guest và Space/focus/Escape; marker boss đúng nhiệm vụ, physics/digest giữ nguyên.
- V2 UI10màn/29sao/3tim mỗi màn qua native input/time, boss6hit/tutorial2-3, reload/cleanup0/pageerror0. V1 driver thua boss giữ evidence; sửa cadence/routebot, không hạ độkhó. Lint/build/rollback/preview/budget/6suite/catalog/storage, player3/3 và hosting5/5 qua; CI56 Snake xanh, verify lỗi testDungeon syntheticerror/autosave; sửa quota thật/recovery, giữ timeout và thêm artifactmotion. CI đúnghead trướcmerge. [QA](qa/SNAKE-FINISH-2026-11-14.md).
- game-qa-playtest/game-feel/game-ui-ux, Technical Director/QA độc lập không còn blocker. Graph46file/424node/1101edge, contextcall700. [Phiếu nghiệmthu](snake/R01-ACCEPTANCE.md); livepreflightWAITING4bindings. Thiết bị/người mới/art/audio thật chưa PASS; bản sửa chưa merge/deploy.
