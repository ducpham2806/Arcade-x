# Xếp Gạch — Bàn cờ luôn ở giữa

12/10/2026.

- Căn giữa chính grid board theo tâm vùng chơi bên dưới thanh launcher; không căn cả cụm HUD/bàn/khay. Hai vùng trên và dưới bàn có phần không gian cân nhau, nên thay đổi chiều cao màn hình không kéo lệch tâm bàn.
- HUD gọn phía trên, khay và 5 nút phía dưới: xoay, gợi ý, búa, đổi khay, hoàn tác. Booster có số lượng còn lại, dùng trực tiếp; hết stock mở shop.
- Menu ⋯ giữ pause, cửa hàng, hướng dẫn và rời lượt; bỏ nhóm booster trùng trong menu.
- Trên màn ngang thấp, HUD và khay/nút chuyển sang hai bên, bàn vẫn ở giữa và không thu thành một ô quá nhỏ. Màn dọc thấp giảm kích thước bàn để khay/nút vẫn vừa màn.
- Thông báo hết chỗ nằm trên bàn, không che các nút hỗ trợ; chọn búa thì ẩn thông báo để có thể nhắm mọi ô.
- Giữ 5 skin ngẫu nhiên, pha lê/đèn viền/VFX, 100 màn, ví và bản lưu. Không cần SQL/Edge Function mới.

## Kiểm tra

20/20 Playwright, không skip/flaky. Kiểm tra tâm ngang/dọc lệch <2px so với vùng chơi trên 320×568, 390×844, 390×1000, 1440×900 và 844×390; các nút vẫn vừa màn. Có kiểm tra kéo cảm ứng, save/reload, thưởng một lần, bot thắng 100 màn, mock đồng bộ tài khoản, skin, booster trực tiếp và dùng búa khi bàn bị chặn.

TypeScript/build đạt; production offline reload/vào game/đặt khối/khôi phục chính xác bàn đạt, không lỗi JS. Ảnh gallery/ chụp renderer thật; 5 skin dùng cùng seed và thao tác. Browser là Chromium, chưa xác nhận trên thiết bị thật/Safari hay đo FPS. Supabase dùng mock trong test đồng bộ, không xác nhận ghi production. Build còn cảnh báo chunk lớn có sẵn.

## Bản chơi

Upload nội dung ARCADEX-BLOCKER-CENTER-WEBSITE.zip lên hosting static HTTPS có SPA fallback về index.html. Đây là build toàn bộ app và giữ các nâng cấp trước. Không mở file://; chưa có link hosting công khai mới trong phiên này.
