# Rắn Săn Mồi · SN-R2b · phát hành sảnh · 13/11/2026

Chủ dự án yêu cầu đưa game ra sảnh, merge main và phát hành Netlify. Bản phát hành tách phần Snake đã kiểm từ ứng viên `4432a0e` sang `codex/snake-public-release` dựa trên main `9061bfd`. Các nhánh quảng cáo/nội dung song song giữ riêng.

## Phạm vi

- R01 miễn phí, 10 màn, dùng icon/banner đã duyệt. Một mục trong sảnh, có yêu thích, chơi gần đây, tải gói ngoại tuyến. Bản public ẩn nút kiểm va chạm, art và lab.
- Khách và tài khoản đều chơi được. Tiến trình lưu trên thiết bị, tài khoản có namespace theo owner. Giữ save format, Gold/Gem riêng và thưởng chung tắt. Save cloud xác thực tiếp tục trong preview riêng. Không cần cập nhật Supabase/Render để phát hành gói này.
- Build mặc định có Snake. `npm run build:snake-disabled` kiểm phương án bỏ riêng entry và package khỏi build. Nếu cần rollback thật, revert commit phát hành qua Git và chờ Netlify Published. Save trên thiết bị được giữ.
- Tệp ảnh/WAV và mã game nằm ngoài precache tải đầu. Danh sách URL code gói Snake được sinh từ output build và cache riêng theo URL hash. Các route cache chung cho game khác giữ nguyên.

## Kiểm trước merge

Build production và bản rollback qua. Chrome với Auth fixture tải gói 16 JS/CSS + 20 media, retry lỗi 503, tắt mạng và reload sảnh rồi mở game, sprite/âm thanh và thao tác joystick/Dash qua. Hai namespace khách/tài khoản đọc đúng tiến trình. JS game khoảng 131 KB raw, chunk lớn nhất khoảng 468 KB raw, graph JS launcher khoảng 301 KB gzip ước tính. [Bằng chứng ứng viên trước phát hành](SNAKE-CATALOG-2026-11-12.md).

PR29 đã merge main19af480. Sau sửa cross-tab Auth, PR31 gồm cả cấu hình Studio/Graphify từ PR30 được retargetmain và merge8320385 sau fullCI50 success trên head1909fa6 (verify + snake_ui). Tree merge giống tree đã kiểm; PR30 đã tích hợp/đóng. [QA Auth](SNAKE-AUTH-XTAB-2026-11-13.md).

## Xác minh public · 13/11/2026

- Nguồn phát hành: `8320385ce09d873e5c209758b19d3383179990b3`. [Bản public](https://arcade-x.netlify.app/).
- Netlify API `/api/v1/sites/arcade-x.netlify.app` xác nhận `published_deploy`: id `6af6f590d7b4bd3516a37885`, state `ready`, context `production`, commit_ref đúng8320385, Published **18:34:34 GMT+7**. Không suy deploy từ trạng thái merge.
- Tải HTML/manifest và36URL code/media qua HTTPS: **3.047.410byte** khớp byte với build đã kiểm của1909fa6; source merge cùng tree. Entry `index-fDtlq_tI.js`,16JS/CSS và20media đúng manifest. SHA-256/size từng file lưu trong artifact local.
- Chromium156/Playwright1.64, trình duyệt mới, guest thật, không Authfixture: một card Snake, icon/banner decode, favorite; detail390×844 tải đủ36tệp vào cache. Đã xem ảnh desktop/detail/gameplay trước khi kết luận.
- Tắt mạng Chromium + navigator, reload thật từ service worker; probe URL không cache thất bại. Mở màn1, timer tiến, thao tác joystick/Dash, công cụ QA ẩn; thử âm thanh có thông báo đã phát; thoát về Chơi gần đây. Favorite còn sau reload. Không pageerror và không gọi `snake-complete`.
- Probe online riêng kiểm CTA detail và tâm joystick/Dash; ảnh online kiểm thêm overlay hosting. Đây là pointer trong viewport mobile Chromium, không phải điện thoại/cảm ứng hay nghe âm thanh bằng tai trên thiết bị thật.

Evidence ngoài git tại `/workspace/tooling/snake-release-live-20261113/`: `report.json` (6nhóm PASS), `asset-proofs.json`, `online-controls.json`, script tái lập và4ảnh. Log `/tmp/snake-public-live.log`, `/tmp/snake-public-online.log`. Browser lượt đầu vướng proxyCA; dùng CA do môi trường cung cấp trong NSS đúng quyền để kiểm lại, giữ xác thực TLS; không bật ignoreHTTPS/certificate-errors. Script/các file output không thay application hoặc backend.

FullCI51 sau merge trên8320385 đã success cả verify/snake_ui; fullCI50 đã xanh trước merge. Docs-only checkpoint ở nhánh `codex/snake-release-verification-20261113`, kiểm docs/structure/diff riêng.

## Còn nghiệm thu

SN-R2b đã phát hành và smoke public; chưa đóng toàn bộ game. Android/iPhone/Safari thật, human playtest10màn, FPS/heap/audio và live DB/JWT/cloud save giữ theo [thẻ Snake](../plans/SNAKE.md). Không tự mở quyền backend/grant/reward từ kết quả client.

Quan sát S3: badge “Powered by Netlify” che phần phải footer detail và phần dưới Dash/chữ hướng dẫn ở390×844online. Tâm CTA/joystick/Dash vẫn thao tác được; offline không thấy badge. [Bug/tái hiện và AC](../../production/qa/bugs/BUG-NETLIFY-BADGE-MOBILE.md) theo dõi riêng; không gọi giao diện mobile đã nghiệm thu hoàn toàn.
