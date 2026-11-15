# Bàn giao · 15/11/2026 · FD-0 local qua / Netlify HOLD

Anh đã chọn **Ô Ăn Quan trước → Lò Cò**, **Kẹo trước → Xu/XP/rương sau**. Nhánh `codex/folk-fd0-baseline-20261115`, worktree `/workspace/Arcade-x-folk`, base `a55af6e`. [Thẻ Folk](plans/FOLK-GAMES-PLAN.md), [story](../production/stories/FD-0-baseline.md), [QA](qa/FOLK-FD0-2026-11-15.md), [GDD gốc](folk/GDD-V2-SOURCE.md).

FD-0 sửa JSX/TS runner/docs CI và OAQ reducer clone input. Folk chỉ xuất hiện khi dev `--mode folk-preview`; production/default không có hai prototype thiếu package/art. Online disabled/không mount màn phòng memory. Reward chỉ Kẹo, output coins/exp=0, không bridge grant/quest/loot. Shop authored đầy khung và nhãn Canvas qua helper tương phản.

Local: Folk9 unit,2 browser viewport desktop/mobile (local rải/chuyển lượt, bot trả nước, shop mua, NLC court entry/exit; zero pageerror), lint/build/guard package/bundle/fast PASS. Full-release giữ24 game/933 resource/24 art. Dungeon4 quota cases PASS với đúng hunk atomic từ7785d71; không trộn code Snake. Full root CI đúng head trên PR vẫn cần xác nhận trước merge; không dùng CI lịch sử thay thế.

Dùng Studio game-production-scrum/game-qa-playtest, Technical Director và QA độc lập. Graphify mới: shared10/93/190, OAQ5/69/133, NLC5/58/96 (file/node/edge); querycall depth1/budget700, source/unitspy kiểm bridge động. Output ngoài git; bằng chứng ở production/qa/evidence/folk-fd0-20261115 và CI artifact folk-fd0-evidence.

**Tiếp:** xem PR/checks của nhánh FD-0; xử lý lỗi đúng head nếu có, rồi FD-1 Ô Ăn Quan: luật/rải sinh/nợ/hốt tàn, ba bot, tutorial/animation/lifecycle. Chưa hoàn thiện cả game; FD-2 nhịp/pickup Lò Cò, FD-3 owner/atomic save/receipt100/ledger, FD-4 art29skin, FD-ON backend/staging còn chờ.

Giữ `[skip netlify]` trên mọi commit đẩy nhánh và title PR. Chưa merge/deploy/SQL production; site đọc trước task vẫn8320385/6af6f590. Snake PR36/b9f7134 là task khác, chưa merge theo lần đọc trước; không dùng tài liệu Snake cũ suy ra hiện trạng main. [Bàn giao trước nguyên văn](archive/SESSION-HANDOFF-2026-11-15-before-folk-fd0.md). WORKLOG chỉ ba mục.
