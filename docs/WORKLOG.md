# Nhật ký công việc

Một nhật ký chính, tối đa 3 mục. [Log trước sửa](archive/WORKLOG-2026-11-19-before-folk-polish.md).

## 19/11/2026 · sửa lỗi QA Folk

- Tiếp từ `ea65ede` trên `codex/folk-qa-20261119`. Vạch lực Nhảy Lò Cò online vẽ theo khung hình từ giờ server ước lượng. Sửa khung thấp hai game, focus theo pha và Chơi lại offline có xác nhận.
- 21 test luật/Edge/PGlite, lint/build/budget/docs qua. 14 ca Playwright có kết quả qua sau chạy lại, gồm độ trễ 250 ms khứ hồi và khung ngang chừa badge.
- Game QA & Playtest, Game UI/UX, QA Lead. Graphify Folk 128/279, Nhảy Lò Cò 73/116. [Báo cáo](qa/FOLK-POLISH-2026-11-19.md). Nghiệm thu hai tài khoản staging, mạng và thiết bị thật còn chờ.

## 19/11/2026 · kiểm lại hai game Folk

- Nguồn `07bd19f`, nhánh `codex/folk-qa-20261119`. 21 test luật/Edge/PGlite qua. Playwright lượt đầu 6/7, ca Nhảy Lò Cò online hết chờ vùng lực. Chạy lại riêng 3/3 qua. Lint/build/budget/docs qua.
- Bản production cục bộ: 8 lượt mở/chơi/thoát/mở lại theo kích thước, ghi lỗi vạch lực, bố cục khung thấp, restart thanh game và focus. Proxy chặn URL public, Chrome Cloud lỗi sandbox, chưa QA thiết bị/hai tài khoản staging thật. [Báo cáo kiểm lại](qa/FOLK-RECHECK-2026-11-19.md).
- Game QA & Playtest, QA Lead, Graphify Folk 126/277, query lưu ván và đồng hồ.

## 19/11/2026 · merge và Published chat/Folk

- Anh yêu cầu merge. PR40 chuyển base từ nhánh chat sang main, merge `f154795`; PR38 tự ghi merged. Main cũ là tổ tiên, tree merge bằng head `4dfd09c` đã qua fullCI71. Giữ phần QA hai tài khoản cho anh như quyết định trước.
- Netlify dashboard xác nhận Published đúng main/commit, deploy `6afe368bb6e8bc96958e23e5`, 06:36 GMT+7. Connector Primary hết phiên, dùng Chrome đọc trạng thái. Public 16 tệp/1.946.623 byte khớp build, smoke 4/4 desktop/phone, pageerror 0. Xem [release](qa/FOLK-CHAT-RELEASE-2026-11-19.md). Backend Folk mới vẫn staging, thưởng online tắt.
- Studio Game Release & LiveOps, Release Lead, Netlify Deploy. Git DAG/tree kiểm phạm vi merge, không sửa code. Nhánh bàn giao `codex/folk-chat-release`.
