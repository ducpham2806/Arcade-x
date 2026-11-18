import test from 'node:test';
import assert from 'node:assert/strict';
import { readFileSync } from 'node:fs';
import { build } from 'esbuild';
import { PGlite } from '@electric-sql/pglite';
import { randomUUID } from 'node:crypto';

async function load(path) {
  const { outputFiles } = await build({ entryPoints: [path], bundle: true, write: false, platform: 'node', format: 'esm' });
  return import('data:text/javascript;base64,' + Buffer.from(outputFiles[0].text).toString('base64'));
}

const { handleFolkRequest } = await load('supabase/functions/folk-duel-room/index.ts');
const { FolkOnlineClient, FolkNetworkError } = await load('src/games/folk-duel/online-client.ts');
const { buildHopSequence, getNlcTargetBox } = await load('src/games/nhay-lo-co/rules.ts');
const db = new PGlite();
await db.waitReady;
await db.exec('create role anon; create role authenticated; create role service_role bypassrls');
await db.exec(readFileSync('supabase/folk-duel/schema.sql', 'utf8'));

const ids = { alice: randomUUID(), bob: randomUUID(), carol: randomUUID(), dave: randomUUID() };
const env = { url: 'https://folk.example', key: 'service-only-key' };
const tickToken = 'a'.repeat(64);
await db.query("insert into folk_duel.scheduler_auth(token_hash) values (encode(sha256(convert_to($1, 'UTF8')),'hex'))", [tickToken]);
const realFetch = globalThis.fetch;
globalThis.fetch = async (url, init) => {
  if (url === env.url + '/auth/v1/user') {
    const token = init.headers.Authorization.slice(7);
    return new Response(JSON.stringify(token === 'anonymous' ? { id: randomUUID(), is_anonymous: true } :
      ids[token] ? { id: ids[token], is_anonymous: false } : {}), { status: ids[token] || token === 'anonymous' ? 200 : 401 });
  }
  const rpc = String(url).match(/\/rpc\/(folk_room_\w+)$/)?.[1];
  assert.ok(rpc);
  assert.equal(init.headers.Authorization, 'Bearer ' + env.key);
  const args = JSON.parse(init.body);
  const names = Object.keys(args);
  try {
    const result = await db.query(`select public.${rpc}(${names.map((name, i) => `${name} => $${i + 1}`).join(',')}) value`,
      names.map(name => typeof args[name] === 'object' && args[name] !== null ? JSON.stringify(args[name]) : args[name]));
    return Response.json(result.rows[0]?.value ?? null);
  } catch (error) {
    return Response.json({ message: error.message }, { status: 400 });
  }
};

let now = 1_000_000;
const call = async (user, body) => {
  const response = await handleFolkRequest(new Request('https://edge/folk-duel-room', {
    method: 'POST', headers: { Authorization: 'Bearer ' + user }, body: JSON.stringify(body),
  }), env, now);
  return { status: response.status, ...await response.json() };
};
const enter = (user, game, type = 'create') => call(user, { game, type, requestId: randomUUID(), name: user });
const join = (user, room) => call(user, { game: room.game, type: 'join', code: room.code, name: user });
const snapshot = (user, room) => call(user, { game: room.game, type: 'snapshot', roomId: room.roomId });
const act = (user, room, command, actionId = randomUUID()) => call(user, {
  game: room.game, type: 'command', roomId: room.roomId, version: room.version, command, actionId,
});

let oaq, nlc;
test.after(async () => { globalThis.fetch = realFetch; await db.close(); });

test('Edge Auth, payload validation and service-only database access', async () => {
  assert.equal((await enter('missing', 'o-an-quan')).status, 401);
  assert.equal((await enter('anonymous', 'o-an-quan')).status, 403);
  assert.equal((await call('alice', { game: 'o-an-quan', type: 'create', requestId: 'x', name: 'x' })).status, 400);
  assert.equal((await call('alice', { game: 'o-an-quan', type: 'join', code: 'bad', name: 'x' })).status, 400);
  assert.equal((await call('alice', { padding: 'x'.repeat(5000) })).status, 413);
  assert.equal((await call(env.key, { type: 'create' })).status, 400);
  assert.equal((await call('alice', { type: 'tick' })).status, 403);
  for (const role of ['anon', 'authenticated']) {
    await db.exec(`set role ${role}`);
    await assert.rejects(db.query('select * from folk_duel.room_documents'), /permission denied/);
    await assert.rejects(db.query("select public.folk_room_lookup('o-an-quan', $1, 'resume', '', 0)", [ids.alice]), /permission denied/);
    await db.exec('reset role');
  }
});

