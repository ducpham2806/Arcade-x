# Nhảy Lò Cò và Ô Ăn Quan

Kế hoạch cập nhật ngày 19/11/2026. [GDD v2](../archive/FOLK-GAMES-PLAN-2026-11-14-v2.md) lưu luật, art, skin và thiết kế thưởng. Bản offline và code FD-ON1 đã merge qua PR40 vào main `f154795` ngày 19/11 sau CI71. [Release](../qa/FOLK-CHAT-RELEASE-2026-11-19.md).

## Phạm vi và quyết định phải giữ

- Hai game độc lập trong sảnh Multiplayer: `o-an-quan` (Ô Ăn Quan · Sân Đình), `nhay-lo-co` (Nhảy Lò Cò · Ngõ Nhỏ); bot và hạ tầng phòng1vs1 dùng chung module Folk Duel.
- Ô Ăn Quan: bàn12ô,2Quan/10Dân, rải trái/phải, chuyền tay, bắt/ăn kép, nợ và hốt tàn; giữ luật/biến thể chi tiết ở GDD §3.
- Nhảy Lò Cò: bàn10ô đơn/đôi, thảy Chàm→nhảy nhịp→nhặt Chàm/xây Nhà; đối chiếu GDD §4 khi kiểm luật.
- Skin chỉ đổi hình/hiệu ứng/âm thanh; zero pay-to-win. GameBridge, thưởng, Xu/XP/Kẹo/Rương và commerce trong GDD là thiết kế, không tự cấp quyền production hoặc bật thanh toán. Áp quy tắc save/Auth/commerce của AGENTS/project hiện tại.
- Art pixel Việt Nam: icon512/banner1280×640, sprite trong suốt/nearest-neighbor, bảng màu/render đa skin ở GDD §5–§8. Modal và vùng chơi theo quy tắc ArcadeX đã duyệt.

## Các mốc offline

- FD-L0 sửa preview/bot Ô Ăn Quan để giữ state đầu vào, kiểm bảo toàn 70 điểm, rải sinh/hốt tàn và chuyền tay. Artwork, chữ Canvas và preview DEV của cả hai game đã kiểm.
- FD-L1 có bot/hai người chung máy, lưu sau mỗi lượt, mở lại, đấu lại và receipt thưởng cục bộ. Nhảy Lò Cò đủ thảy, một/hai chân, nhặt Chàm và xây Nhà. Ô Ăn Quan có tay bốc/rải từng viên, hiệu ứng ăn về mẹt theo ghế, cam/xanh ngọc và lịch sử sau reload.
- Chi tiết và bằng chứng offline giữ ở [bản trước FD-ON1](../archive/FOLK-GAMES-PLAN-2026-11-19-before-online.md). CI #69 của bản trình diễn qua. Anh duyệt merge ngày 19/11; còn kiểm thiết bị thật.

## Thứ tự triển khai và điểm duyệt

| Mốc | Việc triển khai | Tiêu chí để anh duyệt |
|---|---|---|
| **FD-L0 · Ổn định luật và CI** | Tách tính nước đi Ô Ăn Quan khỏi state đầu vào để bot, preview và replay dùng chung luật. Kiểm giữ tổng điểm sau khi quy đổi Quan và tính nợ, rải tiếp, ăn kép, bảo vệ Quan đầu ván, rải sinh và hốt tàn. Đưa test Folk vào lệnh Node 24 ổn định. Dùng chữ Canvas đúng chuẩn ArcadeX, bổ sung icon/banner và metadata thật cho cả hai game. | Test luật, readability, artwork qua. Chuỗi ván Ô Ăn Quan cho cùng kết quả khi chơi, dự báo và chạy lại cùng đầu vào. Duyệt icon, banner và cách nhìn bàn trên điện thoại. |
| **FD-L1 · Hai bản chơi offline** | Xong luồng Ô Ăn Quan trước để chốt luật và mẫu onboarding. Với Nhảy Lò Cò, hoàn thiện chỉ dẫn thảy Chàm, vùng canh lực, nút một/hai chân, báo lỗi nhịp và xây Nhà. Cả hai game kiểm bot, chơi hai người cùng máy, đổi lượt, chơi lại, lưu tiến trình, skin và bubble trong màn hình hẹp. | Hai link preview cục bộ có thể chơi trọn ván. Thử bằng touch và bàn phím, khung HUD dễ đọc, chat thu về bubble và không chặn bàn hay nút. Thưởng offline có kiểm chống nhận lặp và tương thích save. |
| **FD-ON1 · Phòng 1v1 dùng chung** | Dùng Edge Function có Auth, cập nhật phòng bằng một giao dịch có kiểm version. Hỗ trợ mã phòng, ghép theo từng game, kết nối lại, hết lượt/rời phòng, rematch và receipt khi gửi lại. Server kiểm nước Ô Ăn Quan. Với Nhảy Lò Cò, đặc tả cách server xác nhận chuỗi thao tác và cửa sổ thời gian trước khi mở PvP. Điểm và kết quả tính ở server. Bubble tự vào `Trận` khi ghế hợp lệ, chấm xanh và lời cạnh avatar qua adapter chung. | PGlite kiểm ghế, Auth, phiên bản, gửi lặp, sai lượt, lộ dữ liệu và nhận thưởng trùng. Hai tài khoản staging chơi qua hai phiên, nhận chat đúng phòng, rời hoặc chơi lại và vào lại sau mất mạng. |
| **FD-ON2 · Nghiệm thu** | Chạy CI đúng head, QA qua trình duyệt và thiết bị thật, kiểm mạng chậm và cả offline. Chuẩn bị mở catalog theo từng game, ghi cách thu hồi cấu hình catalog khi có lỗi. | Anh chơi và duyệt từng game trước merge. Migration trong mốc phát triển chỉ chạy ở PGlite hoặc staging. Giữ commerce tắt. |

