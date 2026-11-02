// word-chain-room Edge Function end to end: the real HTTP handler, PostgresWordChainStore and
// supabase/word-chain/schema.sql on PGlite, with Supabase Auth and PostgREST replaced by a fake
// fetch. Also verifies the staged Edge copies match src/ (npm run prepare:word-chain-server).
import {build} from 'esbuild';
import {PGlite} from '@electric-sql/pglite';
import {readFileSync} from 'node:fs';
import assert from 'node:assert/strict';
import {STAGED,staged} from '../../scripts/word-chain-server-package.mjs';

let checks = 0;
const test = async (name, fn) => {await fn(); checks++; console.log('PASS', name);};

await test('staged Edge sources and dictionary match src/ and public/', () => {
  for (const [from, to, rewrites] of STAGED) assert.equal(readFileSync('supabase/functions/word-chain-room/' + to, 'utf8'), staged(from, rewrites), `${to} is stale; run npm run prepare:word-chain-server`);
  assert.equal(readFileSync('supabase/functions/word-chain-room/words.v1.json', 'utf8'), readFileSync('public/games/word-chain/words.v1.json', 'utf8'));
});

const db = new PGlite(); await db.waitReady;
await db.exec('create role anon; create role authenticated; create role service_role bypassrls;');
await db.exec(readFileSync('supabase/word-chain/schema.sql', 'utf8'));
const URL = 'https://project.example', KEY = 'service-key';
const users = {'tok-ann': {id: 'ann', user_metadata: {display_name: 'Ann'}}, 'tok-bob': {id: 'bob', email: 'bob@example.com'}, 'tok-cat': {id: 'cat'}, 'tok-dan': {id: 'dan'}, 'tok-eve': {id: 'eve'}, 'tok-anon': {id: 'anon-1', is_anonymous: true}};
let dropNextResponse = false;
globalThis.fetch = async (url, init = {}) => {
  const path = String(url).slice(URL.length);
  if (path === '/auth/v1/user') {
    const user = users[(init.headers.Authorization || '').replace('Bearer ', '')];
    return new Response(JSON.stringify(user || {}), {status: user ? 200 : 401});
  }
  const m = path.match(/^\/rest\/v1\/rpc\/(\w+)$/);
  assert.ok(m && init.headers.Authorization === `Bearer ${KEY}`, 'RPCs use the service key');
  const args = JSON.parse(init.body), names = Object.keys(args);
  try {
    const r = await db.query(`select public.${m[1]}(${names.map((n, i) => `${n} => $${i + 1}`).join(',')}) as v`, names.map(n => (typeof args[n] === 'object' && args[n] !== null ? JSON.stringify(args[n]) : args[n])));
    return new Response(JSON.stringify(m[1] === 'wc_room_due' ? r.rows.map(row => row.v) : r.rows[0].v ?? null), {status: 200});
  } catch (e) {return new Response(JSON.stringify({message: e.message}), {status: 400});}
};
const {outputFiles} = await build({entryPoints: ['supabase/functions/word-chain-room/index.ts'], bundle: true, write: false, platform: 'node', format: 'esm', logLevel: 'silent'});
const {handle} = await import('data:text/javascript;base64,' + Buffer.from(outputFiles[0].text).toString('base64'));
let clock = 1_000_000, actions = 0;
const call = async (token, body, extra = {}) => {
  const res = await handle(new Request('https://edge/word-chain-room', {method: 'POST', headers: {Authorization: `Bearer ${token}`, 'Content-Type': 'application/json', ...extra}, body: JSON.stringify(body)}), {url: URL, key: KEY}, clock);
  return {status: res.status, body: await res.json()};
};
const uuid = n => `00000000-0000-4000-8000-${String(n).padStart(12, '0')}`;
const snap = (tok, roomId) => call(tok, {type: 'snapshot', roomId});
const send = async (tok, roomId, command, actionId = `a${++actions}`) => {const v = (await snap(tok, roomId)).body; return call(tok, {type: 'command', roomId, version: v.version, actionId, command});};
const words = JSON.parse(readFileSync('public/games/word-chain/words.v1.json', 'utf8')).words;

await test('auth: bearer required, anonymous accounts refused, browser cannot tick', async () => {
  assert.equal((await handle(new Request('https://edge', {method: 'POST', body: '{}'}), {url: URL, key: KEY})).status, 401);
  assert.equal((await call('tok-anon', {type: 'snapshot', roomId: 'x'})).body.error, 'REGISTERED_ACCOUNT_REQUIRED');
  assert.equal((await call('nobody', {type: 'snapshot', roomId: 'x'})).status, 401);
  assert.equal((await call('tok-ann', {type: 'tick'})).status, 400);
  assert.equal((await call(KEY, {type: 'create'})).body.error, 'SERVICE_OPERATION_ONLY');
  assert.equal((await call('tok-ann', {type: 'create', requestId: 'nope', capacity: 2})).body.error, 'INVALID_REQUEST_ID');
});

