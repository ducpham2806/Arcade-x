# Bàn giao · 18/11/2026 · Studio, chat toàn game và kế hoạch Folk

User yêu cầu cập nhật Studio trước, thêm bubble cho toàn bộ game, bàn giao kế hoạch Nhảy Lò Cò và Ô Ăn Quan. Nhánh local `codex/chat-all-games`, PR nháp [#38](https://github.com/ducpham2806/Arcade-x/pull/38) dùng head `codex/chat-bubble-wireframe`. Xem [thẻ CHAT](plans/MAINTENANCE.md), [bàn giao trước mở rộng](archive/SESSION-HANDOFF-2026-11-18-before-all-game-chat.md). Chờ chủ dự án duyệt trước khi merge main.

Studio đã lên `fa7b1db` từ main repo nguồn, local `f272357`. Có 125 skill, 21 vai trò và 340 blob khớp [manifest](studio/SOURCE-MANIFEST.md). Dùng Game UI/UX, QA/Playtest, Production/Scrum và playbook QA lead. Graphify AST `src/chat` 15 tệp/126 nút, `src/launcher` 9 tệp/81 nút, Folk Duel 7 tệp/72 nút, truy vấn depth 1 và kiểm lại code ngoài graph của launcher, iframe, preview và hai engine.

Chat qua GameWrapper của toàn bộ launcher. `/preview/snake/` nay gắn chat sau Play và dùng kênh game Snake cả khi phóng lớn. `placement.ts` thêm iframe vào vùng tránh khi kéo. `test:games` 27/27 mở/thu chat và thoát (cả hai Folk), guest Snake preview vẫn tải game theo yêu cầu. Build/lint/preview runtime qua, chat chung 3/3 và native 3/3 cục bộ. Mở game từ một file standalone độc lập ngoài ArcadeX cần phiên nền tảng để dùng chat ArcadeX.

Word/Battleship có schema và Edge trên `khqipuipeawzlkqmdzdg`, probe Auth-negative đã qua trong [QA native staging](chat/NATIVE-MATCH-QA-2026-11-15.md). Máy hiện tại không còn process localhost 4335 và chưa xác minh được phiên RAM hai tester từ lần trước. Cần chạy lại preview staging và xác nhận hai phiên đang đăng nhập để kiểm đầu-cuối, dùng Supabase staging. Hai game Folk hiện dùng kênh `Game`. `Trận` cần backend ghế/phòng thật.

[Plan Nhảy Lò Cò và Ô Ăn Quan](plans/FOLK-GAMES-PLAN.md) chờ duyệt. FD-L0 xử lý phép xem trước làm đổi bàn Ô Ăn Quan (Folk tests 5/6), chữ Canvas ở Nhảy Lò Cò và artwork thiếu. Sau đó mới hoàn thiện offline, Edge phòng chung và kiểm hai tài khoản staging. Full CI còn bị chặn, giữ draft.
