---
name: scope-check
description: "Compare a plan's scope with what was actually committed — catch scope creep, unfinished items and silent cuts before reporting a module done."
argument-hint: "[plan file or module name]"
user-invocable: true
---

# Scope Check

1. Read the approved plan (the plan file, or the module list in chat/docs such as
   `docs/PENDING-DECISIONS.md`, `docs/NEON-RUN-REVIEW.md`).
2. Read what changed: `git log --oneline <base>..HEAD`, `git diff --stat <base>..HEAD`.
3. Build a table: plan item → done / partial / not done / added (not in plan), with evidence
   (commit, file, test).
4. Flag: work added without approval, items cut silently, tests promised but missing,
   claims in docs that the code does not back.
5. Report honestly in the final summary — partial items stay partial.
