# GDD – Rainbow Blocks

*Game Design Document v1.0 · Game xếp hình casual trên nền Web (PC + Mobile) · Tên game là tên tạm, nên đổi/đăng ký riêng để tránh trùng nhãn hiệu "Tetris".*

## 1. Tổng quan

| Mục | Nội dung |
| --- | --- |
| Thể loại | Casual puzzle – falling blocks |
| Nền tảng | Web trình duyệt (Chrome/Safari/Edge/Firefox), PC + Mobile (responsive, có thể cài PWA) |
| Đối tượng | Mọi lứa tuổi, người chơi casual, chơi phiên ngắn 2–10 phút |
| Phong cách | Màu sắc tươi sáng, khối bóng bevel, nền xanh động, hiệu ứng particle đẹp mắt |
| Mô hình | Free to play (không đăng nhập vẫn chơi được), có đăng nhập để lên bảng xếp hạng |
| Ngôn ngữ | Tiếng Việt + Tiếng Anh (i18n từ đầu) |

### 1.1 Trụ cột thiết kế (Design Pillars)

1. **Dễ vào, khó thoát**: luật quen thuộc, chơi được ngay không cần hướng dẫn dài.
2. **Điều khiển cực mượt**: input phản hồi dưới 1 frame, cảm giác "sướng tay" trên cả bàn phím và cảm ứng.
3. **Ăn hàng phải "phê"**: mỗi lần xoá hàng có hiệu ứng hình + âm thanh tăng cấp theo số hàng.
4. **Chơi lại liên tục**: nhiều mode, điểm cao, bảng xếp hạng, mục tiêu ngắn.

## 2. Luật chơi cốt lõi

### 2.1 Bàn chơi (Playfield)

- Lưới **10 cột × 20 hàng nhìn thấy**, cộng **2 hàng ẩn** phía trên (spawn zone).
- Ô trống có lưới mờ; thành bàn có viền sáng (neon cyan) như tham khảo ảnh 2.
- Game over (top-out): khối mới spawn bị chồng lên ô đã có, hoặc khối khoá hoàn toàn nằm trên vùng nhìn thấy.

### 2.2 Các khối (Tetromino) và màu

| Khối | Hình | Màu | Mã màu gợi ý |
| --- | --- | --- | --- |
| I | Thanh dài 4 | Cyan | #1EC8F0 |
| O | Vuông 2×2 | Vàng | #FFC61A |
| T | Chữ T | Tím/Magenta | #B03AC8 |
| S | Chữ S | Xanh lá | #5CCB2E |
| Z | Chữ Z | Đỏ | #E8283C |
| J | Chữ J | Xanh dương | #2858E0 |
| L | Chữ L | Cam | #FF8A1E |

Mỗi ô vuông là sprite bóng bevel có điểm highlight nhỏ góc trên trái (giống ảnh tham khảo).

### 2.3 Sinh khối (Randomizer)

- Dùng **7-bag**: xáo 7 khối thành 1 túi, phát hết rồi xáo túi mới. Đảm bảo không có chuỗi thiếu khối quá dài.
- Hàng chờ **Next**: hiển thị 3 khối (PC), 3 khối (mobile, thu nhỏ). Có thể cấu hình 1–5 trong Settings.

### 2.4 Xoay và wall kick

- Hệ thống xoay **SRS (Super Rotation System)** chuẩn: xoay 90° theo/ngược chiều kim đồng hồ, có bảng wall kick (5 test) riêng cho khối I và các khối còn lại.
- Xoay 180° (tuỳ chọn, bật trong Settings).
- Spawn: giữa bàn, hàng ẩn trên cùng, hướng mặc định theo SRS.

### 2.5 Hold (Giữ khối)

- Một ô Hold. Bấm Hold: đổi khối đang rơi với khối đang giữ (hoặc lấy khối Next nếu ô Hold trống).
- **Mỗi lần khối rơi chỉ được Hold 1 lần**; khi khối đó khoá xuống mới được Hold lại. Ô Hold hiển thị mờ khi đang bị khoá.

### 2.6 Ghost piece, Lock delay

- **Ghost piece**: bóng mờ vị trí khối sẽ rơi tới (bật mặc định, có thể tắt).
- **Lock delay**: 0.5 giây sau khi khối chạm đáy/chồng. Di chuyển hoặc xoay thành công sẽ **reset** lock delay, tối đa **15 lần reset** trên mỗi khối (chống kéo dài vô hạn).
- Khi khối đang trong lock delay có hiệu ứng nháy sáng nhẹ.

### 2.7 Xoá hàng

- Hàng đầy 10 ô sẽ được xoá, các hàng phía trên rơi xuống (gravity kiểu naive – cả hàng trên rơi xuống đúng số hàng đã xoá).
- Xoá cùng lúc 1, 2, 3, 4 hàng (Single / Double / Triple / Quad – gọi là **"Rainbow"** trong game cho 4 hàng).
- Thời gian animation xoá hàng: 250–450 ms tuỳ loại (Rainbow tới 600 ms, gồm hit-stop) (khối kế tiếp vẫn spawn sau khoảng ARE ngắn 100 ms, input được buffer).

## 3. Điều khiển (User Control)

> Phần này là chuẩn để dev implement. Mọi giá trị thời gian ở dạng **hằng số cấu hình** (config JSON) để chỉnh khi test.

### 3.1 Hành động (Input Actions) – tên chuẩn dùng trong code

| Action ID | Mô tả |
| --- | --- |
| MOVE\_LEFT / MOVE\_RIGHT | Dịch khối sang trái/phải 1 ô |
| SOFT\_DROP | Rơi nhanh (giữ để tiếp tục) |
| HARD\_DROP | Thả rơi tức thì xuống đáy và khoá ngay |
| ROTATE\_CW | Xoay thuận chiều kim đồng hồ |
| ROTATE\_CCW | Xoay ngược chiều |
| ROTATE\_180 | Xoay 180° (tuỳ chọn) |
| HOLD | Giữ khối |
| PAUSE | Tạm dừng / mở menu |
| RESTART | Chơi lại (cần xác nhận) |

Tất cả nguồn input (bàn phím, cảm ứng, gamepad) đều **map vào các Action ID này**, sau đó đưa vào một Input Manager duy nhất. Game logic không biết nguồn input.

### 3.2 PC – Bàn phím

| Phím mặc định | Action |
| --- | --- |
| ← / A | MOVE\_LEFT |
| → / D | MOVE\_RIGHT |
| ↓ / S | SOFT\_DROP |
| Space | HARD\_DROP |
| ↑ / X | ROTATE\_CW |
| Z / Ctrl | ROTATE\_CCW |
| Shift / C | HOLD |
| A (khi bật 180°) hoặc V | ROTATE\_180 |
| P / Esc | PAUSE |
| R (giữ 1 giây) | RESTART |

- Cho phép **đổi phím (key rebinding)** trong Settings, lưu localStorage.
- Hỗ trợ **Gamepad API** (D-pad/Analog trái = di chuyển, A = xoay CW, B = xoay CCW, RT/Y = hard drop, LB/RB = hold, Start = pause).
- Chuột: chỉ dùng cho menu. Có thể bật "Mouse control" tuỳ chọn (không bắt buộc ở bản MVP).

#### Thông số lặp phím (DAS/ARR)

| Tham số | Mặc định | Phạm vi chỉnh trong Settings |
| --- | --- | --- |
| DAS (Delayed Auto Shift – trễ trước khi lặp) | 170 ms | 50–300 ms |
| ARR (Auto Repeat Rate – tốc độ lặp) | 40 ms/ô | 0–100 ms (0 = tức thì) |
| SDF (Soft Drop Factor) | 20× gravity hiện tại (tối thiểu 1 ô/50 ms) | 5×–∞ |

Quy tắc xử lý:

- Bấm trái rồi bấm phải khi đang giữ trái: ưu tiên hướng **bấm sau cùng**; nhả phím sau thì quay lại hướng còn đang giữ.
- **Không dùng sự kiện lặp phím của OS** (event.repeat); tự tính DAS/ARR bằng timer trong game loop.
- Hard drop không lặp khi giữ phím (chỉ nhận lần bấm đầu).
- Dùng `keydown/keyup` với `event.code` (không phụ thuộc layout), gọi `preventDefault` cho phím mũi tên/Space để trang không cuộn.
- Tắt phím khi cửa sổ mất focus (blur) và tự pause.

