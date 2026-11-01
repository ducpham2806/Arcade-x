// Tunes the Neon Run level data embedded in public/standalone/neon-run/game.js (the repo only has
// the built game, so LEVELS is edited in place). Each level gets: checkpoints at most 1.500 px apart,
// the dormant world mechanics (conveyors W3, wind W4, both plus crumbling cover W5), a rotating
// star-3 challenge the engine already scores (signs / puzzle / clean / coins), and room hints that
// name the goal that opens the room's gate.
// Idempotent: tuned levels carry `tuning`; re-running changes nothing. `--check` fails if untuned.
import fs from 'node:fs';
import path from 'node:path';

const TUNING = '0.15';
const MAX_CHECKPOINT_GAP = 1500;
const file = path.resolve(import.meta.dirname, '../../public/standalone/neon-run/game.js');
const source = fs.readFileSync(file, 'utf8');

export function findLevels(text) {
  const start = text.indexOf('const LEVELS=') + 'const LEVELS='.length;
  let depth = 0, i = start, inString = false;
  for (; i < text.length; i++) {
    const c = text[i];
    if (inString) { if (c === '\\') i++; else if (c === '"') inString = false; continue; }
    if (c === '"') inString = true;
    else if (c === '[' || c === '{') depth++;
    else if ((c === ']' || c === '}') && --depth === 0) { i++; break; }
  }
  return { start, end: i, levels: JSON.parse(text.slice(start, i)) };
}

const { start, end, levels } = findLevels(source);

if (process.argv.includes('--check')) {
  const untuned = levels.filter(l => l.tuning !== TUNING).map(l => l.id);
  if (untuned.length) { console.error('Untuned Neon Run levels:', untuned.join(', ')); process.exit(1); }
  console.log(JSON.stringify({ tuned: levels.length, tuning: TUNING }));
  process.exit(0);
}

const inRoom = (l, x, pad = 0) => l.rooms.some(r => x >= r.x - pad && x < r.end + pad);
const groundFloors = l => l.platforms.filter(s => s.y === 350 && !s.enabledBy && !s.crumble && s.role !== 'boss-arena');
const finishX = l => (l.boss ? l.boss.arena[0] : l.exit);
// Corridors: the stretches between rooms (and after the last room) where the combat courtyards live.
function corridors(l) {
  const rooms = [...l.rooms].sort((a, b) => a.x - b.x);
  return rooms.map((r, n) => ({ x: r.end, end: n + 1 < rooms.length ? rooms[n + 1].x : finishX(l) }));
}
const floorsIn = (l, c) => groundFloors(l).filter(s => s.x >= c.x && s.x + s.w <= c.end + 1);

function addCheckpoints(l) {
  const marks = [...new Set(l.checkpoints)].sort((a, b) => a - b);
  const groundEnemies = l.enemies.filter(e => e.y >= 300);
  // Corridor ground, or the ground just before a room's gate (never mid-puzzle). Respawning grants
  // a short invulnerability (engine patch /*nr*/), so the spawn spot only has to be clear itself.
  // Spawn is marker+30 (player 25 px wide), so marker <= gate - 70 keeps the respawn clear of the gate.
  const roomEnd = x => l.rooms.some(r => x >= r.x + 780 && x <= r.end - 100);
  const ok = x =>
    (!inRoom(l, x, 80) || roomEnd(x)) && x < finishX(l) - 120 &&
    groundFloors(l).some(s => s.x <= x - 10 && s.x + s.w >= x + 60) &&
    groundEnemies.every(e => e.b + e.w < x - 10 || e.a > x + 110) &&
    l.hazards.every(h => h.x + h.w < x - 40 || h.x > x + 110) &&
    l.springs.every(s => s.x + s.w < x - 20 || s.x > x + 110);
  const stuck = new Set();
  for (let guard = 0; guard < 30; guard++) {
    const points = [l.spawn[0], ...marks, finishX(l)];
    let worst = -1, gap = MAX_CHECKPOINT_GAP;
    for (let n = 1; n < points.length; n++) if (!stuck.has(points[n]) && points[n] - points[n - 1] > gap) { gap = points[n] - points[n - 1]; worst = n; }
    if (worst < 0) break;
    const a = points[worst - 1], b = points[worst], mid = (a + b) / 2;
    let best = null;
    for (let x = Math.ceil((a + 200) / 5) * 5; x <= b - 200; x += 5) if (ok(x) && (best === null || Math.abs(x - mid) < Math.abs(best - mid))) best = x;
    if (best === null) { stuck.add(b); continue; }
    marks.push(best); marks.sort((p, q) => p - q);
  }
  l.checkpoints = marks;
  l.cp = marks[0];
}

function addMechanics(l) {
  const w = l.world;
  if (w < 3) return;
  corridors(l).forEach((c, n) => {
    const long = floorsIn(l, c).filter(s => s.w >= 400);
    if (!long.length) return;
    const useConveyor = w === 3 || (w === 5 && n % 2 === 0);
    const useWind = w === 4 || (w === 5 && n % 2 === 1);
    for (const s of long) {
      // Alternate a gentle assist with a gentle resistance so neither dominates the corridor.
      if (useConveyor) s.conveyor = (n + l.number) % 2 ? -40 : 55;
      if (useWind) {
        const force = (n + l.number) % 2 ? -70 : 90, width = Math.min(300, s.w - 80);
        l.winds.push({ x: s.x + Math.round((s.w - width) / 2), y: 0, w: width, h: 350, force, role: 'corridor-wind' });
      }
    }
  });
  if (w === 5) for (const s of l.platforms) if (s.role === 'combat-cover' && !inRoom(l, s.x)) { s.crumble = true; s.fallDelay = 0.55; }
}

