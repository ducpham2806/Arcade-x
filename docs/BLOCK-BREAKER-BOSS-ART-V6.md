# Boss readability and animation v6

## Budget and production contract

Target: existing Canvas 2D mobile/desktop runtime. No 3D meshes or mesh LOD apply. Raster tiers: normal/high use full poses; low/reduced-motion retains all warnings, hitboxes and state cues while disabling secondary glows, shake, trails and pose tweening. No WebGL/custom pixel shader is introduced.

Before production budget: one new boss atlas, 9 columns × 6 rows, 192px square cells, fixed center pivot and stable scale, <=8 MiB decoded; one shared VFX atlas <=2 MiB decoded. Whole runtime <=24 MiB decoded textures. Prefer WebP alpha, preserve source-resolution generated PNGs for rebuild. UI/sprites use no mipmaps; browser selects normal texture sampling. Transparent VFX: <=3 overlays in a footprint, no full-screen flash, secondary effects <=48 particles with existing global cap. Rendering budget: <=4 body sprite draws at transition/clone peak, <=2 attack sprite layers per hazard/shot; no per-frame image decoding, offscreen texture allocation or pixel readback. Actual mobile GPU time requires device profiling; no unmeasured fps claim.

## State language

Nine authored poses per boss: armored idle A/B; coiled windup; fully charged/open weapon; firing; recoil; hurt with displaced armor; exposed weak core; broken defeat. Preserve six existing silhouettes/palettes: green beetle, gold pyramid, cyan crystal star, orange mechanical dragon, magenta AI drone, violet fracture citadel. State changes must use silhouette/pose as well as color. Timed interpolation, emitter buildup, controlled recoil and a phase-segment ring provide continuity. Reduced-motion preserves hard state contrast.

Attack stages: warm warning (arrow/striping, exact imminent collision footprint), bright active core with a themed effect, then a short non-dangerous recovery. Falling projectiles have directional tails and distinct status motifs. Instant effects need visible lock-on feedback. Summons and shields receive readable activation rather than a generic red rectangle. All warning and active shapes must originate in simulation geometry, including center safety gaps. Cosmetic clocks must pause with gameplay and never change damage, cooldowns, difficulty, stage shapes or save data.

## Reference and prompt set

Use existing generated boss source as identity reference. Built-in image generation creates the new raster poses and effect sequences. Exact production prompts and inspection/validation observations are recorded alongside the build below.

## Integrated assets and animation

- 54 authored pose regions and 24 shared raster VFX frames, each distinct and nonempty, with four fully transparent gutter pixels confirmed at every packed cell edge. Boss atlas cells are 192×192, VFX 128×128, center pivot (.5,.5), source alpha retained. Shared row framing keeps armor/core scale consistent instead of stretching each pose independently.
- Body atlas: 1728×1152. VFX atlas: 768×512. The old 24-pose atlas remains in the source bundle for reference but is no longer loaded. Total six runtime textures: 17.0625 MiB decoded, approximately 1.96 MB compressed (see manifest for exact bytes), under the 24 MiB ceiling.
- State evaluation uses simulation time, telegraph progress and actual attack/hurt events. The defeat clock advances only while unpaused during the existing result delay. Idle articulation, two-stage charge blend, fire → recoil → recovery, displaced armor, weak-core reticle and themed wreck effects replace four shared static poses. Phase segments and shape-coded state glyphs add non-color cues.
- Edge-case review corrects root/eye/scan/freeze warnings to raw hazard or lock extents at narrow-paddle arena edges; projectile paths stay conservative and their visible core outlines match the actual shot radius.
- Lethal columns retain exact active bounds and a visible center lane. Warning and active stages use different line patterns/brightness. Freeze uses a floor lock-on/ice impact, falling shots use status-specific raster motifs and direction tails, and newly spawned bricks/blockers get a bounded activation burst. Summons/shields use local preparation rings rather than false full-board damage zones.
- Sprite packing corrected AI weapon tips leaking into the dragon row and clipped neighboring VFX column bleed. These were import defects found in native in-game inspection, not handled with opaque backdrop patches.

## Rebuild and handoff

Run `node scripts/build-block-scifi.cjs <initial-generated-source-dir>` for the base atlas when needed, then `node scripts/build-block-boss-art.cjs` to apply v6. The latter reads full-resolution `source-art/boss-v6/*-source.webp` masters committed with the code. Original generated PNGs and exact built-in generation prompts are additionally included in the downloadable asset/source bundles (`prompts.json`). No CLI/API generation fallback was used.

`boss-motion.json` provides row IDs, nine pose names, fixed pivot, source row bands and frame rectangles. The downloadable asset pack contains transparent PNG spritesheets, optimized runtime WebP atlases, metadata, original PNGs and prompts. The full source bundle includes the renderer and exporters.

Boss Lab uses the same engine attack constructors and renderer in an explicit practice-only preview gate. Choose a boss, phase, state/attack or automatic sequence; toggle reduced motion; switch to actual gameplay with the play button. Simulated preview state controls are absent unless the test flag is enabled and reject campaign runs.

## Validation

- 69 automated engine/level/optional-choice/silhouette/DOM/presentation checks pass (20 + 7 + 11 + 7 + 16 + 8).
- 18 paired old/new boss phase simulations, 1200 fixed steps per case with laser contact, retained identical physics snapshots; visual metadata and laser hit feedback do not change cooldowns, damage or collision gates. See `block-boss-physics-parity.json`.
- Asset audit validates all 78 new regions, full-alpha gutters and texture budgets (`block-boss-atlas-audit.json`).
- Native Canvas renders all six bosses × six key state captures in normal and reduced presentation, plus all existing skins/boosters, six boss phases and 625 atlas mappings. Checked charge, fire, hit, weak and defeat against dark game lighting. No browser/device performance measurement is claimed.
- Boss Lab smoke checks cover six boss choices, automatic state order, practice gameplay handoff and return; Level Lab three-version comparison and embedded startup also pass.

Remaining validation: actual mobile GPU frame time, browser layout/touch handling and whether fresh players can identify each attack before taking damage. Particle/overlay budgets are structural limits; they are not measured GPU sign-off.
