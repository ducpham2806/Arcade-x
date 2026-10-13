import lexicon from "./data/lexicon.json" with { type: "json" };
import type {
  Cell,
  Mode,
  PlacedWord,
  Puzzle,
  Run,
  Selection,
  Spec,
} from "./types";
export const LEVEL_COUNT = 200;
export const MODES: Mode[] = [
  "classic",
  "timed",
  "precision",
  "mystery",
  "sequence",
];
export const MODE_LABELS: Record<Mode, string> = {
  classic: "Tự do",
  timed: "Đếm ngược",
  precision: "Chính xác",
  mystery: "Ẩn chữ",
  sequence: "Theo thứ tự",
};
export const MODE_HELP: Record<Mode, string> = {
  classic: "Tìm tất cả từ. Không giới hạn thời gian.",
  timed: "Tìm hết từ trước khi đồng hồ về 0.",
  precision: "Chọn đúng từ; số lần chọn sai có giới hạn.",
  mystery: "Nhìn chữ đầu, chữ cuối và độ dài để tìm từ bị ẩn.",
  sequence: "Tìm từ được đánh dấu trước, lần lượt theo danh sách.",
};
export const LEXICON_SIZE = lexicon.common.length + lexicon.extended.length;
export const DIRS = [
  [0, 1],
  [1, 0],
  [1, 1],
  [-1, 1],
  [0, -1],
  [-1, 0],
  [-1, -1],
  [1, -1],
];
export function specFor(level: number): Spec {
  if (!Number.isInteger(level) || level < 1 || level > LEVEL_COUNT)
    throw new Error("Invalid level");
  const size = level <= 25 ? 6 : level <= 60 ? 8 : level <= 120 ? 10 : 12;
  const count = Math.min(size, 4 + Math.floor((level - 1) / 22));
  const mode =
    level <= 3
      ? "classic"
      : MODES[(level * 17 + Math.floor(level / 7) * 3) % 5];
  return {
    level,
    size,
    count,
    mode,
    timeLimitMs: mode === "timed" ? Math.max(90000, count * 18000) : null,
    mistakeLimit:
      mode === "precision" ? Math.max(3, Math.ceil(count / 2)) : null,
    parMs: count * 9000 + size * 2000,
    minLength: level <= 25 ? 3 : level <= 120 ? 4 : 5,
    maxLength: Math.min(size, level <= 25 ? 5 : level <= 60 ? 7 : 10),
  };
}
export function freshSeed(previous: number | null = null) {
  const a = new Uint32Array(1);
  crypto.getRandomValues(a);
  return a[0] === previous ? (a[0] + 1) >>> 0 : a[0];
}
export function dailySeed(day: string) {
  if (!/^\d{4}-\d{2}-\d{2}$/.test(day)) throw new Error("Invalid date");
  return Number(day.replaceAll("-", "")) >>> 0;
}
export function generatePuzzle(
  level: number,
  seed: number,
  avoid: string[] = [],
): Puzzle {
  const spec = specFor(level),
    skip = new Set(avoid);
  let state = (seed ^ Math.imul(level, 2654435761)) >>> 0;
  const next = () => {
    state = (Math.imul(state, 1664525) + 1013904223) >>> 0;
    return state >>> 8;
  };
  const pool = (
    level <= 120 ? lexicon.common : [...lexicon.common, ...lexicon.extended]
  )
    .filter(
      (w) =>
        w.length >= spec.minLength &&
        w.length <= spec.maxLength &&
        !skip.has(w),
    )
    .sort();
  if (pool.length < spec.count) throw new Error("Insufficient dictionary");
  const chosen: string[] = [];
  while (chosen.length < spec.count) {
    const w = pool[next() % pool.length];
    if (!chosen.includes(w) && !chosen.includes(w.split("").reverse().join("")))
      chosen.push(w);
  }
  chosen.sort((a, b) => b.length - a.length || (a < b ? -1 : a > b ? 1 : 0));
  let grid: string[][] = Array.from({ length: spec.size }, () =>
    Array(spec.size).fill(""),
  );
  let words: PlacedWord[] = [],
    fallback = false;
  for (const word of chosen) {
    let placed = false;
    for (let attempt = 0; attempt < 200; attempt++) {
      const [dr, dc] = DIRS[next() % DIRS.length],
        r = next() % spec.size,
        c = next() % spec.size;
      const path = Array.from({ length: word.length }, (_, i) => ({
        r: r + i * dr,
        c: c + i * dc,
      }));
      if (
        !path.every(
          (p, i) =>
            p.r >= 0 &&
            p.c >= 0 &&
            p.r < spec.size &&
            p.c < spec.size &&
            (!grid[p.r][p.c] || grid[p.r][p.c] === word[i]),
        )
      )
        continue;
      path.forEach((p, i) => (grid[p.r][p.c] = word[i]));
      words.push({ word, path });
      placed = true;
      break;
    }
    if (!placed) {
      fallback = true;
      break;
    }
  }
  if (fallback) {
    grid = Array.from({ length: spec.size }, () => Array(spec.size).fill(""));
    words = [];
    const rows = Array.from({ length: spec.size }, (_, i) => i);
    for (let i = rows.length - 1; i > 0; i--) {
      const j = next() % (i + 1);
      [rows[i], rows[j]] = [rows[j], rows[i]];
    }
    chosen.forEach((word, i) => {
      const reverse = next() % 2 === 1,
        start = next() % (spec.size - word.length + 1),
        path = Array.from({ length: word.length }, (_, j) => ({
          r: rows[i],
          c: start + (reverse ? word.length - 1 - j : j),
        }));
      path.forEach((p, j) => (grid[p.r][p.c] = word[j]));
      words.push({ word, path });
    });
  }
  for (let r = 0; r < spec.size; r++)
    for (let c = 0; c < spec.size; c++)
      if (!grid[r][c]) grid[r][c] = "ABCDEFGHIJKLMNOPQRSTUVWXYZ"[next() % 26];
  return {
    ...spec,
    version: 2,
    seed: seed >>> 0,
    avoid: [...avoid],
    grid,
    words,
    fallback,
  };
}
export function pathFor(s: Selection, size: number): Cell[] | null {
  const values = [s?.sr, s?.sc, s?.er, s?.ec];
  if (values.some((n) => !Number.isInteger(n) || n < 0 || n >= size))
    return null;
  const dr = s.er - s.sr,
    dc = s.ec - s.sc;
  if (
    (dr === 0 && dc === 0) ||
    (dr !== 0 && dc !== 0 && Math.abs(dr) !== Math.abs(dc))
  )
    return null;
  return Array.from(
    { length: Math.max(Math.abs(dr), Math.abs(dc)) + 1 },
    (_, i) => ({ r: s.sr + i * Math.sign(dr), c: s.sc + i * Math.sign(dc) }),
  );
}
export function snapEnd(start: Cell, end: Cell, size: number): Cell {
  const dr = end.r - start.r,
    dc = end.c - start.c;
  if (Math.abs(dr) > Math.abs(dc) * 2) return { r: end.r, c: start.c };
  if (Math.abs(dc) > Math.abs(dr) * 2) return { r: start.r, c: end.c };
  const dist = Math.min(
    Math.max(Math.abs(dr), Math.abs(dc)),
    Math.sign(dr) > 0 ? size - 1 - start.r : start.r,
    Math.sign(dc) > 0 ? size - 1 - start.c : start.c,
  );
  return {
    r: start.r + Math.sign(dr) * dist,
    c: start.c + Math.sign(dc) * dist,
  };
}
export function selectWord(run: Run, s: Selection): Run {
  if (run.status !== "playing") return run;
  const path = pathFor(s, run.puzzle.size);
  if (!path) return run;
  const word = path.map((p) => run.puzzle.grid[p.r][p.c]).join(""),
    reverse = word.split("").reverse().join("");
  const match = run.puzzle.words.find(
    (w) => w.word === word || w.word === reverse,
  );
  if (match && run.found.some((w) => w.word === match.word)) return run;
  const allowed =
    match &&
    (run.puzzle.mode !== "sequence" ||
      run.puzzle.words[run.found.length].word === match.word);
  const found = allowed
      ? [...run.found, { word: match.word, path }]
      : run.found,
    mistakes = run.mistakes + (allowed ? 0 : 1);
  const status =
    found.length === run.puzzle.words.length
      ? "won"
      : !run.practice &&
          run.puzzle.mistakeLimit !== null &&
          mistakes >= run.puzzle.mistakeLimit
        ? "lost"
        : "playing";
  return { ...run, found, mistakes, status, attempts: [...run.attempts, s] };
}
export function resultFor(run: Run) {
  const p = run.puzzle;
  const stars =
    run.practice || run.status !== "won"
      ? 0
      : run.hints > 0
        ? 1
        : run.mistakes === 0 &&
            run.elapsedMs <= p.parMs &&
            (p.timeLimitMs === null || run.elapsedMs <= p.timeLimitMs * 0.75)
          ? 3
          : run.mistakes <= 2 && run.elapsedMs <= p.parMs * 1.75
            ? 2
            : 1;
  return {
    stars,
    score: Math.max(
      100,
      stars * 1000 +
        p.count * 100 +
        Math.max(0, 600 - Math.floor(run.elapsedMs / 1000) * 2) -
        run.mistakes * 40 -
        run.hints * 100,
    ),
    elapsedMs: run.elapsedMs,
    hints: run.hints,
    mistakes: run.mistakes,
    completedAt: Date.now(),
  };
}

