# Dungeon Titan — raster fantasy v5

## Direction and budgets before production
Reference: Bomb Buddies art v3 and Pip v4, read from current review files on 2026-10-16. Borrow textured raster rendering, readable silhouettes and authored pose changes. Dungeon Titan uses original medieval fantasy designs, not copied Bomb Buddies characters.

Target: mobile web, portrait and desktop; stylized painted pixel sprites, weathered bronze, moss, leather, ivory, localized magic colors. No flat polygon/vector characters.

| Category | Production source | Runtime budget | Animation |
|---|---|---|---|
| Eight bosses | Transparent 4×2 atlas each | 8 × 256² frames; ≤400 KiB per sheet | idle, two steps, windup, attack, recovery, exposed, defeat |
| Hero and six allies | Transparent party atlases | 192² per frame; ≤1 MiB total | idle, windup, attack, hurt |
| Regular enemies | Four transparent atlases | 24 enemies × 2 × 192²; ≤1.5 MiB total | idle, attack |
| Inventory and skills | Transparent icon atlases | 128² per icon; ≤600 KiB total | static |
| Eight environments | Two painted environment atlases | 512×768 per biome; ≤1.5 MiB total | static, no continuous GPU filter |
| Combat FX | Transparent atlas | ≤256² per frame; ≤300 KiB | one active overlay at a time |

Total compressed runtime art target ≤8 MiB. UI sprites no mipmaps in DOM; CSS size scaling, transparent padding and consistent foot anchors. Use WebP alpha. Source sheets retained separately. 3D mesh LOD and BC7/ASTC rules do not apply to this 2D DOM renderer. No 60 FPS claim without device profiling.

Acceptance: correct roster coverage, real alpha, no clipped frames, consistent cell boundaries, attack state wired to gameplay, pause and reduced motion support. Browser/device visual review remains required before production sign-off.

## Delivered coverage

- 8 boss identities × 8 authored poses = 64 frames.
- Swordmaster + 6 allies × 4 authored poses = 28 frames (idle, windup, attack, hurt). Allies do not have eight-pose boss sequences.
- 24 regional enemies × 2 authored poses = 48 frames. Regular enemy defeat uses the idle image fading out; it is not an extra hand-painted death frame.
- 24 equipment/loot icons: five hero slots, eighteen profession-specific ally slots, one chest. Procedural rarity variants use the same base silhouette with rarity border and level labels.
- 25 skill icons: seven player skills + eighteen ally skills.
- 36 interface icons and resource symbols.
- 8 independent environment paintings, cropped from two source sheets.
- 3 combat effect sequences × 4 frames = 12 frames.
- Total: 245 cells across 26 runtime WebP files.

## Integration behavior

Boss pose uses encounter time, strike timing and successful parry. Windup is visible before strike; strike/recovery precede exposed pose. Early successful parry overrides attack with exposed pose. Defeated boss image remains briefly as a fading visual echo; rewards/progression are unchanged. Hero attack follows manual hit time. Allies anticipate their skill cooldown and play their attack pose on skill-index change; normal DPS has a brief periodic attack cue. Regular mobs alternate idle/attack visually without introducing new damage mechanics.

CombatFX renders at most one extra overlay: slash for manual hits, magic for a just-cast skill, parry with priority. Management pauses the engine clock and character frames. Reduced motion hides the transient effects and CSS hit motion. Gallery animation has its own pause and frame selector, and pauses when the document is hidden.

## QA boundaries

PNG source sheets are AI-generated and have been reviewed as raster images. Adaptive alpha analysis sets crop rectangles; uniform output cells include transparent gutters. Runtime sprite geometry is metadata-driven. Texture dimensions, alpha and nonempty frame coverage are checked; visual contact sheets are inspected to catch cross-cell fragments. The contact sheets are asset inspection, not browser screenshots.

DOM tests verify no SVG character/icon elements in the current HUD, upgrade/hold attack/save/menu behavior, gallery category coverage and boss timing. They do not establish exact mobile layout, loading latency or 60 FPS. Source and runtime sheets are included for further art iteration.

## Final measured file budget

Runtime art: 3.38 MiB across26 WebP files; full decode if all are resident: 45.69 MiB RGBA. Largest sheet 200 KiB. This is file/decode arithmetic, not a GPU profiler measurement.

Three frost enemy pairs were authored independently to remove overlapping magic at source atlas row boundaries; the final enemies-c atlas substitutes those six frames.
