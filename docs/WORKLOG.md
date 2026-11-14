# Nhật ký công việc

Một nhật ký chính, tối đa3mục. [Trước content](archive/WORKLOG-2026-11-14-before-content.md); WORKFLOW/COMPLETED giữ tóm tắt.

## 14/11/2026 · SN-R01-CONTENT · codex/snake-r01-content-20261114

- User yêu cầu đầy đủ content theo plan; user đã chốt trọn R01/10màn, không thêm map/boss/shop. Parent7785d71/PR35 đã qua fullCI60. Thêm sổ tay/lời kết10màn, kết chương, sao/bí mật/replay; master A1 thành rig Canvas, Tiểu Xà biểu cảm và Nhện Mẹ8chân/8state, giảm chuyển động. [QA](qa/SNAKE-R01-CONTENT-2026-11-14.md).
- Không có image-to-video: ghi route bằng code, không nhận đã tạo rawclip/frame. Native24/48/96px/light/dark và phone đã xem; sửa ghostbody bằng slice ngoài36%. Unit6suite/lint/build/preview/package/budget/catalog/offline/player6/6/quota red→green, V3UI10/10/29sao/reload/cleanup0qua; V1bossFAIL và V2buildnavigationFAIL giữ nguyên.
- create-game-assets/game-feel/game-qa-playtest, Art&UI Lead; graph48file438node1151edge, queryrigcall900→3node2edge. Giữ luật/save/checkpoint/reward và NetlifyHOLD; humanM2/thiết bị/art/audio/liveJWT vẫnWAITING.

## 14/11/2026 · SN-POSTMERGE-CI · codex/snake-merge-hold-20261114

- CI58/main533c0e7: Snake UI xanh; verify lỗi so sánh save ở Dungeon reduced desktop. Autosave hợp lệ lọt giữa hai page.evaluate lấy baseline và cài quota fault. CI59/docs5b7314b cùng runtime đã xanh, xác nhận tính không ổn định; không xóa lịch sử CI58FAIL.
- Tái hiện bằng pagehide thật trong cửa sổ cũ: đỏ; chuyển baseline vào cùng browser task cài interceptor: xanh. Chỉ sửa test, giữ quota thật/retry/error/dữ liệu cũ/recovery, không đổi gameplay/timeout/skip. [QA](qa/SNAKE-POSTMERGE-CI-2026-11-14.md).
- Dùng game-qa-playtest/performance-optimization, QA Lead; graph Dungeon29file/226node/693edge, query call700/depth1 có6node/6edge; callback persist phải đọc source. Kiểm lặp12/12, lint/structure/docs/diff qua; CI60/head7785d71verify và snake_ui success; Netlify HOLD giữ marker commit/PR. Thiết bị/M2/liveJWT vẫn WAITING.

## 14/11/2026 · SN-MAIN-HOLD · codex/snake-merge-hold-20261114

- User cho merge main nhưng khoan Netlify. Fresh PR34/head9a4f44b mergeable, CI57 cả verify/snake_ui success; merge533c0e7 với `[skip netlify]` ởtitle/body, theo cơ chế skip chính thức Netlify. Tree merge khớp head đã kiểm, local main fast-forward.
- Netlify API trước/sau vẫn deploy6af6f590/source8320385 ready, không có deploy mergeSHA. Không trigger build/publish. CI58 chỉ push-check GitHub. [QA/HOLD](qa/SNAKE-MAIN-HOLD-2026-11-14.md).
- game-release-liveops, không đổi mã/gameplay/SQL/hosting settings. Ghi HOLD vào AGENTS/project/handoff, docs branch/PR cũng skip marker. Kiểm docs/structure/links/diff; không chạy lại gameplay cho Markdown. Chỉ phát hành khi user yêu cầu, human/device/liveJWT vẫn WAITING.
