# Chỉ mục Game Studio — nạp theo nhiệm vụ

Cài đầy đủ, không nạp tất cả vào ngữ cảnh. [Cách tích hợp](INSTALLATION.md); [manifest nguồn](SOURCE-MANIFEST.md) chỉ khi kiểm nguồn/cập nhật. ArcadeX dùng engine web riêng theo [project.md](../../project.md), không chọn Godot/Unity chỉ vì có skill.

## Đường đọc ngắn

| Công việc | Skill nên đọc trước |
|---|---|
| Plan/task/đóng việc | game-production-scrum; quy trình local WORKFLOW ưu tiên |
| Chọn chuyên môn chưa rõ | router; orchestrator chỉ khi cần phối hợp nhiều mảng |
| QA/nghiệm thu | game-qa-playtest |
| Lưu/account/backend | save-systems; backend-architect khi cần |
| UI/touch | game-ui-ux + input-systems |
| Art/animation/audio | create-game-assets; chọn đúng generate2dsprite/game-audio-engineer khi cần |
| Gameplay/AI/màn chơi | game-feel/game-ai/level-design theo phần sửa |
| Hiệu năng/phát hành | performance-optimization/game-release-liveops |

Mở `.agents/game-studio/skills/<tên>/SKILL.md`; mỗi task thường 1–3 skill. Reference/scripts chỉ mở/chạy khi nhiệm vụ cần. 21 vai trò tại `.agents/game-studio/agents/`; là playbook, không tự spawn. Khi dùng đường dẫn nhóm cũ từ upstream, tra tên tương ứng trong danh mục dưới.

## Danh mục đầy đủ — chỉ tra nhóm cần dùng

### 00-orchestration-and-workflows (11)

[game-gdd-architect](../../.agents/game-studio/skills/game-gdd-architect/SKILL.md), [game-jam](../../.agents/game-studio/skills/game-jam/SKILL.md), [game-production-scrum](../../.agents/game-studio/skills/game-production-scrum/SKILL.md), [game-qa-playtest](../../.agents/game-studio/skills/game-qa-playtest/SKILL.md), [game-release-liveops](../../.agents/game-studio/skills/game-release-liveops/SKILL.md), [game-studio-orchestrator](../../.agents/game-studio/skills/game-studio-orchestrator/SKILL.md), [game-systems-ai-programmer](../../.agents/game-studio/skills/game-systems-ai-programmer/SKILL.md), [itch-publish](../../.agents/game-studio/skills/itch-publish/SKILL.md), [prototype-fast](../../.agents/game-studio/skills/prototype-fast/SKILL.md), [router](../../.agents/game-studio/skills/router/SKILL.md), [steam-publish](../../.agents/game-studio/skills/steam-publish/SKILL.md).

### 01-design-and-narrative (14)

[ai-behavior-trees-utility-ai](../../.agents/game-studio/skills/ai-behavior-trees-utility-ai/SKILL.md), [camera-systems](../../.agents/game-studio/skills/camera-systems/SKILL.md), [dialogue-systems](../../.agents/game-studio/skills/dialogue-systems/SKILL.md), [economy-designer](../../.agents/game-studio/skills/economy-designer/SKILL.md), [game-ai](../../.agents/game-studio/skills/game-ai/SKILL.md), [game-designer](../../.agents/game-studio/skills/game-designer/SKILL.md), [game-feel](../../.agents/game-studio/skills/game-feel/SKILL.md), [input-systems](../../.agents/game-studio/skills/input-systems/SKILL.md), [level-design](../../.agents/game-studio/skills/level-design/SKILL.md), [level-designer](../../.agents/game-studio/skills/level-designer/SKILL.md), [narrative-designer](../../.agents/game-studio/skills/narrative-designer/SKILL.md), [physics-tuning](../../.agents/game-studio/skills/physics-tuning/SKILL.md), [procedural-gen](../../.agents/game-studio/skills/procedural-gen/SKILL.md), [save-systems](../../.agents/game-studio/skills/save-systems/SKILL.md).

