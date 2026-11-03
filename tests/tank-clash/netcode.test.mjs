// P2 network-condition tests (PLAN §9): RTT 80/150/250 ms, jitter 30 ms, loss 1–3 %.
// Virtual time, deterministic seeds. This proves protocol/netcode behaviour under modelled delay; it is
// not a substitute for real devices on real networks (see docs/tank-clash/P2-review.md).
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
/** Scripted player: strafes on a pattern, aims at the opponent it sees, fires in bursts, sometimes shields. */
function scripted(session, n, phase) {
  const v = session.view(); if (!v) return press();
  const me = v.tanks[0], other = v.tanks[1];
  const aim = Math.atan2(other.y - me.y, other.x - me.x) + Math.sin(n / 37 + phase) * 0.15;
  return press({ x: Math.cos(n / 53 + phase), y: Math.sin(n / 41 + phase * 2), aim, fire: n % 23 === 0, shield: n % 400 === 120 });
}
function startMatch(world, net) {
  const a = world.client(net, 'A'), b = world.client(net, 'B');
  a.session.create(); world.run(800);
  b.session.join(a.session.code); world.run(800);
  a.session.ready(true); b.session.ready(true); world.run(NET.countdownMs + 1200);
  assert.equal(a.session.room.phase, 'playing'); assert.equal(b.session.room.phase, 'playing');
  return { a, b };
}

for (const profile of PROFILES) {
  test(`full match under ${profile.name}: clients agree with the server, prediction converges, bandwidth within budget`, { timeout: 120_000 }, async () => {
    const results = [];
    const world = createWorld({ seed: profile.rtt, hostOptions: { onResult: r => results.push(r) } });
    const { a, b } = startMatch(world, profile);
    const bytesAt = { a: a.bytesDown, b: b.bytesDown, t: world.time };
    const visualError = []; let n = 0, maxOpponentStep = 0, lastOpp = null, lastRound = 1;
    const deadline = CONFIG.maxRounds * (CONFIG.roundSeconds + 3) * 1000;
    // Play until the server reports a result (or the 3-round time limit passes).
    for (let elapsed = 0; elapsed < deadline && !a.session.result; elapsed += 1000) {
      world.run(1000, () => {
        n++; if (n % 60 === 0) { a.session.ping(); b.session.ping(); } a.session.tick(scripted(a.session, n, 0)); b.session.tick(scripted(b.session, n, 2));
        const v = a.session.view(world.time); if (!v) return;
        const opp = v.tanks[1], truth = world.host.inspect(a.session.code)?.tanks[1];
        if (truth && v.status === 'playing' && v.round === lastRound) visualError.push(Math.hypot(opp.x - truth.x, opp.y - truth.y));
        if (lastOpp && v.round === lastRound && v.status === 'playing') maxOpponentStep = Math.max(maxOpponentStep, Math.hypot(opp.x - lastOpp.x, opp.y - lastOpp.y));
        lastOpp = { x: opp.x, y: opp.y }; lastRound = v.round;
      });
    }
    world.run(profile.rtt * 4 + 500); await new Promise(r => setImmediate(r));
    const seconds = (world.time - bytesAt.t) / 1000;
    assert.equal(results.length, 1, 'server reported one result');
    const server = results[0];
    assert.ok(['score'].includes(server.reason), `match ended by ${server.reason}`);
    for (const c of [a, b]) {
      assert.equal(c.session.result.matchId, server.matchId);
      assert.deepEqual(c.session.result.scores, server.scores);
      assert.equal(c.session.result.winner, server.winner);
    }
    // Remote tank rendering is smooth: no per-frame jump bigger than ~2.5 frames of full speed.
    const frameTravel = CONFIG.speed / CONFIG.hz;
    assert.ok(maxOpponentStep < frameTravel * 2.5, `opponent step ${maxOpponentStep.toFixed(2)} px vs ${frameTravel.toFixed(2)} px/frame`);
    // Bandwidth: server → client average must stay under the 20 KB/s per client ceiling (PLAN §9).
    const kbps = { a: (a.bytesDown - bytesAt.a) / seconds / 1024, b: (b.bytesDown - bytesAt.b) / seconds / 1024 };
    assert.ok(kbps.a < 20 && kbps.b < 20, JSON.stringify(kbps));
    // Prediction: during live play the own tank is (almost) never corrected; round ends/deaths are counted apart.
    assert.ok(a.session.stats.corrections <= 3 && b.session.stats.corrections <= 3, `live corrections a=${a.session.stats.corrections} b=${b.session.stats.corrections}`);
    const up = a.bytesUp / seconds / 1024;
    const s = a.session.stats, meanCorrection = s.corrections ? s.totalCorrection / s.corrections : 0;
    console.log(JSON.stringify({ profile: profile.name, seconds: +seconds.toFixed(1), result: server.scores.join(':'), rounds: server.rounds,
      downKBps: +kbps.a.toFixed(2), upKBps: +up.toFixed(2), snapshots: s.snapshots, teleports: s.teleports, phaseCorrections: s.phaseCorrections, corrections: s.corrections,
      meanCorrectionPx: +meanCorrection.toFixed(2), maxCorrectionPx: +s.maxCorrection.toFixed(2), pendingMax: s.pendingMax,
      opponentVisualErrorPx: (() => { const e = [...visualError].sort((x, y) => x - y); return { mean: +(e.reduce((p, q) => p + q, 0) / e.length).toFixed(1), p95: +e[Math.floor(e.length * .95)].toFixed(1) }; })(),
      rttMs: s.rtt === null ? null : +s.rtt.toFixed(0), maxOpponentStepPx: +maxOpponentStep.toFixed(2) }));
  });
}

