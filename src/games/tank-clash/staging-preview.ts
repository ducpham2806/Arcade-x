// Separate staging review page; never imported by the launcher or granted production rewards.
import { createClient, type Session } from '@supabase/supabase-js';
import { mountTankClash, type TankController } from './runtime';

const root = document.getElementById('app')!;
root.innerHTML = `<div class="tc-stage"><section class="tc-stage-login"><form><p>BẢN THỬ · TANK CLASH</p><h1>Đăng nhập để chơi online</h1><label>Email<input name="email" type="email" autocomplete="username" required></label><label>Mật khẩu<input name="password" type="password" autocomplete="current-password" required></label><button type="submit" disabled>Đăng nhập</button><p role="status" class="tc-stage-status">Đang chuẩn bị bản thử…</p></form></section><section class="tc-stage-session" hidden><nav><span class="tc-stage-user"></span><button type="button" class="tc-stage-signout">Đăng xuất</button></nav><div class="tc-stage-game"></div></section></div>`;
const login = root.querySelector<HTMLElement>('.tc-stage-login')!, active = root.querySelector<HTMLElement>('.tc-stage-session')!;
const form = root.querySelector<HTMLFormElement>('form')!, button = form.querySelector<HTMLButtonElement>('button')!;
const status = root.querySelector<HTMLElement>('.tc-stage-status')!, game = root.querySelector<HTMLElement>('.tc-stage-game')!;
const password = form.elements.namedItem('password') as HTMLInputElement;
let controller: TankController | null = null, session: Session | null = null, mountedUser = '', disposed = false;
function showSession(next: Session | null) {
  session = next;
  const user = next?.user.id || '';
  if (user === mountedUser) return;
  controller?.destroy({ leaveOnline: true }); controller = null; game.replaceChildren(); mountedUser = user;
  try {
    const previous = sessionStorage.getItem('tank-clash.review-user');
    if (!user || (previous && previous !== user)) sessionStorage.removeItem('tank-clash.seat');
    if (user) sessionStorage.setItem('tank-clash.review-user', user); else sessionStorage.removeItem('tank-clash.review-user');
  } catch { /* storage optional */ }
  login.hidden = !!next; active.hidden = !next;
  if (next) {
    root.querySelector<HTMLElement>('.tc-stage-user')!.textContent = next.user.email || 'Tester';
    const server = `${location.protocol === 'https:' ? 'wss:' : 'ws:'}//${location.host}/tank`;
    controller = mountTankClash(game, { serverUrl: server, fixedServer: true, trustedServers: [server], getToken: () => session?.access_token });
  } else { status.textContent = 'Đăng nhập bằng tài khoản thử đã được cấp.'; password.value = ''; }
}
async function start() {
  const response = await fetch('/review/config', { cache: 'no-store' });
  if (!response.ok) throw Error('Review disabled');
  const config = await response.json();
  if (config.supabaseUrl !== 'https://khqipuipeawzlkqmdzdg.supabase.co' || !String(config.publishableKey).startsWith('sb_publishable_')) throw Error('Wrong staging configuration');
  const client = createClient(config.supabaseUrl, config.publishableKey, { auth: { persistSession: false, autoRefreshToken: true, detectSessionInUrl: false } });
  let acceptSessionEvents = true;
  const { data: { subscription } } = client.auth.onAuthStateChange((_event, next) => { if (!disposed && acceptSessionEvents) showSession(next); });
  status.textContent = 'Đăng nhập bằng tài khoản thử đã được cấp.'; button.disabled = false;
  form.addEventListener('submit', async event => {
    event.preventDefault(); button.disabled = true; status.textContent = 'Đang đăng nhập…';
    try {
      const email = (form.elements.namedItem('email') as HTMLInputElement).value.trim();
      const { data, error } = await client.auth.signInWithPassword({ email, password: password.value });
      password.value = '';
      if (error) status.textContent = 'Chưa đăng nhập được. Kiểm tra email, mật khẩu và kết nối rồi thử lại.';
      else if (data.session) { acceptSessionEvents = true; showSession(data.session); client.auth.startAutoRefresh(); }
    } catch { password.value = ''; status.textContent = 'Chưa kết nối được. Anh thử lại sau nhé.'; }
    finally { button.disabled = false; }
  });
  root.querySelector<HTMLButtonElement>('.tc-stage-signout')!.addEventListener('click', async () => {
    acceptSessionEvents = false; client.auth.stopAutoRefresh(); showSession(null); await client.auth.signOut({ scope: 'local' }).catch(() => {});
  });
  window.addEventListener('pagehide', () => { disposed = true; subscription.unsubscribe(); controller?.destroy(); client.auth.stopAutoRefresh(); }, { once: true });
}
void start().catch(() => { status.textContent = 'Bản thử chưa được cấu hình. Anh thử lại sau nhé.'; });
