# ArcadeX — Kế hoạch sản phẩm nâng cấp 18 game

Ngày lập: 11/10/2026. Trạng thái: đang triển khai từng phần. Chi tiết hoàn thành, kiểm chứng và phần còn lại: [PRODUCT-UPGRADE-IMPLEMENTATION.md](PRODUCT-UPGRADE-IMPLEMENTATION.md).

## 1. Mục tiêu và phạm vi

ArcadeX là bộ sưu tập game dễ mở, dễ chơi, có bản sắc riêng. Người chơi vào game nhanh, hiểu luật qua thao tác, thấy phản hồi rõ và tin rằng tiến trình được giữ an toàn. Launcher chỉ phục vụ tìm game, chơi tiếp, yêu thích và tài khoản cơ bản. Không đưa trở lại cấp độ/EXP, nhiệm vụ, kho đồ, rương hoặc tiền tệ chung của hồ sơ. Dungeon Titan có hệ thống RPG riêng bên trong game; đây là một phần gameplay của trò đó.

Ưu tiên mobile dọc và desktop; hỗ trợ PWA/offline cho các game đơn. Không mặc định thêm quảng cáo, mua vật phẩm, battle pass, guild hoặc multiplayer cho mọi trò. Đồ họa được nâng cấp theo chủ đề từng game, không đồng loạt thêm neon, bóng đổ hoặc hiệu ứng nặng. Trước hết giữ bàn chơi dễ đọc và điều khiển chính xác.

Phạm vi nguồn đã đối chiếu: `src/games/registry.ts`, các entry game, kiểu dữ liệu, generator đại diện, `GameBridge.ts`, dịch vụ storage/account/PvP, migration Supabase và các báo cáo QC/đồ họa hiện có. Đây là kế hoạch dựa trên mã và kết quả kiểm tra đã lưu; không phải lượt chơi mới hết mọi màn, không phải khảo sát người dùng hay xác minh Supabase production.

## 2. Hiện trạng cần giải quyết

- Có đúng **18 game** trong registry. Nhiều game đã có nhiều chế độ, AI, màn chơi và hiệu ứng; cần làm sâu chất lượng trước khi thêm nhiều tính năng.
- Đã có bìa SVG, khung game, nền canvas và quân cờ vector. Đợt tiếp theo cần animation nhân vật/vật thể, phản hồi thao tác, âm thanh và bố cục riêng thực sự phục vụ gameplay.
- Game lưu dữ liệu qua nhiều khóa localStorage và GameBridge. Account snapshot giúp tách tài khoản và đồng bộ, nhưng hai thiết bị có thể ghi đè cả snapshot; chưa có hợp nhất tiến trình theo game.
- Supabase hiện có bảng tài liệu JSONB, binding danh tính và RPC kiểm tra quyền/phiên bản. Đây là nền chuyển đổi phù hợp, nhưng chưa phải backend thi đấu hoàn toàn xác thực luật và điểm. Có hai dịch vụ PvP cần thống nhất dần.
- Registry import game trực tiếp; cần đo và chia tải theo game để launcher không phải tải toàn bộ gameplay trước khi chơi.
- QC hiện có kiểm tra mở/tạm dừng 18 game và các tình huống đại diện. Chưa bao phủ tất cả màn, thiết bị thật, Safari, cân bằng gameplay và Realtime live.
- Các dòng mô tả quảng bá trong registry như số màn, mức AI hoặc “chuẩn luật” cần đối chiếu hành vi thật trước khi dùng làm cam kết sản phẩm.

## 3. Chuẩn chung phải hoàn thành trước khi nhân rộng

### 3.1 Trải nghiệm

Mỗi game có đường vào mặc định rõ: Chơi / Chơi tiếp; lựa chọn nâng cao đặt sau. Hướng dẫn đầu tiên bằng 2–3 thao tác trong game, có bỏ qua và xem lại. HUD chỉ giữ mục tiêu, điểm/lượt/thời gian cần thiết và tạm dừng. Màn kết thúc cho biết kết quả, nguyên nhân thất bại nếu phù hợp, rồi Chơi lại / Màn tiếp / Về danh sách. Không báo thưởng hồ sơ hoặc popup che thao tác.

Tự tạm dừng game đơn khi tab ẩn; quay lại có đếm ngược cho game phản xạ. Đồng hồ PvP vẫn chạy theo thời gian máy chủ. Phân biệt thoát ván và tạm dừng. Cập nhật PWA chỉ tại launcher, lưu checkpoint trước reload. Khách chơi được game đơn offline; tài khoản đồng bộ tiến trình. Khách có thể chơi PvP thường khi anonymous Auth đã hoạt động, còn xếp hạng cạnh tranh yêu cầu tài khoản email theo đề xuất.

Nút chính có vùng chạm khoảng 44×44 CSS px; bàn lớn có cơ chế zoom/chọn chính xác thay vì ép ô nhỏ. Không để màu sắc là dấu hiệu duy nhất. Có tắt âm/nhạc/rung, giảm chuyển động và mức hiệu ứng thấp. Tôn trọng safe area và bàn phím điện thoại.

### 3.2 Đồ họa và âm thanh

Tạo bộ mẫu chung cho menu, HUD, pause, kết quả và trạng thái mạng; mỗi trò có bộ màu, vật liệu, hình dạng và âm thanh riêng. Làm một màn mẫu hoàn chỉnh của từng nhóm trước khi sản xuất toàn bộ asset. Quy định kích thước, nén, tên file, nguồn và quyền sử dụng asset. Ưu tiên 2D/SVG/sprite; chỉ thêm engine hoặc 3D khi prototype chứng minh có lợi cho trò cụ thể.

