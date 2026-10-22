# Dungeon Titan: Reforged v3

Ngày: 16/10/2026. Trạng thái: bản nháp có thể chơi, chưa phát hành.
Nền mã nguồn Dungeon Titan: `ducpham2806/Arcade-x`, main tại `c143446375eb7bbfa003e75418dad0403d3ce7f2`.

## Trải nghiệm hướng tới

Giữ thể loại tap/idle RPG: người chơi chạm Titan, nâng kiếm sĩ, tuyển đội hình và săn trang bị. Chuyển quyết định từ chỉ tăng chỉ số sang chọn thời điểm: tích năng lượng, giữ combo, phá giáp và phản công sau cảnh báo. Phiên ngắn có thể hoàn thành một hoặc vài cổng Titan. Tám chương là phần giới thiệu bối cảnh, sau tầng 200 tiếp tục thử thách lặp có giới hạn tầng 1.000 trong bản này.

Ba trụ cột: thao tác thuận tiện bằng chạm/giữ/phím; boss có cảnh báo và cơ hội phản công; phần thưởng có nguồn và giao dịch đơn nhất.

## Vòng chơi

- Trong vài giây: chạm hoặc giữ Tấn công → sát thương, +3 MP, combo → đánh trúng điểm lộ lõi bằng tuyệt kỹ.
- Trong một cụm 10 tầng: qua các loại phòng, chi tiêu vàng, hồi năng lượng trước cổng → đối đầu Titan 30 giây.
- Dài hạn: mở 7 tuyệt kỹ, chiêu mộ 6 đồng đội, hoàn thiện 5 ô đồ kiếm sĩ và 3 ô mỗi đồng đội, hạ Titan lần đầu lấy Ấn, khắc 3 nhánh vĩnh viễn. Từ tầng 200 có bia chiến tích tiêu vàng đổi huy hiệu/danh hiệu.

## Các cơ chế

Tất cả số cân bằng bên dưới là `[PLACEHOLDER]`: đã chạy kiểm tra/mô phỏng nhưng chưa được duyệt qua chơi thử thực tế.

| Cơ chế | Mục đích và quyết định | Input / Output | Thành công, thất bại và biên |
|---|---|---|---|
| Combo | Thưởng giữ nhịp, không bắt buộc chạm quá nhanh | Chạm hợp lệ → +1 hit, +1,5% damage/hit, tối đa 30 | Đứt sau 1,4 giây; trượt đỡ xóa combo. Chạm được giới hạn 90 ms; giữ nút là 4 đòn/giây. Không cộng hit khi tạm dừng. |
| Phá giáp | Đổi nhịp giữa chạm và dồn kỹ năng | Chạm +1 hoặc kỹ năng tức thời +3 điểm phá giáp; đạt ngưỡng mở lõi 3s | Giáp giảm sát thương còn 65%; lộ lõi ×1,6. Nội tại đồng đội không tự phá giáp. Boss vùng xương/băng có ngưỡng khác. |
| Đỡ đòn | Người chơi đọc tín hiệu, phản công | Nút Đỡ sáng trong cửa sổ báo trước → +10 MP, lộ lõi 3s | Mỗi chu kỳ chỉ thành công một lần; bấm ngoài cửa sổ không tốn tài nguyên. Trượt mất thời gian và đôi khi MP/hồi chiêu; không mất đồ. |
| Tiếp cận boss | Bảo đảm lần đầu đọc được đòn | HP không xuống dưới 40% trong lần chuẩn bị đòn đầu tiên | Hết khoảng chuẩn bị đầu tiên mới có thể kết liễu; các kỹ năng vẫn tiêu năng lượng/hồi chiêu nếu sử dụng quá sớm. |
| Kỹ năng | Dùng MP chọn buff/burst theo tình huống | Đạt cấp mở, đủ MP và hết hồi chiêu → trừ MP và kích hoạt một lần | Mana/cooldown được xử lý nguyên tử; không cho dùng kỹ năng đang khóa. Buff không giữ active qua tải lại, cooldown được lưu. |
| Đồng đội | Có tiến triển khi không chạm | DPS theo thời gian và 3 kỹ năng luân phiên | Một cooldown đang hoạt động trên mỗi đồng đội; loại bỏ trạng thái skill/skills chạy lệch nhau. Không phát hành thưởng offline. |
| Trang bị | Đổi lựa chọn build; dùng lại tài sản cũ | Mặc đổi đồ cùng ô; rèn/sell/best | So sánh gợi ý theo chỉ số gốc cấp 1; hiệu suất bonus lớn giảm dần. Không thể bán/mặc lại item đã rời kho. Bán kho có xác nhận, giữ đồ đang mặc. |
| Lối đánh | Người chơi tự chọn vai trò | Đổi miễn phí giữa Kiếm vũ / Quân đoàn / Thợ săn | Lần lượt +25% chạm / +30% đội / +25% vàng hạ quái. Không có phí hay tiền tệ thêm. |
| Ấn Titan | Phần thưởng mốc dài hạn | Boss đầu tiên mỗi tầng → 1 ấn, tầng chia hết 20 → 2 ấn | Chơi lại không nhận ấn; 10 bậc/nhánh, +4% mỗi bậc. Không reset tiến trình. |
| Bia chiến tích | Nơi tiêu vàng sau chiến dịch | Từ max tầng 200, tiêu vàng → bậc huy hiệu/danh hiệu | Không tăng damage hay thứ hạng. Chi phí tăng ×1,4/bậc, tính theo thưởng tầng cao nhất. |
| Nhặt đồ | Tách phát thưởng khỏi hiệu ứng hình ảnh | Auto thêm kho; thủ công giữ trong danh sách chờ | Vàng hạ quái cộng một lần; không còn coin particle có thể nhận thêm vàng. Danh sách chờ được lưu và loại trùng khi khôi phục. |

