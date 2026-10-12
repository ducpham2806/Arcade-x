# Word Cross v2 — QC 11/10/2026

## Đã thực hiện

- TypeScript `npm run lint`: đạt.
- Build production/PWA `npm run build`: đạt, 69 mục precache, khoảng 4,3 MiB. Còn cảnh báo kích thước bundle của ứng dụng; kho từ nằm trong module game tải khi chơi.
- `tests/product/word-cross-v2.spec.ts`: **16/16 đạt**, không skip/flaky, lần chạy cuối khoảng 1,2 phút.
- Sinh 600 bảng ở tất cả 200 màn: đủ mục tiêu, từ/đường hợp lệ, giải được, 600 bố cục khác nhau; đủ tám hướng và năm chế độ. Đây là sample theo seed, không chứng minh thống kê trên mọi seed 32-bit. Generator có bố cục dự phòng bảo đảm đủ mục tiêu.
- Kiểm thử tránh từ gần đây, seed ngày cố định, chọn đảo ngược, không ghi lại từ đã tìm, lỗi đường chọn, precision/sequence và tính sao.
- Save kiểm lại replay, từ chối sửa grid/lỗi, giữ tiến trình cũ, tương thích thứ tự key JSON từ SQL.
- 1440×900, 390×844, 320×568: chơi thắng, sao, mở khóa, bảng mới thay seed/từ/grid, reload giữ đúng ván và màn hình không tràn ngang.
- Hủy pointer không ghi lượt; kéo/tap hai đầu ghi đúng từ; hint miễn phí, giới hạn sao; pause dừng đồng hồ, resume chơi tiếp.
- Thua do lỗi/time limit; luyện cùng bảng không sao. Đề ngày không ghi sao chiến dịch và chơi lại giữ đề UTC.
- UI tài khoản nhận bảng máy chủ, gửi đúng replay một lần với expected owner; test UI dùng mock Supabase.
- Kết thúc phiên/chơi lại giữ sao; bảng toàn cầu offline báo không có kết nối; modal mobile phủ toàn màn hình.
- Bộ chọn game chung mở Word Cross khi chưa có save; chuyển Word Cross ↔ Car Escape rồi đóng bằng Escape.
- Hai bài hồi quy Car Escape về kết thúc phiên và bảng xếp hạng chung: **2/2 đạt**. Smoke kéo từ trong `tests/qc/gameplay.spec.ts` cũng đã đạt ở lần kiểm tra tích hợp trước khi sửa bộ chọn bảng chung.
- PostgreSQL 16 cô lập, toàn bộ migration và các bài platform/identity/launcher/Car/Word Cross: **115 kiểm tra đạt**. Trong đó so sánh chính xác JSON của **33 bảng client/SQL** tại mốc kích thước, seed 0/1/uint32 max; kiểm owner, RLS, cấm sửa điểm, malformed/incomplete replay, precision, thời gian thực, nhóm hint, tổng sao, idempotence, tránh từ gần đây và seed ngày.
- Chromium CDP touch thật ở 390×844: thả chạm tìm đúng một từ, touchCancel không ghi thêm lượt; một replay, không lỗi.
- Bản production mất mạng: tải lại bằng service worker, sinh và giải màn 200 (12×12, 12 từ) với kho mở rộng, hint offline, một sao, reload giữ kết quả; không lỗi JavaScript.
- Đã xem ảnh bàn nhỏ trên điện thoại và bàn nâng cao 12×12. Ảnh/test màn 200 dùng mở khóa demo trong browser riêng, không tác động tài khoản thật.

## Lỗi phát hiện và đã sửa

- Cùng seed và cùng tham số cỡ bảng có thể lặp giữa các màn: trộn số màn vào seed ở cả client và SQL.
- So sánh save theo thứ tự key JSON có thể mất ván sau cloud restore: dùng so sánh chuẩn hóa key và kiểm lại replay.
- Chơi lại từ tổng kết mở lại ván thắng: thêm Word Cross vào luồng reset session của wrapper, giữ tiến trình.
- Bảng thành tích riêng che bộ chọn game chung: giữ bộ chọn trong cả Word Cross và Car Escape; tránh crash khi chưa có Word Cross save.
- Một selector resume cũ trong test đã được cập nhật theo nút pause hiện có; test chờ countdown xong trước khi tiếp tục thao tác.

## Giới hạn bằng chứng

Không tuyên bố đã chạy lại toàn bộ suite mọi game. PostgreSQL kiểm thử là database cô lập, không phải Supabase production. Chưa playtest với người thật hoặc điện thoại vật lý; touch test dùng Chromium. Chưa xác minh RPC trên dự án Supabase thật hoặc phát hành hosting.
