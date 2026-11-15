# Kế hoạch & Thiết kế Toàn diện (GDD · Economy · Cosmetics · Art · UI · Backend) — Ô Ăn Quan & Nhảy Lò Cò (Arcade-X)

Ngày lập: 14/11/2026 (Bản nâng cấp v2 — bổ sung chi tiết Core Loop, Economy, Cosmetics/Skins & Monetization)
Hệ thống điều phối: **Game Studio Agents** (`game-studio-orchestrator`, `game-gdd-architect`, `economy-designer`, `create-game-assets`, `generate2dsprite`, `game-ui-ux`, `backend-architect`)
Nền tảng đích: **Arcade-X PWA** (`React 19 + TypeScript + Vite + HTML5 Canvas/DOM + Supabase Edge Functions + PGlite Test`)

---

## 1. Định hướng Tổng thể & Điều phối Game Studio Agents

### 1.1. Tích hợp vào Sảnh Arcade-X
Hai trò chơi dân gian Việt Nam được đưa vào sảnh `Multiplayer` của Arcade-X với 2 thẻ game độc lập nhưng chia sẻ chung một lõi hạ tầng phòng trực tuyến và hệ thống Tiệm Tạp Hóa Dân Gian:
- `o-an-quan` (**Ô Ăn Quan · Sân Đình**): Đấu trí chiến thuật rải sỏi tính nước 1vs1, săn ăn Quan và ăn kép liên hoàn.
- `nhay-lo-co` (**Nhảy Lò Cò · Ngõ Nhỏ**): Đua nhịp phản xạ 1 chân / 2 chân, thảy Chàm và chiếm ô xây Chùa (Cất Nhà) 1vs1.
- Cả hai kết nối trực tiếp với `GameBridge` của Arcade-X (`grantCoins`, `grantExp`, `grantGems`, `triggerLootRoll`, `getEquippedSkin`, `saveGameState`) và tuân thủ nguyên tắc **Zero Pay-to-Win** (Skin chỉ thay đổi hình ảnh, hiệu ứng hạt, âm thanh và khung vinh danh, không can thiệp công thức điểm hay thời gian lượt).

### 1.2. Phân công Strike Teams trong `.agents/game-studio/`
| Giai đoạn | Agent / Skill phụ trách | Đầu ra cụ thể trong repo |
|---|---|---|
| **1. GDD & Luật (Design)** | `game-gdd-architect` + `game-designer` | `rules.ts` thuần hàm (deterministic), kiểm tra nước đi, điều kiện thắng, bot AI 3 cấp độ |
| **2. Kinh tế & Tiệm Skin (Economy)** | `economy-designer` + `save-systems` | `economy.ts`, `skins-catalog.ts`, công thức thưởng chống cày lạm phát, Sổ lưu niệm & Tiệm Tạp Hóa Dân Gian |
| **3. Hạ tầng 1vs1 (Backend)** | `backend-architect` + mẫu `word-chain` / `duel` | Schema SQL (`folk_duel`), RPC CAS theo `version`, Hàng đợi FIFO 1vs1, Mã phòng 6 ký tự, Edge Function `folk-duel-room`, đồng bộ `equippedSkins` giữa 2 người chơi |
| **4. Đồ hoạ Pixel Việt Nam (Art)** | `create-game-assets` + `generate2dsprite` + `generate2dmap` | Bảng màu 32 màu Làng Quê Việt Nam, sprite sheet PNG trong suốt (`nearest-neighbor`) cho từng bộ Skin (Quân, Quan, Bàn cờ, Gạch đôi, Chàm, Nhân vật), icon `512×512` & banner `1280×640` |
| **5. Giao diện & Cảm giác chơi (UI/Juice)** | `game-ui-ux` + `ui-designer` + `game-feel` | Modal chuẩn `AGENTS.md`, `OnlineRoom.tsx`, `MatchView.tsx`, `FolkShopModal.tsx` (Tiệm Tạp Hóa đổi Skin), hiệu ứng hạt & âm thanh dân gian |
| **6. Kiểm thử & Mô phỏng (QA)** | `game-qa-playtest` + `game-production-scrum` | Suite `PGlite` + unit test luật + mô phỏng kinh tế 90 ngày (`simulate-folk-economy.mjs`) + preview lab 2 người trên 1 màn hình |

---

## 2. Vòng Lặp Gameplay (3-Tier Core Gameplay Loops)

Thiết kế theo khung chuẩn của `game-designer` và `game-gdd-architect`:

### 2.1. Vòng lặp Giây-tới-Giây (Moment-to-Moment Loop: 0 – 15 giây)
- **Trong Ô Ăn Quan:**
  1. **Quan sát & Dự tính (3–5s):** Nhìn số lượng sỏi trên 5 ô Dân của mình và 5 ô đối phương; chạm thử vào 1 ô để xem **đường chấm sáng dự báo** viên cuối rơi vào đâu.
  2. **Ra quyết định (1s):** Bấm nút **`◀ Rải Trái`** hoặc **`Rải Phải ▶`**.
  3. **Phản hồi cảm giác (Juice 2–6s):** Bàn tay Pixel bốc sỏi và thả từng viên (`180ms/viên`) kèm tiếng lách cách tăng dần cao độ (pitch tăng `+5%` mỗi viên); nếu rơi vào ô trống ăn được ổ sỏi lớn hoặc ăn Quan, màn hình rung nhẹ (`screen-shake 4px`), số điểm bay lên rực rỡ và sỏi bay vèo vào Mẹt tre.
