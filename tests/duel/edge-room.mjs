// duel-room Edge Function end to end: the real HTTP handler, PostgresDuelStore and
// supabase/duel/schema.sql on PGlite, with Supabase Auth and PostgREST replaced by a fake fetch.
// Also verifies the staged Edge copies of the rules match src/ (npm run prepare:duel-server).
import { build } from 'esbuild';
import { PGlite } from '@electric-sql/pglite';
import { readFileSync } from 'node:fs';
import assert from 'node:assert/strict';

let checks = 0;
const test = async (name, fn) => { await fn(); checks++; console.log('PASS', name); };

await test('staged Edge rule files match src/ after import rewrites', () => {
  const same = (src, staged, rewrites = []) => assert.equal(readFileSync(staged, 'utf8'), rewrites.reduce((s, [a, b]) => s.replace(a, b), readFileSync(src, 'utf8')), `${staged} is stale; run npm run prepare:duel-server`);
  same('src/games/xiangqi/rules.ts', 'supabase/functions/duel-room/xiangqi-rules.ts');
  same('src/games/caro-gomoku/rules.ts', 'supabase/functions/duel-room/caro-rules.ts');
  same('src/games/duel/rules.ts', 'supabase/functions/duel-room/rules.ts', [["from 'chess.js'", "from 'npm:chess.js@1.4.0'"], ["from '../xiangqi/rules'", "from './xiangqi-rules.ts'"], ["from '../caro-gomoku/rules'", "from './caro-rules.ts'"]]);
  same('src/games/duel/server.ts', 'supabase/functions/duel-room/server.ts', [["from './rules'", "from './rules.ts'"]]);
});

const db = new PGlite(); await db.waitReady;
await db.exec('create role anon; create role authenticated; create role service_role bypassrls;');
await db.exec(readFileSync('supabase/duel/schema.sql', 'utf8'));
const URL = 'https://project.example', KEY = 'service-key';
const users = { 'tok-alice': { id: 'alice' }, 'tok-bob': { id: 'bob' }, 'tok-carol': { id: 'carol' }, 'tok-anon': { id: 'anon-1', is_anonymous: true } };
globalThis.fetch = async (url, init = {}) => {
  const path = String(url).slice(URL.length);
  if (path === '/auth/v1/user') {
    const user = users[(init.headers.Authorization || '').replace('Bearer ', '')];
    return new Response(JSON.stringify(user || {}), { status: user ? 200 : 401 });
  }
  const m = path.match(/^\/rest\/v1\/rpc\/(\w+)$/);
  assert.ok(m && init.headers.Authorization === `Bearer ${KEY}`, 'RPCs use the service key');
  const args = JSON.parse(init.body), names = Object.keys(args);
  try {
    const r = await db.query(`select public.${m[1]}(${names.map((n, i) => `${n} => $${i + 1}`).join(',')}) as v`, names.map(n => (typeof args[n] === 'object' && args[n] !== null ? JSON.stringify(args[n]) : args[n])));
    // PostgREST returns an array for set-returning functions and the scalar otherwise.
    return new Response(JSON.stringify(m[1] === 'duel_room_due' ? r.rows.map(row => row.v) : r.rows[0].v ?? null), { status: 200 });
  } catch (e) { return new Response(JSON.stringify({ message: e.message }), { status: 400 }); }
};
const { outputFiles } = await build({
  entryPoints: ['supabase/functions/duel-room/index.ts'], bundle: true, write: false, platform: 'node', format: 'esm', logLevel: 'silent',
  plugins: [{ name: 'npm-specifier', setup(b) { b.onResolve({ filter: /^npm:chess\.js@/ }, async () => ({ path: (await b.resolve('chess.js', { kind: 'import-statement', resolveDir: process.cwd() })).path })); } }],
});
const { handle } = await import('data:text/javascript;base64,' + Buffer.from(outputFiles[0].text).toString('base64'));
let clock = 1_000_000;
const call = async (token, body) => {
  const res = await handle(new Request('https://edge/duel-room', { method: 'POST', headers: { Authorization: `Bearer ${token}`, 'Content-Type': 'application/json' }, body: JSON.stringify(body) }), { url: URL, key: KEY }, clock);
  return { status: res.status, body: await res.json() };
};
let actions = 0;
const command = (token, room, command) => call(token, { type: 'command', roomId: room.id, version: room.version, actionId: `a${++actions}`, command });

