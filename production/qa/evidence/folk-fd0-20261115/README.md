# FD-0 · bằng chứng local

Nguồn và giới hạn: [QA](../../../../docs/qa/FOLK-FD0-2026-11-15.md). Ảnh/log/JSON/trace bị ignore; không commit binary hoặc token.

Tái tạo trên Node24 sau npm ci:

- `npm run test:folk`: regression luật/immutability và reward bridge.
- `npm run test:folk-ui`: tự mở Vite mode folk-preview ở loopback4370, chặn mạng ngoài; screenshot OAQ local, shop Kẹo và sân NLC ở 1440×900/390×844.
- `npm run build && npm run test:folk-package && npm run test:bundle`: production không có hai prototype; budget giữ nguyên.
- `npm run test:fast`: suite chung, gồm full-release24 game.
- `npx playwright test tests/motion/polish.test.ts --grep 'Dungeon readable'`: bốn ca quota/recovery, không phải toàn animation suite.

Output browser gốc: test-results/folk-ui. CI artifact folk-fd0-evidence lưu ngay sau suite; full root CI còn kiểm các game khác. Viewport Chromium không thay nghiệm thu điện thoại thật/người mới. Không chạy SQL hoặc live account.
