import { BOSS_HP, ITEM_NAMES, levelFor, MUTATORS } from "./content.ts";
import type {
  Simulation,
  RunConfig,
  Input,
  EnemyKind,
  Enemy,
  Bullet,
  ItemKind,
  Result,
  ReplayEntry,
  Boss,
} from "./types.ts";
export const VERSION = 2,
  WIDTH = 180,
  HEIGHT = 320,
  FPS = 60,
  MAX_FRAMES = 36000;
export const EMPTY_UPGRADES = {
  cannon: 0,
  hull: 0,
  reactor: 0,
  magnet: 0,
  thrusters: 0,
  core: 0,
};
const STATS: Record<EnemyKind, [number, number, number, number]> = {
  scout: [3, 100, 6, 96],
  gnat: [2, 100, 4, 86],
  drone: [6, 200, 9, 95],
  wasp: [10, 300, 9, 90],
  moth: [15, 300, 12, 52],
  hornet: [8, 200, 7, 96],
  larva: [12, 300, 9, 58],
  larva_small: [4, 50, 5, 70],
  beetle: [40, 600, 15, 30],
  mantis: [24, 600, 13, 43],
  cicada: [12, 400, 9, 45],
  minelayer: [14, 400, 10, 43],
  wraith: [18, 400, 9, 63],
  commander: [150, 2500, 20, 22],
  generator: [55, 800, 12, 60],
  meteor: [6, 50, 8, 55],
  prism: [8, 200, 8, 80],
};
const ACTIVE: ItemKind[] = ["bomb", "laser", "phase", "overdrive"];
const ITEMS: ItemKind[] = [
  "plasma",
  "missile",
  "bomb",
  "laser",
  "shield",
  "nano",
  "phase",
  "magnet",
  "overdrive",
  "amp",
];
const q = (v: number) => Math.round(v * 256) / 256;
export const clamp = (v: number, a: number, b: number) =>
  Math.max(a, Math.min(b, v));
function random(s: Simulation, drop = false) {
  const key = drop ? "dropRng" : "rng";
  s[key] = (Math.imul(s[key], 1664525) + 1013904223) >>> 0;
  return (s[key] >>> 8) / 16777216;
}
const has = (s: Simulation, m: string) =>
  s.config.mutators.includes(m as never);
const difficulty = (s: Simulation) =>
  s.config.mode === "endless"
    ? Math.min(110, 50 + s.frame / 1200)
    : levelFor(
        s.config.mode === "rush" ? (s.bossesKilled + 1) * 10 : s.config.level,
      ).difficulty + (s.config.mode === "ngplus" ? 10 : 0);
const planet = (s: Simulation) =>
  s.config.mode === "rush"
    ? Math.min(10, s.bossesKilled + 1)
    : levelFor(s.config.level).planet;
const speed = (s: Simulation) =>
  (1 + 0.004 * difficulty(s)) * (has(s, "fast") ? 1.2 : 1);
