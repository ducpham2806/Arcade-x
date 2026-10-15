# Cosmic Defend — campaign encounter revision v4

## Problem and resulting play

V3 fed nearly every mission from one evenly spaced wave loop; retry seeds replaced authored routes and several path IDs shared the same motion. V4 gives all 100 missions a composition: four short phrases, a launch respite, alternating flanks, then a stronger closing section. Non-boss missions schedule at least 90 enemies; early missions schedule about 110–120, with lighter kill chains around priority targets. Stage 9 combines seven encounters. Boss stages retain six small escort windows rather than constant background spawns.

Enemy count alone is not the difficulty control. Threat mixes, lateral movement, support priority, launch spacing, and recovery windows form the progression. IDs, objectives, unlock gates, inventory, upgrade ownership, and existing completion records are retained.

## Sector identity

| Sector | Spatial skill | Priority / counterplay |
| --- | --- | --- |
| Asteria | Read formation, change lane | Follow the rake; transfer before the return wing |
| Verdantia | Break a growing swarm | Kill larva / moth before the screen fills |
| Glacius | Time a crossing | Step around the armored screen, then intercept |
| Pyrrhos | Route around persistent threats | Pull minelayers toward an edge |
| Aquaris | Remove support | Kill cicada before committing to heavy targets |
| Machina | Break armor and clear | Separate beetle / mantis from light formations |
| Umbra | Time visibility | Change flank while wraiths are hidden |
| Tempest | Escape a pincer | Keep the central transfer route available |
| Crystalis | Follow a curved approach | Track prism / mantis from a clear angle |
| Nexus | Combine learned skills | Alternate crowd control and heavy target focus |

Each sector uses the same ten stage roles: introduction, flank change, core hunt, encirclement, commander, escort, generators, combo, combined exam, boss. Existing objectives are preserved; mission-specific priority waves supplement the composition.

## Runtime changes

- Six genuinely distinct, continuous routes (18–23): inward rake, S curve, returning dive, paired pincer, brief anchor then departure, wide arc. No bottom-of-screen spawn in authored v4 waves. Practice exposes the new paths.
- Campaign routes are no longer substituted based on retry seed. Seeded speed variation and deterministic non-campaign mirroring remain. All waves reserve enough launch time for the Swarm modifier.
- Escort uses three marked six-drone assault squads. Only red-chevron targets damage the convoy on escape; ordinary background flybys do not. The 12-HP convoy still fails if too many assault drones escape.
- Commander entry clears nearby launch slots. Its three telegraphed attacks and enrage remain; v4 commander HP is 340 before sector scaling.
- Every fourth boss action exposes the core for 135 frames, with a 165-frame recovery interval. Existing sector-specific attacks remain. V4 boss HP is 72% of the original budget and major part HP is 60%, to support shorter damage windows instead of prolonged firing into armor.
- Ambient hazards only enter during active wave phrases, outside boss / commander fights. Existing hazard warnings, crowd separation, bullet caps, and heavy-hit cooldown remain.
- Supplies still require kills, with the existing 8-second cooldown and per-sector budget. Two authored tail ships carry weapon supplies. No timer-created free booster.
- Preparation screen and non-blocking wave cues explain the stage's spatial task.

## Version boundary

New local runs use engine version 4. V2 and V3 engines and V3 encounters are frozen in separate modules; dispatcher routes saved runs, ghosts, and server-issued tickets to their original rules. HUD objectives use the run's version. Current server verification continues to accept only issued V2/V3 tickets; this change does **not** migrate ranked leaderboards to V4 or change their database rules.

## Validation

Run `npm run test:cosmic-levels` (Node 24+) and `npm run preview:cosmic-levels` to export the standalone graybox lab.

Seven native test groups cover all 100 mission schedules and IDs, objective presence, route/roster variety, respite and full launch intervals including Swarm, 270 full-duration kill-oracle scheduling runs, 30 no-kill crowd simulations across every sector, all 10 boss recovery beats, escort threat filtering, local save validation, exact V2/V3 dispatch, V4 deterministic replay, and server-ticket verification compatibility.

A kill oracle proves scheduling and objective delivery; it is not a measure of achievable player DPS. No-kill runs sample crowd overlap every six frames. The exported lab uses the actual V4 engine and approximate geometric rendering, not the production sprite renderer. Its JavaScript was syntax checked and exercised in a mock DOM/canvas smoke harness. Full application TypeScript/Vite build, browser rendering, touch-device play, and human difficulty testing have not been completed in this environment.

## Playtest before merging

Use production art and representative loadouts on stages 1, 5, 6, 7, 9, and 10 in each sector. Check commander visibility behind support ships, early escort readability, swoop reaction time, boss clear times and armor phases, pickup reachability, phone thumb occlusion, and whether the closing respite feels too long. Measure deaths, completion time, missed assault squads, kills per phrase, and restarts. Adjust composition / timing before raising enemy HP. Keep the PR in draft until this pass and the full app checks succeed.
