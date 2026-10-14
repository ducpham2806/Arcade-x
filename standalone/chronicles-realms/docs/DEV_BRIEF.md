# DEV BRIEF – Chronicles of the Shattered Realms

Bản rút gọn của GDD v2.2 cho lập trình viên. Nếu có mâu thuẫn, ưu tiên GDD đầy đủ.

## 1. Tổng quan
- **Thể loại:** Block Breaker + phiêu lưu, 2D, đồ hoạ 3D cách điệu dựng thành spritesheet.
- **Nền tảng:** HTML5 trên kho game (PC + trình duyệt mobile); miễn phí hoàn toàn, không quảng cáo, không tiền thật.
- **Cốt truyện:** Lõi Cầu của thế giới Aethra bị Lord Fracture đập vỡ thành 6 mảnh, mỗi mảnh rơi vào một vùng đất. Người chơi (Pixel + Orb) lấy lại từng mảnh bằng cách phá gạch và hạ boss.
- **Nhân vật:** Pixel (Người Giữ Khiên, thanh chắn), Orb (quả bóng có mắt), Sage Bytes (người dẫn đường), Ember (thợ rèn), Lord Fracture (ác chủ).

## 2. Luật cốt lõi
- Thanh chắn ở đáy; kéo ngón tay/chuột (hoặc phím mũi tên) để di chuyển; chạm/Space để phóng bóng.
- Mỗi màn 3 mạng (màn "một bóng" chỉ 1). Bóng rơi hết thì mất 1 mạng; hết mạng thì thua.
- Góc nảy phụ thuộc vị trí chạm trên thanh: giữa = bay thẳng, mép = chéo (giới hạn góc để bóng không bay ngang vô tận).
- Tốc độ bóng tăng nhẹ theo thời gian và va chạm, có trần, reset khi mất mạng.
- Thắng: phá hết gạch bắt buộc (gạch bất tử/gương không tính). Boss: hạ boss.
- Điểm theo loại gạch × hệ số combo. Combo = số gạch phá liên tiếp không chạm thanh chắn (nhân điểm tăng dần, tối đa ×8).
- Sao: 1 sao khi hoàn thành; 2 sao khi đạt ~125% điểm cơ sở; 3 sao khi đạt ~170% điểm cơ sở và không mất mạng (ngưỡng nằm trong `levels.json`).

## 3. Hệ thống gạch

| Ký tự | Gạch | Hit | Điểm | Ghi chú |
|-------|------|-----|------|---------|
| n | Thường | 1 | 10 | |
| h | Cứng | 2 | 25 | Sprite `hard1` rồi `hard2` (nứt) |
| s | Thép | 4 | 60 | Mega/Fire Ball phá nhanh hơn |
| X | Bất tử | ∞ | – | Không tính để thắng |
| M | Gương | ∞ | – | Phản xạ; chỉ tia xuyên phá được |
| g | Ẩn | 1 | 15 | Hiện khi bóng đến gần |
| K | Rương | 1 | 40 | Chắc chắn rơi booster |
| T | Nổ | 1 | 20 | Phá 3×3 xung quanh |
| C | Lõi dây chuyền | 1 | 20 | Kích hoạt cả nhóm nối (xem `chains`) |
| I | Băng | 1 | 15 | Vỡ thì thanh chắn trơn 1 giây |
| F | Lửa | 1 | 20 | Lan cháy sang gạch kề bên |
| E | Điện | 1 | 20 | Cùng nhóm (`electric_groups`) vỡ đồng loạt |
| P | Cổng | 2 | 25 | Dịch chuyển bóng sang cổng cùng cặp (`portals`) |
| V | Di động | 1 | 20 | Trượt ngang theo `moving` |
| R | Hồi sinh | 1 | 15 | Mọc lại sau 6 giây nếu cụm chưa dọn sạch |
| B | Bom hẹn giờ | 1 | 25 | Phá trong 8 giây kẻo mất mạng |
| L / Y | Khoá / Chìa | 3 / 1 | 45 / 20 | Phải phá chìa trước |
| U | Nhịp điệu | 1 | 15 | Thưởng thêm nếu phá đúng phách (`rhythm`) |
| p | Tranh | 1 | 10 | Màu theo `picture.color_rows` |

