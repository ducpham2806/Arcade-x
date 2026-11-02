# R01 interactive props A2 — 2026-11-02

The exit and puzzle switch now use painted, state-specific props matching the
existing A1 stone/jade palette. The exit lights when the engine's goal is ready;
the switch changes from raised jade to depressed gold when latched. The closed
puzzle barrier reuses the existing fence texture within its original rectangle.
Its open footprint is a light dashed outline, without a solid-looking rail.

Ground sprites stay below the snake; state labels sit in the foreground with a
10px minimum in the following camera. Primitive fallback markers remain if art
is disabled or a texture has not loaded. Timed bonus 1-8 still has no exit marker.
All rules, triggers, content signature, checkpoint format and network behavior
are unchanged. This is an A2 prop candidate, not character animation completion.

## Art source and runtime budget

Generated through the **built-in imagegen tool**, route `host_image`; no external
API key or video service was used. The tool did not expose a returned model name
or USD cost, so neither is inferred. Exact prompts, source images and hashes:
[art/snake-legend/props-a2/generation.json](../art/snake-legend/props-a2/generation.json).

- [Exit prompt](../art/snake-legend/props-a2/exit-prompt.txt) /
  [source](../art/snake-legend/props-a2/exit-states-source.png).
- [Switch prompt](../art/snake-legend/props-a2/switch-prompt.txt) /
  [source](../art/snake-legend/props-a2/switch-states-source.png).
- [Runtime atlas](../art/snake-legend/props-a2/story-props.webp): 98,074 bytes,
  SHA256 `9ba1ff421d6a4a431194cc96ad6b8a826e54e92fd3b589a98f5c6e6ea99d2e42`.
- 512x512 RGBA, 1,048,576 decoded bytes; budget <=180 KiB encoded / 1 MiB decoded.
  Two 192x192 exit frames, two 128x128 switch frames, shared center pivots.
- At most two prop sprites in an authored level, no new particles, filters, RAF,
  network requests or timers. The existing draw loop supplies simulation time.
- [32/48px review](../art/snake-legend/props-a2/game-size-review.png) was inspected
  on light meadow and dark green; no per-frame stretch or per-action size change.

## Source warnings and normalization

Raw generated strips both have native RGBA transparency, at 1774x887. These
published source-QA warnings are retained verbatim by ID/value/threshold:

| Report | ID | Value | Threshold | Resolution |
| --- | --- | --- | --- | --- |
| `exit-spill/sheet-qc.json` | `safe_frame` | `2` cells | `0` | No source edge or cell crossing; normalized into padded 192px cells |
| `exit-spill/sheet-qc.json` | `faint_specks` | `{"floor_px":8409,"detached_components":0}` | `0` | Alpha hygiene removes source alpha <=4 |
| `switch-spill/sheet-qc.json` | `safe_frame` | `2` cells | `0` | No source edge or cell crossing; normalized into padded 128px cells |
| `switch-spill/sheet-qc.json` | `faint_specks` | `{"floor_px":8149,"detached_components":1}` | `0` | Alpha hygiene removes the floor haze and one detached pixel |

Reports are under [props-a2](../art/snake-legend/props-a2/). The minimum raw margin
is 8.91% for exit and 12.85% for switch, below the advisory 15% safe margin; no
art was clipped. Both final `pipeline-meta.json` envelopes pass strict structural
QC: 2 valid frames each, 0 empty / clamped / output-edge / source-edge frames.
Body-height CV is 0 for both; the optional CV/anchor thresholds were not enabled.
Visual comparison, rather than those skipped metrics, was used to review identity.

A first preserve/bbox processor attempt rejected clamped/edge-touching output and
published no bundle. The accepted isolated prop states use shared-scale fit and
center registration with alpha hygiene. This is not a gait/character loop.

Rebuild with `npm run build:snake-props`; processed PNGs are the alpha source of
truth. `scripts/build-snake-props.py` packs them and regenerates the embedded TS
asset. Duplicated raw copies/GIF intermediates from the processor are ignored;
canonical raw sources, frames and QA are retained.

## Verification

- `npm run test:snake-props`: atlas equality and budgets, original gate collision,
  real switch latch, checkpoint decode, 20 level/state rendering cases, engine
  immutability, bonus suppression and failed-image fallback.
- Boss, journey and cloud regression tests pass. TypeScript, preview build and
  preview-package checks pass. The public game catalog still excludes Snake.
- Real renderer inspected on desktop and in a 360x800 iframe: exit closed/ready,
  switch raised/latched, barrier closed/open. The review page explicitly labels
  its hand-selected states and never writes account progress.
- [Screenshot](snake-props-a2-1793616217697.jpg) shows the new ready exit in the
  actual 1-1 arena. `/tests/snake/props-review.html` reproduces the fixtures.
- Updated single HTML booted the journey and opened the 1-1 intro with the new
  A1+A2 renderer. It contains all ten levels and local-only storage. Browser
  QA is Chromium/iframe coverage, not physical Android, iOS or Safari sign-off.

## Animation and remaining gates

Character animation remains open. The media capability check found no video
route; `route_media.py resolve --kind video` returned `status: no-route`, exit 3.
No substitute character animation or generated clip is claimed.
[Motion handoff](../art/snake-legend/animation-r02/MOTION_BRIEF.md) records the
identity, actions, durations, pivots, frame budget and acceptance requirements for
Tiểu Xà and Nhện Mẹ. Each also has a prepared idle job with extracted `input.png`,
`prompt.txt` and `job.json`. Existing A1 stills stay intact.

Next priorities remain authored character/boss animation when a route is
available, audio/terrain polish, full-account launcher UI QA, physical-device
performance and human playtests. M2 is not signed off; no production deploy.

Follow-up: [Audio feedback R02](SNAKE_AUDIO_R02.md) adds Dash/weakness/phase cues,
explicit sound preview and bounded mixer lifecycle handling.
