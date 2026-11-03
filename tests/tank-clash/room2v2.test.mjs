// P3b: 2v2 rooms on the room host — seats/teams, host moves, per-player forfeit, surrender, spectators, rematch.
import { test } from 'node:test';
import assert from 'node:assert/strict';
import { createWorld, press } from './harness.mjs';
import { NET, PROTOCOL, parseClientMessage } from '../../src/games/tank-clash/protocol.ts';
import { CONFIG } from '../../src/games/tank-clash/engine.ts';

const names = ['An', 'Bình', 'Chi', 'Dũng'];
/** Host creates a 2v2 room; three more join. Fill order a, b, a2, b2. */
function lobby(world) {
  const [a, b, c, d] = names.map(n => world.client({}, n));
  a.session.create('An', '2v2'); world.run(30);
  for (const x of [b, c, d]) { x.session.join(a.session.code); world.run(30); }
  return { a, b, c, d, all: [a, b, c, d] };
}
function started(world) {
  const p = lobby(world);
  for (const x of p.all) x.session.ready(true);
  world.run(30); assert.equal(p.a.session.room.phase, 'countdown');
  world.run(NET.countdownMs + 50); assert.equal(p.a.session.room.phase, 'playing');
  return p;
}
const seatOf = (c, id) => c.session.room.seats.find(s => s.id === id);
const settle = () => new Promise(r => setImmediate(r)); // onResult runs on a microtask

test('protocol p3: new messages are strict; p2 clients are told to reload', () => {
  assert.equal(PROTOCOL, 'tank-clash.p3.v1');
  assert.equal(parseClientMessage({ type: 'move', seat: 'a', to: 'a' }), null);
  assert.equal(parseClientMessage({ type: 'move', seat: 'a', to: 'c' }), null);
  assert.ok(parseClientMessage({ type: 'move', seat: 'a2', to: 'b2' }));
  assert.equal(parseClientMessage({ type: 'team', to: 'b' }), null);
  assert.equal(parseClientMessage({ type: 'surrender', team: 1 }), null);
  assert.equal(parseClientMessage({ type: 'create', protocol: PROTOCOL, format: '3v3' }), null);
  assert.equal(parseClientMessage({ type: 'join', protocol: PROTOCOL, code: 'ABCDEF', as: 'admin' }), null);
  const world = createWorld(), old = world.client({}, 'Cũ');
  old.sendRaw({ type: 'create', protocol: 'tank-clash.p2.v1' }); world.run(20);
  assert.equal(old.last('error').code, 'PROTOCOL_MISMATCH');
});

test('2v2 lobby: fill order balances teams, no countdown until four are ready, fifth player is refused', () => {
  const world = createWorld(), { a, b, c, d, all } = lobby(world);
  assert.deepEqual(all.map(x => x.session.seat), ['a', 'b', 'a2', 'b2']);
  assert.equal(a.session.room.format, '2v2');
  assert.deepEqual(a.session.room.seats.map(s => [s.id, s.team, s.host]), [['a', 0, true], ['a2', 0, false], ['b', 1, false], ['b2', 1, false]]);
  for (const x of [a, b, c]) x.session.ready(true); world.run(50);
  assert.equal(a.session.room.phase, 'lobby', '3/4 ready does not start');
  const e = world.client({}, 'Em'); e.session.join(a.session.code); world.run(30);
  assert.equal(e.last('error').code, 'ROOM_FULL');
  d.session.leave(); world.run(30);
  assert.equal(a.session.room.seats.length, 3); assert.ok(a.session.room.seats.every(s => !s.ready), 'a leaver clears ready');
  a.session.leave(); world.run(30);
  assert.equal(seatOf(b, 'a2').host, true, 'host passes to the next seat in a, a2, b, b2 order');
});

