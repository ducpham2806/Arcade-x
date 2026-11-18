# Bàn giao · 18/11/2026 · FD-L0 chờ duyệt

User yêu cầu dùng Game Studio Agent làm tiếp. [Thẻ Folk Duel](plans/FOLK-GAMES-PLAN.md) đang ở FD-L0, nhánh `codex/folk-duel-foundation` từ `dd2e155` (head PR chat 38). Tách bản review, chỉ merge khi chủ dự án yêu cầu. [Bàn giao chat trước FD-L0](archive/SESSION-HANDOFF-2026-11-18-before-folk-duel-foundation.md) giữ trạng thái staging hai tài khoản còn chờ.

Ô Ăn Quan đã tách state nước đi khỏi input preview/bot, kiểm 24 lượt chuyền tay không mất quân và kết sổ nợ giữ 70 điểm. Nhà Lò Cò vẽ theo hình, hai board dùng `readableCanvasText`, badge số sỏi lớn hơn cho viewport hẹp. Hai icon/banner native theo bàn chơi, xuất SVG/WebP bằng `npm run export:artwork -- --only=o-an-quan,nhay-lo-co`; metadata/package cache và danh sách preview DEV đã có. Runtime giữ luật truy cập catalog production.

Node 24 lint, build, bundle budget và toàn bộ test:fast qua, gồm Folk 9/9, readability 8 + DOM 7, artwork và release 26 game/937 resource. Chromium 390 × 844 và 1280 × 820 kiểm tải icon/banner, bubble, nước đi Ô Ăn Quan, bước nhảy đầu Nhảy Lò Cò và thoát sảnh. Ảnh tại `test-results/folk-review/`, chưa kiểm trên thiết bị thật. Preview cục bộ localhost 4357 dùng backend tắt. Còn CI GitHub và chủ dự án duyệt trước merge.

Studio nguồn `fa7b1db`. Dùng Game UI/UX, Create Game Assets, Game QA/Playtest và vai trò QA Lead. Graphify AST Ô Ăn Quan 5 tệp/67 nút/131 cạnh, Nhảy Lò Cò 5 tệp/56 nút/94 cạnh. Truy vấn `applyOaqMove` và `renderNhayLoCoCourt` depth 1, kiểm trực tiếp code, test luật và renderer. Asset là hình vẽ vector ArcadeX tự tạo trong `src/visuals/folkGameArt.tsx`.

Bước tiếp là FD-L1 sau duyệt, kiểm trọn hai ván offline, bot, đổi lượt, lưu và chơi lại trên thiết bị. Phòng 1v1 và chat `Trận` thuộc FD-ON1. Code có phòng mẫu trong bộ nhớ, hai game dùng kênh `Game`. Chưa chạy migration hoặc phát hành production.
