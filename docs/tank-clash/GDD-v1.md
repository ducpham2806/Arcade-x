# Tank Clash — GDD prototype v1

Ngày: 02/11/2026. Thiết kế theo `Tank_Clash_Development_Plan_v1.md`. Tất cả số cân bằng là [PLACEHOLDER]. Tham chiếu thực thi: `CONFIG` trong engine; bảng cân bằng đi kèm bản review cho phép ghi đề xuất thử tiếp.

## Trải nghiệm và vòng chơi

Người chơi đọc đường đạn, chọn vị trí rồi bắn thẳng hoặc bật qua tường thép. Mỗi lần khiên thành công và bắn góc trúng đối thủ là phản hồi cần kiểm chứng. Sảnh → sân tập hoặc bot → hiệp → kết quả → đấu lại. Prototype chỉ kiểm chứng vòng chơi này, không có tiến trình sức mạnh dài hạn.

## Cơ chế

| Cơ chế | Mục đích và input | Kết quả thành công | Lỗi/ngoại lệ cần giữ |
|---|---|---|---|
| Lái độc lập tháp pháo | WASD/cần trái di chuyển, chuột/cần phải ngắm | Vừa né vừa giữ hướng bắn | Chuẩn hóa đường chéo; trượt dọc tường; không xuyên xe/tường; mất focus xóa input |
| Bắn | Chuột trái hoặc nhả cần ngắm | Đạn đi theo hướng ngắm, hồi bắn và giới hạn số đạn rõ | Không spawn phía bên kia tường; đạn chỉ gây sát thương một lần |
| Phản xạ | Bắn tường thép | Đổi hướng theo mặt va chạm, tối đa một lần bật | Cùng quy tắc với preview; va góc đảo cả hai trục; lần va thép tiếp theo hấp thụ |
| Gạch | Bắn vật cản cam | Hai phát phá một ô, mở lối đi | Gạch hấp thụ viên đạn gây sát thương; gạch đã vỡ hết va chạm |
| Khiên | Space/nút khiên | Chặn viên đạn trong thời gian ngắn | Không phản đạn; hồi chiêu do simulation giữ; không tái kích hoạt khi chưa hồi |
| HP và loại xe | Đạn đối phương hoặc đạn mình đã bật trúng xe | HP giảm, hết HP thì dừng tham chiến | Friendly fire đồng đội tắt; đạn mình trước lần bật không tự trúng |
| Hiệp | Loại hết đối thủ hoặc hết giờ | So số xe sống rồi tổng HP | Đồng thời bị loại được hòa; không chọn thắng theo thứ tự gói mạng |
| Chuyển hiệp | Khoảng nghỉ ngắn giữa hiệp | Reset xe, gạch, đạn, kỹ năng | Không cộng điểm hai lần; tối đa ba hiệp; hai hiệp thắng kết thúc sớm |

## Tuning ban đầu

| Nhóm | Thông số [PLACEHOLDER] | Lý do thử |
|---|---|---|
| Xe | 3 HP; tốc độ 155 px/s; bán kính 16 px | Có chỗ cho sai lầm, đủ né trong map 800 × 480 |
| Đạn | 1 damage; 340 px/s; hồi 0,65 s; tối đa 3 viên đang bay | Hạn chế spam, tạo cửa sổ phản ứng |
| Phản xạ | 1 lần; tuổi thọ 2,5 s | Đường đạn dễ đọc, không tồn tại vô hạn |
| Khiên | 0,8 s; hồi 8 s | Một lựa chọn phản ứng, chưa cần nhiều nút |
| Hiệp | 60 s; tối đa 3 hiệp | Giữ thời gian chờ sau bị loại tương đối ngắn |

Các metric suy ra trong bảng cân bằng: số phát hạ xe = làm tròn lên HP/damage; thời gian hạ tối thiểu = (số phát − 1) × hồi bắn, chưa tính đường bay/né/khiên; đường bay tối đa = tốc độ đạn × tuổi thọ.

## Onboarding bằng thực hành

1. Lái vào vòng sáng; không có nguy hiểm.
2. Bắn bia đứng yên; không có nguy hiểm.
3. Dùng tường phản xạ trúng bia; bắn trực tiếp không hoàn tất bài.
4. Phá một ô gạch; thấy ngay lối mở.
5. Bật khiên chặn đạn tập; xe người chơi được bảo vệ trong sân tập.

Hoàn thành bài hiện thông báo gọn và nút sang bài, không chồng popup. Hoàn tất sân tập có lối vào đấu bot. Chuyển sang bài mới reset xe, vật cản và input nhưng giữ thống kê phiên.

## Bot

Bot dùng đúng va chạm, HP, hồi bắn và khiên. Tìm đường trên grid, tiếp cận khi bị chắn, đi ngang khi có góc bắn. Nhắm có sai số và chỉ dùng khiên trong một phần tình huống đe dọa. Bot không thay thế dữ liệu chơi thật để kết luận độ vui hoặc cân bằng.

## Giao diện và phản hồi

Header thông tin phiên bản; một dòng mục tiêu; HP/điểm/đồng hồ; sân ở giữa; controls ở vùng riêng. Trên màn ngang, controls nằm hai bên sân; màn dọc chuyển xuống dưới. Dialog full-screen trên mobile theo AGENTS.md; vùng nội dung tự cuộn nếu cần. Bắn/va chạm có tín hiệu hình tạm, âm thanh sản xuất nằm ở P4.

## Đo và góp ý

Phiên chơi đếm shots, hits, hits sau bật, blocks và bricks. Form góp ý chỉ sao chép khi người chơi bấm; không truyền analytics ra ngoài. Cần quan sát người mới có hiểu điều khiển và tường phản xạ trong khoảng 60 s [PLACEHOLDER], có muốn đấu lại không, có nhìn rõ nguyên nhân bị hạ không.

## Chưa triển khai trong prototype

Phòng online người dùng, mã/link mời, matchmaking, 2v2, auth, kết quả bền vững, progression, skin sản xuất, SFX/BGM. Network spike P0 chạy tách riêng để kiểm chứng hợp đồng server; chưa nối vào UI.

## Nhật ký

- v1, 02/11/2026: định nghĩa prototype theo plan, hiện thực sân tập/bot/luật hiệp, tách simulation dùng được phía server.
