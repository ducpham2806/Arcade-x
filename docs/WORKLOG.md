# Nhật ký công việc (bắt buộc)

Quy tắc của chủ dự án (02/11/2026): **mọi việc Claude làm xong đều phải ghi vào file này**, ngay khi xong từng phần (không đợi cuối session), và commit cùng thay đổi đó. Mục mới nhất ở trên cùng.

Mỗi mục ghi: ngày, nhánh, việc đã làm, file chính, lệnh test đã chạy và kết quả thật, phần chưa làm hoặc còn rủi ro. Tóm tắt dài hạn nằm ở `docs/SESSION-HANDOFF.md`; việc chủ dự án cần làm ở `docs/OWNER-TODO.md`.

---

## 03/11/2026 · nhánh `ccr-e38a635d-qyei9d` — Tank Clash P3c: tổ đội + hàng chờ 2v2

- Chủ dự án bảo làm tiếp. Đã làm P3c theo `docs/tank-clash/P3-SPEC.md` §6 (kết quả ở §15):
  - `room.ts`: một hàng chờ 2v2 trong bộ nhớ server. Người lẻ xếp hàng từ ngoài phòng; tổ đội là phòng riêng 2v2 có ≤ 2 người, chủ phòng bấm tìm trận (phòng bị khóa trong lúc chờ). Ghép: tổ+tổ trước, rồi tổ+2 lẻ, rồi 4 lẻ theo thứ tự vào hàng; tổ luôn chung đội. Phòng ghép: đếm ngược 5 giây, không chủ phòng, không đổi đội; ai rớt/rời/bỏ sẵn sàng lúc đếm ngược → người còn lại về đầu hàng (tổ về phòng riêng mới). Sau kết quả: đủ 4 người đấu lại trong 20 giây, không thì phòng giải tán (client giữ màn kết quả). Một tài khoản chỉ ở một nơi; khách cần đăng nhập để vào hàng (máy chủ dev chỉ có khách thì cho phép).
  - `protocol.ts`: tin `queue`/`unqueue`, `RoomView.kind/queue`, `left.reason`, mã lỗi `QUEUE_INVALID`/`QUEUE_LOGIN`, 4 thông số [PLACEHOLDER]. `net-client.ts`: `findMatch()`/`cancelMatch()`, trạng thái hàng chờ, tự xếp lại khi nối lại. `server.mjs`: bật hàng chờ cho khách ở máy chủ dev, `/health` báo số người chờ.
  - Đổi so với đặc tả v0.3: bỏ điều kiện tổ đội phải ngồi cùng đội trong phòng (khi ghép luôn chung đội); người lẻ mất kết nối rời hàng ngay. Đã ghi vào đặc tả v0.4.
- Test mới: `tests/tank-clash/queue.test.mjs` (11 ca) trong `test:tank-clash`; 1 ca WebSocket thật trong `test:tank-clash-server`. Đã thử làm hỏng 3 quy tắc để kiểm test: 2 quy tắc bị bắt ngay; quy tắc "quay về đầu hàng" chưa bị bắt nên đã thêm ca riêng, giờ bắt được.
- Đã chạy: `npm run lint` sạch; `npm run build` OK; `npm run test:bundle` OK; `npm run test:fast` qua (gồm `test:tank-clash` 64/64); `npm run test:tank-clash-server` 5/5; `npm run test:tank-clash-ui` 3/3 (với `CHROMIUM_EXECUTABLE=/opt/pw-browsers/chromium`).
- **Chưa làm / rủi ro:** P3d (giao diện online 2v2: sảnh 4 ghế, nút tìm trận/hủy, màn chờ 60 giây với lựa chọn "luyện với bot", xem trận, đầu hàng online, test 4 trang). Hàng chờ chỉ chạy trong một tiến trình máy chủ; chưa xét kỹ năng/khu vực. Chưa chạy máy chủ thật qua Internet (chờ hosting). Chưa chạy `test:smoke`/`test:games`/`test:modals` (không đổi launcher).

