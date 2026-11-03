// P3b network-condition tests for 2v2: four clients through the virtual network (RTT 80/150/250, jitter 30,
// loss 1–3 %). Proves agreement and budgets under modelled delay; not a substitute for real devices.
import { test } from 'node:test';
import assert from 'node:assert/strict';
import { createWorld, press } from './harness.mjs';
import { NET } from '../../src/games/tank-clash/protocol.ts';
import { CONFIG } from '../../src/games/tank-clash/engine.ts';

const PROFILES = [
  { name: 'rtt80-j30-l1', rtt: 80, jitter: 30, loss: 0.01 },
  { name: 'rtt150-j30-l2', rtt: 150, jitter: 30, loss: 0.02 },
  { name: 'rtt250-j30-l3', rtt: 250, jitter: 30, loss: 0.03 },
];
/** Scripted player: weaves, aims at the nearest visible enemy, fires in bursts, sometimes shields. */
function scripted(session, n, phase) {
  const v = session.view(); if (!v) return press();
  const me = v.tanks[0], foes = v.tanks.filter(t => t.team !== me.team && t.hp > 0);
  const foe = foes.sort((p, q) => Math.hypot(p.x - me.x, p.y - me.y) - Math.hypot(q.x - me.x, q.y - me.y))[0] ?? me;
  const aim = Math.atan2(foe.y - me.y, foe.x - me.x) + Math.sin(n / 37 + phase) * 0.15;
  const ahead = me.team ? -1 : 1; // drift toward the other side so fights happen
  return press({ x: Math.max(-1, Math.min(1, Math.cos(n / 53 + phase) * 0.8 + ahead * 0.35)), y: Math.sin(n / 41 + phase * 2), aim, fire: n % 19 === 0, shield: n % 400 === 120 });
}
function startSquad(world, net) {
  const players = ['A', 'B', 'C', 'D'].map(n => world.client(net, n));
  players[0].session.create('A', '2v2'); world.run(800);
  for (const p of players.slice(1)) { p.session.join(players[0].session.code); world.run(800); }
  for (const p of players) p.session.ready(true);
  world.run(NET.countdownMs + 1500);
  for (const p of players) assert.equal(p.session.room.phase, 'playing');
  return players;
}