### 02-art-animation-ui-audio (12)

[audio-design](../../.agents/game-studio/skills/audio-design/SKILL.md), [blender-addon-engineer](../../.agents/game-studio/skills/blender-addon-engineer/SKILL.md), [codeart2d](../../.agents/game-studio/skills/codeart2d/SKILL.md), [create-game-assets](../../.agents/game-studio/skills/create-game-assets/SKILL.md), [game-audio-engineer](../../.agents/game-studio/skills/game-audio-engineer/SKILL.md), [game-ui-ux](../../.agents/game-studio/skills/game-ui-ux/SKILL.md), [generate2dmap](../../.agents/game-studio/skills/generate2dmap/SKILL.md), [generate2dsprite](../../.agents/game-studio/skills/generate2dsprite/SKILL.md), [shader-programming](../../.agents/game-studio/skills/shader-programming/SKILL.md), [technical-artist](../../.agents/game-studio/skills/technical-artist/SKILL.md), [ui-designer](../../.agents/game-studio/skills/ui-designer/SKILL.md), [video2dsprite](../../.agents/game-studio/skills/video2dsprite/SKILL.md).

### 03-engine-godot4 (19)

[godot-2d-movement](../../.agents/game-studio/skills/godot-2d-movement/SKILL.md), [godot-3d-essentials](../../.agents/game-studio/skills/godot-3d-essentials/SKILL.md), [godot-animation](../../.agents/game-studio/skills/godot-animation/SKILL.md), [godot-audio](../../.agents/game-studio/skills/godot-audio/SKILL.md), [godot-csharp](../../.agents/game-studio/skills/godot-csharp/SKILL.md), [godot-export](../../.agents/game-studio/skills/godot-export/SKILL.md), [godot-gameplay-scripter](../../.agents/game-studio/skills/godot-gameplay-scripter/SKILL.md), [godot-gdscript](../../.agents/game-studio/skills/godot-gdscript/SKILL.md), [godot-gdscript-headless-testing](../../.agents/game-studio/skills/godot-gdscript-headless-testing/SKILL.md), [godot-multiplayer](../../.agents/game-studio/skills/godot-multiplayer/SKILL.md), [godot-multiplayer-engineer](../../.agents/game-studio/skills/godot-multiplayer-engineer/SKILL.md), [godot-nodes-scenes](../../.agents/game-studio/skills/godot-nodes-scenes/SKILL.md), [godot-physics](../../.agents/game-studio/skills/godot-physics/SKILL.md), [godot-resources](../../.agents/game-studio/skills/godot-resources/SKILL.md), [godot-shader-developer](../../.agents/game-studio/skills/godot-shader-developer/SKILL.md), [godot-shaders](../../.agents/game-studio/skills/godot-shaders/SKILL.md), [godot-signals-groups](../../.agents/game-studio/skills/godot-signals-groups/SKILL.md), [godot-tilemap](../../.agents/game-studio/skills/godot-tilemap/SKILL.md), [godot-ui-control](../../.agents/game-studio/skills/godot-ui-control/SKILL.md).

### 04-engine-unity (12)

[unity-animation](../../.agents/game-studio/skills/unity-animation/SKILL.md), [unity-architect](../../.agents/game-studio/skills/unity-architect/SKILL.md), [unity-build-pipeline](../../.agents/game-studio/skills/unity-build-pipeline/SKILL.md), [unity-csharp-scripting](../../.agents/game-studio/skills/unity-csharp-scripting/SKILL.md), [unity-editor-tool-developer](../../.agents/game-studio/skills/unity-editor-tool-developer/SKILL.md), [unity-input-system](../../.agents/game-studio/skills/unity-input-system/SKILL.md), [unity-multiplayer-engineer](../../.agents/game-studio/skills/unity-multiplayer-engineer/SKILL.md), [unity-navmesh](../../.agents/game-studio/skills/unity-navmesh/SKILL.md), [unity-physics](../../.agents/game-studio/skills/unity-physics/SKILL.md), [unity-scriptableobjects](../../.agents/game-studio/skills/unity-scriptableobjects/SKILL.md), [unity-shader-graph-artist](../../.agents/game-studio/skills/unity-shader-graph-artist/SKILL.md), [unity-tilemap-2d](../../.agents/game-studio/skills/unity-tilemap-2d/SKILL.md).

