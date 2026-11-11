# Bàn giao · 11/11/2026 · PLAN-ADS

## Mốc nguồn đã xác minh

Main **9061bfd** đã merge PR #21; CI #36 xanh trên head 47649f9. Netlify production6af075593632a228f5ca3102 ready/published đúng9061bfd, xác minh API trong chat 11/11. Ghi chú08/11 “PR #21 còn nháp/chưa deploy” đã cũ, nguyên văn giữ ở archive. Health/WSS backend thật ngày 11/11 chưa xác minh vì proxy chặn Render; không coi frontend deploy là bằng chứng backend khỏe.

Checkout môi trường gốc `work@affc5e8` chậm 38 commit; không reset hoặc xóa bun.lock có sẵn. [Audit nhánh](qa/MERGE-AUDIT-2026-11-11.md):28/31 head nằm trong main; docs tương đương, P3 song song không merge lại; P2 bdc6f85 cần port chọn lọc sang P3.

## Yêu cầu hiện tại

User yêu cầu plan chi tiết phần dở, hoãn commerce và thêm vị trí quảng cáo Google; xác nhận chưa có AdSense/site Ready. Nhánh `codex/continuation-plan-google-ads-20261111` từ main; chỉ tài liệu, checker và mock review, chưa đổi runtime/SQL/ads thật.

[PROJECT-PLAN](PROJECT-PLAN.md) → [plan đầy đủ](CONTINUATION-2026-11-11.md), [ADS](plans/ADS.md), [vị trí](ads/PLACEMENTS.md). BASE/QA/online → ads readiness/mock → Snake → online hardening/QA → Duel → polish. Chờ Google không chặn Snake. Ads display ngoài game, mặc định off; H5/rewarded là bước riêng cần quyền Google.

## Điểm tiếp tục

- QA-ENV:15UI bị chặn file://; offline navigator đổi false→reload→true trên browser môi trường. Giữ assert, kiểm HTTP fixture/browser thật trước quy lỗi app.
- ONLINE-V1: xác minh sau PR #21 bằng đúng backend/account; patch đã phát hành, không làm lại. Nối Từ ON5/ON6 còn Auth/IME/mạng/soak; online XP/xu tắt.
- Snake: source/save/journey đã có; chưa public. Tiếp SN-R0a→R0b UI chơi/lưu/reload/Auth; chunk~1,35MBgzip cần tối ưu.
- Tank: P3 đủ source/sảnh, còn TC-R1 thiết bị/mạng/soak; TC-R2 epoch/control receipt/endpoint resume. Watchdog75s/10s và stale callback đã có.
- Duel chưa cutover UI. Commerce **hoãn**; không bật flag, thêm provider hoặc nhận tiền.
- Giữ quyết định cũ: ca Tank account A/mã B để sau; không mở lại gate thật3–4 người Nối Từ; Render Free/cap16, không phí mới, production SQL ngoài exception hẹp vẫn cấm.

Kiểm của lượt plan ghi trong WORKLOG; chưa chạy gameplay release mới. Tài liệu archive/COMPLETED giữ bằng chứng lịch sử, không dùng để tuyên bố nghiệm thu toàn bộ game.
