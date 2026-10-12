import { writeFileSync } from "node:fs";
const saw = [-8, -5, -2, 0, 2, -1, 2, 4, 7, 6],
  power = [4, 10, 16, 22, 28, 34, 40, 46, 51, 56];
const newKinds = [
  ["scout", "drone"],
  ["gnat", "wasp"],
  ["beetle", "larva"],
  ["moth", "hornet"],
  ["mantis"],
  ["cicada", "minelayer"],
  ["wraith"],
  ["wasp"],
  ["prism"],
  ["commander"],
];
const objectives = [
  "kills",
  "survive",
  "collect",
  "kills",
  "mini",
  "escort",
  "generators",
  "score",
  "survive",
  "boss",
];
const hp = {
  scout: 3,
  gnat: 2,
  drone: 6,
  wasp: 10,
  moth: 15,
  hornet: 8,
  larva: 12,
  beetle: 40,
  mantis: 24,
  cicada: 12,
  minelayer: 14,
  wraith: 18,
  commander: 150,
  prism: 8,
};
const levels = [];
for (let id = 1; id <= 100; id++) {
  const planet = Math.ceil(id / 10),
    stage = ((id - 1) % 10) + 1,
    difficulty = Math.round(8 + 8.5 * (planet - 1) + saw[stage - 1]);
  const duration =
    stage === 10
      ? [90, 95, 100, 100, 100, 105, 105, 110, 115, 170][planet - 1]
      : stage === 9
        ? 150
        : 90 + Math.min(30, (planet - 1) * 3 + Math.floor(stage / 3) * 3);
  const objective = objectives[stage - 1],
    target =
      objective === "kills"
        ? 20 + 4 * stage + 6 * (planet - 1)
        : objective === "collect"
          ? 5 + planet
          : objective === "generators"
            ? 3
            : objective === "score"
              ? 4000 + planet * 1000
              : 1;
  const waves = [];
  let old = ["scout", "drone", ...newKinds.slice(0, planet - 1).flat()];
  const kinds = [
    ...new Set([...old, ...newKinds[planet - 1].slice(0, stage === 1 ? 1 : 2)]),
  ];
  const cadence = Math.max(2.3, 7 - planet * 0.35),
    count = Math.min(7, 3 + Math.floor(planet / 2));
  for (let t = 3, wi = 0; t < duration - 5; t += cadence, wi++) {
    const pct = t / duration;
    if ((pct > 0.4 && pct < 0.45) || (pct > 0.75 && pct < 0.8) || t % 24 > 20)
      continue;
    let enemy =
      wi % 3 === 0
        ? newKinds[planet - 1][
            stage === 1 ? 0 : wi % newKinds[planet - 1].length
          ]
        : kinds[wi % kinds.length];
    if (planet === 1 && stage === 1) enemy = "scout";
    if (enemy === "commander") enemy = "drone";
    let path =
      enemy === "scout" || enemy === "gnat"
        ? stage < 3
          ? 1
          : [1, 2, 3, planet >= 2 ? 4 : 3, planet >= 2 ? 11 : 2][wi % 5]
        : ["moth", "larva", "wraith"].includes(enemy)
          ? 3
          : ["minelayer"].includes(enemy)
            ? 14
            : 7;
    if (stage >= 7 && planet >= 3 && enemy === "scout")
      path = [2, 3, 5, 15][wi % 4];
    if (planet >= 4 && enemy === "hornet") path = 10;
    if (planet >= 6 && stage >= 7 && enemy === "gnat") path = 9;
    if (planet >= 7 && enemy === "wraith") path = 16;
    if (planet >= 8 && stage >= 8 && wi === 5) path = 17;
    if (stage === 10) {
      if (wi % 4) continue;
      enemy = "scout";
      path = 3;
    }
    waves.push({
      t: Math.round(t * 100) / 100,
      enemy,
      count: hp[enemy] > 12 ? 1 : hp[enemy] > 3 ? 2 : count,
      path,
      formation: (wi % 3) + 1,
      lane: (wi % 7) + 2,
      delay: 0.3,
      ...(wi === 2 ? { drop: "plasma" } : {}),
    });
  }
  if (stage === 5)
    waves.push({
      t: duration * 0.45,
      enemy: "commander",
      count: 1,
      path: 7,
      formation: 1,
      lane: 5,
      delay: 0,
    });
  if (stage === 7)
    for (let n = 0; n < 3; n++)
      waves.push({
        t: 8 + n * 25,
        enemy: "generator",
        count: 1,
        path: 7,
        formation: 1,
        lane: [3, 7, 5][n],
        delay: 0,
      });
  if (id === 1) {
    waves.splice(
      0,
      waves.length,
      ...[
        [3, 3, 1, 1, 5],
        [11, 4, 2, 1, 5],
        [19, 5, 3, 1, 5],
        [33, 4, 2, 2, 2],
        [41, 4, 2, 2, 8],
        [50, 6, 1, 3, 5],
        [65, 5, 3, 3, 5],
        [74, 8, 1, 1, 5],
      ].map(([t, count, formation, path, lane], i) => ({
        t,
        count,
        formation,
        path,
        lane,
        enemy: "scout",
        delay: 0.35,
        ...(i === 2 ? { drop: "plasma" } : {}),
      })),
    );
  }
  if (objective === "kills" && id !== 1) {
    const planned = waves.reduce((n, w) => n + w.count, 0),
      minimum = Math.ceil((1.6 - 0.003 * difficulty) * target);
    let extra = Math.max(0, minimum - planned),
      n = 0;
    while (extra > 0) {
      const c = Math.min(6, extra);
      waves.push({
        t: Math.round((5 + n * 5.5) * 100) / 100,
        enemy: "scout",
        count: c,
        path: stage < 3 ? 1 : 3,
        formation: 1,
        lane: 5,
        delay: 0.3,
      });
      extra -= c;
      n++;
    }
  }
  waves.sort((a, b) => a.t - b.t);
  levels.push({
    id,
    planet,
    stage,
    difficulty,
    duration,
    objective,
    target,
    parScore:
      stage === 10 ? 25000 + planet * 1000 : 3500 + planet * 1300 + stage * 300,
    recommended: Math.round(
      (planet === 1 ? 0 : power[planet - 2]) +
        (stage / 10) *
          (power[planet - 1] - (planet === 1 ? 0 : power[planet - 2])),
    ),
    waves,
  });
}
writeFileSync(
  "src/games/cosmic-defense/data/campaign.json",
  JSON.stringify(levels, null, 2) + "\n",
);
console.log(
  `Wrote ${levels.length} levels, ${levels.reduce((n, l) => n + l.waves.length, 0)} waves.`,
);
