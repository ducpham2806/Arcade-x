export type GameMode = 'levels';

export type GameplayType = 'moves' | 'time' | 'rescue' | 'chocolate' | 'gift' | 'boss';

export type TileColor = '#06b6d4' | '#f43f5e' | '#a855f7' | '#fbbf24' | '#10b981' | '#f97316';

export const HEX_COLORS: TileColor[] = [
  '#06b6d4', // Cyan
  '#f43f5e', // Rose / Red Heart
  '#a855f7', // Purple Bow
  '#fbbf24', // Amber Star
  '#10b981', // Emerald Gumdrop
  '#f97316', // Orange Ring
];

export const COLOR_NAMES: Record<string, string> = {
  '#06b6d4': 'Lam',
  '#f43f5e': 'Hồng',
  '#a855f7': 'Tím',
  '#fbbf24': 'Vàng',
  '#10b981': 'Lục',
  '#f97316': 'Cam',
};

export type SpecialType = 'none' | 'rocket_h' | 'rocket_d' | 'bomb' | 'rainbow';

export type ObstacleType = 'none' | 'ice' | 'stone' | 'chain';

export interface HexTile {
  id: string;
  r: number;
  c: number;
  color: TileColor;
  special: SpecialType;
  obstacle: ObstacleType;
  obstacleHp?: number;
  isPopping?: boolean;
  isDropping?: boolean;
  isNew?: boolean;
  dropDelay?: number;
  highlighted?: boolean;
}

export type TargetType = 'score' | 'collect_color' | 'clear_ice' | 'clear_stone' | 'clear_chain';

export interface LevelTarget {
  type: TargetType;
  current: number;
  target: number;
  color?: TileColor;
  label: string;
}

export interface LevelConfig {
  id: number;
  name: string;
  subtitle: string;
  gameplayType: GameplayType;
  moves?: number;
  timeLimit?: number; // In seconds (for time attack levels)
  stars: [number, number, number];
  colors: TileColor[];
  targets: LevelTarget[];
  boardPreset?: {
    obstacles?: { r: number; c: number; type: ObstacleType }[];
    specials?: { r: number; c: number; type: SpecialType }[];
  };
}

export type BoosterType = 'hammer' | 'rocket' | 'color_bomb' | 'shuffle';

export interface Booster {
  id: BoosterType;
  name: string;
  icon: string;
  description: string;
  count: number;
}

export interface LineSegment {
  x1: number;
  y1: number;
  x2: number;
  y2: number;
  color: string;
}

export interface PopEffect {
  id: string;
  x: number;
  y: number;
  text?: string;
  color?: string;
  type: 'score' | 'combo' | 'rocket' | 'rainbow' | 'ice' | 'invalid' | 'lines';
  lines?: LineSegment[];
}