Hiệu ứng ngắn báo thành công/lỗi, không che mục tiêu. Âm thanh phản hồi ngay, có giới hạn số tiếng đồng thời. Hình ảnh trang trí không dùng chung bộ ngẫu nhiên với gameplay. Tải asset cần thiết cho game đang chọn; gói offline tải rõ trạng thái và kích thước.

### 3.3 Kỹ thuật và chất lượng

Tách luật/engine, renderer, input và persistence khỏi component lớn theo từng game khi nâng cấp. Dùng seed có thể tái tạo và phiên bản luật/generator. Với action, tách bước mô phỏng khỏi tốc độ vẽ, giới hạn hiệu ứng, tái sử dụng đối tượng khi đo thấy cần. AI/generator nặng chạy Worker khi profiling xác nhận nghẽn.

Mục tiêu nghiệm thu ban đầu, cần đo trên thiết bị mẫu trước khi chốt:

| Chỉ tiêu | Mục tiêu đề xuất |
|---|---|
| Từ launcher đã tải đến thao tác đầu, game có asset cache | ≤2 giây trên thiết bị mẫu |
| Tải lần đầu một game ở cấu hình mạng thử nghiệm 10 Mbps/100 ms RTT | ≤5 giây; hiển thị loading thật khi lâu hơn |
| Game action | 60 FPS trên thiết bị tầm trung mẫu; mức đồ họa thấp ổn định ≥30 FPS trên máy yếu mẫu |
| Phản hồi thao tác local | P95 ≤100 ms; đo từ input đến phản hồi nhìn thấy |
| Stability beta | ≥99,5% phiên không có lỗi nghiêm trọng, theo dữ liệu đo thực |
| Lưu tiến trình | 0 mất dữ liệu trong ma trận refresh/offline/đổi tài khoản/xung đột đã định nghĩa |
| Online | Không nhận hai nước cho cùng một lượt, không cộng ELO hai lần |

Không đánh đồng đạt trên Chromium giả lập với đạt trên iPhone/Android thật. Tối thiểu kiểm tra 320/390 px, tablet, desktop; Chrome Android và Safari iOS trên thiết bị thật trước phát hành rộng.

## 4. Thiết kế dữ liệu Supabase

Đây là mô hình đề xuất, **chưa tạo bảng hoặc chạy migration production**. Giữ dữ liệu cũ trong quá trình chuyển; không xóa snapshot hay khóa local trước khi import và kiểm chứng.

| Thực thể đề xuất | Nội dung | Quyền và chính sách |
|---|---|---|
| Identity hiện có | Tên hiển thị duy nhất, avatar, UID | Giữ RPC/RLS hiện có; không đưa email vào dữ liệu công khai |
| `game_preferences` | Điều khiển, âm thanh, độ khó, hiệu ứng theo game | Chỉ chủ tài khoản; tùy chọn thiết bị như mức đồ họa có thể giữ local |
| `game_progress` | `(user_id, game_id, mode, content_version)`, màn đã hoàn thành, kỷ lục, sao | Hợp nhất theo từng trường; hoàn thành dùng hợp tập, best dùng max/min đúng ý nghĩa |
| `game_saves` | Slot theo game, schema_version, revision, device_id, payload, server timestamp | Riêng tư; compare-and-swap theo revision; ván đang chơi không trộn hai bàn |
| `game_content_versions` / `game_levels` | Version, seed, thông số, chủ đề, độ khó, trạng thái phát hành | Public chỉ nội dung đã phát hành; viết bằng vai trò quản trị phía server |
| `game_runs` | Run ID, mode, luật, seed, kết quả, trợ giúp đã dùng, trạng thái xác minh | Client gửi yêu cầu; server xác nhận kết quả phù hợp. Không công khai input riêng tư mặc định |
| `daily_puzzles` | Game, ngày UTC, seed/level, version và giờ đóng | Server chọn một đề chung; cache offline; gửi điểm sau hạn theo chính sách công bố |
| Leaderboard/view | Điểm/thời gian/lượt theo game, mode, version, có/không trợ giúp | Không cho client ghi thứ hạng trực tiếp; không trộn các thể lệ khác nhau |
| `matches`, `match_moves`, `ratings` | Hai bên, ruleset, clock, trạng thái, nước đi, ELO từng game | Người tham gia đọc; server kiểm luật và kết thúc, settlement idempotent |
| `match_queue` | Mode, vùng, rating, thời điểm và hết hạn | Dọn hàng chờ mất kết nối; khóa theo queue/phòng, tránh khóa toàn bộ hệ thống |
| Event đo sản phẩm | Mở game, bắt đầu/kết thúc, restart, hint, save conflict, lỗi | Không ghi mật khẩu/email/token; giới hạn retention và payload |

**Hợp nhất:** không dùng thời gian đồng hồ client để quyết định thắng xung đột. Tiến trình lâu dài hợp nhất độc lập mỗi game. Ván đang chơi dùng revision; nếu hai thiết bị cùng chơi một slot, giữ cả bản xung đột và cho chọn ván với thời điểm/màn/điểm. Không âm thầm thay toàn bộ dữ liệu. Sudoku notes và đường puzzle thuộc snapshot của ván, không union tùy tiện.

**Offline:** ghi local bền vững và hàng đợi có operation ID; khi có mạng gửi lại, server xử lý một lần. Phân biệt “Đã lưu trên máy”, “Đang đồng bộ”, “Đã đồng bộ”. Khách lưu local; chuyển sang tài khoản có bước import, không ghi đè tài khoản có tiến trình. Không gửi cloud từng frame; save khi thao tác logic/checkpoint, gom sự kiện. Dữ liệu lớn có thể chuyển IndexedDB sau đo kích thước, không bắt buộc chuyển tất cả ngay.

