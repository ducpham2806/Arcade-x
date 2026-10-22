# Pip character upgrade v4 — production specification

Retain Pip's chestnut hair, youthful face, cream/teal base palette and the established 16-bit roster style. Give the default silhouette an orange neckerchief, compact emerald adventurer vest, visible bomb pouch, sturdy boots and clearer gloves. Keep the head free for owned hats.

Budgets before generation: two transparent sheets, 96×96 per frame; movement 4×4 (16 frames), actions 5×4 (20 frames); combined decoded texture budget ≤1.5 MiB, compressed budget ≤600 KiB. One cached image draw for body, up to six owned wardrobe layers, one shadow and one optional selection mark. No extra particles, mipmaps or 3D LOD meshes; Canvas2D pixel sampling. Keep 48×64 rendering size, movement speed, collision radius and bomb fuse unchanged.

Movement rows down/up/left/right, columns idle/left-step/passing/right-step. Actions rows down/up/left/right, columns prepare-placement/release-placement/hurt/celebrate/defeat. Each row and pose uses one identity, equal cell bounds and a fixed foot pivot. Exact generation prompts and QA results will be recorded after production.

## Implemented result

Pip now has 16 movement cells and 20 action cells, at 96×96. Canonical rear movement/actions were regenerated separately after the first generated sheets showed front-facing torso details. Left-facing cells mirror canonical right-facing artwork. Mechanical extraction uses contain fitting, shared foot baseline at pixel 85, transparent padding and binary alpha; it does not crop rectangular source cells to square. A small scale correction aligns the separately generated rear-action sheet with the main body scale. Full-resolution original generations remain in generated_images; runtime sheets/portrait and exact built-in imagegen prompts are under `public/boom/art-v4/`.

Body rendering and profile preview use the new art. Bomb placement events start the prepare/release sequence only after a successful placement, with no input delay. Actual HP loss starts hurt; shield blocks and invulnerability do not retrigger it. Exit/win selects celebration; loss selects defeat. Walk cadence follows actual distance travelled, so blocked movement and pause do not continue stepping. Movement speed, collision boundaries, fuse and save/ownership IDs remain intact. New clocks are optional for resumed old saves.

The extraction script emits `pip-v4-rig.js` from frame head landmarks. Wardrobe anchors follow the selected pose so hats/masks lower with crouch and seated poses. Garments remain shared icon-derived art, not bespoke garment drawings per pose/direction. This is an improvement to attachment, not a replacement of the whole wardrobe system.

## Verification

`node tests/boom-buddies/pip-v4.mjs` checks 36-frame layout, decoded alpha/foot baseline, 120 draw combinations, atlas bounds, optional asset-load fallback, all wardrobe anchors, distance-based stride and actual game functions for successful/failed placement, HP damage, shield and invulnerability. Existing roster/asset and campaign generation checks are also retained. Both review exporters support the new dependencies; the focused Pip inspector is self-contained and includes default/10 chapter costumes, action selector, speed and pause controls.

Browser access to the local preview remains unavailable in this workspace, so no full frontend build, browser render verification, combat playthrough or mobile frame-time profiling is claimed. This remains part of draft PR #4; no live deployment. Run `npm run test:boom-pip`; create the offline review with `npm run export:boom-pip`.