let roomId, code;
await test('private room over HTTP: create, join by code, names come from the account', async () => {
  const c = await call('tok-ann', {type: 'create', requestId: uuid(1), capacity: 3});
  assert.equal(c.status, 200); roomId = c.body.id; code = c.body.code;
  assert.match(code, /^[A-Z2-9]{6}$/); assert.equal(typeof c.body.serverNow, 'number');
  clock += 1000; assert.equal((await call('tok-bob', {type: 'join', code: code.toLowerCase()})).body.seat, 'P2');
  clock += 1000; const full = await call('tok-cat', {type: 'join', code});
  assert.equal(full.body.status, 'active'); assert.equal(full.body.match.phase, 'ready');
  assert.deepEqual(full.body.roster.map(r => r.name), ['Ann', 'bob', 'Người chơi']);
  assert.equal((await call('tok-dan', {type: 'join', code})).body.error, 'ROOM_STARTED');
  assert.equal((await snap('tok-dan', roomId)).status, 403);
});

await test('ready, 3-2-1, server-checked words, retry after a lost response is a duplicate', async () => {
  for (const t of ['tok-ann', 'tok-bob', 'tok-cat']) {clock += 200; await send(t, roomId, {type: 'ready', ready: true});}
  clock += 3100;
  let v = (await snap('tok-ann', roomId)).body;
  assert.equal(v.match.phase, 'turn');
  const tok = {P1: 'tok-ann', P2: 'tok-bob', P3: 'tok-cat'}[v.match.turn];
  const need = v.match.words.at(-1).word.split(' ')[1];
  clock += 1000;
  const bad = await call(tok, {type: 'command', roomId, version: v.version, actionId: 'w1', command: {type: 'submit', word: need + ' qqq', turn: v.match.turnNumber}});
  assert.equal(bad.status, 200); assert.equal(bad.body.result.reason, 'unknown');
  const word = words.find(w => w.startsWith(need + ' ') && words.some(x => x.startsWith(w.split(' ')[1] + ' ')));
  clock += 1000;
  // The commit succeeds but the client never sees the answer; it retries with the same action id.
  const ok = await call(tok, {type: 'command', roomId, version: bad.body.version, actionId: 'w2', command: {type: 'submit', word, turn: v.match.turnNumber}});
  const retry = await call(tok, {type: 'command', roomId, version: bad.body.version, actionId: 'w2', command: {type: 'submit', word, turn: v.match.turnNumber}});
  assert.equal(ok.body.result.ok, true); assert.equal(retry.body.duplicate, true); assert.equal(retry.body.acceptedVersion, ok.body.acceptedVersion);
  const wrongTurn = await call(tok, {type: 'command', roomId, version: ok.body.version, actionId: 'w3', command: {type: 'submit', word: 'a b', turn: v.match.turnNumber}});
  assert.equal(wrongTurn.status, 400); assert.equal(wrongTurn.body.error, 'NOT_YOUR_TURN');
});

await test('scheduler tick (service key) eliminates on timeout without any client', async () => {
  const before = (await snap('tok-ann', roomId)).body.match;
  for (const t of ['tok-ann', 'tok-bob', 'tok-cat']) await snap(t, roomId);
  clock = before.deadline + 1;
  const tick = await call(KEY, {type: 'tick'});
  assert.equal(tick.status, 200); assert.equal(tick.body.updated, 1);
  const after = (await snap('tok-ann', roomId)).body.match;
  assert.equal(after.players.find(p => p.seat === before.turn).out.reason, 'timeout');
});

await test('matchmaking over HTTP: queued players share one public room; codes cannot join it', async () => {
  for (const t of ['tok-ann', 'tok-bob', 'tok-cat']) await send(t, roomId, {type: 'leave'});
  const views = [];
  for (const [i, t] of ['tok-ann', 'tok-bob', 'tok-cat', 'tok-dan'].entries()) {clock += 100; views.push((await call(t, {type: 'match', requestId: uuid(10 + i)})).body);}
  assert.equal(new Set(views.map(v => v.id)).size, 1, views.map(v => v.error || v.id).join());
  assert.deepEqual(views.map(v => v.seat), ['P1', 'P2', 'P3', 'P4']);
  const now = (await snap('tok-ann', views[0].id)).body;
  assert.equal(now.status, 'active'); assert.equal(now.match.players.length, 4);
  assert.equal((await call('tok-eve', {type: 'join', code: views[0].code})).body.error, 'QUEUE_ONLY');
});

await test('production bundle (when built) has no room server or review lab code', async () => {
  const {existsSync, readdirSync} = await import('node:fs');
  if (!existsSync('dist/assets')) return;
  for (const f of readdirSync('dist/assets').filter(f => f.endsWith('.js'))) {
    const js = readFileSync('dist/assets/' + f, 'utf8');
    assert.ok(!js.includes('LocalRoomStore') && !js.includes('word-chain-matchmaking') && !js.includes('Phòng thử 4 người'), `${f} ships review/server code`);
  }
});

console.log(`word-chain edge room: ${checks} checks passed`);
