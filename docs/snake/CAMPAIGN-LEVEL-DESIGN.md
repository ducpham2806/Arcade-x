# Rắn Săn Mồi · Thiết kế toàn bộ hành trình

26/11/2026 · Nhánh `codex/snake-full-campaign`. Hành trình của Tiểu Xà có 20 màn chính ở ba vùng và sáu Đường thử tùy chọn. Tiểu Xà mang ngọc xanh khỏi Tổ Nhện, khơi lại dòng suối rồi đặt ngọc về điện thờ để đưa ánh sáng về cả ba vùng.

## Luật nhịp độ và đường đi

- Người chơi đọc điểm mốc trước khi hành động, thử ở bãi rộng rồi dùng lại kỹ năng khi gặp cầu lệch, cổng hoặc nhện. Sau một đoạn căng có đảo, bờ rộng hoặc màn mưa vàng để đổi nhịp.
- Tốc độ thường 3,5 đơn vị/giây, Dash 6, bán kính đầu 0,42, mô phỏng 60 Hz. Khi tăng chiều dài, tốc độ quay giảm từ 360°/giây xuống 270° và 200°. Mặt cầu mới rộng 2,4–3,8 đơn vị. Căn hướng ở bờ, qua trọn cầu rồi mới rẽ. Vách nước và mặt cầu dùng một dữ liệu để khớp lối đi với va chạm.
- Xong một màn mở màn kế tiếp. Xong toàn bộ một chương mở chương sau. Mỗi màn thưởng sao hoàn thành, sao còn ít nhất 2 tim và một sao thử thách riêng. Đường vàng, tránh độc, ngọc ẩn và bẫy nhện tạo mục tiêu chơi lại. Quay lại màn cũ giữ sao và thành tích tốt nhất.

## Chương 01 · Thảo Nguyên Xanh

Mười màn R01 dạy riêng từng kỹ năng trước trận Nhện Mẹ. [Sổ tay, lời kết và dấu hiệu boss](R01-CONTENT.md).

| Màn | Đường bắt buộc và nhịp chơi |
|---|---|
| 1-1 Bước đầu tiên | Gom 5 táo trên đường lượn rộng rồi về vòng sáng |
| 1-2 Đồng cỏ rộng | Tăng độ dài qua bãi thoáng, thử Dash trên đoạn thẳng, nhả trước cua |
| 1-3 Hàng rào gỗ | Đọc khoảng hở ở đầu hàng rào và quay đủ rộng để đuôi đi qua |
| 1-4 Quả tím lạ | Đạt đủ đốt bằng lối vòng ngoài hoặc đi sát cụm quả để đổi rủi ro lấy quả vàng |
| 1-5 Cánh đồng hoa | Thu 8 hoa, nối ba vòng rồi về cổng gần giữa đồng |
| 1-6 Công tắc đầu tiên | Đi vòng tới công tắc, chốt cửa và quay lại cổng |
| 1-7 Cầu qua suối | Căn thẳng qua 3 cầu, chuyển hướng trên đảo giữa |
| 1-8 Mưa quả vàng | Nghỉ nhịp 45 giây, đọc bóng rơi, tìm ngọc ẩn để lấy sao |
| 1-9 Tổ nhện con | Đạt 20 đốt, dùng bãi thoáng và tơ để thoát truy đuổi |
| 1-10 Nhện Mẹ Khổng Lồ | Đọc báo đòn, dụ nhện, nối cột bằng thân rồi Dash 6 lần qua 3 pha |

## Chương 02 · Suối Hổ Phách

Bến mở cho người chơi lấy lại nhịp sau boss R01. Cầu, đầm và cửa xả buộc quan sát cả đường đi lẫn đường về. Bãi Tơ kiểm khả năng chuyển hướng khi bị đuổi. Đất bờ màu hổ phách làm đường nước và đầu cầu nổi rõ.

| Màn · kích thước | Đường bắt buộc, vùng đổi hướng và mốc nhận biết | Sao thứ ba | Lượt engine |
|---|---|---|---:|
| 2-1 Bến Quả Hổ Phách · 54×38 | Thu 6 quả. Vòng nam rồi lên bến bắc. Quả vàng là nhánh rẽ vào bãi giữa, có đường nhập lại | ≤45 giây | 23,45 s |
| 2-2 Lối Đầm Hai Nhịp · 64×46 | Qua cầu rộng 3,8 theo táo dẫn, rẽ lên bắc trên cồn rồi qua cầu rộng 3,2 | Không chạm thân | 24,88 s |
| 2-3 Vườn Sậy Ven Nước · 62×50 | Thu 7 hoa quanh hai đầm. Bờ ngoài và khe giữa giúp nhìn trước cụm hoa kế tiếp | ≤65 giây | 35,97 s |
| 2-4 Cửa Xả Cũ · 70×50 | Vòng khối đá tới chốt phía đông, men phía bắc rồi căn vào buồng cửa rộng 3 | Không chạm thân | 44,58 s |
| 2-5 Bãi Tơ Hổ Phách · 72×50 | Đạt 18 đốt. Dùng bờ nam để kéo nhện qua tơ, bãi đông để đổi hướng, bờ bắc để về cổng | Dụ ít nhất 1 nhện vào tơ | 38,73 s |

