# Nhật ký công việc

Một nhật ký chính, tối đa 3 mục. [Log trước FD-ON2](archive/WORKLOG-2026-11-19-before-fd-on2.md).

## 20/11/2026 · backend và online production Folk

- Theo phạm vi anh duyệt, dùng bản `main@932db80` trên Supabase Arcade-x `whjatkhhupeqfngakmee`. Hai migration production là `20261120023641 folk_duel_room_schema` và `20261120023657 folk_online_catalog`. Migration catalog chạy đúng nội dung file `20261119154045_folk_online_catalog.sql` trong repo.
- Bốn bảng có RLS. Năm RPC chỉ cấp EXECUTE cho `service_role`. Edge `folk-duel-room` v1 ACTIVE, mã khớp main. Cron job 4 dùng token Vault. Năm lượt cron liên tiếp cách nhau 10 giây, đều trả HTTP 200. Hai ca khách trả 401. 21 ca Folk và SQL PGlite qua.
- Theo yêu cầu của anh, lúc 09:50 GMT+7 thêm đúng hai hàng `published` với online bật. Dùng metadata từ registry, giữ miễn phí, offline và vị trí đầu cụm catalog cloud. API production trả cờ online và offline đều đúng, quyền chơi miễn phí, khách vào phòng trả 401. Playwright cục bộ qua 3/3 ca phòng và catalog. Trận production hai tài khoản chưa thử.
- Bàn giao trên `codex/folk-production-backend-20261120` theo Game Release & LiveOps, vai trò Release Lead. [Edge production](https://supabase.com/dashboard/project/whjatkhhupeqfngakmee/functions/folk-duel-room).

## 19–20/11/2026 · FD-ON2 và phát hành launcher

- Ngày 20/11 anh yêu cầu bỏ test staging, đưa hai game lên launcher và merge main. Catalog đóng gói bảo đảm mở ván offline khi catalog cloud thiếu hàng. Hàng cloud hợp lệ vẫn quyết định quyền và trạng thái. Hai ca trình duyệt trên bản dựng production cục bộ vào bàn offline qua sảnh ở 1280×900 và 390×844. Lint, test catalog/quyền mở game, build và bundle budget qua.
- Tiếp `aad7895` trên `codex/folk-qa-20261119`. Migration mặc định tắt online từng game. Menu cập nhật qua catalog, có quy trình thu hồi. Ô Ăn Quan kiểm ngắt và nối lại mạng, Nhảy Lò Cò kiểm lượt ở 250 ms khứ hồi mô phỏng.
- 15 ca Playwright Folk, PGlite toàn bộ migration, 21 ca luật/lưu/phòng, lint, build, budget và hai smoke catalog trên bản production cục bộ qua. Preview Vite 4335 trỏ staging đã qua smoke khách. Staging Edge v2 `ACTIVE`, cron `succeeded`. [Phiếu nghiệm thu](qa/FOLK-ON2-2026-11-19.md).
- CI #77 trên `b918742` qua Folk và `snake_ui`. Job `verify` chạm giới hạn 30 phút sau khi bắt đầu bộ Tank Clash ở phút 29. Nâng giới hạn job lên 40 phút. So sánh YAML xác nhận chỉ đổi thời lượng job. Smoke preview khách chạy lại qua 2/2. [CI #77](https://github.com/ducpham2806/Arcade-x/actions/runs/44559811794).
- CI #78 qua Folk, `snake_ui` và motion desktop 54/54. Ca lưu Dungeon trên điện thoại ghi nhận bản lưu nền tiến thêm 98 ms giữa lúc đọc dữ liệu và lúc chặn ghi. Chỉnh fixture đọc và chặn trong cùng lượt JavaScript, giữ phép so sánh bản lưu và kiểm retry. Ca điện thoại chạy lại qua. [CI #78](https://github.com/ducpham2806/Arcade-x/actions/runs/44569239153).
- Studio Game QA & Playtest, Game Release & LiveOps, vai trò QA Lead. Graphify 0.9.108, Folk 133/286, launcher 81/159, depth 1 theo `useFolkOnlineAvailability` và `fetchCatalog`, đối chiếu nguồn. Còn hai tài khoản staging, thiết bị và mạng thật.

## 19/11/2026 · xác nhận rời trận Folk

- Tiếp từ `37605a2` trên `codex/folk-qa-20261119` ([PR 42](https://github.com/ducpham2806/Arcade-x/pull/42)). Nút Rời phòng và Thoát trong bàn cùng mở xác nhận nếu ván online đang đếm ngược hoặc đang chơi. Ở lại hoặc Escape trả focus về nút mở. Chỉ xác nhận mới gửi lệnh rời. Luồng thử lại giữ nguyên ID yêu cầu khi mất phản hồi.
- Qua 14 ca Playwright (12 offline, 2 online) và 21 ca Folk Node/PGlite. Ô Ăn Quan gửi lại cùng ID khi mất phản hồi. Nhảy Lò Cò kiểm hủy và bỏ cuộc ở 390×844 với độ trễ giả lập 250 ms khứ hồi. Đã xem ảnh `test-results/folk-online/nlc-leave-phone.png`. Lint, build production, bundle budget và kiểm Markdown qua.
- Studio Game QA & Playtest, Game UI/UX, vai trò QA Lead. Graphify 0.9.108 AST `src/games/folk-duel`, 129 nút/281 cạnh, truy vấn `FolkLeaveDialog` depth 1. Hai trình duyệt mô phỏng dùng fixture Auth/Edge/PGlite. Nghiệm thu tài khoản staging, thiết bị và mạng thật vẫn chờ.
