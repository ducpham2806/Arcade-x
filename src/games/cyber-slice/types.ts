export type GameMode = 'stage' | 'classic' | 'zen' | 'time_attack' | 'boss_rush';

export type FruitKind =
  | 'watermelon'
  | 'pineapple'
  | 'banana'
  | 'orange'
  | 'apple_red'
  | 'apple_green'
  | 'strawberry'
  | 'kiwi'
  | 'coconut'
  | 'lemon'
  | 'pomegranate'
  | 'golden_fruit'
  | 'freeze_fruit'
  | 'frenzy_fruit';

export type TargetItemType = 'fruit' | 'bomb' | 'boss';

export type BossId = 'dragon_melon' | 'mecha_pineapple' | 'emperor_coconut';

export interface BossDef {
  id: BossId;
  phase: number;
  name: string;
  title: string;
  avatar: string;
  maxHp: number;
  radius: number;
  speed: number;
  color: string;
  accentColor: string;
  timeLimit: number; // in seconds
  description: string;
  dialogue: string;
  hazards: string[];
}

export interface ComboDisplay {
  id: number;
  count: number;
  text: string;
  subText?: string;
  x: number;
  y: number;
  color: string;
  scale: number;
  opacity: number;
  bonusScore: number;
  createdAt: number;
}

export interface FruitDef {
  kind: FruitKind;
  name: string;
  icon: string;
  points: number;
  feverEnergy: number;
  radius: number;
  juiceColor: string;
  splatterColor: string;
}

export interface SliceTarget {
  id: number;
  x: number;
  y: number;
  vx: number;
  vy: number;
  radius: number;
  rotation: number;
  vRot: number;
  itemType: TargetItemType;
  fruitKind?: FruitKind;
  bossId?: BossId;
  bossHp?: number;
  bossMaxHp?: number;
  hitFlash?: number; // frames to flash white/gold when hit
  sliced: boolean;
  cutAngle?: number;
  pieces?: {
    x: number;
    y: number;
    vx: number;
    vy: number;
    rot: number;
    vRot: number;
    half: 'left' | 'right';
  }[];
}

export interface TrailPoint {
  x: number;
  y: number;
  time: number;
}

export interface Particle {
  x: number;
  y: number;
  vx: number;
  vy: number;
  size: number;
  color: string;
  alpha: number;
  life: number;
  maxLife: number;
}

export interface JuiceSplatter {
  id: number;
  x: number;
  y: number;
  radius: number;
  color: string;
  alpha: number;
  time: number;
}

export interface StageObjective {
  type: 'fruit_count' | 'fruit_type' | 'score' | 'combo' | 'no_bomb';
  target: number;
  fruitKind?: FruitKind;
  current: number;
  label: string;
  icon: string;
}

export interface StageConfig {
  id: number;
  name: string;
  chapter: string;
  description: string;
  objectives: StageObjective[];
  starScores: [number, number, number];
  allowedFruits: FruitKind[];
  bombChance: number;
  speedMultiplier: number;
  timeLimit?: number; // optional time limit in seconds
}

export interface ActiveGameEffect {
  id: 'freeze' | 'frenzy' | 'fever' | 'golden' | 'combo';
  icon: string;
  name: string;
  subtext: string;
  remainingSeconds: number;
  totalSeconds: number;
  color: string;
  borderColor: string;
  bgColor: string;
  glowColor: string;
}

