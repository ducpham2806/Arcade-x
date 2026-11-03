// Tank Clash P3b: 2v2 rooms, teams, spectators, per-player forfeit, surrender, rematch (P3-SPEC §3.4, §5, §8.2).
import { test } from 'node:test';
import assert from 'node:assert/strict';
import { createWorld, press } from './harness.mjs';
import { NET, PROTOCOL, parseClientMessage } from '../../src/games/tank-clash/protocol.ts';

const settle = () => new Promise(r => setImmediate(r));
/** Host creates a 2v2 room; three more players join in order. Seats fill a, b, a2, b2 (alternating teams). */
function fullLobby(world) {
  const [a, b, a2, b2] = ['An', 'Bình', 'Chi', 'Dũng'].map(name => world.client({}, name));
  a.session.create(undefined, '2v2'); world.run(30);
  for (const c of [b, a2, b2]) { c.session.join(a.session.code); world.run(30); }
  return { a, b, a2, b2, all: [a, b, a2, b2] };
}
function startedSquad(world) {
  const p = fullLobby(world);
  for (const c of p.all) c.session.ready(true);
  world.run(50); assert.equal(p.a.session.room.phase, 'countdown');
  world.run(NET.countdownMs + 50);
  for (const c of p.all) assert.equal(c.session.room.phase, 'playing');
  return p;
}
const seatOf = (c, id) => c.session.room.seats.find(s => s.id === id);

test('protocol p3: version moved on; unknown fields, bad formats, bad teams and seats are rejected', () => {
  assert.equal(PROTOCOL, 'tank-clash.p3.v1');
  assert.equal(parseClientMessage({ type: 'create', protocol: PROTOCOL, format: '3v3' }), null);
  assert.equal(parseClientMessage({ type: 'create', protocol: PROTOCOL, seat: 'b' }), null, 'extra field');
  assert.equal(parseClientMessage({ type: 'ready', ready: true, hp: 3 }), null, 'extra field');
  assert.equal(parseClientMessage({ type: 'team', team: 2 }), null);
  assert.equal(parseClientMessage({ type: 'move', seat: 'c', team: 0 }), null);
  assert.equal(parseClientMessage({ type: 'join', protocol: PROTOCOL, code: 'ABCDEF', as: 'admin' }), null);
  assert.ok(parseClientMessage({ type: 'move', seat: 'b2', team: 0 }));
  assert.ok(parseClientMessage({ type: 'join', protocol: PROTOCOL, code: 'ABCDEF', as: 'spectator' }));
  // A P2 client is told to reload instead of joining with an incompatible wire.
  const world = createWorld(); const old = world.client();
  old.sendRaw({ type: 'create', protocol: 'tank-clash.p2.v1' }); world.run(20);
  assert.equal(old.last('error').code, 'PROTOCOL_MISMATCH');
});

test('2v2 lobby: four seats fill alternating teams; a fifth player is refused; 1v1 rooms keep two seats', () => {
  const world = createWorld();
  const { a, b, a2, b2 } = fullLobby(world);
  assert.deepEqual([a, b, a2, b2].map(c => c.session.seat), ['a', 'b', 'a2', 'b2']);
  assert.deepEqual(a.session.room.seats.map(s => [s.id, s.team, s.host]), [['a', 0, true], ['a2', 0, false], ['b', 1, false], ['b2', 1, false]]);
  assert.equal(a.session.room.format, '2v2'); assert.equal(b2.session.myTeam, 1);
  const late = world.client(); late.session.join(a.session.code); world.run(30); assert.equal(late.session.error.code, 'ROOM_FULL');
  const duel = world.client(); duel.session.create(); world.run(30); assert.equal(duel.session.room.format, '1v1');
});

test('teams: switching moves your seat and clears your ready; full team refused; host move clears everyone; no start short-handed', () => {
  const world = createWorld();
  const [a, b, c] = ['An', 'Bình', 'Chi'].map(n => world.client({}, n));
  a.session.create(undefined, '2v2'); world.run(30); b.session.join(a.session.code); world.run(30); c.session.join(a.session.code); world.run(30);
  assert.equal(c.session.seat, 'a2');
  c.session.ready(true); world.run(30); assert.equal(seatOf(a, 'a2').ready, true);
  c.session.team(1); world.run(30);
  assert.equal(c.session.seat, 'b2', 'client learns its new seat'); assert.equal(seatOf(a, 'b2').ready, false);
  assert.equal(seatOf(a, 'a2'), undefined);
  b.session.team(1); world.run(30); assert.equal(b.session.error, null, 'already on that team: no-op');
  a.session.team(1); world.run(30); assert.equal(a.session.error.code, 'TEAM_FULL');
  // Three players, all ready: no countdown (needs 2 + 2).
  for (const p of [a, b, c]) p.session.ready(true); world.run(NET.countdownMs + 50); assert.equal(a.session.room.phase, 'lobby');
  // Only the host may move others; a move clears every ready flag.
  b.session.move('b2', 0); world.run(30); assert.equal(b.session.error.code, 'NOT_HOST');
  a.session.move('b2', 0); world.run(30);
  assert.equal(c.session.seat, 'a2'); assert.ok(a.session.room.seats.every(s => !s.ready), 'everyone confirms again');
  // Host moving itself keeps host rights on the new seat.
  a.session.team(1); world.run(30); assert.equal(a.session.seat, 'b2'); assert.equal(seatOf(b, 'b2').host, true);
});

