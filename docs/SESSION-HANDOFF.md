# Bàn giao (rút gọn 03/11/2026)

Nhật ký chi tiết: `docs/WORKLOG.md`. Việc chủ dự án: `docs/OWNER-TODO.md`. Bản đầy đủ trước khi rút gọn (mô tả từng module, luật Nối Từ, chi tiết art/Battleship): `docs/archive/SESSION-HANDOFF-2026-11-03.md`.

## Trạng thái nhánh
- `main` = `508d4ff` (PR #14): có M0–M8, Neon Run NR1–NR4, Blossom, Battleship, Nối Từ, Snake journey, Tank Clash P0–P3a.
- Netlify deploy production từ `main`; chỉ merge khi chủ dự án yêu cầu, chạy đủ CI trước.

## Đã làm (chi tiết ở tài liệu riêng)
| Mảng | Trạng thái | Tài liệu |
|---|---|---|
| Nền tảng M0–M8 (tách storage/context, lazy-load, AppModal, smoke test, PGlite) | Đã merge | `README.md`, `docs/TECH-DEBT.md` |
| Duel server Cờ vua/Cờ tướng/Caro (M7) | Code xong, **chưa deploy** | `docs/DUEL-SERVER.md` |
| Neon Run NR1–NR4 | Đã merge | `docs/NEON-RUN-REVIEW.md` |
| Blossom Blast | Xong đợt review + art Gemini + 11 VFX | `docs/BLOSSOM-BLAST-REVIEW.md` |
| Art Gemini (7 game) | Công cụ `scripts/art/import-gemini.py` | `art/gemini/<game>/crops.json` |
| Battleship phối cảnh + UI thép & đồng | Xong | `docs/battleship/` |
| Nối Từ (game #23) WC1–WC4 | Offline chạy; online tắt, **server chưa deploy, migration chưa áp** | `docs/WORD-CHAIN-SERVER.md` |
| Tank Clash P0–P3c | Chạy cục bộ; 2v2 online và hàng chờ chưa có giao diện (P3d); chưa hosting, chưa vào launcher | `docs/tank-clash/PLAN.md` §10–§12 |
| Agent/skill `.claude/` | Xong | `CLAUDE.md`, `.claude/CCGS-NOTICE.md` |

## Sổ tay kỹ thuật
- CI: thứ tự ở `.github/workflows/ci.yml`. Test riêng: `test:battleship-ui`, `test:word-chain` (trong `test:fast`), `test:word-chain-ui`, `test:tank-clash*`.
- Chromium ở máy cloud: `CHROMIUM_EXECUTABLE=/opt/pw-browsers/chromium`.
- File sinh chỉ sửa bằng script, kiểm bằng `--check`/test: `build-lexicon.mjs --check`, `import-gemini.py … --check`, `prepare:word-chain-server`, `prepare:duel-server`, `scripts/build-launcher-art.mjs` (cần `sharp`, máy cloud chưa có).
- CSS prefix riêng từng game (Nối Từ `nt-`, Word Cross `wc-`, Tank Clash `tc-`).
- Game mới chỉ hiện ở production khi có dòng trong `launcher_games`; dev thì thêm vào `LOCAL_REVIEW_GAME_IDS`. Ba test cố định số game: `tests/integration/full-release.mjs`, `tests/artwork/catalog.mjs`, `tests/readability/contrast.mjs`.
- Phòng online (Duel, Nối Từ): server trọng tài, CAS theo version, biên nhận chống lặp, vắng 90 giây. Mẫu đã chép 3 lần (`docs/TECH-DEBT.md`) — gộp trước khi thêm game online thứ tư. Tank Clash dùng WS server riêng (`server/tank-clash-room/`).
- Không chạy migration/script lên Supabase production (`whjatkhhupeqfngakmee`); dùng PGlite hoặc staging.

## Còn yếu
- Block Breaker: chờ ảnh độ phân giải đầy đủ.
- Blossom: nhân vật một biểu cảm; huy hiệu, icon nhỏ, khung/ô bàn còn art cũ.
- Battleship: chưa `/ux-review`, chưa đo điện thoại thật; tốn CPU ~1,6 lần bản cũ.
- Banner launcher còn vệt đen (sửa mẫu xong, cần `sharp` để sinh lại).
- Nối Từ: chưa thử Telex/VNI trên máy thật; từ điển thiếu một số từ; online cần deploy server.
- Tank Clash: xem `docs/tank-clash/PLAN.md` §10.
