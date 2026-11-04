// Configuration for the long-running room process. No secrets are returned by public health.
const loopback = new Set(['localhost', '127.0.0.1', '::1']);
const uuid = /^[0-9a-f]{8}-[0-9a-f]{4}-[0-9a-f]{4}-[0-9a-f]{4}-[0-9a-f]{12}$/i;
const split = value => String(value || '').split(/[\s,]+/).filter(Boolean);
export function loadServerConfig(env = process.env) {
  const production = env.NODE_ENV === 'production', host = env.HOST || '127.0.0.1';
  const port = Number(env.PORT || 3223), maxConnections = Number(env.TANK_MAX_CONNECTIONS || 64);
  if (!Number.isInteger(port) || port < 0 || port > 65535) throw Error('PORT must be an integer from 0 to 65535');
  if (!Number.isInteger(maxConnections) || maxConnections < 2 || maxConnections > 10000) throw Error('TANK_MAX_CONNECTIONS must be 2..10000');
  const allowedOrigins = split(env.TANK_ALLOWED_ORIGINS).map(raw => {
    const u = new URL(raw);
    if (u.username || u.password || u.origin !== raw || (production ? u.protocol !== 'https:' : !['http:', 'https:'].includes(u.protocol))) throw Error('TANK_ALLOWED_ORIGINS must contain exact HTTPS origins in production');
    return u.origin;
  });
  const supabaseUrl = env.SUPABASE_URL?.replace(/\/$/, '') || '', publishableKey = env.SUPABASE_PUBLISHABLE_KEY || env.SUPABASE_ANON_KEY || '';
  const allowedUserIds = split(env.TANK_ALLOWED_USERS);
  if (allowedUserIds.some(id => !uuid.test(id))) throw Error('TANK_ALLOWED_USERS must contain Auth user UUIDs');
  if (supabaseUrl) {
    const u = new URL(supabaseUrl);
    if (u.protocol !== 'https:' || u.username || u.password || u.origin !== supabaseUrl) throw Error('SUPABASE_URL must be an HTTPS origin');
    if (env.TANK_ENV === 'staging' && u.hostname === 'whjatkhhupeqfngakmee.supabase.co') throw Error('Staging must not use the ArcadeX production project');
  }
  if (production) {
    if (env.TANK_ALLOW_GUESTS === '1' || env.TANK_QUEUE_GUESTS === '1') throw Error('Guest bypass flags are forbidden in production');
    if (!supabaseUrl || !publishableKey) throw Error('Production needs SUPABASE_URL and SUPABASE_PUBLISHABLE_KEY (or legacy SUPABASE_ANON_KEY)');
    if (!allowedOrigins.length) throw Error('Production needs TANK_ALLOWED_ORIGINS');
    if (!allowedUserIds.length) throw Error('The staging pilot needs TANK_ALLOWED_USERS; entitlement integration comes later');
    if (!env.TANK_METRICS_TOKEN || env.TANK_METRICS_TOKEN.length < 32) throw Error('Production needs a random TANK_METRICS_TOKEN of at least 32 characters');
  } else if (!loopback.has(host) && !(supabaseUrl && publishableKey)) {
    throw Error('Guest development hosts must bind to loopback');
  }
  return { production, host, port, allowedOrigins, maxConnections, supabaseUrl, publishableKey,
    allowedUserIds: allowedUserIds.length ? allowedUserIds : undefined, metricsToken: env.TANK_METRICS_TOKEN || '',
    guestQueue: !production && env.TANK_QUEUE_GUESTS === '1' };
}
