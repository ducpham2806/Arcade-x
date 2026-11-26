# Snake Legend · Xem đường và kỷ lục · 26/11/2026

`codex/snake-trial-scouting` tiếp trên PR #49 tại `6d9a729` sau CI #96. Đường thử có nút **Xem đường** trong bảng chuẩn bị và tạm dừng. Bản đồ dùng lại địa hình Canvas, đánh số các quả và tô dấu quả kế tiếp. Trên màn dọc có chỉ dẫn của đường đang chọn. Màn ngang giữ tối đa diện tích bản đồ.

Xem đường giữ nguyên tick, thời gian và tiến độ lượt. Escape hoặc **Quay lại** trở về bảng cũ với focus đúng nút. Có thể bắt đầu hoặc tiếp tục trực tiếp từ bản đồ. Khi sảnh tạm dừng, bảng bản đồ đóng và ván vẫn dừng. Góc theo rắn trong lúc chơi giữ theo lựa chọn trước khi mở bản đồ.

Bảng chuẩn bị hiện số quả, mốc Dash tùy chọn và kỷ lục đã lưu. Bảng hoàn thành hiện kỷ lục mới và số giây cần cải thiện khi chưa đạt mốc. Dữ liệu bảng đọc từ Engine và save hiện tại. Không thêm khóa lưu hay đổi hình học đường thử, mô phỏng hoặc checkpoint R01.

Studio Game UI/UX và QA & Playtest, vai trò Art & UI Lead và QA Lead. Graphify AST Snake 484 nút/1.268 cạnh, dùng `setScouting` để xác định hai đường vào/ra qua điều khiển và bảng trạng thái. Phạm vi gồm `lab-app.ts`, `render.ts`, `styles.css` và `tests/snake/trials.browser.ts`.

## Kiểm chứng

- `test:snake-player` 8/8 và `test:snake-controls` 7/7 qua. Ca bản sảnh chạy ba đường, lưu/tải lại đúng ba kỷ lục, kiểm save và checkpoint R01. Ca cảm ứng mở bản đồ trên 320×568, 390×844, 568×320, kiểm focus, Escape, tick đứng yên và tạm dừng từ sảnh.
- Lượt kiểm cuối sau khi chỉnh tương phản màu kem cho ghi chú trên màn dọc qua. Đã xem ảnh bản đồ và lưu ảnh chạy thật trong `test-results/snake-scouting-visuals/` cùng bản sao bỏ qua trong thư mục bằng chứng Studio.
- TypeScript, nhóm hiển thị Snake boss, độ tương phản DOM/Canvas, build/bundle, gói preview và runtime preview qua.

`export:snake-journey` tạo HTML 2.297.183 byte. Chromium tải đúng file qua loopback, tắt mạng, mở bản đồ Suối Hai Nhịp, chơi, dừng và dùng Escape để về bảng. Không yêu cầu tài nguyên bên ngoài và không lỗi trang.

Thiết bị thật và production còn chờ nghiệm thu.
