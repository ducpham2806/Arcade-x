# Eat Em All — chiến dịch Nhịp Tim Thế Giới

## Ý đồ thiết kế

Nốm là linh hồn Băng/Lửa đi tìm Trái Tim Thế Giới bị Vực Đói nuốt mất. Hành trình chuyển từ học cách ăn đúng, cứu những người bạn, đến hiểu rằng Vực Đói cần được kết nối. Cốt truyện tiến sau từng màn; lời kết là phần thưởng cụ thể, không chỉ một con số tăng lên.

Chiến dịch gồm 4 chương × 6 màn. Mỗi chương có giới thiệu một cách đọc đường rơi, bài kiểm tra, một màn giải cứu nhẹ hơn, hai màn kết hợp và một thủ vệ. Độ khó tăng nhờ hình dòng rơi, điểm chuyển làn và chuyển nguyên tố; tốc độ chỉ từ 0.80 đến 1.60, thay vì tăng đến 2.40 như cũ. Các mốc 7, 13, 19 giảm áp lực sau boss để người chơi khám phá chương mới.

Nguồn dữ liệu: `src/games/eat-em-all/campaign.ts`. `targetCount` luôn bằng tổng `targetItems`. `timeLimit` tính bằng giây; đây là hạn chót rộng, không phải thời gian bắt buộc phải chơi đủ. Thời lượng hoàn thành dự kiến là 45–100 giây cho màn thường, 75–130 giây cho thủ vệ; cần hiệu chỉnh bằng chơi thực tế.

## Ngữ pháp không gian

| Pattern | Cách đọc | Quyết định của người chơi | Quy tắc an toàn khi triển khai |
|---|---|---|---|
| cascade | Chuỗi vật phẩm cùng hướng từ mép trái sang phải rồi quay lại | Đón chuỗi hay bỏ món để giữ vị trí | Không nhảy làn ngẫu nhiên ở giữa một chuỗi |
| alternating | Nhóm Băng và Lửa đổi theo nhịp | Giữ hệ đến cuối nhóm, chuẩn bị hệ tiếp theo | Không có hai hệ buộc phải hứng cùng lúc cùng vị trí |
| crosswind | Vật phẩm trôi ngang có hướng rõ | Đón điểm đến thay vì đuổi vị trí hiện tại | Giới hạn vận tốc ngang; giữ vật phẩm trong sân |
| corridor | Khe thức ăn đi giữa các vùng nguy hiểm | Đổi làn theo khe, giữ lối lùi | Khe rộng hơn nhân vật + hai bán kính vật phẩm |
| spiral | Dòng cong tuần hoàn, không phải rơi ngẫu nhiên | Theo một nhánh, bỏ nhánh khó, chuyển ở khoảng trống | Tránh đổi hướng gấp sát vùng va chạm |
| boss | Chu kỳ nguy hiểm → mở giáp → hồi nhịp | Né để sống, tích nguyên tố để phá giáp | Báo trước đòn; mỗi chu kỳ phải có cửa đánh và lối né |

Màu chương chỉ là trang trí; biểu tượng nguyên tố và đường viền vật phẩm vẫn phải phân biệt được. Đốm sáng giải cứu dùng vật phẩm `gem`, nhưng phải có tên và đếm tiến độ giải cứu trong giao diện. Không đặt chúng như vật phẩm ngẫu nhiên không liên quan.

## 24 màn được thiết kế

Ký hiệu: B = Băng, L = Lửa, S = Sao, G = linh hồn sáng. “Nghỉ” vẫn có tương tác nhưng giảm nguy hiểm và nhịp rơi. Số lần đánh boss là mục tiêu thêm ngoài nguyên tố, tùy hệ chiến đấu đã tích hợp.

