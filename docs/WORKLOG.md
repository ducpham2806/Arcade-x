# Nhật ký công việc

Một nhật ký chính, tối đa 3 mục. [Log trước FD-ON2](archive/WORKLOG-2026-11-19-before-fd-on2.md).

## 19/11/2026 · FD-ON2, công tắc catalog và kiểm mạng

- Tiếp `aad7895` trên `codex/folk-qa-20261119`. Migration mặc định tắt online từng game. Menu cập nhật qua catalog, có quy trình thu hồi. Ô Ăn Quan kiểm ngắt và nối lại mạng, Nhảy Lò Cò kiểm lượt ở 250 ms khứ hồi mô phỏng.
- 15 ca Playwright Folk, PGlite toàn bộ migration, 21 ca luật/lưu/phòng, lint, build, budget và hai smoke catalog trên bản production cục bộ qua. Preview Vite 4335 trỏ staging đã qua smoke khách. Staging Edge v2 `ACTIVE`, cron `succeeded`. [Phiếu nghiệm thu](qa/FOLK-ON2-2026-11-19.md).
- CI #77 trên `b918742` qua Folk và `snake_ui`. Job `verify` chạm giới hạn 30 phút sau khi bắt đầu bộ Tank Clash ở phút 29. Nâng giới hạn job lên 40 phút. So sánh YAML xác nhận chỉ đổi thời lượng job. Smoke preview khách chạy lại qua 2/2. [CI #77](https://github.com/ducpham2806/Arcade-x/actions/runs/44559811794).
- Studio Game QA & Playtest, Game Release & LiveOps, vai trò QA Lead. Graphify 0.9.108, Folk 133/286, launcher 81/159, depth 1 theo `useFolkOnlineAvailability` và `fetchCatalog`, đối chiếu nguồn. Còn hai tài khoản staging, thiết bị và mạng thật.

## 19/11/2026 · xác nhận rời trận Folk

- Tiếp từ `37605a2` trên `codex/folk-qa-20261119` ([PR 42](https://github.com/ducpham2806/Arcade-x/pull/42)). Nút Rời phòng và Thoát trong bàn cùng mở xác nhận nếu ván online đang đếm ngược hoặc đang chơi. Ở lại hoặc Escape trả focus về nút mở. Chỉ xác nhận mới gửi lệnh rời. Luồng thử lại giữ nguyên ID yêu cầu khi mất phản hồi.
- Qua 14 ca Playwright (12 offline, 2 online) và 21 ca Folk Node/PGlite. Ô Ăn Quan gửi lại cùng ID khi mất phản hồi. Nhảy Lò Cò kiểm hủy và bỏ cuộc ở 390×844 với độ trễ giả lập 250 ms khứ hồi. Đã xem ảnh `test-results/folk-online/nlc-leave-phone.png`. Lint, build production, bundle budget và kiểm Markdown qua.
- Studio Game QA & Playtest, Game UI/UX, vai trò QA Lead. Graphify 0.9.108 AST `src/games/folk-duel`, 129 nút/281 cạnh, truy vấn `FolkLeaveDialog` depth 1. Hai trình duyệt mô phỏng dùng fixture Auth/Edge/PGlite. Nghiệm thu tài khoản staging, thiết bị và mạng thật vẫn chờ.

## 19/11/2026 · sửa lỗi QA Folk

- Tiếp từ `ea65ede` trên `codex/folk-qa-20261119`. Vạch lực Nhảy Lò Cò online vẽ theo khung hình từ giờ server ước lượng. Sửa khung thấp hai game, focus theo pha và Chơi lại offline có xác nhận.
- 21 test luật/Edge/PGlite, lint/build/budget/docs qua. 14 ca Playwright có kết quả qua sau chạy lại, gồm độ trễ 250 ms khứ hồi và khung ngang chừa badge.
- Game QA & Playtest, Game UI/UX, QA Lead. Graphify Folk 128/279, Nhảy Lò Cò 73/116. [Báo cáo](qa/FOLK-POLISH-2026-11-19.md). Nghiệm thu hai tài khoản staging, mạng và thiết bị thật còn chờ.
