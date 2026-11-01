---
name: playtest-report
description: "Write a structured playtest report for an ArcadeX game or launcher flow — what was tried, what felt good or bad, issues with severity, recommended changes."
argument-hint: "<game or flow> [device]"
user-invocable: true
---

# Playtest Report

Write to `docs/qa/playtests/<game>-<YYYY-MM-DD>.md` (create the folder if needed).

```
# Playtest — <game/flow> — <date>
Build: <git short sha>   Device/Browser: <e.g. Pixel 7 Chrome, 844×390 landscape>
Tester: <owner | Claude via Playwright>   Duration: <minutes>

## Goal of the session
## What was played (levels, modes, inputs used)
## Felt good
## Felt bad / confusing (each: moment, why, how often)
## Issues (each: severity S1–S4, steps, expected vs actual, screenshot path)
## Metrics (deaths per level, time per level, retries, FPS if measured)
## Recommendations (ranked, each small enough to be a module)
```

Rules: separate observation from interpretation; when Claude plays via Playwright, say so — it
is not a human feel test. File S1/S2 issues with the `bug-report` skill and link them.
