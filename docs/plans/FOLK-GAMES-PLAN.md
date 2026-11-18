# Nhảy Lò Cò và Ô Ăn Quan

Kế hoạch cập nhật ngày 18/11/2026. [GDD v2](../archive/FOLK-GAMES-PLAN-2026-11-14-v2.md) lưu luật, art, skin và thiết kế thưởng. Bản FD-L1 trên `codex/folk-duel-foundation` tiếp FD-L0 `20c5a72`, chờ anh chơi thử và duyệt.

## Phạm vi và quyết định phải giữ

- Hai game độc lập trong sảnh Multiplayer: `o-an-quan` (Ô Ăn Quan · Sân Đình), `nhay-lo-co` (Nhảy Lò Cò · Ngõ Nhỏ); bot và hạ tầng phòng1vs1 dùng chung module Folk Duel.
- Ô Ăn Quan: bàn12ô,2Quan/10Dân, rải trái/phải, chuyền tay, bắt/ăn kép, nợ và hốt tàn; giữ luật/biến thể chi tiết ở GDD §3.
- Nhảy Lò Cò: bàn10ô đơn/đôi, thảy Chàm→nhảy nhịp→nhặt Chàm/xây Nhà; đối chiếu GDD §4 khi kiểm luật.
- Skin chỉ đổi hình/hiệu ứng/âm thanh; zero pay-to-win. GameBridge, thưởng, Xu/XP/Kẹo/Rương và commerce trong GDD là thiết kế, không tự cấp quyền production hoặc bật thanh toán. Áp quy tắc save/Auth/commerce của AGENTS/project hiện tại.
- Art pixel Việt Nam: icon512/banner1280×640, sprite trong suốt/nearest-neighbor, bảng màu/render đa skin ở GDD §5–§8. Modal và vùng chơi theo quy tắc ArcadeX đã duyệt.

## Mốc trước FD-L0

- Cả hai game có luật, bot, hai người cùng máy, Canvas, skin, âm thanh và màn phòng thử. Build cục bộ vào được cả hai game, mở kênh `Game` bằng bubble và thoát về sảnh. Kiểm chat trên build cục bộ không xác nhận phát hành catalog production.
- Bộ luật/economy/phòng Folk sau khi bundle bằng esbuild đạt **5/6**. `previewOaqLandingCell()` gọi `applyOaqMove()` trên chính state đang chơi. Đường `ensureSideHasStones()` trả lại cùng object khi còn quân, phép tính preview đổi lượt và sửa ô trước khi người chơi xác nhận. Ca đỏ là P1 chọn ô 1 theo chiều CW ngay ván đầu.
- Kiểm chữ Canvas báo lỗi ở `src/games/nhay-lo-co/renderer.ts:110`. Kiểm artwork dừng ở `o-an-quan`; cả hai game cần metadata, icon và banner của launcher.
- `OnlineRoom.tsx` gọi `FolkRoomServer` trong bộ nhớ trình duyệt. Hai game đã có SQL nháp ở `supabase/folk-duel/schema.sql`; luồng đối đầu cross-device, chat `Trận` và xác nhận thưởng online còn chờ triển khai.

## Bản FD-L0 · 18/11/2026

- Preview hai chiều, bot và nước đi chính dùng cùng bộ luật, kiểm state đầu vào giữ nguyên. Chuyền tay đủ lượt để đưa hết quân xuống bàn. Khi hốt tàn, trừ số điểm rải sinh đã ứng, giữ hai điểm cuối không âm và tổng 70. Node 24 chạy trực tiếp `npm run test:folk-duel`, đạt 9/9 và nằm trong `test:fast`.
- Chữ Canvas dùng `readableCanvasText`, số sỏi trên Ô Ăn Quan tăng cỡ cho điện thoại. Hai bộ artwork native SVG có bàn hai hàng và hai Quan, sân nhảy ô đơn/đôi và mảnh Chàm. WebP xuất bằng script, icon 512 × 512, banner 1280 × 640, mỗi tệp dưới 41 kB. Đăng ký cache gói và preview DEV của hai game.
- Chromium 390 × 844 và 1280 × 820 đã tải artwork, mở/thu bubble, chọn ô 1 và rải phải, thảy Chàm và nhảy bước đầu, thoát về sảnh. Ảnh ở `test-results/folk-review/`. Kiểm giả lập trình duyệt, chưa đánh giá ván đủ lượt trên điện thoại thật.

## Thứ tự triển khai và điểm duyệt

