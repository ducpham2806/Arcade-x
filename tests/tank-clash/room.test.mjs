import { test } from 'node:test';
import assert from 'node:assert/strict';
import { createWorld, press } from './harness.mjs';
import { NET, PROTOCOL, parseClientMessage, normalizeCode } from '../../src/games/tank-clash/protocol.ts';
import { createRoomHost } from '../../src/games/tank-clash/room.ts';

/** Two clients in one room, both ready, match running. */
function startedMatch(world, net = {}) {
  const a = world.client(net, 'An'), b = world.client(net, 'Bình');
  a.session.create(); world.run(50);
  b.session.join(a.session.code.toLowerCase().replace(/(...)/, '$1-')); world.run(50); // codes are normalised
  a.session.ready(true); b.session.ready(true); world.run(50);
  assert.equal(a.session.room.phase, 'countdown');
  world.run(NET.countdownMs + 50);
  assert.equal(a.session.room.phase, 'playing'); assert.equal(b.session.room.phase, 'playing');
  return { a, b };
}

test('protocol rejects unknown types, extra input fields, huge batches and bad codes', () => {
  assert.equal(parseClientMessage('{"type":"teleport"}'), null);
  assert.equal(parseClientMessage({ type: 'input', seq: 0, inputs: [{ ...press(), hp: 99 }] }), null);
  assert.equal(parseClientMessage({ type: 'input', seq: 0, inputs: Array(5).fill(press()) }), null);
  assert.equal(parseClientMessage({ type: 'input', seq: -1, inputs: [press()] }), null);
  assert.equal(parseClientMessage({ type: 'input', seq: 0, inputs: [press({ x: 3 })] }), null);
  assert.ok(parseClientMessage({ type: 'input', seq: 4, inputs: [press({ x: 1 })] }));
  assert.equal(normalizeCode('ab0o1l'), null); assert.equal(normalizeCode(' abc-def '), 'ABCDEF');
});

test('create → join by code → ready → countdown → authoritative match; seats and host are reported', () => {
  const world = createWorld();
  const { a, b } = startedMatch(world);
  assert.equal(a.session.seat, 'a'); assert.equal(b.session.seat, 'b');
  assert.match(a.session.code, /^[A-HJ-NP-Z2-9]{6}$/);
  const seats = b.session.room.seats; assert.deepEqual(seats.map(s => [s.id, s.name, s.host]), [['a', 'An', true], ['b', 'Bình', false]]);
  // Inputs move only the sender's tank, through the server.
  const state = world.host.inspect(a.session.code), startX = state.tanks[0].x;
  world.run(500, () => { a.session.tick(press({ x: 1 })); b.session.tick(press({ aim: Math.PI })); });
  assert.ok(state.tanks[0].x > startX + 60, 'server moved tank a');
  assert.equal(state.tanks[1].x, 700, 'tank b did not move');
});

test('errors: unknown room, full room, in-progress room, protocol mismatch, not in room', () => {
  const world = createWorld();
  const { a } = startedMatch(world);
  const c = world.client(); c.session.join('ZZZZZZ'); world.run(20); assert.equal(c.session.error.code, 'ROOM_NOT_FOUND');
  c.session.join(a.session.code); world.run(20); assert.equal(c.session.error.code, 'ROOM_IN_PROGRESS');
  const lobby = world.client(); lobby.session.create(); world.run(20);
  const d = world.client(), e = world.client(); d.session.join(lobby.session.code); e.session.join(lobby.session.code); world.run(20);
  assert.equal(d.session.seat, 'b'); assert.equal(e.session.error.code, 'ROOM_FULL');
  e.session.ready(true); world.run(20); assert.equal(e.session.error.code, 'NOT_IN_ROOM');
  const old = world.client(); old.sendRaw({ type: 'create', protocol: 'tank-clash.p0.v1' }); world.run(20);
  assert.equal(old.last('error').code, 'PROTOCOL_MISMATCH'); assert.equal(old.last('error').fatal, true);
});

