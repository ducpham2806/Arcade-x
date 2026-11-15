# Bàn giao · 15/11/2026 · Chat trận đang kiểm staging

User15/11 yêu cầu hoàn thiện Tank/Nối Từ/Hải Chiến, kiểm staging rồi duyệt trước merge. Nhánh `codex/chat-bubble-wireframe`; [thẻ CHAT](plans/MAINTENANCE.md), [QA native hiện tại](chat/NATIVE-MATCH-QA-2026-11-15.md). **Không merge main, không deploy production.**

Đã code private chat cả3: Hải Chiến server/transport/HUD, IDs qua đổi phe/ghế mới, receipt/rate và giấu chat với ghế đã rời; Tank UTC timestamp/spectator redaction; Word chat nối version mới nhất, gameplay vẫn guard riêng. Speech đo kích thước thật, tránh board/timer/nút. Sảnh/bubble chung giữ bố cục đã duyệt. Build/lint/bundle/social, Tank70/WS18, Word54, Battleship toàn bộ, commonChat3/3 và nativeChat3/3 đã qua. Ảnh native là Auth fixture/WS loopback/PGlite, không nhận là tài khoản thật.

Staging thật: Supabase khqipuipeawzlkqmdzdg (arcade-x-staging), SQL hai module đã áp transaction/ready=true; Word Edge lần4, Battleship lần2 đã deploy qua dashboard. Hash/bằng chứng ở QA. 12probe HTTPS preflight/Auth-negative qua, chưa positive2account. Không sửa ref production whjatkhhupeqfngakmee hay Render hiện dùng cho production.

Bản cuối: http://127.0.0.1:4335/review, Node process riêng dùng Auth staging; Tank WS loopback4335, Word/Battleship HTTPS staging. Auth RAM từng tab, không đọc/lưu password/JWT. User báo đã đăng nhập nhưng hai tab Chrome profile xuan duc vẫn ở form login; đang hỏi đúng phiên hoặc đăng nhập lại để kiểm thật. Giữ handoff, đừng reload phiên đã đăng nhập. Server3000 có sẵn; server3001 riêng không HMR dùng commonChatQA, không chạy suite tranh server/output.

Mốc trước native: local4f96eea/remote05506ec cùngtreee8dcffc. CLI Git thiếu credentials; publish qua GitHub connector, đối chiếu tree và update_ref có expected_sha, không force-push. Commit/checkpoint native có thể sau mốc này. Cần commit/push source+docs, CI remote và QA2account rồi anh duyệt. Không kết luận hoàn tất staging chỉ từ probe401 hoặc ảnh fixture. Log duy nhất WORKLOG≤3mục, lịch sử archive; Node24. Snake/online release trước giữ nguyên, commerce tắt.
