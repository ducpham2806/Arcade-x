# Nhật ký công việc

Một nhật ký chính, tối đa 3 mục. [Log trước FD-ON2](archive/WORKLOG-2026-11-19-before-fd-on2.md).

## 25/11/2026 · bản chơi thử Chính Điện Đá Cờ vua

- Từ `b22b6be` trên `codex/chess-citadel-preview`, thêm hai bộ quân Ngà Vàng và Hắc Thạch, bàn 8×8, nhập thành, bắt qua đường, phong cấp và khay theo lịch sử SAN.
- Game Studio, Graphify, Agent Sprite Forge và PixelFX đã được dùng. Bản HTML có thế thử và đấu hai người cùng máy. [QA](qa/CHESS-CITADEL-2026-11-25.md).
- Hai bàn mẫu Cờ vua và Cờ tướng chờ duyệt hình ảnh và kiểm máy thật, phòng online hai tài khoản.
- [Mục xác nhận rời trận Folk ngày 19/11](archive/WORKLOG-2026-11-19-folk-leave.md).

## 25/11/2026 · bản chơi thử chiến trường Cờ tướng

- Từ `3e2f5b9` trên `codex/xiangqi-battlefield-preview`, thêm Bến Sông Sở Hán với quân top-down hai phe, vạch sông và Cửu Cung, điều khiển phím, animation Pháo và khay quân ăn. Bàn cổ điển vẫn chọn được.
- Dùng Game Studio, Graphify theo module, Agent Sprite Forge 14 sprite qua QA và PixelFX 16 frame. `test:duel`, `test:artwork`, lint và build qua. [QA](qa/XIANGQI-BATTLEFIELD-2026-11-25.md).
- Sau bản Cờ vua, nhánh `codex/xiangqi-pixel-polish` thay bộ quân Cờ tướng bằng 14 sprite pixel full-body. QA Chromium ba khung và HTML offline qua. Còn thiết bị thật và phòng hai tài khoản.
- [Mục sửa lỗi QA Folk ngày 19/11](archive/WORKLOG-2026-11-19-folk-polish.md).

## 19–20/11/2026 · FD-ON2 và phát hành launcher

- Ngày 20/11 anh yêu cầu bỏ test staging, đưa hai game lên launcher và merge main. Catalog đóng gói bảo đảm mở ván offline khi catalog cloud thiếu hàng. Hàng cloud hợp lệ vẫn quyết định quyền và trạng thái. Hai ca trình duyệt trên bản dựng production cục bộ vào bàn offline qua sảnh ở 1280×900 và 390×844. Lint, test catalog/quyền mở game, build và bundle budget qua.
- Tiếp `aad7895` trên `codex/folk-qa-20261119`. Migration mặc định tắt online từng game. Menu cập nhật qua catalog, có quy trình thu hồi. Ô Ăn Quan kiểm ngắt và nối lại mạng, Nhảy Lò Cò kiểm lượt ở 250 ms khứ hồi mô phỏng.
- 15 ca Playwright Folk, PGlite toàn bộ migration, 21 ca luật/lưu/phòng, lint, build, budget và hai smoke catalog trên bản production cục bộ qua. Preview Vite 4335 trỏ staging đã qua smoke khách. Staging Edge v2 `ACTIVE`, cron `succeeded`. [Phiếu nghiệm thu](qa/FOLK-ON2-2026-11-19.md).
- CI #77 trên `b918742` qua Folk và `snake_ui`. Job `verify` chạm giới hạn 30 phút sau khi bắt đầu bộ Tank Clash ở phút 29. Nâng giới hạn job lên 40 phút. So sánh YAML xác nhận chỉ đổi thời lượng job. Smoke preview khách chạy lại qua 2/2. [CI #77](https://github.com/ducpham2806/Arcade-x/actions/runs/44559811794).
- CI #78 qua Folk, `snake_ui` và motion desktop 54/54. Ca lưu Dungeon trên điện thoại ghi nhận bản lưu nền tiến thêm 98 ms giữa lúc đọc dữ liệu và lúc chặn ghi. Chỉnh fixture đọc và chặn trong cùng lượt JavaScript, giữ phép so sánh bản lưu và kiểm retry. Ca điện thoại chạy lại qua. [CI #78](https://github.com/ducpham2806/Arcade-x/actions/runs/44569239153).
- Studio Game QA & Playtest, Game Release & LiveOps, vai trò QA Lead. Graphify 0.9.108, Folk 133/286, launcher 81/159, depth 1 theo `useFolkOnlineAvailability` và `fetchCatalog`, đối chiếu nguồn. Còn hai tài khoản staging, thiết bị và mạng thật.
