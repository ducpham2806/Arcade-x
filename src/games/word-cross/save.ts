import { generatePuzzle, LEVEL_COUNT, resultFor, selectWord } from "./engine";
import type { Puzzle, Result, Run, WordSave } from "./types";
export const emptySave = (): WordSave => ({
  version: 2,
  results: {},
  dailyResults: {},
  legacyUnlocked: 0,
  recent: [],
  lastSeed: null,
  run: null,
});
const number = (n: unknown, max = 86400000) =>
  typeof n === "number" && Number.isFinite(n) && n >= 0 && n <= max;
const stable = (value: any): string =>
  JSON.stringify(value, (_, v) =>
    v && typeof v === "object" && !Array.isArray(v)
      ? Object.fromEntries(
          Object.keys(v)
            .sort()
            .map((k) => [k, v[k]]),
        )
      : v,
  );
export function validPuzzle(p: any): p is Puzzle {
  if (
    !p ||
    p.version !== 2 ||
    !Number.isInteger(p.level) ||
    p.level < 1 ||
    p.level > LEVEL_COUNT ||
    !Number.isInteger(p.seed) ||
    p.seed < 0 ||
    p.seed > 4294967295 ||
    !Array.isArray(p.avoid) ||
    p.avoid.length > 120 ||
    p.avoid.some((w: any) => typeof w !== "string" || !/^[A-Z]{3,10}$/.test(w))
  )
    return false;
  try {
    return stable(generatePuzzle(p.level, p.seed, p.avoid)) === stable(p);
  } catch {
    return false;
  }
}
export function makeRun(
  puzzle: Puzzle,
  ticket: string | null = null,
  owner: string | null = null,
  daily: string | null = null,
  practice = false,
): Run {
  return {
    puzzle,
    found: [],
    attempts: [],
    mistakes: 0,
    hints: 0,
    elapsedMs: 0,
    status: "playing",
    ticket,
    owner,
    daily,
    practice,
  };
}
function validResult(r: any): r is Result {
  return (
    r &&
    Number.isInteger(r.stars) &&
    r.stars >= 1 &&
    r.stars <= 3 &&
    number(r.score, 100000) &&
    number(r.elapsedMs) &&
    Number.isInteger(r.hints) &&
    number(r.hints, 1000) &&
    Number.isInteger(r.mistakes) &&
    number(r.mistakes, 3000) &&
    number(r.completedAt, 1e14)
  );
}
export function hydrateWordSave(raw: any): WordSave {
  const out = emptySave();
  if (!raw || typeof raw !== "object") return out;
  out.legacyUnlocked = Math.max(
    0,
    Math.min(
      LEVEL_COUNT,
      Math.floor(
        Number(
          raw.legacyUnlocked ?? (raw.version === 2 ? 0 : (raw.level ?? 1) - 1),
        ) || 0,
      ),
    ),
  );
  if (raw.version !== 2) return out;
  for (const [k, r] of Object.entries(raw.results || {}))
    if (
      /^\d+$/.test(k) &&
      Number(k) >= 1 &&
      Number(k) <= LEVEL_COUNT &&
      validResult(r)
    )
      out.results[k] = r;
  for (const [k, r] of Object.entries(raw.dailyResults || {}))
    if (/^\d{4}-\d{2}-\d{2}$/.test(k) && validResult(r))
      out.dailyResults[k] = r;
  out.recent = Array.isArray(raw.recent)
    ? raw.recent
        .filter((w: any) => typeof w === "string" && /^[A-Z]{3,10}$/.test(w))
        .slice(-120)
    : [];
  out.lastSeed =
    Number.isInteger(raw.lastSeed) && number(raw.lastSeed, 4294967295)
      ? raw.lastSeed
      : null;
  const r = raw.run;
  if (
    !r ||
    !validPuzzle(r.puzzle) ||
    !Array.isArray(r.attempts) ||
    r.attempts.length > 3000 ||
    !number(r.elapsedMs) ||
    !Number.isInteger(r.hints) ||
    !number(r.hints, 1000) ||
    typeof r.practice !== "boolean" ||
    !["playing", "won", "lost"].includes(r.status)
  )
    return out;
  let replay = makeRun(r.puzzle, null, null, null, r.practice);
  for (const s of r.attempts) {
    const next = selectWord(replay, s);
    if (next === replay) return out;
    replay = next;
  }
  if (
    stable(replay.found) !== stable(r.found) ||
    replay.mistakes !== r.mistakes
  )
    return out;
  const expired =
    !r.practice &&
    r.puzzle.timeLimitMs !== null &&
    r.elapsedMs >= r.puzzle.timeLimitMs;
  if (
    r.status !==
    (replay.status === "won"
      ? "won"
      : replay.status === "lost" || expired
        ? "lost"
        : "playing")
  )
    return out;
  if (
    r.daily !== null &&
    (!/^\d{4}-\d{2}-\d{2}$/.test(r.daily) || r.puzzle.level !== 91)
  )
    return out;
  out.run = {
    ...replay,
    elapsedMs: r.elapsedMs,
    hints: r.hints,
    status: r.status,
    ticket:
      typeof r.ticket === "string" && /^[0-9a-f-]{36}$/.test(r.ticket)
        ? r.ticket
        : null,
    owner: typeof r.owner === "string" ? r.owner : null,
    daily: r.daily,
    practice: r.practice,
  };
  return out;
}
export function complete(save: WordSave, run: Run): WordSave {
  const result = resultFor(run);
  if (!result.stars) return { ...save, run };
  const source = run.daily ? save.dailyResults : save.results,
    key = run.daily ?? String(run.puzzle.level),
    old = source[key];
  const best =
    !old ||
    result.stars > old.stars ||
    (result.stars === old.stars && result.score > old.score)
      ? result
      : old;
  return {
    ...save,
    run,
    ...(run.daily
      ? { dailyResults: { ...source, [key]: best } }
      : { results: { ...source, [key]: best } }),
  };
}

