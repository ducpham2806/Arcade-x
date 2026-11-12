# Rắn Săn Mồi · ứng viên catalog SN-R2a · 12/11/2026

Chủ dự án duyệt bản preview trước và yêu cầu tiếp tục. Nhánh `codex/snake-catalog-candidate` dựa trên `3a3db28`. Đây là bản ứng viên local, phục vụ riêng tại cổng 4343 và xuất vào `test-results/snake-catalog-build`. Netlify dùng build mặc định từ `dist`.

## Mở và thử gói

```sh
npm run build:snake-catalog
npm run preview:snake-catalog
```

Mở [sảnh ứng viên](http://127.0.0.1:4343/), tìm Rắn Săn Mồi và mở chi tiết. Sau khi worker cài, tải lại trang một lần để worker điều khiển trang. Bấm **Tải gói chơi ngoại tuyến**, đợi báo **Đã lưu gói chơi ngoại tuyến**, sau đó tắt mạng và tải lại sảnh. Có thể mở game trước khi tải gói nếu đang có mạng.

## Tích hợp và phạm vi lưu

- Một thẻ Rắn Săn Mồi, dùng icon và banner đã duyệt, có chi tiết, yêu thích và chơi gần đây. Dùng luồng mở/thoát chuẩn của sảnh. Khách và tài khoản đều chơi được.
- Bản ứng viên lưu tiến trình trên thiết bị. Save khách dùng khóa local hiện có. Save tài khoản dùng namespace theo owner tương thích với preview. Tiến trình gắn với origin của trình duyệt, cổng local riêng có dữ liệu riêng. Luồng cloud verifier tiếp tục ở preview. Ứng viên local giữ Gold/Gem riêng và chưa gọi điểm, thưởng hay giao dịch launcher.
- Gói tải theo yêu cầu có 16 tệp JS/CSS và 20 media, khoảng 3,06 MB raw cộng dồn. Danh sách được sinh từ graph chunk sau bước xử lý CSS và đối chiếu với manifest. JS và media game nằm ngoài precache của sảnh. Khi bấm tải, CacheStorage phải lưu thành công tất cả các tệp mới báo hoàn tất.
- Vite loại chunk JS chỉ chứa CSS ở cuối build. Bản thử đầu liệt kê một đường dẫn JS đã bị loại nên nhận HTML fallback. Đã chuyển bước sinh gói sau xử lý CSS và kiểm từng file phát sinh. Đọc cache bằng URL hash cùng origin giúp tải bằng fetch và mở bằng module dùng chung đúng tài nguyên dù Vite trả `Vary: Origin`. [Workbox runtime caching](https://developer.chrome.com/docs/workbox/caching-resources-during-runtime).
- Thông báo offline vẫn hiện ở sảnh. Trong game có gói offline, gỡ thông báo nổi để joystick và Dash nhận chạm.

## Bằng chứng local

Node 24.22.1, Chrome 157, macOS. Build mặc định còn 24 game. Chế độ ứng viên có 25 game. Ứng viên có chunk game 131.144 byte, chunk lớn nhất 475.345 byte và graph JS tải đầu 303.311 byte gzip ước tính. Các số nằm dưới ngưỡng 500 KiB/chunk và 400 KiB gzip. Test xác nhận build mặc định không có card, ảnh, engine hoặc manifest gói của Snake.

Đã xem ảnh sảnh desktop, chi tiết 390×844 và màn chơi offline. Chrome dùng Auth fixture. Tải gói từ chi tiết trước khi mở game, thử lại sau một lỗi 503 được chèn vào ca kiểm thử, tắt mạng và tải lại PWA thật, mở game từ sảnh, thấy sprite và thử được âm thanh. Yêu thích/đã chơi/thoát hoạt động. Save fixture khách 3 sao và tài khoản 2 sao hiển thị riêng, đăng xuất về lại đúng 3 sao. Bằng chứng máy đọc trong `test-results/snake-catalog/`.

Kiểm typecheck, build mặc định và ứng viên, budget, 6 suite Snake, package preview, startup/package, artwork, catalog Nối Từ/Tank, 7 ca offline của launcher và full-release local. CI đã thêm ca chạy gói ứng viên sau Snake UI.

## Điều kiện phát hành và rollback

Build mặc định là đường rollback. Nó bỏ entry Snake và tài nguyên ứng viên bằng cách quay về build mode mặc định. Giữ các khóa save để game có thể mở lại khi có bản tiếp theo. Candidate chưa gắn vào nhánh deploy.

Khi được chọn phát hành, cần xác định phạm vi offline trong bản public, kiểm Android/iPhone, người mới chơi và chốt ca staging save/JWT theo kế hoạch. Sau đó chạy full CI trên head tích hợp và pilot trước khi mở rộng. [Thẻ Snake](../plans/SNAKE.md).
