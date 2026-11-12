# Snake UI save · fixture và live

## Local/CI

Node24, `npm ci`, `npx playwright install chromium` (hoặc `CHROMIUM_EXECUTABLE`). Chạy `npm run test:snake-ui`; không cần credentials. Ảnh/report/trace khi lỗi chỉ chứa tài khoản giả `example.invalid`, job CI lưu7ngày. Không dùng runner Playwright Test này cho tài khoản thật vì error-context/trace có thể chứa input đăng nhập.

Tham chiếu private verifier nếu đã có snapshot chỉ đọc đúng hash: đặt `SNAKE_VERIFIER_MODULE` trỏ file ngoài repo rồi chạy cùng lệnh. Mặc định public engine đã tự kiểm replay; reference vẫn là database/Auth fixture. Không đưa snapshot hoặc token vào commit/CI/artifact công khai.

## Live opt-in · chưa nghiệm thu runner

Runner mới không tạo người dùng, không grant/SQL/admin/deploy hoặc đổi flags. Chỉ dùng **disposable registered actor đã được operator cấp quyền Snake**, state rỗng/revision0, reward disabled, grant còn đủ lâu. Operator chịu trách nhiệm chuẩn bị/dọn ở môi trường được phép; AGENTS cấm script/migration SQL production. Không dùng tài khoản người chơi thật hoặc cấp shared rewards để qua test.

Cấp qua secret/runtime environment của phiên, không chat, `VITE_*`, lệnh có literal password hoặc file tracked:

| Biến | Giá trị |
|---|---|
| `SNAKE_LIVE_EMAIL` | Email fixture có sẵn |
| `SNAKE_LIVE_PASSWORD` | Password fixture qua secret |
| `SNAKE_LIVE_ACTOR_ID` | UID chính xác đã được cấp |
| `SNAKE_LIVE_GRANT_CONFIRMED` | `1` khi operator đã xác nhận disposable actor/grant/rewards/cleanup |

`npm run test:snake-ui-live -- --preflight`: thiếu binding trả WAITING_BINDINGS/exit2 trước network; đủ binding chỉ GET Auth settings, không login hoặc xác nhận grant. Mạng cần HTTPS/WSS `whjatkhhupeqfngakmee.supabase.co`; lệnh không sửa network policy. `--live` mới login SDK kiểm UID/registered và đọc Snake state, sau đó signout session kiểm tra trước khi mở UI. Backend dùng public config tracked, từ chối VITE override và không đọc env file bằng Vite; local port3002 phải trống.

`npm run test:snake-ui-live -- --live`: login bằng form, chơi thắng bằng pointer/frame thật, chờ saved/revision1, kiểm ví launcher, reload và browser context mới restore, logout. Có ghi progress riêng của fixture. Không trace/video/HAR/login screenshot/raw error; chỉ stage/summary an toàn, không tự upload artifact. Bundle tạm bị xóa trong finally; context/session do runner tạo được signout local khi còn truy cập được. Nếu trình duyệt/mạng lỗi, operator vẫn phải thu hồi fixture/session theo runbook cũ.

`--live --wait-for-expiry` chỉ dùng khi **JWT thực cấp từ issuer** còn≤10phút, grant còn đủ thời gian chờ + chơi. Runner chờ đồng hồ thật tới sau expiration ban đầu, xác minh SDK có expiry mới rồi chơi/lưu; không sửa token, fake clock hoặc thay issuer TTL. JWT dài hơn budget làm runner fail sớm, không tính là passed. Mặc định expiry ghi not_tested. Path live chưa được kiểm runtime trong môi trường hiện tại.

Sau mọi lần live, kể cả lỗi: operator dọn đúng actor đã bind, Snake runs/receipts/account/test-actor/Auth/profile phụ thuộc và kiểm count; không xóa actor khác. Runner chỉ logout, không tự xóa DB/user. Giữ bằng chứng riêng đã che danh tính; cập nhật report bằng kết quả thực tế. Không chạy lại cùng fixture đã có revision1: cần fixture rỗng mới hoặc operator cleanup trước.

Runner mới chưa tự động fault/concurrency backend thật. Cần bổ sung/kiểm các ca này với fixture được cấp; runner adapter cũ `test:snake-live -- --live` có signup/grant tương tác riêng, không được dùng thay UI nghiệm thu. Bằng chứng07/11 hoặc fixture local không đóng JWT/RLS/transaction/live gates. Xem [report R0b](../qa/SNAKE-R0B-2026-11-12.md).
