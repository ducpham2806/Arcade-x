# Tank Clash P3 — Đặc tả MVP 2v2

Phiên bản: v0.1 (bản nháp chờ duyệt) · Ngày: 03/11/2026 · Căn cứ: `PLAN.md` §2–§5, §8 (P3), §15.7 mục 5; code P2 hiện hành trên main.

**Trạng thái:** đặc tả, chưa code. Mọi số liệu ghi [PLACEHOLDER] là giá trị khởi điểm để thử, chưa phải cân bằng. Các câu hỏi cần chủ dự án quyết ở **§11**; em đề xuất phương án mặc định cho từng câu để không chặn việc.

---

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

Engine đã sẵn phần lớn luật đội, không cần viết lại:

- `Tank.team` và `Bullet.team` đã có; đạn **xuyên qua đồng đội** (bỏ qua tank cùng team), đạn của chính mình trúng mình sau khi bật — đúng PLAN §3.3 (tắt friendly fire, vẫn tự hại khi bật).
- `resolveRound()` đã so theo đội: số xe còn sống → tổng HP → hòa. Cùng bị loại trong một nhịp → hòa.
- `canOccupy()` đã chặn xe chồng lên nhau (kể cả đồng đội).

Phần phải đổi:

- `createState()`/`setupRound()` cứng 2 xe `a`/`b` và bản đồ `duelWalls()`; `CONFIG.width/height` cố định 800×480.
- `protocol.ts`: `SEATS = ['a','b']`, `MatchResult.players` đã có `team` nhưng `SeatView` chưa có; không có tin nhắn chọn đội, tổ đội, hàng chờ, người xem.
- `room.ts`: forfeit đang tính cả trận (`expired[0].id === 'a' ? 0 : 1`), phải chuyển sang tính **theo người** rồi suy ra theo đội.
- `net-client.ts`: dự đoán xe mình đã tách theo ghế; nội suy xe khác đang giả định có một đối thủ.
- `runtime.ts`: HUD, sảnh và màn kết quả đang vẽ hai ghế A/B; màu "mình/đối thủ" cần thành "mình/đồng đội/đối thủ".
- `botInput()` chỉ điều khiển xe `b` nhắm vào `tanks[0]`.

## 3. Luật chơi 2v2

### 3.1 Trận và hiệp

Giữ nguyên luật P2: tối đa 3 hiệp, thắng 2 hiệp là xong, hiệp 60 giây, HP 3, cùng một loại xe và chỉ số (`CONFIG`). Không thêm vật phẩm nhặt.

- Đội còn xe khi đội kia bị loại hết thì thắng hiệp. Xe bị loại **không hồi sinh** giữa hiệp; mỗi hiệp mới mọi xe hợp lệ hồi đủ HP và về vị trí xuất phát.
- Hết giờ: so số xe còn sống, rồi tổng HP; bằng nhau là hòa (đã có trong engine).
- Xe bị loại chuyển sang **xem trận theo đồng đội còn sống** (camera không đổi vì sân hiển thị toàn bộ; chỉ đổi gợi ý HUD "Đang xem: <tên đồng đội>").

### 3.2 Đội và vị trí

- Ghế: `a1`, `a2` (đội 0, bên trái) và `b1`, `b2` (đội 1, bên phải). Mã xe trong engine = mã ghế.
- Phân biệt (PLAN §4): đội mình **xanh + biểu tượng tròn**, đội kia **cam + biểu tượng tam giác**, xe của chính mình có **viền sáng**. Không chỉ dựa vào màu.
- Mỗi hiệp đổi chỗ xuất phát trong đội (a1 trên ↔ a2 dưới) để không ai bị cố định ở làn yếu [PLACEHOLDER — bỏ nếu chơi thử thấy rối].

### 3.3 Đồng đội

- Đạn xuyên qua đồng đội, không gây sát thương và không bị chặn (giữ engine hiện tại). Lý do: chặn đạn đồng đội tạo tình huống "bắn trúng lưng bạn mình" khó hiểu với người mới.
- Xe không đi xuyên qua nhau (đã có), kể cả đồng đội.
- Khiên chỉ bảo vệ xe mình.

