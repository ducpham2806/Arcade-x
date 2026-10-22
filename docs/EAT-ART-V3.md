# Eat Em All — art & UI v3

## Hướng hình ảnh đã áp dụng

Fantasy hoạt hình 2D, xanh rừng sâu + viền đồng + giấy cổ. Nốm có dáng linh thú tròn, tai Băng/Lửa, khăn choàng và huy hiệu nhịp tim. Băng có góc tinh thể, Lửa có đường cong; nguy hiểm màu xám/độc xanh ô-liu có dấu chéo. Không dựa riêng vào màu để phân loại.

Tham khảo từ trang chính thức, truy cập 17/10/2026:

- [Cut the Rope — ZeptoLab](https://www.zeptolab.com/games/cut-the-rope): nhân vật trung tâm, biểu cảm rõ và thế giới thân thiện.
- [Fruit Ninja — Halfbrick](https://www.halfbrick.com/games/fruit-ninja-classic): ưu tiên phân biệt thức ăn và bom trong hành động nhanh.
- [CookieRun: Kingdom — Devsisters](https://www.devsisters.com/en/games/cookierun-kingdom): xây nhận diện vùng đất gắn với câu chuyện.

Đây là diễn giải thiết kế cho Eat Em All; toàn bộ hình vẽ, nhân vật và icon được tạo riêng, không tải hay sao chép asset của các game tham khảo.

## Bộ asset

| Nhóm | Số lượng | Trạng thái / nhận diện |
|---|---|---|
| Nốm | 18 SVG | 3 dạng Băng/Lửa/Song hệ × idle, eat, hurt, happy, sleep, fury |
| Thủ vệ | 12 SVG | 4 hình dáng: rễ cây, lò rèn, ký ức biển, trái tim vực; mỗi hình có idle/attack/hurt |
| Vật phẩm, booster, di vật, UI | 29 SVG | Cùng viền, góc chiếu sáng và tỷ lệ; Tăng tốc có hình giày cánh, Fury là tia sét |
| Cảnh thế giới | 1 WebP | 1200×800, 173.044 byte; bốn vùng liền mạch; cắt khung theo chương trong runtime |

SVG là nguồn chỉnh sửa được. `art.ts` là nguồn chuẩn, `npm run export:eat-art` xuất SVG + manifest và kiểm tra ngân sách; không sửa file xuất rồi bỏ qua nguồn. UI dùng `ArtIcon.tsx`, Canvas dùng cùng SVG đã raster-cache. Manifest có kích thước, pivot và kích thước cache. Âm thanh giữ bộ tổng hợp hiện có.

## UI đã thay

- Trang chính: logo chữ có huy hiệu riêng, Nốm Song hệ, tab có icon và chương dạng thẻ di vật.
- Bản đồ: sáu mốc đường hành trình trên cảnh nền chương, boss có chân dung, sao có trạng thái chưa/đã đạt.
- Nhiệm vụ: thẻ giấy cổ, quota bằng hình, nút bắt đầu có độ nổi.
- Trong lượt: HUD gọn, trái tim bằng asset, thanh mục tiêu sáng; nút đổi hệ và Fury đặt dưới, có thanh tích năng lượng.
- Boss: chân dung trong sân, biểu cảm theo pha cảnh báo/phản công/trúng đòn; thanh giáp DOM riêng.
- Brief, tạm dừng, thắng/thua: cùng hệ khung và biểu cảm phù hợp.
- Sổ linh thú: xem bộ nhân vật, thủ vệ và vật phẩm; modal đầy màn hình trên điện thoại, header/footer cố định, nội dung cuộn riêng.

## Chuyển động và hiệu năng

Nhịp thở, ăn co giãn, đổi hệ, chớp sau trúng đòn, Fury, phản hồi boss được xử lý bằng thời gian. Physics không phụ thuộc số khung hình. Dùng tối đa 32 vật phẩm, 96 hạt, 12 nhãn. SVG chỉ decode một lần và cache thành bitmap 96/192/256 pixel; nền WebP decode một lần. Có `prefers-reduced-motion` để tắt nhún, chuyển động nền và hiệu ứng CSS lặp.

Ngân sách đã kiểm tra: mỗi SVG dưới 8 KiB; nền dưới 250 KiB; khoảng 10–11 MiB bitmap sau giải nén nếu mọi biến thể đã cache (chưa tính cache DOM của trình duyệt). Chưa đo GPU/frame-time trên điện thoại thật, không khẳng định 60 fps từ kiểm tra dữ liệu.

## Xác minh

- TypeScript và bundle HTML tự chứa: đạt.
- 24 màn × 3 nhịp mô phỏng: đạt; giữ nguyên quota/boss/reward logic.
- 59 SVG: parse được, không tài nguyên ngoài hoặc mã thực thi; kích thước và ngân sách đạt.
- React DOM: Sổ linh thú mở/đóng, bản đồ/truyện/chơi/Fury/pause/quota/boss/kết thúc: đạt.
- Chạy chính component Canvas bằng bộ Canvas2D native, decode tất cả SVG/WebP và thực hiện hứng; ba chương không có lỗi vẽ. Màn 1 cho cùng số lần hứng ở 30/60/120 Hz. Đã xem ảnh render nội bộ để kiểm tra nhân vật, vật phẩm và boss trong sân.
- Chưa kiểm thử bố cục CSS trong trình duyệt thật, touch trên thiết bị hoặc full build toàn bộ launcher. Bản live chưa thay đổi.
