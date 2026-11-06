# VFX/animation web PC · 04/11/2026

## Lỗi đã tái hiện và sửa

Chủ dự án báo Chrome hầu như mất VFX, rõ ở Blossom Blast và Battleship. Khi OS báo `prefers-reduced-motion: reduce`, CSS launcher dùng `.arcade-app *` (cả pseudo-element) ép thời lượng animation/transition còn **0,01 ms** và lặp một lần. Game nằm trong cây này: sprite strip và lớp hiệu ứng có keyframe kết thúc ở opacity 0, nên gần như biến mất dù cài đặt trong game vẫn đầy đủ. Test trên build gốc đã fail: `1e-05s !== 2s`.

- `src/visuals/arcade.css`: giới hạn quy tắc vào `.arcade-launcher`, không ghi đè motion của màn chơi. Giữ giảm chuyển động cho launcher và các tùy chọn accessibility của từng game.
- `src/games/battleship/Board.tsx`: chế độ giảm chuyển động trước đây bỏ hết nổ/cột nước. Nay giữ một khung hình tác động ngắn, đứng yên (300 ms); không bay tên lửa, lắc biển hay thêm khói chuyển động. Chế độ đầy đủ giữ tên lửa, flipbook nổ/cột nước, lửa và khói.
- Không sửa luật, save, quyền chơi hay backend; không ép bật toàn bộ chuyển động khi người chơi đã chủ động giảm hiệu ứng.

## Ngăn tái phát

`npm run test:animations` được thêm vào CI sau `test:games`, gồm:

1. Đối chiếu catalog test với **mọi engine trong packageAssets**, không chấp nhận thành công từ catalog thiếu game. Chặn backend ngoài localhost và service worker để test không ghi production/nhận build cũ.
2. **23 game × 2 chế độ OS**: đo thời lượng/lặp/tiến trình và transform thực của animation/pseudo-element tại màn chơi; kiểm launcher vẫn giảm hiệu ứng đúng. Chạy liên tiếp để bắt CSS lazy-load ảnh hưởng game sau.
3. Kiểm animation vô hạn đang chạy; kiểm vòng vẽ Canvas/iframe của Boom, Chronicles, Rainbow, Eat, Cosmic, Cyber Slice và Neon. Có adapter vào màn chơi riêng, không đo nhầm loader.
4. **12 ca Blossom trong launcher thật**: pop, ong ngang/dọc, bom, mặt trời, cầu vồng × hai chế độ OS. Decode ảnh thật, kiểm timeline tiến lên, opacity nhìn thấy và flipbook đổi frame. Bộ sprite review cũ nằm ngoài launcher nên không bắt được lỗi CSS này.
5. **4 ca Battleship**: sprite explosion/splash thực được gửi vào Canvas; đầy đủ có tên lửa, nhiều frame và (khi trúng) lửa/khói; giảm chuyển động có phản hồi một frame, không có tên lửa.

`test:games` cũng được sửa để kiểm đủ 23 engine với chuột/phím và vào/thoát, thay vì chỉ 22 game đang hiện từ server. Quy tắc về phạm vi CSS được bổ sung vào AGENTS. Các test này chặn lớp lỗi đã tái hiện; không phải lời bảo đảm mọi lỗi hình ảnh tương lai đều không thể xảy ra.

## Kiểm chứng

Node 24.22.2, Chrome desktop 156.0.8078.80 trên macOS; OS motion được emulation bằng browser API. Chưa kiểm riêng Windows hoặc máy của chủ dự án; chưa có URL production để đối chiếu trực tiếp.

- Đã qua: lint, build, bundle budget, test:fast, test:battleship; test:games **23/23**, kiểm isolation/Canvas **46/46**, VFX **16/16** ở lượt chốt, gồm decode ảnh và assert tên lửa/lửa/khói.
- Đã qua: launcher smoke 7 luồng, offline 4 ca, modal 22 ca; launcher idle 3,5 render/s (giới hạn 20).
- Phạm vi 46 ca là motion contract của launcher cho từng game + vòng vẽ các game liên tục, không phải chơi hết mọi màn/nội dung của 23 game.

## Bản test để chủ dự án duyệt

Bản production build riêng đã tắt backend, đủ 23 game, save trên origin test; đã kiểm không có request API backend và không có lỗi JS khi mở Battleship. Chỉ test offline/bot; online/đăng nhập/thanh toán không thuộc gói này.

- Đang phục vụ cục bộ: `http://localhost:4335/`.
- Thư mục build: `/private/tmp/arcadex-pc-animation-review`; gói ZIP kèm `start-review.command`/Python server để chạy lại.
- Không deploy Netlify, không merge main. Chờ chủ dự án kiểm tra và đồng ý trước bước phát hành.
