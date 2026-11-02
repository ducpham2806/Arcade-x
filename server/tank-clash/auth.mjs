import { createClient } from '@supabase/supabase-js';

/** Test/staging admission only. Authorization uses verified user.id, never user_metadata. */
export function makeAccountVerifier({ url, publishableKey, allowedUserIds, client } = {}) {
  const allowed = new Set(allowedUserIds || []);
  if (!allowed.size) throw new Error('TANK_ALLOWED_USER_IDS is required outside review mode.');
  if (!client && (!url || !publishableKey)) throw new Error('Supabase Auth configuration is required.');
  const supabase = client || createClient(url, publishableKey, { auth: { persistSession: false, autoRefreshToken: false, detectSessionInUrl: false }, global: { fetch: (input, init) => fetch(input, { ...init, signal: AbortSignal.timeout(4000) }) } });
  return async token => {
    if (typeof token !== 'string' || !token || token.length > 8192) throw new Error('AUTH_REQUIRED');
    const { data, error } = await supabase.auth.getUser(token);
    if (error || !data?.user?.id) throw new Error('AUTH_REQUIRED');
    if (!allowed.has(data.user.id)) throw new Error('ACCESS_DENIED');
    return { userId: data.user.id };
  };
}
