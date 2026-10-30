// Authoritative duel referee and room server (src/games/duel/rules.ts, server.ts) with an
// in-memory store that enforces the same CAS/one-active-room contract as the SQL RPCs.
import { build } from 'esbuild';
import assert from 'node:assert/strict';

let checks = 0;
const test = async (name, run) => { await run(); checks++; console.log('PASS', name); };
const { outputFiles } = await build({ stdin: { contents: "export * from './src/games/duel/rules.ts'; export * from './src/games/duel/server.ts';", resolveDir: process.cwd(), loader: 'ts' }, bundle: true, write: false, platform: 'node', format: 'esm', logLevel: 'silent' });
const D = await import('data:text/javascript;base64,' + Buffer.from(outputFiles[0].text).toString('base64'));
const T0 = 1_000_000;
const play = (s, moves, t = T0) => moves.reduce((state, [seat, move], i) => D.applyMove(state, seat, move, t + i * 1000), s);
const rejects = (fn, pattern) => assert.throws(fn, e => e.name === 'RuleError' && (!pattern || pattern.test(e.message)));

// ------------------------------------------------------------------ referee
await test('chess: legal play, turn order and own-piece checks; scholar\'s mate ends the game for the mover', () => {
  let s = D.createDuel('chess', T0);
  rejects(() => D.applyMove(s, 'guest', { from: 'e7', to: 'e5' }, T0), /turn/);
  rejects(() => D.applyMove(s, 'host', { from: 'e2', to: 'e5' }, T0), /Illegal/);
  s = play(s, [['host', { from: 'e2', to: 'e4' }], ['guest', { from: 'e7', to: 'e5' }], ['host', { from: 'f1', to: 'c4' }], ['guest', { from: 'b8', to: 'c6' }], ['host', { from: 'd1', to: 'h5' }], ['guest', { from: 'g8', to: 'f6' }], ['host', { from: 'h5', to: 'f7' }]]);
  assert.equal(s.status, 'ended'); assert.equal(s.winner, 'host'); assert.equal(s.endReason, 'checkmate');
  assert.equal(s.moves.at(-1).notation, 'Qxf7#'); assert.equal(s.moves.at(-1).captured, 'p');
  rejects(() => D.applyMove(s, 'guest', { from: 'a7', to: 'a6' }, T0 + 9000), /over/);
});
await test('chess: guest moves first when the draw gives them white; promotions are validated', () => {
  let s = D.createDuel('chess', T0, { first: 'guest' });
  rejects(() => D.applyMove(s, 'host', { from: 'e2', to: 'e4' }, T0), /turn/);
  s = D.applyMove(s, 'guest', { from: 'e2', to: 'e4' }, T0);
  assert.equal(s.turn, 'host');
  rejects(() => D.applyMove(D.createDuel('chess', T0), 'host', { from: 'e2', to: 'e4', promotion: 'k' }, T0), /promotion/);
});
await test('xiangqi: red (first seat) moves first, illegal moves rejected, legal moves recorded as row,col', () => {
  let s = D.createDuel('xiangqi', T0);
  rejects(() => D.applyMove(s, 'host', { from: '0,0', to: '1,0' }, T0), /Not your piece/);
  rejects(() => D.applyMove(s, 'host', { from: '9,0', to: '5,1' }, T0), /Illegal/);
  rejects(() => D.applyMove(s, 'host', { from: '9', to: '8,0' }, T0), /coordinate/);
  s = D.applyMove(s, 'host', { from: '7,1', to: '7,4' }, T0);
  assert.equal(s.board[7][4].type, 'c'); assert.equal(s.board[7][1], null);
  assert.deepEqual([s.moves[0].from, s.moves[0].to, s.turn], ['7,1', '7,4', 'guest']);
});
await test('xiangqi: a side left without a legal move loses', () => {
  const s = D.createDuel('xiangqi', T0);
  const board = Array.from({ length: 10 }, () => Array(9).fill(null));
  board[0][4] = { id: 'bk', type: 'k', color: 'b' };
  board[2][3] = { id: 'r1', type: 'r', color: 'r' };
  board[2][5] = { id: 'r2', type: 'r', color: 'r' };
  board[9][3] = { id: 'rk', type: 'k', color: 'r' };
  const end = D.applyMove({ ...s, board }, 'host', { from: '2,3', to: '1,3' }, T0);
  assert.equal(end.status, 'ended'); assert.equal(end.winner, 'host'); assert.equal(end.endReason, 'checkmate');
});
await test('caro: occupied cells rejected, five in a row wins with the winning line, symbols follow seats', () => {
  let s = D.createDuel('caro', T0);
  s = D.applyMove(s, 'host', { to: '7,7' }, T0);
  rejects(() => D.applyMove(s, 'guest', { to: '7,7' }, T0 + 1), /occupied/);
  rejects(() => D.applyMove(s, 'guest', { to: '15,0' }, T0 + 1), /off board/);
  s = play(s, [['guest', { to: '0,0' }], ['host', { to: '8,7' }], ['guest', { to: '0,1' }], ['host', { to: '9,7' }], ['guest', { to: '0,2' }], ['host', { to: '10,7' }], ['guest', { to: '0,3' }], ['host', { to: '11,7' }]], T0 + 10);
  assert.equal(s.winner, 'host'); assert.equal(s.endReason, 'five_in_a_row');
  assert.deepEqual([...s.winningLine].sort(), ['10,7', '11,7', '7,7', '8,7', '9,7']);
  assert.equal(s.board['7_7'], 'X'); assert.equal(s.board['0_0'], 'O');
});
await test('timeouts, resignation and draw offers settle the game exactly once', () => {
  const s = D.createDuel('caro', T0, { turnMs: 30_000 });
  rejects(() => D.applyMove(s, 'host', { to: '1,1' }, T0 + 30_001), /expired/);
  assert.equal(D.advanceTime(s, T0 + 30_000), s);
  const timed = D.advanceTime(s, T0 + 30_001);
  assert.deepEqual([timed.winner, timed.endReason], ['guest', 'timeout']);
  assert.deepEqual([D.resign(s, 'host').winner, D.resign(s, 'host').endReason], ['guest', 'resign']);
  const offered = D.offerDraw(s, 'guest');
  rejects(() => D.respondDraw(offered, 'guest', true), /own offer/);
  rejects(() => D.offerDraw(offered, 'host'), /already/);
  assert.equal(D.respondDraw(offered, 'host', false).drawOffer, null);
  assert.deepEqual([D.respondDraw(offered, 'host', true).winner, D.respondDraw(offered, 'host', true).endReason], ['draw', 'draw_agreement']);
  assert.equal(D.applyMove(offered, 'host', { to: '3,3' }, T0).drawOffer, null, 'a move withdraws the open offer');
});

