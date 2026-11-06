# Tank Clash P3 — đặc tả MVP 2v2 · v0.5

Rút gọn 04/11/2026 từ [v0.4 nguyên văn](../archive/tank-clash-P3-SPEC-v0.4.md). Quyết định đã duyệt 03/11 giữ nguyên; P3a–P3d đã có code/test cục bộ; [P3-review](P3-review.md) ghi bằng chứng và giới hạn. Giữ số mục để tra dẫn chiếu. Số tuning là khởi điểm, chưa nghiệm thu thiết bị thật. Làm P3d: §7–§9 trước, mở luật liên quan khi cần.

## 1. Mục tiêu và điều kiện xong

P3 biến bản 1v1 online thành **bản thử 2v2 hai hoặc bốn người**: đấu đội trong phòng riêng, tổ đội 2 người, một hàng chờ 2v2 công khai, xem trận, hủy tìm trận, xử lý thiếu người/bỏ trận và đấu lại.

Điều kiện chuyển bước (PLAN §8): **ghép và chia đội đúng; xử lý được thiếu người/bỏ trận; không thêm bot ẩn.** Cụ thể hóa thành tiêu chí kiểm được:

| # | Tiêu chí | Cách kiểm |
|---|---|---|
| D1 | Bốn client cùng thấy một kết quả trận, tỉ số và đội thắng do server xác nhận | Test netcode 4 client ở RTT 80/150/250 ms, jitter 30 ms, mất 1–3 % |
| D2 | Tổ đội 2 người luôn cùng đội khi vào hàng chờ; không ai bị ghép vào hai trận | Test hàng chờ (bảng §6.4) |
| D3 | Rời trận, mất mạng quá giờ giữ ghế, cả đội bỏ, cả hai đội bỏ: kết quả đúng bảng §3.4 | Test phòng |
| D4 | Không có bot nào trong trận online; mọi ghế trống hiển thị "trống" | Test phòng + test UI |
| D5 | Người xem không gửi được input, không ảnh hưởng kết quả | Test phòng |
| D6 | Phòng 1v1 P2 vẫn hoạt động như cũ | Toàn bộ test P2 hiện có vẫn qua (đổi version có chủ đích, §5.1) |
| D7 | Bản đồ Crossfire: không có đường bắn thẳng giữa hai khu xuất phát; không kẹt xe ở góc | Test engine + chơi thử |

**Không nằm trong P3:** ranked/MMR, nhiều khu vực, lưu kết quả vào database, phần thưởng, tích hợp launcher/catalog (P4), art/âm thanh sản xuất (P4), 3v3/4v4 (P6/P7), hàng chờ 1v1 công khai (PLAN §2: chỉ mở 2v2 để dồn người chơi).

## 2. Hiện trạng code liên quan (để ước lượng đúng)

P3a engine/maps/bot, P3b phòng/client 4 ghế, P3c queue/tổ và P3d UI online 1v1/2v2 đã có. `runtime.ts` + `online-ui.ts` dùng chung backend hiện hành; 2v2 bot cục bộ có UI riêng. Không viết lại server để làm P3d; dùng API đã có trong `net-client.ts`. Nguồn tuning là `CONFIG`/`NET`/`maps.ts`.

## 3. Luật chơi 2v2

### 3.1 Trận và hiệp

Tối đa 3 hiệp, thắng 2 kết thúc sớm; 60 s/hiệp, HP 3. Hết giờ so xe sống → tổng HP → hòa; xe cuối hai đội chết cùng tick → hòa. Không hồi sinh giữa hiệp; hiệp mới xe hợp lệ đủ HP. Xe bị loại xem đồng đội, không đổi camera toàn sân.

### 3.2 Đội và vị trí

`a/a2` đội 0, `b/b2` đội 1; mã engine = ghế. Đội mình xanh + ●, đối thủ cam + ▲; viền sáng xe mình. Đổi vị trí trong đội mỗi hiệp (tuning cần playtest), không phân biệt chỉ bằng màu.

### 3.3 Đồng đội

Đạn xuyên đồng đội (không chặn/không sát thương); đạn bật tự hại. Xe không đi xuyên nhau, khiên chỉ bảo vệ bản thân; bot cùng luật, không item ngẫu nhiên.

### 3.4 Mất mạng, rời trận, bỏ trận

