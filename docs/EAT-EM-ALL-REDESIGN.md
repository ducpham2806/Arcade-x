# Eat Em All: Trái Tim Hai Nguyên Tố — v2

Quy tắc flow/thưởng hiện hành v4: xem `EAT-ECONOMY-V4.md`. Các thông số v2/v3 bên dưới được giữ làm lịch sử thiết kế.

## Vấn đề và giả thuyết vui

Bản cũ có 12 màn cùng một bộ sinh ngẫu nhiên, tăng tốc và tỷ lệ bom. Điều kiện thắng đếm mọi món thay vì kiểm tra từng quota; người chơi có thể bỏ qua mục tiêu ghi trên màn. Fury tự kích hoạt nên ít quyết định chiến thuật. UI có nhiều thông số và tách người chơi khỏi hành động.

Bản mới giữ động tác kéo ngang và đổi Băng/Lửa, xây lại chiến dịch, tiến trình và giao diện. Giả thuyết: đọc đường rơi, chọn món nên bỏ và giữ Fury cho cửa phản công tạo cảm giác làm chủ. Câu chuyện trả lời vì sao phải ăn đúng, cứu đốm sáng và hồi sinh từng vùng đất.

Các trụ cột: đọc được trước khi phản xạ; lựa chọn có đánh đổi; tiến trình gắn với người bạn và vùng đất; một tay trên điện thoại. Đây là bản cân bằng đầu tiên, chưa có số liệu chơi thử người thật.

## Vòng chơi

- 0–30 giây: đọc nhóm nguyên tố → di chuyển và đổi hệ → ăn đúng để giữ combo, tích Fury → bỏ món khi cần né.
- Một lượt: xem một tình tiết ngắn → hoàn thành quota cụ thể, thêm điều kiện phá giáp nếu là boss → nhận lời kết và sao → chọn màn tiếp. Màn thường hướng đến 45–100 giây [PLACEHOLDER], boss 75–130 giây [PLACEHOLDER].
- Dài hạn: 24 màn, 4 chương, ba bùa khác cách chơi; chơi lại săn ba sao. Không cần mua sức mạnh, không phạt năng lượng khi thua.

## Hợp đồng cơ chế đang triển khai

| Cơ chế | Mục đích, đầu vào | Kết quả và thất bại | Trường hợp biên |
|---|---|---|---|
| Ăn theo hệ | Kéo/chuột hoặc A–D; Space/nút dưới đổi hệ | Đúng Băng/Lửa: điểm, combo, năng lượng. Sai hệ/bom/độc: mất mạng | Sao/ngọc/tim ăn ở cả hai hệ; món đã đủ không thay quota khác; không phạt bỏ món |
| Mục tiêu | Thu đúng từng loại trên HUD | Phải đủ mọi quota; giới hạn thời gian rộng tránh lượt không kết thúc | Loại còn thiếu tiếp tục xuất hiện; boss đủ quota vẫn phải phá giáp |
| Combo | Các lần ăn đúng liên tiếp trong 3,5 giây | Các ngưỡng 5/10/15/20/30 cho hệ số 2/3/4/5/6; trúng đòn hoặc hết cửa sổ làm mất chuỗi | Khiên chặn không làm mất combo; frame nhiều va chạm cập nhật đồng bộ qua runRef |
| Fury chủ động | Ăn đúng nạp 6 điểm, thuốc 25; đầy 100 mới dùng F/nút | Kéo dài 5 giây, x5 điểm, nuốt nguy hiểm | Không tự kích hoạt; không nạp khi Fury đang chạy; vẫn cần đúng nguyên tố để phản công boss |
| Thủ vệ | Chu kỳ 10 giây: báo lõi 3 giây, mở lõi 7 giây; luân phiên Băng/Lửa | Hứng đúng nguyên tố đang mở trừ một lớp giáp | Không thể thắng chỉ bằng ăn đủ; Fury không tự phá giáp sai hệ; 4/5/6/8 lớp theo chương |
| Giải cứu | Thu ngọc là các linh hồn sáng được gọi tên trong truyện/HUD | Cứu đủ linh hồn và nguyên tố để qua màn | Không có nguồn sinh ngẫu nhiên gây thiếu linh hồn cuối màn |
| Bùa | Chọn một trước lượt | Vỏ ấm: khiên đầu màn. Tàn lửa: nạp nhanh 25%. Nhịp rừng: combo 5 giây | Mở ở màn 1/7/13; bùa không tăng sát thương boss; không thay trong lượt |
| Mạng và khiên | Ba mạng, một khiên tùy bùa/nhặt | Va chạm trừ một mạng; hết mạng thua, có thể thử lại | Bất tử 1,25 giây sau trúng đòn chống mất nhiều mạng một khung hình; khiên tiêu thụ một lần |
| Sao và phần thưởng | Hoàn thành lượt | 1 sao thắng; thêm sao khi trúng tối đa một lần; thêm sao khi combo đạt min(12,ceil(quota/2)) | Giữ kết quả cao nhất; chỉ thưởng tiền/XP lần đầu; practice không ghi sao/mở khóa/thưởng |

