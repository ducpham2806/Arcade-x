---
name: game-studio-orchestrator
description: Master game studio orchestrator and cross-engine skill router combining Claude-Code-Game-Studios and awesome-gamedev-agent-skills (116 skills across 12 engines, 15 disciplines, 9 genres, and 8 workflows). Coordinates the 3-tier studio hierarchy (Directors, Department Leads, Specialists), fingerprints the game engine, manages rigor modes (minimal, standard, full), and routes or delegates tasks to specialized game skills and subagents across design, code, art, assets, audio, QA, sprint production, and publishing. Use whenever starting a game project, planning multi-disciplinary game features, running studio slash workflows (/start, /team-combat, /team-assets, /team-ui, /team-level, /team-narrative, /team-prototype, /team-polish, /team-ship), or coordinating multiple game skills.
---
# Game Studio Orchestrator

Master coordinator and cross-engine dispatcher that combines a 3-tier game studio hierarchy (Directors, Department Leads, and Specialists) with deterministic engine fingerprinting across 12 game engines and 116 specialized skills.

## When to Use

- Starting a new game project, onboarding an existing game repository, or detecting project stage and engine (`/start`, `/project-stage-detect`, `/setup-engine`, `/settings`)
- Coordinating multi-domain features that span game design, programming, art direction, asset production, UI, audio, and QA (`/team-combat`, `/team-assets`, `/team-narrative`, `/team-ui`, `/team-level`, `/team-prototype`, `/team-polish`, `/team-ship`)
- Deciding which specialized engine, discipline, genre, or workflow skill should handle a user request
- Enforcing studio quality gates, rigor modes (`minimal`, `standard`, `full`), and collaborative design reviews

## Steps

### 1. Fingerprint the Engine and Assess Project Stage

Check the project root for `project.yaml`, `production/session-state/active.md`, and engine fingerprint files:

1. **Detect Engine (choose at most one active engine)**:
   - **Godot 4**: `project.godot` -> route to `03-engine-godot4` (`godot-gdscript`, `godot-nodes-scenes`, `godot-signals-groups`, `godot-2d-movement`, `godot-tilemap`, `godot-physics`, `godot-ui-control`, `godot-animation`, `godot-shaders`, `godot-3d-essentials`, `godot-resources`, `godot-audio`, `godot-multiplayer`, `godot-export`, `godot-csharp`, `godot-gdscript-headless-testing`, `godot-gameplay-scripter`, `godot-shader-developer`, `godot-multiplayer-engineer`)
   - **Unity**: `Assets/` + `ProjectSettings/ProjectVersion.txt` -> route to `04-engine-unity` (`unity-architect`, `unity-csharp-scripting`, `unity-input-system`, `unity-physics`, `unity-animation`, `unity-scriptableobjects`, `unity-tilemap-2d`, `unity-navmesh`, `unity-build-pipeline`, `unity-shader-graph-artist`, `unity-multiplayer-engineer`, `unity-editor-tool-developer`)
   - **Unreal Engine 5**: `*.uproject` -> route to `05-engine-unreal5` (`unreal-systems-engineer`, `unreal-cpp-gameplay`, `unreal-blueprints`, `unreal-enhanced-input`, `unreal-behavior-trees`, `unreal-niagara`, `unreal-technical-artist`, `unreal-multiplayer-architect`, `unreal-world-builder`, `unreal-packaging`)
   - **Roblox**: `*.rbxl(x)` or `*.project.json` (Rojo) -> route to `06-engine-roblox` (`roblox-luau`, `roblox-systems-scripter`, `roblox-datastores`, `roblox-networking`, `roblox-ui`, `roblox-characters`, `roblox-physics`, `roblox-studio-workflow`, `roblox-simulator-economy`, `roblox-experience-designer`, `roblox-avatar-creator`)
   - **Web & Other Engines** (`09-web-and-other-engines`): `phaser-core`, `phaser-arcade-physics`, `pixijs-rendering`, `threejs-scene-setup`, `threejs-gltf-loading`, `threejs-materials-lighting`, `ebitengine-game` (`go.mod`), `bevy-ecs` (`Cargo.toml`), `pygame-core` (`*.py`), `love2d-core` (`conf.lua`), `defold-core` (`game.project`)
2. **Determine Rigor Mode (`modes.rigor`)**:
   - `minimal` (default for solo/jam speed): 1-page brief, terse docs, minimal QA evidence (visual run check still required for player-facing changes), solo review.
   - `standard`: 5 required GDD sections, balanced doc depth, standard QA evidence, lean review.
   - `full`: All 8 GDD sections, thorough docs, full QA evidence on every story type, full 3-director review (`creative-director`, `technical-director`, `producer`).