## FD-ON1 · WAITING nghiệm thu

- Đã thay prototype trong bộ nhớ bằng Edge/Auth + PostgreSQL, mã phòng và ghép FIFO theo game. CAS revision và receipt cùng giao dịch. Có rời, resume, timeout và hai phiếu đấu lại. Kết quả/điểm ở server. Giữ cấp thưởng online tắt trong bản QA.
- Ô Ăn Quan dùng luật và trace chung, lưu lịch sử. Hạn lượt mới bắt đầu sau thời lượng trình diễn. Nhảy Lò Cò gửi từng thao tác và dùng thời điểm server để kiểm pha/nhịp/điểm.
- Nối adapter bubble vào Trận và lời cạnh HUD, gỡ khi rời/đổi tài khoản. Frontend QA bật bằng `VITE_FOLK_ONLINE=1` với backend staging. Luồng offline vẫn có ở build mặc định.
- Đã áp schema, Edge và scheduler trên staging `khqipuipeawzlkqmdzdg`. Âm Auth/quyền RPC và scheduler 200 đã kiểm. Ngày 19/11 anh chọn để anh kiểm hai tài khoản sau.
- [Báo cáo FD-ON1](../qa/FOLK-ONLINE-2026-11-19.md) giữ hợp đồng, test và giới hạn. [Bàn giao](../SESSION-HANDOFF.md) giữ kết quả chạy cuối.
- PR40 đã merge và Netlify Published. Tiếp theo anh kiểm hai tài khoản staging, thiết bị và latency thật. Folk online ở public tiếp tục theo cấu hình phát hành riêng.

## Kiểm lại sau phát hành · 19/11/2026

- Ghi kết quả chạy lại và bốn phát hiện về vạch lực online, bố cục khung thấp, restart thanh game và focus trong [báo cáo QA](../qa/FOLK-RECHECK-2026-11-19.md).
- Bốn mục QA đã sửa trên `codex/folk-qa-20261119`. [Báo cáo sửa và kiểm lại](../qa/FOLK-POLISH-2026-11-19.md). FD-ON2 còn nghiệm thu hai tài khoản staging, thiết bị và latency thật.
- PR 42 thêm hộp xác nhận trước khi rời ván online đang đếm ngược hoặc đang chơi. Hủy xác nhận tiếp tục ván. Gửi lại khi mất phản hồi dùng cùng ID rời trận. [Nhật ký](../WORKLOG.md).

## FD-ON2 · phát hành hai game offline

- PR 42 có công tắc catalog riêng cho từng game, mặc định tắt. Đã kiểm bật, thu hồi và lưu offline trong môi trường giả lập. Preview Vite cổng 4335 trỏ staging, dành cho lượt chơi bằng hai tài khoản, điện thoại và mạng thật của anh.
- Ngày 20/11 anh yêu cầu bỏ test staging và merge PR 42 để phát hành hai game trên launcher. Catalog đóng gói cung cấp bản offline cả khi catalog cloud thiếu hàng. Chạy CI trên đúng commit trước merge và kiểm phát hành Netlify. Online công khai theo đợt backend riêng. [Phiếu nghiệm thu và quy trình bật/thu hồi](../qa/FOLK-ON2-2026-11-19.md).

## Ô Ăn Quan Chiến Trường · 25/11/2026

- Bốn bản đồ, Sân Đình, hai phe lính/Tướng, khay cộng từng quân, kho trang phục và công tắc chuyển động. Nhánh `codex/three-board-games-polish`. [QA](../qa/THREE-BOARD-GAMES-2026-11-25.md).