**Chống gian lận:** puzzle kiểm chứng lời giải và số lượt theo log/version khi cần; seed tự nó chưa đủ. Action cần run token, kiểm giới hạn và replay mô phỏng xác định trước khi gọi kết quả “đã xác minh”. Kiểm giới hạn chỉ giảm gian lận, không chứng minh điểm hợp lệ. PvP xếp hạng bắt buộc server kiểm luật, đồng hồ và kết quả. Không dùng publishable key để làm quản trị, không đặt service_role trong frontend.

**Di chuyển:** backup/export → adapter mới → import idempotent từng game → so sánh kết quả → chạy song song có kiểm soát → chuyển đọc/ghi → chỉ dọn dữ liệu cũ sau thời gian bảo lưu và xác nhận. Có cờ rollback; phiên bản mới đọc save cũ hoặc thông báo chuyển đổi rõ. Phải kiểm tra migration identity đã được áp dụng trên dự án thật; hiện chưa có xác nhận live.

## 5. Kế hoạch từng game

Ưu tiên dưới đây là thứ tự sản phẩm dựa trên độ phức tạp và độ phủ kỹ thuật, chưa dựa trên lượng người chơi vì chưa có analytics. “Bản đầu” là phạm vi cần làm trước; “Sau đó” chỉ triển khai sau khi bản đầu đạt nghiệm thu.

### 01. Xếp Gạch 2048 — Đợt 1, game mẫu cho lưu ván

- **Hiện có:** Classic, 5×5, Rush; undo/shuffle/hammer; snapshot bàn và kỷ lục theo mode.
- **Đồ họa:** bộ ô số rõ tương phản tới số lớn; trượt và hợp nhất có nhịp, bóng nhẹ, hiệu ứng đạt mốc; tắt shake/particle được. Giữ đọc số nhanh hơn xem hiệu ứng.
- **Gameplay bản đầu:** xác minh một ô chỉ hợp nhất một lần mỗi lượt; xử lý chuỗi vuốt nhanh; tách Classic thuần và ván có trợ giúp, không trộn bảng điểm. Giữ chơi tiếp sau 2048. Sau đó: daily seed và thử thách đạt một ô với ít lượt.
- **UX:** một nút Chơi tiếp, báo xác nhận khi bỏ ván; hướng dẫn vuốt một lần; Undo hiển thị còn bao nhiêu và điều kiện dùng; không vuốt khiến trang cuộn.
- **Database:** save grid/history/RNG state/mode/booster/rules_version; record theo mode + assisted flag. Daily thêm seed do server cấp và log moves.
- **Nghiệm thu:** `[2,2,2,2]` sang trái thành `[4,4,0,0]`; không sinh ô khi lượt không đổi bàn; reload giữ bàn/lịch sử/timer; Rush pause không mất giờ; xung đột hai thiết bị giữ được cả hai ván.

### 02. Xếp Gạch / Blocker — Đợt 1, game mẫu cho cảm ứng

- **Hiện có:** bàn 8×8, kéo thả khối, xóa hàng/cột, combo; endless và challenge.
- **Đồ họa:** khối ngọc có cạnh rõ; ghost placement, hàng sắp xóa và hiệu ứng combo theo tầng. Màu/hoa văn giúp đọc hình, không chỉ trang trí.
- **Gameplay bản đầu:** cân bằng túi khối và tăng độ khó minh bạch; quyết định game over dựa trên tất cả khối còn lại; kiểm tra xóa hàng/cột cùng lúc. Sau đó: daily cùng seed, mục tiêu ngắn 3–5 phút.
- **UX:** khối kéo nổi trên ngón tay; thả sai trả lại khay; có tap chọn rồi tap đặt thay cho kéo; hướng dẫn một combo. Không lôi phần thưởng hồ sơ vào challenge.
- **Database:** board, tray, bag/RNG state, combo, mode, target và run version; tiến trình challenge riêng từng ngày; best phân theo thể lệ.
- **Nghiệm thu:** offset kéo đúng ở 320/390 px; kéo ra ngoài không mất khối; một khối không đặt hai lần; game over không xảy ra khi còn nước; pause/reload không đổi khay.

### 03. Neon Runner 2099 — Đợt 1, game mẫu cho action

- **Hiện có:** endless runner canvas, nhảy kép, trượt, chướng ngại và vật phẩm.
- **Đồ họa:** nhân vật có chạy/nhảy/trượt/va chạm; thành phố nhiều lớp, bóng nền và dấu cảnh báo vật cản; nền giảm chi tiết vùng nguy hiểm. HUD khoảng cách, khiên và combo rõ.
- **Gameplay bản đầu:** mẫu chướng ngại có khoảng phản ứng tối thiểu; tốc độ tăng theo đoạn, không tạo chuỗi bất khả thi; input buffer và dung sai nhảy nhỏ được cân bằng. Sau đó: các tuyến chạy theo chương và daily seed.
- **UX:** nút nhảy/trượt lớn hoặc vuốt tùy chọn; tutorial chạy chậm; resume đếm ngược; thất bại chỉ rõ vật cản, retry nhanh.
- **Database:** distance, best, collision reason, controls, seed/version; checkpoint chỉ ở đoạn an toàn. Ván tính điểm online cần run token/log input, không nhận distance client vô điều kiện.
- **Nghiệm thu:** cùng input/seed cho hành vi nhất quán ở 30/60/120 Hz; không chết ngay khi resume; kiểm tổ hợp chướng ngại; đạt ngân sách FPS trên máy mẫu.

### 04. Car Escape — Đợt 2