test('team switch and host moves re-seat players and clear ready; only the host may move others', () => {
  const world = createWorld(), p = lobby(world);
  p.d.session.leave(); world.run(30);                         // b2 free
  p.c.session.ready(true); world.run(20);
  p.c.session.switchTeam(); world.run(30);                    // a2 → b2
  assert.equal(p.c.session.seat, 'b2'); assert.equal(seatOf(p.a, 'b2').name, 'Chi'); assert.equal(seatOf(p.a, 'b2').ready, false);
  p.b.session.switchTeam(); world.run(30);                    // b → a2 (only free seat on team 0)
  assert.equal(p.b.session.seat, 'a2');
  p.c.session.switchTeam(); world.run(30);                    // team 0 (a, a2) is full
  assert.equal(p.c.last('error').code, 'TEAM_FULL'); assert.equal(p.c.session.seat, 'b2');
  p.c.session.move('a', 'b'); world.run(30);
  assert.equal(p.c.last('error').code, 'NOT_HOST');
  for (const x of [p.a, p.b, p.c]) x.session.ready(true); world.run(20);
  p.a.session.move('a2', 'b2'); world.run(30);                // swap Bình (a2) and Chi (b2)
  assert.equal(p.b.session.seat, 'b2'); assert.equal(p.c.session.seat, 'a2');
  assert.ok(p.a.session.room.seats.every(s => !s.ready), 'lineup change clears everyone');
  p.a.session.move('a', 'b'); world.run(30);                  // host moves self to the empty seat b
  assert.equal(p.a.session.seat, 'b'); assert.equal(seatOf(p.b, 'b').host, true, 'host follows the player, not the seat');
});

test('2v2 match: four human tanks on a seeded Crossfire arena; each input drives only its own tank', () => {
  const world = createWorld(), p = started(world);
  const s = world.host.inspect(p.a.session.code);
  assert.equal(s.mode, 'squad'); assert.equal(s.online, true); assert.equal(typeof s.map.seed, 'number');
  assert.deepEqual(s.tanks.map(t => [t.id, t.team, t.kind]), [['a', 0, 'player'], ['a2', 0, 'player'], ['b', 1, 'player'], ['b2', 1, 'player']]);
  const before = s.tanks.map(t => [t.x, t.y]);
  world.run(500, () => { p.c.session.tick(press({ y: -1 })); for (const x of [p.a, p.b, p.d]) x.session.tick(press()); });
  assert.ok(s.tanks[1].y < before[1][1] - 30, 'a2 moved'); for (const i of [0, 2, 3]) assert.deepEqual([s.tanks[i].x, s.tanks[i].y], before[i]);
  const v = p.d.session.view(world.time);
  assert.equal(v.mode, 'squad'); assert.equal(v.width, 1040); assert.equal(v.tanks[0].id, 'b2', 'own tank first in the view');
  assert.equal(p.d.session.team, 1);
});

test('per-player forfeit: a leaver is out for the rest of the match, the team-mate plays on, a fully gone team loses', async () => {
  const results = [], world = createWorld({ hostOptions: { onResult: r => results.push(r) } }), p = started(world);
  const s = world.host.inspect(p.a.session.code);
  p.d.session.leave(); world.run(50);                          // b2 leaves
  assert.equal(p.a.session.room.phase, 'playing');
  assert.deepEqual(s.out, ['b2']); assert.equal(s.tanks[3].hp, 0); assert.equal(seatOf(p.a, 'b2').forfeited, true);
  s.tanks[0].hp = 0; s.tanks[1].hp = 0; world.run(50);           // team 1 wins round 1
  world.run(2500);
  assert.equal(s.round, 2); assert.equal(s.tanks.find(t => t.id === 'b2').hp, 0, 'still out after the reset');
  p.b.session.leave(); world.run(50);                          // b leaves too → team 1 gone
  await settle();
  assert.equal(results.length, 1); const r = results[0];
  assert.equal(r.reason, 'forfeit'); assert.equal(r.winner, 0); assert.equal(r.format, '2v2'); assert.equal(typeof r.seed, 'number');
  assert.deepEqual(r.players.map(x => [x.seat, x.team, x.forfeited]), [['a', 0, false], ['a2', 0, false], ['b', 1, true], ['b2', 1, true]]);
  assert.equal(p.a.session.result.reason, 'forfeit');
  assert.deepEqual(p.a.session.room.seats.map(x => x.id), ['a', 'a2'], 'leavers free their seats at the result');
});

