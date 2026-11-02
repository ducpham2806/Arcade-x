# ArcadeX — hướng dẫn cho Claude Code

@AGENTS.md

## Dự án
PWA launcher với 23 mini-game: React 19 + Vite + TypeScript, game Canvas 2D, Supabase (tài khoản, đồng bộ, bảng xếp hạng, phòng đấu). Cấu trúc thư mục và bảng lệnh test đầy đủ ở `README.md`.

- Game: `src/games/<id>/` (đăng ký ở `src/games/registry.ts`). Game build sẵn nằm ở `public/standalone/<id>/` và là output: chỉ sửa bằng script (ví dụ `scripts/neon/tune-levels.mjs`), không format tay.
- Đọc trước: `docs/SESSION-HANDOFF.md` (những gì đã làm, trạng thái nhánh, sổ tay kỹ thuật) và `docs/OWNER-TODO.md` (việc chủ dự án cần làm).
- Tài liệu thiết kế, đánh giá, quyết định đang chờ: `docs/` (`docs/PENDING-DECISIONS.md`, `docs/<GAME>-REVIEW.md`). QA: `docs/qa/`.

## Lệnh
```bash
npm run dev            # http://localhost:3000
npm run lint           # tsc --noEmit
npm run build
npm run test:fast      # không cần trình duyệt
npm run test:smoke && npm run test:games && npm run test:modals   # cần build trước
```
Thứ tự CI: `.github/workflows/ci.yml`.

## Cách làm việc
- Chủ dự án duyệt kế hoạch theo module (M0–M8, NR1–NR4…). Claude tự sửa, chạy test liên quan, commit và push lên nhánh làm việc.
- Chỉ merge vào `main` khi chủ dự án yêu cầu: Netlify deploy production từ `main`. Chạy đủ các bước CI trước khi merge.
- Không bỏ qua, tắt hay nới test để có kết quả xanh. Báo đúng kết quả, kể cả phần chưa làm được.
- Trả lời bằng tiếng Việt.

## An toàn
- Không chạy migration hay script lên project Supabase production (`whjatkhhupeqfngakmee`); dùng PGlite (`npm run test:sql`) hoặc staging.
- Không dùng mật khẩu database hay service-role key trong frontend. Flag commerce mặc định tắt (`docs/COMMERCE-ROLLOUT.md`).
- Không làm vỡ save cũ: `tests/storage/*-golden.json` chỉ được cập nhật khi cố ý đổi hành vi lưu trữ.

## Agent và skill (`.claude/`)
Lấy từ Claude Code Game Studios và chỉnh cho web; nguồn và giấy phép ở `.claude/CCGS-NOTICE.md`.

| Nhóm | Agent |
|---|---|
| Thiết kế | `game-designer`, `level-designer`, `systems-designer`, `economy-designer`, `ux-designer`, `creative-director` |
| Nội dung | `narrative-director`, `writer`, `art-director`, `sound-designer` |
| Kỹ thuật | `gameplay-programmer`, `ui-programmer`, `technical-artist`, `performance-analyst`, `security-engineer`, `accessibility-specialist` |
| QA và tiến độ | `qa-lead`, `qa-tester`, `producer` |

Skill: `/game-review`, `/level-review`, `/balance-check`, `/playtest-report`, `/bug-report`, `/qa-plan`, `/perf-profile`, `/ux-review`, `/tech-debt`, `/scope-check`, `/brainstorm`.