| Tình huống | Kết quả |
|---|---|
| Mất mạng | Xe đứng yên vẫn trúng đạn; giữ ghế 20 s, reconnect giữ HP/kỹ năng |
| Hết giữ ghế / rời | Bỏ trận theo người tới hết trận; HP 0 ở hiệp sau, không vẽ/chặn đường; không resume ghế đã bỏ |
| Cả đội bỏ | Thua `forfeit` ngay |
| Hai đội cùng hết người hợp lệ trong tick | Hủy `cancelled`, không thắng/thua |
| Rời sảnh/đếm ngược | Trả ghế, hủy đếm, mọi người mất ready |

Kết quả có `players[].forfeited` để P4 không thưởng người bỏ dù đội thắng. **Đầu hàng online** chỉ khi mọi đồng đội đã bỏ hoặc mất kết nối; người còn lại xác nhận lần nữa, server ghi `surrender`. Cục bộ 2v2 bot: đầu hàng trong pause.

## 4. Bản đồ Crossfire

### 4.1 Kích thước sân

Đã duyệt sân lớn/ngẫu nhiên: 1040×624 (Duel giữ 800×480). Trên 844×390 xe khoảng 13 px; nhãn tự phóng to. Nếu playtest không đọc được: cân nhắc thu `SQUAD_SIZE` hoặc camera bám (chưa làm), không tự đổi thiết kế đã duyệt.

### 4.2 Bố cục sinh ngẫu nhiên

Server chọn seed mới mỗi trận, giữ bố cục qua hiệp/gạch hồi lại. Nửa trái từ 7 mẫu chướng ngại trên lưới 52 px (7–10 cụm), một trong 4 khối giữa; nửa phải xoay 180°; tường chắn spawn cố định. `validateArena` phải kiểm:
1. Không bắn thẳng giữa spawn hai đội (9 tia lệch ±12 px/cặp, có thép chặn).
2. Mọi chỗ xe đứng được (bán kính 17) nối thông khi gạch nguyên.
3. Spawn nối bằng hành lang ≥48 px.
4. Vòng 60 px quanh mỗi spawn không tường.
5. Đối xứng tâm `(x,y,w,h)` ↔ `(W−x−w,H−y−h)`.

Không đạt sinh lại tối đa 40 lần rồi fallback có test. Đo lịch sử 300 seed không fallback, TB 1,4 lần/28 ms; không phải số đo mobile.

### 4.3 Bản đồ dữ liệu

`maps.ts`: `crossfire(seed)`, `validateArena`, `SQUAD_SIZE`, `SQUAD_SPAWNS`; state lưu `map={id:'crossfire',seed}`. Duel giữ luật/bố cục cũ.

## 5. Giao thức và máy chủ phòng

### 5.1 Phiên bản

`tank-clash.p3.v1` phục vụ cả 1v1/2v2; client cũ báo `PROTOCOL_MISMATCH` + yêu cầu tải lại. Đổi wire phải đổi version/test; không trộn bộ P2 cũ.

### 5.2 Thay đổi tin nhắn

| API/tin | Nghĩa hiện hành |
|---|---|
| `create(name,format)` | `1v1` mặc định hoặc `2v2` |
| `join(code,name,as)` | player ở sảnh; spectator vào cả giữa trận |
| `team` / `move` | Tự đổi đội nếu còn chỗ / host xếp ghế ở sảnh; host xếp làm mọi người mất ready |
| `seat` (server) | Báo ghế mới khi đổi, giữ resume token |
| `surrender` | Server kiểm điều kiện §3.4 |
| `queue` / `unqueue` | Người lẻ kèm protocol/name/token khi tìm từ menu; tổ dùng phòng hiện tại; ai trong tổ cũng hủy cả tổ |

Room view có `format`, `kind` (`private`/`queue`), `spectators`, `queue`, `rematchMs`; seat có team/forfeited. Kết quả có format, name/team/forfeited từng người, reason gồm `surrender`. Spectator có token xem riêng; mọi tin ngoài leave bị `BAD_MESSAGE`, không ngắt socket. Reject field thừa/loại lạ. Mã lỗi thêm: `TEAM_FULL`, `NOT_HOST`, `WRONG_PHASE`, `SURRENDER_LOCKED`, `QUEUE_INVALID`, `ROOM_QUEUED`; hiển thị thông điệp tiếng Việt. Schema chính xác: `protocol.ts`, không dựng payload từ bản nháp archive.

### 5.3 Phòng

4 ghế, người mới xen `a,b,a2,b2`; host kế theo `a,a2,b,b2`. Chỉ đếm ngược khi đủ 2+2, cả bốn kết nối/ready; không bot. Host không thêm quyền giữa trận. Tối đa 4 spectator (tạm), góc nhìn công khai không trễ. Tranh ghế/ready nguyên tử.
Snapshot 20 Hz; số đo 2v2 tối đa 19,3 KB/s sát trần **20** của PLAN (mức 30 trong nháp cũ không phải tiêu chí chấp nhận). Không thêm dữ liệu mà bỏ đo.

