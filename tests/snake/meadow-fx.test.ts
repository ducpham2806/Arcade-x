import assert from 'node:assert/strict';
import fs from 'node:fs';
import { Engine, T } from '../../src/games/snake-legend/src/core';
import { capture } from '../../src/games/snake-legend/src/checkpoint';
import { meadowFxAssets } from '../../src/games/snake-legend/src/meadow-fx-assets';
import { MeadowEffects } from '../../src/games/snake-legend/src/meadow-fx';
import { meadowTheme } from '../../src/games/snake-legend/src/meadow-scenery';
import { STORY_LEVELS } from '../../src/games/snake-legend/src/story-data';
import { TRIALS } from '../../src/games/snake-legend/src/trials';

const texture = Buffer.from(meadowFxAssets.image.split(',')[1], 'base64');
assert(texture.equals(fs.readFileSync('art/snake-legend/meadow-fx/meadow-fx.webp')));
assert(texture.byteLength <= 72 * 1024);
assert.equal(meadowFxAssets.frames, 8);
assert.deepEqual(Object.keys(meadowFxAssets.rows), ['pickup','dash','gate','clear']);
assert.equal(new Set(TRIALS.map(trial => meadowTheme(trial.arena).ground)).size, 3);

const level = STORY_LEVELS[0];
const apple = level.story!.foods[0];
const arena = {
  ...level, start: {x: apple.x - 1.1, y: apple.y},
  story: {...level.story!, foods: [apple], target: 1, exit: {x: apple.x + 2, y: apple.y}},
};
const engine = new Engine(arena);
const fx = new MeadowEffects();
assert.deepEqual(fx.observe(engine, 0), []);
const steer = {x: 1, y: 0, dash: true};
let gate = false;
for (let n = 0; n < 60 && engine.status === 'running'; n++) {
  engine.step(steer);
  const snapshot = engine.status === 'running' ? capture(engine, 'meadow-vfx', []) : null;
  const active = fx.observe(engine, 0);
  if (snapshot) assert.deepEqual(capture(engine, 'meadow-vfx', []), snapshot);
  assert.deepEqual(fx.observe(engine, 0), active, 'same tick must not fire a second copy');
  if (engine.goalReady && !gate) {
    gate = true;
    assert.deepEqual(active.find(p => p.effect === 'gate')?.at, arena.story.exit);
    assert(active.some(p => p.effect === 'pickup'));
  }
  if (n === 0) assert.equal(active[0]?.effect, 'dash');
}
assert.equal(engine.status, 'won');
assert(gate);
assert(fx.observe(engine, .18).some(p => p.effect === 'clear'));
assert.deepEqual(fx.observe(engine, 2), []);
assert.deepEqual(fx.observe(new Engine(arena), 0), [], 'restart clears expired and pending effects');

const draws: number[][] = [];
let depth = 0;
const c = {
  save() { depth++; }, restore() { depth--; }, translate() {}, rotate() {},
  drawImage(_image: unknown, ...rects: number[]) { draws.push(rects); },
} as unknown as CanvasRenderingContext2D;
const image = {complete: true, naturalWidth: 512} as HTMLImageElement;
const e = new Engine(arena);
const sample = new MeadowEffects();
sample.observe(e, 0);
for (let i = 0; !e.goalReady && i < 20; i++) {
  e.step(steer);
  sample.observe(e, 0);
}
assert(e.goalReady);
sample.draw(c, image, e, 0, true);
const still = draws.splice(0);
for (let i = 0; i < T.hz / 10; i++) {
  e.step({...steer, dash: false});
  sample.observe(e, 0);
}
sample.draw(c, image, e, 0, true);
assert.equal(depth, 0);
assert.deepEqual(draws, still, 'reduced motion keeps the same atlas frame on advancing ticks');
assert.equal(still.length, 2, 'reduced motion draws pickup and gate with Dash sparks suppressed');
assert(!still.some(frame => frame[1] === meadowFxAssets.rows.dash * meadowFxAssets.cell));
draws.length = 0;
sample.draw(c, image, e, 0, false);
assert(draws.some(frame => frame[0] !== still.find(row => row[1] === frame[1])?.[0]));
assert.equal(depth, 0);
console.log('PASS meadow visuals: 32 packed frames, byte budget, 3 distinct course palettes, simulation-pure triggers, reduced stills, restart and expiry');
