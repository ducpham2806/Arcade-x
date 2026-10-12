# Xếp Gạch — Bàn cờ là trung tâm

Ngày 12/10/2026.

- Bỏ tiêu đề game, số xu, cửa hàng và hướng dẫn lặp lại trên màn đang chơi. Thanh launcher vẫn giữ điều khiển chung.
- HUD một hàng: điểm, tiến độ target (kèm nhãn ngắn), ngân sách thời gian/lượt hoặc combo và nút ⋯.
- Chỉ hai nút phụ thường trực dưới khay: xoay và gợi ý; có tên truy cập/tooltip, đều miễn phí. Từ ⋯ mở tiện ích để pause, mua/dùng booster, xem hướng dẫn hoặc rời lượt. Đồng hồ dừng trong tiện ích.
- Không dành dòng trống cho hướng dẫn/điểm thông báo. VFX vẫn nằm trên bàn; hướng dẫn búa và lỗi quan trọng hiện khi cần, thông báo khác hỗ trợ screen reader.
- Bàn thực tế rộng 296px ở viewport 320×568, ít nhất 350px ở 390×844 và 560px ở desktop 1440×900; khay/nút vừa trong màn.
- 5 skin CSS: Vườn bạc hà, Bãi cát nắng, Hồ pha lê, Vườn oải hương, Mây đào. Mỗi skin có màu nền, khung, ô trống và chất liệu riêng; gạch, sao, băng và preview vẫn rõ.
- Chọn skin ngẫu nhiên khi bắt đầu mỗi màn/lượt, không lặp ngay skin trước. Lưu skin cùng lượt và tài khoản, reload vẫn giữ. Bản lưu cũ thiếu skin dùng bạc hà. Random mỹ thuật tách khỏi RNG phát khối, không đổi luật/target/kinh tế.
- Không cần asset mạng, migration SQL hoặc Edge Function mới.

## Chơi / hosting

ARCADEX-BLOCKER-UI-WEBSITE.zip chứa website build sẵn với tất cả nâng cấp trước đó. Upload nội dung lên hosting static HTTPS có SPA fallback về index.html; không mở bằng file://. Chưa có link hosting công khai mới trong phiên này.

## Kiểm tra

Báo cáo cuối trong qc/. Bộ Playwright gồm gameplay, 100 màn bằng bot hợp lệ không booster, cảm ứng, khôi phục, thưởng đúng một lần, giao diện 3 viewport, đồng bộ mock Supabase, skin/no-repeat và booster từ tiện ích. Ảnh gallery/skin-* là cùng seed/lượt được render bằng 5 skin; không phải concept art. Offline được kiểm tra trên production build qua service worker.

Browser kiểm tra là Chromium, chưa phải iOS/Android thật hoặc Safari. Đồng bộ tài khoản dùng backend mock, không xác nhận ghi lên Supabase production. Không đo thêm FPS hay đổi hệ thống kinh tế.

Kết quả cuối: 17/17 Playwright, 0 skip/flaky; TypeScript/build đạt; offline và 5 skin đạt. PWA cache 121 file (4.983,18 KiB). Build còn cảnh báo chunk lớn có sẵn của app.
