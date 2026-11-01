---
name: qa-plan
description: "Map a feature or module to ArcadeX's existing test suites, list what each must prove, and name the gaps that need new tests."
argument-hint: "<feature/module>"
user-invocable: true
---

# QA Plan

## Test inventory (from package.json)
| Suite | Covers |
|---|---|
| `npm run test:fast` | No-browser suites: readability, storage compatibility, engines, sync, commerce, SQL (PGlite), subscriptions, battleship, duel, social, artwork, cosmic levels, startup/PWA, boom, eat, full-release, dungeon, Neon Run |
| `npm run test:smoke` | Launcher flows on the build |
| `npm run test:games` | Opens all 22 games, short input, no JS errors |
| `npm run test:offline` | Service-worker precache and offline play |
| `npm run test:modals` | `AGENTS.md` modal frame on phone/tablet/desktop |
| `npm run test:perf` / `test:bundle` | Idle render rate, bundle limits |
| `npm run test:neon` / `test:neon-feel` | Neon Run routes, challenges, data check; browser feel |
| `npm run test:supabase` | SQL on Docker (separate test DB only) |

Browser suites need `npm run build` first. CI order: `.github/workflows/ci.yml`.

## Plan
1. Split the change into areas (logic, UI, game feel, data, backend).
2. For each area: which existing suite already exercises it, what new assertion is needed,
   and whether it must fail without the change.
3. Name manual checks that cannot be automated (feel, art) and how they will be evidenced
   (screenshots, playtest report).
4. State the merge gate: which suites must be green before pushing, and before merging to `main`.
Use `qa-lead` for strategy questions and `qa-tester` to draft the tests.
