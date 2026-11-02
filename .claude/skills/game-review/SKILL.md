---
name: game-review
description: "Review one ArcadeX game end to end — feel, level design, progression, weaknesses — and write a prioritised upgrade plan to docs/<GAME>-REVIEW.md."
argument-hint: "<game id or name> [focus: feel|levels|economy|full]"
user-invocable: true
---

# Game Review

Produces the kind of review done for Neon Run (`docs/NEON-RUN-REVIEW.md`): evidence first,
then a prioritised plan the owner can approve module by module.

## 1. Gather evidence
- Find the game: `src/games/registry.ts`, its folder `src/games/<id>/` (or `public/standalone/<id>/`
  for prebuilt games), existing docs in `docs/` that mention it, and its tests (`tests/<game>/`,
  `tests/games`).
- Read the data that defines content (levels, waves, rewards, difficulty). Compute numbers rather
  than guessing: level counts, length/duration curves, enemy or obstacle density, reward rates,
  how many mechanics each world/stage introduces, which systems exist in code but are unused.
- Play it: `npm run build`, then drive it in Chromium with Playwright (see `tests/neon/feel.cjs` for
  opening a game through the launcher). Capture screenshots at phone landscape (844×390) and
  desktop (1280×760). Note input feel, feedback (sound, shake, particles), readability, load time.
- Run the game's suites so the review states what is already verified.

## 2. Analyse (spawn in parallel when the game is large)
- `game-designer` — core loop, progression, player motivation.
- `level-designer` — pacing, difficulty curve, memorable moments, backtracking.
- `ux-designer` — controls on touch vs keyboard, HUD, onboarding, `AGENTS.md` rules.
- `technical-artist` / `performance-analyst` when assets or frame rate are a concern.
Give each agent the evidence and the paths; ask for findings with numbers.

## 3. Write `docs/<GAME>-REVIEW.md` (Vietnamese unless asked otherwise)
1. Nguồn đánh giá (what was played/measured, what was not).
2. Điểm mạnh.
3. Vấn đề khi chơi — numbered, concrete, each with evidence.
4. Số liệu level design (table).
5. Đề xuất — Ưu tiên cao / trung bình / nâng cấp lớn; each item small enough to be a module.
6. Làm trước — the 2–3 modules recommended first.
Keep claims honest: say what was measured vs. inferred.

## 4. Hand back
Summarise the top issues and the recommended first modules in chat; do not start implementing
until the owner approves.
