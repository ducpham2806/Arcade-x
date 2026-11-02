/** Tank Clash P1. Pure fixed-step simulation: no DOM, network, storage or rewards.
 * All tuning values are provisional until human playtesting. Units: pixels, seconds.
 */
export const CONFIG = Object.freeze({ width: 800, height: 480, hz: 60, radius: 16,
  speed: 155, turnSpeed: 10, hp: 3, damage: 1, shotCooldown: .65, maxBullets: 3,
  bulletSpeed: 340, bulletRadius: 3, bulletLife: 2.5, bounces: 1,
  shieldDuration: .8, shieldCooldown: 8, roundSeconds: 60, maxRounds: 3 });
export type Vec = { x: number; y: number };
export type Input = { x: number; y: number; aim: number; fire: boolean; shield: boolean };
export type Wall = { id: number; x: number; y: number; w: number; h: number; kind: 'steel' | 'brick'; hp: number };
export type Tank = Vec & { id: string; team: number; angle: number; aim: number; hp: number; cooldown: number; shield: number; shieldCooldown: number; kind: 'player' | 'bot' | 'target' };
export type Bullet = Vec & { id: number; owner: string; team: number; vx: number; vy: number; age: number; bounces: number };
export type GameEvent = Vec & { id: number; type: 'shot' | 'bounce' | 'hit' | 'block' | 'brick' | 'lesson' | 'round'; time: number };
export type State = { version: 1; mode: 'training' | 'duel'; tick: number; time: number;
  tanks: Tank[]; walls: Wall[]; bullets: Bullet[]; events: GameEvent[]; nextId: number;
  status: 'playing' | 'roundEnd' | 'finished'; round: number; scores: number[]; remaining: number;
  phaseTime: number; winner: number | null; roundWinner: number | null; lesson: number; lessonDone: boolean;
  stats: { shots: number; hits: number; ricochets: number; blocks: number; bricks: number }; };
