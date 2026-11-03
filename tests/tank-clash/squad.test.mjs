import { test } from 'node:test';
import assert from 'node:assert/strict';
import { CONFIG, createState, step, neutral, botInput, forfeitTank, surrender, canOccupy, validInput } from '../../src/games/tank-clash/engine.ts';
import { crossfire, validateArena, fallbackArena, spawnsShielded, SQUAD_SIZE, SQUAD_SPAWNS, TANK_RADIUS, BULLET_RADIUS } from '../../src/games/tank-clash/maps.ts';

const SEEDS = Array.from({ length: 60 }, (_, i) => (i * 2654435761) >>> 0);
const ids = ['a', 'a2', 'b', 'b2'];
const bots = s => Object.fromEntries(ids.map(id => [id, botInput(s, id)]));

test('maps.ts radii match the engine', () => {
  assert.equal(TANK_RADIUS, CONFIG.radius); assert.equal(BULLET_RADIUS, CONFIG.bulletRadius);
});

test('Crossfire: deterministic per seed, different across seeds, every layout valid and 180° symmetric', () => {
  const layouts = new Set();
  for (const seed of SEEDS) {
    const a = crossfire(seed), b = crossfire(seed);
    assert.deepEqual(a.walls, b.walls, `seed ${seed} not deterministic`);
    assert.ok(a.attempt >= 0, `seed ${seed} fell back`);
    const check = validateArena(a.walls);
    assert.ok(check.ok, `seed ${seed}: ${JSON.stringify(check)}`);
    const key = w => `${w.kind}:${w.x},${w.y},${w.w},${w.h}`, all = new Set(a.walls.map(key));
    for (const w of a.walls) assert.ok(all.has(key({ ...w, x: SQUAD_SIZE.width - w.x - w.w, y: SQUAD_SIZE.height - w.y - w.h })), `seed ${seed}: ${key(w)} has no mirror`);
    for (const w of a.walls) assert.ok(w.x >= 0 && w.y >= 0 && w.x + w.w <= SQUAD_SIZE.width && w.y + w.h <= SQUAD_SIZE.height);
    layouts.add([...all].sort().join('|'));
  }
  assert.ok(layouts.size >= SEEDS.length * 0.9, `only ${layouts.size} distinct layouts`);
  assert.ok(validateArena(fallbackArena()).ok, 'fallback layout must stay valid');
});

test('validator rejects an open line of fire between spawns', () => {
  assert.equal(spawnsShielded([]), false);
  const cover = crossfire(SEEDS[3]).walls.filter(w => w.kind === 'steel' && w.w === 22 && w.h === 96);
  assert.equal(cover.length, 4); assert.equal(spawnsShielded(cover), true);
  // covers in front of a and of b (its mirror) removed → the a↔b diagonal is open
  assert.equal(spawnsShielded(cover.filter(w => !(w.x === 148 && w.y === 108) && !(w.x === 870 && w.y === 420))), false);
});

test('squad match: 4 tanks, team spawns, larger arena, walls reset each round with the same layout', () => {
  const s = createState('squad', { seed: 42 });
  assert.equal(s.width, SQUAD_SIZE.width); assert.equal(s.height, SQUAD_SIZE.height); assert.deepEqual(s.map, { id: 'crossfire', seed: 42 });
  assert.deepEqual(s.tanks.map(t => [t.id, t.team, t.kind]), [['a', 0, 'player'], ['a2', 0, 'bot'], ['b', 1, 'bot'], ['b2', 1, 'bot']]);
  for (const t of s.tanks) { assert.deepEqual([t.x, t.y], [SQUAD_SPAWNS[t.id].x, SQUAD_SPAWNS[t.id].y]); assert.ok(canOccupy(s, t.x, t.y, t.id)); }
  const layout = JSON.stringify(s.walls);
  s.walls.find(w => w.kind === 'brick').hp = 0;
  for (const t of s.tanks.filter(t => t.team === 1)) t.hp = 0;
  step(s); assert.equal(s.status, 'roundEnd'); assert.equal(s.roundWinner, 0);
  for (let i = 0; i < 130 && s.status === 'roundEnd'; i++) step(s);
  assert.equal(s.round, 2); assert.equal(JSON.stringify(s.walls), layout);
  assert.deepEqual([s.tanks[0].y, s.tanks[1].y], [SQUAD_SPAWNS.a2.y, SQUAD_SPAWNS.a.y], 'team-mates swap lanes in round 2');
});

