import type { Move, PlayMode } from "./engine";
export interface Vehicle {
  id: number;
  isTarget: boolean;
  isHorizontal: boolean;
  length: number;
  row: number;
  col: number;
  color: string;
}
export interface LevelConfig {
  size: number;
  vehicles: Vehicle[];
  targetRow: number;
  city: number;
}
export interface CampaignLevel extends LevelConfig {
  level: number;
  optimalMoves: number;
  solution: Move[];
  mode: PlayMode;
  moveLimit: number | null;
  timeLimitMs: number | null;
  lesson: string;
  challenge: boolean;
}
export type LevelResult = {
  stars: number;
  moves: number;
  elapsedMs: number;
  hints: number;
  score: number;
};
export type Run = {
  level: number;
  config: LevelConfig;
  vehicles: Vehicle[];
  moves: number;
  history: Vehicle[][];
  elapsedMs: number;
  hints: number;
  status: "playing" | "won" | "lost";
  mode: PlayMode;
  optimalMoves: number;
  moveLimit: number | null;
  timeLimitMs: number | null;
  assisted: boolean;
  path: Move[];
  ticket: string | null;
  legacy?: boolean;
  practice?: boolean;
};
export type CarSave = {
  version: 2;
  campaignVersion: 2;
  results: Record<string, LevelResult>;
  legacyUnlocked: number;
  run: Run | null;
  endless: {
    seed: number;
    stage: number;
    score: number;
    remainingMs: number;
  } | null;
};
