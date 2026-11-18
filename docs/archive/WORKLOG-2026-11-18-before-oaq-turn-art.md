# Nhật ký công việc

Một nhật ký chính, tối đa3mục. [Main trước tích hợp chat](archive/WORKLOG-2026-11-15-main-before-chat-integration.md); [chat trước native](archive/WORKLOG-2026-11-15-before-native-chat-staging.md).

[Nhật ký trước mở rộng chat](archive/WORKLOG-2026-11-18-before-all-game-chat.md).

[Log trước bắt đầu FD-L0](archive/WORKLOG-2026-11-18-before-folk-duel-foundation.md).

[Log trước FD-L1](archive/WORKLOG-2026-11-18-before-folk-offline.md).

## 18/11/2026 · FD-L1 · codex/folk-duel-foundation

- User cho tiếp theo plan. Thêm ván offline phiên bản 1 trong GameBridge, lưu sau mỗi lượt, giữ profile cũ và báo nếu thiết bị chưa ghi được. Kết quả, skin, receipt giữ qua reload. Ô Ăn Quan dùng nút phủ vùng Canvas để chọn ô bằng touch/phím. Nhảy Lò Cò canh lực thảy/nhặt Chàm, báo lỗi theo pha và bỏ Nhà đối thủ.
- Node Folk 11/11, lint/build/bundle và test:fast qua. Chromium đủ 4 ván bot/hai người, reload/đấu lại/nhận thưởng một lần ở 390 và 1280. Hai link DEV qua 320 dọc và 844 ngang; ảnh `test-results/folk-offline/`. Sửa mở cộng đồng từ thông báo để giữ hợp đồng modal đã duyệt.
- Studio Game UI/UX, Save Systems, QA/Playtest và QA Lead. Graphify theo hai engine và module chung. Chờ chủ dự án duyệt offline. Online phòng thật và chat Trận ở FD-ON1.

## 18/11/2026 · FD-L0 · codex/folk-duel-foundation

- User yêu cầu dùng Game Studio Agent làm tiếp. Từ `dd2e155`, sửa Ô Ăn Quan dùng bản sao cho preview/bot/nước đi, giữ quân ở mốc 24, quyết toán nợ giữ tổng 70. Node 24 đưa Folk 9/9 vào test:fast.
- Hai renderer dùng chữ có nền tương phản, tăng cỡ số sỏi ở Ô Ăn Quan. Hai bộ SVG/WebP native theo nét sân đình/ngõ nhỏ, cập nhật cache và DEV preview. Lint, build, bundle và test:fast qua. Chromium 390/1280 qua hai game, có ảnh ở `test-results/folk-review/`.
- Studio Game UI/UX, Create Game Assets, Game QA/Playtest và vai trò QA Lead. Graphify AST mỗi engine, đối chiếu luật và browser. Chờ duyệt FD-L0. FD-L1 là bản offline đủ ván, FD-ON1 còn backend và chat Trận. [Thẻ và tiêu chí](plans/FOLK-GAMES-PLAN.md).

## 18/11/2026 · STUDIO / CHAT toàn game / kế hoạch Folk · codex/chat-all-games

- Cập nhật Game Studio Agent từ `main` nguồn `fa7b1db`; 125 skill, 21 vai trò, 340 blob đúng hash. Check-docs và Claude structure qua. Graphify AST cache của upstream được tái tạo cục bộ khi cần.
- Gắn chat chung vào `/preview/snake/` sau Play. Bảo vệ iframe khỏi vị trí kéo bubble. `test:games` 27/27 qua mở/thu chat và thoát, có cả Nhảy Lò Cò, Ô Ăn Quan. Build, lint, bài preview đăng nhập bằng fixture, chat chung 3/3 và chat trận 3/3 qua.
- Hai tài khoản staging thật còn chờ. [Kế hoạch Folk](plans/FOLK-GAMES-PLAN.md) ưu tiên sửa preview Ô Ăn Quan đổi state, Canvas và artwork trước offline/1v1; xác nhận lại 5/6 ca Folk. Chat của hai game dân gian dùng kênh Game tới khi có phòng online thật. PR 38 draft, chưa merge.
