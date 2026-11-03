# Nhật ký công việc (bắt buộc)

Quy tắc của chủ dự án (02/11/2026): **mọi việc Claude làm xong đều phải ghi vào file này**, ngay khi xong từng phần (không đợi cuối session), và commit cùng thay đổi đó. Mục mới nhất ở trên cùng.

Chỉ giữ vài mục gần nhất ở đây cho nhẹ đầu phiên; mục cũ hơn chuyển nguyên văn sang `docs/archive/WORKLOG-YYYY-MM.md` (hiện có `docs/archive/WORKLOG-2026-11.md`).

Mỗi mục ghi: ngày, nhánh, việc đã làm, file chính, lệnh test đã chạy và kết quả thật, phần chưa làm hoặc còn rủi ro. Tóm tắt dài hạn nằm ở `docs/SESSION-HANDOFF.md`; việc chủ dự án cần làm ở `docs/OWNER-TODO.md`.

---

## 03/11/2026 · nhánh `ccr-8c56f166-kqc9na` — Tank Clash P3c: hàng chờ 2v2 và tổ đội

- Chủ dự án đồng ý làm P3c. Chi tiết: `docs/tank-clash/P3-SPEC.md` §15.
- Code: `protocol.ts` (tin `queue`/`unqueue`, `RoomView.kind/queue/rematchMs`, mã lỗi `QUEUE_INVALID`/`ROOM_QUEUED`, thông số thời gian hàng chờ trong `NET`), `room.ts` (hàng chờ trong bộ nhớ, ghép tổ + tổ trước rồi theo thứ tự, phòng ghép đếm ngược 5 giây, hủy và trả về chỗ cũ, cửa sổ đấu lại 20 giây rồi giải tán, giữ chỗ 10 giây khi mất mạng, bắt đăng nhập), `net-client.ts` (`queue()`, `unqueue()`, `queueStatus`, tự xếp lại sau khi nối lại), `server.mjs` (`TANK_QUEUE_GUESTS`, `/health` có số đang chờ), `tests/tank-clash/harness.mjs` (client có token).
- Test mới: `tests/tank-clash/queue.test.mjs` (12 ca, đủ bảng §6.4) trong `test:tank-clash`; 1 ca WebSocket thật trong `server.test.mjs`. Thử làm hỏng code 7 chỗ: lần đầu test bắt 4/7, 3 chỗ lọt vì test dựng sai tình huống (một test qua mà không kiểm gì) → sửa test, bắt 7/7.
- Lỗi tìm được: thời gian chờ của tổ đội hiển thị đứng yên → client tự cộng thời gian.
- Đã chạy: `npm run lint` sạch; `npm run build` OK; `npm run test:bundle` OK; `npm run test:fast` qua (gồm `test:tank-clash` 65/65); `npm run test:tank-clash-server` 5/5; `npm run test:tank-clash-ui` 3/3 (`CHROMIUM_EXECUTABLE=/opt/pw-browsers/chromium`).
- **Chưa làm / rủi ro:** P3d (giao diện online 2v2, màn hàng chờ và "thiếu người" sau 60 giây, test UI 4 trang, ảnh chụp, `P3-review.md`). Hàng chờ một tiến trình, mất khi server khởi động lại; chưa xét kỹ năng. Chưa chạy `test:smoke`/`test:games`/`test:modals` (không đổi launcher).

## 03/11/2026 · nhánh `ccr-8c56f166-kqc9na` — Tank Clash P3b: phòng 2v2 online, người xem, đầu hàng

