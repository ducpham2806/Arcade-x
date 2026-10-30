// Property tests for game engines that had no logic coverage: 2048, Car Escape, Shikaku,
// Sudoku (Scoodoku), Fill the Space, Mummy Escape, Word Cross and Blocker. Each engine is
// bundled with esbuild and checked against rules and invariants rather than snapshots.
// Usage: node tests/games/engines.mjs
import { build } from 'esbuild';
import assert from 'node:assert/strict';
import fs from 'node:fs';

let checks = 0;
const test = async (name, run) => { await run(); checks++; console.log('PASS', name); };
async function load(entry) {
  const { outputFiles } = await build({ entryPoints: [entry], bundle: true, write: false, platform: 'node', format: 'esm', logLevel: 'silent', external: ['react', 'react-dom'] });
  return import('data:text/javascript;base64,' + Buffer.from(outputFiles[0].text + `\n// ${entry}`).toString('base64'));
}
const seeded = seed => () => { seed = (Math.imul(seed, 1664525) + 1013904223) >>> 0; return seed / 4294967296; };

// ---------------------------------------------------------------- 2048
const t2048 = await load('src/games/tile-2048/engine.ts');
await test('2048: slides merge each pair once, score merged values and report movement', () => {
  const { slideBoard } = t2048;
  const r = slideBoard([[2, 2, 2, 2], [4, 0, 4, 8], [0, 0, 0, 0], [2, 4, 8, 16]], 'LEFT');
  assert.deepEqual(r.grid, [[4, 4, 0, 0], [8, 8, 0, 0], [0, 0, 0, 0], [2, 4, 8, 16]]);
  assert.equal(r.points, 4 + 4 + 8); assert.equal(r.merges, 3); assert.equal(r.moved, true); assert.equal(r.maxTile, 16);
  assert.equal(slideBoard([[2, 4], [8, 16]], 'LEFT').moved, false);
  assert.deepEqual(slideBoard([[2, 0], [2, 4]], 'UP').grid, [[4, 4], [0, 0]]);
  assert.deepEqual(slideBoard([[0, 2, 2, 4], [0, 0, 0, 0], [0, 0, 0, 0], [0, 0, 0, 0]], 'RIGHT').grid[0], [0, 0, 4, 4]);
});
await test('2048: random boards conserve tile sum across all directions; spawns are seeded 2/4 into empty cells', () => {
  const { slideBoard, spawnBoardTile } = t2048; const rnd = seeded(7);
  for (let n = 0; n < 300; n++) {
    const g = Array.from({ length: 4 }, () => Array.from({ length: 4 }, () => rnd() < 0.4 ? 0 : 2 ** (1 + Math.floor(rnd() * 5))));
    const sum = g.flat().reduce((a, b) => a + b, 0);
    for (const d of ['UP', 'DOWN', 'LEFT', 'RIGHT']) assert.equal(slideBoard(g, d).grid.flat().reduce((a, b) => a + b, 0), sum);
  }
  const empty = [[2, 0], [0, 4]];
  const a = spawnBoardTile(empty, 99), b = spawnBoardTile(empty, 99);
  assert.deepEqual(a, b); assert.equal(a.spawned, true);
  const added = a.grid.flat().filter((v, i) => v !== empty.flat()[i]);
  assert.equal(added.length, 1); assert.ok([2, 4].includes(added[0]));
  assert.equal(spawnBoardTile([[2, 4], [8, 16]], 1).spawned, false);
});

// ---------------------------------------------------------------- Car Escape
const car = await load('src/games/car-escape/engine.ts');
const carLevels = JSON.parse(fs.readFileSync('src/games/car-escape/levels.json', 'utf8'));
await test(`Car Escape: all ${carLevels.length} campaign levels replay their stored solution to a win`, () => {
  for (const level of carLevels) {
    let vehicles = level.vehicles;
    for (const move of level.solution) { vehicles = car.applyMove(vehicles, level.size, move); assert.ok(vehicles, `level ${level.level}: illegal stored move`); }
    assert.ok(car.won(vehicles, level.size), `level ${level.level}: stored solution does not win`);
    assert.equal(level.solution.length, level.optimalMoves, `level ${level.level}: optimalMoves mismatch`);
  }
});
await test('Car Escape: solver matches optimal length on a sample and moves never overlap or leave the board', () => {
  for (const level of carLevels.filter((_, i) => i % 10 === 0)) {
    const s = car.solve(level, level.vehicles);
    assert.equal(s.status, 'solved'); assert.equal(s.moves.length, level.optimalMoves, `level ${level.level}`);
  }
  const level = carLevels[5];
  for (const move of car.legalMoves(level.vehicles, level.size)) {
    const next = car.applyMove(level.vehicles, level.size, move);
    const cells = new Set();
    for (const v of next) for (let k = 0; k < v.length; k++) {
      const r = v.row + (v.isHorizontal ? 0 : k), c = v.col + (v.isHorizontal ? k : 0);
      assert.ok(r >= 0 && c >= 0 && r < level.size && c < level.size, 'vehicle off board');
      assert.ok(!cells.has(r * 10 + c), 'vehicles overlap'); cells.add(r * 10 + c);
    }
  }
  assert.equal(car.applyMove(level.vehicles, level.size, { vehicleId: 0, to: 99 }), null);
});

