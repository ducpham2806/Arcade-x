# Quyết định chờ · 05/11/2026

Giữ ID cũ để dẫn chiếu. Đây là sổ quyết định duy nhất; khi có câu trả lời, chuyển xuống “Đã quyết”, ghi ngày và cập nhật task liên quan.

| ID | Cần chốt | Chặn | Tài liệu chi tiết |
|---|---|---|---|
| 1 | Tài khoản admin/test và người vận hành; staging đã tạo theo lựa chọn 04/11 | TC2/CM1; môi trường WC2/DU1 | `tank-clash/TC2-review.md`, `COMMERCE-ROLLOUT.md` |
| 2 | Cổng thanh toán VND, webhook ký số, merchant sandbox | CM3 | `COMMERCE-ROLLOUT.md` |
| 3 | Commerce chạy Supabase Edge hay Netlify Functions | CM2–CM4 | `server/commerce/README.md` |
| 4 | Lịch/môi trường triển khai Duel + cutover UI | DU1 | `DUEL-SERVER.md` |
| 5 | Có xử lý lịch sử Git/art bằng rewrite hay LFS không | TD3 (tùy chọn) | Đo dung lượng trước; con số cũ 114 MB không còn là số đo hiện tại |
| 6 | Có cho popup xác nhận/kết quả kích thước nhỏ ngoại lệ modal không | Chỉ khi đổi quy tắc | Chưa duyệt; giữ `AGENTS.md` hiện hành |
| 7 | Môi trường/lịch bật Nối Từ online sau thử staging | WC2 | `WORD-CHAIN-SERVER.md` |
| 8 | Thời điểm áp catalog Nối Từ lên production | WC1 | `supabase/migrations/20261102090000_word_chain_catalog.sql` |
| 9 | Render Free pilot đã duyệt; còn quyền repo/cấu hình account/service/WSS. Chưa duyệt chi phí phát sinh | TC2 | `tank-clash/TC2-RUNBOOK.md` §1; chưa tạo service/thuê máy |

## Đã quyết · 05/11/2026

#9: chủ dự án xác nhận chỉ có Netlify, chưa VPS; frontend `https://arcade-x.netlify.app`. Đã duyệt Render Free cho backend thử và đăng nhập dashboard; còn cấp quyền repo/cấu hình service. Không suy thành đã duyệt thuê VPS, nâng gói hoặc chi phí vượt quota.

## Đã quyết · 04/11/2026

#1 (môi trường): chủ dự án yêu cầu tạo `arcade-x-staging`, chọn Nam A Uniform/Singapore. Đã có project riêng, bằng chứng/ref ở `tank-clash/TC2-review.md`; chưa chọn admin/tester/người vận hành. Không phải duyệt migration hoặc commerce production.

## Đã quyết · 03/11/2026

#10 duyệt P3; #11 sân lớn/ngẫu nhiên (đã làm 1040×624); #12 hàng chờ công khai bắt đăng nhập; #13 cho đầu hàng; #14 cục bộ 1 người + bot đồng đội vs 2 bot. Luật chính xác: `tank-clash/P3-SPEC.md`. Không hỏi lại các quyết định này.
