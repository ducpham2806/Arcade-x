# Kết quả sửa lỗi ArcadeX

Ngày: 09/10/2026. Phạm vi: 9 lỗi QC-001 đến QC-009 từ báo cáo trước. Bản sửa đang ở workspace; chưa phát hành lên production.

## Những thay đổi đã thực hiện

| ID | Bản sửa | Cách xác minh |
|---|---|---|
| QC-001 | Shikaku đánh dấu bàn đã nhận thưởng trước khi cập nhật điểm; hủy timer khi rời trò hoặc mở bàn khác. | Giải hoàn chỉnh bàn Zen, điểm chỉ tăng một lần, sang bàn mới và không tiếp tục nhận thưởng lặp. |
| QC-002 | 2048 lưu bàn cờ, chế độ, điểm, lượt đi, thời gian, lịch sử undo, số lượt hỗ trợ và mốc thưởng. Phiên tạm dừng mang theo snapshot để khôi phục. | Lưu/thoát, tải lại toàn ứng dụng, tiếp tục và so sánh bàn/điểm; thử thêm 5×5 và rush. |
| QC-003 | Giữ đối tượng GameBridge ổn định trong phiên, đồng thời lấy callback và skin hiện tại qua ref. | Cộng xu khi đang chơi không reset bàn 2048. |
| QC-004 | Nhiệm vụ bạn bè mới bắt đầu ở trạng thái chưa hoàn thành, cập nhật từ tiến trình chơi; lưu trạng thái và chặn nhận lặp trước khi cấp thưởng. | Hoàn thành nhiệm vụ, nhận hai lần liên tiếp, tải lại và nhận lại; trạng thái claimed được giữ. |
| QC-005 | Draw a Shape kiểm tra isPaused trong cả đồng hồ đếm ngược và đếm thời gian; chặn thao tác vẽ khi tạm dừng. | Dừng hơn ba giây và kiểm tra đồng hồ không giảm. |
| QC-006 | Tách nước đi giả lập khỏi nước đi hợp lệ, kiểm tra tướng bị đe dọa sau từng nước; trận kết thúc khi đối phương không còn nước hợp lệ. | Kiểm tra xe ghim, pháo, chân mã, nước tướng vào vùng bị tấn công và tốt qua sông. |
| QC-007 | Chỉ bỏ ô gợi ý khi bàn còn đúng một nghiệm; giữ thêm gợi ý nếu cần. Chấp nhận lời giải hợp lệ khác từ bàn cũ, kiểm tra thắng bằng luật hàng/cột/khối. | Bộ giải độc lập kiểm tra các mẫu nhiều kích thước, bậc thang và đa ma trận; fixture lời giải khác của bàn cũ. |
| QC-008 | Nút mở chat cố định chỉ xuất hiện ở launcher; chat vẫn có thể mở từ các lối truy cập sẵn có. | Kiểm tra nút EMP không bị che tại 1280×720; các điều khiển trò chơi vẫn hoạt động. |
| QC-009 | Đồng bộ kho dùng revision của snapshot, thay thế số lượng kể cả về 0, bỏ bản cũ và chặn upload cũ bằng transaction; lưu thay đổi local trước khi nhận cloud. | Mở rương rồi tải lại ngay; cloud cạn kho, cloud cũ gửi lại, upload cũ và reload kho rỗng. |

Không cần chạy thêm migration SQL cho các sửa lỗi này. Revision kho và dữ liệu nhiệm vụ dùng các trường JSON đã được hỗ trợ.

## Kết quả xác minh

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


## Giới hạn còn lại

- API Supabase được mô phỏng trong browser; SQL chạy migration thật trên PostgreSQL thử nghiệm. Chưa xác minh trên dự án Supabase thật do môi trường chưa kết nối được.
- Chưa kiểm tra mọi màn/độ khó, trình duyệt Safari/Firefox hoặc điện thoại thật; không coi bộ QC này là bảo đảm toàn bộ phần mềm không còn lỗi.
- Kho dùng snapshot mới nhất theo revision. Hai thiết bị thao tác đồng thời chưa có cơ chế hợp nhất từng giao dịch vật phẩm; cần kiểm tra xung đột trên dịch vụ thật trước khi sử dụng như hệ thống kinh tế cạnh tranh.
- Bundle vẫn lớn; tối ưu tải và chuẩn hóa các cửa sổ mobile cũ chưa thuộc chín sửa lỗi này.
- Bản lưu 2048 cũ từng thiếu bàn cờ không thể tái tạo các ô đã mất; bản lưu mới giữ đầy đủ trạng thái.

## Chạy lại

```bash
npm run lint
npm run build
npm run test:qc
npm run test:supabase
```

Tất cả ca QC-001 đến QC-009 hiện là kiểm thử phải đạt, không còn `test.fail` hoặc skip. Hướng dẫn PWA và kiểm tra Shikaku riêng nằm trong `tests/qc/README.md`.
