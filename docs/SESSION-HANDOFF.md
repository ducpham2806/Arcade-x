# Bàn giao · 14/11/2026 · MERGED / NETLIFY HOLD

**User yêu cầu merge main, khoan push Netlify.** PR34 đã merge `533c0e721c5a1cc46f47c8c794c59e6e73cb3335` từ head9a4f44b sau CI57 success cả verify/snake_ui. Tree merge trùng tree đã kiểm. Local main đã fast-forward; checkpoint docs ở nhánh `codex/snake-merge-hold-20261114`. [QA merge/HOLD](qa/SNAKE-MAIN-HOLD-2026-11-14.md), [thẻ Snake](plans/SNAKE.md).

## Giữ Netlify

Merge commit có `[skip netlify]`. Netlify API trước/sau xác nhận production vẫn deploy6af6f590d7b4bd3516a37885/source8320385 ready; không có deploy cho mergeSHA. Chưa phát hành các sửa lỗi Snake mới, không smoke bản cũ rồi gọi là nghiệm thu bản mới. CI58/GitHub push-check đang chạy tại checkpoint, không phải deploy.

Tới khi user yêu cầu phát hành rõ: mọi commit đẩy nhánh và title PR giữ `[skip netlify]`; không trigger buildhook/deploy/publish. Đây là skip theo commit/PR, auto-deploy toàn site chưa tắt. Docs checkpoint cũng phải có cả marker commit và title PR. Đọc project.md/AGENTS trước các lần push tiếp theo.

## Snake đã có trong main

Sửa S1 store theo owner xuyên Story/Journey/Lab, giữ guest/format/audio prefs; native keyboard/focus/Escape; marker/minimap boss đúng tơ/táo/cột/điểm yếu/cổng. Không đổi physics/digest/rewards. V2 UI10/10win/29sao/3tim mỗi màn, boss6hit/3pha, reload/cleanup0/pageerror0; V1 botFAIL giữ bằng chứng. [QA kỹ thuật](qa/SNAKE-FINISH-2026-11-14.md).

CI57 qua UI12ca, player3, hosting5, catalog/offline và verify toàn repo; artifact snake-player-evidence/motion-regression-evidence đã có. CI56 Dungeon syntheticerror/autosave race được sửa bằng quota thật/recovery, local12lượt qua. PR32/33 đã đóng vì được kế thừa trong PR34.

## Còn lại

Không tự triển khai trong lúc HOLD. Khi user cho phát hành: đọc lại CI/main mới nhất, deploy có chủ đích, xác nhận Published/SHA và kiểm public account/checkpoint/badge/offline. M2/người mới/art/audio và Android/iPhone/Safari/FPS/heap thật vẫn WAITING. [Phiếu nghiệm thu](snake/R01-ACCEPTANCE.md). Live preflight thiếu4binding, chưa login/ghiDB/JWT expiry thật; secret theo runbook, không chat.

Dùng game-release-liveops cho merge/HOLD. Studio/Graphify đã cài; graphSnake46file424node1101edge chỉ còn làm bằng chứng nguồn trước merge, refresh khi đổi source. Lượt này chỉ docs, không dựng lại graph/gameplay. [Trước merge](archive/SESSION-HANDOFF-2026-11-14-before-main-hold.md). Một WORKLOG≤3mục, archive nguyên văn.
