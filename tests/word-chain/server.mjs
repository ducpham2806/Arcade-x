// Authoritative word-chain rooms (src/games/word-chain/server.ts) against an in-memory store that
// keeps the same contract as supabase/word-chain/schema.sql (CAS, one active room per identity,
// presence guard, N-seat matchmaking).
import {build} from 'esbuild';
import assert from 'node:assert/strict';
import {readFileSync} from 'node:fs';

let checks = 0;
const test = async (name, run) => {await run(); checks++; console.log('PASS', name);};
const {outputFiles} = await build({stdin: {contents: "export * from './src/games/word-chain/server.ts'; export * from './src/games/word-chain/rules.ts'; export {buildLexicon} from './src/games/word-chain/lexicon.ts'; export {wordKey} from './src/games/word-chain/normalize.ts';", resolveDir: process.cwd(), loader: 'ts'}, bundle: true, write: false, platform: 'node', format: 'esm', logLevel: 'silent'});
const W = await import('data:text/javascript;base64,' + Buffer.from(outputFiles[0].text).toString('base64'));
const lex = W.buildLexicon(JSON.parse(readFileSync('public/games/word-chain/words.v1.json', 'utf8')));
const T0 = 1_000_000, SEATS = ['P1', 'P2', 'P3', 'P4'];

export class MemoryStore {
  rooms = new Map();
  active(uid, except) {return [...this.rooms.values()].some(r => r.status !== 'closed' && r.id !== except && Object.values(r.members).includes(uid));}
  async create(room) {
    const existing = this.rooms.get(room.id);
    if (existing) {if (existing.members.P1 !== room.members.P1) throw new Error('room ID conflict'); return structuredClone(existing);}
    if (this.active(room.members.P1)) throw new W.RoomError('ACTIVE_ROOM', 'active');
    this.rooms.set(room.id, structuredClone(room)); return structuredClone(room);
  }
  async read(id) {const r = this.rooms.get(id); return r ? structuredClone(r) : null;}
  async byCode(code) {const r = [...this.rooms.values()].find(x => x.code === code); return r ? structuredClone(r) : null;}
  async cas(version, next) {
    next = structuredClone(next);
    const cur = this.rooms.get(next.id);
    if (!cur || cur.version !== version || next.version !== version + 1) return null;
    if (next.expiryGuard?.seats.some(s => (cur.lastSeen[s] ?? cur.createdAt) > next.expiryGuard.cutoff)) return null;
    next.lastSeen = Object.fromEntries(Object.keys(next.members).map(k => [k, Math.max(cur.lastSeen[k] ?? cur.createdAt, next.lastSeen[k] ?? next.createdAt)]));
    delete next.expiryGuard;
    if (next.status !== 'closed' && Object.values(next.members).some(uid => this.active(uid, next.id))) throw new W.RoomError('ACTIVE_ROOM', 'active');
    this.rooms.set(next.id, structuredClone(next)); return structuredClone(next);
  }
  async touch(id, uid, now) {
    const r = this.rooms.get(id); if (!r) return null;
    const seat = Object.entries(r.members).find(([, m]) => m === uid)?.[0];
    if (seat && r.status !== 'closed' && (r.lastSeen[seat] ?? r.createdAt) > now - 90000) r.lastSeen = {...r.lastSeen, [seat]: now};
    return structuredClone(r);
  }
  async due() {return [...this.rooms.values()].filter(r => r.status !== 'closed').map(r => structuredClone(r));}
  async match(uid, fresh, name, now) {
    const mine = [...this.rooms.values()].find(r => r.status !== 'closed' && Object.values(r.members).includes(uid));
    if (mine) return structuredClone(mine);
    const open = [...this.rooms.values()].filter(r => r.status === 'waiting' && r.public && r.createdAt > now - 600000 && Object.keys(r.members).length < r.capacity
      && Object.keys(r.members).some(s => (r.lastSeen[s] ?? r.createdAt) > now - 90000)).sort((a, b) => a.createdAt - b.createdAt)[0];
    if (!open) return this.create(fresh);
    const seat = SEATS.find(s => !open.members[s]);
    const next = {...open, version: open.version + 1, members: {...open.members, [seat]: uid}, names: {...open.names, [seat]: name}, lastSeen: {...open.lastSeen, [seat]: now}};
    if (Object.keys(next.members).length >= 2 && next.pairAt === undefined) next.pairAt = now;
    this.rooms.set(next.id, structuredClone(next)); return structuredClone(next);
  }
}
let seed = 6;
const setup = () => {const store = new MemoryStore(); return {store, rooms: new W.WordChainRoomServer(store, lex, () => seed)};};
// A valid reply that still leaves replies (keeps scripted matches alive).
const reply = m => {const used = new Set(m.words.map(w => w.key)), need = m.words.at(-1).word.split(' ')[1], fresh = lex.startingWith(need).filter(w => !used.has(W.wordKey(w)));
  return fresh.find(w => lex.startingWith(w.split(' ')[1]).some(x => !used.has(W.wordKey(x)) && x !== w)) ?? fresh[0];};
