# Nhật ký công việc

Nhật ký chính duy nhất. Giữ ≤3 mục gần nhất, kết quả gọn; trước đổi việc tóm tắt vào [COMPLETED](COMPLETED.md), chuyển chi tiết nguyên văn sang archive theo [WORKFLOW](WORKFLOW.md).

## 07/11/2026 · TC-R0 / AUTH-XTAB ACTIVE · codex/tank-clash-release-verification

- GitHub verify c705100 success (run42174413262). Netlify dashboard xác nhận Published main/c705100, deploy6aed73038b5150c7c4541f75 lúc06/11 13:26 UTC+7. PR#17 đã mở, CI đầy đủ đang chạy.
- Tái hiện logout xuyên tab: tab điều khiển thành khách, Tank về menu nhưng EntryScreen tab game còn hồ sơ A. [Bug/bằng chứng](qa/BUG-AUTH-CROSS-TAB.md).
- Sửa AuthService.listen giữ identity riêng mỗi tab, hủy restore cũ khi identity đổi; 4/5 regression mới fail trước sửa, 5/5 qua sau sửa; TypeScript/build/bundle qua, fast qua (exit0). Browser fixture AuthProvider thật xác nhận A→guest→B, không thay nghiệm thu2account thật.
- Thêm test:auth-session vào fast. B thật khác A, tab game nhận B, mã phòng A cũ không còn, tạo phòng B qua. Bản sửa chưa merge/deploy; cần retest race sau phát hành. Audit06/11 chuyển nguyên văn vào archive/WORKLOG-2026-11-06-merge-audit-summary.md.

## 06/11/2026 · TC-R0 WAITING ca cuối · codex/tank-clash-release-verification

- Chốt lệch frontend/main và Render/staging3950abb; đã chuyển service main/build theo render.yaml, manual deploy c705100 Live14:54, Free/cap16, preflight Auth production. Không đổi key/DB/chi phí.
- Health200/P3/instance mới; review/config/metrics404, origin lạ/null/thiếu403, token giả AUTH_FAILED. Account thật tạo/rời1v1, tạo2v2/exit đều dọn phòng; logout sau exit→online mở login. Không ghi thông tin account/token.
- Chủ dự án cho phép công khai metadata TC-R0; báo cáo trước deploy xuất a30b880 sau auto-review từng chặn. Browser chọn nhầm cửa sổ ngoài phạm vi bị chặn; mở đúng Render theo người dùng, deploy sau đó thành công.
- [Bằng chứng/bước tiếp](tank-clash/TC-R0-2026-11-06.md). Còn đổi2account/logout khi giữ ghế, metadata frontend; TC-R1 mạng/tải thật chưa làm. Blueprint cũ vẫn paused, không sync ghi đè. Doc/link/budget kiểm lại trước commit.

## 06/11/2026 · DOC-01 · codex/docs-game-studio-handoff

- Lập lại PROJECT-PLAN và 7 thẻ tiếp tục theo game/module; thêm project.md, COMPLETED, WORKFLOW, mẫu TASK. Sửa bàn giao hết trạng thái chờ merge PR #16; phân biệt code/merge/deploy/nghiệm thu.
- Cài Game Studio `c5dac462` đầy đủ 116 skill, 21 vai trò, 4 rules; 297 file đối chiếu byte/blob. Một đầu mối discovery, thư viện chỉ nạp theo nhu cầu; hướng dẫn/manifest ở studio/*.md.
- Archive nguyên văn plan/bàn giao/log trước chỉnh; gắn cảnh báo lịch sử vào các báo cáo dễ gây nhầm. Không đổi code game hoặc dịch vụ.
- Kiểm chứng: 24 đầu vào Markdown/link/budget qua, WORKLOG 3 mục; 297 blob khớp nguồn; quick_validate 117/117 skill; test:claude 19 agent/11 skill cũ qua; git diff --check qua. Validator tổng upstream lỗi đường dẫn router cả ở nguồn, đã ghi giới hạn; không chạy lại gameplay CI cho đợt docs. Chủ dự án cho phép publish thư viện private vào repo public.
- Tiếp: TC-R0 kiểm bản chạy thật; còn mạng/thiết bị, Nối Từ/Duel, Snake, QA và commerce theo plan.
