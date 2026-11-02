import { test } from 'node:test';
import assert from 'node:assert/strict';
import { CONFIG, createState, tank, step, neutral, nextLesson, aimPath, canOccupy, validInput, botInput } from '../../src/games/tank-clash/engine.ts';
const run = (s, n, a = neutral(), b = neutral(Math.PI)) => { for (let i = 0; i < n; i++) step(s, { a, b }); };
const clean = () => { const s = createState('duel'); s.walls = []; return s; };
test('diagonal movement has the same speed as straight movement; boundaries are solid', () => {
  const a = clean(), b = clean(); a.tanks[0].x = b.tanks[0].x = 300;
  run(a, 30, { ...neutral(), x: 1 }); run(b, 30, { ...neutral(), x: 1, y: 1 });
  assert.ok(Math.abs(Math.hypot(b.tanks[0].x - 300, b.tanks[0].y - 240) - (a.tanks[0].x - 300)) < .001);
  run(a, 600, { ...neutral(), x: -1 }); assert.ok(a.tanks[0].x >= CONFIG.radius);
});
test('driving against a wall slides vertically and never overlaps steel', () => {
  const s = clean(); s.walls = [{ id: 1, x: 200, y: 40, w: 40, h: 400, hp: 999, kind: 'steel' }];
  s.tanks[0].x = 180; s.tanks[0].y = 100; run(s, 80, { ...neutral(), x: 1, y: 1 });
  assert.ok(s.tanks[0].x <= 184.001); assert.ok(s.tanks[0].y > 200); assert.ok(canOccupy(s, s.tanks[0].x, s.tanks[0].y, 'a'));
});
test('one projectile can deal damage only once', () => {
  const s = clean(); s.tanks[1].x = 230; step(s, { a: { ...neutral(), fire: true } }); run(s, 60);
  assert.equal(s.tanks[1].hp, 2); assert.equal(s.stats.hits, 1); assert.equal(s.bullets.length, 0);
});
test('cooldown and active projectile cap prevent spam', () => {
  const s = clean(); s.tanks[1].y = 400; run(s, 10, { ...neutral(), fire: true }); assert.equal(s.stats.shots, 1);
  run(s, 80, { ...neutral(), fire: true }); assert.ok(s.bullets.length <= CONFIG.maxBullets);
});
test('ricochet shares the preview path and can hit the owner', () => {
  const s = clean(); s.tanks[0].x = 200; s.tanks[0].y = 300; s.tanks[1].x = 600; s.tanks[1].y = 300;
  s.walls = [{ id: 1, x: 260, y: 140, w: 280, h: 40, kind: 'steel', hp: 999 }];
  const aim = Math.atan2(-234, 400); s.tanks[0].aim = aim;
  assert.equal(aimPath(s, s.tanks[0]).length, 3); step(s, { a: { ...neutral(aim), fire: true } }); run(s, 90);
  assert.equal(s.tanks[1].hp, 2); assert.equal(s.stats.ricochets, 1);
  const self = clean(); self.walls = [{ id: 1, x: 220, y: 100, w: 40, h: 280, kind: 'steel', hp: 999 }];
  step(self, { a: { ...neutral(), fire: true } }); run(self, 60); assert.equal(self.tanks[0].hp, 2);
});
test('brick absorbs bullets, is destroyed after two hits, and opens a drivable path', () => {
  const s = clean(); s.walls = [{ id: 1, x: 190, y: 220, w: 40, h: 40, kind: 'brick', hp: 2 }];
  run(s, 100, { ...neutral(), fire: true }); assert.equal(s.walls[0].hp, 0); assert.equal(s.stats.bricks, 1);
  assert.ok(canOccupy(s, 210, 240, 'a'));
});
test('shield blocks a projectile and cannot be immediately reused', () => {
  const s = clean(); s.tanks[1].x = 190; step(s, { b: { ...neutral(Math.PI), fire: true } });
  run(s, 8); step(s, { a: { ...neutral(), shield: true } }); run(s, 30);
  assert.equal(s.tanks[0].hp, 3); assert.equal(s.stats.blocks, 1); assert.ok(s.tanks[0].shieldCooldown > 6);
  run(s, 60, { ...neutral(), shield: true }); assert.equal(s.tanks[0].shield, 0);
});
test('friendly fire is off and same-tick mutual elimination draws', () => {
  const s = clean(); s.tanks[1].team = 0; s.tanks[1].x = 200; s.tanks.push(tank('c', 1, 700, 400));
  step(s, { a: { ...neutral(), fire: true } }); run(s, 30); assert.equal(s.tanks[1].hp, 3);
  const d = clean(); d.tanks[0].hp = d.tanks[1].hp = 1;
  d.bullets = [{ id: 9, owner: 'a', team: 0, x: 680, y: 240, vx: 340, vy: 0, age: 0, bounces: 0 }, { id: 10, owner: 'b', team: 1, x: 120, y: 240, vx: -340, vy: 0, age: 0, bounces: 0 }];
  step(d); assert.equal(d.status, 'roundEnd'); assert.equal(d.roundWinner, null); assert.deepEqual(d.scores, [0, 0]);
});
test('timeout compares surviving tanks, then HP; tied last round draws', () => {
  const s = clean(); s.remaining = 0; s.tanks[1].hp = 1; step(s); assert.equal(s.roundWinner, 0);
  const d = clean(); d.round = 3; d.remaining = 0; step(d); assert.equal(d.status, 'finished'); assert.equal(d.winner, null);
});
test('five lessons require their actual mechanic; direct fire cannot pass ricochet lesson', () => {
  const s = createState(); run(s, 50, { ...neutral(), x: 1 }); assert.ok(s.lessonDone); nextLesson(s);
  run(s, 60, { ...neutral(), fire: true }); assert.ok(s.lessonDone); nextLesson(s);
  run(s, 100, { ...neutral(), fire: true }); assert.equal(s.lessonDone, false);
  const aim = Math.atan2(-234, 400); run(s, 150, { ...neutral(aim), fire: true }); assert.ok(s.lessonDone); nextLesson(s);
  run(s, 100, { ...neutral(), fire: true }); assert.ok(s.lessonDone); nextLesson(s); assert.equal(s.lesson, 4);
  s.bullets = [{ id: 100, owner: 'b', team: 1, x: 345, y: 240, vx: -340, vy: 0, age: 0, bounces: 0 }];
  run(s, 10, { ...neutral(), shield: true }); assert.ok(s.lessonDone);
});
test('invalid inputs do not move or fire; replay is deterministic', () => {
  const s = clean(); const x = s.tanks[0].x; step(s, { a: { x: Infinity, y: 0, aim: 0, fire: true, shield: false } }); assert.equal(s.tanks[0].x, x); assert.equal(s.stats.shots, 0);
  assert.equal(validInput({ ...neutral(), aim: NaN }), false);
  const a = createState('duel'), b = createState('duel');
  for (let i = 0; i < 1200; i++) { const input = { ...neutral(Math.sin(i / 100)), x: Math.sin(i / 70), y: Math.cos(i / 70), fire: i % 48 === 0, shield: i % 400 === 0 }; step(a, { a: input, b: botInput(a) }); step(b, { a: input, b: botInput(b) }); }
  assert.deepEqual(a, b);
});
test('bot simulation runs through a full match without overlapping solid walls', () => {
  const s = createState('duel'); for (let i = 0; i < 12000 && s.status !== 'finished'; i++) { step(s, { a: neutral(), b: botInput(s) }); for (const a of s.tanks) if (a.hp > 0) assert.ok(canOccupy(s, a.x, a.y, a.id)); }
  assert.equal(s.status, 'finished'); assert.ok(s.events.length <= 60);
});
