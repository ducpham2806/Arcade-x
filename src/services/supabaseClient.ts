import { createClient, type SupabaseClient } from '@supabase/supabase-js';
import publicBackend from '../config/public-backend.json';
import { StorageService } from './storage';

const env = import.meta.env;
// An explicit deployment override must supply a matching URL and key.
const overridden = !!(env.VITE_SUPABASE_URL || env.VITE_SUPABASE_PUBLISHABLE_KEY || env.VITE_SUPABASE_ANON_KEY);
const url = (overridden ? env.VITE_SUPABASE_URL : publicBackend.url)?.trim();
const key = (overridden ? env.VITE_SUPABASE_PUBLISHABLE_KEY || env.VITE_SUPABASE_ANON_KEY : publicBackend.publishableKey)?.trim();

// Only a publishable/anon key belongs in a browser bundle. Never use service_role.
function initializeClient(): SupabaseClient | null {
  if (!url || !key) return null;
  if (key.startsWith('sb_secret_')) throw new Error('Do not expose Supabase secret keys in VITE_* variables.');
  if (key.startsWith('eyJ')) {
    const claims = JSON.parse(atob(key.split('.')[1].replace(/-/g, '+').replace(/_/g, '/')));
    if (claims.role === 'service_role') throw new Error('Do not expose a service_role key in the browser.');
  }
  return createClient(url, key, { global: { fetch: (input, init) => {
    // Offline sign-out removes only this device session; no server revocation can run offline.
    if (typeof navigator !== 'undefined' && !navigator.onLine && String(input).includes('/auth/v1/logout')) return Promise.resolve(new Response(null, { status: 204 }));
    return fetch(input, init);
  } }, auth: { persistSession: true, autoRefreshToken: true, detectSessionInUrl: true } });
}
export const supabase = initializeClient();
// Public configuration resolved with the same deployment overrides as the authenticated client.
export const supabasePublicConfig = {url, key};

let signingIn: Promise<void> | null = null;
let authPaused = false;
const bindings = new Map<string, Promise<void>>();

export async function pauseCloudIdentity() { authPaused = true; await signingIn?.catch(() => {}); }
export function resumeCloudIdentity() { authPaused = false; resetCloudIdentity(); }

export function resetCloudIdentity() { signingIn = null; bindings.clear(); }

export async function ensureCloudIdentity(): Promise<SupabaseClient> {
  if (authPaused) throw new Error('Đang chuyển tài khoản.');
  if (typeof navigator !== 'undefined' && !navigator.onLine) throw new Error('Đang offline; dữ liệu được lưu trên thiết bị.');
  if (!supabase) throw new Error('Chưa cấu hình Supabase. Dữ liệu vẫn được lưu trên thiết bị.');
  if (!signingIn) {
    signingIn = (async () => {
      const { data, error } = await supabase.auth.getSession();
      if (error) throw error;
      if (!data.session) {
        const result = await supabase.auth.signInAnonymously();
        if (result.error) throw result.error;
      }
    })().catch(error => { signingIn = null; throw error; });
  }
  await signingIn;
  if (authPaused) throw new Error('Đang chuyển tài khoản.');
  const playerId = StorageService.loadProfile().id;
  if (!playerId) throw new Error('Hồ sơ chưa có mã người chơi.');
  if (!bindings.has(playerId)) {
    const binding = (async () => {
      const { error } = await supabase.rpc('arcadex_bind_player', { p_player_id: playerId });
      if (error) throw error;
    })().catch(error => { bindings.delete(playerId); throw error; });
    bindings.set(playerId, binding);
  }
  await bindings.get(playerId);
  return supabase;
}

supabase?.auth.onAuthStateChange((event) => {
  if (event === 'SIGNED_OUT' || event === 'SIGNED_IN') {
    signingIn = null;
    bindings.clear();
  }
});


