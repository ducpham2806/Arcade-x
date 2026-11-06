---
name: game-production-scrum
description: Game production, sprint planning, epic/story decomposition, and milestone gate manager based on Claude-Code-Game-Studios (/create-epics, /create-stories, /dev-story, /story-readiness, /story-done, /sprint-plan, /milestone-review, /gate-check, /scope-check, /estimate). Translates GDDs and ADRs into actionable engineering stories, enforces Definition of Ready/Done, and prevents scope creep. Use when planning sprints, breaking GDDs into stories, executing dev-story workflows, or auditing project scope and milestones.
---
# Game Production Scrum

Producer and agile production workflow skill that bridges Game Design Documents (GDDs) and Architecture Decision Records (ADRs) into verifiable Epics, User Stories, Sprint Plans, and Milestone Gate Checks.

## When to Use

- Breaking approved GDDs and ADRs into Epics and granular User Stories (`/create-epics`, `/create-stories`, `/estimate`)
- Checking whether a story is ready to code or implementing a story end-to-end (`/story-readiness`, `/dev-story`, `/story-done`)
- Planning sprints, tracking velocity, or running retrospectives (`/sprint-plan`, `/sprint-status`, `/retrospective`)
- Auditing feature creep and verifying phase readiness (`/scope-check`, `/gate-check`, `/milestone-review`, `/vertical-slice`)

## Steps

### 1. Decompose GDDs & ADRs into Epics and Stories (`/create-epics` & `/create-stories`)

Translate design specifications into self-contained implementation units under `production/epics/` and `production/stories/`:

1. **Epic Mapping**: Group related GDD features into milestone-aligned Epics (for example, `EP-01-core-movement`, `EP-02-combat-loop`).
2. **Self-Contained Story Creation**: Every story file (`production/stories/ST-XXX-<slug>.md`) must include:
   - **User/Player Story**: "As a [player/system], I want [action/feature] so that [gameplay outcome]."
   - **GDD & ADR Decision Summary**: Embed the exact formulas, state transitions, and architectural constraints directly inside the story's `## Context` section so the developer agent does not have to re-read 40 KB GDD/ADR files during implementation.
   - **Target Files & Domain**: Explicit paths to create or modify (respecting engine layout: `src/`, `Assets/`, or `Source/`).
   - **Acceptance Criteria (AC)**: Testable, deterministic conditions (including edge cases from the GDD).
   - **Required Verification Evidence**: Specify whether the story requires `logic` unit tests, `integration` tests, `config` schema validation, or `visual`/`UI` runtime screenshot evidence.

### 2. Check Story Readiness (`/story-readiness`)

Before starting implementation on any story, verify the Definition of Ready (DoR):

- All upstream dependency stories are marked `DONE`.
- Every formula parameter and asset placeholder is defined (no unresolved `[TBD]` tags).
- Target file paths and signal/interface contracts are explicitly listed.

### 3. Execute Story Development (`/dev-story`)

Follow a strict Verification-Driven Development loop when implementing a story:

1. **Read Story Context First**: Use the embedded GDD and ADR Decision Summary inside the story file.
2. **Write or Update Tests/Harness First**: Create unit or scene tests covering the Acceptance Criteria.
3. **Implement Modular Code**: Write clean, data-driven code following engine standards (consult `game-systems-ai-programmer` or engine-specific skills like `godot-gameplay-scripter`, `unity-architect`, `unreal-systems-engineer`).
4. **Update Session Checkpoint**: Record modified files and progress in `production/session-state/active.md`.

### 4. Close Story with Evidence (`/story-done`)

Never mark a story `DONE` until it passes the Definition of Done (DoD):

1. **All Acceptance Criteria Verified**: Check off each AC item with proof.
2. **No Hardcoded Magic Numbers**: Tunable gameplay values live in data files/resources, not inline literals.
3. **Visual Look Requirement**: If the story touches anything the player sees (UI, sprites, shaders, camera, animations), a syntax/parse check is never enough. The game or scene must be launched, observed, and documented in `production/qa/evidence/`.

### 5. Sprint Planning, Scope Check & Gate Reviews (`/sprint-plan`, `/scope-check`, `/gate-check`)

Protect the project schedule from scope creep:

- **Scope Check (`/scope-check`)**: Compare current backlog against `MVP` and `Vertical Slice` pillars. Flag any P2/P3 polish or unapproved feature creeping into an MVP sprint and propose cutting or deferring it to the parking lot.
- **Stage Gate Check (`/gate-check`)**: Validate readiness before transitioning across the 7 studio phases (*Concept* -> *Prototype* -> *Technical Setup* -> *Vertical Slice* -> *Production* -> *Alpha/Beta* -> *Release*).

## Gotchas

- Never create vague stories like "Implement combat system"; split them into vertical, testable slices under 1-2 days of work (for example, `ST-012-melee-hitbox-detection`, `ST-013-damage-calculation-service`, `ST-014-hit-stop-and-knockback`).
- Always embed the relevant GDD formulas and ADR rules directly into the story file during `/create-stories` to prevent context window bloat during `/dev-story`.
