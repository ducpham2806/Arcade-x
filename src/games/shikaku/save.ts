import type { Rect, ShikakuPuzzle } from './generator';
export function validRegions(size: number, value: unknown, allowOverlap = false): value is Rect[] {
  if (!Array.isArray(value) || value.length > 200) return false;
  const occupied = new Set<string>();
  for (const rect of value) {
    if (!rect || typeof rect.id !== 'string' || ![rect.r,rect.c,rect.w,rect.h].every(Number.isInteger) || rect.r < 0 || rect.c < 0 || rect.w < 1 || rect.h < 1 || rect.r + rect.h > size || rect.c + rect.w > size) return false;
    for (let r = rect.r; r < rect.r + rect.h; r++) for (let c = rect.c; c < rect.c + rect.w; c++) {
      const key = `${r}:${c}`;
      if (!allowOverlap && occupied.has(key)) return false;
      occupied.add(key);
    }
  }
  return true;
}
export function validShikakuPuzzle(value: unknown): value is ShikakuPuzzle {
  const puzzle = value as ShikakuPuzzle;
  if (!puzzle || !Number.isInteger(puzzle.size) || puzzle.size < 4 || puzzle.size > 10 || !validRegions(puzzle.size,puzzle.solution) || !Array.isArray(puzzle.hints) || puzzle.hints.length !== puzzle.solution.length) return false;
  if (puzzle.solution.reduce((area,rect)=>area + rect.w * rect.h,0) !== puzzle.size ** 2) return false;
  const positions = new Set<string>();
  for (const hint of puzzle.hints) {
    if (!hint || ![hint.r,hint.c,hint.value].every(Number.isInteger) || hint.r < 0 || hint.c < 0 || hint.r >= puzzle.size || hint.c >= puzzle.size || hint.value < 1) return false;
    const key = `${hint.r}:${hint.c}`;
    if (positions.has(key)) return false;
    positions.add(key);
  }
  return puzzle.solution.every(rect => {
    const clues = puzzle.hints.filter(hint=>hint.r >= rect.r && hint.r < rect.r + rect.h && hint.c >= rect.c && hint.c < rect.c + rect.w);
    return clues.length === 1 && clues[0].value === rect.w * rect.h;
  });
}

