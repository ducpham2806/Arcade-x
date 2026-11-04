# TC2 — staging và vận hành Tank Clash

Phạm vi: một Node 24 giữ phòng/hàng chờ trong RAM, wire `tank-clash.p3.v1`. Checklist nghiệm thu ở [PROJECT-PLAN](../PROJECT-PLAN.md#tc2--hosting-tài-khoản-mạng-thật); bằng chứng cục bộ ở [TC2-review](TC2-review.md). File này là hướng dẫn triển khai **sau duyệt hosting**, không tự kích hoạt Netlify hoặc production.

## 1. Hosting đề xuất · kiểm giá 04/11/2026

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

Preflight không in key/token/UUID. Production mode từ chối guest flags, thiếu Auth/tester UUID/metrics token, origin wildcard hoặc HTTP. `TANK_ENV=staging` chặn project production. Giữ `HOST=127.0.0.1`, port 3223 không public. Firewall chỉ cho 80/443 và SSH giới hạn người vận hành; không mở 3223.

Frontend thử dùng env build riêng:

```dotenv
VITE_SUPABASE_URL=https://STAGING_REF.supabase.co
VITE_SUPABASE_PUBLISHABLE_KEY=STAGING_PUBLIC_KEY
VITE_TANK_CLASH_SERVERS=wss://DOMAIN_DA_DUYET/tank
```

Frontend origin phải đúng từng giá trị HTTPS trong `TANK_ALLOWED_ORIGINS`; WS URL phải đúng allowlist frontend (cả path). Link mời host lạ không nhận access token. `.env.tank-staging.local` đã có URL/public key trên máy này, bị Git ignore; `TANK_EXPECTED_STAGING_REF=khqipuipeawzlkqmdzdg npm run test:tank-clash-staging` chỉ kiểm Auth read-only, không signup/gửi email. File không chuyển sang máy khác qua Git; lấy public key từ dashboard staging khi cần.

Standalone HTML hiện tại **không có login**, chỉ duyệt khách cục bộ; launcher chưa đăng ký Tank trong `LOCAL_REVIEW_GAME_IDS`/registry. Nghiệm thu Auth/game thật cần review harness đăng nhập hoặc bước tích hợp staging riêng, không bật catalog production. Không đổi `.env` production để thử.

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
