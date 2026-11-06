# Nhật ký công việc

Nhật ký chính duy nhất. Giữ ≤3 mục gần nhất, kết quả gọn; trước đổi việc tóm tắt vào [COMPLETED](COMPLETED.md), chuyển chi tiết nguyên văn sang archive theo [WORKFLOW](WORKFLOW.md).

## 06/11/2026 · TC-R0 WAITING · codex/tank-clash-release-verification

- Kiểm public frontend: bốn JS tải đầu trùng byte dist, icon/banner/Tank bot 1v1 chạy, Online khách mở login. Catalog cloud tải xong còn23 game, Nối Từ không thấy; để WC-R0.
- Render dashboard Live3950abb/nhánh staging cũ; env đã lưu production nhưng Live review/config vẫn200/Auth staging. Health200/P3, metrics404; WS origin đúng101/token giả AUTH_FAILED, origin lạ/null/thiếu403.
- Chrome bị chuyển tab rồi timeout; chưa lưu settings/deploy. Chưa có đăng nhập thật, chưa nghiệm thu online production. Cần tiếp deploy main và kiểm account sau khi browser ổn định.
- [Bằng chứng và điểm tiếp tục](tank-clash/TC-R0-2026-11-06.md); cập nhật plan/bàn giao, giữ task WAITING. Không đổi gameplay/DB/chi phí. Mục05/11 chuyển nguyên văn sang archive/WORKLOG-2026-11-05-launcher-summary.md.

## 06/11/2026 · DOC-01 · codex/docs-game-studio-handoff

- Lập lại PROJECT-PLAN và 7 thẻ tiếp tục theo game/module; thêm project.md, COMPLETED, WORKFLOW, mẫu TASK. Sửa bàn giao hết trạng thái chờ merge PR #16; phân biệt code/merge/deploy/nghiệm thu.
- Cài Game Studio `c5dac462` đầy đủ 116 skill, 21 vai trò, 4 rules; 297 file đối chiếu byte/blob. Một đầu mối discovery, thư viện chỉ nạp theo nhu cầu; hướng dẫn/manifest ở studio/*.md.
- Archive nguyên văn plan/bàn giao/log trước chỉnh; gắn cảnh báo lịch sử vào các báo cáo dễ gây nhầm. Không đổi code game hoặc dịch vụ.
- Kiểm chứng: 24 đầu vào Markdown/link/budget qua, WORKLOG 3 mục; 297 blob khớp nguồn; quick_validate 117/117 skill; test:claude 19 agent/11 skill cũ qua; git diff --check qua. Validator tổng upstream lỗi đường dẫn router cả ở nguồn, đã ghi giới hạn; không chạy lại gameplay CI cho đợt docs. Chủ dự án cho phép publish thư viện private vào repo public.
- Tiếp: TC-R0 kiểm bản chạy thật; còn mạng/thiết bị, Nối Từ/Duel, Snake, QA và commerce theo plan.

## 06/11/2026 · MERGE-AUDIT · main c705100

- Kiểm đủ lịch sử/24 nhánh remote và PR; không có PR mở hoặc PR đóng chưa merge được GitHub search trả về. Xác nhận PR #16 merged, fast-forward local main từ affc5e8 thêm 13 commit; không merge mới trên remote.
- Ba nhánh khác tổ tiên: docs tương đương, P3 triển khai song song, P2 staging cần port sang wire P3. WIP local P3d đã được bản hoàn chỉnh thay thế.
- Node 24.22.2: lint/build/bundle/fast qua; WS/ops 18/18 qua với loopback. Không chạy lại full browser/kiểm deploy. Artifact JSON audit ở deliverables local không phải checkpoint phiên.
