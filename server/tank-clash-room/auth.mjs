import { cleanName } from '../../src/games/tank-clash/protocol.ts';

/** Admission checks verified Auth user IDs, not user-editable metadata. No database requests. */
export function supabaseAuthenticator({ url, anonKey, allowedUserIds, allowAnonymous = false, fetchImpl = fetch,
  timeoutMs = 4000, cacheMs = 15_000, now = () => Date.now() }) {
  const endpoint = new URL('/auth/v1/user', url);
  if (endpoint.protocol !== 'https:' && !['localhost', '127.0.0.1', '[::1]'].includes(endpoint.hostname)) throw new Error('Supabase Auth needs HTTPS.');
  if (!anonKey || anonKey.startsWith('sb_secret_')) throw new Error('Use a Supabase publishable/anon key for Auth.');
  try { if (JSON.parse(Buffer.from(anonKey.split('.')[1], 'base64url')).role === 'service_role') throw new Error('Use a public key, never service_role.'); } catch (error) { if (error instanceof Error && error.message.startsWith('Use a public key')) throw error; }
  const allowed = allowedUserIds === undefined ? null : new Set(allowedUserIds);
  const cache = new Map(), inflight = new Map();
  return async (token, name) => {
    if (typeof token !== 'string' || !token || token.length > 4096) return null;
    let expires = Infinity;
    try { const claims = JSON.parse(Buffer.from(token.split('.')[1], 'base64url')); if (Number.isFinite(claims.exp)) expires = claims.exp * 1000; } catch { /* Auth server remains authoritative. */ }
    if (expires <= now()) return null;
    const hit = cache.get(token); if (hit && hit.until > now()) return hit.identity;
    if (inflight.has(token)) return inflight.get(token);
    // Bound concurrent Auth work as well as cache size during admission storms.
    if (inflight.size >= 128) return null;
    const request = (async () => {
      const controller = new AbortController(), timer = setTimeout(() => controller.abort(), timeoutMs);
      try {
        const res = await fetchImpl(endpoint.href, { headers: { apikey: anonKey, Authorization: `Bearer ${token}` }, signal: controller.signal });
        if (!res.ok) return null;
        const user = await res.json();
        if (!user?.id || (!allowAnonymous && user.is_anonymous) || (allowed && !allowed.has(String(user.id)))) return null;
        const meta = user.user_metadata ?? {};
        const identity = { userId: String(user.id), name: cleanName(meta.display_name ?? meta.full_name ?? meta.name ?? name), guest: false };
        cache.set(token, { identity, until: Math.min(now() + cacheMs, expires) });
        if (cache.size > 1024) cache.delete(cache.keys().next().value);
        return identity;
      } catch { return null; } finally { clearTimeout(timer); }
    })();
    inflight.set(token, request);
    try { return await request; } finally { inflight.delete(token); }
  };
}

/** Production is fail-closed, including the tester allowlist. Dev guests stay explicit and local. */
export function admissionFromEnv(env = process.env) {
  const production = env.NODE_ENV === 'production', url = env.SUPABASE_URL, key = env.SUPABASE_PUBLISHABLE_KEY || env.SUPABASE_ANON_KEY;
  const ids = (env.TANK_ALLOWED_USER_IDS || '').split(',').map(v => v.trim()).filter(Boolean);
  if ((url && !key) || (!url && key)) throw new Error('Set both Supabase URL and publishable key.');
  if (production && (!url || !key || !ids.length)) throw new Error('Production needs Supabase Auth and TANK_ALLOWED_USER_IDS.');
  return url && key ? supabaseAuthenticator({ url, anonKey: key, allowedUserIds: ids.length || production ? ids : undefined }) : undefined;
}

export function publicAuthConfig({ url, publishableKey }) {
  // Reuse validation, including rejection of secret/service-role keys, before ever rendering a key.
  supabaseAuthenticator({ url, anonKey: publishableKey });
  return { url: new URL(url).origin, publishableKey };
}
