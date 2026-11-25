# Nhật ký công việc

Một nhật ký chính, tối đa 3 mục. [Log trước FD-ON2](archive/WORKLOG-2026-11-19-before-fd-on2.md).

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

## 25/11/2026 · bản chơi thử chiến trường Cờ tướng

- Từ `3e2f5b9` trên `codex/xiangqi-battlefield-preview`, thêm Bến Sông Sở Hán với quân top-down hai phe, vạch sông và Cửu Cung, điều khiển phím, animation Pháo và khay quân ăn. Bàn cổ điển vẫn chọn được.
- Dùng Game Studio, Graphify theo module, Agent Sprite Forge 14 sprite qua QA và PixelFX 16 frame. `test:duel`, `test:artwork`, lint và build qua. [QA](qa/XIANGQI-BATTLEFIELD-2026-11-25.md).
- Sau bản Cờ vua, nhánh `codex/xiangqi-pixel-polish` thay bộ quân Cờ tướng bằng 14 sprite pixel full-body. QA Chromium ba khung và HTML offline qua. Còn thiết bị thật và phòng hai tài khoản.
- [Mục sửa lỗi QA Folk ngày 19/11](archive/WORKLOG-2026-11-19-folk-polish.md).
