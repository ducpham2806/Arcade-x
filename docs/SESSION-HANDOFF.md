# Bàn giao · 14/11/2026 · SN-POSTMERGE-CI / NETLIFY HOLD

User yêu cầu tiếp tục plan, giữ lệnh trước: merge main, khoan Netlify. PR34/head9a4f44b đã merge main533c0e7 sau CI57 success. Bản runtime mới chưa deploy. Checkpoint và test fix trên `codex/snake-merge-hold-20261114`/[PR35](https://github.com/ducpham2806/Arcade-x/pull/35). [Thẻ Snake](plans/SNAKE.md).

## Kiểm CI sau merge

CI58/main533c0e7: snake_ui success, verify FAIL ở Dungeon reduced desktop, so byte-save. CI59/docs5b7314b cùng runtime success. Nguyên nhân test đọc baseline trước rồi mới cài quota fault ở hai browser task; autosave hợp lệ chen giữa. Không có lỗi Snake mới được chứng minh.

Sửa test chụp baseline sau khi cài interceptor, cùng một browser task đồng bộ. Tái hiện pagehide thật trong cửa sổ cũ: đỏ; cùng kích thích với sửa: xanh. Bản cuối4cấu hình×3lượt PASS12/12, lint/structure/docs/diff qua; fullCI head mới cần theo checks PR35 tại checkpoint này. Giữ nguyên error/retry/savebytes/recovery, không skip/tăng timeout/đổi runtime. [QA CI58](qa/SNAKE-POSTMERGE-CI-2026-11-14.md).

## Netlify HOLD

Mọi commit đẩy nhánh và title PR giữ `[skip netlify]` cho tới khi user yêu cầu phát hành rõ. Không trigger buildhook/deploy/publish. Skip theo commit/PR; auto-deploy toàn site chưa tắt. API trước/sau merge vẫn published6af6f590/source8320385 ready, không deploy merge533c0e7. [QA HOLD](qa/SNAKE-MAIN-HOLD-2026-11-14.md). Không dùng smoke bản cũ ký bản mới.

## Snake và bước tiếp

Main đã sửa ownerstore Story/Journey/Lab, prefs, nativekeyboard/focus/Escape, boss marker/minimap và badge. V2 UI10/10/29sao/3tim mỗi màn, boss6hit/3pha, reload/cleanup0; V1FAIL giữ evidence. [QA kỹ thuật](qa/SNAKE-FINISH-2026-11-14.md).

Chốt fullCI đúng head PR35, giữ HOLD. R1a Android/iPhone/FPS/heap thật, R1b M2/người mới/art/audio và R0b livebackend/JWT vẫn WAITING; thiếu4binding, không login/ghiDB. [Phiếu nghiệm thu](snake/R01-ACCEPTANCE.md). Chỉ khi được yêu cầu phát hành mới deploy source có chủ đích và xác nhận Published/SHA/smoke public.

Game Studio game-qa-playtest/performance-optimization, QA Lead; Graphify Dungeon29file/226node/693edge, call700/depth1:6node/6edge; persist inline cần đọc source. Chỉ test/docs đổi, không đo FPS/soak mới. [Bàn giao trước](archive/SESSION-HANDOFF-2026-11-14-before-ci58.md). Một WORKLOG≤3mục, archive nguyên văn.
