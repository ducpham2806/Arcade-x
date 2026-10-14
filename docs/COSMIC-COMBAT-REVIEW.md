# Cosmic Defend combat review — 2026-10-13

This source includes the previous Blossom PC/mobile corrections. No Git push, Netlify publication or database/backend deployment is performed by this review.

## New local combat rules (v3)

- Each of the 100 campaign missions has a derived encounter schedule with a planetary enemy roster, rotating routes, formations and lanes. Regular missions last 68–108 seconds with waves every 2.5–4.1 seconds. Boss missions keep their original duration and have lighter support waves.
- Mission 1 now schedules 85 enemies instead of 39, uses four enemy types, and targets 41 kills instead of 24. Later missions expose additional existing enemy sprites and behaviors.
- Active enemy limits rise from 6–18 to 16–32. Individual flight speed varies from 82–118% of the species speed. Seeded phase and route variants remain reproducible for replay; failed attempts now vary their seed as well.
- Entry gaps are checked before admitting a spawn; blocked spawns remain queued. A deterministic body-separation pass keeps trajectories from stacking. Curved paths retain the original entry lane instead of converging on one shared center.
- No timed sky supplies remain. Ordinary kill drops are limited to 5–8 per mission with an 8-second cooldown and a 3.5% random chance, plus eligible designated carriers. A purchased Nanobot Reserve drops from a kill after the midpoint; collectible Star Cores are objective currency and are not subject to the weapon-item budget.
- Commander miniboss base HP rises from 150 to 420 and scales with the planet. Bomb damage is limited to 75/110 against a commander. It no longer silently expires after 20 seconds.
- Commanders rotate downward fans, locked aimed volleys and radial rings, with a 54-frame warning. Warning geometry shows the corresponding fan, target line or radial spokes even when tutorial messages are disabled. Below 45% HP, fan/ring density increases and the pause between attacks decreases from 112 to 72 frames. HUD shows remaining commander HP.

## Compatibility and deployment boundary

Saved v2 runs, ghosts and pending verified scores replay with the preserved v2 engine and original campaign data. New local runs use v3 and save validation accepts both. Ghosts are only compared within the same rule version.

The currently deployed ranking service still issues v2 tickets. Those tickets intentionally retain v2 combat and display a notice. Backend rollout and a separately versioned ranking period are needed before ranked tickets can use the new balance; this review does not silently alter server-verified rules or mix scores from different balances.

## Verification

Automated checks cover 100 mission schedules/objective availability, live spawn density versus v2, reproducible and differing seeds, spacing across all 10 planets with three seeds each, no-kill supply behavior, kill-drop budget/cooldown/reserve, miniboss survival/pattern/enrage, and exact v2/v3 replays. Browser checks cover real campaign launch and sprite rendering at 390 and 1440 px, offline exported launcher at both sizes, and three distinct canvas warning shapes.

This is a first balance pass. The tests establish mechanics and compatibility, not a human completion-rate target across all missions; player feedback is still needed to tune difficulty.
