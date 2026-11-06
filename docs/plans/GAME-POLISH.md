# QA và hoàn thiện các game đã có nguồn

Mốc 06/11/2026. Các báo cáo game cũ chứa giới hạn tại thời điểm review; không coi tất cả nhận xét cũ là lỗi hiện tại. **GP-R0 READY:** đối chiếu code/test mới, tái hiện từng khoảng trống rồi mới mở task sửa. Không có bằng chứng lỗi thì không viết lại game. Full CI/game-launch đã từng qua không thay playtest chiến dịch/điện thoại thật.

| Game / nhóm | Đã có trong nguồn | Việc tiếp cần xác minh / chưa hoàn tất | Đầu vào Markdown khi chọn game |
|---|---|---|---|
| Battleship | Online/bot, phối cảnh, radar; sửa căn tàu/lửa/chìm và motion đã merge | Touch/focus/modal; FPS/CPU trên điện thoại yếu; kiểm online trên môi trường đích nếu rollout | `docs/battleship/P2-P3-CHECKPOINT.md`, chọn đúng runbook; `docs/DESKTOP-MOTION-FIX.md` khi sửa motion |
| Dungeon Titan | Art v5, đội lính/UX/equipment v6.x và polish motion/chữ đã merge | Playtest loop/equipment trên điện thoại; FPS/GPU/save/bridge/BXH đúng build; không coi “chưa merge” trong INTEGRATION cũ là hiện trạng | `docs/dungeon-titan/INTEGRATION.md` và đúng UX-v6.x |
| Block Breaker | Campaign sci-fi 96 màn, boss crop/frame đã sửa | Xác minh nguồn ảnh đầy đủ; playtest boss/hitbox/framing, difficulty và FPS mobile | `docs/BLOCK-BREAKER-BOSS-CROP-FIX.md`, `docs/BLOCK-BREAKER-HYBRID-V5.md` |
| Blossom Blast | Tutorial/layout/result/save và các đợt sprite đã tích hợp | Tái hiện ghi chú boss/pacing cũ trên code mới; duyệt biểu cảm/huy hiệu/board art phụ; test cũ riêng MT1 | `docs/BLOSSOM-BLAST-REVIEW.md`, `docs/BLOSSOM-MERGE-AUDIT.md` |
| Boom Buddies | Layout/combat art/Pip animation v4 | Người chơi thật kiểm độ khó/pacing, pose/cosmetic trong combat; touch/FPS/tài nguyên | `docs/BOOM-PIP-V4.md`, `docs/BOOM-LEVEL-DESIGN.md` |
| Cosmic Defend | Encounter/campaign v4/v5, giữ replay cũ | Playtest độ khó người thật/escort/boss, FPS; không xóa legacy engine mà replay đang dùng | `docs/COSMIC-LEVELS-V4.md`, `docs/COSMIC-COMBAT-REVIEW.md` |
| Eat Em All | Story/art/economy/victory/rhythm đã có | Cảm giác one-tap, tốc độ rơi/boss/catch trên touch; cân bằng bằng người chơi, không suy win rate từ oracle | `docs/EAT-RHYTHM-V6.md`, `docs/EAT-ECONOMY-V4.md` |
| Neon Run | NR1–NR4/checkpoint/star-3 đã merge | Chơi tay 40 màn, difficulty/thiết bị; mục tiêu trước cổng, màn nghỉ, quái/boss mới là mở rộng cần chọn, không lỗi mặc định | `docs/NEON-RUN-REVIEW.md` |
| Rainbow Blocks | Local modes/replay/input/UI/save | iOS/Safari/gamepad thật; replay verifier + BXH phân mode/cloud stats/themes/nhiệm vụ/tùy biến nút là Phase 2 BACKLOG | `docs/RAINBOW-BLOCKS.md` |
| Chronicles standalone | Prototype 96 màn/art/local-save | Browser/device QA; chưa nối account/cloud/reward/ranked, chưa coi là game launcher mới. Xác minh quan hệ với Block Breaker trước tích hợp tránh nhân đôi | `standalone/chronicles-realms/README.md` |

## GP-R1 · READY khi có lỗi tái hiện · đóng từng lỗi

Ghi build/thiết bị/kịch bản, mong đợi/thực tế và file đích `src/games/<module>/`, nguồn asset/art và test đúng game. Mỗi task: sửa một hành vi → logic/integration phù hợp → quan sát bản chạy PC/touch → ảnh/video kèm báo cáo `.md` → bundle/save regression liên quan. Đo cùng kịch bản trước/sau nếu claim hiệu năng. Xuất standalone qua script nguồn, không sửa tay output.

## GP-R2 · BACKLOG · tính năng mở rộng

Rainbow online/BXH, Chronicles account/integration, Neon nội dung mới và các art tùy chọn chỉ làm khi được chọn; tách roadmap khỏi bugfix. Các game còn lại chưa có task dở cụ thể được xác nhận trong lượt docs: duy trì smoke/save, không suy ra đã nghiệm thu toàn bộ nội dung. Bắt đầu GP-R0 bằng một game do người dùng chọn, không đọc cả bảng tài liệu.
