# Snake Legend · Toàn hành trình · 26/11/2026

Nhánh `codex/snake-full-campaign` tiếp trên PR #51 tại `9d9ead0`. Hành trình chọn ba chương. Thắng đủ màn của chương trước mở chương sau. Bản sau màn cuối đưa người chơi tới kết chương, sao còn thiếu và lối sang vùng mới. Sáu Đường thử vẫn vào từ chân trang. [Bản đồ thiết kế 26 màn](../snake/CAMPAIGN-LEVEL-DESIGN.md).

## Kiểm đã chạy

- Engine thắng 20 màn chính qua `test:snake-journey`. Đủ 3 tim và 30/30 sao trên 10 màn mới. Đã kiểm hai cửa khóa chặn đầu rắn trước công tắc, rơi lệch cầu, đủ năm lượt qua cầu, hai ca bẫy nhện, 45 giây có ngọc và boss đủ 6 đòn qua 3 pha. Sáu Đường thử đạt cả lượt thường và mốc Dash.
- Ca lưu ở `test:snake-journey` kiểm thứ tự mở chương, gộp sao tốt nhất, nhận sai chương bị từ chối, khôi phục giữa màn, phân hồ sơ và giữ nguyên byte tiến trình/mốc R01 trong lúc ghi hai chương sau. `test:snake-local` qua nhóm cloud, session, hành trình, boss, props và audio.
- Chromium bản sảnh kiểm 2 ca mới. Khổ 320×568 mở đúng khóa chương, vào Bến Quả Hổ Phách, quay về, tải lại và chơi thắng bằng joystick. Khổ 1024×720 dùng dữ liệu hoàn thành để kiểm phần kết, chuyển vùng và quay lại lấy sao. Đã xem ảnh lúc chạy và chỉnh vị trí nút Bắt đầu, màu chữ trên thẻ màn đã chọn. Bằng chứng lưu tại `production/qa/evidence/snake-campaign-20261126/`.
- TypeScript, build launcher, ngân sách bundle, build/package preview và kiểm runtime preview đã qua. HTML 2.324.694 byte chạy Sân Trụ Nắng với mạng tắt trong Chromium, điều khiển bằng phím, xem toàn cảnh, tạm dừng và quay về Hành trình với đúng mốc 3-1. Không có lỗi trang hoặc yêu cầu ra ngoài.
- 11 ca Chromium bản sảnh qua các lượt kiểm. Lượt chung qua 9 ca và có hai ca bị tải lại trang giữa chừng. Ca hồ sơ qua khi chạy riêng. Lượt Đường thử chạy lại phát hiện sai khác làm tròn kỷ lục 18,95 giây giữa HUD và kết quả. Sau khi dùng chung định dạng tiếng Việt, Đường thử qua 3/3 ca, gồm thắng cả sáu bằng joystick, kiểm cảm ứng và tải lại kỷ lục 19,0 giây ở cả hai vị trí.

## Phạm vi

Studio Level Design, GDD Architect và QA & Playtest, vai trò Team Level, Level Designer và QA Lead. Graphify AST `src/games/snake-legend` 523 nút và 1.342 cạnh. Seed `campaignMap`, depth 1, budget 1.000 nối tính tiến độ với app, Hành trình và cửa vào màn. CSS và các đường đi được kiểm bằng nguồn hẹp và lượt Engine.

Hai chương mới lưu trên thiết bị và theo hồ sơ. Hai vùng có bảng màu riêng, dùng lại bộ nhân vật và nhịp Nhện Mẹ sáu đòn ở sân mới. Lượt cân bằng với người chơi mới và thiết bị thật còn chờ. Chưa merge hoặc phát hành.
