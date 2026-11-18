# Nhảy Lò Cò và Ô Ăn Quan

Kế hoạch triển khai cập nhật ngày 18/11/2026, đối chiếu nguồn Main `a55af6e` và bản chat trên `codex/chat-all-games`. [GDD v2](../archive/FOLK-GAMES-PLAN-2026-11-14-v2.md) lưu luật, art, skin và thiết kế thưởng chi tiết. Phạm vi kỳ này là kiểm nền và bàn giao kế hoạch để chủ dự án duyệt.

## Phạm vi và quyết định phải giữ

- Hai game độc lập trong sảnh Multiplayer: `o-an-quan` (Ô Ăn Quan · Sân Đình), `nhay-lo-co` (Nhảy Lò Cò · Ngõ Nhỏ); bot và hạ tầng phòng1vs1 dùng chung module Folk Duel.
- Ô Ăn Quan: bàn12ô,2Quan/10Dân, rải trái/phải, chuyền tay, bắt/ăn kép, nợ và hốt tàn; giữ luật/biến thể chi tiết ở GDD §3.
- Nhảy Lò Cò: bàn10ô đơn/đôi, thảy Chàm→nhảy nhịp→nhặt Chàm/xây Nhà; đối chiếu GDD §4 khi kiểm luật.
- Skin chỉ đổi hình/hiệu ứng/âm thanh; zero pay-to-win. GameBridge, thưởng, Xu/XP/Kẹo/Rương và commerce trong GDD là thiết kế, không tự cấp quyền production hoặc bật thanh toán. Áp quy tắc save/Auth/commerce của AGENTS/project hiện tại.
- Art pixel Việt Nam: icon512/banner1280×640, sprite trong suốt/nearest-neighbor, bảng màu/render đa skin ở GDD §5–§8. Modal và vùng chơi theo quy tắc ArcadeX đã duyệt.

## Hiện trạng đã kiểm

- Cả hai game có luật, bot, hai người cùng máy, Canvas, skin, âm thanh và màn phòng thử. Build cục bộ vào được cả hai game, mở kênh `Game` bằng bubble và thoát về sảnh. Kiểm chat trên build cục bộ không xác nhận phát hành catalog production.
- Bộ luật/economy/phòng Folk sau khi bundle bằng esbuild đạt **5/6**. `previewOaqLandingCell()` gọi `applyOaqMove()` trên chính state đang chơi. Đường `ensureSideHasStones()` trả lại cùng object khi còn quân, phép tính preview đổi lượt và sửa ô trước khi người chơi xác nhận. Ca đỏ là P1 chọn ô 1 theo chiều CW ngay ván đầu.
- Kiểm chữ Canvas báo lỗi ở `src/games/nhay-lo-co/renderer.ts:110`. Kiểm artwork dừng ở `o-an-quan`; cả hai game cần metadata, icon và banner của launcher.
- `OnlineRoom.tsx` gọi `FolkRoomServer` trong bộ nhớ trình duyệt. Hai game đã có SQL nháp ở `supabase/folk-duel/schema.sql`; luồng đối đầu cross-device, chat `Trận` và xác nhận thưởng online còn chờ triển khai.

## Thứ tự triển khai và điểm duyệt

| Mốc | Việc triển khai | Tiêu chí để anh duyệt |
|---|---|---|
| **FD-L0 · Ổn định luật và CI** | Tách tính nước đi Ô Ăn Quan khỏi state đầu vào để bot, preview và replay dùng chung luật. Kiểm giữ tổng điểm sau khi quy đổi Quan và tính nợ, rải tiếp, ăn kép, bảo vệ Quan đầu ván, rải sinh và hốt tàn. Đưa test Folk vào lệnh Node 24 ổn định. Dùng chữ Canvas đúng chuẩn ArcadeX, bổ sung icon/banner và metadata thật cho cả hai game. | Test luật, readability, artwork qua. Chuỗi ván Ô Ăn Quan cho cùng kết quả khi chơi, dự báo và chạy lại cùng đầu vào. Duyệt icon, banner và cách nhìn bàn trên điện thoại. |
| **FD-L1 · Hai bản chơi offline** | Xong luồng Ô Ăn Quan trước để chốt luật và mẫu onboarding. Với Nhảy Lò Cò, hoàn thiện chỉ dẫn thảy Chàm, vùng canh lực, nút một/hai chân, báo lỗi nhịp và xây Nhà. Cả hai game kiểm bot, chơi hai người cùng máy, đổi lượt, chơi lại, lưu tiến trình, skin và bubble trong màn hình hẹp. | Hai link preview cục bộ có thể chơi trọn ván. Thử bằng touch và bàn phím, khung HUD dễ đọc, chat thu về bubble và không chặn bàn hay nút. Thưởng offline có kiểm chống nhận lặp và tương thích save. |
| **FD-ON1 · Phòng 1v1 dùng chung** | Dùng Edge Function có Auth, cập nhật phòng bằng một giao dịch có kiểm version. Hỗ trợ mã phòng, ghép theo từng game, kết nối lại, hết lượt/rời phòng, rematch và receipt khi gửi lại. Server kiểm nước Ô Ăn Quan. Với Nhảy Lò Cò, đặc tả cách server xác nhận chuỗi thao tác và cửa sổ thời gian trước khi mở PvP. Điểm và kết quả tính ở server. Bubble tự vào `Trận` khi ghế hợp lệ, chấm xanh và lời cạnh avatar qua adapter chung. | PGlite kiểm ghế, Auth, phiên bản, gửi lặp, sai lượt, lộ dữ liệu và nhận thưởng trùng. Hai tài khoản staging chơi qua hai phiên, nhận chat đúng phòng, rời hoặc chơi lại và vào lại sau mất mạng. |
| **FD-ON2 · Nghiệm thu** | Chạy CI đúng head, QA qua trình duyệt và thiết bị thật, kiểm mạng chậm và cả offline. Chuẩn bị mở catalog theo từng game, ghi cách thu hồi cấu hình catalog khi có lỗi. | Anh chơi và duyệt từng game trước merge. Migration trong mốc phát triển chỉ chạy ở PGlite hoặc staging. Giữ commerce tắt. |

Phạm vi kiểm gồm `src/games/folk-duel/`, hai engine, `tests/folk-duel/folk-games.test.mjs` và SQL nháp. Dùng Game UI/UX, Game QA/Playtest và Game Production/Scrum. Graphify `folk-duel` có 7 tệp, 72 nút; truy vấn `FolkRoomServer` depth 1 rồi xác nhận bằng nguồn. Bước đầu khi được duyệt là tạo nhánh Folk riêng cho FD-L0, xử lý preview Ô Ăn Quan và hai ca CI về chữ Canvas/artwork trước khi làm phòng online.