test('2v2 match: four human tanks, no bots, each client drives only its own tank; team changes are locked in play', () => {
  const world = createWorld();
  const { a, b, a2, b2, all } = startedSquad(world);
  const s = world.host.inspect(a.session.code);
  assert.equal(s.mode, 'squad'); assert.equal(s.online, true); assert.equal(s.width, 1040);
  assert.deepEqual(s.tanks.map(t => [t.id, t.team, t.kind]), [['a', 0, 'player'], ['a2', 0, 'player'], ['b', 1, 'player'], ['b2', 1, 'player']]);
  const start = Object.fromEntries(s.tanks.map(t => [t.id, { x: t.x, y: t.y }]));
  world.run(400, () => { b2.session.tick(press({ y: 1 })); for (const c of [a, b, a2]) c.session.tick(press()); });
  const moved = s.tanks.filter(t => Math.hypot(t.x - start[t.id].x, t.y - start[t.id].y) > 1).map(t => t.id);
  assert.deepEqual(moved, ['b2']);
  for (const c of all) { const v = c.session.view(); assert.equal(v.tanks.length, 4); assert.equal(v.tanks[0].id, c.session.seat, 'own tank first'); assert.equal(v.width, 1040); }
  a2.session.team(1); a.session.move('b', 0); world.run(30);
  assert.equal(a2.session.error.code, 'WRONG_PHASE'); assert.equal(a.session.error.code, 'WRONG_PHASE');
  b.session.surrender(); world.run(30); assert.equal(b.session.error.code, 'SURRENDER_LOCKED', 'team-mate still playing');
});

test('spectators: join any phase, see the match, cannot act, do not count toward start, limited per room', () => {
  const world = createWorld();
  const p = fullLobby(world);
  const early = world.client({}, 'Xem'); early.session.join(p.a.session.code, undefined, 'spectator'); world.run(30);
  assert.equal(early.session.role, 'spectator'); assert.equal(early.session.seat, null); assert.equal(p.a.session.room.spectators, 1);
  for (const c of p.all) c.session.ready(true); world.run(NET.countdownMs + 100);
  assert.equal(p.a.session.room.phase, 'playing', 'spectator does not block the start');
  const mid = world.client({}, 'Muộn'); mid.session.join(p.a.session.code, undefined, 'spectator'); world.run(30);
  assert.equal(mid.last('joined').role, 'spectator'); assert.ok(mid.last('joined').snapshot, 'mid-match spectator gets the current state');
  const s = world.host.inspect(p.a.session.code), before = s.tanks.map(t => [t.x, t.y]);
  mid.sendRaw({ type: 'input', seq: 0, inputs: [press({ x: 1, fire: true })] }); mid.sendRaw({ type: 'ready', ready: true }); world.run(200);
  assert.equal(mid.last('error').code, 'BAD_MESSAGE'); assert.equal(mid.connected, true);
  assert.deepEqual(s.tanks.map(t => [t.x, t.y]), before, 'spectator input moved nothing'); assert.equal(s.bullets.length, 0);
  const v = mid.session.view(); assert.equal(v.tanks.length, 4); assert.equal(v.tanks[0].id, 'a', 'spectator keeps seat order');
  for (let i = 0; i < 2; i++) world.client().session.join(p.a.session.code, undefined, 'spectator');
  world.run(30);
  const fifth = world.client(); fifth.session.join(p.a.session.code, undefined, 'spectator'); world.run(30); assert.equal(fifth.session.error.code, 'ROOM_FULL');
  // A dropped spectator resumes its view with its own token; leaving frees the slot.
  mid.drop(); world.run(50); world.reconnect(mid); mid.session.resume(); world.run(50); assert.equal(mid.session.role, 'spectator');
  mid.session.leave(); world.run(30); assert.equal(mid.last('left').type, 'left');
  assert.equal(p.a.session.room.spectators, 3);
});

