// P3c: the public 2v2 queue — parties from private 2v2 rooms and solo players (spec §6.4).
import { test } from 'node:test';
import assert from 'node:assert/strict';
import { createWorld, press } from './harness.mjs';
import { NET } from '../../src/games/tank-clash/protocol.ts';

const guests = (extra = {}) => createWorld({ hostOptions: { allowGuestQueue: true, ...extra } });
const settle = () => new Promise(r => setImmediate(r));
function party(world, a, b) {
  const host = world.client({}, a); host.session.create(a, '2v2'); world.run(30);
  const mate = b ? world.client({}, b) : null; if (mate) { mate.session.join(host.session.code); world.run(30); }
  return { host, mate, members: mate ? [host, mate] : [host] };
}
function solo(world, name) { const c = world.client({}, name); c.session.findMatch(); world.run(30); return c; }
const kinds = world => world.host.queue().map(e => `${e.kind}:${e.size}`);
function matched(clients, world) {
  const code = clients[0].session.code;
  for (const c of clients) { assert.equal(c.session.code, code, `${c.session.room?.code} vs ${code}`); assert.equal(c.session.room.kind, 'queue'); assert.equal(c.session.queue, null); }
  assert.equal(clients[0].session.room.phase, 'countdown');
  return code;
}

test('two parties of two: one match, each party on its own team, starts after the matched countdown with no ready', () => {
  const world = guests(), A = party(world, 'An', 'Ánh'), B = party(world, 'Bảo', 'Bích');
  A.host.session.findMatch(); world.run(30);
  assert.deepEqual(kinds(world), ['party:2']); assert.equal(A.mate.session.queue.size, 2); assert.ok(A.host.session.room.queue);
  B.host.session.findMatch(); world.run(30);
  const code = matched([...A.members, ...B.members], world);
  assert.deepEqual(kinds(world), []);
  assert.deepEqual([A.host, A.mate].map(c => c.session.team), [0, 0]); assert.deepEqual([B.host, B.mate].map(c => c.session.team), [1, 1]);
  assert.equal(A.host.session.room.seats.every(s => !s.host), true, 'matched rooms have no host');
  world.run(NET.queueCountdownMs + 50);
  assert.equal(A.host.session.room.phase, 'playing'); assert.equal(world.host.inspect(code).mode, 'squad');
  assert.equal(world.host.rooms().length, 1, 'party rooms were folded into the match room');
});

test('a party takes two solos; four solos pair up in arrival order; a party is never split', () => {
  const w1 = guests(), P = party(w1, 'An', 'Ánh');
  P.host.session.findMatch(); w1.run(30);
  const x = solo(w1, 'X'); assert.deepEqual(kinds(w1), ['party:2', 'solo:1'], 'party + one solo waits; party not split');
  const y = solo(w1, 'Y');
  matched([P.host, P.mate, x, y], w1);
  assert.deepEqual([P.host, P.mate, x, y].map(c => c.session.team), [0, 0, 1, 1]);
  const w2 = guests(), four = ['S1', 'S2', 'S3', 'S4'].map(n => solo(w2, n));
  matched(four, w2);
  assert.deepEqual(four.map(c => c.session.seat), ['a', 'a2', 'b', 'b2']);
});

test('party A, solo x, party B in that order: A meets B (party vs party first), x keeps waiting', () => {
  const world = guests(), A = party(world, 'An', 'Ánh'); A.host.session.findMatch(); world.run(30);
  const x = solo(world, 'X');
  const B = party(world, 'Bảo', 'Bích'); B.host.session.findMatch(); world.run(30);
  matched([...A.members, ...B.members], world);
  assert.deepEqual(kinds(world), ['solo:1']); assert.ok(x.session.queue); assert.equal(x.session.code, null);
});

