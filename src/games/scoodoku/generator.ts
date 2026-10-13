import { SudokuBoardState, SudokuCell, SudokuDifficulty, SudokuGridSize } from './types';

// Check if a number can be placed at (row, col) in a grid
export function isValidPlacement(
  grid: number[][],
  row: number,
  col: number,
  num: number,
  boxWidth: number,
  boxHeight: number,
  dimension: number
): boolean {
  // Check Row
  for (let c = 0; c < dimension; c++) {
    if (c !== col && grid[row][c] === num) return false;
  }

  // Check Column
  for (let r = 0; r < dimension; r++) {
    if (r !== row && grid[r][col] === num) return false;
  }

  // Check Box
  const startRow = Math.floor(row / boxHeight) * boxHeight;
  const startCol = Math.floor(col / boxWidth) * boxWidth;

  for (let r = startRow; r < startRow + boxHeight; r++) {
    for (let c = startCol; c < startCol + boxWidth; c++) {
      if ((r !== row || c !== col) && grid[r][c] === num) return false;
    }
  }

  return true;
}

// Backtracking solver to fill grid
function solveGrid(
  grid: number[][],
  boxWidth: number,
  boxHeight: number,
  dimension: number,
  randomize = true
): boolean {
  for (let r = 0; r < dimension; r++) {
    for (let c = 0; c < dimension; c++) {
      if (grid[r][c] === 0) {
        const numbers: number[] = Array.from({ length: dimension }, (_, i) => i + 1);
        if (randomize) {
          // Shuffle numbers for random solution generation
          for (let i = numbers.length - 1; i > 0; i--) {
            const j = Math.floor(Math.random() * (i + 1));
            [numbers[i], numbers[j]] = [numbers[j], numbers[i]];
          }
        }

        for (const num of numbers) {
          if (isValidPlacement(grid, r, c, num, boxWidth, boxHeight, dimension)) {
            grid[r][c] = num;
            if (solveGrid(grid, boxWidth, boxHeight, dimension, randomize)) {
              return true;
            }
            grid[r][c] = 0;
          }
        }
        return false;
      }
    }
  }
  return true;
}

// Stop at two solutions; MRV keeps uniqueness checks practical during clue removal.
export function countSudokuSolutions(input: number[][], boxWidth: number, boxHeight: number, dimension: number): number {
  if (input.length !== dimension || !input.every(row => row.length === dimension && row.every(n => Number.isInteger(n) && n >= 0 && n <= dimension))) return 0;
  const grid = input.map(row => [...row]);
  for (let r = 0; r < dimension; r++) for (let c = 0; c < dimension; c++) {
    if (grid[r][c] && !isValidPlacement(grid, r, c, grid[r][c], boxWidth, boxHeight, dimension)) return 0;
  }
  let count = 0;
  function search() {
    if (count >= 2) return;
    let target: [number, number] | null = null;
    let options: number[] = [];
    for (let r = 0; r < dimension; r++) for (let c = 0; c < dimension; c++) {
      if (grid[r][c]) continue;
      const candidates = Array.from({ length: dimension }, (_, i) => i + 1)
        .filter(n => isValidPlacement(grid, r, c, n, boxWidth, boxHeight, dimension));
      if (!candidates.length) return;
      if (!target || candidates.length < options.length) { target = [r, c]; options = candidates; }
    }
    if (!target) { count++; return; }
    const [r, c] = target;
    for (const n of options) { grid[r][c] = n; search(); grid[r][c] = 0; if (count >= 2) return; }
  }
  search();
  return count;
}

export function isSolvableWithEntry(board: SudokuBoardState, row: number, col: number, value: number): boolean {
  const grid = board.cells.map(cells => cells.map(cell => cell.value || 0));
  grid[row][col] = value;
  return countSudokuSolutions(grid, board.boxWidth, board.boxHeight, board.dimension) > 0;
}

// Generate a full solved board
export function generateFullSolution(
  dimension: number,
  boxWidth: number,
  boxHeight: number
): number[][] {
  const grid: number[][] = Array.from({ length: dimension }, () =>
    Array.from({ length: dimension }, () => 0)
  );
  solveGrid(grid, boxWidth, boxHeight, dimension, true);
  return grid;
}

