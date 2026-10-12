# ArcadeX — Tiến độ triển khai nền tảng và nhóm giải đố

Ngày: 11/10/2026. Chưa phát hành production. Đã triển khai nền tảng, một phần ba game mẫu và một phần ba game giải đố đầu tiên; chưa hoàn tất toàn bộ brief của 18 game.

## Ưu tiên hiện tại: launcher

Theo yêu cầu mới, ưu tiên launcher sáng, luồng vào/chơi/kết thúc và catalog Supabase mở trước khi tiếp tục từng game. Xem [kiến trúc và rollout launcher](LAUNCHER-UPGRADE.md) và [phương án kiếm tiền](LAUNCHER-MONETIZATION.md). Chưa phát hành hosting hoặc áp dụng migration launcher lên production.

## Thay đổi đã có trong mã

- Cả 18 game chuyển sang React lazy/Suspense. Có trạng thái tải và xử lý lỗi mở game. Service Worker vẫn precache các gói để giữ khả năng offline; tổng lượt tải/cache không giảm tương ứng với kích thước gói JS chính.
- Các game lưu qua GameBridge có envelope riêng: schemaVersion, payload, server revision, dirty flag và bản xung đột. Khóa cũ được giữ để tương thích. Lỗi hết dung lượng không báo lưu thành công.
- Tài khoản đồng bộ các envelope bằng RPC Supabase hiện có tại `players/{id}/game_sessions/save-{game}`. Kiểm revision trước ghi, giữ bản local và remote khi có xung đột. Mở lại game cho chọn một bản; giữ bản dự phòng trước khi chọn. Không chặn ván đang chơi bởi xung đột cloud.
- Trạng thái lưu nằm trên thanh tiêu đề, không chiếm vùng bàn chơi. Các ca Auth/SQL dùng backend mô phỏng hoặc PostgreSQL test riêng, không sửa dự án thật.

## 2048

- Tách luật slide/merge thành engine thuần, kiểm một ô chỉ hợp nhất một lần và không spawn sau nước không đổi bàn.
- Sinh ô có seed và lưu trạng thái RNG. Undo khôi phục bàn, điểm, số lượt, max tile và timer/RNG với save mới; dữ liệu legacy vẫn đọc được.
- Kỷ lục và submission tách Classic/5×5/Rush và có/không trợ giúp. Kỷ lục cũ chưa biết thể lệ vẫn giữ trong dữ liệu legacy, không tự gán sang bảng điểm thuần mới.
- Bỏ danh sách bạn bè/thách đấu giả, thưởng ngọc/EXP ở mốc ô. Giữ thông báo đạt ô số ngắn, tôn trọng reduced motion.
- Xác nhận trước khi đổi chế độ bỏ ván; chặn input trùng trong cùng lần commit, hủy touch và tránh xử lý swipe hai lần bởi wrapper.
- Ô số có chuyển động xuất hiện ngắn, màu rõ; bàn co theo chiều cao màn hình, mobile dùng bốn nút hướng cùng một hàng với vùng chạm tối thiểu 44 px.

## Blocker

- Lưu và khôi phục bàn 8×8, khay ba khối, điểm/combo, trạng thái challenge và thời gian.
- Không sinh khay mới đè lên ván khôi phục. Ván đã kết thúc bắt đầu ván mới.
- Pointer cancel hoặc thao tác khi pause không được đặt khối. Board shake tắt khi reduced motion.
- Các mục tiêu tap-to-place, bag có seed và cân bằng challenge trong roadmap vẫn còn cần triển khai; chưa gọi bản này là hoàn thiện mọi yêu cầu của Blocker.

## Neon Runner

- Mô phỏng theo bước 60 Hz, tách số bước update khỏi refresh rate; giới hạn catch-up và bỏ backlog lúc pause.
- RNG gameplay tách khỏi particle; gap chướng ngại lấy một lần mỗi lần spawn và tăng theo tốc độ.
- Giữ checkpoint/seed/trạng thái chạy; lưu lại khi thay đổi pause; không khôi phục ván đã chết.
- Resize không kéo nhân vật đang nhảy xuống đất; vị trí obstacle/item dịch theo mặt đất. Thêm chuyển động chân mà không đổi hitbox.
- Điểm tích lũy số lẻ thay vì làm tròn về 0 từng frame ở đầu ván. Nút pointer tránh double jump từ touch và compatibility mouse event.
- Chưa có chiến dịch/daily, sprite nhân vật hoàn chỉnh hoặc xác minh replay trên server. Chưa đo FPS/pin thiết bị thật.

