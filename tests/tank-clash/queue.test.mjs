// Tank Clash P3c: the public 2v2 queue and parties (P3-SPEC §6, table §6.4, §8.3).
import { test } from 'node:test';
import assert from 'node:assert/strict';
import { createWorld } from './harness.mjs';
import { NET, cleanName } from '../../src/games/tank-clash/protocol.ts';

// A token is an account id; no token = guest (owner decision Q2: the queue needs an account).
const authenticate = (token, name) => token ? { userId: token, name: cleanName(name), guest: false } : { userId: '', name: cleanName(name), guest: true };
const world = (extra = {}) => createWorld({ hostOptions: { authenticate, ...extra } });
function solo(w, name) { const c = w.client({}, name, `u-${name}`); c.session.queue(); w.run(30); return c; }
/** A party: host creates a 2v2 room, the mate joins and moves to the host's team, the host queues. */
function party(w, h, m, { queue = true } = {}) {
  const host = w.client({}, h, `u-${h}`), mate = w.client({}, m, `u-${m}`);
  host.session.create(undefined, '2v2'); w.run(30); mate.session.join(host.session.code); w.run(30); mate.session.team(0); w.run(30);
  assert.equal(mate.session.seat, 'a2');
  if (queue) { host.session.queue(); w.run(30); }
  return [host, mate];
}
const matched = c => c.session.room?.kind === 'queue';
const team = c => c.session.myTeam;
const sameRoom = cs => new Set(cs.map(c => c.session.code)).size === 1;

test('queue needs an account; a guest can still play private rooms; a dev host may allow guests', () => {
  const w = world();
  const g = w.client({}, 'Khách'); g.session.queue(); w.run(30);
  assert.equal(g.session.error.code, 'AUTH_REQUIRED'); assert.equal(g.connected, true); assert.equal(g.session.error.fatal, false);
  g.session.create(); w.run(30); assert.ok(g.session.code, 'private room still works');
  const host = w.client({}, 'Chủ'), mate = w.client({}, 'Bạn');
  host.session.create(undefined, '2v2'); w.run(30); mate.session.join(host.session.code); w.run(30); mate.session.team(0); w.run(30);
  host.session.queue(); w.run(30); assert.equal(host.session.error.code, 'AUTH_REQUIRED', 'guest party refused');
  const dev = world({ authenticate: undefined, guestQueue: true }), d = dev.client(); d.session.queue(); dev.run(30);
  assert.equal(d.session.queueStatus.size, 1);
});

test('§6.4 party A + party B → one match, each party together on its own team; countdown needs no ready', () => {
  const w = world();
  const A = party(w, 'A1', 'A2'); assert.equal(A[0].session.queueStatus.size, 2);
  const B = party(w, 'B1', 'B2');
  const all = [...A, ...B];
  assert.ok(all.every(matched) && sameRoom(all)); assert.equal(team(A[0]), team(A[1])); assert.equal(team(B[0]), team(B[1])); assert.notEqual(team(A[0]), team(B[0]));
  assert.equal(A[0].session.room.phase, 'countdown'); assert.equal(w.host.rooms().length, 1, 'party rooms closed');
  w.run(NET.queueCountdownMs + 50);
  const s = w.host.inspect(A[0].session.code);
  assert.equal(A[0].session.room.phase, 'playing'); assert.ok(s.tanks.every(t => t.kind === 'player'), 'no bots in a matched game');
  assert.deepEqual(w.host.queue(), []);
});

test('§6.4 party A + solo x + solo y → A one team, x and y the other; four solos pair in arrival order', () => {
  const w = world();
  const A = party(w, 'A1', 'A2'), x = solo(w, 'x'); assert.equal(matched(x), false);
  const y = solo(w, 'y');
  assert.ok([...A, x, y].every(matched)); assert.equal(team(A[0]), team(A[1])); assert.equal(team(x), team(y)); assert.notEqual(team(x), team(A[0]));

  const w2 = world(); const [p, q, r, z] = ['p', 'q', 'r', 'z'].map(n => solo(w2, n));
  assert.ok([p, q, r, z].every(matched)); assert.deepEqual([p, q, r, z].map(team), [0, 0, 1, 1]);
});

