# Chat bubble và Folk Duel · phát hành 19/11/2026

Chủ dự án yêu cầu **“merge đi e”** ngày 19/11. [PR 40](https://github.com/ducpham2806/Arcade-x/pull/40) đã chuyển đích từ nhánh chat sang main và merge thành `f1547954fc595bfb6fa3bad4467c7d2620f86346`. [PR 38](https://github.com/ducpham2806/Arcade-x/pull/38) tự được GitHub ghi merged vì nằm trong lịch sử của bản này.

Main trước merge `a55af6e` là tổ tiên của head `4dfd09c`. Merge giữ đúng tree `f7caf52535961955e2dea6a1dd46edfa32f08f5c` đã qua [CI #71](https://github.com/ducpham2806/Arcade-x/actions/runs/44416723603), cả verify và snake_ui thành công. Không có xung đột cần sửa.

## Bản public

Dashboard Netlify trong phiên Chrome đã xác nhận **Published main@f154795**, [deploy 6afe368bb6e8bc96958e23e5](https://app.netlify.com/projects/arcade-x/deploys/6afe368bb6e8bc96958e23e5), ngày 19/11 lúc 06:36 GMT+7, build/deploy 52 giây. [Mở ArcadeX](https://arcade-x.netlify.app/).

Connector Netlify của tài khoản Primary hết phiên. Đã dùng dashboard đang đăng nhập để kiểm đúng project/commit, không suy Published chỉ từ merge. HTML public thêm comment và HUD của Netlify. Kiểm file JS/CSS/asset phát hành đối chiếu byte với build local cùng nguồn, giữ phần chèn hosting trong HTML.

Đối chiếu 16 tệp JS/CSS/asset, tổng 1.946.623 byte, khớp build. Smoke guest public 4/4 qua ở 1280 × 900 và 390 × 844 cho hai game, pageerror 0. Đã mở xem ảnh tay rải Ô Ăn Quan và sân/nút Nhảy Lò Cò cạnh HUD hosting. Phạm vi kiểm là launcher, bản offline hai người chung máy, chat Game, tay rải/lịch sử Ô Ăn Quan và bước đầu Nhảy Lò Cò. Các request Supabase bị chặn trong smoke này. Bằng chứng ở `test-results/folk-release/`.

## Phạm vi đã merge và phần tiếp tục QA

- Bubble ở sảnh và toàn bộ game, thu/phóng/kéo và unread/lời cạnh HUD. Bản offline của hai game đã vào main và bản public.
- Mã adapter chat Trận và phòng Folk đã vào main. Backend chat mới và Folk 1v1 vẫn theo trạng thái staging của [báo cáo FD-ON1](FOLK-ONLINE-2026-11-19.md). `VITE_FOLK_ONLINE` mặc định tắt trong build public.
- Anh chọn tự kiểm hai tài khoản staging sau. Kiểm thiết bị vật lý và canh lực NLC qua mạng thật còn chờ. Thưởng online giữ tắt trong bản QA.
- Không áp schema/Edge/cron lên Supabase production trong lần merge này.

Studio Game Release & LiveOps, vai trò Release Lead và skill Netlify Deploy. Bước này kiểm quan hệ commit/tree qua Git và CI, không đổi quan hệ code nên dùng graph Folk/Edge đã kiểm ở FD-ON1.
