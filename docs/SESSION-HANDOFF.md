# Bàn giao hiện tại · 04/11/2026

Mốc đã kiểm: `main@affc5e8` (PR #15, P3b/P3c), CI [41727993592](https://github.com/ducpham2806/Arcade-x/actions/runs/41727993592) qua. Đây là bằng chứng CI ngày 04/11 theo giờ Việt Nam; chưa kiểm trạng thái backend/hosting trực tiếp. Đầu phiên dùng `git log -1`/`git status` để xác định checkout hiện tại.

| Mảng | Hiện trạng / việc kế tiếp |
|---|---|
| Nền tảng | 23 game; M0–M8, Neon NR1–NR4 đã merge. Commerce vẫn tắt; adapter thật chưa đủ. |
| Tank Clash | P0/P1, P2 local, P3a–P3c xong; **P3d UI online 2v2 chưa làm**. Chưa hosting, launcher, art sản xuất, lưu kết quả hoặc nghiệm thu thiết bị thật. |
| Nối Từ | Bot/offline và UI online có code; `online-config.json` tắt. Catalog migration, server/scheduler theo bàn giao chưa triển khai; phải xác minh môi trường trước làm. |
| Duel | Trọng tài server có code/test; Chess/Xiangqi/Caro còn đường online cũ, cần deploy và nối UI sau flag. |
| Chất lượng | Test cũ lệch auth; Battleship cần đo điện thoại, Nối Từ cần Telex/VNI; banner có vệt đen; Block Breaker thiếu ảnh gốc, Blossom thiếu art phụ. |

**Làm tiếp:** [PROJECT-PLAN.md](PROJECT-PLAN.md) → TC1 (P3d); đọc [tank-clash/P3-SPEC.md](tank-clash/P3-SPEC.md) §7–§9. Chọn hosting song song qua [PENDING-DECISIONS.md](PENDING-DECISIONS.md) #9. Kế hoạch này chưa phải phê duyệt các module mới hay triển khai production.

**Lưu ý kỹ thuật:** CSS riêng game (`tc-`, `nt-`, `wc-`); game chỉ hiện production khi có trong `launcher_games`, dev dùng `LOCAL_REVIEW_GAME_IDS`. Đổi số game cần xem `tests/{integration/full-release.mjs,artwork/catalog.mjs,readability/contrast.mjs}`. Phòng online dùng CAS/receipt/presence 90 s; đang lặp 3 bộ (xem `TECH-DEBT.md`). Tank dùng WS riêng. Cosmic `legacy-*` vẫn được engine/replay sử dụng.

Tra lệnh/cấu trúc: [README](../README.md); tra đúng module: [INDEX](INDEX.md). Lịch sử: mục mới nhất [WORKLOG](WORKLOG.md), chi tiết cũ `archive/`; chỉ đọc khi truy vết.
