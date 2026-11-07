# Kế hoạch tiếp tục ArcadeX · 06/11/2026

Mốc nguồn: main1131927, PR#17 đã merge sau full CI success trên b644da2. Netlify1131927 Published và bundle byte-match; Render vẫn c705100 (server không đổi). Đây là roadmap, không tự bật backend/commerce hay thay luật gameplay; CI không thay nghiệm thu nhiều thiết bị.

## Trọng tâm và thứ tự

**WC-L0 ACTIVE:** chủ dự án yêu cầu đưa Nối Từ ra sảnh, làm icon/banner; phát hành bot/offline qua bundle, không SQL production/online. DOC-01/NETLIFY-BUILD đã xong trong PR#17. TC-R0 chờ ca A do chủ dự án để sau. Khi đổi việc, đóng/tóm tắt theo [WORKFLOW](WORKFLOW.md).

| Ưu tiên | Nhóm | Task tiếp theo / tình trạng | Thẻ đủ để tiếp quản |
|---|---|---|---|
| 1 | Tank Clash | TC-R0 chờ ca A/mã B cũ do chủ dự án để sau; TC-R1 mạng/tải thật; TC-R2 port chống lỗi P2 sang P3 | [Tank](plans/TANK-CLASH.md) |
| 2 | Nối Từ | WC-R0 xác minh catalog; WC-R1 staging server/scheduler; WC-R2 bàn phím/multi-account. Online trong source đang tắt | [Nối Từ](plans/WORD-CHAIN.md) |
| 3 | Chess/Xiangqi/Caro | DU-R0 staging; DU-R1 tích hợp UI từng game; DU-R2 hai tài khoản thật. Có engine server, chưa cutover UI | [Duel](plans/DUEL.md) |
| 4 | Snake Legend | SN-R0 nghiệm thu account/save trên launcher preview; SN-R1 thiết bị/art/audio; SN-R2 quyết định phát hành. Chưa đưa ra catalog công khai | [Snake](plans/SNAKE.md) |
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
