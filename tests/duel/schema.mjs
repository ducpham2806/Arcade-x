// supabase/duel/schema.sql on PGlite: service-only access, one active room per identity,
// version CAS, presence pulses, expiry guard, scheduler query and request budget.
import { PGlite } from '@electric-sql/pglite';
import { readFileSync } from 'node:fs';
import assert from 'node:assert/strict';

const db = new PGlite(); await db.waitReady;
let checks = 0;
const test = async (name, fn) => { await fn(); checks++; console.log('PASS', name); };
await db.exec('create role anon; create role authenticated; create role service_role bypassrls;');
await db.exec(readFileSync('supabase/duel/schema.sql', 'utf8'));
const call = async (fn, ...args) => {
  const params = args.map((_, i) => `$${i + 1}`).join(',');
  const r = await db.query(`select public.${fn}(${params}) as v`, args.map(a => (typeof a === 'object' && a !== null ? JSON.stringify(a) : a)));
  return r.rows[0].v;
};
const room = (id, uid, code, extra = {}) => ({ id, code, game: 'chess', version: 0, status: 'waiting', members: { host: uid }, lastSeen: { host: 0 }, state: null, createdAt: 0, receipts: [], ...extra });

await test('browser roles cannot read rooms or call the persistence functions', async () => {
  await db.exec('set role anon');
  await assert.rejects(db.query('select * from duel_private.rooms'), /permission denied/);
  await assert.rejects(db.query("select public.duel_room_read('x')"), /permission denied/);
  await db.exec('reset role');
});
await test('create is idempotent per request id and allows one active room per identity', async () => {
  const a = room('r1', 'alice', 'ABC234');
  assert.equal((await call('duel_room_create', a)).id, 'r1');
  assert.equal((await call('duel_room_create', a)).id, 'r1', 'retry returns the same room');
  await assert.rejects(call('duel_room_create', room('r1', 'mallory', 'ZZZ234')), /room ID conflict/);
  await assert.rejects(call('duel_room_create', room('r2', 'alice', 'DEF234')), /active room/);
  assert.equal((await call('duel_room_by_code', 'ABC234')).members.host, 'alice');
});
await test('cas only replaces the expected version and closing frees the identity', async () => {
  const cur = await call('duel_room_read', 'r1');
  const next = { ...cur, version: 1, status: 'active', members: { host: 'alice', guest: 'bob' }, lastSeen: { host: 10, guest: 10 }, state: { deadline: 60000 } };
  assert.equal(await call('duel_room_cas', 5, { ...next, version: 6 }), null, 'stale version');
  await assert.rejects(call('duel_room_cas', 0, { ...next, version: 3 }), /invalid version/);
  assert.equal((await call('duel_room_cas', 0, next)).version, 1);
  await assert.rejects(call('duel_room_create', room('r3', 'bob', 'GHI234')), /active room/, 'guest now holds an active room');
  const closed = await call('duel_room_cas', 1, { ...next, version: 2, status: 'closed' });
  assert.equal(closed.status, 'closed');
  assert.equal((await db.query("select active from duel_private.rooms where id='r1'")).rows[0].active, false);
  assert.equal((await call('duel_room_create', room('r3', 'bob', 'GHI234'))).id, 'r3');
});
await test('touch updates presence at most every 5 s without a version bump and never revives a lapsed seat', async () => {
  const r3 = await call('duel_room_read', 'r3');
  await call('duel_room_cas', 0, { ...r3, version: 1, status: 'active', members: { host: 'bob', guest: 'carol' }, lastSeen: { host: 1000, guest: 1000 }, state: { deadline: 999999999 } });
  assert.equal((await call('duel_room_touch', 'r3', 'carol', 3000)).lastSeen.guest, 1000, 'throttled');
  assert.equal((await call('duel_room_touch', 'r3', 'carol', 7000)).lastSeen.guest, 7000);
  assert.equal((await call('duel_room_read', 'r3')).version, 1);
  assert.equal((await call('duel_room_touch', 'r3', 'bob', 1000 + 90000)).lastSeen.host, 1000, 'lapsed seat is not revived');
  await assert.rejects(call('duel_room_touch', 'r3', 'mallory', 8000), /not a room member/);
});
await test('a forfeit write is rejected when the guarded seat was seen after the cutoff; lastSeen merges newest', async () => {
  const cur = await call('duel_room_read', 'r3');
  const forfeit = { ...cur, version: 2, status: 'closed', closeReason: 'disconnect', lastSeen: { host: 1000, guest: 1000 }, expiryGuard: { cutoff: 5000, seats: ['guest'] } };
  assert.equal(await call('duel_room_cas', 1, forfeit), null, 'carol was seen at 7000 > cutoff 5000');
  const ok = await call('duel_room_cas', 1, { ...forfeit, expiryGuard: { cutoff: 8000, seats: ['guest'] } });
  assert.equal(ok.status, 'closed'); assert.equal(ok.expiryGuard, undefined, 'guard stripped'); assert.equal(ok.lastSeen.guest, 7000, 'newest lastSeen kept');
});
await test('due lists stale waiting rooms, expired turns and absent seats only', async () => {
  await call('duel_room_create', room('w', 'dave', 'WAI234', { createdAt: 0 }));
  await call('duel_room_create', room('t', 'erin', 'TIM234', { createdAt: 0 }));
  const t = await call('duel_room_read', 't');
  await call('duel_room_cas', 0, { ...t, version: 1, status: 'active', members: { host: 'erin', guest: 'finn' }, lastSeen: { host: 500000, guest: 500000 }, state: { deadline: 520000 } });
  const ids = async now => (await db.query('select public.duel_room_due($1) as v', [now])).rows.map(r => r.v.id).sort();
  assert.deepEqual(await ids(510000), []);
  assert.deepEqual(await ids(520001), ['t']);
  assert.deepEqual(await ids(600000), ['t', 'w']);
});
await test('request budget allows 60 writes per minute per identity', async () => {
  let allowed = 0;
  for (let i = 0; i < 65; i++) if (await call('duel_room_rate', 'spammer', 'write')) allowed++;
  assert.equal(allowed, 60);
  assert.equal(await call('duel_room_rate', 'spammer', 'bogus'), false);
});

console.log(`duel schema: ${checks} checks passed`);
