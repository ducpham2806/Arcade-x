# Game Studio Agent Architecture — Master Configuration (`CLAUDE.md`)

Hệ thống Studio Phát triển Game Đa Nền tảng được điều phối qua kiến trúc **3 Tầng (Directors -> Department Leads -> Specialists)** kết hợp **125 Kỹ năng Chuyên sâu (Skills)** (80 Skills & Master Router từ `awesome-gamedev-agent-skills` 2.0 + 34 chuyên gia từ `agency-agents` + 6 skill quy trình tổng hợp từ Claude-Code-Game-Studios 1.3 + `pixelfx` cho VFX pixel art + 4 skill sprite/map của hub) và **21 Subagents / Biệt đội Chuyên nhiệm** hỗ trợ **12 Game Engines + Web thuần**. Nguồn upstream và cách đồng bộ: `docs/UPSTREAM-SYNC.md`.

## 1. Cấu hình Công nghệ & Nhận diện Tự động (`project.yaml` & `router`)

- **File cấu hình gốc**: `project.yaml` tại thư mục gốc của từng dự án quy định Engine (`godot4`, `unity`, `unreal5`, `roblox`, `ebitengine`, `phaser`, `pixijs`, `threejs`, `bevy`, `pygame`, `love2d`, `defold`, `web`), phiên bản đã ghim, mức độ chặt chẽ (`modes.rigor: minimal | standard | full`), mục tiêu dự án (`project.goal: jam | learn | hobby | portfolio | sell | early_access | publisher | mobile | other`), thư mục code/test tùy chọn (`engine.code_root`, `engine.test_root`) và quy ước đặt tên.
- **Đọc phiên bản đã ghim trước khi viết API**: dự án cũ/mới hơn baseline trong `docs/VERSION-SUPPORT.md` (kiểm tra 2026-11-11) phải theo `## Version notes` của skill hoặc release notes chính thức; dự án hiện có không tự nâng cấp.
- **Tự động Nhận diện (Fingerprinting qua `router`)**: Nếu chưa có `project.yaml`, `router` tự động quét dấu vân tay dự án (`project.godot`, `*.uproject`, `Assets/ + ProjectSettings/`, `go.mod`, `Cargo.toml`, `package.json`, `game.project`, `conf.lua`, `*.rbxl/*.project.json`) và ghép tổ hợp tối thiểu theo thứ tự:
  `Engine Fundamentals -> Cross-Engine Discipline -> Genre Blueprint -> Studio & Shipping Workflow`.
- **Trạng thái phiên làm việc**: `production/session-state/active.md` là bộ nhớ lưu trữ tiến độ thực tế giữa các phiên làm việc. Luôn đọc file này đầu tiên khi bắt đầu phiên mới hoặc sau khi nén ngữ cảnh.
- **Đường chính "Make me a game" (CCGS 1.3)**: `/prototype` hỏi một vòng ngắn → viết brief một trang `design/game-brief.md` → dựng game trình duyệt one-shot tại `prototypes/<name>/` → kiểm tra nhanh headless → bàn giao (tag `one-shot/<name>`) → chỉnh sau khi chơi (`iteration N`) → grow thành dự án web (tag `grown/<name>`). Agents, `/team-*` và chuỗi GDD gọi chung là **Studio Mode**, dùng khi dự án cần. Lệnh đổi tên: `/help` → `/next-step`, `/settings` → `/project-settings`, `/changelog` → `/write-changelog`; lệnh mới `/cut` để chốt cắt giảm & polish.

## 2. Kiến trúc Phân tầng Studio (3-Tier Hierarchy — 21 Agents & 125 Skills)