### 5.4 Đấu lại

Phòng riêng: đủ 4 ready; ai rời trả ghế/về sảnh chờ người mới. Phòng ghép: 20 s để đủ 4 đồng ý; không đủ thì giải tán, tổ về phòng riêng chung **không tự tìm tiếp**, người lẻ về menu. Không chờ vô hạn.

## 6. Tổ đội và hàng chờ 2v2

### 6.1 Tổ đội

Phòng riêng 2v2 có 1–2 người cùng đội, đối phương trống; host bấm tìm. Mời qua mã/link, không xây hệ bạn bè mới. Đang tìm khóa join/đổi đội; bất kỳ thành viên hủy/rời thì cả tổ rời hàng.

### 6.2 Hàng chờ

Một hàng trong RAM/một tiến trình/khu vực, chưa MMR. Bắt đăng nhập; khách vẫn được phòng riêng. Ghép tổ+tổ ưu tiên, rồi tổ+2 lẻ/4 lẻ theo thứ tự; không tách tổ, không một account hai nơi. Không ghép người đang mất mạng.
Phòng ghép đếm 5 s không cần ready, không join qua mã; mất người trong đếm thì hủy và trả người còn lại đúng vị trí cũ, dựng lại tổ. Mất mạng khi tìm giữ 10 s: cùng account queue lại giữ chỗ, quá hạn loại; thành viên tổ quá hạn thì hủy cả tổ. Restart mất hàng/trận, phải nói rõ.

### 6.3 Thiếu người

Sau 60 s UI hiện **Tiếp tục đợi / Luyện với bot**; chọn bot phải rời hàng, mở 2v2 **cục bộ** 1 người + 3 bot, gắn BOT rõ. Server không tự lấp bot.

### 6.4 Tình huống hàng chờ phải test

| Tình huống | Kết quả |
|---|---|
| Tổ A + tổ B | Mỗi tổ một đội |
| Tổ A + lẻ x,y | A một đội; x,y một đội |
| Lẻ x,y,z,w | x+y / z+w theo thứ tự |
| Tổ A + x (3 người) | Chưa ghép, không tách A |
| A, x, B lần lượt | Ưu tiên A+B; x tiếp tục chờ |
| Một người hủy | Cả tổ rời hàng, về sảnh |
| Account ở tab khác | `ALREADY_IN_ROOM`, tab đầu không đổi |
| Rớt khi đếm | Hủy, người còn lại về đúng chỗ cũ |
| Đua ghép một người | Không thể ở hai trận; ghép đồng bộ một tiến trình |

## 7. Client

### 7.1 Giao diện (theo AGENTS.md)

- Menu: 1v1 riêng / 2v2 riêng / tìm 2v2.
- Sảnh 4 ghế chia 2 đội: mã/copy/link, đổi đội, host xếp ghế, ready, số spectator; “Tìm trận” chỉ host khi tổ hợp lệ. Giữ khung cố định giữa sảnh/queue/kết quả, cuộn trong.
- Hàng chờ: đồng hồ tăng cả khi không có room update, số người trong tổ, hủy luôn thấy; thiếu người §6.3; báo rõ yêu cầu đăng nhập.
- HUD: 4 HP theo đội, mình bên trái; tên/biểu tượng/viền; toast đồng đội rớt/rời không chặn. Xe chết xem đồng đội; spectator không điều khiển.
- Kết quả: điểm đội + từng người/forfeited, reason rõ, rematch đếm đúng §5.4; đầu hàng chỉ lúc hợp lệ, cần xác nhận.
- Sảnh vừa mobile 390×844 và 844×390 không cuộn thừa; desktop 1280×760. Không dùng stats chung của sim làm thống kê ghế B.

### 7.2 Netcode

Prediction xe mình; 3 xe khác interpolation lùi 100 ms. Đo correction, sai lệch TB/p95, băng thông 4 client. Lag compensation chưa làm, chỉ quyết sau chơi thật. Reconnect giữ ghế/HP; tự queue lại dùng cơ chế đã có.

### 7.3 Chế độ cục bộ

Đã có thẻ 03: a người, a2 đồng đội bot, b/b2 đối thủ bot; tất cả BOT có nhãn. Bot nhắm địch sống gần có LOS, giãn đồng đội, cùng luật. Giữ nguyên khi làm UI online.

## 8. Kế hoạch kiểm thử

### 8.1 Engine

