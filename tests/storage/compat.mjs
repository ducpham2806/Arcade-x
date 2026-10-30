// Golden regression for StorageService: replays every public method against an empty
// store and a legacy save, with a frozen clock and seeded randomness, and compares the
// return values plus the resulting localStorage to tests/storage/storage-golden.json.
// The golden stores a hash per export and per step to stay small; failures name the step.
// Run with --update after an intentional storage behaviour change.
process.env.TZ = 'UTC';
import {build} from 'esbuild';
import {mkdtemp, rm, readFile, writeFile} from 'node:fs/promises';
import {tmpdir} from 'node:os';
import path from 'node:path';
import {pathToFileURL} from 'node:url';
import assert from 'node:assert/strict';
import {createHash} from 'node:crypto';

const GOLDEN = path.resolve('tests/storage/storage-golden.json');
const update = process.argv.includes('--update');

const store = new Map();
globalThis.localStorage = {
  getItem: k => (store.has(k) ? store.get(k) : null),
  setItem: (k, v) => void store.set(k, String(v)),
  removeItem: k => void store.delete(k),
  clear: () => store.clear(),
  key: i => [...store.keys()][i] ?? null,
  get length() { return store.size; },
};

const NOW = Date.parse('2026-10-30T10:00:00Z');
const RealDate = Date;
let clock = NOW;
globalThis.Date = class extends RealDate {
  constructor(...args) { super(...(args.length ? args : [clock])); }
  static now() { return clock; }
};
let seed = 1;
Math.random = () => { seed = (seed * 1103515245 + 12345) % 2147483648; return seed / 2147483648; };
const reset = () => { store.clear(); clock = NOW; seed = 1; };

const dir = await mkdtemp(path.join(tmpdir(), 'arcadex-storage-'));
let mod;
try {
  const outfile = path.join(dir, 'storage.mjs');
  await build({entryPoints: ['src/services/storage.ts'], bundle: true, platform: 'node', format: 'esm', outfile, logLevel: 'silent'});
  mod = await import(pathToFileURL(outfile).href);
} finally {
  await rm(dir, {recursive: true, force: true});
}
const S = mod.StorageService;

const dump = () => Object.fromEntries([...store.entries()].sort(([a], [b]) => a.localeCompare(b)).map(([k, v]) => {
  try { return [k, JSON.parse(v)]; } catch { return [k, v]; }
}));

const legacySave = {
  arcadex_player_profile: {id: 'legacy-1', username: 'OldTimer', level: 7, exp: 120, coins: 3400},
  arcadex_inventory: [{id: 'item_legacy_custom', name: 'Old Relic', count: 2, equipped: true}],
  arcadex_achievements: [{id: 'first_game', title: 'Legacy title', unlocked: true}],
  arcadex_last_quest_date: '2026-10-30',
  arcadex_daily_quests: [{id: 'q1', progress: 1}, {id: 'q2', progress: 0}, {id: 'q3', progress: 5}],
  arcadex_leaderboard_custom: {blocker: [{playerName: 'OldTimer', score: 999999, avatar: '🧓', title: 'Veteran'}]},
  arcadex_favorite_games_v1: ['chess', 'blocker'],
  arcadex_recently_played_games_v1: ['chess', 'xiangqi', 'blocker'],
  arcadex_all_daily_challenges_v3: {blocker: {id: 'blocker-daily-old', gameId: 'blocker', date: '2026-10-29', targetScore: 10, timeLimitSeconds: 999, completed: true, claimed: false, bestScoreAchieved: 50}},
  arcadex_forge_mastery_v1: {level: 3},
  arcadex_paused_game_session_v1: {gameId: 'chess', score: 12},
  arcadex_legendary_blueprints_v1: ['bp_old'],
  arcadex_recipe_discovery_log_v1: [{id: 'log-old', timestamp: 1}],
  arcadex_daily_leaderboards_v2: {blocker: {'2026-10-30': [{playerName: 'Early', score: 10}]}},
  arcadex_onboarding_completed_v1: 'true',
  arcadex_friends_list_v2: [{id: 'friend-old', username: 'Buddy', avatar: '🙂', currentTitle: 'Pal', level: 3, isOnline: false, lastSeen: 1}],
  arcadex_weekly_quest_week_key_v2: 'stale-week',
  arcadex_weekly_quests_v2: [{id: 'wq-old'}],
  arcadex_weekly_milestones_v2: [{id: 'wm-old', claimed: true}],
  arcadex_match_history_v1: [{id: 'match-old', gameId: 'chess'}],
};