- Chủ dự án đồng ý làm P3b. Chi tiết và số đo: `docs/tank-clash/P3-SPEC.md` §14.
- Code: `protocol.ts` (giao thức `tank-clash.p3.v1`: định dạng phòng, đội, xếp ghế, người xem, đầu hàng, tin `seat`, mã lỗi mới, chặn trường lạ, snapshot bỏ trường bằng 0), `room.ts` (viết lại cho 4 ghế; bỏ trận theo người; người xem; seed mới mỗi trận), `engine.ts` (squad online không bot), `net-client.ts` (n xe, xe mình đứng đầu, API mới), `runtime.ts` (chỉ đổi cách xác định đội mình). Giao diện online 2v2 để P3d.
- Test mới: `tests/tank-clash/squad-room.test.mjs` (9 ca), `tests/tank-clash/squad-netcode.test.mjs` (4 ca), thêm vào `test:tank-clash`. Thử làm hỏng code 5 chỗ: test bắt 3; 2 chỗ còn lại là kiểm tra thừa (giải thích ở đặc tả).
- Lần đo đầu: 2v2 ở RTT 150 tải xuống 21,1 KB/s, vượt trần 20 KB/s → giảm cỡ snapshot, không nới test. Sau sửa: 2v2 cao nhất 19,3 KB/s (sát trần); 1v1 9,8–10,7 KB/s.
- Đã chạy: `npm run lint` sạch; `npm run build` OK; `npm run test:bundle` OK; `npm run test:fast` qua (gồm `test:tank-clash` 53/53); `npm run test:tank-clash-server` 4/4; `npm run test:tank-clash-ui` 3/3 (`CHROMIUM_EXECUTABLE=/opt/pw-browsers/chromium`).
- **Chưa làm / rủi ro:** P3c (hàng chờ, tổ đội), P3d (giao diện sảnh/HUD/kết quả 2v2 online, test 4 WebSocket, test UI 4 trang). 2v2 có hiệu chỉnh xe mình khi đang đánh (tới 11 lần/trận, tối đa ~21 px; 1v1 là 0), chưa chơi thật. Chưa chạy `test:smoke`/`test:games`/`test:modals` (không đổi launcher).

## 03/11/2026 · nhánh `ccr-8c56f166-kqc9na` — rút gọn SESSION-HANDOFF

- `docs/SESSION-HANDOFF.md`: 8,7 KB → 3,3 KB. Mô tả từng module thay bằng bảng trạng thái + đường dẫn tài liệu; giữ sổ tay kỹ thuật và danh sách còn yếu. Bản cũ chép nguyên văn sang `docs/archive/SESSION-HANDOFF-2026-11-03.md`.
- Sửa thông tin cũ sai: `main` giờ là `508d4ff` (PR #14, có Tank Clash P3a); NR4 (`5bc450f`) **đã có trong main** (kiểm bằng `git merge-base --is-ancestor`), bản cũ ghi "chưa merge"; đường dẫn Chromium thống nhất `/opt/pw-browsers/chromium` (đã kiểm tồn tại).
- Test: chỉ đổi tài liệu, không chạy test code.

## 03/11/2026 · nhánh `ccr-8c56f166-kqc9na` — rút gọn PLAN Tank Clash và lưu trữ nhật ký cũ

- Mục đích: giảm token đọc đầu phiên.
- `docs/tank-clash/PLAN.md`: 51,7 KB → 14,2 KB (v1.4 rút gọn). Giữ nguyên số mục §1–§9 để dẫn chiếu trong `P3-SPEC.md`, `P2-review.md` vẫn đúng; §10–§12 mới (việc tiếp theo, mã nguồn/chạy/test, quy tắc tiếp nối) thay cho §10–§15 cũ. Bản v1.3 đầy đủ chép nguyên văn sang `docs/archive/tank-clash-PLAN-v1.3.md`.
- `docs/WORKLOG.md`: 16,9 KB → khoảng 5 KB; 5 mục cũ (02–03/11, đến hết P3 đặc tả) chuyển nguyên văn sang `docs/archive/WORKLOG-2026-11.md` (đã so `diff` với bản gốc: khớp từng dòng). Thêm quy tắc: chỉ giữ vài mục gần nhất ở đây.
- Sửa dẫn chiếu §15 cũ ở `docs/tank-clash/README.md`, `PVP-BACKLOG.md`, `P3-SPEC.md`, `docs/SESSION-HANDOFF.md`.
- Test: chỉ đổi tài liệu, không chạy test code.

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

