# Game Studio và Graphify · quy ước tiếp tục ArcadeX

Chủ dự án yêu cầu dùng hai nguồn ngày **13/11/2026**. Lưu quyết định trong AGENTS/project/skill đầu mối để phiên sau thực hiện theo checkout. [Game Studio](INDEX.md) cung cấp skill và playbook vai trò; Graphify cung cấp bản đồ quan hệ code. Đây không phải bộ nhớ vĩnh viễn của mô hình.

## Nguồn đã kiểm

- [Game_Studio_Agent](https://github.com/ducpham2806/Game_Studio_Agent), head `357b1a1de330dd85fc32e310a1fc7f3ae68009b3`: 297/297 tệp trong manifest ArcadeX vẫn khớp byte. Giữ snapshot `c5dac462` và 116 skill/21 vai trò đã cài; không cần thay toàn bộ thư viện. [Quy trình cập nhật](INSTALLATION.md).
- [Graphify-Labs/graphify](https://github.com/Graphify-Labs/graphify), nhánh `v8`, commit `52cb28218eea0c68d80a9f4b2ae102d2fa63e267`, package `graphifyy` 0.9.108. Đã đọc README, skill Codex và reference query; dùng CLI AST local. [Skill nguồn](https://github.com/Graphify-Labs/graphify/blob/52cb28218eea0c68d80a9f4b2ae102d2fa63e267/graphify/skill-codex.md). Adapter ArcadeX được viết riêng, không sao chép toàn bộ upstream. License upstream Apache-2.0, giữ NOTICE/LICENSE khi phân phối mã nguồn upstream.

## Chọn skill và vai trò

Mỗi task mở 1–3 skill từ INDEX; chọn thêm vai trò đúng chuyên môn. Điều tra Auth/save: `save-systems`, `game-qa-playtest`, khi cần `backend-architect`; vai trò `qa-lead`/`technical-director`. UI/touch: `game-ui-ux`, `input-systems`; phát hành: `game-release-liveops`. Vai trò là playbook trên đĩa, không tự khởi chạy 21 tiến trình. Phân công subagent khi task có yêu cầu và công cụ hỗ trợ, giới hạn file/phạm vi và có bước review kết quả.

## Cài CLI trong môi trường mới

Python 3.10+; dùng venv riêng, không thêm dependency vào ứng dụng React. Từ root ArcadeX (cần `uv`):

```bash
UV_CACHE_DIR=/tmp/arcadex-uv-cache uv venv .venv-graphify
UV_CACHE_DIR=/tmp/arcadex-uv-cache uv pip install --python .venv-graphify/bin/python 'graphifyy @ git+https://github.com/Graphify-Labs/graphify.git@52cb28218eea0c68d80a9f4b2ae102d2fa63e267'
```

Trong môi trường kiểm ngày13/11, CLI ở `/workspace/tooling/graphify-venv/bin/graphify`; đường dẫn này chỉ là trạng thái máy hiện tại. Skill đầu mối đã có trong `.agents/skills/`; không cần chạy initializer Studio hoặc installer Graphify ghi chồng AGENTS.

## Dựng và truy vấn theo module

Ví dụ Auth, từ root; thay scope theo task. Luôn giữ cùng root/output cho các lượt cập nhật:

```bash
GRAPHIFY_BACKEND=none GRAPHIFY_QUERY_LOG_DISABLE=1 .venv-graphify/bin/graphify extract src/services --code-only --no-cluster --out .graphify-local/auth
GRAPHIFY_BACKEND=none GRAPHIFY_QUERY_LOG_DISABLE=1 .venv-graphify/bin/graphify query 'session storage' --seed sessionWriter --budget 900 --depth 1 --graph .graphify-local/auth/graphify-out/graph.json
```

Lệnh extract chạy lại cùng scope sẽ tái dùng cache. Ghi SHA nguồn và scope cùng bằng chứng; sau đổi nhánh/pull/sửa code phải cập nhật trước khi kết luận. Graph services không phủ React context, trang Snake hoặc test; mở rộng có mục đích khi cần, không coi thiếu cạnh là không có liên hệ. Câu hỏi tiếng Việt cần ánh xạ sang token/symbol có thật trong graph; chỉ đọc phần nguồn được trả về và dùng tìm kiếm hẹp cho CSS, inline test hoặc phần chưa index. Giới hạn query thường700–1500token, depth1–2. Graph không thay test, trace trình duyệt, backend live hay nghiệm thu thiết bị.

Mặc định code-only/local, không chạy semantic docs/media, labeling API, cloud hoặc watcher/hook toàn repo. Output/cache/venv không commit; Markdown lưu nguồn, cách dùng và bằng chứng. Khi thiếu CLI, cài lại theo pin trên; nếu bị chặn, ghi rõ và tiếp tục tra nguồn hẹp, không báo đã dùng Graphify.

## Kiểm thực tế · 13/11/2026

Nguồn ArcadeX `19af480`, nhánh làm việc `codex/studio-graphify-workflow`: AST 46file trong `src/services`, **484node/1291edge**, không clustering/LLM. Graph ngoài git tại `/workspace/tooling/arcadex-auth-graph/graphify-out/`. Query Auth budget900/depth2 bị cắt39/258node; thu hẹp seed `sessionWriter`, depth1 cho3node/3edge, gồm lời gọi `latestWriter` tại sessionSync.ts:L14. Kết quả chỉ chứng minh công cụ hoạt động. Chưa sửa hoặc tái hiện lỗi cross-tab CI48. Task kế tiếp vẫn là điều tra ca đó và xác minh Netlify, theo bàn giao.
