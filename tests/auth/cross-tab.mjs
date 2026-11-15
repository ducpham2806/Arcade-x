import test from 'node:test';
import assert from 'node:assert/strict';
import { build } from 'esbuild';
import { createClient } from '@supabase/supabase-js';

// Each import represents a tab. Storage is shared; listener state must be local.
const stubs = {
  './supabaseClient': 'export const supabase=globalThis.__authTab.sdk; export const resetCloudIdentity=()=>{}; export const pauseCloudIdentity=async()=>{}; export const resumeCloudIdentity=()=>{};',
  './authRecovery': 'export const getRecoveryState=()=>({status:"idle"}); export const initializeRecovery=async()=>({status:"idle"}); export const clearRecovery=()=>{}; export const authRedirect=()=>undefined; export const takeAuthCallbackMessage=()=>undefined;',
  './storage': 'export const StorageService={loadProfile:()=>({id:"owner-a"})};',
  './accountStorage': 'export const activateAccount=()=>{},activateGuest=()=>{},captureAccount=()=>({values:{}}),saveAccountSlot=()=>{},readAccountSlot=()=>null,rememberActiveAccount=()=>{},rememberExistingGuest=()=>{},pendingGuestRegistration=()=>null,stageGuestRegistration=()=>{},clearPendingRegistration=()=>{},validateSnapshot=()=>null;',
  './gameSaves': 'export const hydrateGameSaves=v=>v,syncGameSaves=async()=>{};',
};
const { outputFiles } = await build({ entryPoints: ['src/services/auth.ts'], bundle: true, write: false,
  platform: 'node', format: 'esm', plugins: [{ name: 'isolated-auth-tab', setup(b) {
    b.onResolve({ filter: /.*/ }, args => Object.hasOwn(stubs, args.path) ? { path: args.path, namespace: 'fixture' } : undefined);
    b.onLoad({ filter: /.*/, namespace: 'fixture' }, args => ({ contents: stubs[args.path], loader: 'ts' }));
  } }] });
const bundled = Buffer.from(outputFiles[0].text).toString('base64');
let tabNumber = 0;
const session = id => ({ access_token: `fixture-token-${id}`, user: { id, is_anonymous: false } });
async function tab(t, initial = 'owner-a') {
  t.mock.timers.enable({ apis: ['setTimeout'] });
  const values = new Map();
  const writeOwner = id => id ? values.set('arcadex_current_user', JSON.stringify({ id, provider: 'supabase', isGuest: false })) : values.delete('arcadex_current_user');
  writeOwner(initial);
  const previous = Object.getOwnPropertyDescriptor(globalThis, 'localStorage');
  const previousWindow = Object.getOwnPropertyDescriptor(globalThis, 'window');
  Object.defineProperty(globalThis, 'window', { configurable: true, value: new EventTarget() });
  Object.defineProperty(globalThis, 'localStorage', { configurable: true, value: {
    getItem: k => values.get(k) ?? null,
    setItem: (k, v) => values.set(k, v),
    removeItem: k => values.delete(k),
  } });
  let listener;
  const fixture = { sdk: { auth: {
    onAuthStateChange: fn => { listener = fn; return { data: { subscription: { unsubscribe: () => { listener = undefined; } } } }; },
    getSession: async () => ({ data: { session: null }, error: null }),
  } } };
  globalThis.__authTab = fixture;
  const { AuthService } = await import(`data:text/javascript;base64,${bundled}#tab-${++tabNumber}`);
  let notifications = 0;
  const stop = AuthService.listen(() => { notifications++; });
  const emit = (event, id) => { listener?.(event, id ? session(id) : null); t.mock.timers.tick(0); };
  t.after(() => {
    stop(); delete globalThis.__authTab;
    if (previous) Object.defineProperty(globalThis, 'localStorage', previous); else delete globalThis.localStorage;
    if (previousWindow) Object.defineProperty(globalThis, 'window', previousWindow); else delete globalThis.window;
  });
  return { writeOwner, emit, stop, fixture, AuthService, notifications: () => notifications };
}