// ------------------------------------------------------------------ room server
class MemoryStore {
  rooms = new Map();
  active(uid, except) { return [...this.rooms.values()].some(r => r.status !== 'closed' && r.id !== except && Object.values(r.members).includes(uid)); }
  async create(room) {
    const existing = this.rooms.get(room.id);
    if (existing) { if (existing.members.host !== room.members.host) throw new Error('room ID conflict'); return structuredClone(existing); }
    if (this.active(room.members.host)) throw new D.RoomError('ACTIVE_ROOM', 'active');
    this.rooms.set(room.id, structuredClone(room)); return structuredClone(room);
  }
  async read(id) { const r = this.rooms.get(id); return r ? structuredClone(r) : null; }
  async byCode(code) { const r = [...this.rooms.values()].find(x => x.code === code); return r ? structuredClone(r) : null; }
  async cas(version, next) {
    next = structuredClone(next);
    const cur = this.rooms.get(next.id);
    if (!cur || cur.version !== version || next.version !== version + 1) return null;
    if (next.expiryGuard?.seats.some(seat => (cur.lastSeen[seat] ?? cur.createdAt) > next.expiryGuard.cutoff)) return null;
    next = { ...next, lastSeen: Object.fromEntries(Object.keys(next.members).map(k => [k, Math.max(cur.lastSeen[k] ?? cur.createdAt, next.lastSeen[k] ?? next.createdAt)])) };
    delete next.expiryGuard;
    if (next.status !== 'closed' && Object.values(next.members).some(uid => this.active(uid, next.id))) throw new D.RoomError('ACTIVE_ROOM', 'active');
    this.rooms.set(next.id, structuredClone(next)); return structuredClone(next);
  }
  async touch(id, uid, now) {
    const r = this.rooms.get(id); if (!r) return null;
    const seat = Object.entries(r.members).find(([, m]) => m === uid)?.[0];
    if (seat && r.status !== 'closed') r.lastSeen = { ...r.lastSeen, [seat]: now };
    return structuredClone(r);
  }
  async due() { return [...this.rooms.values()].filter(r => r.status !== 'closed').map(r => structuredClone(r)); }
}
const server = (store = new MemoryStore(), first = 'host') => ({ store, rooms: new D.DuelRoomServer(store, () => first) });