test('duplicate and replayed input sequences are ignored; a seat cannot drive faster than one input per tick', () => {
  const world = createWorld();
  const { a } = startedMatch(world);
  const state = world.host.inspect(a.session.code), x0 = state.tanks[0].x;
  // A cheating client floods 4-input batches far faster than 60 Hz: the queue is capped and consumed once per tick.
  let seq = 1000;
  for (let i = 0; i < 25; i++) a.sendRaw({ type: 'input', seq: (seq += 4) - 4, inputs: Array(4).fill(press({ x: 1 })) });
  a.sendRaw({ type: 'input', seq: 1000, inputs: [press({ x: -1 })] }); // replay of an old sequence
  world.run(1000);
  const travelled = state.tanks[0].x - x0;
  assert.ok(travelled <= 155 * (NET.inputQueueMax + 15) / 60 + 1, `travelled ${travelled.toFixed(1)} px`);
  assert.ok(travelled > 0);
});

test('disconnect holds the seat: tank stays vulnerable, resume returns the same seat with the same HP', () => {
  const world = createWorld();
  const { a, b } = startedMatch(world);
  const state = world.host.inspect(a.session.code);
  a.drop(); world.run(100);
  assert.equal(b.session.room.seats.find(s => s.id === 'a').connected, false);
  assert.ok(b.session.room.seats.find(s => s.id === 'a').holdMs > 19_000);
  state.tanks[0].hp = 2; state.tanks[1].x = 200; state.tanks[1].y = 240; state.walls = [];
  world.run(300, () => b.session.tick(press({ aim: Math.PI, fire: true })));
  assert.ok(state.tanks[0].hp < 2, 'disconnected tank still takes damage');
  const hp = state.tanks[0].hp;
  world.reconnect(a); a.session.resume(); world.run(100);
  assert.equal(a.session.seat, 'a'); assert.equal(a.session.room.phase, 'playing');
  assert.equal(state.tanks.length, 2, 'no duplicate tank');
  const mine = a.session.view().tanks.find(t => t.id === 'a'); assert.equal(mine.hp, hp);
  const y0 = state.tanks[0].y; world.run(300, () => a.session.tick(press({ y: 1 }))); assert.ok(state.tanks[0].y > y0, 'resumed input drives the tank');
  // A stolen/expired token is refused.
  const thief = world.client(); thief.session.restore({ code: a.session.code, resumeToken: 'x'.repeat(48) }); thief.session.resume(); world.run(20);
  assert.equal(thief.inbox.find(m => m.type === 'error').code, 'RESUME_INVALID');
});

const settle = () => new Promise(r => setImmediate(r));
test('hold expiry is a forfeit; the result is reported exactly once; both gone cancels without a winner', async () => {
  const results = [];
  const world = createWorld({ hostOptions: { onResult: r => results.push(r) } });
  const { a, b } = startedMatch(world);
  a.drop(); world.run(NET.seatHoldMs + 100);
  assert.equal(b.session.result.reason, 'forfeit'); assert.equal(b.session.result.winner, 1);
  world.run(1000); await settle(); assert.equal(results.length, 1); assert.equal(results[0].matchId, b.session.result.matchId);
  assert.deepEqual(results[0].players.map(p => [p.seat, p.team]), [['a', 0], ['b', 1]]);
  // Late resume after expiry is refused; the seat was released.
  world.reconnect(a); a.session.resume(); world.run(50); assert.equal(a.inbox.at(-1).code ?? a.last('error').code, 'RESUME_INVALID');

  const w2 = createWorld({ hostOptions: { onResult: r => results.push(r) } });
  const m = startedMatch(w2); const code = m.a.session.code;
  m.a.drop(); m.b.drop(); w2.run(NET.seatHoldMs + 100); await settle();
  assert.equal(results.at(-1).reason, 'cancelled'); assert.equal(results.at(-1).winner, null);
  assert.equal(w2.host.rooms().some(r => r.code === code), false, 'cancelled room closes');
});

