// Compatibility helpers. New games use the typed engine and save schema directly.
import { dailySeed, freshSeed, generatePuzzle } from "./engine";
export { generatePuzzle, specFor, LEVEL_COUNT } from "./engine";
export function generateLevel(levelIndex: number) {
  return generatePuzzle(levelIndex + 1, freshSeed());
}
export function generateDailyPuzzle(date: string) {
  return generatePuzzle(91, dailySeed(date));
}
