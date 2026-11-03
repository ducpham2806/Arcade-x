# Tank Clash P3 — Báo cáo MVP 2v2

Ngày: 03/11/2026 · Nhánh: `ccr-e38a635d-qyei9d` · Đặc tả: `docs/tank-clash/P3-SPEC.md` (v0.5) · Trạng thái: **code xong P3a–P3d, chưa chơi thử thật, chưa deploy.**

## 1. Đã làm được

| Phần | Nội dung | Commit |
|---|---|---|
| P3a | Sân Crossfire 1040×624, chướng ngại sinh ngẫu nhiên theo seed mỗi trận (đối xứng, có kiểm tra tự động); chế độ cục bộ "2v2 với bot" (anh + 1 bot đồng đội vs 2 bot); bỏ trận theo người; đầu hàng | `44efbf9` |
| P3b | Giao thức `tank-clash.p3.v1`; phòng 2v2 trên máy chủ: 4 ghế, đổi đội, chủ phòng xếp người, người xem, đầu hàng online, bỏ trận theo người | `9864860` |
| P3c | Tổ đội (phòng riêng 2v2 ≤ 2 người) và một hàng chờ 2v2 công khai; ghép tổ+tổ → tổ+2 lẻ → 4 lẻ; hủy, rớt mạng, đấu lại hoặc giải tán | `5ef7b77` |
| P3d | Giao diện online 2v2 (xem §2) và test 4 trình duyệt + người xem | commit P3d |

Tiêu chí xong của đặc tả (§1): D1 bốn client thống nhất kết quả (test mạng ảo 3 mức + test trình duyệt) · D2 tổ đội luôn chung đội, không ai bị ghép hai trận · D3 bảng bỏ trận · D4 không có bot ẩn trong trận online · D5 người xem không ảnh hưởng trận · D6 phòng 1v1 P2 giữ nguyên (test cũ không sửa) · D7 sân không có đường bắn thẳng giữa khu xuất phát, bot không kẹt. Tất cả có test tự động; **chưa có nghiệm thu bằng người thật trên thiết bị thật.**

## 2. Giao diện online (P3d)

- **Menu online:** ô tên; khung "Phòng riêng" chọn 1v1/2v2 (mặc định 1v1 như P2), tạo phòng, nhập mã để vào hoặc **Xem trận**; khung "Tìm trận 2v2" (ghi rõ cần đăng nhập). Vừa một màn trên PC 1280×760.
- **Sảnh 2v2:** hai cột Đội A/Đội B (● đội mình, ▲ đội kia), ghế trống ghi "Đang chờ người chơi…", nút **Sang đội kia**, chủ phòng có nút **⇄ Đổi đội** trên ghế người khác, số người xem, link mời. Có 1–2 người thì chủ phòng thấy **Tìm trận 2v2**; khi đang tìm, phòng khóa, hiện đồng hồ chờ và **Hủy tìm trận**.
- **Màn chờ (người lẻ):** đồng hồ chờ; sau 60 giây hiện "Chưa đủ người" với **Tiếp tục đợi** / **Luyện 2v2 với bot** (rời hàng, vào chế độ cục bộ). Không tự thêm bot vào trận online.
- **Trận ghép:** sảnh ghi "TRẬN GHÉP · 2v2", "Đã ghép trận! Bắt đầu sau N giây", không có nút sẵn sàng/đổi đội/mời.
- **Trong trận:** HUD hai đội có tên và máu từng xe; nhãn tên trên xe; đồng đội mất kết nối/rời trận báo ở chân trang (không chặn trận, theo AGENTS.md §3). Tạm dừng: còn đồng đội thì chỉ có "Rời trận (xe bị loại)"; đội chỉ còn mình thì có **Đầu hàng**.
- **Người xem:** không có cần điều khiển/đường ngắm, HUD ghi "ĐANG XEM", có nút **Ngừng xem**.
- **Kết quả:** tỉ số theo đội, lý do (điểm, bỏ trận, đầu hàng, hủy), danh sách ghế. Phòng riêng: **Đấu lại**. Trận ghép: đếm 20 giây để cả 4 đấu lại, hết giờ thì phòng giải tán nhưng màn kết quả vẫn giữ và có **Tìm trận mới**.

## 3. Kiểm thử đã chạy (03/11/2026)

| Lệnh | Kết quả |
|---|---|
| `npm run lint` · `npm run build` · `npm run test:bundle` | qua |
| `npm run test:fast` (gồm `test:tank-clash`: engine, sân, phòng 1v1/2v2, netcode 1v1/2v2, hàng chờ) | qua, Tank Clash 64/64 |
| `npm run test:tank-clash-server` (WebSocket thật, có ca hàng chờ) | 5/5 |
| `npm run test:tank-clash-ui` (1v1 online, 2v2 với bot ×2 kích thước, 2v2 phòng riêng 4 trang + người xem, hàng chờ 4 trang, chờ 60 giây bằng đồng hồ giả) | 6/6, chạy 2 lần liên tiếp |

Ảnh đã xem: menu online, sảnh 2v2, trận online ở 1280×760, 844×390, 390×844; màn chờ.

## 4. Số đo (mạng ảo, không phải máy thật)

Trận 2v2 với 4 client: tải xuống khoảng 19–20 KB/s, tải lên khoảng 4 KB/s mỗi client ở RTT 80/150/250 ms (jitter 30, mất 1–3 %). Lệch hiển thị xe khác TB/p95: 11/24, 16/37, 23/53 px. Hiệu chỉnh xe mình chủ yếu xảy ra khi vừa chạm xe khác hoặc gạch vừa vỡ (tối đa khoảng 40 px, có làm mượt); chạy tự do gần như không có. Bot cục bộ: khoảng 0,3 ms/nhịp cho 3 bot trên máy cloud.

## 5. Giới hạn và rủi ro

- **Chưa chơi thử bằng người thật** ở bất kỳ chế độ 2v2 nào; độ khó bot, kích thước sân (xe khoảng 13 px trên điện thoại ngang), thông số hàng chờ đều là [PLACEHOLDER].
- **Chưa có máy chủ thật** (chờ quyết định hosting, PENDING-DECISIONS mục 9); hàng chờ chỉ chạy trong một tiến trình, chưa xét kỹ năng/khu vực.
- Hiệu chỉnh khi chạm xe ở mạng chậm có thể thấy rõ trên máy thật; chưa có lag compensation.
- Chưa lưu kết quả vào database, chưa cấp thưởng, chưa vào launcher (P4).
- Người chơi lẻ rớt mạng mất chỗ trong hàng (xếp lại vào cuối hàng khi nối lại).

## 6. Bước tiếp theo đề xuất

1. Chủ dự án chọn nơi chạy máy chủ → deploy staging → chơi thử 2v2 với 4 người thật (cả phòng riêng và tìm trận), ghi cảm giác chạm xe/bắn.
2. Chơi "2v2 với bot" trên điện thoại để chốt kích thước sân.
3. Sau đó mới sang P4 (art, âm thanh, tích hợp launcher, lưu kết quả theo match ID).
