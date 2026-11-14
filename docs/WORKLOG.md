# Nhật ký công việc

Một nhật ký chính, tối đa ba mục. [Trước sửa CI58](archive/WORKLOG-2026-11-14-before-ci58.md). Xem WORKFLOW và COMPLETED.

## 14/11/2026 · SN-POSTMERGE-CI · codex/snake-merge-hold-20261114

- CI58/main533c0e7: Snake UI xanh; verify lỗi so sánh save ở Dungeon reduced desktop. Autosave hợp lệ lọt giữa hai page.evaluate lấy baseline và cài quota fault. CI59/docs5b7314b cùng runtime đã xanh, xác nhận tính không ổn định; không xóa lịch sử CI58FAIL.
- Tái hiện bằng pagehide thật trong cửa sổ cũ: đỏ; chuyển baseline vào cùng browser task cài interceptor: xanh. Chỉ sửa test, giữ quota thật/retry/error/dữ liệu cũ/recovery, không đổi gameplay/timeout/skip. [QA](qa/SNAKE-POSTMERGE-CI-2026-11-14.md).
- Dùng game-qa-playtest/performance-optimization, QA Lead; graph Dungeon29file/226node/693edge, query call700/depth1 có6node/6edge; callback persist phải đọc source. Kiểm lặp12/12, lint/structure/docs/diff qua; fullCI head mới theo checks PR35 sau push; Netlify HOLD giữ marker commit/PR. Thiết bị/M2/liveJWT vẫn WAITING.

## 14/11/2026 · SN-MAIN-HOLD · codex/snake-merge-hold-20261114

- User cho merge main nhưng khoan Netlify. Fresh PR34/head9a4f44b mergeable, CI57 cả verify/snake_ui success; merge533c0e7 với `[skip netlify]` ởtitle/body, theo cơ chế skip chính thức Netlify. Tree merge khớp head đã kiểm, local main fast-forward.
- Netlify API trước/sau vẫn deploy6af6f590/source8320385 ready, không có deploy mergeSHA. Không trigger build/publish. CI58 chỉ push-check GitHub. [QA/HOLD](qa/SNAKE-MAIN-HOLD-2026-11-14.md).
- game-release-liveops, không đổi mã/gameplay/SQL/hosting settings. Ghi HOLD vào AGENTS/project/handoff, docs branch/PR cũng skip marker. Kiểm docs/structure/links/diff; không chạy lại gameplay cho Markdown. Chỉ phát hành khi user yêu cầu, human/device/liveJWT vẫn WAITING.

## 14/11/2026 · SN-R01-FINISH · codex/snake-r01-finish

- User yêu cầu làm tiếp Snake cho xong. Từ2ca0b3c/PR33(CI55xanh), sửa S1 Story ghi guest dù Journey theo owner; truyền store Story/Lab, giữ audio settings. Red/green account win/checkpoint/reload/B/guest và Space/focus/Escape; marker boss đúng nhiệm vụ, physics/digest giữ nguyên.
- V2 UI10màn/29sao/3tim mỗi màn qua native input/time, boss6hit/tutorial2-3, reload/cleanup0/pageerror0. V1 driver thua boss giữ evidence; sửa cadence/routebot, không hạ độkhó. Lint/build/rollback/preview/budget/6suite/catalog/storage, player3/3 và hosting5/5 qua; CI56 Snake xanh, verify lỗi testDungeon syntheticerror/autosave; sửa quota thật/recovery, giữ timeout và thêm artifactmotion. CI đúnghead trướcmerge. [QA](qa/SNAKE-FINISH-2026-11-14.md).
- game-qa-playtest/game-feel/game-ui-ux, Technical Director/QA độc lập không còn blocker. Graph46file/424node/1101edge, contextcall700. [Phiếu nghiệmthu](snake/R01-ACCEPTANCE.md); livepreflightWAITING4bindings. Thiết bị/người mới/art/audio thật chưa PASS; bản sửa chưa merge/deploy.
