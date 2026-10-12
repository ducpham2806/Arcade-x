# Báo cáo QC ArcadeX

Ngày kiểm tra: 09/10/2026. Kiểm tra trên mã hiện tại trong workspace, gồm chuyển Supabase và đăng ký/đăng nhập/chơi khách. Chưa phát hành lên production.

## Kết luận

**Chưa nên phát hành rộng rãi.** Các màn hình chính mở được, nhưng đã tái hiện lỗi treo trò chơi, mất ván chơi và nhận thưởng lặp. Build thành công không đồng nghĩa toàn bộ ứng dụng đạt QC.

## Phạm vi và cách kiểm tra

- Chromium headless thật; máy tính 1440×900, điện thoại giả lập 390×844; kiểm tra bổ sung máy tính 1280×720.
- 18 trò chơi: mở màn hình, mở tạm dừng trên cả hai kích thước; thao tác chơi đại diện của từng trò. Không chơi hết mọi màn, mọi độ khó hoặc mọi nhánh kết thúc.
- 17 cửa sổ chức năng trên cả hai kích thước: nội dung xuất hiện, không có lỗi JavaScript bắt được, không tràn ngang toàn trang; lưu ảnh. Các kiểm tra này không bảo đảm mọi nút hoặc mọi yêu cầu bố cục đều đạt.
- Tài khoản: API Supabase mô phỏng, SDK thật. Không gửi email hay tạo tài khoản thật. Kiểm tra đăng ký, email xác nhận, sai mật khẩu, chơi khách, tách tài khoản, khôi phục trình duyệt mới, đăng xuất offline và hủy tải muộn.
- SQL: migration thật chạy trên PostgreSQL 16 dùng cơ sở dữ liệu dùng một lần và mô phỏng `auth.uid`. Kiểm tra quyền truy cập bằng SQL; không coi đây là kiểm chứng đầy đủ của Supabase Auth hoặc Realtime thật.
- PWA: bản build production, Service Worker thật, mất mạng và tải lại ứng dụng rồi chơi 2048.
- Dùng hook React để đọc trạng thái/đáp án trong một số ca chơi tự động; thao tác đặt ô, kéo thả và chọn số vẫn đi qua giao diện. Không đánh giá độ khó bằng việc đọc đáp án.

## Kết quả

| Nhóm | Kết quả |
|---|---|
| TypeScript và build production | Đạt; build có cảnh báo bundle lớn |
| 18 trò × 2 kích thước: mở và tạm dừng | 36/36 đạt |
| 17 điểm mở cửa sổ × 2 kích thước | 34/34 đạt trong phạm vi assertion đã nêu |
| Luồng tài khoản | 6/6 đạt với API mô phỏng |
| Ca chơi thực tế và tiện ích thông thường | 20/20 đạt |
| Ca hồi quy lỗi đã biết | 8/8 tái hiện lỗi, **không phải 8 chức năng đạt** |
| SQL/RLS/RPC trên PostgreSQL thử nghiệm | 26/26 đạt |
| PWA production tải lại offline và chơi 2048 | Đạt; không có pageerror bắt được |
| Shikaku hoàn tất bàn chơi | Không đạt: trang không phản hồi |

Tổng hợp **104 ca Playwright khác nhau: 96 đạt, 8 xác nhận lỗi đã biết; không có ca bỏ qua**. Dùng kết quả mới nhất cho từng ca, từ các lượt chạy lưu riêng. Không phải toàn bộ số liệu này đến từ một lượt chạy duy nhất.

Lượt đầu có một ca tài khoản lỗi do Chromium gặp `ERR_NETWORK_CHANGED` khi môi trường mạng thay đổi; chạy lại riêng ca đó đạt. Lượt chức năng có ca kéo từ Word Cross dùng tọa độ ước lượng sai; sửa bộ kiểm thử sang tâm ô DOM và chạy lại đạt. Các kết quả ban đầu vẫn được giữ, không xóa dấu vết thất bại. Những lỗi assertion/chọn hành động trong quá trình xây dựng harness cũng được điều tra và sửa trước khi tổng hợp kết quả.

Mẫu Sudoku cố định 20 bàn mỗi cấu hình: 4×4 easy có 3 bàn nhiều nghiệm, 4×4 medium có 7, 9×9 medium có 19, 9×9 expert có 20. Bộ giải đếm dừng khi tìm được hai nghiệm.

