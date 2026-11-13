# Bàn giao · 13/11/2026 · Studio/Graphify và Snake CI48

Chủ dự án yêu cầu ghi nhớ và dùng [Game Studio](studio/INDEX.md) + [Graphify](studio/GRAPHIFY.md) cho dự án. Nhánh `codex/studio-graphify-workflow` từ main19af480 ghi quyết định ở AGENTS/project và skill đầu mối. Studio297file vẫn khớp upstream357b1a1; giữ snapshot đã cài116skill/21vai trò. Mỗi task mở1–3skill và vai trò đúng việc; graph local đúng scope, kiểm độ mới và query có budget. Cấu hình nằm trong repo; CLI/cache không tự đi theo phiên khác.

DOC-02 dùng `game-production-scrum`; đã cài Graphify0.9.108 từ pin52cb282 và chạy AST services46file/484node/1291edge, query900token/depth2. [Cách tái lập/giới hạn](studio/GRAPHIFY.md), [thẻ bảo trì](plans/MAINTENANCE.md), [nhật ký](WORKLOG.md). Đây là thiết lập công cụ, chưa sửa gameplay/Auth hay phát hành.

## Việc tiếp theo

PR29 đã merge vào main19af480 ngày13/11; CI47 trên heada215da6 success nhưng CI48 trên main failure: `verify` success, Snake UI9/10; ca đổi tài khoản xuyên tab thiếu nút “Chơi bản preview” tại tests/snake/ui-save.test.ts:59. [CI48](https://github.com/ducpham2806/Arcade-x/actions/runs/43389651390). Điều tra trace/Auth và tái hiện trước khi sửa; chưa kết luận lỗi dữ liệu hay test không ổn định. Chọn [thẻ Snake](plans/SNAKE.md), skill save-systems/game-qa-playtest và vai trò qa-lead/technical-director khi cần. Không lấy graph services thay kiểm React context/trang/test.

R01 public lưu theo thiết bị/owner, cloud preview giữ riêng. [Báo cáo release](qa/SNAKE-PUBLIC-2026-11-13.md) chưa cập nhật sau merge: cần xác minh Netlify Published đúngSHA và smoke public; không gọi deploy đã kiểm. Còn người mới/Android/iPhone thật và SN-R0b live/JWT. Render Tank giữFree, Nối Từ ON5/ON6 cònQA, commerce tắt. Không merge/deploy từ lượt thiết lập này. Giữ một WORKLOG tối đa3mục, lịch sử nguyên văn trong archive.
