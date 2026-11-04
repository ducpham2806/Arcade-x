# Tank Clash — kế hoạch v1.5 · 04/11/2026

P0/P1, P2 local, P3a–P3c đã code trên `main@affc5e8`; **P3d chưa làm**. Chưa hosting, nghiệm thu Internet/thiết bị thật, launcher, art sản xuất, lưu kết quả hay duyệt phát hành. Bản đầy đủ trước rút gọn: [v1.4](../archive/tank-clash-PLAN-v1.4.md); lịch sử P2 cũ: [v1.3](../archive/tank-clash-PLAN-v1.3.md). Giữ số §1–§12 để tra dẫn chiếu cũ.

## 1. Mục tiêu

Xe tăng đấu trường top-down trên điện thoại/PC: lái và ngắm độc lập, né đạn/bắn bật tường/phối hợp ép góc, vào trận bằng mã/link. Kiểm chứng cảm giác vui và online trước art sản xuất.

## 2. Phạm vi

MVP: sân tập/bot, 1v1 phòng riêng, 2v2 phòng riêng + tổ đội + **một hàng chờ 2v2**. Không hàng chờ 1v1; không ranked, battle pass, tăng sức mạnh trả phí, bang hội, voice/campaign. 3v3 tranh khu vực/4v4 cướp lõi là P6/P7, cần đặc tả riêng.

## 3. Luật MVP

Sảnh → ready → hiệp → kết quả → đấu lại/về sảnh. PC WASD/mũi tên + chuột bắn/ngắm + Space khiên; touch cần trái lái, kéo cần phải ngắm/nhả bắn (có vùng hủy), nút khiên. Mất focus/kết nối xóa input; vùng chạm tránh HUD/tai thỏ.

Thép phản xạ, gạch 2 hit; mép sân hút đạn. Đạn bật tự hại; xuyên đồng đội, không friendly fire; mỗi viên chỉ gây một lần sát thương, khiên chặn thì mất. Xe không chồng nhau. Không vật phẩm ngẫu nhiên; bot cùng luật.

Nguồn tuning: `CONFIG` trong engine; giá trị khởi điểm chưa được playtest xác nhận: HP 3, damage 1, hồi bắn 0,65 s, tối đa 3 đạn/xe, bật 1 lần/sống 2,5 s, khiên 0,8 s/hồi 8 s; hiệp 60 s, tối đa 3 hiệp, thắng 2 kết thúc sớm. Hết giờ so xe sống → tổng HP → hòa; xe cuối cùng chết cùng tick thì hòa. Server xác nhận sát thương/giờ/hiệp/kết quả; không hồi sinh giữa hiệp.

## 4. Bản đồ

Duel 800×480; Crossfire 1040×624, seed mới mỗi trận, đối xứng tâm, không bắn thẳng vào điểm xuất phát/khu kín, lối chính ≥48 px, quanh spawn 60 px trống. Không đạt validator thì sinh lại, cuối cùng fallback. Chi tiết `P3-SPEC.md` §4. Đội khác màu **và** biểu tượng/viền; không làm map mới để né lỗi map hiện tại.

## 5. Phòng, ghép trận, mất mạng

Phòng riêng có mã/link, chia đội/ready; chỉ bắt đầu đủ người. Chủ phòng chỉ chỉnh sảnh, đổi cấu hình xóa ready; rời sảnh chuyển quyền. Tranh ghế nguyên tử; không nhận người chơi mới giữa trận. Tổ 2 người không tách khi ghép; một tài khoản không ở nhiều nơi. Thiếu người thì đợi hoặc **rời hàng** chơi bot cục bộ, không bot ẩn online.

Mất mạng xe đứng yên vẫn trúng đạn, giữ ghế 20 s; reconnect đúng HP/kỹ năng. Hết hạn/rời = bỏ trận theo người tới hết trận, đồng đội tiếp tục; cả đội bỏ → thua, hai đội cùng hết người trong một tick → hủy, không thưởng. Hàng chờ giữ chỗ 10 s khi rớt; rematch phòng ghép có cửa sổ 20 s. Luật đầu hàng/queue chính xác `P3-SPEC.md` §3/§5/§6. Xem trận công khai, không thông tin ẩn, tối đa 4 người xem (tuning tạm).

## 6. Kiến trúc

Client input/render/âm thanh, prediction xe mình + reconciliation, interpolation xe khác. Node room server giữ trận trong RAM, kiểm input/tần suất và quyết định kết quả; Supabase cho tài khoản, về sau quyền/kết quả; **không ghi vị trí/đạn từng tick**. Kết quả cần backend ghi một lần/match ID, lỗi lưu không treo trận; quyền hết hạn giữa trận không cắt trận. Thoát hủy socket/listener/timer/RAF. Migration thử PGlite/staging theo AGENTS, không secret client.

## 7. Art, UI, âm thanh

Arcade cơ khí 2D: thép/gạch khác hình và phản hồi; trạng thái xe rõ, HUD gọn không che sân. Âm thanh bắn/bật/gạch/khiên/hiệp giới hạn chồng tiếng, dừng khi thoát. Art tạm ghi rõ, BOT có nhãn; art sản xuất sau kiểm chứng gameplay. Quy tắc modal/toast/update ở AGENTS.

## 8. Các mốc

