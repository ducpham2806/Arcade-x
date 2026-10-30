// Golden regression for SupabaseService: bundles src/services/supabase with an in-memory,
// call-recording cloudStore, then replays every public method offline (no database) and
// online (seeded documents). Each step's return value, callback payloads, cloud calls,
// window events and localStorage are hashed and compared to supabase-golden.json.
// Run with --update after an intentional change.
process.env.TZ = 'UTC';
import {build} from 'esbuild';
import {readFile, writeFile} from 'node:fs/promises';
import {createHash} from 'node:crypto';
import path from 'node:path';
import assert from 'node:assert/strict';

const GOLDEN = path.resolve('tests/storage/supabase-golden.json');
const ENTRY = process.argv.find(a => a.startsWith('--entry='))?.slice(8) || 'src/services/supabase/index.ts';
const update = process.argv.includes('--update');

const store = new Map();
globalThis.localStorage = {
  getItem: k => (store.has(k) ? store.get(k) : null), setItem: (k, v) => void store.set(k, String(v)),
  removeItem: k => void store.delete(k), clear: () => store.clear(),
  key: i => [...store.keys()][i] ?? null, get length() { return store.size; },
};
const NOW = Date.parse('2026-10-30T10:00:00Z');
const RealDate = Date;
let clock = NOW;
globalThis.Date = class extends RealDate { constructor(...a) { super(...(a.length ? a : [clock])); } static now() { return clock; } };
let seed = 1;
Math.random = () => { seed = (seed * 1103515245 + 12345) % 2147483648; return seed / 2147483648; };
let log = [];
const timers = [];
globalThis.setTimeout = (fn, ms) => { timers.push(fn); log.push(['setTimeout', ms]); return timers.length; };
globalThis.setInterval = (fn, ms) => { timers.push(fn); log.push(['setInterval', ms]); return timers.length; };
globalThis.clearTimeout = globalThis.clearInterval = id => log.push(['clearTimer', id]);
const win = new EventTarget();
const dispatch = win.dispatchEvent.bind(win);
win.dispatchEvent = e => { log.push(['event', e.type, e.detail ?? null]); return dispatch(e); };
globalThis.window = win;
class GoldenCustomEvent extends Event {
  detail;
  constructor(type, init = {}) { super(type); this.detail = init.detail; }
}
globalThis.CustomEvent = GoldenCustomEvent;
Object.defineProperty(globalThis, 'navigator', {configurable: true, value: {userAgent: 'golden-agent', onLine: true}});

// In-memory cloud with the cloudStore surface used by SupabaseService.
const docs = new Map();
globalThis.__goldenCloud = {
  online: false, docs, log: (...e) => log.push(e),
};
const fakeCloudStore = `
const C = globalThis.__goldenCloud;
const clone = v => v === undefined ? undefined : JSON.parse(JSON.stringify(v));
export const getCloudDatabase = () => C.online ? { fake: 'db' } : null;
const ref = (kind, parts) => { const p = parts.join('/'); C.log('ref', kind, p); return { kind, path: p, constraints: [] }; };
export const collection = (db, ...parts) => ref('collection', parts);
export const doc = (db, ...parts) => ref('document', parts);
export const where = (field, op, value) => ({ type: 'where', field, op, value });
export const orderBy = (field, dir = 'asc') => ({ type: 'order', field, dir });
export const limit = value => ({ type: 'limit', value });
export const query = (r, ...constraints) => { C.log('query', r.path, constraints); return { ...r, constraints }; };
export const serverTimestamp = () => ({ __t: 'timestamp' });
export const increment = amount => ({ __t: 'increment', amount });
export const arrayUnion = (...values) => ({ __t: 'union', values });
export const arrayRemove = (...values) => ({ __t: 'remove', values });
const docSnap = (path) => { const data = C.docs.get(path); return { id: path.split('/').pop(), ref: { kind: 'document', path }, exists: () => data !== undefined, data: () => clone(data) }; };
const querySnap = (r) => {
  const depth = r.path.split('/').length + 1;
  let rows = [...C.docs.keys()].filter(p => p.startsWith(r.path + '/') && p.split('/').length === depth).sort();
  for (const c of r.constraints || []) if (c.type === 'where') rows = rows.filter(p => C.docs.get(p)?.[c.field] === c.value);
  const order = (r.constraints || []).find(c => c.type === 'order');
  if (order) rows.sort((a, b) => ((C.docs.get(a)?.[order.field] ?? 0) > (C.docs.get(b)?.[order.field] ?? 0) ? 1 : -1) * (order.dir === 'desc' ? -1 : 1));
  const lim = (r.constraints || []).find(c => c.type === 'limit');
  if (lim) rows = rows.slice(0, lim.value);
  const list = rows.map(docSnap);
  return { docs: list, empty: list.length === 0, size: list.length, forEach: f => list.forEach(f) };
};
const write = (op, path, data, opts) => {
  C.log('write', op, path, clone(data), opts ?? null);
  if (op === 'set') C.docs.set(path, opts?.merge ? { ...(C.docs.get(path) || {}), ...clone(data) } : clone(data));
  else if (op === 'update') C.docs.set(path, { ...(C.docs.get(path) || {}), ...clone(data) });
};
export const getDoc = async r => { C.log('getDoc', r.path); return docSnap(r.path); };
export const getDocs = async r => { C.log('getDocs', r.path); return querySnap(r); };
export const setDoc = async (r, data, opts) => write('set', r.path, data, opts);
export const updateDoc = async (r, data) => write('update', r.path, data);
let auto = 0;
export const addDoc = async (r, data) => { const path = r.path + '/auto' + (++auto); write('set', path, data); return { id: 'auto' + auto, path }; };
export const runTransaction = async (db, fn) => {
  C.log('transaction');
  return fn({ get: async r => docSnap(r.path), set: (r, d, o) => write('set', r.path, d, o), update: (r, d) => write('update', r.path, d) });
};
export const onSnapshot = (r, next, error) => {
  C.log('onSnapshot', r.path, r.kind);
  queueMicrotask(() => { try { next(r.kind === 'document' ? docSnap(r.path) : querySnap(r)); } catch (e) { C.log('snapshotThrew', String(e)); } });
  return () => C.log('unsubscribe', r.path);
};
`;