## Thiết kế màn

Đây là tap arena, không phải dungeon đi lại. Không thêm mê cung, va chạm hay đường di chuyển giả. Thiết kế level tập trung vào nhịp phòng, chuỗi đợt và đọc đòn boss.

| Vị trí cụm đầu | Phòng | Tổng HP so với một quái thường | Vàng | Cách tiếp cận |
|---|---|---:|---:|---|
| 1 | Trinh sát | ×1 | ×1 | Giới thiệu chạm/giữ; 0,65s đọc địch trước sát thương. |
| 2 | Thiết giáp | ×1,15 | ×1,2 | Phá giáp bằng tap hoặc kỹ năng, sau đó burst. |
| 3 | Bầy đàn | ×1,1 chia 3 đợt | ×1,15 chia 3 | Duy trì combo qua đợt hoặc dùng DPS đồng đội. |
| 4 | Pháp sư | ×0,9 | ×1 | Hạ để hồi 15 MP. |
| 5 | Tinh anh | ×1,65 | ×1,8 | Tốn kỹ năng lấy phần thưởng, hoặc giữ MP cho boss. |
| 6 | Kho báu | ×0,65 | ×1,8 | Hạ nhanh, mua nâng cấp. |
| 7 | Thiết giáp | ×1,15 | ×1,2 | Áp dụng lại phá giáp với build mạnh hơn. |
| 8 | Liên chiến | ×1,3 chia 2 đợt | ×1,4 chia 2 | Tích MP, ưu tiên kỹ năng hồi ngắn. |
| 9 | Hồi phục | ×0,65 | ×0,9 | Hạ hộ vệ hồi 30 MP trước cổng. |
| 10 | Titan | ×4,8 | ×4 | Đọc cảnh báo, đỡ, dồn sát thương; rút lui về farm nếu yếu. |

Có ba chuỗi thứ tự luân phiên cho các cụm tiếp theo. Đầu cụm, tinh anh, kho báu, hồi phục, boss được giữ làm mốc; vị trí thiết giáp/bầy đàn/pháp sư/liên chiến thay đổi. Không tuyên bố 1.000 layout độc lập: bản này có 3 nhịp phòng × 8 biome, dùng lại từ tầng sâu.