- **Trong Nhảy Lò Cò:**
  1. **Canh lực Thảy Chàm (2–3s):** Canh thanh con thoi dừng đúng vùng Xanh (`Sweet Spot`) để mảnh Chàm bay chính xác vào ô mục tiêu, toé bụi phấn trắng.
  2. **Bấm nhịp Lò Cò (5–8s):** Bấm luân phiên **`[ 🦶 1 CHÂN ]`** (ô đơn) và **`[ 🦶🦶 2 CHÂN ]`** (ô đôi gạch kép / Đầu Chùa), nhảy vọt qua ô có Chàm và ô Nhà đối thủ.
  3. **Cúi nhặt Chàm & Xây Nhà (2–3s):** Canh nhịp giữ thăng bằng 1 chân để nhặt Chàm về đích, sau đó đóng dấu phấn xây **Ngôi Nhà của mình** lên bàn chơi để chặn đường đối thủ.

### 2.2. Vòng lặp Ván đấu (Session Loop: 3 – 5 phút / trận)
1. **Vào sảnh game:** Chọn **Luyện với Bot** (Tí Sún / Bờm / Trạng Quỳnh), **Ghép Trận Nhanh 1vs1**, hoặc **Tạo Phòng Mã 6 Ký Tự** gửi bạn bè.
2. **Trình diễn Skin đầu trận (2s):** Khi vào bàn, hệ thống hiển thị **Bàn chơi theo Skin của Chủ phòng** (hoặc Skin của bản thân tùy chọn) và **Quân Dân / Quân Quan / Chàm / Hiệu ứng Ô Gạch Đôi riêng của từng người chơi** để cả 2 cùng chiêm ngưỡng bộ sưu tập của nhau.
3. **Đấu trí / Đua tốc độ (2–4 phút):** Giành lợi thế từng lượt, dùng Biểu cảm Pixel tương tác với bạn bè.
4. **Tổng kết & Nhận thưởng (15s):** Nhận **Xu Arcade-X**, **XP Cấp độ**, **Kẹo Mạch Nha (Token Dân Gian)** và mở **Rương Dân Gian** nếu đạt mốc điểm; chọn **Đấu Lại (Rematch)** ngay trong phòng.

### 2.3. Vòng lặp Dài hạn (Long-Term Meta Loop: Hàng ngày / Hàng tuần)
1. **Tích lũy tài nguyên:** Hoàn thành Nhiệm vụ Ngày ("Ăn 2 Quân Quan", "Xây 5 Ngôi Nhà", "Thắng 1 trận Phòng Bạn Bè") để nhận Xu và **Kẹo Mạch Nha**.
2. **Mở khóa & Trang bị tại "Tiệm Tạp Hóa Cổng Trường":** Dùng Xu và Kẹo Mạch Nha đổi các bộ Skin Quân/Quan, Skin Bàn Cờ, Skin Ô Gạch Đôi, Skin Mảnh Chàm, Nhân vật và Danh hiệu.
3. **Leo Bảng Phong Thần (Elo / Cấp bậc Dân Gian):** Từ *Nhi Đồng Sân Đình* -> *Cao Thủ Xóm Trên* -> *Kỳ Thủ Làng Gốm* -> *Trạng Nguyên Dân Gian*.

---

## 3. Kịch bản & GDD Chi tiết: Game 1 — Ô Ăn Quan (`o-an-quan`)

### 3.1. Cấu trúc Bàn cờ & Thông số Toán học
- **Mảng bàn cờ 12 ô (`cells[0..11]`):**
  - `cells[0]`: **Quan Trái** (Khởi đầu = 1 viên Quan lớn, trị giá **10 điểm sỏi**; có tuỳ chọn phòng "Quan Non = 5 điểm").
  - `cells[1..5]`: **5 Ô Dân của Người chơi A (Dưới)** — Khởi đầu mỗi ô **5 viên Dân** (25 điểm).
  - `cells[6]`: **Quan Phải** (Khởi đầu = 1 viên Quan lớn, trị giá **10 điểm sỏi**).
  - `cells[7..11]`: **5 Ô Dân của Người chơi B (Trên)** — Khởi đầu mỗi ô **5 viên Dân** (25 điểm).
  - **Tổng điểm toàn bàn:** `2 × 10 (Quan) + 10 × 5 (Dân) = 70 điểm`.