### 05-engine-unreal5 (10)

[unreal-behavior-trees](../../.agents/game-studio/skills/unreal-behavior-trees/SKILL.md), [unreal-blueprints](../../.agents/game-studio/skills/unreal-blueprints/SKILL.md), [unreal-cpp-gameplay](../../.agents/game-studio/skills/unreal-cpp-gameplay/SKILL.md), [unreal-enhanced-input](../../.agents/game-studio/skills/unreal-enhanced-input/SKILL.md), [unreal-multiplayer-architect](../../.agents/game-studio/skills/unreal-multiplayer-architect/SKILL.md), [unreal-niagara](../../.agents/game-studio/skills/unreal-niagara/SKILL.md), [unreal-packaging](../../.agents/game-studio/skills/unreal-packaging/SKILL.md), [unreal-systems-engineer](../../.agents/game-studio/skills/unreal-systems-engineer/SKILL.md), [unreal-technical-artist](../../.agents/game-studio/skills/unreal-technical-artist/SKILL.md), [unreal-world-builder](../../.agents/game-studio/skills/unreal-world-builder/SKILL.md).

### 06-engine-roblox (11)

[roblox-avatar-creator](../../.agents/game-studio/skills/roblox-avatar-creator/SKILL.md), [roblox-characters](../../.agents/game-studio/skills/roblox-characters/SKILL.md), [roblox-datastores](../../.agents/game-studio/skills/roblox-datastores/SKILL.md), [roblox-experience-designer](../../.agents/game-studio/skills/roblox-experience-designer/SKILL.md), [roblox-luau](../../.agents/game-studio/skills/roblox-luau/SKILL.md), [roblox-networking](../../.agents/game-studio/skills/roblox-networking/SKILL.md), [roblox-physics](../../.agents/game-studio/skills/roblox-physics/SKILL.md), [roblox-simulator-economy](../../.agents/game-studio/skills/roblox-simulator-economy/SKILL.md), [roblox-studio-workflow](../../.agents/game-studio/skills/roblox-studio-workflow/SKILL.md), [roblox-systems-scripter](../../.agents/game-studio/skills/roblox-systems-scripter/SKILL.md), [roblox-ui](../../.agents/game-studio/skills/roblox-ui/SKILL.md).

### 07-quality-backend-publishing (7)

[backend-architect](../../.agents/game-studio/skills/backend-architect/SKILL.md), [code-reviewer](../../.agents/game-studio/skills/code-reviewer/SKILL.md), [content-creator](../../.agents/game-studio/skills/content-creator/SKILL.md), [frontend-developer](../../.agents/game-studio/skills/frontend-developer/SKILL.md), [growth-hacker](../../.agents/game-studio/skills/growth-hacker/SKILL.md), [performance-optimization](../../.agents/game-studio/skills/performance-optimization/SKILL.md), [seo-specialist](../../.agents/game-studio/skills/seo-specialist/SKILL.md).

### 08-genres-blueprints (9)

[card-game](../../.agents/game-studio/skills/card-game/SKILL.md), [fps-shooter](../../.agents/game-studio/skills/fps-shooter/SKILL.md), [platformer](../../.agents/game-studio/skills/platformer/SKILL.md), [puzzle](../../.agents/game-studio/skills/puzzle/SKILL.md), [roguelike](../../.agents/game-studio/skills/roguelike/SKILL.md), [rpg](../../.agents/game-studio/skills/rpg/SKILL.md), [survival-crafting](../../.agents/game-studio/skills/survival-crafting/SKILL.md), [tower-defense](../../.agents/game-studio/skills/tower-defense/SKILL.md), [visual-novel](../../.agents/game-studio/skills/visual-novel/SKILL.md).