Critical path: 10 nút tiến độ nhìn thấy trên đấu trường. Hành trình cho trở về đầu cụm đã mở; không nhảy vượt tầng cao nhất. Rút lui giữ tầng cổng và sinh quái farm tầng trước, hạ farm không vượt boss. Chưa có đường rẽ loot trong bản này.

## Tám mẫu boss

| Vùng | Chu kỳ | Đòn rơi ở | Cửa sổ đỡ | Phạt trượt | Khác biệt |
|---|---:|---:|---:|---|---|
| Goblin | 7,5s | 4,5s | 1,25s | −2s | Chùy chấn địa, mẫu học đầu tiên. |
| Xương | 8s | 4,75s | 1,25s | −2s | 10 hit phá giáp. |
| Nhện | 7s | 4,25s | 1,25s | −3s | Tơ độc, áp lực thời gian. |
| Huyết ma | 7,75s | 4,75s | 1,25s | −2s, −15 MP | Chống việc spam skill trước khi đỡ. |
| Hỏa long | 8,5s | 5s | 1,5s | −4s | Đòn chậm, mức phạt lớn, cửa đỡ rộng. |
| Băng | 8s | 4,75s | 1,25s | −2s, −10 MP | 9 hit phá giáp. |
| Lôi | 6,75s | 4s | 1s | −2,5s | Nhịp nhanh hơn. |
| Hư vô | 7s | 4,5s | 1,25s | −3s, +1,5s cooldown | Trừng phạt thiếu chuẩn bị. |

Dưới 40% HP, đồng hồ trôi ×1,15. Chu kỳ cảnh báo không đổi theo HP để tránh nhảy pha giữa lúc người chơi chuẩn bị đỡ. Boss cấp chương dùng tên boss cốt truyện; hộ vệ giữa chương dùng tên theo biome. Tránh cảnh tên rồng nhưng render Goblin.

## Kinh tế và cân bằng

Chỉ có hai tiền tệ gameplay. Vàng từ hạ quái và bán đồ, dùng cho cấp kiếm sĩ/đồng đội/kỹ năng/rèn/bia chiến tích. Ấn từ boss lần đầu, dùng cho 3 nhánh rune. Không có quy đổi tiền thật, giao dịch giữa người chơi, trả phí tăng lực hay quảng cáo trong bản thử.

Công thức chính:
- HP quái thường = round(85 × 1,16^(tầng−1)), sau đó nhân hệ số phòng và chia số đợt.
- Vàng thường = round(18 × 1,16^(tầng−1)), sau đó nhân hệ số phòng và chia đợt. Bonus vàng chỉ áp dụng một lần khi hạ.
- Cấp kiếm sĩ: chi phí từng cấp = round(18 × 1,18^(cấp−1)); batch cộng chính xác từng cấp.
- Chạm cơ bản = 10 × 1,15^(cấp−1) × 1,1^floor(cấp/5), rồi nhân trang bị, lối đánh, rune, combo và crit.
- Cấp đồng đội: cost = baseCost × 1,2^cấp. Damage = baseDamage × 1,16^cấp × 1,08^floor(cấp/5).
- Trang bị mới: chỉ số gốc theo (1 + 0,03 × (tầng−1)) × hệ số độ hiếm; thay cho 1,08^(tầng−1). Rèn bonus ×1,12, cost ×1,45, tối đa level 20. Đồ cũ >20 được giữ nhưng không rèn tiếp.
- Tổng bonus trang bị có knee 300% (vàng 150%); phần vượt knee = 100 × ln(1 + phần_vượt/100), trần hiệu lực 1.200%. Chỉ số gốc của đồ vẫn hiển thị; damage/thu nhập thực dùng hiệu suất giảm dần này.
- Loot kiếm sĩ: 28%/phòng, tinh anh 60%, boss 100%; chậm nhất phòng thứ 7 có đồ. Nếu 4 món liên tiếp common, món thứ 5 ít nhất rare. Loot đồng đội 16%/phòng, boss 100%. Đồ từ các đợt phụ không roll riêng.
- Rare/epic/legendary odds điều chỉnh theo tầng từ bảng `getRandomRarity`. Không có loot mua tiền; bảo chứng rare không có nghĩa epic/legendary được bảo đảm.
- Rune cost = 1 + floor(bậc hiện tại/2), tổng 30 ấn cho một nhánh 10 bậc.
- Bia = round(thưởng gốc tầng cao nhất ×20 ×1,4^bậc), chỉ tác dụng huy hiệu/danh hiệu.

