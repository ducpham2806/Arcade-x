export type Direction = 'up' | 'down' | 'left' | 'right' | 'wait';

export type MummyType = 'white' | 'red' | 'scorpion';

export type TurnPhase = 'player_turn' | 'mummy_moving' | 'game_over' | 'victory';

export interface Position {
  x: number; // 0 to cols - 1
  y: number; // 0 to rows - 1
}

export interface MummyThreatStep {
  from: Position;
  to: Position;
  stepIndex: number; // 1 or 2
  facing: Direction;
}

export interface MummyThreatPath {
  mummyId: string;
  type: MummyType;
  currentPos: Position;
  steps: MummyThreatStep[];
  finalPos: Position;
  isNearest: boolean;
  willCatchPlayer: boolean;
}

export interface MummyEntity {
  id: string;
  type: MummyType;
  x: number;
  y: number;
  alive: boolean;
  facing?: Direction;
  stepsThisTurn?: number;
}

export interface Gate {
  id: string;
  x1: number;
  y1: number;
  x2: number;
  y2: number;
  color: 'yellow' | 'red';
  isOpen: boolean; // if open, acts as walkable pass
}

export interface KeyItem {
  id: string;
  x: number;
  y: number;
  color: 'yellow' | 'red';
  collected: boolean;
}

export interface TrapItem {
  id: string;
  x: number;
  y: number;
  type: 'pit' | 'spikes' | 'sarcophagus';
  triggered: boolean;
}

export interface WallSegment {
  // Coordinates of cell boundary:
  // e.g. horizontal wall between (x, y) and (x, y+1)
  // or vertical wall between (x, y) and (x+1, y)
  x1: number;
  y1: number;
  x2: number;
  y2: number;
}

export interface LevelData {
  id: number;
  name: string;
  pyramidName: string;
  gridSize: { cols: number; rows: number };
  playerStart: Position;
  exitPos: Position;
  exitDirection?: Direction; // e.g. 'left' stairs or 'bottom'
  mummies: Array<{ type: MummyType; x: number; y: number }>;
  horizontalWalls: Array<[number, number]>; // Wall below cell [x, y], i.e. between (x,y) and (x, y+1)
  verticalWalls: Array<[number, number]>; // Wall right of cell [x, y], i.e. between (x,y) and (x+1, y)
  gates?: Gate[];
  keys?: KeyItem[];
  traps?: TrapItem[];
  parTurns: number; // 3-star benchmark
  maxTurns?: number; // for turn limit mode
  timeLimitSec?: number; // for time limit mode
  hintTip: string;
}

export interface MoveStepRecord {
  playerPos: Position;
  playerFacing: Direction;
  mummies: MummyEntity[];
  gates: Gate[];
  keys: KeyItem[];
  traps: TrapItem[];
  turnsCount: number;
  score: number;
  mummiesTrappedCount: number;
}

export type GameMode = 'campaign' | 'turn_limit' | 'time_attack' | 'endless' | 'custom_chamber';

export type MapSizePreset =
  | '5x5'
  | '6x6'
  | '7x7'
  | '8x8'
  | 'compact_5x5'
  | 'standard_6x6'
  | 'large_7x7'
  | 'grand_8x8'
  | 'random';

export type ChamberArchetype =
  | 'labyrinth'
  | 'pillars_of_karnak'
  | 'gauntlet_of_traps'
  | 'royal_vault'
  | 'scorpion_nest'
  | 'twin_crypts';

export interface ProceduralGenerationOptions {
  floor?: number;
  sizePreset?: MapSizePreset;
  cols?: number;
  rows?: number;
  archetype?: ChamberArchetype;
  mummyCount?: number;
  trapDensity?: 'none' | 'low' | 'medium' | 'high';
  mummyDifficulty?: 'easy' | 'normal' | 'hard' | 'nightmare';
  includeKeysAndGates?: boolean;
  timeLimitSec?: number;
  seed?: number | string;
}

export interface MummyEscapeStats {
  levelsUnlocked: number;
  starsPerLevel: Record<number, number>;
  highScore: number;
  totalMummiesTrapped: number;
  totalStepsTaken: number;
  gamesPlayed: number;
  proceduralChambersCleared?: number;
}

export type GridPaletteId =
  | 'classic_sand'
  | 'obsidian_crypt'
  | 'emerald_temple'
  | 'crimson_catacomb'
  | 'amethyst_tomb'
  | 'high_contrast_slate';

export interface GridPaletteTheme {
  id: GridPaletteId;
  name: string;
  nameVi: string;
  description: string;
  tileLight: string;
  tileDark: string;
  tileBorder: string;
  boardBg: string;
  boardBorder: string;
  wallBg: string;
  wallHighlight: string;
  wallShadow: string;
  watermarkColor: string;
  watermarkSymbol: string;
  glowColor: string;
  accentBadgeBg: string;
  accentBadgeText: string;
}
