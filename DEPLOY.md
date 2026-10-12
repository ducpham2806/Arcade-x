# Deploy từ nhánh Git này

Mã nguồn ứng dụng nằm ngay tại thư mục gốc repository, đã có mọi sửa đổi mới nhất. Khi deploy bằng Git lên Vercel/Netlify, đặt Root directory là `.`; install `npm ci`, build `npm run build`, publish `dist`, Node 24. Đặt hai biến môi trường theo `deploy/frontend.env`; giá trị ở đây là public frontend config. `.env.local` của workspace không được đưa lên Git.

Muốn build trên máy, sao chép `deploy/frontend.env` thành `.env.local`, sau đó chạy `npm ci`, `npm run lint`, `npm run build`.

ZIP trong `releases/` bao gồm mã nguồn, website build sẵn và backend. Phần hướng dẫn bên dưới mô tả cấu trúc **sau khi giải nén ZIP**. Khi làm trực tiếp trong repository: file SQL cài mới nằm ở `deploy/01-FRESH-INSTALL-ONLY.sql`, các migration/bundle ở `supabase/`, bundle Dashboard Edge Function ở `deploy/cosmic-verify/index.ts`.

---

# Bắt đầu deploy ArcadeX

Gói này là toàn bộ phiên bản đang có trong workspace, gồm cả sửa đổi chưa commit và Shikaku mới nhất. Bao gồm launcher/tài khoản, tất cả game, asset, từ điển offline, dữ liệu màn chơi, SQL và bộ kiểm chứng Cosmic Defend. Không cần lấy lại mã nguồn `main` trên GitHub để dùng gói này.

## Trong gói có gì?

