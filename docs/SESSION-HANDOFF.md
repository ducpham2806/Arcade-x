# Bàn giao · 11/11/2026 · AD-02a DONE core local

## Nguồn và giới hạn

Nhánh codex/ads-policy-loader từ482b8ed/PR24 (CI40 success), xếp trên QA882e12e/PR23 và plan7aae308/PR22. Main9061bfd, chưa merge/deploy các nhánh này. User cho làm tiếp, dùng Graphify/nhật ký/đầu vào gọn; commerce hoãn. Repo gốc work@affc5e8/bun.lock giữ nguyên. Không SDK ads thật đang chạy, không SQL/backend/env release.

## Đã làm và kiểm

AD-02a config/policy/AdProvider/AdSlot/SDK loader + adapter: app flag off, consent unknown; không lấy quyền từ query/login/storage. Env riêng lẻ không đủ request. L1/L2 nối runtime nhưng default không có khung; preview chỉ dev. SDK append cùng lượt eligible, shared promise/client/document, terminal lỗi/timeout; budget một request/document, StrictMode/abort/late result, no-fill giữ reserve. Gate game/modal/chat/splash/discard/force-update/loading/notice/empty/offline/hidden; G1 chưa gắn.

Cuối2renderer+18browser, production10HTML/PWA/0requestGoogle, lint/build/bundle/perf/launcher7/7/offline7/7 qua; storage/startup/readability/structure/docs qua.293,5kB gzip, idle3,9/s≤20. Game24/24 và motion48/48+25/25 kiểm trước sửa SDK cuối; fullCI mới chưa có kết quả, chưa thiết bị/CMP/real fill. Regression khởi tạo SDK redfalse→greentrue đã giữ log. [Report](ads/POLICY-LOADER-2026-11-11.md).

Graphify0.9.106 localAST scope ads/context/tests238node/399edge, query AdSlot symbol+contextcall700 trả6node/6edge; không LLM/upload, không đọc graph/archive rộng. [GRAPHIFY](GRAPHIFY.md).

## Bước tiếp

Đọc một thẻ theo PROJECT-PLAN: AD-03 chỉ sau owner account/site Ready/domain/ID/license/CMP/CSP/deploy context. Cần integration CMP thật cấp snapshot, privacy và profile Google/CMP; env preview/CI giữoff. G1 còn sau. Có thể chuyển [Snake](plans/SNAKE.md) trong lúc chờ; không lấy checkpoint cũ làm bằng chứng release mới.

ONLINE-V1 vẫn WAITING: status mới revision1/host trống, chưa probe lại Render vì chưa mở host; lần trước CONNECT403 trước backend. User nói sẽ mở egress site/Render/Supabase; khi có hiệu lực và hai phiên account mới kiểm health/SHA/profile/WSS và room/queue thật. Không suy PASS từ mock, không nâng gói. Giữ ca Tank A/mãB sau; Nối Từ bỏ gate3–4người như đã chốt.