- **Hiện có:** xe trượt theo trục, xe cứu thương thoát bàn, bản đồ màn; lưu mức hoàn thành riêng.
- **Đồ họa:** xe và bãi đỗ 2D có chất liệu, đèn xe cứu thương, mũi tên trục và tuyến thoát; chuyển thành phố bằng palette/asset có kiểm soát.
- **Gameplay bản đầu:** solver xác minh giải được, đo số bước tối thiểu cho thang sao; lưu bản bàn theo version, tránh màn cùng ID đổi lời giải. Sau đó mới thêm cơ chế đặc biệt, mỗi lần một cơ chế và có tutorial.
- **UX:** drag bám trục, ghost xe; undo/restart/hint từng bước có giải thích; bản đồ tự tới màn đang chơi; bàn 10×10 có zoom khi cần.
- **Database:** level version, board layout, moves, history, best_moves, completed, hints_used; seed không thay thế layout với save cũ.
- **Nghiệm thu:** không xe chồng/ra ngoài; solver giải mọi màn phát hành; kéo một xe nhiều ô tính lượt theo quy tắc công bố; sao đúng, save giữ vị trí mọi xe.

### 05. Scoodoku — Đợt 2

- **Hiện có:** 4×4, 6×6, 9×9, staircase, multigrid; campaign/time/endless/limit_steps; notes và undo.
- **Đồ họa:** chữ số là trọng tâm; đường vùng rõ, phân biệt given/input/note/error, theme sáng/tối. Multi-grid cần zoom/focus một vùng; tránh khung gỗ chiếm diện tích.
- **Gameplay bản đầu:** chuẩn hóa ràng buộc từng biến thể, kiểm đề sinh mới có lời giải duy nhất và phân độ khó theo kỹ thuật giải; gợi ý giải thích bước suy luận. Save legacy có nhiều đáp án phải chấp nhận đáp án hợp lệ theo luật, không so duy nhất với mảng solution cũ. Sau đó: daily và bài học kỹ thuật.
- **UX:** nhập số bằng keypad/bàn phím, note mode rõ, highlight số tương ứng; không tự phạt nhầm thao tác. Classic thư giãn không ép thời gian.
- **Database:** puzzle/version, givens, entries, notes, history, elapsed, errors, hints và completion; best theo size/difficulty/assistance. Không công khai solution cho daily trước thời hạn nếu cạnh tranh.
- **Nghiệm thu:** solver đếm nghiệm cho bộ đề mới; 6×6 vùng 2×3 đúng; giao điểm multigrid đồng bộ; undo cả value/notes; clock pause/restore đúng; hint không ghi đè given.

### 06. Shikaku — Đợt 2

- **Hiện có:** chia bảng thành chữ nhật theo số, generator từ phân vùng; Zen/Time Attack/Hardcore. Phân vùng sinh sẵn chưa đồng nghĩa đề có nghiệm duy nhất.
- **Đồ họa:** mỗi hình có viền và hoa văn, preview số ô theo kéo; số gợi ý luôn đọc được, không bị ánh sáng che.
- **Gameplay bản đầu:** solver đánh giá nghiệm/độ khó; chế độ campaign dùng đề đã kiểm chứng, Zen cho phép nhiều lời giải hợp lệ. Hint nêu vì sao vùng phù hợp. Sau đó: daily và bộ đề thủ công đặc sắc.
- **UX:** kéo hoặc tap hai góc; sửa/xóa hình và undo; báo cụ thể sai diện tích, chứa hai số hay chồng vùng.
- **Database:** clues, rectangles, puzzle_seed/version, history, time, mistakes/hints; completion theo luật, không buộc trùng phân vùng mẫu.
- **Nghiệm thu:** mọi ô phủ đúng một lần, mỗi vùng đúng một clue và diện tích; chọn đảo góc đúng; chấp nhận lời giải khác hợp lệ; reload giữ vùng đã vẽ.

### 07. Fill the Space / Lấp Đầy Khoảng Trống — Đợt 2

- **Hiện có:** ghép polyomino vào khuôn, Classic/Zen, bộ màn/generator và hình khối gỗ.
- **Đồ họa:** vân gỗ đồng nhất, bóng nâng khối, ghost khớp khuôn, khối đã đặt vẫn phân biệt; chiến thắng đóng thành tranh gỗ ngắn.
- **Gameplay bản đầu:** kiểm tồn tại lời giải và độ khó thực; rotation/mirror chỉ nếu luật của màn cho phép và có biểu tượng rõ. Sau đó: bộ khuôn có hình nhận diện và daily.
- **UX:** kéo có offset, tap để chọn/đặt, nút thu hồi từng khối, undo; hint gợi vị trí thay vì tự hoàn tất cả bàn.
- **Database:** cavity, piece definitions, allowed transforms, placements/history, content_version, best_moves/time và hints.
- **Nghiệm thu:** không chồng khối/đặt ngoài khuôn; phép quay giữ cell mapping; lấy khối đã đặt không sinh bản sao; mọi màn phát hành có lời giải; resume giữ biến đổi.

### 08. Draw A Shape — Đợt 2

- **Hiện có:** vẽ đường từ ô số, độ dài đúng số, lấp bảng; Classic/Time/Score/Strokes/Custom và intensity.
- **Đồ họa:** chủ đề chòm sao/mạch sáng; đầu đường, hướng và đếm độ dài rõ; hoa văn ngoài màu để phân biệt đường.
- **Gameplay bản đầu:** đa dạng cấu trúc đề có giải, tránh quá dựa vào dạng đường rắn dễ đoán; quy tắc tính strokes rõ; hint giữ lời giải còn khả thi. Sau đó: campaign chọn lọc và daily.
- **UX:** lùi ngón tay để rút đường, tap xóa một đường, undo; input nhảy qua nhiều ô cần nội suy an toàn, không tự nối chéo; màn đơn giản là mặc định.
- **Database:** seed/version, numbered starts, paths, history, intensity/mode, strokes/time/hints; lưu ván ngay cả khi đang vẽ dở ở checkpoint hợp lệ.
- **Nghiệm thu:** không đường chồng hoặc đi chéo; số đếm bao gồm ô xuất phát theo luật hiện tại; mọi bàn có lời giải; reset một đường không xóa đường khác; bàn lớn thao tác chính xác.

