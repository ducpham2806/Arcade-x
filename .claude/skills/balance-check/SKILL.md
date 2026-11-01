---
name: balance-check
description: "Find balance outliers in ArcadeX economies and progression — coins, XP, shop prices, rewards, difficulty curves, degenerate strategies."
argument-hint: "<system or game> [path to data]"
user-invocable: true
---

# Balance Check

## Where the numbers live
- Launcher economy and progression: `src/services/storage/` (domains) and `src/services/storage/catalog/`
  (defaults: shop items, quests, rewards), `src/context/` progression slices.
- Per-game tuning: data/constants inside `src/games/<id>/`; prior analyses such as
  `docs/EAT-ECONOMY-V4.md` and `docs/EAT-ECONOMY-SIMULATION.json`.
- Server-side rewards and limits: `supabase/migrations/` (never assume the client is trusted).

## Method
1. Map faucets (where coins/XP/items enter) and sinks (where they leave) per session length.
2. Compute time-to-unlock for key items and levels; flag anything > 3× or < ⅓ of its neighbours.
3. Look for dominant strategies (one action that beats all others), farmable loops, rewards that
   can be claimed twice (check idempotency in storage and SQL), and difficulty spikes.
4. Use `economy-designer` for sink/faucet modelling and `systems-designer` for formulas.
5. Prefer a small simulation script (Node, no browser) over intuition; keep it under `scripts/`
   only if it becomes a regression test.

## Output
A table of outliers (value, expected range, impact, fix) and the recommended changes. Do not
edit balance values without the owner's approval; changes to saved data must keep
`tests/storage/*-golden.json` passing.