const {outputFiles} = await build({
  entryPoints: [ENTRY], bundle: true, write: false, platform: 'node', format: 'esm', logLevel: 'silent',
  plugins: [{name: 'fake-cloud', setup(b) {
    b.onResolve({filter: /(^|\/)cloudStore$/}, () => ({path: 'cloudStore', namespace: 'fake'}));
    b.onLoad({filter: /.*/, namespace: 'fake'}, () => ({contents: fakeCloudStore, loader: 'js'}));
  }}],
});
// Node caches data: modules by content (the #fragment is ignored), so a unique comment forces a fresh instance.
let instance = 0;
const load = () => import('data:text/javascript;base64,' + Buffer.from(outputFiles[0].text + '\n// instance ' + (++instance)).toString('base64'));

const settle = async () => { for (let i = 0; i < 30; i++) await Promise.resolve(); };
const dump = () => Object.fromEntries([...store.entries()].sort(([a], [b]) => a.localeCompare(b)));
const hash = v => createHash('sha256').update(JSON.stringify(v ?? null)).digest('hex').slice(0, 16);

const profile = {id: 'player-1', username: 'Golden', avatar: '🏅', currentTitle: 'Tester', level: 12, exp: 40, coins: 900, gems: 5, elo: 1500};
const seedDocs = () => {
  docs.clear();
  docs.set('players/player-1', {username: 'Golden', level: 12, exp: 40, elo: 1500});
  docs.set('players/player-2', {username: 'Rival', level: 30, exp: 900, elo: 1700, displayName: 'Rival'});
  docs.set('players/player-1/inventory_data/main', {items: [{id: 'it', count: 1}], stateUpdatedAt: NOW - 1000});
  docs.set('players/player-1/game_sessions/current', {session: {gameId: 'chess', score: 5}, updatedAt: NOW - 500});
  docs.set('chat_messages/m1', {senderId: 'p2', senderName: 'Rival', text: 'hi', timestamp: NOW - 100, likes: 1, likedBy: ['p2']});
  docs.set('leaderboards/blocker/scores/player-2', {playerName: 'Rival', score: 5000, gameId: 'blocker', avatar: '😎', title: 'Pro'});
  docs.set('daily_leaderboards/blocker_2026-10-30/scores/player-2', {playerName: 'Rival', score: 700, gameId: 'blocker'});
  docs.set('friend_challenges/c1', {targetUid: 'player-1', status: 'pending', challengerName: 'Rival', gameId: 'chess'});
};