### 09. Mummy Escape — Đợt 2, triển khai sau chuẩn puzzle

- **Hiện có:** theo lượt, người đi một bước và mummy đuổi hai bước; campaign/turn_limit/time_attack/endless/custom_chamber; AI, bẫy và pathfinder.
- **Đồ họa:** sprite nhà thám hiểm/mummy/bọ cạp có animation; cổng, chìa và bẫy dễ đọc; chuyển lượt mạch lạc. Sương/nền cổ đại chỉ trang trí, không giấu thông tin cần giải.
- **Gameplay bản đầu:** thống nhất thứ tự hành động, va chạm, mở cổng và bẫy; kiểm solvability với AI thật và thêm màn dạy từng cơ chế. Adaptive difficulty minh bạch, không đổi luật đuổi âm thầm trong cùng bảng điểm. Sau đó: chương có cơ chế mới, daily chamber.
- **UX:** preview nguy hiểm hoặc một bước dự kiến ở chế độ học; undo theo lượt hoàn chỉnh, animation có tăng tốc; chỉ nhận input ở trạng thái đúng để tránh đi hai lượt.
- **Database:** level seed/version, wall/door/trap state, actor positions, turn history, AI version, mode/difficulty/hints và best_turns.
- **Nghiệm thu:** mummy đi đúng thứ tự/hai bước; chết và thắng không xảy ra đồng thời trái luật; hint tránh đường chết theo AI; undo khôi phục cả quái/bẫy/cổng; solver giải bộ màn phát hành.

### 10. Word Cross — Đợt 2

- **Hiện có:** nối chữ ngang/dọc/chéo theo từ mục tiêu, Classic/Mystery/Daily, bản đồ màn và tra nghĩa tiếng Anh.
- **Đồ họa:** ô chữ sắc nét, nét nối/liên kết rõ, bản đồ theo chủ đề từ vựng; hoàn thành từ có phản hồi nhẹ.
- **Gameplay bản đầu:** kiểm vị trí mọi từ, lọc từ vựng theo độ khó/chủ đề; công bố hướng nối và cách dùng lại ô. Mystery có hint từng tầng. Sau đó: nghe phát âm/ôn từ trong game, chỉ khi có nguồn âm thanh và từ điển hợp pháp, cache rõ.
- **UX:** vuốt liên tục có lùi đường, chạm chọn hỗ trợ; xem nghĩa không mất đường hoặc chạy timer sai; daily hiện ngày/hạn theo timezone rõ.
- **Database:** content version/dictionary version, level progress, found words, daily UTC seed, time/hints; sở hữu bằng UID, không dùng display_name làm khóa best để đổi tên không mất kỷ lục.
- **Nghiệm thu:** mọi từ hiện trên bàn và đúng luật; không ghi điểm lặp một từ; cùng daily trên hai thiết bị; đổi tên giữ điểm; offline vẫn tra nghĩa đã cache.

### 11. Hex Match — Đợt 3

- **Hiện có:** màn lục giác, mục tiêu lượt/thời gian, tile đặc biệt, băng/đá/xích và boosters; không nên coi chỉ là endless puzzle đơn giản như mô tả ngắn cũ.
- **Đồ họa:** chọn nhất quán chủ đề kẹo/tinh thể cho bản phát hành; hình dạng màu phân biệt; animation rơi/nổ dây chuyền rõ thứ tự, mục tiêu cập nhật không che bàn.
- **Gameplay bản đầu:** kiểm mọi màn có cách tiến triển, reshuffle khi hết nước theo quy tắc; cân bằng lượt/mục tiêu/booster; tránh bắt buộc dùng tiền hồ sơ cũ để qua màn. Booster giới hạn trong game hoặc miễn phí theo luật công bố. Sau đó: thêm cơ chế theo chương có tutorial riêng.
- **UX:** chọn tile chính xác theo hình hex, khóa thao tác lúc giải quyết cascade, xem tác dụng booster trước dùng; retry giữ nguyên mục tiêu và version.
- **Database:** board/RNG state, moves/timer, target progress, booster counts, stars/best và assisted flag; booster operation idempotent.
- **Nghiệm thu:** combo/special chain giải quyết một lần, không trừ hai lượt; không trạng thái animation kẹt; mạng lỗi không mất booster; board restore không tự phát sinh cascade khác.

### 12. Cosmic Defense — Đợt 3

- **Hiện có:** shooter canvas, enemy/boss, nâng vũ khí và EMP.
- **Đồ họa:** tàu, địch và đạn có ngôn ngữ hình riêng; boss telegraph, vụ nổ nhiều tầng có giới hạn; nền không lẫn màu đạn nguy hiểm.
- **Gameplay bản đầu:** wave có cấu trúc, pattern đạn né được, boss nhiều pha có tín hiệu báo; cân bằng nâng súng/EMP, hitbox và thời gian bất tử sau bị trúng. Sau đó: chiến dịch ngắn, Boss Rush.
- **UX:** auto-fire mặc định khi phù hợp, drag tàu có offset hoặc phím; EMP chạm dễ; màn kết thúc nêu wave/boss đã đạt, retry từ đầu hoặc checkpoint không xếp hạng.
- **Database:** wave/progress, loadout trong game, seed/version, stats damage/hits/EMP, mode và run verification; không lưu từng viên đạn lên DB.
- **Nghiệm thu:** nhiều đạn trúng cùng frame không trừ mạng quá luật; EMP không tác dụng hai lần; mọi pattern có cửa né; frame rate không đổi tốc độ đạn; pause không spawn địch.

