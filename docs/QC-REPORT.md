# Báo cáo QC ArcadeX sau sửa lỗi

> Cập nhật 11/10/2026: màn hình tài khoản riêng, tên duy nhất và splash/cập nhật PWA đã được kiểm tra. 111 ca browser duy nhất đã được xác nhận đạt qua lượt đầy đủ và hồi quy; 41 kiểm tra PostgreSQL đạt. Xem [AUTH-ENTRY-AND-UPDATES.md](AUTH-ENTRY-AND-UPDATES.md) cho phạm vi, các lượt chạy và SQL cần bổ sung.

Ngày: 09/10/2026. Mã trong workspace, chưa phát hành lên production.

> Cập nhật 10/10/2026: lượt QC sau nâng cấp đồ họa đạt **119/119**. Xem [GRAPHICS-UPGRADE.md](GRAPHICS-UPGRADE.md) cho phạm vi và kết quả mới; nội dung dưới đây giữ kết quả đợt sửa lỗi trước.

> Cập nhật launcher 10/10/2026: đã rút gọn hồ sơ và bỏ giao diện nhập vai. Xem [LAUNCHER-SIMPLIFICATION.md](LAUNCHER-SIMPLIFICATION.md) cho kết quả 103 ca được xác minh qua lượt đầy đủ và lượt chạy lại sau sửa.

## Kết luận

Đã sửa chín lỗi QC-001 đến QC-009 đã tái hiện trong lượt trước. Chi tiết thay đổi và ca hồi quy nằm trong [QC-FIXES.md](QC-FIXES.md). Báo cáo trước khi sửa được giữ trong [QC-BASELINE.md](QC-BASELINE.md).

## Phạm vi và cách kiểm tra

- Chromium headless thật; máy tính 1440×900, điện thoại giả lập 390×844; kiểm tra bổ sung máy tính 1280×720.
- 18 trò chơi: mở màn hình, mở tạm dừng trên cả hai kích thước; thao tác chơi đại diện của từng trò. Không chơi hết mọi màn, mọi độ khó hoặc mọi nhánh kết thúc.
- 17 cửa sổ chức năng trên cả hai kích thước: nội dung xuất hiện, không có lỗi JavaScript bắt được, không tràn ngang toàn trang; lưu ảnh. Các kiểm tra này không bảo đảm mọi nút hoặc mọi yêu cầu bố cục đều đạt.
- Tài khoản: API Supabase mô phỏng, SDK thật. Không gửi email hay tạo tài khoản thật. Kiểm tra đăng ký, email xác nhận, sai mật khẩu, chơi khách, tách tài khoản, khôi phục trình duyệt mới, đăng xuất offline và hủy tải muộn.
- SQL: migration thật chạy trên PostgreSQL 16 dùng cơ sở dữ liệu dùng một lần và mô phỏng `auth.uid`. Kiểm tra quyền truy cập bằng SQL; không coi đây là kiểm chứng đầy đủ của Supabase Auth hoặc Realtime thật.
- PWA: bản build production, Service Worker thật, mất mạng và tải lại ứng dụng rồi chơi 2048.
- Dùng hook React để đọc trạng thái/đáp án trong một số ca chơi tự động; thao tác đặt ô, kéo thả và chọn số vẫn đi qua giao diện. Không đánh giá độ khó bằng việc đọc đáp án.

## Kết quả mới nhất

| Nhóm | Kết quả |
|---|---|
| Lượt Playwright đầy đủ | **112/112 đạt**, 0 bỏ qua, 0 thất bại, 0 flaky; một lượt liên tục khoảng 11 phút |
| Tài khoản, SDK thật với API mô phỏng | 6/6 đạt |
| 18 trò × 2 kích thước: mở và tạm dừng | 36/36 đạt |
| 17 cửa sổ × 2 kích thước | 34/34 đạt trong phạm vi assertion |
| Chơi game, tiện ích và hồi quy còn lại | 36/36 đạt, bao gồm QC-001 đến QC-009 |
| Bộ giải Sudoku độc lập | 140 bàn thuộc 7 cấu hình có đúng một nghiệm |
| SQL/RLS/RPC trên PostgreSQL thử nghiệm | 26/26 đạt |
| TypeScript và build production | Đạt; còn cảnh báo bundle lớn |
| PWA production | Service Worker hoạt động; tải lại offline và chơi 2048 được; không có pageerror |
| Shikaku probe riêng | Hoàn tất bàn, trang phản hồi, điểm đúng 1 |

Các con số Playwright trên đến từ **một lượt chạy đầy đủ sau sửa lỗi**, không ghép các lượt chạy lại. Lượt 9 ca hồi quy trọng tâm trước đó cũng đạt 9/9.


## Kiểm tra giới hạn và phần chưa xác minh

- Kết nối Supabase thật từ môi trường này không truy cập được; kiểm tra đọc Auth settings thất bại. Chưa xác minh schema/RLS đang triển khai trên dự án của bạn, email thật, redirect xác nhận hoặc WebSocket Realtime thật.
- Chưa xác minh trận PvP đầy đủ giữa hai thiết bị trên dịch vụ thật, reconnect lâu dài, tải lớn, chống gian lận hoặc thanh toán.
- Chưa chạy Safari/iPhone thật, Firefox, cài PWA trên thiết bị thật, push notification hoặc đo FPS/pin trên máy yếu.
- Các ảnh mobile cho thấy một số cửa sổ cũ vẫn có khung thu nhỏ và thanh điều hướng phía dưới; chưa đạt kết luận đồng nhất full screen theo AGENTS.md. Form tài khoản mới dùng toàn màn hình.
- Bundle JavaScript khoảng 3,19 MB trước gzip, 842 KB sau gzip; CSS khoảng 607 KB. Vite cảnh báo chunk lớn. Cần đo thực tế và chia tải theo trò chơi trước khi khẳng định hiệu năng tốt.
- Popup onboarding/PWA được tắt trong phần lớn ca tự động để thao tác ổn định; các tổ hợp popup này cần kiểm tra riêng.
- Các mức đếm nghiệm Sudoku là mẫu xác định để tái hiện, không phải tỉ lệ lỗi của toàn bộ bộ sinh màn.

## Chạy lại và bằng chứng

```bash
npm run lint
npm run build
npm run test:qc
npm run test:supabase
```

Hướng dẫn chạy kiểm tra PWA và Shikaku riêng nằm trong [README kiểm thử](../tests/qc/README.md). Các ca QC-001 đến QC-009 hiện phải đạt bình thường; không có expected failure hoặc ca bỏ qua.

JSON của lượt đầy đủ: `/workspace/arcadex-qc/fix-full-results.json`; HTML: `/workspace/arcadex-qc/fix-full-report/index.html`. Bằng chứng được đóng gói tại `/workspace/arcadex-qc/ARCADEX-QC-AFTER-FIX.zip`; gói QC cũ vẫn giữ riêng làm mốc trước khi sửa.
