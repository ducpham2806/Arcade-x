# Block Breaker — 96-level campaign rebuild v3

This is a review build on the Block Breaker branch. Keep production merge/deployment behind the user's existing approval requirement.

## Intent and source audit

Let players read two entry lanes, choose a flank or attack a chain/reactor, then enjoy a short release before the next density/precision challenge. Each sector adds space, armor and interacting mechanics before its three-phase boss. Stage 5 and 11 are release/collection beats; stage 10 teaches precise returns with three lives instead of an abrupt one-life gate; stage 15 combines the sector's lessons.

The prior data repeatedly dropped from 50–70 blocks to 22–25, used the same 19-target shield for every boss and assigned 71-second boss pars despite HP increasing from 60 to 180. These are source-audit observations, not human playtest findings. The old/new blockouts are inspectable in the offline Level Lab; no new art was authored during the level-design pass.

## Implemented layout grammar

| Sector | Normal-stage targets | Grid columns | Mean normal targets | Normal par budget |
| --- | --- | --- | --- | --- |
| 1 | 36–53 | 9 | 44.3 | 66–112 sec |
| 2 | 48–65 | 10 | 55.9 | 79–125 sec |
| 3 | 60–82 | 11 | 70.1 | 92–139 sec |
| 4 | 72–94 | 12 | 82.1 | 106–155 sec |
| 5 | 84–106 | 13 | 94.1 | 122–169 sec |
| 6 | 96–118 | 14 | 106.1 | 137–186 sec |

- Six physical playfield shapes: open, clipped shoulders, asymmetric steps, waist, reactor recesses and hangar. Wall geometry is identical in simulation and rendering. Playfield width grows from 384 to 432 logical pixels, grid depth from 7 to 14 rows. The viewport stays 480×720 for stable mobile controls. Size variation means actual field width, grid depth and geometry, not camera zoom or a stretched UI.
- 15 layout grammars (gateway, wings, chevrons, reactor, constellation, staircase, rings, batteries, trident, precision, cascade, fortress, diagonal, citadel, relay), with seeded placement and sector variations. They are rule-authored arrangements, not 96 individually hand-drawn maps.
- Two entry lanes, at least 194 logical pixels of reaction area under the deepest static grid; moving bricks reserve their full travel path. Permanent shoulders end well above the paddle band. Source cell dimensions are at least 30×23 logical pixels.
- Hard/steel proportions grow by sector, alongside ball speed 8.2→11.335 and paddle scale 1.13→0.969. Difficulty is an upward campaign envelope with deliberate release beats, not a strict increase on every individual stage.
- Chains and electric groups are rebuilt from actual occupied cells; portals stay paired; keys accompany locks; picture colors and rhythm metadata match the new grids. IDs, sector gates, existing reward values, save ownership and best records remain compatible. Older best scores are retained, not recalculated.

## Pacing and fairness changes

- Capsules are tied to destroyed blocks, with at most two active, a five-second cooldown and a per-level budget. No early negative capsules; later penalties enter progressively. Constant magnet drops and extra-life farming are removed from the campaign pool, while those booster effects remain supported.
- Regeneration is limited to one revival per brick; summoned boss brick waves are capped at two. Portals are transport geometry and no longer block completion.
- The last few targets are highlighted after 16 seconds without progress; a perfect central paddle return then aims toward a remaining target while preserving ball speed. Longer repeating trajectories get a small angle correction after 12 seconds without progress. Neither feature teleports the ball nor auto-clears targets.
- Bosses use 24/28/32/36/40/44 shield targets and 18/23/28/33/38/43 HP. Damage opens with the last 22% of the starting barrier remaining. Attack pressure begins after the first quarter of the barrier is broken, preventing the invulnerable boss and its hazards from blocking the approach simultaneously.
- Fire columns announce their exact immutable collision strips and preserve a center corridor wider than the paddle by 32 pixels. Sand/shatter projectiles and freeze zones show their actual projected lanes. Freeze is avoidable and lasts 0.65 seconds; orbit shields have a 3.5-second active window. Combo attacks resolve their identity before the warning, so warnings match execution.
- A conservative outer-boundary/depenetration fix prevents the ball escaping at corner contacts. Falling through the bottom still loses a life normally.

## Verification and limits

All 96 layouts passed cell bounds, duplicate/overlap, permanent-wall clearance, moving sweep clearance, target reachability, metadata references and sector mean-density progression. There are 20 engine checks, 7 new level/physics regressions and 12 DOM integration checks. Native Canvas2D tests exercised the six boss renderers, all owned skin mappings and all 20 booster states. The Level Lab smoke check covers 96 previews, before/after toggle, embedded campaign revision and practice-frame mount/close.

The final two-seed predictive-controller audit ran 192 complete games: 191 wins, one loss on sector 4's boss, zero 300-second timeouts. Every stage won in at least one seed. Winning-run medians were 67.98 and 62.30 seconds; 90th percentiles 100.90 and 95.55 seconds. The controller predicts return positions, chooses shot targets, catches useful capsules, uses earned beam skills and reads announced hazards. These are regression/controller results, NOT human win rates or verified player completion times. Design pars are soft budgets, never a failure timer. Human targets remain roughly 1–2 minutes early, 1.5–3 minutes mid/late and 2–3.5 minutes for bosses, pending playtests.

Real-browser layout, human difficulty/readability, device FPS and full-launcher end-to-end tests remain unverified in this environment. Native renderer inspection and structural checks do not replace them. First manual focus: sector 2 boss shield openings, sector 4 boss fire/catch tradeoff, sector 6 narrow target legibility and the final cleanup assist.

## Suggested next work, not yet implemented

1. Optional risk/reward branches: a visible reactor or side cache gives a booster but opens a harder rebound lane. Keep the campaign completion path clear and optional rewards distinguishable.
2. Secondary mastery goals: first-shot chain, three perfect catches, or a clean return streak; keep them optional so the main campaign is not stopped by a missed challenge.
3. Choose one temporary reward after a boss: wider paddle, one rescue shield, or a short skill boost for the next sector opener. Avoid persistent stat inflation and preserve a fair base campaign.
4. Record anonymous local playtest metrics (time, retries, remaining targets and loss cause) and tune pars/armor from actual player runs before making the draft live.

## Reproduction

`node scripts/build-block-levels.cjs` rebuilds the deterministic campaign and synchronizes `dist/data.js`. It preserves IDs/reward contracts from the current campaign. `node scripts/audit-block-levels.cjs` writes the structural audit. `node scripts/simulate-block-levels.cjs 1` (and `2`) writes controller reports; optional arguments select comma-separated zero-based stage indices and a maximum duration.

`node scripts/export-block-scifi.cjs /absolute/game.html` exports the self-contained game. `node scripts/export-block-level-lab.cjs /absolute/game.html /absolute/lab.html` exports the before/after inspector and embedded practice game. `docs/block-level-before.json` preserves the original blockouts for comparison.