Bảng `.xlsx` chứa các driver và công thức 200 tầng/cấp, cộng snapshot mô phỏng 90 ngày. Thay driver trong workbook không tự chỉnh source; cần đổi source tương ứng và chạy lại bot.

## Kiểm tra và kết quả mô phỏng

17 nhóm unit test: tính thuần/determinism, vàng cộng một lần, chuỗi đợt, boss timeout/farm, ấn lần đầu, đỡ một lần/chu kỳ, 8 mẫu boss, phá giáp, khóa kỹ năng/giao dịch MP, bán lặp/stale item, pending loot, legacy validation, rune cap, stance, không phát vàng offline, số hữu hạn, cosmetic sink không tăng lực.

Kiểm tra DOM giả: khởi động, 5 tab, 6 đồng đội, 5 ô trang bị, 8 chương, 3 nhánh rune, fixture boss, rút lui/tái đấu, lưu, gallery 15 actor. Không phải kiểm tra layout trên browser.

Mô phỏng 90 ngày dùng 4 bot: casual 5 phút/ngày, 1 tap/s; core 15 phút/ngày, 4 tap/s; grinder 30 phút/ngày, 8 tap/s; spender dùng cùng gameplay core và không nhận power trả phí. Bots tự chi tiêu tối ưu theo chính sách xác định, dùng buff và burst, một số profile biết đỡ. Khác seed nên khác kết quả loot. Chỉ tính active play, không có offline.

Ngày đầu boss đầu tiên khoảng 14–32 giây ở mô hình bot. Bot casual hoàn tất 200 tầng trong khoảng 5 phút; đây là dấu hiệu cần người chơi thật xác nhận tốc độ mở nội dung trước khi phát hành, không phải dự báo retention. Tất cả bot chạm trần 1.000 trong 90 ngày. Cuối kỳ, tỷ lệ tổng vàng kiếm / tổng vàng tiêu 7 ngày: casual 1,054; core 1,123; grinder 0,843; spender 1,124. Tất cả 360 ngày-profile đối soát ví đúng trong sai số số thực. Tham chiếu draft cân bằng: 0,8–1,2, ngoài khoảng phải xem nguyên nhân theo cohort. Không dùng một ngày không chi tiêu để kết luận lạm phát.

File `economy-before-tuning.json` ghi đợt mô phỏng đầu với đường tăng trưởng cũ bị runaway; chỉ để xem lý do chỉnh thông số, không phải baseline telemetry của bản live.

## Art và ngân sách kỹ thuật

Art code-native SVG, không cần atlas raster hay request mạng: kiếm sĩ mặc giáp xanh/khăn vàng, sáu class đồng đội, tám biến thể boss và các dạng địch theo loại phòng. Cánh rồng, chân nhện, áo choàng huyết ma, tia sét, vòng hư vô và mão băng dùng hình học khác nhau. Một số class/địch dùng chung cấu trúc thân, không phải 15 bộ vẽ tay hoàn toàn riêng.

States: idle thở; windup nghiêng/nâng người; exposed lõi sáng; hurt rung nhẹ; kiếm sĩ có pose attack. Đây là hoạt họa vector/transform, không phải spritesheet chuyển động/tấn công từng frame. Không tạo đường đi giả cho game không có locomotion. Bối cảnh 8 palette có rừng/đền/lava/băng và lớp địa hình; chuyển theo chương, không có thay đổi camera.