## Giới hạn nền tảng cần tiếp tục

- Những game ghi trực tiếp localStorage ngoài GameBridge vẫn dùng snapshot tài khoản cũ; chưa chuẩn hóa tất cả khóa tiến trình của 18 game.
- Tiến trình dài hạn chưa hợp nhất theo union/max/min cho tất cả game. Đây là bảo vệ xung đột ván, chưa phải giải quyết toàn bộ đồng bộ đa thiết bị.
- Các tab cùng origin dùng chung localStorage; chưa có khóa ván giữa các tab. Không nên mở cùng một game/tài khoản ở hai tab để chơi đồng thời.
- Payload local/điểm vẫn không phải dữ liệu chống gian lận. PvP authoritative, backend theo bảng chuyên biệt và migration mới thuộc các đợt sau.
- Snapshot legacy được giữ để dự phòng, nên chưa giảm kích thước dữ liệu cloud như kiến trúc cuối cùng dự kiến. Có cơ chế đồng bộ lại qua checkpoint 5 giây/online, chưa có outbox cho mọi loại dữ liệu.
- Dịch vụ Supabase production chưa được xác minh trong đợt này. Phần lưu mới dùng migration nền tảng hiện có, không yêu cầu migration SQL mới riêng cho game saves.

## Thứ tự tiếp tục

Hoàn thiện inventory/schema và UX của ba game mẫu, đo hiệu năng/analytics nền tảng; rồi nhóm puzzle, nhóm action, PvP và Dungeon Titan theo roadmap. Nội dung, solver, art và playtest riêng của 15 game còn lại chưa thay đổi ở đợt này.

## Kiểm chứng nền tảng và ba game mẫu

- TypeScript và build production đạt. QC toàn bộ trước đợt giải đố: 122/122 kiểm tra đạt trong một lượt (7,9 phút).
- 41 kiểm tra SQL/RPC bằng PostgreSQL test đạt; không phải kiểm chứng Supabase production.
- PWA cài và tải lại offline đạt; 18/18 game mở và tạm dừng offline đạt. Chưa chơi hết mọi màn offline hoặc xác minh PvP offline.
- Gói JS chính giảm từ 2.243.514 xuống 1.216.730 byte (45,8%); precache vẫn tải các gói game.

## Đợt giải đố đang triển khai

### Car Escape

Lưu bàn chơi, màn hiện tại, số nước, tiến trình và tối đa 100 bước hoàn tác qua save riêng của game. Đọc khóa tiến trình cũ. Kiểm tra snapshot không chồng xe, sai hướng hoặc vượt bàn trước khôi phục. Chỉ kết thúc khi thả xe, chống thưởng lặp; pointer cancel hoàn trả vị trí trước kéo, pause chặn kéo và hủy thao tác dở. Bỏ thưởng xu trong màn kết quả.

Còn cần solver/gợi ý, generator có seed, đánh giá sao có căn cứ và nâng cấp toàn diện đồ họa theo brief. Đây chưa phải hoàn tất toàn bộ brief Car Escape.

### Scoodoku

Lưu bàn và đáp án, số đã điền, ghi chú, lịch sử hoàn tác tối đa 200 bước, thời gian, lỗi, chế độ, lượt gợi ý và kết quả. Kiểm tra cấu trúc bàn trước khôi phục, đọc progress-only legacy. Gợi ý dùng ba lượt miễn phí mỗi ván, giữ ngân sách sau reload, không phụ thuộc ví; chặn chỉnh số/ghi chú/undo bằng phím khi pause.

Còn cần gợi ý suy luận đầy đủ thay vì tiết lộ đáp án, hoàn tác ghi chú của các ô liên quan, nâng cấp phần đồ họa/hướng dẫn và kiểm chứng cân bằng mọi chế độ theo brief.

### Shikaku

