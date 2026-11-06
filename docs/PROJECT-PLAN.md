# Kế hoạch tiếp tục ArcadeX · 06/11/2026

Mốc nguồn đã xác minh: `main@c705100`, PR #16 đã merge; checkout đã đồng bộ. Lint/build/bundle/fast và 18 WS/ops qua ở lượt audit 06/11 trên Node 24. Không suy ra Netlify/Render hiện tại hoặc nghiệm thu thiết bị từ kết quả này. Đây là roadmap, không tự bật backend/commerce hay thay luật gameplay.

## Trọng tâm và thứ tự

**DOC-01 đã xong** trên nhánh tài liệu 9eff18c. **Hiện tại TC-R0 ACTIVE:** Render/main đã Live; B thật/mã A cũ và Netlify main/c705100 đã kiểm. PR#17 sửa Auth qua local; đang sửa dependency gây lỗi Netlify Preview trước CI/merge/retest. Audit Nối Từ: source có trong main, catalog public chưa trả game. Xem thẻ Tank/Nối Từ. Khi đổi việc, đóng/tóm tắt theo [WORKFLOW](WORKFLOW.md).

| Ưu tiên | Nhóm | Task tiếp theo / tình trạng | Thẻ đủ để tiếp quản |
|---|---|---|---|
| 1 | Tank Clash | TC-R0 xác minh bản đang chạy; TC-R1 mạng/tải thật; TC-R2 chuyển phần chống lỗi P2 sang P3. READY; nghiệm thu nhiều thiết bị còn WAITING | [Tank](plans/TANK-CLASH.md) |
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