Budget draft: 1 Titan + 1 kiếm sĩ + tối đa 6 đồng đội; một thông điệp combat trên màn hình; không particle system; không SVG filter hoặc bloom nhiều lớp; chỉ CSS transform/opacity. Tối đa khoảng 320 primitive SVG trong arena. Bản review sau bundle khoảng 315 KiB, không tải font/ảnh/script ngoài. Reduced motion tắt chuyển động; giới hạn số thông điệp; trang bị dài dùng vùng cuộn riêng. Không có mesh, vì thế LOD mesh/BC7/ASTC không áp dụng. Chưa đo GPU/frame time trên điện thoại thật.

PC: đấu trường và panel bên nhau, panel giữ chiều cao giữa tab. Mobile: đấu trường trước, panel 600px cuộn bên trong, không có nav fixed che game. Nút tấn công/đỡ chính ≥44px; một số điều khiển phụ nhỏ hơn và cần kiểm tra chạm thực tế. Thông báo thưởng không chặn gameplay. Có nút pause, tự pause khi tab ẩn; không bù thời gian khi quay lại.

## Save và tích hợp

Dữ liệu v3 đi qua `bridge.loadGameState` / `bridge.saveGameState`. Read xong mới cho ghi; lỗi read giữ trạng thái khóa và không ghi đè. Có autosave 5 giây, lưu khi ẩn/thoát và Lưu ngay. Dùng GameBridge của launcher để hưởng account scoping của nó; chưa kiểm chứng round-trip cloud/đổi tài khoản trên hai thiết bị trong lượt này.

Legacy localStorage chỉ hiển thị lời mời nhập rõ ràng khi bridge chưa có dữ liệu. Người chơi phải xác nhận đó là tiến trình của mình; không tự gán bản legacy chung vào account. Không xóa key v2. Validation giữ đồ hợp lệ, loại ID trùng giữa đang mặc/kho/chờ, và tính lại chỉ số với balance v3. Cấp và vật phẩm không đồng nghĩa giữ nguyên sức mạnh sau thay đổi công thức. Save vượt tầng/cấp 1.000 được từ chối mở và giữ nguyên, tránh cắt dữ liệu ngầm.

Trận đang đánh khởi động lại khi mở game, mana được giữ, buff active không khôi phục. Đây là checkpoint theo tiến trình, chưa phải resume chính xác HP/timer/phase. Wrapper production giữ nút BXH, modal real-time, PlayerContext và adapter submitLeaderboardScore hiện có. Khi mở BXH, trận được pause. Tổng kết đi qua callback launcher với điểm là tầng cao nhất, thay cho công thức score trộn vàng. Preview chỉ mount core, không gửi leaderboard. Cần kiểm chứng backend thực và cách launcher ghi điểm trước merge. Review độc lập dùng save riêng và không gửi leaderboard.

Không sửa database, auth, dịch vụ chat, hay hệ thống thưởng chung của launcher. Không push main, không merge, không publish Netlify.

## Điều kiện còn lại trước khi phát hành

1. Build đầy đủ Arcade-x trên checkout mới nhất; gói này chỉ đã type-check module Dungeon và build bản review độc lập.
2. Chơi trực quan trên browser desktop/mobile; môi trường hiện tại không có browser QA được hỗ trợ.
3. Đo FPS trên thiết bị Android thật, kiểm tra chữ/nút/overflow và màn hình thấp.
4. Round-trip save theo account A→B→A, guest→account, trình duyệt sạch; kiểm tra callback tổng kết và leaderboard.
5. Chơi thử nhịp 200 tầng với người mới; quyết định có giảm tốc độ mở nội dung/điều chỉnh sink trước khi duyệt.

## Changelog

v3: thay core update bằng reducer thuần, director phòng, combo/giáp/đỡ boss, 8 attack patterns, hình vector theo biome, UI responsive, rune và cosmetic sink, GameBridge save có bước legacy rõ ràng, sửa vàng trùng, giảm đường tăng trưởng, thêm tests/mô phỏng/workbook/export offline.