test('§6.4 party + one solo (3 players) does not match and never splits the party; A, x, B → A plays B, x keeps waiting', () => {
  const w = world();
  const A = party(w, 'A1', 'A2'), x = solo(w, 'x');
  w.run(5000); assert.ok(!matched(x) && !matched(A[0]));
  assert.deepEqual(w.host.queue().map(e => e.members.length), [2, 1]);
  assert.ok(A[0].session.queueStatus.waitedMs >= 5000, 'party sees its wait');
  const B = party(w, 'B1', 'B2');
  assert.ok([...A, ...B].every(matched)); assert.ok(sameRoom([...A, ...B]));
  assert.equal(matched(x), false); assert.ok(x.session.queueStatus, 'x still searching');
  assert.deepEqual(w.host.queue().map(e => e.members), [['u-x']]);
});

test('§6.4 one party member cancels → the whole party leaves the queue and stays in its lobby; queued party is locked', () => {
  const w = world();
  const [host, mate] = party(w, 'A1', 'A2');
  const other = w.client({}, 'C', 'u-C'); other.session.join(host.session.code); w.run(30); assert.equal(other.session.error.code, 'ROOM_QUEUED');
  mate.session.team(1); w.run(30); assert.equal(mate.session.error.code, 'WRONG_PHASE');
  mate.session.unqueue(); w.run(30);
  assert.equal(host.session.room.queue, null); assert.equal(host.session.room.phase, 'lobby'); assert.equal(host.session.room.seats.length, 2);
  assert.deepEqual(w.host.queue(), []);
  // A member leaving also cancels; non-host cannot queue; mixed teams or 1v1 rooms cannot queue.
  host.session.queue(); w.run(30); assert.equal(w.host.queue().length, 1);
  mate.session.leave(); w.run(30); assert.equal(w.host.queue().length, 0); assert.equal(host.session.room.queue, null);
  const m2 = w.client({}, 'M', 'u-M'); m2.session.join(host.session.code); w.run(30);
  m2.session.queue(); w.run(30); assert.equal(m2.session.error.code, 'NOT_HOST');
  host.session.queue(); w.run(30); assert.equal(host.session.error.code, 'QUEUE_INVALID', 'players on both teams');
  const duel = w.client({}, 'D', 'u-D'); duel.session.create(); w.run(30); duel.session.queue(); w.run(30); assert.equal(duel.session.error.code, 'QUEUE_INVALID');
});

test('§6.4 same account in a second tab is refused and the first is unaffected; a queued account cannot also take a room', () => {
  const w = world();
  const x = solo(w, 'x');
  const tab2 = w.client({}, 'x', 'u-x'); tab2.session.queue(); w.run(30);
  assert.equal(tab2.session.error.code, 'ALREADY_IN_ROOM'); assert.ok(x.session.queueStatus);
  tab2.session.create(); w.run(30); assert.equal(tab2.session.error.code, 'ALREADY_IN_ROOM');
  const seated = w.client({}, 'y', 'u-y'); seated.session.create(); w.run(30); seated.sendRaw({ type: 'queue' }); w.run(30);
  assert.equal(seated.last('error').code, 'QUEUE_INVALID', 'a 1v1 host cannot queue');
  const elsewhere = w.client({}, 'y', 'u-y'); elsewhere.session.queue(); w.run(30); assert.equal(elsewhere.session.error.code, 'ALREADY_IN_ROOM');
  x.session.unqueue(); w.run(30); assert.equal(x.session.queueStatus, null); assert.equal(x.last('queue').reason, 'unqueued');
});

test('§6.4 drop during the matched countdown cancels it; the other three return to the front in their old order; the dropped one is out', () => {
  const w = world();
  const A = party(w, 'A1', 'A2'); w.run(1000);
  const x = solo(w, 'x'); w.run(1000);
  const y = solo(w, 'y');
  assert.ok([...A, x, y].every(matched));
  y.drop(); w.run(50);
  assert.equal(matched(A[0]), false); assert.equal(A[0].session.room.kind, 'private', 'party is back in a private room');
  assert.ok(sameRoom(A)); assert.equal(team(A[0]), team(A[1])); assert.ok(A[0].session.room.queue, 'and still searching');
  assert.equal(x.session.queueStatus.reason, 'returned'); assert.equal(x.session.room, null);
  assert.deepEqual(w.host.queue().map(e => e.members), [['u-A1', 'u-A2'], ['u-x']], 'old order kept; y removed');
  const z = solo(w, 'z'); // a newcomer completes the match with the returning players
  assert.ok([...A, x, z].every(matched)); assert.equal(team(x), team(z));
});

