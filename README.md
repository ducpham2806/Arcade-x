# Arcade-x · Source mới nhất · 13/10/2026

Gói source hợp nhất các game hiện có, Blossom Blast v0.8 và UI/UX launcher mới nhất. Không bao gồm Rainbow Blocks. Không tiếp tục commit/push Git hoặc publish Netlify trong lượt đóng gói này.

## Chạy và build

Dùng Node.js 24. Giải nén, mở terminal trong thư mục `Arcade-x`:

```bash
npm ci
npm run lint
npm run build
npm run dev
```

Website build nằm trong `dist` sau khi chạy build. Gói ZIP chỉ chứa source; không chứa `node_modules` hoặc bản build cũ.

Nếu cần kết nối backend, sao chép `.env.example` thành `.env.local`, điền URL và publishable key của project Supabase hiện có. Không dùng mật khẩu database hoặc service-role key trong frontend. SQL migrations/Edge Function trong `supabase/` là backend đã có, được giữ để tham khảo/cài mới; không chạy lại migrations lên project đang dùng.

## Bản duyệt và kiểm thử

```bash
npm run preview:blossom
npm run preview:launcher
npx playwright install chromium
npm run test:blossom
npx playwright test tests/launcher
```

Hai file HTML duyệt được sinh ở thư mục cha của source. Bản launcher HTML phục vụ duyệt giao diện, không dùng để kiểm thử toàn bộ game có worker/asset ngoài. Có thể đặt `CHROMIUM_EXECUTABLE` nếu dùng Chromium đã cài trên máy. Các kiểm tra SQL yêu cầu Docker và chạy trong database test riêng; không kết nối production.

## Đã dọn

59 file source không được runtime hoặc kiểm tra liên quan sử dụng; 321 bản SVG trùng/sprite animation chưa được renderer sử dụng; 3 dependency trực tiếp không dùng (d3, @types/d3, clsx). Các game và dữ liệu màn chơi đang được launcher đăng ký đều được giữ. Các asset PNG động theo chương, style, mùa và cốt truyện được giữ để tránh thiếu tài nguyên.

Đã khôi phục 61 tài nguyên gốc Cosmic Defend/PWA, cấu hình Netlify/Vercel và backend từ repository hiện có. Không kèm script patch cũ, dump thử nghiệm, lịch sử Git, screenshot, báo cáo Playwright hoặc file môi trường có giá trị thật. Xem `docs/CLEANUP.json` để biết các đường dẫn đã dọn.

## Kiểm chứng gói

TypeScript và production build thành công trực tiếp từ thư mục source đã dọn. 75 kiểm tra Blossom Blast/launcher đạt (1.8 phút), gồm mobile/desktop, 100 popup chuẩn bị, VFX, lưu tiến trình, garden và các bản HTML offline. Các game khác được giữ trong dependency graph và build thành công; chưa chạy lại toàn bộ kiểm thử gameplay của các game khác hay kiểm thử backend trong lượt đóng gói này.

`verification/build.log` ghi kết quả build. `SOURCE-MANIFEST.json` ghi SHA-256 từng file để kiểm tra tính toàn vẹn.
