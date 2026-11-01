---
name: perf-profile
description: "Profile ArcadeX launcher or a game — bundle size, first load, idle renders, in-game frame time, asset weight — and recommend fixes tied to budgets."
argument-hint: "<launcher | game id>"
user-invocable: true
---

# Performance Profile

## Measure (always before recommending)
- Bundle: `npm run build && npm run test:bundle` (no chunk > 500 kB, initial JS ≤ 400 kB gzip);
  `npm run analyze:bundle` for the breakdown; `npm run perf:first-load` for first-load bytes.
- Launcher idle: `npm run test:perf` (≤ 20 renders/s).
- Game frame time: open the game through the launcher in Playwright, sample
  `requestAnimationFrame` deltas for 10 s at 844×390 with CPU throttling (CDP
  `Emulation.setCPUThrottlingRate` 4×); report p50/p95 frame ms and dropped frames.
- Asset weight: files listed for the game in `src/games/packageAssets.json`; flag PNGs that
  should be WebP and images larger than their drawn size.

## Analyse
Use `performance-analyst` with the numbers; `technical-artist` for atlas/asset fixes.

## Report
Budget table (target vs actual), top bottlenecks with evidence, fixes ranked by expected effect,
and the test that will hold the gain (add a threshold to an existing suite when possible).
