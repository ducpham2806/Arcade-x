# Tank Clash — Kế hoạch phát triển v1.4 (rút gọn)

Lập 02/11/2026 · rút gọn 03/11/2026. Bản đầy đủ v1.3 (bằng chứng từng đợt, lịch sử nhánh P2, căn cứ Colyseus, nhật ký phiên bản) ở `docs/archive/tank-clash-PLAN-v1.3.md`. Số mục §1–§9 giữ như v1.3 để các dẫn chiếu cũ vẫn đúng; §10–§12 thay cho §10–§15 cũ.

**Trạng thái 03/11/2026:** xong P0, P1, P2 (kỹ thuật, chạy cục bộ), P3a (2v2 cục bộ với bot), P3b (phòng 2v2 online, người xem), P3c (hàng chờ 2v2, tổ đội) — hai phần này chưa có giao diện. Chưa có hosting, chưa thử Internet/thiết bị thật, chưa vào launcher, art/âm thanh là tạm. Chưa duyệt phát hành.

## 1. Mục tiêu

Xe tăng đấu trường nhìn từ trên xuống, chơi trên web điện thoại và PC. Lái, ngắm, bắn độc lập; đọc đường đạn, tận dụng tường phản xạ, phối hợp đánh vòng. Giả thuyết độ vui: né đạn rồi bắn bật tường trúng đối thủ là khoảnh khắc dễ hiểu, đã tay, muốn đấu lại.

Trụ cột: điều khiển điện thoại dễ và phản hồi ngay; đường đạn/vật cản rõ, thắng thua giải thích được; đấu đội có phối hợp thật; vào trận với bạn nhanh bằng mã/link; đồng bộ ổn định, lưu ít dữ liệu.

## 2. Phạm vi

| Mốc | Nội dung |
|---|---|
| Thử cảm giác | Lái, ngắm, bắn bật, vật cản, một kỹ năng, bot, sân tập (cục bộ) |
| Online đầu | Phòng riêng 1v1, server quyết định, nối lại sau mất mạng |
| MVP | 1v1 + 2v2 phòng riêng; hàng chờ 2v2; tổ đội; kết quả, đấu lại; một luật, một loại xe |
| Sau MVP | 3v3 tranh khu vực; 4v4 cướp lõi |

1v1 chỉ qua phòng riêng; hàng chờ công khai chỉ 2v2 để dồn người. Ngoài MVP: ranked, battle pass, nâng cấp sức mạnh, bang hội, voice, campaign.

## 3. Luật MVP

### 3.1 Vòng chơi
Sảnh → luyện tập hoặc phòng → chia đội/sẵn sàng → đấu theo hiệp → kết quả → đấu lại hoặc về sảnh.

### 3.2 Điều khiển
- Điện thoại: cần trái lái (thân xe quay theo hướng lái), cần phải kéo ngắm/nhả bắn (có vùng hủy), nút khiên. Ưu tiên màn ngang trong trận.
- PC: WASD/mũi tên, chuột ngắm, chuột trái bắn, Space khiên.
- Mất focus/kết nối → input về trung tính. Vùng chạm tránh HUD, mép, tai thỏ.

### 3.3 Cơ chế
Tường thép phản xạ; gạch chịu sát thương, chặn đạn; mép bản đồ hút đạn. Đạn của mình trúng mình sau khi bật; friendly fire đồng đội **tắt**. Một viên chỉ gây sát thương một lần, mất khi trúng hoặc bị khiên chặn. Không có vật phẩm ngẫu nhiên. Bot dùng cùng luật.

### 3.4 Thông số khởi điểm — tất cả là [PLACEHOLDER]
HP 3 · sát thương 1 · hồi bắn 0,65 s · tối đa 3 đạn/xe · bật 1 lần · đạn sống 2,5 s · khiên 0,8 s, hồi 8 s · gạch 2 lần trúng · hiệp 60 s · tối đa 3 hiệp · giữ ghế 20 s. Nguồn sự thật là `CONFIG` trong `engine.ts` (sân 1v1 800×480, xe bán kính 16, 155 px/s, quay 10 rad/s, đạn 340 px/s bán kính 3; sân 2v2 1040×624 ở `maps.ts`).

