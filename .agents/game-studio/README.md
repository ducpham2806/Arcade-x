# Game Studio Agent Hub — Bộ Khung Điều Phối 125 Skills & 21 Agents Đa Engine

Chào mừng anh đến với **Game Studio Agent Hub** (`/Users/phamduc/Documents/Game_Studio_Agent`). Đây là kho trung tâm hợp nhất giữa:
1. **Kiến trúc 3 Tầng Điều phối Studio (Directors -> Leads -> Specialists)** từ [Donchitos/Claude-Code-Game-Studios](https://github.com/Donchitos/Claude-Code-Game-Studios) (đồng bộ theo **v1.3.0**, 2026-11-09 — đường chính "make me a game", `/cut`, Web engine, `project.goal`) cùng **6 skill quy trình** tổng hợp (orchestrator + one-shot, GDD, Scrum + `/cut`, QA, Release/LiveOps, Systems/AI).
2. **Hệ thống Master Router & 79 Skills Đa Engine** từ [gamedev-skills/awesome-gamedev-agent-skills](https://github.com/gamedev-skills/awesome-gamedev-agent-skills) (đồng bộ nguyên bản theo **v2.0.0**, 2026-11-11) hỗ trợ **12 Game Engines** (Godot 4.7.2, Unity 6.3 LTS, Unreal Engine 5.8, Roblox, Ebitengine 2.10.6, Phaser 4.2.1, PixiJS 8.22, three.js r187, Bevy 0.20.1, pygame-ce 2.5.8, LÖVE 11.5, Defold 1.14.1), **15 Chuyên ngành Kỹ thuật (Disciplines)**, **9 Khung Thể loại (Genres)** và **5 Quy trình (Steam, itch.io, Game Jam, Fast Prototype, Game Docs)**.
3. **34 chuyên gia (personas)** từ [msitarzewski/agency-agents](https://github.com/msitarzewski/agency-agents) (đồng bộ ngày 2026-11-14, MIT, commit `8ae6164`): 20 agent game-dev (Godot, Unity, Unreal, Roblox, Blender, Game/Economy/Level/Narrative Designer, Technical Artist, Audio) dùng **bản đầy đủ** thay cho bản tóm tắt cũ, cùng UI/UX, backend/frontend, marketing và nhóm kiểm chứng `evidence-collector`, `reality-checker`, `accessibility-auditor`, `feedback-synthesizer`, `ux-researcher`, `image-prompt-engineer`.
4. **VFX pixel art `pixelfx`** từ [patch-gg/pixelfx](https://github.com/patch-gg/pixelfx) (MIT, commit `5294518`): 244 hiệu ứng vẽ bằng code + 12 đòn đánh hoàn chỉnh (lấy đà, hit-stop, rung, mục tiêu phản ứng), đổi màu theo palette, xuất sprite sheet + JSON kiểu Aseprite cho Godot/Unity/Phaser/Defold/LÖVE/Bevy; skill dùng checkout ghim commit tại `.pixelfx/` khi cần.

Chi tiết nguồn, commit đã đồng bộ và cách cập nhật lần sau: [`docs/UPSTREAM-SYNC.md`](docs/UPSTREAM-SYNC.md).

Tổng cộng bộ công cụ hiện có **125 Skills** (không trùng lặp) và **21 Agents / Biệt đội Tác chiến (`/team-*`)**.

## 1. Cách Khởi Tạo Nhanh Cho Bất Kỳ Dự Án Game Mới Nào

Sử dụng script `init-game-project.sh` đi kèm để tự động dựng khung Studio + cài đặt toàn bộ 125 Skills & 21 Agents cho bất kỳ dự án nào:

```bash
# Cú pháp:
/Users/phamduc/Documents/Game_Studio_Agent/init-game-project.sh <đường_dẫn_dự_án> [engine] [rigor] [--copy|--symlink]

# Ví dụ 1: Khởi tạo cho dự án Godot 4 ở chế độ tinh gọn (minimal)
/Users/phamduc/Documents/Game_Studio_Agent/init-game-project.sh ~/Projects/MyGodotGame godot4 minimal

# Ví dụ 2: Khởi tạo cho dự án Unity ở chế độ tiêu chuẩn (standard)
/Users/phamduc/Documents/Game_Studio_Agent/init-game-project.sh ~/Projects/MyUnityGame unity standard

# Ví dụ 3: Khởi tạo cho dự án Unreal Engine 5 hoặc Web (Phaser/PixiJS/three.js)
/Users/phamduc/Documents/Game_Studio_Agent/init-game-project.sh ~/Projects/MyUE5Game unreal5 full

# Ví dụ 4: Game trình duyệt thuần — bắt đầu bằng "make me a game" (/prototype)
/Users/phamduc/Documents/Game_Studio_Agent/init-game-project.sh ~/Projects/MyWebGame web minimal
```

Khi chạy lệnh trên, script sẽ tự động:
1. Tạo `CLAUDE.md` và `project.yaml` đã điền sẵn Engine và chế độ `rigor` tại thư mục gốc dự án.
2. Tạo thư mục `.claude/` và `.agents/skills/` chứa toàn bộ **21 Agents**, **125 Skills** (ở dạng phẳng `.claude/skills/<skill-name>/SKILL.md` tương thích trực tiếp với Claude Code, Gemini, Cursor, Windsurf, Codex, Copilot) và **4 bộ Rules**.
3. Khởi tạo cây thư mục sản xuất tiêu chuẩn: `design/gdd/`, `design/narrative/`, `design/registry/`, `docs/adr/`, `production/epics/`, `production/stories/`, `production/qa/evidence/`, `production/session-state/active.md` và `docs/templates/`.

## 2. Cấu Trúc Thư Mục Trung Tâm (`Game_Studio_Agent`)

```text
/Users/phamduc/Documents/Game_Studio_Agent/
├── CLAUDE.md                                 # Sổ tay Điều phối Tổng thể (125 Skills & 21 Agents)
├── README.md                                 # Tài liệu hướng dẫn sử dụng & danh mục đầy đủ
├── project.template.yaml                     # Cấu hình mẫu hỗ trợ 12 Engine
├── init-game-project.sh                      # Script tự động gắn 125 Skills & 21 Agents vào dự án
├── agents/                                   # 21 định nghĩa Agent & Biệt đội đa nhiệm
│   ├── tier1-directors/                      # master-router-director, creative-director, technical-director, producer
│   ├── tier2-leads/                          # design-lead, genre-architect-lead, systems-ai-lead, multi-engine-lead,
│   │                                         # asset-pipeline-lead, art-ui-lead, audio-lead, qa-lead, release-lead
│   └── tier3-teams/                          # team-combat, team-ui, team-level, team-narrative,
│                                             # team-assets, team-prototype-jam, team-polish, team-ship-publish
├── skills/                                   # Toàn bộ 125 Skills chia theo 10 phân nhóm chuyên môn
│   ├── 00-orchestration-and-workflows/       # 12 skills: game-studio-orchestrator (+ one-shot /prototype), router, GDD, game-docs, Scrum (+ /cut), QA, LiveOps, Jam, Steam, itch.io
│   ├── 01-design-and-narrative/              # 14 skills: Game/Economy/Level/Narrative Design, AI, BT/Utility AI, ProcGen, Save, Input, Feel, Camera
│   ├── 02-art-animation-ui-audio/            # 15 skills: create-game-assets, 2D Sprite/Video/Map/CodeArt, pixelfx VFX, Shaders, UI/UX, UX Research, Image Prompts, Blender, Audio
│   ├── 03-engine-godot4/                     # 19 skills chuyên sâu Godot 4.7 (GDScript, C#, 2D/3D, TileMap, Shaders, Audio, Netcode, Headless Test, Export)
│   ├── 04-engine-unity/                      # 13 skills chuyên sâu Unity 6.3 LTS (Architect, C#, Input System, Physics 2D/3D, Animation, SO, Tilemap, NavMesh, Build, Build Size)
│   ├── 05-engine-unreal5/                    # 10 skills chuyên sâu Unreal Engine 5.8 (C++, Blueprints, Enhanced Input, Behavior Trees, Niagara, World Builder, Packaging)
│   ├── 06-engine-roblox/                     # 11 skills chuyên sâu Roblox (Luau, DataStores, Networking, UI, Characters, Physics, Studio Workflow, Simulator Economy, UGC)
│   ├── 07-quality-backend-publishing/        # 11 skills: Performance, Code Review, Evidence Collector, Reality Checker, Accessibility, Feedback Synthesis, Backend, Frontend, Content, Growth, SEO
│   ├── 08-genres-blueprints/                 # 9 skills khung thể loại: Platformer, Roguelike, RPG, FPS, Tower Defense, Card Game, Visual Novel, Survival, Puzzle
│   └── 09-web-and-other-engines/             # 11 skills đa nền tảng: Phaser 4, PixiJS 8, three.js, Ebitengine (Go), Bevy (Rust), pygame, LÖVE, Defold
├── scripts/                                  # validate-skills.py (bản chỉnh cho cấu trúc Hub), run-trigger-evals.py, generate-site.py, check-site.py
├── evals/                                    # Bộ trigger evals của awesome-gamedev-agent-skills 2.0 (triggers.json, RESULTS.md)
├── docs/                                     # SKILL-FORMAT.md, VERSION-SUPPORT.md, COMPATIBILITY.md, INSTALLATION.md, UPSTREAM-SYNC.md
├── rules/                                    # 4 bộ quy tắc kiểm soát code & tài liệu theo đường dẫn
└── templates/                                # 7 biểu mẫu chuẩn (Game Brief, GDD, ADR, Story, Bug Report, Active Session, SKILL.template.md)
```

## 3. Bảng Tra Cứu Nhanh Các Lệnh Điều Phối (`/start` & `/team-*`)

| Lệnh / Yêu cầu | Bộ phận / Skill được kích hoạt | Kết quả đầu ra |
| :--- | :--- | :--- |
| **`/start`** hoặc **`/project-stage-detect`** | `game-studio-orchestrator` + `router` | Nhận diện 1 trong 12 Engine (hoặc Web), đọc phiên bản đã ghim, kiểm tra `project.yaml` & `active.md`, nạp đúng bộ skill và đề xuất bước tiếp theo. |
| **"Make me a game"** / **`/prototype`** | `game-studio-orchestrator` (`references/one-shot-flow.md`) + `game-gdd-architect` + `game-qa-playtest` | Một vòng hỏi → `design/game-brief.md` → game trình duyệt one-shot tại `prototypes/<name>/` → small check headless → bàn giao + tag `one-shot/<name>` → chỉnh sau khi chơi → grow. |
| **`/next-step`** (tên cũ `/help`) | `game-studio-orchestrator` + `game-production-scrum` | Chỉ ra đúng một bước tiếp theo: làm game, chỉnh sau khi chơi, grow, hoặc bước Studio Mode kế tiếp. |
| **`/cut`** | `game-production-scrum` | Đề xuất cắt giảm + danh sách polish từ brief; với mục tiêu bán/early access/publisher thì thêm ngày mục tiêu & feature freeze. |
| **`/team-combat <mô_tả>`** | Thiết kế + AI (`ai-behavior-trees-utility-ai`) + Engine + `game-feel` + Art 2D + `pixelfx` + QA (`evidence-collector`) | Thiết kế công thức sát thương, lập trình Hitbox/Hurtbox, FSM/BT, AI quái, Hit-stop/Camera Shake, VFX và bộ test. |
| **`/team-assets <mô_tả>`** | `create-game-assets` + `generate2dsprite`/`video2dsprite`/`generate2dmap` + `pixelfx` + `image-prompt-engineer` + Engine Importer | Chốt `art-direction-brief.md` & `asset-manifest.json`, sinh/cắt tài nguyên đồng bộ, chạy `asset_report.py` và gắn vào game. |
| **`/team-ui <mô_tả>`** | `ui-designer` + `game-ui-ux` + `input-systems` + Engine UI + `accessibility-auditor` + `ux-researcher` + `game-qa-playtest` | Xây dựng HUD/Menu tách biệt dữ liệu qua `EventBus`, hỗ trợ điều hướng tay cầm/cảm ứng và kiểm tra độ phân giải. |
| **`/team-level <mô_tả>`** | `level-designer` + `level-design` + `procedural-gen` + `generate2dmap` + Tilemap Skill | Quy hoạch bố cục màn chơi, sinh Tilemap/Props, thiết lập va chạm, Navigation và điểm chạm trán. |
| **`/team-narrative <mô_tả>`** | `narrative-designer` + `dialogue-systems` + `visual-novel` + `game-release-liveops` | Chuyển thể cốt truyện thành kịch bản phân nhánh (Yarn/Ink/JSON), barks chiến đấu và bảng mã đa ngôn ngữ. |
| **`/team-prototype`** / **`/team-jam`** | One-shot `/prototype` + `prototype-fast` + `game-jam` + Genre Blueprint (`rpg`/`roguelike`/...) + `game-feel` | Dựng nhanh bản chơi thử Vertical Slice / Game Jam trong thời gian ngắn, ưu tiên cảm giác chơi. |
| **`/team-polish`** & **`/team-ship`** | `performance-optimization` + `pixelfx` + `unity-build-size` + `godot-gdscript-headless-testing` + `reality-checker` + `steam-publish` / `itch-publish` | Tối ưu FPS/Draw Calls/dung lượng build, chạy Headless Test, xuất bản dựng chuẩn Engine và đẩy lên Steamworks / itch.io. |