test('create and join give sanitized views, isolate games and reject third member', async () => {
  const created = await enter('alice', 'o-an-quan');
  assert.equal(created.status, 200);
  oaq = created.room;
  assert.match(oaq.code, /^[A-Z2-9]{6}$/);
  assert.equal(oaq.mySeat, 'P1');
  assert.ok(!JSON.stringify(created).includes(ids.alice));
  assert.ok(!('receipts' in oaq));
  assert.equal((await snapshot('carol', oaq)).status, 403);
  assert.equal((await call('bob', { game: 'nhay-lo-co', type: 'join', code: oaq.code, name: 'bob' })).status, 404);
  const joined = await join('bob', oaq);
  assert.equal(joined.room.mySeat, 'P2');
  assert.equal(joined.room.phase, 'countdown');
  assert.equal((await join('carol', oaq)).status, 409);
  now += 3000;
  oaq = (await snapshot('alice', oaq)).room;
  assert.equal(oaq.phase, 'playing');
});

test('moves use authoritative rules, preserve history and exact retry receipts', async () => {
  assert.equal((await act('bob', oaq, { type: 'sow', move: { cellIndex: 7, direction: 'CW' } })).error, 'NOT_YOUR_TURN');
  assert.equal((await act('alice', oaq, { type: 'sow', move: { cellIndex: 1, direction: 'wat' } })).status, 400);
  const move = { type: 'sow', move: { cellIndex: 1, direction: 'CW' } };
  const id = randomUUID();
  const accepted = await act('alice', oaq, move, id);
  assert.equal(accepted.accepted, true);
  assert.equal(accepted.room.state.turn, 'P2');
  assert.equal(accepted.room.state.history.length, 1);
  assert.ok(accepted.room.readyAt > now);
  assert.equal(accepted.room.deadlineAt - accepted.room.readyAt, 25000);
  assert.equal((await act('bob', accepted.room, { type: 'sow', move: { cellIndex: 7, direction: 'CW' } })).error, 'PRESENTING');
  const duplicate = await act('alice', oaq, move, id);
  assert.equal(duplicate.accepted, true);
  assert.deepEqual(duplicate.room.state, accepted.room.state);
  assert.equal((await act('alice', oaq, { type: 'sow', move: { cellIndex: 2, direction: 'CW' } }, id)).error, 'ACTION_REUSED');
  assert.equal((await act('alice', oaq, move)).error, 'VERSION_CONFLICT');
  oaq = accepted.room;
  const resumed = await call('alice', { game: oaq.game, type: 'resume' });
  assert.equal(resumed.room.state.history.length, 1);
  assert.equal(resumed.room.roomId, oaq.roomId);
});

test('room chat uses private members, independent board version and deduplicated sends', async () => {
  const id = randomUUID();
  const first = await act('alice', oaq, { type: 'chat', text: '  Chào\n bạn! ' }, id);
  assert.equal(first.accepted, true);
  assert.equal(first.room.version, oaq.version);
  assert.equal(first.room.chat[0].text, 'Chào bạn!');
  assert.equal((await act('alice', oaq, { type: 'chat', text: '  Chào\n bạn! ' }, id)).room.chat.length, 1);
  assert.equal((await act('alice', oaq, { type: 'chat', text: 'gửi liên tục' })).error, 'SLOW_CHAT');
  assert.equal((await act('carol', oaq, { type: 'chat', text: 'thử đọc' })).status, 403);
  const second = await act('bob', oaq, { type: 'chat', text: 'Chào!' });
  assert.equal(second.room.chat.length, 2);
  assert.equal(second.room.version, oaq.version);
});

test('FIFO matchmaking serializes simultaneous entrants and prevents two active rooms', async () => {
  const [first, second] = await Promise.all([enter('carol', 'nhay-lo-co', 'match'), enter('dave', 'nhay-lo-co', 'match')]);
  assert.equal(first.status, 200);
  assert.equal(second.status, 200);
  assert.equal(first.room.roomId, second.room.roomId);
  nlc = (await snapshot('carol', first.room)).room;
  assert.equal(nlc.players.length, 2);
  assert.equal((await enter('carol', 'nhay-lo-co')).room.roomId, nlc.roomId);
  assert.equal((await db.query("select count(*) total from folk_duel.room_documents where game='nhay-lo-co'")).rows[0].total, 1);
});

