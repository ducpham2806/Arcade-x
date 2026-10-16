# Block Breaker — Orbital asset overhaul

Review branch only. Do not merge or deploy production without the user's approval.

## Direction and budget decided before production

Original industrial orbital-station aesthetic: titanium armor, emissive cyan cores, amber/magenta sector accents. White-blue ball has priority; low contrast backdrops and bounded particles preserve tracking. References consulted: Shatter Remastered Deluxe (https://www.nintendo.com/us/store/products/shatter-remastered-deluxe-switch/) and Arkanoid Eternal Battle (https://www.microids.com/game-arkanoid-eternal-battle/). References inform genre treatment, not copied assets.

Budget: <=24 MiB decoded textures, 5 cached images, 96 high /48 medium particles, 24 regular effect animations. Low/reduced settings suppress decorative effects. Canvas2D web: alpha WebP/PNG, no mipmaps; 3D mesh LOD not applicable. Mobile frame time remains to be measured.

## Implemented

- 90 generated source cells: 36 core objects, 24 icons (20 boosters +4 controls), 24 boss poses, 6 sector backgrounds.
- All 547 existing named frames map into five shared textures. This is NOT 547 independently generated assets: skins use shared models with hue variants; VFX use code-native expanding rings/shards, boss phase animations share four poses per boss.
- 6 block palettes plus armor, reactor, circuit, resonator and prism structures. Remaining HP is indicated independently of skin color.
- 6 paddle models, 6 energy ball models, 6 obstacles and 6 Orb drones. Existing cosmetic IDs and ownership are retained; previews use the same mapping as gameplay.
- 20 boosters have individual symbols. Negative items use warning triangles, positive items octagonal capsules.
- Six bosses have idle, attack, damaged and exposed-core art; existing telegraph/HP state selects their pose. Defeat fades damaged artwork, not a bespoke death animation.
- Six sci-fi arena backdrops; slim code-native HUD rails, new titanium/cyan UI, concise main screen, one primary play action, compact sector cards, optional control help and full-screen mobile dialogs.
- No balance/physics/save-key changes. Paddle visual width and front edge align with actual collision bounds. Ball retains its bright center and directional trail.

## Validation

20 existing engine checks pass, including 96-stage finite simulation and all boss phases. 11 DOM integration checks pass: startup, play, pause/resume, launcher pause/mute, progression, shop ownership, practice rewards, daily rewards, settings and image mappings. Additional native Canvas2D inspection validates 547 frame bounds, every catalog skin, six bosses and all booster states. Full browser layout, human playthrough and device FPS/GPU profiling remain unverified because browser QA is unavailable in this environment. Do not treat this draft as a verified production release.

Textures: 1,151,571 bytes compressed; 11,894,784 bytes decoded (~11.34 MiB). Includes 4 generated raster atlases and one deterministic VFX/UI atlas. Frame bounds preserve transparent gutters after extraction. Some large source boss extremities approach source cell edges; actual reduced-size in-browser motion should be reviewed before final art sign-off.

## Files and reproduction

Runtime: `standalone/chronicles-realms/dist/scifi-data.js`, `scifi.css`, `assets/scifi/`, modified `app.js` and `index.html`. Game simulation `engine.js` is unchanged. `data.js` remains unchanged and scifi-data overrides only atlas metadata.

`node scripts/export-block-scifi.cjs /absolute/output.html` creates a self-contained playable preview with embedded textures. `node standalone/chronicles-realms/tests/engine.cjs` and `node standalone/chronicles-realms/tests/scifi.cjs`; DOM checks: `node tests/artwork/chronicles.cjs` (linkedom). Raster verification additionally uses @napi-rs/canvas; extraction uses sharp. These are authoring/test dependencies, not runtime dependencies.

The extraction script expects the original imagegen outputs by the filenames recorded in its `files` table. Generated outputs are supplied in the separate source archive, not fetched from a third-party art pack. Runtime files are sufficient to play and export; regenerating is optional.