## 03/11/2026 · nhánh `ccr-e38a635d-qyei9d` — Tank Clash P3b: phòng 2v2 trên server

- Chủ dự án bảo làm tiếp. Đã làm P3b theo `docs/tank-clash/P3-SPEC.md` (chi tiết và bảng số đo ở §14):
  - `protocol.ts`: lên `tank-clash.p3.v1` (client P2 cũ nhận `PROTOCOL_MISMATCH` "tải lại trang"). 4 ghế `a/a2/b/b2`, `format` 1v1/2v2, tin `team`, `move`, `surrender`, `join` dạng xem; thêm đội/bỏ trận vào view và kết quả; 6 mã lỗi mới có câu tiếng Việt.
  - `room.ts`: phòng 2v2 (xếp ghế a, b, a2, b2 cho cân đội; cần đủ 4 người sẵn sàng; chủ phòng chuyển theo thứ tự a, a2, b, b2), đổi đội, chủ phòng xếp người (xóa sẵn sàng mọi người), bỏ trận theo người (rời trận hoặc hết 20 giây giữ ghế → xe ra khỏi trận, đồng đội đánh tiếp; cả đội → thua; cả hai đội trong cùng nhịp → hủy), không cho quay lại ghế đã bỏ, ghế người bỏ được trả khi có kết quả, đầu hàng (chỉ khi không còn đồng đội đang chơi), người xem (tối đa 4, vào cả lúc đang trận, không điều khiển được), seed sân mới mỗi trận.
  - `net-client.ts`: sân theo format, xe mình đứng đầu danh sách, `switchTeam/move/surrender`, xem trận, tự xem lại khi nối lại. `runtime.ts`: chỉ đổi cách tính đội của mình (UI online 2v2 là P3d). `engine.ts`: `squad` online.
- Test mới: `tests/tank-clash/room2v2.test.mjs` (9 ca) và `tests/tank-clash/netcode2v2.test.mjs` (4 ca, 4 client qua mạng ảo RTT 80/150/250, jitter 30, mất 1–3 %), thêm vào `test:tank-clash`.
- Phát hiện khi đo: số lần hiệu chỉnh xe mình ở 2v2 cao hơn 1v1 (tới 32 lần/người/trận ở RTT 250). Đã phân tích bằng lịch sử server: tất cả xảy ra khi vừa chạm xe khác hoặc gạch vừa vỡ, chạy tự do là 0–1 lần. Test giờ kiểm riêng loại "tự do" (≤ 3) và độ lớn (< 48 px), có in số liệu từng loại. Không nới test 1v1.
- Đã chạy: `npm run lint` sạch; `npm run build` OK; `npm run test:bundle` OK; `npm run test:fast` qua (gồm `test:tank-clash` 53/53); `npm run test:tank-clash-server` 4/4; `npm run test:tank-clash-ui` 3/3 (với `CHROMIUM_EXECUTABLE=/opt/pw-browsers/chromium`). Test P2 cũ không phải sửa.
- **Chưa làm / rủi ro:** UI online 2v2 và test server 4 WebSocket thật (P3d); tổ đội + hàng chờ (P3c); hiệu chỉnh khi chạm xe ở mạng chậm có thể thấy rõ trên máy thật (tối đa khoảng 40 px, có làm mượt) — cần chơi thử. Chưa chạy server thật qua Internet (chờ hosting). Chưa chạy `test:smoke`/`test:games`/`test:modals` (không đổi launcher).

## 03/11/2026 · nhánh `ccr-e38a635d-qyei9d` — Tank Clash P3a: sân 2v2 ngẫu nhiên + 2v2 với bot

