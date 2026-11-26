import assert from 'node:assert/strict';
import { AMBER_LEVELS, DAWN_LEVELS } from '../../src/games/snake-legend/src/campaign-levels';
import { Engine, T, distance, sweepRect, type Arena, type Input } from '../../src/games/snake-legend/src/core';
import { STORY_LEVELS } from '../../src/games/snake-legend/src/story-data';
import { bossSteering, steer } from './campaign-driver';

function play(arena: Arena) {
  const engine = new Engine(arena);
  const story = arena.story!;
  const guide = story.guide.slice(1);
  // The temple uses the same six-hit pattern in a wider court.
  const boss = story.goal === 'boss' ? bossSteering(engine, 3, {x: 4, y: 3}) : undefined;
  const phases: number[] = [];
  let waypoint = 0;
  let input: Input = {x: 1, y: 0, dash: false};
  while (engine.status === 'running' && engine.tick < T.hz * 200) {
    if (engine.encounters?.tutorialPending) {
      phases.push(engine.encounters.phase);
      // Same explicit acknowledgement as starting the next phase in Story.
      engine.encounters.tutorialPending = false;
    }
    if (boss) input = boss();
    else if (engine.tick % 9 === 0) {
      if (distance(engine.pos, guide[waypoint]) < .65 && waypoint + 1 < guide.length) waypoint++;
      input = steer(engine, guide[waypoint]);
    }
    engine.step(input);
  }
  return {engine, phases};
}

const closedGateApproaches = [
  [[17,40],[18,32],[15,27],[12.5,25],[12.5,17]],
  [[14,46],[18,46],[26,43],[30,39],[30,27],[29,18],[28,18],[19,18]],
];

function checkClosedGate(arena: Arena, chapterIndex: number) {
  const gate = arena.story!.gate!;
  const engine = new Engine(arena);
  const targets = closedGateApproaches[chapterIndex].map(([x,y]) => ({x,y}));
  let waypoint = 0;
  while (engine.status === 'running' && engine.tick < T.hz * 25 && engine.wallContacts < 4) {
    if (distance(engine.pos, targets[waypoint]) < .65 && waypoint + 1 < targets.length) waypoint++;
    engine.step(steer(engine, targets[waypoint]));
  }
  assert(!engine.switchOn && !engine.goalReady);
  assert.equal(engine.status, 'running');
  assert.equal(waypoint, targets.length - 1);
  assert(engine.wallContacts >= 4);
  const gateFace = chapterIndex === 0 ? gate.y + gate.h : gate.x + gate.w;
  const position = chapterIndex === 0 ? engine.pos.y : engine.pos.x;
  assert(Math.abs(position - (gateFace + T.headRadius)) < .01);
}

const originalStory = JSON.stringify(STORY_LEVELS);
const ids = new Set(STORY_LEVELS.map(arena => arena.id));
assert.equal(AMBER_LEVELS.length, 5);
assert.equal(DAWN_LEVELS.length, 5);
const results = [AMBER_LEVELS, DAWN_LEVELS].flatMap((chapter, chapterIndex) => chapter.map((arena, index) => {
  const story = arena.story!;
  assert.equal(story.id, `${chapterIndex + 2}-${index + 1}`);
  assert.equal(story.order, index);
  assert.equal(arena.id, 19 + chapterIndex * 5 + index);
  assert(!ids.has(arena.id));
  ids.add(arena.id);
  const blocks = [...arena.walls, ...arena.water, ...arena.spikes];
  for (const rect of [...blocks, ...(story.bridges ?? []), ...(story.gate ? [story.gate] : [])]) {
    assert(rect.x >= 0 && rect.y >= 0 && rect.w > 0 && rect.h > 0
      && rect.x + rect.w <= arena.w + 1e-9 && rect.y + rect.h <= arena.h + 1e-9, story.id);
  }
  for (const p of [arena.start, ...story.guide, ...story.foods, story.exit, ...(story.switch ? [story.switch] : [])]) {
    assert(p.x > T.headRadius && p.y > T.headRadius && p.x < arena.w - T.headRadius && p.y < arena.h - T.headRadius, story.id);
    assert(!blocks.some(rect => sweepRect(p, {x:0,y:0}, T.headRadius, rect)), `${story.id} landmark blocks at ${p.x},${p.y}`);
  }
  const {engine, phases} = play(arena);
  assert.equal(engine.status, 'won', `${story.id} at ${engine.tick} ticks`);
  assert.deepEqual(engine.stars, [true, true, true], story.id);
  assert.equal(engine.wallContacts, 0, story.id);
  assert.equal(engine.hits, 0, story.id);
  if (story.goal === 'eat') assert(engine.collected >= story.target);
  if (story.goal === 'length') assert(engine.length >= story.target);
  if (story.goal === 'collect') assert(engine.flowers >= story.target);
  if (story.goal === 'puzzle') {
    assert(engine.switchOn && engine.goalReady);
    checkClosedGate(arena, chapterIndex);
  }
  if (story.star3.kind === 'trap') assert(engine.encounters!.trapped.size >= story.star3.value);
  if (story.star3.kind === 'noPoison') assert.equal(engine.poisonHits, 0);
  if (story.goal === 'pass') {
    const bridges = story.bridges!;
    assert.deepEqual([...engine.passed], bridges.map(bridge => bridge.id));
    assert(bridges.every(bridge => bridge.h > 2 * T.headRadius + 1.5));
    const failed = new Engine(arena);
    const bridge = bridges[0];
    const offDeck = {x: bridge.x + bridge.w / 2, y: bridge.y + bridge.h + 3};
    while (failed.status === 'running' && failed.tick < T.hz * 15) failed.step(steer(failed, offDeck));
    assert.equal(failed.status, 'lost');
    assert.match(failed.lastEvent, /Rơi khỏi cầu/);
  }
  if (story.goal === 'timed_collect') {
    assert.equal(engine.time, 45);
    assert(engine.secret && engine.collected >= 12);
  }
  if (story.goal === 'boss') {
    assert.equal(engine.encounters!.totalHits, 6);
    assert.equal(engine.encounters!.state, 'defeated');
    assert.deepEqual(phases, [2, 3]);
  }
  return {level: story.id, goal: story.goal, seconds: Number(engine.time.toFixed(2)), hearts: engine.hearts, stars: 3};
}));
assert.equal(JSON.stringify(STORY_LEVELS), originalStory);
console.log('PASS campaign chapters 2–3: 10 actual clears, 30 stars, bridge loss, gated access, jade and spider traps, six boss hits, intact R01 levels');
console.table(results);
