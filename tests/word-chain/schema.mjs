// supabase/word-chain/schema.sql on PGlite: service-only access, one active room per identity,
// version CAS with presence guard, presence pulses, 2–4 seat matchmaking, scheduler query, budget.
import {PGlite} from '@electric-sql/pglite';
import {readFileSync} from 'node:fs';
import assert from 'node:assert/strict';

const db = new PGlite(); await db.waitReady;
let checks = 0;
const test = async (name, fn) => {await fn(); checks++; console.log('PASS', name);};
await db.exec('create role anon; create role authenticated; create role service_role bypassrls;');
await db.exec(readFileSync('supabase/word-chain/schema.sql', 'utf8'));
const call = async (fn, ...args) => {
  const params = args.map((_, i) => `$${i + 1}`).join(',');
  const r = await db.query(`select public.${fn}(${params}) as v`, args.map(a => (typeof a === 'object' && a !== null ? JSON.stringify(a) : a)));
  return r.rows[0].v;
};
const due = async now => (await db.query('select public.wc_room_due($1) as v', [now])).rows.map(r => r.v.id);
const room = (id, uid, code, extra = {}) => ({id, code, version: 0, status: 'waiting', public: false, capacity: 3, host: 'P1', members: {P1: uid}, names: {P1: uid}, lastSeen: {P1: 0}, match: null, createdAt: 0, reactions: [], receipts: [], ...extra});

