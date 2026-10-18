# Arcade-x subscriptions — nền tảng và quà đăng ký

Ngày: 18/10/2026. Nguồn: main `c143446375eb7bbfa003e75418dad0403d3ce7f2`.

## Hiện trạng đã kiểm tra

- React/Vite; launcher có 21 game, lazy loading, lưu tiến độ và Supabase Auth.
- Dự án Arcade-x `whjatkhhupeqfngakmee`: 21 game published/free, commerce=false, chưa có entitlement.
- Đã có sản phẩm, đơn hàng, payment events, entitlement, RPC check access và phiên chơi.
- Gói subscription cũ chỉ hỗ trợ toàn kho theo số ngày; game purchase cũ là quyền lâu dài. Không dùng cấu trúc này để mở bán thuê lẻ trước khi nâng cấp ở chặng thanh toán.
- Repository.checkAccess cũ có fallback miễn phí khi RPC lỗi. Bản thử v2 không fallback, không dùng cache làm bằng chứng quyền.
- Chỉ đọc database chính trong chặng này; không chạy migration, không tạo admin, không thay đổi game/dữ liệu người chơi.

## Đã triển khai

1. Migration bổ sung schema riêng launcher_private, membership admin, pilot, hạn chế truy cập, audit.
2. Quyền cấp tay dùng launcher_entitlements hiện có, không giả lập đơn đã thanh toán.
3. 6 kỳ hạn: 7/14/30 ngày là 168/336/720 giờ; 3/6 tháng và 1 năm theo lịch Asia/Ho_Chi_Minh.
4. Cấp quyền một game hoặc toàn kho; thu hồi riêng quyền admin, không ảnh hưởng quyền khác.
5. Chặn riêng game hoặc toàn tài khoản; API hỗ trợ expiry, UI bản đầu chặn tới khi admin gỡ.
6. Bảo trì/mở lại game; bảo trì tác động tất cả người dùng trên DB đang kết nối, dù pilot off.
7. Các RPC quản trị có xác minh admin từ bảng do server quản lý; bỏ qua user_metadata.
8. Hàm definer đặt trong schema không expose, search_path rỗng, kiểm tra người gọi; public wrappers invoker và GRANT rõ ràng; mọi bảng mới bật RLS.
9. Kiểm tra quyền và tạo session phía server dùng chung bộ quy tắc; off/nonpilot giữ quy tắc cũ.
10. Màn Cài đặt → Quyền chơi & bảo trì: tra cứu UUID, cấp/thu hồi/chặn/gỡ, kiểm tra quyền, pilot, bảo trì và nhật ký 50 thao tác gần nhất.

11. Bộ 3 game tặng cấu hình bởi admin, cấp một lần khi tài khoản thử đăng nhập/vào launcher; người đã nhận giữ snapshot bộ cũ. Không có bộ mặc định tự chọn.
12. Màn Quyền chơi của tôi: quà đăng ký, nguồn quyền, ngày bắt đầu/hết hạn, thu hồi; tải lại theo tài khoản và khi quay lại ứng dụng.

## Cách đưa lên môi trường thử

- Tạo Supabase staging/branch tách biệt; đồng bộ schema cũ, không cần sao chép dữ liệu cá nhân production.
- Chạy migration `20261018002725_subscription_foundation.sql` trên staging.
- Tạo tài khoản kiểm thử bằng Auth; người vận hành xác minh UUID trước khi thêm đúng tài khoản vào launcher_private.admins. Không có tự bootstrap admin, không lấy email đầu tiên làm admin.
- Deploy nhánh thử với cặp VITE_SUPABASE_URL + VITE_SUPABASE_PUBLISHABLE_KEY của staging và VITE_ACCESS_CONTROL_V2=true. Không cấu hình key service_role trong VITE_*.
- Đăng nhập admin → Cài đặt → Quyền chơi & bảo trì.
- Thêm tài khoản thử vào pilot, bật pilot. Để thử quyền thuê, tạo game premium trong staging; không đổi catalog production.
- Tắt VITE_ACCESS_CONTROL_V2 để ẩn UI và trở về client cũ; đưa rollout.mode về off để tắt các hạn chế pilot phía server. Bảo trì là trạng thái độc lập, cần mở lại riêng.
- Chỉ chuyển production sau khi hoàn thành cửa hàng, demo, thanh toán và kiểm tra từng game. Nhánh này không tự bật thương mại.

