// Read-only staging check before turning on VITE_ACCESS_CONTROL_V2 (commerce step 1).
// Run it yourself against a STAGING project with two registered test accounts:
//   STAGING_SUPABASE_URL=... STAGING_PUBLISHABLE_KEY=... \
//   PLAYER_EMAIL=... PLAYER_PASSWORD=... [ADMIN_EMAIL=... ADMIN_PASSWORD=...] \
//   node scripts/verify-access-rollout.mjs
// It never writes admin state. Note: launcher_my_access claims the starter gift once for a pilot
// account when the starter config is enabled; use a throwaway test account.
import { createClient } from '@supabase/supabase-js';
import assert from 'node:assert/strict';

const env = name => { const v = process.env[name]; if (!v) { console.error(`Missing ${name}`); process.exit(2); } return v; };
const url = env('STAGING_SUPABASE_URL'), key = env('STAGING_PUBLISHABLE_KEY');
if (/whjatkhhupeqfngakmee/.test(url)) { console.error('Refusing to run against the production project. Use a staging project.'); process.exit(2); }
let checks = 0;
const check = async (name, fn) => { await fn(); checks++; console.log('PASS', name); };
async function signIn(email, password) {
  const client = createClient(url, key, { auth: { persistSession: false } });
  const { data, error } = await client.auth.signInWithPassword({ email, password });
  if (error) throw new Error(`Sign-in failed for ${email}: ${error.message}`);
  return { client, user: data.user };
}
const rpc = async (client, name, args = {}) => { const { data, error } = await client.rpc(name, args); return { data, error }; };

const anon = createClient(url, key, { auth: { persistSession: false } });
await check('migrations are applied (v2 access RPC exists)', async () => {
  const { error } = await rpc(anon, 'launcher_check_access_v2', { p_game_id: 'tile-2048' });
  assert.ok(!error || !/does not exist|Could not find the function/i.test(error.message), `launcher_check_access_v2 missing: ${error?.message}`);
});
await check('anonymous callers cannot read admin state', async () => {
  const { error } = await rpc(anon, 'launcher_admin_state', { p_user: null });
  assert.ok(error, 'anon read admin state');
});

const player = await signIn(env('PLAYER_EMAIL'), env('PLAYER_PASSWORD'));
await check('a regular player is not an admin and cannot run admin commands', async () => {
  assert.equal((await rpc(player.client, 'launcher_is_admin')).data, false);
  assert.ok((await rpc(player.client, 'launcher_admin_state', { p_user: player.user.id })).error, 'player read admin state');
  assert.ok((await rpc(player.client, 'launcher_admin_command', { p_action: 'mode', p_payload: { mode: 'pilot' }, p_reason: 'verify script' })).error, 'player changed rollout');
});
await check('a player can read only their own access state', async () => {
  const own = await rpc(player.client, 'launcher_my_access', { p_expected_owner: player.user.id });
  assert.ok(!own.error, own.error?.message);
  assert.ok(Array.isArray(own.data.games) && Array.isArray(own.data.entitlements));
  const other = await rpc(player.client, 'launcher_my_access', { p_expected_owner: '00000000-0000-4000-8000-000000000000' });
  assert.ok(other.error, 'read with another owner id');
});
await check('the store catalog never reports checkout as enabled', async () => {
  const { data, error } = await rpc(player.client, 'launcher_store_catalog');
  assert.ok(!error, error?.message); assert.equal(data.checkoutEnabled, false);
});
await check('players cannot read entitlements or orders of other accounts directly', async () => {
  const ent = await player.client.from('launcher_entitlements').select('owner_id').neq('owner_id', player.user.id).limit(1);
  assert.ok(ent.error || ent.data.length === 0, 'foreign entitlements visible');
  const orders = await player.client.from('launcher_orders').select('owner_id').neq('owner_id', player.user.id).limit(1);
  assert.ok(orders.error || orders.data.length === 0, 'foreign orders visible');
});
if (process.env.ADMIN_EMAIL) {
  const admin = await signIn(env('ADMIN_EMAIL'), env('ADMIN_PASSWORD'));
  await check('the staging admin is recognised and can read the rollout state', async () => {
    assert.equal((await rpc(admin.client, 'launcher_is_admin')).data, true, 'add the account to launcher_private.admins first');
    const state = await rpc(admin.client, 'launcher_admin_state', { p_user: player.user.id });
    assert.ok(!state.error, state.error?.message); assert.ok(['off', 'pilot'].includes(state.data.mode));
    console.log(`     rollout mode: ${state.data.mode}; player in pilot: ${state.data.pilot}`);
  });
}
console.log(`access rollout verification: ${checks} checks passed`);
