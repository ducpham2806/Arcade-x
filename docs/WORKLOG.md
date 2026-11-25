# Nhật ký công việc

Một nhật ký chính, tối đa 3 mục. [Log trước FD-ON2](archive/WORKLOG-2026-11-19-before-fd-on2.md).

## 26/11/2026 · xem lại nước đi của ba game

- `codex/three-board-games-qa` thêm tiến/lùi từng nước, thế xuất phát và thế cuối. Ô Ăn Quan xem khay và điểm trong Lịch sử lượt đi. Cờ vua và Cờ tướng mở từ bảng kết quả.
- Thanh kết quả đặt trên bàn, không che quân trên khung điện thoại. Lịch sử thiếu dữ kiện vẫn hiển thị phần khôi phục được. [QA](qa/THREE-BOARD-REVIEW-2026-11-26.md).
- [Nhật ký bản Cờ tướng đầu tiên](archive/WORKLOG-2026-11-25-xiangqi-battlefield.md).

## 25/11/2026 · hoàn thiện bản thử ba bàn cờ

- `codex/three-board-games-polish` thêm Ô Ăn Quan Chiến Trường, lính giáo và Tướng cưỡi ngựa, rải và đánh theo trace, quân về khay mới cộng điểm. Kho trang phục giữ danh mục và ví Kẹo.
- Thêm địa hình cho cả ba game, lưu tùy chọn đổi bàn và chuyển động theo từng game. Chốt nước đã hợp lệ khi tắt hiệu ứng giữa lượt.
- Fixture ăn kép 22→23→24→25→35 và QA HTML offline trên điện thoại giả lập. Bản thử dùng tài nguyên nhúng. [QA](qa/THREE-BOARD-GAMES-2026-11-25.md).
- Còn kiểm thiết bị thật và hai tài khoản trong môi trường phát hành. [Log FD-ON2](archive/WORKLOG-2026-11-20-folk-release.md).

## 25/11/2026 · Chính Điện Đá và chuyển động hai game

- Từ `b22b6be` trên `codex/chess-citadel-preview`, thêm hai bộ quân Ngà Vàng và Hắc Thạch, bàn 8×8, nhập thành, bắt qua đường, phong cấp và khay theo lịch sử SAN.
- Game Studio, Graphify, Agent Sprite Forge và PixelFX đã được dùng. Bản HTML có thế thử và đấu hai người cùng máy. [QA](qa/CHESS-CITADEL-2026-11-25.md).
- Nhánh `codex/chess-pixel-polish` thêm bộ quân full-body 12 sprite, căn tỷ lệ bằng Sprite Forge. Hai game còn chờ kiểm máy thật và phòng online hai tài khoản.
- `codex/duel-piece-motion` thêm nhịp đi, ăn quân và công tắc lưu riêng mỗi game. Bốn ca HTML offline và hai ca launcher qua. [QA](qa/DUEL-PIECE-MOTION-2026-11-25.md).
- [Mục xác nhận rời trận Folk ngày 19/11](archive/WORKLOG-2026-11-19-folk-leave.md).