## Quy tắc sản phẩm đã thống nhất

- Bộ 3 game cố định, admin cấu hình; người cũ cũng nhận; không tự chọn 3 game thay chủ dự án.
- Demo tùy game, không cắt ngang ván; giữ tiến độ khi thuê/hết hạn.
- Thuê lẻ, bộ cố định, Arcade Pass; trả trước trước, recurring sau.
- Gia hạn cùng sản phẩm nối cuối hạn, các sản phẩm khác hợp quyền độc lập.
- Bộ game lưu snapshot ở đơn; Arcade Pass phải công bố phạm vi game mới.
- Hết hạn chặn phiên mới, không xóa save; giới hạn hoàn thành ván cần tích hợp từng game ở chặng 3.
- QR/webhook chưa kết nối; không hiển thị nút thanh toán giả.

## Giới hạn và việc tiếp theo

- Đây là foundation/pilot, chưa phải hệ thống bán game hoàn chỉnh. Chưa áp dụng production.
- Đã có cấp bộ 3 game một lần cho pilot khi truy cập launcher. Chưa có quota demo, cửa hàng, giá, thanh toán, gia hạn, nhắc hạn, bù bảo trì hoặc recurring.
- Khóa tại launcher/session chưa bảo vệ toàn bộ mã JS hoặc API của từng game. Không thể thu hồi mã đã tải/offline tuyệt đối. Cần kiểm tra từng save/leaderboard/matchmaking/run RPC trước khi bán.
- Client cũ đã cache vẫn dùng RPC/luồng cũ; cần chiến lược cập nhật và server enforcement thống nhất trước rollout live. Chưa cung cấp mode live trong migration này.
- UUID lookup là UI quản trị tối thiểu; tìm theo tên/email với phân trang là bước tiếp theo.
- Thao tác grant là cấp mới từ hiện tại, không phải gia hạn cùng sản phẩm; giao diện gọi rõ “Cấp quyền”.
- Bảo trì bản đầu chặn phiên mới, không cưỡng chế kết thúc phiên đang chạy. Chưa có lịch bảo trì.
- Không merge các nhánh nâng cấp game khác; chỉ sửa điểm nối launcher/settings.

## Nghiệm thu

SQL: deny admin RPC cho anon/user, user_metadata không nâng quyền, RLS owner isolation, entitlement direct write bị chặn, grant/revoke/hợp quyền, maintenance precedence/restore, block/unblock, pilot isolation, expiry boundary/future start, session-start enforcement, lý do bắt buộc, invalid term/scope/live-mode, audit atomicity, commerce vẫn tắt.

Frontend: TypeScript --noEmit thành công; build với VITE_ACCESS_CONTROL_V2=true thành công. Có 6 kiểm thử client về lỗi mạng, response sai định dạng, quyền server, local review và offline.

Database: npm run test:subscriptions chạy PostgreSQL PGlite tách biệt, không dùng production; kiểm tra cả nền tảng và quà đăng ký. tests/run-supabase.sh có test SQL để chạy lại với PostgreSQL Docker trong CI (Docker không có ở phiên này).

Giới hạn: chưa browser QA, chưa triển khai Supabase staging, chưa tạo admin thật. Local build chỉ là kiểm tra mã nguồn; không phục hồi toàn bộ media/standalone để tạo gói phát hành. Nhánh GitHub giữ nguyên mọi asset từ main, không commit dist local. Không sử dụng build local này để deploy.

## Step 2 — store and 2048 trial pilot