const caps = (s: Simulation) => {
  const band = Math.min(4, Math.floor(difficulty(s) / 20));
  return {
    enemies: [6, 9, 12, 15, 18][band],
    bullets: [40, 70, 110, 160, 220][band],
    tele: [72, 66, 60, 54, 48][band],
    bulletSpeed: [96, 115, 134, 154, 176][band],
  };
};
function message(s: Simulation, text: string) {
  s.message = text;
  s.messageUntil = s.frame + 120;
}
export function startingHp(integrity: number, hull: number) {
  return integrity >= 80
    ? hull >= 5
      ? 5
      : 4
    : integrity >= 60
      ? 4
      : integrity >= 40
        ? 3
        : 2;
}
export function createSimulation(config: RunConfig): Simulation {
  const standard = ["daily", "weekly", "endless", "rush"].includes(config.mode),
    u = standard
      ? (Object.fromEntries(
          Object.keys(EMPTY_UPGRADES).map((k) => [
            k,
            config.mode === "daily" || config.mode === "weekly"
              ? 5
              : ["cannon", "hull", "reactor", "magnet"].includes(k)
                ? 7
                : 6,
          ]),
        ) as typeof EMPTY_UPGRADES)
      : { ...config.upgrades };
  config = {
    ...config,
    upgrades: u,
    integrity: standard || config.mode === "practice" ? 100 : config.integrity,
    boosters:
      standard || config.mode === "practice" ? [] : [...config.boosters],
    mutators: [...config.mutators],
  };
  const hp = hasConfig(config, "glass")
    ? 1
    : startingHp(config.integrity, u.hull);
  const s: Simulation = {
    config,
    frame: 0,
    rng: config.seed >>> 0,
    dropRng: (config.seed ^ 0x9e3779b9) >>> 0,
    nextId: 1,
    x: 90,
    y: 268,
    targetX: 90,
    targetY: 268,
    hp,
    maxHp: u.hull >= 5 ? 5 : 4,
    weapon: 1,
    missile: 0,
    shield: 0,
    shieldRecharge: 0,
    shieldOwned: false,
    invincible: 0,
    laser: 0,
    cloak: 0,
    overdrive: 0,
    magnet: 0,
    amp: 0,
    itemLevels: {},
    slots: Array(u.reactor >= 10 ? 3 : 2).fill(null),
    slotUsed: Array(u.reactor >= 10 ? 3 : 2).fill(-1),
    revive: config.boosters.includes("revive"),
    lastStand: false,
    status: "playing",
    score: 0,
    combo: 0,
    maxCombo: 0,
    lastKill: -999,
    hits: 0,
    bossHits: 0,
    lastHit: -999,
    kills: 0,
    spawned: 0,
    collected: 0,
    itemsCollected: 0,
    used: 0,
    escortHp: 12,
    generators: 0,
    waveIndex: 0,
    waveSpawn: 0,
    nextSpawn: 0,
    boss: null,
    bossesKilled: 0,
    miniKilled: false,
    bullets: [],
    enemies: [],
    pickups: [],
    hazards: [],
    effects: [],
    replay: [],
    previousMask: 0,
    fire: 0,
    missileFire: 0,
    lastHazard: 0,
    lastSupply: 0,
    lastHeavy: -999,
    dashCooldown: 0,
    message: "Kéo để bay · Tự động bắn",
    messageUntil: 420,
    telemetry: [],
  };
  for (const b of config.boosters) {
    if (b === "shield" || b === "missile") pickup(s, b);
    if (b === "weapon") s.weapon = 3;
    if (b === "bomb" || b === "overdrive") pickup(s, b);
    if (b === "magnet") s.magnet = 900;
    if (b === "amp") s.amp = 1800;
  }
  if (u.reactor >= 5 && !s.slots.some(Boolean)) s.slots[0] = "bomb";
  if (config.level === 2 && config.mode === "campaign") s.slots[0] = "bomb";
  if (config.ship === "bulwark") {
    s.shield = 1;
    s.shieldOwned = true;
  }
  if (config.mode === "practice" && levelFor(config.level).stage === 10) {
    makeBoss(s, planet(s));
    const b = s.boss!;
    b.phase = clamp(config.practicePhase || 1, 1, b.planet === 10 ? 4 : 3);
    b.hp = b.maxHp * (1 - (b.phase - 1) / (b.planet === 10 ? 4 : 3)) - 0.01;
    b.transition = 0;
  }
  return s;
}
function hasConfig(c: RunConfig, k: string) {
  return c.mutators.includes(k as never);
}
function addEffect(
  s: Simulation,
  x: number,
  y: number,
  kind: Simulation["effects"][number]["kind"],
) {
  if (s.effects.length < 80) s.effects.push({ x, y, kind, born: s.frame });
}
function score(s: Simulation, base: number) {
  s.score += Math.floor(
    base * Math.min(3, 1 + Math.floor(s.combo / 5) * 0.1) * (s.amp > 0 ? 2 : 1),
  );
}
export function pickup(s: Simulation, kind: ItemKind) {
  const old = s.itemLevels[kind] || 0,
    mastery =
      s.config.upgrades.core >=
      (["plasma", "missile", "bomb", "laser"].includes(kind)
        ? 3
        : ["shield", "nano", "phase"].includes(kind)
          ? 6
          : 9)
        ? 2
        : 1;
  s.itemLevels[kind] = Math.min(3, Math.max(mastery, old + 1));
  const lvl = s.itemLevels[kind]!;
  if (kind === "star") {
    s.collected++;
    score(s, 25);
    return;
  }
  s.itemsCollected++;
  score(s, 150);
  addEffect(s, s.x, s.y, "item_pickup");
  message(s, ITEM_NAMES[kind]);
  if (ACTIVE.includes(kind)) {
    let i = s.slots.indexOf(kind);
    if (i < 0) i = s.slots.indexOf(null);
    if (i < 0) i = s.slotUsed.indexOf(Math.min(...s.slotUsed));
    s.slots[i] = kind;
    return;
  }
  if (kind === "plasma") {
    s.weapon = Math.min(5, s.weapon + 1);
    if (s.weapon === 5) score(s, 150);
  }
  if (kind === "missile") s.missile = Math.min(3, s.missile + 1);
  if (kind === "shield") {
    s.shieldOwned = true;
    s.shield = lvl >= 2 ? 2 : 1;
  }
  if (kind === "nano" && !has(s, "glass")) {
    if (s.hp === s.maxHp) score(s, 500);
    else s.hp = Math.min(s.maxHp, s.hp + 1);
    if (lvl >= 2) s.invincible = Math.max(s.invincible, 180);
  }
  if (kind === "magnet") s.magnet = (lvl === 1 ? 10 : 15) * 60;
  if (kind === "amp") s.amp = (lvl === 1 ? 12 : 18) * 60;
}
export function useSlot(s: Simulation, index: number) {
  const kind = s.slots[index];
  if (
    !kind ||
    s.status !== "playing" ||
    has(s, "pacifist") ||
    (s.boss?.planet === 6 && s.boss.phase === 2 && s.frame % 720 < 180)
  )
    return;
  const lvl = s.itemLevels[kind] || 1,
    mult = 1 + 0.03 * s.config.upgrades.reactor;
  s.slots[index] = null;
  s.slotUsed[index] = s.frame;
  s.used++;
  if (kind === "bomb") {
    s.bullets = s.bullets.filter((b) => b.player);
    for (const e of s.enemies) e.hp -= lvl >= 2 ? 250 : 150;
    if (s.boss && s.boss.transition <= s.frame) {
      s.boss.hp -= (lvl >= 2 ? 250 : 150) * (s.boss.weak > s.frame ? 2 : 1);
      for (const p of s.boss.parts) p.hp -= 150;
    }
    addEffect(s, s.x, s.y, "explode_m");
    message(s, "NOVA BOMB");
  }
  if (kind === "laser") s.laser = Math.round((lvl >= 2 ? 6 : 4) * 60 * mult);
  if (kind === "phase") s.cloak = Math.round((lvl >= 2 ? 4.5 : 3) * 60 * mult);
  if (kind === "overdrive")
    s.overdrive = Math.round((lvl >= 2 ? 8 : 6) * 60 * mult);
}
export function revive(s: Simulation) {
  if (s.status !== "revive" || !s.revive) return;
  s.revive = false;
  s.hp = 2;
  s.invincible = 180;
  s.bullets = s.bullets.filter((b) => b.player);
  s.status = "playing";
  s.replay.push([s.frame, Math.round(s.x), Math.round(s.y), 16]);
}
export function endRun(s: Simulation) {
  if (s.status !== "playing" && s.status !== "revive") return;
  s.replay.push([s.frame, Math.round(s.targetX), Math.round(s.targetY), 32]);
  s.status = "lost";
}
function damage(s: Simulation, n = 1, boss = false) {
  if (s.invincible > 0 || s.cloak > 0 || s.status !== "playing") return;
  if (s.shield > 0) {
    s.shield--;
    s.shieldRecharge = 1200;
    s.invincible = 40;
    return;
  }
  const loss = Math.min(s.hp, n);
  s.hp -= loss;
  s.hits += loss;
  if (boss) s.bossHits += loss;
  if (s.frame - s.lastHit <= 300) s.weapon = Math.max(1, s.weapon - 1);
  s.lastHit = s.frame;
  s.combo = 0;
  s.invincible = 90;
  s.telemetry.push({ frame: s.frame, wave: s.waveIndex, x: s.x, y: s.y });
  s.bullets = s.bullets.filter(
    (b) => b.player || Math.hypot(b.x - s.x, b.y - s.y) > 22,
  );
  addEffect(s, s.x, s.y, "explode_s");
  message(s, s.hp > 0 ? "LUMI: Cẩn thận!" : "Tàu bị hạ");
  if (s.config.mode === "practice") {
    s.hp = s.maxHp;
    return;
  }
  if (s.hp === 1 && s.config.upgrades.hull >= 10 && !s.lastStand) {
    s.lastStand = true;
    s.invincible = 120;
  }
  if (s.hp <= 0) {
    addEffect(s, s.x, s.y, "aegis_explode");
    s.status = s.revive ? "revive" : "lost";
  }
}
function spawn(
  s: Simulation,
  kind: EnemyKind,
  lane: number,
  path: number,
  drop?: ItemKind,
  at?: { x: number; y: number },
) {
  if (s.enemies.length >= caps(s).enemies) return;
  const st = STATS[kind],
    p = planet(s),
    hp =
      st[0] *
      (1 + 0.25 * (p - 1)) *
      (has(s, "iron") ? 1.5 : 1) *
      (s.config.mode === "ngplus" ? 1.5 : 1);
  const x = at?.x ?? clamp(lane * 18, 10, 170),
    y = at?.y ?? (path === 17 ? 345 : -20);
  const born = at ? s.frame - Math.round(((y + 20) / st[3]) * 60) : s.frame;
  s.enemies.push({
    id: s.nextId++,
    kind,
    x,
    y,
    x0: x,
    born,
    hp,
    maxHp: hp,
    radius: st[2],
    path,
    fire: s.frame + 90,
    tele: 0,
    aimX: s.x,
    aimY: s.y,
    drop,
  });
  s.spawned++;
}
function bullet(s: Simulation, b: Bullet) {
  if (s.bullets.length >= 300) return;
  if (!b.player) {
    if (
      s.bullets.filter((b) => !b.player).length >= caps(s).bullets ||
      Math.hypot(b.x - s.x, b.y - s.y) < 48 ||
      b.y < 0 ||
      b.y > 320
    )
      return;
  }
  s.bullets.push(b);
}
function aimed(
  s: Simulation,
  x: number,
  y: number,
  count = 1,
  spread = 0.22,
  kind: Bullet["kind"] = "aimed",
  dmg = 1,
  angle?: number,
) {
  const a = angle ?? Math.atan2(s.y - y, s.x - x);
  for (let i = 0; i < count; i++) {
    const theta = a + (i - (count - 1) / 2) * spread,
      v = caps(s).bulletSpeed * (has(s, "fast") ? 1.2 : 1);
    bullet(s, {
      x,
      y,
      vx: q(Math.cos(theta) * v),
      vy: q(Math.sin(theta) * v),
      player: false,
      damage: dmg,
      radius: kind === "bomb" ? 4 : 1.5,
      kind,
      ttl: kind === "bomb" ? 90 : 600,
      pierce: 0,
      hit: [],
    });
  }
}
function ring(s: Simulation, x: number, y: number, count: number, offset = 0) {
  for (let i = 0; i < count; i++)
    aimed(s, x, y, 1, 0, "round", 1, offset + (Math.PI * 2 * i) / count);
}
function makeBoss(s: Simulation, p: number) {
  const maxHp = BOSS_HP[p - 1],
    parts: Boss["parts"] = [];
  if ([5, 6, 8].includes(p)) {
    const n = p === 8 ? 3 : 4;
    for (let i = 0; i < n; i++)
      parts.push({
        x: 30 + (120 / (n - 1)) * i,
        y: p === 8 ? 118 : 90 + (i % 2) * 25,
        hp: p === 5 ? 400 : p === 6 ? 600 : 500,
        maxHp: p === 5 ? 400 : p === 6 ? 600 : 500,
        radius: 12,
        kind: p === 5 ? "tentacle" : p === 6 ? "turret" : "rod",
      });
  }
  s.boss = {
    planet: p,
    x: 90,
    y: p === 10 ? 92 : 65,
    hp: maxHp,
    maxHp,
    phase: 1,
    transition: s.frame + 180,
    fire: s.frame + 270,
    pattern: 0,
    weak: 0,
    born: s.frame,
    phaseStart: s.frame,
    parts,
  };
  message(s, "Boss đang tiếp cận");
}
function hazard(
  s: Simulation,
  kind: Simulation["hazards"][number]["kind"],
  x: number,
  y: number,
  w: number,
  h: number,
  life = 60,
  dmg = 1,
) {
  if (dmg === 2) {
    if (s.frame - s.lastHeavy < 480) return;
    s.lastHeavy = s.frame;
  }
  const tele = caps(s).tele + (dmg === 2 ? 12 : 0);
  s.hazards.push({
    kind,
    x,
    y,
    w,
    h,
    start: s.frame + tele,
    end: s.frame + tele + life,
    damage: dmg,
  });
}
function bossUpdate(s: Simulation) {
  const b = s.boss;
  if (!b) return;
  const p = b.planet,
    maxPhase = p === 10 ? 4 : 3;
  const phase = clamp(
    Math.floor((1 - Math.max(0, b.hp / b.maxHp)) * maxPhase) + 1,
    1,
    maxPhase,
  );
  if (phase > b.phase) {
    b.phase = phase;
    b.phaseStart = s.frame;
    b.transition = s.frame + 90;
    b.fire = s.frame + 150;
    s.bullets = s.bullets.filter((v) => v.player);
    s.hazards = [];
    score(s, 3000);
    message(s, `Pha ${phase} · Đổi chiến thuật`);
  }
  if (p !== 6)
    b.x = q(90 + Math.sin((s.frame - b.born) / 120) * (p === 3 ? 55 : 20));
  if (p === 7) b.x = 36 + (Math.floor((s.frame - b.born) / 360) % 5) * 27;
  b.y = q((p === 10 ? 92 : p === 3 ? 48 : 68) + Math.sin(s.frame / 90) * 3);
  if (p === 10 && b.phase === 4) b.weak = s.frame + 300;
  if (s.frame < b.transition || s.frame < b.fire) return;
  b.fire =
    s.frame + Math.max(45, 150 - b.phase * 15 - Math.floor(difficulty(s) / 3));
  b.pattern++;
  const pattern = b.pattern + (has(s, "remix") ? s.config.seed % 3 : 0);
  if (p === 1) {
    if (b.phase >= 2 && pattern % 3 === 0) {
      hazard(s, "beam", s.x, 160, 27, 320, 40, 2);
      b.weak = s.frame + caps(s).tele + 160;
    } else if (pattern % 2) {
      for (let i = 0; i < 3; i++)
        hazard(s, "meteor", 20 + random(s) * 140, 165, 12, 320, 35);
    } else aimed(s, b.x, b.y + 35, 5, 0.22, "shard", 1, Math.PI / 2);
  }
  if (p === 2) {
    if (pattern % 3 === 0) {
      hazard(s, "slow", 30 + random(s) * 120, 200, 40, 80, 180, 0);
      if (b.phase >= 2) {
        spawn(s, "larva", 3, 3);
        spawn(s, "larva", 7, 3);
        b.weak = s.frame + 180;
      }
    } else if (b.phase === 3) ring(s, b.x, b.y + 35, 12, pattern * 0.2);
    else aimed(s, b.x, b.y + 35, 3, 0.12);
  }
  if (p === 3) {
    if (b.phase >= 2 && pattern % 3 === 0) {
      hazard(s, "ice", s.x, 160, 23, 320, 72);
      b.weak = s.frame + caps(s).tele + 120;
    } else aimed(s, b.x, b.y + 20, 5, 0.3, "shard");
  }
  if (p === 4) {
    if (pattern % 2) {
      hazard(s, "beam", s.x, 220, 23, 200, 72);
      hazard(s, "beam", s.x < 90 ? 145 : 35, 220, 23, 200, 72);
      b.weak = s.frame + caps(s).tele + 120;
    } else if (b.phase === 3) {
      const gap = 30 + Math.floor(random(s) * 6) * 20;
      for (let x = 5; x < 180; x += 10)
        if (Math.abs(x - gap) > 14)
          aimed(s, x, b.y + 35, 1, 0, "shard", 1, Math.PI / 2);
    } else aimed(s, b.x, b.y + 40, 7, 0.24, "bomb");
  }
  if (p === 5) {
    if (b.parts.every((v) => v.hp <= 0)) b.weak = s.frame + 300;
    if (b.phase >= 3 && pattern % 3 === 0)
      hazard(s, "gravity", 90, 190, 70, 70, 300, 0);
    else if (b.phase >= 2 && pattern % 2 === 0)
      aimed(s, b.x, b.y + 35, 6, 0.28, "bomb");
    else
      for (const part of b.parts
        .filter((v) => v.hp > 0)
        .slice(pattern % 2, (pattern % 2) + 2))
        hazard(s, "beam", part.x, 180, 20, 210, 60);
  }
  if (p === 6) {
    if (b.parts.every((v) => v.hp <= 0)) b.weak = s.frame + 600;
    if (b.phase === 3) ring(s, b.x, b.y + 25, 8, pattern * 0.26);
    else if (pattern % 3 === 0) {
      const gap = 25 + random(s) * 130;
      for (let x = 12; x < 180; x += 32)
        if (Math.abs(x - gap) > 22) hazard(s, "beam", x, 160, 8, 320, 48);
    } else
      for (const part of b.parts.filter((v) => v.hp > 0))
        aimed(s, part.x, part.y, 1);
  }
  if (p === 7) {
    b.weak = s.frame + 90;
    if (b.phase >= 2 && !b.parts.length)
      for (let i = 0; i < 3; i++)
        b.parts.push({
          x: 35 + i * 55,
          y: 120,
          hp: 30,
          maxHp: 30,
          radius: 10,
          kind: "decoy",
        });
    aimed(s, b.x, b.y + 25, 7, 0.18);
    if (b.phase === 3 && pattern % 3 === 0)
      hazard(s, "slow", s.x, s.y, 35, 80, 240, 0);
  }
  if (p === 8) {
    if (b.parts.every((v) => v.hp <= 0)) b.weak = s.frame + 360;
    hazard(
      s,
      "beam",
      s.x,
      160,
      b.phase === 3 ? 33 : 20,
      320,
      b.phase === 3 ? 90 : 18,
      b.phase === 3 ? 2 : 1,
    );
    if (pattern % 2 === 0) aimed(s, b.x, b.y + 30, 3, 0.5, "round");
  }
  if (p === 9) {
    b.weak = pattern % 2 === 0 ? s.frame + 120 : 0;
    if (b.phase === 3) {
      if (!b.parts.length)
        for (let i = 0; i < 12; i++)
          b.parts.push({
            x: 90 + Math.cos((i * Math.PI) / 6) * 55,
            y: 120 + Math.sin((i * Math.PI) / 6) * 35,
            hp: 150,
            maxHp: 150,
            radius: 6,
            kind: "shard",
          });
      ring(s, b.x, b.y, 12, pattern * 0.15);
    } else if (b.phase === 2 && pattern % 3 === 0)
      for (let i = 0; i < 3; i++)
        hazard(s, "beam", 40 + i * 50, 160, 9, 320, 60);
    else aimed(s, b.x, b.y + 40, 4, 0.35);
  }
  if (p === 10) {
    if (b.phase === 1) {
      aimed(s, b.x, b.y + 45, 5, 0.2);
      if (pattern % 6 === 0) {
        spawn(s, "gnat", 2, 3);
        spawn(s, "beetle", 7, 1);
      }
    }
    if (b.phase === 2) {
      const memory = Math.floor((s.frame - b.phaseStart) / 720) % 3;
      if (memory === 0) hazard(s, "beam", s.x, 160, 27, 320, 50, 2);
      if (memory === 1) {
        const gap = 30 + random(s) * 120;
        for (let x = 10; x < 180; x += 10)
          if (Math.abs(x - gap) > 15)
            aimed(s, x, 130, 1, 0, "shard", 1, Math.PI / 2);
      }
      if (memory === 2) aimed(s, b.x, b.y + 40, 7, 0.2);
    }
    if (b.phase === 3) {
      hazard(s, "gravity", 90, 185, 65, 65, 100, 0);
      ring(s, b.x, b.y + 45, 18, pattern * 0.35);
    }
    if (b.phase === 4) {
      b.weak = s.frame + 300;
      if (pattern % 3 === 0) hazard(s, "beam", s.x, 160, 33, 320, 48, 2);
      else ring(s, b.x, b.y + 40, 12, pattern * 0.1);
    }
  }
  if (b.hp <= 0) bossKilled(s);
}
function bossKilled(s: Simulation) {
  if (!s.boss) return;
  const p = s.boss.planet;
  score(
    s,
    10000 +
      3000 * (p === 10 ? 4 : 3) +
      s.bullets.filter((v) => !v.player).length * 50,
  );
  addEffect(s, s.boss.x, s.boss.y, "explode_m");
  s.bullets = [];
  s.hazards = [];
  s.enemies = [];
  s.boss = null;
  s.bossesKilled++;
  if (s.config.mode === "rush" && s.bossesKilled < 10) {
    s.hp = Math.min(s.maxHp, s.hp + 1);
    makeBoss(s, s.bossesKilled + 1);
  } else if (s.config.mode === "practice") {
    makeBoss(s, p);
    const b = s.boss!;
    b.phase = s.config.practicePhase || 1;
    b.hp = b.maxHp * (1 - (b.phase - 1) / (p === 10 ? 4 : 3)) - 0.01;
  } else if (s.config.mode !== "endless") s.status = "won";
}
function pathPosition(s: Simulation, e: Enemy) {
  const age = (s.frame - e.born) / 60,
    v = STATS[e.kind][3] * speed(s),
    isHover = e.path === 7 || e.kind === "commander" || e.kind === "generator";
  if (isHover) {
    e.y = q(Math.min(e.kind === "generator" ? 95 : 70, -20 + age * v));
    e.x = q(clamp(e.x0 + (planet(s) > 1 ? Math.sin(age) * 16 : 0), 12, 168));
    if (age > 10 && e.kind !== "commander" && e.kind !== "generator")
      e.y = q(70 + (age - 10) * v);
    return;
  }
  e.y = q(e.path === 17 ? 345 - age * v : -20 + age * v);
  if (e.path === 2)
    e.x = q(clamp(e.x0 + (e.x0 < 90 ? 1 : -1) * age * v * 0.4, 8, 172));
  if ([3, 11, 16].includes(e.path))
    e.x = q(
      clamp(e.x0 + Math.sin(age * 2.2) * (e.path === 11 ? 40 : 22), 8, 172),
    );
  if (e.path === 4)
    e.x = q(clamp(e.x0 + (Math.abs(((age * 35) % 80) - 40) - 20), 8, 172));
  if ([5, 6, 8, 9, 12, 13].includes(e.path))
    e.x = q(
      clamp(
        90 +
          Math.cos(age * (e.path === 12 ? 3 : 2) + e.x0 / 35) *
            (e.path === 9 ? Math.max(10, 45 - age * 6) : 40),
        8,
        172,
      ),
    );
  if (e.path === 14) {
    e.y = 80;
    e.x = q(((e.x0 + age * 32) % 210) - 15);
  }
  if (e.path === 15 && age > 2) {
    e.y = q(170 - (age - 2) * 100);
    e.x = q(clamp(e.x0 + (e.x0 < 90 ? 1 : -1) * (age - 2) * 35, 0, 180));
  }
  if (e.path === 10 && age > 1) {
    e.y = 70;
    if (!e.tele) {
      e.tele = s.frame + caps(s).tele;
      e.aimX = s.x;
      e.aimY = s.y;
    }
    if (s.frame > e.tele) {
      const d = (s.frame - e.tele) / 60,
        theta = Math.atan2(e.aimY - 70, e.aimX - e.x0);
      e.x = q(e.x0 + Math.cos(theta) * d * 300);
      e.y = q(70 + Math.sin(theta) * d * 300);
    }
  }
}
function enemyUpdate(s: Simulation, e: Enemy) {
  pathPosition(s, e);
  if (e.kind === "cicada")
    for (const other of s.enemies)
      if (other.id !== e.id && Math.hypot(other.x - e.x, other.y - e.y) < 45)
        other.hp = Math.min(other.maxHp, other.hp + (other.maxHp * 0.1) / 60);
  if (
    s.frame - e.born < 36 ||
    e.y < 0 ||
    e.y > 200 ||
    [
      "scout",
      "gnat",
      "larva",
      "larva_small",
      "hornet",
      "generator",
      "meteor",
    ].includes(e.kind)
  )
    return;
  if (s.frame % 1440 >= 1200) return;
  if (s.frame >= e.fire) {
    if (!e.tele) {
      e.tele = s.frame + caps(s).tele;
      e.aimX = s.x;
      e.aimY = s.y;
      return;
    }
    if (s.frame < e.tele) return;
    if (e.kind === "minelayer")
      bullet(s, {
        x: e.x,
        y: e.y,
        vx: 0,
        vy: 0,
        player: false,
        damage: 1,
        radius: 4,
        kind: "mine",
        ttl: 360,
        pierce: 0,
        hit: [],
      });
    else if (e.kind === "commander") ring(s, e.x, e.y + 22, 8, s.frame / 60);
    else if (e.kind === "moth") aimed(s, e.x, e.y + 12, 1, 0, "bomb");
    else if (
      e.kind !== "wraith" ||
      Math.floor((s.frame - e.born) / 120) % 2 === 0
    )
      aimed(
        s,
        e.x,
        e.y + e.radius,
        e.kind === "beetle" ? 3 : 1,
        0.3,
        e.kind === "wasp" ? "aimed" : "round",
        1,
        Math.atan2(e.aimY - e.y, e.aimX - e.x),
      );
    e.fire = s.frame + Math.round(144 - difficulty(s) * 0.7);
    e.tele = 0;
  }
}
function death(s: Simulation, e: Enemy) {
  if (s.frame - s.lastKill > 120) s.combo = 0;
  s.combo++;
  s.maxCombo = Math.max(s.maxCombo, s.combo);
  s.lastKill = s.frame;
  s.kills++;
  score(s, STATS[e.kind][1]);
  if (e.kind === "generator") s.generators++;
  if (e.kind === "commander") s.miniKilled = true;
  addEffect(s, e.x, e.y, e.radius > 12 ? "explode_m" : "explode_s");
  if (e.kind === "larva" && s.enemies.length < caps(s).enemies - 1) {
    spawn(s, "larva_small", 3, 2, undefined, { x: e.x - 8, y: e.y });
    spawn(s, "larva_small", 7, 2, undefined, { x: e.x + 8, y: e.y });
  }
  if (e.kind === "commander") {
    s.pickups.push(
      { x: e.x - 12, y: e.y, kind: "plasma", born: s.frame },
      { x: e.x + 12, y: e.y, kind: "nano", born: s.frame },
    );
  }
  if (e.drop && !has(s, "dry"))
    s.pickups.push({ x: e.x, y: e.y, kind: e.drop, born: s.frame });
  const chance =
    (planet(s) <= 2 ? 0.08 : planet(s) <= 7 ? 0.06 : 0.05) *
    (s.config.boosters.includes("lucky") ? 1.25 : 1);
  if (random(s, true) < chance) {
    let kind = ITEMS[Math.floor(random(s, true) * ITEMS.length)];
    if (has(s, "dry")) kind = "nano";
    s.pickups.push({ x: e.x, y: e.y, kind, born: s.frame });
  }
  if (
    random(s, true) < 0.32 ||
    levelFor(s.config.level).objective === "collect"
  )
    s.pickups.push({ x: e.x, y: e.y, kind: "star", born: s.frame });
}
function updateBullets(s: Simulation) {
  const damageMult =
    (1 + 0.04 * s.config.upgrades.cannon) *
    1.032 ** Object.values(s.config.upgrades).reduce((a, b) => a + b, 0) *
    (s.config.integrity >= 80
      ? 1
      : s.config.integrity >= 60
        ? 0.92
        : s.config.integrity >= 40
          ? 0.88
          : s.config.integrity >= 20
            ? 0.82
            : 0.75) *
    (s.config.ship === "striker" ? 1.1 : s.config.ship === "bulwark" ? 0.9 : 1);
  for (const b of [...s.bullets]) {
    if (b.kind === "missile") {
      const target = s.enemies.find((e) => e.hp > 0) || s.boss;
      if (target) {
        const a = Math.atan2(target.y - b.y, target.x - b.x);
        b.vx = q(b.vx * 0.9 + Math.cos(a) * 260 * 0.1);
        b.vy = q(b.vy * 0.9 + Math.sin(a) * 260 * 0.1);
      }
    }
    b.x = q(b.x + b.vx / 60);
    b.y = q(b.y + b.vy / 60);
    b.ttl--;
    if (!b.player) {
      if (s.laser > 0 && Math.abs(b.x - s.x) < 6 && b.y < s.y) {
        b.ttl = 0;
        continue;
      }
      if (b.kind === "bomb" && b.ttl <= 0) {
        ring(s, b.x, b.y, 8);
        continue;
      }
      if (b.kind === "mine" && Math.hypot(b.x - s.x, b.y - s.y) < 20) {
        b.ttl = 0;
        ring(s, b.x, b.y, 6);
      }
      if (
        Math.hypot(b.x - s.x, b.y - s.y) <
        b.radius + (s.config.upgrades.thrusters >= 10 ? 1.8 : 2)
      ) {
        damage(s, b.damage, !!s.boss);
        b.ttl = 0;
      }
      continue;
    }
    for (const e of s.enemies) {
      if (
        e.hp <= 0 ||
        b.hit.includes(e.id) ||
        (e.kind === "wraith" && Math.floor((s.frame - e.born) / 120) % 2 === 1)
      )
        continue;
      if (
        Math.abs(b.x - e.x) < e.radius + 2 &&
        Math.abs(b.y - e.y) < e.radius + 3
      ) {
        let scale = e.kind === "beetle" && b.kind !== "missile" ? 0.6 : 1;
        if (
          e.kind === "mantis" &&
          b.kind !== "missile" &&
          Math.sin(s.frame / 40) > 0
        )
          scale = 0.1;
        if (
          e.kind === "prism" &&
          b.kind !== "missile" &&
          Math.floor(s.frame / 90) % 2 === 1
        ) {
          aimed(s, e.x, e.y + 12, 1);
          scale = 0;
        }
        e.hp -= b.damage * damageMult * scale;
        b.hit.push(e.id);
        addEffect(s, b.x, b.y, "explode_s");
        if (b.pierce-- <= 0) b.ttl = 0;
        break;
      }
    }
    const boss = s.boss;
    if (boss && boss.transition <= s.frame && b.ttl > 0) {
      let hitPart = false;
      for (const p of boss.parts)
        if (p.hp > 0 && Math.hypot(b.x - p.x, b.y - p.y) < p.radius + 3) {
          p.hp -= b.damage * damageMult;
          b.ttl = 0;
          hitPart = true;
          if (p.kind === "shard" && p.hp <= 0) boss.hp -= boss.maxHp * 0.025;
          break;
        }
      if (
        !hitPart &&
        Math.abs(b.x - boss.x) <
          (boss.planet === 3 ? 22 : boss.planet === 10 ? 62 : 40) &&
        Math.abs(b.y - boss.y) < (boss.planet === 10 ? 58 : 30)
      ) {
        const shielded =
            [5, 6, 8].includes(boss.planet) && boss.parts.some((p) => p.hp > 0),
          reflect =
            boss.planet === 9 &&
            boss.weak <= s.frame &&
            Math.abs(b.x - boss.x) > 12;
        if (reflect) {
          if (s.bullets.filter((v) => v.kind === "aimed").length < 20)
            aimed(s, b.x, b.y + 10, 1);
        } else
          boss.hp -=
            b.damage *
            damageMult *
            (boss.weak > s.frame
              ? 2
              : shielded
                ? [6, 8].includes(boss.planet)
                  ? 0
                  : 0.15
                : 1);
        b.ttl = 0;
      }
    }
  }
  s.bullets = s.bullets.filter(
    (b) => b.ttl > 0 && b.x > -20 && b.x < 200 && b.y > -30 && b.y < 350,
  );
}
function spawnWaves(s: Simulation) {
  const l = levelFor(s.config.level);
  if (s.config.mode === "practice" && s.config.practiceEnemy) {
    if (s.frame % 300 === 1)
      for (let i = 0; i < (s.config.practiceCount || 1); i++)
        spawn(s, s.config.practiceEnemy, 3 + i * 2, s.config.practicePath || 1);
    return;
  }
  if (s.config.mode === "endless") {
    if (
      s.frame % Math.max(60, 240 - Math.floor(difficulty(s))) === 0 &&
      s.enemies.length < caps(s).enemies
    )
      spawn(
        s,
        (
          [
            "scout",
            "drone",
            "gnat",
            "wasp",
            "beetle",
            "hornet",
            "wraith",
          ] as EnemyKind[]
        )[Math.floor(random(s) * 7)],
        Math.floor(random(s) * 7) + 2,
        7,
      );
    if (s.frame % 21600 === 0 && !s.boss)
      makeBoss(s, 1 + Math.floor(random(s) * 10));
    else if (s.frame % 10800 === 0) spawn(s, "commander", 5, 7);
    if (s.frame % 7200 === 0) s.hp = Math.min(s.maxHp, s.hp + 1);
    return;
  }
  if (s.config.mode === "rush") return;
  const waves =
    s.config.mode === "practice" && s.config.practiceWave !== undefined
      ? [{ ...l.waves[s.config.practiceWave], t: 2 }].filter((w) => w.enemy)
      : l.waves;
  if (
    s.config.mode === "practice" &&
    !s.boss &&
    s.waveIndex >= waves.length &&
    s.enemies.length === 0
  ) {
    s.waveIndex = 0;
    s.waveSpawn = 0;
    s.nextSpawn = s.frame + 60;
  }
  const w = waves[s.waveIndex];
  if (
    !w ||
    s.frame < w.t * 60 ||
    s.frame < s.nextSpawn ||
    s.enemies.length >= caps(s).enemies
  )
    return;
  const count = w.count + (has(s, "swarm") ? Math.ceil(w.count * 0.5) : 0);
  const index = s.waveSpawn;
  let lane =
    w.formation === 1
      ? 2 + (index % 7)
      : w.formation === 3
        ? clamp(w.lane + (index % 2 ? 1 : -1) * Math.ceil(index / 2), 1, 9)
        : w.lane;
  if (
    ((s.config.seed >>> 4) % 2 === 1 && s.config.mode !== "campaign") ||
    has(s, "remix")
  )
    lane = 10 - lane;
  spawn(s, w.enemy, lane, w.path, index === count - 1 ? w.drop : undefined);
  s.nextSpawn = s.frame + Math.round(w.delay * 60);
  s.waveSpawn++;
  if (s.waveSpawn >= count) {
    s.waveIndex++;
    s.waveSpawn = 0;
  }
}
function objectiveMet(s: Simulation) {
  const l = levelFor(s.config.level);
  return l.objective === "kills"
    ? s.kills >= l.target
    : l.objective === "collect"
      ? s.collected >= l.target
      : l.objective === "generators"
        ? s.generators >= l.target
        : l.objective === "score"
          ? s.score >= l.target
          : l.objective === "mini"
            ? s.miniKilled
            : l.objective === "escort"
              ? s.escortHp > 0
              : l.objective === "survive";
}
export function step(s: Simulation, input: Input, record = true) {
  if (s.status !== "playing") return;
  // Input is quantized/sampled at 20 Hz; both live play and server replay use this exact schedule.
  if (s.frame % 3 === 0) {
    s.targetX = clamp(Math.round(input.x), 6, 174);
    s.targetY = clamp(Math.round(input.y), 24, 304);
    const mask = input.mask & 63;
    if (
      record &&
      (s.replay.length === 0 ||
        s.replay.at(-1)![1] !== s.targetX ||
        s.replay.at(-1)![2] !== s.targetY ||
        s.replay.at(-1)![3] !== mask)
    )
      s.replay.push([s.frame, s.targetX, s.targetY, mask]);
    for (let i = 0; i < s.slots.length; i++)
      if (mask & (1 << i) && !(s.previousMask & (1 << i))) useSlot(s, i);
    if (
      mask & 8 &&
      !(s.previousMask & 8) &&
      s.config.upgrades.thrusters >= 5 &&
      s.dashCooldown === 0
    ) {
      s.invincible = Math.max(s.invincible, 18);
      s.overdrive = Math.max(s.overdrive, 18);
      s.dashCooldown = 360;
    }
    s.previousMask = mask;
  }
  s.frame++;
  s.dashCooldown = Math.max(0, s.dashCooldown - 1);
  for (const key of [
    "invincible",
    "laser",
    "cloak",
    "overdrive",
    "magnet",
    "amp",
  ] as const)
    s[key] = Math.max(0, s[key] - 1);
  if (s.shieldOwned && s.shield === 0 && s.shieldRecharge-- <= 0) s.shield = 1;
  let movement =
    200 *
    (1 + 0.02 * s.config.upgrades.thrusters) *
    (s.overdrive > 0 ? 1.3 : 1) *
    (s.config.ship === "courier" ? 1.1 : 1);
  for (const h of s.hazards)
    if (h.start <= s.frame && h.end >= s.frame) {
      if (h.kind === "gravity") {
        const a = Math.atan2(h.y - s.y, h.x - s.x);
        s.x = q(s.x + Math.cos(a) * 0.3);
        s.y = q(s.y + Math.sin(a) * 0.3);
      } else if (
        Math.abs(s.x - h.x) < h.w / 2 &&
        Math.abs(s.y - h.y) < h.h / 2
      ) {
        if (h.kind === "slow" || h.kind === "ice") movement *= 0.6;
        if (h.damage) damage(s, h.damage, !!s.boss);
      }
    }
  const dx = s.targetX - s.x,
    dy = s.targetY - s.y,
    d = Math.hypot(dx, dy),
    v = Math.min(d, movement / 60);
  if (d > 0) {
    s.x = q(clamp(s.x + (dx / d) * v, 6, 174));
    s.y = q(clamp(s.y + (dy / d) * v, 24, 304));
  }
  if (planet(s) === 5 || planet(s) === 8)
    s.x = q(clamp(s.x + Math.sin(s.frame / 120) * 0.2, 6, 174));
  spawnWaves(s);
  const l = levelFor(s.config.level);
  if (
    (l.stage === 10 || s.config.mode === "rush") &&
    !s.boss &&
    s.bossesKilled === 0 &&
    s.frame === 1
  )
    makeBoss(s, planet(s));
  bossUpdate(s);
  if (s.boss && s.boss.hp <= 0) bossKilled(s);
  if (s.frame >= s.fire && s.cloak === 0 && (s.enemies.length || s.boss)) {
    s.fire = s.frame + (s.overdrive > 0 ? 5 : 10);
    const n =
      s.weapon + (s.config.upgrades.cannon >= 5 && s.weapon >= 3 ? 1 : 0);
    for (let i = 0; i < n; i++)
      bullet(s, {
        x: s.x + (i - (n - 1) / 2) * 4,
        y: s.y - 13,
        vx: (i - (n - 1) / 2) * (s.weapon >= 3 ? 8 : 0),
        vy: -300,
        player: true,
        damage: 1,
        radius: 2,
        kind: "plasma",
        ttl: 100,
        pierce: s.weapon >= 5 ? 2 : s.weapon >= 4 ? 1 : 0,
        hit: [],
      });
  }
  if (s.missile > 0 && s.frame >= s.missileFire) {
    s.missileFire = s.frame + 90;
    for (let i = 0; i < (s.missile >= 2 ? 4 : 2); i++)
      bullet(s, {
        x: s.x + (i % 2 ? 12 : -12),
        y: s.y,
        vx: i % 2 ? 80 : -80,
        vy: -180,
        player: true,
        damage: 8,
        radius: 2,
        kind: "missile",
        ttl: 180,
        pierce: 0,
        hit: [],
      });
  }
  if (s.laser > 0) {
    for (const e of s.enemies)
      if (Math.abs(e.x - s.x) < e.radius + 5 && e.y < s.y)
        e.hp -= 0.6 * (1 + 0.04 * s.config.upgrades.cannon);
    if (s.boss && s.boss.transition <= s.frame && Math.abs(s.boss.x - s.x) < 40)
      s.boss.hp -= 1.5 * (s.boss.weak > s.frame ? 2 : 1);
    s.bullets = s.bullets.filter((b) => b.player || Math.abs(b.x - s.x) > 6);
  }
  for (const e of [...s.enemies]) {
    if (e.hp <= 0) {
      death(s, e);
      continue;
    }
    enemyUpdate(s, e);
    if (Math.hypot(e.x - s.x, e.y - s.y) < e.radius + 2) damage(s);
    if (l.objective === "escort" && e.y >= 300) {
      s.escortHp--;
      e.y = 360;
    }
  }
  s.enemies = s.enemies.filter(
    (e) => e.hp > 0 && e.y < 350 && e.y > -50 && s.frame - e.born < 1200,
  );
  updateBullets(s);
  const supplyPeriod = l.stage === 10 ? 1200 : 1500;
  if (s.frame === 1200 || s.frame % supplyPeriod === 0) {
    const kind =
      s.frame === 1200 ? "plasma" : s.hp < s.maxHp ? "nano" : "plasma";
    if (!has(s, "dry") || kind === "nano")
      s.pickups.push({ x: 90, y: 100, kind, born: s.frame });
  }
  if (s.frame === Math.round(l.duration * 30)) {
    if (s.config.boosters.includes("magnet")) s.magnet = 900;
    if (s.config.boosters.includes("nano"))
      s.pickups.push({ x: 90, y: 160, kind: "nano", born: s.frame });
  }
  for (const p of s.pickups) {
    p.y = q(p.y + 0.4);
    const d = Math.hypot(p.x - s.x, p.y - s.y);
    if (
      s.magnet > 0 ||
      (p.kind === "star" && s.config.upgrades.magnet >= 5) ||
      d < 16 * (1 + 0.05 * s.config.upgrades.magnet)
    ) {
      p.x = q(p.x + (s.x - p.x) * 0.1);
      p.y = q(p.y + (s.y - p.y) * 0.1);
    }
    if (d < 10) {
      pickup(s, p.kind);
      p.born = -10000;
    }
  }
  s.pickups = s.pickups.filter((p) => s.frame - p.born < 480 && p.y < 335);
  if (
    l.stage >= 4 &&
    s.config.mode !== "rush" &&
    s.frame - s.lastHazard > 900
  ) {
    s.lastHazard = s.frame;
    const p = planet(s),
      x = 25 + random(s) * 130;
    if (p === 1) spawn(s, "meteor", x / 18, 1);
    if ([2, 3, 7].includes(p))
      hazard(s, p === 3 ? "ice" : "slow", x, 200, 32, 65, 180, 0);
    if ([4, 6, 8].includes(p))
      hazard(s, "beam", x, 160, p === 6 ? 8 : 20, 320, 45);
    if ([5, 10].includes(p)) hazard(s, "gravity", x, 190, 50, 50, 200, 0);
    if (p === 9) spawn(s, "prism", x / 18, 7);
  }
  s.hazards = s.hazards.filter((h) => h.end >= s.frame);
  s.effects = s.effects.filter((e) => s.frame - e.born < 24);
  if (s.frame - s.lastKill > 120) s.combo = 0;
  if (s.status !== "playing") return;
  if (l.objective === "escort" && s.escortHp <= 0) {
    s.status = "lost";
    return;
  }
  if (s.config.mode === "practice") return;
  if (s.config.mode === "endless" || s.config.mode === "rush") {
    if (s.frame >= MAX_FRAMES)
      s.status = s.config.mode === "endless" ? "won" : "lost";
    return;
  }
  if (l.objective !== "boss" && s.frame >= l.duration * 60)
    s.status = objectiveMet(s) ? "won" : "lost";
  if (l.objective === "boss" && s.frame >= l.duration * 60 + 900)
    s.status = "lost";
}
export function resultFor(s: Simulation): Result {
  const l = levelFor(s.config.level),
    won = s.status === "won",
    secondary = s.hits <= 1 && (l.objective !== "escort" || s.escortHp >= 10),
    finalScore = s.score + (won ? s.hp * 1000 : 0);
  const prp = Math.round(
    Math.min(35, (finalScore / l.parScore) * 35) +
      Math.max(0, 25 - s.hits * 5) +
      Math.min(15, (s.kills / Math.max(1, s.spawned)) * 15) +
      Math.min(15, s.itemsCollected * 3 + s.collected * 1.5) +
      Math.min(10, ((l.duration * 60) / Math.max(1, s.frame)) * 10),
  );
  const stars = won ? (prp >= 85 && secondary ? 3 : prp >= 60 ? 2 : 1) : 0,
    bonus = Math.min(
      0.8,
      s.config.mutators.reduce((a, m) => a + MUTATORS[m].bonus, 0),
    );
  let credits = Math.floor(
    (60 + 20 * (l.planet - 1) + finalScore / 50) *
      (1 + (stars === 3 ? 0.4 : stars === 2 ? 0.2 : 0) + bonus) *
      (won ? 1 : 0.25),
  );
  if (
    s.config.mode === "practice" ||
    s.config.mode === "daily" ||
    s.config.mode === "weekly" ||
    s.config.mode === "rush"
  )
    credits = 0;
  if (s.config.mode === "endless")
    credits = Math.min(1200, Math.floor(finalScore / 100));
  if (s.config.mode === "ngplus") credits = Math.floor(credits * 1.5);
  return {
    level: l.id,
    mode: s.config.mode,
    won,
    score: finalScore,
    stars: s.config.mode === "practice" ? 0 : stars,
    prp,
    secondary,
    kills: s.kills,
    spawned: s.spawned,
    hits: s.hits,
    collected: s.collected,
    frames: s.frame,
    combo: s.maxCombo,
    credits,
  };
}
export function replaySimulation(
  config: RunConfig,
  entries: ReplayEntry[],
  frames: number,
): Simulation {
  if (
    !Number.isInteger(frames) ||
    frames < 0 ||
    frames > MAX_FRAMES ||
    entries.length > 12200
  )
    throw new Error("Replay quá dài");
  let last = -1;
  for (const e of entries) {
    if (
      e.length !== 4 ||
      !e.every(Number.isInteger) ||
      e[0] < last ||
      e[0] < 0 ||
      e[0] > frames ||
      e[1] < 6 ||
      e[1] > 174 ||
      e[2] < 24 ||
      e[2] > 304 ||
      e[3] < 0 ||
      e[3] > 63
    )
      throw new Error("Replay không hợp lệ");
    last = e[0];
  }
  const s = createSimulation(config);
  let i = 0,
    input: Input = { x: 90, y: 268, mask: 0 };
  while (
    (s.frame < frames && s.status === "playing") ||
    (s.status === "revive" && i < entries.length)
  ) {
    while (i < entries.length && entries[i][0] === s.frame) {
      const e = entries[i++];
      input = { x: e[1], y: e[2], mask: e[3] };
      if (e[3] & 32) s.status = "lost";
      if (e[3] & 16 && s.status === "revive") {
        revive(s);
        s.replay = [];
      }
    }
    if (s.status !== "playing") break;
    step(s, input, false);
  }
  // A voluntary exit is an event at the final frame, without advancing physics.
  while (i < entries.length && entries[i][0] === s.frame) {
    if (entries[i++][3] & 32 && s.status !== "won") s.status = "lost";
  }
  s.replay = entries.map((e) => [...e]);
  return s;
}
export function encodeReplay(entries: ReplayEntry[]) {
  const bytes = new Uint8Array(entries.length * 6);
  const view = new DataView(bytes.buffer);
  entries.forEach(([f, x, y, m], i) => {
    view.setUint16(i * 6, f);
    bytes[i * 6 + 2] = x;
    view.setUint16(i * 6 + 3, y);
    bytes[i * 6 + 5] = m;
  });
  return btoa(Array.from(bytes, (b) => String.fromCharCode(b)).join(""));
}
export function decodeReplay(text: string): ReplayEntry[] {
  if (typeof text !== "string" || text.length > 100000)
    throw new Error("Replay quá dài");
  const raw = atob(text);
  if (raw.length % 6) throw new Error("Replay sai định dạng");
  const bytes = Uint8Array.from(raw, (c) => c.charCodeAt(0)),
    view = new DataView(bytes.buffer),
    entries: ReplayEntry[] = [];
  for (let i = 0; i < bytes.length; i += 6)
    entries.push([
      view.getUint16(i),
      bytes[i + 2],
      view.getUint16(i + 3),
      bytes[i + 5],
    ]);
  return entries;
}

