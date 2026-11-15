# Ô Ăn Quan · Nắng sân đình · art/UI v1

15/11/2026 · user ưu tiên asset và UI. Pixel Việt Nam theo GDD; bố cục top-down, nắng ấm từ góc trên trái, gạch tàu đỏ nâu, tre/lá đa xanh, phấn ngà và điểm nhấn vàng lúa. Tránh emoji làm asset, chữ trong ảnh, pseudo-3D bóng bẩy hoặc texture nhiễu che quân.

## Bộ nhỏ đầu tiên

ImageGen: bốn master: scene sân đình, prop family tham chiếu cảnh, atlas tay/mẹt3 bộ và atlas bốn mặt bàn. Scene dùng cho hero/sân, không chứa text hay bảng UI. Prop sheet alpha: năm cặp quân Dân/Quan (sỏi, hạt me/ốc, bi ve, xu/thỏi vàng, ngọc/ấn), mẹt tre và bàn tay; clip rect được kiểm trực quan, không tin grid sinh tự động. Bộ đầu import đủ12 skin OAQ; không tự coi toàn bộ29 skin hoặc Lò Cò đã xong.

Source giữ nguyên PNG; runtime đóng gói WebP lossless, đúng từng pixelRGBA, filtering nearest. Hình mang phong cách pixel full-color; khóa palette32 màu vẫn là gate FD-4 sau. Text/số quân/đường chọn/nút dùng Canvas/DOM riêng. Manifest ghi dimensions thực, hash, nguồn ImageGen, vị trí cắt/pivot và status sau kỹ thuật/Look Rule. Vẽ số trên nền ổn định, không sửa luật/điểm bằng art. Asset fallback phải vẫn chơi được.

## UI

Home có minh họa và CTA bot/local; online Sắp có trong khu riêng. Bàn đấu hiển thị P1/P2 cố định, điểm/lượt đúng bên; tâm bàn tối đa theo khung, khoảng trống cân đối. Shop/hướng dẫn cùng màu vật liệu, khung mobile đầy phần game/desktop92vh có cap. Cỡ nút56px, focus rõ, keyboard và touch không xung đột. Pause/overlay chặn input và bot; giảm chuyển động phải được tôn trọng.

## QA

Report kích thước/mode/alpha/budget, contact sheet/native display; kiểm scene và prop ở desktop1440×900, mobile390×844/320×568 và ngang844×390. Screenshot stamp theo hash file; test focus/overlay/pause/local/bot/shop và fallback không có ảnh. Không dùng viewport giả làm điện thoại thật hoặc người mới chơi.
