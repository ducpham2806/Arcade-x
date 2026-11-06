# Tank Clash — tiếp tục từ P3 đã merge

Mốc 06/11/2026, main c705100. **Đã có:** bot, private 1v1/2v2, party/queue, spectator, rematch, account adapter và catalog. **Chưa đồng nghĩa:** đã deploy đúng head, nghiệm thu tải/thiết bị, có reward/DB result. Giữ wire `tank-clash.p3.v1`, online không thêm bot, Free/cap16/không phí thêm. Scope sản phẩm được duyệt trong [LAUNCHER-RELEASE](../tank-clash/LAUNCHER-RELEASE.md).

## TC-R0 · READY · xác minh bản phát hành đang chạy

- Đầu vào: release ở trên và [TC2-RUNBOOK](../tank-clash/TC2-RUNBOOK.md), chỉ mục deploy/health/Auth/rollback.
- File đích để đối chiếu: `render.yaml`, `server/tank-clash-room/{server,config}.mjs`, `src/games/tank-clash/index.tsx`, `src/launcher/catalog.ts`.
- [ ] Đọc commit/deploy frontend và Render thực tế; ghi bằng chứng mới. Nếu chưa đúng head, chuẩn bị/thực hiện bước phát hành trong quyền đã duyệt; không suy trạng thái từ tên hostname “staging”.
- [ ] Kiểm icon, chơi bot, login online từ sảnh, logout/đổi tài khoản/exit giải phóng ghế; WSS cố định; Auth đúng project. Health/TLS/origin/token giả; review/metrics public phải tắt theo profile production.
- **Xong khi:** báo cáo `.md` ghi commit/backend mode/thời gian/ca pass-fail và giới hạn; không lưu JWT/secret. Chưa đăng nhập thật thì ghi thiếu, không đánh DONE.

## TC-R1 · WAITING · nghiệm thu mạng/thiết bị/backend đích

Cần lịch 2–4 người/tài khoản, hai thiết bị và hai mạng. Chuẩn bị script/kịch bản có thể làm trước.
- [ ] ≥10 trận mỗi format 1v1/2v2, cả phòng riêng và queue; token hết hạn/trùng account, spectator, drop/resume ghế+HP, tab/khóa màn hình, surrender/rematch; mọi máy cùng kết quả.
- [ ] Soak ≥30 phút Render thực, tăng tải trong cap cho phép; đo CPU/RAM/phòng/socket/băng thông/listener, restart và phục hồi UX. Free ngủ/restart mất RAM phải được phản ánh đúng.
- [ ] PC/touch/ngang/dọc/máy yếu: FPS và cảm giác lái/bắn; mục tiêu 60 FPS, chế độ giảm hiệu ứng ≥30 cần số đo, không tự tuyên bố đạt.
- Kiểm tra: lint/build/bundle/fast, `test:tank-clash-server`, `test:tank-clash-ui`, launcher/motion liên quan. Bằng chứng local cũ không thay phép đo Internet.

## TC-R2 · READY · port phần P2 còn thiếu, sau TC-R0

Nhánh cũ `feat/tank-clash-p2-staging-readiness@bdc6f85` dùng `tank-clash.p2.v2`; main dùng P3. Auth/ops đã có bản mới. Không merge nguyên nhánh.
- Đối chiếu `protocol.ts`, `room.ts`, `net-client.ts`; chỉ port phần còn thiếu: epoch match/round chống dữ liệu cũ, control command receipt/ack/retry, timeout/giới hạn queue/reconnect và endpoint-bound resume.
- [ ] Thiết kế tương thích client/server; nếu đổi wire, đổi version và kế hoạch deploy đồng bộ/rollback. Không phát frontend mới khiến server đang chạy từ chối.
- [ ] Test snapshot/input cũ, duplicate command, reconnect quá hạn, storage khác endpoint, token refresh; giữ 1v1/2v2/party/queue/spectator. Full CI trước merge.

## TC-R3 / TC-R4 · BACKLOG · sản phẩm và polish

- R3: chốt quyền chơi/kết quả backend/thưởng; receipt một lần theo match ID, reconnect không thưởng trùng. Không coi pilot miễn phí là entitlement hoàn chỉnh.
- R4: art/VFX/audio có hướng mỹ thuật, phân biệt đội bằng màu+biểu tượng, BOT rõ, cleanup/mute/bundle và kiểm trực quan.
- P6/P7 3v3/4v4 giữ backlog, chưa mở. Bắt đầu tiếp bằng TC-R0, không đọc toàn bộ GDD/P3 spec.
