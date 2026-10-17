# Eat Em All — core flow và kinh tế v4

Ngày thiết kế: 17/10/2026. Các mức thưởng và xác suất mô phỏng là giả thuyết ban đầu. Đã triển khai trong bản nháp, chưa phải kết quả đo người chơi.

## Chơi nhanh, đọc khi muốn

| Tình huống | Flow cũ | Flow v4 |
|---|---|---|
| Bắt đầu màn đang mở | Chọn màn → lên đường → xác nhận sẵn sàng | Chạm Chơi → chơi ngay |
| Chơi một màn cụ thể | Chọn mốc → lên đường → sẵn sàng | Chạm mốc → chơi ngay |
| Sang màn tiếp | Tổng kết → màn tiếp → xác nhận truyện | Tổng kết → Tiếp → chơi ngay |
| Thử lại | Tổng kết → bắt đầu → xác nhận | Chạm Chơi lại |
| Truyện và hướng dẫn | Bắt buộc đọc/đóng trước màn | Nút sách tùy chọn; nhắc ngắn không chặn trong lượt |

Menu dùng biểu tượng cho chế độ, chương, bùa, ví sao và sổ linh thú. Màn tổng kết chỉ giữ sao, điểm, thưởng và nút Tiếp. Mốc màn có `aria-label` và tooltip đầy đủ; bấm mốc là lệnh chơi, không còn thẻ chuẩn bị. Vùng bắt đầu chính và lựa chọn bùa thu gọn để nằm trong khung game, có chế độ gọn theo chiều cao vùng chứa.

## Sửa lớp hiển thị

Thứ tự: nền → boss → hào quang/Nốm → vật phẩm → hạt/nhãn/HUD. Vật phẩm sắp tới vùng hứng hoặc rơi trượt đều nằm trước Nốm. Hào quang là trang trí ở sau nhân vật, không che vật phẩm. Kiểm tra bằng chính bộ vẽ Canvas native: tại khung có vật phẩm giao với đầu Nốm, lệnh vẽ nhân vật xảy ra trước lệnh vẽ vật phẩm; đã xem ảnh render nội bộ.

## Ý đồ kinh tế

Một quyết định chính: chơi để mở vùng mới, sau đó cải thiện số sao để chọn hào quang yêu thích. Không dùng xu để mua sức mạnh, không mất tiền khi thua, không mua vé chơi, không thu phí sang màn. Giữ ba bùa miễn phí mở theo tiến trình.

Không thêm loại tiền mới. Sao xếp hạng từng màn là thành tích vĩnh viễn; quyền chi sao được tính bằng tổng sao đã đạt trừ giá các hào quang đã sở hữu. Mua đồ không làm giảm xếp hạng màn hoặc khóa lại chương. Góc menu hiện sao còn có thể dùng; chân menu hiện tổng thành tích trên 72 sao.

## Nguồn và nơi dùng

| Tài nguyên | Nguồn | Mục đích / nơi dùng | Giới hạn |
|---|---|---|---|
| Xu Arcade-x | Thắng lần đầu, sao mới, boss lần đầu | Chuyển qua bridge để dùng tại hệ thống chung; không mở shop xu thứ hai trong Eat Em All | Tối đa 3.900 xu thưởng trực tiếp của chiến dịch |
| XP Arcade-x | Cùng nguồn xu | Tiến trình cấp người chơi chung, không phải ví chi tiêu | Tối đa 2.100 XP thưởng trực tiếp của chiến dịch |
| Sao có thể dùng | Chỉ phần tăng kỷ lục sao từng màn | Năm hào quang trang trí: 6/9/12/18/27 sao | Nguồn 72, tổng giá 72; số dư không âm |
| Điểm, combo, Fury | Kỹ năng trong lượt | Xếp hạng điểm, lựa chọn thời điểm dùng Fury | Đặt lại mỗi lượt, không đổi trực tiếp thành sao |

