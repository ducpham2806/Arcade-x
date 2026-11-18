# Nhật ký công việc

Một nhật ký chính, tối đa 3 mục. [Log trước merge](archive/WORKLOG-2026-11-19-before-folk-chat-merge.md).

## 19/11/2026 · merge và Published chat/Folk

- Anh yêu cầu merge. PR40 chuyển base từ nhánh chat sang main, merge `f154795`; PR38 tự ghi merged. Main cũ là tổ tiên, tree merge bằng head `4dfd09c` đã qua fullCI71. Giữ phần QA hai tài khoản cho anh như quyết định trước.
- Netlify dashboard xác nhận Published đúng main/commit, deploy `6afe368bb6e8bc96958e23e5`, 06:36 GMT+7. Connector Primary hết phiên, dùng Chrome đọc trạng thái. Public 16 tệp/1.946.623 byte khớp build, smoke 4/4 desktop/phone, pageerror 0. Xem [release](qa/FOLK-CHAT-RELEASE-2026-11-19.md). Backend Folk mới vẫn staging, thưởng online tắt.
- Studio Game Release & LiveOps, Release Lead, Netlify Deploy. Git DAG/tree kiểm phạm vi merge, không sửa code. Nhánh bàn giao `codex/folk-chat-release`.

## 19/11/2026 · FD-ON1 · phòng xác thực và chat Trận

- Tiếp plan từ head local `92e3dd3`/remote `791810c`, nhánh `codex/folk-duel-foundation`. Edge kiểm Auth, PostgreSQL CAS + receipt, FIFO theo game, resume, leave, timeout và hai phiếu rematch. NLC server giữ pha/nhịp/tính điểm. Ô Ăn Quan bắt đầu đồng hồ sau timeline rải. Adapter chat dùng chung, unread và lời cạnh HUD, gỡ theo phiên.
- 21 Node/PGlite, 7 browser offline/online, lint/build/bundle và test:fast qua. Test chứng minh receipt gửi lại sau mất phản hồi và rematch đồng thời. Bản staging ref `khqipuipeawzlkqmdzdg` đã áp schema, Edge v2 và cron 10s trả 200. Ngày 19/11 anh để bước hai tài khoản thật cho anh kiểm sau; thiết bị/độ trễ thật còn QA. Thưởng online giữ tắt, PR nháp chờ duyệt. [QA](qa/FOLK-ONLINE-2026-11-19.md).
- Studio Backend Architect, QA/Playtest, Technical Director. Graphify cập nhật Folk 126/277 và Edge 115/240, depth 1, đối chiếu source và PGlite.

## 18/11/2026 · Ô Ăn Quan · trình diễn và lịch sử lượt

- User yêu cầu tay bốc, rải từng ô, sỏi rơi, hiệu ứng ăn và mẹt riêng. Dùng trace luật với RAF, tạm dừng khi mở chat, bỏ qua hoặc giảm chuyển động. Lưu bàn đã chốt và lịch sử đường rải/ô ăn từng lượt. Hiện hai hàng theo ghế cam/xanh ngọc, hướng Trái/Phải theo phía hiển thị.
- Folk 12/12, Playwright 5/5, lint/build/bundle, readability, smoke Ô Ăn Quan và CSS motion 2/2 qua. Xem ảnh/chuyển động ở `test-results/folk-offline/oaq-*`; chưa đi máy thật. Studio Game Feel, UI/UX, QA/Playtest. Graphify Ô Ăn Quan phạm vi bước, renderer và host.
