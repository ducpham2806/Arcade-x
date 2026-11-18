# Nhật ký công việc

Một nhật ký chính, tối đa3mục. [Main trước tích hợp chat](archive/WORKLOG-2026-11-15-main-before-chat-integration.md); [chat trước native](archive/WORKLOG-2026-11-15-before-native-chat-staging.md).

[Nhật ký trước mở rộng chat](archive/WORKLOG-2026-11-18-before-all-game-chat.md).

[Log trước bắt đầu FD-L0](archive/WORKLOG-2026-11-18-before-folk-duel-foundation.md).

[Log trước FD-L1](archive/WORKLOG-2026-11-18-before-folk-offline.md).

[Log trước trình diễn Ô Ăn Quan](archive/WORKLOG-2026-11-18-before-oaq-turn-art.md).


[Log trước FD-ON1](archive/WORKLOG-2026-11-18-before-folk-online.md).

## 19/11/2026 · FD-ON1 · phòng xác thực và chat Trận

- Tiếp plan từ head local `92e3dd3`/remote `791810c`, nhánh `codex/folk-duel-foundation`. Edge kiểm Auth, PostgreSQL CAS + receipt, FIFO theo game, resume, leave, timeout và hai phiếu rematch. NLC server giữ pha/nhịp/tính điểm. Ô Ăn Quan bắt đầu đồng hồ sau timeline rải. Adapter chat dùng chung, unread và lời cạnh HUD, gỡ theo phiên.
- 21 Node/PGlite, 7 browser offline/online, lint/build/bundle và test:fast qua. Test chứng minh receipt gửi lại sau mất phản hồi và rematch đồng thời. Bản staging ref `khqipuipeawzlkqmdzdg` đã áp schema, Edge v2 và cron 10s trả 200. Chưa kiểm hai tài khoản thật, thiết bị hoặc độ trễ thật. Thưởng online giữ tắt, PR nháp chờ duyệt. [QA](qa/FOLK-ONLINE-2026-11-19.md).
- Studio Backend Architect, QA/Playtest, Technical Director. Graphify cập nhật Folk 126/277 và Edge 115/240, depth 1, đối chiếu source và PGlite.

## 18/11/2026 · Ô Ăn Quan · trình diễn và lịch sử lượt

- User yêu cầu tay bốc, rải từng ô, sỏi rơi, hiệu ứng ăn và mẹt riêng. Dùng trace luật với RAF, tạm dừng khi mở chat, bỏ qua hoặc giảm chuyển động. Lưu bàn đã chốt và lịch sử đường rải/ô ăn từng lượt. Hiện hai hàng theo ghế cam/xanh ngọc, hướng Trái/Phải theo phía hiển thị.
- Folk 12/12, Playwright 5/5, lint/build/bundle, readability, smoke Ô Ăn Quan và CSS motion 2/2 qua. Xem ảnh/chuyển động ở `test-results/folk-offline/oaq-*`; chưa đi máy thật. Studio Game Feel, UI/UX, QA/Playtest. Graphify Ô Ăn Quan phạm vi bước, renderer và host.

## 18/11/2026 · FD-L1 · codex/folk-duel-foundation

- User cho tiếp theo plan. Thêm ván offline phiên bản 1 trong GameBridge, lưu sau mỗi lượt, giữ profile cũ và báo nếu thiết bị chưa ghi được. Kết quả, skin, receipt giữ qua reload. Ô Ăn Quan dùng nút phủ vùng Canvas để chọn ô bằng touch/phím. Nhảy Lò Cò canh lực thảy/nhặt Chàm, báo lỗi theo pha và bỏ Nhà đối thủ.
- Node Folk 11/11, lint/build/bundle và test:fast qua. Chromium đủ 4 ván bot/hai người, reload/đấu lại/nhận thưởng một lần ở 390 và 1280. Hai link DEV qua 320 dọc và 844 ngang; ảnh `test-results/folk-offline/`. Sửa mở cộng đồng từ thông báo để giữ hợp đồng modal đã duyệt.
- Studio Game UI/UX, Save Systems, QA/Playtest và QA Lead. Graphify theo hai engine và module chung. Chờ chủ dự án duyệt offline. Online phòng thật và chat Trận ở FD-ON1.
