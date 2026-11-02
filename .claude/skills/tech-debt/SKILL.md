---
name: tech-debt
description: "Scan ArcadeX for technical debt and keep docs/TECH-DEBT.md current — hotspots, TODOs, duplicated code, stale tests, risky areas — with cost and payoff."
argument-hint: "[area]"
user-invocable: true
---

# Tech Debt

1. Collect signals: `TODO|FIXME|HACK` comments, very large files (`wc -l src/**/*.ts*`), duplicated
   logic across games, `any`/`@ts-ignore`, legacy paths kept on purpose (README notes Cosmic
   `legacy-*` engines), Playwright suites known to be stale (README "Kiểm thử"), skipped tests.
2. For each item record: area, symptom, risk if left, effort (S/M/L), payoff, suggested module.
3. Update `docs/TECH-DEBT.md` (create if missing) as a table sorted by payoff ÷ effort; keep items
   that are intentional marked "giữ có chủ đích" with the reason.
4. Never fix while scanning; propose the top 3 as modules for the owner to approve.
