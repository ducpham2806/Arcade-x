# Nhật ký ArcadeX · phần lưu trữ

## 19–20/11/2026 · FD-ON2 và phát hành launcher

- Ngày 20/11 anh yêu cầu bỏ test staging, đưa hai game lên launcher và merge main. Catalog đóng gói bảo đảm mở ván offline khi catalog cloud thiếu hàng. Hàng cloud hợp lệ vẫn quyết định quyền và trạng thái. Hai ca trình duyệt trên bản dựng production cục bộ vào bàn offline qua sảnh ở 1280×900 và 390×844. Lint, test catalog/quyền mở game, build và bundle budget qua.
- Tiếp `aad7895` trên `codex/folk-qa-20261119`. Migration mặc định tắt online từng game. Menu cập nhật qua catalog, có quy trình thu hồi. Ô Ăn Quan kiểm ngắt và nối lại mạng, Nhảy Lò Cò kiểm lượt ở 250 ms khứ hồi mô phỏng.
- 15 ca Playwright Folk, PGlite toàn bộ migration, 21 ca luật/lưu/phòng, lint, build, budget và hai smoke catalog trên bản production cục bộ qua. Preview Vite 4335 trỏ staging đã qua smoke khách. Staging Edge v2 `ACTIVE`, cron `succeeded`. [Phiếu nghiệm thu](qa/FOLK-ON2-2026-11-19.md).
- CI #77 trên `b918742` qua Folk và `snake_ui`. Job `verify` chạm giới hạn 30 phút sau khi bắt đầu bộ Tank Clash ở phút 29. Nâng giới hạn job lên 40 phút. So sánh YAML xác nhận chỉ đổi thời lượng job. Smoke preview khách chạy lại qua 2/2. [CI #77](https://github.com/ducpham2806/Arcade-x/actions/runs/44559811794).
- CI #78 qua Folk, `snake_ui` và motion desktop 54/54. Ca lưu Dungeon trên điện thoại ghi nhận bản lưu nền tiến thêm 98 ms giữa lúc đọc dữ liệu và lúc chặn ghi. Chỉnh fixture đọc và chặn trong cùng lượt JavaScript, giữ phép so sánh bản lưu và kiểm retry. Ca điện thoại chạy lại qua. [CI #78](https://github.com/ducpham2806/Arcade-x/actions/runs/44569239153).
- Studio Game QA & Playtest, Game Release & LiveOps, vai trò QA Lead. Graphify 0.9.108, Folk 133/286, launcher 81/159, depth 1 theo `useFolkOnlineAvailability` và `fetchCatalog`, đối chiếu nguồn. Còn hai tài khoản staging, thiết bị và mạng thật.
