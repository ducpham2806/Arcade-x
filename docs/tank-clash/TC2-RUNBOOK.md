# TC2 — staging và vận hành Tank Clash

Phạm vi: một Node 24 giữ phòng/hàng chờ trong RAM, wire `tank-clash.p3.v1`. Checklist nghiệm thu ở [PROJECT-PLAN](../PROJECT-PLAN.md#tc2--hosting-tài-khoản-mạng-thật); bằng chứng cục bộ ở [TC2-review](TC2-review.md). File này là hướng dẫn triển khai **sau duyệt hosting**, không tự kích hoạt Netlify hoặc production.

## 1. Hosting đề xuất · kiểm giá 04/11/2026

**Cập nhật 05/11:** chủ dự án xác nhận **chưa có VPS**, frontend `https://arcade-x.netlify.app`; đã duyệt Render Free, đăng nhập và tự tạo 4 tester staging. **[Bản review có đăng nhập](https://arcadex-tank-staging.onrender.com/review)** đã Live ở `3950abb`; một tester thật tạo/rời phòng qua, chi tiết [TC2-review](TC2-review.md). Không duyệt thuê máy/nâng plan/chi phí vượt quota. Các giá VPS dưới đây chỉ là phương án tham khảo cũ.

`arcade-x.netlify.app` là [subdomain mặc định của site Netlify](https://docs.netlify.com/manage/domains/domains-fundamentals/understand-domains/); dùng làm **frontend origin**, không thay cho địa chỉ VPS hoặc hostname backend. Cặp cấu hình cần hoàn tất:

| Thành phần | Giá trị hiện biết |
|---|---|
| Frontend được server chấp nhận | `TANK_ALLOWED_ORIGINS=https://arcade-x.netlify.app` |
| Backend pilot đã có | `wss://arcadex-tank-staging.onrender.com/tank` |
| Allowlist token ở frontend thử | `VITE_TANK_CLASH_SERVERS` = URL WSS backend ở trên; chưa điền domain frontend vào đây |

Chỉ thêm origin của bản review staging khi biết URL chính xác; không dùng `*.netlify.app`, không tự cho mọi Deploy Preview. Bản local hiện tại vẫn chỉ gọi loopback. Việc đưa URL frontend production vào template **không đổi Supabase/build/biến môi trường của website đang chạy**.

### Render Free — đã triển khai pilot

[Blueprint](../../render.yaml) chỉ tạo **một web service Free**, không database/disk/add-on; Singapore, Node 24, một process, cap pilot 16 socket, `autoDeployTrigger: off`. Đây chưa phải năng lực đã đo trên Render. Build cài dependency để bundle review và chạy server; không build/deploy frontend Netlify.

Theo [giới hạn Free](https://render.com/docs/free), service ngủ sau 15 phút không có HTTP/WS inbound, khởi động lại khoảng một phút, có thể bị restart và mất phòng/queue RAM. Quota miễn phí theo workspace; vượt bandwidth/build có thể phát sinh phí nếu workspace đã có phương thức thanh toán. Chưa có ngân sách trả phí: không thêm card, nâng plan hoặc bật chi tiêu vượt quota để hoàn tất pilot.

Sau khi chủ dự án duyệt/kết nối tài khoản Render:

1. New → Blueprint, chọn repo `ducpham2806/Arcade-x`, nhánh `codex/tank-clash-tc2-readiness`, file `render.yaml`; kiểm chỉ có service Free, tắt Blueprint auto-sync trong dashboard để thay đổi cấu hình không tự áp khi push.
2. Nhập `SUPABASE_PUBLISHABLE_KEY` của staging và `TANK_ALLOWED_USERS` là UUID tester đã xác nhận. Blueprint sinh metrics token; không nhập database/service-role key. Tester chưa có thì hoàn tất Auth staging trước, không điền UUID giả để vượt preflight.
3. Render tự đặt `RENDER=true`; preflight chỉ chấp nhận `HOST=0.0.0.0` ở profile này khi HTTP metrics đã tắt (`TANK_METRICS_ENABLED=0`). VPS giữ nguyên bắt buộc loopback/Caddy. Auth/allowlist/guest flags vẫn kiểm như nhau.
4. Lấy URL **thật** `https://<service>.onrender.com`, kiểm `/health` 200, `/metrics` 404 kể cả có token; WSS `wss://<service>.onrender.com/tank`. [Render hỗ trợ WS và TLS](https://render.com/docs/websocket); không tự chế hostname từ tên dự kiến.
5. Cập nhật allowlist token vào build **review staging** riêng khi có WSS và origin review chính xác; chưa đổi cấu hình/live site `arcade-x.netlify.app`. Chạy tài khoản/trận/mạng/soak thật theo §4–§5; Free chỉ thử nghiệm, không nghiệm thu production bằng số đo Mac.

Không có Render connector; dùng browser để cấu hình sau khi chủ dự án duyệt và đăng nhập. Quyền đọc repo/điều khoản phát sinh xử lý tại đúng bước, không tự cấp thêm quyền hoặc chấp nhận điều khoản thay chủ dự án.

### Trang review riêng trên Render

`/review` được bật bằng `TANK_REVIEW_ENABLED=1` **chỉ với `TANK_ENV=staging`**. Build chạy `npm run export:tank-staging`, output `deliverables/tank-clash-staging-review.html` do script sinh, không commit. `/review/config` chỉ trả URL + publishable key staging, no-store; không trả UUID allowlist/metrics token/password. Khi tắt cờ, hai route đều 404. Cấu hình Render tự thêm đúng `RENDER_EXTERNAL_URL` HTTPS vào origin allowlist; không wildcard hoặc trỏ frontend production sang staging.

Trang dùng SDK Supabase, chỉ đăng nhập bằng 4 tài khoản thử đã cấp; không signup/gửi email/cấp thưởng/lưu kết quả DB. Session Auth chỉ trong RAM từng tab, tự refresh; không lưu password/JWT/refresh token vào localStorage. Đăng xuất rời phòng/queue rồi xóa thông tin ghế, đổi tài khoản không dùng resume cũ. Reload cần đăng nhập lại; cùng tài khoản có thể resume trong cửa sổ giữ ghế. Backend cố định theo origin của trang, link mời không đổi nơi nhận JWT.

Để thử 2v2: mở 4 tab/thiết bị, đăng nhập 4 tài khoản khác nhau → Online → một người tạo phòng 2v2 → ba người nhập mã → cả bốn sẵn sàng. Xem trạng thái deploy/URL thật ở TC2-review trước gửi link. Sau code push, giữ Auto Sync **No** và deploy thủ công; mỗi lần redeploy mất phòng RAM.

| Phương án Singapore | Tài nguyên / giá cơ bản | Nhận định cho pilot |
|---|---|---|
| DigitalOcean Basic Regular | 1 vCPU, 2 GiB RAM, 50 GiB SSD, 2.000 GiB transfer; **12 USD/tháng** | Đề xuất; tự vận hành Ubuntu + Node + Caddy. Chưa đo trên VPS này. |
| DigitalOcean tối giản | 1 vCPU, 1 GiB, 25 GiB SSD, 1.000 GiB; 6 USD/tháng | Có thể thử nhỏ; cần chỉnh giới hạn RAM và đo cùng OS/proxy. |
| Render Standard | 1 CPU, 2 GiB; 25 USD/tháng compute | Ít quản trị OS, TLS sẵn; bandwidth/workspace tính riêng. Chưa có template Render đã thử. |

Nguồn chính thức: [DO giá](https://www.digitalocean.com/pricing/droplets), [Singapore SGP1](https://docs.digitalocean.com/platform/regional-availability/), [DO billing/transfer](https://docs.digitalocean.com/products/droplets/details/pricing/), [Render giá](https://render.com/pricing), [regions](https://render.com/docs/regions), [WS](https://render.com/docs/websocket). Giá chưa thuế/domain/backup/Supabase; DO dư transfer 0,01 USD/GiB, tắt máy vẫn tính tiền. Xóa máy mới dừng compute billing; giữ bản release/config cần thiết trước xóa.

Một instance duy nhất; không PM2 cluster/autoscale: phòng/queue không chia sẻ giữa tiến trình. Không dùng static hosting hoặc Edge Function để giữ WS. 64 socket là **giới hạn pilot cấu hình**, chưa là cam kết năng lực VPS. 20 KB/s/client × 60 client liên tục có thể gần 3,1 TB/tháng: cần đo lưu lượng thật và cảnh báo chi phí, không suy từ test ngắn ra hóa đơn tháng.

## 2. Supabase staging và tài khoản

Project mới `arcade-x-staging`, Singapore, organization Nam A Uniform theo lựa chọn chủ dự án; ref/dashboard/bằng chứng ở [TC2-review](TC2-review.md). Theo [hướng dẫn môi trường riêng](https://supabase.com/docs/guides/deployment/managing-environments). **Không trỏ staging tới `whjatkhhupeqfngakmee`**, không sao chép người dùng/save/production secrets. TC2 chỉ cần Auth; chưa áp toàn bộ migration hay bật commerce, catalog, Edge/scheduler.

Tạo 4 tài khoản tester đã xác nhận trong Auth staging để thử 2v2 (ít nhất 2 cho 1v1); dùng email chủ dự án kiểm soát hoặc admin tạo với `email_confirm: true`, không gửi thư thử tới địa chỉ người khác. Secret/admin key chỉ ở công cụ vận hành, không frontend, release hay log. Thu hồi/xóa tài khoản thử sau đợt theo người vận hành được chỉ định.

Server gọi [Auth `/user`](https://supabase.com/docs/reference/javascript/auth-getuser) để xác minh access token, chỉ nhận `id` trong `TANK_ALLOWED_USERS` và `is_anonymous === false`. `user_metadata` chỉ lấy tên hiển thị. Cache tối đa 60 s và không quá JWT `exp`; thay allowlist/revoke cần restart để hiệu lực ngay. Quyền đang kết nối được giữ đến hết phiên WS; đây là gate tester pilot, **chưa là entitlement/subscription của TC3**.

## 3. Chuẩn bị release và cấu hình

Trên checkout đã kiểm, Node 24:

```bash
npm run prepare:tank-server
tar -czf /private/tmp/arcadex-tank-server.tgz -C deliverables/tank-clash-server .
```

Output chỉ 13 file được chọn + manifest SHA-256/commit/trạng thái working tree. Dùng thư mục sạch; script từ chối file thừa. Không ship `.env`, frontend bundle, account/token hay `node_modules`. Trước phát hành thật, package từ commit sạch (`workingTreeChanges: false`). Sau copy lên VPS, chạy `npm ci --prefix server/tank-clash-room --omit=dev --ignore-scripts` trong release; kiểm Node **24** ở `/usr/bin/node` hoặc sửa unit đúng đường dẫn đã cài.

Tổ chức VPS:

```text
/opt/arcadex-tank/releases/<commit>/    # nguồn package + ws đã cài, root sở hữu
/opt/arcadex-tank/current -> releases/<commit>
/etc/arcadex-tank/staging.env          # root:root, 0600, ngoài release
/etc/systemd/system/arcadex-tank.service
/etc/caddy/Caddyfile
```

Tạo system user không login `arcadex-tank`; release đọc được bởi user này, không cho ghi vào nguồn. Dùng template `server/tank-clash-room/deploy/.env.example`, thay toàn bộ placeholder; metrics token sinh `openssl rand -hex 32`. Chạy trước:

```bash
node --env-file=/etc/arcadex-tank/staging.env scripts/tank-clash/preflight.mjs
```

Preflight không in key/token/UUID. Production mode từ chối guest flags, thiếu Auth/tester UUID/metrics token, origin wildcard hoặc HTTP. `TANK_ENV=staging` chặn project production. **VPS:** giữ `HOST=127.0.0.1`, port 3223 không public; firewall chỉ cho 80/443 và SSH giới hạn người vận hành. **Render:** dùng profile §1 với managed TLS và metrics tắt, không cài systemd/Caddy trên platform.

Frontend thử dùng env build riêng:

```dotenv
VITE_SUPABASE_URL=https://STAGING_REF.supabase.co
VITE_SUPABASE_PUBLISHABLE_KEY=STAGING_PUBLIC_KEY
VITE_TANK_CLASH_SERVERS=wss://DOMAIN_DA_DUYET/tank
```

Frontend origin phải đúng từng giá trị HTTPS trong `TANK_ALLOWED_ORIGINS`; WS URL phải đúng allowlist frontend (cả path). Template server đã có origin frontend chủ dự án gửi ở §1; hostname backend trong Caddyfile vẫn để placeholder đến khi có domain VPS. Link mời host lạ không nhận access token. `.env.tank-staging.local` đã có URL/public key trên máy này, bị Git ignore; `TANK_EXPECTED_STAGING_REF=khqipuipeawzlkqmdzdg npm run test:tank-clash-staging` chỉ kiểm Auth read-only, không signup/gửi email. File không chuyển sang máy khác qua Git; lấy public key từ dashboard staging khi cần.

Standalone P3 HTML cũ **không có login**, chỉ duyệt khách cục bộ; review có login dùng route riêng ở §1. Launcher chưa đăng ký Tank trong `LOCAL_REVIEW_GAME_IDS`/registry. Không bật catalog hoặc đổi `.env` production để thử.

## 4. TLS, khởi động và kiểm sau triển khai

Trỏ DNS hostname đã duyệt vào VPS, cài [Caddy bằng gói chính thức](https://caddyserver.com/docs/install). Thay hostname trong template Caddyfile, kiểm `caddy validate --config /etc/caddy/Caddyfile --adapter caddyfile`; Caddy tự TLS và [upgrade WS](https://caddyserver.com/docs/caddyfile/directives/reverse_proxy). Chỉ proxy `/tank` và `/health`; `/metrics` không qua public proxy. Không bật access log chứa header Authorization. Caddy admin API chỉ loopback.

Copy unit đã kiểm, `systemctl daemon-reload`, `systemctl enable --now arcadex-tank`, rồi reload Caddy. Dùng 1 process duy nhất; `Restart=on-failure`, giới hạn RAM 1 GiB cho máy 2 GiB; journald xoay log theo cấu hình OS. Các lệnh này chỉ thực thi sau khi có VPS/domain và hosting được duyệt.

- HTTPS `/health`: 200, no-store, chỉ `ok/protocol/instance`; `/metrics` public 404. `instance` đổi sau restart.
- WS `/tank`: allowlist origin đúng vào được; thiếu/null/localhost/host khác 403 trong production. Vượt cap trả 503, ghế/kết nối giải phóng rồi nhận lại được.
- Đăng nhập staging: tester vào; token giả/hết hạn/anonymous/user ngoài allowlist bị từ chối. Trùng tài khoản, spectator, ngắt/nối lại giữ đúng ghế/HP; không có access token trong journal.
- Hai máy/hai mạng: ≥10 trận mỗi 1v1/2v2, phòng riêng + queue, bốn kết quả cùng match ID; tab/khóa màn hình/reconnect; RTT/correction/bandwidth. Không đánh dấu xong bằng viewport hay network mô phỏng.

## 5. Theo dõi, soak và sự cố

`journalctl -u arcadex-tank` có lifecycle/result, không ghi JWT/resume token. `/metrics` chỉ lấy loopback bằng Bearer token; dùng biến môi trường/công cụ monitoring để truyền header, không ghi literal vào history hay ticket. Thu thập mỗi 10 s: số room/queue/socket, bytesIn/out, CPU cumulative (tính delta/wall time), RSS/heap, event-loop p95 (độ phân giải histogram 20 ms), retained counts, lỗi; alarm khi health fail, process restart, cap thường xuyên hoặc RAM tăng không hồi sau tải giảm. Chọn ngưỡng VPS sau phép đo, chưa dùng số Mac làm SLA.

Benchmark cục bộ (Node server riêng tiến trình, fixture không gọi Auth):

```bash
npm run test:tank-clash-server
npm run test:tank-clash-soak -- --duration=1800 --peak=10
# Optional: official Caddy binary, local CA trusted only inside the test.
CADDY_EXECUTABLE=/path/to/caddy npm run test:tank-clash-proxy
```

Mục tiêu tải tăng 2→5→10 phòng **mỗi format**, giảm về 2; số đồng thời thực đo có thể thấp hơn do tạo phòng tuần tự và trận kết thúc tự nhiên; client lái/ngắm/bắn 60 Hz, ping, hoàn tất tự nhiên, đối chiếu mọi kết quả. Report JSON + JSONL ở `test-results/tank-tc2-soak*`; không chạy Playwright dọn chung `test-results` trong lúc đo (hoặc dùng `--output=/private/tmp/tank-soak.json`); source digest gắn nguồn đo. Cuối test không còn room/peer/user/queue/socket và listener không tăng. GC cưỡng bức giữa mẫu để kiểm phần giữ sống, vẫn ghi RSS; không coi heap hạ là chứng minh mọi tình huống không rò. Chạy lại trên VPS và ≥30 phút không fixture Auth trước nghiệm thu TC2.

Restart/deploy/rollback **mất mọi phòng/hàng chờ RAM**; không có phục hồi giữa process. Báo bảo trì, ngừng nhận người mới ở cổng review, chờ trận hết hoặc ghi rõ chấp nhận mất ván. SIGTERM gửi `ROOM_CLOSED`, client xóa ghế/queue/result rồi thoát; process lỗi đột ngột dùng reconnect và nhận phòng không còn. Không cấp thưởng theo trạng thái client.

Rollback: giữ release cũ và env tương thích wire; dừng service, đổi `current` về release trước, chạy preflight, start, kiểm health/instance/Auth/1 trận. Giữ log sự cố, không rollback DB vì TC2 không migration. Nếu lỗi Auth/origin/unknown token, dừng pilot và kiểm env đúng staging, không mở guest hoặc wildcard để chữa tạm. Không tự restart liên tục để che rò RAM; lưu mẫu cuối và tái hiện trước sửa.