### 3.3 Mobile – Cảm ứng

Hỗ trợ **2 sơ đồ điều khiển**, người chơi chọn trong Settings (mặc định: Gesture).

#### Sơ đồ A – Cử chỉ (Gesture, mặc định)

Vùng nhận cử chỉ: **toàn bộ màn hình phía dưới bảng chơi** và chính bảng chơi (ngoại trừ các nút HUD).

| Cử chỉ | Action | Chi tiết kỹ thuật |
| --- | --- | --- |
| Chạm nhanh (tap) | ROTATE\_CW | Nhấc ngón < 200 ms, di chuyển < 10 px |
| Chạm bằng 2 ngón (two-finger tap) | ROTATE\_CCW | Tuỳ chọn |
| Vuốt/kéo ngang (drag) | MOVE\_LEFT/RIGHT | Khối bám theo ngón: cứ mỗi 1 ô (cell width px) ngón kéo thì dịch 1 ô; không cần nhấc ngón |
| Kéo xuống chậm, giữ | SOFT\_DROP | Kéo dọc > 1 ô và giữ; rơi nhanh tới khi nhả |
| Vuốt xuống nhanh (flick) | HARD\_DROP | Vận tốc dọc > 0.6 px/ms và quãng > 40 px khi nhả ngón |
| Vuốt lên nhanh (flick up) | HOLD | Vận tốc > 0.6 px/ms |
| Chạm vào ô Hold | HOLD | Dự phòng cho người khó dùng flick |
| Chạm nút ⏸ | PAUSE | Nút ≥ 44×44 px |

Quy tắc phân biệt cử chỉ (để tránh nhầm):

- Sau khi chạm xuống, nếu ngón di chuyển > 10 px thì tính là **drag**, không còn là tap.
- Trong 1 lần chạm chỉ khoá 1 trục chính: ngang (move) hoặc dọc (drop/hold). Chọn trục theo hướng di chuyển đầu tiên vượt 10 px.
- Hạn chế vô tình hard drop: chỉ nhận flick xuống khi kết thúc cử chỉ và tốc độ đủ lớn; có tuỳ chọn "Hard drop độ nhạy: Thấp/Vừa/Cao".
- Dùng **Pointer Events** (pointerdown/move/up/cancel) với `touch-action: none` trên canvas; vô hiệu hoá double-tap zoom, pull-to-refresh, text selection, context menu.

#### Sơ đồ B – Nút ảo (On-screen buttons)

Bố cục ngón cái hai bên (landscape/portrait đều có layout riêng):

| Vị trí | Nút | Action |
| --- | --- | --- |
| Trái dưới | ◀ ▶ (D-pad ngang) | MOVE\_LEFT / MOVE\_RIGHT (hỗ trợ giữ để lặp DAS/ARR) |
| Trái dưới | ▼ | SOFT\_DROP (giữ) |
| Phải dưới | ⟳ (lớn) | ROTATE\_CW |
| Phải dưới | ⟲ | ROTATE\_CCW |
| Phải dưới | ⤓ | HARD\_DROP |
| Phải trên | Ô Hold | HOLD |
| Góc trên | ⏸ | PAUSE |

- Kích thước nút tối thiểu **56×56 dp**, khoảng cách giữa các nút ≥ 8 dp; nút xoay lớn nhất.
- Cho phép **kéo để đổi vị trí** và đổi độ trong suốt (30–100%), kích thước (S/M/L), chế độ thuận tay trái/phải.
- Hỗ trợ **multi-touch** (vừa giữ ▶ vừa bấm ⟳). Mỗi nút theo dõi theo pointerId riêng.

#### Phản hồi xúc giác & thị giác (Mobile)

- Rung nhẹ (`navigator.vibrate`) khi: khoá khối (10 ms), hard drop (20 ms), xoá hàng (30/50/80 ms theo số hàng), game over (200 ms). Có công tắc tắt rung.
- Hiển thị nút/vùng bấm sáng lên khi chạm.

#### Bố cục màn hình mobile

- **Portrait (chính)**: HUD trên cùng (Score/Level/Time + Hold + Next), bảng chơi ở giữa chiếm \~65% chiều cao, vùng cử chỉ/nút bên dưới.
- **Landscape**: bảng chơi giữa, Hold + Next hai bên, nút ảo hai bên cạnh.
- Bảng chơi tự scale theo viewport, giữ tỉ lệ 1:2; tránh vùng notch (safe-area).

### 3.4 Xử lý đầu vào chung (dev lưu ý)

- Chạy **fixed timestep 60 Hz**; input được ghi nhận kèm timestamp và xử lý ở đầu mỗi tick.
- **Input buffering**: input trong lúc xoá hàng/ARE (≤ 100 ms) được lưu và áp dụng ngay khi khối mới spawn (gồm cả IRS – xoay trước khi spawn, IHS – hold trước khi spawn).
- Hạn chế input trùng: tap xoay không kích hoạt 2 lần cho 1 lần bấm.
- Pause khi tab ẩn (visibilitychange) hoặc mobile chuyển ứng dụng; có đếm ngược 3-2-1 khi tiếp tục.

## 4. Hệ thống tính điểm

Điểm = điểm cơ bản × **(Level + 1)** cho phần xoá hàng.

| Sự kiện | Điểm cơ bản |
| --- | --- |
| Single (1 hàng) | 100 |
| Double (2 hàng) | 300 |
| Triple (3 hàng) | 500 |
| Rainbow / Quad (4 hàng) | 800 |
| T-Spin Single / Double / Triple | 800 / 1200 / 1600 |
| Perfect Clear (sạch bàn) | +1800 (cộng thêm) |
| Combo | +50 × số combo × (Level + 1), tính từ lần xoá liên tiếp thứ 2 |
| Back-to-Back (Quad hoặc T-Spin liên tiếp) | ×1.5 điểm cơ bản |
| Soft drop | +1 điểm / ô |
| Hard drop | +2 điểm / ô |

- **Combo** reset khi một khối khoá mà không xoá hàng.
- T-Spin: khối T khoá bằng thao tác xoay cuối và có ít nhất 3 trong 4 góc đường chéo của tâm T bị chặn (luật 3-corner). Có thể để tính năng này ở giai đoạn Phase 2 nếu cần rút ngắn MVP.
- Hiển thị popup điểm nổi tại vị trí hàng vừa xoá (+800, COMBO x3, v.v.).

## 5. Cấp độ & tăng tốc theo mốc điểm

Tốc độ rơi (gravity) tăng dần theo **mốc điểm**. Level tăng khi đạt mốc điểm tích luỹ.

| Level | Mốc điểm (từ) | Tốc độ rơi (ô/giây) | Thời gian mỗi ô (ms) |
| --- | --- | --- | --- |
| 1 | 0 | 1.0 | 1000 |
| 2 | 1,000 | 1.5 | 667 |
| 3 | 3,000 | 2.1 | 476 |
| 4 | 6,000 | 2.9 | 345 |
| 5 | 10,000 | 4.0 | 250 |
| 6 | 15,000 | 5.5 | 182 |
| 7 | 22,000 | 7.5 | 133 |
| 8 | 30,000 | 10 | 100 |
| 9 | 40,000 | 14 | 71 |
| 10 | 52,000 | 20 | 50 |
| 11 | 66,000 | 30 | 33 |
| 12 | 82,000 | 45 | 22 |
| 13+ | mỗi +20,000 | 60 (tối đa, 1 ô/frame) | 16 |

- Số liệu là **giá trị khởi điểm để cân bằng**, đặt trong file config (`levels.json`).
- Khi lên level: hiệu ứng "LEVEL UP" (banner chạy ngang + đổi tông màu nền nhẹ + âm thanh), nhạc đổi nhịp nhanh hơn.
- Từ level 10 trở đi giảm lock delay từ 0.5s xuống dần còn 0.3s (tuỳ chọn để tăng độ khó).
- Mode **Custom Speed** không dùng bảng này (xem mục 6.3).

## 6. Các chế độ chơi (Game Modes)