await test('rooms: create, join by code, server-picked colours and a host-only waiting view', async () => {
  const { rooms } = server(new MemoryStore(), 'guest');
  const created = await rooms.create('alice', 'room-1', 'ABC234', 'chess', T0);
  assert.deepEqual([created.status, created.seat, created.opponentJoined, created.state], ['waiting', 'host', false, null]);
  await assert.rejects(rooms.create('alice', 'room-2', 'XYZ234', 'chess', T0), e => e.code === 'ACTIVE_ROOM');
  await assert.rejects(rooms.create('carol', 'room-3', 'XYZ235', 'checkers', T0), e => e.code === 'BAD_GAME');
  const joined = await rooms.join('bob', ' abc234 ', T0 + 1000);
  assert.deepEqual([joined.status, joined.seat, joined.state.first, joined.state.turn], ['active', 'guest', 'guest', 'guest']);
  await assert.rejects(rooms.join('carol', 'ABC234', T0 + 2000), e => e.code === 'ROOM_FULL');
  await assert.rejects(rooms.snapshot('carol', 'room-1', T0 + 2000), e => e.code === 'NOT_MEMBER');
});
await test('rooms: commands need the current version, are idempotent per actionId and cannot be reused for another move', async () => {
  const { rooms } = server();
  await rooms.create('alice', 'r', 'ABC234', 'caro', T0);
  const joined = await rooms.join('bob', 'ABC234', T0 + 10);
  const first = await rooms.command('alice', 'r', joined.version, 'a1', { type: 'move', move: { to: '7,7' } }, T0 + 20);
  assert.equal(first.duplicate, false); assert.equal(first.state.moves.length, 1);
  const again = await rooms.command('alice', 'r', joined.version, 'a1', { type: 'move', move: { to: '7,7' } }, T0 + 30);
  assert.equal(again.duplicate, true); assert.equal(again.state.moves.length, 1);
  await assert.rejects(rooms.command('alice', 'r', first.version, 'a1', { type: 'move', move: { to: '1,1' } }, T0 + 40), e => e.code === 'ACTION_REUSED');
  await assert.rejects(rooms.command('bob', 'r', joined.version, 'b1', { type: 'move', move: { to: '1,1' } }, T0 + 40), e => e.code === 'VERSION_CONFLICT');
  await assert.rejects(rooms.command('alice', 'r', first.version, 'a2', { type: 'move', move: { to: '1,1' } }, T0 + 40), e => e.name === 'RuleError', 'out of turn');
  const bob = await rooms.command('bob', 'r', first.version, 'b1', { type: 'move', move: { to: '1,1' } }, T0 + 50);
  assert.equal(bob.state.board['1_1'], 'O');
});
await test('rooms: a finished game closes the room; leaving mid-game resigns and frees both players', async () => {
  const { rooms, store } = server();
  await rooms.create('alice', 'r', 'ABC234', 'chess', T0);
  let v = (await rooms.join('bob', 'ABC234', T0)).version;
  v = (await rooms.command('alice', 'r', v, 'x1', { type: 'move', move: { from: 'f2', to: 'f3' } }, T0 + 1)).version;
  v = (await rooms.command('bob', 'r', v, 'y1', { type: 'move', move: { from: 'e7', to: 'e5' } }, T0 + 2)).version;
  v = (await rooms.command('alice', 'r', v, 'x2', { type: 'move', move: { from: 'g2', to: 'g4' } }, T0 + 3)).version;
  const mate = await rooms.command('bob', 'r', v, 'y2', { type: 'move', move: { from: 'd8', to: 'h4' } }, T0 + 4);
  assert.deepEqual([mate.status, mate.state.winner, mate.state.endReason], ['closed', 'guest', 'checkmate']);
  await rooms.create('alice', 'r2', 'DEF234', 'caro', T0 + 10);
  const v2 = (await rooms.join('bob', 'DEF234', T0 + 10)).version;
  const left = await rooms.command('bob', 'r2', v2, 'leave', { type: 'leave' }, T0 + 20);
  assert.deepEqual([left.status, left.state.winner, left.state.endReason], ['closed', 'host', 'resign']);
  assert.equal(store.active('alice') || store.active('bob'), false);
});
await test('rooms: the scheduler settles turn timeouts and stale waiting rooms', async () => {
  const { rooms, store } = server();
  await rooms.create('alice', 'w', 'WAI234', 'caro', T0);
  assert.equal((await rooms.tick(T0 + D.WAITING_MS)).updated, 1);
  assert.equal(store.rooms.get('w').closeReason, 'expired');

  await rooms.create('alice', 't', 'TIM234', 'caro', T0);
  await rooms.join('bob', 'TIM234', T0);
  await rooms.snapshot('bob', 't', T0 + 25_000); await rooms.snapshot('alice', 't', T0 + 25_000);
  await rooms.tick(T0 + 30_001);
  assert.deepEqual([store.rooms.get('t').state.winner, store.rooms.get('t').state.endReason], ['guest', 'timeout']);

});
await test('rooms: an absent opponent forfeits after the 90 s reconnect grace, but not before', async () => {
  const { rooms, store } = server();
  await rooms.create('alice', 'g', 'GRA234', 'chess', T0);
  const joined = await rooms.join('bob', 'GRA234', T0);
  await rooms.command('alice', 'g', joined.version, 'm1', { type: 'move', move: { from: 'e2', to: 'e4' } }, T0 + 1000);
  await rooms.snapshot('alice', 'g', T0 + 50_000);
  assert.equal(store.rooms.get('g').status, 'active', 'still inside the grace window');
  await rooms.snapshot('alice', 'g', T0 + D.RECONNECT_MS);
  const g = store.rooms.get('g');
  assert.deepEqual([g.status, g.closeReason, g.state.winner, g.state.endReason], ['closed', 'disconnect', 'host', 'disconnect']);
});

await test('rooms: a heartbeat racing the absence forfeit wins (expiry guard)', async () => {
  const { rooms, store } = server();
  await rooms.create('alice', 'h', 'HBT234', 'chess', T0);
  await rooms.join('bob', 'HBT234', T0);
  const stale = await store.due(T0 + D.RECONNECT_MS + 1);
  // Bob reconnects after the scheduler read the room but before it writes the forfeit.
  await store.touch('h', 'bob', T0 + D.RECONNECT_MS + 1); await store.touch('h', 'alice', T0 + D.RECONNECT_MS + 1);
  const realDue = store.due.bind(store); store.due = async () => stale;
  assert.equal((await rooms.tick(T0 + D.RECONNECT_MS + 1)).updated, 0, 'forfeit rejected');
  store.due = realDue;
  assert.equal(store.rooms.get('h').status, 'active');
});

console.log(`duel authoritative: ${checks} checks passed`);