### 3.2. Máy Trạng Thái & Luật Chơi Chuẩn (`rules.ts`)
1. **Chọn ô & Hướng (`SELECT_MOVE`):** Chọn 1 trong 5 ô Dân phía mình có `cells[i] > 0` và chọn hướng `LEFT` hoặc `RIGHT`.
2. **Rải quân (`SOWING`):** Bốc hết `N` viên ở ô đã chọn, thả lần lượt mỗi ô tiếp theo `1` viên.
3. **Xử lý sau viên cuối cùng (`RESOLVE_LAST_STONE`):**
   - **Rải tiếp (Chuyền tay):** Nếu ô kế tiếp (`nextCell`) là ô Dân và có quân (`cells[nextCell] > 0`) -> Bốc toàn bộ quân ở `nextCell` rải tiếp (giới hạn an toàn 24 chu kỳ chuyền tay liên tiếp).
   - **Ăn quân (`CAPTURE`):** Nếu `nextCell` trống (`0`) và ô kế tiếp nữa (`afterNextCell`) có quân:
     - **Luật bảo vệ Quan đầu ván:** Không được ăn ô Quan nếu ô Quan đó chưa có ít nhất 1 quân Dân đi kèm (hoặc chưa qua lượt thứ 2 của ván).
     - Hốt toàn bộ quân ở `afterNextCell` vào Mẹt điểm của mình.
     - **Ăn Kép / Ăn Liên Hoàn (Combo Capture):** Nếu sau ô vừa ăn lại là 1 ô trống kèm 1 ô có quân kế tiếp -> Tiếp tục ăn dây chuyền! Mỗi lần ăn dây chuyền kích hoạt hiệu ứng **Combo x2, x3, Đại Thắng!**
   - **Mất lượt ("Bị Tịt / Mù"):** Viên cuối dừng ngay sát trước ô Quan (không được bốc ô Quan để rải) hoặc gặp 2 ô trống liên tiếp.
4. **Luật "Rải Sinh / Vỡ Nợ":** Đến lượt mà cả 5 ô Dân phía mình đều bằng `0` -> Tự động lấy **5 viên Dân** từ Mẹt của mình đặt vào mỗi ô 1 viên rồi mới đi (nếu thiếu thì vay của đối phương, ghi vào `debt` trừ cuối ván).
5. **Tàn Cuộc ("Hốt Tàn") & Tính Thắng Thua:**
   - Khi cả 2 ô Quan (`cells[0]` và `cells[6]`) đều trống -> Ván đấu kết thúc ngay.
   - Quân Dân còn trên 5 ô phía ai thuộc về người đó ("Hốt tàn").
   - `FinalScore = CapturedDan + (CapturedQuan × 10) + RemainingOwnSideDan - Debt`. Ai lớn hơn `35 điểm` là Thắng (`35 - 35` là Hoà).

---

## 4. Kịch bản & GDD Chi tiết: Game 2 — Nhảy Lò Cò (`nhay-lo-co`)

### 4.1. Cấu trúc Bàn Lò Cò 10 Ô (Đơn & Đôi)
- **Ô 1, 2, 3:** Ô đơn dọc (Nhảy 1 chân — `SINGLE_HOP`).
- **Ô 4 – 5 (Cặp Ô Gạch Đôi Hạ):** Hai ô ngang cạnh nhau (Nhảy 2 chân cùng lúc — `DOUBLE_LAND`). Đây là vị trí nổi bật nhất để trình diễn **Skin Viên Gạch Đôi**!
- **Ô 6:** Ô đơn giữa (Nhảy 1 chân — `SINGLE_HOP`).
- **Ô 7 – 8 (Cặp Ô Gạch Đôi Thượng):** Hai ô ngang cạnh nhau (Nhảy 2 chân cùng lúc — `DOUBLE_LAND`).
- **Ô 9:** Ô đơn trên (Nhảy 1 chân — `SINGLE_HOP`).
- **Ô 10 (Vòm Bán Nguyệt — "Đầu Chùa / Vòm Trời"):** Điểm nghỉ xoay người 180° bằng 2 chân trước khi nhảy về.

### 4.2. Cơ chế Gameplay 3 Pha Mỗi Lượt (`rules.ts`)
1. **Pha 1 — Thảy Chàm (`THROW_MARKER`):**
   - Canh thanh lực thả mảnh Chàm vào đúng ô mục tiêu hiện tại (`targetBox` từ Bàn 1 đến Bàn 9).
   - Dừng ở **Vùng Xanh Hoàn Hảo (Perfect Center):** Cộng thêm `+10 điểm Kỹ Năng` và giúp pha nhảy sau rộng nhịp hơn `+15%`.
   - Dừng ở **Vùng Đỏ (Chạm vạch / Bay ra ngoài / Rơi vào Nhà đối thủ):** Báo **"Cháy / Đạp Vạch!"**, mất lượt ngay lập tức.