### 3.4 Mất mạng, rời trận, bỏ trận

Đổi từ "theo trận" (P2) sang "theo người":

| Tình huống | Xử lý |
|---|---|
| Mất kết nối trong trận | Xe đứng yên, vẫn trúng đạn (như P2); giữ ghế 20 giây [PLACEHOLDER]; về lại đúng ghế, HP, khiên |
| Hết giờ giữ ghế / bấm rời trận | Người đó **bỏ trận**: xe bị loại ngay và bị loại ở các hiệp còn lại (spawn với HP 0, không vẽ). Đồng đội chơi tiếp 1v2 |
| Cả đội đã bỏ trận | Đội đó thua do bỏ trận (`reason: 'forfeit'`) ngay lập tức |
| Cả bốn người cùng bỏ/hết giờ | Hủy trận (`cancelled`), không thắng thua |
| Hai đội cùng mất hết người hợp lệ trong cùng nhịp xử lý | Hủy trận |
| Trong sảnh/đếm ngược | Rời = trả ghế; đếm ngược bị hủy, mọi người mất trạng thái sẵn sàng |

Kết quả ghi rõ ai bỏ trận (`players[].forfeited`) để sau này P4 không cấp thưởng thắng cho người đã bỏ dù đội thắng (phần cấp thưởng không làm ở P3).

**Câu hỏi Q3 (§11):** khi một người bỏ, có cho đội còn 1 người đầu hàng sớm không. Mặc định đề xuất: **không** trong P3 (giữ đơn giản), xem lại sau chơi thử.

## 4. Bản đồ Crossfire

### 4.1 Kích thước sân

Bốn xe trên sân 800×480 (xe bán kính 16) vẫn đủ chỗ nhưng chật hơn Duel. **Mặc định đề xuất: giữ 800×480** để không phải làm camera/cuộn màn hình và giữ bố cục mobile đã kiểm ở P2; nếu chơi thử thấy chật thì chuyển sang phương án B (960×576, canvas co theo tỉ lệ cũ). Đây là câu hỏi Q1.

Để làm được điều này, `CONFIG.width/height` chuyển thành thuộc tính của bản đồ (`state.map.width/height`); Duel giữ 800×480 nên không đổi hành vi 1v1.

### 4.2 Bố cục nháp [PLACEHOLDER]

Đối xứng tâm (xoay 180°) để hai đội công bằng tuyệt đối. Ba làn: làn giữa có khối thép chữ thập (tạo góc bật), hai làn biên trên/dưới có gạch che, khu xuất phát mỗi đội có tường thép chắn đường bắn thẳng.

```
 0        160       320  400  480       640       800
 +---------------------------------------------------+ 0
 |  a1      ##      bb        bb      ##             |
 |  ::      ##                        ##        b2   |  80
 |######         ======    ======         ######     |
 |                   |      |                        | 160
 |  ##   bb       ===+======+===       bb   ##       |
 |  ##   bb          |  ##  |          bb   ##       | 240
 |  ##   bb       ===+======+===       bb   ##       |
 |                   |      |                        | 320
 |     ######    ======    ======         ######     |
 |   a2      ##                        ##       ::   | 400
 |           ##      bb        bb      ##     b1     |
 +---------------------------------------------------+ 480
 ## / === thép    bb gạch (2 lần trúng)    :: khu xuất phát
```

Hình trên chỉ để hình dung; tọa độ thật nằm trong `maps.ts` và được kiểm bằng test (§8.1), không kiểm bằng mắt.

Yêu cầu bố cục (kiểm tự động):

1. Không có đường thẳng (không bật) nào nối khu xuất phát đội 0 với khu xuất phát đội 1.
2. Mọi điểm đi được của sân nối thông với nhau khi gạch còn nguyên (không có khu kín), với xe bán kính 16.
3. Không có hành lang hẹp hơn 2,5 × đường kính xe (tránh hai xe kẹt nhau).
4. Mỗi xuất phát có ít nhất hai đường ra (chống thủ góc — PLAN §4).
5. Bản đồ đối xứng tâm: mọi tường ở (x, y, w, h) có bản sao ở (W−x−w, H−y−h).

