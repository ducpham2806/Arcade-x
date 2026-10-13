# Blossom Blast: Nature's story — integration audit

Date: 2026-10-13. Base main: `05343c115527645df1c4283b7a4af5bf0c3aa838`.

## Findings

Before this change, all 21 runtime source files under `src/games/hex-match/` were byte-identical to `blossom-upgrade-review-source.zip` (reviewed v0.8). The engine upgrades were not deleted. The archive contains an unused duplicate source animation specification; its canonical runtime counterpart remains at `public/blossom/anim_spec.json`.

The production launcher still presented an obsolete Hex guide and artwork. A mobile hosting badge intercepted its start button. The compact preparation popup also assumed the full browser height, so its footer could be clipped by the smaller launcher game frame. A fresh browser could open the upgraded 100-level campaign, confirming the core game was present. Cache as a cause of older visuals was not established.

## Changes

- Rename launcher, game identity, catalog display, exported garden caption and generated challenge/quest text to **Blossom Blast: Nature's story**. Retain the `hex-match` engine ID and save keys to preserve progress.
- Use the supplied `png/icon/app_icon_1024.png` and `png/icon/logo_blossom_blast.png` already present on main. Keep the original logo artwork and add the subtitle as text.
- Replace obsolete launcher Hex artwork and instructions. Enter Blossom directly into its own campaign/preparation/tutorial flow.
- Make preparation adapt to the actual game frame; reserve space for the visible Netlify hosting badge. Verify portrait and landscape start actions remain clickable without scrolling.
- Keep cloud availability/access rules; normalize only Blossom display title and description so older catalog metadata cannot reintroduce Hex branding.
- Label this release 2.7.0. No save reset, database migration or cache deletion.

## Preserved upgrades

100 levels; tutorials for new goals, blockers, specials and bosses; centered tutorial cards; compact preparation; automatic regional companions; supplied sprite VFX including rainbow color targeting and sun three rows/columns; uninterrupted ordinary moves; animation completion barrier; one combined goal/remaining-move/reward result popup; paged storybooks; responsive garden placement/deletion and persistence.

The standalone review intentionally grants test inventory and opens campaign chapters. Production continues normal campaign progression.

## Validation

- TypeScript check and production build passed.
- 92 Playwright checks passed: Blossom engine/UI/tutorial/sprite/standalone and launcher integration, launcher theme/offline review, Rainbow engine and hosting-badge regression.
- New integration tests cover 320×568, 390×844, 768×400 and 1280×900 with a simulated hosting badge, no duplicate guide, loaded supplied images and preparation without scrolling.
- Binary icon/logo hashes match the existing main assets. All runtime Blossom files except presentation CSS/header remain identical to reviewed v0.8.

This merge is marked `[skip netlify] [skip ci]`; it does not request publication.
