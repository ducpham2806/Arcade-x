import fs from "node:fs";
import {
  act,
  createRun,
  groups,
  tappable,
} from "../src/games/hex-match/blossom/engine";
import { LEVELS } from "../src/games/hex-match/blossom/levels";
const output: Record<string, number[]> = {};
let rejected = 0,
  maxMs = 0;
for (const l of LEVELS) {
  const seeds: number[] = [];
  for (let seed = 1; seed < 1000 && seeds.length < 20; seed++) {
    const start = performance.now(),
      s = createRun(l, seed, { id: "audit", companion: "none" });
    if (
      groups(s).length < 3 ||
      groups(s).some(
        (g) => act(s, { type: "tap", cell: g[0] }, 0).run.status === "won",
      )
    ) {
      rejected++;
      continue;
    }
    let probe = s,
      valid = true;
    for (let turn = 0; turn < 3 && probe.status === "playing"; turn++) {
      const best = groups(probe).sort((a, b) => b.length - a.length)[0],
        special = probe.board.findIndex((t) => t.special && tappable(t));
      if (!best && special < 0) {
        valid = false;
        break;
      }
      probe = act(
        probe,
        { type: "tap", cell: special >= 0 ? special : best[0] },
        turn * 3000,
      ).run;
      if (probe.status === "lost") valid = false;
    }
    maxMs = Math.max(maxMs, performance.now() - start);
    if (valid) seeds.push(seed);
    else rejected++;
  }
  if (seeds.length !== 20) throw Error(`Not enough checked seeds: ${l.id}`);
  output[l.id] = seeds;
  if (l.id % 10 === 0) console.log(`Audited ${l.id} levels`);
}
fs.writeFileSync(
  "src/games/hex-match/blossom/fallback-seeds.json",
  JSON.stringify(output, null, 2),
);
fs.writeFileSync(
  "tests/blossom/seed-audit.json",
  JSON.stringify(
    {
      levels: 100,
      seedsPerLevel: 20,
      totalValidated: 2000,
      rejected,
      maxAuditMilliseconds: Math.round(maxMs),
    },
    null,
    2,
  ),
);
console.log(
  `2000 fallback seeds checked. Rejected ${rejected}, max audit ${Math.round(maxMs)}ms.`,
);
