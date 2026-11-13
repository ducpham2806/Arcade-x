# ArcadeX — quy tắc chung

## Đọc và làm việc
- Đầu phiên: đọc `docs/SESSION-HANDOFF.md`, sau đó đúng một thẻ việc trong `docs/plans/` qua `docs/PROJECT-PLAN.md`. Chỉ đọc mục mới nhất `docs/WORKLOG.md` nếu cần bằng chứng gần nhất; không mặc định nạp toàn bộ INDEX, plan chi tiết, archive hay thư viện skill.
- Mọi đầu vào hướng dẫn/session, cấu hình làm việc, plan, task, nhật ký và bàn giao phải là `.md`; cấu hình làm việc ở `project.md`. Dữ liệu/config runtime, mã nguồn và artifact máy đọc giữ định dạng gốc; chỉ mở khi nhiệm vụ cần.
- Dùng duy nhất `docs/WORKLOG.md` làm nhật ký chính. Trước chuyển việc: tóm tắt task xong (kết quả, quyết định, kiểm tra, giới hạn, bước tiếp) vào `docs/COMPLETED.md`; thu gọn log còn tối đa 3 mục; giữ chi tiết nguyên văn trong `docs/archive/`; cập nhật bàn giao rồi mới bắt đầu việc mới. Quy trình/budget: `docs/WORKFLOW.md`.
- Mọi phần hoàn tất ghi ngày, nhánh, việc/file, kiểm tra thật và phần còn dở; commit cùng thay đổi. Phân biệt đã code/merge/deploy/nghiệm thu; không dùng báo cáo cũ chứng minh production hiện tại. Trả lời tiếng Việt.
- Game Studio đã cài ở `.agents/game-studio/`; tra `docs/studio/INDEX.md`, chỉ nạp 1–3 skill phù hợp. Dùng `project.md` và bàn giao hiện có thay các template `project.yaml`/active-session của nguồn. Quyết định người dùng và quy tắc ArcadeX ưu tiên; không chạy initializer ghi đè dự án.
- Chủ dự án xác nhận dùng Game_Studio_Agent và Graphify ngày 13/11/2026. Mỗi task chọn skill/vai trò Studio phù hợp; với câu hỏi quan hệ code, dùng graph đúng module nếu có, kiểm độ mới rồi truy vấn có budget. Thiếu graph thì dựng AST local theo `docs/studio/GRAPHIFY.md`; tra văn bản hẹp cho phần graph chưa phủ. Ghi skill/role, phạm vi graph và kiểm chứng trong bàn giao; không nạp toàn thư viện mỗi phiên.
- Làm trên nhánh riêng, theo module được chủ dự án duyệt; commit/push nhánh làm việc. Chỉ merge `main` khi chủ dự án yêu cầu (Netlify tự deploy); chạy đủ CI trước merge. Không tắt/nới test để xanh.

## Giao diện (giữ nguyên quy tắc đã duyệt)
- Menu/modal: mobile `w-full h-full`; desktop `sm:h-[92vh] sm:max-h-[900px] sm:max-w-4xl lg:max-w-5xl`. Không ép bottom sheet ngắn (`max-h-[85vh]`) gây cuộn thừa.
- Grid `grid-cols-2 sm:grid-cols-3 lg:grid-cols-4`, thẻ gọn/cân đối để các mục và thao tác vừa màn hình chuẩn.
- Khung ngoài cố định qua các tab; header/footer cố định, nội dung `<div className="flex-1 overflow-y-auto min-h-0 custom-scrollbar">` cuộn riêng, không nhảy kích thước.
- CSS giảm chuyển động của launcher chỉ áp lên `.arcade-launcher`/chrome của nền tảng, không dùng wildcard dưới `.arcade-app` để tắt animation game. Game tự xử lý accessibility; sửa CSS dùng chung phải chạy `npm run test:animations`.
- Trong trận: thưởng/lên cấp dùng `LevelUpToast`; banner ăn mừng đầy đủ ở launcher. Force update chỉ khi `activeGameId === null`.

## Dữ liệu và kiểm chứng
- Không chạy migration/script lên Supabase production `whjatkhhupeqfngakmee`; dùng PGlite hoặc staging. Không đưa database password/service-role key vào frontend; commerce mặc định tắt.
- Giữ tương thích save; chỉ đổi `tests/storage/*-golden.json` khi chủ đích đổi hành vi. Output sinh bằng script, không sửa tay (đặc biệt `public/standalone/`).
- Node 24; lệnh ở `package.json`, thứ tự CI ở `.github/workflows/ci.yml`. Chạy test đúng phạm vi; báo rõ chưa chạy/chưa kiểm trên thiết bị thật.
