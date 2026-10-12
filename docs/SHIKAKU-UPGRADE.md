# Shikaku — nâng cấp trải nghiệm 2026-10-12

## Đã trải nghiệm và sửa

Bản cũ: đã giải trọn một câu bằng chuột kéo thả; 4 kiểm thử nền thành công. Vấn đề chính là mặc định hai chạm + xác nhận, đặt vùng chồng xóa vùng cũ, thiếu phản hồi diện tích, khó tăng nhanh lên 10×10, hoàn tác bị phạt trong Limited và tự chuyển câu sau 1,4 giây.

Bản mới:
- Mặc định kéo thả bằng pointer capture. Tính ô cuối từ tọa độ thả, không phụ thuộc React render cuối. Hỗ trợ kéo ngược, hủy do pointercancel/mất focus/tạm dừng, thả ngoài bảng không ghi vùng, bỏ qua ngón thứ hai. Hai chạm và bàn phím vẫn có trong hướng dẫn.
- Preview diện tích và lý do sai bằng chữ, nét và màu; vùng sai không ghi, không đè mất vùng cũ. Chạm vùng để chọn, nút Xóa riêng, hoàn tác miễn phí.
- Hai chế độ: thư giãn và thử thách 180 giây hoạt động. Người chơi chọn 4×4, 5×5, 6×6, 8×8; không ép tăng bảng. Câu đầu làm quen 4×4, các câu tiếp theo sinh ngẫu nhiên.
- Bộ giải có giới hạn công việc tìm lời giải tương thích vùng đã đặt, chấp nhận lời giải khác đáp án mẫu. Gợi ý là khung nét đứt để người chơi tự kéo; khi bế tắc báo sửa/hoàn tác, không tự xóa bài.
- Kết quả giữ nguyên bảng; người chơi bấm tiếp theo. 3 sao nếu không gợi ý, 2 sao nếu dùng 1 lần, 1 sao nếu dùng từ 2 lần. Hoàn tác không ảnh hưởng sao. Sao hiện đánh giá từng câu, chưa có bộ sưu tập sao/campaign.
- Giữ thưởng nền tảng 25 xu +15 EXP/câu. Sửa tên sự kiện thành tựu khớp config. Điểm nền tảng vẫn là số câu đã giải, không tạo bảng xếp hạng mới.
- Ba bảng màu mint/peach/sky, vùng ghép pastel nổi nhẹ, pop khi đặt và confetti khi thắng; tôn trọng giảm chuyển động. Bàn nằm giữa vùng chơi dưới launcher trên màn dọc; màn ngang có điều khiển hai bên.
- Tách luật/solver khỏi renderer và React UI. Save v2 dùng bridge hiện có: lưu câu, vùng, lịch sử, thời gian, gợi ý và lựa chọn giao diện; không cần SQL mới. V1 giữ câu/vùng/nháp/undo/điểm; Limited chuyển sang thư giãn, không mất mạng vì undo. Các vùng sai từ bản cũ được giữ, hiển thị sọc và có thể xóa/hoàn tác.

## Kiểm chứng

- 19 kiểm thử sản phẩm: luật, bộ giải 120 câu (4 cỡ bảng ×30 seed), lưu/khôi phục v1/v2, kéo ngược, chồng vùng, cảm ứng Chromium CDP, cancel/thả ngoài, hai chạm/bàn phím, menu/tiếp tục, thắng không tự chuyển và không thưởng lại, hết giờ, modal focus/đồng hồ, 5 viewport.
- Viewport: 320×568, 390×844, 390×1000, 844×390, 1440×900. Kiểm tra tâm bảng và nút không tràn. Xem ảnh thực tế, chơi luồng từ menu tới thắng và câu tiếp theo.
- `npm run lint`, `npm run build`, `npm run test:shikaku`.
- Test sản phẩm mock Supabase. Không tuyên bố đã thử đồng bộ bằng tài khoản production hoặc triển khai website công khai.
- Chưa có thử nghiệm iPhone/Android vật lý hoặc nhóm người dùng thật; kết quả solver không chứng minh độ khó phù hợp con người. Generator bảo đảm có đáp án, chưa bảo đảm đáp án duy nhất.

## Đề xuất tiếp theo theo ưu tiên

1. **Bài học bằng hành động, có chương**: 15–20 câu thiết kế tay, lần lượt học 1×N, hình vuông, phân tích thừa số và tránh vùng bế tắc. Chỉ mở khái niệm mới sau khi người chơi làm được bài cũ. Không bắt dùng hint hoặc đặt paywall khi mới học.
2. **Câu đố hằng ngày cùng seed**: thêm mục tiêu quay lại; muốn xếp hạng công bằng phải tách kích thước/luật/phiên bản câu và số gợi ý, kiểm chứng lượt giải phía server. Điểm hiện tại chỉ phù hợp thành tích cá nhân.
3. **Gợi ý giải thích từng bước**: trước khi vẽ đáp án, nêu lý do như “số 6 cạnh góc có thể là 2×3”. Bộ solver hiện đã là nền để bổ sung, nhưng chưa có bộ giải thích logic.
4. **Bức tranh/album mở dần**: thắng giải phóng một mảnh tranh hoặc skin; bổ sung động lực dài hạn mà không thêm nút vào bàn chính.
5. **Đo với 5–10 người mới**: quan sát họ có hiểu số là diện tích trong 30 giây không, số lần đặt nhầm do ngón che, thời gian giải 4×4/5×5, tỷ lệ cần gợi ý. Ưu tiên sửa thao tác trước khi thêm đồng hồ hoặc chế độ khó.

Chưa triển khai các mục đề xuất này. Không thêm thu thập dữ liệu người dùng hay dịch vụ bên ngoài trong lần nâng cấp này.

## Bản nâng cấp tiếp nối

Các chương học, câu đố hằng ngày, bảng xếp hạng theo độ khó và gợi ý giải thích đã được triển khai tiếp trong `docs/SHIKAKU-JOURNEY.md`. Phần backend production vẫn cần áp dụng SQL mới. Đề xuất album tranh và thử nghiệm với người chơi thật chưa triển khai.
