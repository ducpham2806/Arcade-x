# Tóm tắt công việc đã hoàn tất

Nguồn dài trước checkpoint11/11 được [lưu nguyên văn](archive/COMPLETED-2026-11-11-before-continuation-plan.md). “Đã merge/phát hành” không đồng nghĩa nghiệm thu toàn bộ thiết bị.

## SN-R2a · ứng viên catalog local · 12/11/2026

- `codex/snake-catalog-candidate` từ 3a3db28. Một thẻ game, gói 36 tệp theo yêu cầu. Chrome đã tải, reload offline, chơi, thử tiếng, thoát và tách save khách/tài khoản. Build mặc định 24 game.
- Còn nghiệm thu thiết bị, staging và quyết định phát hành. [QA](qa/SNAKE-CATALOG-2026-11-12.md). [Tóm tắt trước ứng viên](archive/COMPLETED-2026-11-12-before-snake-catalog.md).

## SN-R2a · gói preview local · 12/11/2026

- Nhánh `codex/snake-r2a-preview-assets` từ 2f82945. Tách 20 media nguyên byte, game JS 151.769 byte thay cho 1.917.496. Preview qua budget JS.
- Đã kiểm Chrome render khi ảnh chậm, retry/hủy audio và HTML standalone offline. Còn nghiệm thu thật và ứng viên catalog. [QA](qa/SNAKE-R2A-2026-11-12.md). [Tóm tắt trước lượt này](archive/COMPLETED-2026-11-12-before-snake-r2a.md).

## SN-R1b · kiểm nội dung local · 12/11/2026

- `codex/snake-r1b-content-review` từ bad1d56. Suite journey kiểm 10 màn bằng Engine thật, lưu/đọc 28/30 sao, ngọc R01 và 10 receipt. Qua ba cầu sau ca rơi nước, thắng Nhện Mẹ đủ 6 hit và 3 pha.
- Đã xem 16 cảnh renderer, sửa CTA 568×320 bị cắt sát mép khi cuộn. Còn M2, duyệt art/audio, thiết bị và live. [QA SN-R1b](qa/SNAKE-R1B-2026-11-12.md). [Tóm tắt cũ nguyên văn](archive/COMPLETED-2026-11-12-before-snake-r1b.md).

## SN-R1a · local fixes đã kiểm; thiết bị WAITING · 12/11/2026

- Nhánh codex/snake-r1a-controls-runtime từ79cf133/PR27CI43 success; checkpoint ad7aa50. Sửa audio late resume/stale failure/decode retry, shared Controls pagehide/rotation, landscape cắt Dash và safe area riêng Snake, thay glyph bằng SVG; không physics/digest/save/wallet/SQL/flags.
- 10UI (239,1s,0skip/flaky)/3guard,6suite local/audio race, lint,root/preview build/package/bundle và5nhóm guest/SW qua.3vòng resource1RAF/1RO/9listener/1AudioContext→0 sau exit;5viewport/native CDP input/insets/rotation, ảnh đã xem. Không heap/60FPS/thiết bị thật claim.
- CI Snake mở rộng4ca controls. Graphify642/1462, query3/2 budget700,0LLM/upload; log/COMPLETED cũ giữ trong archive trước R1a. [Report và việc kiểm sau](qa/SNAKE-R1A-2026-11-12.md). Chưa merge/deploy/public; R0b live và R1 thiết bị/human vẫn WAITING theo user, không tự mở commerce/ads/reward.

## SN-R0b · DONE local UI coverage; LIVE WAITING · 12/11/2026

