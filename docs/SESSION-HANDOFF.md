# Bàn giao hiện tại · 04/11/2026

Mốc đã kiểm: `main@affc5e8` (PR #15, P3b/P3c), CI [41727993592](https://github.com/ducpham2806/Arcade-x/actions/runs/41727993592) qua. Đây là bằng chứng CI ngày 04/11 theo giờ Việt Nam; chưa kiểm trạng thái backend/hosting trực tiếp. Đầu phiên dùng `git log -1`/`git status` để xác định checkout hiện tại.

| Mảng | Hiện trạng / việc kế tiếp |
|---|---|
| Nền tảng | 23 game; M0–M8, Neon NR1–NR4 đã merge. Commerce vẫn tắt; adapter thật chưa đủ. |
| Tank Clash | P0–P3d đã có code/test cục bộ; [P3-review](tank-clash/P3-review.md). Bản duyệt 4338; **tiếp TC2 hosting/auth/mạng thật**. Chưa launcher, art sản xuất, lưu kết quả hoặc nghiệm thu thiết bị thật. |
| Nối Từ | Bot/offline và UI online có code; `online-config.json` tắt. Catalog migration, server/scheduler theo bàn giao chưa triển khai; phải xác minh môi trường trước làm. |
| Duel | Trọng tài server có code/test; Chess/Xiangqi/Caro còn đường online cũ, cần deploy và nối UI sau flag. |
| Chất lượng | Test cũ lệch auth; Battleship cần đo điện thoại, Nối Từ cần Telex/VNI; banner có vệt đen; Block Breaker thiếu ảnh gốc, Blossom thiếu art phụ. |

**Đợt hiện tại 04/11:** chủ dự án yêu cầu tiếp tục plan; TC1/P3d có code/test cục bộ trên `codex/tank-clash-p3d`, xem [P3-review](tank-clash/P3-review.md) và mục mới nhất [WORKLOG](WORKLOG.md). Bản riêng `http://localhost:4338/` + WS loopback 3223, chưa catalog/hosting. Bản sửa Battleship/Dungeon `bfb6732`, `http://localhost:4337/` vẫn chờ duyệt; [DESKTOP-MOTION-FIX](DESKTOP-MOTION-FIX.md) giữ bằng chứng VFX gốc. **Không push/merge/deploy Netlify trước khi được duyệt.**

**Tiếp theo:** [PROJECT-PLAN](PROJECT-PLAN.md) → TC2; đọc [Tank PLAN §10–§12](tank-clash/PLAN.md), chốt hosting qua [PENDING-DECISIONS](PENDING-DECISIONS.md) #9 trước đăng ký/triển khai. Chuẩn bị staging/auth, thử ≥10 trận mỗi quy mô và soak/load; test cục bộ không thay nghiệm thu mạng/thiết bị thật. Chưa mở TC3/commerce hoặc production.

**Lưu ý kỹ thuật:** CSS riêng game (`tc-`, `nt-`, `wc-`); game chỉ hiện production khi có trong `launcher_games`, dev dùng `LOCAL_REVIEW_GAME_IDS`. Đổi số game cần xem `tests/{integration/full-release.mjs,artwork/catalog.mjs,readability/contrast.mjs}`. Phòng online dùng CAS/receipt/presence 90 s; đang lặp 3 bộ (xem `TECH-DEBT.md`). Tank dùng WS riêng. Cosmic `legacy-*` vẫn được engine/replay sử dụng.

Tra lệnh/cấu trúc: [README](../README.md); tra đúng module: [INDEX](INDEX.md). Lịch sử: mục mới nhất [WORKLOG](WORKLOG.md), chi tiết cũ `archive/`; chỉ đọc khi truy vết.