test('leaving mid-match forfeits immediately; leaving the lobby transfers host', () => {
  const world = createWorld();
  const { a, b } = startedMatch(world);
  b.session.leave(); world.run(50);
  assert.equal(a.session.result.reason, 'forfeit'); assert.equal(a.session.result.winner, 0);
  assert.equal(b.session.code, null);
  // a is alone in the room again; a newcomer can join, then a (host) leaves → host moves to b's seat.
  const c = world.client(); c.session.join(a.session.code); world.run(50); assert.equal(c.session.seat, 'b');
  a.session.leave(); world.run(50);
  assert.deepEqual(c.session.room.seats.map(s => [s.id, s.host]), [['b', true]]);
});

test('a full match plays out on the server; both clients agree; rematch needs both ready and gets a new match id', () => {
  const world = createWorld();
  const { a, b } = startedMatch(world);
  const state = world.host.inspect(a.session.code); // open field (walls are rebuilt each round) so tank a wins quickly
  const firstId = a.session.matchId;
  world.run(15_000, () => { state.walls = []; a.session.tick(press({ fire: true })); b.session.tick(press({ aim: Math.PI / 2 })); });
  assert.equal(a.session.result?.reason, 'score');
  assert.deepEqual(a.session.result, b.session.result); assert.equal(a.session.result.winner, 0);
  assert.deepEqual(a.session.result.scores, [2, 0]);
  a.session.ready(true); world.run(NET.countdownMs + 100); assert.equal(a.session.room.phase, 'finished', 'one ready is not enough');
  b.session.ready(true); world.run(NET.countdownMs + 100);
  assert.equal(a.session.room.phase, 'playing'); assert.notEqual(a.session.matchId, firstId); assert.equal(a.session.result, null);
});

test('async token check: two accounts racing for the last seat get exactly one seat; one account cannot hold two rooms', async () => {
  let time = 0; const sent = { p1: [], p2: [], p3: [] };
  const host = createRoomHost({ now: () => time, authenticate: async token => token ? { userId: token, name: token, guest: false } : null });
  for (const id of Object.keys(sent)) host.connect(id, { send: m => sent[id].push(m) });
  await host.message('p1', JSON.stringify({ type: 'create', protocol: PROTOCOL, token: 'u1' }));
  const code = sent.p1.find(m => m.type === 'joined').code;
  await Promise.all([host.message('p2', JSON.stringify({ type: 'join', protocol: PROTOCOL, code, token: 'u2' })),
    host.message('p3', JSON.stringify({ type: 'join', protocol: PROTOCOL, code, token: 'u3' }))]);
  const outcomes = [sent.p2, sent.p3].map(list => list.find(m => m.type === 'joined') ? 'seat' : list.find(m => m.type === 'error')?.code);
  assert.deepEqual(outcomes.sort(), ['ROOM_FULL', 'seat']);
  host.connect('p4', { send: m => sent.p1.push(m) });
  await host.message('p4', JSON.stringify({ type: 'create', protocol: PROTOCOL, token: 'u1' }));
  assert.equal(sent.p1.at(-1).code, 'ALREADY_IN_ROOM');
  host.connect('p5', { send: m => sent.p1.push(m), close: () => {} });
  await host.message('p5', JSON.stringify({ type: 'create', protocol: PROTOCOL }));
  assert.equal(sent.p1.at(-1).code, 'AUTH_REQUIRED');
});

test('empty lobby closes; rate limit drops floods', () => {
  const world = createWorld();
  const a = world.client(); a.session.create(); world.run(50); const code = a.session.code;
  for (let i = 0; i < NET.messagesPerSecond + 20; i++) a.session.ping();
  world.run(50); assert.ok(world.host.metrics.rateLimited >= 20);
  a.drop(); world.run(NET.seatHoldMs + NET.emptyRoomMs + 100);
  assert.equal(world.host.rooms().some(r => r.code === code), false);
});
