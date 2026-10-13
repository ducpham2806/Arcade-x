export type SudokuGridSize = '4x4' | '6x6' | '9x9' | 'staircase' | 'multigrid';

export type SudokuDifficulty = 'easy' | 'medium' | 'hard' | 'expert';

export type SudokuGameMode = 'campaign' | 'time' | 'endless' | 'limit_steps';

export interface CellPosition {
  row: number;
  col: number;
  gridIndex?: number; // For multi-grid / samurai (0 = main/center, 1 = top-left, etc.)
}

export interface SudokuCell {
  row: number;
  col: number;
  value: number | null; // null if empty
  solutionValue: number; // correct number
  isGiven: boolean; // pre-filled clue
  notes: number[]; // pencil draft notes
  isError?: boolean;
  isValid?: boolean;
  highlighted?: boolean;
  gridIndex?: number;
  isInactive?: boolean; // For custom shaped grids (like staircase holes)
}

export interface SudokuBoardState {
  size: SudokuGridSize;
  dimension: number; // 4, 6, 9
  boxWidth: number; // 2 for 4x4, 3 for 6x6 (2x3), 3 for 9x9 (3x3)
  boxHeight: number; // 2 for 4x4, 2 for 6x6, 3 for 9x9
  cells: SudokuCell[][];
  subGrids?: SudokuCell[][][]; // For multi-grid
  difficulty: SudokuDifficulty;
  title: string;
  description?: string;
}

export interface UndoStep {
  row: number;
  col: number;
  prevValue: number | null;
  prevNotes: number[];
  newValue: number | null;
  newNotes: number[];
  gridIndex?: number;
}

export interface StageLevelDef {
  id: number;
  title: string;
  size: SudokuGridSize;
  difficulty: SudokuDifficulty;
  mode: SudokuGameMode;
  targetTimeSeconds?: number;
  maxMistakes?: number;
  rewardCoins: number;
  rewardExp: number;
  icon: string;
  badge?: string;
  unlockStarsNeeded: number;
}

export interface GameWinResult {
  score: number;
  stars: number; // 1 to 3
  timeSpentSeconds: number;
  mistakesCount: number;
  hintsUsedCount: number;
  isNewRecord: boolean;
  coinsEarned: number;
  expEarned: number;
  gemsEarned: number;
  chestDropped: 'common' | 'rare' | 'epic' | 'legendary' | null;
}

