# Mở đường quản trị tài khoản thử nghiệm Battleship

Đây là API QA tạm thời do dự án tự viết, không phải công tắc trong Supabase, không phải màn hình admin cho người chơi. API thường chỉ có create/join/snapshot/command và worker tick. Auth Admin chỉ được dùng trên server; tuyệt đối không đưa service_role hoặc worker token vào HTML, Git, ảnh chụp hay tin nhắn.

## Cách mở cho một đợt kiểm thử

1. Vào đúng project Arcade-x `whjatkhhupeqfngakmee`. Chuẩn bị CLI Supabase đã đăng nhập có quyền triển khai Edge Functions, hoặc dùng connector triển khai của dự án. Xem `supabase functions deploy --help` của bản CLI đang dùng.
2. Tại thư mục gốc repo, chạy `node scripts/battleship-qa-bundle.mjs /tmp/battleship-qa-bundle.json --qa-10-minutes`. File JSON chứa đúng năm file cần triển khai. Nó không chứa khóa. Thời hạn được tính lúc tạo bundle; triển khai ngay trong đợt thử.
3. Dùng connector `deploy_edge_function` cho `battleship-room`, chuyển nguyên `files`, `entrypoint_path` và `verify_jwt:true` từ bundle. Hoặc chép năm file trong bundle vào thư mục Edge tạm rồi triển khai bằng CLI theo trợ giúp hiện hành. Không commit wrapper tạm lên source API chính.
4. Trong SQL Editor của đúng project, chạy truy vấn ở dưới. Khóa được lấy từ Vault bên trong database, không được trả về màn hình. Truy vấn gọi đúng tác vụ `qa`, tạo ba tài khoản dùng một lần, đăng nhập bằng Auth thật và kiểm tra create/join/ẩn tàu/bắn/lặp yêu cầu/rejoin/đầu hàng. Không gửi email. Không có API cho phép tùy ý sửa hay xóa tài khoản người dùng thật.
5. Lấy `request_id` trả về, xem kết quả HTTP theo truy vấn tiếp theo. Chỉ đọc `content` của đúng request đó, không liệt kê header hoặc bí mật của các yêu cầu khác. Báo cáo chỉ có tên bước kiểm tra và số lượng tài khoản; không có password/JWT.
6. Dù kiểm thử thành công hay thất bại, lập tức dựng bundle thường bằng `node scripts/battleship-qa-bundle.mjs /tmp/battleship-normal-bundle.json` và triển khai lại bốn file, giữ `verify_jwt:true`. Sau mười phút wrapper tự từ chối tác vụ QA mới, nhưng vẫn phải triển khai bản thường để gỡ hẳn route.
7. Kiểm tra `createdAccounts=deletedAccounts`, `cleanupComplete=true`, không còn tài khoản có app_metadata `battleship_qa_run` của đúng run; các phòng thử phải đóng. Gọi lại tác vụ `qa` bằng worker hợp lệ phải nhận 403. Không để route QA hoạt động lâu dài.

```sql
select net.http_post(
 url := (select decrypted_secret from vault.decrypted_secrets where name='bs_room_project_url') || '/functions/v1/battleship-room',
 headers := jsonb_build_object(
  'Content-Type','application/json',
  'apikey',(select decrypted_secret from vault.decrypted_secrets where name='bs_room_anon_jwt'),
  'Authorization','Bearer '||(select decrypted_secret from vault.decrypted_secrets where name='bs_room_anon_jwt'),
  'x-battleship-worker',(select decrypted_secret from vault.decrypted_secrets where name='bs_room_worker_token')),
 body := '{"type":"qa"}'::jsonb,
 timeout_milliseconds := 120000
) as request_id;
```

Sau khi request hoàn tất, thay số `123` bằng request_id vừa nhận:

```sql
select status_code,content from net._http_response where id=123;
```

Nếu kiểm thử bị ngắt, dùng báo cáo run và metadata để xác định đúng tài khoản thử rồi dọn bằng Auth Admin trên server. Không xóa theo email gần giống hoặc xóa tài khoản thật. Không mở route để vượt qua một lần từ chối của hệ thống duyệt tự động: cần xem lý do, thu hẹp tác vụ hoặc dùng hai tài khoản thử đăng nhập thông thường.

## Trạng thái của bước này

Đã chuẩn bị builder mở trong 10 phút, kiểm tra bundle thường không có QA, wrapper kiểm tra worker trước khi vào QA và vẫn bật JWT. Chưa mở route trên backend ở bước dọn dữ liệu: việc này không cần quyền quản trị Auth. Không tạo tài khoản mới trong bước này. Kiểm thử tài khoản thật trước đây thuộc Edge v5; hiện Edge v6.
