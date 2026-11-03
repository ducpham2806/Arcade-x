/** Tank Clash arenas (P3a).
 *
 * Crossfire is the 2v2 arena: a larger field whose obstacles are generated from a seed once per match.
 * The left half is random; the right half is the same layout rotated 180°, so both teams always play
 * an identical map. Every generated layout is validated before use (see `validateArena`); a failed
 * attempt draws again from the same seeded stream, so one seed always gives one layout.
 *
 * No runtime import from engine.ts (engine imports this file); the two radii below must match CONFIG,
 * which a test checks.
 */
import type { Wall } from './engine.ts';

export type Spawn = { x: number; y: number };
export type ArenaSize = { width: number; height: number };
export const DUEL_SIZE: ArenaSize = Object.freeze({ width: 800, height: 480 });
/** 1.69× the Duel area for twice the tanks; same 5:3 ratio as the canvas. [PLACEHOLDER until phone playtests] */
export const SQUAD_SIZE: ArenaSize = Object.freeze({ width: 1040, height: 624 });
export const TANK_RADIUS = 16, BULLET_RADIUS = 3;
/** Team 0 starts left, team 1 right. b/b2 are a/a2 rotated 180° about the centre. */
export const SQUAD_SPAWNS: Readonly<Record<'a' | 'a2' | 'b' | 'b2', Spawn>> = Object.freeze({
  a: { x: 78, y: 156 }, a2: { x: 78, y: 468 }, b: { x: 962, y: 468 }, b2: { x: 962, y: 156 },
});
export const SQUAD_RULES = Object.freeze({
  spawnClearance: 60,   // no wall within this distance of a spawn point
  mainRouteRadius: 24,  // every spawn reaches every other one with a corridor ≥ 48 px (1.5 tank widths)
  maxAttempts: 40,
});

type Piece = { x: number; y: number; w: number; h: number; kind: Wall['kind'] }[];
const CELL = 52, HALF = SQUAD_SIZE.width / 2;
/** Cells (x in 4..9, y in 0..11) the random pieces may use; columns 0..3 hold the spawns and their cover. */
const COLS = [4, 9], ROWS = 12;
const TEMPLATES: { cw: number; ch: number; parts: Piece }[] = [
  { cw: 2, ch: 1, parts: [{ x: 0, y: 14, w: 104, h: 24, kind: 'steel' }] },
  { cw: 1, ch: 2, parts: [{ x: 14, y: 0, w: 24, h: 104, kind: 'steel' }] },
  { cw: 1, ch: 1, parts: [{ x: 6, y: 6, w: 40, h: 40, kind: 'steel' }] },
  { cw: 2, ch: 1, parts: [{ x: 4, y: 4, w: 44, h: 44, kind: 'brick' }, { x: 48, y: 4, w: 44, h: 44, kind: 'brick' }] },
  { cw: 1, ch: 2, parts: [{ x: 4, y: 4, w: 44, h: 44, kind: 'brick' }, { x: 4, y: 48, w: 44, h: 44, kind: 'brick' }] },
  { cw: 2, ch: 2, parts: [{ x: 0, y: 14, w: 104, h: 24, kind: 'steel' }, { x: 14, y: 38, w: 24, h: 66, kind: 'steel' }] },
  { cw: 2, ch: 2, parts: [{ x: 66, y: 66, w: 38, h: 24, kind: 'steel' }, { x: 4, y: 4, w: 44, h: 44, kind: 'brick' }, { x: 48, y: 48, w: 44, h: 44, kind: 'brick' }] },
];
/** Centre pieces are symmetric under 180° rotation by themselves. */
const CENTRES: Piece[] = [
  [],
  [{ x: 494, y: 286, w: 52, h: 52, kind: 'steel' }],
  [{ x: 442, y: 300, w: 156, h: 24, kind: 'steel' }, { x: 508, y: 234, w: 24, h: 66, kind: 'steel' }, { x: 508, y: 324, w: 24, h: 66, kind: 'steel' }],
  [{ x: 476, y: 268, w: 44, h: 44, kind: 'brick' }, { x: 520, y: 268, w: 44, h: 44, kind: 'brick' }, { x: 476, y: 312, w: 44, h: 44, kind: 'brick' }, { x: 520, y: 312, w: 44, h: 44, kind: 'brick' }],
];
/** Steel in front of each team-0 spawn so no straight shot reaches it from the other side. */
const COVER: Piece = [{ x: 148, y: 108, w: 22, h: 96, kind: 'steel' }, { x: 148, y: 420, w: 22, h: 96, kind: 'steel' }];
/** Used only if every random attempt fails validation (a test keeps this layout valid). */
const FALLBACK: Piece = [
  { x: 260, y: 66, w: 104, h: 24, kind: 'steel' }, { x: 364, y: 208, w: 24, h: 104, kind: 'steel' },
  { x: 212, y: 264, w: 44, h: 44, kind: 'brick' }, { x: 212, y: 308, w: 44, h: 44, kind: 'brick' },
  { x: 312, y: 470, w: 104, h: 24, kind: 'steel' }, { x: 420, y: 108, w: 44, h: 44, kind: 'brick' },
  ...CENTRES[1],
];

