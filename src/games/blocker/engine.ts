import type { BoardSkin } from "./skins";
export type Cell = { color: number; gem: boolean; ice: number } | null;
export type Board = Cell[][];
export type Piece = { matrix: number[][]; color: number; gem: boolean };
export type Objective = "score" | "lines" | "gems" | "ice" | "combo" | "clear";
export type Rule = "relaxed" | "moves" | "time";
export interface Level {
  id: number;
  chapter: number;
  stage: number;
  title: string;
  objective: Objective;
  target: number;
  rule: Rule;
  limit: number;
  seed: number;
  variant?: "classic" | "garden" | "crossroads" | "festival" | "clean";
}
export const CHAPTERS = [
  "Vườn kẹo",
  "Bãi biển",
  "Đồng hoa",
  "Rừng bạc hà",
  "Thung lũng sao",
  "Đảo pha lê",
  "Mây cầu vồng",
  "Thành phố bánh",
  "Cực quang",
  "Lễ hội sắc màu",
];
export const OBJECTIVES: Record<Objective, string> = {
  score: "Ghi điểm",
  lines: "Xóa hàng / cột",
  gems: "Thu sao",
  ice: "Phá băng",
  combo: "Lượt có combo",
  clear: "Dọn sạch bàn",
};
export const RULES: Record<Rule, string> = {
  relaxed: "Thư giãn · không giới hạn",
  moves: "Giới hạn lượt",
  time: "Thử thách thời gian",
};
export const LEGACY_LEVELS: Level[] = Array.from({ length: 100 }, (_, i) => {
  const chapter = Math.floor(i / 10),
    stage = i % 10;
  const objective: Objective = (
    [
      "score",
      "lines",
      "gems",
      "score",
      "ice",
      "lines",
      "gems",
      "combo",
      "score",
      "lines",
    ] as Objective[]
  )[stage];
  const rule: Rule =
    chapter === 0 && stage < 5
      ? "relaxed"
      : (
          [
            "relaxed",
            "moves",
            "relaxed",
            "time",
            "relaxed",
            "moves",
            "time",
            "relaxed",
            "moves",
            "relaxed",
          ] as Rule[]
        )[stage];
  const target =
    objective === "score"
      ? 350 + chapter * 150 + stage * 25
      : objective === "lines"
        ? 3 + chapter + Math.floor(stage / 4)
        : objective === "gems"
          ? chapter === 0
            ? 4
            : 8 + chapter * 2
          : objective === "ice"
            ? 6 + chapter * 2
            : 2 + Math.floor(chapter / 3);
  return {
    id: i + 1,
    chapter: chapter + 1,
    stage: stage + 1,
    title: CHAPTERS[chapter],
    objective,
    target,
    rule,
    limit:
      rule === "moves"
        ? 35 + chapter * 4 + stage
        : rule === "time"
          ? 240 + chapter * 15
          : 0,
    seed: 9731 + i * 8101,
  };
});
export const LEVELS: Level[] = LEGACY_LEVELS.map((l) => {
  const variant =
    l.stage === 10
      ? "festival"
      : l.stage === 4 && l.chapter >= 2
        ? "clean"
        : l.stage === 3
          ? "garden"
          : l.stage === 6
            ? "crossroads"
            : "classic";
  return {
    ...l,
    variant,
    objective:
      variant === "clean"
        ? "clear"
        : variant === "festival"
          ? "combo"
          : l.objective,
    target:
      variant === "clean"
        ? 1
        : variant === "festival"
          ? 2 + Math.floor(l.chapter / 3)
          : l.target,
    rule: variant === "clean" ? "relaxed" : l.rule,
    limit: variant === "clean" ? 0 : l.limit,
  };
});
export function levelForRun(s: Run): Level {
  return (s.campaignVersion === 2 ? LEVELS : LEGACY_LEVELS)[s.level - 1];
}
export interface Metrics {
  score: number;
  lines: number;
  gems: number;
  ice: number;
  combo: number;
  streak: number;
  bestStreak: number;
  moves: number;
  elapsed: number;
  boosters: number;
  dryMoves: number;
  perfects: number;
}
export interface Snapshot {
  board: Board;
  tray: (Piece | null)[];
  rng: number;
  metrics: Metrics;
}
export interface Run extends Snapshot {
  boardSkin?: BoardSkin;
  campaignVersion?: number;
  id: string;
  mode: "free" | "campaign";
  level: number;
  status: "playing" | "blocked" | "won" | "lost" | "ended";
  rescueUsed: boolean;
  undo: Snapshot | null;
}
export interface ClearEvent {
  cells: { r: number; c: number; color: number }[];
  lines: number;
  points: number;
  streak: number;
  perfect: boolean;
}
const MATRICES = [
  [[1]],
  [[1, 1]],
  [[1], [1]],
  [[1, 1, 1]],
  [[1], [1], [1]],
  [
    [1, 0],
    [1, 1],
  ],
  [
    [0, 1],
    [1, 1],
  ],
  [
    [1, 1],
    [1, 0],
  ],
  [
    [1, 1],
    [1, 1],
  ],
  [[1, 1, 1, 1]],
  [[1], [1], [1], [1]],
  [
    [1, 1, 1],
    [0, 1, 0],
  ],
  [
    [1, 0],
    [1, 1],
    [0, 1],
  ],
  [
    [1, 1, 0],
    [0, 1, 1],
  ],
  [
    [1, 0, 0],
    [1, 0, 0],
    [1, 1, 1],
  ],
];
export const blankBoard = (): Board =>
  Array.from({ length: 8 }, () => Array(8).fill(null));
