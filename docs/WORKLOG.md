# Nhật ký công việc (bắt buộc)

Quy tắc của chủ dự án (02/11/2026): **mọi việc Claude làm xong đều phải ghi vào file này**, ngay khi xong từng phần (không đợi cuối session), và commit cùng thay đổi đó. Mục mới nhất ở trên cùng.

Mỗi mục ghi: ngày, nhánh, việc đã làm, file chính, lệnh test đã chạy và kết quả thật, phần chưa làm hoặc còn rủi ro. Tóm tắt dài hạn nằm ở `docs/SESSION-HANDOFF.md`; việc chủ dự án cần làm ở `docs/OWNER-TODO.md`.

---

## 03/11/2026 · nhánh `feat/tank-clash-p2-staging-readiness` — P2 chuẩn bị staging (hoàn tất code/kiểm cục bộ)

- Port lên bộ PR #13: protocol v2, epoch theo hiệp, giới hạn input chưa ack, kiểm snapshot cũ, biên nhận ready/leave chống lặp, timeout/silence/backpressure và nối lại có giới hạn; không phát lại input offline. Shutdown hủy trận một lần, thông báo bảo trì và dọn phòng; auth đang chờ trả về sau shutdown cũng không được tạo phòng mới (đã có regression).
- Thêm adapter tài khoản đã đăng ký, refresh token, ràng buộc đúng endpoint WSS; server kiểm `/auth/v1/user`, từ chối anonymous và bắt buộc allowlist UUID trên production. Token không được lưu trong resume storage. Không tạo user/migration hoặc ghi Supabase production.
- Preview có form đăng nhập chỉ khi server cấu hình public Auth; server có static HTML, CSP, `/ready`, giới hạn phòng/kết nối và origin fail-closed. React adapter mặc định tắt online, chưa đăng ký launcher.
- Chuẩn bị Docker/Compose+Caddy và Render Blueprint, chưa build image/deploy vì không có Docker CLI hoặc hosting được chọn.
- Đã qua `test:tank-clash` 39/39, `test:tank-clash-server` 12/12 và lint. Load loopback 16 phòng/32 WS/60 giây: JSON xuống 12,31 KiB/s/client, CPU cùng process 13,57%, RSS 206,22 MiB, event-loop p95 10,81 ms. Soak đồng hồ mô phỏng 30 phút: 240 trận, 29 resume, dọn 0 phòng; không tương đương soak 30 phút thời gian thực hoặc công suất VPS.
- Kiểm cuối: lint, export HTML 288.947 byte, Vite build, bundle budget và toàn `test:fast` (exit 0, kết thúc 39/39 Tank Clash) đều qua. CUA hai tab qua WS thật: create/join/ready/countdown, reload B đúng ghế+HP, B rời → A thắng forfeit. Form tài khoản đã kiểm mở/hiển thị desktop bằng cấu hình giả cục bộ, không nhập credential. Không chạy lại browser CI game khác, chưa login Auth thật hoặc kiểm form bằng thiết bị thật.
- Tài liệu: plan v1.4 §16, README/review/runbook, SESSION-HANDOFF/OWNER-TODO/PENDING-DECISIONS; proposal VPS Singapore 2 GiB 12 USD/tháng, option 1 GiB 6 USD/tháng, chưa gồm thuế/domain/backup/Supabase. Không tạo tài nguyên phí. Publish nhánh riêng `[skip netlify]`, không merge main trong lượt yêu cầu tiếp tục này.
- Còn: P2.5 host/domain/Auth staging/image/TLS thật và P2.6 10 trận hai người/hai máy/hai mạng, soak 30 phút thực, FPS/lag compensation. P3 chưa bắt đầu; kết quả chưa persistence, không thưởng/entitlement sản phẩm.

## 03/11/2026 · nhánh `merge/tank-clash-handoff-20261103` — bàn giao Tank Clash P2

