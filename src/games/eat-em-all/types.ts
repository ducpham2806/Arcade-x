export type ElementMode = 'ice' | 'fire';

export type PowerUpType = 'shield' | 'magnet' | 'speed' | 'slowmo';

export type ItemType = 
  | 'ice'          // Edible in ICE mode, damages in FIRE mode
  | 'fire'         // Edible in FIRE mode, damages in ICE mode
  | 'star'         // Universal food, edible in both modes (+50 pts)
  | 'heart'        // Restores +1 life
  | 'gem'          // Bonus coins and high score (+100 pts)
  | 'bomb'         // Skull bomb: damages player (-1 life) unless in Fury Mode
  | 'poison'       // Toxic flask: causes damage (-1 life) unless in Fury Mode
  | 'fury_pill'    // Instant +35% Elemental Fury charge
  | 'power_shield' // Shield: protects against 1 hazard without breaking combo
  | 'power_magnet' // Vacuum: pulls nearby edible items to player's mouth
  | 'power_speed'  // Speed: increases player movement speed and responsiveness
  | 'power_slowmo';// Slow-Mo: slows down all falling items

export type GameMode = 'target' | 'endless' | 'time';
export type Difficulty = 'easy' | 'normal' | 'hard' | 'insane';
export type BackgroundTheme = 'day' | 'sunset' | 'night' | 'space' | 'solar';

export interface ActivePowerUps {
  shield: boolean;
  shieldHits: number;
  magnetTimer: number; // remaining seconds
  speedTimer: number;  // remaining seconds
  slowmoTimer: number; // remaining seconds
}

export interface ComboTierInfo {
  minCombo: number;
  multiplier: number;
  name: string;
  color: string;
  badgeBg: string;
  icon: string;
}

export interface StageConfig {
  id: number;
  title: string;
  subtitle: string;
  targetCount: number; // Total required items to complete
  targetItems: Partial<Record<ItemType, number>>; // Specific requirements e.g. { ice: 10, fire: 10 }
  fallSpeedMultiplier: number;
  spawnIntervalMs: number;
  bombChance: number;
  poisonChance: number;
  powerUpChance?: number;
  theme: BackgroundTheme;
  description: string;
}

export interface FallingItem {
  warningLeft?: number;
  speedClass?: 'slow'|'normal'|'fast'|'rush';
  beat?: string;
  id: number;
  x: number;
  y: number;
  vx: number;
  vy: number;
  radius: number;
  type: ItemType;
  rotation: number;
  rotSpeed: number;
  wobble: number;
  wobbleSpeed: number;
  scale: number;
  isEaten: boolean;
  alpha: number;
}

export interface Particle {
  x: number;
  y: number;
  vx: number;
  vy: number;
  color: string;
  size: number;
  life: number;
  maxLife: number;
  alpha: number;
  shape?: 'circle' | 'spark' | 'ring' | 'star';
}

export interface FloatingText {
  id: number;
  x: number;
  y: number;
  vy: number;
  text: string;
  color: string;
  alpha: number;
  scale: number;
  bold?: boolean;
}

export interface GameStats {
  score: number;
  itemsEaten: number;
  bombsAvoided: number;
  furyActivatedCount: number;
  maxCombo: number;
  iceEaten: number;
  fireEaten: number;
  starsEaten: number;
  gemsEaten: number;
  heartsCollected: number;
}


