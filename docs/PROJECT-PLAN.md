# Kế hoạch tiếp tục ArcadeX · 07/11/2026

Mốc nguồn: main3f943d9, PR#18 đã merge sau full CI24/head5882adf success. Netlify3f943d9 Published và bundle byte-match; Render vẫn c705100 (server không đổi). Đây là roadmap, không tự bật backend/commerce hay thay luật gameplay; CI không thay nghiệm thu nhiều thiết bị.

## Trọng tâm và thứ tự

**WC-PUBLIC ACTIVE theo yêu cầu08/11:** user yêu cầu merge/public, bỏ gate3/4người. PR19 merge256620c sau CI29/headfde7810success; Netlify tự build, bộ từ34.512 đã merge. Backend production đã cài/probe theo gói user duyệt; PR20flagtrue đang sửa guard offline và chờ CI head mới. Pilot2account/staging đã qua; các manualcase khác chưa kiểm ghi riêng. WC-L0 bot/art Published; TC-R0 ca A user để sau. Sau Nối Từ tiếp Snake; [WORKFLOW](WORKFLOW.md).

| Ưu tiên | Nhóm | Task tiếp theo / tình trạng | Thẻ đủ để tiếp quản |
|---|---|---|---|
| 1 | Nối Từ | WC-PUBLIC backendprod→flagtrue/CI→merge/Published; user bỏ gate3/4, manualQA còn lại ghi giới hạn | [Nối Từ](plans/WORD-CHAIN.md) |
| 2 | Snake Legend | R0a baseline→R0b UI/save/Auth thật→R1thiết bị/nội dung→R2candidate/phát hành khi được chọn | [Snake](plans/SNAKE.md) |
| Chờ | Tank Clash | TC-R0 ca A do chủ dự án để sau; TC-R1mạng/tải thật; TC-R2port P2→P3, không merge nguyên nhánh | [Tank](plans/TANK-CLASH.md) |
| 3 | Chess/Xiangqi/Caro | DU-R0 staging; DU-R1 tích hợp UI từng game; DU-R2 hai tài khoản thật. Có engine server, chưa cutover UI | [Duel](plans/DUEL.md) |
| 5 | Battleship và game đã tích hợp | GP-R0 xác minh lại khoảng trống QA từ báo cáo cũ; GP-R1 polish theo lỗi tái hiện; GP-R2 Rainbow/Chronicles chỉ khi chọn mở phạm vi | [QA và hoàn thiện game](plans/GAME-POLISH.md) |
| Riêng | Commerce/thuê game | CM1→CM4: staging quyền → DB/admin → payment → restore/pilot. WAITING runtime/provider/admin; giữ checkout tắt | [Commerce](plans/COMMERCE.md) |
| Duy trì | Test/art/docs/nợ kỹ thuật | MT1 test cũ, MT2 banner/art, MT3 phòng dùng chung, MT4 dung lượng Git. Không rewrite/LFS khi chưa duyệt | [Bảo trì](plans/MAINTENANCE.md) |

Làm một task có bằng chứng rồi mới chuyển task khác. Có thể xử lý việc tài liệu/test độc lập khi chờ người chơi hoặc dịch vụ; không tự chuyển ưu tiên gameplay chỉ vì task chờ.

## Phần đã đóng, không làm lại

- Nền tảng launcher và các đợt game trước đã vào main; Tank P3b/P3c/P3d, adapter sảnh, sửa motion PC và polish Battleship/Dungeon cũng đã merge qua PR #16.
- Audit 24 nhánh remote: 21 là tổ tiên main; một nhánh docs có patch tương đương; một nhánh P3 là triển khai song song; nhánh P2 staging còn phần cần port. Không merge lẫn hai wire P2/P3.
- Tóm tắt bền vững ở [COMPLETED](COMPLETED.md), nhật ký chính [WORKLOG](WORKLOG.md). Plan cũ giữ tại [archive](archive/PROJECT-PLAN-2026-11-05.md), chỉ đọc để truy vết.

## Điều kiện chung để đóng việc

Bối cảnh/file đích rõ; tiêu chí task đạt; test phù hợp trên đúng nguồn; thay đổi hiển thị đã quan sát bản chạy; giới hạn thiết bị/mạng/deploy ghi riêng. Full CI trước merge code theo AGENTS. Không đánh dấu game hoàn tất chỉ vì một task hoặc build đã qua. Quyết định chờ ở [PENDING-DECISIONS](PENDING-DECISIONS.md); không hỏi lại các quyết định đã duyệt ở đó.