### 09-web-and-other-engines (11)

[bevy-ecs](../../.agents/game-studio/skills/bevy-ecs/SKILL.md), [defold-core](../../.agents/game-studio/skills/defold-core/SKILL.md), [ebitengine-game](../../.agents/game-studio/skills/ebitengine-game/SKILL.md), [love2d-core](../../.agents/game-studio/skills/love2d-core/SKILL.md), [phaser-arcade-physics](../../.agents/game-studio/skills/phaser-arcade-physics/SKILL.md), [phaser-core](../../.agents/game-studio/skills/phaser-core/SKILL.md), [pixijs-rendering](../../.agents/game-studio/skills/pixijs-rendering/SKILL.md), [pygame-core](../../.agents/game-studio/skills/pygame-core/SKILL.md), [threejs-gltf-loading](../../.agents/game-studio/skills/threejs-gltf-loading/SKILL.md), [threejs-materials-lighting](../../.agents/game-studio/skills/threejs-materials-lighting/SKILL.md), [threejs-scene-setup](../../.agents/game-studio/skills/threejs-scene-setup/SKILL.md).

## Vai trò, rules và template

**agents (21):** [creative-director](../../.agents/game-studio/agents/tier1-directors/creative-director.md), [master-router-director](../../.agents/game-studio/agents/tier1-directors/master-router-director.md), [producer](../../.agents/game-studio/agents/tier1-directors/producer.md), [technical-director](../../.agents/game-studio/agents/tier1-directors/technical-director.md), [art-ui-lead](../../.agents/game-studio/agents/tier2-leads/art-ui-lead.md), [asset-pipeline-lead](../../.agents/game-studio/agents/tier2-leads/asset-pipeline-lead.md), [audio-lead](../../.agents/game-studio/agents/tier2-leads/audio-lead.md), [design-lead](../../.agents/game-studio/agents/tier2-leads/design-lead.md), [genre-architect-lead](../../.agents/game-studio/agents/tier2-leads/genre-architect-lead.md), [multi-engine-lead](../../.agents/game-studio/agents/tier2-leads/multi-engine-lead.md), [qa-lead](../../.agents/game-studio/agents/tier2-leads/qa-lead.md), [release-lead](../../.agents/game-studio/agents/tier2-leads/release-lead.md), [systems-ai-lead](../../.agents/game-studio/agents/tier2-leads/systems-ai-lead.md), [team-assets](../../.agents/game-studio/agents/tier3-teams/team-assets.md), [team-combat](../../.agents/game-studio/agents/tier3-teams/team-combat.md), [team-level](../../.agents/game-studio/agents/tier3-teams/team-level.md), [team-narrative](../../.agents/game-studio/agents/tier3-teams/team-narrative.md), [team-polish](../../.agents/game-studio/agents/tier3-teams/team-polish.md), [team-prototype-jam](../../.agents/game-studio/agents/tier3-teams/team-prototype-jam.md), [team-ship-publish](../../.agents/game-studio/agents/tier3-teams/team-ship-publish.md), [team-ui](../../.agents/game-studio/agents/tier3-teams/team-ui.md).

**rules (4):** [core-and-ai-rules](../../.agents/game-studio/rules/core-and-ai-rules.md), [gameplay-rules](../../.agents/game-studio/rules/gameplay-rules.md), [gdd-and-story-rules](../../.agents/game-studio/rules/gdd-and-story-rules.md), [ui-and-data-rules](../../.agents/game-studio/rules/ui-and-data-rules.md).

**templates (6):** [SKILL.template](../../.agents/game-studio/templates/SKILL.template.md), [active-session-template](../../.agents/game-studio/templates/active-session-template.md), [adr-template](../../.agents/game-studio/templates/adr-template.md), [bug-report-template](../../.agents/game-studio/templates/bug-report-template.md), [gdd-system-template](../../.agents/game-studio/templates/gdd-system-template.md), [story-template](../../.agents/game-studio/templates/story-template.md).
