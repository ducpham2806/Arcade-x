# Bàn giao · 14/11/2026 · Snake R01 kỹ thuật

User yêu cầu làm tiếp Snake cho xong. Nhánh `codex/snake-r01-finish` từ `2ca0b3c`/PR33, gồm bản badge đã qua CI55. [QA](qa/SNAKE-FINISH-2026-11-14.md), [thẻ Snake](plans/SNAKE.md), [phiếu nghiệm thu](snake/R01-ACCEPTANCE.md). Bản sửa chưa merge/deploy; Netlify API vừa xác nhận production vẫn `8320385`, deploy `6af6f590d7b4bd3516a37885` ready.

## Đã sửa và kiểm

S1 account save: Story/Journey/Lab dùng cùng store theo owner; giữ ưu tiên completion.storage và dữ liệu/format/key guest. Lab đổi tay giữ sound/volume. Red bắt tài khoản trống vào Story lại mở màn2 của guest; green kiểm thắng/lưu/reload, A/B/guest, checkpoint/settings. Native Space/Enter cho nút; focus/Tab/Escape theo dialog, canvas nhận phím chơi. Marker/minimap boss đúng tơ/táo/cộtA-B/điểm yếu/cổng. Không đổi simulation/digest/reward.

V2 thắng UI10/10 bằng native pointer/thời gian thật:29sao,3tim mỗi màn; boss83,6giây/6hit/3pha, tutorial2-3 qua UI; tổng593,89giây thực. Reload giữ10màn, exit đưa RAF/RO/listener/audio về0, không pageerror. V1 thua boss giữ FAIL; đã sửa cadence/tuyến lái driver, không giảm độ khó. V2 bắt đầu mới, không resume/seed progress.

Player cuối3/3 và hosting5/5 qua; Lab prefs red→green. Sáu suite/lint/production-preview-rollback/bundle/catalog/storage qua. Public game133.731byte; initialJS301.337byte gzip. Full UI save/controls12ca và toàn repo xem CI đúng head của PR ứng viên sau push.

## Bước tiếp

Đọc CI của PR từ nhánh này, sửa failure nếu có; chỉ merge main khi user yêu cầu. Sau merge xác nhận Netlify Published/SHA rồi smoke public account/checkpoint/badge. PR32/33 đã được kế thừa; ưu tiên review ứng viên mới.

Android/iPhone/Safari, người mới M2/art/animation/audio, FPS/heap thật còn WAITING. Đã hỏi user khả năng bố trí qua async, chưa coi im lặng là nghiệm thu. Live preflight exit2 WAITING_BINDINGS thiếu email/password/actorID/grant-confirmed; chưa login/ghi DB. Secret qua runtime/runbook, không chat; fixture expiry không thay JWT thật.

Dùng game-qa-playtest/game-feel/game-ui-ux, QA/Technical Director review độc lập. Graphify local46file/424node/1101edge; query showStory contextcall/depth1/budget700→3node/2edge. [Studio](studio/GRAPHIFY.md). Evidence local ignored ở production/qa/evidence/snake-r01-20261114; đầy đủ ở /workspace/tooling/snake-finish-evidence; CI artifact snake-player-evidence.

Preview Netlify bị edge-access, không đổi bảo vệ hoặc lặp guest test khi chưa có access. SQL production/reward/commerce theo AGENTS. [Trước task](archive/SESSION-HANDOFF-2026-11-14-before-snake-finish.md). Một WORKLOG≤3mục, archive nguyên văn.
