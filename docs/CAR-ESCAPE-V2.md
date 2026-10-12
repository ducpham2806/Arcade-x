# Car Escape v2 — 11/10/2026

## Luật và đồ họa

Viết lại engine, bộ giải, hệ thống màn, renderer và giao diện game. Góc nhìn 2D từ trên xuống, ô lưới vuông thẳng hàng. Asset SVG xe đồ chơi tự thiết kế có bánh, kính phản chiếu, gương, đèn, cản và bóng đổ; xe dài có thùng chở hàng. Xe cứu hộ vàng có biểu tượng, đèn và mũi tên hướng thoát. Mặt đường có texture, vạch ô, lề đường, cây, ghế và cọc giao thông ở ngoài ô chơi. Không cần tải ảnh từ dịch vụ bên ngoài. Hỗ trợ kéo theo hàng/cột, chọn xe/điểm đến qua các ô điều khiển lớn, phím mũi tên và Shift để trượt hết đường. Tôn trọng reduced motion. Kéo chỉ là preview; thả mới commit, hủy kéo/pause không tạo nước đi.

Một lần trượt một xe, dù bao nhiêu ô, là **một lượt**. Hoàn tác là một thao tác di chuyển ngược và tính thêm một lượt. Không đi xuyên xe, đổi trục hay ra ngoài bàn. Xe cứu hộ chạm mép phải thì thắng; nước thắng cuối cùng được chấp nhận khi vừa đủ turn limit.

## 100 màn và learning curve

100 layout khác nhau đã kiểm chứng bằng A* với heuristic admissible; kết quả của các màn đầu còn được đối chiếu BFS độc lập. Mọi màn mới cần ít nhất 5 lượt; khó nhất 26 lượt. Bộ sinh không chạy trên điện thoại: dữ liệu cố định, không có fallback dễ hoặc reroll để lách độ khó.

- Màn 1–30: 6×6, 5–12 lượt; ba màn đầu tự do, sau đó giới thiệu chế độ khác.
- Màn 31–60: 7×7, 9–26 lượt; tăng chuỗi phụ thuộc và độ đông xe.
- Màn 61–100: 8×8, 12–26 lượt; phát triển các cấu trúc khó đã kiểm chứng với bố cục đỗ xe và biến thể đối xứng.
- Mỗi chặng 10 màn có màn thử thách và lời nhắc chiến thuật. Khi đổi cỡ bàn có đoạn làm quen dễ hơn màn cuối chặng trước; độ khó không tăng tuyến tính ở mọi cặp màn liên tiếp.

100 layout không có nghĩa là 100 cơ chế riêng biệt: có cấu trúc và biến thể dùng lại để củng cố kỹ năng. Dữ liệu CSV kèm theo ghi số lượt tối ưu, cỡ bàn, chế độ và giới hạn cho từng màn. Solver proof đo độ khó logic, chưa thay thế playtest với người thật để cân chỉnh cảm giác chơi.

## Các chế độ và sao

Phân phối chế độ dùng seed cố định, có trộn trong chiến dịch: tự do, giới hạn lượt, đếm ngược và không giới hạn thời gian. Bản đồ hiển thị chế độ trước khi vào. Tự do và chế độ không giới hạn giờ đều không có điều kiện thua theo đồng hồ; điểm khác biệt gameplay rõ nhất nằm ở giới hạn lượt, đếm ngược và Đường dài.

Đường dài là một run riêng: bắt đầu 120 giây, giải mỗi bãi cộng 30 giây (tối đa 180 giây còn lại), tích điểm và nâng độ khó của pool chọn màn theo chặng. Bố cục chọn từ ngân hàng đã kiểm chứng, có seed để resume ổn định; có thể gặp lại bố cục cũ. Không ghi sao chiến dịch hoặc xếp hạng toàn cầu cho run này.

- 3 sao: không hint, lượt ≤ tối ưu + max(1, floor(15% tối ưu)); nếu đếm ngược thì còn ≥30% thời gian.
- 2 sao: không hint, lượt ≤ tối ưu + ceil(50% tối ưu).
- 1 sao: đã thắng nhưng kém hiệu quả hoặc dùng hint.
- Hint miễn phí, tự nguyện: tính lại đường ngắn nhất từ bàn hiện tại trong Web Worker, gợi đúng một bước và số lượt còn lại, không tự di chuyển.
- Luyện không giới hạn sau khi thua không tính sao hoặc xếp hạng.

