# R01 boss feedback — 2026-11-02

Nhện Mẹ now communicates its existing encounter states in the arena and HUD.
This is a presentation-only iteration on the approved A1 still atlas. It is not
an authored animation sheet or the final A1/A2 art sign-off.

## Player-facing changes

- Telegraph uses a continuous amber capsule with direction chevrons and a charge
  arc. Attack uses a solid red capsule with a light centerline. Both use the
  engine's locked shot endpoints and exact 0.65u shot radius, including round caps.
- Weakness has a locked icon while closed, a distinct DASH target while open,
  and a ring showing the remaining window. A timed HUD cue stays visible even
  when the boss is outside the camera; six pips show successful hits.
- Pha 2/3 HUD tasks name the trap, length requirement or A/B post task. A/B labels
  show active anchors; a short line shows the engine's 0.35s simultaneous hold.
- Small still-image poses distinguish charge, firing, weakness and recoil.
  Breathing/recoil stop with reduced-motion preference. All motion/countdowns
  read fixed simulation time, so pause and checkpoint restoration freeze them.
- On boss arenas at canvas widths <=480px, the minimap is 56px in the lower right.
  The former 86px map covered the boss near the upper right in the 360px review.
- Posts and weakness targets now draw once in the foreground instead of twice.

No engine, encounter, map, checkpoint format, save protocol, reward, replay digest
or attack-timing changes are included. A1 sprite fallback remains available via
Art: gốc; new cues work with both art modes. QA entries cannot reach account saves.

## Canvas / asset budget

| Item | Limit for this iteration |
| --- | --- |
| New textures / decoded texture bytes | 0 / 0; reuse existing 512x512 RGBA A1 atlas (1 MiB) |
| Boss / post sprites per draw | 1 / 2; posts previously submitted twice |
| Extra persistent particles | 0 |
| Shot ribbons / direction chevrons | 1 / at most 7 for the engine's 24u shot |
| Large translucent fills | One ribbon and one small contact shadow; no full-screen flash |
| Blur, filters, offscreen surfaces | 0 |
| HUD updates | Existing <=10Hz HUD cadence, no added RAF/timer/listeners |
| DPR | Existing cap of 2 remains |

The Canvas 2D path is shared by mobile/desktop; there are no custom shaders or
3D LODs. These are structural budgets, not measured physical-device GPU timings.

## Verification and reproduction

`npm run test:snake-boss` exercises real encounter tick transitions, locked aim,
countdowns, all 24 phase/state combinations, unchanged checkpoint capture across
render calls, balanced canvas save/restore, round capsule width, art fallback,
reduced motion and bounded meters. Journey and cloud regression tests pass.

`/tests/snake/boss-review.html` is an isolated visual fixture using the real engine
and renderer with explicitly selected presentation states. Desktop and 360px views
were inspected for telegraph, attack, weakness and hit response. `?live=1` instead
mounts the real story screen and level 1-10, with prior levels unlocked only in a
temporary memory store and no backend. The actual intro -> play -> pause -> resume
and mobile HUD/control layout were inspected there. At simulation time 12.3s,
the real HUD showed the open weakness window with 1.9s remaining. This does not certify a human
boss clear, physical device performance, or full launcher authentication.

`npm run build`, `npm run build:snake-preview`, `npm run test:snake-preview` and
`npm run export:snake-journey` validate production exclusion and the updated local
HTML export. The package check requires both build outputs; an initial attempt
before the main build stopped on missing `dist/assets`, then was rerun in order.

The updated standalone HTML also boots the chapter journey in Chromium. Visual
review evidence: [telegraph fixture](snake-boss-feedback-1793611861058.jpg).

## Next gates

Authored character/boss animation frames, terrain/props/audio polish, human
playtests, physical Android/iOS/Safari checks and full-account launcher UI QA stay
open. Do not mark M2 complete or publish the prototype from this iteration alone.

Follow-up: [Interactive props A2](SNAKE_PROPS_A2.md) adds exit/switch state art
and a visible puzzle doorway. Character animation remains open with a motion brief.