### 3.5 Thắng thua
- Đội còn xe khi đối phương hết xe thắng hiệp; không hồi sinh giữa hiệp.
- Hết giờ: so số xe sống, rồi tổng HP; bằng thì hòa. Cùng bị loại trong một nhịp: hòa.
- Thắng 2 hiệp kết thúc sớm; bằng số hiệp sau giới hạn: hòa trận.
- Server xác nhận đồng hồ, sát thương, chuyển hiệp, kết quả. Xem trận dùng góc nhìn công khai (không có thông tin ẩn).

## 4. Bản đồ

- MVP: sân tập an toàn; Duel nhỏ cho 1v1 (không có đường bắn thẳng vào điểm xuất phát); Crossfire cho 2v2 (lối chính, đường vòng hai bên — nay sinh ngẫu nhiên theo seed, xem `P3-SPEC.md` §4).
- Một loại xe; phân biệt đội bằng màu **cộng** biểu tượng và viền.
- Chưa vui thì sửa bản đồ đang có trước khi thêm mới.
- Sau MVP: 3v3 (hồi sinh, bảo vệ điểm xuất phát), 4v4 (mang lõi, hộ tống, camera/minimap). Không gắn sức mạnh vào gói trả phí.

## 5. Phòng, ghép trận, mất mạng

**Phòng riêng:** tạo → mã/link mời (dễ đọc, có hạn, không phải bằng chứng danh tính) → chia đội → sẵn sàng → bắt đầu. Báo rõ lỗi không tồn tại/đầy/đang chơi/hết hạn/khác phiên bản. Chủ phòng chỉnh đội/luật trước trận (đổi cấu hình xóa sẵn sàng), không sửa được gì trong trận; rời sảnh thì chuyển quyền. Tranh ghế cuối xử lý nguyên tử. Khóa người mới khi đang đấu; nối lại về đúng ghế.

**Hàng chờ và tổ đội:** một hàng chờ 2v2; tổ đội 2 người luôn cùng đội; hủy tìm phải giải phóng chỗ; một tài khoản không giữ nhiều trận. Thiếu người: chọn đợi tiếp hoặc luyện với bot. **Không thêm bot rồi hiển thị như người thật.**

**Mất mạng/bỏ trận:** xe mất kết nối đứng yên nhưng vẫn trúng đạn. Trong thời gian giữ ghế, nối lại giữ nguyên HP/kỹ năng. Hết giờ: bị xử bỏ trận, đồng đội đánh tiếp; cả đội bỏ thì thua; hai đội cùng bỏ hoặc server lỗi thì hủy trận, không trao thắng thua. Đổi tab/khóa màn hình/app xuống nền thử như mất mạng. Đấu lại chỉ khi đủ người đồng ý, không chờ vô hạn.

## 6. Kiến trúc

| Thành phần | Trách nhiệm |
|---|---|
| Client web | Input, hiển thị, âm thanh; dự đoán xe mình, làm mượt xe khác, đối soát với server |
| Room server | Trận trong bộ nhớ; kiểm input; tính xe/đạn/va chạm/HP/đồng hồ/kết quả; giữ ghế |
| Supabase | Tài khoản; sau này kết quả, thống kê, quyền chơi. Không ghi vị trí/đạn theo nhịp |
| Launcher | Lối vào, tải asset khi cần, quyền truy cập, thoát game, trạng thái kết nối |

Nguyên tắc: client gửi ý định, không gửi vị trí/HP; server giới hạn tần suất, tốc độ, hồi chiêu, số đạn; tách nhịp mô phỏng/mạng/vẽ; chỉ gửi phần thay đổi; VFX/âm thanh dựng ở client từ sự kiện; không truy vấn DB trong vòng lặp; kết quả ghi một lần theo match ID, lỗi lưu không làm đứng trận; thoát game hủy hết listener/timer/kết nối. Migration Supabase (nếu có) thử trên PGlite/staging, không đưa secret vào client. Quyền chơi/thưởng xác nhận ở backend; gói hết hạn giữa trận không cắt trận. Không đăng ký dịch vụ trả phí khi chưa duyệt; Netlify static/function không giữ được socket lâu dài.

## 7. Art, UI, âm thanh

2D nhìn từ trên, khối nhờ ánh sáng/bóng, tông arcade cơ khí; thép và gạch khác hình/màu/phản hồi. HUD tối giản (đội, HP, giờ, điểm hiệp, khiên); điều khiển không che xe. Trạng thái cần art: đứng, chạy/bánh xích, quay tháp, giật nòng, trúng đạn, khiên, bị loại. Icon/banner/loading cùng bộ. SFX: động cơ, bắn, bật, gạch vỡ, khiên, hết hiệp; giới hạn số tiếng chồng, dừng khi thoát. Art sản xuất chỉ làm sau khi gameplay được chứng minh; hình tạm ghi rõ là tạm.

