# Cosmic v3 — bản tiếp tục ngày 14/10/2026

## Trạng thái
- Khôi phục nguyên mã nguồn combat review 13/10 từ workspace còn tồn tại.
- Giữ gameplay v3: mật độ địch, đường bay/tốc độ đa dạng, tách thân địch, giới hạn vật phẩm rơi từ kill, miniboss có báo đòn.
- Verifier dùng cùng engine với browser, hỗ trợ vé v2 và v3; kiểm tra phiên bản vé/config, thời hạn, số frame và replay hoàn tất trước khi tính điểm.
- Frontend mới gọi cosmic_start_v3 và cosmic_ranking_v3. Không hạ về v2 khi endpoint mới chưa triển khai.
- SQL giữ dữ liệu cũ, giữ endpoint v2 cho client cũ, tách bảng điểm theo pack_version. Giới hạn 3 lượt daily riêng mỗi phiên bản; rate limit 10 vé/phút vẫn tính chung.
- Chưa push GitHub, chưa publish frontend, chưa thay đổi Supabase production, đúng yêu cầu duyệt bản thử trước.

## Kiểm chứng
- npm run lint: đạt.
- npm run build: đạt; còn cảnh báo kích thước bundle hiện hữu.
- 17 kiểm thử Cosmic: engine/gameplay, replay verifier và UI PC/mobile, bao gồm offline. Hai test offline ban đầu thiếu file preview; đã tạo preview rồi chạy lại.
- Bundle dependency của Edge verifier bằng esbuild: đạt. Đây không thay thế kiểm thử Deno/Edge runtime.
- SQL chưa chạy: môi trường không có PostgreSQL/Docker/Supabase CLI. Có tests/cosmic-v3.sql để chạy trên DB test sau khi áp dụng bản SQL.

## Thứ tự triển khai sau khi được duyệt
1. Kiểm tra schema thực tế; tạo migration bằng Supabase CLI từ supabase/cosmic-v3-review.sql. File hiện tại là ứng viên SQL, chưa nằm trong migration tự động.
2. Trên môi trường test: áp dụng migrations hiện hữu, SQL v3; chạy tests/cosmic.sql và tests/cosmic-v3.sql; kiểm tra quyền/RLS và lượt ghi điểm từ hai tài khoản.
3. Triển khai cosmic-verify mới trước (vẫn tiếp nhận vé v2), kiểm tra replay v2/v3 trong Deno/Edge runtime.
4. Áp dụng migration đã kiểm thử; kiểm tra vé mới có pack_version/config.version=3 và điểm v2/v3 tách biệt.
5. Cuối cùng triển khai frontend mới và kiểm tra trọn luồng đăng nhập → vé → chơi → xác thực → BXH.

Không xóa hoặc viết lại các lượt v2. Không dùng điểm do browser gửi làm kết quả chính thức.

## Bản thử
File HTML đi kèm là bản offline để duyệt gameplay; không mô phỏng thành công xác thực server và không có BXH thật. Chưa thể gọi việc đồng bộ production là hoàn tất.
