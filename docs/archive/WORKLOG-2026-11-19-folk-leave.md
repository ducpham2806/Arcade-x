## 19/11/2026 · xác nhận rời trận Folk

- Tiếp từ `37605a2` trên `codex/folk-qa-20261119` ([PR 42](https://github.com/ducpham2806/Arcade-x/pull/42)). Nút Rời phòng và Thoát trong bàn cùng mở xác nhận nếu ván online đang đếm ngược hoặc đang chơi. Ở lại hoặc Escape trả focus về nút mở. Chỉ xác nhận mới gửi lệnh rời. Luồng thử lại giữ nguyên ID yêu cầu khi mất phản hồi.
- Qua 14 ca Playwright (12 offline, 2 online) và 21 ca Folk Node/PGlite. Ô Ăn Quan gửi lại cùng ID khi mất phản hồi. Nhảy Lò Cò kiểm hủy và bỏ cuộc ở 390×844 với độ trễ giả lập 250 ms khứ hồi. Đã xem ảnh `test-results/folk-online/nlc-leave-phone.png`. Lint, build production, bundle budget và kiểm Markdown qua.
- Studio Game QA & Playtest, Game UI/UX, vai trò QA Lead. Graphify 0.9.108 AST `src/games/folk-duel`, 129 nút/281 cạnh, truy vấn `FolkLeaveDialog` depth 1. Hai trình duyệt mô phỏng dùng fixture Auth/Edge/PGlite. Nghiệm thu tài khoản staging, thiết bị và mạng thật vẫn chờ.
