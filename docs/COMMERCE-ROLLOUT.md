# Bật commerce theo từng bước (M8)

Tất cả flag commerce đang **tắt** (`.env.example`). Tài liệu này là thứ tự bật, điều kiện cần, cách kiểm tra và đường lui cho từng flag. Mọi bước đều làm trên **project Supabase staging** trước; không chạy migration hay script kiểm tra lên production (`scripts/verify-access-rollout.mjs` tự từ chối project production).

## Security review (30/10/2026)

Phạm vi: `supabase/migrations/2026101800*`, `20261018052000*`, `server/commerce/*`, `shared/rental-*`, `src/commerce/*`, RLS các bảng `launcher_orders`/`launcher_entitlements`.

**Không phát hiện lỗi nghiêm trọng.** Điểm mạnh đã kiểm:

- Mọi hàm `security definer` đặt `search_path=''`; quyền `execute` bị thu hồi khỏi `public/anon` rồi cấp tối thiểu cho `authenticated`.
- Danh tính luôn lấy từ `auth.uid()`; tài khoản ẩn danh bị loại ở mọi lệnh có quyền; admin xác định bằng bảng `launcher_private.admins`, không bằng JWT metadata.
- Trình duyệt chỉ **đọc** đơn hàng và quyền của chính mình; ghi thanh toán (`launcher_record_payment`) chỉ dành cho `service_role`; không thể tự cấp quyền chơi.
- Mọi lệnh admin bắt buộc lý do 3–500 ký tự và ghi audit trước/sau; không có lệnh xác nhận thanh toán hay đổi quyền admin qua RPC.
- Lượt chơi thử có khoá theo người dùng, giới hạn số lượt, revision chống ghi đè giữa tab, dữ liệu ≤ 64 KB; danh mục gói luôn trả `checkoutEnabled:false`.
- Lõi thanh toán (`server/commerce`) xác minh webhook trước khi đọc dữ liệu, chống trùng sự kiện/payment, không nhận "thanh toán thành công" từ trình duyệt; lớp HTTP mặc định tắt, bắt buộc rate-limit, giới hạn body 4 KB, `no-store`.
- Client ràng buộc flag đúng thứ tự (checkout cần orders + access; review/reconciliation cần access).

**Cần lưu ý trước khi đi tiếp:**

1. **Không đưa schema `launcher_private` vào danh sách schema PostgREST expose.** `authenticated` có quyền `usage` trên schema này và `execute` trên các hàm private (để wrapper `public.*` gọi được); hàm private chỉ an toàn vì không được expose qua REST.
2. **Đường thanh toán cũ** (`public.launcher_create_order` cho `authenticated`, `public.launcher_record_payment` cho `service_role`) vẫn tồn tại. Trước bước 4 phải tắt hoặc đối soát để nó không là lối vòng qua lõi mới (README commerce, mục 3).
3. **Admin được thêm thủ công bằng SQL.** Giữ danh sách nhỏ, ghi lại ai thêm và khi nào; xoá ngay khi người đó không còn vai trò.

## Kiểm thử tự động (chạy trong CI)

| Lệnh | Nội dung |
|---|---|
| `npm run test:sql` | Áp toàn bộ migration lên PostgreSQL trong tiến trình (PGlite) và chạy các bộ SQL, gồm `supabase/tests/subscription-foundation.sql`, `starter-gifts.sql`, `store-trial.sql`: đọc chéo tài khoản, người thường gọi lệnh admin, tự phong admin, tự cấp quyền, vượt pilot, ghi đè lượt thử của người khác, tài khoản ẩn danh, chặn tài khoản/game… |
| `npm run test:commerce` | Lõi đơn thuê/thanh toán/duyệt/đối soát với ledger trong bộ nhớ (78 kiểm tra) |
| `npm run test:subscriptions` | Client access/subscription |
| `npm run test:supabase` | Như `test:sql` nhưng trên Docker, thêm kiểm tra hai kết nối tranh nhau một khoá |