// ---------------------------------------------------------------- Shikaku
const shikaku = await load('src/games/shikaku/rules.ts');
const shikakuGen = await load('src/games/shikaku/generator.ts');
const shikakuSave = await load('src/games/shikaku/save.ts');
await test('Shikaku: generated puzzles are deterministic per seed, tile the board and validate as solved', () => {
  for (let size = 4; size <= 10; size++) for (const seed of [1, 42, 2026]) {
    const p = shikakuGen.generateShikaku(size, 12, seed);
    assert.deepEqual(shikakuGen.generateShikaku(size, 12, seed), p);
    assert.ok(shikakuSave.validShikakuPuzzle(p), `size ${size} seed ${seed} invalid`);
    assert.ok(shikaku.solved(p, p.solution), `size ${size} seed ${seed}: solution not accepted`);
    const covered = new Set();
    for (const r of p.solution) for (let y = r.r; y < r.r + r.h; y++) for (let x = r.c; x < r.c + r.w; x++) { assert.ok(!covered.has(y * size + x)); covered.add(y * size + x); }
    assert.equal(covered.size, size * size);
    assert.equal(shikaku.solved(p, p.solution.slice(1)), false);
  }
});

// ---------------------------------------------------------------- Sudoku
const sudoku = await load('src/games/scoodoku/generator.ts');
await test('Sudoku: 4x4/6x6/9x9 boards have a unique solution consistent with the givens and box rules', () => {
  for (const [size, dim, bw, bh] of [['4x4', 4, 2, 2], ['6x6', 6, 3, 2], ['9x9', 9, 3, 3]]) for (const difficulty of ['easy', 'hard']) {
    const board = sudoku.generateSudokuBoard(size, difficulty, 12345);
    assert.equal(board.dimension, dim);
    const solution = board.cells.map(row => row.map(c => c.solutionValue));
    const givens = board.cells.map(row => row.map(c => (c.isGiven ? c.value : 0)));
    for (let i = 0; i < dim; i++) {
      assert.equal(new Set(solution[i]).size, dim, `${size} row ${i}`);
      assert.equal(new Set(solution.map(r => r[i])).size, dim, `${size} col ${i}`);
    }
    for (let br = 0; br < dim; br += bh) for (let bc = 0; bc < dim; bc += bw) {
      const box = []; for (let r = br; r < br + bh; r++) for (let c = bc; c < bc + bw; c++) box.push(solution[r][c]);
      assert.equal(new Set(box).size, dim, `${size} box ${br},${bc}`);
    }
    board.cells.flat().filter(c => c.isGiven).forEach(c => assert.equal(c.value, c.solutionValue));
    assert.equal(sudoku.countSudokuSolutions(givens, board.boxWidth, board.boxHeight, dim), 1, `${size} ${difficulty} not unique`);
    const filled = board.cells.map(row => row.map(c => ({ ...c, value: c.solutionValue })));
    assert.ok(sudoku.isBoardSolved(filled));
  }
});

// ---------------------------------------------------------------- Fill the Space
const fill = await load('src/games/fill-the-space/generator.ts');
await test('Fill the Space: campaign and zen levels have a solution that exactly fills the cavity', () => {
  const levels = [...Array.from({ length: 40 }, (_, i) => fill.generateProceduralLevel(i + 1)), ...[4, 5, 6, 8].map((d, i) => fill.generateZenLevel(d, i + 1))];
  for (const level of levels) {
    const cavity = new Set(level.cavityCells.map(([r, c]) => `${r},${c}`));
    assert.equal(cavity.size, level.totalCavityCells, `level ${level.levelNumber} cavity count`);
    const filled = new Set();
    for (const placement of level.solution) {
      const block = level.blocks.find(b => b.id === placement.blockId);
      assert.ok(block, `level ${level.levelNumber}: unknown block`);
      for (const [dr, dc] of block.cells) {
        const key = `${placement.position[0] + dr},${placement.position[1] + dc}`;
        assert.ok(cavity.has(key), `level ${level.levelNumber}: block outside cavity`);
        assert.ok(!filled.has(key), `level ${level.levelNumber}: blocks overlap`); filled.add(key);
      }
    }
    assert.equal(filled.size, cavity.size, `level ${level.levelNumber}: cavity not fully filled`);
  }
});