2. **Pha 2 — Nhảy Lò Cò Đi & Về (`HOP_SEQUENCE`):**
   - Người chơi bấm 2 nút lớn **`[ 🦶 1 CHÂN ]`** và **`[ 🦶🦶 2 CHÂN ]`** theo đúng cấu trúc ô:
     - Ô đơn (`1, 2, 3, 6, 9`): Bấm **`1 CHÂN`**.
     - Cặp ô gạch đôi (`4-5`, `7-8`) và Ô 10 (`Đầu Chùa`): Bấm **`2 CHÂN`** (nếu cả 2 ô đều trống). Nếu 1 trong 2 ô đôi đang có Chàm hoặc Nhà đối thủ thì phải bấm **`1 CHÂN`** nhảy vào ô còn lại!
     - Khi nhảy về đứng ngay trước ô có Chàm: Bấm nút **`[ 👋 NHẶT CHÀM ]`** đúng nhịp cân bằng rồi nhảy ra vạch xuất phát.
3. **Pha 3 — Cất Nhà / Xây Chùa (`BUILD_HOUSE`):**
   - Hoàn thành xong bàn nào, người chơi được đóng dấu xây **1 Ngôi Nhà** lên một ô trống trên sân.
   - **Tác dụng khắc chế trực tiếp:** Chủ nhà nhảy vào Nhà của mình được phép nghỉ 2 chân và hồi nhịp; đối phương nhảy qua **bắt buộc phải nhảy vọt qua ô Nhà đó**.
   - **Điều kiện thắng:** Trong trận **Đối Kháng Nhanh (Quick Match 1vs1)**, ai xây đủ **3 Ngôi Nhà** trước (hoặc dẫn điểm cao hơn khi hết 5 vòng lượt) sẽ chiến thắng.

---

## 5. Hệ Thống Skin & Tùy Biến Cá Nhân (Cosmetics Catalog Chi Tiết)

Theo đúng ý tưởng của anh Đức, tiền thưởng kiếm được sẽ dùng để mở khóa và trang bị các vật phẩm trang trí mang đậm ký ức tuổi thơ Việt Nam trong **"Tiệm Tạp Hóa Cổng Trường"**:

### 5.1. Hệ thống Skin cho Game Ô Ăn Quan (`o-an-quan`)

#### A. Skin Bộ Quân Dân & Quân Quan (Stones & Mandarin Skins)
Mỗi người chơi trang bị bộ Quân/Quan riêng; trên bàn 1vs1, sỏi khởi đầu ở sân bên nào sẽ mang hình dáng Skin của người chơi bên đó (hoặc dùng bộ Skin của mình hiển thị phía client):
1. **Bộ Mặc Định — Sỏi Cuội & Đá Vôi Trắng (Miễn phí):** Quân Dân là sỏi suối xám trắng; Quân Quan là viên đá cuội vàng lớn.
2. **Bộ Tuổi Thơ — Hạt Me & Vỏ Ốc Hoàng Kim (`400 Xu` hoặc `15 Kẹo Mạch Nha`):** Quân Dân là những hạt me nâu bóng loáng; Quân Quan là hai con ốc hương / ốc xà cừ lấp lánh. Khi rải phát ra tiếng hạt gỗ lách cách ấm áp.
3. **Bộ Sân Trường — Bi Ve Ngũ Sắc & Bi Đại Cầu Vồng (`800 Xu` hoặc `30 Kẹo Mạch Nha`):** Quân Dân là những viên bi ve thủy tinh khía màu xanh/đỏ/vàng; Quân Quan là viên bi đại (bi chủ) ánh cầu vồng. Khi ăn quân phát ra tiếng bi thủy tinh chạm nhau *cách-cách* cực đã tai!
4. **Bộ Kinh Kỳ — Đồng Xu Cổ & Thỏi Vàng Nguyễn Triều (`1.500 Xu` hoặc `60 Kẹo Mạch Nha`):** Quân Dân là đồng tiền xu lỗ vuông đồng thau; Quân Quan là thỏi Kim Nguyên Bảo (thỏi vàng lấp lánh hiệu ứng hạt sao vàng).
5. **Bộ Huyền Thoại — Ngọc Trai Phú Quốc & Ngọc Bích Rồng (`2.500 Xu` hoặc `100 Kẹo Mạch Nha` / Mở Rương Epic):** Quân Dân là trai ngọc phát sáng; Quân Quan là ấn Ngọc Bích chạm khắc đầu Rồng thời Lý, mỗi khi ăn Quan có hiệu ứng rồng ánh sáng bay lên.

#### B. Skin Bàn Cờ & Mặt Sân (Board Themes)
1. **Sân Gạch Tàu Đình Làng (Mặc định - Miễn phí):** Gạch đỏ đất nung truyền thống, nét vẽ phấn trắng, góc bàn có chiếc lá đa và đôi dép tổ ong.
2. **Mặt Bàn Gỗ Học Trò Khắc Phấn (`600 Xu`):** Mặt bàn gỗ lim trường học xưa, vạch kẻ bằng phấn màu xanh/vàng, góc bàn có cục tẩy và thước kẻ gỗ.
3. **Chiếu Cói Làng Quê (`1.200 Xu`):** Chiếu cói dệt hoa văn chữ Thọ đỏ tươi trải giữa hiên nhà gỗ, âm thanh rải quân êm dịu.
4. **Sân Đá Thanh Hoa Cố Đô Huế (`2.000 Xu`):** Mặt bàn đá xanh chạm mây cổ kính, các ô Dân lót gạch gốm Bát Tràng men ngọc.