| # | Mode | Mục tiêu | Kết thúc | Bảng xếp hạng |
| --- | --- | --- | --- | --- |
| 1 | **Free Play (Chơi tự do)** | Thư giãn, luyện tập | Không có – chỉ thua khi đầy bàn, có thể bấm kết thúc | Không (chỉ lưu thống kê cá nhân) |
| 2 | **Highest Score (Marathon – Điểm cao)** | Đạt điểm cao nhất | Đầy bàn (top-out) | Có |
| 3 | **Time Attack (Đua thời gian)** | Ghi nhiều điểm nhất trong thời gian giới hạn | Hết giờ | Có (theo từng mốc thời gian) |
| 4 | **Custom Speed (Tuỳ biến tốc độ)** | Chơi ở tốc độ cố định tự chọn | Đầy bàn hoặc người chơi dừng | Có (theo từng mức tốc độ) |
| 5 (mở rộng) | **Sprint 40 Lines** | Xoá 40 hàng nhanh nhất | Xoá đủ 40 hàng | Có (theo thời gian ngắn nhất) |

### 6.1 Free Play

- Bắt đầu ở Level 1, **tốc độ vẫn tăng** như Marathon nhưng không đưa lên bảng xếp hạng; hoặc cho chọn "Tốc độ tăng: Bật/Tắt".
- Có tuỳ chọn trợ giúp: hiện ghost, hiện lưới, **Undo 1 bước** (giới hạn 3 lần/ván), Next queue tối đa 5.
- Mục đích: onboarding, người mới, chơi thư giãn không áp lực.

### 6.2 Highest Score (Marathon)

- Chơi tới khi đầy bàn. Tăng tốc theo bảng mục 5.
- Hiển thị: Score, High Score cá nhân, Level, Lines, Time.
- Khi vượt kỷ lục cá nhân: hiện huy hiệu **NEW BEST** (như ảnh tham khảo 1), pháo hoa nhỏ + âm thanh.
- Kết thúc: màn hình tổng kết (điểm, số hàng, Rainbow, combo cao nhất, thời gian, thứ hạng dự kiến) và nút Nộp điểm / Chơi lại.

### 6.3 Custom Speed (Tuỳ biến tốc độ rơi)

- Trước khi chơi, người chơi chọn **Tốc độ rơi cố định từ 1 đến 20** bằng slider (có hiển thị ô/giây).
- Có công tắc **"Tăng tốc theo điểm"**: Tắt (mặc định, tốc độ cố định) / Bật (tốc độ khởi đầu là mức đã chọn, tăng theo bảng mục 5 từ vị trí tương ứng).
- Hệ số nhân điểm theo tốc độ chọn: `Hệ số = 0.5 + (Tốc độ / 20) × 1.5` (tốc độ 1 → ×0.55, tốc độ 20 → ×2.0) để công bằng khi xếp hạng.
- Bảng xếp hạng riêng cho các nhóm: Chậm (1–5), Vừa (6–10), Nhanh (11–15), Cực nhanh (16–20).

### 6.4 Time Attack

- Người chơi chọn thời lượng: **1 phút / 2 phút / 3 phút / 5 phút** (mỗi mốc có bảng xếp hạng riêng).
- Đồng hồ đếm ngược hiển thị lớn (như đồng hồ bấm giờ ở ảnh tham khảo 1); 10 giây cuối đồng hồ chuyển đỏ + âm đếm nhịp.
- Tăng tốc theo mốc điểm như Marathon (ván ngắn nên bảng tốc nhanh hơn: mỗi mốc điểm của bảng mục 5 chia 2).
- Kết thúc khi **hết giờ** hoặc đầy bàn (giữ điểm đã đạt).
- Điểm cuối = điểm tích luỹ (có thể thêm bonus +100/giây còn lại nếu hoàn thành mục tiêu ở phiên bản sau).

### 6.5 Sprint 40 Lines (mở rộng, Phase 2)

- Xoá 40 hàng nhanh nhất, tốc độ rơi cố định 1.0 (hoặc tuỳ chọn). Xếp hạng theo thời gian nhỏ nhất.

## 7. Bảng xếp hạng (Leaderboard)

### 7.1 Chức năng

- Bảng xếp hạng **riêng cho từng mode/biến thể**: Highest Score, Time Attack (1/2/3/5 phút), Custom Speed (4 nhóm tốc độ), Sprint.
- Phạm vi: **Hôm nay / Tuần này / Mọi thời đại**; thêm tab **Bạn bè** ở phase sau.
- Hiển thị: Hạng, avatar, tên, điểm, level/lines, quốc gia (cờ). Dòng của người chơi hiện luôn ghim phía dưới nếu không nằm trong top.
- Top 100 mỗi bảng; phân trang/tải thêm.

### 7.2 Tài khoản

- **Khách (Guest)**: chơi được mọi mode, điểm lưu cục bộ; khi muốn nộp bảng xếp hạng thì yêu cầu đặt tên hiển thị (hoặc đăng nhập).
- **Đăng nhập**: Google / Apple / Facebook / Email (qua dịch vụ auth như Supabase, Firebase, hoặc backend riêng). Đồng bộ điểm giữa PC và mobile.
- Tên hiển thị có bộ lọc từ nhạy cảm.

### 7.3 Chống gian lận (cơ bản)

- Client gửi kèm **replay data** gọn: seed 7-bag + chuỗi input có timestamp; server **mô phỏng lại** (deterministic) để xác thực điểm với các bảng top.
- Giới hạn tần suất nộp điểm; kiểm tra phi thực tế (điểm/giây quá cao, thời gian ngắn bất thường).
- Ký request bằng token phiên; không tin điểm do client gửi thẳng.
- Vì vậy **game logic phải deterministic**: dùng PRNG có seed (ví dụ mulberry32), không dùng Math.random trong logic.

### 7.4 API gợi ý

| Endpoint | Chức năng |
| --- | --- |
| POST /api/session/start | Tạo seed và session ID cho ván chơi |
| POST /api/score/submit | Nộp điểm: mode, biến thể, score, lines, level, time, replay, sessionId |
| GET /api/leaderboard?mode=&variant=&range=&limit=&offset= | Lấy bảng xếp hạng |
| GET /api/me/stats | Thống kê cá nhân, kỷ lục |

## 8. Hướng đồ hoạ (Art Direction)

Tham khảo hai ảnh bạn gửi: nền xanh dương động, bảng chơi nền tối viền sáng, khối bóng nhiều màu tươi.

### 8.1 Phong cách

