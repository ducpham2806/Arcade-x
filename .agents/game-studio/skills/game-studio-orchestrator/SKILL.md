---
name: game-studio-orchestrator
description: Master game studio orchestrator and cross-engine skill router combining Claude-Code-Game-Studios 1.3 and awesome-gamedev-agent-skills 2.0, agency-agents and pixelfx (125 skills, 12 engines plus Web). Leads with "make me a game" (one-page brief, playable browser one-shot, change after play, grow into a project), then studio mode - the 3-tier hierarchy (Directors, Leads, Specialists), /team-* pipelines and the GDD ladder - when the project needs it. Fingerprints the engine and its pinned version, manages rigor modes and project.goal, and delegates to specialist skills and subagents. Use when starting or onboarding a game project, asking what to do next (/start, /next-step, /project-settings), or coordinating multi-discipline studio work (/team-combat, /team-assets, /team-ui, /team-level, /team-narrative, /team-prototype, /team-polish, /team-ship). Not for a single-engine API question (router) or writing a GDD alone (game-gdd-architect / game-docs).
---
# Game Studio Orchestrator

Master coordinator that combines Claude-Code-Game-Studios' (CCGS) studio process with the
awesome-gamedev-agent-skills (AGAS) router across 12 engines plus plain Web, agency-agents specialist personas and the pixelfx VFX library: 125 skills.
The default road is **make a playable game first**; the 3-tier studio (CCGS calls it
*studio mode*) is the heavier road for projects that need it.

## When to Use

- Starting a new game, onboarding an existing repository, or detecting stage and engine (`/start`, `/project-stage-detect`, `/setup-engine`, `/project-settings`)
- "Make me a game", "try this idea", "change the game you made", "grow it" - the one-shot road (`/prototype`)
- Asking what to do next or when stuck (`/next-step`)
- Coordinating multi-domain features in studio mode (`/team-combat`, `/team-assets`, `/team-narrative`, `/team-ui`, `/team-level`, `/team-prototype`, `/team-polish`, `/team-ship`)
- Deciding which engine, discipline, genre or workflow skill should handle a request

CCGS 1.3.0 renamed three commands because other AI tools reserve the old names:
`/help` is now `/next-step`, `/settings` is `/project-settings`, `/changelog` is
`/write-changelog`. Accept the old names, say the new name once, and run the new one.

## Steps

### 1. Fingerprint the Engine, its Version and the Project

Read `production/session-state/active.md` first, then `project.yaml`, then fingerprint files:

1. **Detect the engine (choose at most one active engine)**:
   - **Godot 4**: `project.godot` -> `03-engine-godot4` (`godot-gdscript`, `godot-nodes-scenes`, `godot-signals-groups`, `godot-2d-movement`, `godot-tilemap`, `godot-physics`, `godot-ui-control`, `godot-animation`, `godot-shaders`, `godot-3d-essentials`, `godot-resources`, `godot-audio`, `godot-multiplayer`, `godot-export`, `godot-csharp`, `godot-gdscript-headless-testing`, `godot-gameplay-scripter`, `godot-shader-developer`, `godot-multiplayer-engineer`)
   - **Unity**: `Assets/` + `ProjectSettings/ProjectVersion.txt` -> `04-engine-unity` (`unity-architect`, `unity-csharp-scripting`, `unity-input-system`, `unity-physics`, `unity-animation`, `unity-scriptableobjects`, `unity-tilemap-2d`, `unity-navmesh`, `unity-build-pipeline`, `unity-build-size`, `unity-shader-graph-artist`, `unity-multiplayer-engineer`, `unity-editor-tool-developer`)
   - **Unreal Engine 5**: `*.uproject` -> `05-engine-unreal5` (`unreal-systems-engineer`, `unreal-cpp-gameplay`, `unreal-blueprints`, `unreal-enhanced-input`, `unreal-behavior-trees`, `unreal-niagara`, `unreal-technical-artist`, `unreal-multiplayer-architect`, `unreal-world-builder`, `unreal-packaging`)
   - **Roblox**: `*.rbxl(x)` or `*.project.json` (Rojo) -> `06-engine-roblox` (`roblox-luau`, `roblox-systems-scripter`, `roblox-datastores`, `roblox-networking`, `roblox-ui`, `roblox-characters`, `roblox-physics`, `roblox-studio-workflow`, `roblox-simulator-economy`, `roblox-experience-designer`, `roblox-avatar-creator`)
   - **Web & other engines** (`09-web-and-other-engines`): `phaser-core`, `phaser-arcade-physics`, `pixijs-rendering`, `threejs-scene-setup`, `threejs-gltf-loading`, `threejs-materials-lighting`, `ebitengine-game` (`go.mod`), `bevy-ecs` (`Cargo.toml`), `pygame-core`, `love2d-core` (`conf.lua`), `defold-core` (`game.project`)
   - **Plain Web** (`engine.type: web`, or an `index.html` game with no framework): a valid engine since CCGS 1.3.0. Its starter is one of nothing extra, three.js, Phaser or PixiJS; route to the matching web skill only when a starter is used.
   - **No engine set**: do not ask for one first. The one-shot (step 2) builds a browser game, and `/setup-engine` becomes its handover's next step.
