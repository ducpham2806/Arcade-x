# Game Studio Agent — cài đặt và cách dùng tại ArcadeX

## Nguồn và phạm vi

Theo yêu cầu chủ dự án ngày **15/11/2026**, cập nhật [Game_Studio_Agent](https://github.com/ducpham2806/Game_Studio_Agent) từ `c5dac4629d4f61972cc16033bbc13b4ac8e16aaa` lên HEAD đã kiểm `fa7b1dbb342983bc1fe76f4faa276fef099f57d3`: **125 skill, 21 vai trò, 4 rules, 7 template; 340 blob nguồn**. [SOURCE-MANIFEST](SOURCE-MANIFEST.md) ghi từng đường dẫn/blob để tái kiểm.

Nguồn clone Git sạch; đối chiếu snapshot cũ 297/297 blob trước khi thay. Cài vào thư mục tạm, so collision và byte/hash rồi thay `.agents/game-studio/`. Skill trải phẳng từ `skills/<nhóm>/<tên>/` thành `skills/<tên>/`; không collision, file bên trong giữ nguyên byte. Các thư mục nguồn khác giữ nguyên. Loại đúng **297 blob `graphify-out/` sinh/cache/build-state upstream**, không nhập graph máy khác vào dự án. Không chạy initializer, không sửa Git config toàn máy hoặc thêm credential.

Chủ dự án đã cho phép mang thư viện từ repo private sang ArcadeX public ngày 06/11/2026. Notice/attribution hiện có và `.claude/CCGS-NOTICE.md` giữ nguyên. Snapshot mới có game-docs, image-prompt-engineer, pixelfx, ux-researcher, unity-build-size và bốn skill audit/evidence mới; tra [INDEX](INDEX.md) theo việc, không nạp cả thư viện.

## Bộ nhớ và ánh xạ vào dự án

Đây là bộ nhớ bằng file theo checkout, không cài toàn máy hoặc nạp vĩnh viễn 125 skill. Adapter `.agents/skills/arcadex-studio/SKILL.md` và `.claude/agents`/`.claude/skills` giữ nguyên. 21 vai trò là playbook, không tự khởi chạy 21 tiến trình.

| Upstream gợi ý | ArcadeX dùng |
|---|---|
| project.yaml | [project.md](../../project.md), cấu hình người/agent đọc |
| production/session-state/active.md | [SESSION-HANDOFF](../SESSION-HANDOFF.md), checkpoint duy nhất |
| epics/stories/game-docs | [PROJECT-PLAN](../PROJECT-PLAN.md), thẻ `docs/plans/`, [TASK](../templates/TASK.md) và story đúng phạm vi |
| production/qa/evidence | Báo cáo Markdown tại module/docs/qa và ảnh/log có nguồn; stamp bằng chứng dùng Markdown theo quy tắc local |
| skills/category/name | `.agents/game-studio/skills/name/SKILL.md` |
| Director approval / engine mặc định | Quyền người dùng đã giao + AGENTS; giữ React/Canvas, không thêm vòng xin duyệt hoặc đổi engine |

Mọi đầu vào điều phối đang dùng là `.md`. YAML/JSON/scripts/ảnh của nguồn vẫn bảo toàn để skill chuyên môn dùng; không biến template upstream thành checkpoint mới. Quy tắc scene, physics, ObjectPool, signal và focus phải ánh xạ sang engine web hiện có. Các chỉ dẫn mới về manifest/provenance, kiểm alpha/palette, focus/safe area và bằng chứng runtime áp dụng cho art/UI; vẫn cần chạy và quan sát game thật.

## Kiểm chứng ngày 15/11/2026

- Root `python3 scripts/check-docs.py`: pin 340 đường dẫn và Git blob hash, kiểm chính xác bộ file/125 skill/21 role/4 rules/7 template, budgets/links/nhật ký. Không nới các budget.
- Validator upstream ở checkout nguồn sạch: **125 skill và wiring PASS**, có **9 warning** về mô tả/heading Gotchas; không gọi `--strict` là PASS.
- Validator byte-nguyên ở bản trải phẳng: **3 lỗi tương thích đường dẫn**: docs/COMPATIBILITY và docs/INSTALLATION còn link nhóm router; validator tìm router tại root. Không sửa file nguồn để che lỗi. Kiểm per-skill qua cùng hàm validator: 125/125 hợp lệ; wiring ArcadeX do checker local và INDEX phụ trách.
- `run-trigger-evals.py --check` offline: **FAIL 90 thiếu sót** ở cả checkout nguồn và bản cài (45 skill chưa đủ prompt should/near-miss). Không phải kết quả LLM chọn skill; không chạy judge/API hoặc tự mở issue upstream.
- `npm run test:claude`: PASS adapter ArcadeX cũ (19 agent/11 skill adapter). `git diff --check` riêng snapshot báo 15 dòng trailing whitespace có sẵn trong nguồn ui-designer; giữ nguyên để hash khớp, không ghi toàn bộ whitespace check là PASS. Validator nguồn không thay việc kiểm API/version hiện hành hay art/gameplay runtime.

Lần cập nhật sau: pin commit → đọc diff skill/rules dùng thực tế → cài tạm/so collision → thay snapshot/manifest có chủ đích → kiểm docs/skill → ghi WORKLOG/COMPLETED. Không tự pull hoặc chạy script nguồn mỗi phiên.
