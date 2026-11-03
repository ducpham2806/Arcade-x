# Quyết định đang chờ chủ dự án

Cập nhật: 02/11/2026. Khi có câu trả lời, ghi vào cột "Quyết định" và xoá khỏi danh sách chờ.

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

## Phòng đấu Nối Từ (WC3) — xem `docs/WORD-CHAIN-SERVER.md`

| # | Việc cần chủ dự án | Ảnh hưởng | Trạng thái |
|---|---|---|---|
| 7 | Áp `supabase/word-chain/schema.sql` lên staging, deploy `word-chain-room`, chạy `scheduler.sql` | Chặn chơi online 2–4 người (luyện với bot vẫn chơi được) | _chờ_ |
| 8 | Áp migration danh mục `20261102090000_word_chain_catalog.sql` lên production | Game chưa hiện ở bản production cho tới khi áp | _chờ_ |

## Tank Clash online (P2) — xem `docs/tank-clash/P2-review.md`

| # | Câu hỏi | Ảnh hưởng | Quyết định |
|---|---|---|---|
| 9 | **Nơi chạy room server Tank Clash** (tiến trình Node giữ WebSocket lâu): VPS nhỏ hay dịch vụ container có WebSocket? Claude sẽ trình giá cụ thể trước khi đăng ký. | Chặn chơi online qua Internet và chơi thử thật (P2.5–P2.6) | _chờ_ |

## Kho mã (M4)

| # | Câu hỏi | Ảnh hưởng | Quyết định |
|---|---|---|---|
| 5 | Giảm `.git` (114 MB): viết lại lịch sử hay chuyển art nguồn sang Git LFS? | Dung lượng clone | _chờ_ |
| 6 | Có ghi ngoại lệ "hộp thoại xác nhận/popup kết quả giữ kích thước nhỏ" vào `AGENTS.md` không? | Quy tắc modal | _chờ_ |
