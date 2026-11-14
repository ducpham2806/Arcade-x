# Bảo trì nền tảng và tài liệu

Mốc 06/11/2026; chỉ mở mục phù hợp nhiệm vụ. Luật đầu vào/thu gọn ở [WORKFLOW](../WORKFLOW.md), trạng thái chính ở SESSION-HANDOFF.

| ID | Trạng thái | Việc / file đích | Điều kiện xong |
|---|---|---|---|
| CH0–CH4 / CHAT | CODE/QA local; WAITING chủ dự án kiểm | [Kế hoạch đã duyệt](../chat/BUBBLE-CHAT-PLAN.md), [QA15/11](../chat/IMPLEMENTATION-QA-2026-11-15.md); nhánh codex/chat-bubble-wireframe | Sảnh/ingame đã code; không merge trước nghiệm thu. Native Tank/Nối Từ còn staging/backend; thiết bị thật và CI release riêng |
| MT1 / QA1 | READY | Tái hiện tests auth/launcher/Blossom cũ; bỏ chờ auth-entry-screen đã mất bằng assertion theo luồng thật, xử lý import.meta.env ngoài Vite và fixture HTML ngoài repo | Test kiểm đúng hành vi hiện tại, không chỉ xóa assertion; thêm vào CI sau ổn định; không sửa test xanh vô cớ |
| MT2 / ART1–2 | READY xác minh; WAITING nguồn/duyệt art | Pipeline icon/banner vệt đen; ảnh Block đầy đủ, art phụ Blossom, tàu Battleship tùy chọn; nguồn ở art/, exporter/manifest/cache | Trước/sau quan sát được, hash/budget qua, license/nguồn giữ; không vẽ/sửa tay output sinh |
| MT3 / TD1 | BACKLOG | Gộp CAS/receipt/presence/store/Edge của Battleship/Duel/Nối Từ; file trong module, schema và Edge tương ứng | Thiết kế hợp đồng trước, chuyển từng game; 3 bộ logic/schema/UI qua; giữ protocol/save. Tank WS không thuộc mẫu này |
| MT4 / TD3 | READY đo; WAITING quyết định rewrite/LFS | Đo Git/assets thực, đề xuất shallow/cache/LFS; số đo cũ không dùng làm hiện trạng | Báo cáo `.md` số đo/phương án/ảnh hưởng; không rewrite history hoặc áp LFS khi chưa duyệt |
| DOC-01 / TD2 | DONE tài liệu và thư viện; kiểm chứng cuối theo WORKLOG | Markdown entrypoints, task cards, một nhật ký, archive/tóm tắt trước đổi việc; Studio library theo nhu cầu | Link/budget/check nguồn và structure qua; commit cùng thay đổi; runtime giữ nguyên |

**Kiểm theo phạm vi:** test cũ đúng suite; art → artwork/bundle + browser; phòng chung → 3 bộ server/schema/UI; docs → `python3 scripts/check-docs.py` và `npm run test:claude`. Không chạy lại full game CI cho sửa prose thuần; không coi doc check là nghiệm thu gameplay.

**Tài liệu đầu vào:** [TESTING](../TESTING.md) cho test, [GAME-ARTWORK](../GAME-ARTWORK.md) và pipeline cho art, [TECH-DEBT](../TECH-DEBT.md) cho phòng chung. Mỗi phần hoàn tất phải thu gọn/checkpoint trước task kế tiếp; không nạp log nguồn Studio vào mỗi phiên.
