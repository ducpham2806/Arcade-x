# Dungeon Titan v4 — Thành cổ

Bản thử UI ngày 16/10/2026, phát triển từ bản gameplay v3. Không thay đổi công thức, vật phẩm, tiến độ hoặc schema save v3.

## Vấn đề từ ảnh người chơi

Ảnh 12892 và 12893 cho thấy phần chơi nối dài xuống phần quản lý, nhiều tiêu đề/mô tả và bảy kỹ năng khóa cùng chiếm chỗ. Header tên game và toolbar thử nghiệm lặp thông tin. Kiểu bảng màu xanh, hàng nút chữ và các card lớn làm trải nghiệm giống phần mềm quản trị. Nút tấn công bị thiếu tương phản trên ảnh.

## Luồng mới

Mở file → vào trận → giữ nút kiếm hoặc chạm Titan → bấm tuyệt kỹ khi sẵn sàng → dùng nút nâng cấp nhanh → mở menu quản lý khi cần.

| Thay đổi | Cách hoạt động |
|---|---|
| Một màn hình chiến đấu | Root theo chiều cao viewport; header gọn, arena co giãn, kỹ năng/đánh/nâng cấp/nav luôn ở đáy. Không nối panel quản lý vào cuối trang. |
| Kỹ năng theo tiến độ | Hotbar chỉ hiện tối đa 4 kỹ năng đã mở. Các kỹ năng khác và mức mở tiếp theo nằm trong một nút sách/khóa. Toàn bộ 7 kỹ năng vẫn dùng và nâng được trong sách. |
| Quản lý tách riêng | 5 mục biểu tượng có nhãn ngắn. Mở thành frame toàn màn mobile, frame lớn desktop. Header/footer giữ cố định. Có nav chuyển mục ngay trong frame. |
| Tạm dừng khi xem menu | Dừng đồng hồ boss, cooldown, nội tại và giữ nút. Cho phép mua, mặc, rèn và nâng cấp trong menu. Trở về không bù thời gian đã dừng. |
| Đồng đội gọn | Chỉ hiện chân dung, tên, cấp/DPS và nút nâng. Chọn hàng mới mở 3 kỹ năng và 3 ô đồ. |
| Túi đồ | Lưới biểu tượng, viền độ hiếm, số cấp và dấu ↑ cho đồ có chỉ số gốc tốt hơn. Chọn món để xem số liệu và thao tác. Bán kho vẫn có xác nhận. |
| Hướng dẫn | Một gợi ý giữ kiếm ở giai đoạn đầu; tín hiệu đỡ ngay trên boss. Menu Cách chơi có 4 bước ngắn. |
| Thông tin nền | Bỏ slogan, đoạn giới thiệu, thông số dài và trạng thái autosave khỏi màn chiến đấu. Lỗi lưu vẫn hiện rõ. Thưởng dạng toast gọn 1,5s. |
| Điều khiển hỗ trợ | Nút kiếm dùng pointer capture để giữ chém, Space/Enter trên nút cũng hoạt động. Modal có Escape, giữ focus trong dialog, trả focus khi đóng, background inert. |

## Art direction

Fantasy thành cổ: xanh rêu, đá than, đồng cổ, vàng ấm, serif ở tên địch/tiêu đề, chữ hệ thống ở số và điều khiển. Không sao chép nhân vật hay huy hiệu của một IP cụ thể. Thanh máu đỏ khoáng, thanh MP lam ngọc, kỹ năng tròn viền đồng, nút kiếm trung tâm, khiên riêng chỉ sáng đúng cửa sổ đỡ. Icon SVG cùng một nét thay cho emoji trong UI.

Nền thành cổ được tạo bằng imagegen tích hợp, lưu asset dự án tại `src/games/dungeon-tap/assets/citadel-v4.webp`. Prompt sản xuất:

> A grand ruined mountain citadel entrance in an original high fantasy Middle-earth-inspired world: weathered dwarven stone archway, ancient bronze door ornaments, moss-covered pillars, amber torches, misty blue mountains and golden dusk. Portrait 2:3, hand-painted cinematic 2D game environment. Keep middle lower 55 percent a clear weathered stone combat platform. Charcoal, moss, bronze, amber, desaturated blue. No characters, text, runes, logos, UI, borders, or watermark.

File nguồn imagegen nằm trong đầu ra tạo ảnh của cuộc trò chuyện. Asset WebP tối ưu chỉ đổi mã hóa; không chỉnh nội dung. Màu overlay theo biome, giữ hình thành cổ chung. Nhân vật/boss giữ roster vector v3. Không phải thay toàn bộ nhân vật thành artwork bán thực tế trong đợt UI này.

Ngân sách: 1 nền 1024×1536, khoảng 297 KiB / 6 MiB decoded; không tải font hay ảnh ngoài. Khoảng 30 glyph vector nhỏ; giữ giới hạn actor v3. Không particle mới, chỉ transform/opacity, hỗ trợ reduced motion. Modal có blur đơn và combat ngừng phía sau. HTML độc lập khoảng 737 KiB. Đây là ngân sách cấu trúc, chưa phải số FPS/GPU đo thực tế.

Nút tấn công: text #172316 trên điểm tối nhất của nền gold #b08d4b, tương phản 5,24:1; nút gold trong menu: 6,12:1. Chỉ số này kiểm tra cặp màu khai báo, không thay cho kiểm tra toàn bộ UI thực tế.

## Kiểm tra

- TypeScript cho core/preview mới và build HTML có nhúng WebP, không script/ảnh/font ngoài.
- Giữ 17 nhóm unit test engine v3; kinh tế không đổi nên kết quả mô phỏng 90 ngày v3 vẫn là dữ liệu tham khảo trước đó.
- DOM giả kiểm tra: startup không mở panel/toolbar, hotbar gọn, nâng cấp thật, autosave khi modal mở với đồng hồ combat đứng yên, 6 đồng đội thu gọn, drill-down 3 ô, 5 ô đồ, 8 chương, 3 rune, 7 kỹ năng, hướng dẫn 4 bước, giữ nút đánh, fixture boss/rút lui/tái đấu và gallery.
- Chưa có kiểm tra trực quan trong browser, chạm trên điện thoại hoặc đo FPS vì môi trường không có browser QA được hỗ trợ. Bản thử cần được mở trên thiết bị của người dùng trước khi duyệt phát hành.

## Dùng bản thử

Mở `dungeon-titan-fantasy-v4-playtest.html`. Không có toolbar debug trên màn chính. Vào Menu → Chế độ thử để chọn Boss tầng 10, Hỏa Long, Xem art hoặc Chơi mới. Review lưu vào khóa `dungeon_titan_v4_review_isolated`, có thể đọc bản v3 cùng origin khi chưa có v4; không ghi đè khóa v3. Production vẫn dùng GameBridge và adapter leaderboard cũ.

Bản source patch chứa toàn bộ thư mục Dungeon hiện tại cùng script/entry preview và tests, không phải toàn bộ Arcade-x. Không push main, merge hay deploy trong lượt này.
