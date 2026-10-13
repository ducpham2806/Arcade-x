import tuning from "./balance-tuning.json" with { type: "json" };
import blueprints from "./blueprints.json" with { type: "json" };
import { Goal, Hazard, Level } from "./types";
export const GOAL_LABELS: Record<string, string> = {
  score: "Điểm",
  collect: "Thu hoa",
  drop: "Thả hạt",
  rescue: "Cứu bạn",
  boss: "Boss",
  weed: "Cỏ dại",
  rock: "Đá",
  cocoon: "Kén",
  ice: "Băng",
  vine: "Dây leo",
  bug: "Sâu",
  bomb: "Bom giờ",
  honey: "Mật ong",
  fog: "Sương",
  combo: "Chuỗi chạm",
  gift: "Hộp quà",
};
export const CHAPTERS = [
  "Vườn Hoa Xuân",
  "Vườn Cây Ăn Quả",
  "Đồng Cỏ & Cối Xay",
  "Bãi Biển Nhiệt Đới",
  "Rừng Nấm Kỳ Diệu",
  "Sa Mạc Xương Rồng",
  "Núi Tuyết Hoa Băng",
  "Đầm Sen Hoàng Hôn",
  "Thung Lũng Đom Đóm",
  "Cung Điện Hoa Vàng",
];
const beta = [0.8, 0.7, 0.6, 0.55, 0.5, 0.45, 0.4, 0.35, 0.3, 0.3];
const expectation = [70, 130, 165, 215, 250, 290, 350, 400, 460, 470];
const clear: Record<number, [Hazard, number, number?][]> = {
  11: [["weed", 6]],
  12: [["weed", 10]],
  16: [["weed", 14]],
  18: [["weed", 18]],
  22: [["rock", 4]],
  24: [["rock", 8, 2]],
  25: [["cocoon", 5]],
  32: [["ice", 6]],
  34: [["vine", 8]],
  35: [["ice", 8]],
  36: [["vine", 10]],
  38: [["vine", 10]],
  42: [["bug", 3]],
  45: [["bug", 3]],
  46: [["bug", 5]],
  47: [["vine", 12]],
  54: [
    ["bomb", 3],
    ["rock", 8],
  ],
  55: [["bomb", 2]],
  57: [
    ["weed", 12],
    ["bomb", 3],
  ],
  61: [["ice", 8, 2]],
  62: [["honey", 10]],
  63: [["ice", 10, 2]],
  65: [
    ["ice", 8, 2],
    ["honey", 8],
  ],
  66: [["ice", 12, 2]],
  68: [
    ["bug", 4],
    ["ice", 10, 2],
  ],
  73: [
    ["weed", 6],
    ["ice", 6],
  ],
  74: [["rock", 12, 2]],
  75: [["ice", 12, 2]],
  78: [
    ["ice", 10, 2],
    ["honey", 10],
  ],
  82: [
    ["ice", 8, 2],
    ["honey", 8],
    ["fog", 4],
  ],
  83: [
    ["bug", 3],
    ["bomb", 2],
    ["weed", 10],
  ],
  84: [["ice", 10, 2]],
  86: [
    ["rock", 8, 2],
    ["ice", 8, 2],
  ],
  88: [
    ["bug", 4],
    ["honey", 10],
  ],
  92: [
    ["ice", 8, 2],
    ["rock", 6, 2],
    ["weed", 8],
  ],
  93: [
    ["bug", 4],
    ["bomb", 3],
  ],
  94: [
    ["fog", 9],
    ["honey", 10],
  ],
  95: [
    ["ice", 10, 2],
    ["honey", 10],
  ],
  97: [
    ["ice", 10, 2],
    ["rock", 8, 2],
  ],
  98: [
    ["bomb", 3],
    ["vine", 12],
  ],
};
const collect: Record<number, number[]> = {
  2: [10],
  4: [12, 12],
  6: [20],
  8: [15, 15],
  14: [20],
  19: [15, 15],
  28: [20, 20],
  35: [15],
  38: [20],
  39: [25],
  44: [20],
  49: [25, 25],
  58: [30],
  63: [15],
  65: [15],
  69: [30, 30],
  72: [20],
  79: [35],
  84: [25],
  86: [25],
  88: [30],
  89: [40],
  95: [30],
  97: [35],
  98: [35],
};
const drop: Record<number, number> = { 23: 2, 26: 3, 29: 3, 87: 4 };
const rescue: Record<number, number> = {
  43: 2,
  45: 3,
  48: 4,
  55: 3,
  67: 4,
  77: 4,
  85: 5,
  96: 5,
};
const extras: Record<number, [Hazard, number, number?][]> = {
  13: [["weed", 8]],
  14: [["weed", 8]],
  20: [],
  26: [["rock", 5]],
  27: [
    ["rock", 6, 2],
    ["cocoon", 4],
  ],
  37: [["ice", 8]],
  52: [["bomb", 1]],
  56: [["bomb", 2]],
  58: [["bomb", 2]],
  64: [["honey", 8]],
  67: [["ice", 4, 2]],
  72: [["fog", 4]],
  74: [["fog", 4]],
  75: [["fog", 4]],
  77: [["fog", 4]],
  81: [
    ["ice", 8, 2],
    ["honey", 8],
  ],
  87: [["rock", 8, 2]],
  91: [["ice", 6, 2]],
};
// Review v0.3: sampled HP tuning; original GDD remains in blueprints.json.
const bossHP = [18, 27, 27, 26, 28, 24, 30, 33, 33, 35];
export const LEVELS: Level[] = blueprints.map((b) => {
  const chapter = Math.floor((b.id - 1) / 10) + 1;
  const goals: Goal[] = [];
  const score = /(?:Điểm|điểm)\s+([\d.]+)/.exec(b.description);
  if (score)
    goals.push({ kind: "score", target: Number(score[1].replaceAll(".", "")) });
  for (const [color, target] of (collect[b.id] || []).entries())
    goals.push({ kind: "collect", target, color });
  for (const [kind, target] of clear[b.id] || []) goals.push({ kind, target });
  if (drop[b.id]) goals.push({ kind: "drop", target: drop[b.id] });
  if (rescue[b.id]) goals.push({ kind: "rescue", target: rescue[b.id] });
  if (b.id % 10 === 0)
    goals.push({ kind: "boss", target: bossHP[chapter - 1] });
  const hazards = [...(clear[b.id] || []), ...(extras[b.id] || [])].map(
    ([kind, count, hp]) => ({ kind, count, hp: hp || 1 }),
  );
  // Rescue pets occupy cocoons; ice rescue adds a second protective layer.
  if (rescue[b.id])
    hazards.push({
      kind: "cocoon",
      count: rescue[b.id],
      hp: b.id === 67 ? 2 : 1,
    });
  if (!goals.length) throw new Error(`Missing goals for ${b.id}`);
  return {
    ...b,
    description:
      b.id % 10 === 0
        ? b.description.replace(/\d+ HP/, `${bossHP[chapter - 1]} HP`)
        : b.description,
    chapter,
    beta: beta[chapter - 1],
    expectation: expectation[chapter - 1],
    goals,
    hazards,
    seeds: drop[b.id] || 0,
    seedRoutes: !!drop[b.id],
    startingSpecials:
      b.id === 87 ? [{ cell: 77, special: "bee_v" as const }] : undefined,
    portals: [44, 47, 87, 93].includes(b.id),
    bossHP: b.id % 10 === 0 ? bossHP[chapter - 1] : 0,
  };
});
// Review v0.4: authored seed routes and one-layer perimeter rocks.
LEVELS[86].hazards.forEach((h) => {
  h.hp = 1;
  h.count = 4;
});
LEVELS[86].moves = 35;
// Review v0.2: a longer learning curve before the first chapter boss.
const openingTuning: Record<
  number,
  { moves: number; beta: number; goal: number[] }
