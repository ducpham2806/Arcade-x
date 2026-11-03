# Tank Clash P2 — staging WSS một instance

Cập nhật 03/11/2026 · wire `tank-clash.p2.v2`. Đây là gói triển khai đã chuẩn bị, **chưa deploy**. Không dùng Supabase production `whjatkhhupeqfngakmee`. Không cần migration, service-role key hoặc kết nối database. Xem `PLAN.md` §16 và `P2-staging-review-2026-11-03.md` cho phạm vi đã kiểm.

## Phương án cụ thể để duyệt

Đề xuất một VPS Singapore, Node 24 trong Docker, Caddy cấp HTTPS, cùng host phục vụ HTML và `wss://<domain>/tank`. Một instance duy nhất giữ phòng trong RAM; tắt autoscale và mọi deploy tự động trong đợt thử. Chọn VPS 2 GiB để có dư bộ nhớ cho OS/proxy; đây là ước lượng vận hành, chưa đo công suất trên VPS.

| Phương án | Giá tham khảo 03/11/2026 | Phần cần vận hành | Trạng thái |
|---|---|---|---|
| DigitalOcean Basic 1 GiB / 1 vCPU / 25 GiB SSD / 1.000 GiB transfer | 6 USD/tháng | Docker, DNS, TLS, cập nhật máy; ít dư bộ nhớ | Phương án tiết kiệm, chưa đăng ký |
| DigitalOcean Basic 2 GiB / 1 vCPU / 50 GiB SSD / 2.000 GiB transfer | 12 USD/tháng | Như trên, dư bộ nhớ hơn | Đề xuất cho staging, chờ chủ dự án chọn/ngân sách |
| Render Starter, Singapore, Docker, một instance | Cần lấy báo giá trong tài khoản trước khi chọn | Dịch vụ quản lý HTTPS/WS và lifecycle; vẫn phải xử lý restart | Blueprint kèm theo, chưa tạo dịch vụ |

