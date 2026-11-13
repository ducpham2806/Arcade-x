import test from 'node:test';
import assert from 'node:assert/strict';
import { build } from 'esbuild';

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
const session = id => ({ user: { id, is_anonymous: false } });
async function tab(t, initial = 'owner-a') {
  t.mock.timers.enable({ apis: ['setTimeout'] });
  const values = new Map();
  const writeOwner = id => id ? values.set('arcadex_current_user', JSON.stringify({ id, provider: 'supabase', isGuest: false })) : values.delete('arcadex_current_user');
  writeOwner(initial);
  const previous = Object.getOwnPropertyDescriptor(globalThis, 'localStorage');
  Object.defineProperty(globalThis, 'localStorage', { configurable: true, value: {
    getItem: k => values.get(k) ?? null,
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
  t.after(() => { stop(); delete globalThis.__authTab; if (previous) Object.defineProperty(globalThis, 'localStorage', previous); else delete globalThis.localStorage; });
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
  assert.equal((await restore).success, true);
  assert.equal(getSessionCalls, 0);
  assert.equal(a.AuthService.getCurrentUser(), null);
});