export const clone = <T>(x: T): T => structuredClone(x);
function random(s: { rng: number }) {
  s.rng = (Math.imul(s.rng, 1664525) + 1013904223) >>> 0;
  return s.rng / 4294967296;
}
export function rotate(p: Piece): Piece {
  return {
    ...p,
    matrix: p.matrix[0].map((_, c) => p.matrix.map((row) => row[c]).reverse()),
  };
}
export function fits(board: Board, p: Piece, r: number, c: number) {
  return p.matrix.every((row, y) =>
    row.every(
      (v, x) =>
        !v ||
        (r + y >= 0 &&
          r + y < 8 &&
          c + x >= 0 &&
          c + x < 8 &&
          board[r + y][c + x] === null),
    ),
  );
}
export function placements(board: Board, p: Piece) {
  const out: { r: number; c: number }[] = [];
  for (let r = 0; r < 8; r++)
    for (let c = 0; c < 8; c++) if (fits(board, p, r, c)) out.push({ r, c });
  return out;
}
export function clearLines(board: Board) {
  const rows = board
      .map((row, r) => (row.every(Boolean) ? r : -1))
      .filter((r) => r >= 0),
    cols = Array.from({ length: 8 }, (_, c) =>
      board.every((row) => row[c]) ? c : -1,
    ).filter((c) => c >= 0);
  const cells: ClearEvent["cells"] = [];
  let gems = 0,
    ice = 0;
  for (let r = 0; r < 8; r++)
    for (let c = 0; c < 8; c++)
      if (rows.includes(r) || cols.includes(c)) {
        const cell = board[r][c]!;
        cells.push({ r, c, color: cell.color });
        if (cell.gem) gems++;
        if (cell.ice) {
          ice++;
          board[r][c] = { ...cell, ice: cell.ice - 1, gem: false };
        } else board[r][c] = null;
      }
  return { cells, lines: rows.length + cols.length, gems, ice };
}
function put(board: Board, p: Piece, r: number, c: number) {
  p.matrix.forEach((row, y) =>
    row.forEach((v, x) => {
      if (v) board[r + y][c + x] = { color: p.color, gem: p.gem, ice: 0 };
    }),
  );
}
/** Favor pieces fitting the live board and a planned sequence; never give oversized 3×3 bricks. */
export function deal(
  s: { board: Board; rng: number },
  level: number,
): (Piece | null)[] {
  const plan = clone(s.board);
  const tray: Piece[] = [];
  for (let i = 0; i < 3; i++) {
    const pool = MATRICES.slice(
      0,
      level < 11 ? 11 : level < 31 ? 14 : 15,
    ).filter((m) => {
      const p = { matrix: m, color: 1, gem: false };
      return placements(s.board, p).length && placements(plan, p).length;
    });
    if (!pool.length) break;
    // A small piece every tray, and crowded boards favor 1–3 cells.
    const occupancy = plan.flat().filter(Boolean).length;
    const preferred = pool.filter(
      (m) =>
        m.flat().filter(Boolean).length <= (i === 0 || occupancy > 38 ? 3 : 5),
    );
    const choice = preferred.length ? preferred : pool;
    const matrix = clone(choice[Math.floor(random(s) * choice.length)]);
    const p = {
      matrix,
      color: 1 + Math.floor(random(s) * 6),
      gem: random(s) < 0.48,
    };
    const spots = placements(plan, p);
    let best = spots[0],
      value = -Infinity;
    for (const spot of spots) {
      const b = clone(plan);
      put(b, p, spot.r, spot.c);
      const cleared = clearLines(b);
      const compact = spot.r + spot.c;
      const score = cleared.lines * 100 + compact + random(s) * 4;
      if (score > value) {
        value = score;
        best = spot;
      }
    }
    put(plan, p, best.r, best.c);
    clearLines(plan);
    tray.push(p);
  }
  while (tray.length < 3)
    tray.push({
      matrix: [[1]],
      color: 1 + Math.floor(random(s) * 6),
      gem: true,
    });
  return tray;
}
export function createRun(
  mode: Run["mode"],
  level = 1,
  seed = Date.now() >>> 0,
): Run {
  const l = LEVELS[level - 1] || LEVELS[0];
  const s: Run = {
    id: `${Date.now()}-${seed}-${Math.random().toString(36).slice(2, 8)}`,
    mode,
    campaignVersion: 2,
    level: l.id,
    rng: mode === "campaign" ? l.seed : seed,
    board: blankBoard(),
    tray: [],
    metrics: {
      score: 0,
      lines: 0,
      gems: 0,
      ice: 0,
      combo: 0,
      streak: 0,
      bestStreak: 0,
      moves: 0,
      elapsed: 0,
      boosters: 0,
      dryMoves: 0,
      perfects: 0,
    },
    status: "playing",
    rescueUsed: false,
    undo: null,
  };
  if (mode === "campaign") {
    // Friendly starter rows teach clears. Ice is only one layer and never traps a cell forever.
    const count = l.objective === "ice" ? l.target : l.chapter <= 2 ? 6 : 8;
    for (let i = 0; i < count; i++) {
      const r = Math.floor(i / 6),
        c = i % 6;
      s.board[r][c] = {
        color: 1 + Math.floor(random(s) * 6),
        gem: l.objective === "gems" || i % 3 === 0,
        ice: l.objective === "ice" ? 1 : 0,
      };
    }
  }
  if (mode === "campaign" && l.variant === "clean") {
    s.board = blankBoard();
    const start = [0, 2, 5][l.chapter % 3],
      offset = l.chapter % 2 ? 0 : 2;
    for (let r = start; r < start + 2; r++)
      for (let c = offset; c < offset + 6; c++)
        s.board[l.chapter % 2 ? r : c][l.chapter % 2 ? c : r] = {
          color: 3,
          gem: false,
          ice: 0,
        };
    const matrix = l.chapter % 2 ? [[1, 1]] : [[1], [1]];
    s.tray = [
      { matrix, color: 3, gem: false },
      { matrix: clone(matrix), color: 4, gem: false },
      null,
    ];
    return s;
  }
  if (
    mode === "campaign" &&
    (l.variant === "garden" || l.variant === "crossroads")
  ) {
    const original = clone(s.board);
    s.board = blankBoard();
    for (let r = 0; r < 8; r++)
      for (let c = 0; c < 8; c++)
        if (original[r][c]) {
          const y = l.variant === "garden" ? 7 - r : c,
            x = l.variant === "garden" ? c : r;
          s.board[y][x] = original[r][c];
        }
  }
  s.tray = deal(s, mode === "free" ? 20 : level);
  return s;
}
export function progress(s: Run) {
  return s.mode === "campaign"
    ? levelForRun(s).objective === "clear"
      ? s.metrics.perfects
      : s.metrics[levelForRun(s).objective as Exclude<Objective, "clear">]
    : s.metrics.score;
}
export function hasMove(s: Run) {
  return s.tray.some(
    (p) =>
      p &&
      [p, rotate(p), rotate(rotate(p)), rotate(rotate(rotate(p)))].some(
        (q) => placements(s.board, q).length,
      ),
  );
}
export function evaluate(s: Run) {
  if (s.mode === "campaign") {
    const l = levelForRun(s);
    if (progress(s) >= l.target) {
      s.status = "won";
      return;
    }
    if (
      (l.rule === "moves" && s.metrics.moves >= l.limit) ||
      (l.rule === "time" && s.metrics.elapsed >= l.limit)
    ) {
      s.status = "lost";
      return;
    }
  }
  s.status = hasMove(s) ? "playing" : "blocked";
}
export function place(
  s: Run,
  index: number,
  r: number,
  c: number,
): ClearEvent | null {
  if (
    s.status !== "playing" ||
    !s.tray[index] ||
    !fits(s.board, s.tray[index]!, r, c)
  )
    return null;
  s.undo = clone({
    board: s.board,
    tray: s.tray,
    rng: s.rng,
    metrics: s.metrics,
  });
  const p = s.tray[index]!;
  put(s.board, p, r, c);
  s.tray[index] = null;
  s.metrics.moves++;
  const e = clearLines(s.board);
  const count = p.matrix.flat().filter(Boolean).length;
  if (e.lines) {
    s.metrics.streak++;
    s.metrics.dryMoves = 0;
    s.metrics.bestStreak = Math.max(s.metrics.bestStreak, s.metrics.streak);
    if (e.lines >= 2 || s.metrics.streak >= 2) s.metrics.combo++;
  } else {
    s.metrics.dryMoves++;
    if (s.metrics.dryMoves >= 2) s.metrics.streak = 0;
  }
  const perfect = e.lines > 0 && s.board.flat().every((c) => c === null);
  if (perfect) s.metrics.perfects++;
  const multiplier = 1 + Math.min(4, Math.max(0, s.metrics.streak - 1)) * 0.25;
  const points =
    count * 10 +
    Math.round(
      (e.lines * 120 +
        Math.max(0, e.lines - 1) * 80 +
        e.gems * 20 +
        e.ice * 30) *
        multiplier,
    );
  const bonus = perfect ? 500 : 0;
  s.metrics.score += points + bonus;
  s.metrics.lines += e.lines;
  s.metrics.gems += e.gems;
  s.metrics.ice += e.ice;
  if (s.tray.every((p) => !p))
    s.tray = deal(s, s.mode === "free" ? 20 : s.level);
  evaluate(s);
  return { ...e, points: points + bonus, streak: s.metrics.streak, perfect };
}
export function tick(s: Run, seconds: number) {
  if (s.status !== "playing" && s.status !== "blocked") return;
  s.metrics.elapsed += Math.max(0, seconds);
  evaluate(s);
}
export function starForecast(s: Run) {
  const l = levelForRun(s);
  const spare =
    l.rule === "moves"
      ? 1 - s.metrics.moves / l.limit
      : l.rule === "time"
        ? 1 - s.metrics.elapsed / l.limit
        : 1;
  return (
    1 +
    Number(s.metrics.boosters <= 2) +
    Number(s.metrics.boosters <= 1 && spare >= 0.2)
  );
}
export function stars(s: Run) {
  return s.status === "won" ? starForecast(s) : 0;
}
export function starReasons(s: Run) {
  const n = starForecast(s);
  return n === 3
    ? [
        levelForRun(s).rule === "relaxed"
          ? "Hoàn thành mục tiêu, dùng tối đa 1 booster."
          : "Giữ ngân sách tốt, dùng tối đa 1 booster.",
      ]
    : n === 2
      ? [
          s.metrics.boosters > 1
            ? "Dùng hơn 1 booster."
            : "Còn dưới 20% ngân sách tham chiếu.",
        ]
      : ["Dùng hơn 2 booster."];
}
export type Booster = "hammer" | "shuffle" | "undo";
export const BOOSTERS: Record<
  Booster,
  { name: string; price: number; icon: string; description: string }