/** Small deterministic PRNG (mulberry32). */
export function rng(seed: number) {
  let t = seed >>> 0;
  return () => { t = (t + 0x6d2b79f5) >>> 0; let r = Math.imul(t ^ (t >>> 15), 1 | t); r ^= r + Math.imul(r ^ (r >>> 7), 61 | r); return ((r ^ (r >>> 14)) >>> 0) / 4294967296; };
}
const mirror = (p: Piece[number], size: ArenaSize) => ({ ...p, x: size.width - p.x - p.w, y: size.height - p.y - p.h });
const toWalls = (parts: Piece): Wall[] => parts.map((p, i) => ({ id: i + 1, ...p, hp: p.kind === 'steel' ? 999 : 2 }));

function randomLayout(next: () => number): Piece {
  const used = new Set<string>(), half: Piece = [...COVER];
  const centre = CENTRES[Math.floor(next() * CENTRES.length)];
  if (centre.length) for (let x = 8; x <= 9; x++) for (let y = 4; y <= 7; y++) used.add(`${x},${y}`);
  const count = 7 + Math.floor(next() * 4);
  for (let placed = 0, tries = 0; placed < count && tries < 200; tries++) {
    const t = TEMPLATES[Math.floor(next() * TEMPLATES.length)];
    const cx = COLS[0] + Math.floor(next() * (COLS[1] - COLS[0] + 2 - t.cw)), cy = Math.floor(next() * (ROWS + 1 - t.ch));
    const cells: string[] = [];
    for (let x = cx; x < cx + t.cw; x++) for (let y = cy; y < cy + t.ch; y++) cells.push(`${x},${y}`);
    if (cells.some(c => used.has(c))) continue;
    cells.forEach(c => used.add(c)); placed++;
    for (const p of t.parts) half.push({ ...p, x: cx * CELL + p.x, y: cy * CELL + p.y });
  }
  return [...half, ...half.map(p => mirror(p, SQUAD_SIZE)), ...centre];
}