test('NLC checks each timed action and scores without accepting client results', async () => {
  now += 3000;
  const host = nlc.players.find(p => p.seat === 'P1').name;
  const guest = nlc.players.find(p => p.seat === 'P2').name;
  nlc = (await snapshot(host, nlc)).room;
  assert.equal(nlc.phase, 'playing');
  assert.equal((await act(host, nlc, { type: 'TURN_RESULT', hopCompleted: true, scoreGained: 999 })).status, 400);
  assert.equal((await act(guest, nlc, { type: 'throw' })).error, 'NOT_YOUR_TURN');
  let result = await act(host, nlc, { type: 'throw' });
  assert.equal(result.accepted, true);
  nlc = result.room;
  assert.equal(nlc.nlc.phase, 'HOP');
  assert.equal((await act(host, nlc, { type: 'hop', feet: 'SINGLE' })).error, 'TOO_EARLY');
  const sequence = buildHopSequence(getNlcTargetBox(nlc.state, 'P1'), nlc.state.houses, 'P1');
  for (const step of sequence) {
    now += 130;
    result = await act(host, nlc, { type: 'hop', feet: step.expectedHop });
    assert.equal(result.accepted, true);
    nlc = result.room;
    if (nlc.nlc.phase === 'PICKUP') {
      assert.equal((await act(host, nlc, { type: 'pickup' })).error, 'TOO_EARLY');
      now = nlc.nlc.since;
      nlc = (await act(host, nlc, { type: 'pickup' })).room;
    }
  }
  assert.equal(nlc.state.houses[1], 'P1');
  assert.equal(nlc.state.turn, 'P2');
  assert.equal(nlc.state.scores.P1, 65);
  assert.equal(nlc.nlc.phase, 'THROW');
  const wrong = await act(guest, nlc, { type: 'hop', feet: 'SINGLE' });
  assert.equal(wrong.error, 'BAD_PHASE');
});

test('scheduler settles unobserved timeout once and rematch starts a fresh round with alternate first', async () => {
  now = oaq.deadlineAt;
  const settled = await call(tickToken, { type: 'tick' });
  assert.ok(settled.settled >= 1);
  oaq = (await snapshot('alice', oaq)).room;
  assert.equal(oaq.phase, 'finished');
  assert.equal(oaq.winner, 'P1');
  assert.equal(oaq.finishReason, 'timeout');
  assert.equal((await call(tickToken, { type: 'tick' })).settled, 0);
  assert.equal((await db.query('select count(*) total from folk_duel.outcomes where room_id=$1', [oaq.roomId])).rows[0].total, 1);
  const previous = oaq.matchId;
  const votes = await Promise.all([act('alice', oaq, { type: 'rematch' }), act('bob', oaq, { type: 'rematch' })]);
  assert.ok(votes.every(vote => vote.accepted));
  oaq = (await snapshot('alice', oaq)).room;
  assert.equal(oaq.phase, 'countdown');
  assert.notEqual(oaq.matchId, previous);
  assert.equal(oaq.state.turn, 'P2');
  assert.deepEqual(oaq.chat, []);
  assert.deepEqual(oaq.state.history, undefined);
});

test('leave receipt can be retried and releases room membership for both players', async () => {
  const id = randomUUID();
  const result = await act('alice', oaq, { type: 'leave' }, id);
  assert.equal(result.accepted, true);
  assert.equal(result.room, null);
  assert.equal((await act('alice', oaq, { type: 'leave' }, id)).accepted, true);
  assert.equal((await snapshot('alice', oaq)).status, 403);
  const opponent = await snapshot('bob', oaq);
  assert.equal(opponent.room.winner, 'P2');
  assert.equal(opponent.room.finishReason, 'forfeit');
  assert.equal((await act('bob', opponent.room, { type: 'chat', text: 'muộn' })).error, 'CHAT_CLOSED');
  assert.equal((await call('alice', { game: oaq.game, type: 'resume' })).room, null);
  assert.equal((await enter('alice', 'o-an-quan')).room.phase, 'lobby');
});

test('client retains exact uncertain commands, retries and preserves state identity for chat-only updates', async () => {
  let drop = false;
  const transport = async body => {
    const response = await call('bob', body);
    if (drop) { drop = false; throw new FolkNetworkError('NETWORK', 'Mất kết nối', true); }
    if (response.status !== 200) throw new FolkNetworkError(response.error, response.message);
    return response;
  };
  const client = new FolkOnlineClient('nhay-lo-co', transport);
  await client.enter('create', 'bob');
  assert.equal(client.room.mySeat, 'P1');
  const before = client.room.state;
  await client.refresh();
  assert.equal(client.room.state, before);
  drop = true;
  const result = await client.command({ type: 'leave' });
  assert.equal(result, false);
  const pending = client.pending;
  assert.ok(pending);
  assert.equal(await client.retry(), true);
  assert.equal(client.pending, null);
  assert.equal(client.room, null);
  assert.equal((await snapshot('bob', { game: 'nhay-lo-co', roomId: pending.roomId })).status, 403);
  client.close();
});

test('request budget bounds reads and resets after its window', async () => {
  now += 20000;
  for (let i = 0; i < 22; i++) {
    assert.equal((await call('dave', { game: 'o-an-quan', type: 'resume' })).status, 200);
  }
  assert.equal((await call('dave', { game: 'o-an-quan', type: 'resume' })).status, 429);
  now += 10001;
  assert.equal((await call('dave', { game: 'o-an-quan', type: 'resume' })).status, 200);
});