- **website/**: website đã build, có thể đưa lên hosting ngay.
- **source/**: toàn bộ dự án, asset, lockfile, scripts, tests và tài liệu; dùng để tiếp tục phát triển hoặc deploy bằng Vercel/Netlify qua Git.
- **backend/**: SQL đầy đủ và từng migration; bundle Edge Function `cosmic-verify` có thể dán vào Supabase Dashboard.
- **backend/frontend.env**: hai biến Supabase công khai để nhập vào hosting. Bản build đã kết nối tới project Supabase bạn cung cấp.
- **KIEM-TRA-DEPLOY.md**: các bước kiểm tra sau khi website lên mạng.
- **RELEASE-MANIFEST.json**, **CHECKSUMS.sha256**: danh sách và dấu kiểm tra các file trong gói.

Không cần cài dependencies để dùng `website/`. Nếu bạn deploy từ mã nguồn, dùng `source/` làm thư mục gốc của dự án.

## Cách nhanh nhất: đưa website đã build lên Netlify

1. Giải nén gói đầy đủ. Tìm thư mục **website**.
2. Vào Netlify, chọn **Add new site / Deploy manually** hoặc Netlify Drop.
3. Kéo **thư mục website** vào vùng tải lên. Thư mục này có `index.html` ngay bên trong. Nếu dùng file website ZIP riêng, hãy giải nén trước rồi kéo thư mục chứa `index.html` vào.
4. Mở đường dẫn HTTPS Netlify cấp. Sau khi dùng được, có thể gắn tên miền riêng trong Site settings.
5. Cấu hình Supabase theo phần dưới, dùng chính đường dẫn website này.

Bản build dành cho gốc tên miền/subdomain, ví dụ `https://arcadex.example.com/`. Không đưa nguyên thư mục source/backend lên hosting tĩnh hoặc đặt app dưới `/arcadex/` nếu chưa chỉnh Vite base và PWA scope.

## Deploy từ source bằng Vercel hoặc Netlify

Đưa thư mục `source/` lên repository riêng của bạn rồi import vào dịch vụ hosting. Không cần chạy các script `fix_*`, `patch_*`, `replace_*` cũ trong thư mục gốc.

Thông số:

| Mục | Giá trị |
|---|---|
| Root directory | `source` nếu bạn đẩy cả gói lên Git; `.` nếu chỉ đẩy nội dung source |
| Framework | Vite |
| Node.js | 24 (đã kiểm tra trong gói này) |
| Install command | `npm ci` |
| Build command | `npm run build` |
| Output / Publish directory | `dist` |

Mở `backend/frontend.env`, nhập hai dòng sau vào Environment Variables của hosting:

- `VITE_SUPABASE_URL`
- `VITE_SUPABASE_PUBLISHABLE_KEY`

Đây là cấu hình công khai được nhúng vào frontend khi build. `source/.env.production` đã có cùng hai giá trị để build trực tiếp từ ZIP; file này được Git bỏ qua, nên khi deploy qua Git cần đặt biến trên hosting. Khi đổi dự án Supabase, đổi biến rồi build lại.

`source/vercel.json`, `source/netlify.toml` và các file `_redirects`/`_headers` đã chuẩn bị điều hướng SPA và tránh cache cố định `sw.js`. Ứng dụng là website tĩnh, không cần chạy một Node server lâu dài cho frontend. Các biến Gemini/APP_URL trong tài liệu cũ không cần cho bản deploy này.

Nếu cần tự build trên máy:

```bash
cd source
npm ci
npm run lint
npm run build
```

Dùng thư mục `dist` vừa tạo để đưa lên hosting. Có thể chạy `npm run preview` để xem trên máy; preview không tự xuất bản lên Internet.

## Supabase — chọn đúng trường hợp

### A. Dự án mới, chưa chạy SQL ArcadeX

1. Mở Supabase → **SQL Editor → New query**.
2. Mở file **backend/01-FRESH-INSTALL-ONLY.sql**, sao chép toàn bộ, dán vào editor và bấm **Run**.
3. File này cài đủ 11 migration trong một giao dịch: nền tảng, identity, launcher, catalog, Car Escape, Word Cross và từ điển, Cosmic Defend, Shikaku.

File FRESH dành cho database chưa có các bảng ứng dụng ArcadeX. Không chạy lại file này lên dự án đã cài SQL trước đây.

### B. Dự án của bạn đã chạy một phần SQL ArcadeX

Giữ các migration đã chạy thành công. Chỉ chạy phần còn thiếu, theo thứ tự trong **backend/migrations/**:

1. `202610090001_arcadex.sql` — nền tảng
2. `202610100001_identity.sql` — tên hiển thị duy nhất
3. `202610110001_launcher.sql` — catalog/quyền chơi
4. `202610110002_catalog_seed.sql` — danh sách game
5. `202610110003_car_escape.sql`
6. `202610110004_car_escape_campaign.sql`
7. `202610110005_car_escape_2d_metadata.sql`
8. `202610110006_word_cross.sql`
9. `202610110007_word_cross_lexicon.sql`
10. `202610110008_cosmic_defend.sql`
11. `202610120009_shikaku.sql`

Nếu một nhóm chưa cài, có các file gộp tiện dùng: `launcher-upgrade.sql`, `car-escape-upgrade.sql`, `word-cross-upgrade.sql`, `cosmic-defend-upgrade.sql`, `shikaku-upgrade.sql`. Dùng file gộp **hoặc** các migration tương ứng, mỗi phần một lần. Không chạy cả hai cách cho cùng phần. File gộp launcher không gồm identity; identity cần được cài trước.

Nếu bạn không biết phần nào đã chạy, đối chiếu lịch sử SQL Editor hoặc gửi thông báo lỗi/schema cho người hỗ trợ trước khi chạy lại. Gói này không tự sửa, xóa hoặc cập nhật dữ liệu Supabase đang sử dụng.

### Cấu hình đăng ký/đăng nhập và chơi khách

Trong Supabase → **Authentication**:

1. Bật provider **Email** để đăng ký bằng email/mật khẩu. Nếu giữ xác nhận email, người dùng cần mở thư xác nhận trước khi đăng nhập.
2. Bật **Anonymous Sign-Ins** cho các chức năng online của khách.
3. Trong **URL Configuration**, đặt **Site URL** là URL HTTPS website vừa deploy. Thêm cùng website vào **Redirect URLs**, ví dụ `https://YOUR-DOMAIN/**`.
4. Nếu thay từ URL tạm Netlify/Vercel sang tên miền riêng, cập nhật hai mục URL này.

### Cosmic Defend: thêm một Edge Function

1. Supabase → **Edge Functions**, tạo function tên chính xác **cosmic-verify** bằng editor.
2. Sao chép toàn bộ file **backend/cosmic-verify/index.ts** vào editor và deploy. Đây là bundle tự chứa engine/campaign; có thể dán riêng một file.
3. Tắt **Verify JWT** ở gateway cho function này nếu Dashboard có tùy chọn đó. Function vẫn tự kiểm tra Bearer token bằng `auth.getUser`, chủ tài khoản và vé; hỗ trợ publishable key mới. Các biến server Supabase tiêu chuẩn do runtime cung cấp.

Nếu dùng Supabase CLI, chạy từ thư mục source đã đăng nhập và link đúng project:

```bash
supabase functions deploy cosmic-verify --project-ref whjatkhhupeqfngakmee --no-verify-jwt
```

Car Escape, Word Cross và Shikaku dùng các RPC trong SQL, không cần thêm Edge Function. Xu/thành tích và ván cục bộ vẫn lưu được khi chưa có backend; các tính năng đồng bộ/xếp hạng cần SQL/Auth/Function tương ứng.

## Trạng thái của gói

Đã cài dependencies từ lockfile, kiểm tra TypeScript, build từ bản source đóng gói và kiểm tra file SQL cài mới trong PostgreSQL riêng. Không chứa `node_modules`, lịch sử Git, cache kiểm thử hoặc file `.env.local` của workspace. Giữ các giá trị frontend công khai cần để deploy.

Đây là gói tải về, **chưa xuất bản website và chưa chạy SQL/Edge Function lên Supabase production**. Không bao gồm dữ liệu người dùng đang có trên Supabase; dữ liệu đó vẫn nằm trong dự án của bạn. Xem `verification/` để đọc kết quả kiểm tra gói và các báo cáo gần nhất.
