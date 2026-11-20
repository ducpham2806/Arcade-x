# Sửa lỗi sau kiểm lại Folk · 19/11/2026

Nhánh `codex/folk-qa-20261119`, từ mốc báo cáo `ea65ede`. Thực hiện bốn mục của [báo cáo kiểm lại](FOLK-RECHECK-2026-11-19.md).

## Thay đổi

- Vạch lực Nhảy Lò Cò online đọc giờ đến dự kiến của server theo từng khung hình. Chỉ marker cập nhật theo khung hình. HUD phòng và nhịp lấy snapshot vẫn chạy theo chu kỳ cũ. Nút đợi đúng thời điểm mở pha; luật, công thức lực và kết quả vẫn ở Edge. Dừng vòng vẽ khi pause hoặc pha chơi kết thúc.
- Hai game xếp bàn cạnh nút ở 844×390, thu gọn HUD ở khung thấp. Ở 320×568, bàn, vạch lực và nút thảy vừa khung. Khung vẫn cuộn được khi nội dung dài. Chat bảo vệ vùng bàn và nút chơi.
- Chơi lại từ thanh game hoặc pause dùng cùng cơ chế lưu offline với ván mới. Hủy xác nhận giữ ván và trạng thái pause hiện có. Xác nhận tạo ID ván mới cùng chế độ. Nút này được tắt ở menu và phòng online, nơi dùng phiếu Đấu Lại của phòng.
- Nhảy Lò Cò chuyển focus đến nút hành động kế tiếp sau thao tác bàn phím. Người chơi vẫn chọn được một hoặc hai chân, và focus đã chuyển ra chat hay điều khiển khác được giữ.

## Xác minh

- Trước sửa, hai ca 844×390 và ca focus thất bại. Sau sửa, đo vùng hiển thị bằng Playwright ở 320×568 và 844×390, gồm đáy HUD, vạch lực và nút chơi. Đã xem ảnh runtime hai game.
- 21 test luật, lưu/thưởng, Edge và PGlite qua. Bundle Edge khớp nguồn. Lint, build, bundle budget và kiểm Markdown qua.
- 14 ca Playwright có kết quả qua, gồm chạy lại hai ca offline bị lỗi module context do Vite hot reload trong lượt đầu. Ca layout cuối kiểm thêm 64 px chừa badge ở khung ngang. Ca Nhảy Lò Cò online dùng 125 ms mỗi chiều, kiểm vạch cập nhật hơn 12 lần trong 1,25 giây, thảy/nhặt, đổi lượt, chat, vào lại và chuyển focus.
- CI trên pull request chạy lại đủ bộ hồi quy từ checkout sạch.

Ảnh và log cục bộ ở `test-results/folk-offline/`, `test-results/folk-online/` và `test-results/folk-qa/`. Hai tài khoản staging, thiết bị và độ trễ mạng thật còn chờ. Phòng QA dùng Edge handler và PostgreSQL PGlite với Auth giả lập. Online vẫn bật riêng qua `VITE_FOLK_ONLINE=1`.

Studio Game QA & Playtest và Game UI/UX, vai trò QA Lead. Graphify AST Folk 128/279 và Nhảy Lò Cò 73/116. Tra `useOfflineMatch`, `useFolkRestart` và `NlcPowerMeter` ở depth 1, đối chiếu CSS và trace trình duyệt.
