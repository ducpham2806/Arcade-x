# Nhật ký công việc (bắt buộc)

Quy tắc của chủ dự án (02/11/2026): **mọi việc Claude làm xong đều phải ghi vào file này**, ngay khi xong từng phần (không đợi cuối session), và commit cùng thay đổi đó. Mục mới nhất ở trên cùng.

Mỗi mục ghi: ngày, nhánh, việc đã làm, file chính, lệnh test đã chạy và kết quả thật, phần chưa làm hoặc còn rủi ro. Tóm tắt dài hạn nằm ở `docs/SESSION-HANDOFF.md`; việc chủ dự án cần làm ở `docs/OWNER-TODO.md`.

---

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
