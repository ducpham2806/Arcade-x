---
name: arcadex-studio
description: Use the installed Game Studio library for ArcadeX game planning, gameplay, art, UI, QA and release work, selecting only the relevant playbooks and preserving the project handoff workflow.
---
# ArcadeX Studio

Locate the repository root from this skill (three parents). Read root `AGENTS.md` if it was not already provided, then `docs/SESSION-HANDOFF.md` and the one active card in `docs/plans/`. Technology and workflow configuration lives in `project.md`.

Select only the 1–3 relevant playbooks through `docs/studio/INDEX.md`. The complete 116-skill library is at `.agents/game-studio/skills/<name>/SKILL.md`; bundled references/scripts are on demand. Do not load every skill or engine. Use `game-production-scrum` for task planning/closure, `game-qa-playtest` for verification, or `router` if the discipline is unclear. Source grouping paths were flattened; resolve names through the local index.

ArcadeX uses custom web engines, React/TypeScript/Canvas, Node 24 and existing build/test scripts. Bind examples to verified project APIs; preserve fixed-step simulation. Do not initialize a new engine/scaffold or run upstream setup scripts over this project.

`AGENTS.md`, explicit user decisions and `docs/WORKFLOW.md` govern local execution. Map upstream project.yaml to project.md, active-session to SESSION-HANDOFF, and story/epic documents to docs/plans and docs/templates/TASK.md. Preserve authorization already given; a roadmap is not permission to change production data or incur costs.

Before moving to new work, summarize completed tasks in docs/COMPLETED.md, compact the single docs/WORKLOG.md with details preserved in Markdown archives, and update the handoff. Do not mark unverified gameplay/deployment as done. Run python3 scripts/check-docs.py after documentation changes. See docs/studio/INSTALLATION.md only for provenance, update procedure or integration limits.