let action = 0;
const cmd = async (rooms, uid, id, command, now) => {const v = await rooms.snapshot(uid, id, now); return rooms.command(uid, id, v.version, `a${++action}`, command, now);};
const uidOf = (seat, names) => names[seat];

await test('private room: create, join by code, auto start when full, membership checks', async () => {
  const {rooms} = setup();
  const a = await rooms.create('ann', 'r1', 'ABC234', 'Ann', 3, T0);
  assert.deepEqual([a.status, a.seat, a.host, a.capacity, a.match], ['waiting', 'P1', 'P1', 3, null]);
  await assert.rejects(rooms.create('ann', 'r2', 'XYZ234', 'Ann', 2, T0), e => e.code === 'ACTIVE_ROOM');
  await assert.rejects(rooms.create('cat', 'r3', 'XYZ235', 'Cat', 5, T0), e => e.code === 'BAD_CAPACITY');
  const b = await rooms.join('bob', ' abc234 ', 'Bob', T0 + 1000);
  assert.deepEqual([b.status, b.seat], ['waiting', 'P2']);
  const c = await rooms.join('cat', 'ABC234', 'Cat <script>', T0 + 2000);
  assert.equal(c.status, 'active'); assert.equal(c.match.phase, 'ready'); assert.equal(c.match.players.length, 3);
  assert.equal(c.roster.find(r => r.seat === 'P3').name, 'Cat script');
  await assert.rejects(rooms.join('dan', 'ABC234', 'Dan', T0 + 3000), e => e.code === 'ROOM_STARTED');
  await assert.rejects(rooms.snapshot('dan', 'r1', T0 + 3000), e => e.code === 'NOT_MEMBER');
  assert.equal(c.match.seed, 0, 'seed hidden'); assert.ok(!JSON.stringify(c).includes('ann'), 'no uids in the view');
});

await test('host starts early with two players; others cannot', async () => {
  const {rooms} = setup();
  await rooms.create('ann', 'r1', 'ABC234', 'Ann', 4, T0);
  await assert.rejects(cmd(rooms, 'ann', 'r1', {type: 'start'}, T0 + 10), e => e.code === 'NEED_PLAYERS');
  await rooms.join('bob', 'ABC234', 'Bob', T0 + 100);
  await assert.rejects(cmd(rooms, 'bob', 'r1', {type: 'start'}, T0 + 200), e => e.code === 'HOST_ONLY');
  const s = await cmd(rooms, 'ann', 'r1', {type: 'start'}, T0 + 300);
  assert.equal(s.status, 'active'); assert.equal(s.match.phase, 'ready'); assert.equal(s.match.deadline, T0 + 300 + 30000);
});