// ---- validation (pure geometry, shared with tests) ----
function circleHits(x: number, y: number, r: number, w: { x: number; y: number; w: number; h: number }) {
  const cx = Math.max(w.x, Math.min(x, w.x + w.w)), cy = Math.max(w.y, Math.min(y, w.y + w.h));
  return Math.hypot(x - cx, y - cy) < r;
}
/** Does a segment (swept by radius r) cross the rectangle? Slab test on the expanded box. */
function segmentHits(x0: number, y0: number, x1: number, y1: number, r: number, w: Wall) {
  let lo = 0, hi = 1;
  for (const [p, d, min, max] of [[x0, x1 - x0, w.x - r, w.x + w.w + r], [y0, y1 - y0, w.y - r, w.y + w.h + r]]) {
    if (Math.abs(d) < 1e-9) { if (p < min || p > max) return false; continue; }
    const a = (min - p) / d, b = (max - p) / d;
    lo = Math.max(lo, Math.min(a, b)); hi = Math.min(hi, Math.max(a, b)); if (lo > hi) return false;
  }
  return true;
}
/** True if no straight (unbounced) shot links any team-0 spawn to any team-1 spawn, past steel only. */
export function spawnsShielded(walls: Wall[], spawns: Record<string, Spawn> = SQUAD_SPAWNS): boolean {
  const steel = walls.filter(w => w.kind === 'steel'), ids = Object.keys(spawns);
  for (const from of ids.filter(id => !id.startsWith('b'))) for (const to of ids.filter(id => id.startsWith('b'))) {
    const p = spawns[from], q = spawns[to], len = Math.hypot(q.x - p.x, q.y - p.y), nx = -(q.y - p.y) / len, ny = (q.x - p.x) / len;
    for (const o1 of [-12, 0, 12]) for (const o2 of [-12, 0, 12])
      if (!steel.some(w => segmentHits(p.x + nx * o1, p.y + ny * o1, q.x + nx * o2, q.y + ny * o2, BULLET_RADIUS, w))) return false;
  }
  return true;
}
/** Flood fill of tank-centre positions on an 8 px grid with every wall intact. */
export function reachable(walls: Wall[], size: ArenaSize, radius: number, from: Spawn) {
  const step = 8, cols = Math.floor(size.width / step) + 1, rows = Math.floor(size.height / step) + 1;
  const free = new Uint8Array(cols * rows);
  let freeCount = 0;
  for (let j = 0; j < rows; j++) for (let i = 0; i < cols; i++) {
    const x = i * step, y = j * step;
    if (x < radius || y < radius || x > size.width - radius || y > size.height - radius) continue;
    if (walls.some(w => circleHits(x, y, radius, w))) continue;
    free[j * cols + i] = 1; freeCount++;
  }
  const at = (p: Spawn) => Math.round(p.y / step) * cols + Math.round(p.x / step);
  const seen = new Uint8Array(cols * rows), queue = [at(from)];
  let seenCount = 0;
  if (free[queue[0]]) { seen[queue[0]] = 1; seenCount = 1; } else queue.length = 0;
  for (let k = 0; k < queue.length; k++) {
    const n = queue[k], i = n % cols, j = (n - i) / cols;
    for (const [di, dj] of [[1, 0], [-1, 0], [0, 1], [0, -1]]) {
      const a = i + di, b = j + dj, m = b * cols + a;
      if (a < 0 || b < 0 || a >= cols || b >= rows || !free[m] || seen[m]) continue;
      seen[m] = 1; seenCount++; queue.push(m);
    }
  }
  return { freeCount, seenCount, reaches: (p: Spawn) => seen[at(p)] === 1 };
}
export type ArenaCheck = { ok: boolean; shielded: boolean; clearSpawns: boolean; mainRoutes: boolean; noPockets: boolean };
export function validateArena(walls: Wall[], size: ArenaSize = SQUAD_SIZE, spawns: Record<string, Spawn> = SQUAD_SPAWNS): ArenaCheck {
  const list = Object.values(spawns);
  const shielded = spawnsShielded(walls, spawns);
  const clearSpawns = list.every(p => !walls.some(w => circleHits(p.x, p.y, SQUAD_RULES.spawnClearance, w)));
  const wide = reachable(walls, size, SQUAD_RULES.mainRouteRadius, list[0]);
  const mainRoutes = list.every(p => wide.reaches(p));
  const tight = reachable(walls, size, TANK_RADIUS + 1, list[0]);
  const noPockets = tight.seenCount === tight.freeCount;
  return { ok: shielded && clearSpawns && mainRoutes && noPockets, shielded, clearSpawns, mainRoutes, noPockets };
}

export type Arena = { seed: number; attempt: number; walls: Wall[] };
let cached: Arena | null = null;
/** Crossfire layout for a seed. Deterministic; cached so each round reset costs nothing. */
export function crossfire(seed: number): Arena {
  seed >>>= 0;
  if (cached?.seed !== seed) {
    const next = rng(seed);
    cached = null;
    for (let attempt = 0; attempt < SQUAD_RULES.maxAttempts && !cached; attempt++) {
      const walls = toWalls(randomLayout(next));
      if (validateArena(walls).ok) cached = { seed, attempt, walls };
    }
    cached ??= { seed, attempt: -1, walls: fallbackArena() };
  }
  return { ...cached, walls: cached.walls.map(w => ({ ...w })) };
}
export function fallbackArena(): Wall[] {
  return toWalls([...COVER, ...FALLBACK.filter(p => p.x + p.w <= HALF), ...[...COVER, ...FALLBACK.filter(p => p.x + p.w <= HALF)].map(p => mirror(p, SQUAD_SIZE)), ...FALLBACK.filter(p => p.x + p.w > HALF)]);
}
export const newSeed = () => (Math.random() * 4294967296) >>> 0;
