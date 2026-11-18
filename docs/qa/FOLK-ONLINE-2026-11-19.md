# FD-ON1 · phòng Folk Duel · 19/11/2026

Nhánh `codex/folk-duel-foundation`, tiếp head local `92e3dd3` có cùng tree với remote `791810c`. [PR 40 nháp](https://github.com/ducpham2806/Arcade-x/pull/40). Anh yêu cầu tiếp theo plan, giữ duyệt trước merge.

## Hợp đồng đã triển khai

- Edge Function `folk-duel-room` dùng Auth `getUser`, chỉ nhận tài khoản đăng ký. UID lấy từ Auth. Bản trả về có ghế, tên và trạng thái công khai của ván. Schema riêng `folk_duel`, RLS và thu hồi quyền của `anon/authenticated`. RPC chỉ cho `service_role`. Header credentials của service chỉ nằm trong Edge.
- Mã sáu ký tự, ghép FIFO theo game. PostgreSQL tuần tự hóa giao dịch ghi ngắn theo game, kiểm revision và một phòng còn hiệu lực mỗi tài khoản trong mỗi game. Ghế thứ ba, sai game, sai lượt và đọc phòng người khác bị từ chối.
- Trình duyệt giữ nguyên request/action ID khi mất phản hồi. Receipt gắn actor, ID và nội dung lệnh, lưu cùng bàn trong giao dịch. Chat và hai phiếu đấu lại được phép cập nhật trên snapshot khác version nếu vẫn hợp lệ theo phòng hiện tại. Lệnh nước đi phải đúng version.
- Ô Ăn Quan kiểm luật ở server và lưu lịch sử cùng nước đi. Hai phía trình diễn trace đã chấp nhận. `readyAt` dựa trên độ dài timeline, cộng một giây đồng bộ rồi bắt đầu 25 giây cho lượt mới. Bỏ qua hiệu ứng vẫn theo cùng mốc nhập do server đặt.
- Nhảy Lò Cò gửi từng lệnh thảy, một/hai chân và nhặt Chàm. Server giữ pha, chỉ số bước, đồng hồ canh lực, kiểm cadence tối thiểu 110ms rồi tự tính điểm/nhà. Thao tác đo lực dùng thời điểm nhận ở server. Client ước lượng đồng hồ và độ trễ một chiều từ snapshot, giới hạn bù 400ms. Cần kiểm thực tế mạng chậm để đánh giá cảm giác canh lực.
- Quay lại bằng **Tiếp tục phòng online**. Rời trận chốt thua. Hết giờ lượt xử ở snapshot hoặc scheduler 10 giây. Đấu lại cần hai phiếu trong 60 giây, đổi người đi trước và mã ván, xóa chat ván cũ. Kết quả và điểm được ghi một receipt riêng mỗi round. Online giữ phần cấp Xu/XP/Kẹo tắt trong bản QA.
- Adapter dùng ChatContext và ChatStore hiện có. Vào ghế hợp lệ tự có kênh Trận, unread, lời nổi cạnh HUD theo ghế. Rời phòng, hết hạn hoặc đổi tài khoản gỡ adapter. Việc đọc chat không làm đổi version gameplay.

## Kiểm chứng

- 11 ca luật/lưu/economy offline và 10 ca Edge/PGlite. Có Auth âm, RPC denial, sai game, thành viên thứ ba, phiên bản, receipt gửi lặp, chat riêng, queue đồng thời, NLC đủ lượt, scheduler, hai phiếu rematch đồng thời, leave retry và rate limit.
- Bộ trình duyệt offline và online chung 7/7 qua. Bộ online chạy qua App thật trong hai context desktop/mobile giả lập, mock Auth và PostgREST nối PGlite với handler Edge thật. Có đủ lượt NLC, history/resume/retry Ô Ăn Quan và đổi lượt/đấu lại. Ảnh ở `test-results/folk-online/` đã mở kiểm.
- Staging `khqipuipeawzlkqmdzdg` đã áp schema, Edge và cron riêng. Request thiếu hoặc sai bearer trả 401. HTTP RPC công khai bị chặn 401. Probe RPC xác nhận `anon/authenticated` không có execute trên 5 hàm Folk, service có quyền. Scheduler đã nhận HTTP 200.
- Chưa kiểm gửi/nhận bằng hai tài khoản thật trong phiên 19/11. Ngày 19/11 anh chọn tự kiểm hai tài khoản sau tại `http://127.0.0.1:4335`. Đây là Vite chạy backend staging. Cổng 4357 giữ backend tắt cho bản offline.
- Không có bằng chứng điện thoại vật lý hoặc liên thiết bị. Chờ kiểm canh lực dưới latency thật và duyệt hình/thao tác trước merge.

## An ninh và vận hành staging

Advisor sau thay đổi có INFO về bốn bảng Folk bật RLS, không có policy và chỉ cho service truy cập trong schema riêng. Đã kiểm quyền thực tế. Edge v2 ACTIVE, bundle SHA256 `8c0a01688cd6bbb658b01720691a7c27b0cbe4dc2cc6b2097f25d0343f23bfa0`. Lịch `folk-duel-room-timeouts` chạy thành công, tick 200 trả `settled: 0` khi chưa có phòng đến hạn. [Giải thích kiểm RLS](https://supabase.com/docs/guides/database/database-linter?lint=0008_rls_enabled_no_policy).

WARN bảo vệ mật khẩu rò rỉ có từ baseline staging trước task, giữ trong trạng thái môi trường để chủ dự án theo dõi. [Cấu hình Auth](https://supabase.com/docs/guides/auth/password-security#password-strength-and-leaked-password-protection).

Dùng `npm run prepare:folk-server` tạo `entrypoint.js` từ nguồn và luật dùng chung. Test kiểm bundle khớp nguồn. Deploy file này qua connector với `verify_jwt=false` vì handler tự xác minh qua Auth và scheduler có tick-only token. Token ở Vault, Edge so hash bằng RPC service-only. `supabase/folk-duel/scheduler.sql` lấy URL từ secret môi trường `wc_room_project_url` đã có. Khi tạo môi trường mới cần secret này trước khi áp scheduler.

Studio Backend Architect, Game QA & Playtest và Technical Director. Graphify phạm vi Folk và Edge Duel để đối chiếu persistence cũ. Graph chỉ trích AST, các đảm bảo giao dịch/Auth được kiểm bằng source, PGlite và các probe trên staging.

Graph sau thay đổi cập nhật Folk 126 nút/277 cạnh, Edge Folk 115/240 (gồm bundle sinh). Truy vấn depth 1 theo `FolkOnlineClient`, `FolkOnlineServer` và `applyCommand`, đối chiếu file nguồn vì bundle có ký hiệu trùng.

Các kiểm tổng hợp Node 24 đã qua lint, build, bundle budget (298 kB gzip), test:fast và test:animations (54 contract, 25 browser). Sau đó hai ca online chạy lại qua, thêm kiểm lời nổi tránh cả bàn và đồng hồ. Frontend cấu hình triển khai Folk ở `supabase/config.toml` trỏ bundle JavaScript dùng chung. [Tham chiếu cấu hình Supabase](https://supabase.com/docs/guides/functions/function-configuration).
