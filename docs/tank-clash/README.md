# Tank Clash — bản thử

P0–P3c đã code; UI hiện có sân tập, 1v1 bot, 2v2 bot và online **1v1**. Online 2v2/queue mới có backend, **P3d UI chưa làm**. Chưa hosting/launcher/phát hành; art tạm. Protocol hiện hành `tank-clash.p3.v1`. Tiếp quản: [PLAN §10–§12](PLAN.md), làm UI đọc [P3-SPEC §7–§9](P3-SPEC.md).

Node 24, từ thư mục gốc:

```bash
npm ci
npm ci --prefix server/tank-clash-room --ignore-scripts
npm ci --prefix server/tank-clash-spike --ignore-scripts
node scripts/export-tank-review.mjs
npm run dev:tank-server
```

Mở `deliverables/Tank_Clash_P2_Playtest.html` ở hai cửa sổ, chọn **04 / Online 1v1**. Server `ws://127.0.0.1:3223/tank`; đổi bằng `?server=wss://...`, mời `?room=MÃ`. File preview là output tự chứa; sửa source/script rồi sinh lại. PC WASD/mũi tên, chuột ngắm/bắn, Space khiên, P/Escape tạm dừng; touch cần trái lái, cần phải ngắm/nhả bắn, nút khiên. Mất focus xóa input.

Test: `npm run test:tank-clash`, `test:tank-clash-server`, `test:tank-clash-ui` (Chromium). Code/env/giới hạn ở PLAN §11; số đo P2 ở `P2-review.md`. Chơi local không chứng minh chất lượng Internet; tuning còn tạm. Chỉ đưa catalog sau P4 và bản duyệt theo kế hoạch.