Lưu đề bài, vùng chính/vùng nháp, lịch sử hoàn tác tối đa 100 bước, chế độ, thời gian, số mạng và điểm. Kiểm tra đề có partition đầy đủ, không chồng lấp, đúng diện tích mỗi clue trước khôi phục. Generator có seed và contentVersion 1 để tái tạo đề. Pointer cancel bỏ vùng xem trước; pause hủy thao tác dở và đình chỉ chuyển đề sau chiến thắng. Marker completed bảo vệ khôi phục khỏi thưởng lặp.

Generator chứng minh một partition hợp lệ, chưa chứng minh nghiệm duy nhất. Các kiểm tra này không chứng minh chỉ có một lời giải. Solver tính số nghiệm và nâng cấp hướng dẫn/đồ họa còn cần triển khai.

Tiếp theo trong roadmap: Fill the Space, Draw A Shape, Word Cross, Mummy Escape. Không có migration SQL mới trong đợt này; dùng game_sessions/RPC hiện có. Chưa xuất bản hoặc thay đổi cơ sở dữ liệu production.

## Kiểm chứng đợt Car Escape / Scoodoku / Shikaku

- TypeScript và build production đạt trên mã hiện tại. `git diff --check` đạt.
- Lượt hồi quy cuối: 11/11 đạt, 0 lỗi, 0 flaky, 0 skipped; thêm một kiểm tra riêng khôi phục Shikaku đã hoàn thành và tạm dừng chuyển đề đạt (1/1). Đây là kiểm tra phần thay đổi; không phải lượt QC full mới sau đợt giải đố.
- Generator Shikaku: 70 đề có seed, kích thước 4–10, đều có partition hợp lệ; cùng seed tái tạo đúng đề. Chưa kiểm uniqueness.
- PWA với Service Worker thật trên build mới: defer khi đang chơi, kích hoạt thủ công, tự cập nhật lúc mở app, phục hồi lỗi cập nhật và resume offline đều đạt, không có page error. Dùng origin test tạm, không phát hành production.
- Đã chụp và xem bố cục mobile 390×844 của cả ba game; có ảnh desktop 1440×900. Chưa xác minh Safari hoặc điện thoại vật lý.
- Báo cáo chi tiết: `/workspace/arcadex-puzzle-final-results.json`, `/workspace/arcadex-shikaku-completed-results.json`; ảnh và kết quả PWA tại `/workspace/arcadex-product-release/`.

## Car Escape v2 — thay thế bản giải đố trước

Đã viết lại engine, renderer isometric và 100 màn chứng minh 5–26 lượt tối ưu; thêm modes, sao, hint worker, Đường dài và bảng xếp hạng xác thực replay. Xem [Car Escape v2](CAR-ESCAPE-V2.md). Migration riêng chưa áp dụng production. Các mục Car Escape cũ phía trên là lịch sử của bản v1.


### Car Escape: cập nhật đồ họa 2D

Theo phản hồi chơi thử, thay renderer isometric bằng TopDownBoard: ô vuông, kéo ngang/dọc, xe đồ chơi vector, texture mặt đường và trang trí ngoài bàn. Không đổi engine, 100 màn, version save hoặc luật sao/xếp hạng. QC bản hiện tại: [CAR-ESCAPE-2D-QC.md](./CAR-ESCAPE-2D-QC.md), 18/18 bài Car Escape, cảm ứng và offline đạt. Metadata launcher có migration bổ sung 202610110005.


### Word Cross v2 — 11/10/2026

Viết lại engine, generator, gameplay và save. 117.597 dạng từ offline, 200 màn/bảng 6–12 ô, 5 chế độ, sao và ba bảng thành tích. Máy chủ sinh ván và kiểm replay; tiếp tục ván giữ bảng, ván chiến dịch mới tránh từ vừa gặp. Mô tả: [WORD-CROSS-V2.md](./WORD-CROSS-V2.md); QC: [WORD-CROSS-QC.md](./WORD-CROSS-QC.md), 16/16 Word Cross + 2/2 hồi quy Car, 115 kiểm tra SQL và offline/cảm ứng đạt. Chưa áp dụng SQL trên Supabase production, chưa phát hành hosting.
