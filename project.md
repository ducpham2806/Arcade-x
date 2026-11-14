# ArcadeX — cấu hình làm việc

- **Nền tảng:** PWA web, React 19 + TypeScript + Vite, các game dùng DOM/Canvas và engine riêng. Không chuyển sang Godot/Unity/Phaser chỉ vì thư viện có ví dụ đó.
- **Nguồn phiên bản/lệnh thực thi:** `package.json`, lockfile, `.nvmrc`, workflow CI; môi trường kiểm thử Node 24. Đây là cấu hình cho người/agent đọc, không thay config build.
- **Giai đoạn:** sản phẩm đang phát triển; có game trong sảnh và game preview. Frontend/source main8320385 đã Published Netlify13/11 sau CI50/head1909fa6 success; R01 Snake miễn phí/lưu theo thiết bị. Render c705100, server không đổi. Giới hạn QA ở SESSION-HANDOFF.
- **Chế độ:** standard; tài liệu ngắn; một task chính mỗi phiên; chủ động thực hiện phạm vi được giao. Hỏi khi thiếu quyết định thực sự chặn việc, không hỏi lại quyền đã duyệt.
- **Đầu vào:** Markdown; task ở `docs/plans/`, checkpoint duy nhất `docs/SESSION-HANDOFF.md`, nhật ký duy nhất `docs/WORKLOG.md`.
- **Kiểm chứng:** logic/integration theo thay đổi; UI/art/VFX phải chạy và quan sát bản thực tế. Full CI trước merge code vào main theo AGENTS; không coi test local là nghiệm thu thiết bị/production.
- **Nguồn/module:** `src/games/`, `src/launcher/`, `server/`, `supabase/`; nguồn asset `art/`, asset runtime `public/` và trong module.
- **Môi trường:** Netlify frontend, một Render Free cho Tank; Supabase staging tách production. Commerce tắt. Không thêm chi phí hoặc chạy migration production theo suy diễn từ plan.
- **Bộ kỹ năng:** `docs/studio/INDEX.md`; chọn tối thiểu skill theo công việc. 21 vai trò là tài liệu tham khảo, không phải 21 tiến trình đang chạy.
- **Nguồn đã được chủ dự án chọn (13/11/2026):** [Game Studio](https://github.com/ducpham2806/Game_Studio_Agent) cho skill/vai trò; [Graphify](https://github.com/Graphify-Labs/graphify) cho quan hệ code. Áp dụng vào việc tiếp theo; cấu hình/tái lập ở [GRAPHIFY](docs/studio/GRAPHIFY.md), nguồn Studio ở [INSTALLATION](docs/studio/INSTALLATION.md). Đây là bộ nhớ theo checkout, cần mang nhánh/tài liệu sang phiên khác.
