# Bàn giao · 11/11/2026 · QA-ENV DONE local / ONLINE-V1 WAITING

## Nguồn và phạm vi

User cho làm tiếp theo plan, dùng Graphify, ghi nhật ký và giữ đầu vào gọn. Nhánh codex/qa-env-online-v1-graphify từ plan7aae308 (PR22 còn nháp), gameplay main9061bfd. Chưa merge/deploy; commerce hoãn, ads thật tắt. Repo gốc work@affc5e8 và bun.lock có sẵn giữ nguyên.

## Đã xong và kiểm thật

- Graphify0.9.106 AST-only theo scope QA, không LLM/cloud/hook; graph hiện716node/1753edge. Có script incremental và query seed/budget, không nạp cả graph/report. [GRAPHIFY](GRAPHIFY.md).
- Server fixture HTTP raw/loopback, whitelist4file; riêng origin metadata, không phụ thuộc app3000/3010. Sửa runner offline bằng API Chromium khi navigator lệch qua reload; Playwright vẫn chặn traffic, uncached probe chứng minh. Giữ gameplay/assertion.
- Red trước/sau có report. Cuối24/24UI+harness,7/7PWAoffline,18/18WS/ops,2/2configrelease; lint/build/bundle/docs/structure/diff qua. Đã xem ảnh. [QA-ENV](qa/QA-ENV-2026-11-11.md).

## Tiếp ONLINE-V1

Mạng môi trường vẫn revision1, chưa custom domain, proxy chặn Render CONNECT403/HTTP000 trước service. User nói sẽ mở egress site/Render/Supabase; refresh status và thử kết nối mới chỉ khi config đã áp dụng. Chưa có hai phiên account thật; không đánh PASS production từ mock/loopback, không đổi SQL/env/gói.

Khi có access: kiểm frontend/backend SHA/profile/health/WSS, rồi hai account tạo/join/ready/leave/queuecancel. Khi còn chờ, có thể tiếp ads readiness/mock hoặc Snake sau checkpoint, theo [PROJECT-PLAN](PROJECT-PLAN.md) và một thẻ task. Giữ ca Tank accountA/mãB để sau, gate thật3–4người Nối Từ đã bỏ, RenderFree/cap16 và không phí mới.