await test('ready check, 3-2-1, words checked on the server; idempotent actions and version conflicts', async () => {
  const {rooms} = setup();
  await rooms.create('ann', 'r1', 'ABC234', 'Ann', 2, T0); await rooms.join('bob', 'ABC234', 'Bob', T0 + 100);
  await cmd(rooms, 'ann', 'r1', {type: 'ready', ready: true}, T0 + 200);
  const r = await cmd(rooms, 'bob', 'r1', {type: 'ready', ready: true}, T0 + 300);
  assert.equal(r.match.phase, 'countdown');
  let v = await rooms.snapshot('ann', 'r1', T0 + 300 + 3000);
  assert.equal(v.match.phase, 'turn');
  const turnUid = {P1: 'ann', P2: 'bob'}[v.match.turn], other = turnUid === 'ann' ? 'bob' : 'ann';
  await assert.rejects(rooms.command(other, 'r1', v.version, 'x1', {type: 'submit', word: 'abc', turn: v.match.turnNumber}, T0 + 4000), e => e.name === 'RuleError');
  const bad = await rooms.command(turnUid, 'r1', v.version, 'x2', {type: 'submit', word: v.match.words[0].word.split(' ')[1] + ' qqq', turn: v.match.turnNumber}, T0 + 4000);
  assert.equal(bad.result.ok, false); assert.equal(bad.result.reason, 'unknown'); assert.equal(bad.match.turn, v.match.turn);
  const again = await rooms.command(turnUid, 'r1', v.version, 'x2', {type: 'submit', word: v.match.words[0].word.split(' ')[1] + ' qqq', turn: v.match.turnNumber}, T0 + 4100);
  assert.equal(again.duplicate, true);
  await assert.rejects(rooms.command(turnUid, 'r1', bad.version, 'x2', {type: 'forfeit'}, T0 + 4200), e => e.code === 'ACTION_REUSED');
  await assert.rejects(rooms.command(turnUid, 'r1', v.version, 'x3', {type: 'submit', word: 'a b', turn: v.match.turnNumber}, T0 + 4200), e => e.code === 'VERSION_CONFLICT');
  const word = reply(bad.match);
  const ok = await rooms.command(turnUid, 'r1', bad.version, 'x4', {type: 'submit', word, turn: bad.match.turnNumber}, T0 + 5000);
  assert.equal(ok.result.ok, true); assert.notEqual(ok.match.turn, bad.match.turn); assert.equal(ok.match.words.at(-1).word, word);
  await assert.rejects(rooms.command(other, 'r1', ok.version, 'x5', {type: 'submit', word: reply(ok.match), turn: bad.match.turnNumber}, T0 + 6000), e => e.code === 'NOT_YOUR_TURN');
});

await test('scheduler: turn timeouts eliminate, last player wins, rematch vote restarts or the room closes', async () => {
  const {rooms, store} = setup();
  await rooms.create('ann', 'r1', 'ABC234', 'Ann', 2, T0); await rooms.join('bob', 'ABC234', 'Bob', T0 + 100);
  await cmd(rooms, 'ann', 'r1', {type: 'ready', ready: true}, T0 + 200); await cmd(rooms, 'bob', 'r1', {type: 'ready', ready: true}, T0 + 300);
  const start = (await rooms.snapshot('ann', 'r1', T0 + 3300)).match;
  // Keep both seats present (heartbeats) while the first turn runs out.
  await rooms.snapshot('bob', 'r1', start.deadline - 100);
  assert.deepEqual(await rooms.tick(start.deadline + 1), {updated: 1});
  const done = store.rooms.get('r1');
  assert.equal(done.match.phase, 'finished'); assert.equal(done.status, 'active'); assert.ok(done.rematch && done.rematch.until > start.deadline);
  assert.equal(done.match.players.find(p => p.seat === start.turn).out.reason, 'timeout');
  await cmd(rooms, 'ann', 'r1', {type: 'rematch'}, start.deadline + 2000);
  const re = await cmd(rooms, 'bob', 'r1', {type: 'rematch'}, start.deadline + 3000);
  assert.equal(re.match.phase, 'ready'); assert.equal(re.rematch, null);
  // Second match: nobody readies; with fewer than two ready the room goes back to waiting... and
  // here both leave the room as unready, so it closes.
  await rooms.snapshot('ann', 'r1', start.deadline + 20000);
  await rooms.tick(start.deadline + 3000 + 30001);
  assert.equal(store.rooms.get('r1').status, 'closed');
  // Both are free to start new rooms.
  await rooms.create('ann', 'r9', 'NEW234', 'Ann', 2, start.deadline + 40000);
});