- Chủ dự án duyệt đặc tả P3: (1) sân to, chướng ngại ngẫu nhiên từng trận; (2) hàng chờ công khai bắt đăng nhập; (3) cho đầu hàng; (4) chế độ cục bộ 1 người + 1 bot đồng đội vs 2 bot; làm luôn.
- Đã làm P3a (chi tiết ở `docs/tank-clash/P3-SPEC.md` §13):
  - `src/games/tank-clash/maps.ts` (mới): sân 1040×624, bộ sinh theo seed (mulberry32), nửa phải = nửa trái xoay 180°, kiểm tra tự động (không có đường bắn thẳng giữa khu xuất phát, không khu kín, đường chính ≥ 48 px, quanh điểm xuất phát 60 px trống, đối xứng), sinh lại khi không đạt, bố cục dự phòng.
  - `engine.ts`: chế độ `squad` 4 xe `a/a2/b/b2`, kích thước sân theo state (`s.width/height`), đổi làn đồng đội mỗi hiệp, `forfeitTank()` (bỏ trận theo người, cả đội bỏ → thua, cả hai đội cùng nhịp → hủy), `surrender()`, `endReason`; bot cho mọi xe (địch gần nhất có tầm nhìn, giãn cách đồng đội, lệch nhịp bắn); lưới tìm đường có cache. Duel 1v1 không đổi hành vi (test cũ qua nguyên).
  - `runtime.ts` + CSS: thẻ "03 / Đồng đội 2v2", HUD hai đội, ●/▲ + BOT trên sân, vòng sáng xe mình, nhãn tự phóng to theo màn hình, nút "Đầu hàng" trong màn tạm dừng, màn kết quả có mã sân. Nhãn bản build "P3a".
  - `net-client.ts`: chỉ đổi giới hạn sân sang theo state. `scripts/export-tank-review.mjs`: đổi tiêu đề.
- Lỗi tự tìm khi chụp màn hình rồi sửa: (1) bot đứng im ở điểm xuất phát (36/300 lượt bot trên 100 seed) do lưới tìm đường 40 px thô hơn bố cục 52 px → ô 20 px cho sân 2v2, có test hồi quy (đã xác nhận test hỏng với lưới cũ); (2) nhãn xe không đọc được ở 844×390 → phóng to theo kích thước hiển thị. Thêm cache lưới tìm đường: 0,7 → 0,3 ms/nhịp cho 3 bot.
- Test mới: `tests/tank-clash/squad.test.mjs` (10 ca: bố cục 60 seed hợp lệ/đối xứng/khác nhau, validator, trận 4 xe, friendly fire, hòa cùng nhịp, bỏ trận, đầu hàng, bot đánh hết trận, bot ra khỏi điểm xuất phát) và `tests/tank-clash/squad-ui.test.ts` (2 trang Chromium 1280×760 và 844×390: vào trận, lái, tạm dừng → đầu hàng → kết quả → đấu lại với seed mới).
- Đã chạy: `npm run lint` sạch; `npm run build` OK; `npm run test:bundle` OK; `npm run test:fast` qua (gồm `test:tank-clash` 40/40, mất khoảng 11 giây); `npm run test:tank-clash-server` 4/4; `npm run test:tank-clash-ui` 3/3 (với `CHROMIUM_EXECUTABLE=/opt/pw-browsers/chromium`). Đã xem ảnh 1280×760, 844×390, 390×844.
- **Chưa làm / rủi ro:** P3b–P3d (online 2v2, tổ đội, hàng chờ, UI online). Trên điện thoại nằm ngang xe chỉ khoảng 13 px (đánh đổi của sân to); độ khó bot và kích thước sân là [PLACEHOLDER], chưa chơi thử bằng tay trên thiết bị thật. Chưa chạy `test:smoke`/`test:games`/`test:modals` (không đổi launcher).

## 03/11/2026 · nhánh `ccr-e38a635d-qyei9d` — Tank Clash P3: đặc tả 2v2

