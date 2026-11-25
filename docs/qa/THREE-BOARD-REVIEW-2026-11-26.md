# Xem lại nước đi của ba game · 26/11/2026

Nhánh `codex/three-board-games-qa` nối từ `b19ba63`. Khi bắt đầu, nhánh bản thử đi trước `main@3e2f5b9` 6 commit, phía main không có commit riêng cần đồng bộ.

| Game | Dữ liệu hiển thị | Kiểm tra chính |
|---|---|---|
| Ô Ăn Quan | Lịch sử lượt đi có bàn theo địa hình hiện tại, thế xuất phát, đường rải và điểm hai bên sau mỗi lượt. Bản lưu thiếu lượt đầu vẫn mở được biên bản chữ. | Vào ván bằng launcher, rải và ăn 6 điểm, tải lại, lùi về 0, tiến tới 6, đối chiếu state lưu. |
| Cờ vua | Xem Lại Nước Đi trên bảng kết quả. Dựng thế cờ và khay trong từng mốc từ biên bản, chỉ bật tua nếu thế cuối khớp. | Ván 5 nước với bot cố định, kết thúc Qh5#. Lùi về đầu, tiến tới e4 rồi trở lại chiếu bí. |
| Cờ tướng | Dùng snapshot trong ván local, dựng lại ván bot hoặc online từ nước đã ghi. Đối chiếu thế cuối trước khi bật tua. | Pháo qua ngòi ăn Mã, kết thúc ván, lùi để thấy Mã trở lại và khay về 0, tiến để khay có 1 quân. |

Bàn trong chế độ xem lại của Cờ vua và Cờ tướng cho phép đọc vị trí bằng bàn phím, chặn thao tác đi quân và chốt mọi hiệu ứng đang chạy. Thanh kết quả nằm trên bàn để tránh che các hàng quân ở màn hình hẹp. Bot dừng tính nước khi ván được kết thúc bằng đầu hàng hoặc hòa. Ô Ăn Quan mở bản sao thế bàn ở lịch sử, trạng thái trận vẫn do ván đang chạy quyết định.

## Kiểm chứng

- Studio Game QA & Playtest. Graphify AST theo Ô Ăn Quan cho 157 nút/457 cạnh và xác nhận `replayOaqPositions` gọi luật hiện có. Các trận online vẫn dùng luồng phòng hiện hành.
- Có test Playwright cho chiếu bí Cờ vua, khay Pháo ăn Mã, trạng thái lưu Ô Ăn Quan và vị trí thanh kết quả so với mặt bàn.
- Ba HTML chơi offline có điều khiển xem lại. Bản Cờ vua và Cờ tướng mở bằng nút sau khi có nước đầu tiên. Ô Ăn Quan mở từ Lịch sử lượt đi. Kiểm Chromium với 320×568 và 844×390.
- Kiểm trên máy thật và hai tài khoản ở môi trường phát hành vẫn chờ nghiệm thu.
