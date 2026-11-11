# Tóm tắt công việc đã hoàn tất

Nguồn dài trước checkpoint11/11 được [lưu nguyên văn](archive/COMPLETED-2026-11-11-before-continuation-plan.md). “Đã merge/phát hành” không đồng nghĩa nghiệm thu toàn bộ thiết bị.

## AD-02a · DONE core local · 11/11/2026

- Nhánh codex/ads-policy-loader từ482b8ed/PR24 (CI40 success); chưa merge/deploy. Có config/policy/AdProvider/AdSlot và SDK loader/Google adapter, app off + consent unknown; bật env cũng chưa cấp consent. Không SQL/commerce.
- SDK một lần/client/document, timeout/failure terminal; slot một attempt/document, StrictMode/duplicate/abort/late result qua. Khởi tạo SDK đồng bộ trong lượt eligible: regression red thấyfalse, green thấytrue; không dynamic import trì hoãn append.
- Cuối2renderer+18browser, production/PWA, lint/build/bundle/perf/launcher7/7/offline7/7 qua; storage/startup/readability/structure/docs qua.293,5kB gzip, idle3,9/s≤20. Game24/24 và motion48/48+25/25 kiểm trước sửa SDK cuối; CI nhánh mới vẫn cần, chưa thiết bị/CMP/Google thật.
- Graphify238node/399edge localAST, query6node/6edge; archive log/COMPLETED nguyên văn trước checkpoint. [Thiết kế, bằng chứng, gate còn lại](ads/POLICY-LOADER-2026-11-11.md); [checkpoint cũ](archive/COMPLETED-2026-11-11-before-ad-policy.md).
- AD-03 chờ account/site Ready/domain/ID/CMP/license/CSP; G1 chưa gắn. ONLINE-V1 vẫn policyrevision1/host trống và thiếu account thật. Có thể tiếp Snake theo plan trong lúc chờ Google/mạng.

## ADS-CONTENT/PREVIEW · DONE local · 11/11/2026

- Nhánh codex/ads-readiness-display-slots từ QA882e12e/PR23; chưa merge/deploy. Có10 trang HTML nguồn Markdown, link launcher và PWA offline; robots/404, canonical/sitemap chỉ khi SITE_URL thật.
- L1 desktop/L2 mobile sau8card chỉ dev ?ads-preview=1; production không bật được, không Google SDK/ads thật. AD-02a xem mục mới; G1/CMP còn sau; AD-01b còn owner/domain/license gate.
- Unit2/2, browser3/3, production/offline qua; launcher7/7/game24/24/offline7/7, motion48/48+25/25VFX, lint/build/bundle/startup/storage/docs/structure/diff qua. Giữ log motion đỏ lượt đầu; chưa thiết bị thật/CDN/fullCI.
- Graphify theo scope mới177node/328edge, query2node/1edge; rà nguồn license còn thiếu inventory24game. [Report và bước tiếp](ads/READINESS-2026-11-11.md); [kết quả cũ nguyên văn](archive/COMPLETED-2026-11-11-before-ads-readiness.md).

## QA-ENV · DONE local · 11/11/2026

- Nhánh codex/qa-env-online-v1-graphify từ plan7aae308, chưa merge/deploy. Thay file:// bằng server fixture HTTP loopback/raw byte, whitelist bốn file, cấu hình origin riêng và cwd root.
- Red/green: navigator lệch sau reload và Vite parse5 từ chối HTML bundle đã tái hiện; dùng API Chromium thật, Playwright vẫn chặn traffic và probe không cache kiểm offline/online. Giữ assertion/gameplay.
- Cuối:24/24UI+harness, offline7/7, WS/ops18/18, configrelease2/2; lint/build/bundle/doc/structure/diff qua. Đã xem ảnh; [báo cáo](qa/QA-ENV-2026-11-11.md).
- Graphify/query/cache và đầu vào ngắn đã dùng; ONLINE-V1 chưa đạt vì egress/account thật, không suy từ loopback. FullCI trước merge vẫn cần.

## GRAPHIFY · DONE local · 11/11/2026

- Pin graphifyy0.9.106, AST-only theo scope QA, không LLM/cloud/hook; build67file→704node/1715edge, refresh8file→710node/1743edge.
- Đã dùng query có seed/budget để lần fixture/transport/server; có giới hạn parser cho inline/config, kiểm source trực tiếp khi graph thiếu.
- scripts/graphify-qa.py tái tạo cache, docs/GRAPHIFY hướng dẫn ngắn; AGENTS/INDEX giữ graph-first theo task, không nạp report rộng. Chưa đo tỷ lệ token tiết kiệm; Graphify LLM token0.
- [Bằng chứng QA đang chạy](qa/QA-ENV-2026-11-11.md). Graph không thay test hoặc chứng minh production.

## PLAN-ADS / MERGE-AUDIT · 11/11/2026

- Main9061bfd/PR21 đã merge, CI36 xanh trên head47649f9; Netlify ready đúng main, sửa ghi chú bàn giao cũ.
- 28/31 head là tổ tiên main; docs patch tương đương, P3 song song, TankP2 còn port chọn lọc. Không merge lẫn P2/P3.
- User hoãn commerce và yêu cầu Google ads; chưa có AdSense/site Ready. Có plan/task/AC/test và vị trí L1/L2/G1, mock review không SDK.
- Không đổi runtime, SQL, payment hoặc phục vụ ads thật. Plan là đầu vào thi công, không đánh dấu các task gameplay/ads triển khai xong.
- Kiểm của lượt này ở WORKLOG; bước tiếp QA-ENV/ONLINE-V1 và ads readiness, rồi Snake theo roadmap.

## Các mốc đã phát hành và module trước

NETLIFY-BUILD/PR17, AUTH-XTAB, WC-L0/PR18 và WC-PUBLIC đã phát hành theo các SHA/bằng chứng trong [checkpoint trước ads](archive/COMPLETED-2026-11-11-before-ads-readiness.md). User bỏ gate3–4người Nối Từ, ON5/ON6 và ca Tank accountA/mãB cũ còn sau; không coi việc merge/public là nghiệm thu mọi thiết bị. Snake còn preview, Duel chưa cutover, commerce hoãn. Bản archive giữ nguyên từng kết quả/giới hạn, không cần đọc lại khi task khác không liên quan.
