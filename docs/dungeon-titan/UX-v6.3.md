# Dungeon Titan — Sửa trang bị v6.3

## Nguyên nhân
CSS `.fx-item>span` và `.fx-mini-gear span` nhận cả span raster của GearArt, đặt hình về góc dưới/phải giống nhãn cấp. Chi tiết đồ đồng đội chỉ tìm trong kho; sau khi mặc item rời kho nên chi tiết biến mất. Kho đồng đội không có dải slot đang mặc. Đồ cùng loại dùng cùng icon raster, khiến đổi item không có khác biệt dễ thấy. UI cũ không có phản hồi cho equip/best hoặc bảng chỉ số thực tế.

## Thay đổi
- Đổi selector nhãn sang `.fx-item-level`, căn riêng raster cell tại giữa slot. Áp dụng cả slot hero, kho, ba ô đồng đội và mini-slot trong Đội hình.
- Mỗi slot hiện đúng ID/tên món/cấp/viền độ hiếm, ✓ đang mặc; ô thay đổi có outline sáng. Icon vẫn biểu diễn loại trang bị, không phải ảnh riêng từng item.
- EquipmentPanel dùng dữ liệu equipped thực tế; chọn item tìm ở cả kho và các slot đang mặc. Thay đồ xong giữ chi tiết, nút Đang mặc bị khóa; đồ cũ trở về kho. Rèn cũng cập nhật level và phản hồi.
- Trước equip: so món hiện tại với món được chọn và tính dự kiến từ reducer/statFor. Hiện tap, DPS đội, crit và hệ số vàng với chiều tăng/giảm bằng màu, dấu +/− và trước→sau. So thuộc tính gốc từng item: kỹ năng, giảm hồi chiêu, bổ trợ. Đây không phải đo DPS chiến đấu 3s.
- Sau equip/best/forge: chờ state thực tế cập nhật mới thông báo thành công, số ô thay và trước/sau thực tế. Khu vực thông báo role=status nằm trong màn quản lý; không popup chặn trận. Có phần mở rộng xem từng món đã cập nhật và thuộc tính tăng/giảm.
- Đồng đội: chọn nhân vật đã chiêu mộ, ba slot đang mặc, kho lọc đúng nghề. Mặc tốt nhất chỉ áp dụng nhân vật đang chọn qua best.allyId; API best không có allyId vẫn giữ behavior tất cả đồng đội cũ.
- Mặc tốt nhất giữ quy tắc hiện có: hero theo sức mạnh gốc level1, đồng đội theo calculateAllyItemPower. Sidegrade có thể tăng một chỉ số và giảm chỉ số khác; UI thể hiện rõ. Khi không có thay đổi, giải thích thay vì im lặng.
- Giữ lọc độ hiếm, tự nhặt, nhặt đồ chờ, bán món, xác nhận bán kho. Bán kho đồng đội là toàn bộ đồ đồng đội chưa mặc, nêu rõ trong xác nhận.

## Kiểm tra
17 nhóm engine regression pass. Kiểm tra DOM toàn bộ 8 màn và luồng chiến đấu/save pass. Test riêng equipment kiểm tra hero/ally equip, downgrade, forge, best theo chủ sở hữu, best không đổi, chi tiết giữ sau swap, ID/names/checkmark slot, số tăng/giảm, nghề tương thích và save/restore.
Targeted TypeScript check pass. Không có thay asset hoặc schema save. Chưa render browser/điện thoại thật nên chưa khẳng định pixel layout hoặc FPS. Bản source patch chưa push/merge/deploy.
