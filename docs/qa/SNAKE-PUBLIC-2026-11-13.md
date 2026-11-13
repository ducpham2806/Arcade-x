# Rắn Săn Mồi · SN-R2b · phát hành sảnh · 13/11/2026

Chủ dự án yêu cầu đưa game ra sảnh, merge main và phát hành Netlify. Bản phát hành tách phần Snake đã kiểm từ ứng viên `4432a0e` sang `codex/snake-public-release` dựa trên main `9061bfd`. Các nhánh quảng cáo/nội dung song song giữ riêng.

## Phạm vi

- R01 miễn phí, 10 màn, dùng icon/banner đã duyệt. Một mục trong sảnh, có yêu thích, chơi gần đây, tải gói ngoại tuyến. Bản public ẩn nút kiểm va chạm, art và lab.
- Khách và tài khoản đều chơi được. Tiến trình lưu trên thiết bị, tài khoản có namespace theo owner. Giữ save format, Gold/Gem riêng và thưởng chung tắt. Save cloud xác thực tiếp tục trong preview riêng. Không cần cập nhật Supabase/Render để phát hành gói này.
- Build mặc định có Snake. `npm run build:snake-disabled` kiểm phương án bỏ riêng entry và package khỏi build. Nếu cần rollback thật, revert commit phát hành qua Git và chờ Netlify Published. Save trên thiết bị được giữ.
- Tệp ảnh/WAV và mã game nằm ngoài precache tải đầu. Danh sách URL code gói Snake được sinh từ output build và cache riêng theo URL hash. Các route cache chung cho game khác giữ nguyên.

## Kiểm trước merge

Build production và bản rollback qua. Chrome với Auth fixture tải gói 16 JS/CSS + 20 media, retry lỗi 503, tắt mạng và reload sảnh rồi mở game, sprite/âm thanh và thao tác joystick/Dash qua. Hai namespace khách/tài khoản đọc đúng tiến trình. JS game khoảng 131 KB raw, chunk lớn nhất khoảng 468 KB raw, graph JS launcher khoảng 301 KB gzip ước tính. [Bằng chứng ứng viên trước phát hành](SNAKE-CATALOG-2026-11-12.md).

[PR #29](https://github.com/ducpham2806/Arcade-x/pull/29) qua [CI #47](https://github.com/ducpham2806/Arcade-x/actions/runs/43321055153), cả `verify` và `snake_ui` success ở head `a215da6`. Hai lượt trước bắt lỗi đổi tài khoản xuyên tab. Client dùng phiên từ sự kiện SDK để tránh đọc lại phiên cũ, đồng thời hủy restore đã lỗi thời. Sáu ca Auth session và sáu ca Snake UI save local qua. Lượt kiểm bổ sung `tests/auth` có 22 ca không qua. Ca khách mở tab đăng ký tái hiện trên main cũ `9061bfd` với cùng locator, các ca khác chưa đối chiếu hết.

## Production · 13/11/2026

- Merge `19af480ab627c5e31f1e8a5540643c499cee62d2`, cây mã trùng head đã qua CI. [Netlify production](https://app.netlify.com/projects/arcade-x/deploys/6af6c33ffa88465933ad464a) là bản đang Published của main, lúc 14:59:49 GMT+7.
- Chrome cảm ứng mô phỏng 390×844 trên site công khai. Đã giải mã icon/banner, tải 16 tệp code/CSS và 20 media, ngắt mạng thật trong context rồi reload. Màn 1 chạy, sprite vẽ vào Canvas, joystick/Dash hiện và chạm tới được, phát âm thử, thoát về sảnh và thấy mục chơi gần đây.
- JS game và cả 20 media công khai khớp SHA-256 với build local. Kiểm trong phiên khách cô lập. Còn Android/iPhone thật, người mới chơi và JWT/save cloud theo [thẻ Snake](../plans/SNAKE.md).
