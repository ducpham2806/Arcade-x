# Tank Clash P2 — chuẩn bị staging, 03/11/2026

Nhánh `feat/tank-clash-p2-staging-readiness`, tách từ main `2d6b33eb8e48cafa0844b5cea6dc2b30ee546e9b`. Phần triển khai được phép đã hoàn tất ở mức code/kiểm tra cục bộ; **P2.5 deploy và P2.6 nghiệm thu Internet chưa xong**. P3 2v2/matchmaking chưa bắt đầu. Art và tuning vẫn là bản tạm.

## Hành vi mới

- `tank-clash.p2.v2`: mỗi hiệp có epoch match+round; input cũ không lọt sang hiệp mới. Snapshot/start cũ không phục hồi gạch đã phá hoặc tua lùi đồng hồ. Ready/leave có opId, ack và bộ biên nhận giới hạn; lệnh ready của trận trước không biểu quyết cho trận sau.
- Hàng input client tối đa 240, queue server 30/credit 30, bù tối đa 2 input/nhịp; không phát lại thao tác lái/bắn đã giữ khi mất mạng. Client phát hiện stream im lặng/treo handshake, chủ động bỏ socket cũ và resume với backoff, hết cửa sổ 20 giây thì báo lỗi. Timer và queue được dọn khi đóng.
- Shutdown hủy trận đang chơi đúng một lần, không xử thắng giả; cả hai client nhận kết quả hủy rồi thông báo bảo trì, dừng tự nối lại. Room state trong RAM không sống qua restart.
- Adapter lấy phiên tài khoản Arcade-x đã đăng ký, refresh gần hết hạn; không sign-in anonymous hoặc ghi bảng game. Khi cấp token, URL phải trùng endpoint WSS tin cậy, không đi theo URL tùy ý trong link mời. JWT không nằm trong sessionStorage; dữ liệu ghế v2 có protocol và endpoint.
- Server gọi Supabase `/auth/v1/user`, timeout 4 giây, cache tối đa 15 giây và không vượt JWT expiry, gộp request cùng token, giới hạn cache/inflight. Quyền theo user ID đã xác minh; metadata chỉ dùng tên. Production bắt buộc Auth và allowlist tester, từ chối anonymous/secret/service-role. Bỏ bypass `TANK_ALLOW_GUESTS`.
- Preview staging có form đăng nhập tài khoản được cấp, không signup, phiên ở RAM. Server tùy chọn phục vụ HTML cùng origin, inject public Auth config đã escape, có CSP và readiness. File HTML tải xuống không chứa cấu hình/tài khoản thật. React online vẫn tắt và game chưa đăng ký launcher/catalog.
- Gói vận hành `deploy/tank-clash/`: Dockerfile Node 24, build context có allowlist, runtime non-root, Compose/Caddy TLS, env mẫu, Render Blueprint một instance/tắt auto deploy. Không thêm npm dependency, không deploy, không migration hoặc ghi Supabase production.

## Kiểm chứng trong lượt này

| Phép kiểm | Kết quả | Giới hạn |
|---|---|---|
| `npm run test:tank-clash` | 39/39 qua: engine, lifecycle, mạng ảo và 12 ca readiness | Mạng ảo không thay Internet |
| `npm run test:tank-clash-server` | 12/12 qua: WS thật, auth giả, transport lỗi, shutdown, static injection | Auth fetch giả, chưa đăng nhập staging thật |
| TypeScript, build Vite, bundle budget | Qua | Chưa chạy toàn bộ browser CI game khác |
| `npm run test:fast` | Qua toàn bộ, exit 0; bước Tank Clash cuối 39/39 | SQL chạy PGlite, không Supabase production |
| Browser CUA, hai tab qua WS thật | Tạo/vào mã, ready/countdown, đúng ghế A/B, reload B giữ ghế+HP, B rời trận → A thắng do forfeit | Hai tab cùng host; không phải hai người/thiết bị/mạng; browser cloud có lúc ~1 FPS |
| 16 phòng / 32 WS, 60 giây thực | 12,31 KiB/s/client JSON outbound; RSS 206,22 MiB; CPU 13,57%; event-loop p95 10,81 ms | Server+generator cùng process/host, loopback không TLS; không suy capacity VPS |
| Soak đồng hồ mô phỏng 1.800 giây, 8 phòng | 240 trận, 29 resume, dọn 0 phòng; heap 12.368.096 → 13.070.064 byte khi có GC | Chạy nhanh trong ~4,93 giây; **không phải soak 30 phút thời gian thực** hoặc chứng minh không leak |
| Compose/Render YAML | Parse qua, đọc soát cấu hình | Không có Docker CLI: chưa build/run image, Caddy/TLS hoặc validate Blueprint qua tài khoản Render |

Các test mới có ý nghĩa: token không được gọi cho endpoint lạ; refresh và anonymous rejection; Auth allowlist không bị metadata giả vượt; expiry/inflight/timeout; envelope/prototype invalid; epoch qua reset; snapshot/start cũ; duplicate ready/rematch; shutdown once-only; storage ràng buộc endpoint và không JWT; fresh token mỗi resume; stream im lặng dù close handshake treo; connect timeout và resume invalid không tự tạo phòng; maintenance cả hai client; origin; phục vụ file whitelist/escape script/CSP/readiness.

Lệnh tái lập load (sau `npm ci` và dependency server):

```bash
npm run test:tank-clash-load -- --rooms 16 --seconds 60 --output /tmp/tank-load.json
npm run test:tank-clash-load -- --virtual --rooms 8 --seconds 1800 --output /tmp/tank-virtual-soak.json
```

JSON số đo gốc và log cuối được lưu trong gói `Tank_Clash_P2_Readiness_Test_Log.md` cùng bản bàn giao. Không đăng nhập tài khoản thật, không ghi token/mật khẩu trong gói này.

## Việc làm tiếp đúng thứ tự

1. Duyệt host/ngân sách/domain và hai tài khoản staging có UUID. Runbook có đề xuất VPS Singapore 2 GiB/1 vCPU 12 USD/tháng, phương án nhỏ 6 USD/tháng hoặc Render cần báo giá cụ thể. Chưa đăng ký.
2. Build/run image và kiểm HTTPS/WSS trên staging; kiểm denied user, signed-out/anonymous, refresh và resume bằng hai phiên thật. Token endpoint phải được pin; không bật catalog/flag production.
3. Ít nhất 10 trận hai người/hai thiết bị/hai mạng; kiểm lock/blur/đổi mạng, stale input, HP/kết quả/forfeit/rematch, lag compensation; soak 30 phút thực, RSS/CPU và cleanup/restart trên host.
4. Sau bằng chứng P2 mới chuyển P3 (2v2, party, queue/map đội). Thống kê đóng góp riêng A/B, tường theo revision+ack, persistence kết quả/entitlement/thưởng, art/audio và launcher vẫn chưa làm. Snapshot v2 hiện vẫn dựa WS có thứ tự, gửi tường đầy đủ khi thay đổi và khi resume; chưa port wall revision từ nhánh cũ.

Chi tiết môi trường, lệnh và nghiệm thu: `STAGING-RUNBOOK.md`. Plan v1.4 §16 là điểm tiếp quản hiện tại; §15 ghi baseline hợp nhất trước mốc này. Không dùng HTML/wire v1 với server v2; tải lại cả hai, storage ghế v2 tự bỏ qua key v1. Chỉ publish nhánh làm việc trong lượt tiếp tục này; merge main khi chủ dự án yêu cầu theo CLAUDE.md.
