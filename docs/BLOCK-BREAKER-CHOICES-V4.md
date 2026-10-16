# Block Breaker — optional choices v4

Design pillars: read the optional reward, decide whether to take the detour, earn a visible skill achievement, and carry one bounded advantage into the next sector. Baseline campaign completion, stars and sector gates must never require any of these optional systems.

All new numeric values are [PLACEHOLDER] tuning hypotheses pending human playtests. `block-choice-tuning.csv` accompanies this design. No permanent stat upgrade or new currency is introduced.

## Salvage side routes

Purpose: add a spatial risk/reward decision. One marked cache sits in the outer flank on stages 4, 8 and 12 of each sector (18 routes total). A direct ball hit opens it exactly once per run, immediately grants its advertised booster, then warns for 1.25 seconds before a small horizontally moving deflector activates for 9 seconds in that flank. The center route and normal objectives remain intact. The cache is not a clear target and cannot delay victory. Positive booster and bounded trajectory risk are the output; missing the detour has no penalty. Currency is paid only for a campaign victory after opening, once per stage: 12 + 2×sector-index xu. Replays still provide the in-run booster but no duplicate currency.

Broken conditions: cache overlaps targets/walls/mandatory approach; reward without direct contact; deflector before its warning or outside the announced sweep; a cache required for victory; rewards in practice/challenge modes or on loss; duplicate persistent payout.

## Skill mastery

Purpose: optional mastery that encourages angled shots, central catches and chain opportunities. Each stage receives one objective: perfect catches, peak combo, first-volley destruction before the first paddle return, or a four-block reaction when chain groups exist. Metrics originate in actual simulation events. A failed first-volley objective is marked failed; it never loses the run. Completion emits a non-blocking event. Progress is displayed as one compact icon/counter; result cards show the outcome. The reward (10 + 2×sector-index xu) is claimed only after a campaign win, once per stage. Stars, unlocks and the objective's target count remain unchanged. Practice shows progress for testing but never changes saved mastery.

Broken conditions: timers/laser shots count as first-ball volley destruction; ordinary grouped hits count as one chain; resurrected targets can farm a single reaction; duplicate payout; completion blocks game input.

## Post-boss support

Purpose: a bounded choice after a climax. First campaign victory over each of the first five bosses creates one persistent offer for the following sector's opening stage. Offer survives leaving the result, closing or reloading the app. Old completed bosses are not retroactively minted as new offers. Replaying a boss does not create duplicates; the last boss has no next-sector offer.

Choices: wide paddle ×1.15 for 20 seconds after first launch; one bottom rescue shield; or +3 starting skill energy. One choice may be changed while still unused. It applies only to that sector opener, only in normal campaign play, and is consumed on the first actual launch. Previewing or cancelling the briefing and practice do not spend it. Retrying an already launched attempt receives no second copy. It never stacks across attempts or permanently alters the paddle/skill. A shield survives an unrelated lost life inside the same attempt until used by the bottom rescue; wide time respects pause through the engine update clock.

Broken conditions: grant on replay/practice/endless/daily; consumed by entering a menu or viewing an unlaunched board; spent while trying another stage; duplicate use after reload; stacking or permanent stats.

## Workflow and verification

This page records the implementation contract before production. Geometry is first audited independently of presentation, then dressed with existing sci-fi sprites and code-native indicators. Automated observations and remaining human/browser limitations will be appended after testing. Existing game and modal sizing rules remain in force; no reward dialog interrupts an active game.

## Verified implementation observations

- All 96 campaign definitions include a mastery goal; 18 cache and complete deflector sweep bounds pass independent overlap / center-lane checks. No new raster textures were added.
- 11 focused choice tests pass: orb-only cache contact, one booster grant, warning timing, sweep containment and expiry, optional completion, first-volley failure, real reaction attribution, one-time campaign payouts, five targeted offers, choice validation, one-use consumption, support lifetime and old-save migration.
- Existing suites pass: 20 engine checks, seven geometry / boss regressions, 15 DOM integration checks including post-boss cards, changing choices, preview/practice preservation, persisted first-launch consumption, and retry without reuse.
- All 547 atlas mappings, six boss renderers, owned skins and 20 booster states render through native Canvas. Cache, warning and deflector states were also rendered and visually inspected. This does not verify browser layout, mobile frame rate or physical touch controls.
- Seed 4 predictive simulation: 96 ended, 95 wins; median winning time 62.52 s, p90 93.53 s. The sector 4 boss ended in a loss, not a timeout. This controller does not deliberately seek caches or represent human timing/difficulty; use `block-level-simulation-4.json` as diagnostic evidence only.
- Level Lab now marks caches in the previews and offers practice-only support simulation for all three choices. Standalone playtest preserves normal campaign earning and consumption rules.

Human follow-up: compare novice / experienced players on first-volley target attainability, whether the cache warning is noticed while tracking the ball, and whether the three support choices feel equally useful. Tune values in the companion CSV after observation.