- **Màu sắc rực rỡ, độ bão hoà cao** nhưng nền xanh dương đậm để khối nổi bật. Tổng thể vui tươi, sạch, dễ nhìn.
- Khối: bo nhẹ, bevel bóng, có highlight nhỏ góc trên trái, viền tối mỏng để tách ô.
- Bảng chơi: nền tối (#0D1224 – #151C36), lưới mờ, viền neon cyan phát sáng (glow).
- Nền: gradient xanh với **họa tiết lục giác (hexagon) trôi chậm** hoặc sóng nhẹ; mỗi cụm 5 level đổi chủ đề màu nền (xanh dương → tím → xanh ngọc → hoàng hôn cam → dải ngân hà).
- Phông chữ: dạng pixel/tech bo tròn dễ đọc (ví dụ Orbitron, Rajdhani, hoặc Lilita One cho tiêu đề); chữ số điểm có viền cam/đen nổi như ảnh 1.

### 8.2 Bố cục màn chơi PC (1920×1080 tham chiếu)

| Vùng | Nội dung |
| --- | --- |
| Giữa | Bảng chơi 10×20 |
| Trái bảng | HOLD (trên), LINES/LEVEL/SCORE hoặc TIME (dưới) |
| Phải bảng | NEXT (3 khối), SCORE/HIGH SCORE, thông tin mode |
| Góc | Logo, nút Pause, Settings, Âm thanh |

- Canvas giữ tỉ lệ, scale theo chiều cao cửa sổ; panel hai bên ẩn bớt khi cửa sổ hẹp.

### 8.3 Skin/Theme (mở rộng)

- Bộ khối: Classic Glossy (mặc định), Pixel, Neon, Candy (khối kẹo).
- Mở khoá theo cấp độ tài khoản hoặc thành tích (Phase 2).
- **Chế độ hỗ trợ mù màu**: thêm ký hiệu/hoa văn nhỏ lên từng loại khối.

## 9. Hiệu ứng (VFX) – Trọng tâm trải nghiệm

### 9.1 Hiệu ứng xoá hàng theo mức

| Loại | Hiệu ứng hình | Âm thanh | Rung (mobile) | Chữ hiển thị |
| --- | --- | --- | --- | --- |
| **Single** (1 hàng) | Hàng chớp trắng rồi tan thành các mảnh nhỏ (6–10 particle/ô) bay lên; vệt sáng quét ngang 1 lần | Chime ngắn, 1 nốt | 30 ms | "SINGLE" nhỏ (tuỳ chọn) |
| **Double** (2 hàng) | Chớp sáng mạnh hơn, mảnh vỡ đổi màu theo khối, sóng xung kích lan nhẹ ra từ giữa hàng | 2 nốt đi lên | 40 ms | "DOUBLE!" |
| **Triple** (3 hàng) | Tia sáng ngang toàn bàn, khối nổ thành tinh thể màu, màn rung nhẹ (2 px, 150 ms), nền loé | 3 nốt + hiệu ứng sóng | 60 ms | "TRIPLE!!" |
| **Quad / Rainbow** (4 hàng) | **Cầu vồng quét** qua cả bàn, flash toàn màn, pháo hoa/confetti nhiều màu, shake mạnh hơn (4 px, 250 ms), làm chậm thời gian 150 ms (hit-stop) | Hợp âm vang + tiếng nổ confetti | 80 ms | "RAINBOW!!!" chữ lớn có glow |
| **Hơn 4 liên tiếp (combo)** | Số COMBO tăng dần ở cạnh bảng, màu viền chuyển từ cyan → vàng → đỏ, tia lửa quanh bảng | Âm combo tăng cao độ theo từng bậc | 30–50 ms | "COMBO x5" |
| **T-Spin** | Khối T phát sáng tím, vòng sóng xoay quanh | Âm xoay đặc biệt | 50 ms | "T-SPIN DOUBLE" |
| **Perfect Clear** | Toàn bàn chớp vàng, mưa sao/confetti từ trên xuống 1.5 giây | Fanfare ngắn | 100 ms | "PERFECT CLEAR!" |
| **Back-to-Back** | Viền chữ vàng + biểu tượng tia sét cạnh chữ | Âm nhấn | – | "BACK-TO-BACK" |

### 9.2 Hiệu ứng khác

- **Khoá khối (lock)**: flash trắng mờ trên các ô vừa khoá (80 ms).
- **Hard drop**: vệt sáng dọc từ vị trí cũ xuống đáy (trail), bụi/spark khi chạm đáy, rung bàn 1–2 px.
- **Di chuyển/Xoay**: trượt mượt (không giật), xoay có animation nhỏ 60 ms (chỉ hiển thị, logic vẫn rời rạc).
- **Ghost**: viền sáng mờ, không đổ màu nặng.
- **Cảnh báo sắp thua**: khi khối chồng cao đến hàng 16 trở lên, viền bảng nhấp nháy đỏ và nhạc đổi nhịp gấp.
- **Level Up**: banner ngang + vòng sáng lan từ tâm bàn, nền đổi màu mượt.
- **Game Over**: các khối xám dần và rơi sụp xuống từ trên xuống; màn tổng kết trượt vào.
- **NEW BEST**: huy hiệu nổ sao, confetti.

### 9.3 Hiệu năng

- Mục tiêu: **60 FPS** trên máy trung bình và mobile đời trung (3–4 năm tuổi).
- Dùng **object pooling** cho particle; giới hạn tối đa \~300 particle cùng lúc (mobile \~150).
- Có Settings **Chất lượng hiệu ứng: Cao / Vừa / Thấp / Tắt**; tự hạ khi FPS < 45 liên tục 3 giây.
- Có tuỳ chọn "Giảm chuyển động" (tắt rung màn, flash mạnh) để thân thiện người nhạy sáng; **không flash quá 3 lần/giây**.

## 10. Âm thanh

- **Nhạc nền**: 3–5 bản loop sôi động, vui tươi (electro-pop, chiptune nhẹ); đổi bản theo cụm level; tốc độ nhạc tăng nhẹ theo level.
- **SFX**: di chuyển, xoay, khoá, hard drop, hold, xoá hàng 1/2/3/4, combo (tăng cao độ), level up, cảnh báo, game over, NEW BEST, click UI.
- Công tắc riêng: Nhạc / SFX / Rung; thanh âm lượng.
- Web Audio API; **mở khoá audio sau cú chạm đầu tiên** (yêu cầu của trình duyệt mobile); preload sprite âm thanh.

## 11. Luồng màn hình & UI/UX

### 11.1 Sơ đồ màn hình

Splash/Loading → **Main Menu** → Chọn Mode → (Cài đặt ván: tốc độ/thời gian) → Đếm ngược 3-2-1 → **Gameplay** → Pause / Game Over → Tổng kết → (Nộp điểm) → Leaderboard / Chơi lại / Về menu.

### 11.2 Main Menu

- Nút lớn: **Chơi ngay** (mặc định mode Highest Score), Chọn chế độ, Bảng xếp hạng, Cài đặt, Cách chơi, Tài khoản.
- Hiển thị kỷ lục cá nhân và thứ hạng hiện tại.

### 11.3 Cài đặt (Settings)

- Điều khiển: sơ đồ cảm ứng (Gesture/Nút), độ nhạy, đổi phím, DAS/ARR/SDF, vị trí/kích thước nút ảo, thuận tay trái/phải.
- Hình ảnh: theme khối, ghost, lưới, chất lượng hiệu ứng, giảm chuyển động, chế độ mù màu, số khối Next.
- Âm thanh: nhạc, SFX, rung.
- Ngôn ngữ, tài khoản, xoá dữ liệu.

### 11.4 Pause

- Tiếp tục, Chơi lại (xác nhận), Cài đặt nhanh, Về menu (xác nhận mất ván).
- Mobile: tự pause khi chuyển tab/khoá màn hình, có đếm ngược khi tiếp tục.

### 11.5 Hướng dẫn lần đầu (FTUE)

- Người chơi lần đầu vào **Hướng dẫn ngắn 5 bước** trên bảng chơi thật: di chuyển → xoay → thả nhanh → xoá hàng → Hold. Mỗi bước có gợi ý bằng hình ảnh động theo đúng nền tảng (phím trên PC, cử chỉ trên mobile). Có nút Bỏ qua.
- Tự nhận diện nền tảng (touch/keyboard) để hiển thị đúng hướng dẫn.

## 12. Thống kê & nhiệm vụ (giữ chân người chơi)

- Thống kê cá nhân: tổng ván, tổng hàng, số Rainbow, combo cao nhất, thời gian chơi, kỷ lục từng mode.
- **Nhiệm vụ hằng ngày** (Phase 2): "Xoá 30 hàng", "Đạt 1 Rainbow", "Combo x4"; thưởng điểm kinh nghiệm để mở khoá theme.
- Thành tựu (Achievements): Rainbow đầu tiên, Perfect Clear, 100 hàng trong 1 ván…
- Chia sẻ kết quả: tạo ảnh tổng kết (canvas → PNG) để chia sẻ.

## 13. Yêu cầu kỹ thuật cho Web

### 13.1 Công nghệ gợi ý

- Render: **HTML5 Canvas / WebGL** với **PixiJS** hoặc **Phaser 3**; UI bằng HTML/CSS (React/Vue/Svelte) nằm trên canvas.
- Ngôn ngữ: TypeScript. Build bằng Vite.
- Âm thanh: Howler.js hoặc Web Audio API.
- Lưu trữ: localStorage/IndexedDB (cài đặt, kỷ lục khách), backend + DB (tài khoản, xếp hạng).
- PWA: manifest + service worker để cài lên màn hình chính, chạy offline các mode không cần xếp hạng.

### 13.2 Kiến trúc đề xuất

- **Tách logic và hiển thị**: `core/` (board, piece, SRS, bag, scoring, levels, mode rules) thuần TypeScript, không phụ thuộc DOM/render, deterministic, có unit test; `render/` chỉ đọc state và vẽ; `input/` chuyển sự kiện thành Action ID.
- Game loop: `requestAnimationFrame` + tích luỹ thời gian, **fixed timestep 1/60 s**, nội suy khi vẽ.
- Mode được định nghĩa bằng **config + rule hook** (ví dụ `onLineClear`, `onTick`, `isGameOver`) để dễ thêm mode mới.
- Cấu hình dữ liệu ngoài code: `levels.json`, `scoring.json`, `modes.json`, `effects.json`.

### 13.3 Responsive & thiết bị

- Hỗ trợ viewport từ 360×640 đến 4K; canvas scale theo `devicePixelRatio` (giới hạn 2× trên mobile).
- Trình duyệt tối thiểu: Chrome/Edge 100+, Safari 15+ (iOS 15+), Firefox 100+.
- Tối ưu pin: giảm FPS khi tab nền, tắt hiệu ứng nặng ở máy yếu.
- Kích thước tải ban đầu mục tiêu **< 5 MB**, vào menu trong **< 3 giây** trên 4G.
- Dùng sprite atlas, nén âm thanh (OGG/MP3/AAC), lazy-load nhạc nền.

### 13.4 Khả năng truy cập

- Chế độ mù màu, giảm chuyển động, phím tắt đầy đủ, kích thước chữ tối thiểu 14 px (mobile), độ tương phản chữ/nền đạt 4.5:1.

## 14. Phân tích số liệu (Analytics)

- Sự kiện: `game_start`, `game_end` (mode, score, lines, level, time), `line_clear` (loại), `settings_change`, `tutorial_step`, `control_scheme`, `submit_score`.
- Chỉ số theo dõi: D1/D7 retention, độ dài phiên, số ván/phiên, tỉ lệ hoàn thành tutorial, mode được chơi nhiều nhất, tỉ lệ dùng Gesture vs Nút ảo, FPS trung bình theo thiết bị.

## 15. Lộ trình triển khai (Milestone)

| Giai đoạn | Nội dung | Kết quả |
| --- | --- | --- |
| **M1 – Core Prototype** (2–3 tuần) | Board, 7 khối, SRS, 7-bag, hold, ghost, lock delay, điều khiển PC + mobile cơ bản, tính điểm cơ bản | Chơi được ván Marathon |
| **M2 – Vertical Slice** (3–4 tuần) | Bảng level/tăng tốc, 4 mode, art chính thức, VFX xoá hàng 1–4, âm thanh, menu/pause/game over, settings điều khiển | Bản chơi thử nội bộ |
| **M3 – Online** (3 tuần) | Tài khoản, leaderboard, xác thực điểm bằng replay, thống kê cá nhân | Beta công khai |
| **M4 – Polish & Launch** (2–3 tuần) | FTUE, tối ưu hiệu năng, PWA, theme, analytics, QA đa thiết bị | Phát hành v1.0 |
| **Phase 2** | T-Spin, Sprint, nhiệm vụ ngày, theme mới, bạn bè, sự kiện theo mùa | Cập nhật sau launch |

## 16. Danh sách kiểm thử (QA Checklist)

- Điều khiển: DAS/ARR đúng, không kẹt phím khi đổi tab, nhận đúng cử chỉ trên iOS Safari và Android Chrome, multi-touch với nút ảo, không cuộn/zoom trang khi chơi.
- Luật: xoay SRS và wall kick đúng ở sát tường/đáy, Hold chỉ 1 lần/khối, lock delay và giới hạn 15 lần reset, 7-bag không lặp sai, top-out đúng điều kiện.
- Điểm: kiểm tra từng loại xoá hàng, combo, B2B, soft/hard drop, hệ số theo level và theo tốc độ ở Custom Speed.
- Tăng tốc: đúng mốc điểm, đổi level đúng thời điểm, Time Attack dùng bảng chia 2.
- Xếp hạng: nộp điểm đúng bảng, replay xác thực khớp điểm, chống nộp trùng, hiển thị đúng hạng người chơi.
- Hiệu năng: 60 FPS khi Rainbow + combo, không rò rỉ bộ nhớ sau 30 phút chơi, pause/resume ổn định.
- Tương thích: màn hình dọc/ngang, notch/safe-area, 360×640 → 4K, bàn phím layout khác (AZERTY, Dvorak) vì dùng `event.code`.

## 17. Phụ lục: Giá trị cấu hình mặc định

| Tham số | Giá trị |
| --- | --- |
| Kích thước bàn | 10 × 20 (+2 hàng ẩn) |
| Next hiển thị | 3 |
| Lock delay | 500 ms, tối đa 15 lần reset |
| ARE (độ trễ spawn) | 100 ms (0 khi không xoá hàng) |
| Thời gian animation xoá hàng | 250 – 450 ms |
| DAS / ARR | 170 ms / 40 ms |
| Ngưỡng tap | < 200 ms, < 10 px |
| Ngưỡng flick | > 0.6 px/ms, > 40 px |
| Nút ảo tối thiểu | 56 × 56 dp |
| Particle tối đa | 300 (mobile 150) |
| Hold | 1 lần mỗi khối |
| Số lần Undo (Free Play) | 3 lần/ván |

## 18. Đặc tả đồ hoạ (Art Spec)

Chương này cụ thể hoá mục 8 để artist có thể vẽ và dev có thể ráp asset ngay. Hướng chung: lấy **khung neon cyan, lưới mờ, khối bóng bevel** của ảnh 2 làm chuẩn cho bảng chơi, và lấy **chữ số to, viền cam/đen, panel Hold/Next gọn** của ảnh 1 làm chuẩn cho HUD. Không dùng logo, tên hay font gốc của Tetris.

### 18.1 Thông số kỹ thuật chung

| Hạng mục | Giá trị |
| --- | --- |
| Độ phân giải thiết kế (canvas gốc) | PC 1920×1080 (ngang); Mobile 1080×1920 (dọc) |
| Ô khối gốc (master cell) | 128×128 px, xuất ra các mức 64 / 48 / 32 px |
| Ô khối hiển thị | PC: 44–52 px (theo chiều cao cửa sổ); Mobile: tính theo `min(chiều rộng bảng / 10, chiều cao bảng / 20)` |
| Tỉ lệ bảng chơi | 10 : 20 (không kể 2 hàng ẩn) |
| Hệ màu | sRGB, nền trong suốt (PNG-32), premultiplied alpha khi nạp WebGL |
| Định dạng ưu tiên | Atlas WebP (có fallback PNG); hiệu ứng ánh sáng dùng additive blend |
| File gốc | Vector gốc (SVG/Figma/Illustrator), xuất bitmap khi build |

### 18.2 Cách vẽ một ô khối (Block Cell)

Mỗi ô gồm 5 lớp, xếp từ dưới lên:

1. **Viền ngoài**: bo góc 12 px (trên master 128 px), màu `dark` của khối, dày 4 px.
2. **Thân**: gradient dọc từ `base` (trên) sang `dark` 15% (dưới).
3. **Mặt trong lõm**: ô vuông thụt vào 20 px mỗi cạnh, bo 8 px, gradient ngược (sáng ở dưới), tạo cảm giác nút bấm bóng như ảnh tham khảo.
4. **Bevel**: dải sáng `light` dày 8 px ở cạnh trên và trái, dải tối `dark` dày 8 px ở cạnh dưới và phải.
5. **Điểm sáng (specular)**: chấm trắng 10×10 px ở góc trên trái, độ mờ 85%.

Tất cả 7 màu dùng **cùng một khuôn vẽ**, chỉ đổi 3 giá trị màu để artist và dev không phải vẽ riêng từng khối.

### 18.3 Bảng màu khối (Color Tokens)

| Khối | base | light | dark | glow (khi xoá hàng) |
| --- | --- | --- | --- | --- |
| I – Cyan | #1EC8F0 | #7FE6FF | #0A8FB8 | #6FF0FF |
| O – Vàng | #FFC61A | #FFE27A | #C98F00 | #FFE88A |
| T – Tím | #B03AC8 | #D88BEB | #7A2490 | #E3A0F5 |
| S – Xanh lá | #5CCB2E | #A4EC7C | #3A9A18 | #B4F58F |
| Z – Đỏ | #E8283C | #FF7A88 | #A81426 | #FF9AA5 |
| J – Xanh dương | #2858E0 | #7C9CFF | #1A3AA0 | #9DB6FF |
| L – Cam | #FF8A1E | #FFBE7A | #C25E00 | #FFC890 |

- Biến thể khối trạng thái: **Ghost** (viền `base` 60%, ruột trong suốt 12%), **Locked-flash** (phủ trắng 70% trong 80 ms), **Dim/Game over** (giảm bão hoà còn 15% và tối 40%).
- Chế độ hỗ trợ mù màu: thêm biểu tượng nhỏ ở giữa ô (I: gạch, O: vuông, T: tam giác, S: sóng, Z: zigzag, J: chấm trái, L: chấm phải), độ mờ 55%.

### 18.4 Bảng chơi (Board)

| Thành phần | Mô tả |
| --- | --- |
| Nền bảng | #0D1224 → #151C36 (gradient dọc), phủ nhiễu hạt 3% để tránh vỡ dải màu |
| Lưới | Đường mảnh 1 px, trắng 6% độ mờ; các hàng 17–20 sáng hơn 2% để người chơi thấy vùng nguy hiểm |
| Khung viền | Neon cyan #18D8F5, dày 6 px, glow ngoài 12–16 px (cường độ 0.6), bo 20 px; khung thứ hai mờ hơn sát ngoài 14 px |
| Cảnh báo | Viền chuyển đỏ #FF3B4E, nhấp nháy 1 Hz khi chồng cao tới hàng 16 trở lên |
| Đáy bảng | Vạch sáng mảnh để cảm giác "mặt sàn" khi khối chạm đáy |
| Cột đã đầy hàng | Không có vẽ riêng; hiệu ứng xoá hàng xử lý ở mục 20 |

### 18.5 Nền theo cụm level

Nền gồm 3 lớp: **gradient chính**, **hoạ tiết lục giác (hexagon) mờ trôi chậm** (như ảnh 2), và **vài khối sáng bokeh** nhỏ. Mỗi cụm 3 level đổi một tông, chuyển bằng crossfade 1.5 giây khi lên level.

| Level | Tông nền | Gradient gợi ý (trên → dưới) | Hoạ tiết nổi bật |
| --- | --- | --- | --- |
| 1–3 | Xanh dương đại dương | #0B3D8C → #021438 | Lục giác lớn mờ, sóng nhẹ phía dưới (giống ảnh 1) |
| 4–6 | Tím đêm | #3A1A7A → #0E0624 | Lục giác tím, hạt sáng bay lên |
| 7–9 | Xanh ngọc | #0E7C7B → #032C34 | Bong bóng, hạt phát quang |
| 10–12 | Hoàng hôn cam | #D9531E → #3A1048 | Tia nắng, mây dải |
| 13+ | Dải ngân hà | #14143C → #000010 | Sao lấp lánh, tinh vân chuyển động chậm |

- Lớp nền chỉ là ảnh tĩnh + 1 lớp hoạ tiết lặp (tile) cuộn chậm; tránh video nền để giữ dung lượng thấp.
- Giảm độ tương phản của nền ở vùng xung quanh bảng chơi (vignette 35%) để khối luôn nổi bật.

### 18.6 Quy tắc dễ đọc

- Độ tương phản giữa khối và nền bảng ≥ 4.5:1; không dùng nền sáng trong vùng bảng.
- Chỉ **một** hiệu ứng chuyển động mạnh ở nền tại một thời điểm; nền không nhấp nháy.
- Kiểm tra mô phỏng mù màu (đỏ–xanh lá, xanh dương–vàng) cho cả 7 màu trước khi chốt.

## 19. Asset UI / HUD

### 19.1 Bố cục HUD theo nền tảng (toạ độ trên canvas thiết kế)

**PC – 1920×1080, ô khối 48 px**

| Thành phần | Vị trí (x, y) | Kích thước | Ghi chú |
| --- | --- | --- | --- |
| Bảng chơi | (720, 60) | 480×960 | Căn giữa ngang |
| HOLD | (480, 100) | 200×200 | Bên trái bảng, tiêu đề "HOLD" phía trên |
| NEXT | (1240, 100) | 220×560 | 3 khối xếp dọc, khối đầu to hơn 20% |
| TIME / LINES / LEVEL | (440, 600) | 260×360 | Panel trái dưới, chữ số lớn |
| SCORE / HIGH SCORE | (1240, 720) | 380×260 | Panel phải dưới |
| Logo game | (80, 80) | 400×240 | Góc trên trái |
| Tên mode / biểu tượng đồng hồ | (1500, 80) | 340×200 | Góc trên phải, như "Ultra" ở ảnh 1 |
| Nút Pause, Settings, Âm thanh | (1780, 40) | 3 nút 64×64 | Góc phải trên |

**Mobile dọc – 1080×1920, ô khối 60 px**

| Thành phần | Vị trí (x, y) | Kích thước | Ghi chú |
| --- | --- | --- | --- |
| Safe area trên | 0–80 | – | Tránh notch, thanh trạng thái |
| HOLD | (40, 100) | 160×160 | Trên trái |
| SCORE / LEVEL / TIME | (240, 100) | 600×160 | Trên giữa, 3 số xếp ngang |
| NEXT | (880, 100) | 160×300 | 3 khối nhỏ xếp dọc |
| Bảng chơi | (240, 280) | 600×1200 | Căn giữa ngang |
| Vùng điều khiển | (0, 1500) | 1080×420 | Cử chỉ hoặc nút ảo |
| Pause | (40, 280) | 88×88 | Cạnh trái bảng |

**Mobile ngang** dùng bố cục như PC nhưng bảng chơi cao 100% viền an toàn, Hold và Next thu nhỏ 70%, nút ảo đặt ở hai cạnh.

### 19.2 Thành phần UI

| Thành phần | Kích thước nguồn | Trạng thái cần vẽ | Cách dựng |
| --- | --- | --- | --- |
| Panel HUD | 9-slice, lõi 64 px | Thường | Nền #0A1024 độ mờ 55%, viền 2 px trắng 15%, bo 24 px; PC có thể dùng khung kim loại xám như ảnh 1 |
| Nút chính (Chơi ngay) | 9-slice, cao 120 px | Normal / Hover / Pressed / Disabled | Gradient cam–vàng, viền trắng, bóng đổ dưới 8 px |
| Nút phụ | 9-slice, cao 96 px | Normal / Hover / Pressed / Disabled | Gradient xanh dương |
| Nút tròn (Pause, Settings) | 128×128 | Normal / Pressed | Biểu tượng trắng trên nền tròn bán trong suốt |
| Thẻ chọn mode | 560×320 | Normal / Chọn / Khoá | Ảnh minh hoạ mode + tên + mô tả 1 dòng |
| Slider (tốc độ, âm lượng) | Thanh 600×16, núm 56 px | Normal / Kéo | Núm tròn bóng, vạch tick từng mức |
| Công tắc (toggle) | 112×56 | Bật / Tắt | Màu xanh lá khi bật |
| Dòng bảng xếp hạng | 9-slice, cao 96 px | Thường / Dòng của mình / Top 1-2-3 | Top 3 có huy chương vàng, bạc, đồng |
| Popup | 9-slice, lõi 96 px | – | Nền mờ phủ 60% đen phía sau, mở bằng scale 0.9 → 1 trong 180 ms |
| Huy hiệu NEW BEST | 256×256 | – | Ngôi sao nổ màu vàng cam, chữ nghiêng 12° (như ảnh 1) |
| Thanh tiến độ cấp độ | 480×16 | Đầy dần | Gradient cyan → xanh lá |

### 19.3 Điều khiển ảo trên mobile (touch assets)

| Asset | Kích thước | Ghi chú |
| --- | --- | --- |
| Nút ◀ ▶ | 160×160 px (≥ 56 dp) | Khi bấm sáng viền cyan, độ mờ nền 40% |
| Nút ▼ (soft drop) | 160×160 px | Giữ để rơi nhanh |
| Nút xoay CW | 200×200 px | Lớn nhất, đặt gần ngón cái |
| Nút xoay CCW | 160×160 px | Nhỏ hơn nút CW |
| Nút Hard drop | 160×160 px | Biểu tượng mũi tên xuống có vạch |
| Ô Hold (tap) | cùng ô HOLD, vùng chạm mở rộng thêm 24 px | – |
| Gợi ý cử chỉ (FTUE) | Hoạt ảnh bàn tay 256×256, 12 khung | Tap, vuốt ngang, vuốt xuống, vuốt lên |
| Vệt vuốt (swipe trail) | Sprite mảnh, 24 px | Tuỳ chọn, bật theo Settings |

Tất cả nút có hai phiên bản: **Normal** và **Pressed**; độ trong suốt người chơi chỉnh được 30–100% bằng cách thay alpha, không cần asset riêng.

### 19.4 Chữ và font

| Dùng cho | Gợi ý | Ghi chú |
| --- | --- | --- |
| Tiêu đề, nút | Font bo tròn đậm, vui mắt (ví dụ Fredoka, Baloo 2) | **Bắt buộc có subset tiếng Việt**; dev kiểm tra từng chữ có dấu trước khi chốt |
| Nội dung, mô tả | Be Vietnam Pro hoặc tương đương | Hỗ trợ đầy đủ dấu tiếng Việt |
| Số điểm, thời gian | **Bitmap font** tự làm (số 0–9, dấu :, ., +, ×, K, M) | Chữ số to, viền cam hoặc đen dày 4–6 px, đổ bóng; chạy nhanh, đồng bộ độ rộng (monospace) để số không rung khi thay đổi |
| Chữ hiệu ứng (SINGLE, RAINBOW…) | Sprite chữ riêng | Vẽ từng chữ, gradient + viền trắng + glow; có bản VI và EN nếu khác nhau |

- Cỡ chữ tối thiểu: 28 px trên canvas 1080 rộng (≈ 14 px thực trên điện thoại).
- Mọi chuỗi chữ lấy từ file ngôn ngữ (`vi.json`, `en.json`), **không vẽ chữ cố định vào ảnh** trừ chữ hiệu ứng và logo.

### 19.5 Biểu tượng (Icon set)

Bộ icon vector 64×64 px, nét 4 px, bo tròn, màu trắng (đổi màu bằng tint):

Pause · Play · Restart · Home · Settings · Âm thanh bật/tắt · Nhạc · Rung · Cúp · Bảng xếp hạng · Đồng hồ · Tia chớp (tốc độ) · Ngôi sao · Khoá · Chia sẻ · Người dùng · Cờ quốc gia (theo mã nước) · Dấu hỏi (hướng dẫn) · Đóng (X).

### 19.6 Danh sách màn hình cần asset

| Màn hình | Asset riêng cần có |
| --- | --- |
| Splash / Loading | Logo, thanh loading, nền gradient |
| Main Menu | Nền động, logo, 4–5 nút, khối rơi trang trí chạy nền |
| Chọn Mode | 5 ảnh thẻ mode (minh hoạ khối + biểu tượng đặc trưng), slider tốc độ, chọn thời gian |
| Gameplay | Toàn bộ mục 18, HUD mục 19.1 |
| Pause | Popup, 4 nút |
| Game Over / Tổng kết | Banner, huy hiệu NEW BEST, dải thống kê, nút chia sẻ |
| Bảng xếp hạng | Tab (Mode, Thời gian), dòng xếp hạng, huy chương top 3, avatar mặc định |
| Settings | Công tắc, slider, thẻ tab |
| Hướng dẫn (FTUE) | Hoạt ảnh bàn tay, mũi tên chỉ, bong bóng gợi ý |

## 20. Asset hiệu ứng & animation

Chương này là bản asset hoá của mục 9. Nguyên tắc: **hiệu ứng chạy song song, không chặn logic**. Sau 450 ms (Rainbow: 600 ms, đã gồm hit-stop) khối kế tiếp đã spawn và người chơi điều khiển được, phần hiệu ứng còn lại (confetti, glow, chữ nổi) tiếp tục chạy nền.

### 20.1 Kho sprite và texture hiệu ứng

| Asset | Kích thước | Số khung | Dùng cho | Blend |
| --- | --- | --- | --- | --- |
| `fx_shard` | 32×32 | 3 biến thể | Mảnh vỡ khi xoá ô (tint theo màu khối) | Normal |
| `fx_spark` | 32×32 | 1 | Tia lấp lánh 4 cánh | Additive |
| `fx_glow` | 128×128 | 1 | Quầng sáng tròn mềm | Additive |
| `fx_ring` | 256×256 | 1 | Vòng sóng xung kích (scale 0.2 → 2.0) | Additive |
| `fx_streak_h` | 1024×64 | 1 | Vệt sáng quét ngang qua hàng | Additive |
| `fx_streak_v` | 64×1024 | 1 | Vệt hard drop theo cột | Additive |
| `fx_rainbow_sweep` | 1920×160 | 1 | Dải cầu vồng quét qua bảng khi Rainbow | Additive |
| `fx_confetti` | 24×24 | 8 hình × 6 màu | Pháo hoa giấy | Normal |
| `fx_star` | 48×48 | 1 | Sao rơi khi Perfect Clear, NEW BEST | Additive |
| `fx_dust` | 64×64 | 8 khung (sprite sheet) | Bụi khi chạm đáy | Normal |
| `fx_flash` | 4×4 (co giãn) | 1 | Flash toàn màn hoặc toàn hàng | Additive |
| `fx_flame` | 128×256 | 8 khung | Lửa viền bảng khi COMBO cao | Additive |

Tất cả gom vào **một atlas 2048×2048** (WebP), tên khung đặt theo bảng trên, có file dữ liệu JSON mô tả vị trí.

### 20.2 Thông số particle theo mức xoá hàng

| Mức | Hạt/ô | Tuổi thọ | Tốc độ ban đầu | Gia tốc | Ghi chú |
| --- | --- | --- | --- | --- | --- |
| Single | 6 `fx_shard` | 450 ms | 200–400 px/s, hướng lên ± 60° | Trọng lực 1400 px/s² | Thêm 1 `fx_streak_h` quét qua hàng 200 ms |
| Double | 8 `fx_shard` + 2 `fx_spark` | 550 ms | 250–500 px/s | Trọng lực 1400 px/s² | Thêm `fx_ring` ở giữa hai hàng |
| Triple | 10 `fx_shard` + 3 `fx_spark` | 650 ms | 300–600 px/s | Trọng lực 1200 px/s² | `fx_streak_h` ở cả 3 hàng + rung 2 px |
| Rainbow (4 hàng) | 12 `fx_shard` + 4 `fx_spark` + 80 `fx_confetti` toàn bảng | 900 ms (confetti 1500 ms) | 350–700 px/s | Trọng lực 1000 px/s² | `fx_rainbow_sweep`, flash toàn màn, rung 4 px |
| Perfect Clear | 120 `fx_star` | 1500 ms | Rơi từ trên xuống, 150–300 px/s | Trọng lực 300 px/s² | Phủ vàng toàn bảng |

- Số hạt ở bảng trên là cho chất lượng **Cao**; chất lượng Vừa = 60%, Thấp = 30%, Tắt = chỉ flash và chữ.
- Tổng hạt đồng thời tối đa: 300 (PC), 150 (mobile).

### 20.3 Dòng thời gian từng hiệu ứng xoá hàng (ms từ lúc khối khoá)

| Mốc | Single | Double | Triple | Rainbow |
| --- | --- | --- | --- | --- |
| Flash trắng hàng | 0–80 | 0–90 | 0–100 | 0–120 |
| Hit-stop (đóng băng khung hình) | – | – | – | 120–270 |
| Vỡ khối, phát hạt | 80 | 90 | 100 | 270 |
| Vệt sáng / sóng | 80–280 | 90–330 | 100–380 | 270–700 |
| Hàng phía trên rơi xuống | 280–430 | 330–450 | 380–450 | 450–600 (nhanh dần) |
| Chữ nổi hiện | 100 | 100 | 100 | 270 |

Khi lập trình, hit-stop chỉ **đóng băng hoạt ảnh**, không làm trễ đồng hồ Time Attack hay input được buffer.

### 20.4 Hoạt ảnh chữ nổi (popup text)

- Hiện: scale 0.6 → 1.15 → 1.0 trong 220 ms (ease-out-back), giữ 500 ms, bay lên 40 px và mờ dần trong 400 ms.
- Vị trí: giữa bảng, cao hơn hàng vừa xoá 1 ô; chữ COMBO nằm cạnh bảng, không che khối.
- Chữ **SINGLE** nhỏ (tuỳ chọn), **DOUBLE!**, **TRIPLE!!**, **RAINBOW!!!** to dần: chiều cao chữ 48 / 72 / 96 / 140 px trên canvas 1080 rộng.
- Điểm cộng "+800" nhỏ bay lên cạnh chữ chính, dùng bitmap font mục 19.4.

### 20.5 Các hoạt ảnh khác

| Hoạt ảnh | Thời lượng | Mô tả |
| --- | --- | --- |
| Khối di chuyển | 60 ms nội suy | Trượt mượt giữa các ô, logic vẫn rời rạc |
| Xoay | 60 ms | Xoay nhẹ quanh tâm, không làm sai vị trí logic |
| Chạm đáy / khoá | 80 ms | Flash trắng 70% rồi về màu gốc |
| Hard drop | 120 ms | `fx_streak_v` mờ dần + `fx_dust` ở đáy + nhún bảng 1–2 px |
| Hold | 150 ms | Khối thu nhỏ bay vào ô Hold, khối cũ bay ra |
| Spawn khối | 100 ms | Phóng to 0.8 → 1.0, hơi sáng |
| Lên level | 900 ms | Banner "LEVEL UP" trượt ngang, vòng sáng lan từ tâm bảng, nền chuyển tông |
| Cảnh báo sắp thua | Lặp 1 Hz | Viền bảng đỏ nhấp nháy, nền tối dần 10% |
| Game Over | 1.2 giây | Khối xám dần, rơi sụp từ trên xuống từng hàng (cách nhau 40 ms), rồi popup tổng kết trượt vào |
| NEW BEST | 1.5 giây | Huy hiệu nảy ra, sao và confetti bắn lên |
| Đếm ngược 3-2-1 | 3 × 800 ms | Số to phóng vào rồi mờ, âm "tick" mỗi nhịp |
| Màn hình chuyển cảnh | 300 ms | Fade hoặc trượt ngang, không dùng hiệu ứng nặng |

### 20.6 Nguyên tắc tối ưu hiệu ứng

- Tái sử dụng particle bằng **object pool**; không tạo/huỷ đối tượng mỗi lần xoá hàng.
- Hiệu ứng additive dùng chung một lớp (layer) để giảm số lần đổi blend mode.
- Rung màn hình chỉ dịch toạ độ khung vẽ; tắt hoàn toàn khi người chơi bật **Giảm chuyển động**.
- Không có hiệu ứng nào làm màn hình nháy quá 3 lần mỗi giây (an toàn cho người nhạy sáng).

## 21. Danh mục asset, quy ước và quy trình xuất file

### 21.1 Danh mục asset chính

| Nhóm | Asset | Số lượng | Ưu tiên |
| --- | --- | --- | --- |
| Khối | Ô khối 7 màu, ghost, locked-flash, dim, biểu tượng mù màu | 7 + 1 + 1 + 1 + 7 | P0 |
| Bảng chơi | Nền bảng, lưới, khung neon, khung cảnh báo, vạch đáy | 5 | P0 |
| HUD | Panel 9-slice, ô Hold, ô Next, bitmap font số, huy hiệu NEW BEST | 5 | P0 |
| Điều khiển ảo | Nút ◀ ▶ ▼ ⟳ ⟲ ⤓ (Normal + Pressed) | 12 | P0 |
| Nền | 5 nền theo cụm level + 2 lớp hoạ tiết lặp (lục giác, sao) | 7 | P1 |
| Hiệu ứng | Toàn bộ mục 20.1 | 12 nhóm | P1 |
| Chữ hiệu ứng | SINGLE, DOUBLE, TRIPLE, RAINBOW, COMBO, T-SPIN, PERFECT CLEAR, BACK-TO-BACK, LEVEL UP, NEW BEST | 10 (× VI/EN nếu khác) | P1 |
| Menu | Logo, 5 nút, 5 thẻ mode, popup, slider, toggle | \~25 | P1 |
| Bảng xếp hạng | Dòng xếp hạng, huy chương 3 hạng, avatar mặc định, cờ quốc gia | \~10 + bộ cờ | P2 |
| Icon | Bộ 20 icon mục 19.5 | 20 | P1 |
| Theme khối (mở rộng) | Pixel, Neon, Candy (mỗi bộ 7 ô + ghost) | 3 × 8 | P3 |
| Âm thanh | 3–5 nhạc nền, \~25 SFX | \~30 | P1 |

P0 = cần cho prototype M1 (có thể là placeholder), P1 = cần cho vertical slice M2, P2 = M3, P3 = phase 2.

### 21.2 Quy ước đặt tên và thư mục

- Tên file: chữ thường, `snake_case`, dạng `nhóm_tên_biếnthể_trạngthái`, ví dụ `block_i_base.png`, `btn_primary_pressed.png`, `fx_confetti_03.png`, `bg_ocean_main.webp`.
- Không dùng dấu tiếng Việt, khoảng trắng hoặc ký tự đặc biệt trong tên file.
- Cây thư mục:

```
assets/
  source/        # file gốc (Figma, AI, PSD) – không đưa vào bản build
  sprites/       # PNG xuất từ source, chia theo nhóm (blocks, ui, fx, icons)
  atlas/         # atlas đã đóng gói (webp + png + json)
  bg/            # nền theo level
  fonts/         # font và bitmap font
  audio/         # music/, sfx/ (ogg + mp3)
  i18n/          # vi.json, en.json
```

### 21.3 Định dạng và dung lượng

| Loại | Định dạng | Giới hạn |
| --- | --- | --- |
| Atlas sprite | WebP (kèm PNG dự phòng cho trình duyệt cũ) | Mỗi atlas ≤ 2048×2048 |
| Nền | WebP chất lượng 80, 1920×1080 (mobile dùng bản 1080×1920 hoặc cắt giữa) | ≤ 250 KB / ảnh |
| Hoạ tiết lặp | WebP 512×512, tile liền mạch | ≤ 60 KB |
| Font | WOFF2, chỉ lấy subset Latin + tiếng Việt | ≤ 120 KB / font |
| Nhạc nền | OGG Vorbis \~128 kbps (kèm MP3/AAC cho Safari) | ≤ 1.2 MB / bản, loop liền mạch |
| SFX | OGG/MP3 mono 96 kbps, gộp thành audio sprite | ≤ 20 KB / tiếng |
| Lottie/hoạt ảnh phức tạp | Không dùng; ưu tiên sprite sheet và tween trong code | – |

### 21.4 Ngân sách tải ban đầu (mục tiêu < 5 MB)

| Hạng mục | Dung lượng tối đa |
| --- | --- |
| Mã game + thư viện (đã nén) | 0.9 MB |
| Atlas lõi: khối, bảng, HUD, nút, icon | 1.0 MB |
| Atlas hiệu ứng | 0.5 MB |
| Nền level 1 + hoạ tiết | 0.3 MB |
| Font | 0.3 MB |
| Nhạc nền 1 + SFX cốt lõi | 1.2 MB |
| **Tổng** | **4.2 MB** |

Các nền, nhạc và theme còn lại **tải lười (lazy-load)** khi cần hoặc sau khi vào menu.

### 21.5 Quy trình xuất và tích hợp

1. Artist vẽ trong Figma/Illustrator theo khuôn ô khối 128 px và bảng màu mục 18.3.
2. Xuất PNG theo tên chuẩn vào `sprites/`; chạy script đóng gói atlas (ví dụ free-tex-packer hoặc TexturePacker) ra `atlas/` kèm file JSON.
3. Script build tự sinh `manifest.json` liệt kê asset, kích thước và nhóm tải (core / lazy).
4. Dev nạp atlas bằng PixiJS/Phaser; mọi asset gọi qua tên khung, không dùng đường dẫn cứng.
5. Kiểm tra trên 3 thiết bị: PC 1080p, iPhone cỡ nhỏ (khoảng 375 px rộng), Android tầm trung; đối chiếu với bản thiết kế.

### 21.6 Tiêu chí nghiệm thu asset

- Khối 7 màu nhìn rõ trên mọi nền level, không nhầm lẫn khi chơi ở tốc độ cao.
- Không bị nhoè hoặc răng cưa ở 3 mức scale (ô 32 / 48 / 64 px).
- Mọi nút đạt vùng chạm tối thiểu và có đủ trạng thái Normal/Pressed.
- Chữ tiếng Việt có dấu hiển thị đúng trên tất cả thành phần UI.
- Tổng dung lượng tải ban đầu không vượt ngân sách mục 21.4.
- Không có hình, logo, âm thanh hay font vi phạm bản quyền; asset mượn ngoài phải ghi nguồn và giấy phép.

### 21.7 Brief ngắn cho artist

**Từ khoá cảm xúc**: tươi sáng, bóng bẩy, vui nhộn, sạch, năng lượng cao. **Tránh**: tối u ám, quá nhiều chi tiết nhỏ, màu xỉn. **Tham khảo**: ảnh 1 (panel, chữ số, huy hiệu NEW BEST, nền xanh với sóng), ảnh 2 (khung neon cyan, lưới, nền hoạ tiết lục giác). Mỗi màn hình phải đọc được bằng một cái nhìn: khối rơi và hàng sắp đầy luôn là điểm nhấn sáng nhất.
