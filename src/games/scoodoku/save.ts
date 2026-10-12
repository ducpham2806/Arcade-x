import type { SudokuBoardState } from './types';
export function validSudokuBoard(value: unknown): value is SudokuBoardState {
  const b = value as SudokuBoardState;
  if (!b || ![4,6,9].includes(b.dimension) || !['4x4','6x6','9x9','staircase','multigrid'].includes(b.size) || !['easy','medium','hard','expert'].includes(b.difficulty) || b.boxHeight * b.boxWidth !== b.dimension || !Array.isArray(b.cells) || b.cells.length !== b.dimension) return false;
  const digit = (n: unknown) => Number.isInteger(n) && Number(n) >= 1 && Number(n) <= b.dimension;
  return b.cells.every((row,r) => Array.isArray(row) && row.length === b.dimension && row.every((cell,c) => cell && cell.row === r && cell.col === c && typeof cell.isGiven === 'boolean' && (cell.value === null || digit(cell.value)) && digit(cell.solutionValue) && Array.isArray(cell.notes) && cell.notes.every(digit) && (!cell.isGiven || cell.value === cell.solutionValue)));
}
