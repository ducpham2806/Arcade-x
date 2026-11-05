# TC2 · bằng chứng và phần còn lại · 04/11/2026

Nhánh `codex/tank-clash-tc2-readiness`, nền `6eb394c`; bằng chứng 04/11 ở `a8d472b`, cập nhật profile hosting 05/11 bên dưới. Chuẩn bị staging/vận hành, **chưa nghiệm thu TC2 trên backend public/thiết bị/mạng thật**. Chưa launcher, entitlement, DB result hoặc phát hành; bản duyệt gameplay vẫn [P3-review](P3-review.md).

## Cập nhật 05/11 — origin và Render pilot

- Chủ dự án xác nhận chỉ dùng Netlify, chưa VPS. Đọc public URL `https://arcade-x.netlify.app/`: HTTP 200, title ArcadeX. Đã xác định đúng site qua Netlify connector **NamA**, site `2f4bcb1f-79f5-47ca-b836-61a11a799195`; connector mang tên Arcade-x đang liệt kê site khác nên không dùng để sửa site này. Không sửa env/deploy/site settings.
- Template dùng exact frontend origin; WS test từ chối HTTP, hostname nối đuôi giả mạo và Deploy Preview chưa cho phép. `render.yaml` chuẩn bị service Free/Singapore/Node24/một process, deploy thủ công, 16 socket; backend URL vẫn chờ Render cấp, chưa có service/public WSS.
- Preflight Render cho bind `0.0.0.0` sau managed TLS chỉ khi metrics HTTP tắt; VPS vẫn loopback. Metrics tắt trả 404 ngay cả với token hợp lệ. 16/16 WS/ops qua Node 24; không đổi engine/wire/gameplay/UI. Blueprint kiểm schema chính thức; chưa thử build/runtime trên Render, chưa chạy lại soak 30 phút sau thay config/route metrics.
- Quy trình chi tiết ở runbook §1. Nhánh được chuẩn bị push với `[skip netlify]` theo AGENTS 05/11; không merge/main/Netlify deploy, không dùng `[skip ci]` hoặc nới test.

## Môi trường đã xác minh