await test('browser roles cannot read rooms or call the persistence functions', async () => {
  for (const role of ['anon', 'authenticated']) {
    await db.exec(`set role ${role}`);
    await assert.rejects(db.query('select * from wc_private.rooms'), /permission denied/);
    await assert.rejects(db.query("select public.wc_room_read('x')"), /permission denied/);
    await assert.rejects(db.query("select public.wc_room_match('u','{}'::jsonb,'n',0)"), /permission denied/);
    await db.exec('reset role');
  }
});
await test('create is idempotent per request id, validates capacity, one active room per identity', async () => {
  const a = room('r1', 'ann', 'ABC234');
  assert.equal((await call('wc_room_create', a)).id, 'r1');
  assert.equal((await call('wc_room_create', a)).id, 'r1');
  await assert.rejects(call('wc_room_create', room('r1', 'eve', 'ZZZ234')), /room ID conflict/);
  await assert.rejects(call('wc_room_create', room('r2', 'ann', 'DEF234')), /active room/);
  await assert.rejects(call('wc_room_create', room('r3', 'cat', 'GHI234', {capacity: 5})), /invalid initial room/);
  assert.equal((await call('wc_room_by_code', 'ABC234')).members.P1, 'ann');
});
await test('cas: expected version only, members gain active rooms, removed members are freed', async () => {
  const cur = await call('wc_room_read', 'r1');
  const next = {...cur, version: 1, members: {P1: 'ann', P2: 'bob'}, lastSeen: {P1: 10, P2: 10}};
  assert.equal(await call('wc_room_cas', 4, {...next, version: 5}), null);
  await assert.rejects(call('wc_room_cas', 0, {...next, version: 3}), /invalid version/);
  assert.equal((await call('wc_room_cas', 0, next)).version, 1);
  await assert.rejects(call('wc_room_create', room('r4', 'bob', 'JKL234')), /active room/);
  // bob leaves: his seat and lastSeen disappear and he may open a room.
  const left = await call('wc_room_cas', 1, {...next, version: 2, members: {P1: 'ann'}, lastSeen: {P1: 20}});
  assert.deepEqual(Object.keys(left.lastSeen), ['P1']);
  assert.equal((await call('wc_room_create', room('r4', 'bob', 'JKL234'))).id, 'r4');
});
await test('expiry guard: an absence write loses to a newer heartbeat', async () => {
  const cur = await call('wc_room_read', 'r4');
  await call('wc_room_touch', 'r4', 'bob', 60000);
  const guarded = {...cur, version: 1, status: 'closed', members: {}, expiryGuard: {cutoff: 50000, seats: ['P1']}};
  assert.equal(await call('wc_room_cas', 0, guarded), null);
  await assert.rejects(call('wc_room_touch', 'r4', 'eve', 1), /not a room member/);
});
await test('touch: throttled to 5 s, never revives a seat past 90 s', async () => {
  const before = (await call('wc_room_read', 'r4')).lastSeen.P1;
  assert.equal((await call('wc_room_touch', 'r4', 'bob', before + 2000)).lastSeen.P1, before);
  assert.equal((await call('wc_room_touch', 'r4', 'bob', before + 6000)).lastSeen.P1, before + 6000);
  assert.equal((await call('wc_room_touch', 'r4', 'bob', before + 6000 + 90001)).lastSeen.P1, before + 6000);
});
await test('matchmaking: seats fill P2..P4 in the oldest open public room, replays return it, full rooms are skipped', async () => {
  const pub = (id, uid, code, at) => room(id, uid, code, {public: true, capacity: 4, createdAt: at, lastSeen: {P1: at}});
  const T = 1_000_000;
  const first = await call('wc_room_match', 'u1', pub('q1', 'u1', 'QAAAAA', T), 'U1', T);
  assert.equal(first.id, 'q1');
  const seats = [];
  for (const u of ['u2', 'u3', 'u4']) {const d = await call('wc_room_match', u, pub('x' + u, u, 'X' + u.toUpperCase() + 'AAA'.slice(0, 3), T + 10), u, T + 10); seats.push([d.id, Object.entries(d.members).find(([, m]) => m === u)[0]]);}
  assert.deepEqual(seats, [['q1', 'P2'], ['q1', 'P3'], ['q1', 'P4']]);
  const q1 = await call('wc_room_read', 'q1');
  assert.equal(q1.version, 3); assert.equal(q1.pairAt, T + 10); assert.equal(q1.names.P4, 'u4');
  assert.equal((await call('wc_room_match', 'u3', pub('again', 'u3', 'AGAINA', T + 20), 'u3', T + 20)).id, 'q1');
  const fifth = await call('wc_room_match', 'u5', pub('q5', 'u5', 'QBBBBB', T + 30), 'U5', T + 30);
  assert.equal(fifth.id, 'q5', 'full room skipped, a new one opened');
  // Stale queue rooms (nobody seen for 90 s) and private rooms are never joined.
  const later = await call('wc_room_match', 'u6', pub('q6', 'u6', 'QCCCCC', T + 200000), 'U6', T + 200000);
  assert.equal(later.id, 'q6');
  await assert.rejects(call('wc_room_match', 'u7', room('p7', 'u7', 'PPPPPP'), 'U7', T), /invalid matchmaking request/);
});
await test('due: full or ready-to-start lobbies, deadlines, rematch expiry and absences; nothing else', async () => {
  await db.exec('delete from wc_private.rooms');
  const T = 5_000_000;
  await call('wc_room_create', room('idle', 'a1', 'IDLEAA', {createdAt: T, lastSeen: {P1: T}}));
  await call('wc_room_create', room('auto', 'b1', 'AUTOAA', {public: true, capacity: 4, createdAt: T, pairAt: T + 1000, members: {P1: 'b1', P2: 'b2'}, lastSeen: {P1: T, P2: T}}));
  await call('wc_room_create', room('turn', 'c1', 'TURNAA', {status: 'waiting', createdAt: T, lastSeen: {P1: T}}));
  const t = await call('wc_room_read', 'turn');
  await call('wc_room_cas', 0, {...t, version: 1, status: 'active', match: {phase: 'turn', deadline: T + 30000}});
  await call('wc_room_create', room('done', 'd1', 'DONEAA', {createdAt: T, lastSeen: {P1: T}}));
  const d = await call('wc_room_read', 'done');
  await call('wc_room_cas', 0, {...d, version: 1, status: 'active', match: {phase: 'finished', deadline: 0}, rematch: {votes: [], until: T + 60000}});
  assert.deepEqual(await due(T + 500), []);
  assert.deepEqual((await due(T + 21000)).sort(), ['auto']);
  assert.deepEqual((await due(T + 30000)).sort(), ['auto', 'turn']);
  assert.deepEqual((await due(T + 60000)).sort(), ['auto', 'done', 'turn']);
  assert.deepEqual((await due(T + 90000)).sort(), ['auto', 'done', 'idle', 'turn'], 'absent seats');
});
await test('request budget: 150 reads and 60 writes per minute per identity', async () => {
  let ok = 0; for (let i = 0; i < 152; i++) if (await call('wc_room_rate', 'ann', 'read')) ok++;
  assert.equal(ok, 150);
  ok = 0; for (let i = 0; i < 61; i++) if (await call('wc_room_rate', 'ann', 'write')) ok++;
  assert.equal(ok, 60);
  assert.equal(await call('wc_room_rate', 'ann', 'admin'), false);
});
console.log(`word-chain schema: ${checks} checks passed`);
