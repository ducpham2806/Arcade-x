# Snake · kiểm đóng gói phục vụ lập plan · 07/11/2026

Nhánh `codex/word-chain-launcher-release`, checkpoint tài liệu `56fd390`, code tương đương `5a64fef`. Chỉ kiểm local Node24.22.1; không deploy Snake, không gọi database/Auth/live runner và chưa chạy toàn bộ suite Snake.

- `npm run build:snake-preview`: exit0,3,79giây. Có cảnh báo chunk>500KB và các URL asset của launcher dùng đường dẫn runtime; chưa kiểm route runtime trong lượt lập plan này.
- Output `SnakeLegendPreview-D7XU0DBp.js`:1.916.911byte raw, Python `gzip.compress` mặc định:1.355.494byte; Vite báo xấp xỉ1,35MB gzip. Chunk `index-DUch0h8G.js`:824.045byte raw. Đây là preview riêng, không chứng minh budget bản public đã đạt; cần phân tích graph/tải đầu ở SN-R0a rồi tối ưu SN-R2a.
- `npm run test:snake-preview`: PASS lazy engine/wrapper, catalog exclusion, production exclusion, deep-link assets, không lặp service worker, hash/budget icon-banner. Một initial chunk, `gameBytes=1916911`.
- Nguồn có `src/assets.ts`~1,16MB và audio/props asset modules; chưa profiling để kết luận phần nào nên tách. Không sửa pipeline hay chia chunk trong nhiệm vụ lập plan.

Tiếp [plan Snake](../snake/CONTINUATION-PLAN.md): còn baseline toàn suite/route/flags, UI chơi-lưu-reload và expiry thật, thiết bị, nội dung/art/audio, tối ưu candidate trước quyết định phát hành.