#### C. Skin Bàn Tay Rải Quân & Mẹt Đựng Quân (Hand Cursor & Basket Skins)
1. **Bàn Tay Học Trò & Mẹt Tre Đan (Mặc định):** Tay áo trắng học trò, mẹt tre mộc.
2. **Tay Áo Bà Ba & Thúng Gạo Nếp (`500 Xu`):** Tay áo nâu/tím Huế kèm thúng tre viền mây đỏ.
3. **Tay Áo Gấm Quan Trạng & Tráp Sơn Mài Khảm Trai (`1.400 Xu`):** Tay áo gấm thêu kim tuyến, hộp đựng quân bằng sơn mài đen khảm xà cừ lấp lánh.

---

### 5.2. Hệ thống Skin cho Game Nhảy Lò Cò (`nhay-lo-co`)

#### A. Skin Ô Viên Gạch Đôi (Double-Tile / Stepping Block Skins — Ô 4-5 & Ô 7-8)
Cặp ô đôi `4-5` và `7-8` cùng với vòm `Đầu Chùa (Ô 10)` là tâm điểm thị giác trên đường nhảy lò cò, cho phép thay đổi chất liệu và hiệu ứng khi đáp 2 chân:
1. **Gạch Xi Măng Vẽ Phấn Trắng (Mặc định - Miễn phí):** Ô gạch xi măng xám vẽ phấn trắng, khi nhảy 2 chân đáp xuống toé bụi phấn trắng nhẹ.
2. **Gạch Bông Hoa Văn Sài Gòn Xưa (`600 Xu` hoặc `25 Kẹo Mạch Nha`):** Cặp ô gạch đôi lát gạch bông cổ điển hoa văn đối xứng vàng - xanh rêu. Khi đáp 2 chân phát sáng hoa văn cổ điển.
3. **Đá Tổ Ong & Lá Sen Hồ Tịnh Tâm (`1.000 Xu` hoặc `40 Kẹo Mạch Nha`):** Cặp ô đôi biến thành 2 phiến lá sen xanh biếc nổi trên mặt đá; mỗi khi đáp 2 chân xuống có hiệu ứng gợn nước và cánh sen hồng bay lên!
4. **Gạch Gốm Men Lam Bát Tràng (`1.600 Xu` hoặc `65 Kẹo Mạch Nha`):** Hai viên gạch đôi tráng men sứ trắng vẽ cá chép vượt vũ môn; đáp chuẩn nhịp phát ra tiếng chuông gốm thanh thoát.
5. **Gạch Hoàng Thành Phát Quang (`2.500 Xu` hoặc `100 Kẹo Mạch Nha`):** Viên gạch đôi chạm phù điêu Mây Lửa vàng ròng, mỗi cú đáp Perfect tạo vòng sóng chấn động ánh kim.

#### B. Skin Bàn Chơi & Bối Cảnh Ngõ Nhỏ (Court & Environment Skins)
1. **Ngõ Nhỏ Nắng Chiều (Mặc định - Miễn phí):** Tường vôi vàng, giàn hoa giấy hồng, mặt sân gạch đất nung ấm áp.
2. **Sân Trường Giờ Ra Chơi (`700 Xu`):** Sân trường lát gạch dưới gốc phượng vĩ đỏ rực, có trống trường và tiếng ve kêu râm ran.
3. **Phố Cổ Hội An Đêm Đèn Lồng (`1.500 Xu`):** Bàn lò cò vẽ phấn phát sáng lung linh dưới ánh đèn lồng lụa nhiều màu và hoa đăng bên bờ sông Hoài.
4. **Sân Đình Đêm Hội Trăng Rằm (`2.200 Xu`):** Mặt sân ngập ánh trăng thu vàng dịu, có đèn ông sao và đèn kéo quân xoay tròn hai bên đường nhảy.

#### C. Skin Mảnh Chàm & Dấu Xây Nhà (Marker & House Stamp Skins)
1. **Mảnh Sành Gốm Lam & Nhà Phấn Trắng (Mặc định):** Mảnh bát sứ vỡ xanh lam, nhà vẽ hình mái ngói đơn giản.
2. **Đồng Xu Cổ & Dấu Hoa Sen Hồng (`450 Xu`):** Chàm là đồng xu đồng cổ; khi xây nhà hiện nguyên đoá sen hồng nở rộ trên ô gạch.
3. **Đá Thạch Anh Tím & Chùa Một Cột Thu Nhỏ (`1.100 Xu`):** Chàm là viên đá lấp lánh; ô đã xây nhà hiện biểu tượng lầu đình Pixel 2.5D nổi bật.
4. **Nhân vật Pixel (Avatar Hoppers):** Mở khóa **Tí Áo Nâu**, **Na Khăn Quàng Đỏ**, **Bờm Quạt Mo**, **Cô Tấm Áo Tứ Thân**, **Chú Cuội Đèn Lồng** (`800 – 1.800 Xu`).

---

## 6. Thiết Kế Kinh Tế Game (Game Economy) & Monetization

