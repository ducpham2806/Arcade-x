# Ô Ăn Quan / Nhảy Lò Cò · thẻ tiếp quản

Nguồn từ main `a55af6e`, kế hoạch thiết kế14/11/2026. [GDD v2 nguyên văn](../archive/FOLK-GAMES-PLAN-2026-11-14-v2.md) giữ đủ luật, economy, cosmetics, art, UI/backend và milestone. Thẻ này chỉ thu gọn đầu vào theo WORKFLOW; không thay quyết định gameplay hay xác nhận code/merge/deploy/nghiệm thu. Không triển khai Folk trong task chat.

## Phạm vi và quyết định phải giữ

- Hai game độc lập trong sảnh Multiplayer: `o-an-quan` (Ô Ăn Quan · Sân Đình), `nhay-lo-co` (Nhảy Lò Cò · Ngõ Nhỏ); bot và hạ tầng phòng1vs1 dùng chung module Folk Duel.
- Ô Ăn Quan: bàn12ô,2Quan/10Dân, rải trái/phải, chuyền tay, bắt/ăn kép, nợ và hốt tàn; giữ luật/biến thể chi tiết ở GDD §3.
- Nhảy Lò Cò: bàn10ô đơn/đôi, thảy Chàm→nhảy nhịp→nhặt Chàm/xây Nhà; đối chiếu GDD §4 khi kiểm luật.
- Skin chỉ đổi hình/hiệu ứng/âm thanh; zero pay-to-win. GameBridge, thưởng, Xu/XP/Kẹo/Rương và commerce trong GDD là thiết kế, không tự cấp quyền production hoặc bật thanh toán. Áp quy tắc save/Auth/commerce của AGENTS/project hiện tại.
- Art pixel Việt Nam: icon512/banner1280×640, sprite trong suốt/nearest-neighbor, bảng màu/render đa skin ở GDD §5–§8. Modal và vùng chơi theo quy tắc ArcadeX đã duyệt.

## Công việc theo milestone

| ID | Việc / đầu mối | Điều kiện xong |
|---|---|---|
| FD-L0 | Luật deterministic/bot, skins catalog/renderer, shop và2thẻ sảnh; `src/games/folk-duel/`, registry/catalog | Đối chiếu nguồn thực với GDD; test luật/bot/save/economy, UI/asset/budget và runtime. Có code không thay nghiệm thu |
| FD-ON1 | Phòng1vs1/mã6ký tự/FIFO/CAS/receipt/presence/rematch, đồng bộ skin; `supabase/folk-duel/`, online client/room | Auth/membership/hidden data/duplicate/concurrency và lỗi mạng được kiểm PGlite/staging; không ghi SQL production |
| FD-ON2 | Hai account/thiết bị/mạng, renderer/skin/rewards, bản phát hành và rollback | Đủ QA/CI đúng head; chủ dự án duyệt trước merge/deploy. Giữ phân biệt fixture, staging và production |

Trạng thái tiếp quản: **cần xác minh theo đúng nguồn và bằng chứng hiện tại**, không suy ra PASS từ GDD. Nguồn mới đã xuất hiện trong main; kiểm phạm vi implementation và CI trước khi chọn task kế. Kế hoạch chi tiết/phân công vai trò và bộ ca còn lại giữ nguyên ở GDD §1/§9; không tự tạo strike team hoặc nạp toàn bộ Studio.

## Kiểm chứng và bàn giao

Chọn1–3skill phù hợp từ Studio INDEX (luật/GDD, UI/art hoặc backend/QA theo task); dùng graph đúng module khi điều tra quan hệ code. Chạy đúng script `package.json` và workflow CI, không tắt/nới kiểm để xanh. Thưởng và migration chỉ ở staging/PGlite khi được giao; giữ output sinh bằng script. Chốt ngày/nhánh/file/kết quả thật/giới hạn và bước tiếp trong WORKLOG/COMPLETED/SESSION-HANDOFF theo WORKFLOW.
