# Dungeon Titan v6 — battlefield and troop encounters

Reference: user's12906.jpg. Keep original Dungeon Titan fantasy art, borrow hierarchy: compact top stage route and enemy HP, gold above battle, hero and companions on tiered platforms, four compact damage stats, mana and circular skill buttons, color-coded bottom navigation. A pet system is not present, so no invented pet-damage statistic. Main scene occupies remaining vertical space; mobile view does not scroll.

## Troops, before production

Add24 original species (three per biome) to existing24. Eight new transparent3×2 atlases: top row three idles, bottom row corresponding three attacks. Runtime cells192², ≤180KiB/sheet, total added art≤1.5MiB, source PNG retained. Onscreen limit4 regular enemies + hero + six companions. One transient attack effect maximum, no giant persistent bloom. Reuse8 biome scenes, add CSS stone ledges for composition. Full browser/device profiling remains pending.

## Encounter design

Purpose: clearly distinguish troops from bosses, give the player a target decision and avoid wave-to-wave repeats. Inputs: tap troop to select/attack; hold primary sword; cast abilities; progress automatically after all enemies and waves are defeated. Output: independent unit HP, individual rewards, then one room loot roll. Only multiples of10 are bosses.

Regular wave size [PLAYTEST HYPOTHESIS]:2 scouts,3 swarm/gauntlet,2 guard/caster/rest,3 elites,1 treasure sentinel. Stage1 starts with two species. Stage/wave and persistent encounter serial rotate squads deterministically; farming also changes species instead of recreating the same one. Six different silhouettes per biome must be reachable in its first ten floors. No exact adjacent squad repeat over the authored sequence.

Room HP/gold budgets remain the v5 curves and wave multipliers: partition them over squad members with normalized role weights, ensuring integer sums equal the old room budget. Extra enemies do not mint extra room gold. Bosses retain v3 timing and first-clear rules. Individual kills increment monstersSlain; loot/pity counters roll only once per final room wave. Damage does not spill into a fresh room.

Guard:35% resistance until eight manual hits or three skill hits break its guard [existing armor values reused]. Guard progress persists when changing targets. Casters drain3 mana at five-second intervals while alive [PLAYTEST HYPOTHESIS]; this is less than passive regen10 over the same interval and rewards focusing casters without a hard resource deadlock. Other enemy attacks remain visual cues in this idle/tap combat model; no player-health system is invented.

Compatibility: schema4 restarts transient combat from v3/v4 saves, preserves currencies/owned gear/levels, continues encounter serial. Pending gear remains deduplicated. A stale target selection or a stale duplicate kill must not pay rewards twice. Boss failure still returns to farming.

Success checks:48 species in roster; three different squads in a biome's first ten regular floors; no boss sprites on normal floors; two or more independently damageable targets; room only clears after last target; total room gold matches budget; target-switch cannot reset guard; restore preserves progression; menus freeze all combat clocks. Visual clear space, touch targets and short-screen layout require human mobile review.

## Boss hierarchy and final checks

Floor multiples of10 keep timed boss mechanics. Mid-region gatekeepers use enlarged troop silhouettes with a gold outline (champion rank); chapter-end encounters use the8 authored Titan sheets and8 poses. Gallery battle shortcuts jump to chapter end, and the Hỏa Long shortcut goes to100. This makes the giant Titan visibly rarer without removing existing first-clear rewards.

Seventeen inherited engine checks plus eight new squad checks pass. Coverage includes all1000 authored floors, six species per biome, independent HP, target switch/guard persistence, caster interrupt, budget conservation, farming rotation and real wave-to-floor no-repeat sequences. DOM check covers stage route, four real stats, five circular skill controls, target selection, frozen management clock, save and48-species gallery. TypeScript and offline HTML export pass. No browser/device render, FPS or full launcher/cloud leaderboard validation was performed.

The3-second current DPS is measured actual damage dealt, not theoretical idle DPS; overkill damage is excluded. Mana drains are experimental values pending human playtests. More troops share the same HP/gold budget, so no claim is made that the previous speed-to-clear tuning remains human-approved.

Measured runtime art: 3.86 MiB across34 WebP files,293 total cells. All resident RGBA arithmetic: 52.44 MiB. New unit sheets preserve color/alpha; detached neighboring islands are filtered with connected-component analysis before atlas packing. These are file checks, not GPU profiling.
