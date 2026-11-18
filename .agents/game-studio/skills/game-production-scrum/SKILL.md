---
name: game-production-scrum
description: Game production, sprint planning, epic/story decomposition, scope cutting and milestone gate manager based on Claude-Code-Game-Studios 1.3 (/create-epics, /create-stories, /dev-story, /story-readiness, /story-done, /sprint-plan, /milestone-review, /gate-check, /scope-check, /cut, /estimate). Translates a game brief, GDDs and ADRs into actionable stories with planned files, enforces Definition of Ready/Done with evidence stamps and a Reviewed-by line, and finishes games by proposing cuts. Use when planning sprints, breaking a brief or GDDs into stories, executing dev-story workflows, deciding what to cut, or auditing scope and milestones. Not for the playable one-shot or one-feature-a-sitting growth (game-studio-orchestrator).
---
# Game Production Scrum

Producer and agile production workflow skill that bridges Game Design Documents (GDDs) and Architecture Decision Records (ADRs) into verifiable Epics, User Stories, Sprint Plans, and Milestone Gate Checks.

## When to Use

- Breaking approved GDDs and ADRs into Epics and granular User Stories (`/create-epics`, `/create-stories`, `/estimate`)
- Checking whether a story is ready to code or implementing a story end-to-end (`/story-readiness`, `/dev-story`, `/story-done`)
- Planning sprints, tracking velocity, or running retrospectives (`/sprint-plan`, `/sprint-status`, `/retrospective`)
- Auditing feature creep and verifying phase readiness (`/scope-check`, `/gate-check`, `/milestone-review`, `/vertical-slice`)
- Finishing a game from its brief: what to cut, a polish list, a target date and feature freeze (`/cut`)

Stories, epics and gates are opt-in: on a one-shot or grown game, use them only when the user asks or in studio mode. Print the next command (for example `/dev-story production/stories/ST-012-...md`) for the user to type; never offer it as a clickable option.

## Steps

### 1. Decompose GDDs & ADRs into Epics and Stories (`/create-epics` & `/create-stories`)

Translate design specifications into self-contained implementation units under `production/epics/` and `production/stories/`:

1. **Epic Mapping**: Group related GDD features into milestone-aligned Epics (for example, `EP-01-core-movement`, `EP-02-combat-loop`).
2. **Self-Contained Story Creation**: Every story file (`production/stories/ST-XXX-<slug>.md`) must include:
   - **User/Player Story**: "As a [player/system], I want [action/feature] so that [gameplay outcome]."
   - **GDD & ADR Decision Summary**: Embed the exact formulas, state transitions, and architectural constraints directly inside the story's `## Context` section so the developer agent does not have to re-read 40 KB GDD/ADR files during implementation.
   - **Files**: The planned paths to create or modify under `engine.code_root` / `engine.test_root` (or the engine's usual `src/`, `Assets/`, `Source/`). `/dev-story` replaces the list with the files it actually changed, and `/story-done` checks scope against it.
   - **Governing ADR status**: Report each governing ADR's status before drafting. A story whose ADR is not Accepted (or depends on one that is not) is written `BLOCKED: <reason>`.
   - **Acceptance Criteria (AC)**: Testable, deterministic conditions (including edge cases from the GDD).
   - **Required Verification Evidence**: Specify whether the story requires `logic` unit tests, `integration` tests, `config` schema validation, or `visual`/`UI` runtime screenshot evidence. At `qa.level: minimal`, write "Test: waived at qa.level minimal" for Logic/Integration stories; a Visual/UI screenshot is never waived.
3. **From a brief**: When `design/game-brief.md` lists **Your systems**, build the story skeleton from that list first (`core`, `thin — <system>`, `deepen — <system>`). When every Feature is built, ask what to add and add it to the brief with the user's yes instead of writing no stories.
4. **No engine set**: Say so and point to `/setup-engine`; never write a default engine (such as Godot) into a story's Engine field.

Use `docs/templates/story-template.md`.

### 2. Check Story Readiness (`/story-readiness`)

Before starting implementation on any story, verify the Definition of Ready (DoR):

- All upstream dependency stories are marked `DONE`.
- Every formula parameter and asset placeholder is defined (no unresolved `[TBD]` tags).
- Target file paths and signal/interface contracts are explicitly listed.

### 3. Execute Story Development (`/dev-story`)

Follow a strict Verification-Driven Development loop when implementing a story:

1. **Read Story Context First**: Use the embedded GDD and ADR Decision Summary inside the story file.
2. **Write or Update Tests/Harness First**: Create unit or scene tests covering the Acceptance Criteria.
3. **Implement Modular Code**: Write clean, data-driven code following engine standards (consult `game-systems-ai-programmer` or engine-specific skills like `godot-gameplay-scripter`, `unity-architect`, `unreal-systems-engineer`). Hand every code story's changed files to the engine specialist for review. New gameplay values go to the data file, not literals; no one-off helpers, no handling for errors that cannot happen, and no values special-cased so a test passes.
4. **Grown web games**: After every story, run the game's smoke script and the same-seed run, and show any change before the story can close.
5. **Record evidence with a stamp**: Write `stamp.txt` beside each story's retained screenshots listing the files they prove.
6. **Update Session Checkpoint**: Record modified files and progress in `production/session-state/active.md`.

### 4. Close Story with Evidence (`/story-done`)

Never mark a story `DONE` until it passes the Definition of Done (DoD):

1. **All Acceptance Criteria Verified**: Check off each AC item with proof.
2. **No Hardcoded Magic Numbers**: Tunable gameplay values live in data files/resources, not inline literals.
3. **Visual Look Requirement**: If the story touches anything the player sees (UI, sprites, shaders, camera, animations), a syntax/parse check is never enough. The game or scene must be launched, observed, and documented in `production/qa/evidence/`. Name each file in `stamp.txt` changed since the screenshot ("re-capture it"), or say "no stamp" for older evidence; report it, never block on it.
4. **Scope against Files**: Compare the changed files with the story's `## Files` list and flag anything outside it.
5. **Reviewed by**: The report carries a line that is never blank: `lead-programmer`, `/code-review (you said you ran it; not verified here)`, or `self, no independent review`.
6. **AI decisions beyond the design**: List the calls the agent made that the GDD/brief did not specify, for the user to keep or change.
7. **Close the loop**: Tick the story's Features line in the brief, set its row in `EPIC.md`, and ask to commit the story's own files. A behaviour check the user has not played yet can be marked DEFERRED for a playtest instead of holding the verdict.

### 5. Sprint Planning, Scope Check & Gate Reviews (`/sprint-plan`, `/scope-check`, `/gate-check`)

Protect the project schedule from scope creep:

- **Scope Check (`/scope-check`)**: Compare current backlog against `MVP` and `Vertical Slice` pillars. Flag any P2/P3 polish or unapproved feature creeping into an MVP sprint and propose cutting or deferring it to the parking lot.
- **Stage Gate Check (`/gate-check`)**: Validate readiness before transitioning across the 7 studio phases (*Concept* -> *Prototype* -> *Technical Setup* -> *Vertical Slice* -> *Production* -> *Alpha/Beta* -> *Release*).
- **Sprint Goal Prerequisites (`/sprint-plan`)**: List what showing the sprint goal needs (the scene it runs in, the setting that starts it, anything a picked story names but none builds) and report any gap in a Goal Prerequisites section and in Risks, without blocking.

### 6. Finish the Game (`/cut`)

Finishing a game is choosing what not to build. Run only when asked ("what should I cut?", "how do I finish this?"), on the game `design/game-brief.md` describes; a project with GDDs and no brief is `/scope-check`'s.

1. Read the brief, what is built and the stories; propose cuts, each with a reason taken from what exists, plus a polish list.
2. The user picks every cut. A cut Feature moves to **Out of scope** as `- [-] <item> · cut: <reason> (<date>)`; a cut story's Status line says so.
3. For `project.goal` of `sell`, `early_access` or `publisher`, ask a target date and propose a feature-freeze date, recorded as a `**Dates:**` line in the brief (recorded, never enforced).
4. Write the brief, the polish list and any cut story's Status, then make one commit.

## Gotchas

- Never create vague stories like "Implement combat system"; split them into vertical, testable slices under 1-2 days of work (for example, `ST-012-melee-hitbox-detection`, `ST-013-damage-calculation-service`, `ST-014-hit-stop-and-knockback`).
- Always embed the relevant GDD formulas and ADR rules directly into the story file during `/create-stories` to prevent context window bloat during `/dev-story`.
- `/next-step` (formerly `/help`) names `/design-system` first when the next story deepens a system with no design document, and suggests studio mode once when a grown game passes about nine stories or Features.