test('seat hold per player: one expired seat → out but match continues; it cannot resume; all four expiring together cancels', async () => {
  const world = createWorld(), p = started(world), s = world.host.inspect(p.a.session.code);
  p.c.drop(); world.run(NET.seatHoldMs + 100, () => { for (const x of [p.a, p.b, p.d]) x.session.tick(press()); });
  assert.equal(p.a.session.room.phase, 'playing'); assert.deepEqual(s.out, ['a2']); assert.equal(seatOf(p.a, 'a2').forfeited, true);
  world.reconnect(p.c); p.c.session.resume(); world.run(50);
  assert.equal(p.c.last('error').code, 'RESUME_INVALID');
  const results = [], w2 = createWorld({ hostOptions: { onResult: r => results.push(r) } }), q = started(w2);
  for (const x of q.all) x.drop();
  w2.run(NET.seatHoldMs + 100); await settle();
  assert.equal(results.length, 1); assert.equal(results[0].reason, 'cancelled'); assert.equal(results[0].winner, null);
});

test('surrender: refused while a team-mate is still playing; allowed once you are the last one; other team wins', async () => {
  const results = [], world = createWorld({ hostOptions: { onResult: r => results.push(r) } }), p = started(world);
  p.a.session.surrender(); world.run(30);
  assert.equal(p.a.last('error').code, 'SURRENDER_DENIED'); assert.equal(p.a.session.room.phase, 'playing');
  p.c.drop(); world.run(50);                                   // a2 disconnected (not yet expired) counts as inactive
  p.a.session.surrender(); world.run(30); await settle();
  assert.equal(results.length, 1); assert.equal(results[0].reason, 'surrender'); assert.equal(results[0].winner, 1);
  assert.equal(p.b.session.result.reason, 'surrender');
  p.b.session.surrender(); world.run(30); assert.equal(p.b.last('error').code, 'WRONG_PHASE');
});

test('spectators: join mid-match, get the arena and snapshots, cannot act, are not counted; limit applies', () => {
  const world = createWorld(), p = started(world);
  const sp = world.client({}, 'Xem'); sp.session.join(p.a.session.code, 'Xem', 'spectator'); world.run(200);
  const joined = sp.last('joined');
  assert.equal(joined.role, 'spectator'); assert.equal(joined.seat, null); assert.ok(joined.walls.length > 0); assert.ok(joined.snapshot);
  assert.equal(p.a.session.room.spectators, 1); assert.equal(p.a.session.room.seats.length, 4);
  const v = sp.session.view(world.time); assert.equal(v.tanks.length, 4); assert.equal(v.tanks[0].id, 'a');
  const snaps = sp.inbox.filter(m => m.type === 'snapshot').length; assert.ok(snaps >= 3, `spectator got ${snaps} snapshots`);
  sp.sendRaw({ type: 'input', seq: 0, inputs: [press({ x: 1 })] }); sp.session.ready(true); world.run(30);
  assert.equal(sp.last('error').code, 'SPECTATOR');
  const extra = [1, 2, 3, 4].map(i => world.client({}, `X${i}`)); extra.forEach((x, i) => { x.session.join(p.a.session.code, `X${i}`, 'spectator'); world.run(20); });
  assert.equal(extra[3].last('error').code, 'SPECTATORS_FULL');
  sp.session.leave(); world.run(30); assert.equal(sp.last('left').type, 'left'); assert.equal(p.a.session.room.spectators, 3);
  // a dropped spectator re-watches on reconnect
  extra[0].drop(); world.run(20); assert.equal(p.a.session.room.spectators, 2);
  world.reconnect(extra[0]); extra[0].session.resume(); world.run(50); assert.equal(extra[0].last('joined').role, 'spectator');
});

test('rematch after a 2v2 result needs all four ready; new match id and arena seed', async () => {
  const results = [], world = createWorld({ hostOptions: { onResult: r => results.push(r) } }), p = started(world);
  const s = world.host.inspect(p.a.session.code); s.scores[0] = 1;
  s.tanks[2].hp = 0; s.tanks[3].hp = 0; world.run(100); await settle();
  assert.equal(results.length, 1); assert.equal(results[0].reason, 'score'); assert.equal(results[0].winner, 0);
  for (const x of [p.a, p.b, p.c]) x.session.ready(true); world.run(50);
  assert.notEqual(p.a.session.room.phase, 'countdown');
  p.d.session.ready(true); world.run(NET.countdownMs + 100);
  assert.equal(p.a.session.room.phase, 'playing');
  assert.notEqual(p.a.session.matchId, results[0].matchId);
  assert.notEqual(world.host.inspect(p.a.session.code).map.seed, results[0].seed);
  assert.equal(world.host.inspect(p.a.session.code).round, 1); assert.ok(CONFIG.maxRounds >= 2);
});
