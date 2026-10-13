import fs from "node:fs";
import {
  act,
  area,
  createRun,
  groups,
  hasHazard,
  key,
  neighbors,
  tappable,
  tick,
  validatedRun,
} from "../src/games/hex-match/blossom/engine";
import { LEVELS, starThresholds } from "../src/games/hex-match/blossom/levels";
import { Action, Run } from "../src/games/hex-match/blossom/types";
import { chooseAction, Bot } from "./blossom-bots";
const bot = (process.argv[5] || "C") as Bot;
const games = Number(process.argv[2] || 100),
  output = process.argv[3] || "tests/blossom/balance-results.json";
let allTurns = 0;
const results = [];
const scope = process.argv[4];
const range =
  scope && !["bosses", "drops"].includes(scope)
    ? scope.split("-").map(Number)
    : undefined;
const selectedIds = scope?.includes(",")
  ? scope.split(",").map(Number)
  : undefined;
const selectedLevels = LEVELS.filter((l) =>
  selectedIds
    ? selectedIds.includes(l.id)
    : scope === "bosses"
      ? !!l.bossHP
      : scope === "drops"
        ? !!l.seeds
        : !range || (l.id >= range[0] && l.id <= (range[1] || range[0])),
);
for (const l of selectedLevels) {
  let won = 0,
    stars = 0,
    totalScore = 0,
    totalTurns = 0,
    expired = 0;
  let openingMin = 99;
  const fallback = [];
  let witness: { seed: number; actions: Run["log"] } | undefined;
  const winningScores: number[] = [];
  for (let seed = 1; seed <= games; seed++) {
    let s = validatedRun(l, seed, {
      id: `sim-${l.id}-${seed}`,
      companion: "none",
    });
    openingMin = Math.min(openingMin, groups(s).length);
    if (fallback.length < 20 && !fallback.includes(s.initialSeed))
      fallback.push(s.initialSeed);
    for (let turn = 0; turn < 100 && s.status === "playing"; turn++) {
      const action = chooseAction(s, bot, turn * 1500);
      if (!action) break;
      s = act(s, action, turn * 1500).run;
      if (s.level.seconds) s = tick(s, 3.5);
    }
    totalScore += s.score;
    totalTurns += s.turns;
    allTurns += s.turns;
    if (s.status === "won") {
      won++;
      winningScores.push(s.score);
      if (!witness) witness = { seed: s.initialSeed, actions: s.log };
      const [a, b] = starThresholds(l);
      stars += s.score >= b ? 3 : s.score >= a ? 2 : 1;
    }
    if (s.reason?.startsWith("Bom")) expired++;
  }
  results.push({
    level: l.id,
    difficulty: l.difficulty,
    games,
    winRate: won / games,
    meanStarsOnWin: won ? stars / won : 0,
    meanScore: Math.round(totalScore / games),
    meanTurns: Number((totalTurns / games).toFixed(2)),
    winningScores,
    witness,
    bombFailures: expired,
    openingMin,
    fallback,
  });
  if (l.id % 10 === 0)
    console.log(
      `Chapter ${l.chapter}: completed ${results.length * games} games, ${allTurns} taps`,
    );
}
fs.writeFileSync(
  output,
  JSON.stringify(
    {
      bot: `${bot}: ${bot === "D" ? "two-ply beam of six" : bot === "C" ? "target priority; actual outcomes for drops" : bot === "B" ? "largest group" : "seeded random group"}, no boosters, 1.5 s between taps; timed deducts 3.5 s/tap`,
      gamesPerLevel: games,
      totalGames: games * selectedLevels.length,
      totalTurns: allTurns,
      results,
    },
    null,
    2,
  ),
);
console.log(`Written ${output}`);
