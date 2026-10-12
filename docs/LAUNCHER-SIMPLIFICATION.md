# Launcher tập trung vào chơi game

Ngày 10/10/2026. Thay đổi trong workspace, chưa phát hành production.

## Thiết kế

Thư viện game là nội dung chính. Header chỉ có thương hiệu, tài khoản, cài đặt và cài ứng dụng; điện thoại dùng ba mục Game / Yêu thích / Tài khoản. Game nổi bật vẫn giữ minh họa arcade nhưng gọn hơn. Bỏ sidebar xếp hạng tuần và các quảng bá phần thưởng. Bộ lọc có chữ, tìm kiếm và nút chơi ở ngay thư viện.

Định hướng tham khảo các mô hình quen thuộc:

- Steam: [Steam](https://store.steampowered.com/) — ưu tiên thư viện, tìm game, game gần đây và nút Play; thông tin tài khoản là chức năng phụ.
- Epic Games: [Epic Games Store](https://store.epicgames.com/) — game được trình bày bằng bìa, thư viện và thao tác chơi; không cần tăng cấp nhân vật launcher.
- itch.io: [itch app](https://itch.io/app) — chọn game, khởi chạy và quản lý tài khoản/tùy chọn trong luồng riêng.

Đây là các nguyên tắc tổ chức áp dụng cho ArcadeX, không phải bản sao giao diện. Các URL trên đã thử truy cập nhưng proxy môi trường trả 403, nên không xác minh trực tiếp giao diện mới nhất của các sản phẩm đó trong lượt này.

## Bỏ khỏi trải nghiệm launcher

- Cấp độ tài khoản, XP/EXP, thanh tiến cấp và màn hình lên cấp.
- Số dư xu/ngọc ở header, kho đồ, rương, lò rèn, cửa hàng và danh hiệu.
- Điểm danh, chuỗi đăng nhập, lịch tháng, vòng quay, nhiệm vụ ngày/tuần/bạn bè, mốc thưởng, hội danh nhân.
- Tự bật cửa sổ phúc lợi, tour giới thiệu các chức năng nhập vai, popup/thông báo thưởng và quảng bá phần thưởng.
- Hồ sơ nhiều tab, biểu đồ giả lập, thống kê xếp hạng toàn tài khoản, chế độ casual/hardcore và thẻ hồ sơ công khai.
- Nút dẫn tới các phần đã bỏ trong menu tạm dừng/Dungeon; các sự kiện hoặc liên kết thông báo cũ không mở lại chúng hoặc khóa cuộn trang.

Bảng điểm trong menu game được rút gọn còn tên người chơi và điểm theo trò chơi, không lọc EXP/danh hiệu hoặc cấp bậc nhân vật. Chi tiết game chỉ còn giới thiệu, cách chơi, điều khiển, kỷ lục cá nhân, yêu thích và nút chơi.

## Giữ lại

18 game và đồ họa đã nâng cấp; đăng ký, đăng nhập, chơi khách; tên và ảnh đại diện; email/trạng thái tài khoản; đăng xuất; cài đặt âm thanh/điều khiển; yêu thích; game gần đây có lịch sử thật; kỷ lục từng game; lưu/tiếp tục ván; đồng bộ tài khoản và chơi offline.

Nhập vai bên trong một trò chơi như Dungeon vẫn thuộc gameplay của trò đó. Không xóa tiến trình hay reset tài khoản. Những trường dữ liệu/vật phẩm cũ còn được đọc để tương thích tài khoản và skin đã lưu; API nội bộ tương thích được giữ cho các game. XP và việc theo dõi nhiệm vụ/thành tựu hồ sơ đã dừng, rương nền tảng không còn rơi qua GameWrapper. Tiền nội bộ còn dùng bởi một số game hiện có (ví dụ gợi ý Sudoku), không cần người dùng quản lý trong launcher. Không yêu cầu thay SQL Supabase. Hai mô tả/hướng dẫn ở Blocker và 2048 đã đổi sang mục tiêu điểm số, bỏ quảng bá ngọc tài khoản trong chi tiết game.

## Kiểm tra

| Kiểm tra | Kết quả |
|---|---|
| QC đầy đủ | 102/103 đạt trong một lượt khoảng 6 phút 40 giây; 0 bỏ qua, 0 flaky. Một ca bắt được câu mô tả ngọc còn sót trong `TILE_2048_CONTROLS`. |
| Sau sửa câu mô tả và hai nhãn EXP cuối ván | **13/13 ca liên quan đạt**, gồm toàn bộ 8 ca launcher/hồ sơ mới, Sudoku hoàn thành, Blocker desktop/mobile, chơi và lưu/khôi phục 2048. |
| Tổng hợp theo ID ca kiểm tra | **103 ca riêng biệt đã được xác minh**, không còn ca chưa xử lý. Đây là tổng hợp lượt đầy đủ và lượt chạy lại liên quan, không phải một lượt đầy đủ 103/103 xanh. JSON gốc của cả hai lượt được giữ. |
| Phạm vi | 18 game × 2 kích thước mở/tạm dừng; 5 cửa sổ còn dùng × 2 kích thước; thao tác chơi đại diện, hoàn thành một số game, lưu/khôi phục, luật cờ/Sudoku và tài khoản. Không chơi hết mọi màn hay mọi độ khó. |
| `npm run lint` | Đạt trên mã cuối. |
| `npm run build` | Đạt trên mã cuối; tạo bundle và Service Worker. |
| PWA build cuối | Service Worker điều khiển trang, ngắt mạng/tải lại rồi chơi 2048 có điểm, 0 lỗi JavaScript bắt được. |
| `git diff --check` | Đạt. |

Bỏ thêm nhãn EXP trong màn thắng Sudoku và phần thưởng thử thách Blocker để không quảng bá tiến cấp hồ sơ đã dừng. Tiền hỗ trợ gameplay hiện có của một số game vẫn được giữ; thay đổi này tập trung vào launcher và hồ sơ.

Ảnh đã kiểm tra tại 1440×900 và 390×844; kiểm tra bổ sung launcher 320×740 không tràn ngang. Dung lượng precache giảm từ khoảng 3820 KiB của bản đồ họa trước xuống khoảng 2877.64 KiB (~25%); đây là dung lượng cache build, không phải phép đo thời gian tải/FPS. Build còn cảnh báo chunk lớn.

Lượt focused đầu phát hiện danh sách yêu thích/chơi gần đây mẫu ở tầng lưu trữ; đã sửa fallback về danh sách rỗng, giữ danh sách đã lưu của tài khoản cũ. Một selector của ca kiểm tra chi tiết game cũng được sửa theo nút thực tế. Lượt đầy đủ đầu dừng chủ động để sửa mô tả thưởng còn sót; lưu riêng `interrupted-full-*`, không tính là lượt đạt.

Các ca QC cho giao diện nhập vai đã bị loại bỏ được thay bằng kiểm tra đường dẫn bị chặn, không có popup RPG, hồ sơ cơ bản và dữ liệu trò chơi vẫn nguyên vẹn. Kiểm tra dịch vụ dữ liệu cũ được giữ để tránh làm hỏng tài khoản đang dùng. Kiểm thử đăng nhập dùng SDK thật với API Supabase mô phỏng; không gửi email hay tạo tài khoản production.

## Chạy lại

```bash
npm run lint
npm run build
npm run test:qc -- --workers=2
npm run preview -- --host 127.0.0.1 --port 4173
npm run test:pwa
```