| Mốc | Việc triển khai | Tiêu chí để anh duyệt |
|---|---|---|
| **FD-L0 · Ổn định luật và CI** | Tách tính nước đi Ô Ăn Quan khỏi state đầu vào để bot, preview và replay dùng chung luật. Kiểm giữ tổng điểm sau khi quy đổi Quan và tính nợ, rải tiếp, ăn kép, bảo vệ Quan đầu ván, rải sinh và hốt tàn. Đưa test Folk vào lệnh Node 24 ổn định. Dùng chữ Canvas đúng chuẩn ArcadeX, bổ sung icon/banner và metadata thật cho cả hai game. | Test luật, readability, artwork qua. Chuỗi ván Ô Ăn Quan cho cùng kết quả khi chơi, dự báo và chạy lại cùng đầu vào. Duyệt icon, banner và cách nhìn bàn trên điện thoại. |
| **FD-L1 · Hai bản chơi offline** | Xong luồng Ô Ăn Quan trước để chốt luật và mẫu onboarding. Với Nhảy Lò Cò, hoàn thiện chỉ dẫn thảy Chàm, vùng canh lực, nút một/hai chân, báo lỗi nhịp và xây Nhà. Cả hai game kiểm bot, chơi hai người cùng máy, đổi lượt, chơi lại, lưu tiến trình, skin và bubble trong màn hình hẹp. | Hai link preview cục bộ có thể chơi trọn ván. Thử bằng touch và bàn phím, khung HUD dễ đọc, chat thu về bubble và không chặn bàn hay nút. Thưởng offline có kiểm chống nhận lặp và tương thích save. |
| **FD-ON1 · Phòng 1v1 dùng chung** | Dùng Edge Function có Auth, cập nhật phòng bằng một giao dịch có kiểm version. Hỗ trợ mã phòng, ghép theo từng game, kết nối lại, hết lượt/rời phòng, rematch và receipt khi gửi lại. Server kiểm nước Ô Ăn Quan. Với Nhảy Lò Cò, đặc tả cách server xác nhận chuỗi thao tác và cửa sổ thời gian trước khi mở PvP. Điểm và kết quả tính ở server. Bubble tự vào `Trận` khi ghế hợp lệ, chấm xanh và lời cạnh avatar qua adapter chung. | PGlite kiểm ghế, Auth, phiên bản, gửi lặp, sai lượt, lộ dữ liệu và nhận thưởng trùng. Hai tài khoản staging chơi qua hai phiên, nhận chat đúng phòng, rời hoặc chơi lại và vào lại sau mất mạng. |
| **FD-ON2 · Nghiệm thu** | Chạy CI đúng head, QA qua trình duyệt và thiết bị thật, kiểm mạng chậm và cả offline. Chuẩn bị mở catalog theo từng game, ghi cách thu hồi cấu hình catalog khi có lỗi. | Anh chơi và duyệt từng game trước merge. Migration trong mốc phát triển chỉ chạy ở PGlite hoặc staging. Giữ commerce tắt. |

## Bản offline FD-L1 · 18/11/2026

- Ván bot và hai người chung máy tự lưu sau lượt, mở lại bằng **Tiếp tục ván đã lưu**. Nhảy dở tiếp tục từ đầu lượt. Ván kết thúc mở lại được và giữ receipt thưởng. Hồ sơ cũ trong save ArcadeX đọc được, skin giữ khi đổi ván.
- Ô Ăn Quan chọn ô bằng touch hoặc bàn phím. Nhảy Lò Cò bỏ ô Nhà đối thủ và thêm nhặt Chàm có canh lực. Kiểm đủ ván bốn tổ hợp game/chế độ trên Chromium, mở lại, đấu lại, điểm và thưởng. Bằng chứng `test-results/folk-offline/`.
- Vào thử [Ô Ăn Quan](http://127.0.0.1:4357/?review=o-an-quan) và [Nhảy Lò Cò](http://127.0.0.1:4357/?review=nhay-lo-co) trên máy đang chạy dev. Bước kế FD-ON1 là phòng 1v1 và chat Trận sau khi anh duyệt bản offline.

### Ô Ăn Quan · trình diễn lượt đi

- Bàn tay bốc và rải từng viên. Quân ăn, quân Quan và hốt tàn bay về mẹt theo ghế. Cam cho người 1, xanh ngọc cho người 2. Lưu kết quả lượt được chấp nhận cùng đường rải/ô ăn. Mở lại thấy bàn đã chốt và lịch sử.
- Chromium đã kiểm đúng thứ tự ô, khóa nhập khi trình diễn, mẹt nhận sỏi, lưu và mở lại. Có bỏ qua hiệu ứng và hỗ trợ giảm chuyển động. [Bàn giao hiện tại](../SESSION-HANDOFF.md).
