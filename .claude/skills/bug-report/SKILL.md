---
name: bug-report
description: "File an ArcadeX bug in docs/qa/bugs/BUG-NNNN.md with reproduction steps, severity, priority, area and evidence."
argument-hint: "<short description>"
user-invocable: true
---

# Bug Report

1. Pick the ID: one past the highest `BUG-NNNN` in `docs/qa/bugs/` (start at `BUG-0001`).
2. Reproduce first (browser via Playwright on `npm run build` + `vite preview`, or a Node test).
   If it cannot be reproduced, say so and record what was tried.
3. Write `docs/qa/bugs/BUG-NNNN.md`:

```
# BUG-NNNN — <title>
**Severity**: S1-Critical | S2-High | S3-Medium | S4-Low
**Priority**: P1-Fix now | P2-Fix soon | P3-Backlog | P4-Won't fix
**Status**: Open
- **Area**: <src/games/<id> | launcher | sync | commerce | supabase>
- **Category**: crash | progression | save/sync | UI/layout | input | audio | performance | security
- **Frequency**: always | often | rare
- **Version**: <package.json version + git short sha>
- **Device/Browser**: <...>

## Reproduction Steps
## Expected Result
## Actual Result
## Evidence (console errors, screenshots, failing test)
## Suspected cause (file:line, if known)
```

Severity: S1 crash/data loss/progression blocker; S2 major feature broken but playable;
S3 degraded with workaround; S4 cosmetic. A fix should come with a test that fails before it.
