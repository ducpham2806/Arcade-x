import type { LevelConfig, Vehicle, CarSave, Run, LevelResult } from "./types";
import { solve } from "./engine";
export function validCarBoard(
  config: unknown,
  vehicles: unknown,
): config is LevelConfig {
  const b = config as LevelConfig;
  if (
    !b ||
    !Number.isInteger(b.size) ||
    b.size < 4 ||
    b.size > 10 ||
    !Number.isInteger(b.targetRow) ||
    b.targetRow < 0 ||
    b.targetRow >= b.size ||
    !Array.isArray(vehicles) ||
    !vehicles.length ||
    vehicles.length > b.size * b.size
  )
    return false;
  const ids = new Set<number>(),
    cells = new Set<number>();
  let targets = 0;
  for (const v of vehicles as Vehicle[]) {
    if (
      !v ||
      !Number.isInteger(v.id) ||
      ids.has(v.id) ||
      typeof v.isHorizontal !== "boolean" ||
      typeof v.isTarget !== "boolean" ||
      typeof v.color !== "string" ||
      !Number.isInteger(v.length) ||
      v.length < 2 ||
      v.length > 3 ||
      !Number.isInteger(v.row) ||
      !Number.isInteger(v.col)
    )
      return false;
    ids.add(v.id);
    if (v.isTarget) {
      targets++;
      if (!v.isHorizontal || v.row !== b.targetRow) return false;
    }
    for (let j = 0; j < v.length; j++) {
      const r = v.row + (v.isHorizontal ? 0 : j),
        c = v.col + (v.isHorizontal ? j : 0);
      if (
        r < 0 ||
        c < 0 ||
        r >= b.size ||
        c >= b.size ||
        cells.has(r * b.size + c)
      )
        return false;
      cells.add(r * b.size + c);
    }
  }
  return targets === 1;
}
export const emptySave = (): CarSave => ({
  version: 2,
  campaignVersion: 2,
  results: {},
  run: null,
  endless: null,
  legacyUnlocked: 0,
});
const nonnegative = (n: unknown) =>
  typeof n === "number" && Number.isFinite(n) && n >= 0;
function sameFleet(config: LevelConfig, state: Vehicle[]) {
  return (
    validCarBoard(config, state) &&
    config.vehicles.length === state.length &&
    config.vehicles.every((v) => {
      const o = state.find((o) => o.id === v.id);
      return (
        o &&
        o.length === v.length &&
        o.isHorizontal === v.isHorizontal &&
        o.isTarget === v.isTarget &&
        (v.isHorizontal ? o.row === v.row : o.col === v.col)
      );
    })
  );
}
export function hydrateCarSave(raw: any): CarSave {
  const out = emptySave();
  if (!raw || typeof raw !== "object") return out;
  const legacy = Math.min(
    100,
    Math.max(
      0,
      Math.floor(Number(raw.legacyUnlocked ?? raw.maxCompletedLevel) || 0),
    ),
  );
  out.legacyUnlocked = legacy;
  if (
    raw.version === 1 &&
    Number.isInteger(raw.level) &&
    raw.level > 0 &&
    validCarBoard(raw.config, raw.vehicles)
  ) {
    const history = Array.isArray(raw.history)
      ? raw.history
          .filter((v: Vehicle[]) => sameFleet(raw.config, v))
          .slice(-100)
      : [];
    const sol = solve(raw.config, raw.config.vehicles || raw.vehicles, 20000);
    out.run = {
      level: Math.min(100, raw.level),
      config: raw.config,
      vehicles: raw.vehicles,
      moves: Math.max(0, Number(raw.moves) || 0),
      history,
      elapsedMs: 0,
      hints: 0,
      status: raw.isWon ? "won" : "playing",
      mode: "classic",
      optimalMoves: sol.status === "solved" ? sol.moves.length : 5,
      moveLimit: null,
      timeLimitMs: null,
      assisted: true,
      path: [],
      ticket: null,
      legacy: true,
    };
    return out;
  }
  if (raw.version !== 2 || raw.campaignVersion !== 2) return out;
  for (const [key, r] of Object.entries(raw.results || {}) as [
    string,
    LevelResult,
  ][]) {
    if (
      /^([1-9]\d?|100)$/.test(key) &&
      r &&
      Number.isInteger(r.stars) &&
      r.stars >= 1 &&
      r.stars <= 3 &&
      nonnegative(r.moves) &&
      nonnegative(r.elapsedMs) &&
      nonnegative(r.hints) &&
      nonnegative(r.score)
    )
      out.results[key] = r;
  }
  const r = raw.run as Run;
  if (
    r &&
    Number.isInteger(r.level) &&
    r.level >= 1 &&
    r.level <= 100 &&
    validCarBoard(r.config, r.config?.vehicles) &&
    sameFleet(r.config, r.vehicles) &&
    ["classic", "turns", "timed", "endless"].includes(r.mode) &&
    ["playing", "won", "lost"].includes(r.status) &&
    [r.moves, r.elapsedMs, r.hints, r.optimalMoves].every(nonnegative) &&
    (r.moveLimit === null || nonnegative(r.moveLimit)) &&
    (r.timeLimitMs === null || nonnegative(r.timeLimitMs))
  ) {
    out.run = {
      ...r,
      history: Array.isArray(r.history)
        ? r.history.filter((v) => sameFleet(r.config, v)).slice(-100)
        : [],
      path: Array.isArray(r.path)
        ? r.path
            .filter(
              (m) => Number.isInteger(m.vehicleId) && Number.isInteger(m.to),
            )
            .slice(0, 1000)
        : [],
      ticket: typeof r.ticket === "string" ? r.ticket : null,
      assisted: !!r.assisted,
      legacy: !!r.legacy,
    };
  }
  const e = raw.endless;
  if (
    out.run &&
    e &&
    Number.isSafeInteger(e.seed) &&
    Number.isInteger(e.stage) &&
    e.stage > 0 &&
    nonnegative(e.score) &&
    nonnegative(e.remainingMs)
  )
    out.endless = {
      seed: e.seed,
      stage: e.stage,
      score: e.score,
      remainingMs: e.remainingMs,
    };
  return out;
}