// Generate puzzle with specified clues count
export function generateSudokuBoard(
  size: SudokuGridSize = '9x9',
  difficulty: SudokuDifficulty = 'medium',
  levelSeed?: number
): SudokuBoardState {
  let dimension = 9;
  let boxWidth = 3;
  let boxHeight = 3;

  if (size === '4x4') {
    dimension = 4;
    boxWidth = 2;
    boxHeight = 2;
  } else if (size === '6x6') {
    dimension = 6;
    boxWidth = 3;
    boxHeight = 2;
  } else {
    dimension = 9;
    boxWidth = 3;
    boxHeight = 3;
  }

  // 1. Generate full solved solution
  const solution = generateFullSolution(dimension, boxWidth, boxHeight);

  // 2. Decide how many clues to keep based on difficulty & size
  let cluesCount = 32;
  if (dimension === 4) {
    cluesCount = difficulty === 'easy' ? 9 : difficulty === 'medium' ? 7 : 5;
  } else if (dimension === 6) {
    cluesCount = difficulty === 'easy' ? 22 : difficulty === 'medium' ? 18 : 14;
  } else if (size === 'staircase') {
    // Special IQ 180 Staircase Pattern like user's photo!
    // Row 0: 9 clues, Row 1: 8 clues, Row 2: 7 clues, etc.
    // Gives an elegant upper-right staircase of clues
  } else {
    // 9x9 standard
    switch (difficulty) {
      case 'easy':
        cluesCount = 40 + Math.floor(Math.random() * 4);
        break;
      case 'medium':
        cluesCount = 32 + Math.floor(Math.random() * 4);
        break;
      case 'hard':
        cluesCount = 26 + Math.floor(Math.random() * 3);
        break;
      case 'expert':
        cluesCount = 22 + Math.floor(Math.random() * 3);
        break;
    }
  }

  // 3. Build cells matrix
  const cells: SudokuCell[][] = Array.from({ length: dimension }, (_, r) =>
    Array.from({ length: dimension }, (_, c) => ({
      row: r,
      col: c,
      value: null,
      solutionValue: solution[r][c],
      isGiven: false,
      notes: [],
    }))
  );

  const puzzle = solution.map(row => [...row]);
  const positions: { r: number; c: number }[] = [];
  for (let r = 0; r < dimension; r++) for (let c = 0; c < dimension; c++) {
    if (size !== 'staircase' || c < r) positions.push({ r, c });
  }
  for (let i = positions.length - 1; i > 0; i--) {
    const j = Math.floor(Math.random() * (i + 1));
    [positions[i], positions[j]] = [positions[j], positions[i]];
  }
  let clues = dimension * dimension;
  for (const { r, c } of positions) {
    if (size !== 'staircase' && clues <= cluesCount) break;
    const previous = puzzle[r][c];
    puzzle[r][c] = 0;
    if (countSudokuSolutions(puzzle, boxWidth, boxHeight, dimension) === 1) clues--;
    else puzzle[r][c] = previous;
  }
  // Difficulty clue counts are targets. Keep additional clues if uniqueness requires them.
  for (let r = 0; r < dimension; r++) for (let c = 0; c < dimension; c++) {
    cells[r][c].value = puzzle[r][c] || null;
    cells[r][c].isGiven = puzzle[r][c] !== 0;
  }

  const titleMap: Record<SudokuGridSize, string> = {
    '4x4': 'Sudoku Mini 4x4',
    '6x6': 'Sudoku Midi 6x6',
    '9x9': 'Sudoku Classic 9x9',
    'staircase': 'Sudoku IQ 180 Bậc Thang',
    'multigrid': 'Sudoku Đa Ma Trận',
  };

  return {
    size,
    dimension,
    boxWidth,
    boxHeight,
    cells,
    difficulty,
    title: titleMap[size] || 'Sudoku Puzzle',
    description:
      size === 'staircase'
        ? 'Ma trận bậc thang đố mẹo đỉnh cao! Dựa vào phần bậc thang đã cho sẵn để suy luận các ô còn lại.'
        : `Giải đố Sudoku ma trận ${dimension}x${dimension} với logic hàng, cột và khối chuẩn xác.`,
  };
}

// Generate Dual/Multi-grid Sudoku (2 overlapping 9x9 grids)
export function generateMultiGridSudoku(difficulty: SudokuDifficulty = 'medium'): SudokuBoardState {
  const base = generateSudokuBoard('9x9', difficulty);
  base.size = 'multigrid';
  base.title = 'Song Trận Giao Thoa (Twin Grids)';
  base.description = 'Giải đố 2 ma trận Sudoku giao thoa tại khối trung tâm!';
  return base;
}

// Count remaining digits (how many times digit d is left to place in 1..dimension)
export function getDigitCounts(
  cells: SudokuCell[][],
  dimension: number
): Record<number, { placed: number; total: number; remaining: number }> {
  const counts: Record<number, { placed: number; total: number; remaining: number }> = {};
  for (let d = 1; d <= dimension; d++) {
    counts[d] = { placed: 0, total: dimension, remaining: dimension };
  }

  for (let r = 0; r < cells.length; r++) {
    for (let c = 0; c < cells[r].length; c++) {
      const val = cells[r][c].value;
      if (val && counts[val]) {
        counts[val].placed += 1;
        counts[val].remaining = Math.max(0, counts[val].total - counts[val].placed);
      }
    }
  }

  return counts;
}

