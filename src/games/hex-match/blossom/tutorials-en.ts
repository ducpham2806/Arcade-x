import { Lesson } from "./tutorials";
const TIPS: Record<string, [string, string]> = {
  "seed-route-87": [
    "Open paths for four seeds",
    "This puzzle starts with a vertical Bee at the bottom of a seed column. Use it to open a path, then clear groups just below the remaining seeds. Portal A transfers only when B is empty.",
  ],
  "tap-4-way": [
    "Make your first flowers bloom",
    "Tap at least 3 matching flowers connected horizontally or vertically. Diagonals do not count. Invalid taps cost no moves.",
  ],
  timed: [
    "A timed level",
    "The clock replaces moves. It pauses during tutorials and while paused; bomb countdowns still follow valid actions.",
  ],
  portal: [
    "Portals A and B",
    "When B has a vacancy, flowers, seeds or specials at A move to B, then continue falling. Nothing transfers while B is full.",
  ],
  "combo-rhythm": [
    "Keep a combo rhythm",
    "Valid actions within 2 seconds increase your score multiplier, up to ×4. A longer pause starts a new streak.",
  ],
  "merge-pair": [
    "Combine adjacent specials",
    "Press Combine, then select two neighboring specials. Combining costs one move and does not happen automatically.",
  ],
  "goal-score": [
    "Score goal",
    "Reach the score shown above the board. Large groups, combos and special chains help you score more.",
  ],
  "goal-collect": [
    "Collect flowers",
    "Collect the flower colors shown in the goal cards. The counter advances when those flowers are removed.",
  ],
  "goal-drop": [
    "Drop the seeds",
    "Clear flowers beneath each seed until it reaches the bottom. Seeds survive blasts. Keep useful groups near the next step of the path.",
  ],
  "goal-rescue": [
    "Rescue friends",
    "Blast beside a cocoon to remove a protective layer. A paw marks a trapped friend. The rescue counts when the final layer is removed.",
  ],
  "goal-boss": [
    "Defeat the boss",
    "Bring the boss HP to zero. Blast beside its boundary or hit it with a special. Watch its attack rhythm and phases.",
  ],
  "goal-combo": [
    "A tap streak goal",
    "Keep valid actions within 2 seconds of each other until you reach the required streak. The score multiplier still stops at ×4.",
  ],
  "goal-gift": [
    "Open gift boxes",
    "Blast beside a gift box to open it. It can contain a special, coins or extra moves.",
  ],
  "hazard-weed": [
    "Weeds",
    "Blast a neighboring flower group to clear a weed. New flowers fill the cleared space.",
  ],
  "hazard-rock": [
    "Layered rocks",
    "Blast beside a rock to remove one layer. It counts toward the goal only when the final layer breaks.",
  ],
  "hazard-cocoon": [
    "Cocoons",
    "A flower or friend inside a cocoon cannot be tapped. Nearby blasts remove its protection. A paw marks a friend to rescue.",
  ],
  "hazard-ice": [
    "Ice",
    "Frozen flowers cannot be tapped. Nearby blasts or specials remove one layer at a time.",
  ],
  "hazard-vine": [
    "Spreading vines",
    "Every 3 valid turns, vines can spread to a neighboring space. Clear them early to keep paths open.",
  ],
  "hazard-bug": [
    "Moving bugs",
    "Bugs move one neighboring space per valid turn and eat the flower there. Hit them with a blast or a special.",
  ],
  "hazard-bomb": [
    "Timed bombs",
    "The number decreases after a valid tap or combination. Clear the bomb before it reaches zero. Support tools do not spend turns.",
  ],
  "hazard-honey": [
    "Sticky honey",
    "Honey blocks falling pieces. Blast beside it to reopen the path.",
  ],
  "hazard-fog": [
    "Fog",
    "Fog hides flowers and stays in place when pieces fall. Blasts and Owl can reveal it. Special markers remain visible.",
  ],
  "special-bee_h": [
    "Horizontal Bee",
    "A group of 5–6 creates a Bee. This one clears its row; the arrow shows its direction. Tap it to activate.",
  ],
  "special-bee_v": [
    "Vertical Bee",
    "A group of 5–6 creates a Bee. This one clears its column and can open a seed path. Tap it to activate.",
  ],
  "special-bloom_bomb": [
    "Bloom Bomb",
    "A group of 7–8 creates a Bomb. It blasts a 5×5 area around itself.",
  ],
  "special-rainbow_orb": [
    "Rainbow Orb",
    "A group of 9–10 creates a Rainbow Orb. It clears the most useful target color, or the most common color if no collect goal remains.",
  ],
  "special-sun": [
    "Sun",
    "A group of 11 or more creates a Sun. It clears 3 rows and 3 columns through its position.",
  ],
  "companion-bibi": [
    "Bibi joins you",
    "Bibi offers one hint per level. Companions rest during boss levels and daily challenges.",
  ],
  "companion-pip": [
    "Pip joins you",
    "Pip adds 5 coins when you win a normal level. Companions rest during boss levels and daily challenges.",
  ],
  "companion-bunny": [
    "Bunny joins you",
    "Bunny adds 3 seconds at the start of a timed level. Companions rest during boss levels and daily challenges.",
  ],
  "companion-owl": [
    "Owl joins you",
    "Owl reveals one small patch of fog without breaking pieces underneath. Companions rest during boss levels and daily challenges.",
  ],
  "companion-turtle": [
    "Golden Turtle joins you",
    "Once per normal level, Turtle adds 1 move when only 3 remain. This does not apply to timed levels or bosses.",
  ],
};
const BOSS_NAMES = [
  "Gray Caterpillar",
  "Greedy Crow",
  "Gray Windmill",
  "Giant Crab",
  "Poison Mushroom",
  "Gray Scorpion",
  "Dust Yeti",
  "Marsh Dragon",
  "Night Spider",
  "Gray Queen",
];
const ATTACKS = [
  "spawns weeds",
  "spawns weeds",
  "shuffles columns every 5 moves",
  "grows vines",
  "releases bugs",
  "adds timed bombs in phase 2",
  "freezes nearby flowers",
  "blows patches of mist",
  "weaves cocoons",
  "combines three hazard families in each phase",
];
export function englishLesson(l: Lesson): Lesson {
  let tip = TIPS[l.id];
  if (!tip && l.id.startsWith("goal-"))
    tip = [
      "Clear the marked obstacles",
      "Remove enough of the indicated obstacle to reach every counter above the board. Multi-layer obstacles count only after their last layer breaks.",
    ];
  if (!tip && l.id.startsWith("palette-"))
    tip = [
      `${l.id.split("-")[1]} flower colors`,
      "More colors make large groups rarer. Use flower shapes as well as colors, and prioritize the current goals.",
    ];
  if (!tip && /^boss-\d+$/.test(l.id)) {
    const n = Number(l.id.split("-")[1]) - 1;
    tip = [
      `New boss: ${BOSS_NAMES[n]}`,
      `Nearby normal blasts deal 1 damage; Bees and Bombs deal 2; Rainbow Orbs and Suns deal 3. This boss ${ATTACKS[n]}.`,
    ];
  }
  if (!tip && l.id.includes("-phase-"))
    tip = [
      `Boss phase ${l.id.split("-").at(-1)}`,
      "The Scorpion adds timed bombs in phase 2. The Queen uses weeds, rocks and cocoons in phase 1; vines, bugs and honey in phase 2; ice, mist and bombs in phase 3.",
    ];
  if (!tip && l.id.startsWith("booster-"))
    tip = [
      "Your prepared item",
      "Starting items are already on the board. Select a support tool below the board, then a target cell. Supports cost no turns; unused ones are returned. Undo does not refund a consumed support item.",
    ];
  return {
    ...l,
    title: tip?.[0] || "A new mechanic",
    body:
      tip?.[1] ||
      "Check the marked area and the goal cards before choosing your next action.",
    cue: l.practice
      ? "Try the highlighted group or special. Only the marked cells are enabled for this practice step."
      : "Check the marked part of the board, then continue when you are ready.",
  };
}