### 13. Cyber Blade Slice — Đợt 3

- **Hiện có:** Stage/Classic/Zen/Time Attack/Boss Rush, combo/Fever, stage stars và tùy chỉnh speed.
- **Đồ họa:** đường kiếm phản hồi ngay, phân đôi vật thể đúng góc, âm thanh theo combo; silhouette bom rõ, VFX không giấu mục tiêu tiếp theo.
- **Gameplay bản đầu:** tính giao đoạn vuốt với hitbox, cắt một vật thể một lần; cân bằng combo window, bomb và boss cooldown. Speed tùy chỉnh chỉ casual hoặc bảng điểm riêng. Sau đó: màn boss/challenge với pattern thiết kế thủ công.
- **UX:** tutorial vuốt ngắn; cắt sát cạnh vẫn nhận đúng; giảm hiệu ứng và không rung tùy chọn; menu chế độ đưa Stage/Chơi nhanh lên trước.
- **Database:** stage stars/objectives, mode/speed/rules_version, best, combo metrics; ranked cố định speed, run seed và input samples có giới hạn kích thước.
- **Nghiệm thu:** vuốt nhanh không xuyên mục tiêu, một drag không farm boss vô hạn; cùng input ổn định giữa FPS; hoàn thành stage ghi đúng một lần; reduced motion vẫn đọc được Fever.

### 14. Eat 'Em All — Đợt 3

- **Hiện có:** Ice/Fire, Target/Endless/Time, nhiều difficulty, Fury và power-ups.
- **Đồ họa:** nhân vật có ăn/chuyển hệ/trúng đòn; item có hình và ký hiệu hệ, HUD Fury và buff có thời gian còn lại.
- **Gameplay bản đầu:** pattern rơi giúp quyết định chuyển hệ có ý nghĩa; cân bằng tần suất item/bom, combo/Fury và stacking buff; chuyển hệ có phản hồi tức thì. Sau đó: stage với mục tiêu và một cơ chế mới mỗi nhóm.
- **UX:** điều khiển một tay, chuyển hệ đặt gần ngón cái; tùy chọn bên trái/phải; tutorial cho ăn sai hệ và tránh bom; thống kê cuối ván chỉ điểm/mục tiêu/combo.
- **Database:** stage completion, mode/difficulty, best, seed/version, item counts, Fury activations và settings; checkpoint ở đầu stage, không cần sync mọi falling item.
- **Nghiệm thu:** hai item va cùng frame áp dụng đúng shield/life; chuyển hệ không race với va chạm; buff hết hạn đúng khi resume; mọi stage có spawn đủ vật phẩm mục tiêu.

### 15. Caro Gomoku — Đợt 4, game mẫu cho PvP chuẩn

- **Hiện có:** bàn 15×15, AI, ghép trận/phòng mời và ELO qua dịch vụ PvP.
- **Đồ họa:** bàn sạch, nước cuối và chuỗi thắng rõ; zoom/crosshair trên mobile; avatar/timer nhỏ gọn, không che bàn.
- **Gameplay bản đầu:** chốt rõ Gomoku freestyle (≥5) hay Caro theo quy tắc chặn; ruleset hiện ngay khi tạo trận. Giữ một luật mặc định, không tự áp dụng luật Renju. AI có cấp độ đo được. Sau đó: bài tập thắng/chặn một nước.
- **UX:** xem preview rồi xác nhận tùy chọn; hủy tìm trận được; không có đối thủ thì đề nghị AI, không tạo số người chơi giả; báo reconnect/timeout và xem lại nước đi.
- **Database:** authoritative matches + move index, ruleset, server clock, rating riêng; cùng nền tảng RPC với hai trò cờ còn lại; không nhận board/winner client tự khai.
- **Nghiệm thu:** kiểm 5/6 quân và trường hợp chặn theo luật đã chọn; duplicate move/reconnect không thêm nước; join race chỉ ghép một cặp; kết thúc/ELO duy nhất; khách không vào ranked nếu chính sách yêu cầu tài khoản.

### 16. Cờ Vua Quốc Tế — Đợt 4

- **Hiện có:** `chess.js`, AI, phòng/ghép trận/ELO và các nước đặc biệt. Không suy từ mô tả “FIDE” rằng mọi tình huống thi đấu đã được kiểm chứng.
- **Đồ họa:** bộ quân dễ nhận ở ô nhỏ, theme bàn sáng/tối, nước hợp lệ/nước cuối/check rõ; animation ngắn có tắt.
- **Gameplay bản đầu:** kiểm castling, en passant, promotion, checkmate/stalemate, thiếu vật chất, lặp và quy tắc hòa theo thể lệ được công bố. AI chạy ngoài UI nếu cần. Sau đó: tactical puzzles và phân tích ván mức cơ bản; engine mạnh chỉ sau đo tải/licensing.
- **UX:** tap chọn/đi hoặc drag, promotion dễ chọn, xác nhận đầu hàng; đồng hồ/increment hiển thị rõ; PGN xem lại/chia sẻ. Không trộn thắng AI vào ELO online.
- **Database:** FEN, PGN/move log, rules/time_control, clock anchors server, result/end_reason; rating theo nhóm time control nếu đủ người, nếu ít giữ một nhóm rõ.
- **Nghiệm thu:** bộ vị trí tham chiếu cho mọi luật đặc biệt; server từ chối nước lộ vua; mất mạng không dừng clock; race timeout/nước đi xử lý một kết quả; reload tái tạo đúng ván.

