import data from "./levels.json" with { type: "json" };
import type { CampaignLevel, LevelConfig } from "./types";
export const CAMPAIGN = data as CampaignLevel[];
export function getLevel(level: number): CampaignLevel {
  const selected = CAMPAIGN[Math.max(0, Math.min(99, Math.floor(level) - 1))];
  return {
    ...selected,
    vehicles: selected.vehicles.map((v) => ({ ...v })),
    solution: selected.solution.map((m) => ({ ...m })),
  };
}
export function generatePuzzle(level: number): LevelConfig {
  return getLevel(level);
}
export function generateBossPuzzle(): LevelConfig {
  return getLevel(100);
}
export function endlessLevel(seed: number, stage: number) {
  let x = (seed ^ Math.imul(stage, 0x9e3779b1)) >>> 0;
  x ^= x << 13;
  x ^= x >>> 17;
  x ^= x << 5;
  const max = Math.min(100, 10 + Math.floor((stage - 1) / 3) * 10);
  return 1 + ((x >>> 0) % max);
}

