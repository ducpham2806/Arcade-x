# QC — Xếp Gạch Color Pop v2

Bản cuối kiểm tra ngày 11/10/2026, Chromium trong cloud.

| Kiểm tra | Kết quả |
|---|---|
| TypeScript (`npm run lint`) | Đạt |
| Vite/PWA build | Đạt; 121 file cache, 4.976,48 KiB; còn cảnh báo chunk lớn của app |
| Playwright Xếp Gạch | 15/15; 0 skip, 0 flaky, 0 thất bại |
| Hồi quy Car Escape / Word Cross | 3/3 |
| 100 màn bằng bot thao tác hợp lệ | 100/100 thắng; không dùng booster, 3 giây/thao tác |
| Cảm ứng qua Chromium CDP | Đặt bằng drag có preview nâng; touch cancel không đặt khối |
| Build production offline | Đã reload offline, vào launcher/game, đặt khối và khôi phục chính xác bàn/lượt; không lỗi JS |

15 bài gồm: dữ liệu 100 màn; giao hàng/cột thu một lần, băng; điểm và invalid move; khay có seed/phù hợp bàn; bot 100 màn; thắng ở lượt cuối, undo/cứu bàn; sao/ví/migrate/settle một lần; UI ở 390×844, 320×568, 1440×900 với tap/pause/reload; kết quả/reload/launcher replay; shop/focus/clock; touch thật; hết giờ; và ví/campaign trên thiết bị mới qua backend mock Supabase.

## Giới hạn

- Bot dùng gợi ý miễn phí, không chứng minh người mới đạt cùng kết quả. Cần playtest người thật để điều chỉnh target và độ khó; 100 màn có đường hoàn thành theo seed hiện tại, không bảo đảm mọi cách đặt đều thắng.
- Mobile QA là Chromium/CDP, chưa chạy trên iPhone/Android thật hoặc Safari, chưa đo FPS/độ trễ trên máy yếu.
- Bài đồng bộ dùng Supabase mock có chủ đích, không xác nhận dữ liệu đã ghi lên production. Backend/schema save hiện có được tái sử dụng; không thay SQL và không có bước triển khai backend mới.
- Website chưa được đưa lên hosting công khai. ZIP là build sẵn toàn bộ app.
- Currency/save do client ghi; không thích hợp làm số dư trả tiền thật. Không bổ sung leaderboard xác thực trong đợt này.

## Chạy lại

Trong repository: `npm run lint`, `npm run build`, `npx playwright test tests/product/blocker-v2.spec.ts`.

Báo cáo JSON/log cuối nằm trong thư mục `qc/`; `bot.json` ghi từng màn. Ảnh `gallery/` được chụp từ thao tác thực trên game, không phải ảnh concept.
