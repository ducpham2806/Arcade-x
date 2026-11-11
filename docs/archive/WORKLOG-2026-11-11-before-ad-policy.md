# Nhật ký công việc

Một nhật ký chính, tối đa ba mục; [bản trước lượt plan11/11](archive/WORKLOG-2026-11-11-before-continuation-plan.md) giữ nguyên văn ba mục08/11. Quy trình ở WORKFLOW, kết quả bền vững ở COMPLETED.

## 11/11/2026 · ADS-CONTENT/PREVIEW DONE local · codex/ads-readiness-display-slots

- Từ QA882e12e/PR23, chưa merge/deploy. Có10 trang HTML nguồn Markdown, link launcher, PWA offline/404/canonical theo domain; L1/L2 dev preview, production tắt cứng. AD-01b còn owner/license/domain, AD-02a/G1/SDK/CMP chưa làm; không ads thật/SQL/commerce.
- Graphify scope launcher/ads177node/328edge, query symbol/contextcall gọn; không LLM/upload. Rà license tìm được nguồn hai từ điển và Blossom, chưa đủ inventory24game.
- Cuối unit2/2, browser3/3, production HTML/offline/gate qua; launcher7/7, game24/24, offline7/7, motion48/48+VFX25/25, lint/build/bundle/startup/storage/structure/docs/diff qua. Motion lượt đầu47/48, giữ log đỏ; không nới test. [Report](ads/READINESS-2026-11-11.md). Egress vẫn revision1/trống, Render CONNECT403; ONLINE-V1 chờ mạng/account thật.

## 11/11/2026 · QA-ENV DONE local / ONLINE-V1 WAITING / GRAPHIFY · codex/qa-env-online-v1-graphify

- User cho làm tiếp, yêu cầu Graphify và đầu vào gọn. Nhánh mới từ plan7aae308 (PR22 còn nháp), main9061bfd; chưa merge/deploy.
- Graphify đã cài pin0.9.106; AST-only67file→704node/1715edge, cập nhật8file→710node/1743edge. Đã query có seed/budget; có script cache và hướng dẫn đầu vào ngắn. Không LLM/cloud, chưa đo tỷ lệ tiết kiệm token.
- QA red/green: Tank1v1 file:// đỏ trước; regression navigator sau reload đỏ trước,2/2 xanh sau sửa bằng API Chromium thật và probe request không cache. Offline7/7 và WS/ops18/18 qua. Cuối24/24UI+harness qua; raw HTTP giữ byte để tránh Viteparse5, whitelist4file; configrelease3010/4327 thêm2/2 qua. Lint/build/bundle/docs/structure/diff qua, ảnh đã xem; giữ assertion và gameplay. ONLINE-V1 proxyCONNECT403 trước Render; chờ egress/account, không kết luận outage. [Report](qa/QA-ENV-2026-11-11.md).

## 11/11/2026 · PLAN-ADS / MERGE-AUDIT · codex/continuation-plan-google-ads-20261111

- User yêu cầu xác minh main, plan chi tiết phần dở và vị trí Google ads; commerce làm sau, chưa có AdSense/site Ready.
- Fetch main 9061bfd:28/31 head là tổ tiên; docs tương đương, P3 song song, P2 còn port chọn lọc. PR #21 đã merge và production đúng SHA; sửa các đầu vào còn ghi chưa merge/deploy, giữ archive nguyên văn.
- Thêm CONTINUATION-2026-11-11, ADS card, Google plan/placements, merge audit và mock review; update PROJECT-PLAN/SESSION-HANDOFF/OWNER-TODO/COMPLETED/INDEX/quyết định. Checker mở rộng nhận đúng tám thẻ và kiểm các plan mới.
- Đây là docs và mock, chưa tích hợp SDK/slot vào launcher, chưa mở ads/payment/SQL. Kiểm: doc checker 29 đầu vào qua; test:claude qua; git diff --check qua. Mock Chromium 320/390/768/1440 không tràn, library 1/2 slot theo breakpoint, guide 1 slot, gameplay 0 slot, tab bàn phím đúng; không request ngoài/error JS. Đã xem ảnh desktop 1440 và mobile 390. Không chạy lại full gameplay CI vì không đổi runtime; không dùng test lượt audit trước làm bằng chứng release mới.