### 4.3 Bản đồ dữ liệu

Tách `duelWalls()` thành `src/games/tank-clash/maps.ts`: `{ id, name, width, height, walls, spawns: { [seat]: {x, y, angle} } }`. Engine nhận `mapId` khi tạo state. Duel giữ nguyên tọa độ hiện tại để test P2 không đổi.

## 5. Giao thức và máy chủ phòng

### 5.1 Phiên bản

Đổi hợp đồng nên lên **`tank-clash.p3.v1`** (handoff §15.8: không tái dùng version string khi wire đổi). Server P3 phục vụ cả 1v1 và 2v2 qua `format`; client P2 cũ nhận `PROTOCOL_MISMATCH` kèm câu "tải lại trang". Không chạy song song hai server.

### 5.2 Thay đổi tin nhắn

Client → server (thêm/sửa):

| Tin | Nội dung | Ghi chú |
|---|---|---|
| `create` | thêm `format: '1v1' \| '2v2'` | Mặc định `1v1` |
| `join` | thêm `as?: 'player' \| 'spectator'` | Người chơi chỉ vào được ở sảnh; người xem vào được cả khi đang trận |
| `team` | `{ team: 0 \| 1 }` | Tự chuyển đội khi đội kia còn ghế; xóa trạng thái sẵn sàng của mình |
| `move` | `{ seat, team }` | Chỉ chủ phòng, chỉ ở sảnh; xóa sẵn sàng của **mọi người** (PLAN §5) |
| `queue` | `{}` | Chủ phòng của phòng riêng 2v2 có ≤2 người cùng đội, hoặc người chơi lẻ từ menu |
| `unqueue` | `{}` | Ai trong tổ đội cũng hủy được; hủy cho cả tổ |

Server → client (thêm/sửa):

- `SeatView` thêm `team`, `forfeited`; `RoomView` thêm `format`, `spectators: number`, `queue: { since, estimate? } | null`.
- `joined` thêm `role: 'player' | 'spectator'`; người xem không có `resumeToken` ghế (có token riêng chỉ để nối lại xem).
- `MatchResult.players[]` thêm `forfeited: boolean`; `reason` giữ `'score' | 'forfeit' | 'cancelled'`.
- Mã lỗi mới: `TEAM_FULL`, `NOT_HOST`, `WRONG_PHASE`, `QUEUE_INVALID` (kèm câu tiếng Việt như các mã cũ).

Kiểm tra gói tin vẫn chặt như P2: từ chối loại lạ và field thừa; người xem gửi `input`/`ready` → `BAD_MESSAGE` (không ngắt kết nối).

### 5.3 Phòng

- Phòng 2v2 có 4 ghế; ghế cuối và nút "bắt đầu" vẫn xử lý nguyên tử (đã có cơ chế ở P2, mở rộng cho 4 ghế).
- Điều kiện đếm ngược: **đủ 4 người, mỗi đội 2, tất cả sẵn sàng**. Không bắt đầu thiếu người, không thêm bot (D4).
- Chủ phòng rời sảnh: chuyển quyền theo thứ tự ghế cố định `a1, a2, b1, b2`. Trong trận chủ phòng không có quyền gì thêm.
- Băng thông: snapshot giữ 20 Hz; 4 xe và tới 12 viên đạn. Ước tính tải xuống 18–24 KB/s mỗi client [PLACEHOLDER, phải đo]. Nếu vượt 30 KB/s mới cân nhắc gửi delta.
- Người xem: tối đa 4 mỗi phòng [PLACEHOLDER]; nhận snapshot như người chơi, đến trễ 0 ms (không cần trễ chống báo tin vì MVP không có thông tin ẩn — PLAN §3.5).

### 5.4 Đấu lại