**Rơi vật phẩm:** tính trên mỗi gạch vỡ: thường ~8%, cứng ~12%, thép ~20%, rương 100%. Bảo hiểm (pity): sau 25 gạch không rơi thì viên kế tiếp chắc chắn rơi. Booster tốt/xấu có trọng số riêng cho từng vùng (`booster_pool` trong màn).

## 4. Booster
**Tốt:** Big Paddle (×1.5, 15s), Multi-Ball (×3), Mega Ball (xuyên, 8s), Fire Ball (8s), Laser (10s), Slow Ball (-30%, 12s), Magnet (bóng dính, 15s), Shield (cứu bóng 1 lần), Extra Life (+1, tối đa 5), Bomb Ball, Chain Lightning (10s), Gold Rush (10s), Score ×2 (15s), Time Freeze (8s).
**Xấu:** Small Paddle (×0.6), Fast Ball (×1.4), Reverse (8s), Heavy Paddle, Blind, Shrink Ball.
**Quy tắc chồng:** cùng loại cộng dồn thời gian; khác loại chạy song song; Big + Small triệt tiêu; Mega + Fire thành Meteor Ball 6s.

## 5. Blocker
Tường thép cố định, Bumper, Hố đen (hút/nuốt bóng), Turret (bắn đạn làm choáng thanh chắn 1s), Thiên thạch/Chim/Sâu (bay ngang đánh lệch bóng), Sương mù/Bão cát, Gió, Trọng lực đổi hướng, Drone paddle của địch. Blocker không bắt buộc phá. Vị trí trong `blockers` của từng màn.

## 6. Kỹ năng chủ động, Perfect Catch, Overdrive
- **Perfect Catch:** đỡ trúng 20% giữa thanh: +50 điểm, +1 năng lượng; chuỗi liên tiếp nhân điểm (tối đa ×3).
- **Thanh năng lượng 5 mức:** đầy thì kích hoạt 1 kỹ năng đã chọn (Làm chậm thời gian 40%/6s – mở sau vùng 1; Tia xuyên – sau vùng 2; Khiên đáy 12s – sau vùng 3). Kỹ năng được tính vào bảng xếp hạng.
- **Overdrive:** thanh nạp theo combo; đầy thì 5 giây: bóng cháy xuyên gạch thường/cứng (không xuyên bất tử), điểm ×2.

## 7. Boss (màn 16 mỗi vùng)
Boss có thanh máu, 3 pha (100–66% / 66–33% / dưới 33%), hàng gạch bảo vệ phía trên, điểm yếu lộ ra sau khi phá lớp bảo vệ; bị đánh nháy trắng 0,1s; chết thì chạy 8 khung vỡ.

| Boss | Máu | Chiêu theo pha |
|------|-----|----------------|
| Treant Cổ Thụ | 60 | Quả rơi (choáng 1s) → Rễ cây làm chậm 40% → Triệu hồi sâu bọ |
| Pharaoh Cơ Khí | 80 | 4 khiên gạch xoay → Đạn cát làm chậm → Tia mắt quét (trúng mất mạng) |
| Nữ Hoàng Băng | 90 | Tạo gạch băng → Đóng băng thanh chắn 1s → Bão tuyết + gương |
| Rồng Magma | 110 | Cột lửa → Gạch dung nham hồi sinh → Nuốt bóng rồi nhả ngẫu nhiên |
| AI Overseer | 130 | Tia quét đảo điều khiển 3s → Cổng dịch chuyển bóng → Sinh drone paddle |
| Lord Fracture | 180 | Xoay vòng chiêu 5 boss → Tách 3 phân thân → Phá sân (đổi trọng lực, rơi bom) |

Chi tiết (cooldown, báo trước, lời thoại, phần thưởng) trong `levels.json` → màn 16 của từng vùng → `boss`.

