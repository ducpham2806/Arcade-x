# Nhật ký công việc

Một nhật ký chính, tối đa ba mục; [bản trước lượt plan11/11](archive/WORKLOG-2026-11-11-before-continuation-plan.md) giữ nguyên văn ba mục08/11. Quy trình ở WORKFLOW, kết quả bền vững ở COMPLETED.

## 11/11/2026 · AD-02a DONE core local · codex/ads-policy-loader

- Từ482b8ed/PR24, CI40 success; chưa merge/deploy. Config/policy/slot/provider/SDK core off, app consent unknown, env không tự grant; không SQL/commerce. SDK one-flight/terminal failure, budget một attempt/document, abort và frame reserve.
- Tái hiện red SDK append sau lượt eligible qua microtask; sửa sync runtime + adapter nội bộ, green thấy quyềntrue, không request ngoài.2renderer/18browser, production/PWA, lint/build/bundle/perf/launcher7/7/offline7/7 qua. Game24/24/motion48/48+25/25 kiểm trước sửa loader cuối; không lặp CSS/engine.293,5kB gzip, idle3,9/s; storage/startup/readability/structure/docs qua.
- Graphify238node/399edge, query6node/6edge,0LLM/upload; [report](ads/POLICY-LOADER-2026-11-11.md). [Nhật ký trước checkpoint](archive/WORKLOG-2026-11-11-before-ad-policy.md) giữ nguyên văn. CMP/owner/AD03/G1 còn sau; mạng vẫnrevision1/trống nên ONLINE-V1 chờ.

## 11/11/2026 · ADS-CONTENT/PREVIEW DONE local · codex/ads-readiness-display-slots

- Từ QA882e12e/PR23, chưa merge/deploy. Có10 trang HTML nguồn Markdown, link launcher, PWA offline/404/canonical theo domain; L1/L2 dev preview, production tắt cứng. AD-01b còn owner/license/domain, AD-02a/G1/SDK/CMP chưa làm; không ads thật/SQL/commerce.
- Graphify scope launcher/ads177node/328edge, query symbol/contextcall gọn; không LLM/upload. Rà license tìm được nguồn hai từ điển và Blossom, chưa đủ inventory24game.
- Cuối unit2/2, browser3/3, production HTML/offline/gate qua; launcher7/7, game24/24, offline7/7, motion48/48+VFX25/25, lint/build/bundle/startup/storage/structure/docs/diff qua. Motion lượt đầu47/48, giữ log đỏ; không nới test. [Report](ads/READINESS-2026-11-11.md). Egress vẫn revision1/trống, Render CONNECT403; ONLINE-V1 chờ mạng/account thật.

## 11/11/2026 · QA-ENV DONE local / ONLINE-V1 WAITING / GRAPHIFY · codex/qa-env-online-v1-graphify

- User cho làm tiếp, yêu cầu Graphify và đầu vào gọn. Nhánh mới từ plan7aae308 (PR22 còn nháp), main9061bfd; chưa merge/deploy.
- Graphify đã cài pin0.9.106; AST-only67file→704node/1715edge, cập nhật8file→710node/1743edge. Đã query có seed/budget; có script cache và hướng dẫn đầu vào ngắn. Không LLM/cloud, chưa đo tỷ lệ tiết kiệm token.
- QA red/green: Tank1v1 file:// đỏ trước; regression navigator sau reload đỏ trước,2/2 xanh sau sửa bằng API Chromium thật và probe request không cache. Offline7/7 và WS/ops18/18 qua. Cuối24/24UI+harness qua; raw HTTP giữ byte để tránh Viteparse5, whitelist4file; configrelease3010/4327 thêm2/2 qua. Lint/build/bundle/docs/structure/diff qua, ảnh đã xem; giữ assertion và gameplay. ONLINE-V1 proxyCONNECT403 trước Render; chờ egress/account, không kết luận outage. [Report](qa/QA-ENV-2026-11-11.md).
