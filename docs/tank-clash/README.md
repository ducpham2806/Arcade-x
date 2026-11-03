# Tank Clash P2 — tiếp quản

Cập nhật 03/11/2026: có sân tập/bot offline và phòng riêng online 1v1 chạy cục bộ; art là hình khối tạm. Chưa tích hợp catalog sản phẩm, hosting Internet, quyền gói chơi hoặc thưởng. **Trạng thái và việc tiếp theo ở `PLAN.md` §10–§12** (bản đầy đủ v1.3: `docs/archive/tank-clash-PLAN-v1.3.md`); chỉ dùng bộ `room.ts` / `net-client.ts` / `server/tank-clash-room/` hiện hành.

## Chạy bản thử

Từ thư mục gốc Arcade-x, dùng Node 22.18+ hoặc Node 24 và cài dependencies theo lockfile của dự án:

```bash
node scripts/export-tank-review.mjs
```

Mở `deliverables/Tank_Clash_P2_Playtest.html` bằng trình duyệt. File chứa toàn bộ CSS và JavaScript, không tải asset từ ngoài. Script giữ alias tên P1 cho công cụ cũ; alias được tạo lại cũng chứa UI P2 hiện hành. `preview/tank-clash/index.html` là cùng bản để chạy qua static server.

- Sân tập: 5 bài, phải thực hiện đúng cơ chế để mở bài kế.
- Đấu luyện: 1v1 với bot, tối đa 3 hiệp, mỗi xe 3 máu.
- PC: WASD/mũi tên lái, chuột ngắm và giữ chuột trái bắn, Space khiên, P/Escape tạm dừng.
- Touch: cần trái lái; kéo cần phải ngắm, nhả bắn; chạm khiên.
- Khi mất focus, game tạm dừng và xóa input đang giữ.

Các con số trên là [PLACEHOLDER] cho chơi thử, không phải cân bằng đã được người chơi kiểm chứng.

## Online 1v1 (P2)

```bash
npm ci --prefix server/tank-clash-room
npm run dev:tank-server        # ws://127.0.0.1:3223/tank, chơi khách
```
Mở bản preview ở hai cửa sổ, chọn "03 / Online 1v1". Đổi server bằng `?server=wss://...`; link mời có dạng `?room=MÃ`. Chi tiết, số đo và giới hạn: `docs/tank-clash/P2-review.md`.

## Kiểm thử

```bash
npm ci --prefix server/tank-clash-spike --ignore-scripts
node --test tests/tank-clash/engine.test.mjs tests/tank-clash/network.test.mjs
npm run test:tank-clash          # engine + phòng + mạng ảo (trong test:fast)
npm ci --prefix server/tank-clash-room && npm run test:tank-clash-server   # WebSocket thật
npm run test:tank-clash-ui       # Playwright: 2 trang + server thật
```

Server thử nghiệm có dependency riêng, không thêm dependency mạng vào bundle launcher. `network.test.mjs` mở server loopback và hai WebSocket client thật rồi đóng khi xong; không dùng hoặc thay đổi Supabase.

## Cấu trúc

| File | Trách nhiệm |
|---|---|
| `src/games/tank-clash/engine.ts` | Luật thuần, fixed step, va chạm quét, bot, bài tập, kết quả hiệp |
| `src/games/tank-clash/runtime.ts` | Input keyboard/pointer, vòng vẽ, HUD/dialog, góp ý thủ công |
| `src/games/tank-clash/index.tsx` | Adapter React với cleanup và nhận trạng thái pause |
| `src/games/tank-clash/preview.ts` | Điểm vào standalone |
| `scripts/export-tank-review.mjs` | Bundle preview một file bằng esbuild hiện có |
| `server/tank-clash-spike/server.mjs` | Thử hợp đồng input/snapshot, ghế reconnect và sequence (P0, giữ để so sánh) |
| `src/games/tank-clash/protocol.ts` | P2: giao thức, kiểm tra gói tin, mã phòng, nén snapshot |
| `src/games/tank-clash/room.ts` | P2: máy chủ phòng không phụ thuộc mạng (vòng đời, giữ ghế, xử thua, tín dụng input) |
| `src/games/tank-clash/net-client.ts` | P2: dự đoán/đối soát/nội suy, wrapper WebSocket cho trình duyệt |
| `server/tank-clash-room/server.mjs` | P2: server WebSocket, origin allowlist, xác thực Supabase tuỳ chọn |

## Giới hạn P0 network spike

- Chỉ bind `127.0.0.1`, một phòng hai ghế, token ghế tạm trong bộ nhớ. Đây không phải tài khoản thật, không phải hệ phòng sản phẩm.
- Input phải hợp lệ; server quyết định vị trí, đạn và máu. Input cũ tự trung tính sau 250 ms [PLACEHOLDER].
- Gửi snapshot động 10 Hz và mô phỏng fixed step 60 Hz [PLACEHOLDER]. Thời gian timer Node trong spike chưa phải scheduler production có bù độ trôi.
- Tường gửi lúc hello/reconnect và khi thay đổi; không có ghi database từng tick.
- Reconnect về đúng ghế và HP, server cấp sequence tiếp theo. Chưa có lifecycle bỏ trận đầy đủ, nhiều phòng, matchmaking hoặc định tuyến khu vực.
- Thử nghiệm local không chứng minh chất lượng Internet. P2 cần prediction/reconciliation/interpolation, clock/scheduler, auth thật, luật rời phòng và thử RTT/jitter/loss.

## Quy tắc phát triển tiếp

- Giữ engine độc lập với DOM, storage và network.
- Luật phản xạ dùng chung cho đạn và đường ngắm; sửa phải kèm kiểm thử va chạm.
- Không ghi vị trí/đạn vào database từng frame.
- P1 không gọi bridge cấp coin/EXP/leaderboard. Kết quả PvP sản phẩm phải được backend xác nhận.
- Bot luôn ghi nhãn BOT. Hình tạm luôn ghi rõ P1.
- `destroy()` phải hủy animation frame, listener và input. React adapter dùng controller, không rerender React mỗi tick.
- Chỉ đưa vào catalog sau mốc tích hợp của plan. Trước khi phát hành công khai, giao build để anh Đức duyệt.
