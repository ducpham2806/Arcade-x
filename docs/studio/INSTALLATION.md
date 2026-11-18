# Game Studio Agent — cài đặt và cách dùng tại ArcadeX

## Nguồn và phạm vi

Ngày 18/11/2026 cập nhật theo `main` của [Game_Studio_Agent](https://github.com/ducpham2806/Game_Studio_Agent) tại `fa7b1dbb342983bc1fe76f4faa276fef099f57d3`. Snapshot có **125 skill, 21 vai trò, 4 rules, 7 mẫu Markdown** và tài nguyên nguồn. [Manifest](SOURCE-MANIFEST.md) xác minh 340 blob Git. [Nguồn thành phần và giấy phép](../../.agents/game-studio/docs/UPSTREAM-SYNC.md) ghi AGAS 2.0.0, CCGS 1.3.0, Agency Agents và PixelFX. [Bản giấy phép](UPSTREAM-LICENSES.md).

File lấy từ cây Git đã định danh, giữ byte/mode và cách trải phẳng thư mục skill của ArcadeX. `graphify-out/` của repo nguồn là cache sinh sẵn, dùng [Graphify](GRAPHIFY.md) để dựng graph mới theo module. Giữ adapter và checkpoint ArcadeX. Initializer upstream chỉ được lưu làm tài liệu/tham chiếu.

## Bộ nhớ giữa các phiên

Đây là **bộ nhớ bằng file trong dự án**, không phải nạp vĩnh viễn 125 skill vào bộ nhớ mô hình hay cài toàn máy. Repo đi theo checkout/nhánh; cần commit/push và checkout nhánh có bộ file này ở máy/session khác.

Một skill đầu mối tại `.agents/skills/arcadex-studio/SKILL.md` dùng để tìm thư viện. Các skill đầy đủ ở ngoài thư mục tự discovery; agent mở đúng file qua [INDEX](INDEX.md). Cách này giữ đủ nội dung trên đĩa nhưng không tự chèn 125 mô tả vào mỗi phiên. Skill đầu mối sẽ có thể được phát hiện ở lượt tiếp theo; phiên hiện tại đã đọc trực tiếp các workflow cần dùng.

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

`python3 scripts/check-docs.py` kiểm đường dẫn, budget, inventory và hash. `npm run test:claude` kiểm adapter cũ. Lần 18/11 đối chiếu 340 blob từ checkout upstream đã ghim, gồm `router/references/routing-table.md`. Kết quả này xác nhận bộ nguồn được nhập đúng. Các ví dụ engine và script chỉ chạy theo phạm vi task.

Khi cập nhật thư viện: lấy commit đích rõ → đọc diff các skill/rules dùng thực tế → lấy snapshot trong thư mục tạm → so nguồn/collision → thay snapshot và manifest có chủ đích → kiểm docs/skill → ghi WORKLOG/COMPLETED. Không tự pull/cài dependency/chạy script upstream trong mọi phiên. Giữ `.claude/CCGS-NOTICE.md` và các notice/license đi kèm nguồn.
