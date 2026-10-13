export type CellCoord = [number, number]; // [row, col]

export interface BlockShape {
  id: string;
  name: string;
  // Normalized cells relative to top-left (0,0)
  cells: CellCoord[];
  width: number;
  height: number;
  colorVariant: number; // 0, 1, 2 for subtle natural wood shades
}

export interface PlacedBlock {
  blockId: string;
  position: CellCoord; // [topRow, leftCol] on the board
  cellsOnBoard: CellCoord[]; // Absolute board coordinates occupied
}

export interface BlockSolutionPlacement {
  blockId: string;
  position: CellCoord; // [topRow, leftCol]
}

export interface PuzzleLevel {
  levelNumber: number;
  title: string;
  gridWidth: number;
  gridHeight: number;
  // All cell coordinates that belong to the carved cavity / hole
  cavityCells: CellCoord[];
  // The wooden block pieces prepared for this level
  blocks: BlockShape[];
  totalCavityCells: number;
  difficultyLabel: string;
  difficultyTier: 'easy' | 'medium' | 'hard' | 'expert' | 'master';
  shapeComplexity: string;
  solution: BlockSolutionPlacement[];
}

export interface UndoSnapshot {
  placedBlocks: PlacedBlock[];
  availableBlockIds: string[];
}