> = {
  1: { moves: 10, beta: 0.5, goal: [600] },
  2: { moves: 11, beta: 0.5, goal: [18] },
  3: { moves: 12, beta: 0.5, goal: [1200] },
  4: { moves: 10, beta: 0.5, goal: [18, 18] },
  5: { moves: 12, beta: 0.45, goal: [1800] },
  6: { moves: 12, beta: 0.4, goal: [30] },
  7: { moves: 14, beta: 0.4, goal: [2600] },
  8: { moves: 14, beta: 0.4, goal: [25, 25] },
  9: { moves: 16, beta: 0.4, goal: [3200] },
  10: { moves: 18, beta: 0.4, goal: [18] },
};
for (const l of LEVELS) {
  const tuning = openingTuning[l.id];
  if (!tuning) continue;
  l.moves = tuning.moves;
  l.beta = tuning.beta;
  l.initialCollectSupply = 0.6;
  l.goals.forEach((g, i) => (g.target = tuning.goal[i]));
  if (l.bossHP) l.bossHP = tuning.goal[0];
  l.description = l.goals
    .map((g) =>
      g.kind === "score"
        ? `Điểm ${g.target.toLocaleString("vi-VN")}`
        : g.kind === "collect"
          ? `Thu thập ${g.target} hoa`
          : g.kind === "boss"
            ? `Boss Sâu Bướm Xám (${g.target} HP)`
            : `${g.target} ${g.kind}`,
    )
    .join(" + ");
}

