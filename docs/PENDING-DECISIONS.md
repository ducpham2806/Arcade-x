# Quyết định chờ · 04/11/2026

Giữ ID cũ để dẫn chiếu. Đây là sổ quyết định duy nhất; khi có câu trả lời, chuyển xuống “Đã quyết”, ghi ngày và cập nhật task liên quan.

| ID | Cần chốt | Chặn | Tài liệu chi tiết |
|---|---|---|---|
| 1 | Supabase staging nào; tài khoản admin/test và người vận hành | CM1; môi trường WC2/DU1 | `COMMERCE-ROLLOUT.md` |
| 2 | Cổng thanh toán VND, webhook ký số, merchant sandbox | CM3 | `COMMERCE-ROLLOUT.md` |
| 3 | Commerce chạy Supabase Edge hay Netlify Functions | CM2–CM4 | `server/commerce/README.md` |
| 4 | Lịch/môi trường triển khai Duel + cutover UI | DU1 | `DUEL-SERVER.md` |
| 5 | Có xử lý lịch sử Git/art bằng rewrite hay LFS không | TD3 (tùy chọn) | Đo dung lượng trước; con số cũ 114 MB không còn là số đo hiện tại |
| 6 | Có cho popup xác nhận/kết quả kích thước nhỏ ngoại lệ modal không | Chỉ khi đổi quy tắc | Chưa duyệt; giữ `AGENTS.md` hiện hành |
| 7 | Môi trường/lịch bật Nối Từ online sau thử staging | WC2 | `WORD-CHAIN-SERVER.md` |
| 8 | Thời điểm áp catalog Nối Từ lên production | WC1 | `supabase/migrations/20261102090000_word_chain_catalog.sql` |
| 9 | Hosting WS Tank Clash: khu vực, WSS, ngân sách | TC2 | `tank-clash/PLAN.md` §10; trình phương án/giá trước đăng ký |

## Đã quyết · 03/11/2026

#10 duyệt P3; #11 sân lớn/ngẫu nhiên (đã làm 1040×624); #12 hàng chờ công khai bắt đăng nhập; #13 cho đầu hàng; #14 cục bộ 1 người + bot đồng đội vs 2 bot. Luật chính xác: `tank-clash/P3-SPEC.md`. Không hỏi lại các quyết định này.
