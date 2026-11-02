# Tank Clash — P2 technical review

Ngày: 02/11/2026. Base: `c8aac24cfe66ebb2516c27aa7a574c847fe8c21b` của `ducpham2806/Arcade-x`. Nhánh: `feat/tank-clash-p2-rooms`.

Đã có bản thử phòng riêng 1v1 nối UI với server thật, dùng hình tạm. Đây là mốc kỹ thuật P2 để duyệt; chưa nghiệm thu chơi qua Internet và thiết bị thật, chưa phát hành công khai.

## Hành vi đã triển khai

- Tạo phòng/mã sáu ký tự/link mời; hai ghế A/B; chặn phòng đầy/đang đấu; host rời sảnh chuyển quyền.
- Hai người sẵn sàng, đếm ngược, tối đa ba hiệp; HP/đạn/khiên/gạch/đồng hồ/kết quả do server quyết định. Hai bên có thống kê riêng.
- Hai phiếu đấu lại, quay về sảnh, rời trận xử thua. Mất mạng giữ ghế 20 giây [PLACEHOLDER], vào lại giữ HP; hết hạn xử thua hoặc hủy nếu cả hai vắng.
- Input có sequence/epoch/ack, hàng đợi giới hạn và TTL; bỏ input cũ khi đổi hiệp hoặc reconnect. Ready/rematch dùng opId idempotent và ack.
- Dự đoán di chuyển xe mình; đối soát server và làm mượt hiệu chỉnh nhỏ. Xe đối thủ nội suy với buffer 100 ms [PLACEHOLDER]. HP, sát thương và kết quả không được dự đoán thành kết quả thật.
- Snapshot động 12 Hz và simulation 60 Hz [PLACEHOLDER]; revision tường được gửi lại đến khi xác nhận. Không ghi DB theo frame.
- Payload/rate/connection/room/queue/backpressure có giới hạn; origin allowlist; auth server xác minh Supabase user + test allowlist ngoài chế độ review. JWT chỉ đi trong handshake, không có trong URL/resume storage.
- Offline vẫn có năm bài tập và bot. Online mở menu/đổi focus chỉ trung tính input, không dừng trận. Cleanup hủy timer/RAF/listener/socket.

## Kết quả kiểm thử

Node 24.22.1, hai client tự động kết nối loopback; không phải hai người thật hoặc hai mạng Internet.

| Kiểm tra | Kết quả |
|---|---|
| Suite Tank Clash | 28/28 qua, gồm 12 engine, 1 spike P0, 8 lifecycle/auth, 7 client/WS/network |
| TypeScript phạm vi Tank Clash | Qua, gồm engine/protocol/client/runtime/preview/React adapter |
| Export | HTML tự chứa 60.854 byte, thêm room-lab và khung mobile |
| Trình duyệt | Đã tạo/vào cùng phòng, sẵn sàng, cùng hiệp/đồng hồ; A/B nhận đúng ghế, không có lỗi app sau sửa ID lệnh trên HTTP preview |
| CSS mobile | Form phòng vừa 390×844 và 844×390; dialog toàn màn hình, không tràn ngang hoặc cần cuộn form ở hai khung này |
| Reconnect | Manual resume và tự reconnect sau ngắt transport đều giữ HP/ghế, không lặp phát bắn; đổi kết nối không bị close cũ xóa ghế mới |
| Kết quả | Hai client thống nhất trạng thái sau trận; hai phiếu rematch mới reset; rời phòng xử thua |

Proxy fault test đặt RTT danh nghĩa, jitter ±30 ms mỗi chiều, lặp control command và bỏ ngẫu nhiên snapshot lớp ứng dụng. Proxy còn có thể làm snapshot đến sai thứ tự; client bỏ sequence cũ. TCP bên dưới vẫn đáng tin cậy, không mô phỏng đầy đủ head-of-line blocking hoặc mất gói IP.

| RTT danh nghĩa | Tỉ lệ bỏ snapshot cấu hình | RTT ping quan sát | Hiệu chỉnh vị trí lớn nhất của A | JSON outbound TB/client trong cửa sổ ngắn |
|---|---|---|---|---|
| 80 ms | 1% | 92 ms | 8 world px | 10,81 KiB/s |
| 150 ms | 2% | 182 ms | 21 world px | 10,62 KiB/s |
| 250 ms | 3% | 232 ms | 44 world px | 10,94 KiB/s |

Bảng trên là lượt full suite 28 ca. Sau khi bổ sung đóng transport chủ động lúc timeout để không chờ close handshake quá lâu, đã chạy lại cả 7 ca client/WS: đều qua; TypeScript và export cũng qua lại.

Các cửa sổ đo khoảng 2,2–2,3 giây, có di chuyển/bắn/khiên, tính JSON cả hai ghế rồi chia hai; không gồm overhead TCP/TLS. Tỉ lệ mất thực tế biến động do mẫu ngắn. Chưa phải load/soak test hoặc bằng chứng đạt trần băng thông cho mọi trận. Hiệu chỉnh 44 px ở 250 ms cần đánh giá cảm giác chơi thật, chưa gọi là hết lag.

## Giới hạn cần hoàn tất trước nghiệm thu P2

1. Chạy server WSS trên môi trường thử đã chọn, nối callback token từ phiên Arcade-X; kiểm thử hai tài khoản thật đã được cấp quyền. Chưa đăng ký dịch vụ/chi phí, chưa sửa DB.
2. Hai người trên thiết bị/mạng khác hoàn thành ít nhất 10 trận 1v1, ghi nhận cảm giác ngắm/bắn và correction. Chưa đo FPS điện thoại: browser kiểm tra bị giới hạn khoảng 1 FPS nên chỉ dùng để kiểm tra luồng và bố cục.
3. Soak/load và thử disconnect/restart thực tế. Phòng RAM một tiến trình không có recovery qua server restart, routing nhiều instance hoặc lưu kết quả bền vững.
4. P3 mới mở đội/party/queue 2v2; P4 mới art/audio, catalog, entitlement theo gói chơi và kết quả/thưởng do backend xác nhận. Hình hiện tại vẫn là hình tạm.

Chưa chạy lại toàn bộ suite launcher/game khác; không sửa gameplay của các game khác hoặc quyền sản phẩm. Lệnh chạy và cấu hình ở README. Merge source tách biệt với duyệt phát hành công khai.

## Tài liệu chính đã kiểm tra

- Supabase Auth `getUser(jwt)`: https://supabase.com/docs/reference/javascript/auth-getuser
- Supabase changelog (đã kiểm tra trong lượt triển khai): https://supabase.com/changelog
- WebSocket bufferedAmount: https://developer.mozilla.org/en-US/docs/Web/API/WebSocket/bufferedAmount
