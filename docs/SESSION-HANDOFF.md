# Bàn giao · 08/11/2026 · ONLINE-ERROR ACTIVE

## Việc đang làm

User báo cả Nối Từ 403/409 và Tank kẹt kết nối. Nhánh `codex/fix-online-room-errors`, [PR21 nháp](https://github.com/ducpham2806/Arcade-x/pull/21); bản sửa chưa merge/deploy. [Báo cáo và bước tiếp](qa/ONLINE-ERROR-2026-11-08.md).

Public hai account tạo/vào AJEV5P thành công; sau đó bắt được 503 `SUPABASE_EDGE_RUNTIME_SERVICE_DEGRADED`, rồi 403 `NOT_MEMBER`. Ghế chủ phòng mất, chưa phân biệt chắc do hết hạn ready hay vắng mặt. Đã dọn phòng thử. 409 trong ảnh cũ chưa có body để phân loại; không kết luận mọi 409 là bình thường hoặc CORS cấu hình sai.

Tank `/health` bốn lần timeout dù TCP/TLS thành công. Dashboard hết phiên: GitHub chỉ liên kết deploy; Google hiện tại dẫn sang Create account nên dừng trước tạo. Đã hỏi user mở service bằng **tài khoản Render cũ** tại dashboard.render.com/web/srv-dbm1r9t6e07s73asmulg. Chờ đọc event/log/health để xử lý đúng nguyên nhân; chưa khôi phục dịch vụ, không đổi gói/env/SQL.

## Mã nguồn và kiểm tra

- Tank: hạn chờ handshake 75s lần đầu/10s khi nối lại, bỏ callback socket cũ và dọn timer/queue. Repro đỏ trước sửa; 3 regression mới, 69 Tank checks + launcher và 18 WS/ops loopback qua.
- Nối Từ: giữ mã lỗi gateway; thông báo 503 tiếng Việt; giữ mutation ID khi thử lại; xóa notice mạng cũ khi phiên hết hiệu lực, hướng dẫn vào lại/tạo phòng. 52 checks và toàn bộ 9 UI qua, gồm bot phone/desktop. Hai ảnh lỗi đã xem, giữ local theo báo cáo; duyệt egress ảnh chưa cho phép public. Lint/build/bundle qua trên Node24.
- PR21 đã push cả hai bản sửa; full CI đúng head mới cần qua trước merge. CI34 chỉ kiểm checkpoint Tank đầu, không dùng làm bằng chứng cho phần Nối Từ mới. `deliverables/` cũ không commit.

## Bối cảnh giữ nguyên

WC-PUBLIC đã phát hành: PR19/CI29, PR20 head970a941/CI32, merge **086d6ac**; Netlify6af00f400397c396a118ca39 Published. [Gói backend đã duyệt và áp](word-chain/PUBLIC-RELEASE-2026-11-08.md) là exception hẹp ở whjatkhhupeqfngakmee; không hỏi lại hoặc mở rộng SQL/JWT. Không dùng smoke trước incident chứng minh backend hiện khỏe.

User bỏ gate thật 3–4 người; fixture vẫn giữ. ON5/ON6 còn thiết bị/mạng/soak/IME/Auth/no-client turn; online chưa XP/xu, cần receipt bền vững. Sau incident tiếp Snake theo roadmap, chưa bắt đầu. TC-R0 ca A/mã B cũ user để sau; Render c705100/Free/cap16, Blueprint paused; commerce tắt.

Studio c5dac462 đủ 116 skill/21 vai trò/297 blob; chỉ nạp theo task. WORKLOG tối đa 3 mục, COMPLETED/archive giữ lịch sử; doc checker trước commit.
