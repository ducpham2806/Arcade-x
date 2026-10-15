# Boom Buddies: spatial level design v2

Intent: teach a safe bomb escape, expand into a tactical encounter, then reward route planning and objective completion. Keep existing campaign goals, stats, controls, saves, and rewards.

## Observations from the existing generator

Every stage used the same even/even pillar grid with shuffled wall positions. Terrain was scattered independently of objective interactions. Boss central clearing retained random obstacles/terrain on its surrounding approach. These are source inspection findings, not observations from human testers.

## Implemented blockout rules

| Stage | Space | Intended decision |
| --- | --- | --- |
| 1 | Training grid | Break cover, retreat around a pillar |
| 2 | Duel grid | Bait enemies across intersecting bomb lanes |
| 3 | Collection spine | Use a central connection to reach distributed objectives |
| 4 | Crosscourt | Switch between vertical lanes through a transverse opening |
| 5 | Survival loop | Rotate along two opened side connectors instead of waiting in a pocket |
| 6 | Rescue hub | Connect rescue zones across the central row |
| 7 | Siege grid | Break cover to open new approaches |
| 8 | Boss ring | Circle the 3×3 footprint through an unobstructed perimeter |

All stages keep an eight-cell refuge looping around the opening pillar. Destructible/objective placement excludes it. Opening refuge and objective interactions have no forced-motion or damaging terrain at initialization. Objective slots spread over map depth, retain seeded variation, and never duplicate. Quota repair ensures switch replacement cannot remove walls required for completion. Mirrors only replace retained hard pillars, so chapter 9 cannot overwrite a newly opened route or objective.

Enemies prefer spaced cells away from the player, without terrain or objectives, with a fallback to unique legal cells when density requires it. Their initial activation is staggered at 1.4/1.65/1.9/2.15 seconds. Existing ongoing combat AI remains in use. Boss ring clears random terrain and items while retaining chapter-specific switches and the exit seal. Teleporters remain paired; visit missions retain enough bridge cells.

## Before/after

See [seed-42 blockout comparison](boom-level-blockouts.svg). These diagrams come from actual generator cell data for collection, survival and boss stages before/after the patch. They are not browser screenshots. Colors: gray = hard pillar; brown = destructible; teal = collectible; mauve = terrain; red dots = enemies; green = player. Boss footprint is pink.

## Verification and limits

Run `node --check src/games/boom-buddies/runtime.js` and `node tests/boom-buddies/level-design.cjs`.

The test evaluates the recovered generation functions, all 80 campaign definitions × 100 seeds. It checks opening refuge, destructive-path connectivity to gate/objectives, mandatory object/wall counts, initial enemy count/uniqueness/distance, boss perimeter, paired teleports, bridge quotas, and reproducibility. Boss/enemy metadata is stubbed for this spatial test; it does not execute rendering or simulate complete combat.

No full frontend build, browser screenshots, timed combat playthrough, or human playtest has been completed in this workspace. This is a blockout iteration for review, not a verified live release. Required playtest: stages 1/3/5/6/7/8 and chapter 9 at desktop and mobile sizes; check first-bomb escape at base stats, actual enemy pressure, hazards during play, goal completion, boss retreat routes and pacing. Target 2 viable approaches per encounter; tune timers only from observed runs. Art dressing stays unchanged pending playtest.
