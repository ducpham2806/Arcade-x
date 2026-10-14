export type EnemyKind =
  | "scout"
  | "gnat"
  | "drone"
  | "wasp"
  | "moth"
  | "hornet"
  | "larva"
  | "larva_small"
  | "beetle"
  | "mantis"
  | "cicada"
  | "minelayer"
  | "wraith"
  | "commander"
  | "generator"
  | "meteor"
  | "prism";
export type ItemKind =
  | "plasma"
  | "missile"
  | "bomb"
  | "laser"
  | "shield"
  | "nano"
  | "phase"
  | "magnet"
  | "overdrive"
  | "amp"
  | "star";
export type Mode =
  | "campaign"
  | "practice"
  | "daily"
  | "weekly"
  | "endless"
  | "rush"
  | "ngplus";
export type Upgrade =
  | "cannon"
  | "hull"
  | "reactor"
  | "magnet"
  | "thrusters"
  | "core";
export type Mutator =
  | "glass"
  | "swarm"
  | "fast"
  | "iron"
  | "blackout"
  | "dry"
  | "pacifist"
  | "remix";
export type Booster =
  | "shield"
  | "missile"
  | "weapon"
  | "bomb"
  | "overdrive"
  | "magnet"
  | "amp"
  | "lucky"
  | "nano"
  | "revive";
export interface Wave {
  t: number;
  enemy: EnemyKind;
  count: number;
  path: number;
  formation: number;
  lane: number;
  delay: number;
  drop?: ItemKind;
}
export interface Level {
  id: number;
  planet: number;
  stage: number;
  difficulty: number;
  duration: number;
  objective:
    | "kills"
    | "survive"
    | "collect"
    | "mini"
    | "escort"
    | "generators"
    | "score"
    | "boss";
  target: number;
  parScore: number;
  recommended: number;
  waves: Wave[];
}
export interface RunConfig {
  version: 2 | 3;
  level: number;
  seed: number;
  mode: Mode;
  upgrades: Record<Upgrade, number>;
  integrity: number;
  boosters: Booster[];
  mutators: Mutator[];
  practiceEnemy?: EnemyKind;
  practicePath?: number;
  practiceCount?: number;
  practicePhase?: number;
  practiceWave?: number;
  ship?: string;
}
export interface Enemy {
  id: number;
  kind: EnemyKind;
  x: number;
  y: number;
  x0: number;
  born: number;
  hp: number;
  maxHp: number;
  radius: number;
  path: number;
  fire: number;
  tele: number;
  aimX: number;
  aimY: number;
  drop?: ItemKind;
  flightSpeed?: number;
  phaseOffset?: number;
  separationX?: number;
  separationY?: number;
  attackPattern?: number;
}
export interface Bullet {
  x: number;
  y: number;
  vx: number;
  vy: number;
  player: boolean;
  damage: number;
  radius: number;
  kind: "plasma" | "missile" | "round" | "aimed" | "shard" | "bomb" | "mine";
  ttl: number;
  pierce: number;
  hit: number[];
}
export interface Pickup {
  x: number;
  y: number;
  kind: ItemKind;
  born: number;
}
export interface Hazard {
  x: number;
  y: number;
  w: number;
  h: number;
  start: number;
  end: number;
  kind: "beam" | "slow" | "gravity" | "ice" | "meteor" | "mirror";
  damage: number;
}
export interface Effect {
  x: number;
  y: number;
  born: number;
  kind: "explode_s" | "explode_m" | "item_pickup" | "aegis_explode";
}
export interface BossPart {
  x: number;
  y: number;
  hp: number;
  maxHp: number;
  radius: number;
  kind: "turret" | "tentacle" | "rod" | "decoy" | "shard";
}
export interface Boss {
  planet: number;
  x: number;
  y: number;
  hp: number;
  maxHp: number;
  phase: number;
  transition: number;
  fire: number;
  pattern: number;
  weak: number;
  born: number;
  phaseStart: number;
  parts: BossPart[];
}
export type Input = { x: number; y: number; mask: number };
export type ReplayEntry = [number, number, number, number];
export interface Simulation {
  config: RunConfig;
  frame: number;
  rng: number;
  dropRng: number;
  nextId: number;
  x: number;
  y: number;
  targetX: number;
  targetY: number;
  hp: number;
  maxHp: number;
  weapon: number;
  missile: number;
  shield: number;
  shieldRecharge: number;
  shieldOwned: boolean;
  invincible: number;
  laser: number;
  cloak: number;
  overdrive: number;
  magnet: number;
  amp: number;
  itemLevels: Partial<Record<ItemKind, number>>;
  slots: (ItemKind | null)[];
  slotUsed: number[];
  revive: boolean;
  lastStand: boolean;
  status: "playing" | "revive" | "won" | "lost";
  score: number;
  combo: number;
  maxCombo: number;
  lastKill: number;
  hits: number;
  bossHits: number;
  lastHit: number;
  kills: number;
  spawned: number;
  collected: number;
  itemsCollected: number;
  used: number;
  escortHp: number;
  generators: number;
  waveIndex: number;
  waveSpawn: number;
  nextSpawn: number;
  boss: Boss | null;
  bossesKilled: number;
  miniKilled: boolean;
  bullets: Bullet[];
  enemies: Enemy[];
  pickups: Pickup[];
  hazards: Hazard[];
  effects: Effect[];
  replay: ReplayEntry[];
  previousMask: number;
  fire: number;
  missileFire: number;
  lastHazard: number;
  lastSupply: number;
  supplyDrops?: number;
  reserveDropped?: boolean;
  lastHeavy: number;
  dashCooldown: number;
  message: string;
  messageUntil: number;
  telemetry: { frame: number; wave: number; x: number; y: number }[];
}
export interface Result {
  level: number;
  mode: Mode;
  won: boolean;
  score: number;
  stars: number;
  prp: number;
  secondary: boolean;
  kills: number;
  spawned: number;
  hits: number;
  collected: number;
  frames: number;
  combo: number;
  credits: number;
}
export interface CosmicSave {
  version: 2;
  credits: number;
  cores: number;
  blueprints: number;
  kits: number;
  integrity: number;
  upgrades: Record<Upgrade, number>;
  inventory: Record<Booster, number>;
  results: Record<string, Result>;
  attempts: Record<string, number>;
  unlocked: number;
  ngUnlocked: number;
  ngResults: Record<string, Result>;
  archive: number[];
  runs: number;
  lastLevel: number;
  streak: number;
  emergencyAt: number;
  tutorial: boolean;
  skin: string;
  ship: string;
  settings: {
    reducedMotion: boolean;
    hitbox: boolean;
    backgroundDim: number;
    sensitivity: number;
    oneHand: boolean;
    practiceSpeed: number;
    sound: boolean;
  };
  run: {
    config: RunConfig;
    replay: ReplayEntry[];
    frame: number;
    ticket?: string;
    owner?: string;
  } | null;
  bestReplay: {
    config: RunConfig;
    replay: ReplayEntry[];
    frame: number;
    score: number;
  } | null;
  daily: { day: string; attempts: number; best: number };
  pending: {
    ticket: string;
    owner: string;
    config: RunConfig;
    replay: ReplayEntry[];
    frame: number;
  }[];
}