Giá VPS chưa gồm thuế, tên miền, backup và dịch vụ Supabase staging. Chưa mua hay tạo bất kỳ tài nguyên phát sinh phí nào. Nguồn: [DigitalOcean Droplet pricing](https://www.digitalocean.com/pricing/droplets). Không suy ra giới hạn người chơi từ phép thử loopback.

## Đầu vào cần có trước khi triển khai

- Chủ dự án chọn nhà cung cấp, ngân sách và duyệt bản/đợt staging cụ thể.
- Domain staging trỏ đúng host; quyền cấu hình DNS/chứng chỉ.
- Project Supabase **staging riêng**, URL và publishable key (legacy anon key vẫn hỗ trợ); hai tài khoản đã đăng ký khác nhau và UUID tương ứng. Không tạo anonymous user, không tự suy quyền từ `user_metadata`.
- Allowlist origin HTTPS chính xác và tester UUID. Không dùng wildcard, không thêm origin `null` trên host công khai, không dùng guest bypass.
- Hai người/hai thiết bị thật, tối thiểu hai đường mạng để nghiệm thu. Mật khẩu không đặt trong source, env server hoặc log.

## VPS + Compose (chỉ chạy sau khi đủ đầu vào)

Docker Engine/Compose và DNS phải được người vận hành thiết lập trước. Các lệnh dưới đây thay thế source trên host staging, không phải lệnh đã thực thi trong phiên phát triển.

```bash
# Từ checkout đầy đủ của nhánh đã duyệt, tại thư mục gốc repo:
cp deploy/tank-clash/.env.example deploy/tank-clash/.env
# Sửa .env ở máy triển khai; chỉ có URL/public key/tester UUID, không có service-role.
chmod 600 deploy/tank-clash/.env
docker compose --project-directory deploy/tank-clash -f deploy/tank-clash/compose.yml config --quiet
docker compose --project-directory deploy/tank-clash -f deploy/tank-clash/compose.yml build --pull
docker compose --project-directory deploy/tank-clash -f deploy/tank-clash/compose.yml up -d
```

File `Dockerfile.dockerignore` chỉ cho source Tank Clash, accessibility, export script và lockfiles vào build context; không chuyển `.env`, node_modules, art hoặc toàn launcher. Runtime non-root, read-only, bỏ capabilities; tank giới hạn 512 MiB/1 CPU, cổng 3223 chỉ ở network nội bộ. Public chỉ 80/443 của Caddy. Compose không phải firewall; host vẫn cần firewall đúng và chính sách cập nhật OS. Dockerfile đã được đọc và YAML đã parse; **image, Compose, Caddy và TLS chưa chạy trong phiên này vì không có Docker CLI**.

| Biến | Giá trị / ý nghĩa |
|---|---|
| `NODE_ENV` | `production` (image đặt sẵn); thiếu Auth hoặc tester UUID thì không khởi động |
| `HOST`, `PORT` | `0.0.0.0`, `3223` trong container; Render tự cấp `PORT` |
| `TANK_DOMAIN`, `ACME_EMAIL` | Domain và địa chỉ liên hệ chứng chỉ của chủ dự án, chỉ proxy cần |
| `TANK_ALLOWED_ORIGINS` | Ví dụ `https://tank-staging.example.com`; danh sách cách nhau dấu phẩy, không có path |
| `SUPABASE_URL` | URL HTTPS project staging riêng |
| `SUPABASE_PUBLISHABLE_KEY` | Public publishable key; `SUPABASE_ANON_KEY` chỉ là alias legacy. Không dùng `sb_secret_`/service_role |
| `TANK_ALLOWED_USER_IDS` | UUID đã được Supabase `/auth/v1/user` xác minh, ngăn cách bằng dấu phẩy; production bắt buộc có ít nhất một |
| `TANK_STATIC_DIRECTORY` | Image đặt `/app/preview/tank-clash`; server chỉ phục vụ `/` và `/index.html` |

`TANK_ALLOW_GUESTS` không còn là ngoại lệ production. `TANK_REVIEW_MODE=1` chỉ dùng dev non-loopback có origin cụ thể trong kiểm tra cục bộ; không đưa biến này vào staging.

Server inject public Auth config vào HTML bằng JSON đã escape, không inject JWT/refresh token. Bản tải xuống không có cấu hình Auth. Trang staging có form email/mật khẩu, không signup, phiên chỉ giữ trong RAM của tab; reload cần đăng nhập lại trước khi resume. Client chỉ gửi JWT tới endpoint WSS chính xác do cấu hình đặt, không theo `server=` từ link mời khi dùng tài khoản. React adapter mặc định `online-config.json.enabled=false` và chưa nằm trong catalog.

## Render thay thế

Dùng `deploy/tank-clash/render.yaml` làm Blueprint sau khi chủ dự án duyệt dịch vụ/gói và báo giá. Đặt đủ biến `sync:false`, origin đúng URL HTTPS của dịch vụ. `autoDeployTrigger: off`, `numInstances: 1`, health path `/ready`; không thêm autoscale. Chưa tạo service hoặc nhập credential. Render không cam kết nối lại cùng một instance khi scale; kiến trúc hiện tại không hỗ trợ nhiều instance. Tài liệu: [WebSockets](https://render.com/docs/websocket), [Blueprint spec](https://render.com/docs/blueprint-spec).

## Kiểm tra sau deploy và nghiệm thu

1. Mở `/ready` và `/health`: HTTP 200, protocol v2, `ready:true`. Mở `/` qua HTTPS, kiểm WS101 tới đúng `/tank`. Không thử mật khẩu qua HTTP.
2. Hai tài khoản allowlist tạo/vào phòng bằng mã hoặc link và ready; tài khoản ngoài allowlist/anonymous bị từ chối. Không dùng metadata giả làm quyền. Kiểm access token hết hạn/refresh khi resume.
3. Chơi **ít nhất 10 trận** bằng hai thiết bị thật. Ghi RTT, mạng/thiết bị, HP/tỉ số/kết quả hai bên, lái/ngắm/bắn/khiên, reset hiệp, ready/đấu lại, link mời và lỗi.
4. Rời trận, mất mạng 5–15 giây, mất mạng hơn 20 giây, đổi tab, lock màn hình, Wi-Fi → cellular. Xe mất kết nối đứng yên và vẫn trúng đạn. Resume giữ đúng ghế/HP; hết giữ ghế phải hiện lỗi, không tạo phòng thay thế.
5. Soak **30 phút thời gian thực** trên host staging; đo CPU/RSS/event-loop/WS, số phòng còn lại sau khi đóng. Script loopback để đối chiếu: `npm run test:tank-clash-load -- --rooms 16 --seconds 1800 --output /tmp/tank-staging-soak.json`. Chạy generator cùng process chỉ là kiểm hồi quy; muốn đo công suất host/TLS cần generator độc lập qua WSS, chưa có trong script hiện tại.
6. Gửi SIGTERM khi đang đấu: hai client thấy trận hủy/bảo trì, không cấp thắng/thưởng, không tự reconnect vô hạn. `/ready` trả 503 khi draining; server đóng 1012 và cắt socket còn kẹt sau 750 ms. Tạo phòng mới sau restart cần thao tác người dùng. Kết quả cũ chỉ có trong log.
7. Đánh giá cảm giác bắn trúng xe đang chạy trước khi quyết định lag compensation. Chỉ đánh dấu P2.5/P2.6 xong sau khi có log/bằng chứng thực; chưa chuyển P3 dựa trên unit test.

Mẫu ghi: thời gian · build SHA/wire · tài khoản A/B (chỉ UUID rút gọn) · thiết bị/trình duyệt · mạng · RTT · mã trận · kết quả A/B · sự cố · thao tác tái hiện. Không ghi JWT, resume token, mật khẩu hoặc email vào báo cáo chia sẻ.

## Vận hành, cập nhật và rollback

- `/health` chỉ có bộ đếm tổng, không danh sách tài khoản/token; `/ready` dùng cho điều phối. `metrics.rooms/matches/results` là số tạo lũy kế, trường `rooms` top-level là số phòng còn sống.
- Giới hạn ban đầu: 64 phòng, 160 socket, 120 message/s/socket, payload 8 KiB, buffer outbound 64 KiB; socket chưa vào phòng hết hạn sau 60 giây. Đây là chặn tài nguyên, không phải cam kết capacity.
- WebSocket native ping 5 giây; client ping 1 giây, stream im lặng 5 giây chủ động resync, timeout kết nối 8 giây. Giữ ghế 20 giây, reconnect backoff 250 ms tới 3 giây có jitter; thao tác ready/leave retry 600 ms, bỏ sau 10 giây. Không lưu input offline.
- Chỉ update khi hết đợt thử/đã thông báo bảo trì. Lưu commit SHA và image cũ trước khi thay; restart mất toàn bộ phòng trong RAM. Không dùng rolling multiinstance để giả giữ phòng.
- Rollback về commit/image đã duyệt rồi `up -d --build`; toàn bộ client phải tải lại đúng wire. v1 và v2 không tương thích. Key ghế mới `tank-clash.seat:v2` ràng buộc protocol+endpoint; key v1 cũ bị bỏ qua.
- `docker compose --project-directory deploy/tank-clash -f deploy/tank-clash/compose.yml logs --tail 100 tank` để kiểm; không gửi log chứa UUID đầy đủ ra công khai. Không cần `down -v` để update, không xóa volume Caddy chứng chỉ.
- Chưa có persistence kết quả/thưởng/entitlement subscription; không dùng bản này cho thi đấu có thưởng/ranked. Không ghi tick/đạn/vị trí vào database.

Nguồn vận hành: [Caddy reverse_proxy](https://caddyserver.com/docs/caddyfile/directives/reverse_proxy), [Compose services](https://docs.docker.com/reference/compose-file/services/), [Supabase getUser](https://supabase.com/docs/reference/javascript/auth-getuser), [password sign-in](https://supabase.com/docs/reference/javascript/auth-signinwithpassword). Đã đọc changelog Supabase ngày 03/11/2026; mục CBC TLS deprecated (12/10, hiệu lực sớm nhất 10/11) không yêu cầu đổi runtime Node 24 hiện đại theo suy luận từ yêu cầu TLS, vẫn kiểm TLS thật sau deploy.
