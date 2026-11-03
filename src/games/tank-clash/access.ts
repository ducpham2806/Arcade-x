/** The endpoint is configuration; an invite may choose a room, never where account tokens go. */
export function tankEndpoint(raw: string): string {
  const url = new URL(raw);
  if (!['ws:', 'wss:'].includes(url.protocol) || url.username || url.password || url.search || url.hash || url.pathname !== '/tank')
    throw new Error('Địa chỉ phòng cần là ws:// hoặc wss:// và có đường dẫn /tank.');
  return url.href;
}
export function accountEndpoint(raw: string, trusted?: string): string {
  const url = new URL(tankEndpoint(raw));
  if (!trusted || url.href !== tankEndpoint(trusted)) throw new Error('Chỉ gửi phiên đăng nhập tới máy chủ Tank Clash đã cấu hình.');
  if (url.protocol !== 'wss:' && !['localhost', '127.0.0.1', '[::1]'].includes(url.hostname))
    throw new Error('Máy chủ dùng tài khoản cần kết nối wss://.');
  return url.href;
}
type AccountSession = { access_token: string; expires_at?: number; user: { id: string; is_anonymous?: boolean } };
type SessionResult = { data: { session: AccountSession | null }; error: unknown };
export type SessionClient = { auth: { getSession(): Promise<SessionResult>; refreshSession(): Promise<SessionResult> } };
/** Reuse the app account. Never sign in anonymously, create users, bind profiles or query game tables. */
export function registeredTokenProvider(client: SessionClient | null, now: () => number = () => Date.now()) {
  return async (): Promise<string> => {
    if (!client) throw new Error('Chưa cấu hình tài khoản Arcade-X.');
    let response = await client.auth.getSession();
    if (response.error || !response.data.session) throw new Error('Đăng nhập Arcade-X để vào phòng thử.');
    if (response.data.session.expires_at && response.data.session.expires_at * 1000 < now() + 30_000) response = await client.auth.refreshSession();
    const s = response.data.session;
    if (response.error || !s?.access_token || !s.user?.id || s.user.is_anonymous || (s.expires_at && s.expires_at * 1000 <= now()))
      throw new Error('Cần phiên tài khoản đã đăng ký còn hiệu lực để vào phòng thử.');
    return s.access_token;
  };
}