- Phòng riêng: sau kết quả, đấu lại khi **đủ 4 người cùng sẵn sàng**; ai rời thì ghế trống, phòng về sảnh, chờ người mới qua mã/link. Người bỏ trận vẫn được ở lại sảnh nếu còn kết nối.
- Trận từ hàng chờ: sau kết quả có nút "Đấu lại" trong 20 giây [PLACEHOLDER]; đủ 4 người đồng ý thì đấu lại, không thì phòng giải tán, mỗi tổ đội về màn chọn "Tìm trận tiếp"/"Về menu". Không chờ vô hạn (PLAN §5).

## 6. Tổ đội và hàng chờ 2v2

### 6.1 Tổ đội

Tổ đội = phòng riêng 2v2 chưa đủ người. Không làm hệ thống bạn bè hay lời mời riêng trong P3: rủ bạn bằng mã/link như P2, hai người cùng đội rồi chủ phòng bấm "Tìm trận". Nhờ vậy dùng lại toàn bộ luồng phòng đã có test.

### 6.2 Hàng chờ

- **Một** hàng chờ 2v2 trong bộ nhớ của tiến trình server (một máy chủ, một khu vực ở P3).
- Đơn vị xếp hàng: người lẻ (1) hoặc tổ đội (2). Ghép trận khi đủ hai đội: tổ+tổ, tổ+2 lẻ, hoặc 4 lẻ (lẻ ghép thành đội theo thứ tự vào hàng).
- Thứ tự: vào trước ghép trước; ưu tiên tổ+tổ khi có, để tổ đội không phải đánh với hai người lẻ chưa quen nhau nếu không cần. Chưa xét kỹ năng (chưa có dữ liệu — PLAN §5).
- Khi ghép xong: server tạo phòng `2v2` loại `queue`, đưa cả 4 vào, đếm ngược 5 giây [PLACEHOLDER], không cần bấm sẵn sàng. Ai mất kết nối trong lúc đếm ngược → hủy, ba người còn lại **quay về đầu hàng chờ** (giữ thứ tự cũ), người mất kết nối bị bỏ khỏi hàng.
- Một tài khoản chỉ ở một nơi: trong hàng chờ **hoặc** một phòng (đã có `ALREADY_IN_ROOM` cho phòng; mở rộng cho hàng chờ).
- Hủy tìm trận giải phóng chỗ ngay; mất kết nối trong hàng chờ quá 10 giây [PLACEHOLDER] → tự rời hàng.

### 6.3 Thiếu người

Sau 60 giây [PLACEHOLDER] chưa ghép được, UI hiện: "Chưa đủ người. **Tiếp tục đợi** / **Luyện với bot** (rời hàng chờ)". "Luyện với bot" mở trận 2v2 **cục bộ** (không online) với các xe ghi rõ **BOT**. Server không bao giờ tự thêm bot vào trận online (PLAN §5, D4).

Bot 2v2 cục bộ cần `botInput()` nhận mã xe và chọn mục tiêu là xe địch còn sống gần nhất (§7.3).

### 6.4 Tình huống hàng chờ phải test

| Tình huống | Kết quả đúng |
|---|---|
| Tổ A (2) + tổ B (2) | Một trận, A và B mỗi tổ một đội |
| Tổ A + lẻ x + lẻ y | A một đội; x, y đội kia |
| Lẻ x, y, z, w | x+y đội 0, z+w đội 1 (thứ tự vào hàng) |
| Tổ A + lẻ x (chỉ 3 người) | Chưa ghép; không tách tổ A |
| Tổ A, lẻ x, tổ B vào lần lượt | Ghép A+B (ưu tiên tổ+tổ), x tiếp tục chờ |
| Một người trong tổ hủy | Cả tổ rời hàng, phòng tổ đội về sảnh |
| Cùng tài khoản vào hàng ở tab thứ hai | Từ chối `ALREADY_IN_ROOM`, tab đầu không bị ảnh hưởng |
| Mất kết nối trong đếm ngược trận ghép | Hủy trận ghép, 3 người còn lại về đầu hàng |
| Hai trận cùng ghép một người (đua điều kiện) | Không thể: ghép trận là thao tác đồng bộ trên một tiến trình |

