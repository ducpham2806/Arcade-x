# Bàn giao · 15/11/2026 · OAQ asset/UI candidate / Netlify HOLD

Anh yêu cầu asset/UI chuẩn chỉnh và update Studio. Ô Ăn Quan trước→Lò Cò, Kẹo trước→Xu/XP/rương sau giữ nguyên. Nhánh `codex/folk-oaq-art-ui-20261115` từ a4d1a9c/PR37, tại /workspace/Arcade-x-folk. [Thẻ Folk](plans/FOLK-GAMES-PLAN.md), [story](../production/stories/FD-4A-oaq-art-ui.md), [QA](qa/FOLK-OAQ-ART-2026-11-15.md).

FD-0 fullCI63/run43671853007/head a4d1a9c success cả verify/snake_ui; PR37 draft chưa merge. Nhánh art kế thừa FD-0, PR nên base nhánh37 để review riêng. FullCI đúng head của art vẫn cần xác nhận trước merge. Không trộn Snake PR36/b9f7134.

Studio mới fa7b1db:340/340 blob,125 skill/21 role/4 rule/7 template; bỏ297 cache graph upstream. Docs/skill checks qua, validator source9warning/flat3router lỗi và trigger90missing là giới hạn nguồn ghi INSTALLATION. Không sửa byte upstream để làm xanh whitespace; diff check phần dự án riêng.

Bốn master ImageGen + lossless WebP/provenance;5 cặp quân,4 mặt bàn,3 tay/mẹt có mapping riêng dùng trong match/HUD/shop. Runtime5.633.804B, decoded25.161.648B. UI home, scoreP1/P2 cố định, nhãn DOM≥10px, native select, nút56px, focus/Escape, pause/bot/overlay;320px và ngang không chồng. Launcher dừng generic save/suspend Folk chưa hỗ trợ resume, copy thoát nói rõ kết thúc ván; không đổi format profile/owner/receipt. Envelope paused preview cũ chưa dọn.

Local:9 browser ở1440×900/390×844/320×568/844×390,9 unit+assetguard12skin, lint/build/package/budget/fast/Snakecatalog PASS. Đã xem ảnh home/board/shop/contact sheet; stamp và binaries ignore ở production/qa/evidence/folk-oaq-art-20261115. Studio create-game-assets/game-ui-ux/game-qa-playtest, Art/UI Lead, Technical Director/QA độc lập; Graphify OAQ7/82/170, shared11/97/198, queryrender900/depth1 và source/browser kiểm wrapper.

**Tiếp:** kiểm PR/checks nhánh art; sửa lỗi đúnghead nếu có. Còn human/device thật, palette32 và icon/banner chuẩn; FD-1 luật/ba bot/tutorial chơi được/animation rải; Lò Cò29skin/backend; owner/save/receipt100/ledger FD-3. Not yet played by a person. Không gọi cả game hoàn thiện hoặc production.

Giữ `[skip netlify]` trên commit/PR, không merge/deploy/SQL production; site đọc trước vẫn8320385/6af6f590. [Bàn giao trước nguyên văn](archive/SESSION-HANDOFF-2026-11-15-before-folk-art.md). WORKLOG duy nhất≤3 mục.