### 17. Cờ Tướng Online — Đợt 4

- **Hiện có:** luật quân riêng, AI/hotseat/PvP, phòng và ELO.
- **Đồ họa:** quân gỗ sáng/tối với ký tự dễ đọc; sông/cung, nước cuối và chiếu rõ; lựa chọn kiểu ký hiệu hỗ trợ người mới.
- **Gameplay bản đầu:** kiểm pháo ăn qua đúng một ngòi, mã cản chân, tượng không qua sông, tướng đối mặt và tự chiếu. Chốt chính sách lặp/chiếu dai/đuổi dai theo một ruleset công bố; không tự gọi chuẩn thi đấu trước khi xác minh. Sau đó: bài tập khai cuộc và chiếu bí.
- **UX:** tap chọn/đi, hint vùng hợp lệ; giải thích nước sai; đồng hồ/reconnect tương tự Chess; hotseat không gọi server ranked.
- **Database:** position notation hoặc schema quân versioned, move log, ruleset, clock/result và rating; server engine cùng bộ luật được kiểm thử với client.
- **Nghiệm thu:** vị trí chuẩn cho tất cả quân và lộ mặt tướng; bắt ngòi/chặn mã cập nhật đúng; không còn nước hợp lệ kết thúc theo luật đã chốt; replay/hotseat/PvP cùng kết quả; ELO không cộng hai lần.

### 18. Dungeon Titan — Đợt 5, phạm vi lớn nhất

- **Hiện có:** tap RPG với Titan/boss, chương truyện, Sword Master, ally, equipment và skills; save riêng local. RPG này nằm trong game, không quay lại launcher.
- **Đồ họa:** nhân vật/đồng đội có idle/attack/cast; boss có pha và telegraph, arena theo chương; số damage gom lại, loot xuất hiện gọn sau giao tranh; equipment có icon riêng và so sánh dễ đọc.
- **Gameplay bản đầu:** kiểm đường tăng HP/DPS/cost, bỏ đoạn grind vô nghĩa; nâng cấp tạo lựa chọn tap/ally/skill; skill cooldown và boss timer rõ; đối chiếu dữ liệu trang bị và chỉ số. Nếu có/định thêm offline progression, phải chốt trần và kiểm thời gian server trước phát hành. Sau đó: thêm chương/boss; prestige chỉ khi playtest chứng minh cần, không mặc định thêm hệ thống phụ.
- **UX:** arena là màn chính, nâng cấp một chạm có preview hiệu quả; tab Heroes/Equipment giải thích ngắn; quick equip có so sánh; không mở thêm daily/monthly/shop launcher. Có tùy chọn hỗ trợ thao tác để tránh yêu cầu chạm liên tục quá mức.
- **Database:** schema riêng trong game_progress/save cho stage, heroes, skill cooldown, equipment instances và economy nội bộ; số rất lớn dùng biểu diễn an toàn; giao dịch nâng cấp/trang bị idempotent khi cloud-authoritative. Không public toàn bộ inventory, không dùng wallet chung launcher.
- **Nghiệm thu:** upgrade/skill không chi hai lần; công thức ở mốc đầu/giữa/cuối không NaN/overflow; chuyển máy giữ trang bị; boss timeout không đồng thời nhận thắng; sửa đồng hồ thiết bị không tạo tài nguyên miễn phí; playtest đường tiến triển bằng simulation và người chơi.

## 6. Lộ trình triển khai và phụ thuộc

| Đợt | Phạm vi | Kết quả để bạn chơi thử | Cổng hoàn thành |
|---|---|---|---|
| 0 — Nền tảng | Save adapter per-game, import dữ liệu cũ, UX/HUD mẫu, lazy load, đo hiệu năng, event tối thiểu | Bản preview ổn định + bảng trạng thái đồng bộ | Save isolation, offline/retry/conflict, auth/PWA không hồi quy |
| 1 — Ba game mẫu | 2048 → Blocker → Neon Runner | Puzzle vuốt, puzzle kéo và action được hoàn thiện từ đầu đến cuối | Bạn nghiệm thu cảm giác chơi; đạt test luật/input/performance |
| 2 — Puzzle | Car Escape → Scoodoku → Shikaku → Fill the Space → Draw A Shape → Word Cross → Mummy Escape | Mỗi trò có bộ màn/version/save đã kiểm chứng | Solver và test tương ứng; kiểm màn phát hành; mobile đạt |
| 3 — Action và cascade | Hex Match → Cosmic Defense → Cyber Slice → Eat 'Em All | Cascade và action có VFX/SFX, cân bằng, input tốt | Stress test, FPS máy thật, kết quả phân thể lệ |
| 4 — PvP | Backend dùng chung + Caro → Chess → Xiangqi | Hai trình duyệt đấu, reconnect và replay | Server kiểm luật/clock/ELO, live Auth/Realtime, race/load test |
| 5 — Dungeon | Công thức/cân bằng → save/economy → arena/nhân vật → nội dung | Một chương mẫu hoàn chỉnh trước khi nhân nội dung | Simulation, migration, anti-double-spend, playtest tiến triển |
| 6 — Phát hành | Soak test, thiết bị thật, backup/rollback, docs | Release candidate của cả bộ | Không lỗi chặn chơi/mất dữ liệu; cập nhật an toàn |

