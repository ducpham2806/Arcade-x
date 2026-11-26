# Nhật ký công việc

Một nhật ký chính, tối đa 3 mục. [Log trước FD-ON2](archive/WORKLOG-2026-11-19-before-fd-on2.md).

## 26/11/2026 · Blossom Blast · giao diện và ghép tại bàn

- `codex/blossom-garden-ui` thay giao diện Hành trình, HUD, bàn, chuẩn bị và các hộp thoại bằng khung 9-slice từ bộ art Blossom. Ghép được bằng chạm, vuốt hoặc bàn phím; đánh dấu các ô đủ điều kiện và hủy chọn miễn phí. Playwright 64/64, engine 21/21, HTML chạy khi tắt mạng sau tải. [QA](qa/BLOSSOM-GARDEN-UI-2026-11-26.md).
- PR #45 đã vào `main` tại `fc8bb2f` sau CI #86. Ghi chú gốc bản thử bàn cờ giữ trong [archive](archive/WORKLOG-2026-11-25-three-board-polish.md).

## 26/11/2026 · VFX ba bàn cờ

- Ô Ăn Quan có quét giáo hai phe, bóng dưới đất và nhịp vào khay. Cờ vua có vòng ấn phong cấp. Cờ tướng có ánh đầu nòng và bụi riêng cho Pháo.
- Kiểm frame trong bản HTML dưới hai kích thước, tắt chuyển động giữa chừng, Pháo ăn Mã và chuỗi điểm ăn kép. [QA](qa/THREE-BOARD-VFX-2026-11-26.md).
- [Nhật ký bản Chính Điện Đá và chuyển động](archive/WORKLOG-2026-11-25-chess-motion.md).

## 26/11/2026 · xem lại nước đi của ba game

- `codex/three-board-games-qa` thêm tiến/lùi từng nước, thế xuất phát và thế cuối. Ô Ăn Quan xem khay và điểm trong Lịch sử lượt đi. Cờ vua và Cờ tướng mở từ bảng kết quả.
- Thanh kết quả đặt trên bàn, không che quân trên khung điện thoại. Lịch sử thiếu dữ kiện vẫn hiển thị phần khôi phục được. [QA](qa/THREE-BOARD-REVIEW-2026-11-26.md).
- [Nhật ký bản Cờ tướng đầu tiên](archive/WORKLOG-2026-11-25-xiangqi-battlefield.md).