### Tier 1 — Hội đồng Giám đốc (`agents/tier1-directors/`)
1. **Master Router Director (`master-router-director.md`)**: Điều phối tổng thể qua `game-studio-orchestrator` và `router` — nhận diện 12 Engine, phân loại tác vụ và nạp đúng các skill cần thiết.
2. **Creative Director (`creative-director.md`)**: Bảo vệ trụ cột sáng tạo (Design Pillars), cảm giác chơi (`game-feel`), khung MDA/SDT/Flow và tính nhất quán nghệ thuật (`create-game-assets`).
3. **Technical Director (`technical-director.md`)**: Bảo vệ kiến trúc mã nguồn, ngân sách hiệu năng (`performance-optimization`), tách biệt dữ liệu (Data-Driven) và phê duyệt ADR.
4. **Producer (`producer.md`)**: Bảo vệ phạm vi dự án (Scope), quản lý Epics/User Stories (`game-production-scrum`), kiểm soát cổng giai đoạn (Stage Gates) và điều phối thay đổi liên bộ phận.

### Tier 2 — 9 Trưởng Bộ phận & Quy trình (`agents/tier2-leads/`)
1. **Design Lead (`design-lead.md`)**: Quy trình GDD (`game-gdd-architect`), cân bằng kinh tế (`economy-designer`), hệ thống hội thoại (`dialogue-systems`), lưu trữ (`save-systems`) và cảm giác chơi (`game-feel`).
2. **Genre & Rapid Prototype Lead (`genre-architect-lead.md`)**: Lắp ghép 9 khung thể loại (`rpg`, `roguelike`, `platformer`, `fps-shooter`, `tower-defense`, `card-game`, `visual-novel`, `survival-crafting`, `puzzle`) và dựng mẫu nhanh (`prototype-fast`, `game-jam`).
3. **Producer & Scrum Lead (`game-production-scrum`)**: Quy trình `/create-epics`, `/create-stories`, `/story-readiness`, `/dev-story`, `/story-done`, `/sprint-plan`, `/scope-check`, `/cut`, `/gate-check`.
4. **Systems & AI Lead (`systems-ai-lead.md`)**: Kiến trúc hệ thống (`game-systems-ai-programmer`), AI FSM/Steering (`game-ai`), Behavior Trees & Utility AI (`ai-behavior-trees-utility-ai`), sinh thủ tục (`procedural-gen`), vật lý (`physics-tuning`), điều khiển (`input-systems`) và camera (`camera-systems`).
5. **Multi-Engine Technical Lead (`multi-engine-lead.md`)**: Chuyên trách API chuẩn phiên bản trên 12 Engine + Web (Godot 4.7.2, Unity 6.3 LTS, Unreal 5.8, Roblox, Ebitengine 2.10.6, Phaser 4.2.1, PixiJS 8.22, three.js r187, Bevy 0.20.1, pygame-ce 2.5.8, LÖVE 11.5, Defold 1.14.1).
6. **Asset Pipeline & Art Direction Lead (`asset-pipeline-lead.md`)**: Quản lý `create-game-assets`, bảng kê `asset-manifest.json`, sinh/cắt Sprite & Map (`generate2dsprite`, `video2dsprite`, `generate2dmap`, `codeart2d`), VFX pixel art bằng code (`pixelfx`: 244 hiệu ứng, xuất sprite sheet cho mọi Engine), prompt sinh ảnh (`image-prompt-engineer`) và kiểm định raster tự động (`asset_report.py`).
7. **Art, UI & Shader Lead (`art-ui-lead.md`)**: Kiến trúc UI đa độ phân giải (`ui-designer`, `game-ui-ux`), lập trình Shader (`shader-programming`, `technical-artist`) và pipeline 3D (`blender-addon-engineer`).
8. **Audio Lead (`audio-lead.md`)**: Thiết kế âm thanh tương tác, nhạc nền thích ứng, bus mixing & ducking (`game-audio-engineer`, `audio-design`, `godot-audio`).
9. **QA & Release Leads (`qa-lead.md`, `release-lead.md`)**: Kiểm thử tự động Headless CI (`godot-gdscript-headless-testing`, `game-qa-playtest`), kiểm chứng bằng chứng & thẩm định phát hành (`evidence-collector`, `reality-checker`), khả năng tiếp cận (`accessibility-auditor`), tổng hợp phản hồi người chơi (`feedback-synthesizer`), tối ưu hóa (`performance-optimization`, `unity-build-size`) và phát hành đa nền tảng (`game-release-liveops`, `steam-publish`, `itch-publish`).