Ngân sách này chỉ kiểm soát lệnh `grantCoins/grantExp` của chiến dịch Eat Em All. Không bao gồm thưởng điểm/kết thúc lượt do launcher cấp, quest toàn launcher hoặc game khác. Chưa kiểm toán toàn bộ nguồn/nơi tiêu xu của Arcade-x trong thay đổi này.

## Công thức thưởng

Gọi d là `max(0, sao mới − kỷ lục sao cũ)`; f = 1 nếu thắng màn lần đầu, b = 1 nếu đó là boss lần đầu.

- Xu = 100 × f + 10 × d + 195 × b.
- XP = 40 × f + 10 × d + 105 × b.
- Sao nhận thêm = d, không phụ thuộc số lần chơi lại.
- Thắng lại không tăng sao: 0 xu, 0 XP chiến dịch; vẫn được điểm/kỷ lục lượt.
- Mỗi khoản cấp bị chặn ở phần ngân sách còn lại trong sổ thưởng.

| Kết quả | Xu | XP | Sao chi thêm |
|---|---:|---:|---:|
| Màn thường, lần đầu 1 sao | 110 | 50 | 1 |
| Màn thường, lần đầu 3 sao | 130 | 70 | 3 |
| Boss, lần đầu 1 sao | 305 | 155 | 1 |
| Boss, lần đầu 3 sao | 325 | 175 | 3 |
| Cải thiện 1 → 3 sao | 20 | 20 | 2 |
| Thắng lại cùng số sao | 0 | 0 | 0 |

Suy ngược từ ngân sách v3: 24 × 100 + 72 × 10 + 4 × 195 = **3.900 xu**. Tương tự, 24 × 40 + 72 × 10 + 4 × 105 = **2.100 XP**. V4 đưa một phần thưởng vào kỹ năng và boss thay vì tăng tổng tiền. Không thưởng theo thời gian chờ hoặc số lần lặp để tránh chiến thuật cày màn dễ.

## Giá hào quang và lý do

| Hào quang | Sao | Lý do |
|---|---:|---|
| Mầm xanh | 6 | Khoảng ba màn với trung bình hai sao/màn; phản hồi sớm cho người mới |
| Tàn lửa | 9 | Mục tiêu ngắn tiếp theo, có thể để dành chọn trước thay vì mua Mầm xanh |
| Giọt nhớ | 12 | Phần thưởng vừa, tương đương 1/6 tổng sao |
| Tinh vân | 18 | Mục tiêu trung hạn; lựa chọn tiết kiệm có ý nghĩa |
| Song tâm | 27 | Mục tiêu sưu tập cuối; vẫn có thể mua trước khi mua các món rẻ |
| Tổng | 72 | Nguồn hữu hạn khép kín với toàn bộ nội dung hiện có |

Các hào quang chỉ thay vòng/hình trang trí quanh Nốm, không đổi hitbox, tốc độ, mạng, Fury hay độ khó. Sở hữu một lần, trang bị lại miễn phí. Không có IAP, hộp ngẫu nhiên, chuyển đổi tiền hoặc ưu thế trả phí trong loop này.

## Mô phỏng 90 ngày

4.000 hồ sơ, 1.000 cho mỗi nhóm, hạt giống giả ngẫu nhiên cố định 777. Mô hình ưu tiên mở màn mới, rồi chơi lại màn dưới ba sao; tự mua hào quang theo giá tăng dần khi đủ sao. Đây là chính sách mua cho mô phỏng, UI thực tế cho chọn bất kỳ món đủ tiền. Thắng và số sao được lấy mẫu theo các xác suất sau:

| Nhóm | Phiên/ngày | Lượt/phiên | Tỷ lệ thắng | P(1/2/3 sao khi thắng) |
|---|---:|---:|---:|---|
| Nhẹ | 1 | 3 | 65% | 22% / 58% / 20% |
| Thường xuyên | 3 | 4 | 80% | 10% / 45% / 45% |
| Cày nhiều | 6 | 5 | 90% | 3% / 27% / 70% |
| Có ý định chi tiền | 3 | 4 | 80% | Bằng nhóm thường xuyên vì không bán sức mạnh |

