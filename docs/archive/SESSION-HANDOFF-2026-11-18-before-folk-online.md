# Bàn giao · 18/11/2026 · Ô Ăn Quan chờ duyệt trình diễn

User yêu cầu animation tay bốc/rải từng viên, hiệu ứng ăn, mẹt riêng, lịch sử và HUD hai bên. [Thẻ Folk](plans/FOLK-GAMES-PLAN.md), `codex/folk-duel-foundation`, [PR 40 nháp](https://github.com/ducpham2806/Arcade-x/pull/40), nguồn trước việc `1d99edb`. [FD-L1 trước bổ sung](archive/SESSION-HANDOFF-2026-11-18-before-oaq-turn-art.md). CI #68 xanh cho bản FD-L1 trước thay đổi.

Timeline từ bước bộ luật trong `turnAnimation.ts`, RAF và âm thanh theo mốc ở `useOaqAnimation.ts`, Canvas tay/gia tốc sỏi rơi/vòng sáng và mẹt ở `renderTurn.ts` và `renderer.ts`. Lưu đồng thời bàn đã xác nhận và lịch sử lượt ngay khi nhận. Khi tải lại, mở bàn đã chốt. Save cũ thiếu phần lịch sử vẫn đọc được, bắt đầu ghi từ lượt mới. Cam cho ghế 1, xanh ngọc ghế 2, chữ và trạng thái rõ. Trái/Phải theo hàng đang ngồi trên màn hình. Mẹt đại diện vật lý và ghi đúng số quân, điểm. Tạm dừng trình diễn khi chat/tiệm/lịch sử, có nút bỏ qua hoặc chế độ giảm chuyển động.

Lint/build/bundle, test:fast, Folk 12/12, Playwright 5/5 (có lượt đầy đủ khớp timeline, nhận đúng mẹt, lịch sử sau reload), readability, smoke và CSS motion 2/2 Ô Ăn Quan qua. Ảnh và video cục bộ `test-results/folk-offline/oaq-*`. [Preview Ô Ăn Quan](http://127.0.0.1:4357/?review=o-an-quan) dùng backend tắt. Chưa kiểm điện thoại thật hoặc phòng online liên thiết bị. Chờ duyệt trước merge.

Studio `fa7b1db`, Game Feel, Game UI/UX, Game QA/Playtest, QA Lead. Graphify AST `o-an-quan` 9 tệp/114 nút/290 cạnh, truy vấn `OaqMatchBoard`, `useOaqAnimation` depth 1, đối chiếu timeline, Canvas và save.