## Thang bật flag

| Bước | Flag | Phụ thuộc | Backend | Trạng thái |
|---|---|---|---|---|
| 1 | `VITE_ACCESS_CONTROL_V2` | — | 2 migration subscription (đã có) | **Sẵn sàng thử trên staging** |
| 2 | `VITE_RENTAL_ORDERS_API` | 1 | Route HTTP + repository bền vững + xác thực phiên | Chưa có adapter |
| 3 | `VITE_RENTAL_REVIEW_API` | 1 | Bảng hàng đợi duyệt + lệnh admin bền vững | Chưa có adapter |
| 4 | `VITE_RENTAL_CHECKOUT_API` | 1, 2 | Nhà cung cấp thanh toán + webhook + adapter xác minh chữ ký | **Cần chọn nhà cung cấp** |
| 5 | `VITE_RENTAL_RECONCILIATION_API` | 1 | Route nội bộ được bảo vệ | Chưa có adapter |

### Bước 1 — Access control v2 (pilot)

1. Tạo/chọn project **staging**; áp lần lượt các migration trong `supabase/migrations` (hoặc chỉ hai migration subscription nếu staging đã có các migration trước).
2. Thêm tài khoản admin: `insert into launcher_private.admins(user_id) values ('<uuid>');`
3. Chạy kiểm tra (chỉ đọc):
   ```
   STAGING_SUPABASE_URL=… STAGING_PUBLISHABLE_KEY=… PLAYER_EMAIL=… PLAYER_PASSWORD=… ADMIN_EMAIL=… ADMIN_PASSWORD=… node scripts/verify-access-rollout.mjs
   ```
4. Build staging với `VITE_ACCESS_CONTROL_V2=true` trỏ vào project staging. Rollout vẫn ở chế độ `off`: mọi người dùng kiểm tra quyền như cũ.
5. Trong Quản trị quyền: thêm 1–2 tài khoản pilot, chuyển chế độ sang `pilot`, thử: game miễn phí vẫn mở; game trả phí bị khoá với pilot; cấp quyền thủ công 7 ngày thì mở; chặn tài khoản/game thì đóng; quà khởi đầu (nếu bật) nhận đúng một lần.
6. Lặp lại `npm run test:sql` sau mọi thay đổi SQL.

**Đường lui:** chuyển rollout về `off` (có hiệu lực ngay, pilot dùng lại kiểm tra quyền cũ) và/hoặc build lại với flag `false`. Migration chỉ thêm bảng/hàm mới, không đổi hành vi cũ; không cần rollback dữ liệu.

### Bước 2–5 — Cần quyết định và xây adapter

Lõi nghiệp vụ và lớp HTTP đã có và đã test (`server/commerce/README.md`), nhưng chưa có:

- **Repository bền vững** (bảng đơn/receipt/audit/review với các ràng buộc unique, giao dịch ACID, khoá theo thứ tự cố định),
- **Nơi chạy handler HTTP** (Supabase Edge Function hoặc Netlify Function, cùng origin),
- **Adapter nhà cung cấp thanh toán** (xác minh chữ ký trên raw body, môi trường test/live, merchant, trạng thái, thời gian).

Mỗi bước sau khi có adapter: viết test SQL cho bảng mới vào `test:sql`, bật trên staging với tài khoản pilot, chạy luồng thật, rồi mới bật production. Đường lui luôn là đặt flag về `false` và build lại; đơn đã tạo vẫn đọc được qua lịch sử.

## Quyết định cần chủ dự án

1. Project **staging** Supabase nào dùng cho bước 1 (và ai giữ tài khoản admin).
2. **Nhà cung cấp thanh toán** cho bước 4 (ví dụ cổng nội địa hỗ trợ VND với webhook có chữ ký) và tài khoản merchant ở môi trường test.
3. **Nơi chạy** handler commerce: Supabase Edge Function (giống Battleship/duel) hay Netlify Function.