### Tier 3 — 125 Chuyên gia Thực thi chia theo 10 Phân nhóm (`skills/00..09`)
- **`00-orchestration-and-workflows` (12 skills)**: `game-studio-orchestrator`, `router`, `game-gdd-architect`, `game-docs`, `game-production-scrum`, `game-systems-ai-programmer`, `game-qa-playtest`, `game-release-liveops`, `game-jam`, `prototype-fast`, `steam-publish`, `itch-publish`
- **`01-design-and-narrative` (14 skills)**: `game-designer`, `economy-designer`, `level-designer`, `level-design`, `narrative-designer`, `dialogue-systems`, `game-ai`, `ai-behavior-trees-utility-ai`, `procedural-gen`, `save-systems`, `physics-tuning`, `input-systems`, `game-feel`, `camera-systems`
- **`02-art-animation-ui-audio` (15 skills)**: `create-game-assets`, `generate2dsprite`, `video2dsprite`, `generate2dmap`, `codeart2d`, `technical-artist`, `shader-programming`, `ui-designer`, `game-ui-ux`, `blender-addon-engineer`, `game-audio-engineer`, `audio-design`, `pixelfx`, `ux-researcher`, `image-prompt-engineer`
- **`03-engine-godot4` (19 skills)**: `godot-gameplay-scripter`, `godot-shader-developer`, `godot-multiplayer-engineer`, `godot-gdscript`, `godot-nodes-scenes`, `godot-signals-groups`, `godot-2d-movement`, `godot-tilemap`, `godot-physics`, `godot-ui-control`, `godot-animation`, `godot-shaders`, `godot-3d-essentials`, `godot-resources`, `godot-audio`, `godot-multiplayer`, `godot-export`, `godot-csharp`, `godot-gdscript-headless-testing`
- **`04-engine-unity` (13 skills)**: `unity-architect`, `unity-shader-graph-artist`, `unity-multiplayer-engineer`, `unity-editor-tool-developer`, `unity-csharp-scripting`, `unity-input-system`, `unity-physics`, `unity-animation`, `unity-scriptableobjects`, `unity-tilemap-2d`, `unity-navmesh`, `unity-build-pipeline`, `unity-build-size`
- **`05-engine-unreal5` (10 skills)**: `unreal-systems-engineer`, `unreal-technical-artist`, `unreal-multiplayer-architect`, `unreal-world-builder`, `unreal-blueprints`, `unreal-cpp-gameplay`, `unreal-enhanced-input`, `unreal-behavior-trees`, `unreal-niagara`, `unreal-packaging`
- **`06-engine-roblox` (11 skills)**: `roblox-systems-scripter`, `roblox-experience-designer`, `roblox-avatar-creator`, `roblox-luau`, `roblox-datastores`, `roblox-ui`, `roblox-networking`, `roblox-characters`, `roblox-physics`, `roblox-studio-workflow`, `roblox-simulator-economy`
- **`07-quality-backend-publishing` (11 skills)**: `performance-optimization`, `code-reviewer`, `evidence-collector`, `reality-checker`, `accessibility-auditor`, `feedback-synthesizer`, `backend-architect`, `frontend-developer`, `content-creator`, `growth-hacker`, `seo-specialist`
- **`08-genres-blueprints` (9 skills)**: `platformer`, `roguelike`, `rpg`, `fps-shooter`, `tower-defense`, `card-game`, `visual-novel`, `survival-crafting`, `puzzle`
- **`09-web-and-other-engines` (11 skills)**: `phaser-core`, `phaser-arcade-physics`, `pixijs-rendering`, `threejs-scene-setup`, `threejs-gltf-loading`, `threejs-materials-lighting`, `ebitengine-game`, `bevy-ecs`, `pygame-core`, `love2d-core`, `defold-core`

