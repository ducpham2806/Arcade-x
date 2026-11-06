# Kiểm chứng DOC-01 · 06/11/2026

Nguồn gameplay nền: `c705100`; nhánh tài liệu `codex/docs-game-studio-handoff`. Studio nguồn `c5dac4629d4f61972cc16033bbc13b4ac8e16aaa`, kiểm qua GitHub tree và checkout local sạch. Các kết quả dưới chỉ cho đợt tài liệu/cài thư viện.

| Kiểm tra | Kết quả |
|---|---|
| `python3 scripts/check-docs.py` | Qua: 24 đầu vào Markdown/link/budget, 3 mục WORKLOG, 116 skill/21 vai trò/4 rules/6 template, đủ 297 blob |
| Skill Creator `quick_validate.py` | 117/117 qua: 116 skill nguồn và arcadex-studio; PyYAML cài tạm ngoài dự án để chạy checker |
| `npm run test:claude` | Qua: adapter ArcadeX cũ 19 agent/11 skill |
| `git diff --check` | Qua |
| Snapshot nguyên văn trước thu gọn | Plan/bàn giao/WORKLOG đối chiếu với HEAD nền, nội dung nguyên vẹn |
| Validator tổng upstream | Không qua: FileNotFoundError với router/references/routing-table.md; tái hiện cả source gốc, không thay nguồn để giấu lỗi |
| Gameplay/runtime | Không có diff src/public/server/supabase/package; không chạy lại toàn bộ gameplay/browser CI trong đợt này |

AGENTS và checkpoint chỉ nạp một thẻ task; toàn thư viện nằm ngoài thư mục tự discovery, chỉ arcadex-studio được đưa vào `.agents/skills/`. Vì vậy không cần nạp 116 mô tả/body vào mỗi phiên. Budget là ký tự Unicode, không tuyên bố số token hoặc mức giảm token chính xác.

Chủ dự án đã cho phép đưa toàn bộ thư viện từ repo private lên ArcadeX public ngày 06/11/2026. Commit/push nhánh riêng; không merge main hay đổi deployment trong DOC-01. Bằng chứng gameplay và deployment cũ vẫn giữ giới hạn thời điểm của chúng.