## 7. Client

### 7.1 Giao diện (theo AGENTS.md)

- Menu Online: thẻ "1v1 phòng riêng" (như P2), "2v2 phòng riêng", "Tìm trận 2v2".
- Sảnh 2v2: hai cột đội (2 ô mỗi đội), nút "Sang đội kia", nút sẵn sàng, số người xem, nút "Tìm trận" (chỉ chủ phòng, khi đội mình có ≤2 người và đội kia trống). Khung ngoài giữ cố định khi chuyển giữa sảnh/hàng chờ/kết quả; phần trong cuộn riêng.
- Màn hàng chờ: đồng hồ chờ, số người trong tổ, nút hủy luôn thấy; sau 60 giây hiện lựa chọn §6.3.
- HUD trận: 4 ô HP xếp theo đội (đội mình bên trái), tên + biểu tượng đội; xe mình có viền. Thông báo "đồng đội mất kết nối / đã rời trận" dạng toast không chặn (AGENTS.md §3).
- Màn kết quả: tỉ số đội, từng người (bỏ trận được đánh dấu), nút đấu lại theo §5.4.
- Mobile 390×844 và 844×390: kiểm bố cục sảnh 4 ghế không cần cuộn ở màn hình thường.

### 7.2 Netcode

- Dự đoán xe mình giữ nguyên. Ba xe còn lại nội suy lùi 100 ms như xe đối thủ P2 (mở rộng từ 1 sang n xe).
- Đo lại các số của bảng P2 với 4 client: hiệu chỉnh khi đang đánh, lệch hiển thị TB/p95, băng thông lên/xuống.
- Lag compensation vẫn **chưa** làm (chờ phản hồi chơi thật trên thiết bị — OWNER-TODO).

### 7.3 Chế độ cục bộ

Thêm "2v2 với bot" trong menu (ngoài online), hữu ích để thử bản đồ Crossfire trước khi có 4 người thật. Ba xe còn lại là BOT, ghi rõ trên HUD. Bot mới: chọn mục tiêu là xe địch còn sống gần nhất có đường bắn, tránh đứng sát đồng đội; vẫn dùng chung luật xe/đạn/khiên.

## 8. Kế hoạch kiểm thử

Mọi test mới nằm trong `tests/tank-clash/` và các lệnh hiện có (`test:tank-clash` trong `test:fast`, `test:tank-clash-server`, `test:tank-clash-ui` trong CI).

### 8.1 Engine (`engine.test.mjs`, file mới `maps.test.mjs`)

- Crossfire thỏa 5 yêu cầu §4.2 (đường bắn thẳng giữa khu xuất phát bằng `rayBox`; thông nhau bằng flood fill lưới 8 px; hành lang tối thiểu; đối xứng).
- Duel sau khi tách `maps.ts` cho trạng thái đầu giống hệt trước (so tọa độ).
- 2v2: đạn xuyên đồng đội; đạn bật trúng chính mình; đội bị loại hết thì đội kia thắng hiệp; hai đội mất xe cuối cùng nhịp → hòa; hết giờ so số xe rồi HP.
- Xe bỏ trận: HP 0 ở các hiệp sau, không chặn đường, không bị chọn làm mục tiêu bot.

### 8.2 Phòng (`room.test.mjs`)

- 4 ghế; chọn đội; chủ phòng chuyển người xóa sẵn sàng mọi người; không bắt đầu khi 3/4 hoặc 3–1; tranh ghế cuối nguyên tử.
- Bảng §3.4 từng dòng; `onResult` gọi đúng một lần mỗi match id; `forfeited` đúng.
- Người xem: vào giữa trận, nhận snapshot, input bị từ chối, không tính vào điều kiện bắt đầu/kết thúc.
- Đấu lại phòng riêng và phòng ghép theo §5.4.

### 8.3 Hàng chờ (file mới `queue.test.mjs`)

Toàn bộ bảng §6.4 với đồng hồ giả, cộng: hủy giải phóng chỗ; tự rời hàng khi mất kết nối quá giờ; không có bot trong trận ghép.

