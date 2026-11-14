# Bàn giao · 15/11/2026 · Chat bubble chờ anh kiểm trước merge

Chủ dự án duyệt wireframe14/11, yêu cầu triển khai sảnh/ingame và kiểm trước merge; tiếp tục15/11. Nhánh `codex/chat-bubble-wireframe`, nguồn064a3a5. [Thẻ bảo trì CH1–CH4](plans/MAINTENANCE.md), [kế hoạch đã duyệt](chat/BUBBLE-CHAT-PLAN.md), [QA implementation](chat/IMPLEMENTATION-QA-2026-11-15.md).

Mốc implementation đã đối chiếu: local `b502e7c` và remote `36d4e06` có cùng tree `c32aa1d2cf3cb15fbcdf9b983e6772544c16f36b`. Git CLI thiếu credentials/SSH identity; nhánh được đưa qua GitHub connector. Metadata commit khác SHA; đối chiếu tree, không force-push nhánh. Checkpoint tài liệu có thể nằm sau mốc implementation này.

Đã code host/store theo owner, sảnh nhỏ, bubble kéo/nhớ, thu/phóng, giữ nháp, unread và lời nổi cạnh avatar/HUD. GameWrapper dùng chung toàn bộ game, tách pause PvP và nhả input khi vào chat. Caro/Chess/Xiangqi đăng ký room social cũ. Tank WS/Nối Từ có protocol và server chat local, capability fallback khi máy chủ cũ; chưa áp SQL hay deploy backend production. Không biến kênh Game công khai thành chat trận.

Bản local: http://localhost:3000/; trang kiểm component thật + tin mẫu ở /test-results/chat-review/index.html, tái tạo bằng `npm run preview:chat`. Nút “Bình gửi thử” kiểm unread/lời nổi. Các kiểm local và lượt retry ghi ở QA; không dùng chúng chứng minh production. Chờ chủ dự án nghiệm thu UI; còn staging native chat, thiết bị thật/keyboard và hai tài khoản. Không merge main, không deploy khi chưa được yêu cầu.

Snake R01 đã phát hành trước đó: PR29/CI47, main19af480, Netlify6af6c33ffa88465933ad464a; [bằng chứng13/11](qa/SNAKE-PUBLIC-2026-11-13.md). Còn nghiệm thu người mới/thiết bị và live save/JWT. Nối Từ đã public, ON5/ON6 cònQA; Tank giữ Render Free theo quyết định chủ dự án. Commerce tắt. Không mở lại backend release cũ chỉ từ việc triển khai chat. Giữ một WORKLOG ≤3 mục, lịch sử trong archive.
