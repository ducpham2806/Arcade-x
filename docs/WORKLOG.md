# Nhật ký công việc (bắt buộc)

Quy tắc của chủ dự án (02/11/2026): **mọi việc Claude làm xong đều phải ghi vào file này**, ngay khi xong từng phần (không đợi cuối session), và commit cùng thay đổi đó. Mục mới nhất ở trên cùng.

Mỗi mục ghi: ngày, nhánh, việc đã làm, file chính, lệnh test đã chạy và kết quả thật, phần chưa làm hoặc còn rủi ro. Tóm tắt dài hạn nằm ở `docs/SESSION-HANDOFF.md`; việc chủ dự án cần làm ở `docs/OWNER-TODO.md`.

---

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