## Lỗi đã tái hiện

| ID | Mức độ | Hành vi và cách tái hiện | Ảnh hưởng |
|---|---|---|---|
| QC-001 | Nghiêm trọng | Shikaku → Zen Mode → hoàn tất tất cả vùng đúng. Sau vùng cuối, trang mất phản hồi. Effect chiến thắng cập nhật score trong khi lại phụ thuộc score/bridge. | Treo ứng dụng; nhánh nhận thưởng bị gọi lặp. |
| QC-002 | Cao | 2048 → chơi vài lượt → Tạm dừng → Lưu và thoát → Tiếp tục. Bàn cờ/điểm không khôi phục đúng. | Mất ván đã lưu. |
| QC-003 | Cao | Trong ván 2048 đang chơi, cập nhật xu qua PlayerContext. Bàn cờ bị khởi tạo lại. | Thay đổi hồ sơ có thể phá ván đang chơi. |
| QC-004 | Cao | Mở trung tâm thưởng → nhận tất cả → tải lại. Nhiệm vụ bạn bè đã nhận lại trở về completed. | Có thể nhận thưởng lặp, làm sai kinh tế game. |
| QC-005 | Trung bình | Draw a Shape → Thời Gian → Tạm dừng → chờ hơn 3 giây. Đồng hồ vẫn giảm. | Người chơi bị mất thời gian khi đang tạm dừng. |
| QC-006 | Cao | Bàn Cờ Tướng có xe đỏ đang chắn xe đen chiếu tướng đỏ. Bộ lọc vẫn cho xe đỏ đi khỏi vị trí chắn. | Chấp nhận nước đi khiến tướng của mình bị chiếu. |
| QC-007 | Trung bình | Sinh Sudoku với bộ random cố định, kiểm tra bằng bộ giải đếm tối đa hai nghiệm. Có nhiều bàn có hơn một nghiệm; UI chấm theo solutionValue duy nhất. | Người chơi có thể bị coi sai dù phương án khác hợp lệ. |
| QC-008 | Trung bình | Máy tính 1280×720: mở Cosmic Defense hoặc Neon Runner. Nút chat toàn cầu nằm trên nút EMP/Nhảy và chặn click. | Điều khiển bằng chuột bị che. |
| QC-009 | Cao | Mở một rương thường rồi tải lại ngay khi bản cloud cũ còn nhiều rương hơn. Merge dùng Math.max phục hồi số rương đã tiêu. | Trạng thái kho không nhất quán, có thể mở rương lặp. |

QC-002 đến QC-009 có ca hồi quy trong bộ kiểm thử; `test.fail` chỉ đánh dấu ngay trước assertion xác minh lỗi, sau các bước chuẩn bị. Đây là lỗi còn tồn tại, không phải đã sửa. QC-001 dùng chương trình tái hiện riêng có thời hạn vì treo trang có thể làm hỏng lượt chạy chung.

## Kiểm tra giới hạn và phần chưa xác minh

- Kết nối Supabase thật từ môi trường này không truy cập được; kiểm tra đọc Auth settings thất bại. Chưa xác minh schema/RLS đang triển khai trên dự án của bạn, email thật, redirect xác nhận hoặc WebSocket Realtime thật.
- Chưa xác minh trận PvP đầy đủ giữa hai thiết bị trên dịch vụ thật, reconnect lâu dài, tải lớn, chống gian lận hoặc thanh toán.
- Chưa chạy Safari/iPhone thật, Firefox, cài PWA trên thiết bị thật, push notification hoặc đo FPS/pin trên máy yếu.
- Các ảnh mobile cho thấy một số cửa sổ cũ vẫn có khung thu nhỏ và thanh điều hướng phía dưới; chưa đạt kết luận đồng nhất full screen theo AGENTS.md. Form tài khoản mới dùng toàn màn hình.
- Bundle JavaScript khoảng 3,19 MB trước gzip, 840 KB sau gzip; CSS khoảng 607 KB. Vite cảnh báo chunk lớn. Cần đo thực tế và chia tải theo trò chơi trước khi khẳng định hiệu năng tốt.
- Popup onboarding/PWA được tắt trong phần lớn ca tự động để thao tác ổn định; các tổ hợp popup này cần kiểm tra riêng.
- Các mức đếm nghiệm Sudoku là mẫu xác định để tái hiện, không phải tỉ lệ lỗi của toàn bộ bộ sinh màn.