const CHALLENGES = ['signs', 'puzzle', 'clean', 'memories'];
function setChallenge(l) {
  const type = CHALLENGES[(l.number - 1) % 4];
  const objects = l.objects.filter(o => !['sign', 'switch', 'retry'].includes(o.kind));
  if (type === 'signs') {
    // Signs sit on raised corridor ledges, high enough that they can only be lit from the ledge.
    const ledges = l.platforms.filter(s => s.y <= 300 && s.y >= 250 && !s.enabledBy && !inRoom(l, s.x) && s.x + s.w < finishX(l));
    // Interaction reach is 62 px vertically: 40 px above the ledge is out of reach from the floor (y 316).
    const spots = ledges.map(s => ({ x: s.x + Math.round(s.w / 2) - 13, y: s.y - 40 }));
    // Tutorial levels have fewer ledges: top up with signs on the safe ground of the corridors.
    for (const c of corridors(l)) for (const s of floorsIn(l, c)) if (spots.length < 3 && s.w >= 200) spots.push({ x: s.x + Math.round(s.w / 2) - 13, y: 318 });
    spots.sort((a, b) => a.x - b.x);
    const pick = spots.length <= 3 ? spots : [0, Math.floor(spots.length / 2), spots.length - 1].map(i => spots[i]);
    pick.forEach((s, i) => objects.push({ id: 'sign' + i, x: s.x, y: s.y, w: 26, h: 32, kind: 'sign', label: 'Biển hiệu', role: 'star-sign' }));
    l.challenge = `Bật cả ${pick.length} biển hiệu dọc đường`;
  } else if (type === 'puzzle') {
    // Switch A at the start of a corridor, B at its far end: 12 s to cross the courtyard.
    let best = null;
    for (const c of corridors(l)) {
      const floors = floorsIn(l, c);
      if (floors.length < 1) continue;
      const first = floors[0], last = floors[floors.length - 1];
      const ax = first.x + 40, bx = last.x + last.w - 70, span = bx - ax;
      if (span >= 300 && span <= 950 && (!best || span > best.span)) best = { ax, bx, span };
    }
    if (best) {
      objects.push({ id: 'switchA', x: best.ax, y: 318, w: 26, h: 32, kind: 'switch', label: 'Công tắc A', role: 'star-puzzle' });
      objects.push({ id: 'switchB', x: best.bx, y: 318, w: 26, h: 32, kind: 'switch', label: 'Công tắc B', role: 'star-puzzle' });
      l.challenge = 'Bật công tắc A rồi tới B trong 12 giây';
    } else return setFallback(l, objects);
  } else if (type === 'clean') {
    l.challengeStart = l.checkpoints.at(-1);
    objects.push({ id: 'retry', x: l.exit - 150, y: 318, w: 26, h: 32, kind: 'retry', label: 'Thử lại đoạn cuối', role: 'star-retry' });
    l.challenge = 'Không trúng đòn từ checkpoint cuối tới đích';
  } else return setFallback(l, objects);
  l.challengeType = type;
  l.objects = objects;
}
function setFallback(l, objects) {
  l.challengeType = 'memories';
  l.challengeStart = 999999;
  l.objects = objects;
  l.challenge = 'Thu ít nhất 70% xu trên các tuyến thưởng';
}

function goalHints(l) {
  for (const r of l.rooms) {
    const base = r.hint.split(' · ').slice(0, 2).join(' · ').replace(/ · (Bật|Lấy|Cứu) .*$/, '');
    const goal = l.objects.find(o => o.id === r.goal) || l.tokens.find(o => o.id === r.goal);
    if (!goal) continue;
    const verb = goal.visual === 'technician' ? 'Cứu' : l.tokens.includes(goal) ? 'Lấy' : 'Bật';
    const label = (goal.label || 'mục tiêu').replace(/^Cứu /, '');
    const where = goal.y <= 180 ? ' ở tầng trên' : goal.y <= 245 ? ' ở tầng giữa' : '';
    r.hint = `${base} · ${verb} ${label}${where} để mở cổng`;
  }
}

let changed = 0;
for (const l of levels) {
  if (l.tuning === TUNING) continue;
  addCheckpoints(l);
  addMechanics(l);
  setChallenge(l);
  goalHints(l);
  l.tuning = TUNING;
  changed++;
}

if (changed) fs.writeFileSync(file, source.slice(0, start) + JSON.stringify(levels) + source.slice(end));
const gaps = levels.map(l => { const p = [l.spawn[0], ...l.checkpoints, finishX(l)]; return Math.max(...p.slice(1).map((x, i) => x - p[i])); });
console.log(JSON.stringify({
  changed,
  maxCheckpointGap: Math.max(...gaps),
  levelsOverGap: levels.filter((l, i) => gaps[i] > MAX_CHECKPOINT_GAP).map(l => l.id),
  challenges: levels.reduce((m, l) => ((m[l.challengeType] = (m[l.challengeType] || 0) + 1), m), {}),
  conveyors: levels.filter(l => l.platforms.some(s => s.conveyor)).length,
  winds: levels.filter(l => l.winds.length).length,
  crumbleCover: levels.filter(l => l.platforms.some(s => s.crumble && s.role === 'combat-cover')).length,
}));
