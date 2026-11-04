# Tank Clash P3 — nghiệm thu cục bộ · 04/11/2026

Nhánh `codex/tank-clash-p3d`, nền `bfb6732`; tiếp tục checkpoint P3d `6721df6`. P3a–P3c đã có trong main. **P3d có code và bằng chứng cục bộ; chưa hosting, catalog, quyền/thưởng hoặc phát hành.** Mạng thật, tài khoản staging và thiết bị thật thuộc TC2/TC4, chưa được nghiệm thu bằng báo cáo này.

## Phạm vi và sửa lỗi

- Menu 1v1 riêng / 2v2 riêng / tìm 2v2; sảnh chia đội, host chuyển ghế, ready, mã/link mời và người xem.
- Hàng chờ người lẻ/tổ; hủy luôn thấy; 60 s cho đợi tiếp hoặc rời hàng để luyện bot cục bộ. Server thường từ chối khách vào queue, phòng riêng vẫn cho khách.
- HUD bốn HP/tên theo đội, xe mình có viền; người xem không có điều khiển; xe chết xem đồng đội; toast rớt/nối lại/rời không chặn trận.
- Kết quả lấy từ server, có trạng thái bỏ trận; đầu hàng cần xác nhận và đúng điều kiện. Phòng riêng đủ bốn phiếu đấu lại; phòng ghép hết 20 s trả tổ về chung sảnh, người lẻ về menu, không tự queue.
- `online-ui.ts` tách phần trình bày khỏi luật. Patch DOM giữ focus; khung sảnh/queue/kết quả cùng kích thước, nội dung cuộn riêng. Mobile toàn màn hình, desktop 92dvh (tối đa 900 px), rộng 4xl/5xl.
- Đồng hồ đếm ngược/giữ ghế/đấu lại tính thời gian trôi ở `timedRoom`; giữ nguyên dữ liệu `room` và snapshot 20 Hz. Lỗi hủy queue giữ người chơi ở online, không tự chuyển sang bot.
- Không dùng stats tổng của sim làm thống kê riêng ghế B; chưa thêm thống kê từng người ngoài dữ liệu protocol hiện hành. Không đổi wire `tank-clash.p3.v1`.

## D1–D7

| ID | Bằng chứng hiện có | Giới hạn |
|---|---|---|
| D1 | `squad-netcode.test.mjs`: đủ trận, bốn client cùng match ID/điểm/đội thắng ở cả ba cấu hình mạng; UI phòng ghép bốn trang cùng kết quả | Mạng mô phỏng + WS loopback, chưa Internet thật |
| D2 | `queue.test.mjs`: đủ tổ+tổ/tổ+lẻ/lẻ, tranh chỗ/hủy/rớt/khôi phục; UI hai tổ và tổ+hai lẻ giữ đội | Tài khoản UI là khách trên server thử cho phép queue; chưa tài khoản staging thật |
| D3 | `squad-room.test.mjs`, WS 4 client, UI nối lại đúng ghế/HP, rời/đầu hàng/kết quả/đấu lại/hết hạn | Tab đóng/mở lại được thử; chưa khóa màn hình trên điện thoại thật |
| D4 | Test phòng + UI ghế trống và bốn người; không lấp bot online. Chọn luyện bot phải rời queue | Bot chỉ trong chế độ cục bộ |
| D5 | Test phòng từ chối input của spectator; UI 5 trang có người xem, ẩn cần điều khiển/ready, thấy kết quả đúng | Chưa đo tải nhiều người xem |
| D6 | UI online 1v1 và các test P2 hiện hành qua; cục bộ 2v2 bot vẫn chơi/đầu hàng/đấu lại | Không thay số game launcher |
| D7 | Validator Crossfire, seed/fallback/đường nối/spawn, test bot thoát khu xuất phát và UI điều khiển | Cảm giác lái/ngắm và độ rõ xe trên điện thoại vẫn cần chủ dự án chơi thử |

## Kiểm tra đã chạy

Node 24, Chrome macOS; viewport 1280×760, 390×844, 844×390. UI dùng HTML xuất từ source và server Node thật ở loopback; chặn phụ thuộc Auth bằng cấu hình test riêng, không gọi production.

- `test:tank-clash`: **66/66**, gồm timer hiển thị không cần traffic và không sửa snapshot gốc.
- `test:tank-clash-server`: **6/6**, gồm bốn WS thật, reconnect b2 giữ HP/ghế, một kết quả server; auth dùng fixture.
- UI 1v1, 2v2 bot và 2v2 online: 9 kịch bản gồm 4–5 trang, focus/viewport, queue 60 s, hủy lỗi/retry, đăng nhập bắt buộc, rematch thực 20 s. **9/9 qua**; kết quả ghi trong WORKLOG cùng commit.
- Lint/build/bundle/fast qua; smoke **7/7**, modal **22/22**. Đây là kết quả chạy cục bộ của nhánh, chưa chạy remote CI hoặc merge.
- Ảnh sinh ở `test-results/tank-clash-p3d/{lobby,queue,match,result}-{1280x760,390x844,844x390}.png`; không lưu output sinh tự động vào Git.

### Mạng mô phỏng 2v2 (lượt 04/11)

| RTT/jitter/loss | Download max KB/s/client | Upload max KB/s/client | Sai lệch xe khác TB / p95 (px) | Hiệu chỉnh max (px) |
|---|---:|---:|---:|---:|
| 80 / 30 ms / 1% | 16,94 | 3,86 | 11,7 / 21,1 | 0 |
| 150 / 30 ms / 2% | 19,26 | 4,20 | 16,6 / 34,3 | 20,6 |
| 250 / 30 ms / 3% | 17,56 | 4,13 | 22,6 / 55,8 | 21,9 |

Trần giữ **20 KB/s/client**. Mức 19,26 sát trần; không thêm field/tần suất snapshot khi chưa đo lại. TCP loss mô phỏng bằng trễ gửi lại; không phải số đo Wi-Fi/4G. Chưa có lag compensation.

## Chạy lại và bước tiếp theo

```bash
node scripts/export-tank-review.mjs
npm run dev:tank-server
npm run test:tank-clash
npm run test:tank-clash-server
npm run test:tank-clash-ui
```

Mở `deliverables/Tank_Clash_P3_Playtest.html` hoặc HTTP preview, bốn tab mới để thử phòng. P1/P2 là alias tương thích, cùng nội dung hiện hành. Queue cần tài khoản; cờ `NODE_ENV=development TANK_QUEUE_GUESTS=1` chỉ dùng để duyệt local, bị bỏ qua ở production. Không coi cờ này là xác thực staging.

Tiếp theo **TC2**, `PROJECT-PLAN.md`: quyết định hosting #9 → staging/auth thật → ≥10 trận/quy mô trên hai thiết bị/hai mạng → soak/load/restart. Server hiện giữ trận/queue trong RAM và mất chúng khi restart. Chưa đăng ký dịch vụ hoặc deploy; chỉ chủ dự án duyệt phát hành mới merge main/Netlify.