## Chương 03 · Đền Bình Minh

Sân trụ yêu cầu dành chỗ cho thân dài. Ba cầu buộc căn lại hướng, vườn vàng hạ nhịp rồi cửa đá ghép bài chốt cửa với nhện. Vòng sân quanh bốn trụ cho người chơi lùi khỏi tầm bắn và lấy táo bù chiều dài trước vòng ngọc. Nền lát đá, tường tím và các vòng ngọc giúp phân biệt sân đền với hai vùng cỏ.

| Màn · kích thước | Đường bắt buộc, vùng đổi hướng và mốc nhận biết | Sao thứ ba | Lượt engine |
|---|---|---|---:|
| 3-1 Sân Trụ Nắng · 60×44 | Đạt 17 đốt bằng vòng ngoài rộng. Nhánh giữa các trụ có cả quả vàng lẫn độc | Không ăn quả độc | 31,25 s |
| 3-2 Cầu Ba Vệt Sáng · 88×62 | Qua 3 cầu rộng 3,0, 2,8 và 2,4 trên ba cao độ. Hai cồn là nơi đổi hướng | Không chạm thân | 41,35 s |
| 3-3 Vườn Hoa Bình Minh · 51×39 | Sống đủ 45 giây. Bóng báo quả vàng dọc vòng ngoài, ngọc ở bờ bắc | Tìm mảnh ngọc Bình Minh | 45,00 s |
| 3-4 Cổng Ba Phiến Đá · 78×56 | Men bờ dưới để kéo nhện, chốt phía đông bắc rồi qua lối rộng 4 từ phía đông buồng đá | Dụ ít nhất 1 nhện vào tơ | 41,03 s |
| 3-5 Nhện Mẹ Canh Đền · 66×56 | Vòng táo nam để né tơ. Hai vùng tơ và hai trụ ở gần tâm cho pha 2 và 3. Đủ 6 đòn mới theo vòng đông lên cổng bắc | ≤145 giây | 78,50 s |

## Sáu Đường thử

Mở từ Hành trình. Mỗi đường yêu cầu đi qua quả theo thứ tự, có bản đồ xem trước và kỷ lục riêng. Mốc Dash là đích luyện tốc độ.

| Chặng | Đường | Bài luyện |
|---|---|---|
| 1 | Vườn Quanh Co | 10 quả, cua giữa hai bờ rào |
| 1 | Suối Hai Nhịp | 12 quả, căn hai cầu và vòng qua bờ đông |
| 1 | Vòng Gai Cổ Thụ | 15 quả, phối hợp đổi hướng, cầu và gai |
| 2 | Bờ Hồ Cong | 12 quả, ôm bờ và nhả Dash trước cua |
| 2 | Vườn Tuần Tra | 15 quả, đọc nhịp hai hàng vật cản di động |
| 2 | Hẻm Đá Ba Cầu | 18 quả, đổi hướng trên hai cồn giữa ba cầu |

## Lưu trữ và kiểm chứng

Chương Hổ Phách và Bình Minh có tiến trình, kỷ lục và mốc giữa màn lưu cục bộ theo hồ sơ. R01 tiếp tục dùng định dạng và quy trình xác minh hiện tại. Dữ liệu vật cản, thức ăn, mục tiêu và đường dẫn của hai vùng mới nằm ở [campaign-levels.ts](../../src/games/snake-legend/src/campaign-levels.ts). Bảng thời gian lấy từ [chạy Engine](../../tests/snake/campaign-level-routes.test.ts), với 3 tim và 3 sao ở cả 10 lượt mới.

Studio Level Design dẫn đường chính, điểm hồi nhịp và kiểm cổng. GDD Architect nối mục tiêu, sao và hệ lưu. QA & Playtest dùng ca đi được, ca lệch cầu, cổng khóa, ngọc và đủ đòn boss. Vai trò Team Level, Level Designer và QA Lead. [Bằng chứng triển khai](../qa/SNAKE-FULL-CAMPAIGN-2026-11-26.md).