Yêu cầu “paywall” được xử lý hiện tại bằng màn thử thách và hint tự nguyện; chưa thu tiền hay tạo màn không thể giải nếu không mua hint. Chưa có câu trả lời chọn hint bắt buộc từ câu hỏi làm rõ.

## Lưu và tương thích

Save v2 giữ sao/kết quả, ván đang chơi, undo, path, hint, timer và seed/điểm/thời gian Đường dài trong envelope GameBridge hiện có. Đồng bộ tài khoản tiếp tục dùng cơ chế save Supabase của nền tảng. Ghi timer theo giây, ghi nước đi/kết quả ngay. Khi pause hoặc tab ẩn, đồng hồ gameplay dừng. Kết thúc phiên và chơi lại chỉ reset ván; sao và màn đã mở được giữ.

Ván v1 hợp lệ vẫn tiếp tục được ở chế độ ván cũ, không vào xếp hạng mới. Các màn đã mở được giữ, nhưng không tự tặng sao chiến dịch mới. Giới hạn ≥5 lượt áp dụng cho 100 màn v2, không ép thay bàn của ván cũ đang dở.

## Bảng xếp hạng và Supabase

Có bảng riêng theo màn, tách nhóm có hint/không hint. Guest và offline có kết quả trên thiết bị; muốn gửi bảng toàn cầu cần tài khoản và kết nối khi bắt đầu. Không tạo người chơi giả. Mã ván trả chậm vẫn được gắn và gửi nếu người chơi đã thắng.

Backend `car_escape_start` tạo ticket thuộc JWT, kiểm tài khoản dự kiến và giới hạn tần suất tạo. `car_escape_submit` khóa ticket, phát lại toàn bộ chuỗi trượt, kiểm từng ô trung gian, đích thắng, giới hạn lượt/thời gian, tính điểm/sao và chống gửi trùng. Giá trị score do client tự gửi không được dùng. RLS tách ticket từng tài khoản, không cho client sửa bảng/màn/điểm.

`car_escape_levels` dùng khóa (level,campaign_version), để lưu pack mới mà không xóa nguồn của ván cũ. `car_escape_runs` gắn phiên bản pack. Tên hiển thị lấy từ identity trong cơ sở dữ liệu. Không sửa nội dung pack đã phát hành; tạo phiên bản/migration mới và cập nhật RPC/client cùng nhau.

Xếp hạng dùng thời gian thực của máy chủ, **kể cả pause**, để tránh giả mạo thời gian; đồng hồ chơi local vẫn dừng khi pause. Vì vậy ván đếm ngược đã pause lâu có thể thắng local nhưng không được nhận trên bảng toàn cầu. Điều này được hiển thị trong game khi có ticket. Kết quả local và điểm global có thể chênh do thời gian máy chủ. Lời giải được xác thực không đồng nghĩa chống bot, tự đọc đáp án client hoặc khai sai việc dùng trợ giúp bên ngoài.

## Áp dụng database thật

Chưa áp dụng migration Car Escape trên Supabase production: môi trường không có quyền quản trị database.

Sau khi các migration nền tảng, identity và launcher đã áp dụng, chạy **một lần** `supabase/car-escape-upgrade.sql` bằng SQL Editor, hoặc dùng CLI chạy ba migration `202610110003_car_escape.sql`, `202610110004_car_escape_campaign.sql` và `202610110005_car_escape_2d_metadata.sql`. Không chạy cả hai cách. Seed có 100 màn và cập nhật metadata/version của Car Escape trong launcher.

Thử trên staging: đăng nhập, bắt đầu màn, giải, xem bảng pure/hint, thử sai nước đi/timeout và replay; rồi phát hành frontend. Chưa có hosting hoặc URL thử công khai được xác minh.

## Bảo trì bộ màn

Node 24+: `node scripts/generate-car-escape.mjs` sinh lại bank xác định; có thể mất vài phút. `node scripts/export-car-escape-sql.mjs` xuất SQL từ bank và gộp migration. Không chạy lại để sửa migration đã áp dụng; tạo pack mới. Các bài kiểm tra kiểm uniqueness, board hợp lệ, mọi lời giải và optimalMoves, rồi kiểm engine, save, UI và backend.

Nếu đã áp dụng Car Escape v2 trước bản đồ họa 2D: chỉ chạy migration `202610110005_car_escape_2d_metadata.sql` để cập nhật mô tả launcher; không chạy lại bundle nâng cấp. Thay đổi đồ họa giữ campaignVersion 2, màn, lời giải và save cũ.