| # | Màn | Nhịp | Pattern | Mục tiêu | Tốc độ | Hạn giây | Điểm nhớ |
|---|---|---|---|---|---|---|---|
| 1 | Mầm Xanh Đầu Tiên | Dạy | cascade | 14B + 6S | .80 | 80 | Hạt mầm mọc chiếc lá đầu tiên; không nguy hiểm |
| 2 | Sưởi Ấm Chồi Non | Dạy | alternating | 12L + 6B + 4S | .86 | 85 | Hai nguyên tố cùng nuôi chồi non; không nguy hiểm |
| 3 | Gai Trong Lá | Kiểm tra | corridor | 10B + 10L + 4S | .92 | 90 | Lần đầu chọn bỏ qua gai đen |
| 4 | Đom Đóm Về Nhà | Nghỉ/cứu | cascade | 8B + 8S + 4G | .86 | 90 | Bốn đom đóm soi đường cổ thụ |
| 5 | Điệu Nhảy Hai Mùa | Kiểm tra | alternating | 13B + 13L | 1.00 | 95 | Chuyển hệ giữa các nhóm, không phải từng vật phẩm |
| 6 | Kẻ Gặm Rễ | Boss | boss | 12B + 12L; 4 đòn | 1.04 | 110 | Giải phóng Hạt Mầm, hồi sinh khu vườn |
| 7 | Tro Tàn Có Lối | Dạy | crosswind | 14L + 10S | 1.00 | 95 | Theo tàn lửa và đón điểm đến |
| 8 | Cầu Than Hồng | Kiểm tra | corridor | 12B + 12L + 4S | 1.08 | 100 | Đường an toàn dịch làn trên cầu |
| 9 | Bếp Của Những Người Bạn | Nghỉ/cứu | alternating | 8L + 8B + 6G | 1.02 | 100 | Gom sáu linh hồn quanh bếp |
| 10 | Ống Khói Độc | Dạy | crosswind | 14B + 10L + 4S | 1.12 | 105 | Thấy độc trong gió; không tham món khó |
| 11 | Chuông Lò Rèn | Kiểm tra | spiral | 14B + 14L + 4S | 1.18 | 110 | Nhịp nguyên tố làm chuông vang lại |
| 12 | Người Giữ Lò | Boss | boss | 14B + 14L; 5 đòn | 1.20 | 120 | Cứu người giữ lò, nhận Tàn Lửa |
| 13 | Bờ Biển Không Gương | Dạy | spiral | 16B + 10S | 1.14 | 100 | Một ngôi sao phản chiếu trở lại |
| 14 | Thủy Triều Ngược | Kiểm tra | crosswind | 15B + 15L | 1.23 | 110 | Hai dòng đối hướng đòi hỏi phán đoán |
| 15 | Thuyền Đom Đóm | Nghỉ/cứu | cascade | 10B + 8S + 6G | 1.12 | 105 | Sáu ngọn đèn dẫn đến hải đăng |
| 16 | Hải Đăng Chìm | Kiểm tra | corridor | 14B + 14L + 4G | 1.28 | 115 | Cửa sáng nối tiếp trong bóng tối |
| 17 | Tiếng Gọi Hai Bờ | Kiểm tra | alternating | 17B + 17L | 1.34 | 120 | Giữ ký ức nhưng vẫn tiến bước |
| 18 | Kẻ Giữ Ký Ức | Boss | boss | 16B + 16L; 6 đòn | 1.35 | 130 | Nhận Giọt Nhớ, hiểu nguồn gốc Vực Đói |
| 19 | Cánh Cửa Không Đáy | Tổng hợp | corridor | 16B + 12L + 4S | 1.30 | 115 | Ba mảnh mở cửa vực; có bạn bè theo cùng |
| 20 | Cơn Đói Dậy Sóng | Kiểm tra | spiral | 18B + 18L | 1.42 | 125 | Chọn một nhánh xoáy, chừa lối thoát |
| 21 | Những Ánh Sáng Cuối | Nghỉ/cứu | cascade | 10B + 10L + 8G | 1.25 | 120 | Tám người bạn chọn ở lại giúp Nốm |
| 22 | Nhịp Tim Thất Lạc | Kiểm tra | alternating | 20B + 20L | 1.48 | 130 | Hai nguyên tố nối lại nhịp tim |
| 23 | Bữa Tiệc Của Hy Vọng | Cao trào | crosswind | 18B + 18L + 6S | 1.55 | 140 | Những vùng đất đã cứu gửi sức sống về |
| 24 | Một Trái Tim Được Sẻ Chia | Boss/kết | boss | 20B + 20L; 8 đòn | 1.60 | 155 | Giải phóng trái tim, kết bằng bữa ăn chung |

## Giả thuyết cân bằng và kiểm thử

Đây là giả thuyết thiết kế để kiểm chứng, không phải số liệu người chơi đã đo.

- 80% người chơi mới qua màn 1–2 trong lần đầu; họ phải nhận biết chuyển hệ qua nhóm màu trước khi đọc hướng dẫn. Nếu không, kéo dài nhóm hoặc giảm tốc; không thêm đoạn văn dài.
- Màn nghỉ có tỷ lệ mất mạng dưới một nửa hai màn kiểm tra liền kề. Nếu các màn cứu quá khó vì đốm sáng hiếm, tăng nguồn sinh theo mục tiêu còn thiếu; không tăng rơi hỗ trợ toàn cục.
- Mỗi vật phẩm mục tiêu phải tiếp tục xuất hiện đến khi quota hoàn tất. Xác suất có trọng số theo phần còn thiếu để tránh chờ món cuối; món đã đủ không chặn tiến độ.
- Nguy hiểm đầu tiên phải đọc được trước khi tới vùng hứng; không tạo tình huống một vật phẩm đúng hệ và một nguy hiểm che nhau. Thử ở chiều rộng 360 px và desktop.
- Boss phải có ít nhất hai cách qua: kiên nhẫn né và chớp cơ hội, hoặc giữ combo để nạp sức mạnh nhanh. Không bắt buộc mua/nâng cấp để thắng.
- Đo lần đầu hoàn thành, thời gian qua màn, số lần đổi hệ, lý do mất mạng và tỷ lệ bỏ ở từng màn. Chênh lệch màn nghỉ so với màn kiểm tra xác nhận nhịp căng–giãn có hiệu lực.
- Kiểm tra từng pattern bằng vật phẩm đơn sắc trước khi thêm VFX. Ưu tiên sửa đường rơi không đọc được, rồi mới trang trí.

Các trường `pattern`, `objective`, `bossHits`, `timeLimit` là hợp đồng dữ liệu cho engine và UI. Chỉ gắn nhãn trên màn chọn level chưa đủ để coi cơ chế đã hoàn thành; cần xác nhận engine sử dụng chúng trước khi phát hành.
