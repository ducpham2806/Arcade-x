# Dungeon Titan — Đồng bộ fantasy UI v6.2

## Phạm vi
Tám màn Anh hùng, Đội hình, Túi đồ, Bản đồ, Ấn Titan, Tuyệt kỹ, Tạm nghỉ và Cách chơi dùng chung tiêu đề màu đồng cam, huy hiệu raster, khung đá xanh, viền vàng cổ, nút vàng, typography system đậm và năm tab cùng màu/icon với màn chiến đấu. Thư viện art và tổng kết bản thử cũng dùng cùng vật liệu/typography.

Modal giữ khung cố định khi chuyển tab; mobile toàn màn hình, desktop 92% tối đa 900px cao/1024px rộng. Nội dung cuộn độc lập, tiêu đề và điều hướng giữ nguyên. Vùng chiến đấu và điều khiển một tay v6.1 được giữ. Không thêm texture, thư viện hoặc vòng lặp render.

## Tỷ lệ và hướng nhân vật
Hero và cả sáu đồng đội dùng chung --dt-party-size theo breakpoint: mặc định clamp(68px,22vw,110px); desktop 125px; portrait thấp clamp(60px,20vw,96px); landscape thấp clamp(56px,22vh,88px). Dùng kích thước ô vuông và baseline chung để giữ đúng tỷ lệ ảnh. Kệ hai bên được mở rộng và khoảng cách vị trí điều chỉnh theo kích thước mới. Thân hình gốc có thể khác nhau theo loài.

Đồng đội vị trí 0/1/4 ở trái quay phải; 2/3/5 ở phải quay trái. Địch ở phải quay trái. facing chỉ áp dụng lên sprite, dùng CSS scale riêng, không lật nút, level, thanh máu, marker hoặc VFX. Metadata ảnh nguồn: party quay phải; quái thêm v6 và quái v5 chương IV quay trái sẵn; boss Hỏa Long một số frame di chuyển/quỳ đã quay trái, nhện phun độc quay trái. Không áp dụng lật toàn bộ container. Gallery/portrait ngoài trận không ép facing để giữ nguồn.

## Kiểm tra
TypeScript targeted check và DOM luồng 8 màn: khung chung, huy hiệu/tiêu đề, tab active, nâng cấp hero, đóng/mở đồng đội, kho, bản đồ, ấn, 7 tuyệt kỹ, hướng dẫn, pause timer, giữ chém, lưu và boss retreat/retry.
SSR với đủ 6 đồng đội kiểm tra hướng theo vị trí, đối chiếu ảnh nguồn cũ/mới và ngoại lệ Hỏa Long. Đã xem contact sheet của party, 48 quái và 8 boss để đặt hướng nguồn.
Chưa render trên browser/điện thoại thực tế; chưa xác nhận độ chồng lấp, độ dễ đọc, FPS/GPU hoặc launcher production. Đây là patch review, chưa push/merge/deploy. Engine/schema4/save/art không thay.