Thiết kế bởi `economy-designer` dựa trên nguyên lý **Nguồn (Sources) — Đích tiêu (Sinks) cân bằng**, tích hợp trực tiếp với `GameBridge.ts` và hệ thống `COMMERCE-ROLLOUT.md` của Arcade-X:

### 6.1. Các Loại Tiền Tệ & Tài Nguyên
1. **Xu Arcade-X (`Arcade Coins` — Tiền tệ chính toàn sảnh):**
   - Dùng chung trên toàn bộ 24+ game của Arcade-X qua `bridge.grantCoins()` / `bridge.submitScore()`.
   - Dùng để mua 80% các bộ Skin cơ bản & trung cấp trong Tiệm Tạp Hóa.
2. **Kẹo Mạch Nha / Vé Dân Gian (`Folk Tokens` — Tiền tệ chuyên biệt của cụm Dân Gian):**
   - Lưu trong save của cụm game dân gian (`folkWallet.candyTokens`).
   - Kiếm được khi **Ăn Quan**, **Xây Nhà thành công**, **Thắng chuỗi (Win Streak)** hoặc hoàn thành **Nhiệm vụ Dân Gian mỗi ngày**.
   - Dùng để đổi các bộ Skin Hiếm/Huyền Thoại (như *Bi Ve Cầu Vồng*, *Ngọc Bích Rồng*, *Gạch Lá Sen*, *Phố Cổ Đèn Lồng*).
3. **XP & Rương Arcade-X (`EXP` & `Chests`):**
   - Tích lũy cấp độ tài khoản chung trên Launcher và rơi rương (`common`, `rare`, `epic`, `legendary`) sau trận thắng.

### 6.2. Bảng Công Thức Thưởng Sau Mỗi Trận (Reward Matrix)

Để chống cày tiền bằng cách tự thua hoặc spam phòng riêng với acc phụ, hệ thống áp dụng **Trần thưởng theo ngày (Daily Soft-Cap)** và **Xác thực kết quả từ Server (`receipt` bền vững)**:

| Chế độ chơi | Kết quả | Xu Arcade-X | XP | Kẹo Mạch Nha | Tỷ lệ rơi Rương |
|---|---|---:|---:|---:|---|
| **Đấu với Bot (Offline)** | Thắng Bot Dễ / Thường | `+25 Xu` | `+40 XP` | `+2 Kẹo` | `5%` (Common) |
| **Đấu với Bot (Offline)** | Thắng Bot Khó (Trạng Quỳnh) | `+45 Xu` | `+65 XP` | `+4 Kẹo` | `12%` (Common/Rare) |
| **Phòng Bạn Bè (Mã 6 số)** | Thắng (tối đa 5 trận thưởng/ngày với cùng 1 bạn) | `+50 Xu` | `+75 XP` | `+5 Kẹo` | `15%` |
| **Ghép Trận 1vs1 (Matchmaking)** | **Thắng Trận (Win)** | **`+80 Xu`** | **`+100 XP`** | **`+8 Kẹo`** | **`25%` (Rare/Epic)** |
| **Ghép Trận 1vs1 (Matchmaking)** | Thua nhưng chơi hết trận (Không bỏ cuộc) | `+25 Xu` | `+45 XP` | `+2 Kẹo` | `5%` |
| **Thưởng Kỹ Năng (Bonus)** | Ăn 1 Quân Quan / Xây 1 Nhà / Nhảy Perfect | `+10 Xu` | `+15 XP` | `+1 Kẹo` | Cộng dồn (Tối đa +30 Xu/trận) |

### 6.3. Nhịp Độ Mở Khóa (Progression Pacing 30 Ngày)
- **Ngày 1 (Sau 3 trận đầu tiên ~12 phút chơi):** Người chơi kiếm đủ `~300 Xu + 20 Kẹo Mạch Nha` -> Mở khóa ngay **Skin đầu tay** (*Bộ Hạt Me & Ốc Hoàng Kim* hoặc *Mảnh Chàm Đồng Xu Cổ*) để cảm nhận niềm vui đổi đồ ngay trong phiên đầu!
- **Ngày 3 – 7 (Người chơi thường xuyên ~4 trận/ngày):** Mở khóa được **Bộ Bi Ve Ngũ Sắc**, **Bàn Gỗ Học Trò**, **Viên Gạch Đôi Gạch Bông Sài Gòn** và **Nhân vật Bờm Quạt Mo**.
- **Ngày 14 – 30 (Mục tiêu sưu tập dài hạn):** Mở khóa các bộ Huyền Thoại (*Ngọc Bích Rồng*, *Gạch Đôi Lá Sen Hồ Tịnh Tâm*, *Sân Phố Cổ Hội An Đêm Đèn Lồng*).

### 6.4. Chiến lược Monetization ( Phù hợp Lộ trình Commerce của Arcade-X)
Vì hiện tại `AGENTS.md` quy định **Commerce mặc định tắt trên Production** và đang chuẩn bị rollout theo `docs/COMMERCE-ROLLOUT.md`, hệ thống Monetization của 2 game được thiết kế theo **kiến trúc 2 tầng sẵn sàng bật qua Feature Flag**:

1. **Tầng 1 — Khi Commerce đang tắt (Mặc định hiện tại — 100% Free-to-Play Retention):**
   - Toàn bộ Skin đều mở khóa được bằng **Xu Arcade-X** và **Kẹo Mạch Nha** thông qua việc chơi game, làm nhiệm vụ ngày và mở Rương.
   - Tăng mạnh thời gian giữ chân người dùng (Session Time & DAU) và tỷ lệ rủ bạn bè vào sảnh Arcade-X qua **Mã mời 6 ký tự**.
   - **Thưởng Mời Bạn (Viral Referral Hook):** Mỗi khi tạo phòng mã mời và chơi hoàn tất 1 ván với một người bạn mới, cả chủ phòng lẫn bạn đều nhận ngay **`+50 Kẹo Mạch Nha` (Quà Hội Ngộ)** (tối đa 5 người bạn khác nhau).

2. **Tầng 2 — Khi bật Commerce / Vé Thuê & Gói Hội Viên (`VITE_ACCESS_CONTROL_V2` / `Subscription`):**
   - **Gói "Vé Hội Làng (Folk Pass / VIP Pass)":**
     - Mở khóa dùng thử toàn bộ **Skin Huyền Thoại** trong thời gian hiệu lực gói.
     - Nhân đôi (`x2`) lượng **Kẹo Mạch Nha** nhận được sau mỗi trận 1vs1.
     - Mở khóa **Khung Avatar Sơn Mài Vàng** và **Bảng tên Trạng Nguyên** trong phòng chờ 1vs1.
   - **Gói Quà Lưu Niệm ("Hộp Thiếc Tuổi Thơ" Starter Pack):** Mua lẻ trọn bộ Skin *Bi Ve Cầu Vồng + Gạch Bông Sài Gòn + Sân Đèn Lồng Hội An* mà không cần cày cuốc.
   - **Cam kết Công bằng Tuyệt đối (Fair-Play Guarantee):** Người mua gói hay không mua gói đều có cùng 25 viên sỏi, cùng thanh lực Thảy Chàm và cùng đồng hồ 25 giây.

---

## 7. Xử Lý Đồ Hoạ, Bảng Màu & Tạo Asset Pixel Art Việt Nam

Tuân thủ quy trình của `.agents/game-studio/skills/create-game-assets` và `generate2dsprite` cùng `docs/LAUNCHER-ART-BUDGETS.md`:

### 7.1. Thông Số Kỹ Thuật & Hiển Thị (Technical Frame)
- **Chế độ lọc ảnh:** `image-rendering: pixelated; image-rendering: crisp-edges;` trên Canvas/DOM (`ctx.imageSmoothingEnabled = false`).
- **Độ phân giải logic (Virtual Canvas):**
  - `360 × 640` (Dọc - Mobile First) và tự động mở rộng khung cảnh sân đình `640 × 360` / `960 × 540` trên Desktop, giữ bàn cờ ở trung tâm.
- **Ngân sách Launcher Artwork (`docs/LAUNCHER-ART-BUDGETS.md`):**
  - Icon sảnh: `512 × 512 px` (`.webp` < `150 KB`, có bản `.svg` master).
  - Banner sảnh: `1280 × 640 px` (`.webp` < `220 KB`, có bản `.svg` master).

### 7.2. Bảng Màu Pixel Art "Nắng Sân Đình" (Vietnamese Folk Palette)
| Nhóm màu | Mã Hex | Ứng dụng trong Game |
|---|---|---|
| **Gạch Tàu Sân Đình (Terracotta)** | `#8C3B2B`, `#B8523B`, `#D97356` | Nền sân gạch cổ, mái đình, viền khung bàn cờ |
| **Đất Nung & Phấn Trắng (Chalk & Clay)** | `#F4EFE6`, `#D6CFC2`, `#5C4A3E` | Nét vẽ phấn bàn Ô Ăn Quan / Lò Cò, nền sân xi măng quê |
| **Tre Xanh & Lá Đa (Bamboo & Banyan)** | `#2D5A27`, `#4E8C3A`, `#8CC665` | Viền tre trúc, tán cây đa, thanh lực Sweet Spot, nút xác nhận |
| **Vàng Lúa Chín & Đá Quan (Harvest Gold)** | `#D97706`, `#F59E0B`, `#FDE68A` | Viên đá Quan cẩm thạch, vương miện thắng cuộc, hiệu ứng ăn combo |
| **Sỏi Cuội & Mảnh Sành (Pebbles & Ceramic)** | `#E2E8F0`, `#94A3B8`, `#38BDF8` | Quân Dân sỏi cuội, mảnh Chàm gốm sứ hoa lam Huế/Bát Tràng |
| **Đỏ Lễ Hội (Festival Crimson)** | `#991B1B`, `#DC2626`, `#FCA5A5` | Khăn đóng, cờ hội, cảnh báo hết giờ, báo lỗi "Đạp vạch" |

