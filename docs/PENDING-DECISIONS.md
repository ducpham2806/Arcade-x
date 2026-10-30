# Quyết định đang chờ chủ dự án

Cập nhật: 30/10/2026. Khi có câu trả lời, ghi vào cột "Quyết định" và xoá khỏi danh sách chờ.

## Commerce (M8) — xem `docs/COMMERCE-ROLLOUT.md`

| # | Câu hỏi | Ảnh hưởng | Quyết định |
|---|---|---|---|
| 1 | Project Supabase **staging** nào dùng để thử flag `VITE_ACCESS_CONTROL_V2`, và tài khoản nào làm admin? | Chặn bước 1 (đã sẵn sàng thử) | _chờ_ |
| 2 | **Nhà cung cấp thanh toán** cho checkout (cổng VND, webhook ký số, tài khoản merchant test)? | Chặn bước 4 | _chờ_ |
| 3 | **Nơi chạy** server commerce: Supabase Edge Function hay Netlify Function? | Chặn bước 2–5 | _chờ_ |

## Phòng đấu Chess/Xiangqi/Caro (M7) — xem `docs/DUEL-SERVER.md`

| # | Việc cần chủ dự án | Ảnh hưởng | Trạng thái |
|---|---|---|---|
| 4 | Áp `supabase/duel/schema.sql` lên staging, deploy `duel-room`, lên lịch `tick` | Chặn cutover sang server làm trọng tài | _chờ_ |

## Kho mã (M4)

| # | Câu hỏi | Ảnh hưởng | Quyết định |
|---|---|---|---|
| 5 | Giảm `.git` (114 MB): viết lại lịch sử hay chuyển art nguồn sang Git LFS? | Dung lượng clone | _chờ_ |
| 6 | Có ghi ngoại lệ "hộp thoại xác nhận/popup kết quả giữ kích thước nhỏ" vào `AGENTS.md` không? | Quy tắc modal | _chờ_ |