> = {
  hammer: {
    name: "Búa cầu vồng",
    price: 60,
    icon: "🔨",
    description: "Dọn vùng 3×3; thu sao và phá băng, không cộng điểm.",
  },
  shuffle: {
    name: "Đổi khay",
    price: 80,
    icon: "🔄",
    description: "Phát ba khối phù hợp với bàn hiện tại.",
  },
  undo: {
    name: "Quay lại",
    price: 50,
    icon: "↶",
    description: "Hoàn tác lượt đặt gần nhất; giữ thời gian đã trôi.",
  },
};
export function useBooster(s: Run, kind: Booster, r = 3, c = 3) {
  if (!["playing", "blocked"].includes(s.status)) return false;
  if (kind === "undo") {
    if (!s.undo) return false;
    const elapsed = s.metrics.elapsed,
      used = s.metrics.boosters;
    Object.assign(s, clone(s.undo));
    s.metrics.elapsed = elapsed;
    s.metrics.boosters = used;
    s.undo = null;
  }
  if (kind === "hammer") {
    for (let y = Math.max(0, r - 1); y <= Math.min(7, r + 1); y++)
      for (let x = Math.max(0, c - 1); x <= Math.min(7, c + 1); x++) {
        const cell = s.board[y][x];
        if (cell?.gem) s.metrics.gems++;
        if (cell?.ice) s.metrics.ice += cell.ice;
        s.board[y][x] = null;
      }
    s.undo = null;
  }
  if (kind === "shuffle") {
    s.tray = deal(s, s.mode === "free" ? 20 : s.level);
    s.undo = null;
  }
  s.metrics.boosters++;
  evaluate(s);
  return true;
}
export function rescue(s: Run) {
  if (s.rescueUsed || s.status !== "blocked") return false;
  let best = { r: 1, c: 1, n: -1 };
  for (let r = 1; r < 7; r++)
    for (let c = 1; c < 7; c++) {
      let n = 0;
      for (let y = r - 1; y <= r + 1; y++)
        for (let x = c - 1; x <= c + 1; x++) if (s.board[y][x]) n++;
      if (n > best.n) best = { r, c, n };
    }
  useBooster(s, "hammer", best.r, best.c);
  s.rescueUsed = true;
  return true;
}
export function hint(s: Run) {
  let best: {
    index: number;
    r: number;
    c: number;
    turns: number;
    value: number;
  } | null = null;
  s.tray.forEach((p, index) => {
    if (!p) return;
    let q = p;
    for (let turns = 0; turns < 4; turns++) {
      for (const spot of placements(s.board, q)) {
        const b = clone(s.board);
        put(b, q, spot.r, spot.c);
        const e = clearLines(b);
        const value =
          e.lines * 150 + e.gems * 30 + e.ice * 40 + spot.r + spot.c;
        if (!best || value > best.value)
          best = { index, ...spot, turns, value };
      }
      q = rotate(q);
    }
  });
  return best;
}