### 7.3. Kiến Trúc Render Đa Skin (Skin-Driven Renderer)
Để thêm mới hoặc đổi Skin trong 1 nốt nhạc mà không phải sửa code gameplay:
- Mỗi bộ Skin được định nghĩa trong `src/games/folk-duel/skins-catalog.ts` dưới dạng cấu hình dữ liệu + toạ độ vùng cắt (`spriteAtlasRect`) + bảng màu hạt (`particlePalette`) + âm thanh (`sfxProfile`):
  - Với **Ô Ăn Quan**: Hàm `renderStone(ctx, stoneType, skinId, seed)` và `renderBoard(ctx, boardSkinId)` tự động lấy đúng frame trong `stones-all-skins.png` (Sỏi, Hạt Me, Bi Ve, Xu Đồng, Ngọc Trai).
  - Với **Nhảy Lò Cò**: Hàm `renderDoubleTile(ctx, boxPairIndex, doubleTileSkinId)` vẽ riêng cặp ô gạch đôi `4-5` và `7-8` (Xi măng phấn, Gạch bông Sài Gòn, Đá lá sen, Gốm Bát Tràng, Gạch Hoàng Thành) kèm hiệu ứng sóng hạt khi nhân vật đáp 2 chân.

---

## 8. Thiết Kế Giao Diện (UI/UX) & Tiệm Tạp Hóa Dân Gian

Tuân thủ nghiêm ngặt quy tắc giao diện trong `AGENTS.md`:
- **Khung Modal / Game Container:**
  - Mobile: `w-full h-full`
  - Desktop: `sm:h-[92vh] sm:max-h-[900px] sm:max-w-4xl lg:max-w-5xl`
  - Header & Footer cố định, vùng nội dung cuộn riêng `<div className="flex-1 overflow-y-auto min-h-0 custom-scrollbar">`.
- **Các Màn Hình Chính Trong Game:**
  1. **Sảnh Chính (Main Tab):** Chơi với Bot (3 cấp độ), Ghép Trận 1vs1, Tạo Phòng Mã Mời, Nhập Mã Vào Phòng, Chơi 2 Người 1 Máy.
  2. **Tiệm Tạp Hóa Cổng Trường (`FolkShopModal.tsx`):**
     - Giao diện quầy tạp hóa tuổi thơ ấm cúng.
     - Chia tab trực quan: **`Quân & Quan`** | **`Ô Gạch Đôi`** | **`Sân & Bàn Chơi`** | **`Mảnh Chàm & Nhân Vật`**.
     - Có khung **Xem Trước Trực Tiếp (Live Canvas Preview)**: Bấm vào bất kỳ bộ Skin nào là thấy ngay viên Bi Ve lăn hay Ô Gạch Đôi Lá Sen toé nước ngay trên màn hình trước khi bấm Mua/Trang bị!
  3. **Bàn Đấu 1vs1 (`MatchView.tsx`):**
     - Hiển thị rõ **Badge số lượng quân** trên từng ô, đường chấm dự báo nước đi, nút cảm ứng lớn (`>= 56×56 px`), đồng hồ 25s và 6 Biểu cảm Pixel thuần Việt.

---

## 9. Lộ Trình Triển Khai Chi Tiết (Milestone Plan)

### Giai đoạn 1: `FD-L0` — Luật Chơi, Bot AI, Hệ Thống Skin, Tiệm Tạp Hóa & Đưa Ra Sảnh
1. Xây dựng `rules.ts` và `economy.ts` + `skins-catalog.ts` cho cả **Ô Ăn Quan** và **Nhảy Lò Cò**.
2. Sinh đầy đủ bộ Sprite Sheet Pixel Art Việt Nam (bao gồm các bộ Skin Quân/Quan, Ô Gạch Đôi, Bàn chơi, Nhân vật) + Icon `512×512` & Banner `1280×640`.
3. Xây dựng UI Bàn đấu + **Tiệm Tạp Hóa Cổng Trường** (mua & đổi Skin bằng Xu / Kẹo Mạch Nha, lưu vào `GameBridge` save).
4. Viết unit test luật & mô phỏng kinh tế, đưa 2 game ra sảnh Arcade-X ở chế độ Offline Bot + 2 Người 1 Máy.

### Giai đoạn 2: `FD-ON1` — Phòng Online 1vs1, Mã Mời 6 Số, Matchmaking & Đồng Bộ Skin
1. Tạo `supabase/folk-duel/schema.sql` và Edge Function `folk-duel-room` hỗ trợ Tạo phòng 6 số, Ghép trận nhanh FIFO 1vs1, CAS chống gian lận và đồng bộ `equippedSkins` giữa 2 người chơi trong phòng.
2. Kiểm thử tự động trên `PGlite` và dựng trang `review/folk-duel-room-lab.html` (test 2 người chơi + hiển thị chéo Skin của nhau ngay trên 1 màn hình).

### Giai đoạn 3: `FD-ON2` — Nghiệm Thu Staging & Phát Hành Public
1. Kiểm thử 2 tài khoản thật trên Staging, xác minh thưởng trận Online không bị nhận lặp khi tải lại trang (`receipt` idempotency) và phát hành lên Netlify.