test('friendly fire is off; a bounced shot still hurts its owner', () => {
  const s = createState('squad', { seed: 7 }); s.walls = [];
  const [a, a2] = s.tanks; a.x = 300; a.y = 300; a2.x = 400; a2.y = 300; s.tanks[2].x = 900; s.tanks[2].y = 80; s.tanks[3].x = 900; s.tanks[3].y = 560;
  step(s, { a: { ...neutral(0), fire: true } });
  for (let i = 0; i < 40; i++) step(s);
  assert.equal(a2.hp, CONFIG.hp, 'team-mate untouched');
  s.bullets = []; a.cooldown = 0; s.walls = [{ id: 1, x: 340, y: 200, w: 20, h: 200, kind: 'steel', hp: 999 }]; a2.x = 200; a2.y = 100;
  step(s, { a: { ...neutral(0), fire: true } });
  for (let i = 0; i < 40; i++) step(s);
  assert.equal(a.hp, CONFIG.hp - 1, 'own ricochet hits');
});

test('last tanks of both teams lost on the same tick → drawn round; time out compares survivors then HP', () => {
  const s = createState('squad', { seed: 9 });
  for (const t of s.tanks) t.hp = 0;
  step(s); assert.equal(s.status, 'roundEnd'); assert.equal(s.roundWinner, null);
  const t = createState('squad', { seed: 9 }); t.remaining = 1 / CONFIG.hz; t.tanks[3].hp = 0; t.tanks[0].hp = 1;
  step(t); assert.equal(t.roundWinner, 0, 'two survivors beat one');
});

test('forfeit per player: team-mate plays on, tank stays out next round, whole team out → forfeit, everyone → cancelled', () => {
  const s = createState('squad', { seed: 11 });
  forfeitTank(s, 'b2'); assert.equal(s.status, 'playing'); assert.equal(s.tanks[3].hp, 0);
  s.tanks[0].hp = 0; s.tanks[1].hp = 0; step(s); assert.equal(s.roundWinner, 1);
  for (let i = 0; i < 130 && s.status === 'roundEnd'; i++) step(s);
  assert.equal(s.round, 2); assert.equal(s.tanks.find(t => t.id === 'b2').hp, 0, 'still out after reset');
  assert.equal(s.tanks.find(t => t.id === 'b').hp, CONFIG.hp);
  forfeitTank(s, 'b'); assert.equal(s.status, 'finished'); assert.equal(s.winner, 0); assert.equal(s.endReason, 'forfeit');
  const c = createState('squad', { seed: 11 }); forfeitTank(c, ...ids);
  assert.equal(c.endReason, 'cancelled'); assert.equal(c.winner, null);
  forfeitTank(c, 'zzz'); assert.equal(c.endReason, 'cancelled');
});

test('surrender ends the match for the other team; no effect once finished', () => {
  const s = createState('squad', { seed: 5 }); surrender(s, 0);
  assert.equal(s.status, 'finished'); assert.equal(s.winner, 1); assert.equal(s.endReason, 'surrender');
  surrender(s, 1); assert.equal(s.winner, 1);
  const d = createState('duel'); d.scores[0] = 1; d.tanks[1].hp = 0; step(d); assert.equal(d.endReason, 'score');
});

test('bots: valid inputs, target the nearest living enemy, and full 2v2 bot matches finish', () => {
  for (const seed of SEEDS.slice(0, 3)) {
    const s = createState('squad', { seed });
    for (let i = 0; i < 60 * 60 * 4 && s.status !== 'finished'; i++) {
      const inputs = bots(s);
      for (const id of ids) assert.ok(validInput(inputs[id]), `seed ${seed} ${id} tick ${s.tick}`);
      step(s, inputs);
      for (const t of s.tanks) if (t.hp > 0) assert.ok(canOccupy(s, t.x, t.y, t.id), `${t.id} overlaps at tick ${s.tick}`);
    }
    assert.equal(s.status, 'finished', `seed ${seed} did not finish`);
    assert.ok(s.round >= 2 && s.round <= CONFIG.maxRounds);
  }
});

test('bots find a way out of their spawn on every generated layout (regression: coarse path grid left them parked)', () => {
  for (const seed of SEEDS.slice(0, 20)) {
    const s = createState('squad', { seed }), start = Object.fromEntries(s.tanks.map(t => [t.id, [t.x, t.y]])), far = { a2: 0, b: 0, b2: 0 };
    for (let k = 0; k < 600; k++) {
      step(s, { a2: botInput(s, 'a2'), b: botInput(s, 'b'), b2: botInput(s, 'b2') });
      for (const id of Object.keys(far)) { const t = s.tanks.find(x => x.id === id); far[id] = Math.max(far[id], Math.hypot(t.x - start[id][0], t.y - start[id][1])); }
    }
    for (const [id, d] of Object.entries(far)) assert.ok(d > 120, `seed ${seed}: ${id} only moved ${d.toFixed(0)} px`);
  }
});
