# Upstream sync

This hub merges four upstream repositories. This page records which commit of each was synced,
what the hub changed on top, and how to sync again.

<!-- agas-commit: c6ca6c41c839b68319ffc08430b99ab768debc32 -->
<!-- ccgs-commit: abc0de79d6ceb0b5d7aa693945849b3937afbe6a -->
<!-- ccgs-version: 1.3.0 -->
<!-- agency-commit: 8ae6164602c95ca78828b148b9052460ee426885 -->
<!-- pixelfx-commit: 5294518ce7c72e48b6100a744596e0acf57f2826 -->

| Upstream | Synced release | Commit | Synced on | License |
|----------|----------------|--------|-----------|---------|
| [gamedev-skills/awesome-gamedev-agent-skills](https://github.com/gamedev-skills/awesome-gamedev-agent-skills) (AGAS) | v2.0.0 (2026-11-11) + README commits to 2026-11-12 | `c6ca6c4` | 2026-11-14 | Apache-2.0 |
| [Donchitos/Claude-Code-Game-Studios](https://github.com/Donchitos/Claude-Code-Game-Studios) (CCGS) | v1.3.0 (2026-11-09) | `abc0de7` | 2026-11-14 | MIT |
| [msitarzewski/agency-agents](https://github.com/msitarzewski/agency-agents) | main (2026-11-08) | `8ae6164` | 2026-11-14 | MIT (Copyright (c) 2025 AgentLand Contributors) |
| [patch-gg/pixelfx](https://github.com/patch-gg/pixelfx) | v0.3.1 (2026-11-12) | `5294518` | 2026-11-14 | MIT (Patch, Hugo Duprez; Hollow Crown notice; the Patch Pixel font is not MIT) |

Previous AGAS snapshot: `19d93f9` (2026-10-28, the Roblox simulator-economy merge). Before this
sync every one of the 78 AGAS skill folders in the hub was byte-identical to that commit, so the
update replaced them without losing hub edits.

## How to check for updates

```bash
python3 scripts/check-upstream.py              # report only
python3 scripts/check-upstream.py --apply-agas # also update unedited AGAS skill copies
python3 scripts/check-upstream.py --apply-blocks # also refresh unedited agency/pixelfx blocks
python3 scripts/validate-skills.py             # then validate the hub
```

`check-upstream.py` never overwrites an AGAS skill, or an agency/pixelfx block, that the hub
edited locally; it reports it as "CHANGED + LOCAL EDITS". For agency and pixelfx it refreshes only
the text between the `<!-- agency:start/end -->` or `<!-- pixelfx:start/end -->` markers and the
`@ <commit>` in the skill's Source comment; the hub's frontmatter, notes and Gotchas stay. After applying, update the commit markers above, the skill lists below,
and the counts in `CLAUDE.md`, `README.md`, `init-game-project.sh` and
`skills/00-orchestration-and-workflows/game-studio-orchestrator/SKILL.md`.

## AGAS: skills synced verbatim (80, router included)

These folders are exact copies of upstream `skills/<category>/<name>/` (and `router/`). Do not
edit them in the hub; change them upstream or record the edit here.

<!-- agas-skills:start -->
| Hub category | Skills |
|--------------|--------|
| `00-orchestration-and-workflows` | `router`, `game-docs`, `game-jam`, `prototype-fast`, `steam-publish`, `itch-publish` |
| `01-design-and-narrative` | `ai-behavior-trees-utility-ai`, `camera-systems`, `dialogue-systems`, `game-ai`, `game-feel`, `input-systems`, `level-design`, `physics-tuning`, `procedural-gen`, `save-systems` |
| `02-art-animation-ui-audio` | `audio-design`, `create-game-assets`, `game-ui-ux`, `shader-programming` |
| `03-engine-godot4` | `godot-2d-movement`, `godot-3d-essentials`, `godot-animation`, `godot-audio`, `godot-csharp`, `godot-export`, `godot-gdscript`, `godot-gdscript-headless-testing`, `godot-multiplayer`, `godot-nodes-scenes`, `godot-physics`, `godot-resources`, `godot-shaders`, `godot-signals-groups`, `godot-tilemap`, `godot-ui-control` |
| `04-engine-unity` | `unity-animation`, `unity-build-pipeline`, `unity-build-size`, `unity-csharp-scripting`, `unity-input-system`, `unity-navmesh`, `unity-physics`, `unity-scriptableobjects`, `unity-tilemap-2d` |
| `05-engine-unreal5` | `unreal-behavior-trees`, `unreal-blueprints`, `unreal-cpp-gameplay`, `unreal-enhanced-input`, `unreal-niagara`, `unreal-packaging` |
| `06-engine-roblox` | `roblox-characters`, `roblox-datastores`, `roblox-luau`, `roblox-networking`, `roblox-physics`, `roblox-simulator-economy`, `roblox-studio-workflow`, `roblox-ui` |
| `07-quality-backend-publishing` | `performance-optimization` |
| `08-genres-blueprints` | `card-game`, `fps-shooter`, `platformer`, `puzzle`, `roguelike`, `rpg`, `survival-crafting`, `tower-defense`, `visual-novel` |
| `09-web-and-other-engines` | `bevy-ecs`, `defold-core`, `ebitengine-game`, `love2d-core`, `phaser-arcade-physics`, `phaser-core`, `pixijs-rendering`, `pygame-core`, `threejs-gltf-loading`, `threejs-materials-lighting`, `threejs-scene-setup` |
<!-- agas-skills:end -->

Upstream-to-hub category map: `workflows` → 00, `disciplines` → 01/02/07 by topic, `godot` → 03,
`unity` → 04, `unreal` → 05, Roblox skills in `other-engines` → 06, `genres` → 08, `web-engines`,
`ebitengine` and the other `other-engines` → 09.

### What AGAS 2.0.0 brought (this sync)

- Every skill rewritten to Anthropic's skill-authoring guidance: a `Not for` clause naming the
  neighbouring skill, one `## Gotchas` section, a final check the agent runs itself, dated
  `## Version notes`, shorter descriptions that fit agents' listing budgets.
- Clear ownership where two skills both claimed a request (behavior trees, coyote time, Unity 2D
  physics, procgen vs roguelike vs card games, RPG vs survival inventory, Roblox replication).
- Router: reads the pinned engine version first, warns when a project is newer than the
  baseline, hands live-editor work to official vendor tools (Unity, Roblox, Epic, OpenAI
  `game-studio`) when already installed.
- Baselines verified 2026-11-11: Godot 4.7.2, Unity 6.3 LTS, UE 5.8, Phaser 4.2.1,
  PixiJS 8.22.0, three.js r187, Bevy 0.20.1, Defold 1.14.1, Ebitengine 2.10.6, LÖVE 11.5,
  pygame-ce 2.5.8 (`docs/VERSION-SUPPORT.md`).
- New check tools: five headless GDScript check runners (in `godot-gdscript`,
  `godot-2d-movement`, `godot-3d-essentials`, `godot-animation`, `godot-audio`), a jump tuner in
  `platformer`, a wave-curve checker in `tower-defense`.
- New skills: `game-docs` and `unity-build-size`.
- Trigger evals (`evals/triggers.json`, 366 prompts) and `scripts/run-trigger-evals.py`.

### Hub changes to AGAS infrastructure

- `scripts/validate-skills.py`: upstream validator plus a hub-layout block. The router lives in
  `skills/00-orchestration-and-workflows/router/`, there is no `.claude-plugin/marketplace.json`,
  the README/CLAUDE.md total counts the router, and every AGAS skill listed above must be routed.
- `docs/COMPATIBILITY.md`, `docs/INSTALLATION.md`, `docs/SKILL-FORMAT.md`: upstream text; links to
  `../router` point at the hub router, links to upstream-only files (`marketplace.json`,
  `CONTRIBUTING.md`) point at the upstream commit on GitHub. The install commands in these docs
  install the upstream pack, not this hub; the hub installs with `init-game-project.sh`.
- `scripts/run-trigger-evals.py --check` reports the 38 hub-only skills as having no eval
  prompts; that is expected, since `evals/triggers.json` covers AGAS skills only.
- Not copied: upstream `tests/` (they import upstream paths), `CONTRIBUTING.md`, `NOTICE`,
  `.claude-plugin/`, `.github/`, sponsor images.

## CCGS: hub skills derived from it (6)

CCGS is a full `.claude/` framework (78 skills, 49 agents, hooks, helper scripts). The hub does
not vendor it; it condenses its workflows into six skills and the agents in `agents/`:
`game-studio-orchestrator` (with `references/one-shot-flow.md`), `game-gdd-architect`,
`game-production-scrum`, `game-qa-playtest`, `game-release-liveops`, `game-systems-ai-programmer`.

### What was merged from CCGS 1.2.0 and 1.3.0 (this sync)

| CCGS change | Where it lives in the hub |
|-------------|---------------------------|
| "Make me a game": `/prototype` questions → one-page brief → browser one-shot → small check → handover → change after play → grow (1.3.0) | `game-studio-orchestrator` step 2 + `references/one-shot-flow.md`; `agents/tier3-teams/team-prototype-jam.md` |
| New brief template (In your words, Look and references, First minute, Challenge, Your systems, Keep, Avoid) (1.3.0) | `templates/game-brief-template.md` (adapted, MIT attribution); `game-gdd-architect` |
| `/cut`: cuts, polish list, target date and feature freeze (1.3.0) | `game-production-scrum` step 6; `agents/tier1-directors/producer.md` |
| Web as an engine; `engine.code_root` / `engine.test_root`; `project.goal` (1.3.0) | `project.template.yaml`, `init-game-project.sh`, `game-studio-orchestrator`, `CLAUDE.md` |
| Renames `/help` → `/next-step`, `/settings` → `/project-settings`, `/changelog` → `/write-changelog` (1.3.0) | `game-studio-orchestrator`, `game-release-liveops`, agents |
| Four skills do their specialists' work under lenses instead of spawning agents (1.3.0) | `game-gdd-architect` step 3, `game-studio-orchestrator` step 4 |
| `/create-stories` from the brief's systems; story-done ticks Features, lists AI decisions, DEFERRED playtest checks (1.3.0) | `game-production-scrum`, `templates/story-template.md` |
| Story `## Files`, ADR status blocking, evidence `stamp.txt`, `Reviewed by` line, sprint Goal Prerequisites (1.2.0) | `game-production-scrum`, `game-qa-playtest`, `templates/story-template.md`, `rules/gdd-and-story-rules.md` |
| Read guard for docs over 40 KB; registry IDs never reused (1.2.0) | `rules/gdd-and-story-rules.md`, `game-gdd-architect` |
| Scene-file rules (`uid://`, Unity YAML, `.uasset`/`.umap`); agents never file upstream (1.2.0) | `rules/core-and-ai-rules.md`, `game-systems-ai-programmer`, `game-qa-playtest` |

Not merged (CCGS-framework specific): hooks and `settings.json` rules, the 69 genre sheets in
`.claude/genres/`, helper shell scripts (`one-shot-*.sh`, `cut-*.sh`, `itch-zip.sh`, ...), the
update-notice hook, and Windows hook forms. The hub's skills describe those steps so they work
with the session's own tools.

## agency-agents: specialist skills (34)

Each of these skills keeps the hub's own frontmatter (a description with a `Not for` clause naming
the neighbouring skill), embeds the upstream agent text verbatim between
`<!-- agency:start -->` and `<!-- agency:end -->`, and ends with hub Gotchas: the AGAS engine skill
and `docs/VERSION-SUPPORT.md` win on API and version details, gameplay numbers go to data files,
the Look Rule, persona "memory" is `production/session-state/active.md`, and outward-facing
marketing needs the user's yes. Upstream frontmatter (`color`, `emoji`, `vibe`, `tools`) is dropped.

| Hub category | Skill ← agency-agents file |
|--------------|----------------------------|
| `01-design-and-narrative` | `game-designer`, `economy-designer`, `level-designer`, `narrative-designer` ← `game-development/*.md` (`narrative-designer` also keeps the hub's story-to-game adaptation and rewrite workflows after the block) |
| `02-art-animation-ui-audio` | `technical-artist`, `game-audio-engineer` ← `game-development/`; `blender-addon-engineer` ← `game-development/blender/`; `ui-designer`, `ux-researcher`, `image-prompt-engineer` ← `design/design-*.md` |
| `03-engine-godot4` | `godot-gameplay-scripter`, `godot-shader-developer`, `godot-multiplayer-engineer` ← `game-development/godot/` |
| `04-engine-unity` | `unity-architect`, `unity-shader-graph-artist`, `unity-multiplayer-engineer`, `unity-editor-tool-developer` ← `game-development/unity/` |
| `05-engine-unreal5` | `unreal-systems-engineer`, `unreal-technical-artist`, `unreal-multiplayer-architect`, `unreal-world-builder` ← `game-development/unreal-engine/` |
| `06-engine-roblox` | `roblox-systems-scripter`, `roblox-experience-designer`, `roblox-avatar-creator` ← `game-development/roblox-studio/` |
| `07-quality-backend-publishing` | `backend-architect`, `code-reviewer`, `frontend-developer` ← `engineering/engineering-*.md`; `content-creator`, `growth-hacker`, `seo-specialist` ← `marketing/marketing-*.md`; `accessibility-auditor`, `evidence-collector`, `reality-checker` ← `testing/testing-*.md`; `feedback-synthesizer` ← `product/product-feedback-synthesizer.md` |

Before 2026-11-14 the 28 older ones were 14-29-line summaries of these agents (53-385 lines
upstream) and missed their rules, examples, deliverables and the 2026-10-18 correctness fixes.
The six new ones (`accessibility-auditor`, `evidence-collector`, `reality-checker`,
`feedback-synthesizer`, `ux-researcher`, `image-prompt-engineer`) were added the same day.
The testing agents were written for websites; their Gotchas map the upstream commands
(`./qa-playwright-capture.sh`, `resources/views/`) to game evidence under `production/qa/evidence/`.

Considered and not added (2026-11-14): `marketing-app-store-optimizer`,
`marketing-reddit-community-builder`, `marketing-developer-community-builder`,
`xr-immersive-developer`. `check-upstream.py` lists any new `game-development/` agent upstream.

## pixelfx: `02-art-animation-ui-audio/pixelfx`

The hub skill embeds sections 1-4 of upstream `skills/pixelfx/SKILL.md` between
`<!-- pixelfx:start -->` and `<!-- pixelfx:end -->`. Hub changes: frontmatter reduced to `name` and
`description` (with a `Not for` clause); "Before anything" clones the library at the pinned commit
into a gitignored `.pixelfx/` folder in the game project instead of vendoring it into the hub (the
checkout is about 15 MB, 12 MB of it README media); upstream section 5 "Publish it on Patch" (it
installs a global CLI with `curl | sh`) is left out in favour of `itch-publish` / `steam-publish`;
"In this studio" ties output to `asset-manifest.json`, data-driven options, hit-stop ownership and
the strike teams; Gotchas cover pooling, import filtering, licensing and the non-MIT font.
The library's Node tools were read but not executed during this integration; the first real use
should render one effect (`node tools/render.mjs fire/torch`) and look at the contact sheet.

`generate2dsprite`, `video2dsprite`, `generate2dmap` and `codeart2d` come from none of these repos;
their source is still unrecorded.

## Other credited sources

Some AGAS skills credit further projects inside their own text (for example `hajimehoshi/ebiten`,
`majidmanzarpour/threejs-game-skills`, `higgsfield-ai/skills`). Those are references of the
upstream skills, not separate hub sources, and are not tracked here.

`graphify-out/` is a generated code-graph cache from an earlier snapshot; regenerate it with
graphify after a sync if you use it.