2. **Read the pinned version before proposing APIs** (AGAS router 2.0): `project.godot`, `ProjectVersion.txt`, `*.uproject`, lockfiles, `go.mod`. Older than the baseline in `docs/VERSION-SUPPORT.md` -> follow the skill's version notes. Newer -> say so, read the official release notes for the versions in between, and verify every API you use.
3. **Optional project keys** (`project.yaml`):
   - `engine.code_root` / `engine.test_root`: the project's own code and test folders when they are not the engine's usual ones (`.` is the root, for a flat web game). A value that cannot be used makes every code check report NOT ASSESSED with the reason; never fall back to the engine's folder.
   - `project.goal`: `jam | learn | hobby | portfolio | sell | early_access | publisher | mobile | other`. Guess it from what the user says, show it, and write it only when they say Save. `/cut` and the one-shot card read it.
4. **Determine rigor (`modes.rigor`)**: `minimal` (one-page brief, terse docs, solo review; the visual run check is still required), `standard` (5 GDD sections, lean review), `full` (8 GDD sections, 3-director review). Work rigor out from what the user describes and show it with the stage on one card with a single Save / Don't save question.
5. **Hand live-editor work to official vendor tools** when they are already in the session (Unity's skills or agent plugin, Roblox Studio MCP, Epic's tools, OpenAI's `game-studio` plugin for browser games): see the router's section 4. Never install a vendor plugin, skill or MCP server for the user, and never load both a vendor web skill and ours for the same subtask.

### 2. Default Road: Make a Game First (`/prototype`)

For "make me a game", a new idea, or a project with design docs and nothing to play, run the
one-shot. **Read `references/one-shot-flow.md` and follow it.** In short:

1. One round of at most ~8 questions picked for the genre (usual answer shown, so "you pick" works). A vague idea gets 2-3 one-line pitches first.
2. Write `design/game-brief.md` from `docs/templates/game-brief-template.md`; keep the user's words verbatim under **In your words**; mark every field you filled as *(guessed)*, *(inferred)* or *(provisional)*.
3. On "Build it", build a browser game in `prototypes/<name>/` that opens with a double-click: every tuning value in `config.js`, every figure drawn (no emoji art), no copy of a named game, not trivially easy.
4. Run a short scripted check (headless browser key presses, no console errors, one screenshot compared against the brief), fix layout/freeze problems in one round, and hand over a card that ends "Not yet played by a person". Offer a commit and the tag `one-shot/<name>`.
5. After play: change it by asking (each change checked against the brief's Keep / Avoid / Out of scope, one commit per accepted change, "iteration N: <what>"), or grow it into a Vite + TypeScript project (tag `grown/<name>`) and add one feature a sitting.

With an engine already set, `/prototype` keeps the throwaway engine or paper prototype (one
question, capped at a day) and offers the browser sketch as one option, not recommended.

### 3. Studio Mode: the 3-Tier Hierarchy & Composition Order

Use studio mode when the project needs it: a team, `project.goal` of `sell`, `early_access` or
`publisher`, `standard`/`full` rigor, or a grown game past about nine stories or Features
(`/next-step` suggests it once). Operate as the **Tier 1 Director Council** (`Creative Director`,
`Technical Director`, `Producer`, `Master Router Director`) and compose skills in strict order:

`Engine Fundamentals -> Cross-Engine Discipline -> Genre Blueprint -> Studio & Shipping Workflow`

- **Engine Skill** owns concrete API syntax, node/component lifecycles, and import/export settings.
- **Discipline Skill** owns portable algorithms and pipelines (`create-game-assets`, `game-ai`, `ai-behavior-trees-utility-ai`, `procedural-gen`, `dialogue-systems`, `save-systems`, `audio-design`, `shader-programming`, `physics-tuning`, `level-design`, `input-systems`, `game-feel`, `camera-systems`, `game-ui-ux`, `performance-optimization`, and `pixelfx` for code-drawn pixel art VFX).
- **Genre Blueprint** owns structural glue across systems (`platformer`, `roguelike`, `rpg`, `fps-shooter`, `tower-defense`, `card-game`, `visual-novel`, `survival-crafting`, `puzzle`).
- **Workflow Skill** owns studio process and store delivery (`game-gdd-architect`, `game-docs`, `game-production-scrum`, `game-qa-playtest`, `game-release-liveops`, `game-jam`, `prototype-fast`, `steam-publish`, `itch-publish`).

### 4. Execute Cross-Functional Strike Teams (`/team-*`)

- **Team Combat (`/team-combat`)**: `game-gdd-architect` + `game-systems-ai-programmer` + `ai-behavior-trees-utility-ai` + Engine Scripter + `game-feel` + `camera-systems` + `generate2dsprite`/`video2dsprite` + `pixelfx` (hits, moves, status effects, with wind-up and hit-stop timing) + `game-qa-playtest` + `evidence-collector`.
- **Team Assets (`/team-assets`)**: `create-game-assets` + `generate2dsprite` + `video2dsprite` + `generate2dmap` + `pixelfx` (VFX sheets) + `image-prompt-engineer` + Engine Importer + `game-qa-playtest` (lock `art-direction-brief.md` and `asset-manifest.json`, approve one visual target, produce asset families, run raster QA, verify in-game).
- **Team UI (`/team-ui`)**: `ui-designer` + `game-ui-ux` + `input-systems` + Engine UI Skill (`godot-ui-control` / `roblox-ui`) + `accessibility-auditor` + `ux-researcher` + `game-qa-playtest`.
- **Team Level (`/team-level`)**: `level-designer` + `level-design` + `procedural-gen` + `generate2dmap` + Engine Tilemap/World Skill (`godot-tilemap` / `unity-tilemap-2d` / `unreal-world-builder`).
- **Team Narrative (`/team-narrative`)**: `narrative-designer` + `dialogue-systems` + `visual-novel` + `game-gdd-architect` + `game-release-liveops` (`/localize`).
- **Team Prototype & Jam (`/team-prototype`, `/team-jam`)**: the one-shot road (step 2) + `prototype-fast` + `game-jam` + Genre Blueprint + `input-systems` + `game-feel`.
- **Team Polish & Ship (`/team-polish`, `/team-ship`)**: `performance-optimization` + `game-feel` + `pixelfx` + `audio-design` + `godot-gdscript-headless-testing` + `steam-publish` / `itch-publish` + `unity-build-size` + `game-release-liveops`; `reality-checker` before a gate or store submission; finish with `/cut` (see `game-production-scrum`).

Since CCGS 1.3.0, `/design-system`, `/art-bible` (except its art-director sections),
`/architecture-review` and `/code-review` do their specialists' work in the conversation under
each specialist's lens instead of spawning one agent per specialist. Spawn parallel subagents
only for genuinely independent departments, each with a self-contained brief, then synthesize
through a Director review before writing final files.

### 5. Enforce the Collaborative Protocol

Unless the user explicitly asks for autonomous execution:

1. **Question**: Clarify missing pillars, target platform, goal or rigor preference.
2. **Options**: Present 2-4 concrete options with pros and cons.
3. **Decision**: Let the user pick.
4. **Draft & Approve**: Present the specification or code plan and confirm before overwriting core architecture or GDD files.

Ask with the question tool; without one, list numbered options and end the turn. A skipped or
dismissed question is not an answer.

## Gotchas

- Never bulk-load all 125 skills; load only the detected engine skill plus the 1-3 matching discipline/genre/workflow skills for the active task.
- Never run `/setup-engine` inside a one-shot, and never offer to move a one-shot made before an engine was set onto that engine.
- Read design docs over ~40 KB (`design/`, `docs/architecture/`, `production/session-state/`) by section, never as one whole-file read.
- No agent files, opens or comments on an issue or pull request in an engine, plugin or vendor repository, even when asked; write a draft for the user to submit.
- Never let UI scripts own or mutate core gameplay state; enforce signal/event-bus decoupling across all delegated tasks.
- A story that changes player-visible visuals, assets or UI is never complete from a syntax check or raw prompt output alone; require in-engine (or in-browser) visual verification via `create-game-assets` and `game-qa-playtest`.
