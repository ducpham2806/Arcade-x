# Nhật ký công việc

Một nhật ký chính, tối đa 3 mục. [Log trước đợt này](archive/WORKLOG-2026-11-19-before-folk-followup.md).

## 19/11/2026 · xác nhận rời trận Folk

- Tiếp từ `37605a2` trên `codex/folk-qa-20261119` ([PR 42](https://github.com/ducpham2806/Arcade-x/pull/42)). Nút Rời phòng và Thoát trong bàn cùng mở xác nhận nếu ván online đang đếm ngược hoặc đang chơi. Ở lại hoặc Escape trả focus về nút mở. Chỉ xác nhận mới gửi lệnh rời. Luồng thử lại giữ nguyên ID yêu cầu khi mất phản hồi.
- Qua 14 ca Playwright (12 offline, 2 online) và 21 ca Folk Node/PGlite. Ô Ăn Quan gửi lại cùng ID khi mất phản hồi. Nhảy Lò Cò kiểm hủy và bỏ cuộc ở 390×844 với độ trễ giả lập 250 ms khứ hồi. Đã xem ảnh `test-results/folk-online/nlc-leave-phone.png`. Lint, build production, bundle budget và kiểm Markdown qua.
- Studio Game QA & Playtest, Game UI/UX, vai trò QA Lead. Graphify 0.9.108 AST `src/games/folk-duel`, 129 nút/281 cạnh, truy vấn `FolkLeaveDialog` depth 1. Hai trình duyệt mô phỏng dùng fixture Auth/Edge/PGlite. Nghiệm thu tài khoản staging, thiết bị và mạng thật vẫn chờ.

## 19/11/2026 · sửa lỗi QA Folk

- Tiếp từ `ea65ede` trên `codex/folk-qa-20261119`. Vạch lực Nhảy Lò Cò online vẽ theo khung hình từ giờ server ước lượng. Sửa khung thấp hai game, focus theo pha và Chơi lại offline có xác nhận.
- 21 test luật/Edge/PGlite, lint/build/budget/docs qua. 14 ca Playwright có kết quả qua sau chạy lại, gồm độ trễ 250 ms khứ hồi và khung ngang chừa badge.
- Game QA & Playtest, Game UI/UX, QA Lead. Graphify Folk 128/279, Nhảy Lò Cò 73/116. [Báo cáo](qa/FOLK-POLISH-2026-11-19.md). Nghiệm thu hai tài khoản staging, mạng và thiết bị thật còn chờ.

## 19/11/2026 · kiểm lại hai game Folk

- Nguồn `07bd19f`, nhánh `codex/folk-qa-20261119`. 21 test luật/Edge/PGlite qua. Playwright lượt đầu 6/7, ca Nhảy Lò Cò online hết chờ vùng lực. Chạy lại riêng 3/3 qua. Lint/build/budget/docs qua.
- Bản production cục bộ: 8 lượt mở/chơi/thoát/mở lại theo kích thước, ghi lỗi vạch lực, bố cục khung thấp, restart thanh game và focus. Proxy chặn URL public, Chrome Cloud lỗi sandbox, chưa QA thiết bị/hai tài khoản staging thật. [Báo cáo kiểm lại](qa/FOLK-RECHECK-2026-11-19.md).
- Game QA & Playtest, QA Lead, Graphify Folk 126/277, query lưu ván và đồng hồ.
