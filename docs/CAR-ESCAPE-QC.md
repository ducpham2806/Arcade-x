# Car Escape v2 — kiểm thử 11/10/2026

Lượt cuối: **40/40 Playwright đạt**, 0 bỏ qua, 0 flaky. Gồm Car Escape v2/v1, launcher, hướng dẫn, giao diện và các màn liên quan. Không chạy lại toàn bộ bộ test của 18 game trong đợt này.

Bài kiểm chứng bank kiểm toàn bộ 100 màn hợp lệ, khác nhau, replay lời giải thắng và A* trả đúng số lượt tối ưu ≥5. Các màn đầu được đối chiếu BFS độc lập. UI được giải thật qua thao tác chọn xe/điểm đến trên 1440, 390 và 320 px; kiểm kéo/hủy kéo, undo, pause timer, hint worker, sao, unlock, reload, hết lượt, hết giờ, luyện tập và Đường dài.

Kiểm tra integration gồm ticket trả chậm, gửi replay một lần, mở ranking trước khi code game từng được tải, kết thúc phiên rồi replay vẫn giữ sao/màn đã mở. Hai lỗi phát hiện trong các lượt đầu đã sửa: layout thay đổi giữa lúc kéo và kết quả game che nút replay của launcher.

**91 kiểm tra PostgreSQL 16 đạt** (gồm các kiểm tra nền tảng hiện có và Car Escape). Các trường hợp Car Escape gồm bảng 100 màn, ticket owner/RLS, replay sai/ngắn/va chạm/no-op/null, thời gian máy chủ, sao pure/hint, gửi trùng và đổi tài khoản. Chưa gọi Supabase production.

TypeScript và build production đạt. PWA thực: reload offline, mở Car Escape, chạy Web Worker hint từ cache và hoàn thành màn offline; không có page error. Script QC offline nằm ngoài checkout và báo cáo `offline.json` được giữ trong gói review.

Giới hạn: Chromium tự động, không phải playtest người thật hoặc thiết bị iOS/Android thật. SQL chạy database test; trình duyệt dùng Supabase mô phỏng hoặc chặn mạng khi kiểm offline. Chưa kiểm email/hosting/database production. Hình `game-level-100.png` và `map-expert-demo.png` dùng tiến trình legacy mở sẵn trong context demo riêng, không sửa tài khoản thật.
