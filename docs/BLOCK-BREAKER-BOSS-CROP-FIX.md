# Boss sprite cropping fix

Player report: parts of several bosses disappeared during some animations. The source artwork contained the missing parts; the uniform source grid used by the importer cut through them. Previous post-pack alpha-gutter validation could not detect content already discarded before packing.

## Root cause and correction

- The source layout is not a strict 9×6 grid. Wings/weapons cross column midpoints, and void antennae begin above the fixed final row boundary. Reproducing the old import against owned source pixels finds cuts in 34 of 54 poses, losing 10,509 high-alpha source pixels.
- A connected-alpha ownership importer now separates complete source objects. High-alpha connected armor stays attached to its owning pose across old grid seams. Bounded growth retains antialias/glow while excluding adjacent characters. Per-boss source-space core anchors and a shared extent keep all nine poses registered at one scale. No character repaint or new generated art is required.
- All 631,234 source pixels with alpha ≥72 are assigned and copied, with zero unassigned or lost high-alpha pixels. Loose emission below the threshold is grown up to 16 pixels around its owner; source conservation does not claim that diffuse background haze is character detail.
- Each runtime cell retains 12 transparent pixels of packing margin. The body render quad allows the full wingspan; it does not change the simulation collider. Clone positions now stay inside the visible canvas, including movement extrema and hurt rotation.
- A versioned physical texture (`boss-v7.webp`) prevents reuse of the old cropped texture. The 54 logical pose IDs remain compatible; VFX, damage and timing are unchanged. Texture memory remains 17.0625 MiB decoded under the 24 MiB budget.

## Verification

`node scripts/check-block-boss-crops.cjs` independently checks source-owned bounds before resizing, source pixel conservation and padded-viewport renders. Coverage: all 54 poses, idle/charge/fire/recoil/recovery/hurt/weak/defeat samples, all three phases, left/center/right movement positions, normal/reduced presentation and clone overlays. All 2,484 renders have zero painted pixels outside the visible canvas. The fixture also detects the original rectangular-cut defect, so padding an already-cropped frame cannot satisfy the import check. Report: `block-boss-crop-regression.json`.

The full 54-pose contact sheet and 36 in-game state captures were visually reviewed. All 625 atlas mappings, existing skin/booster states, eight presentation checks and 16 DOM checks pass. Both exported labs pass startup/control smoke checks. These are native Canvas/DOM checks; no browser/device performance measurement is claimed.

Boss Lab now includes a direct selector for each of the nine original poses as well as animation playback. Asset handoff includes the complete atlas and 54 individually extracted PNG cells, eliminating the need to re-slice an approximate source grid.

## Rebuild

Run `node scripts/build-block-boss-art.cjs`, `node scripts/check-block-boss-crops.cjs` and `node scripts/audit-block-boss-art.cjs`. The importer reads the existing full-resolution source masters under `source-art/boss-v6`. Keep `scripts/boss-frame-import.cjs` and `boss-import-audit.json` with the handoff. Rebuilds must reject missing bodies, unexpected ownership spread, source-bound truncation or loss of source high-alpha pixels.
