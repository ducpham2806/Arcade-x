---
name: game-qa-playtest
description: Game QA lead, automated test architect, bug triage, and playtest analyst based on Claude-Code-Game-Studios (/qa-plan, /smoke-check, /soak-test, /regression-suite, /test-setup, /test-evidence-review, /bug-report, /bug-triage, /playtest-report). Enforces visual runtime verification, automated unit/integration test harnesses, and structured bug/playtest reporting. Use when creating QA test plans, setting up game test suites, triaging bugs, analyzing playtest sessions, or verifying visual/gameplay stories before closure.
---
# Game QA & Playtest

QA Lead and Verification Engineer skill responsible for test planning, automated test suites (unit, integration, soak, regression), runtime visual evidence verification, bug triage, and playtest telemetry analysis.

## When to Use

- Designing a QA test plan or setting up an automated test runner (`/qa-plan`, `/test-setup`, `/test-helpers`)
- Running smoke checks, long-duration soak tests, or regression suites (`/smoke-check`, `/soak-test`, `/regression-suite`, `/test-flakiness`)
- Reviewing story test evidence before closing a story (`/test-evidence-review`)
- Filing reproducible bug reports or triaging bug backlogs by severity (`/bug-report`, `/bug-triage`)
- Conducting structured playtest sessions and synthesizing player feedback (`/playtest-report`)

## Steps

### 1. Configure Test Harness & QA Plan (`/qa-plan` & `/test-setup`)

Structure `tests/` into four clear verification tiers matched to the project's engine (GUT/GdUnit4 for Godot 4, Unity Test Framework for Unity, Automation System for Unreal):

1. **Unit Tests (`tests/unit/`)**: Pure logic tests for damage formulas, economy curves, inventory math, and state machine transitions (fast, headless, deterministic).
2. **Integration Tests (`tests/integration/`)**: Multi-system interactions (for example, weapon hitbox collides with enemy hurtbox -> health decreases -> death signal fires -> loot drops -> UI updates).
3. **Data & Config Validation (`tests/config/`)**: Automated schema checks ensuring every JSON/Resource file under `assets/data/` parses cleanly, has no missing asset paths, and stays within valid min/max bounds.
4. **Performance & Soak Tests (`tests/soak/`)**: Automated stress loops (spawning 500 entities, rapid scene transitions for 30+ minutes) checking for memory leaks, orphaned nodes, or FPS degradation.

### 2. Enforce Runtime Visual Verification (`/test-evidence-review`)

A passing headless test never proves that a menu is on-screen or a sprite animation aligns properly:

1. **The Look Rule**: Any change affecting player-visible visuals, UI layout, shaders, camera, or animation requires launching the game/scene and capturing runtime visual evidence in `production/qa/evidence/`.
2. **Evidence Audit**: Verify that each story's required test categories (`logic`, `integration`, `visual`, `UI`, `config`) have corresponding passing outputs or screenshots before approving `/story-done`.

### 3. Run Smoke Checks & Regression Suites (`/smoke-check` & `/regression-suite`)

Before any milestone build or branch merge, execute the 5-minute Smoke Check checklist:

- Game boots to Main Menu with zero console errors or missing resource warnings.
- New Game / Load Game transitions cleanly into the playable level.
- Core player controls (move, action, pause menu) respond as expected.
- Save/Load cycle preserves core state without corruption.
- Clean exit without crashes or leaked RIDs/objects.

### 4. Structured Bug Reporting & Triage (`/bug-report` & `/bug-triage`)

Document defects in `production/qa/bugs/BUG-XXX-<slug>.md` and prioritize them objectively:

- **Severity Matrix**:
  - **S0 - Blocker / Crash**: Game crashes, soft-locks, corrupts saves, or prevents build compilation. Must fix immediately.
  - **S1 - Critical**: Core gameplay loop broken, major balance exploit, or unreadable UI on target resolution.
  - **S2 - Major**: Noticeable mechanic bug with a workaround, moderate visual glitch, or frame drop below target.
  - **S3 - Minor / Polish**: Cosmetic alignment issue, typo, or minor audio pop.
- **Required Bug Fields**: Environment/Engine version, Commit SHA, Exact Reproduction Steps (1, 2, 3), Expected Result, Actual Result, Console Logs/Stack Trace, and Visual Evidence.

### 5. Synthesize Playtest Reports (`/playtest-report`)

Analyze playtest observations using objective behavioral signals alongside player quotes:

1. **Separate Observation from Prescription**: When players say "this boss is unfair and needs 50% less HP", diagnose the root cause first (for example, telegraphs are only 150 ms or obscured by particle VFX).
2. **Track Funnel & Friction Metrics**: Record time-to-first-action, tutorial completion rate, death hotspots, and UI confusion points, then map actionable recommendations back to specific GDD sections.

## Gotchas

- Never accept a syntax check (`gdscript --check` or compilation pass) as substitute evidence for a visual or gameplay story.
- Eliminate flaky tests (`/test-flakiness`) caused by unseeded `randf()` calls or frame-timing race conditions by injecting deterministic RNG seeds and awaiting explicit signals in tests.