- Chủ dự án yêu cầu tạo staging và chọn Nam A Uniform (`hupchejsetmpgfasxuct`). Đã tạo [arcade-x-staging](https://supabase.com/dashboard/project/khqipuipeawzlkqmdzdg), ref `khqipuipeawzlkqmdzdg`, Singapore `ap-southeast-1`, `ACTIVE_HEALTHY`, Postgres 17.11.0.011. Organization đang Free; tool tạo không yêu cầu bước xác nhận chi phí/không đổi gói.
- Public schema chưa có bảng; `auth.users` có 0 user; security advisors không có lint. Không migration/clone production, không bật commerce/Edge/scheduler. Inventory production chỉ đọc để phân biệt ref, không chạy SQL lên production.
- Lấy public URL/key staging, lưu `.env.tank-staging.local` trên máy và Git ignore; không commit key/token. Probe read-only: `/auth/v1/settings` 200, email provider bật; `/auth/v1/user` với token giả trả 403, verifier trả null. **Chưa có session tester thật**, chưa thử Google/OAuth/SMTP.

## Code và kiểm chứng

| Thay đổi | Bằng chứng cục bộ Node 24.22.2/macOS |
|---|---|
| Production config fail closed; exact HTTPS origins; staging chặn ref production; Auth registered + allowlist UUID, cache ≤60 s/exp, không dùng metadata cấp quyền | 9 bài operations mới + các WS cũ: **15/15** tổng; timeout/offline/bad JSON/anonymous/unlisted/expired đều từ chối |
| Cap socket, public health tối giản, metrics token + no-store; TLS proxy chỉ `/tank`/`/health` | Test cap đủ→503→giải phóng→nhận lại, origin thiếu/null/local/foreign→403; metrics 401/200 nội bộ |
| SIGTERM báo maintenance, xóa queue/ghế/result; restart mất RAM và resume cũ bị từ chối | Test restart thật, instance đổi, `ROOM_NOT_FOUND`, close idempotent; qua proxy WS close 1012; log lifecycle/result/resume không chứa access/seat token |
| Bỏ Set giữ mọi match ID lịch sử; giữ once-only theo result phòng sống; diagnostics chỉ counts | Core **66/66**, test:fast qua; kết quả bốn client/queue/rematch cũ giữ nguyên; chưa durable dedup DB |
| Preflight, release tối giản và cấu hình `deploy/` | Isolated release khởi động chỉ với 13 file ship + `ws`; từ chối file thừa, env mẫu và secret/admin key. Caddy 2.11.7 chính thức validate qua; trusted local WSS/health/origins/metrics404/restart qua, CA chỉ trong test |
| Hồi quy client sau xử lý maintenance | Chrome macOS UI **9/9**, lint/build/bundle/test:fast qua. Không đổi DOM/layout hay protocol |

Template systemd chưa chạy trên Linux/VPS; local TLS không chứng minh public DNS/ACME/cert renewal. Gói `deliverables/tank-clash-server/` và manifest do `npm run prepare:tank-server` sinh; không deploy. Hướng dẫn duy nhất: [TC2-RUNBOOK](TC2-RUNBOOK.md).

## Soak cục bộ

**Mốc 04/11 `a8d472b`: đạt 1.802,3 giây thực** (30 phút), Node server riêng process + client loopback dùng fixture, không gọi Supabase. Kết quả gốc do script sinh: [TC2-loopback-2026-11-04.json](evidence/TC2-loopback-2026-11-04.json); digest đã đối chiếu nguồn server/engine/client/harness tại thời điểm đo. Không dùng digest cũ để xác nhận các thay đổi profile/metrics 05/11.

| Số đo | Kết quả |
|---|---|
| Trận kết thúc tự nhiên, mọi client cùng kết quả | 204 trận 1v1; 167 trận 2v2, gồm 83 queue |
| Mức tải thực đo cao nhất | 48 socket / 14 phòng; mục tiêu tối đa 60/20 chưa đạt do tạo tuần tự và trận kết thúc nhanh |
| Server RSS cao nhất / CPU interval cao nhất | 177,3 MiB / 17,4% một core, trên Mac arm64 10 CPU |
| Event-loop p95 tích lũy | 21,82 ms, histogram resolution 20 ms; không phải RTT Internet |
| Sau đóng hết client | 0 room/peer/user/queue/queued user, 0 socket; listener giữ nguyên 2 |
| Số mẫu giữ trong RAM tính summary | 142; có GC cưỡng bức giữa mẫu; không có failure |

Mục tiêu tải 2→5→10 phòng mỗi format rồi giảm về 2; giữ 60 Hz input/20 Hz snapshot, không tăng tốc đồng hồ hay ép HP/kết quả. JSONL đầu đã bị Playwright dọn chung thư mục ở khoảng giây 346; summary cuối tính từ **đủ 142 mẫu trong RAM**, stdout giữ tiến trình phút, JSONL còn lại chỉ là trace một phần, không dựng lại mẫu mất. Đã ghi cách tách output trong runbook. Không dùng số Mac/loopback này làm giới hạn VPS, phép đo Auth thật hay nghiệm thu hai mạng.

## Bước tiếp theo

1. Chủ dự án duyệt/kết nối tài khoản backend pilot (#9): Render Free đã có Blueprint; chưa có VPS hoặc service public. Không mua VPS/domain bằng phê duyệt tiếp tục làm code.
2. Có 4 tài khoản Auth staging đã xác nhận, người vận hành và review harness đăng nhập. Connector hiện không có API quản lý Auth users; chưa có credential tester/admin dùng cho việc tạo user. Không gửi thư signup thử hoặc đưa admin key vào app để vượt bước này.
3. Triển khai pilot một process sau duyệt hosting; origin/WSS/public env đúng staging, thử 2–4 session thật, invalid/expired/duplicate/spectator/reconnect và log không token.
4. ≥10 trận mỗi format trên hai thiết bị/hai mạng + ≥30 phút soak VPS, đo RTT/correction/bandwidth/CPU/RAM và restart/rollback theo runbook. Sau đó mới đánh dấu TC2 đạt và mở TC3.

Không merge/main/deploy Netlify trong đợt này. [Bản guest cục bộ dùng server TC2](http://localhost:4338/?server=ws%3A%2F%2F127.0.0.1%3A3224%2Ftank) kiểm ngày 04/11: HTML/health 200 và create/join/leave thật; không khẳng định process còn sống vào phiên sau. Đây không phải hosting staging công khai hoặc login thật.