- Nhánh codex/snake-r0b-ui-save từ8690fb9/PR26, parent CI42 success; PR27/79cf133 CI43 success (verify+snake_ui).6ca browser UI đã qua: thắng/lưu/restore stars/best/unlock, offline, lostACK/idempotency, account isolation, cạnh tranh2context/lateACK, fixture expiry không remount. Không sửa engine/save/private hoặc shared wallet; chưa có lỗi product cần sửa.
- Thêm fixture replay bằng public Engine, driver pointer/frame thật, live runner riêng có preflight/UID guard/no-secret traces, CI job/artifact riêng.3guard, typecheck,6suite Snake cũ/structure/diff qua; snapshot verifier private đối chiếu cùng6ca qua (3,2phút), không skip/flaky; không đưa source server vào git.
- Metadata Edge đọc ACTIVE/v2/verify_jwt/digest khớp; DB flags/grant/RLS/JWT thật chưa xác nhận. Live runner path chưa chạy vì network/binding chưa có. Không đóng toàn R0b, không merge/deploy/public/reward. [Bằng chứng/giới hạn](qa/SNAKE-R0B-2026-11-12.md), [runbook bước live](snake/UI-SAVE-RUNBOOK.md); archive giữ log trước checkpoint.
- Graphify scope nhỏ703node/1608edge, seed/contextcall/budget700,0LLM/upload; đã xem ảnh saved/actions/restore. Tiếp live UI/JWT/fault/concurrency và cleanup đúng fixture khi đủ điều kiện, không chuyển thêm map/boss/shop.

## SN-R0a · DONE baseline local · 12/11/2026

- Nhánh codex/snake-r0a-baseline từ1f4bfc9/PR25, CI41 parent success. Sáu suite fixture + package qua; master PNG hash/dimensions/WebP budget được kiểm. Không đổi engine/save/private wallet, không public/catalog/reward.
- Thêm profile graph/byte và browser loopback:4viewport guest→login entry/reload/layout, rootSW giữ canonical preview/một worker qua. Fix glyph CTA thành SVG đã xem trước-sau; metadata/art giữ nguyên.
- JS landing909.386byte raw/245.671gzip ước tính; CSS451.682/53.357, hai ảnh243.250byte. Game1.916.911/1.346.381,92,22% literal nhúng; public gatefalse. Build/lint/bundle/structure/docs/diff qua; CI thêm Snake local/artifact/runtime và lưu evidence.
- GraphifyAST579node/1355edge, seed/budget,0LLM/upload. [Baseline/nguồn/generator/giới hạn](qa/SNAKE-R0A-2026-11-12.md). Chưa real account/save/JWT/device/10level playthrough hoặc deploy; backendflags chưa đọc lại. Tiếp SN-R0b khi mạng/account/grant sẵn sàng.

## AD-02a · DONE core local · 11/11/2026

- Nhánh codex/ads-policy-loader từ482b8ed/PR24 (CI40 success); chưa merge/deploy. Có config/policy/AdProvider/AdSlot và SDK loader/Google adapter, app off + consent unknown; bật env cũng chưa cấp consent. Không SQL/commerce.
- SDK một lần/client/document, timeout/failure terminal; slot một attempt/document, StrictMode/duplicate/abort/late result qua. Khởi tạo SDK đồng bộ trong lượt eligible: regression red thấyfalse, green thấytrue; không dynamic import trì hoãn append.
- Cuối2renderer+18browser, production/PWA, lint/build/bundle/perf/launcher7/7/offline7/7 qua; storage/startup/readability/structure/docs qua.293,5kB gzip, idle3,9/s≤20. Game24/24 và motion48/48+25/25 kiểm trước sửa SDK cuối; CI nhánh mới vẫn cần, chưa thiết bị/CMP/Google thật.
- Graphify238node/399edge localAST, query6node/6edge; archive log/COMPLETED nguyên văn trước checkpoint. [Thiết kế, bằng chứng, gate còn lại](ads/POLICY-LOADER-2026-11-11.md); [checkpoint cũ](archive/COMPLETED-2026-11-11-before-ad-policy.md).
- AD-03 chờ account/site Ready/domain/ID/CMP/license/CSP; G1 chưa gắn. ONLINE-V1 vẫn policyrevision1/host trống và thiếu account thật. Có thể tiếp Snake theo plan trong lúc chờ Google/mạng.

## Các mốc trước

Ads content/preview, QA-ENV, Graphify, audit main và các mốc đã phát hành giữ nguyên văn trong [checkpoint trước R1a](archive/COMPLETED-2026-11-12-before-snake-r1a.md). AD03/site/CMP/license và ONLINE-V1 vẫn còn các gate riêng; commerce hoãn. Không dùng kết quả lịch sử chứng minh production hiện tại.
