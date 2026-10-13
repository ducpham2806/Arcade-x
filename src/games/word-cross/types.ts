export type Mode = "classic" | "timed" | "precision" | "mystery" | "sequence";
export type Cell = { r: number; c: number };
export type PlacedWord = { word: string; path: Cell[] };
export type Spec = {
  level: number;
  size: number;
  count: number;
  mode: Mode;
  timeLimitMs: number | null;
  mistakeLimit: number | null;
  parMs: number;
  minLength: number;
  maxLength: number;
};
export type Puzzle = Spec & {
  version: 2;
  seed: number;
  avoid: string[];
  grid: string[][];
  words: PlacedWord[];
  fallback: boolean;
};
export type Selection = { sr: number; sc: number; er: number; ec: number };
export type Run = {
  puzzle: Puzzle;
  found: PlacedWord[];
  attempts: Selection[];
  mistakes: number;
  hints: number;
  elapsedMs: number;
  status: "playing" | "won" | "lost";
  ticket: string | null;
  owner: string | null;
  daily: string | null;
  practice: boolean;
};
export type Result = {
  stars: number;
  score: number;
  elapsedMs: number;
  hints: number;
  mistakes: number;
  completedAt: number;
};
export type WordSave = {
  version: 2;
  results: Record<string, Result>;
  dailyResults: Record<string, Result>;
  legacyUnlocked: number;
  recent: string[];
  lastSeed: number | null;
  run: Run | null;
};

