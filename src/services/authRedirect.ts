/** Keep public-site callbacks on a reachable origin even if an old build override points to localhost. */
export function buildAuthRedirect(href: string, recovery = false, configured?: string): string | undefined {
  try {
    const current = new URL(href);
    let target = new URL(configured || href);
    const loopback = (host: string) => host === 'localhost' || host === '127.0.0.1' || host === '[::1]' || host.endsWith('.localhost');
    if (['http:', 'https:'].includes(current.protocol) && !loopback(current.hostname) && loopback(target.hostname)) target = current;
    if (!['http:', 'https:'].includes(target.protocol)) return undefined;
    target.pathname = '/'; target.search = ''; target.hash = '';
    target.searchParams.set('auth', recovery ? 'recovery' : 'confirmation');
    return target.href;
  } catch { return undefined; }
}
