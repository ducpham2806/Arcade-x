# Bàn giao hiện tại · 05/11/2026

Mốc đã kiểm: `main@affc5e8` (PR #15, P3b/P3c), CI [41727993592](https://github.com/ducpham2806/Arcade-x/actions/runs/41727993592) qua. Đây là bằng chứng CI ngày 04/11 theo giờ Việt Nam; chưa kiểm trạng thái backend/hosting trực tiếp. Đầu phiên dùng `git log -1`/`git status` để xác định checkout hiện tại.

| Mảng | Hiện trạng / việc kế tiếp |
|---|---|
| Nền tảng | 23 game; M0–M8, Neon NR1–NR4 đã merge. Commerce vẫn tắt; adapter thật chưa đủ. |
| Tank Clash | Backend Render Free đã Live, có 4 tester staging; [TC2-review](tank-clash/TC2-review.md). Code review có đăng nhập đã qua 17 WS/ops + 11 UI, đang cập nhật Render. Còn phiên/trận/mạng/thiết bị thật; chưa launcher/art sản xuất/DB result. |
| Nối Từ | Bot/offline và UI online có code; `online-config.json` tắt. Catalog migration, server/scheduler theo bàn giao chưa triển khai; phải xác minh môi trường trước làm. |
| Duel | Trọng tài server có code/test; Chess/Xiangqi/Caro còn đường online cũ, cần deploy và nối UI sau flag. |
| Chất lượng | Test cũ lệch auth; Battleship cần đo điện thoại, Nối Từ cần Telex/VNI; banner có vệt đen; Block Breaker thiếu ảnh gốc, Blossom thiếu art phụ. |

**Đợt hiện tại 05/11:** nhánh `codex/tank-clash-tc2-readiness`; `50c7b36` đã push qua GitHub Desktop, backend Render Free Live ở `https://arcadex-tank-staging.onrender.com`, Auto Sync No. Chủ dự án đã tạo 4 tester được xác nhận. Code trang `/review` đang cập nhật, test17/11 + lint/build/bundle qua; xem [TC2-review](tank-clash/TC2-review.md)/[WORKLOG](WORKLOG.md). Soak30 phút cũ ở `a8d472b`, chưa tải Render. **Commit/push nhánh với `[skip netlify]`; không `[skip ci]`, không merge/main/deploy Netlify trước khi duyệt.**

**Tiếp theo:** TC2 → [runbook](tank-clash/TC2-RUNBOOK.md) §1: push code review, Manual Sync Blueprint để cập nhật build/cờ review, kiểm commit/Free/TLS/route rồi mở `/review` cho chủ dự án đăng nhập. Không biết/không xin mật khẩu qua chat. Thử ≥10 trận mỗi quy mô + soak/load backend đích, hai mạng/thiết bị; chưa mở TC3/commerce hoặc production.

**Lưu ý kỹ thuật:** CSS riêng game (`tc-`, `nt-`, `wc-`); game chỉ hiện production khi có trong `launcher_games`, dev dùng `LOCAL_REVIEW_GAME_IDS`. Đổi số game cần xem `tests/{integration/full-release.mjs,artwork/catalog.mjs,readability/contrast.mjs}`. Phòng online dùng CAS/receipt/presence 90 s; đang lặp 3 bộ (xem `TECH-DEBT.md`). Tank dùng WS riêng. Cosmic `legacy-*` vẫn được engine/replay sử dụng.

Tra lệnh/cấu trúc: [README](../README.md); tra đúng module: [INDEX](INDEX.md). Lịch sử: mục mới nhất [WORKLOG](WORKLOG.md), chi tiết cũ `archive/`; chỉ đọc khi truy vết.