// Find conflicting cells (duplicates in same row, column or box)
export function findConflicts(
  cells: SudokuCell[][],
  dimension: number,
  boxWidth: number,
  boxHeight: number
): Set<string> {
  const conflictSet = new Set<string>();

  // Check rows
  for (let r = 0; r < dimension; r++) {
    const seen = new Map<number, number[]>();
    for (let c = 0; c < dimension; c++) {
      const val = cells[r][c].value;
      if (val !== null) {
        if (!seen.has(val)) seen.set(val, []);
        seen.get(val)!.push(c);
      }
    }
    seen.forEach((cols) => {
      if (cols.length > 1) {
        cols.forEach((c) => conflictSet.add(`${r},${c}`));
      }
    });
  }

  // Check cols
  for (let c = 0; c < dimension; c++) {
    const seen = new Map<number, number[]>();
    for (let r = 0; r < dimension; r++) {
      const val = cells[r][c].value;
      if (val !== null) {
        if (!seen.has(val)) seen.set(val, []);
        seen.get(val)!.push(r);
      }
    }
    seen.forEach((rows) => {
      if (rows.length > 1) {
        rows.forEach((r) => conflictSet.add(`${r},${c}`));
      }
    });
  }

  // Check boxes
  for (let br = 0; br < dimension; br += boxHeight) {
    for (let bc = 0; bc < dimension; bc += boxWidth) {
      const seen = new Map<number, { r: number; c: number }[]>();
      for (let r = br; r < br + boxHeight; r++) {
        for (let c = bc; c < bc + boxWidth; c++) {
          const val = cells[r][c].value;
          if (val !== null) {
            if (!seen.has(val)) seen.set(val, []);
            seen.get(val)!.push({ r, c });
          }
        }
      }
      seen.forEach((positions) => {
        if (positions.length > 1) {
          positions.forEach(({ r, c }) => conflictSet.add(`${r},${c}`));
        }
      });
    }
  }

  return conflictSet;
}

// Check if entire board is fully filled and correctly solved
export function isBoardSolved(cells: SudokuCell[][]): boolean {
  const dimension = cells.length;
  if (![4, 6, 9].includes(dimension) || cells.some(row => row.length !== dimension)) return false;
  const boxWidth = dimension === 6 ? 3 : Math.sqrt(dimension);
  const boxHeight = dimension / boxWidth;
  const grid = cells.map(row => row.map(cell => cell.value || 0));
  return grid.every((row, r) => row.every((value, c) =>
    Number.isInteger(value) && value >= 1 && value <= dimension &&
    isValidPlacement(grid, r, c, value, boxWidth, boxHeight, dimension)));
}

// Provide a smart hint: finds an empty or incorrect cell and returns row, col, correct value & explanation
export interface SmartHintResult {
  row: number;
  col: number;
  value: number;
  reason: string;
}

export function getSmartHint(
  cells: SudokuCell[][],
  selectedRow?: number | null,
  selectedCol?: number | null
): SmartHintResult | null {
  const dimension = cells.length;
  const boxWidth = dimension === 6 ? 3 : Math.sqrt(dimension);
  const grid = cells.map(row => row.map(cell => cell.value || 0));
  const valid = grid.every((row, r) => row.every((n, c) => !n || isValidPlacement(grid, r, c, n, boxWidth, dimension / boxWidth, dimension)));
  const solved = valid && solveGrid(grid, boxWidth, dimension / boxWidth, dimension, false);
  const solutionValue = (r: number, c: number) => solved ? grid[r][c] : cells[r][c].solutionValue;
  // If user has a selected cell that is empty or wrong, give hint for this cell first!
  if (
    selectedRow !== undefined &&
    selectedRow !== null &&
    selectedCol !== undefined &&
    selectedCol !== null
  ) {
    const cell = cells[selectedRow][selectedCol];
    if (cell && !cell.isGiven && cell.value !== solutionValue(selectedRow, selectedCol)) {
      return {
        row: selectedRow,
        col: selectedCol,
        value: solutionValue(selectedRow, selectedCol),
        reason: `Ô (${selectedRow + 1}, ${selectedCol + 1}) chính xác phải là số ${solutionValue(selectedRow, selectedCol)} dựa vào suy luận loại trừ hàng, cột và khối!`,
      };
    }
  }

  // Otherwise, find the first unfilled cell
  for (let r = 0; r < cells.length; r++) {
    for (let c = 0; c < cells[r].length; c++) {
      const cell = cells[r][c];
      if (!cell.isGiven && (cell.value === null || cell.value !== solutionValue(r, c))) {
        return {
          row: r,
          col: c,
          value: solutionValue(r, c),
          reason: `Gợi ý: Điền số ${solutionValue(r, c)} vào ô [Hàng ${r + 1}, Cột ${c + 1}] để tiếp tục mạch suy luận.`,
        };
      }
    }
  }

  return null;
}

