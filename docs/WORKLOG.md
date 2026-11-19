# Nhật ký công việc

Một nhật ký chính, tối đa 3 mục. [Log trước kiểm lại](archive/WORKLOG-2026-11-19-before-folk-recheck.md).

## 19/11/2026 · kiểm lại hai game Folk

- Nguồn `07bd19f`, nhánh `codex/folk-qa-20261119`. 21 test luật/Edge/PGlite qua. Playwright lượt đầu 6/7, ca Nhảy Lò Cò online hết chờ vùng lực. Chạy lại riêng 3/3 qua. Lint/build/budget/docs qua.
- Bản production cục bộ: 8 lượt mở/chơi/thoát/mở lại theo kích thước, ghi lỗi vạch lực, bố cục khung thấp, restart thanh game và focus. Proxy chặn URL public, Chrome Cloud lỗi sandbox, chưa QA thiết bị/hai tài khoản staging thật. [Báo cáo kiểm lại](qa/FOLK-RECHECK-2026-11-19.md).
- Game QA & Playtest, QA Lead, Graphify Folk 126/277, query lưu ván và đồng hồ.

## 19/11/2026 · merge và Published chat/Folk

- Anh yêu cầu merge. PR40 chuyển base từ nhánh chat sang main, merge `f154795`; PR38 tự ghi merged. Main cũ là tổ tiên, tree merge bằng head `4dfd09c` đã qua fullCI71. Giữ phần QA hai tài khoản cho anh như quyết định trước.
- Netlify dashboard xác nhận Published đúng main/commit, deploy `6afe368bb6e8bc96958e23e5`, 06:36 GMT+7. Connector Primary hết phiên, dùng Chrome đọc trạng thái. Public 16 tệp/1.946.623 byte khớp build, smoke 4/4 desktop/phone, pageerror 0. Xem [release](qa/FOLK-CHAT-RELEASE-2026-11-19.md). Backend Folk mới vẫn staging, thưởng online tắt.
- Studio Game Release & LiveOps, Release Lead, Netlify Deploy. Git DAG/tree kiểm phạm vi merge, không sửa code. Nhánh bàn giao `codex/folk-chat-release`.

## 19/11/2026 · FD-ON1 · phòng xác thực và chat Trận

- Tiếp plan từ head local `92e3dd3`/remote `791810c`, nhánh `codex/folk-duel-foundation`. Edge kiểm Auth, PostgreSQL CAS + receipt, FIFO theo game, resume, leave, timeout và hai phiếu rematch. NLC server giữ pha/nhịp/tính điểm. Ô Ăn Quan bắt đầu đồng hồ sau timeline rải. Adapter chat dùng chung, unread và lời cạnh HUD, gỡ theo phiên.
- 21 Node/PGlite, 7 browser offline/online, lint/build/bundle và test:fast qua. Test chứng minh receipt gửi lại sau mất phản hồi và rematch đồng thời. Bản staging ref `khqipuipeawzlkqmdzdg` đã áp schema, Edge v2 và cron 10s trả 200. Ngày 19/11 anh để bước hai tài khoản thật cho anh kiểm sau; thiết bị/độ trễ thật còn QA. Thưởng online giữ tắt, PR nháp chờ duyệt. [QA](qa/FOLK-ONLINE-2026-11-19.md).
- Studio Backend Architect, QA/Playtest, Technical Director. Graphify cập nhật Folk 126/277 và Edge 115/240, depth 1, đối chiếu source và PGlite.