test('leave mid-match: that player is out, team-mate plays on 1v2; whole team gone → forfeit; result once with flags', async () => {
  const results = [];
  const world = createWorld({ hostOptions: { onResult: r => results.push(r) } });
  const { a, b, a2, b2 } = startedSquad(world);
  const s = world.host.inspect(a.session.code);
  a2.session.leave(); world.run(50);
  assert.equal(a.session.room.phase, 'playing', 'team-mate plays on');
  assert.equal(seatOf(a, 'a2').forfeited, true); assert.equal(s.tanks.find(t => t.id === 'a2').hp, 0); assert.ok(s.out.includes('a2'));
  assert.equal(a2.session.code, null);
  // The forfeited player cannot come back into this match.
  world.reconnect(a2); a2.session.restore({ code: a.session.code, resumeToken: a2.inbox.find(m => m.type === 'joined').resumeToken }); a2.session.resume(); world.run(30);
  assert.equal(a2.last('error').code, 'RESUME_INVALID');
  // Their tank stays out in the next round too.
  world.run(1000, () => { for (const t of s.tanks) if (t.team === 1) t.hp = s.status === 'playing' && s.round === 1 ? 0 : t.hp; });
  world.run(3000); assert.equal(s.round, 2); assert.equal(s.tanks.find(t => t.id === 'a2').hp, 0, 'no respawn for a forfeited seat');
  a.session.leave(); world.run(50); await settle();
  for (const c of [b, b2]) { assert.equal(c.session.result.reason, 'forfeit'); assert.equal(c.session.result.winner, 1); }
  assert.equal(results.length, 1);
  assert.deepEqual(results[0].players.map(p => [p.seat, p.team, p.forfeited]), [['a', 0, true], ['a2', 0, true], ['b', 1, false], ['b2', 1, false]]);
  // Forfeited seats are freed after the result; the room returns to the lobby with the two remaining players.
  assert.equal(b.session.room.phase, 'lobby'); assert.deepEqual(b.session.room.seats.map(x => x.id), ['b', 'b2']);
  assert.equal(seatOf(b, 'b').host, true, 'host moved to the first remaining seat');
});

test('seat hold expiry forfeits one player; surrender is allowed only to the last active player of a team', async () => {
  const results = [];
  const world = createWorld({ hostOptions: { onResult: r => results.push(r) } });
  const { a, b, a2, b2 } = startedSquad(world);
  b2.drop(); world.run(1000);
  // A disconnected (not yet forfeited) team-mate already unlocks surrender: nobody else on the team is playing.
  assert.equal(seatOf(a, 'b2').connected, false); assert.equal(seatOf(a, 'b2').forfeited, false);
  world.run(NET.seatHoldMs);
  assert.equal(seatOf(a, 'b2').forfeited, true); assert.equal(a.session.room.phase, 'playing');
  a.session.surrender(); world.run(30); assert.equal(a.session.error.code, 'SURRENDER_LOCKED');
  b.session.surrender(); world.run(50); await settle();
  for (const c of [a, a2, b]) { assert.equal(c.session.result.reason, 'surrender'); assert.equal(c.session.result.winner, 0); }
  assert.equal(results.length, 1); assert.equal(results[0].players.find(p => p.seat === 'b2').forfeited, true);
});

test('all four gone → cancelled without a winner and the room closes; leaving during countdown returns to the lobby', async () => {
  const results = [];
  const world = createWorld({ hostOptions: { onResult: r => results.push(r) } });
  const p = startedSquad(world); const code = p.a.session.code;
  for (const c of p.all) c.drop();
  world.run(NET.seatHoldMs + 100); await settle();
  assert.equal(results.length, 1); assert.equal(results[0].reason, 'cancelled'); assert.equal(results[0].winner, null);
  assert.equal(world.host.rooms().some(r => r.code === code), false);

  const w2 = createWorld(); const q = fullLobby(w2);
  for (const c of q.all) c.session.ready(true); w2.run(50); assert.equal(q.a.session.room.phase, 'countdown');
  q.b2.session.leave(); w2.run(NET.countdownMs + 100);
  assert.equal(q.a.session.room.phase, 'lobby'); assert.ok(q.a.session.room.seats.every(s => !s.ready));
});

test('scored 2v2 match: every client agrees; rematch needs all four ready and gets a new match id and layout', () => {
  const world = createWorld();
  const { a, all } = startedSquad(world);
  const s = world.host.inspect(a.session.code), firstId = a.session.matchId, firstSeed = s.map.seed;
  // Team 1 is knocked out at the start of every round: team 0 wins 2:0 by score.
  world.run(12_000, () => { for (const t of s.tanks) if (t.team === 1 && s.status === 'playing') t.hp = 0; });
  assert.equal(a.session.result.reason, 'score'); assert.deepEqual(a.session.result.scores, [2, 0]);
  for (const c of all) assert.deepEqual(c.session.result, a.session.result);
  for (const c of all.slice(0, 3)) c.session.ready(true);
  world.run(NET.countdownMs + 100); assert.equal(a.session.room.phase, 'finished', 'three of four is not enough');
  all[3].session.ready(true); world.run(NET.countdownMs + 100);
  assert.equal(a.session.room.phase, 'playing'); assert.notEqual(a.session.matchId, firstId);
  assert.notEqual(world.host.inspect(a.session.code).map.seed, firstSeed, 'new random layout');
});
