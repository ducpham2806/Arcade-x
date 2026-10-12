# Xếp Gạch — Crystal & bố cục một tay

12/10/2026. Tham khảo UI, mặt vát pha lê và hiệu ứng xóa hàng từ ba ảnh người dùng gửi. Không dùng screenshot làm asset hoặc đưa logo/UI TikTok vào game.

## Thay đổi

- Bố cục mobile neo về phía dưới phần màn chơi, chừa vùng thở ở trên; khay/điều khiển sát vùng ngón cái hơn. Khoảng đệm cuối màn tôn trọng safe-area và chiều cao thực (dvh). Điện thoại nhỏ không bị ép bàn xuống mức phải cuộn mới dùng được khay.
- Desktop cân giữa theo chiều dọc. Bản sắc skin không thay đổi vị trí bàn: cả 5 skin dùng cùng geometry.
- Nút dưới bàn và nút tiện ích đạt tối thiểu 44px. HUD vẫn gọn, không thêm nút/text thường trực.
- Gạch kiểu pha lê: mặt trung tâm, 4 mặt vát có ánh sáng/bóng, viền nét hơn, màu sáng có chiều sâu; sao/băng rõ. Dùng CSS cục bộ, không cần tải asset ngoài.
- Viền bàn có đèn nhỏ. Xóa hàng/cột hiện dải sáng màu vàng/trắng, mảnh pha lê và tia lấp lánh; combo nổi rõ. VFX không bắt pointer, không chặn lượt tiếp theo, tự hết trong 900ms.
- Giảm chuyển động / prefers-reduced-motion tắt beam và mảnh bay. Không có camera shake hay thêm nhấp nháy toàn màn.
- Giữ nguyên 100 màn, luật, điểm, xu, booster và dữ liệu tài khoản. Không cần SQL/Edge Function mới.

## Bản chơi

Upload nội dung ARCADEX-BLOCKER-CRYSTAL-WEBSITE.zip lên hosting static HTTPS có SPA fallback về index.html; không mở file://. Đây là build toàn bộ app, giữ các nâng cấp trước đó. Chưa phát hành link công khai mới trong phiên này.

## Kiểm tra

Báo cáo cuối trong qc/. Bộ kiểm tra gồm 100 màn bằng bot hợp lệ, ba viewport 320×568 / 390×844 / 1440×900, kéo cảm ứng, pause/reload, thưởng một lần, đồng bộ mock Supabase, skin và booster tiện ích. Bài bố cục kiểm tra vùng bàn/khay/nút; không đo khả năng với ngón tay của người thật.

Ảnh gallery/ chụp renderer thật; 5 skin dùng cùng seed và thao tác hợp lệ. Production offline đã reload, vào game, đặt khối và khôi phục chính xác bàn, không lỗi JS. Chưa kiểm tra trên iOS/Android thật hay Safari, chưa benchmark FPS. Đồng bộ dùng backend mock, không xác nhận ghi lên Supabase production.

Kết quả cuối: 17/17 Playwright (0 skip/flaky), TypeScript/build đạt; 5 skin và production offline đạt. PWA precache 121 file (4.987,89 KiB). Còn cảnh báo chunk lớn có sẵn của app.