test('logout in another tab still notifies after shared account storage has been cleared', async t => {
  const a = await tab(t); a.emit('INITIAL_SESSION', 'owner-a');
  a.writeOwner(null); a.emit('SIGNED_OUT');
  assert.equal(a.notifications(), 1);
  a.emit('SIGNED_OUT'); assert.equal(a.notifications(), 1, 'duplicate sign-out does not hydrate again');
});
test('a different account notifies even when the other tab already wrote its identity', async t => {
  const a = await tab(t); a.emit('INITIAL_SESSION', 'owner-a');
  a.writeOwner('owner-b'); a.emit('SIGNED_IN', 'owner-b');
  assert.equal(a.notifications(), 1);
  a.emit('SIGNED_IN', 'owner-b'); assert.equal(a.notifications(), 1);
});
test('initial session establishes the local identity without triggering an extra restore', async t => {
  const a = await tab(t, null); a.emit('INITIAL_SESSION', 'owner-a');
  assert.equal(a.notifications(), 0);
  a.writeOwner(null); a.emit('SIGNED_OUT'); assert.equal(a.notifications(), 1);
});
test('same-account sign-in, user update and refresh do not add cloud hydration', async t => {
  const a = await tab(t); a.emit('INITIAL_SESSION', 'owner-a');
  for (let i = 0; i < 20; i++) { a.emit('SIGNED_IN', 'owner-a'); a.emit('USER_UPDATED', 'owner-a'); a.emit('TOKEN_REFRESHED', 'owner-a'); }
  assert.equal(a.notifications(), 0);
  a.stop(); a.emit('SIGNED_OUT'); assert.equal(a.notifications(), 0);
});
test('external logout invalidates an older restore before it can reactivate the previous account', async t => {
  const a = await tab(t); a.emit('INITIAL_SESSION', 'owner-a');
  let finish;
  a.fixture.sdk.auth.getSession = () => new Promise(resolve => { finish = resolve; });
  const pending = a.AuthService.restoreSession();
  for (let i = 0; i < 10 && !finish; i++) await Promise.resolve();
  assert.ok(finish, 'restore is waiting on the SDK');
  a.writeOwner(null); a.emit('SIGNED_OUT');
  finish({ data: { session: session('owner-a') }, error: null });
  assert.equal((await pending).cancelled, true);
});

test('cross-tab sign-out uses the event even while the SDK still reports the old session', async t => {
  const a = await tab(t);
  a.stop();
  let getSessionCalls = 0;
  a.fixture.sdk.auth.getSession = async () => {
    getSessionCalls++;
    return { data: { session: session('owner-a') }, error: null };
  };
  let restore;
  const stop = a.AuthService.listen(eventSession => {
    restore = a.AuthService.restoreSession(eventSession);
  });
  t.after(stop);
  a.emit('SIGNED_OUT');
  assert.ok(restore, 'sign-out must start a restore');
  const result = await restore;
  assert.equal(result.success, true, result.error);
  assert.equal(getSessionCalls, 0);
  assert.equal(a.AuthService.getCurrentUser(), null);
});

test('cross-tab restore uses the event token for every hydration RPC while SDK storage still has an anonymous session', async t => {
  const a = await tab(t, null);
  a.stop();
  const requests = [];
  let sessionReads = 0;
  const previous = { ...session('anonymous'), user: { id: 'anonymous', is_anonymous: true } };
  a.fixture.sdk.auth.getSession = async () => {
    sessionReads++;
    return { data: { session: previous }, error: null };
  };
  // Exercise the real PostgREST header path: the default token is deliberately stale.
  const api = createClient('https://fixture.invalid', 'fixture-publishable', {
    accessToken: async () => (await a.fixture.sdk.auth.getSession()).data.session.access_token,
    global: { fetch: async (url, init) => {
      const name = new URL(String(url)).pathname.split('/').at(-1);
      const authorization = new Headers(init.headers).get('authorization');
      const body = JSON.parse(init.body);
      requests.push({ name, authorization, body });
      if (authorization !== 'Bearer fixture-token-owner-b') {
        return Response.json({ code: '42501', message: 'Not your player' }, { status: 400 });
      }
      return Response.json(name === 'arcadex_read' ? [] : null);
    } },
  });
  a.fixture.sdk.rpc = api.rpc.bind(api);
  let restore;
  const stop = a.AuthService.listen(eventSession => { restore = a.AuthService.restoreSession(eventSession); });
  t.after(stop);
  a.emit('SIGNED_IN', 'owner-b');
  assert.ok(restore, 'the other tab must start restoring B');
  const result = await restore;
  assert.equal(result.success, true, result.error);
  assert.equal(a.AuthService.getCurrentUser()?.id, 'owner-b');
  assert.ok(sessionReads > 0, 'the SDK still reads the stale session during transport');
  assert.equal(requests.length, 6);
  assert.ok(requests.every(r => r.authorization === 'Bearer fixture-token-owner-b'));
  assert.equal(requests[0].body.p_player_id, 'owner-b');
  assert.deepEqual(requests.filter(r => r.name === 'arcadex_read').map(r => r.body.p_collection).sort(), [
    'players/owner-b/inventory_data', 'players', 'players/owner-b/game_sessions', 'players/owner-b/game_sessions',
  ].sort());
  await api.rpc('arcadex_get_identity');
  assert.equal(requests.at(-1).authorization, 'Bearer '+previous.access_token, 'restore must not change the shared client headers');
});
