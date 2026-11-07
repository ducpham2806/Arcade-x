# Nhật ký công việc

Nhật ký chính duy nhất. Giữ ≤3 mục gần nhất, kết quả gọn; trước đổi việc tóm tắt vào [COMPLETED](COMPLETED.md), chuyển chi tiết nguyên văn sang archive theo [WORKFLOW](WORKFLOW.md).

## 07/11/2026 · NETLIFY-BUILD ACTIVE / WC-R0 audit · codex/tank-clash-release-verification

- Chủ dự án báo Netlify Preview lỗi TS2307; checkout sạch tái hiện thiếu ws trong nested server dependencies. Thêm deps:tank-clash dùng chung CI và Netlify trước lint/build, giữ đầy đủ kiểm tra; chuỗi preview gồm Snake đã exit0 sau sửa.
- [Báo cáo build](qa/NETLIFY-BUILD-2026-11-07.md): b644da2 Netlify Preview success, deploy6aee6157ea767b4dae245593; giữ Team protection. Chờ CI run42311533962 trước merge PR#17; không dùng CI head cũ thay kết quả mới.
- [Nối Từ](qa/WC-R0-2026-11-07.md) đã có source/test trong main/nhánh; RPC public23mục không trả word-chain, fallback chỉ DEV/online flagfalse. Chưa thay catalog/DB/online; không phải thiếu merge game.
- DOC-01 đã tóm tắt ở COMPLETED; chuyển mục log nguyên văn vào [archive](archive/WORKLOG-2026-11-06-DOC-01.md) để giữ≤3mục.

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