test('prediction: own tank responds immediately and settles exactly on the server position once input stops', () => {
  const profile = PROFILES[2];
  const world = createWorld({ seed: 3 });
  const { a, b } = startMatch(world, profile);
  const state = world.host.inspect(a.session.code);
  const before = a.session.view().tanks[0].x;
  world.run(1000 / 60 * 2, () => a.session.tick(press({ y: 1 })));
  const v = a.session.view(); assert.ok(v.tanks[0].y > 240.5, 'moved locally before any server round trip');
  assert.equal(v.tanks[0].x, before);
  // Drive into the steel pillar region and along walls, then stop.
  world.run(3000, () => { a.session.tick(press({ x: 1, y: 0.4 })); b.session.tick(press({ aim: Math.PI })); });
  world.run(1500, () => { a.session.tick(press()); b.session.tick(press({ aim: Math.PI })); });
  const mine = a.session.view(world.time).tanks[0], truth = state.tanks[0];
  assert.ok(Math.hypot(mine.x - truth.x, mine.y - truth.y) < 0.05, `predicted ${mine.x},${mine.y} vs server ${truth.x},${truth.y}`);
  // RTT + jitter + one TCP retransmission stall (loss) + snapshot/batch intervals.
  const bound = Math.ceil((profile.rtt + 2 * profile.jitter + Math.max(200, profile.rtt * 1.5)) / (1000 / 60)) + 12;
  assert.ok(a.session.pendingCount <= bound, `pending ${a.session.pendingCount} > ${bound}`);
});

test('reconnect mid-round under loss: same seat, match continues, everyone agrees on the result', { timeout: 120_000 }, async () => {
  const results = [];
  const profile = PROFILES[1];
  const world = createWorld({ seed: 11, hostOptions: { onResult: r => results.push(r) } });
  const { a, b } = startMatch(world, profile);
  let n = 0;
  const play = ms => world.run(ms, () => { n++; a.session.tick(scripted(a.session, n, 0)); b.session.tick(scripted(b.session, n, 2)); });
  play(5000);
  const hpBefore = world.host.inspect(a.session.code).tanks[0].hp;
  a.drop(); play(2500);
  world.reconnect(a, profile); a.session.resume(); play(1500);
  assert.equal(a.session.seat, 'a'); assert.equal(a.session.room.phase, 'playing');
  assert.ok(world.host.inspect(a.session.code).tanks[0].hp <= hpBefore, 'reconnect never restores HP');
  for (let i = 0; i < 200 && !a.session.result; i++) play(1000);
  world.run(1500); await new Promise(r => setImmediate(r));
  assert.equal(results.length, 1);
  assert.deepEqual(a.session.result, b.session.result);
  assert.equal(a.session.result.matchId, results[0].matchId);
});
