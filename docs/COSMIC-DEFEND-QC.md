# Cosmic Defend v2 — QC ngày 11/10/2026

Kết quả dưới đây là trên bản build cuối trong workspace. Không phải chứng nhận production, thiết bị thật hay cân bằng toàn bộ GDD.

| Kiểm tra | Kết quả | Phạm vi |
|---|---|---|
| TypeScript / build Vite | Đạt | Toàn bộ app; PWA precache 120 file, 4.986,26 KiB; còn cảnh báo bundle lớn |
| Playwright Cosmic | 12/12, không skip/flaky | Dữ liệu, replay, item, 10 boss, save/gate/repair, desktop/mobile, pause/reload, thắng đúng một lần, dialog, xếp hạng tài khoản, chủ động kết thúc |
| Hồi quy tích hợp | 3/3 | Car Escape giữ sao, CSS ranking; Word Cross/game picker |
| PostgreSQL disposable | 129 PASS | 14 kiểm tra Cosmic và 115 kiểm tra nền/hồi quy; RLS, owner, quota Daily, chống sửa điểm, idempotence, thời gian replay |
| Deno kiểm tra source | Đạt | Canonical Edge Function và engine chia sẻ |
| Node–Deno đối chiếu | 12 mô phỏng, 36.000 frame giống nhau | Hai màn và cả 10 boss; so toàn bộ state |
| Edge Function bundle | 7/7 | Chạy handler thật với HTTP mock: xác thực, owner, replay thật, điểm giả bị bỏ qua, replay lỗi/chưa kết thúc, CORS |
| Cảm ứng Chromium qua CDP | Đạt | Relative drag, touch cancel giải phóng input, không lỗi JS |
| Production build offline | Đạt | Service worker, reload vào game offline, asset/font cache, khôi phục lượt đang chơi; không lỗi JS |
| Bot điều khiển hợp lệ | 92/100 màn thắng | Theo sức mạnh gần cấp đề xuất; không sửa HP/cheat invincibility; không chứng minh 8 màn còn lại bất khả thi |

## Giới hạn cần hiểu

- Browser QA dùng Chromium, desktop 1440 và mobile 390/320; chưa thử iPhone/Android thật, Safari hay đo 60 FPS/độ trễ.
- Bot chưa thắng các màn 38, 40, 41, 63, 66, 68, 70, 100. Cần playtest người thật để cân bằng thay vì khẳng định mọi màn đã được chứng nhận.
- SQL chạy trên database thử nghiệm riêng. Request Supabase của browser và kiểm tra handler được mock có chủ đích; chưa gửi điểm lên Supabase production.
- Ảnh boss được chụp từ renderer game thật trong practice/replay fixture, không phải bằng chứng đã hoàn thành campaign.
- Xem `COSMIC-DEFEND-V2.md` để biết phần GDD đã làm và phần còn thiếu (pattern chi tiết, Endless không giới hạn, âm thanh, xã hội, bản địa hóa).

## Chạy lại trong repository

- `npm run lint` và `npm run build`.
- `npx playwright test tests/product/cosmic-defend-v2.spec.ts` với cấu hình Playwright hiện có.
- `npm run test:supabase` dùng PostgreSQL disposable; không dùng database production.
- Deno: `deno check --node-modules-dir=manual supabase/functions/cosmic-verify/index.ts`.

Gói review kèm báo cáo JSON, log, ảnh và dữ liệu bot cuối. Báo cáo cũ trong workspace đã được thay thế bởi `cosmic-qc-results.json` và `cosmic-integration-results.json`.