## 3. 8 Biệt đội Chuyên nhiệm Liên Phòng Ban (`agents/tier3-teams/`)

- **`/team-combat`**: `game-gdd-architect` + `game-systems-ai-programmer` + `ai-behavior-trees-utility-ai` + Engine Scripter + `game-feel` + `camera-systems` + `generate2dsprite`/`video2dsprite` + `pixelfx` + `game-qa-playtest` + `evidence-collector`
- **`/team-ui`**: `ui-designer` + `game-ui-ux` + `input-systems` + Engine UI Skill (`godot-ui-control` / `roblox-ui`) + `accessibility-auditor` + `ux-researcher` + `game-qa-playtest`
- **`/team-level`**: `level-designer` + `level-design` + `procedural-gen` + `generate2dmap` + `godot-tilemap`/`unity-tilemap-2d`/`unreal-world-builder`
- **`/team-narrative`**: `narrative-designer` + `dialogue-systems` + `visual-novel` + `game-gdd-architect` + `game-release-liveops` (`/localize`)
- **`/team-assets`**: `create-game-assets` + `generate2dsprite` + `video2dsprite` + `generate2dmap` + `pixelfx` + `image-prompt-engineer` + Engine Importer + `game-qa-playtest`
- **`/team-prototype`** / **`/team-jam`**: luồng one-shot `/prototype` (`game-studio-orchestrator`) + `prototype-fast` + `game-jam` + `router` + Genre Blueprint + `game-feel` + `input-systems`
- **`/team-polish`**: `performance-optimization` + `game-feel` + `shader-programming` + `pixelfx` + `audio-design` + `game-qa-playtest`
- **`/team-ship`**: `game-release-liveops` + `steam-publish` + `itch-publish` + `godot-export`/`unity-build-pipeline`/`unity-build-size`/`unreal-packaging` + `godot-gdscript-headless-testing` + `reality-checker` + `/cut`

## 4. Giao thức Hợp tác & Quy chuẩn Bắt buộc

1. **Question -> Options -> Decision -> Draft -> Approval**: Luôn làm rõ yêu cầu, đưa ra 2-4 phương án kèm ưu/nhược điểm để người dùng quyết định trước khi ghi đè tài liệu kiến trúc hoặc GDD cốt lõi.
2. **Kiểm tra Trực quan Bắt buộc (The Look Rule)**: Mọi Story thay đổi hình ảnh, UI, hoạt ảnh hoặc hiệu ứng mà người chơi nhìn thấy đều phải được khởi chạy kiểm tra thực tế và lưu bằng chứng vào `production/qa/evidence/`. Kiểm tra cú pháp (syntax check) không bao giờ thay thế cho việc chạy thử.
3. **Tuân thủ Quy tắc theo Đường dẫn (`rules/`)**:
   - `rules/gameplay-rules.md`: Cấm hardcode số liệu gameplay, bắt buộc nhân `delta`, cấm gọi trực tiếp node UI từ Gameplay.
   - `rules/core-and-ai-rules.md`: Cấm cấp phát bộ nhớ mới trong vòng lặp `_process`/`_physics_process`/`Update`/`Tick`, bắt buộc dùng Object Pooling cho đạn/VFX/số sát thương; quy tắc file scene (không bịa `uid://`, không sửa YAML Unity khi Editor mở, cấm sửa `.uasset`/`.umap`); không tự gửi issue/PR lên repo upstream.
   - `rules/ui-and-data-rules.md`: UI chỉ đóng vai trò quan sát qua EventBus/Signals, không giữ trạng thái máu/tiền tệ gốc.
   - `rules/gdd-and-story-rules.md`: GDD phải có công thức toán học rõ ràng; User Story phải nhúng sẵn tóm tắt GDD/ADR liên quan, có mục `## Files`, trạng thái ADR, `stamp.txt` cho bằng chứng và dòng `Reviewed by`; tài liệu > 40 KB đọc theo từng mục.
