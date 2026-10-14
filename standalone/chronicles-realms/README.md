# Chronicles of the Shattered Realms — bản chơi thử v0.1

Bản game web PC/mobile sử dụng trực tiếp 26 spritesheet, atlas 547 khung, 96 màn và danh mục 84 skin từ dev kit người dùng cung cấp. Hình ảnh là sprite 2D giả 3D của gói, không phải mô hình GLB. Không có quảng cáo, thanh toán hay tiền thật.

## Chạy

- Chơi ngay: mở `chronicles-shattered-realms-playtest-v2.html` đi kèm. File này chứa toàn bộ asset, không tải CDN.
- Chạy mã nguồn: phục vụ thư mục `dist/` bằng một static server, ví dụ `python3 -m http.server 8080 --directory dist`, rồi mở localhost:8080.
- Tạo lại bản HTML offline: `python3 build.py` (Python 3, thư viện chuẩn).
- Kiểm tra: `npm install`, `npm run check`, `npm test`. Linkedom chỉ phục vụ kiểm tra DOM, không có trong game.

## Điều khiển

Kéo/chạm trên sân để di chuyển và phóng Orb. Trên PC: chuột hoặc ←/→, Space/Enter để phóng, E để dùng kỹ năng, P/Escape để tạm dừng. Canvas dùng pointer capture; các nút kỹ năng và pause ở ngoài sân. Chuyển tab hoặc mất focus tự tạm dừng.

## Đã triển khai

- Bản đồ sáu vùng, mở khoá tiến trình, 16 màn/vùng từ levels.json; truyện đầu hành trình và lời thoại boss.
- Gạch thường/cứng/thép, bất tử/gương, ẩn, rương, TNT, dây chuyền, băng, lửa, điện, cổng cặp, di động, hồi sinh, bom giờ, khoá/chìa, nhịp điệu, tranh.
- 20 booster với thời gian hiệu lực, quy tắc cộng thời gian và Meteor; pity/drop theo dữ liệu, giới hạn 9 bóng.
- Perfect Catch, combo tối đa ×8, Overdrive, 3 kỹ năng (sau boss vùng 1/2/3).
- 9 blocker, sáu boss có máu theo dữ liệu và ba pha; chiêu có báo trước, riêng theo cấu hình.
- Kết quả sao theo ngưỡng điểm/mạng trong dữ liệu, xu, nhiệm vụ ngày, mua/trang bị skin và thưởng bộ, thành tựu cosmetic, cấp Orb theo thời gian chơi.
- Thử thách ngày seed theo thiết bị, Vô tận nhiều đợt, Boss Rush sáu boss; kỷ lục local.
- Cài đặt âm thanh tổng hợp, chất lượng/giảm hiệu ứng, độ sáng nền, tương phản, cỡ chữ và độ nhạy.
- Tiến trình lưu localStorage với chế độ chơi thử độc lập không tạo phần thưởng.

## Giới hạn bản đầu

- Chưa kết nối tài khoản, xu hoặc lưu cloud của Arcade-x, chưa có bảng xếp hạng server/replay verifier. Nhật ký thao tác và seed có ở engine để nối tiếp sau. Không dùng điểm local làm điểm ranked.
- Chưa có level editor/chia sẻ, loadout, khảo sát cá nhân hoá, nhạc sáu vùng hay cutscene hoàn chỉnh. Âm thanh hiện tại là SFX tổng hợp.
- Boss dùng collider thân và trạng thái khiên/thời gian lộ điểm yếu đơn giản; chưa có hitbox riêng theo từng bộ phận. Phân thân là hiệu ứng đánh lạc hướng, không có mô phỏng ba cơ thể độc lập.
- Chất lượng thấp giảm hạt/hiệu ứng của sprite; không có camera 3D/bloom GPU vì gói này là sprite.
- Các ngưỡng cân bằng và boss HP giữ theo gói. Chưa kiểm chứng tỷ lệ thắng/retention/60 FPS bằng chơi thử trên thiết bị thực.
- 20 kiểm tra engine + 9 kiểm tra DOM đạt. DOM dùng recording canvas; chưa có kiểm tra trực quan bằng trình duyệt trong phiên này.
- Bản thử chưa push/publish và chưa sửa kho game Arcade-x.

Asset nguồn thuộc gói người dùng cung cấp. Source mới ở `dist/engine.js`, `dist/app.js`, `dist/style.css`. Tài liệu nguồn được giữ trong `docs/`.

Readability v2: palette và trạng thái chữ được rà lại; xem docs/READABILITY-AUDIT.md.
