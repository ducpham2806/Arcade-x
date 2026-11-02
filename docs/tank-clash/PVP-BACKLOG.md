# Arcade-x — Danh sách game PvP phát triển dần

Phiên bản: 1.0 · Ngày lập: 02/11/2026 (Việt Nam)

## Quyết định hiện tại

Anh Đức yêu cầu lưu cả năm ý tưởng để phát triển dần và lên kế hoạch làm **Tank Clash trước**. Những tên dưới đây là tên làm việc, chưa phải tên thương mại đã kiểm tra. Việc lưu ý tưởng không có nghĩa các game đã được lập trình hoặc mọi chế độ đã được kiểm chứng.

| Ưu tiên dự kiến | Game | Trải nghiệm chính | Quy mô dự kiến | Trạng thái |
|---|---|---|---|---|---|
| 1 | Tank Clash | Xe tăng đấu trường góc nhìn từ trên xuống; né đạn, bắn bật tường, phá vật cản, phối hợp ép góc | 1v1, 2v2 trước; 3v3, 4v4 sau | Đã có nền P0 và bản thử P1; tiếp theo online 1v1 P2 |
| 2 | Rune Brawl | Đấu sĩ dùng đánh thường, lướt né và kỹ năng riêng; thắng nhờ đọc tình huống và phối hợp | 2v2 làm trọng tâm; có thể mở 1v1, 3v3, 4v4 | Ý tưởng đã lưu |
| 3 | Sky Artillery | Pháo chiến theo lượt; canh góc, lực, gió; phá địa hình và hỗ trợ đồng đội | 1v1 đến 4v4 | Ý tưởng đã lưu |
| 4 | Beast Ball | Thú chiến tranh bóng; chuyền, húc, ghi bàn; thiên về chơi vui cùng bạn bè | 1v1 đến 3v3; đánh giá 4v4 sau | Ý tưởng đã lưu |
| 5 | Blade Duel | Kiếm đấu màn hình ngang; đánh, đỡ, phản đòn, phá thủ; tập trung kỹ năng tay đôi | Chủ yếu 1v1 | Ý tưởng đã lưu |

Thứ tự sau Tank Clash là đề xuất ban đầu; có thể đổi sau khi đánh giá lượng người chơi và phản hồi. Các chế độ đông người cần thiết kế bản đồ, mục tiêu và cân bằng riêng.

## Điểm hấp dẫn cần kiểm chứng của từng game

- **Tank Clash:** một pha bắn bật tường hoặc phối hợp ép góc có đủ rõ ràng và thú vị để người chơi muốn đấu lại không?
- **Rune Brawl:** mỗi nhân vật có dễ hiểu, dễ nhận diện chiêu và tạo được cách phối hợp khác nhau không? Cân bằng 1v1 cần được đánh giá riêng với đấu đội.
- **Sky Artillery:** cú bắn có tạo bất ngờ, vui và cảm giác làm chủ được không? Thiết kế lượt phải hạn chế thời gian chờ, nhất là ở 4v4.
- **Beast Ball:** người mới có chuyền và ghi bàn được sớm không? Vai trò trong đội cần xuất hiện từ gameplay, không đòi hỏi học nhiều kỹ năng.
- **Blade Duel:** đỡ, phản đòn và phản hồi trúng đòn có nhất quán giữa hai máy không? Đây là hướng cần chú trọng animation và ảnh hưởng độ trễ.

## Nền phòng chơi hướng tới dùng chung

1. **Chơi nhanh:** ghép người theo chế độ, khu vực mạng và mức kỹ năng khi đã đủ dữ liệu.
2. **Lập tổ đội:** bạn bè ở cùng nhóm rồi cùng tìm đối thủ; khác với tạo phòng đấu riêng.
3. **Phòng riêng:** chọn chế độ, bản đồ, chia đội; vào bằng mã hoặc đường link mời.
4. **Sảnh chờ:** hiển thị người chơi, đội, trạng thái sẵn sàng và kết nối.
5. **Vòng đời trận:** tải → sẵn sàng → bắt đầu → kết quả → đấu lại hoặc về sảnh.
6. **Khôi phục kết nối:** trở lại đúng ghế và trạng thái hiện tại; không cấp lại máu hoặc phần thưởng.
7. **Quyền truy cập:** thực thi quy tắc tài khoản và gói chơi thống nhất với Arcade-x.

Mỗi game dùng adapter gameplay riêng. Chỉ trích xuất phần dùng chung sau khi Tank Clash chứng minh được luồng phòng; không viết lại toàn bộ PvP của launcher ngay từ đầu.

## Nguyên tắc phát triển

- Thử vòng chơi cốt lõi trước, đầu tư hoàn thiện art khi gameplay đã có tín hiệu tốt.
- Với game hành động, thử đồng bộ online sớm, không đợi hoàn thiện toàn bộ nội dung.
- Ưu tiên điện thoại và trình duyệt PC; điều khiển không che vùng chiến đấu.
- Khi lượng người ít, tập trung một hàng chờ công khai chính. Phòng riêng hỗ trợ những lựa chọn đã hoàn thiện.
- Bot phải được ghi rõ; không giả làm người thật để lấp phòng.
- Thông số cân bằng và mục tiêu hiệu năng đều phải được đo, chưa coi là kết quả đạt được.
- Đấu PvP bắt đầu với chỉ số ngang nhau; phần thưởng trang trí không làm tăng sức mạnh.
- Theo quy ước Arcade-x hiện có: bản thử để duyệt trước khi phát hành công khai.

## Tài liệu triển khai đầu tiên

**Tank_Clash_Development_Plan_v1.md** — bản hiện hành v1.1, có tiến độ P0/P1 và việc tiếp theo P2. Bản chơi thử: **Tank_Clash_P1_Playtest.html** (sân tập và bot, chưa online).

## Nhật ký quyết định

| Ngày | Quyết định |
|---|---|
| 02/11/2026 | Lưu năm ý tưởng PvP; ưu tiên Tank Clash; lập kế hoạch trước khi bước vào triển khai. |
| 02/11/2026 | Đã dựng Tank Clash P0/P1; người dùng yêu cầu hoàn tất phần đang dừng rồi merge. |

Khi đổi ưu tiên hoặc thêm game, cập nhật tài liệu này và ghi lý do trong nhật ký. Khi tiếp tục Tank Clash, đọc bản hiện hành của kế hoạch Tank Clash trước.