Đồ họa và gameplay của từng trò đi cùng một đợt; không làm hết 18 bìa trước rồi mới sửa trải nghiệm. Dù phần hoàn thiện PvP ở đợt 4, lỗi quyền truy cập/luật nghiêm trọng phát hiện được phải sửa ở đợt 0 hoặc tạm đóng ranked. Nếu dữ liệu sử dụng sau pilot cho thấy ưu tiên khác, đổi thứ tự game trong đợt; không bỏ qua phụ thuộc save/PvP.

### Ước lượng để lập ngân sách

Giả định một người phụ trách triển khai toàn thời gian với trợ giúp AI, tái sử dụng asset 2D hiện có, có thời gian QC/art và bạn phản hồi mỗi đợt. Đây là khoảng công sức, không cam kết lịch; chưa bao gồm thuê họa sĩ vẽ toàn bộ asset riêng, bản native hoặc server MMO.

| Phần | Ngày công ước tính |
|---|---:|
| Nền tảng | 8–12 |
| Ba game mẫu | 12–18 |
| Bảy puzzle tiếp theo | 25–40 |
| Bốn game action/cascade | 22–35 |
| Backend PvP + ba trò cờ | 22–35 |
| Dungeon Titan | 15–25 |
| QC toàn bộ/phát hành | 8–12 |
| Tổng trước dự phòng | 112–177 |

Thêm khoảng 20% dự phòng cho lỗi legacy, asset và tích hợp live: khoảng 135–213 ngày công. Với một người và 5 ngày/tuần, phạm vi đầy đủ tương đương khoảng 27–43 tuần; tốc độ AI và mức hoàn thiện có thể thay đổi mạnh. Chỉ chốt lại lịch sau đợt 1 với số đo thực tế. Bản đầu chất lượng cho nền tảng + ba game mẫu khoảng 20–30 ngày công trước dự phòng. Có thể phát hành từng đợt, không phải đợi toàn bộ mới có giá trị.

## 7. Backlog khởi động cụ thể

| ID | Việc | Đầu ra / nghiệm thu |
|---|---|---|
| F01 | Lập bản đồ 18 game, khóa save và schema/version | Inventory dữ liệu, fixture save cũ, không bỏ sót khóa ngoài GameBridge |
| F02 | Thiết kế UX/HUD và asset mẫu | Bản mẫu mobile/desktop cho 2048, Blocker, Runner; chủ dự án chơi thử và nhận xét |
| F03 | Save API + import + queue | Refresh/offline/đổi tài khoản/thiết bị/xung đột không mất ván; xử lý quota/lỗi ghi rõ |
| F04 | Lazy loading và profiling | Báo số đo trước/sau; asset tải theo game; PWA offline không hỏng chunk sau update |
| F05 | Events tối thiểu và error reporting | Không PII/token; xem được funnel chọn game → bắt đầu → kết thúc/retry |
| G01 | 2048 hoàn chỉnh | Luật, input, animation, âm thanh, save, assisted leaderboard tách đúng |
| G02 | Blocker hoàn chỉnh | Drag/tap mobile, khay/solver nước còn lại, feedback, challenge không thưởng hồ sơ |
| G03 | Runner hoàn chỉnh | Điều khiển, pattern an toàn, nhân vật, pause/resume và FPS máy mẫu |
| Q01 | QC đợt đầu | Báo cáo có lỗi/giới hạn, screenshot/video; bạn thử ba trò trên điện thoại |

## 8. Cách quản lý từng bản nâng cấp

Mỗi game có một brief chốt mục tiêu, mockup một màn, bảng luật và dữ liệu; rồi prototype chơi được → feedback → hoàn thiện → QC → preview → nghiệm thu. Chỉ bắt đầu sản xuất thêm nhiều màn/asset sau khi vòng chơi mẫu tốt. Các quyết định thường ngày tôi đề xuất và xử lý; bạn tập trung cảm giác chơi và ưu tiên sản phẩm.

Điều kiện hoàn tất mỗi game:

1. Cơ chế cơ bản, edge cases và chế độ phát hành có kiểm tra đúng luật; không kiểm chỉ mở màn hình.
2. Mobile/desktop không che HUD/nút, hướng dẫn dễ hiểu, điều khiển thay thế khi cần.
3. Save cũ đọc/import được, tiến trình khách và tài khoản tách đúng, có kiểm refresh/offline/retry/conflict.
4. Đồ họa/SFX có quyền sử dụng, reduced motion/âm tắt hoạt động, đo hiệu năng trên thiết bị mẫu.
5. Không regression launcher/auth/PWA; không cập nhật giữa ván.
6. Có preview, changelog, kết quả QC và các giới hạn còn lại. Không gọi API mô phỏng là đã kiểm production.

Đo sản phẩm theo game: tỷ lệ vào game và bắt đầu, thời gian đến thao tác đầu, tỷ lệ bỏ tutorial, restart sau thua, hoàn thành màn và điểm mắc kẹt, hints dùng, save conflict/error; PvP thêm thời gian tìm trận, disconnect và timeout. Thu baseline trước, đặt mục tiêu sau pilot; chưa bịa DAU/retention hoặc tỷ lệ cải thiện khi chưa có dữ liệu. Số lượt chơi quan trọng hơn số menu/tính năng đã thêm.

## 9. Khuyến nghị khởi đầu

Bắt đầu đợt 0 và lấy **2048** làm mẫu đầu tiên. Sau đó **Blocker** kiểm chứng cảm ứng và **Neon Runner** kiểm chứng cảm giác action. Ba trò này giúp chốt tiêu chuẩn chung, chứng minh lưu dữ liệu và hiệu năng, rồi mở rộng tới 15 game còn lại với ít rủi ro hơn. Bản kế hoạch này chưa thay đổi mã gameplay, chưa chạy SQL hay phát hành production.