// ---------------------------------------------------------------- Mummy Escape
const mummyAI = await load('src/games/mummy-escape/mummyAI.ts');
const mummyLevels = await load('src/games/mummy-escape/levels.ts');
const mummyGen = await load('src/games/mummy-escape/proceduralGenerator.ts');
function solveMummy(level, maxDepth = 80, maxStates = 400000) {
  const start = {
    player: level.playerStart,
    mummies: level.mummies.map((m, i) => ({ id: `m${i}`, type: m.type, x: m.x, y: m.y, alive: true })),
    gates: (level.gates || []).map(g => ({ ...g })), keys: (level.keys || []).map(k => ({ ...k })), traps: (level.traps || []).map(t => ({ ...t })),
  };
  const key = s => JSON.stringify([s.player, s.mummies.map(m => [m.x, m.y, m.alive]), s.gates.map(g => g.isOpen), s.keys.map(k => k.collected), s.traps.map(t => t.triggered)]);
  let frontier = [start]; const seen = new Set([key(start)]);
  for (let depth = 1; depth <= maxDepth && frontier.length; depth++) {
    const next = [];
    for (const s of frontier) for (const dir of ['up', 'down', 'left', 'right', 'wait']) {
      const r = mummyAI.simulatePlayerAndMummiesTurn(s.player, dir, s.mummies, level.horizontalWalls, level.verticalWalls, s.gates, s.keys, s.traps, level.exitPos, level.gridSize);
      if (r.playerEscaped && !r.playerCaught) return depth;
      if (r.playerCaught) continue;
      const n = { player: r.nextPlayerPos, mummies: r.nextMummies, gates: r.nextGates, keys: r.nextKeys, traps: r.nextTraps };
      const k = key(n); if (seen.has(k)) continue; seen.add(k);
      if (seen.size > maxStates) return null;
      next.push(n);
    }
    frontier = next;
  }
  return null;
}
await test('Mummy Escape: walking into a mummy is caught and reaching the exit escapes', () => {
  const level = mummyLevels.CAMPAIGN_LEVELS[0];
  const r = mummyAI.simulatePlayerAndMummiesTurn(level.playerStart, 'wait', [], level.horizontalWalls, level.verticalWalls, [], [], [], level.playerStart, level.gridSize);
  assert.equal(r.playerEscaped, true, 'standing on the exit escapes');
  const p = { x: 2, y: 2 };
  const caught = mummyAI.simulatePlayerAndMummiesTurn(p, 'wait', [{ id: 'm', type: 'white', x: 4, y: 2, alive: true }], [], [], [], [], [], { x: 5, y: 5 }, { cols: 6, rows: 6 });
  assert.equal(caught.playerCaught, true, 'a white mummy two open cells away reaches the player in one turn');
});
await test(`Mummy Escape: all ${mummyLevels.CAMPAIGN_LEVELS.length} campaign chambers can be escaped under the real turn rules`, () => {
  const report = [];
  for (const level of mummyLevels.CAMPAIGN_LEVELS) {
    const turns = solveMummy(level);
    assert.ok(turns !== null, `chamber ${level.id} (${level.name}) has no escape`);
    report.push(`${level.id}:${turns}/${level.parTurns}`);
  }
  console.log('     turns/par:', report.join(' '));
});
await test('Mummy Escape: procedural and fallback chambers are escapable within their turn limit', () => {
  // Before the generator checked mummies, ~40% of these seeds produced chambers with no escape.
  for (let floor = 1; floor <= 10; floor++) for (let n = 0; n < 6; n++) {
    const level = mummyGen.generateProceduralChamber({ floor, seed: `engines-${floor}-${n}` });
    const turns = solveMummy(level);
    assert.ok(turns !== null, `procedural floor ${floor} seed ${n} has no escape`);
    assert.ok(turns <= level.maxTurns, `procedural floor ${floor} seed ${n}: needs ${turns} turns, limit ${level.maxTurns}`);
  }
  for (let size = 5; size <= 8; size++) assert.ok(solveMummy(mummyGen.fallbackChamber(1, size, size, 'Test')) !== null, `fallback ${size}x${size}`);
});