for (const profile of PROFILES) {
  test(`2v2 match under ${profile.name}: four clients agree with the server; bandwidth and prediction within budget`, { timeout: 180_000 }, async () => {
    const results = [], world = createWorld({ seed: profile.rtt + 1, hostOptions: { onResult: r => results.push(r) } });
    const players = startSquad(world, profile), [a] = players, code = a.session.code;
    const start = { t: world.time, down: players.map(p => p.bytesDown), up: players.map(p => p.bytesUp) };
    const visualError = []; let n = 0;
    // Corrections are classified with the server history of the last ~0.7 s: touching another tank (prediction cannot
    // know where a moving tank will be when the server applies our input), a brick breaking, or free movement — the
    // last must stay as clean as 1v1.
    const prev = players.map(() => 0), contact = players.map(() => 0), brick = players.map(() => 0), free = players.map(() => 0), hist = [];
    const deadline = CONFIG.maxRounds * (CONFIG.roundSeconds + 3) * 1000;
    for (let elapsed = 0; elapsed < deadline && !a.session.result; elapsed += 1000) {
      world.run(1000, () => {
        n++; players.forEach((p, i) => { if (n % 60 === 0) p.session.ping(); p.session.tick(scripted(p.session, n, i * 1.7)); });
        const truth0 = world.host.inspect(code);
        if (truth0) { hist.push({ tanks: truth0.tanks.map(t => ({ id: t.id, x: t.x, y: t.y, hp: t.hp })), bricks: truth0.walls.filter(w => w.kind === 'brick' && w.hp > 0).length }); if (hist.length > 40) hist.shift(); }
        players.forEach((p, k) => { const c = p.session.stats.corrections; if (c > prev[k] && hist.length) {
          const id = p.session.seat, d = Math.min(...hist.flatMap(h => { const me = h.tanks.find(t => t.id === id); return h.tanks.filter(t => t.id !== id && t.hp > 0).map(t => Math.hypot(t.x - me.x, t.y - me.y)); }));
          const bucket = d < 40 ? contact : hist[0].bricks !== hist[hist.length - 1].bricks ? brick : free; bucket[k] += c - prev[k]; } prev[k] = c; });
        const v = a.session.view(world.time), truth = world.host.inspect(code);
        if (!v || !truth || v.status !== 'playing' || v.round !== truth.round) return;
        for (const t of v.tanks.slice(1)) { const real = truth.tanks.find(x => x.id === t.id); if (real && real.hp > 0) visualError.push(Math.hypot(t.x - real.x, t.y - real.y)); }
      });
    }
    world.run(profile.rtt * 4 + 500); await new Promise(r => setImmediate(r));
    const seconds = (world.time - start.t) / 1000;
    assert.equal(results.length, 1, 'one server result');
    const server = results[0];
    assert.equal(server.format, '2v2');
    for (const p of players) {
      assert.equal(p.session.result.matchId, server.matchId);
      assert.deepEqual(p.session.result.scores, server.scores);
      assert.equal(p.session.result.winner, server.winner);
    }
    const down = players.map((p, i) => (p.bytesDown - start.down[i]) / seconds / 1024), up = players.map((p, i) => (p.bytesUp - start.up[i]) / seconds / 1024);
    assert.ok(Math.max(...down) < 30, `download KB/s ${down.map(x => x.toFixed(1))}`); // spec §5.3: revisit delta snapshots above 30 KB/s
    const corr = players.map(p => ({ n: p.session.stats.corrections, mean: +(p.session.stats.totalCorrection / Math.max(1, p.session.stats.corrections)).toFixed(1), max: +p.session.stats.maxCorrection.toFixed(1) }));
    console.log(JSON.stringify({ profile: profile.name, corr, contact, brick, free }));
    assert.ok(Math.max(...free) <= 3, `corrections away from other tanks ${free}`);
    assert.ok(corr.every(c => c.max < 48), `a correction reached teleport size: ${JSON.stringify(corr)}`);
    const e = [...visualError].sort((x, y) => x - y);
    console.log(JSON.stringify({ profile: profile.name, seconds: +seconds.toFixed(1), result: server.scores.join(':'), reason: server.reason, rounds: server.rounds,
      downKBps: +Math.max(...down).toFixed(2), upKBps: +Math.max(...up).toFixed(2), corrections: players.map(p => p.session.stats.corrections),
      phaseCorrections: players.map(p => p.session.stats.phaseCorrections),
      otherTanksVisualErrorPx: { mean: +(e.reduce((p, q) => p + q, 0) / e.length).toFixed(1), p95: +e[Math.floor(e.length * .95)].toFixed(1) } }));
  });
}

test('2v2 reconnect under loss: dropped player returns to the same seat and team; everyone agrees on the result', { timeout: 180_000 }, async () => {
  const results = [], profile = PROFILES[1], world = createWorld({ seed: 23, hostOptions: { onResult: r => results.push(r) } });
  const players = startSquad(world, profile), c = players[2];
  let n = 0; const play = ms => world.run(ms, () => { n++; players.forEach((p, i) => p.session.tick(scripted(p.session, n, i * 1.7))); });
  play(4000);
  c.drop(); play(3000);
  world.reconnect(c, profile); c.session.resume(); play(1500);
  assert.equal(c.session.seat, 'a2'); assert.equal(c.session.team, 0); assert.equal(c.session.room.phase, 'playing');
  assert.equal(c.session.view(world.time).tanks[0].id, 'a2');
  for (let i = 0; i < 200 && !players[0].session.result; i++) play(1000);
  world.run(1500); await new Promise(r => setImmediate(r));
  assert.equal(results.length, 1);
  for (const p of players) assert.deepEqual(p.session.result, players[0].session.result);
});
