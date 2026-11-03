/**
 * Which room servers may receive the player's Supabase access token.
 *
 * Invite links carry `?server=...`, so the server URL is attacker-controllable. A signed-in player's
 * JWT must only go to a server the deployment configured (wss, exact origin + path) or to a loopback
 * dev server. Any other server still works, but the player joins as a guest and no token is sent.
 */
const LOOPBACK = new Set(['localhost', '127.0.0.1', '[::1]', '::1']);

function key(url: string): { key: string; secure: boolean; loopback: boolean } | null {
  let u: URL;
  try { u = new URL(url); } catch { return null; }
  if (u.protocol !== 'ws:' && u.protocol !== 'wss:') return null;
  if (u.username || u.password) return null;
  const path = u.pathname.replace(/\/+$/, '') || '/';
  return { key: `${u.protocol}//${u.host.toLowerCase()}${path}`, secure: u.protocol === 'wss:', loopback: LOOPBACK.has(u.hostname.toLowerCase()) };
}

/** Parse a comma/space separated list (e.g. `VITE_TANK_CLASH_SERVERS`) into wss URLs only. */
export function parseTrustedServers(raw: string | undefined | null): string[] {
  return (raw ?? '').split(/[\s,]+/).filter(Boolean).filter(u => key(u)?.secure);
}

export function isTrustedServer(url: string, trusted: readonly string[]): boolean {
  const target = key(url);
  if (!target) return false;
  if (target.loopback) return true;
  if (!target.secure) return false;
  return trusted.some(t => { const k = key(t); return !!k?.secure && k.key === target.key; });
}

/** Token getter bound to one server URL: returns undefined unless that server is trusted. */
export function tokenFor(url: string, trusted: readonly string[], getToken?: () => string | undefined): (() => string | undefined) | undefined {
  if (!getToken || !isTrustedServer(url, trusted)) return undefined;
  return () => { try { return getToken() || undefined; } catch { return undefined; } };
}