| Mốc | Trạng thái / điều kiện chuyển |
|---|---|
| P0/P1 | Xong code sân tập/bot/spike; còn playtest người mới |
| P2 | 1v1 local xong kỹ thuật; còn hosting/auth thật/mạng thật |
| P3 | a bản đồ/bot, b phòng 2v2, c queue/tổ xong; d UI + test 4 trang chưa. Phải chia đội đúng, xử thiếu/bỏ, không bot ẩn |
| P4 | Chưa: art/âm thanh, launcher/quyền/kết quả, loading/exit sạch |
| P5 | Chưa: QA/load/soak/thiết bị thật, đạt §9 và chủ dự án duyệt |
| P6/P7 | Chưa: 3v3/4v4 sau MVP |

## 9. Kiểm thử và mục tiêu đo — cần xác nhận thực tế

Người mới hiểu điều khiển/phản xạ trong 60 s; mobile hướng 60 FPS, giảm hiệu ứng ≥30. RTT 80/150/250 ms, jitter 30, loss 1–3% không lệch HP/hiệp/kết quả. Băng thông trung bình ≤20 KB/s/client, không nhân ghế/bất tử, 30 phút không rò tài nguyên. ≥10 trận mỗi quy mô 2/4 người trên thiết bị/mạng thật, cả phòng riêng và hàng chờ. Hai tab/mạng giả không thay chơi thật.

Dừng mở rộng nếu khó hiểu vì sao chết, thủ góc quá mạnh, touch che sân, giật xe, lệch kết quả hoặc băng thông tăng dần. Rủi ro hiện tại: 2v2 mạng ảo tối đa 19,3 KB/s; hiệu chỉnh xe ~21 px; điện thoại ngang xe ~13 px; server restart mất trận/queue. Số đo này là lịch sử, không phải nghiệm thu thiết bị thật.

## 10. Việc tiếp theo

1. **P3d:** đọc `P3-SPEC.md` §7–§9; sảnh/queue/HUD/kết quả, test UI/server 4 client, ảnh 3 viewport, báo cáo P3.
2. **Hosting/auth:** chờ quyết định #9, trình khu vực/chi phí/WSS trước đăng ký. Thử hai tài khoản staging và tester/entitlement server; token chỉ tới host tin cậy. TC2 ở `../PROJECT-PLAN.md` là checklist.
3. **Chơi thật/soak/load/restart:** ≥10 trận/quy mô; ghi RTT/correction/tab/lock, nhu cầu lag compensation. Không tự coi mô phỏng là đạt.
4. Bộ P2 cũ có stats A/B, opId/ack, epoch hiệp, revision tường, allowlist tester chưa port đầy đủ; chỉ bổ sung khi cần và có test. Không dùng `state.stats` làm thống kê ghế B trong UI online.
5. P4 → P5; chưa phát hành/đăng ký catalog trước bản duyệt. Chi tiết đầu ra/nghiệm thu: TC1–TC4 trong kế hoạch chung.

## 11. Mã nguồn, chạy và test

`src/games/tank-clash/`: `engine.ts` luật/tuning/bot, `maps.ts` seed/validator, `protocol.ts` wire, `room.ts` lifecycle/queue, `net-client.ts` prediction/reconnect, `trust.ts` host token, `runtime.ts`/CSS UI/input/render, `index.tsx` adapter, `preview.ts` standalone.
`server/tank-clash-room/` hiện hành (Node ≥22.18); `server/tank-clash-spike/` chỉ đối chiếu test. Dùng Node 24 của repo.

```bash
npm ci
npm ci --prefix server/tank-clash-room --ignore-scripts
npm ci --prefix server/tank-clash-spike --ignore-scripts
node scripts/export-tank-review.mjs
npm run dev:tank-server
npm run test:tank-clash
npm run test:tank-clash-server
npm run test:tank-clash-ui
```

Preview: `deliverables/Tank_Clash_P2_Playtest.html` hoặc `preview/tank-clash/index.html` (output). Server mặc định `127.0.0.1:3223/tank`, có `/health`, không phục vụ HTML. Env: `HOST`/`PORT`, `TANK_ALLOWED_ORIGINS`, `SUPABASE_URL`/`SUPABASE_ANON_KEY`; production bắt buộc auth. `TANK_ALLOW_GUESTS=1`, `TANK_QUEUE_GUESTS=1` chỉ môi trường thử (queue guests bị bỏ qua ở production). Build allowlist: `VITE_TANK_CLASH_SERVERS`, chỉ WSS/loopback nhận token. Resume key `tank-clash.seat` trong sessionStorage. Chromium tùy máy; cloud cũ dùng `CHROMIUM_EXECUTABLE=/opt/pw-browsers/chromium`, không giả định máy mới có đường dẫn đó.

## 12. Quy tắc tiếp nối

Nhánh từ main; bộ hiện hành duy nhất `room.ts` + `net-client.ts` + `server/tank-clash-room/`, wire `tank-clash.p3.v1`. Đổi wire phải đổi version + test. Bộ P2 cũ trong commit `1efae45` khác wire dù trùng tên P2, không trộn. Prefix `tc-`, giữ save và game khác; AGENTS/WORKLOG bắt buộc. Kết quả mới log, chưa DB; chưa lag compensation. Bằng chứng P3a–P3c xem spec §13–§15 và archive, không đọc hết để làm P3d.
