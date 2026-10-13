import fs from "node:fs";
import previous from "../src/games/hex-match/blossom/balance-tuning.json" with { type: "json" };
import { LEVELS } from "../src/games/hex-match/blossom/levels";
import { validatedRun, act, tick } from "../src/games/hex-match/blossom/engine";
import { chooseAction } from "./blossom-bots";
const proposals: Record<string, any> = structuredClone(previous.proposals);
const sample = Number(process.argv[2] || 100);
for (const original of LEVELS) {
  if (original.id <= 10 || original.bossHP) continue;
  const l = structuredClone(original),
    p: any = proposals[original.id] || {};
  if (l.goals.some((g) => g.kind === "collect")) {
    l.initialCollectSupply = original.initialCollectSupply ?? 0.6;
    p.initialCollectSupply = l.initialCollectSupply;
  }
  if ([74, 75, 78, 81, 82, 91, 92].includes(l.id)) {
    l.hazards.forEach((h) => (h.hp = 1));
    p.hazardHp = 1;
  }
  const pureScore = l.goals.length === 1 && l.goals[0].kind === "score";
  if (pureScore) l.goals[0].target = 1e9;
  const maxMoves = Math.min(40, l.moves + 3);
  if (!l.seconds) l.moves = pureScore ? original.moves : maxMoves;
  const scores: number[] = [],
    turns: number[] = [];
  for (let seed = 1; seed <= sample; seed++) {
    let s = validatedRun(l, seed, { companion: "none" });
    for (let turn = 0; turn < 100 && s.status === "playing"; turn++) {
      const action = chooseAction(s, "C", turn * 1500);
      if (!action) break;
      s = act(s, action, turn * 1500).run;
      if (l.seconds) s = tick(s, 3.5);
    }
    scores.push(s.completion?.score ?? s.score);
    turns.push(s.status === "won" ? s.turns : 1e9);
  }
  const desired =
    l.difficulty <= 3
      ? 0.8
      : l.difficulty <= 6
        ? 0.675
        : l.difficulty <= 8
          ? 0.525
          : 0.425;
  if (pureScore) {
    scores.sort((a, b) => a - b);
    p.scoreTarget = Math.max(
      500,
      Math.round(scores[Math.floor(sample * (1 - desired))] / 50) * 50,
    );
    p.moves = original.moves;
  } else if (!l.seconds) {
    turns.sort((a, b) => a - b);
    p.moves = Math.max(
      6,
      Math.min(
        maxMoves,
        turns[Math.min(sample - 1, Math.floor(sample * desired))],
      ),
    );
  }
  proposals[l.id] = p;
  console.log(l.id, p);
}
proposals["80"] = { bossHP: 32 };
fs.writeFileSync(
  process.argv[3] || "tests/blossom/calibration-proposals.json",
  JSON.stringify(
    { revision: "review-v0.4", samplePerLevel: sample, proposals },
    null,
    2,
  ),
);