test('cancel: any party member takes the whole party out; a solo cancels for itself; disconnecting solo leaves the queue', () => {
  const world = guests(), A = party(world, 'An', 'Ánh'); A.host.session.findMatch(); world.run(30);
  A.mate.session.cancelMatch(); world.run(30);
  assert.deepEqual(kinds(world), []); assert.equal(A.host.session.queue, null); assert.equal(A.host.session.room.queue, null); assert.equal(A.host.session.room.phase, 'lobby');
  const x = solo(world, 'X'); x.session.cancelMatch(); world.run(30); assert.deepEqual(kinds(world), []); assert.equal(x.session.queue, null);
  const y = solo(world, 'Y'); y.drop(); world.run(30); assert.deepEqual(kinds(world), []);
});

test('queued party room is locked; only the host may queue; 1v1 rooms and full rooms cannot queue', () => {
  const world = guests(), A = party(world, 'An', 'Ánh');
  A.mate.session.findMatch(); world.run(30); assert.equal(A.mate.last('error').code, 'NOT_HOST');
  A.host.session.findMatch(); world.run(30);
  const late = world.client({}, 'Muộn'); late.session.join(A.host.session.code); world.run(30); assert.equal(late.last('error').code, 'ROOM_IN_PROGRESS');
  A.mate.session.ready(true); world.run(30); assert.equal(A.mate.last('error').code, 'WRONG_PHASE');
  const duel = world.client({}, 'Đơn'); duel.session.create('Đơn'); world.run(30); duel.session.findMatch(); world.run(30);
  assert.equal(duel.last('error').code, 'QUEUE_INVALID');
  const three = party(world, 'C1', 'C2'); const c3 = world.client({}, 'C3'); c3.session.join(three.host.session.code); world.run(30);
  three.host.session.findMatch(); world.run(30); assert.equal(three.host.last('error').code, 'QUEUE_INVALID');
});

test('a party member offline for 10 s takes the party out of the queue; it is never matched while someone is offline', () => {
  const world = guests(), A = party(world, 'An', 'Ánh'); A.host.session.findMatch(); world.run(30);
  A.mate.drop(); const x = solo(world, 'X'), y = solo(world, 'Y');
  assert.equal(x.session.code, null, 'not matched while a party member is offline');
  world.run(NET.queueDropMs + 50);
  assert.deepEqual(kinds(world), ['solo:1', 'solo:1']); assert.equal(A.host.session.queue, null);
});

test('drop during the matched countdown: match cancelled, the others go back to the front of the queue, parties stay together', () => {
  const world = guests(), A = party(world, 'An', 'Ánh'), x = solo(world, 'X');
  A.host.session.findMatch(); world.run(30);
  const later = solo(world, 'Sau');                            // queued after A and x
  matched([A.host, A.mate, x, later], world);
  later.drop(); world.run(50);
  assert.equal(A.host.session.room.kind, 'private', 'party is back in its own lobby'); assert.equal(A.host.session.code, A.mate.session.code);
  assert.deepEqual([A.host.session.seat, A.mate.session.seat], ['a', 'a2']);
  assert.equal(x.last('left').reason, 'requeued'); assert.ok(x.session.queue);
  assert.deepEqual(kinds(world), ['party:2', 'solo:1'], 'front of the queue, original order');
  const z = solo(world, 'Z');
  matched([A.host, A.mate, x, z], world);
});

test('one account, one place: a second tab cannot queue while the first is queued; guests need login for the public queue', () => {
  const auth = token => token ? { userId: `u-${token}`, name: token, guest: false } : null;
  const world = createWorld({ hostOptions: { authenticate: (t, n) => auth(t) ?? { userId: '', name: n ?? 'Khách', guest: true } } });
  const tab1 = world.client({}, 'T1'), tab2 = world.client({}, 'T2');
  tab1.sendRaw({ type: 'queue', protocol: 'tank-clash.p3.v1', token: 'nam' }); world.run(30);
  tab2.sendRaw({ type: 'queue', protocol: 'tank-clash.p3.v1', token: 'nam' }); world.run(30);
  assert.equal(tab2.last('error').code, 'ALREADY_IN_ROOM'); assert.deepEqual(kinds(world), ['solo:1']);
  const guest = world.client({}, 'Khách'); guest.session.findMatch(); world.run(30);
  assert.equal(guest.last('error').code, 'QUEUE_LOGIN');
  guest.session.create('Khách', '2v2'); world.run(30); assert.ok(guest.session.code, 'guests still play private rooms');
  guest.session.findMatch(); world.run(30); assert.equal(guest.last('error').code, 'QUEUE_LOGIN');
});

