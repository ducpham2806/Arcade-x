# Bàn giao hiện tại · 05/11/2026

Mốc đã kiểm: `main@affc5e8` (PR #15, P3b/P3c), CI [41727993592](https://github.com/ducpham2806/Arcade-x/actions/runs/41727993592) qua. Đây là bằng chứng CI ngày 04/11 theo giờ Việt Nam; chưa kiểm trạng thái backend/hosting trực tiếp. Đầu phiên dùng `git log -1`/`git status` để xác định checkout hiện tại.

| Mảng | Hiện trạng / việc kế tiếp |
|---|---|
| Nền tảng | 24 game trong code; M0–M8, Neon NR1–NR4 đã merge. Commerce vẫn tắt; adapter thật chưa đủ. |
| Tank Clash | Chủ dự án đã duyệt phát hành bot + online tài khoản ArcadeX; adapter/icon/catalog game 24 đã có. Đang CI/merge/deploy trên `codex/tank-clash-launcher-release`; [LAUNCHER-RELEASE](tank-clash/LAUNCHER-RELEASE.md). TC2 tải/hai mạng vẫn còn; chưa thưởng/DB result. |
| Nối Từ | Bot/offline và UI online có code; `online-config.json` tắt. Catalog migration, server/scheduler theo bàn giao chưa triển khai; phải xác minh môi trường trước làm. |
| Duel | Trọng tài server có code/test; Chess/Xiangqi/Caro còn đường online cũ, cần deploy và nối UI sau flag. |
| Chất lượng | Test cũ lệch auth; Battleship cần đo điện thoại, Nối Từ cần Telex/VNI; banner có vệt đen; Block Breaker thiếu ảnh gốc, Blossom thiếu art phụ. |

**Đợt hiện tại 05/11:** `codex/tank-clash-launcher-release`, worktree riêng vì thư mục gốc được chuyển về main trong lúc làm. Đã duyệt merge main + Netlify và online public, giữ một Render Free; không hỏi lại phê duyệt này. Mốc backend cũ `3950abb` vẫn staging cho tới khi chuyển cấu hình theo [LAUNCHER-RELEASE](tank-clash/LAUNCHER-RELEASE.md). Kiểm chứng hiện tại ở mục mới nhất [WORKLOG](WORKLOG.md).

**Tiếp theo:** chờ chủ dự án mở khóa Mac (đã hỏi; chưa dùng được GitHub Desktop), push nhánh/PR và hoàn tất CI trên commit cuối → merge main → kiểm Netlify/Render, icon/chơi bot/online Auth đúng project. Không SQL production, thêm chi phí hoặc guest/wildcard. Sau phát hành vẫn phải đo TC2 hai thiết bị/hai mạng/tải backend đích; không coi owner duyệt là bằng chứng các phép đo này.

**Lưu ý kỹ thuật:** CSS riêng game (`tc-`, `nt-`, `wc-`); catalog server chọn game trong `launcher_games`; Tank Clash là bản miễn phí bổ sung từ bundle khi catalog cũ chưa có dòng, server maintenance/premium vẫn ưu tiên. Dev dùng `LOCAL_REVIEW_GAME_IDS`. Đổi số game cần xem `tests/{integration/full-release.mjs,artwork/catalog.mjs,readability/contrast.mjs}`. Phòng online dùng CAS/receipt/presence 90 s; đang lặp 3 bộ (xem `TECH-DEBT.md`). Tank dùng WS riêng. Cosmic `legacy-*` vẫn được engine/replay sử dụng.

Tra lệnh/cấu trúc: [README](../README.md); tra đúng module: [INDEX](INDEX.md). Lịch sử: mục mới nhất [WORKLOG](WORKLOG.md), chi tiết cũ `archive/`; chỉ đọc khi truy vết.
