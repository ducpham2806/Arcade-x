# Bàn giao · 19/11/2026 · FD-ON1 chờ hai tài khoản staging

Anh yêu cầu tiếp plan. Nhánh `codex/folk-duel-foundation`, [PR 40 nháp](https://github.com/ducpham2806/Arcade-x/pull/40), từ remote `791810c` (local `92e3dd3` cùng tree). [Thẻ Folk](plans/FOLK-GAMES-PLAN.md), [QA và hợp đồng](qa/FOLK-ONLINE-2026-11-19.md), [offline trước task](archive/SESSION-HANDOFF-2026-11-18-before-folk-online.md).

Đã thay phòng bộ nhớ bằng Edge/Auth + PostgreSQL. CAS revision, receipt actor/action/nội dung, mã phòng/FIFO, resume, leave, timeout, hai phiếu rematch và đổi người đi trước. NLC server kiểm từng lệnh thảy/nhảy/nhặt theo thời gian nhận; điểm/nhà tự tính. Ô Ăn Quan lưu history và dành thời lượng timeline trước 25 giây lượt mới. Chat Trận dùng adapter chung và HUD anchor. Cấp thưởng online giữ tắt trong bản QA.

Node 24 có 11 ca luật/lưu và 10 ca Edge/PGlite qua. Bộ browser offline/online 7/7 qua, rồi 2 online chạy lại cho kiểm ảnh sau rematch và vùng bảo vệ lời nổi. Lint/build/bundle 298 kB gzip và toàn bộ test:fast qua. Animation qua 54/54 contract desktop và 25/25 browser VFX/polish.

Staging `khqipuipeawzlkqmdzdg` đã áp schema/cron riêng và Edge v2 ACTIVE. Thiếu bearer 401, RPC anon/authenticated bị chặn, cron 10s succeeded và tick HTTP 200. Hai tài khoản thật trong phiên 19/11 còn chờ. Đã gửi yêu cầu đăng nhập tại `http://127.0.0.1:4335` (Vite bật Folk online với backend staging). Hai tab cũ không còn trong cửa sổ tester. Cổng 4357 giữ preview backend tắt. Chưa kiểm điện thoại vật lý hoặc canh lực NLC với latency thật. Chờ anh kiểm và duyệt trước merge.

Studio `fa7b1db`, Backend Architect, Game QA/Playtest, Technical Director. Graphify cập nhật Folk 126 nút/277 cạnh, Edge Folk 115/240 gồm bundle sinh, depth 1 theo `FolkOnlineClient`, `FolkOnlineServer`, `applyCommand`, kiểm source và giao dịch. Bundle sinh bằng `npm run prepare:folk-server`, CI kiểm khớp nguồn.