// ---------------------------------------------------------------- Word Cross
const lexicon = fs.readFileSync('public/games/word-cross/lexicon.v1.json');
globalThis.fetch = async () => new Response(lexicon, { headers: { 'Content-Type': 'application/json' } });
const words = await load('src/games/word-cross/engine.ts');
await words.loadLexicon();
await test('Word Cross: puzzles are seed-deterministic, words sit on straight paths and selecting them wins', () => {
  assert.ok(words.lexiconSize() > 10000);
  for (const level of [1, 40, 121, 200]) for (const seed of [3, 77]) {
    const p = words.generatePuzzle(level, seed);
    assert.deepEqual(words.generatePuzzle(level, seed), p);
    assert.equal(new Set(p.words.map(w => w.word)).size, p.words.length, 'duplicate words');
    for (const w of p.words) {
      assert.equal(w.path.map(({ r, c }) => p.grid[r][c]).join(''), w.word, `level ${level}: grid does not spell ${w.word}`);
      const dr = Math.sign(w.path[1].r - w.path[0].r), dc = Math.sign(w.path[1].c - w.path[0].c);
      w.path.forEach((cell, i) => { assert.equal(cell.r, w.path[0].r + dr * i); assert.equal(cell.c, w.path[0].c + dc * i); });
    }
    let run = { puzzle: p, found: [], attempts: [], mistakes: 0, hints: 0, elapsedMs: 1000, status: 'playing', ticket: null, owner: null, daily: null, practice: true };
    for (const w of p.words) {
      const a = w.path[0], b = w.path.at(-1);
      run = words.selectWord(run, { sr: a.r, sc: a.c, er: b.r, ec: b.c });
    }
    assert.equal(run.found.length, p.words.length);
    assert.equal(run.status, 'won', `level ${level} (${p.mode}) not won after finding every word`);
  }
});

// ---------------------------------------------------------------- Blocker
const blocker = await load('src/games/blocker/engine.ts');
await test('Blocker: pieces fit only on empty in-bounds cells and full rows/columns clear', () => {
  const board = blocker.blankBoard();
  assert.equal(board.length, 8); assert.ok(board.every(row => row.length === 8 && row.every(c => !c)));
  const bar = { matrix: [[1, 1, 1]], color: 1, gem: false };
  assert.equal(blocker.fits(board, bar, 0, 5), true);
  assert.equal(blocker.fits(board, bar, 0, 6), false, 'overflows the right edge');
  const s = blocker.createRun('free', 1, 1234);
  assert.deepEqual(blocker.createRun('free', 1, 1234).tray, s.tray, 'deal is seed-deterministic');
  const b2 = blocker.blankBoard();
  for (let c = 0; c < 8; c++) b2[3][c] = { color: 1, gem: c === 2, ice: 0 };
  for (let r = 0; r < 8; r++) b2[r][6] = { color: 2, gem: false, ice: r === 0 ? 1 : 0 };
  assert.equal(blocker.fits(b2, { matrix: [[1]], color: 1, gem: false }, 3, 0), false, 'cannot place on a filled cell');
  const cleared = blocker.clearLines(b2);
  assert.equal(cleared.lines, 2, 'one full row and one full column');
  assert.equal(cleared.gems, 1);
  assert.equal(cleared.cells.length, 8 + 8 - 1, 'the crossing cell counts once');
  assert.ok(b2[3].every((cell, c) => c === 6 ? true : !cell), 'row cleared');
  assert.deepEqual(b2[0][6], { color: 2, gem: false, ice: 0 }, 'iced cell loses one ice layer instead of clearing');
});
await test('Blocker: random free-mode play keeps the board 8x8 and never places on occupied cells', () => {
  const rnd = seeded(5);
  for (let game = 0; game < 20; game++) {
    const s = blocker.createRun('free', 1, 1000 + game);
    for (let turn = 0; turn < 60 && s.status === 'playing' && blocker.hasMove(s); turn++) {
      const options = s.tray.flatMap((p, i) => (p ? blocker.placements(s.board, p).map(pos => ({ i, ...pos })) : []));
      if (!options.length) break;
      const pick = options[Math.floor(rnd() * options.length)];
      const before = s.board.flat().filter(Boolean).length, size = s.tray[pick.i].matrix.flat().filter(Boolean).length;
      const event = blocker.place(s, pick.i, pick.r, pick.c);
      assert.ok(event !== null, 'listed placement was rejected');
      const after = s.board.flat().filter(Boolean).length;
      assert.ok(after <= before + size, 'cells appeared from nowhere');
      assert.ok(s.board.length === 8 && s.board.every(row => row.length === 8));
    }
  }
});

console.log(`game engines: ${checks} checks passed`);