## 8. Tiến trình & loại màn
- **6 vùng:** Rừng Neon, Sa Mạc, Băng Nguyên, Núi Lửa, Thành Phố Điện Tử, Pháo Đài Hư Không. Mở khoá bằng số sao.
- **16 màn mỗi vùng:** 1–4 giới thiệu cơ chế; 5 tranh pixel; 6–9 kết hợp; 10 một bóng (xu ×2); 11–14 khó; 15 dây chuyền (vùng 1,3,5) hoặc nhịp điệu (vùng 2,4,6); 16 boss.
- **Chế độ khác:** Vô tận, Thử thách hằng ngày, Boss Rush, Level Editor (giai đoạn sau).

## 9. Xu, skin, cá nhân hoá
- **Xu** (tiền tệ duy nhất): thắng màn 20–60 (+10/sao), boss lần đầu 300 / sau 80, nhiệm vụ ngày 50–200, đăng nhập 20–100, thành tựu 100–500, thưởng bảng xếp hạng tuần.
- **Skin chỉ thẩm mỹ:** khung sân (12), thanh chắn (12), bóng (12), bộ gạch (6), hiệu ứng vỡ gạch (6), nền (12), avatar (12), khung avatar (6), huy hiệu (6). Giá: Thường 150–400, Hiếm 600–1.500, Sử thi 2.000–4.000; Huyền thoại chỉ mở bằng thành tựu. Chi tiết `assets/skins_catalog.json`.
- **Bộ theo vùng:** khung + thanh chắn + nền; sưu tập đủ thưởng 500 xu + danh hiệu.
- **Cá nhân hoá:** khảo sát sở thích 3 câu, 3 preset giao diện, chế độ nền (cố định/theo vùng/ngẫu nhiên/theo giờ), chỉnh độ sáng nền, độ nhạy, tương phản cao, mù màu.
- **Orb đồng hành:** 6 cấp theo giờ chơi (1h, 5h, 15h, 40h, 100h), chỉ cosmetic.

## 10. Bảng xếp hạng & chống gian lận
- Bảng: điểm cao theo màn/vùng, toàn cầu theo tuần, Vô tận, Boss Rush, thử thách ngày, bạn bè.
- Chỉ tính điểm khi không dùng booster dự trữ (Loadout) và không chỉnh độ khó dễ hơn mặc định.
- Mỗi lượt chơi gửi seed + nhật ký thao tác để máy chủ chạy lại và kiểm tra.

## 11. UI
- **HUD:** điểm (trái trên), mạng (phải trên), thanh booster, thanh năng lượng, thanh Overdrive, combo giữa màn.
- **Màn hình chính:** bản đồ thế giới, Cửa hàng Skin, Tủ đồ & Cá nhân hoá, Bảng xếp hạng, Nhiệm vụ, Cài đặt.
- **Kết thúc màn:** sao, điểm, xu, gợi ý skin; nút Chơi tiếp/Chơi lại.
- **Tiếp cận:** mù màu, giảm hiệu ứng, cỡ chữ, rung, một tay, tương phản cao.

## 12. Kỹ thuật mục tiêu
- 60 FPS máy tầm trung; ≤ 500 hạt trên mobile; pooling cho hạt/mảnh vỡ/booster; 3 mức chất lượng.
- Va chạm tự viết (hình tròn–AABB), bước thời gian cố định, swept collision chống xuyên gạch.
- Tải lần đầu < 30 MB; skin và vùng đất tải theo yêu cầu.
- Dùng tài khoản, bảng xếp hạng, lưu tiến trình của kho game; analytics (tỷ lệ thắng theo màn, điểm thoát).

## 13. KPI mục tiêu
Retention D1 ≥ 40%, D7 ≥ 15%, D30 ≈ 6%; phiên 8–12 phút; ≥ 3 phiên/ngày; hoàn thành vùng 1 ≥ 60%; tỷ lệ thắng lần đầu 55–85% (giảm dần theo vùng); boss ~50–60%.

## 14. Backlog
Âm thanh/nhạc; vẽ lại nhân vật/boss; cutscene; UI 9-slice và font; nền động; bot mô phỏng cân bằng; level editor; liên thông kho game và nhiệm vụ chéo game.