// Offline review calibration. Keep GDD source values in blueprints.json.
for (const l of LEVELS) {
  const p = (
    tuning.proposals as Record<
      string,
      {
        moves?: number;
        seconds?: number;
        scoreTarget?: number;
        initialCollectSupply?: number;
        hazardHp?: number;
        bossHP?: number;
        goalTargets?: number[];
        expectation?: number;
        hazardHps?: Record<string, number>;
        hazardCounts?: Record<string, number>;
      }
    >
  )[l.id];
  if (!p) continue;
  if (p.expectation) l.expectation = p.expectation;
  if (p.goalTargets)
    l.goals.forEach((g, i) => (g.target = p.goalTargets![i] ?? g.target));
  if (p.seconds !== undefined) l.seconds = p.seconds;
  if (p.moves !== undefined) l.moves = p.moves;
  if (p.initialCollectSupply !== undefined)
    l.initialCollectSupply = p.initialCollectSupply;
  if (p.hazardHp) l.hazards.forEach((h) => (h.hp = p.hazardHp!));
  if (p.hazardCounts)
    l.hazards.forEach((h) => (h.count = p.hazardCounts![h.kind] ?? h.count));
  if (p.hazardHps)
    l.hazards.forEach((h) => (h.hp = p.hazardHps![h.kind] ?? h.hp));
  if (p.scoreTarget) {
    l.goals
      .filter((g) => g.kind === "score")
      .forEach((g) => (g.target = p.scoreTarget!));
    l.description = l.description.replace(
      /(?:Điểm|điểm)\s+[\d.]+/,
      `Điểm ${p.scoreTarget.toLocaleString("vi-VN")}`,
    );
  }
  if (p.bossHP) {
    l.bossHP = p.bossHP;
    l.goals.find((g) => g.kind === "boss")!.target = p.bossHP;
    l.description = l.description.replace(/\d+ HP/, `${p.bossHP} HP`);
  }
  if (!l.bossHP)
    l.description = l.goals
      .map((g) => `${GOAL_LABELS[g.kind]} ${g.target.toLocaleString("vi-VN")}`)
      .join(" + ");
}

export function starThresholds(l: Level): [number, number] {
  const r = (l.seconds ? l.seconds / 3.5 : l.moves) * l.expectation;
  const round = (n: number) =>
    Math.ceil(n / (n < 5000 ? 50 : 100)) * (n < 5000 ? 50 : 100);
  return [
    round(r * (1 + 0.02 * l.difficulty)),
    round(r * (1.5 + 0.02 * l.difficulty)),
  ];
}
export function dailyLevel(date: string): Level {
  const day = new Date(`${date}T12:00:00`).getDay();
  const base = LEVELS[[38, 14, 35, 48, 63, 68, 88][day]];
  return {
    ...structuredClone(base),
    description: "Thử thách chung trong ngày",
    difficulty: day === 0 ? 7 : day + 2,
    moves: 26,
    seconds: 0,
    bossHP: 0,
  };
}

export const SIDE_LEVELS: Level[] = Array.from({ length: 14 }, (_, i) => {
  const base = structuredClone(LEVELS[Math.min(88, 4 + i * 6)]),
    kind = i % 4;
  base.id = 1001 + i;
  base.bossHP = 0;
  base.hazards = [];
  base.seeds = 0;
  base.portals = false;
  base.seconds = 0;
  base.moves =
    kind === 0 ? 4 + i : kind === 1 ? 12 + i : kind === 2 ? 14 : 12 + i;
  base.description =
    kind === 0
      ? "Một nét nở hoa"
      : kind === 1
        ? "Hộp quà khu vườn"
        : kind === 2
          ? "Chuỗi hoa liên hoàn"
          : "Tay không làm vườn";
  base.goals =
    kind === 1
      ? [{ kind: "gift", target: 3 }]
      : kind === 2
        ? [{ kind: "combo", target: 10 }]
        : [
            {
              kind: "score",
              target: kind === 0 ? 500 + i * 120 : 2000 + i * 200,
            },
          ];
  return base;
});
