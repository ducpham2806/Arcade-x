# Quyết định chờ · 06/11/2026

Giữ ID cũ để dẫn chiếu. Đây là sổ quyết định duy nhất; khi có câu trả lời, chuyển xuống “Đã quyết”, ghi ngày và cập nhật task liên quan.

| ID | Cần chốt | Chặn | Tài liệu chi tiết |
|---|---|---|---|
| 1 | Admin/người vận hành; staging và 4 tester đã có, chưa chọn admin commerce | TC2/CM1; môi trường WC2/DU1 | `tank-clash/TC2-review.md`, `COMMERCE-ROLLOUT.md` |
| 2 | Cổng thanh toán VND, webhook ký số, merchant sandbox | CM3 | `COMMERCE-ROLLOUT.md` |
| 3 | Commerce chạy Supabase Edge hay Netlify Functions | CM2–CM4 | `server/commerce/README.md` |
| 4 | Lịch/môi trường triển khai Duel + cutover UI | DU1 | `DUEL-SERVER.md` |
| 5 | Có xử lý lịch sử Git/art bằng rewrite hay LFS không | TD3 (tùy chọn) | Đo dung lượng trước; con số cũ 114 MB không còn là số đo hiện tại |
| 6 | Có cho popup xác nhận/kết quả kích thước nhỏ ngoại lệ modal không | Chỉ khi đổi quy tắc | Chưa duyệt; giữ `AGENTS.md` hiện hành |
| 7 | Public/merge được yêu cầu08/11, bỏ gate3/4; đã duyệt gói SQL/JWT đúng production | WC-PUBLIC | `word-chain/PUBLIC-RELEASE-2026-11-08.md` |

## Đã quyết · 07/11/2026

- #8 (đưa game ra sảnh): chủ dự án yêu cầu phát hành Nối Từ, tạo icon/banner; triển khai WC-L0 dạng bundled-free/bot/offline tương tự Tank, giữ online=false. PR#18 đã merge3f943d9/Published sau full CI24; bot/offline đã kiểm production. Không hỏi lại quyền public sảnh; SQL production không thuộc phạm vi này, row DB/staging và backend online tiếp tục theo thẻ WORD-CHAIN/#7.
- Thư viện được xác nhận là Game_Studio_Agent đã gửi; snapshot c5dac462 vẫn khớp main và đủ297file/116skill/21role/4rules, không phải repo mới.

## Đã quyết / xác minh · 06/11/2026

- Ưu tiên hiện tại: cập nhật tài liệu, roadmap game dở, một nhật ký chính, đầu vào điều phối Markdown; tóm tắt/thu gọn trước chuyển việc, giữ chi tiết archive. Cài toàn bộ thư viện Game Studio theo nhu cầu, không nạp tất cả mỗi phiên.
- Chủ dự án cho phép publish toàn bộ Game_Studio_Agent (nguồn private) vào ArcadeX public, trả lời trực tiếp trong chat ngày 06/11/2026.
- PR #16 đã merge (main c705100). Quyền phát hành Tank bot + online tài khoản/Render Free đã duyệt 05/11 vẫn giữ; kiểm deployment/mạng thật còn thiếu. Roadmap mới không tự mở rộng quyền SQL/payment/chi phí.

## Đã quyết · 05/11/2026

#9: đã duyệt và tạo Render Free pilot, backend/WSS thật ở `tank-clash/TC2-review.md`; giữ frontend Netlify và Auto Sync No/manual deploy. Không duyệt thuê VPS, nâng gói hoặc chi phí vượt quota. #1 (tester): chủ dự án tự tạo 4 Auth user staging, đã xác nhận email và non-anonymous; admin/người vận hành còn chờ.

## Đã quyết · 04/11/2026

#1 (môi trường): chủ dự án yêu cầu tạo `arcade-x-staging`, chọn Nam A Uniform/Singapore. Đã có project riêng, bằng chứng/ref ở `tank-clash/TC2-review.md`; chưa chọn admin/tester/người vận hành. Không phải duyệt migration hoặc commerce production.

## Đã quyết · 03/11/2026

#10 duyệt P3; #11 sân lớn/ngẫu nhiên (đã làm 1040×624); #12 hàng chờ công khai bắt đăng nhập; #13 cho đầu hàng; #14 cục bộ 1 người + bot đồng đội vs 2 bot. Luật chính xác: `tank-clash/P3-SPEC.md`. Không hỏi lại các quyết định này.

## 07/11/2026 · Nối Từ online/từ điển

Chủ dự án yêu cầu phòng riêng/PK trước→matchmaking và tăng từ điển; đã duyệt staging, mở khóa, cho phép legacyJWT OFF riêngword-chain-room và xác nhận2tester. Đã lưu/reload setting, cài cron và kiểm pilot2account; các tab game đã đóng. Không hỏi lại quyền JWT hoặc các xác nhận đã có. Pilot không thưởng chung; chưa nghiệm thu3/4account/thiết bị/mạng/soak hoặc cutover public. Giữ cấm SQL/script production; quyền public bot/thư viện/Render đã quyết trước, không hỏi lại.

## Đã quyết · 08/11/2026 · public Nối Từ

User yêu cầu merge/public, bỏ nghiệm thu3/4người; PR19 merge256620c sau CI29. Sau khi xem gói/file/SHA và lý do AGENTS/CUA, user trả lời “Cho phép gói Nối Từ production”: schema + cron/token Vault riêng, functionword-chain-room, CORS đúngarcade-x.netlify.app và legacyJWT OFF riêngfunction tạiwhjatkhhupeqfngakmee. Đây là exception hẹp WC-PUBLIC, không áp dụng script production khác. Gói đã áp và probe thành công; PR20 chờ CI sửa offline rồi merge. Không hỏi lại quyền này.
