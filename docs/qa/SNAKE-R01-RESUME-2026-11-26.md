# Snake Legend · tiếp tục R01 · 26/11/2026

Nhánh `codex/snake-touch-resume` từ `main@5cd1539`. Đưa nội dung trình diễn của `b9f7134` lên nền hiện tại, giữ bộ art và 10 màn Thảo Nguyên Xanh. Hành trình có sổ tay từng màn, kết chương, tổng sao và nút quay lại màn thiếu sao. Tiểu Xà và Nhện Mẹ dùng chuyển động Canvas từ ảnh gốc. [QA nguồn 14/11](SNAKE-R01-CONTENT-2026-11-14.md).

`src/games/snake-legend/src/input.ts` chỉ giữ điểm chạm khi chơi. Hủy điểm chạm đang sở hữu sẽ xóa cả hai thao tác và tạm dừng an toàn. Ngón phụ bị bỏ qua có thể rời đi mà không làm ngắt lượt. Núm joystick nằm trong vòng ở mọi kích thước, giá trị lái và độ nhạy giữ như cũ. `story-app.ts` và `lab-app.ts` vô hiệu hóa dock lúc chưa bắt đầu, tạm dừng và kết thúc.

## Kiểm chứng 26/11

- `test:snake-ui` qua 14/14 ca Chromium và bộ kiểm tra fixture. Ba ca mới hoặc mở rộng thất bại trước khi sửa và qua sau khi sửa. Kiểm được đa chạm, đổi hướng màn hình, các kích thước xuống 320×568 và 568×320, lưu/khôi phục ván, phiên hết hạn mô phỏng và dọn tài nguyên.
- `test:snake-local` qua sáu nhóm, có 8 trạng thái Nhện Mẹ, kết chương và tiến trình 29→30 sao. `npm run lint` qua.
- `test:snake-player` qua 6/6 ca gồm chơi và lưu trên bản sảnh, tách owner, bàn phím, 8 cảnh Nhện Mẹ, kết chương ở 3 khổ màn, và thử lưu lại khi hết quota ở màn cuối. Kiểm `test:storage` khớp golden, `test:readability` qua.
- Build production, rollback, preview, bundle, `test:snake-catalog` và `test:snake-preview` qua. Catalog tải đầu 307.808 byte gzip, chunk lớn nhất 484.949 byte. `export:snake-journey` tạo HTML 2.195.985 byte. Chromium chặn `file://` theo chính sách máy, nên phục vụ đúng file qua loopback. Đã tắt mạng khi vào màn, điều khiển và dừng, sau đó mở lại trang và thấy checkpoint. Không có lỗi trang hay yêu cầu ra ngoài.
- Đã xem ảnh joystick 390×844, màn ngang 568×320, Nhện Mẹ và kết chương thực thi Canvas/DOM. Ảnh local do Playwright ghi ở `test-results/snake-ui/`, `test-results/snake-player/` và bản sao bỏ qua trong `production/qa/evidence/snake-content-20261114/`. Nguồn đối chiếu: `input.ts`, `lab-app.ts`, `story-app.ts`, `journey.ts`, `styles.css`, `character-motion.ts`, `boss-render.ts`, `render.ts`.
- Studio Input Systems, Game QA & Playtest, vai trò QA Lead. Graphify AST `src/games/snake-legend` từ 424/1101 lên 442 nút/1160 cạnh. `Controls` xác nhận hai nơi dùng chung điều khiển. `chapterEnding` nối đoạn kết với Hành trình và kết quả từ save.

Lượt này chưa chạy lại toàn bộ chiến dịch 10 màn bằng trình điều khiển tự động. Thiết bị Android/iPhone thật, người chơi mới, backend thật và production chưa được nghiệm thu.
