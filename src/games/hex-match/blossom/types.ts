export type Special = "bee_h" | "bee_v" | "bloom_bomb" | "rainbow_orb" | "sun";
export type Hazard =
  | "weed"
  | "rock"
  | "cocoon"
  | "ice"
  | "vine"
  | "bug"
  | "bomb"
  | "honey"
  | "fog";
export type GoalKind =
  | "score"
  | "collect"
  | "drop"
  | "rescue"
  | "boss"
  | "combo"
  | "gift"
  | Hazard;
export interface Goal {
  kind: GoalKind;
  target: number;
  color?: number;
}
export interface Level {
  id: number;
  description: string;
  note: string;
  rows: number;
  cols: number;
  colors: number;
  moves: number;
  seconds: number;
  difficulty: number;
  chapter: number;
  beta: number;
  initialCollectSupply?: number;
  expectation: number;
  goals: Goal[];
  hazards: { kind: Hazard; count: number; hp: number }[];
  seeds: number;
  seedRoutes?: boolean;
  startingSpecials?: { cell: number; special: Special }[];
  portals: boolean;
  bossHP: number;
}
export interface Tile {
  id: number;
  color: number;
  special?: Special;
  hazard?: Hazard;
  hp?: number;
  timer?: number;
  seed?: boolean;
  pet?: boolean;
  boss?: boolean;
  gift?: boolean;
  fog?: boolean;
}
export interface Effect {
  cell: number;
  type: "pop" | Special | "merge" | "portal";
  color?: number;
  cells?: number[];
  targets?: { cell: number; color: number }[];
  bonusIndex?: number;
}
export interface Run {
  version: 1;
  id: string;
  level: Level;
  board: Tile[];
  rng: number;
  initialSeed: number;
  nextId: number;
  score: number;
  moves: number;
  seconds: number;
  turns: number;
  combo: number;
  maxCombo: number;
  lastTap: number;
  progress: Record<string, number>;
  bossHP: number;
  phase: number;
  status: "playing" | "won" | "lost";
  reason?: string;
  freeShuffles: number;
  effects: Effect[];
  changed: number[];
  log: { action: Action; at: number }[];
  companion: string;
  companionUsed: boolean;
  portals: number[];
  portalMoves?: { id: number; from: number; to: number }[];
  used: Record<string, number>;
  started: string[];
  bonusMoves: number;
  completion?: {
    score: number;
    progress: Record<string, number>;
    remainingMoves: number;
  };
  mode: "campaign" | "daily" | "side";
  dailyDate?: string;
}
export type Action =
  | { type: "tap"; cell: number }
  | { type: "merge"; cell: number; other: number }
  | { type: "hammer" | "vacuum" | "broom"; cell: number; vertical?: boolean }
  | { type: "shuffle" };
export interface Settings {
  style: "gloss" | "chibi";
  volume: number;
  music: boolean;
  musicVolume: number;
  haptic: boolean;
  reduced: boolean;
  labels: boolean;
  hint: boolean;
  language: "vi" | "en";
  font: number;
  season: "none" | "tet" | "trungthu";
  sameSeed: boolean;
}
export interface Save {
  version: 1;
  coins: number;
  stars: Record<string, number>;
  best: Record<string, number>;
  losses: Record<string, number>;
  inventory: Record<string, number>;
  completed: string[];
  rewardDays: Record<string, string>;
  daily: Record<string, number>;
  garden: (string | null)[];
  companion: string;
  settings: Settings;
  badges: string[];
  streak: number;
  lastDaily: string;
  perfectStreak: number;
  visitStreak?: number;
  lastVisit?: string;
  clean: number[];
  tutorials?: string[];
  pendingResult?: { run: Run; stars: number; reward: number };
  legacy?: unknown;
  active?: Run;
}