| Nhóm | Ngày mở hào quang đầu (trung vị) | Ngày xong cốt truyện (trung vị) | Sao kiếm ngày 90 (TB) | Sao đã dùng ngày 90 (TB) | Số dư P90 ngày 90 |
|---|---:|---:|---:|---:|---:|
| Nhẹ | 2 | 13 | 71,97 | 71,73 | 0 |
| Thường xuyên | 1 | 3 | 72 | 72 | 0 |
| Cày nhiều | 1 | 1 | 72 | 72 | 0 |
| Có ý định chi tiền | 1 | 3 | 72 | 72 | 0 |

Nhóm nhẹ ngày 7 có trung bình 26,40 sao kiếm và 20,89 sao dùng; ngày 30 là 58,61 và 45. Số dư trung vị ngày 30 là 14, phản ánh giai đoạn để dành món giá 27. Ngày 90 tỷ lệ sao kiếm/dùng khoảng 1,003, các nhóm khác bằng 1. Cả bốn nhóm không vượt trần thưởng xu/XP.

Diễn giải: nguồn tiền hữu hạn, không tăng vô hạn theo thời gian. Người chơi nhiều hoàn thành kinh tế nhanh, nên sau khi sưu tập đủ họ chơi để săn điểm; đây không phải mô hình giữ chân 90 ngày đã được chứng minh. Nếu cần thêm nội dung dài hạn, phải mở thêm màn/cosmetic và mô phỏng lại cả nguồn và chi, không tự tăng thưởng lặp.

## Ngưỡng theo dõi và kiểm soát

- Sau khi có đủ dữ liệu chơi thật, xem lại nếu trung vị mở hào quang đầu vượt ngày 3 ở nhóm nhẹ hoặc trên 20% người qua chương 1 chưa đủ 6 sao.
- Cờ lỗi tức thời: ví âm, sở hữu trùng, sao thành tích giảm sau mua, thắng lại không tăng sao vẫn nhận thưởng, xu/XP trực tiếp chiến dịch vượt trần.
- Khi nội dung còn để mua, xem lại nếu P90 ví trên 27 sao trong 7 ngày hoặc tỷ lệ nguồn/chi cuối tiến trình trên 1,15. Không dùng ngưỡng đầu game để phạt hành vi để dành.
- Ghi tối đa 50 sự kiện gần nhất tại máy: first_clear, mastery, purchase, equip; kèm delta xu/XP/sao và số dư. Có sự kiện DOM `arcadex:eat-economy` để bộ thu telemetry tích hợp sau. Chưa có backend analytics hoặc wallet server-authoritative.
- Thực hành không cấp xu/XP/sao, không mở màn; không thể mua đồ bằng ví thực hành. Các nguồn/kỷ lục v3 đã nhận được tính vào sổ thưởng để chuyển phiên bản không cấp lại toàn bộ.

Lưu ý phạm vi kỹ thuật: sổ thưởng và sao vẫn nằm trong trình duyệt. Bảo vệ ở đây chống cấp trùng, chi âm và vượt trần trong dữ liệu lưu hợp lệ. Chưa giải quyết sửa/xóa localStorage hoặc giao dịch nhiều thiết bị; muốn đưa kinh tế có giá trị giao dịch lên live cần sổ giao dịch server và idempotency của bridge.

## Tái hiện và kiểm thử

`npm run test:eat` kiểm tra quota, boss, asset, một chạm Chơi/Tiếp/Chơi lại, optional story, mua/trang bị, thưởng hữu hạn, chuyển dữ liệu cũ và practice. `node scripts/simulate-eat-economy.mjs` chạy lại mô hình và xuất JSON. Chạy bộ vẽ thực tế bằng native Canvas nội bộ kiểm tra lớp vật phẩm và hứng ở 30/60/120 Hz. TypeScript/bundle tự chứa đạt; bố cục CSS và cảm giác chạm trên điện thoại thật chưa được kiểm thử trong môi trường này.