3. **Checkpoint State**: Maintain `production/session-state/active.md` as the persistent memory checkpoint tracking current stage, active epic/story, and approved decisions.

### 2. Apply the 3-Tier Studio Hierarchy & Composition Order

Operate as the **Tier 1 Director Council** (`Creative Director`, `Technical Director`, `Producer`, `Master Router Director`) and compose skills in strict order:

`Engine Fundamentals -> Cross-Engine Discipline -> Genre Blueprint -> Studio & Shipping Workflow`

- **Engine Skill** owns concrete API syntax, node/component lifecycles, and import/export settings.
- **Discipline Skill** owns portable algorithms and production pipelines (`create-game-assets`, `game-ai`, `ai-behavior-trees-utility-ai`, `procedural-gen`, `dialogue-systems`, `save-systems`, `audio-design`, `shader-programming`, `physics-tuning`, `level-design`, `input-systems`, `game-feel`, `camera-systems`, `game-ui-ux`, `performance-optimization`).
- **Genre Blueprint** owns structural glue across systems (`platformer`, `roguelike`, `rpg`, `fps-shooter`, `tower-defense`, `card-game`, `visual-novel`, `survival-crafting`, `puzzle`).
- **Workflow Skill** owns studio process and store delivery (`game-gdd-architect`, `game-production-scrum`, `game-qa-playtest`, `game-release-liveops`, `game-jam`, `prototype-fast`, `steam-publish`, `itch-publish`).

### 3. Execute Cross-Functional Strike Teams (`/team-*`)

When the user requests a multi-disciplinary feature, coordinate the matching strike team:

- **Team Combat (`/team-combat`)**: `game-gdd-architect` + `game-systems-ai-programmer` + `ai-behavior-trees-utility-ai` + Engine Scripter + `game-feel` + `camera-systems` + `generate2dsprite`/`video2dsprite` + `game-qa-playtest`.
- **Team Assets (`/team-assets`)**: `create-game-assets` + `generate2dsprite` + `video2dsprite` + `generate2dmap` + Engine Tilemap/Importer Skill + `game-qa-playtest` (lock `art-direction-brief.md` and `asset-manifest.json`, approve 1 visual target, produce asset families, run deterministic raster QA, and verify in-game).
- **Team UI (`/team-ui`)**: `ui-designer` + `game-ui-ux` + `input-systems` + Engine UI Skill (`godot-ui-control` / `roblox-ui`) + `game-qa-playtest`.
- **Team Level (`/team-level`)**: `level-designer` + `level-design` + `procedural-gen` + `generate2dmap` + Engine Tilemap/World Skill (`godot-tilemap` / `unity-tilemap-2d` / `unreal-world-builder`).
- **Team Narrative (`/team-narrative`)**: `narrative-designer` + `dialogue-systems` + `visual-novel` + `game-gdd-architect` + `game-release-liveops` (`/localize`).
- **Team Prototype & Jam (`/team-prototype`, `/team-jam`)**: `prototype-fast` + `game-jam` + Genre Blueprint + `input-systems` + `game-feel`.
- **Team Polish & Ship (`/team-polish`, `/team-ship`)**: `performance-optimization` + `game-feel` + `audio-design` + `godot-gdscript-headless-testing` + `steam-publish` / `itch-publish` + `game-release-liveops`.

For complex multi-domain requests, spawn parallel subagents using `invoke_subagent` with self-contained briefs for each department, then synthesize their outputs through a Director review before writing final files.

### 4. Enforce the Collaborative Protocol

Follow the studio collaboration cycle unless the user explicitly asks for autonomous (`yolo`) execution:

1. **Question**: Clarify missing design pillars, target platform, or rigor preference.
2. **Options**: Present 2-4 concrete architectural or design options with pros and cons.
3. **Decision**: Let the user pick the direction.
4. **Draft & Approve**: Present the structured specification or code plan and confirm before overwriting core architecture or GDD files.

## Gotchas

- Never bulk-load all 116 skills into context; use progressive disclosure to load only the detected engine skill plus the 1-3 matching discipline/genre/workflow skills for the active task.
- Never allow UI scripts to own or mutate core gameplay state directly; enforce signal/event-bus decoupling across all delegated tasks.
- A story that changes player-visible visuals, assets, or UI is never complete from a syntax parse check or raw prompt output alone; require deterministic normalization and in-engine visual verification via `create-game-assets` and `game-qa-playtest`.