await test('ready deadline: unready players leave the room; enough ready players still play', async () => {
  const {rooms, store} = setup();
  await rooms.create('ann', 'r1', 'ABC234', 'Ann', 3, T0); await rooms.join('bob', 'ABC234', 'Bob', T0 + 1); await rooms.join('cat', 'ABC234', 'Cat', T0 + 2);
  await cmd(rooms, 'ann', 'r1', {type: 'ready', ready: true}, T0 + 100); await cmd(rooms, 'bob', 'r1', {type: 'ready', ready: true}, T0 + 200);
  await rooms.snapshot('cat', 'r1', T0 + 20000);
  await rooms.tick(T0 + 2 + 30000);
  const r = store.rooms.get('r1');
  assert.equal(r.match.phase, 'countdown'); assert.deepEqual(Object.values(r.members).sort(), ['ann', 'bob']);
  await rooms.create('cat', 'r2', 'CAT234', 'Cat', 2, T0 + 40000);
  await assert.rejects(rooms.snapshot('cat', 'r1', T0 + 40000), e => e.code === 'NOT_MEMBER');
});

await test('absence: a seat unseen for 90 s is eliminated, the others keep playing', async () => {
  const {rooms, store} = setup();
  await rooms.create('ann', 'r1', 'ABC234', 'Ann', 3, T0); await rooms.join('bob', 'ABC234', 'Bob', T0 + 1); await rooms.join('cat', 'ABC234', 'Cat', T0 + 2);
  for (const u of ['ann', 'bob', 'cat']) await cmd(rooms, u, 'r1', {type: 'ready', ready: true}, T0 + 100);
  let t = T0 + 3200, m = (await rooms.snapshot('ann', 'r1', t)).match;
  const uid = {P1: 'ann', P2: 'bob', P3: 'cat'};
  // Two players answer quickly for a while; "cat" stops sending heartbeats.
  for (let i = 0; i < 40 && store.rooms.get('r1').members.P3 && m.phase === 'turn'; i++) {
    t += 4000; const turnUid = uid[m.turn];
    if (turnUid === 'cat') {for (const u of ['ann', 'bob']) await rooms.snapshot(u, 'r1', t); m = store.rooms.get('r1').match; if (m.turn === 'P3' || !m.turn) {t += 30000; await rooms.snapshot('ann', 'r1', t); await rooms.snapshot('bob', 'r1', t); m = store.rooms.get('r1').match;} continue;}
    const s = await cmd(rooms, turnUid, 'r1', {type: 'submit', word: reply(m), turn: m.turnNumber}, t); m = s.match;
  }
  const r = store.rooms.get('r1'), cat = r.match.players.find(p => p.seat === 'P3');
  assert.ok(cat.out, 'cat is out'); assert.ok(['absent', 'timeout'].includes(cat.out.reason));
  assert.ok(r.status !== 'closed');
});

await test('absence in the lobby frees the seat and passes the host role on', async () => {
  const {rooms, store} = setup();
  await rooms.create('ann', 'r1', 'ABC234', 'Ann', 4, T0); await rooms.join('bob', 'ABC234', 'Bob', T0 + 1);
  await rooms.snapshot('bob', 'r1', T0 + 80000);
  const v = await rooms.snapshot('bob', 'r1', T0 + 95000);
  assert.equal(v.host, 'P2'); assert.equal(v.roster.length, 1); assert.equal(store.rooms.get('r1').members.P1, undefined);
});

