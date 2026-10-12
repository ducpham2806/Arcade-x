# Xếp Gạch — Cải thiện cảm giác chơi và tiến trình

12/10/2026. Đã thực hiện theo thứ tự ưu tiên đã thống nhất.

## 1. Khay và kéo thả

Khối tự phóng theo cả chiều rộng/chiều cao ô khay, tối đa 26px mỗi ô thay vì 12–18px cố định. Khi kéo có khối nổi bằng kích thước ô bàn; giữ điểm bám tương đối nơi ngón tay/chuột chạm. Khoảng nâng cảm ứng phụ thuộc kích thước ô, giới hạn 28–64px. Preview khớp vị trí sẽ đặt; không tự nhảy sang vị trí hợp lệ khác ngoài preview. Cancel/pause ẩn khối nổi, không đặt khối.

Bàn vẫn căn giữa vùng chơi; xoay/gợi ý và ba booster luôn nằm ngoài menu. Màn ngang vẫn dùng bố cục hai bên.

## 2. Booster và sao

Búa: chọn → xem vùng tác động (cắt đúng ở biên) → bấm ✓ để xác nhận; chưa xác nhận không trừ stock. Có nút hủy. Búa/đổi khay/hoàn tác có màu và icon khác nhau, lần đầu dùng có giải thích ngắn không chặn thao tác. Hoàn tác không bật khi chưa có snapshot; snapshot hợp lệ được lưu và phục hồi sau reload, giữ thời gian và chi phí đã dùng.

Dự báo 1–3 sao ngay dưới số điểm trong campaign, không thêm hàng HUD. Kết quả giải thích số sao nhận được. Màn thư giãn không có giới hạn lượt ẩn để giảm sao; màn thời gian/lượt dùng ngưỡng còn 20% để đạt 3 sao, cùng điều kiện tối đa 1 booster. Dùng tối đa 2 booster vẫn được 2 sao, đạt target luôn có ít nhất 1 sao.

## 3. Combo và Perfect Clear

Mọi chế độ: xóa hàng tăng chuỗi, cho phép một lượt đệm không xóa. Hai lượt liên tiếp không xóa kết thúc chuỗi. Không còn cơ chế riêng giữ combo vô hạn cho màn combo.

Xóa sạch cả bàn bằng xóa hàng/cột được **Perfect Clear +500 điểm**, nhãn riêng và âm thanh thắng hiện có của app; búa dọn trống không tính Perfect Clear. Combo vẫn ×1–2; không tạo camera shake/flash toàn màn. Giảm chuyển động vẫn hoạt động.

## 4. Campaign và động lực chơi

Giữ 100 màn/10 vùng nhưng thêm các nhóm khác nhau: cổ điển, vườn sao bắt đầu ở cạnh dưới, giao lộ tập xóa cột, lễ hội combo và 9 màn giải đố dọn sạch ngắn. Màn dọn sạch có hai khối và đường hoàn thành rõ, thay đổi hướng/vị trí theo vùng; là màn thả lỏng xen kẽ thử thách. Chưa phải 100 màn đều được thiết kế thủ công.

Mỗi vùng đủ 10 màn thưởng thêm **200 xu một lần**. Shop có khung hoàng kim 300 xu, cầu vồng 500 xu; có thể chọn skin yêu thích hoặc ngẫu nhiên. Năm skin đang có vẫn miễn phí, không khóa lại nội dung cũ. Skin yêu thích áp dụng khi bắt đầu lượt mới; khung áp dụng ngay.

## Lưu và tương thích

Giữ schema save v2, bổ sung các trường tùy chọn và mặc định cho bản cũ: dryMoves/perfects, favoriteSkin/frame/frames, seenBoosters, claimedChapters. Lượt campaign mới có campaignVersion=2; lượt cũ giữ mục tiêu/giới hạn theo bộ màn trước, nên không đổi target giữa chừng. Sao/điểm tốt nhất cũ vẫn được giữ.

Dùng Supabase game_sessions hiện có theo tài khoản; khách lưu trên thiết bị. Không cần migration hoặc Edge Function mới. Ví vẫn do client ghi, không phải số dư giao dịch tiền thật; chưa thay leaderboard của launcher thành leaderboard replay được xác thực.

## QC

26 bài Playwright: engine/scoring/combo/Perfect Clear, bot 100 màn không booster, thưởng một lần/thưởng vùng, migrate/undo, 5 viewport, touch/cancel/pause/reload, ví cloud qua backend mock, kéo mép khối, preview/xác nhận búa/dự báo sao và collection. TypeScript/build đạt, còn cảnh báo chunk lớn có sẵn. Production offline đã reload/vào game/đặt khối/khôi phục bàn, không lỗi JS.

Ảnh gallery/ chụp game thật; các ảnh preview/collection/puzzle dùng save fixture cho đúng tình huống, không phải chứng minh đã chơi campaign bằng người thật. Playtest trên iOS/Android thật và cân bằng với người thật còn cần thực hiện; bot và Chromium không thay thế bước đó.

## Chơi / hosting

Upload nội dung ARCADEX-BLOCKER-EXPERIENCE-WEBSITE.zip lên hosting static HTTPS có SPA fallback về index.html. Không mở file://. Đây là build toàn bộ app, giữ các nâng cấp trước; chưa có link hosting công khai mới.

Xem PLAYTEST.md để thực hiện bước đánh giá với 5–10 người mới, chưa được thực hiện trong phiên này.