### 8.4 Netcode (`netcode.test.mjs`)

Trận 2v2 đủ hiệp với 4 client trên mạng ảo hiện có (RTT 80/150/250, jitter 30, mất 1/2/3 %); 4 client thống nhất kết quả (D1); ghi số đo vào bảng như P2; một client mất mạng giữa hiệp rồi quay lại đúng ghế.

### 8.5 Server và UI

- `server.test.mjs`: 4 WebSocket thật tạo/vào/đội/sẵn sàng/chơi; 2 tổ đội vào hàng chờ và được ghép.
- `online-ui.test.ts`: thêm ca 2v2 với 4 trang Chromium (sảnh, đổi đội, trận, kết quả); chụp ảnh 1280×760, 390×844, 844×390.

## 9. Chia việc (để duyệt theo phần)

| Phần | Nội dung | Phụ thuộc | Ước lượng |
|---|---|---|---|
| **P3a** | `maps.ts` + Crossfire, engine 4 xe, bỏ trận theo người, bot 2v2, chế độ cục bộ "2v2 với bot", test §8.1 | — | 1 lượt |
| **P3b** | Protocol `p3.v1`, phòng 4 ghế, đội, người xem, đấu lại; client nội suy n xe; test §8.2, §8.4 | P3a | 1–2 lượt |
| **P3c** | Hàng chờ + tổ đội, thiếu người; test §8.3 | P3b | 1 lượt |
| **P3d** | UI sảnh/hàng chờ/HUD/kết quả 2v2, test server + UI 4 trang, ảnh chụp, `P3-review.md` | P3b, P3c | 1 lượt |

Mỗi phần: commit riêng, ghi `docs/WORKLOG.md`, chạy lint/build/budget/`test:fast` và các test Tank Clash. P3a có giá trị riêng ngay cả khi chưa có hosting (chơi thử bản đồ Crossfire offline).

## 10. Rủi ro

| Rủi ro | Mức | Giảm thiểu |
|---|---|---|
| Sân 800×480 chật cho 4 xe, đạn khó đọc | Trung bình | Chơi thử P3a trước; phương án B 960×576 (Q1) |
| Hàng chờ trống vì ít người chơi | Cao | Màn thiếu người §6.3; phòng riêng 2v2 vẫn là luồng chính |
| Băng thông/CPU tăng gấp đôi mỗi phòng | Thấp | Đo ở P3b; delta snapshot chỉ khi vượt ngưỡng |
| Bỏ trận khiến trận 1v2 kéo dài, khó chịu | Trung bình | Thu phản hồi chơi thử; cân nhắc đầu hàng (Q3) |
| Đổi protocol làm client cũ lỗi | Thấp | Version mới + `PROTOCOL_MISMATCH` có câu hướng dẫn |
| Hàng chờ một tiến trình không mở rộng nhiều máy | Thấp ở P3 | Ghi rõ giới hạn; nhiều máy là việc khi chọn hosting |

## 11. Câu hỏi cần chủ dự án quyết

| # | Câu hỏi | Đề xuất mặc định |
|---|---|---|
| Q1 | Kích thước sân Crossfire | Giữ 800×480; đổi sang 960×576 nếu chơi thử thấy chật |
| Q2 | Hàng chờ công khai có bắt đăng nhập không | **Có** (khách chỉ chơi phòng riêng). Chống một người mở nhiều tab chiếm hàng |
| Q3 | Đội còn 1 người có được đầu hàng sớm | Không trong P3 |
| Q4 | Có làm chế độ cục bộ "2v2 với bot" (§7.3) | Có, làm trong P3a để thử bản đồ khi chưa có server |
| Q5 | Thứ tự làm | P3a ngay (không cần hosting); P3b–P3d làm tiếp, chơi thử thật sau khi có server (PENDING-DECISIONS mục 9) |

## 12. Nhật ký

| Phiên bản | Ngày | Thay đổi |
|---|---|---|
| v0.1 | 03/11/2026 | Bản nháp đầu, chờ duyệt |