Crossfire 5 điều kiện §4 + fallback/seed; Duel hồi quy; friendly fire/tự hại/va chạm; xe chết/bỏ không cản/không respawn; timeout theo xe/HP, hòa cùng tick, bot ra khỏi spawn. Có trong `squad.test.mjs` và engine tests.

### 8.2 Phòng

4 ghế/đội/host/ready; không bắt đầu 3 người hoặc 3–1; tranh ghế; mỗi dòng §3.4; result một lần/match; spectator không điều khiển; rematch hai loại. Có `squad-room.test.mjs`.

### 8.3 Hàng chờ

Đủ §6.4 + bắt đăng nhập, hủy giải phóng, mất mạng 10 s, đúng chỗ cũ, không ghép người offline, không bot. Có `queue.test.mjs`; không viết lại test đã có chỉ để tăng số ca.

### 8.4 Netcode

4 client đủ hiệp, RTT 80/150/250, jitter 30, loss 1/2/3%; cùng kết quả; reconnect `b2` đúng ghế/HP; ghi băng thông/correction/sai lệch. Có `squad-netcode.test.mjs`; mô phỏng không thay mạng thật.

### 8.5 Server và UI

**P3d đã kiểm cục bộ:** WS 4 client; UI 4–5 trang cho sảnh/đổi đội/queue/hủy/thiếu người/trận/kết quả/rematch, spectator/đầu hàng/reconnect; ảnh 1280×760, 390×844, 844×390; hồi quy 1v1 và 2v2 bot. Xem [P3-review](P3-review.md). Mạng/tài khoản/thiết bị thật, soak/load và duyệt phát hành vẫn chưa đạt bằng các test này.

## 9. Chia việc (để duyệt theo phần)

| Phần | Trạng thái / đầu ra |
|---|---|
| P3a | Xong maps/engine/bot/cục bộ + test |
| P3b | Xong wire/phòng 4 ghế/spectator/surrender/client + test |
| P3c | Xong queue/tổ/reconnect/rematch + test |
| **P3d** | Code/test cục bộ §7/§8.5 + ảnh 3 viewport + `P3-review.md`; chờ chủ dự án duyệt và TC2 thật |

Mỗi phần commit + WORKLOG; lint/build/bundle/test:fast + test:tank-clash-server/ui. Trước merge đủ CI. Chi tiết checklist/hosting/phát hành: TC1–TC4 trong `../PROJECT-PLAN.md`.

## 10. Rủi ro

Xe mobile ngang ~13 px; 2v2 mạng ảo correction tới ~21 px/11 lần mỗi trận, tải tối đa 19,3 KB/s sát trần; bot/arena chưa playtest; queue/trận mất khi restart. Đo thật trước art/mở rộng. Không hạ test budget; lỗi wire báo tải lại.

## 11. Câu hỏi cần chủ dự án quyết

Đã quyết 03/11: Q1 sân lớn/ngẫu nhiên; Q2 queue bắt đăng nhập; Q3 đầu hàng; Q4 cục bộ 1 người + bot đồng đội vs 2 bot; Q5 làm P3 theo phần. Không hỏi lại. Hosting vẫn chờ #9 tại `../PENDING-DECISIONS.md`.

## 12. Nhật ký

v0.1–v0.4 và bằng chứng nguyên văn: archive v0.4. v0.5 chỉ rút gọn/sửa mô tả lỗi thời, không đổi luật; nguồn chính xác giao thức/tuning là code.

## 13. Kết quả P3a — 03/11/2026

Maps/engine/squad bot/UI cục bộ xong; sửa bot kẹt spawn bằng lưới 20 px + cache. Test lịch sử 10 engine + 2 UI; chưa playtest thật. Chi tiết/bằng chứng: archive v0.4 §13 và `../archive/WORKLOG-2026-11.md`.

## 14. Kết quả P3b — 03/11/2026

Room 4 ghế/protocol/client xong; 9 room + 4 netcode tests lịch sử. Mạng ảo max tải 19,3 KB/s, correction ~21 px; bảng RTT/sai lệch đầy đủ: archive v0.4 §14. Chưa UI online 2v2, chưa chơi thật.

## 15. Kết quả P3c — 03/11/2026

Queue/tổ/reconnect/rematch xong; 12 queue tests + WS ghép hai tổ. Sửa đồng hồ chờ đứng bằng cộng thời gian client. Giới hạn một tiến trình/chưa MMR. Bằng chứng mutation test/code đầy đủ: archive v0.4 §15; CI của mốc merge trong handoff. P3d được bổ sung ở đợt tiếp theo; xem `P3-review.md`.
