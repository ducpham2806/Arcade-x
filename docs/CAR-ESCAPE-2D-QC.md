# Car Escape 2D — QC 11/10/2026

Bản hiện tại dùng TopDownBoard và asset xe đồ chơi SVG tự thiết kế. Giữ campaign/save version 2 và bộ 100 màn.

## Kết quả đã chạy

- TypeScript: `npm run lint` — đạt.
- Build production/PWA: `npm run build` — đạt, 70 mục precache. Còn cảnh báo bundle lớn chung của ứng dụng.
- Playwright: `tests/product/car-escape-v2.spec.ts` và `tests/product/car-escape.spec.ts` — **18/18 đạt**, không skip, lần chạy cuối 2,1 phút.
- 100 màn: board hợp lệ, độc nhất, giải được; số lượt tối ưu khớp bank và ≥5.
- UI 1440, 390, 320 px: giải màn, sao, mở khóa và giữ save qua reload.
- Kéo 2D ngang/dọc; thả ghi đúng một lượt; pointercancel trả board và undo về cũ; pause dừng timer.
- Hint worker, turn limit, timeout/luyện tập, endless, ticket trả chậm và submit một lần, kết thúc phiên/chơi lại giữ sao, bảng xếp hạng mở trước khi tải game.
- Cảm ứng thật qua Chromium CDP touch events ở 390×844: touchEnd ghi đúng một lượt; touchCancel không ghi thêm lượt.
- Offline trên bản production: tải lại qua service worker, chơi và dùng hint, thắng với một sao; không có lỗi JavaScript.
- PostgreSQL 16 trong container cô lập: **91 kiểm tra đạt**, áp dụng toàn bộ migration kể cả metadata 2D. Không dùng database production.
- Xem thủ công ảnh màn 1 trên điện thoại 390 px và 320 px; màn 100 trên điện thoại 390 px. Ảnh màn 100 dùng mở khóa demo trong trình duyệt riêng.

Lần chạy đầu phát hiện lớp artwork không nhận pointer hit; đã thêm hit area riêng bên dưới xe rồi chạy lại cả bộ 18 bài. Kết quả lần chạy cuối ở trên thuộc mã đã sửa.

## Phạm vi

Đây là QC thay đổi Car Escape, không tuyên bố chạy lại toàn bộ game của launcher. API xếp hạng UI dùng mock; RPC thực được kiểm tra trên PostgreSQL cô lập. Chưa xác minh trên Supabase production hoặc thiết bị điện thoại vật lý. Chưa xuất bản frontend lên hosting.

Mô tả launcher trên database: nếu đã cài Car Escape v2, chỉ áp dụng `supabase/migrations/202610110005_car_escape_2d_metadata.sql`. Nếu chưa cài v2, bundle `supabase/car-escape-upgrade.sql` đã kèm metadata 2D.
