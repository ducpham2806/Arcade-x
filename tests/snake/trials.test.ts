import assert from 'node:assert/strict';
import { ARENAS, Engine, T, angleDelta, distance, sweepRect, type Input, type V } from '../../src/games/snake-legend/src/core';
import { CHECKPOINT_KEY } from '../../src/games/snake-legend/src/checkpoint';
import { STORY_LEVELS } from '../../src/games/snake-legend/src/story-data';
import { CAMPAIGN_KEY } from '../../src/games/snake-legend/src/story-save';
import { loadTrialProgress, saveTrialProgress, TRIAL_SAVE_KEY, TRIALS, trialForArena, type TrialCourse } from '../../src/games/snake-legend/src/trials';
import { snakeAccountStorage } from '../../src/games/snake-legend/integration/storage-scope';

function steer(engine: Engine, target: V): Input {
  const x = target.x - engine.pos.x, y = target.y - engine.pos.y;
  const magnitude = Math.hypot(x, y);
  return {x: x / magnitude, y: y / magnitude, dash: false};
}

function runRoute(course: TrialCourse, speedGoal: boolean, interval: number) {
  const engine = new Engine(course.arena);
  const crossings = new Set<number>();
  let input: Input = {x: 1, y: 0, dash: false};
  while (engine.status === 'running' && engine.tick < 60 * T.hz) {
    if (engine.tick % interval === 0) {
      const target = course.guide[engine.collected];
      input = steer(engine, target);
      if (speedGoal) {
        // Reserve room to release Dash before the next turn, even with delayed steering.
        input.dash = distance(engine.pos, target) > 2 + T.dashSpeed * interval * T.dt
          && Math.abs(angleDelta(engine.heading, Math.atan2(input.y, input.x))) < .15
          && engine.energy > 14;
      }
    }
    engine.step(input);
    for (const [i, bridge] of course.bridges.entries()) {
      if (Math.abs(engine.pos.x - (bridge.x + bridge.w / 2)) <= T.headRadius
        && engine.pos.y >= bridge.y + T.headRadius && engine.pos.y <= bridge.y + bridge.h - T.headRadius) crossings.add(i);
    }
  }
  assert.equal(engine.status, 'won', course.arena.name);
  assert.equal(engine.hearts, 3, course.arena.name);
  assert.equal(engine.wallContacts + engine.selfHits, 0, course.arena.name);
  assert.equal(engine.collected, course.arena.route.length);
  assert.equal(engine.length, course.arena.length + course.arena.route.length);
  assert.equal(crossings.size, course.bridges.length);
  if (speedGoal) assert(engine.dashDistance > 0 && engine.time <= course.parSeconds, course.arena.name + ' optional Dash time');
  else assert.equal(engine.dashDistance, 0, course.arena.name + ' can finish at regular speed');
  return engine.time.toFixed(2);
}

const installed = new Set([...ARENAS, ...STORY_LEVELS].map(arena => arena.id));
const results = TRIALS.map((course, index) => {
  const {arena, bridges, guide} = course;
  assert(!installed.has(arena.id));
  installed.add(arena.id);
  assert.equal(trialForArena(arena.id), course);
  assert.equal(arena.story, undefined);
  assert.equal(arena.duration, undefined);
  assert.equal(guide.length, arena.route.length);
  assert.equal(arena.route.length, [10,12,15,12,15,18][index]);
  const obstacles = [...arena.walls, ...arena.water, ...arena.spikes];
  for (const point of [arena.start, ...arena.route]) {
    assert(point.x >= T.headRadius && point.x <= arena.w - T.headRadius
      && point.y >= T.headRadius && point.y <= arena.h - T.headRadius);
    assert(!obstacles.some(obstacle => sweepRect(point, {x: 0, y: 0}, T.headRadius, obstacle)), arena.name);
  }
  for (const deck of bridges) {
    assert(deck.h >= 2 * T.headRadius + 2);
    assert(arena.water.every(water =>
      Math.min(deck.x + deck.w, water.x + water.w) - Math.max(deck.x, water.x) <= 1e-9
        || Math.min(deck.y + deck.h, water.y + water.h) - Math.max(deck.y, water.y) <= 1e-9));
  }
  if (arena.water.length) {
    const engine = new Engine(arena), first = bridges[0], water = arena.water[0];
    const offDeck = first ? {x: first.x + first.w / 2, y: first.y - 3.5}
      : {x: water.x + water.w / 2, y: water.y + water.h / 2};
    while (engine.status === 'running' && engine.tick < 20 * T.hz) engine.step(steer(engine, offDeck));
    assert.equal(engine.status, 'lost');
    assert.match(engine.lastEvent, /Rơi khỏi cầu/);
  }
  if (arena.patrols) {
    const engine = new Engine(arena);
    while (engine.hearts === 3 && engine.tick < 10 * T.hz) {
      const nearest = engine.patrols().sort((a, b) => distance(engine.pos, a) - distance(engine.pos, b))[0];
      engine.step(steer(engine, nearest));
    }
    assert.equal(engine.hearts, 2, 'aiming at a moving hazard must cost a heart');
  }
  return {
    course: arena.name,
    normal: runRoute(course, false, 12),
    dash: runRoute(course, true, 8),
    par: course.parSeconds,
  };
});

const files = new Map<string,string>([[CAMPAIGN_KEY,'campaign'], [CHECKPOINT_KEY,'checkpoint']]);
const store = {getItem: (key: string) => files.get(key) ?? null, setItem: (key: string, value: string) => { files.set(key,value); }};
const ownerA = snakeAccountStorage(store, 'A'), ownerB = snakeAccountStorage(store, 'B');
store.setItem(TRIAL_SAVE_KEY, '{"version":1,"arena":99,"best":[-1,"12",0]}');
assert.deepEqual(loadTrialProgress(store), {arena:0,best:[null,null,null,null,null,null]});
store.setItem(TRIAL_SAVE_KEY, '{"version":1,"arena":1,"best":[15,21,null]}');
assert.deepEqual(loadTrialProgress(store), {arena:1,best:[15,21,null,null,null,null]});
saveTrialProgress(store, {arena:0,best:[15,null,null]});
saveTrialProgress(store, {arena:1,best:[18,20,null]});
saveTrialProgress(store, {arena:1,best:[null,17,null]});
assert.deepEqual(loadTrialProgress(store), {arena:1,best:[15,17,null,null,null,null]});
saveTrialProgress(ownerA, {arena:5,best:[9,10,11,19,18,25]});
assert.deepEqual(loadTrialProgress(ownerA), {arena:5,best:[9,10,11,19,18,25]});
saveTrialProgress(ownerA, {arena:2,best:[8,12,null]});
assert.deepEqual(loadTrialProgress(ownerA), {arena:2,best:[8,10,11,19,18,25]});
assert.deepEqual(loadTrialProgress(ownerB), {arena:0,best:[null,null,null,null,null,null]});
assert.deepEqual(loadTrialProgress(store), {arena:1,best:[15,17,null,null,null,null]});
assert.equal(store.getItem(CAMPAIGN_KEY),'campaign');
assert.equal(store.getItem(CHECKPOINT_KEY),'checkpoint');
console.log('PASS six trials: clean routes, all bridge crossings, lake and off-deck loss, patrol damage, optional Dash times and compatible isolated records');
console.table(results);