- Yêu cầu: ghi toàn bộ tiến độ vào plan cho người khác tiếp quản rồi merge bản mới nhất.
- Đã đối chiếu Library plan v1.2, nhánh `feat/tank-clash-p2-rooms` (`1efae45`) và main mới (`5815e3e`, PR #13). Hai bộ P2 có wire không tương thích dù cùng version string; giải quyết xung đột bằng cách giữ bộ vận hành mới hơn trên main. Code/test bộ cũ được bảo toàn trong lịch sử merge, không để hai server/client lẫn nhau.
- `docs/tank-clash/PLAN.md` v1.3 §15: danh mục đầy đủ P0/P1/P2, module, thông số, protocol/auth, hướng dẫn cài/chạy/test, bằng chứng cũ/mới, tính năng chưa port và checklist tiếp tục P2–P7. Cập nhật README/backlog và SESSION-HANDOFF để người nhận tìm đúng plan.
- Export có tên P2 và title đúng; giữ alias P1 cho công cụ cũ. Không đổi gameplay, launcher, auth hoặc DB hiện hành.
- Kiểm lại: `test:tank-clash` 27/27, `test:tank-clash-server` 4/4; lint toàn repo, build, bundle budget và toàn `test:fast` đều qua. Export P2 56.280 byte. Lint/build/budget lúc đầu thiếu `supabase/` và PNG do sparse checkout; đã lấy đủ file, kiểm lại thành công, không nới test.
- Không chạy lại test browser của CI trong lượt này; giữ nguyên runtime/server/test/CI của main PR #13. Chưa deploy, đăng ký hosting, sửa Supabase hoặc nghiệm thu mạng/thiết bị thật. Merge source dùng thông điệp `[skip netlify]`.

## 03/11/2026 · nhánh `ccr-ff972ce9-1yqkwu`

### Tank Clash P2 — phần 3: giao diện online + tài liệu (xong)
- `src/games/tank-clash/runtime.ts`, `tank-clash.css`: thẻ "03 / Online 1v1" ở menu; màn tạo phòng/nhập mã (Enter để vào), link mời `?room=MÃ&server=...`; sảnh có ghế A/B, chủ phòng, sẵn sàng, đếm ngược, giờ giữ ghế khi mất kết nối; trận online không tạm dừng (Escape/blur/launcher pause → xe đứng yên, có nút rời trận = xử thua); màn kết quả do server xác nhận (thắng/thua/hòa/xử thua/hủy) và đấu lại; chân trang hiện ping và "đang nối lại". Nhãn bản build đổi thành "P2 · HÌNH TẠM".
- Sửa lỗi tìm được khi chụp màn hình: (1) ghế B thấy xe mình màu cam trong khi HUD tô mình màu xanh → giờ màu theo "mình/đối thủ" khi online; (2) form trên điện thoại 390 px bị lộn xộn → xếp lại; (3) đối thủ rời sau khi có kết quả làm mất màn kết quả → giữ lại tới khi người chơi chọn.
- Server nhận origin `null` (mở file HTML trực tiếp) chỉ khi bind loopback. `preview.ts` gắn `window.__tankClash` (chỉ bản preview) cho test đọc trạng thái.
- Test mới `tests/tank-clash/online-ui.test.ts` (`npm run test:tank-clash-ui`, đã thêm vào CI): 2 trang Chromium + server thật.
- Tài liệu: `docs/tank-clash/P2-review.md` (mới: đã làm, số đo, giới hạn, quyết định hosting); cập nhật `PLAN.md` (checklist P2, nhật ký v1.2), `README.md`, `PVP-BACKLOG.md`, `docs/PENDING-DECISIONS.md` (mục 9: nơi chạy room server), `docs/OWNER-TODO.md`, `docs/SESSION-HANDOFF.md` (mục 8).
- Đã chạy: `npm run lint` sạch; `npm run build` OK; `npm run test:bundle` OK; `npm run test:fast` qua toàn bộ (gồm `test:tank-clash` 27/27); `npm run test:tank-clash-server` 4/4; `npm run test:tank-clash-ui` 1/1. Đã xem ảnh chụp 1280×760, 390×844, 844×390.
- **Chưa làm / còn rủi ro:** chưa deploy, chưa chọn hosting (chờ chủ dự án); chưa chơi thử trên Internet/thiết bị thật; chưa có lag compensation; chưa lưu kết quả vào database; chưa vào launcher (P4); chưa có 2v2/ghép trận (P3). Chưa chạy các bước CI cần trình duyệt của game khác (`test:smoke`, `test:games`, `test:modals`…) vì không đụng tới launcher.

## 02/11/2026 · nhánh `ccr-ff972ce9-1yqkwu` (tách từ `main` `c8aac24`)

### Tank Clash P2 — phần 2: máy chủ WebSocket (xong, chưa deploy)
- `server/tank-clash-room/server.mjs` (mới, có `package.json` + lockfile riêng, chỉ phụ thuộc `ws@8.22.1`): bọc `room.ts`. Mặc định chỉ bind `127.0.0.1`, chỉ nhận origin localhost (thêm bằng `TANK_ALLOWED_ORIGINS`), gói tin tối đa 2 KB, ngắt client đọc chậm, heartbeat 10 giây, bộ lập lịch dùng thời gian thực (không trôi giờ), `/health` trả số liệu.
- Xác thực: có `SUPABASE_URL` + `SUPABASE_ANON_KEY` thì bắt buộc đăng nhập (kiểm token ở `/auth/v1/user`, không cần service-role key); không có thì chơi khách (dev). `NODE_ENV=production` mà không cấu hình Supabase thì server từ chối chạy.
- Kết quả trận hiện chỉ ghi log (`match.result`); lưu vào database để lại cho mốc tích hợp.
- Lệnh mới: `npm run dev:tank-server`, `npm run test:tank-clash` (nằm trong `test:fast`), `npm run test:tank-clash-server` (cần `npm ci --prefix server/tank-clash-room`; đã thêm bước vào CI).
- Test `tests/tank-clash/server.test.mjs`: 2 client trình duyệt qua WebSocket thật (tạo, vào, sẵn sàng, chơi, server cắt socket → client tự nối lại đúng ghế và HP, máy khác chiếm ghế bằng resume token, rời trận → xử thua, `/health`); chặn origin lạ (403) và gói quá cỡ (1009); bộ xác thực Supabase với fetch giả.
- Đã chạy: `npm run lint` sạch; `npm run test:tank-clash` 27/27; `npm run test:tank-clash-server` 4/4 (3 ca mới + spike P0 cũ).

### Tank Clash P2 — phần 1: giao thức, máy chủ phòng, netcode (xong)
- `src/games/tank-clash/engine.ts`: thêm `createState('duel', { online: true })` (cả hai ghế là người ở mọi hiệp) và tách `driveTank()` để server và client dự đoán dùng chung luật lái/va chạm.
- `src/games/tank-clash/protocol.ts` (mới): giao thức `tank-clash.p2.v1`, mã lỗi kèm câu tiếng Việt, kiểm tra gói tin chặt (từ chối loại lạ, field thừa, batch quá 4), mã phòng 6 ký tự không có 0/O/1/I/L, nén số trong snapshot.
- `src/games/tank-clash/room.ts` (mới): máy chủ phòng không phụ thuộc WebSocket, đồng hồ truyền vào. Có tạo phòng/vào bằng mã, sẵn sàng → đếm ngược 3 giây → trận do server quyết định, giữ ghế 20 giây khi mất mạng (xe vẫn trúng đạn), quay lại đúng ghế và HP, hết giờ giữ ghế thì xử thua, cả hai cùng mất thì hủy trận, rời giữa trận thì xử thua ngay, chuyển chủ phòng, đấu lại cần cả hai sẵn sàng và có match id mới, `onResult` chỉ gọi một lần cho mỗi match id, một tài khoản không giữ hai phòng, giới hạn 120 gói/giây, xác thực token đồng bộ hoặc bất đồng bộ (tranh ghế cuối vẫn nguyên tử).
- Hàng input phía server dùng **tín dụng input**: thiếu input thì xe đứng yên; khi input tới trễ thì bù tối đa 2 input/nhịp trong giới hạn tín dụng (30 nhịp). Không thể chạy nhanh hơn thời gian thực.
- `src/games/tank-clash/net-client.ts` (mới): dự đoán xe mình bằng `driveTank`, đối soát theo `ack` và phát lại input chưa xác nhận, xóa dần độ lệch; xe đối thủ nội suy lùi 100 ms, không nội suy qua lúc reset hiệp, ngoại suy tối đa 150 ms khi thiếu snapshot, làm mượt có giới hạn tốc độ. Kèm `connectTankRoom()` cho trình duyệt (tự quay lại ghế trong 20 giây, ping mỗi giây).
- Test mới: `tests/tank-clash/harness.mjs` (mạng ảo có trễ/jitter/mất gói kiểu TCP), `room.test.mjs` (10 ca vòng đời phòng), `netcode.test.mjs` (trận đủ hiệp ở RTT 80/150/250 ms, jitter 30 ms, mất gói 1/2/3 %; dự đoán; mất mạng giữa hiệp).
- Kết quả chạy `node --test tests/tank-clash/*.test.mjs`: **28/28 qua**. Số đo (mạng ảo, không phải máy thật):

| Mạng | Tải xuống | Tải lên | Hiệu chỉnh khi đang đánh | Lệch hiển thị xe đối thủ (TB / p95) |
|---|---|---|---|---|
| RTT 80, jitter 30, mất 1 % | 11,5 KB/s | 4,2 KB/s | 0 | 15 / 28 px |
| RTT 150, jitter 30, mất 2 % | 11,3 KB/s | 4,1 KB/s | 0 | 19 / 40 px |
| RTT 250, jitter 30, mất 3 % | 10,2 KB/s | 3,9 KB/s | 0 | 32 / 86 px |

  Hiệu chỉnh chỉ xảy ra lúc hết hiệp hoặc xe mình vừa bị loại (2–3 lần/trận, tách riêng thành `phaseCorrections`). Lệch hiển thị xe đối thủ là do vẽ lùi 100 ms + độ trễ một chiều; chưa có bù trễ khi bắn (lag compensation).
- Còn dở: máy chủ WebSocket thật, giao diện online, tài liệu P2.

### Bắt đầu session
- Trạng thái lúc vào: nhánh trùng `main` (`c8aac24`, đã có Tank Clash P0/P1, Snake journey, và toàn bộ nhánh `claude/busy-edison-1clj3h` qua PR #11). `docs/SESSION-HANDOFF.md` còn ghi nhánh cũ "16 commit chưa merge" → đã sửa.
- Việc tiếp theo theo `docs/tank-clash/PLAN.md` §10/§14: **Tank Clash P2 — online 1v1** (giao thức phòng, mã phòng, ready, dự đoán/đối soát/làm mượt, luật rời trận, thử RTT/jitter/loss). Không deploy, không đăng ký hosting (cần chủ dự án duyệt chi phí).
- Kiểm tra nền: `node --test tests/tank-clash/engine.test.mjs tests/tank-clash/network.test.mjs` → 13/13 qua.
- Đã tạo file này và thêm quy tắc "Nhật ký bắt buộc" vào `CLAUDE.md`.
