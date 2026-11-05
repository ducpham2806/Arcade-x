# TC2 · bằng chứng và phần còn lại · 04/11/2026

Nhánh `codex/tank-clash-tc2-readiness`, nền `6eb394c`; bằng chứng 04/11 ở `a8d472b`, cập nhật profile hosting 05/11 bên dưới. Chuẩn bị staging/vận hành, **chưa nghiệm thu TC2 trên backend public/thiết bị/mạng thật**. Chưa launcher, entitlement, DB result hoặc phát hành; bản duyệt gameplay vẫn [P3-review](P3-review.md).

## Cập nhật 05/11 — backend public và trang review

- Chủ dự án xác nhận chỉ dùng Netlify, chưa VPS. Đọc public URL `https://arcade-x.netlify.app/`: HTTP 200, title ArcadeX. Đã xác định đúng site qua Netlify connector **NamA**, site `2f4bcb1f-79f5-47ca-b836-61a11a799195`; connector mang tên Arcade-x đang liệt kê site khác nên không dùng để sửa site này. Không sửa env/deploy/site settings.
- `50c7b36` đã push nguyên lịch sử qua GitHub Desktop (terminal HTTPS chưa có credentials; không đọc token/key); upstream theo đúng nhánh. Netlify hiện vẫn deploy `6aeaa023dbc469c9cfe7b896`, không có deploy đang chạy, không đổi site/env/main.
- Đã tạo [service Render Free](https://dashboard.render.com/web/srv-dbm1r9t6e07s73asmulg), Singapore/Node24/một process, cap 16, deploy thủ công; [Blueprint](https://dashboard.render.com/blueprint/exs-dbm1otpsrm7s73eq9dc0) Auto Sync chuyển No. Backend Live từ `50c7b36`, build/deploy 1m03s; public HTTPS `https://arcadex-tank-staging.onrender.com`, WSS `/tank`.
- Smoke public: `/health` 200 đúng protocol/metadata tối giản, `/metrics` 404, TLS certificate WSS được xác minh; origin thiếu/null/giả mạo 403; token giả nhận đúng `AUTH_FAILED`. Đây là kiểm âm, chưa trận thật/đo tải Render. Chủ dự án đã tự tạo 4 Auth user staging; SQL đọc xác nhận cả bốn `is_anonymous=false`, email confirmed; không lưu mật khẩu/UUID thực vào repo.
- Trang `/review` có đăng nhập Supabase staging, session RAM riêng từng tab, refresh, logout rời phòng/queue và xóa resume; backend cố định dù link mời có `server` lạ. Hai route review opt-in/staging-only, config chỉ public URL/key. Code/test đã xong; **chưa cập nhật runtime Render cho trang này tại mốc ghi code**.
- Qua Node24: lint/build/bundle, 17 WS/ops, 11 Chrome UI; 4 phiên SDK thật với Auth HTTP fixture + 4 socket thật tạo trận 2v2, thêm login sai/logout/đổi tài khoản/không lưu JWT/link mời; không gọi Supabase thật trong UI test. Blueprint valid schema Render Draft2020-12 + URI formats. Chưa dùng mật khẩu thật để chạy trận/soak trên Render.
- Quy trình chi tiết ở runbook §1. Nhánh push có `[skip netlify]`; không merge/main/Netlify deploy, không `[skip ci]` hoặc nới test. Các lượt test đầu dùng sai tên nút 1v1 đã sửa locator theo UI thật, giữ tiêu chí kiểm phòng/ghế.

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

1. Đồng bộ Blueprint/cập nhật trang review trên service Free; giữ Auto Sync No và kiểm đúng commit/health/WSS/config sau deploy. Không nâng plan/thêm chi phí.
2. Chủ dự án đăng nhập bằng tài khoản tester trực tiếp ở review; không gửi mật khẩu/JWT qua chat. 4 tài khoản đã xác nhận, còn nghiệm thu phiên thật/người vận hành.
3. Triển khai pilot một process sau duyệt hosting; origin/WSS/public env đúng staging, thử 2–4 session thật, invalid/expired/duplicate/spectator/reconnect và log không token.
4. ≥10 trận mỗi format trên hai thiết bị/hai mạng + ≥30 phút soak VPS, đo RTT/correction/bandwidth/CPU/RAM và restart/rollback theo runbook. Sau đó mới đánh dấu TC2 đạt và mở TC3.

Không merge/main/deploy Netlify trong đợt này. [Bản guest cục bộ dùng server TC2](http://localhost:4338/?server=ws%3A%2F%2F127.0.0.1%3A3224%2Ftank) kiểm ngày 04/11: HTML/health 200 và create/join/leave thật; không khẳng định process còn sống vào phiên sau. Đây không phải hosting staging công khai hoặc login thật.
