---
name: game-systems-ai-programmer
description: Core game architecture, gameplay systems, AI programming, networking, and performance optimization specialist based on Claude-Code-Game-Studios 1.3 (/create-architecture, /architecture-decision, /architecture-review, /perf-profile, /tech-debt). Enforces path-scoped coding standards across gameplay, core engine, AI behavior trees/pathfinding, networking, and UI decoupling. Use when designing game architecture, writing ADRs, programming core systems or enemy AI, profiling performance, or enforcing clean game code standards.
---
# Game Systems & AI Programmer

Technical Director and Lead Systems/AI Engineering skill that governs game architecture, Architecture Decision Records (ADRs), enemy AI systems, performance budgets, and path-scoped coding standards across Godot 4, Unity, and Unreal Engine 5.

## When to Use

- Designing overall game software architecture or writing Architecture Decision Records (`/create-architecture`, `/architecture-decision`, `/architecture-review`)
- Implementing core foundation systems (event bus, save/load serialization, scene management, object pooling, input control manifest)
- Programming enemy AI, state machines (FSM/HFSM), Behavior Trees, Utility AI, GOAP, navigation meshes, and pathfinding
- Profiling frame times, memory allocations, draw calls, or auditing technical debt (`/perf-profile`, `/tech-debt`)
- Enforcing studio path-scoped coding rules across gameplay, core, AI, networking, UI, and data files

## Steps

### 1. Define Architecture & Write ADRs (`/create-architecture` & `/architecture-decision`)

Document foundational technical choices in `docs/architecture/` and `docs/adr/ADR-XXX-<title>.md`:

1. **System Boundaries & Dependency Direction**: Enforce strict one-way dependencies: `UI -> Gameplay -> Core/Services <- AI`. Core systems never import Gameplay or UI; Gameplay communicates with UI exclusively via Signals/Event Bus.
2. **ADR Structure**: Every ADR must record *Status* (`Proposed | Accepted | Superseded`), *Context & Problem Statement*, *Considered Options (at least 2-3)*, *Decision Outcome*, and *Consequences (Positive, Negative, Performance Impact)*.
3. **Control Manifest (`/create-control-manifest`)**: Map abstract input actions (for example, `move_up`, `primary_attack`, `interact`) separately from physical device bindings to guarantee seamless gamepad/keyboard remapping.

### 2. Enforce Path-Scoped Coding Standards

Apply strict domain rules based on the module being edited (adapting paths to Godot `src/`, Unity `Assets/Scripts/`, or Unreal `Source/<Module>/`):

- **Gameplay (`src/gameplay/**` / `Gameplay/`)**:
  - **Data-Driven Values**: Never hardcode cooldowns, speeds, or damage numbers in scripts. Load them from custom Resources (`Resource` / `ScriptableObject` / `UDataAsset`) or validated JSON tables under `<assets_root>/data/`.
  - **Frame-Rate Independence**: Multiply all continuous movement, physics forces, and timers by `delta` (`Time.deltaTime` / `DeltaSeconds`).
  - **Zero Direct UI References**: Never call `get_node("/root/HUD/...")` or mutate UI labels directly from gameplay scripts; emit typed events/signals instead.
- **Core & Engine (`src/core/**` / `Core/`)**:
  - **Zero Hot-Path Allocations**: Avoid heap allocations, string concatenations, uncached node/component lookups (`get_node`, `GetComponent`, `FindObjectOfType`), or garbage generation inside `_process`, `_physics_process`, `Update`, or `Tick`.
  - **Object Pooling**: Pool high-frequency spawns (projectiles, damage numbers, VFX particles, audio emitters).
- **AI & Pathfinding (`src/ai/**` / `AI/`)**:
  - **Performance Budgets**: Stagger expensive perception raycasts, path recalculations, and utility scoring across frames or tick intervals (for example, 5-10 Hz perception updates rather than every frame).
  - **Data-Driven Behavior**: Expose aggro ranges, sight cones, reaction delays, and decision weights as inspector/resource parameters so designers can tune AI without touching code.
  - **Debuggability**: Provide optional visual debug gizmos/overlays showing current AI state, target vector, and active path.
- **Networking (`src/networking/**` / `Networking/`)**:
  - Enforce server-authoritative state validation, versioned network messages, and bandwidth throttling.
- **UI (`src/ui/**` / `UI/`)**:
  - UI views are pure observers and input forwarders; they never own authoritative health, inventory, or economy state.
- **Prototypes (`prototypes/**`)**:
  - Isolate throwaway experiments in `prototypes/` with a mandatory `README.md` stating the hypothesis being tested. Never import `prototypes/` code into production `src/`.

### 3. Profile Performance and Audit Tech Debt (`/perf-profile` & `/tech-debt`)

When diagnosing frame drops or auditing code health:

1. **Frame Budget Breakdown**: Measure CPU script time, physics step time, GPU draw calls/batches, shader overdraw, and VRAM usage against target platform budgets (for example, 16.6 ms for 60 FPS).
2. **Hotspot Remediation**: Replace per-frame polling with event-driven listeners, spatial hashing/collision layers, LODs, and batched rendering.

## Gotchas

- Engine scene and asset files are corrupted by a bad hand edit (CCGS 1.2 scene-file rule): use the editor or its CLI/MCP where you can; never invent a Godot `uid://` (let the editor assign it and commit the `.uid` files); never hand-edit Unity YAML (`*.unity`, `*.prefab`, `Assets/**/*.asset`) while an Editor is reachable; never edit `*.uasset` / `*.umap` at all.
- When `engine.code_root` / `engine.test_root` are set in `project.yaml`, they replace the engine's usual folders above; a value that cannot be used makes code checks NOT ASSESSED with the reason, never a silent fallback.
- An ADR that is only Proposed does not unblock stories: `/create-stories` blocks a story whose governing ADR (or one it depends on) is not Accepted.
- Combine this skill with the matching engine specialist skill (`godot-gameplay-scripter`, `unity-architect`, or `unreal-systems-engineer`) when writing engine-specific implementation code.
