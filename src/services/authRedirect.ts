/** Local file/content URLs cannot receive email callbacks. Omit redirectTo so
 * Supabase uses the project's configured Site URL in that case. */
export function buildAuthRedirect(href: string, recovery = false, configured?: string): string | undefined {
  try {
    const target = new URL(configured || href);
    if (!['http:', 'https:'].includes(target.protocol)) return undefined;
    target.search = '';
    target.hash = '';
    target.searchParams.set('auth', recovery ? 'recovery' : 'confirmation');
    return target.href;
  } catch { return undefined; }
}