test('offline in the queue: back within 10 s keeps the place, longer drops it; a party member offline 10 s cancels the party search', () => {
  const w = world();
  const x = solo(w, 'x'), y = solo(w, 'y');
  x.drop(); w.run(NET.queueDropMs - 2000);
  assert.deepEqual(w.host.queue().map(e => [e.members[0], e.online]), [['u-x', false], ['u-y', true]]);
  w.reconnect(x); x.session.queue(); w.run(30); assert.deepEqual(w.host.queue().map(e => e.members[0]), ['u-x', 'u-y'], 'same place');
  y.drop(); w.run(NET.queueDropMs + 50); assert.deepEqual(w.host.queue().map(e => e.members[0]), ['u-x']);
  const [host, mate] = party(w, 'A1', 'A2');
  mate.drop(); w.run(NET.queueDropMs + 50);
  assert.equal(host.session.room.queue, null); assert.equal(w.host.queue().some(e => e.party), false);
  assert.equal(matched(x), false, 'an offline party member never gets matched');
});

test('matched room: no joining by code; rematch needs all four within 20 s; otherwise parties go back together and solos to the menu', () => {
  const w = world();
  const A = party(w, 'A1', 'A2'), x = solo(w, 'x'), y = solo(w, 'y'), all = [...A, x, y];
  const code = A[0].session.code;
  const intruder = w.client({}, 'I', 'u-I'); intruder.session.join(code); w.run(30); assert.equal(intruder.session.error.code, 'ROOM_IN_PROGRESS');
  w.run(NET.queueCountdownMs + 50);
  // x's team is knocked out at the start of every round (the live state: a rematch creates a new one).
  const knockOut = () => { const s = w.host.inspect(code); for (const t of s.tanks) if (t.team === team(x) && s.status === 'playing') t.hp = 0; };
  w.run(12_000, knockOut);
  assert.equal(A[0].session.result.reason, 'score'); assert.ok(A[0].session.room.rematchMs > 15_000);
  for (const c of all) c.session.ready(true); w.run(NET.countdownMs + 100);
  assert.equal(A[0].session.room.phase, 'playing', 'rematch with all four');
  w.run(12_000, knockOut);
  assert.equal(A[0].session.room.phase, 'finished');
  A[0].session.ready(true); x.session.ready(true); w.run(NET.queueRematchMs + 100); // not everyone agrees
  assert.equal(w.host.rooms().some(r => r.code === code), false, 'matched room dissolved');
  assert.ok(sameRoom(A) && A[0].session.room.kind === 'private' && A[0].session.room.queue === null, 'party back in its own lobby');
  for (const c of [x, y]) { assert.equal(c.session.room, null); assert.equal(c.last('left').type, 'left'); }
});

test('returning players keep their old place: a cancelled countdown puts them ahead of someone who queued meanwhile', () => {
  const w = world();
  const [x, y, z, v] = ['x', 'y', 'z', 'v'].map(n => { const c = solo(w, n); w.run(500); return c; });
  assert.deepEqual([x, y, z, v].map(team), [0, 0, 1, 1]);
  const late = solo(w, 'late'); assert.equal(matched(late), false);
  v.drop(); w.run(50);
  // Back in arrival order x, y, z, then late: pairs (x, y) and (z, late).
  assert.ok([x, y, z, late].every(matched)); assert.equal(team(x), team(y)); assert.equal(team(z), team(late)); assert.notEqual(team(x), team(z));
});

test('nobody offline is matched: two solos do not take a party whose member is offline', () => {
  const w = world();
  const [host, mate] = party(w, 'A1', 'A2');
  mate.drop(); w.run(50); assert.ok(host.session.room.queue, 'still queued during the drop window');
  const x = solo(w, 'x'), y = solo(w, 'y');
  assert.ok(![host, x, y].some(matched), 'party with an offline member waits');
  assert.deepEqual(w.host.queue().map(e => e.online), [false, true, true]);
});

test('party + party goes first when several units become ready at once (§6.2)', () => {
  const w = world();
  const x = solo(w, 'x'); w.run(100);
  const y = w.client({}, 'y', 'u-y');
  // Each party queues, then loses a member (still queued inside the drop window, but not matchable).
  const A = party(w, 'A1', 'A2'); A[1].drop(); w.run(50);
  const B = party(w, 'B1', 'B2'); B[1].drop(); w.run(50);
  assert.equal(matched(A[0]), false); assert.equal(w.host.queue().length, 3);
  y.session.queue(); w.run(30); assert.equal(matched(x), false, 'x + y alone are one team');
  // Both missing members come back in the same instant: x+y, A and B are all ready together.
  for (const p of [A, B]) { w.reconnect(p[1]); p[1].session.resume(); }
  w.run(50);
  assert.ok([...A, ...B].every(matched) && sameRoom([...A, ...B]), 'party + party preferred');
  assert.ok(!matched(x) && !matched(y), 'the solo pair keeps waiting');
});
