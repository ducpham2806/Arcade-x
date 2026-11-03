// Tank Clash P3b: 2v2 with four clients on the virtual network (P3-SPEC §7.2, §8.4, criterion D1).
// RTT 80/150/250 ms, jitter 30 ms, loss 1–3 % (modelled as TCP retransmission). Virtual time; this is not a
// substitute for real devices on real networks.
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
/** Scripted player: wanders, aims at the nearest living enemy it sees, fires in bursts, sometimes shields. */
function scripted(session, n, phase) {
  const v = session.view(); if (!v) return press();
  const me = v.tanks[0], foes = v.tanks.filter(t => t.team !== me.team && t.hp > 0);
  if (!foes.length) return press();
  const foe = foes.reduce((p, t) => Math.hypot(t.x - me.x, t.y - me.y) < Math.hypot(p.x - me.x, p.y - me.y) ? t : p);
  const aim = Math.atan2(foe.y - me.y, foe.x - me.x) + Math.sin(n / 37 + phase) * 0.15;
  return press({ x: Math.cos(n / 53 + phase), y: Math.sin(n / 41 + phase * 2), aim, fire: (n + phase * 7) % 23 === 0, shield: n % 400 === 120 });
}
function startSquad(world, net) {
  const cs = ['A', 'B', 'C', 'D'].map(name => world.client(net, name));
  cs[0].session.create(undefined, '2v2'); world.run(800);
  for (const c of cs.slice(1)) { c.session.join(cs[0].session.code); world.run(800); }
  for (const c of cs) c.session.ready(true);
  world.run(NET.countdownMs + 1500);
  for (const c of cs) assert.equal(c.session.room.phase, 'playing');
  return cs;
}
const pct = (list, p) => { const e = [...list].sort((x, y) => x - y); return e.length ? +e[Math.min(e.length - 1, Math.floor(e.length * p))].toFixed(1) : 0; };

for (const profile of PROFILES) {
  test(`2v2 full match under ${profile.name}: four clients agree with the server; bandwidth within budget`, { timeout: 180_000 }, async () => {
    const results = [];
    const world = createWorld({ seed: profile.rtt + 1, hostOptions: { onResult: r => results.push(r) } });
    const cs = startSquad(world, profile), code = cs[0].session.code;
    const at = { t: world.time, down: cs.map(c => c.bytesDown), up: cs.map(c => c.bytesUp) };
    const visualError = []; let n = 0, maxStep = 0, last = new Map(), lastRound = 1;
    const deadline = CONFIG.maxRounds * (CONFIG.roundSeconds + 3) * 1000;
    for (let elapsed = 0; elapsed < deadline && !cs[0].session.result; elapsed += 1000) {
      world.run(1000, () => {
        n++; cs.forEach((c, i) => { if (n % 60 === i) c.session.ping(); c.session.tick(scripted(c.session, n, i)); });
        const v = cs[0].session.view(world.time), truth = world.host.inspect(code); if (!v || !truth) return;
        for (const t of v.tanks.slice(1)) { // the three tanks client A does not predict
          const real = truth.tanks.find(x => x.id === t.id);
          if (v.status === 'playing' && v.round === lastRound && t.hp > 0) {
            visualError.push(Math.hypot(t.x - real.x, t.y - real.y));
            const prev = last.get(t.id); if (prev) maxStep = Math.max(maxStep, Math.hypot(t.x - prev.x, t.y - prev.y));
          }
          last.set(t.id, { x: t.x, y: t.y });
        }
        if (v.round !== lastRound) last = new Map(); lastRound = v.round;
      });
    }
    world.run(profile.rtt * 4 + 800); await new Promise(r => setImmediate(r));
    const seconds = (world.time - at.t) / 1000;
    assert.equal(results.length, 1, 'server reported one result');
    const server = results[0];
    assert.equal(server.reason, 'score'); assert.equal(server.format, '2v2');
    for (const c of cs) { // D1: every client shows the server's result
      assert.equal(c.session.result.matchId, server.matchId);
      assert.deepEqual(c.session.result.scores, server.scores);
      assert.equal(c.session.result.winner, server.winner);
    }
    const frameTravel = CONFIG.speed / CONFIG.hz;
    assert.ok(maxStep < frameTravel * 2.5, `remote tank step ${maxStep.toFixed(2)} px vs ${frameTravel.toFixed(2)} px/frame`);
    const down = cs.map((c, i) => (c.bytesDown - at.down[i]) / seconds / 1024), up = cs.map((c, i) => (c.bytesUp - at.up[i]) / seconds / 1024);
    assert.ok(Math.max(...down) < 20, `download KB/s ${down.map(x => x.toFixed(2))} (PLAN §9 ceiling 20)`);
    const stats = cs.map(c => c.session.stats);
    console.log(JSON.stringify({ profile: profile.name, seconds: +seconds.toFixed(1), result: server.scores.join(':'), rounds: server.rounds,
      downKBps: +Math.max(...down).toFixed(2), upKBps: +Math.max(...up).toFixed(2), corrections: stats.map(s => s.corrections), phaseCorrections: stats.map(s => s.phaseCorrections),
      maxCorrectionPx: +Math.max(...stats.map(s => s.maxCorrection)).toFixed(1), remoteVisualErrorPx: { mean: +(visualError.reduce((p, q) => p + q, 0) / visualError.length).toFixed(1), p95: pct(visualError, .95) },
      maxRemoteStepPx: +maxStep.toFixed(2), rttMs: stats[0].rtt === null ? null : Math.round(stats[0].rtt) }));
  });
}

test('2v2 reconnect mid-round under loss: same seat b2, match continues, all four agree on the result', { timeout: 180_000 }, async () => {
  const results = [], profile = PROFILES[1];
  const world = createWorld({ seed: 23, hostOptions: { onResult: r => results.push(r) } });
  const cs = startSquad(world, profile), d = cs[3];
  assert.equal(d.session.seat, 'b2');
  let n = 0; const play = ms => world.run(ms, () => { n++; cs.forEach((c, i) => c.session.tick(scripted(c.session, n, i))); });
  play(4000);
  d.drop(); play(3000);
  world.reconnect(d, profile); d.session.resume(); play(1500);
  assert.equal(d.session.seat, 'b2'); assert.equal(d.session.room.phase, 'playing');
  assert.equal(world.host.inspect(d.session.code).tanks.length, 4, 'no duplicate tank');
  for (let i = 0; i < 200 && !cs[0].session.result; i++) play(1000);
  world.run(1500); await new Promise(r => setImmediate(r));
  assert.equal(results.length, 1);
  for (const c of cs) assert.deepEqual(c.session.result, results[0]);
});