Migration `20261018052000_subscription_store_trial.sql` adds private, RLS-protected offer configuration, trial quotas and per-account trial saves. Admin membership is checked on every configuration RPC; writes require a reason and append an audit record.

- Store entry points: game library and game detail, gated by `VITE_ACCESS_CONTROL_V2=true`.
- Offers: one game, bundle or all games; each offer has one of the six supported terms and an integer VND price. No seed prices. Draft offers are hidden; referenced unavailable games hide the offer. Admin can create, edit and hide offers.
- Checkout is always disabled in this phase. No order, payment event, renewal or paid entitlement is produced by the store.
- Trial: only premium/locked 2048, registered pilot accounts, classic mode. Admin enables it and sets a lifetime allowance of 1–10 boards per account. Starting a new board consumes a run; retries/resume return the existing board. Starting again checks quota, account/game blocks, maintenance and rollout.
- Resume deadline: 24 hours after starting a board. Passing it does not interrupt an already-running board. Saving an existing board remains possible during maintenance or after the resume deadline, to preserve progress; opening it again is denied.
- Saves: private server storage, optimistic revision check, retry of an identical acknowledged write is idempotent. A competing tab cannot silently overwrite newer progress. Save errors pause input. The exit action flushes pending state. Trial does not write the regular save, rewards or leaderboard. Final-board snapshot is emitted before the trial completion callback.
- Trial UI suppresses the forced-update modal while mounted. No automatic page reload during gameplay.
- Trial state is untrusted client state. This is a product trial gate, not DRM for downloaded JavaScript. No trial score should be accepted for competitive rewards.
- Importing a trial board into a regular game is deferred; this phase retains it only as a separate trial save. No implicit overwrite or reward migration.

### Staging status and next execution

No migration from this PR has been applied to production. On 2026-10-18, creating the `subscription-pilot` Supabase branch failed twice with `Invalid or expired requestState`; listing branches returned none. Refresh the Supabase connection/branch confirmation before retrying. No cost confirmation was fabricated or bypassed.

After a staging branch is available:
1. Apply the existing schema and both subscription migrations in order. Configure the frontend with the staging URL/key and the preview flag; keep production preview flag false.
2. Create two registered QA accounts and one admin membership on staging only. Enable pilot mode and enroll the QA accounts.
3. Set staging `tile-2048` to published/premium. Existing live games remain free; the trial deliberately does not appear for games already unlocked. Configure the three starter gifts to exclude 2048 while testing locked trials.
4. Create test offers through admin, enable the trial, then exercise create/resume, refresh, two tabs, account switching, offline-save recovery, quota exhaustion, maintenance and rollout-off. Verify completed trials and normal games cannot overwrite each other's saves.
5. Check narrow/mobile and desktop modal layout, keyboard focus, lazy-load errors and PWA update suppression. Browser QA has not been run in this environment.
6. Review the draft PR before deploying a full repository build. The local restored workspace contains only a subset of public game assets and must not be deployed as a complete asset bundle.

Validation: TypeScript and Vite production build with the preview flag enabled; isolated PostgreSQL fixtures for offer validation, access/admin boundaries, trial retries, stale revisions, cross-account isolation, quota, maintenance, resume expiry, pilot-off, audit and no entitlement creation. Real concurrent PostgreSQL transactions and hosted browser flows remain staging checks.

## Step 3 — independent order and settlement core

`server/commerce` now implements server-side rules for snapshotted rental orders, owner access/cancellation, expiry, verified webhook delivery, event/payment deduplication, renewal scheduling and full-refund revocation. `npm run test:commerce` exercises these rules using a test-only transactional ledger and verifier. See `server/commerce/README.md` for integration contracts and unresolved cases.

This is not connected to Supabase, the storefront or a live payment provider. No new migrations or production changes are part of this step. Checkout stays disabled. Next: implement durable adapters, a chosen provider's signature verification and session creation, order history/review UI, then staging verification. Supabase work is intentionally deferred at the user's request; a reminder was scheduled for the morning of 2026-10-19 in Asia/Ho_Chi_Minh.
