# Bàn giao hiện tại · 05/11/2026

Mốc đã kiểm: `main@affc5e8` (PR #15, P3b/P3c), CI [41727993592](https://github.com/ducpham2806/Arcade-x/actions/runs/41727993592) qua. Đây là bằng chứng CI ngày 04/11 theo giờ Việt Nam; chưa kiểm trạng thái backend/hosting trực tiếp. Đầu phiên dùng `git log -1`/`git status` để xác định checkout hiện tại.

| Mảng | Hiện trạng / việc kế tiếp |
|---|---|
| Nền tảng | 23 game; M0–M8, Neon NR1–NR4 đã merge. Commerce vẫn tắt; adapter thật chưa đủ. |
| Tank Clash | [Bản thử Render](https://arcadex-tank-staging.onrender.com/review) đã Live ở `3950abb`, có 4 tester staging; 17 WS/ops + 11 UI qua, một tester thật tạo/rời phòng thành công. Còn trận nhiều người/hai mạng/thiết bị và tải Render; [TC2-review](tank-clash/TC2-review.md). Chưa launcher/art sản xuất/DB result. |
| Nối Từ | Bot/offline và UI online có code; `online-config.json` tắt. Catalog migration, server/scheduler theo bàn giao chưa triển khai; phải xác minh môi trường trước làm. |
| Duel | Trọng tài server có code/test; Chess/Xiangqi/Caro còn đường online cũ, cần deploy và nối UI sau flag. |
| Chất lượng | Test cũ lệch auth; Battleship cần đo điện thoại, Nối Từ cần Telex/VNI; banner có vệt đen; Block Breaker thiếu ảnh gốc, Blossom thiếu art phụ. |

**Đợt hiện tại 05/11:** nhánh `codex/tank-clash-tc2-readiness`; code `3950abb` đã push qua GitHub Desktop và Manual Sync lên Render Free, Auto Sync No. HTML public khớp build; login thật, tạo/rời phòng và từ chối mã phòng đã đóng qua. Bằng chứng/phạm vi ở [TC2-review](tank-clash/TC2-review.md)/[WORKLOG](WORKLOG.md). Soak30 phút cũ ở `a8d472b`, chưa tải Render. **Commit/push nhánh với `[skip netlify]`; không `[skip ci]`, không merge/main/deploy Netlify trước khi duyệt.**

**Tiếp theo:** TC2 → [runbook](tank-clash/TC2-RUNBOOK.md) §4–§5: dùng 2–4 tester chơi ≥10 trận mỗi quy mô, hai mạng/thiết bị; kiểm reconnect/spectator/phiên hết hạn và soak/load backend đích. Không biết/không xin mật khẩu qua chat. Commit tài liệu không cần redeploy Render; chưa mở TC3/commerce hoặc production.

**Lưu ý kỹ thuật:** CSS riêng game (`tc-`, `nt-`, `wc-`); game chỉ hiện production khi có trong `launcher_games`, dev dùng `LOCAL_REVIEW_GAME_IDS`. Đổi số game cần xem `tests/{integration/full-release.mjs,artwork/catalog.mjs,readability/contrast.mjs}`. Phòng online dùng CAS/receipt/presence 90 s; đang lặp 3 bộ (xem `TECH-DEBT.md`). Tank dùng WS riêng. Cosmic `legacy-*` vẫn được engine/replay sử dụng.

Tra lệnh/cấu trúc: [README](../README.md); tra đúng module: [INDEX](INDEX.md). Lịch sử: mục mới nhất [WORKLOG](WORKLOG.md), chi tiết cũ `archive/`; chỉ đọc khi truy vết.