## 8. Các mốc

| Mốc | Việc | Điều kiện qua | Trạng thái |
|---|---|---|---|
| P0 | Kiểm kê source, GDD, tuning, spike mạng | Có đường chạy local và lên online | Xong |
| P1 | Cảm giác chơi cục bộ, bot, sân tập | Không kẹt góc/xuyên tường; bắn bật thú vị | Xong (chưa playtest người mới) |
| P2 | Online 1v1: server trọng tài, mã phòng, ready, nối lại, dự đoán/đối soát | Hai máy cùng kết quả; có số đo trễ/băng thông | Xong kỹ thuật; còn hosting + chơi thật |
| P3 | 2v2: đội, tổ đội, phòng riêng, hàng chờ, Crossfire, xem trận, đấu lại | Ghép đúng; xử lý thiếu người/bỏ trận; không bot ẩn | P3a–P3c xong; P3d (giao diện) chưa |
| P4 | Art/VFX/UI/âm thanh, tích hợp launcher, quyền chơi, lưu kết quả | Loading đúng; quyền đúng; thoát sạch | Chưa |
| P5 | QA, mạng yếu, thiết bị, soak/load | Đạt tiêu chí §9, chủ dự án duyệt | Chưa |
| P6 / P7 | 3v3 tranh khu vực / 4v4 cướp lõi, đặc tả riêng | Kiểm thử riêng, không chỉ tăng slot | Chưa |

Thứ tự P0 → P7. Không dời kiểm chứng online ra sau art.

## 9. Kiểm thử và mục tiêu đo — tất cả là [PLACEHOLDER]

| Nhóm | Mục tiêu |
|---|---|
| Cảm giác | Người mới tự lái, bắn, hiểu tường phản xạ trong 60 giây |
| FPS mobile | Hướng 60; chế độ giảm hiệu ứng ≥ 30 |
| Mạng | RTT 80/150/250 ms, jitter 30, mất 1–3 %: không lệch kết quả/HP/hiệp |
| Băng thông | Trung bình ≤ 20 KB/s/client trong trận |
| Kết nối | Không nhân đôi xe/ghế, không bất tử, khôi phục đúng HP |
| Database | Không ghi theo nhịp; kết quả chống ghi trùng |
| Tài nguyên | 30 phút liên tục, không rò listener/timer/âm thanh |
| Chơi thật | ≥ 10 trận mỗi quy mô (2 và 4 người), cả phòng riêng và hàng chờ |

Mạng ảo và hai tab trên một máy **không** thay cho chơi thật; báo đúng phần đã kiểm. Dừng mở rộng nội dung nếu: người mới không hiểu vì sao chết, thủ góc quá mạnh, điều khiển che tầm nhìn, xe giật vì hiệu chỉnh, hai máy khác kết quả, băng thông tăng theo thời gian.

## 10. Việc tiếp theo

1. **P2 hosting** — chờ chủ dự án (`docs/PENDING-DECISIONS.md` mục 9): đề xuất nơi chạy WS lâu dài, khu vực, WSS/reverse proxy, chi phí; chỉ đăng ký sau khi duyệt.
2. **P2 tài khoản** — phần client xong (`trust.ts`: chỉ gửi token tới `wss` trong `VITE_TANK_CLASH_SERVERS` hoặc loopback). Còn: thử hai tài khoản staging; allowlist tester/entitlement phía server. Không đụng DB production.
3. **P2 chơi thật** — 10 trận hai máy/hai mạng; ghi mất mạng/tab/khóa màn hình, ping, hiệu chỉnh, nhu cầu lag compensation; soak/load, restart, bộ nhớ.
4. **Tính năng bộ P2 cũ chưa port** (chỉ làm nếu cần, theo protocol hiện hành + test): thống kê riêng A/B, opId/ack lệnh, epoch hiệp, revision tường, allowlist tester. UI online không dùng `state.stats` làm thống kê ghế B.
5. **P3d** theo `docs/tank-clash/P3-SPEC.md` §7.1, §9 (P3b, P3c xong: §14, §15 của đặc tả): giao diện online 2v2 (sảnh 4 ghế, hàng chờ + màn thiếu người, HUD 4 xe, kết quả, đầu hàng), test UI 4 trang, ảnh chụp, `P3-review.md`.
6. **P4**, rồi **P5**, rồi P6/P7 như §8.

