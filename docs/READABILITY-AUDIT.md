# Rà soát độ dễ đọc — 2026-10-14

## Phạm vi

Launcher: catalog/carousel, header/mobile navigation, Entry/login/recovery, thông báo/splash, profile, settings, leaderboard/PvP history, chi tiết game, chia sẻ, chat, support/resume, loading/save gate, pause/result/confirm/update/toast.

Game: scoodoku, draw-a-shape, dungeon-tap, xiangqi, chess, fill-the-space, neon-runner, eat-em-all, rainbow-blocks, cosmic-defense, blocker, cyber-slice, shikaku, hex-match, word-cross, car-escape, boom-buddies, tile-2048, caro-gomoku, mummy-escape. Chronicles được cập nhật riêng trong gói standalone; chưa tích hợp vào registry.

## Sửa đổi

- Loại bỏ việc theme sáng nhận nhầm token hover/focus như màu base. Mở rộng mapping neutral/pastel sang token đúng để chữ trên giấy sáng đủ đậm.
- Primary/gradient button dùng chữ sáng, kể cả label/heading lồng nhau. Selected tab dùng nền và chữ riêng. Disabled không dựa vào opacity giảm mạnh; giữ nhãn rõ, khác màu nền/viền, giữ disabled semantics.
- Chỉnh nguồn màu chữ phụ của Boom, Blossom, Blocker, Word Cross, dialog Car Escape; nâng chữ khóa/action trên nền tối của Mummy, 2048, Draw A Shape, Fill The Space, Caro và lịch sử Chess.
- Giữ palette từng game. Nhãn đổi màu theo nền thực, alpha và gradient khi mount/đổi tab/skin/hover/focus/state. Chỉ sửa cặp thiếu tương phản; text transparent có chủ đích và sprite/piece art được giữ nguyên.
- Nhãn trực tiếp trên ảnh có nền chữ ổn định. Canvas HUD/callout dùng backing surface, còn pictogram giữ cách vẽ cũ.
- Quan sát DOM lọc transform/position particle để không quét lại theo mỗi animation frame. Không can thiệp luật chơi hoặc dữ liệu cloud.
- Bản duyệt offline đưa vào đủ CSS của tất cả lazy-loaded game, không chỉ CSS launcher/Rainbow/Boom.

## Xác minh và giới hạn

TypeScript và production build đạt. 8 kiểm tra hồi quy (bao gồm nhiều palette/state) và 5 kiểm tra DOM policy đạt: alpha composition, primary nested labels, hover/selected/disabled/light/dark, gradient endpoints, image surface, state restoration, React style updates và đủ 20 game có guard.

9 kiểm tra DOM Chronicles đạt. Mã gameplay không đổi.

Chưa mở lần lượt các màn trên browser thực: công cụ browser QA của workflow hiện không có. DOM policy dùng computed-style mock; không coi đây là kiểm tra pixel/layout/FPS hoặc chứng nhận toàn bộ WCAG. Target là 4.5:1 cho chữ thường, 3:1 cho chữ lớn/icon control; gradient quá hỗn hợp/ảnh nền nhận text surface ổn định.

Chưa push/publish hay ghi thay đổi vào Supabase.

Chạy lại kiểm tra màu/trạng thái: `npm ci` rồi `npm run test:readability`.