export const LESSONS = [
  { title: 'Làm quen tay lái', text: 'Di chuyển xe A đến vòng sáng. Tháp pháo và thân xe quay độc lập.' },
  { title: 'Ngắm và khai hỏa', text: 'Ngắm vào bia B rồi bắn. Trên điện thoại: kéo cần ngắm, nhả để bắn.' },
  { title: 'Bắn bật tường', text: 'Bắn vào mặt dưới tường thép để đạn bật trúng bia B. Đường chấm chỉ một lần bật.' },
  { title: 'Mở đường', text: 'Bắn vỡ một ô gạch cam. Gạch chặn đạn; thép làm đạn bật lại.' },
  { title: 'Đỡ đạn bằng khiên', text: 'Bia B sẽ bắn đạn tập. Bật khiên ngay trước khi đạn chạm xe A.' },
];
export const neutral = (aim = 0): Input => ({ x: 0, y: 0, aim, fire: false, shield: false });
export const clamp = (n: number, lo: number, hi: number) => Math.max(lo, Math.min(hi, n));
const length = (x: number, y: number) => Math.hypot(x, y);
const angleDiff = (a: number, b: number) => Math.atan2(Math.sin(b - a), Math.cos(b - a));
const moveAngle = (a: number, b: number, step: number) => a + clamp(angleDiff(a, b), -step, step);
export function tank(id: string, team: number, x: number, y: number, kind: Tank['kind'] = 'player'): Tank {
  return { id, team, x, y, kind, angle: team ? Math.PI : 0, aim: team ? Math.PI : 0, hp: CONFIG.hp, cooldown: 0, shield: 0, shieldCooldown: 0 };
}
export function duelWalls(): Wall[] {
  const walls: Wall[] = [];
  const add = (x: number, y: number, w: number, h: number, kind: Wall['kind']) => walls.push({ id: walls.length + 1, x, y, w, h, kind, hp: kind === 'steel' ? 999 : 2 });
  for (const x of [240, 520]) { add(x, 80, 40, 120, 'steel'); add(x, 280, 40, 120, 'steel'); }
  add(360, 200, 80, 80, 'steel');
  for (const x of [320, 440]) for (const y of [120, 160, 280, 320]) add(x, y, 40, 40, 'brick');
  return walls;
}
export function createState(mode: State['mode'] = 'training'): State {
  const s: State = { version: 1, mode, tick: 0, time: 0, tanks: [], walls: [], bullets: [], events: [], nextId: 1,
    status: 'playing', round: 1, scores: [0, 0], remaining: CONFIG.roundSeconds, phaseTime: 0,
    winner: null, roundWinner: null, lesson: 0, lessonDone: false, stats: { shots: 0, hits: 0, ricochets: 0, blocks: 0, bricks: 0 } };
  setupRound(s); return s;
}
function setupRound(s: State) {
  s.bullets = []; s.remaining = CONFIG.roundSeconds; s.status = 'playing'; s.phaseTime = 0;
  s.roundWinner = null;
  if (s.mode === 'training') setupLesson(s);
  else { s.walls = duelWalls(); s.tanks = [tank('a', 0, 100, 240), tank('b', 1, 700, 240, 'bot')]; }
}
function setupLesson(s: State) {
  s.lessonDone = false; s.walls = []; s.bullets = [];
  const a = tank('a', 0, 140, 300), b = tank('b', 1, 340, 300, 'target'); b.hp = 1;
  s.tanks = [a];
  if (s.lesson === 1) s.tanks.push(b);
  if (s.lesson === 2) { a.x = 200; a.y = 300; b.x = 600; b.y = 300; s.tanks.push(b); s.walls = [{ id: 1, x: 260, y: 140, w: 280, h: 40, kind: 'steel', hp: 999 }]; a.aim = -.54; }
  if (s.lesson === 3) { a.x = 200; a.y = 240; s.walls = [0, 1, 2].map((i) => ({ id: i + 1, x: 360, y: 180 + i * 40, w: 40, h: 40, kind: 'brick', hp: 2 })); }
  if (s.lesson === 4) { a.x = 320; a.y = 240; b.x = 640; b.y = 240; b.hp = 999; s.tanks.push(b); }
}
export function nextLesson(s: State) { if (s.mode === 'training' && s.lessonDone && s.lesson < LESSONS.length - 1) { s.lesson++; setupLesson(s); } }
function event(s: State, type: GameEvent['type'], x: number, y: number) {
  s.events.push({ id: s.nextId++, type, x, y, time: s.time });
  if (s.events.length > 60) s.events.splice(0, s.events.length - 60);
}
function complete(s: State) { if (!s.lessonDone) { s.lessonDone = true; event(s, 'lesson', s.tanks[0].x, s.tanks[0].y); } }
export function validInput(raw: unknown): raw is Input {
  const v = raw as Input;
  return !!v && typeof v === 'object' && Number.isFinite(v.x) && Number.isFinite(v.y) && Number.isFinite(v.aim)
    && Math.abs(v.x) <= 1 && Math.abs(v.y) <= 1 && Math.abs(v.aim) <= Math.PI * 2
    && typeof v.fire === 'boolean' && typeof v.shield === 'boolean';
}
function circleRect(x: number, y: number, r: number, w: Wall) {
  return Math.hypot(x - clamp(x, w.x, w.x + w.w), y - clamp(y, w.y, w.y + w.h)) < r - 1e-6;
}
export function canOccupy(s: State, x: number, y: number, ignoreId?: string) {
  const r = CONFIG.radius;
  return x >= r && y >= r && x <= CONFIG.width - r && y <= CONFIG.height - r
    && !s.walls.some(w => w.hp > 0 && circleRect(x, y, r, w))
    && !s.tanks.some(t => t.id !== ignoreId && t.hp > 0 && length(x - t.x, y - t.y) < r * 2 - .01);
}
/** Swept point against expanded AABB. Also used by aim preview: preview shares collision rules. */
export function rayBox(x: number, y: number, dx: number, dy: number, w: Wall, radius = CONFIG.bulletRadius) {
  let enter = -Infinity, exit = Infinity, nx = 0, ny = 0;
  for (const axis of [0, 1]) {
    const p = axis ? y : x, d = axis ? dy : dx;
    const min = (axis ? w.y : w.x) - radius, max = (axis ? w.y + w.h : w.x + w.w) + radius;
    if (Math.abs(d) < 1e-10) { if (p < min || p > max) return null; continue; }
    const a = (min - p) / d, b = (max - p) / d, n = d > 0 ? -1 : 1;
    const lo = Math.min(a, b), hi = Math.max(a, b);
    if (lo > enter + 1e-9) { enter = lo; nx = axis ? 0 : n; ny = axis ? n : 0; }
    else if (Math.abs(lo - enter) < 1e-9) { if (axis) ny = n; else nx = n; }
    exit = Math.min(exit, hi); if (enter > exit) return null;
  }
  if (enter < -1e-6 || enter > 1 || exit < 0) return null;
  return { t: Math.max(0, enter), nx, ny };
}
function rayCircle(x: number, y: number, dx: number, dy: number, cx: number, cy: number, radius: number) {
  const ox = x - cx, oy = y - cy, a = dx * dx + dy * dy;
  const c = ox * ox + oy * oy - radius * radius;
  if (c <= 0) return 0;
  const b = 2 * (ox * dx + oy * dy), d = b * b - 4 * a * c;
  if (d < 0 || a < 1e-10) return null;
  const t = (-b - Math.sqrt(d)) / (2 * a); return t >= 0 && t <= 1 ? t : null;
}
export function aimPath(s: State, a: Tank): Vec[] {
  let x = a.x, y = a.y, vx = Math.cos(a.aim), vy = Math.sin(a.aim), distance = CONFIG.bulletSpeed * CONFIG.bulletLife;
  const points: Vec[] = [{ x, y }];
  for (let n = 0; n <= CONFIG.bounces; n++) {
    const dx = vx * distance, dy = vy * distance;
    let best: { t: number; nx: number; ny: number; w: Wall } | null = null;
    for (const w of s.walls) if (w.hp > 0) { const h = rayBox(x, y, dx, dy, w); if (h && (!best || h.t < best.t)) best = { ...h, w }; }
    const boundary = Math.min(1, vx > 0 ? (CONFIG.width - x) / dx : vx < 0 ? -x / dx : 1,
      vy > 0 ? (CONFIG.height - y) / dy : vy < 0 ? -y / dy : 1);
    const t = best && best.t < boundary ? best.t : boundary;
    x += dx * t; y += dy * t; points.push({ x, y });
    if (!best || best.t >= boundary || best.w.kind !== 'steel') break;
    distance *= 1 - t; if (best.nx) vx = -vx; if (best.ny) vy = -vy;
    x += vx * .05; y += vy * .05;
  }
  return points;
}
function fire(s: State, a: Tank) {
  if (a.cooldown > 0 || s.bullets.filter(b => b.owner === a.id).length >= CONFIG.maxBullets) return;
  // Start inside the chassis; owner immunity lasts until ricochet. A muzzle cannot spawn through a wall.
  const x = a.x, y = a.y;
  s.bullets.push({ id: s.nextId++, owner: a.id, team: a.team, x, y, vx: Math.cos(a.aim) * CONFIG.bulletSpeed,
    vy: Math.sin(a.aim) * CONFIG.bulletSpeed, age: 0, bounces: 0 });
  a.cooldown = CONFIG.shotCooldown; if (a.id === 'a') s.stats.shots++;
  event(s, 'shot', x, y);
}
function moveTank(s: State, a: Tank, input: Input, dt: number) {
  a.cooldown = Math.max(0, a.cooldown - dt); a.shield = Math.max(0, a.shield - dt); a.shieldCooldown = Math.max(0, a.shieldCooldown - dt);
  if (a.hp <= 0) return;
  const norm = Math.max(1, length(input.x, input.y)), mx = input.x / norm, my = input.y / norm;
  a.aim = input.aim;
  if (mx || my) a.angle = moveAngle(a.angle, Math.atan2(my, mx), CONFIG.turnSpeed * dt);
  const dx = mx * CONFIG.speed * dt, dy = my * CONFIG.speed * dt;
  const pieces = Math.max(1, Math.ceil(length(dx, dy) / 4));
  for (let i = 0; i < pieces; i++) {
    if (canOccupy(s, a.x + dx / pieces, a.y, a.id)) a.x += dx / pieces;
    if (canOccupy(s, a.x, a.y + dy / pieces, a.id)) a.y += dy / pieces;
  }
  if (input.shield && a.shieldCooldown <= 0) { a.shield = CONFIG.shieldDuration; a.shieldCooldown = CONFIG.shieldCooldown; }
  if (input.fire) fire(s, a);
}
function updateBullet(s: State, b: Bullet, dt: number): boolean {
  b.age += dt; if (b.age >= CONFIG.bulletLife) return false;
  let left = dt;
  for (let iteration = 0; iteration < 3 && left > 1e-6; iteration++) {
    const dx = b.vx * left, dy = b.vy * left;
    let bestT = 1.00001, wallHit: { w: Wall; nx: number; ny: number } | null = null, tankHit: Tank | null = null;
    for (const w of s.walls) if (w.hp > 0) { const h = rayBox(b.x, b.y, dx, dy, w); if (h && h.t < bestT) { bestT = h.t; wallHit = { w, nx: h.nx, ny: h.ny }; } }
    for (const a of s.tanks) {
      if (a.hp <= 0 || (a.id === b.owner ? b.bounces === 0 : a.team === b.team)) continue;
      const h = rayCircle(b.x, b.y, dx, dy, a.x, a.y, CONFIG.radius + CONFIG.bulletRadius);
      if (h !== null && h < bestT - 1e-8) { bestT = h; tankHit = a; wallHit = null; }
    }
    if (bestT > 1) { b.x += dx; b.y += dy; break; }
    b.x += dx * bestT; b.y += dy * bestT;
    if (tankHit) {
      if (tankHit.shield > 0) { if (tankHit.id === 'a') s.stats.blocks++; event(s, 'block', b.x, b.y); if (s.mode === 'training' && s.lesson === 4 && tankHit.id === 'a') complete(s); }
      else {
        const protectedPlayer = s.mode === 'training' && tankHit.id === 'a';
        const requiresBounce = s.mode === 'training' && s.lesson === 2 && b.bounces === 0;
        if (!protectedPlayer && !requiresBounce) tankHit.hp = Math.max(0, tankHit.hp - CONFIG.damage);
        if (b.owner === 'a' && tankHit.id !== 'a') { s.stats.hits++; if (b.bounces) s.stats.ricochets++; }
        event(s, 'hit', b.x, b.y);
        if (s.mode === 'training' && tankHit.id === 'b' && tankHit.hp === 0 && [1, 2].includes(s.lesson)) complete(s);
      }
      return false;
    }
    if (wallHit) {
      if (wallHit.w.kind === 'brick') {
        wallHit.w.hp--; event(s, 'hit', b.x, b.y);
        if (wallHit.w.hp <= 0) { s.stats.bricks++; event(s, 'brick', b.x, b.y); if (s.mode === 'training' && s.lesson === 3) complete(s); }
        return false;
      }
      if (b.bounces >= CONFIG.bounces) return false;
      if (wallHit.nx) b.vx = -b.vx; if (wallHit.ny) b.vy = -b.vy;
      b.bounces++; event(s, 'bounce', b.x, b.y);
      const n = length(b.vx, b.vy); b.x += b.vx / n * .05; b.y += b.vy / n * .05;
      left *= 1 - bestT;
    }
  }
  return b.x >= 0 && b.y >= 0 && b.x <= CONFIG.width && b.y <= CONFIG.height;
}
function resolveRound(s: State) {
  const teams = [0, 1].map(team => s.tanks.filter(t => t.team === team && t.hp > 0));
  if (teams[0].length && teams[1].length && s.remaining > 0) return;
  const cmp = teams[0].length - teams[1].length || teams[0].reduce((v, a) => v + a.hp, 0) - teams[1].reduce((v, a) => v + a.hp, 0);
  s.roundWinner = cmp === 0 ? null : cmp > 0 ? 0 : 1;
  if (s.roundWinner !== null) s.scores[s.roundWinner]++;
  s.status = s.round >= CONFIG.maxRounds || Math.max(...s.scores) >= 2 ? 'finished' : 'roundEnd';
  if (s.status === 'finished') s.winner = s.scores[0] === s.scores[1] ? null : s.scores[0] > s.scores[1] ? 0 : 1;
  s.phaseTime = 2; s.bullets = []; event(s, 'round', 400, 240);
}
/** One fixed 1/60-second step. Inputs are neutral by default; the server owns timing. */
export function step(s: State, inputs: Record<string, Input> = {}) {
  if (s.status === 'finished') return;
  const dt = 1 / CONFIG.hz; s.tick++; s.time += dt;
  if (s.status === 'roundEnd') { s.phaseTime -= dt; if (s.phaseTime <= 0) { s.round++; setupRound(s); } return; }
  s.remaining = Math.max(0, s.remaining - dt);
  for (const a of s.tanks) { const raw = inputs[a.id]; moveTank(s, a, validInput(raw) ? raw : neutral(a.aim), dt); }
  // Move every projectile before deciding round outcome so same-tick mutual eliminations draw.
  s.bullets = s.bullets.filter(b => updateBullet(s, b, dt));
  if (s.mode === 'training' && s.lesson === 0 && length(s.tanks[0].x - 280, s.tanks[0].y - 300) < 26) complete(s);
  if (s.mode === 'duel') resolveRound(s);
}
/** Grid pathfinding for the training bot; all directions still go through real collision. */
function pathDirection(s: State, a: Tank, target: Tank): Vec {
  const size = 40, cols = 20, rows = 12, key = (x: number, y: number) => y * cols + x;
  const ax = Math.floor(a.x / size), ay = Math.floor(a.y / size), end = key(Math.floor(target.x / size), Math.floor(target.y / size));
  const start = key(ax, ay), queue = [start], previous = new Map<number, number>([[start, -1]]);
  for (let cursor = 0; cursor < queue.length; cursor++) {
    const n = queue[cursor]; if (n === end) break;
    for (const [dx, dy] of [[1, 0], [-1, 0], [0, 1], [0, -1]]) {
      const x = n % cols + dx, y = Math.floor(n / cols) + dy, k = key(x, y);
      if (x < 0 || y < 0 || x >= cols || y >= rows || previous.has(k)) continue;
      const px = x * size + 20, py = y * size + 20;
      if (s.walls.some(w => w.hp > 0 && circleRect(px, py, CONFIG.radius + 2, w))) continue;
      previous.set(k, n); queue.push(k);
    }
  }
  if (!previous.has(end)) return { x: 0, y: 0 };
  let n = end; while (previous.get(n) !== start && previous.get(n) !== -1) n = previous.get(n)!;
  const dx = n % cols * size + 20 - a.x, dy = Math.floor(n / cols) * size + 20 - a.y, d = length(dx, dy) || 1;
  return { x: dx / d, y: dy / d };
}
export function botInput(s: State): Input {
  const a = s.tanks.find(a => a.id === 'b'), target = s.tanks[0];
  if (!a || a.hp <= 0) return neutral();
  if (s.mode === 'training') return { ...neutral(Math.PI), fire: s.lesson === 4 && s.tick % 150 === 0 };
  const dx = target.x - a.x, dy = target.y - a.y, distance = length(dx, dy), desired = Math.atan2(dy, dx);
  const clear = !s.walls.some(w => w.hp > 0 && rayBox(a.x, a.y, dx, dy, w));
  const direction = clear && distance < 280 ? { x: -dy / (distance || 1) * Math.sin(s.time * 1.3), y: dx / (distance || 1) * Math.sin(s.time * 1.3) } : pathDirection(s, a, target);
  const danger = s.bullets.some(b => b.team !== a.team && length(b.x - a.x, b.y - a.y) < 90 && (a.x - b.x) * b.vx + (a.y - b.y) * b.vy > 0);
  return { ...direction, aim: moveAngle(a.aim, desired + Math.sin(s.time * 2.7) * .1, .075),
    fire: clear && Math.abs(angleDiff(a.aim, desired)) < .18 && s.time % 1.2 > .35,
    shield: danger && Math.sin(s.time * 2) > .4 };
}
