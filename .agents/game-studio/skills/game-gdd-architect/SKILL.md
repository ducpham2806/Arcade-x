---
name: game-gdd-architect
description: Game Design Document (GDD) workflow architect based on Claude-Code-Game-Studios 1.3 (/brainstorm, /map-systems, /design-system, /quick-design, /design-review, /balance-check, /propagate-design-change, /reverse-document). Guides ideation, the one-page game brief, system dependency mapping, section-by-section GDD authoring under specialist lenses, MDA/SDT/Flow analysis, and cross-document consistency checks. Use when brainstorming game concepts, writing a game brief, mapping game systems, writing or reviewing studio-mode GDDs, or propagating design changes. Not for a lightweight GDD.md plus feature notes kept in sync with code (game-docs) or building the playable one-shot (game-studio-orchestrator).
---
# Game GDD Architect

Structured workflow skill for taking a game from initial brainstorm to a dependency-mapped systems index and section-by-section Game Design Documents (GDDs) with cross-reference validation.

## When to Use

- Brainstorming a new game concept or creating the one-page brief `design/game-brief.md` (`/brainstorm`, `/quick-design`)
- Writing a brief or design doc from an existing game's code (`/reverse-document brief`, with built features marked done)
- Mapping all systems in a game and ordering them by dependencies (`/map-systems`)
- Authoring a system GDD section by section with formula and edge-case rigor (`/design-system`)
- Reviewing existing GDDs for completeness, balance, or conflicts (`/design-review`, `/review-all-gdds`, `/balance-check`, `/consistency-check`)
- Updating downstream documents when a core mechanic changes (`/propagate-design-change`)

## Steps

### 1. Concept Brainstorm and Design Pillars (`/brainstorm` & `/quick-design`)

Establish the foundational vision in `design/gdd/game-concept.md`, or at `minimal` rigor in the one-page brief `design/game-brief.md` (from `docs/templates/game-brief-template.md`), which then replaces the concept doc, the systems index and per-system GDDs. The brief's six required fields are Pitch, Core loop, Goal & fail state, Features, Out of scope and Build order; the one-shot also needs Look and references, First minute and Challenge. Keep **In your words** verbatim, and mark every field the agent filled *(guessed)*, *(inferred)* or *(provisional)*. A picked concept goes straight to `/prototype` (see `game-studio-orchestrator`) so there is something to play before deeper docs.


1. **Core Fantasy & Hook**: Define the 1-sentence elevator pitch and unique selling point.
2. **3-5 Design Pillars**: Define non-negotiable experiential pillars (for example, "Fast tactical decisions under 3 seconds") and explicit anti-pillars (what the game will never do).
3. **Theoretical Grounding**:
   - **MDA Framework**: Map *Mechanics* (rules/actions) -> *Dynamics* (emergent runtime behavior) -> *Aesthetics* (emotional player feeling).
   - **Self-Determination Theory (SDT)**: Explain how the loop delivers *Autonomy* (meaningful choice), *Competence* (mastery feedback), and *Relatedness*.
   - **Flow Channel**: Define how challenge scales with player skill to avoid boredom and anxiety.
4. **Core Gameplay Loop**: Detail the Second-to-Second, Minute-to-Minute, and Hour-to-Hour loops.

### 2. Map Systems and Dependencies (`/map-systems`)

Before writing individual system GDDs, create or update `design/gdd/systems-index.md`:

1. **Categorize Every System**: Assign each system to one of the 9 studio categories: `Core`, `Gameplay`, `Persistence`, `Economy`, `Progression`, `UI`, `Audio`, `Narrative`, or `Meta`.
2. **Define Priority & Scope**: Tag each system as `MVP (P0)`, `Vertical Slice (P1)`, `Content Complete (P2)`, or `Post-Launch (P3)`.
3. **Map Upstream/Downstream Dependencies**: List which systems a given system depends on (for example, *Combat* depends on *Character Stats* and *Input*; *Loot* depends on *Combat* and *Inventory*).
4. **Maintain Entity Registry**: Register canonical entity IDs and stat names in `design/registry/entity-registry.md` so no two GDDs invent conflicting variable names for the same stat. The next ID is the highest ever used plus one: a retired or superseded ID is never reused or renumbered, and status values stay within the registry header's list.
5. **Brief systems first**: When `design/game-brief.md` lists **Your systems** (`in the slice` / `thin stand-in` / `later`), the systems index starts from that list in that order.

### 3. Section-by-Section System GDD Authoring (`/design-system`)

Write each system GDD in `design/gdd/<system-name>.md` incrementally. Since CCGS 1.3.0 the skill drafts every section itself in the conversation, under each specialist's lens (systems, economy, narrative, level, UX, audio, technical, QA), instead of starting one agent per specialist; delegate to a specialist skill only for deep work it owns. Adapt section depth to `modes.rigor`:

- **Required Sections (`standard` uses 1-5; `full` uses all 8)**:
  1. **System Overview & Pillar Alignment**: Purpose, design goals, and which pillars it serves.
  2. **Core Mechanics & State Machine**: Exact states, transitions, inputs, preconditions, and outputs.
  3. **Parameters, Formulas & Data Tables**: Explicit mathematical formulas (with variable definitions, min/max bounds, and sample calculations at early/mid/late game) - never vague phrases like "deals moderate damage".
  4. **System Dependencies & Interfaces**: Events emitted, events subscribed to, and shared data contracts.
  5. **Edge Cases & Failure States**: What happens on simultaneous inputs, inventory full, zero/negative values, disconnect, or interrupt states.
  6. **UI/UX & Player Feedback (Signifiers)**: HUD elements, visual VFX cues, camera shake/hit-stop, audio triggers, and accessibility options.
  7. **Tuning & Economy Sinks/Sources**: Configurable knobs for designers (exposed via data resources/JSON, never hardcoded).
  8. **Test Criteria & Prototype Hypotheses**: Concrete playtest questions and measurable pass/fail thresholds.

### 4. Design Review, Balance Check, and Change Propagation (`/design-review`, `/balance-check`, `/propagate-design-change`)

When reviewing or modifying a GDD:

1. **Formula & Balance Audit**: Test formulas at boundary values (level 1, max level, 0 armor, 999% haste) to catch division-by-zero, infinite scaling, or dominant strategies.
2. **Cross-GDD Consistency Check**: Verify that every stat, resource, or event referenced in `<system-name>.md` exists with the exact same name and type in `systems-index.md` and upstream GDDs.
3. **Impact Propagation**: When changing a mechanic, list every dependent GDD, ADR, data table, and active user story affected before applying the edit.

## Gotchas

- Never use qualitative adjectives ("fast cooldown", "heavy damage", "rare drop") without pairing them with concrete baseline numbers or tunable parameter names (for example, `base_cooldown_sec = 0.8`).
- Never overwrite an existing GDD wholesale when updating one mechanic; inspect existing sections and check downstream dependencies first.
- Read a GDD, ADR or art bible over ~40 KB by section (find its headings, then read a range), never as one whole-file read.
- Headings and marks in the brief stay in English whatever language the user writes in, so `/cut`, `/create-stories` and the one-shot can parse any brief.
- Use the doc layout the project already has: `design/gdd/` (this skill, studio mode) or `GDD.md` + `features/*/design.md` (`game-docs`), never both.
- Delegate deep mathematical economy modeling to `economy-designer`, spatial encounter flow to `level-designer`, and branching dialogue scripts to `narrative-designer` when those specialized skills apply.
