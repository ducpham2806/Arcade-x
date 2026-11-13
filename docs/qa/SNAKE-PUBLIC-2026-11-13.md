# Rắn Săn Mồi · SN-R2b · phát hành sảnh · 13/11/2026

Chủ dự án yêu cầu đưa game ra sảnh, merge main và phát hành Netlify. Bản phát hành tách phần Snake đã kiểm từ ứng viên `4432a0e` sang `codex/snake-public-release` dựa trên main `9061bfd`. Các nhánh quảng cáo/nội dung song song giữ riêng.

## Phạm vi

- R01 miễn phí, 10 màn, dùng icon/banner đã duyệt. Một mục trong sảnh, có yêu thích, chơi gần đây, tải gói ngoại tuyến. Bản public ẩn nút kiểm va chạm, art và lab.
- Khách và tài khoản đều chơi được. Tiến trình lưu trên thiết bị, tài khoản có namespace theo owner. Giữ save format, Gold/Gem riêng và thưởng chung tắt. Save cloud xác thực tiếp tục trong preview riêng. Không cần cập nhật Supabase/Render để phát hành gói này.
- Build mặc định có Snake. `npm run build:snake-disabled` kiểm phương án bỏ riêng entry và package khỏi build. Nếu cần rollback thật, revert commit phát hành qua Git và chờ Netlify Published. Save trên thiết bị được giữ.
- Tệp ảnh/WAV và mã game nằm ngoài precache tải đầu. Danh sách URL code gói Snake được sinh từ output build và cache riêng theo URL hash. Các route cache chung cho game khác giữ nguyên.

## Kiểm trước merge

Build production và bản rollback qua. Chrome với Auth fixture tải gói 16 JS/CSS + 20 media, retry lỗi 503, tắt mạng và reload sảnh rồi mở game, sprite/âm thanh và thao tác joystick/Dash qua. Hai namespace khách/tài khoản đọc đúng tiến trình. JS game khoảng 131 KB raw, chunk lớn nhất khoảng 468 KB raw, graph JS launcher khoảng 301 KB gzip ước tính. [Bằng chứng ứng viên trước phát hành](SNAKE-CATALOG-2026-11-12.md).

PR phải qua toàn bộ workflow CI trên head tích hợp. Netlify tự build từ main. Sau Published, đối chiếu SHA và kiểm card, mở/chơi/thoát, tải gói và mở lại offline trên bản public. Các ca Android/iPhone thật, người mới chơi và JWT/save cloud vẫn theo [thẻ Snake](../plans/SNAKE.md).