Quy tắc giữ nguyên: CSS prefix `tc-`; modal và toast theo `AGENTS.md`; không force-update khi đang chơi; bot ghi rõ BOT; art tạm ghi rõ; không làm vỡ save cũ; không sửa game PvP khác để ép vừa; ghi `docs/WORKLOG.md` cùng mỗi thay đổi.

## 11. Mã nguồn, chạy và test

| Đường dẫn | Vai trò |
|---|---|
| `src/games/tank-clash/engine.ts` | CONFIG, state, luật, bot, bài học, kết quả; `createState('duel', { online: true })`, chế độ `squad` 4 xe |
| `src/games/tank-clash/maps.ts` | Sinh sân 2v2 theo seed + validator |
| `src/games/tank-clash/protocol.ts` | Hợp đồng wire `tank-clash.p3.v1` (1v1 + 2v2, người xem), kiểm gói, mã phòng |
| `src/games/tank-clash/room.ts` | Host phòng thuần (ghế, vòng đời, tín dụng input, `onResult`) |
| `src/games/tank-clash/net-client.ts` | Dự đoán/đối soát/nội suy, `connectTankRoom` |
| `src/games/tank-clash/trust.ts` | Danh sách máy chủ được nhận token |
| `src/games/tank-clash/runtime.ts`, `tank-clash.css` | DOM/Canvas, input, HUD, dialog, online |
| `src/games/tank-clash/index.tsx`, `preview.ts` | Adapter React (chưa vào catalog); entry standalone + `window.__tankClash` cho test |
| `server/tank-clash-room/` | WS server hiện hành (`ws@8.22.1`, Node 22.18+) |
| `server/tank-clash-spike/` | Spike P0, chỉ để test đối chiếu |
| `scripts/export-tank-review.mjs` | Build `deliverables/Tank_Clash_P2_Playtest.html` (file sinh, không sửa tay) |
| `tests/tank-clash/` | engine, room, netcode (+harness), squad, squad-room, squad-netcode, queue, trust, server, network; UI: `online-ui`, `squad-ui` |
| `docs/tank-clash/` | `GDD-v1.md`, `P0-P1-review.md`, `P2-review.md`, `P3-SPEC.md`, `README.md` |

```bash
npm ci && npm ci --prefix server/tank-clash-room --ignore-scripts && npm ci --prefix server/tank-clash-spike --ignore-scripts
node scripts/export-tank-review.mjs     # HTML tự chứa
npm run dev:tank-server                 # ws://127.0.0.1:3223/tank, chơi khách
npm run test:tank-clash                 # nằm trong test:fast
npm run test:tank-clash-server
npm run test:tank-clash-ui              # Chromium; ở cloud: CHROMIUM_EXECUTABLE=/opt/pw-browsers/chromium
```

Biến môi trường server: `HOST`/`PORT` (mặc định `127.0.0.1:3223`), `TANK_ALLOWED_ORIGINS`, `SUPABASE_URL` + `SUPABASE_ANON_KEY` (bật xác thực, không cần service-role), `NODE_ENV=production` (bắt buộc có auth), `TANK_ALLOW_GUESTS=1` (chỉ cho môi trường thử), `TANK_QUEUE_GUESTS=1` (khách dùng hàng chờ khi thử trên máy; bỏ qua ở production). Server chỉ phục vụ WS và `/health`, không phục vụ HTML. Phòng nằm trong RAM; restart mất trận. Resume token ở sessionStorage key `tank-clash.seat`.

## 12. Quy tắc tiếp nối

- Tách nhánh mới từ `main`. Chỉ một bộ online hiện hành: `room.ts` + `net-client.ts` + `server/tank-clash-room/`. Bộ P2 cũ (`server/tank-clash/`, `online-client.ts`) chỉ còn trong lịch sử commit `1efae45`; wire khác dù cùng chuỗi `tank-clash.p2.v1`, **không trộn**.
- Đổi hợp đồng wire thì đổi version (P3 dùng `tank-clash.p3.v1`) kèm test.
- Kết quả trận hiện chỉ ghi log, chưa ghi DB; chưa có lag compensation.
