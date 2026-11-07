# Game Studio Agent — cài đặt và cách dùng tại ArcadeX

## Nguồn và phạm vi

Đã cài toàn bộ repo [Game_Studio_Agent](https://github.com/ducpham2806/Game_Studio_Agent) tại commit `c5dac4629d4f61972cc16033bbc13b4ac8e16aaa`, ngày 06/11/2026: **116 skill, 21 định nghĩa vai trò, 4 rules, 6 template**, scripts/docs và tài nguyên đi kèm. Thư viện nằm `.agents/game-studio/`; [SOURCE-MANIFEST](SOURCE-MANIFEST.md) ghi đường dẫn/blob 297 file để kiểm lại.

GitHub connector xác nhận commit; bản repo local cùng commit và sạch được dùng qua `skill-installer --method git` với ánh xạ URL tạm trong tiến trình. Không dùng credential mới hoặc sửa Git config toàn máy. Chủ dự án đã cho phép đưa toàn bộ thư viện từ repo private lên ArcadeX public ngày 06/11/2026. Skill được trải phẳng từ `skills/<nhóm>/<tên>/` thành `skills/<tên>/`; file bên trong giữ nguyên byte. Các thư mục còn lại giữ nguyên. Không chạy initializer upstream lên ArcadeX.

## Bộ nhớ giữa các phiên

Đây là **bộ nhớ bằng file trong dự án**, không phải nạp vĩnh viễn 116 skill vào bộ nhớ mô hình hay cài toàn máy. Repo đi theo checkout/nhánh; cần commit/push và checkout nhánh có bộ file này ở máy/session khác.

Một skill đầu mối tại `.agents/skills/arcadex-studio/SKILL.md` dùng để tìm thư viện. Các skill đầy đủ ở ngoài thư mục tự discovery; agent mở đúng file qua [INDEX](INDEX.md). Cách này giữ đủ nội dung trên đĩa nhưng không tự chèn 116 mô tả vào mỗi phiên. Skill đầu mối sẽ có thể được phát hiện ở lượt tiếp theo; phiên hiện tại đã đọc trực tiếp các workflow cần dùng.

21 vai trò được giữ làm playbook trong `agents/`, không tự biến thành subagent executable của Codex. Các adapter `.claude/agents`/`.claude/skills` cũ giữ nguyên; Claude dùng CLAUDE.md trỏ vào cùng thư viện. Không tự chạy 21 agent hoặc tải mọi engine khi bắt đầu việc.

## Ánh xạ vào dự án hiện có

| Upstream gợi ý | ArcadeX dùng |
|---|---|
| project.yaml | [project.md](../../project.md): cấu hình người/agent đọc |
| production/session-state/active.md | [SESSION-HANDOFF](../SESSION-HANDOFF.md): checkpoint duy nhất |
| production/epics, stories | [PROJECT-PLAN](../PROJECT-PLAN.md), `docs/plans/*.md`, [TASK](../templates/TASK.md) khi cần task nhỏ |
| production/qa/evidence | Báo cáo `.md` tại module/`docs/qa/` khi phát sinh, link ảnh/log đúng nguồn |
| Skill path skills/category/name | `.agents/game-studio/skills/name/SKILL.md` |
| Director approval / mặc định engine | Phạm vi người dùng đã giao và AGENTS; giữ engine web riêng, không thêm vòng xin duyệt hoặc migration ngoài phạm vi |

Tất cả đầu vào điều phối đang dùng là `.md`. YAML/JSON/scripts/ảnh đi kèm nguồn vẫn được bảo toàn để skill chuyên môn dùng khi cần; chúng không phải checkpoint hay plan chính. Các quy tắc engine như “luôn nhân delta”, node/HitboxComponent hoặc ObjectPoolManager phải ánh xạ vào fixed-step/Canvas/API hiện có; không áp máy móc làm sai mô phỏng.

## Kiểm tra và cập nhật

Ngày07/11/2026, yêu cầu xác nhận lại của chủ dự án: GitHub compare c5dac462→main trả identical/ahead0/behind0; doc checker297blob/116skill/21role/4rules qua. Không có bản nguồn mới cần cài chồng. Toàn bộ định nghĩa agent/subagent và skill đã có trên đĩa; dùng playbook theo task, không khởi chạy21tiến trình hay nạp mọi nội dung vào mỗi phiên.

`python3 scripts/check-docs.py` kiểm entrypoint/link/budget/nhật ký/số lượng/file nguồn đã cài. `npm run test:claude` kiểm adapter ArcadeX cũ. Validator tổng upstream hiện lỗi thiếu `router/references/routing-table.md` cả tại repo nguồn nguyên gốc và bản cài; đây là lỗi đường dẫn của validator, không phải kiểm chứng đã qua. Validator skill chuẩn đã kiểm 117/117 manifest hợp lệ; không coi đó là kiểm nghiệm tất cả ví dụ/script với ArcadeX. Mọi skill chọn dùng vẫn cần kiểm API/version theo source/lockfile hiện hành.

Khi cập nhật thư viện: lấy commit đích rõ → đọc diff các skill/rules dùng thực tế → chạy installer vào thư mục tạm → so nguồn/collision → thay snapshot và manifest có chủ đích → kiểm docs/skill → ghi WORKLOG/COMPLETED. Không tự pull/cài dependency/chạy script upstream trong mọi phiên. Giữ `.claude/CCGS-NOTICE.md` và các notice/license đi kèm nguồn.