function scenario() {
  const steps = [];
  const step = (name, fn) => {
    let value;
    try { value = fn(); } catch (e) { value = {threw: String(e)}; }
    steps.push({name, value: value === undefined ? null : JSON.parse(JSON.stringify(value)), storage: dump()});
  };
  const loaders = Object.getOwnPropertyNames(S).filter(k => typeof S[k] === 'function' && /^(load|get|is)/.test(k) && S[k].length === 0);
  for (const k of loaders.sort()) step(k, () => S[k]());
  step('loadDailyLeaderboard(chess, 2026-10-29)', () => S.loadDailyLeaderboard('chess', '2026-10-29'));
  step('submitDailyScore', () => S.submitDailyScore('blocker', 'OldTimer', 4200, '🧓', 'Veteran', {lines: 3}));
  step('submitDailyScore lower', () => S.submitDailyScore('blocker', 'OldTimer', 10, '', ''));
  step('getDailyPersonalBest', () => S.getDailyPersonalBest('blocker', 'OldTimer'));
  step('loadDailyChallenge(chess)', () => S.loadDailyChallenge('chess'));
  step('recordDailyChallengeAttempt(game)', () => S.recordDailyChallengeAttempt('blocker', 6000, 120));
  step('recordDailyChallengeAttempt(legacy args)', () => S.recordDailyChallengeAttempt(100, 30));
  step('claimDailyChallengeReward', () => S.claimDailyChallengeReward('blocker'));
  step('claimDailyChallengeReward again', () => S.claimDailyChallengeReward('blocker'));
  step('toggleFavorite add', () => S.toggleFavorite('2048'));
  step('toggleFavorite remove', () => S.toggleFavorite('chess'));
  step('recordRecentlyPlayed', () => S.recordRecentlyPlayed('battleship'));
  step('unlockBlueprint', () => S.unlockBlueprint('bp_new'));
  step('unlockBlueprint again', () => S.unlockBlueprint('bp_new'));
  step('addDiscoveryLogEntry', () => S.addDiscoveryLogEntry({id: 'log-new', timestamp: 2}));
  step('addFriend', () => S.addFriend({id: 'friend-new', username: 'Pal', avatar: '😀', currentTitle: 'New', level: 1, isOnline: true, lastSeen: 2}));
  step('addFriend same username', () => S.addFriend({id: 'friend-other', username: 'pal', level: 4}));
  step('removeFriend', () => S.removeFriend('friend-new'));
  step('addMatchHistory', () => S.addMatchHistory({id: 'match-new', gameId: 'caro-gomoku'}));
  step('saveDailyChallenge', () => S.saveDailyChallenge({...S.loadDailyChallenge('chess'), bestScoreAchieved: 77}));
  step('savePausedGame null', () => S.savePausedGame(null));
  step('setOnboardingCompleted false', () => S.setOnboardingCompleted(false));
  step('saveGeneric/loadGeneric', () => { S.saveGeneric('custom_key', {a: 1}); return S.loadGeneric('custom_key', null); });
  step('exportData', () => JSON.parse(S.exportData()));
  step('importData valid', () => S.importData(JSON.stringify({profile: {id: 'imported'}, forgeMastery: {level: 9}})));
  step('importData invalid', () => S.importData('{nope'));
  step('clearDiscoveryLog', () => S.clearDiscoveryLog());
  step('clearPausedGame', () => S.clearPausedGame());
  clock += 8 * 24 * 3600 * 1000;
  step('next week: loadWeeklyQuests', () => S.loadWeeklyQuests());
  step('next week: loadDailyQuests', () => S.loadDailyQuests());
  step('next week: loadAllDailyChallenges', () => S.loadAllDailyChallenges());
  step('clearAll', () => S.clearAll());
  return steps;
}

const catalog = Object.fromEntries(Object.entries(mod).filter(([, v]) => typeof v !== 'function').sort(([a], [b]) => a.localeCompare(b)));
const helpers = {
  getStreakMultiplier: [0, 1, 3, 7, 14, 30, 100].map(n => mod.getStreakMultiplier(n)),
  getExpNeededForLevel: [1, 2, 10, 50, 99].map(n => mod.getExpNeededForLevel(n)),
  getRecent7DaysScoreHistory: [mod.getRecent7DaysScoreHistory({}), mod.getRecent7DaysScoreHistory({dailyScores: {'2026-10-29': 50, '2026-10-30': 80}, scoreHistory: {'2026-10-28': 20}})],
};

reset();
const empty = scenario();
reset();
for (const [k, v] of Object.entries(legacySave)) store.set(k, typeof v === 'string' ? v : JSON.stringify(v));
const legacy = scenario();

const hash = v => createHash('sha256').update(JSON.stringify(v)).digest('hex').slice(0, 16);
const steps = list => list.map(s => ({name: s.name, value: hash(s.value), storage: hash(s.storage)}));
const result = {
  methods: Object.getOwnPropertyNames(S).filter(k => typeof S[k] === 'function').sort(),
  catalog: Object.fromEntries(Object.entries(catalog).map(([k, v]) => [k, hash(v)])),
  helpers: Object.fromEntries(Object.entries(helpers).map(([k, v]) => [k, hash(v)])),
  empty: steps(empty),
  legacy: steps(legacy),
};
for (const s of [...empty, ...legacy]) assert(!s.value?.threw, `${s.name} threw: ${s.value?.threw}`);
if (update) {
  await writeFile(GOLDEN, JSON.stringify(result, null, 1) + '\n');
  console.log('storage golden updated');
} else {
  const golden = JSON.parse(await readFile(GOLDEN, 'utf8'));
  assert.deepStrictEqual(result.methods, golden.methods, 'public StorageService methods changed');
  for (const group of ['catalog', 'helpers']) for (const k of Object.keys(golden[group])) assert.equal(result[group][k], golden[group][k], `${group}.${k} changed`);
  for (const run of ['empty', 'legacy']) golden[run].forEach((g, i) => {
    const r = result[run][i];
    assert.equal(r?.name, g.name, `${run} step ${i} renamed`);
    assert.equal(r.value, g.value, `${run} "${g.name}" return value changed`);
    assert.equal(r.storage, g.storage, `${run} "${g.name}" localStorage changed`);
  });
  assert.equal(result.empty.length + result.legacy.length, golden.empty.length + golden.legacy.length, 'replay step count changed');
  // Legacy saves must survive loading: custom items/progress are kept, new defaults are merged in.
  const loadInventory = legacy.find(s => s.name === 'loadInventory').value;
  assert(loadInventory.some(i => i.id === 'item_legacy_custom' && i.count === 2));
  assert(loadInventory.length > 1);
  const profile = legacy.find(s => s.name === 'loadProfile').value;
  assert.equal(profile.username, 'OldTimer');
  assert.equal(profile.coins, 3400);
  console.log(`storage compat: ${result.methods.length} methods, ${empty.length + legacy.length} replay steps match golden`);
}
