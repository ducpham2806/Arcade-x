# ArcadeX — quy tắc chung

## Đọc và làm việc
- Đầu phiên: đọc `docs/SESSION-HANDOFF.md` và mục mới nhất trong `docs/WORKLOG.md`; chọn tài liệu theo `docs/INDEX.md`. Chỉ đọc plan/spec của module đang làm; archive dùng để truy vết.
- Mọi phần hoàn tất phải ghi ngay vào `docs/WORKLOG.md`: ngày, nhánh, việc/file, kiểm tra và kết quả thật, phần còn dở; commit cùng thay đổi. Trả lời tiếng Việt.
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
