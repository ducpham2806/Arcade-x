# Kế hoạch tiếp tục ArcadeX · 08/11/2026

Mốc nguồn main9061bfd: PR21 đã merge sau fullCI36; Netlify Published đúngSHA và bundlebyte-match. Render vẫn c705100, đã redeploy phục hồi; user giữFree với giới hạn cold start. Roadmap không tự mở commerce, thưởng hoặc quyền production mới.

## Trọng tâm và thứ tự

**ONLINE-ERROR đã phát hành08/11:** client hai game đã merge/public. TankFree đã phục hồi thủ công, chưa đảm bảo tự thức dậy sau ngủ; user đã chọn giữFree, không hỏi nâng gói lại. [Báo cáo/bước vận hành](qa/ONLINE-ERROR-2026-11-08.md). Checkpoint online đã đóng, chủ dự án yêu cầu phát hành Snake ngày 13/11.

**WC-PUBLIC DONE phát hành08/11:** phòng riêng/nhập mã/PK/ghép trận và34.512từ đã public. User bỏ gate3/4người, giữ CI/fixture; ON5/ON6 còn QA mạng/Auth/thiết bị. [Bằng chứng](word-chain/PUBLIC-RELEASE-2026-11-08.md). Thứ tự tiếp theo là Snake; TC-R0 ca A user để sau. [WORKFLOW](WORKFLOW.md).

| Ưu tiên | Nhóm | Task tiếp theo / tình trạng | Thẻ đủ để tiếp quản |
|---|---|---|---|
| Duy trì | Nối Từ / incident online | Client đã phát hành, Tank giữFree/phục hồi thủ công; ON5/ON6 cònQA | [Nối Từ](plans/WORD-CHAIN.md) |
| 1 | Snake Legend | R01 đã merge PR29; SN-AUTH-XTAB sửa credential restore sau CI48, rồi xác minh Netlify. Live save/thiết bị thật theo dõi riêng | [Snake](plans/SNAKE.md) |
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