test('matched room after the result: all four rematch within 20 s, otherwise it disbands and the result stays visible', async () => {
  const results = [], world = guests({ onResult: r => results.push(r) });
  const four = ['S1', 'S2', 'S3', 'S4'].map(n => solo(world, n)), code = matched(four, world);
  world.run(NET.queueCountdownMs + 50);
  const s = world.host.inspect(code); s.scores[0] = 1; s.tanks[2].hp = 0; s.tanks[3].hp = 0; world.run(100); await settle();
  assert.equal(results.length, 1);
  for (const c of four) c.session.ready(true); world.run(NET.countdownMs + 100);
  assert.equal(four[0].session.room.phase, 'playing', 'rematch with the same four');
  const t = world.host.inspect(code); t.scores[1] = 1; t.tanks[0].hp = 0; t.tanks[1].hp = 0; world.run(100); await settle();
  assert.equal(results.length, 2);
  four[0].session.ready(true); world.run(NET.queueRematchMs + 100);
  for (const c of four) { assert.equal(c.session.code, null); assert.equal(c.session.leftReason, 'disbanded'); assert.equal(c.session.result.matchId, results[1].matchId); }
  assert.equal(world.host.rooms().length, 0);
  // Leaving during the result window disbands at once (the room cannot be refilled).
  const w2 = guests({ onResult: () => {} }), f2 = ['T1', 'T2', 'T3', 'T4'].map(n => solo(w2, n)), c2 = matched(f2, w2);
  w2.run(NET.queueCountdownMs + 50); const u = w2.host.inspect(c2); u.scores[0] = 1; u.tanks[2].hp = 0; u.tanks[3].hp = 0; w2.run(100);
  f2[3].session.leave(); w2.run(30);
  assert.equal(f2[0].session.leftReason, 'disbanded'); assert.equal(w2.host.rooms().length, 0);
});

test('a matched 2v2 plays like a private one: spectators may watch, leavers forfeit, the queue keeps working meanwhile', async () => {
  const results = [], world = guests({ onResult: r => results.push(r) });
  const four = ['S1', 'S2', 'S3', 'S4'].map(n => solo(world, n)), code = matched(four, world);
  world.run(NET.queueCountdownMs + 50);
  const sp = world.client({}, 'Xem'); sp.session.join(code, 'Xem', 'spectator'); world.run(50); assert.equal(sp.session.role, 'spectator');
  const p = world.client({}, 'Chen'); p.session.join(code); world.run(30); assert.equal(p.last('error').code, 'ROOM_IN_PROGRESS');
  world.run(300, () => four.forEach(c => c.session.tick(press())));
  four[2].session.leave(); four[3].session.leave(); world.run(50); await settle();
  assert.equal(results[0].reason, 'forfeit'); assert.equal(results[0].winner, 0);
  const next = ['N1', 'N2', 'N3', 'N4'].map(n => solo(world, n)); matched(next, world);
});

test('requeued players go ahead of people who joined the queue later', () => {
  const world = guests(), first = ['S1', 'S2', 'S3', 'S4'].map(n => solo(world, n));
  matched(first, world);
  const w1 = solo(world, 'W1'), w2 = solo(world, 'W2');           // wait behind the running countdown
  first[3].drop(); world.run(50);                                 // S1–S3 back to the front: S1, S2, S3, W1, W2
  matched([first[0], first[1], first[2], w1], world);
  assert.ok(w2.session.queue, 'W2 (latest) is the one still waiting'); assert.equal(w2.session.code, null);
});
