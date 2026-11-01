---
name: level-review
description: "Audit a game's level data with level-designer, systems-designer and qa-tester — pacing, difficulty curve, checkpoints, unused mechanics, completability."
argument-hint: "<game id> [level range]"
user-invocable: true
---

# Level Review

## 1. Load the level data
Locate where levels are defined (JSON, TS modules, or the `LEVELS` array inside a built game —
`scripts/neon/tune-levels.mjs` shows how to parse that safely). Produce a per-level table:
length/duration, enemies or obstacles, mechanics used, checkpoints/spacing, target time,
challenge type, boss, new mechanic introduced.

## 2. Parallel analysis
Spawn with the table and file paths:
- `level-designer`: pacing (rest after spikes, short/long alternation), memorable moments,
  backtracking, checkpoint spacing, readability of goals.
- `systems-designer`: difficulty formula — is difficulty only "longer + more enemies"? Which
  mechanics exist in code but appear in 0 levels?
- `qa-tester`: completability and invariants worth automating (every level finishable with
  normal inputs, every checkpoint on the played route, every optional challenge achievable).

## 3. Report
Findings with numbers, then concrete edits (data changes first, engine changes only when data
cannot express it). For data edits prefer an idempotent script with `--check` wired into the
game's `npm run test:*` (pattern: `scripts/neon/tune-levels.mjs` + `tests/neon/routes.cjs`).
