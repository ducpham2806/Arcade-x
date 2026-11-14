# Nhật ký công việc

Một nhật ký chính, tối đa ba mục. [Trước merge/HOLD](archive/WORKLOG-2026-11-14-before-main-hold.md). Xem WORKFLOW và COMPLETED.

## 14/11/2026 · SN-MAIN-HOLD · codex/snake-merge-hold-20261114

- User cho merge main nhưng khoan Netlify. Fresh PR34/head9a4f44b mergeable, CI57 cả verify/snake_ui success; merge533c0e7 với `[skip netlify]` ởtitle/body, theo cơ chế skip chính thức Netlify. Tree merge khớp head đã kiểm, local main fast-forward.
- Netlify API trước/sau vẫn deploy6af6f590/source8320385 ready, không có deploy mergeSHA. Không trigger build/publish. CI58 chỉ push-check GitHub. [QA/HOLD](qa/SNAKE-MAIN-HOLD-2026-11-14.md).
- game-release-liveops, không đổi mã/gameplay/SQL/hosting settings. Ghi HOLD vào AGENTS/project/handoff, docs branch/PR cũng skip marker. Kiểm docs/structure/links/diff; không chạy lại gameplay cho Markdown. Chỉ phát hành khi user yêu cầu, human/device/liveJWT vẫn WAITING.

## 14/11/2026 · SN-R01-FINISH · codex/snake-r01-finish

- User yêu cầu làm tiếp Snake cho xong. Từ2ca0b3c/PR33(CI55xanh), sửa S1 Story ghi guest dù Journey theo owner; truyền store Story/Lab, giữ audio settings. Red/green account win/checkpoint/reload/B/guest và Space/focus/Escape; marker boss đúng nhiệm vụ, physics/digest giữ nguyên.
- V2 UI10màn/29sao/3tim mỗi màn qua native input/time, boss6hit/tutorial2-3, reload/cleanup0/pageerror0. V1 driver thua boss giữ evidence; sửa cadence/routebot, không hạ độkhó. Lint/build/rollback/preview/budget/6suite/catalog/storage, player3/3 và hosting5/5 qua; CI56 Snake xanh, verify lỗi testDungeon syntheticerror/autosave; sửa quota thật/recovery, giữ timeout và thêm artifactmotion. CI đúnghead trướcmerge. [QA](qa/SNAKE-FINISH-2026-11-14.md).
- game-qa-playtest/game-feel/game-ui-ux, Technical Director/QA độc lập không còn blocker. Graph46file/424node/1101edge, contextcall700. [Phiếu nghiệmthu](snake/R01-ACCEPTANCE.md); livepreflightWAITING4bindings. Thiết bị/người mới/art/audio thật chưa PASS; bản sửa chưa merge/deploy.

## 13/11/2026 · SN-UI-BADGE · codex/fix-hosting-badge-safe-area

- Từec65ea9/PR32, user cho làm tiếp S3 hosting. Đo HUD thật, chừa64px theo badge/8px đệm; không sửa branding/iframe/gói. Observer không theo subtree gameplay; popup không co game thêm, hide/remove trả vùng.
- Baseline8320385 đỏ đúng CTA; candidate hosting5/5, modal36checks kể cả tall phone1000px, catalog/offline/audio/isolation, lint/build/rollback/bundle qua. Animation50+25 và SnakeUI11/11+3guard qua, khôngretry/skip/flaky. [QA và evidence](qa/SNAKE-BADGE-2026-11-13.md).
- game-ui-ux/input-systems/game-qa-playtest + review QA/Technical Director; giữ cap mobile/desktop theo review. Graph components37file230node440edge, services47file485node1289edge; query depth1/budget900. PR33 targetmain gồmPR32; CI theo checks đúng head trướcmerge. Netlifypreview readyef9f636 nhưng edge-access chặn guest; chưa proofHUD thật/merge/deploy, thiết bị/human/liveJWT còn riêng.