async function scenario(online) {
  store.clear(); clock = NOW; seed = 1; timers.length = 0; log = [];
  globalThis.__goldenCloud.online = online; seedDocs();
  store.set('arcadex_player_profile', JSON.stringify(profile));
  const S = (await load()).SupabaseService;
  const steps = [];
  const step = async (name, fn) => {
    log = []; const payloads = [];
    const cb = label => v => payloads.push([label, JSON.parse(JSON.stringify(v ?? null))]);
    let value;
    try { value = await fn(cb); } catch (e) { value = {threw: String(e)}; }
    await settle();
    for (const t of timers.splice(0)) { try { await t(); } catch (e) { log.push(['timerThrew', String(e)]); } }
    await settle();
    if (typeof value === 'function') value = {unsubscribe: (value(), 'called')};
    steps.push({name, value: value === undefined ? null : JSON.parse(JSON.stringify(value)), payloads, log: JSON.parse(JSON.stringify(log)), storage: dump(), cloud: Object.fromEntries([...docs].sort())});
  };
  await step('getDb', () => S.getDb() === null ? 'null' : 'db');
  await step('subscribeToChat', cb => S.subscribeToChat(cb('chat')));
  await step('sendChatMessage', () => S.sendChatMessage({senderId: 'player-1', senderName: 'Golden', senderAvatar: '🏅', senderTitle: 'T', senderLevel: 12, text: 'gg'}));
  await step('toggleLikeChatMessage', () => S.toggleLikeChatMessage('m1', 'player-1'));
  await step('toggleLikeChatMessage welcome', () => S.toggleLikeChatMessage('msg_welcome_1', 'player-1'));
  await step('syncProfileToCloud', () => S.syncProfileToCloud(profile));
  await step('syncProfileToCloud other account', () => S.syncProfileToCloud({...profile, id: 'someone-else'}));
  await step('syncProfileToCloud unchanged', () => S.syncProfileToCloud(profile));
  await step('syncInventoryToCloud', () => S.syncInventoryToCloud('player-1', [{id: 'x', count: 2}], {common: 1}, {level: 2}, ['bp'], NOW));
  await step('loadInventoryFromCloud', () => S.loadInventoryFromCloud('player-1'));
  await step('subscribeToCloudInventory', cb => S.subscribeToCloudInventory('player-1', cb('inventory')));
  await step('syncGameSessionToCloud', () => S.syncGameSessionToCloud('player-1', {gameId: 'blocker', score: 99, savedAt: NOW}));
  await step('syncGameSessionToCloud null', () => S.syncGameSessionToCloud('player-1', null, false));
  await step('loadGameSessionFromCloud', () => S.loadGameSessionFromCloud('player-1'));
  await step('subscribeToCloudGameSession', cb => S.subscribeToCloudGameSession('player-1', cb('session')));
  await step('syncAchievementsToCloud', () => S.syncAchievementsToCloud([{id: 'a', unlocked: true}]));
  await step('submitLeaderboardScore', () => S.submitLeaderboardScore('blocker', 'Golden', 4321, '🏅', 'Tester', {lines: 2}));
  await step('subscribeToWeeklyTopPlayers', cb => S.subscribeToWeeklyTopPlayers(cb('weekly')));
  await step('subscribeToGlobalExpLeaderboard', cb => S.subscribeToGlobalExpLeaderboard(cb('exp'), 5));
  await step('subscribeToGameLeaderboard', cb => S.subscribeToGameLeaderboard('blocker', cb('game'), 5));
  await step('subscribeToGameLeaderboard dated', cb => S.subscribeToGameLeaderboard('blocker', cb('gameDated'), 5, '2026-10-30'));
  await step('subscribeToDailyLeaderboard', cb => S.subscribeToDailyLeaderboard('blocker', '2026-10-30', cb('daily'), 10));
  await step('syncDailyChallenge', () => S.syncDailyChallenge({id: 'blocker-daily', gameId: 'blocker', date: '2026-10-30', completed: true}, 'player-1'));
  await step('updatePlayerPresence', () => S.updatePlayerPresence(profile, 'Đang chơi'));
  await step('searchPlayers', () => S.searchPlayers('riv'));
  await step('searchPlayers empty', () => S.searchPlayers(''));
  await step('sendFriendChallenge', () => S.sendFriendChallenge({id: 'c2', challengerUid: 'player-1', targetUid: 'player-2', gameId: 'chess', status: 'pending', createdAt: NOW}));
  await step('subscribeToIncomingChallenges', cb => S.subscribeToIncomingChallenges('player-1', cb('challenges')));
  await step('respondToFriendChallenge', () => S.respondToFriendChallenge('c1', 'accepted'));
  window.dispatchEvent(new Event('arcadex_auth_changed'));
  await step('syncProfileToCloud after auth change', () => S.syncProfileToCloud(profile));
  return {methods: Object.getOwnPropertyNames(S).filter(k => typeof S[k] === 'function').sort(), steps};
}

const offline = await scenario(false);
const online = await scenario(true);
if (process.argv.includes('--report')) for (const [label, run] of [['offline', offline], ['online', online]]) for (const s of run.steps)
  console.log(label.padEnd(8), s.name.padEnd(40), 'cloud calls', String(s.log.length).padStart(3), 'callbacks', s.payloads.length, s.value?.threw ? 'THREW ' + s.value.threw : '');
const summarize = run => run.steps.map(s => ({name: s.name, value: hash(s.value), payloads: hash(s.payloads), log: hash(s.log), storage: hash(s.storage), cloud: hash(s.cloud)}));
const result = {methods: online.methods, offline: summarize(offline), online: summarize(online)};

if (update) {
  await writeFile(GOLDEN, JSON.stringify(result, null, 1) + '\n');
  const threw = [...offline.steps, ...online.steps].filter(s => s.value?.threw).map(s => s.name + ': ' + s.value.threw);
  console.log('supabase golden updated' + (threw.length ? '; steps that threw: ' + threw.join(' | ') : ''));
} else {
  const golden = JSON.parse(await readFile(GOLDEN, 'utf8'));
  assert.deepStrictEqual(result.methods, golden.methods, 'public SupabaseService methods changed');
  for (const run of ['offline', 'online']) {
    assert.equal(result[run].length, golden[run].length, `${run} step count changed`);
    golden[run].forEach((g, i) => { for (const k of Object.keys(g)) assert.equal(result[run][i][k], g[k], `${run} "${g.name}" ${k} changed`); });
  }
  console.log(`supabase compat: ${result.methods.length} methods, ${result.offline.length + result.online.length} replay steps match golden`);
}