## Ưu tiên xử lý

1. Sửa treo Shikaku và các lỗi mất/lặp dữ liệu, chạy lại ca hồi quy tương ứng.
2. Sửa luật Cờ Tướng, tính duy nhất Sudoku, tạm dừng và nút chat che điều khiển.
3. Kiểm thử lại Supabase thật trên môi trường có kết nối, sau đó thử thiết bị thật và hiệu năng.

## Chạy lại

```bash
npm run lint
npm run build
npm run test:auth
npm run test:qc
npm run test:supabase
```

`test:qc` xuất JSON trong `test-results/qc-results.json`, báo cáo HTML trong `playwright-report/`, screenshot/trace và tệp đính kèm của các ca lỗi. Những ca expected failure xác nhận lỗi đã biết; không diễn giải exit code 0 là ứng dụng sẵn sàng phát hành.

Nếu chưa có Chromium: `npx playwright install chromium`, hoặc đặt `CHROMIUM_EXECUTABLE` trỏ tới Chromium có sẵn. Kiểm tra SQL cần Docker và image PostgreSQL 16. Để tái hiện PWA, cần chạy bản preview production; có hướng dẫn riêng trong tests/qc/README.md.

## Ma trận thao tác chơi đại diện

Tất cả 18 trò đều có thêm lượt mở/tạm dừng trên máy tính và điện thoại. Bảng này mô tả ca thao tác, không xác nhận toàn bộ nội dung của trò.

| Trò chơi | Thao tác đã kiểm tra | Kết quả/giới hạn |
|---|---|---|
| Word Cross | Kéo qua các ô của một từ | Từ được đánh dấu đã tìm |
| Car Escape | Kéo một xe theo nước đi hợp lệ | Số lượt đi tăng |
| Dungeon Tap | Tấn công quái nhiều lần | Trạng thái chiến đấu thay đổi |
| Mummy Escape | Di chuyển xuống hai lượt | Vị trí người chơi đổi |
| Shikaku | Vẽ vùng hợp lệ; hoàn tất bàn Zen riêng | Vùng hợp lệ đạt; hoàn tất bàn gây treo |
| Eat Em All | Bắt đầu và đổi nguyên tố | Nguyên tố đổi; chưa chơi hết màn |
| Scoodoku | Điền các ô còn trống màn đầu | Đạt màn chiến thắng |
| Fill the Space | Đặt tất cả khối đúng | Đạt màn chiến thắng |
| Draw a Shape | Vẽ toàn bộ đường; tạm dừng chế độ giờ | Thắng đạt; đồng hồ tạm dừng lỗi |
| Blocker | Kéo một khối lên bàn | Có điểm |
| Chess | e2→e4, chờ bot đáp lại | Bot đáp lại, lượt quay về người chơi |
| Xiangqi | Đi tốt đỏ; fixture quân bị ghim | Di chuyển đạt; luật tự chiếu lỗi |
| Caro Gomoku | Đặt X đầu tiên | X xuất hiện trên bàn |
| Neon Runner | Điều khiển nhảy trên màn hình hẹp | Mô phỏng chạy; nút máy tính bị chat che |
| Cosmic Defense | Dùng EMP trên màn hình hẹp | Tiêu đúng một EMP; máy tính bị chat che |
| Cyber Slice | Quét chuột qua đợt trái cây | Có điểm chém |
| Hex Match | Chọn nhóm ≥3 kẹo cùng màu | Có điểm |
| 2048 | Di chuyển bàn bằng phím; lưu/tiếp tục | Có điểm; lưu và thay đổi hồ sơ gây lỗi |

## Bằng chứng

Ảnh 70 ca giao diện nằm trong `test-results/`; JSON của các lượt và bằng chứng lỗi được đóng gói cùng báo cáo tại `/workspace/arcadex-qc/ARCADEX-QC.zip`. `summary.json` tổng hợp kết quả mới nhất, còn các JSON nguồn giữ kết quả ban đầu. Khi chạy lại, thư mục artifact mặc định có thể được thay thế; dùng biến QC_REPORT_PATH/QC_HTML_PATH và --output để lưu lượt riêng.
