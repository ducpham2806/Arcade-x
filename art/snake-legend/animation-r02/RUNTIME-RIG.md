# R01 · runtime articulation follow-up · 14/11/2026

The owner's request is to finish R01 content. This session has no image-to-video tool. The original video brief and failed route records stay intact; no video clip, generated animation sheet, or final art approval is claimed.

The implementation reuses the existing A1 painted master via Canvas2D. `character-motion.ts` authors the motion curves and source registration in code; it does not rewrite the source PNG or claim independently painted frames.

- Tiểu Xà: blink3.2s, tongue1.2s, pickup chew0.3s, Dash expression, fixed loss expression and win smile. Root, neck registration and scale1.35u are retained.
- Nhện Mẹ:8 separately registered leg slices around the unchanged body/face, idle1.6s; brace/attack/recover/weak/hurt/phase-change/defeated follow engine state/countdown. Shared master pivot(.5,.3), size7.2u. No animation selects hits, changes timing or moves colliders.
- Reduced-motion uses the original mother still and disables cosmetic snake blink/tongue/chew and victory bob. Essential target/ribbon/HUD states remain readable.
- Zero new textures, decoded image bytes, RAFs, timers or listeners. Boss body9drawImage calls (8limbs +1body); reduced1. No blur/filter or new offscreen surfaces.
- Light/dark24/48/96px review and real renderer state/phone screenshots accompany the code. Pixel/loop/fallback/checkpoint checks are automated; final human art/motion and physical device profiling remain open.

This adds an explicit runtime-rig route to the content plan; it does not relabel the original A1 atlas metadata as animated source art. [QA](../../../docs/qa/SNAKE-R01-CONTENT-2026-11-14.md).
