# Boom Buddies — art production v3

## Art direction and budgets (before production)

Retain the ten chapter identities and all gameplay hitboxes. New art uses cohesive 16-bit fantasy pixel styling, dark navy stepped outlines, readable silhouettes and upper-left lighting. Enemy art occupies at most one tile; boss footprint remains 3×3 tiles. Use shape as well as color to identify gameplay items.

| Category | Production source | Runtime budget | Animation |
| --- | --- | --- | --- |
| Boss | one transparent 4×2 sheet per boss | 160×160 per cell, ≤1024×1024 per sheet | idle, alternating walk, anticipation, impact, recovery, weakness, defeat |
| Enemy | transparent roster atlas | 64×64 per cell | four directions from front/back/side art; bounded procedural squash/stride/flap driven by movement and attack timing |
| Items/boosters | transparent icon atlas | 64×64 per icon | gentle bob only, no full-screen glow |
| Cosmetic icons | transparent themed atlases | 64×64 per icon | static UI |
| Wearable overlays | existing 48×64 anchor contract | new icon-derived layers at fixed head/torso/shoe/back anchors | attach to player in all directions with explicit layering |
| VFX | canvas primitives / existing sprite atlas | ≤48 local sparks/decals, ≤3 transparent layers | bind to existing gameplay warnings, no extra damage cells |

Use WebP/PNG alpha with no mipmaps for UI/sprites; nearest-neighbor canvas sampling. Decode atlas images once per renderer; no rasterization or texture allocation inside frame loop. Keep existing art as fallback until replacement images decode. Do not change save IDs or cosmetic ownership. 3D mesh LOD and BC/ASTC texture imports do not apply to this Canvas2D web pipeline.

## Production and verification

This document will record generated asset provenance, exact prompt set, validation results and remaining runtime limits when production completes.

## Implemented coverage and playback

- 10 distinct boss atlases × 8 authored poses (80 poses): idle, alternate steps, windup, impact, recovery, weak and defeat. Each boss's three attacks share its windup/impact artwork; these are not 30 bespoke action strips. Idle shuffles do not add AI movement or alter world hitboxes.
- 20 enemy species with front, back and side sprites; left mirrors right. Ground stride, slime squash and flying bob/flap are procedural rigs, not independent hand-drawn walk-frame sequences.
- 24 distinguishable item/booster icons; drill/pierce and core/light no longer reuse flame/gem artwork.
- All 99 cosmetics: 59 wearable pieces, 14 bomb skins, 13 explosion styles, 10 pets and 3 footprints. New wearable art is anchored in all four directions. Side/back apparel uses the same accessory artwork with adjusted layering; it is not four bespoke directional garments.
- Pip: 16-cell generated source, 4-direction idle/walk/hurt routing. Left-facing gameplay mirrors the consistent right row to avoid a direction error in one generated cell.
- 48 themed tiles/props covering the 10 chapters, hazard tiles and portals.
- Boss impact now follows the 1.5s warning (2s for final boss); weakness cannot hide the anticipation frame. The weak-status text respects the same opening delay.

Runtime files: `public/boom/art-v3/`. Exact built-in imagegen prompt set: `public/boom/art-v3/prompts.json`. Original generated PNGs were retained in the session's generated_images directory; runtime lossless WebP files are extracted and resized mechanically by `scripts/build-boom-art.mjs`. No third-party asset pack is used for the new art.

## Validation and current limits

JavaScript syntax checks passed. Asset audit passed all 215 outputs: 10 boss sheets, 10 boss portraits, 3 directional enemy atlases, 20 enemy portraits, 24 item icons, 99 cosmetics, 1 Pip sheet, and 48 tiles. Total 4,411,648 bytes compressed; decoded image budget 12,386,304 bytes (~11.8 MiB). The checks cover nonempty images, alpha gutters, file mappings, 80 unique boss poses, 80 enemy direction draw paths, finite/in-bounds atlas rectangles, balanced canvas state, costume mappings and boss telegraph timing. All 8,000 campaign blockout checks also passed.

Offline art inspector startup was exercised with a minimal DOM/canvas test double: 10 boss cards, 143 inventory cards and 4 outfit directions resolve embedded assets. This is not a browser rendering test. Browser QA could not reach the local preview (connection refused); no full Arcade-x build, mobile GPU/FPS profile or end-to-end combat playthrough has been completed. Keep this change in draft review pending those checks. Existing art files remain available as renderer fallback.

Run `npm run test:boom-art`; `npm run preview:boom-art` serves the gallery plus local game at port 4179 when the full repository is present. `scripts/export-boom-art-review.mjs` creates a self-contained offline art inspector; it deliberately does not claim to be a live launcher release.

## Current player follow-up

Pip's active body renderer now uses the separate [v4 character specification](BOOM-PIP-V4.md): 16 movement +20 action cells, true rear artwork, shared foot pivots, pose-following wardrobe landmarks and event-driven animation clocks. The original v3 Pip sheet remains a loading fallback. The additional three images total 194,306 compressed bytes /1,363,968 decoded bytes. Combined v3+v4 decoded assets remain about 13.1 MiB. This does not change the browser/performance verification limitations above.