## Tuning và lý do — toàn bộ là [PLACEHOLDER]

| Biến | Giá trị đầu | Lý do / hướng điều chỉnh |
|---|---|---|
| Mạng | 3 | Cho phép hai lỗi trước thất bại; màn 1–2 không bom/độc |
| Bất tử sau trúng | 1,25 giây | Tránh thiệt hại dây chuyền từ một nhóm vật phẩm |
| Fury | 100 năng lượng; 5 giây | Khoảng 17 món đúng hệ trước một lần dùng; thời gian phủ được phần lớn cửa mở boss |
| Bay tới vùng hứng | Khoảng 3,1/tốc độ màn giây | Có thời gian đọc màu; tính theo chiều cao, không cố định tốc độ pixel giữa điện thoại và desktop |
| Hệ số tốc độ màn | 0,8–1,6 | Độ khó còn đến từ pattern và mật độ, không tăng phản xạ vô hạn |
| Bom/độc | Lấy tổng tỷ lệ từ config, chuyển sang nhịp một nguy hiểm mỗi N món, tối thiểu N=5 | Tránh chồng ngẫu nhiên; màn dạy/nghỉ giãn nhịp thêm |
| Hỗ trợ | Một khiên mỗi round(1/powerUpChance) món, tối thiểu 12 | Giới hạn bảo hộ, hỗ trợ nhịp nghỉ mà không làm Fury dư thừa |
| Điểm | Băng/Lửa 20; Sao 50; Ngọc 100; món khác 20 × hệ số | Ưu tiên cảm giác chuỗi; không ảnh hưởng quota hoặc độ cứng boss |
| Tiền lần đầu | 100 + chương×25 | Nguồn có giới hạn: tổng tối đa 3.900 tiền qua 24 màn, không thưởng lặp |
| XP lần đầu | 50 + chương×15 | Tổng tối đa 2.100 XP qua chiến dịch; dùng bridge hiện có |

## Tiến trình, tương thích và phạm vi

`arcadex_eat_journey_v2` lưu màn mở, sao, bùa trên trình duyệt. Giữ nguyên khóa v1; lấy mốc mở cũ khi chưa có v2, không chuyển sao cũ vì luật qua màn đã thay đổi. Tiến trình v2 chưa đồng bộ tài khoản/cloud. Skin lấy từ bridge hiện tại. Sinh tồn và 60 giây vẫn có thể chơi từ tab riêng. Bản review dùng bridge giả nên không trao tiền/XP vào tài khoản.

Art v3 thay toàn bộ phần vẽ bằng asset SVG gốc: Nốm 18 biến thể, bốn thủ vệ × ba trạng thái, 29 biểu tượng. Nền minh họa bốn vùng được tạo riêng, chuyển WebP 169 KiB. UI và Canvas dùng chung nguồn asset. Vẫn dùng âm thanh tổng hợp; chưa có cutscene hoặc âm thanh mới. Sáu pattern là ngữ pháp đường rơi trong game hứng ngang, không phải địa hình di chuyển tự do.

## Xác minh đã chạy

- TypeScript cho toàn bộ module Eat Em All và entry chơi thử: đạt.
- `npm run test:eat`: kiểm tra dữ liệu và mô phỏng 24 màn × 30/60/120 bước/giây. Có đủ tài nguyên trước deadline; quota không thể thay bằng một loại món; hai màn đầu an toàn; boss có điều kiện riêng.
- React DOM harness: bản đồ → truyện → chơi → Fury thủ công → pause/resume → quota → thưởng một lần → giáp boss → lời kết. Đây là kiểm thử logic có Canvas giả, không phải xác nhận hình ảnh/hitbox trên thiết bị thật.
- Đóng gói bundle trình duyệt tự chứa: đạt. Chưa chạy QA bằng trình duyệt hoặc build toàn bộ launcher trong môi trường này; chưa đo độ khó và mức hấp dẫn với người chơi thật.

## Changelog

2026-10-17: thay chiến dịch 12 màn bằng 24 màn có truyện, deficit-driven spawns, mục tiêu chính xác, boss theo pha, cứu linh hồn, Fury thủ công, bùa, ba sao, thưởng lần đầu, UI điện thoại và desktop; giữ bản live nguyên trạng chờ duyệt.

2026-10-17, Art v3: hình ảnh fantasy thống nhất, các trạng thái nhân vật/boss, vật phẩm và booster riêng, bản đồ có đường hành trình, Sổ linh thú, giao diện viền đồng/giấy cổ, xuất 59 SVG và manifest. Kiểm tra thêm native Canvas2D trong ba chương, có thực thi hứng vật phẩm. Chưa kiểm tra bố cục CSS trong trình duyệt thật hay đo GPU trên điện thoại.

2026-10-17, Flow/Economy v4: vật phẩm vẽ trước Nốm; lobby dùng icon và một CTA; Chơi/Tiếp/Chơi lại vào màn trực tiếp, truyện tùy chọn. Phân bổ lại cùng ngân sách 3.900 xu/2.100 XP cho lần thắng đầu, sao mới và boss; 72 sao mở năm hào quang trang trí; mô phỏng 90 ngày/4.000 hồ sơ.
