import { validSkin, BoardSkin } from "./skins";
import { Run, Booster, BOOSTERS, clone, createRun, stars } from "./engine";
export interface BlockSave {
  version: 2;
  favoriteSkin?: BoardSkin;
  frame?: "plain" | "gold" | "rainbow";
  frames: string[];
  claimedChapters: number[];
  seenBoosters: string[];
  lastBoardSkin?: BoardSkin;
  coins: number;
  best: number;
  records: Record<number, { stars: number; score: number }>;
  inventory: Record<Booster, number>;
  run: Run | null;
  settled: string[];
  reducedMotion: boolean;
}
export const emptySave = (): BlockSave => ({
  version: 2,
  frames: ["plain"],
  claimedChapters: [],
  seenBoosters: [],
  coins: 200,
  best: 0,
  records: {},
  inventory: { hammer: 2, shuffle: 2, undo: 3 },
  run: null,
  settled: [],
  reducedMotion: false,
});
const integer = (n: unknown, max = 1e9) =>
  typeof n === "number" && Number.isInteger(n) && n >= 0 && n <= max;
export function hydrate(raw: any): BlockSave {
  const s = emptySave();
  if (
    raw?.version === 1 &&
    Array.isArray(raw.grid) &&
    raw.grid.length === 8 &&
    raw.grid.every(
      (row: any) =>
        Array.isArray(row) &&
        row.length === 8 &&
        row.every((c: any) => c === null || typeof c === "string"),
    ) &&
    integer(raw.score)
  ) {
    s.best = raw.score;
    if (
      !raw.gameOver &&
      Array.isArray(raw.shapes) &&
      raw.shapes.length === 3 &&
      raw.shapes.every(
        (p: any) =>
          p === null ||
          (Array.isArray(p?.matrix) &&
            p.matrix.length > 0 &&
            p.matrix.length <= 5 &&
            p.matrix.every(
              (row: any) =>
                Array.isArray(row) &&
                row.length > 0 &&
                row.length <= 5 &&
                row.length === p.matrix[0].length &&
                row.every((v: any) => v === 0 || v === 1),
            )),
      )
    ) {
      const run = createRun("free");
      run.metrics.score = raw.score;
      const color = (name: string) =>
        name.includes("ruby")
          ? 1
          : name.includes("amethyst")
            ? 5
            : name.includes("sapphire")
              ? 4
              : name.includes("teal") || name.includes("jade")
                ? 3
                : 2;
      run.board = raw.grid.map((row: any) =>
        row.map((c: any) =>
          c === null
            ? null
            : {
                color: color(c),
                gem: c.startsWith("wood_") && c !== "wood_plain",
                ice: 0,
              },
        ),
      );
      run.tray = raw.shapes.map((p: any) =>
        p === null
          ? null
          : {
              matrix: clone(p.matrix),
              color: color(p.color || "wood_plain"),
              gem: !!p.gemType,
            },
      );
      s.run = run;
    }
    return s;
  }
  if (raw?.version !== 2) return s;
  if (validSkin(raw.lastBoardSkin)) s.lastBoardSkin = raw.lastBoardSkin;
  if (integer(raw.coins)) s.coins = raw.coins;
  if (integer(raw.best)) s.best = raw.best;
  for (let i = 1; i <= 100; i++) {
    const r = raw.records?.[i];
    if (integer(r?.stars, 3) && r.stars > 0 && integer(r.score))
      s.records[i] = r;
  }
  for (const key of Object.keys(BOOSTERS) as Booster[])
    if (integer(raw.inventory?.[key], 999))
      s.inventory[key] = raw.inventory[key];
  s.settled = Array.isArray(raw.settled)
    ? raw.settled.filter((x: any) => typeof x === "string").slice(-200)
    : [];
  s.reducedMotion = raw.reducedMotion === true;
  if (validSkin(raw.favoriteSkin)) s.favoriteSkin = raw.favoriteSkin;
  s.frames = Array.isArray(raw.frames)
    ? [
        ...new Set([
          "plain",
          ...raw.frames.filter((x: any) => ["gold", "rainbow"].includes(x)),
        ]),
      ]
    : ["plain"];
  s.frame = s.frames.includes(raw.frame) ? raw.frame : "plain";
  s.claimedChapters = Array.isArray(raw.claimedChapters)
    ? raw.claimedChapters.filter((n: any) => integer(n, 10) && n > 0)
    : [];
  s.seenBoosters = Array.isArray(raw.seenBoosters)
    ? raw.seenBoosters.filter((x: any) => Object.hasOwn(BOOSTERS, x))
    : [];
  const run = raw.run ? clone(raw.run) : null;
  if (run?.metrics) {
    run.metrics = { dryMoves: 0, perfects: 0, ...run.metrics };
  }

  if (
    run &&
    typeof run.id === "string" &&
    ["free", "campaign"].includes(run.mode) &&
    integer(run.level, 100) &&
    run.level >= 1 &&
    integer(run.rng, 4294967295) &&
    ["playing", "blocked", "won", "lost", "ended"].includes(run.status)
  ) {
    const validCell = (c: any) =>
      c === null ||
      (integer(c?.color, 6) &&
        c.color >= 1 &&
        typeof c.gem === "boolean" &&
        integer(c.ice, 1));
    const boardOk =
      Array.isArray(run.board) &&
      run.board.length === 8 &&
      run.board.every(
        (r: any) => Array.isArray(r) && r.length === 8 && r.every(validCell),
      );
    const pieceOk = (p: any) =>
      p === null ||
      (integer(p?.color, 6) &&
        p.color >= 1 &&
        typeof p.gem === "boolean" &&
        Array.isArray(p.matrix) &&
        p.matrix.length >= 1 &&
        p.matrix.length <= 5 &&
        p.matrix.every(
          (row: any) =>
            Array.isArray(row) &&
            row.length === p.matrix[0].length &&
            row.length >= 1 &&
            row.length <= 5 &&
            row.every((v: any) => v === 0 || v === 1),
        ) &&
        p.matrix.flat().some(Boolean));
    if (
      boardOk &&
      Array.isArray(run.tray) &&
      run.tray.length === 3 &&
      run.tray.every(pieceOk) &&
      Object.keys(createRun("free").metrics).every(
        (k) =>
          typeof run.metrics?.[k] === "number" &&
          Number.isFinite(run.metrics[k]) &&
          run.metrics[k] >= 0 &&
          run.metrics[k] <= 1e9,
      )
    ) {
      s.run = clone(run);
      s.run!.boardSkin = validSkin(run.boardSkin) ? run.boardSkin : "mint";
      s.run!.undo = null;
      const undo = run.undo;
      if (undo?.metrics) {
        undo.metrics = { dryMoves: 0, perfects: 0, ...undo.metrics };
      }
      if (
        undo &&
        integer(undo.rng, 4294967295) &&
        Array.isArray(undo.board) &&
        undo.board.length === 8 &&
        undo.board.every(
          (r: any) => Array.isArray(r) && r.length === 8 && r.every(validCell),
        ) &&
        Array.isArray(undo.tray) &&
        undo.tray.length === 3 &&
        undo.tray.every(pieceOk) &&
        Object.keys(createRun("free").metrics).every(
          (k) =>
            typeof undo.metrics?.[k] === "number" &&
            Number.isFinite(undo.metrics[k]) &&
            undo.metrics[k] >= 0,
        ) &&
        undo.metrics.moves === run.metrics.moves - 1 &&
        undo.metrics.elapsed <= run.metrics.elapsed &&
        undo.metrics.score <= run.metrics.score
      ) {
        s.run!.undo = undo;
      }
      s.run!.rescueUsed = run.rescueUsed === true;
    }
  }
  return s;
}
export function levelOpen(s: BlockSave, id: number) {
  return id === 1 || Boolean(s.records[id - 1]);
}
export function settle(s: BlockSave, run: Run) {
  if (["playing", "blocked"].includes(run.status) || s.settled.includes(run.id))
    return 0;
  let coins = 0;
  s.best = Math.max(s.best, run.metrics.score);
  if (run.mode === "free")
    coins = Math.min(300, Math.floor(run.metrics.score / 80));
  else if (run.status === "won") {
    const old = s.records[run.level],
      n = stars(run);
    coins = old
      ? 20 + Math.max(0, n - old.stars) * 20
      : 100 + Math.floor((run.level - 1) / 10) * 10 + n * 20;
    s.records[run.level] = {
      stars: Math.max(old?.stars || 0, n),
      score: Math.max(old?.score || 0, run.metrics.score),
    };
  }
  if (run.mode === "campaign" && run.status === "won") {
    const chapter = Math.ceil(run.level / 10);
    if (
      !s.claimedChapters.includes(chapter) &&
      Array.from({ length: 10 }, (_, i) => (chapter - 1) * 10 + i + 1).every(
        (id) => s.records[id],
      )
    ) {
      coins += 200;
      s.claimedChapters.push(chapter);
    }
  }
  s.coins += coins;
  s.settled.push(run.id);
  s.settled = s.settled.slice(-200);
  return coins;
}
export function buy(s: BlockSave, kind: Booster) {
  if (s.coins < BOOSTERS[kind].price || s.inventory[kind] >= 999) return false;
  s.coins -= BOOSTERS[kind].price;
  s.inventory[kind]++;
  return true;
}

export function buyFrame(s: BlockSave, frame: "gold" | "rainbow") {
  const cost = frame === "gold" ? 300 : 500;
  if (s.frames.includes(frame) || s.coins < cost) return false;
  s.coins -= cost;
  s.frames.push(frame);
  s.frame = frame;
  return true;
}