await test('leave: during a match the player is eliminated and free; leaving the last seat closes the room', async () => {
  const {rooms, store} = setup();
  await rooms.create('ann', 'r1', 'ABC234', 'Ann', 2, T0); await rooms.join('bob', 'ABC234', 'Bob', T0 + 1);
  for (const u of ['ann', 'bob']) await cmd(rooms, u, 'r1', {type: 'ready', ready: true}, T0 + 10);
  await rooms.snapshot('ann', 'r1', T0 + 3100);
  const left = await cmd(rooms, 'bob', 'r1', {type: 'leave'}, T0 + 4000);
  assert.equal(left.duplicate, false);
  const r = store.rooms.get('r1');
  assert.equal(r.match.phase, 'finished'); assert.equal(r.match.winner, 'P1'); assert.equal(r.members.P2, undefined);
  await rooms.create('bob', 'r2', 'BOB234', 'Bob', 2, T0 + 5000);
  await cmd(rooms, 'ann', 'r1', {type: 'leave'}, T0 + 6000);
  assert.equal(store.rooms.get('r1').status, 'closed');
});

await test('matchmaking: up to four players share a public room; it starts when full or 20 s after the second player', async () => {
  const {rooms, store} = setup();
  const views = [];
  for (const [i, u] of ['ann', 'bob', 'cat', 'dan'].entries()) views.push(await rooms.match(u, `q${i}`, 'QUEUE' + 'ABCD'[i], u, T0 + i * 100));
  assert.deepEqual(views.map(v => v.seat), ['P1', 'P2', 'P3', 'P4']);
  assert.equal(new Set(views.map(v => v.id)).size, 1);
  assert.equal(views[3].status, 'active'); assert.equal(views[3].match.players.length, 4);
  // Replaying a queue request returns the same room.
  assert.equal((await rooms.match('bob', 'qx', 'QXAAAA', 'bob', T0 + 500)).id, views[0].id);
  await assert.rejects(rooms.join('eve', views[0].code, 'Eve', T0 + 600), e => e.code === 'QUEUE_ONLY');
  // Two players: auto start 20 s after the pair formed.
  const a = await rooms.match('eve', 'q5', 'EVEAAA', 'Eve', T0 + 1000), b = await rooms.match('fay', 'q6', 'FAYAAA', 'Fay', T0 + 2000);
  assert.equal(a.id, b.id); assert.equal(b.autoStartAt, T0 + 2000 + 20000);
  await rooms.snapshot('eve', a.id, T0 + 15000);
  assert.deepEqual(await rooms.tick(T0 + 22001), {updated: 1});
  assert.equal(store.rooms.get(a.id).match.phase, 'ready');
});

await test('reactions: fixed set, one every 2 s per seat, kept to the last 12', async () => {
  const {rooms} = setup();
  await rooms.create('ann', 'r1', 'ABC234', 'Ann', 2, T0); await rooms.join('bob', 'ABC234', 'Bob', T0 + 1);
  const r = await cmd(rooms, 'ann', 'r1', {type: 'react', emoji: '🔥'}, T0 + 100);
  assert.deepEqual(r.reactions.map(x => [x.seat, x.emoji]), [['P1', '🔥']]);
  await assert.rejects(cmd(rooms, 'ann', 'r1', {type: 'react', emoji: '😂'}, T0 + 500), e => e.code === 'TOO_FAST');
  await assert.rejects(cmd(rooms, 'bob', 'r1', {type: 'react', emoji: 'lol'}, T0 + 500), e => e.code === 'BAD_REACTION');
});

await test('waiting rooms expire after 10 minutes; nextDeadline mirrors the scheduler', async () => {
  const {rooms, store} = setup();
  await rooms.create('ann', 'r1', 'ABC234', 'Ann', 3, T0);
  assert.equal(W.nextDeadline(store.rooms.get('r1')), T0 + W.WAITING_MS);
  for (let t = T0 + 60000; t < T0 + W.WAITING_MS; t += 60000) await rooms.snapshot('ann', 'r1', t);
  await rooms.tick(T0 + W.WAITING_MS);
  assert.equal(store.rooms.get('r1').closeReason, 'expired');
});

console.log(`word-chain server: ${checks} checks passed`);