- Chủ dự án đồng ý làm tiếp P3 khi chưa chọn hosting. Theo PLAN §15.7 mục 5 ("đặc tả rồi làm"), lượt này viết đặc tả, **chưa code**.
- `docs/tank-clash/P3-SPEC.md` (mới, v0.1): tiêu chí xong D1–D7; hiện trạng code (engine đã có luật đội, friendly fire tắt, so đội khi hết giờ; phải đổi room/protocol/client); luật 2v2 và bảng mất mạng/bỏ trận theo người; bản đồ Crossfire (5 yêu cầu kiểm tự động, dữ liệu `maps.ts`); protocol `tank-clash.p3.v1` (tin `team`, `move`, `queue`, `unqueue`, người xem, mã lỗi mới); tổ đội = phòng riêng 2v2, một hàng chờ trong bộ nhớ, bảng 9 tình huống ghép; xử lý thiếu người không có bot ẩn; UI theo AGENTS.md; kế hoạch test §8; chia P3a–P3d; rủi ro; 5 câu hỏi Q1–Q5.
- Cập nhật `PLAN.md` §15.7 mục 5, `PENDING-DECISIONS.md` (mục 10–14), `OWNER-TODO.md`.
- Test: không đổi code nên không chạy lại; các số hiện trạng trong đặc tả đối chiếu trực tiếp với `engine.ts`, `protocol.ts`, `room.ts`.
- **Còn lại:** chờ duyệt đặc tả; sau đó làm P3a (bản đồ Crossfire, engine 4 xe, bot 2v2 cục bộ). Sơ đồ ASCII Crossfire chỉ để hình dung, tọa độ thật phải qua test §8.1.

## 03/11/2026 · nhánh `ccr-e38a635d-qyei9d` — Tank Clash P2: token tài khoản và máy chủ tin cậy

- Làm tiếp `docs/tank-clash/PLAN.md` §15.7 mục 2 (mục 1 chờ chủ dự án chọn hosting, mục 3 cần thiết bị thật).
- `src/games/tank-clash/trust.ts` (mới): chỉ gửi Supabase access token tới máy chủ `wss` có trong danh sách tin cậy (khớp đúng scheme + host + port + path, chặn host giả dạng, `ws` thường, URL chứa user/mật khẩu) hoặc máy chủ loopback để dev. Link mời `?server=` trỏ tới máy chủ lạ vẫn vào được nhưng như khách, không lộ JWT.
- `runtime.ts`: thêm option `trustedServers`, gom 3 chỗ mở kết nối vào `connect()` dùng `tokenFor(...)`; màn Online hiện dòng báo "vào với tư cách khách" khi có tài khoản mà máy chủ không tin cậy.
- `index.tsx`: lấy `access_token` từ phiên Supabase hiện có (`getSession` + `onAuthStateChange`), không ép đăng nhập; danh sách tin cậy đọc từ `VITE_TANK_CLASH_SERVERS` (khai báo kiểu ở `src/vite-env.d.ts`, ví dụ ở `.env.example`).
- Test mới `tests/tank-clash/trust.test.mjs` (3 ca), thêm vào `test:tank-clash`.
- Đã chạy: `npm run lint` sạch; `npm run build` OK; `npm run test:bundle` OK; `npm run test:fast` qua (gồm `test:tank-clash` 30/30); `npm run test:tank-clash-server` 4/4 (lần đầu 3/4 do máy chưa cài `server/tank-clash-spike` — đã cài như CI rồi chạy lại); `npm run test:tank-clash-ui` 1/1 (cần `CHROMIUM_EXECUTABLE=/opt/pw-browsers/chromium` trong môi trường cloud này).
- **Chưa làm:** chưa thử với hai tài khoản staging thật; chưa có allowlist tester/entitlement phía server; chưa chọn hosting nên chưa có giá trị thật cho `VITE_TANK_CLASH_SERVERS`. Không đụng Supabase/DB. Chưa chạy `test:smoke`/`test:games`/`test:modals` (không đổi launcher).

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