let room;
await test('registered players create a room, join by code and play legal chess moves through the API', async () => {
  const created = await call('tok-alice', { type: 'create', requestId: '00000000-0000-4000-8000-000000000001', game: 'chess' });
  assert.equal(created.status, 200); assert.match(created.body.code, /^[A-Z2-9]{6}$/); assert.equal(created.body.status, 'waiting');
  const joined = await call('tok-bob', { type: 'join', code: created.body.code.toLowerCase() });
  assert.equal(joined.status, 200); assert.equal(joined.body.status, 'active');
  room = joined.body;
  const whiteToken = room.state.first === room.seat ? 'tok-bob' : 'tok-alice';
  const moved = await command(whiteToken, room, { type: 'move', move: { from: 'e2', to: 'e4' } });
  assert.equal(moved.status, 200); assert.equal(moved.body.state.moves[0].notation, 'e4');
  room = moved.body; room.whiteToken = whiteToken;
});
await test('illegal moves, stale versions, outsiders and guests are rejected with the right status', async () => {
  const black = room.whiteToken === 'tok-bob' ? 'tok-alice' : 'tok-bob';
  assert.deepEqual([(await command(black, room, { type: 'move', move: { from: 'e7', to: 'e3' } })).body.error], ['INVALID_MOVE']);
  assert.equal((await command(black, { ...room, version: room.version - 1 }, { type: 'move', move: { from: 'e7', to: 'e5' } })).body.error, 'VERSION_CONFLICT');
  assert.equal((await call('tok-carol', { type: 'snapshot', roomId: room.id })).status, 403);
  assert.equal((await call('tok-anon', { type: 'create', requestId: '00000000-0000-4000-8000-000000000002', game: 'caro' })).status, 403);
  assert.equal((await call('bad-token', { type: 'snapshot', roomId: room.id })).status, 401);
  assert.equal((await call('tok-carol', { type: 'create', requestId: 'not-a-uuid', game: 'caro' })).body.error, 'INVALID_REQUEST_ID');
  assert.equal((await call('tok-carol', { type: 'create', requestId: '00000000-0000-4000-8000-000000000003', game: 'go' })).body.error, 'BAD_GAME');
  assert.equal((await call(KEY, { type: 'create' })).status, 403, 'service key may only tick');
});
await test('a second room for a player with an active one is refused; the scheduler settles an abandoned game', async () => {
  assert.equal((await call('tok-alice', { type: 'create', requestId: '00000000-0000-4000-8000-000000000004', game: 'caro' })).body.error, 'ACTIVE_ROOM');
  clock += 120_000;
  assert.deepEqual((await call(KEY, { type: 'tick' })).body.updated, 1);
  const after = await call('tok-alice', { type: 'snapshot', roomId: room.id });
  assert.equal(after.body.status, 'closed');
  assert.equal((await call('tok-alice', { type: 'create', requestId: '00000000-0000-4000-8000-000000000005', game: 'caro' })).status, 200, 'identity freed');
});

const clientBuild = await build({ entryPoints: ['src/games/duel/online-client.ts'], bundle: true, write: false, platform: 'node', format: 'esm', logLevel: 'silent' });
const C = await import('data:text/javascript;base64,' + Buffer.from(clientBuild.outputFiles[0].text + '// client').toString('base64'));
await test('client: a lost response after the server applied a move is retried with the same action and not played twice', async () => {
  let dropNext = false;
  const transport = token => ({ async request(body) {
    const { status, body: result } = await call(token, body);
    if (dropNext) { dropNext = false; throw new C.DuelTransportError('NETWORK', 'lost', true); }
    if (status !== 200) throw new C.DuelTransportError(result.error, result.message || result.error, status >= 500);
    return result;
  } });
  const now = () => clock;
  const host = new C.DuelClient(transport('tok-carol'), now), guest = new C.DuelClient(transport('tok-bob'), now);
  await host.create('caro');
  assert.equal(host.snapshot.status, 'waiting');
  await guest.join(host.snapshot.code); await host.refresh();
  const first = host.snapshot.state.first === host.snapshot.seat ? host : guest;
  dropNext = true;
  await first.command({ type: 'move', move: { to: '7,7' } });
  assert.ok(first.pending, 'uncertain outcome keeps the request for retry');
  await first.retry();
  assert.equal(first.pending, null);
  assert.equal(first.snapshot.duplicate, true, 'server recognised the replay');
  assert.equal(first.snapshot.state.moves.length, 1);
  await first.command({ type: 'move', move: { to: '8,8' } });
  assert.match(first.notice, /chưa tới lượt/, 'out-of-turn moves surface the server message');
  assert.equal(first.pending, null, 'definite rejections are not retried');
});

console.log(`duel edge room: ${checks} checks passed`);
