/** Optional staging sign-in. The downloadable offline HTML has no Auth configuration. */
import { createClient } from '@supabase/supabase-js';
import { registeredTokenProvider } from './access.ts';
export type PreviewAuth = { url: string; publishableKey: string };
export function previewAccount(config: PreviewAuth, onSignOut: () => void) {
  const client = createClient(config.url, config.publishableKey, { auth: { persistSession: false, autoRefreshToken: false, detectSessionInUrl: false } });
  const abort = new AbortController(), signal = abort.signal;
  document.documentElement.classList.add('tc-has-account');
  const bar = document.createElement('div'); bar.className = 'tc-account-bar';
  bar.innerHTML = '<span>BẢN THỬ STAGING · <b>Chưa đăng nhập</b></span><button type="button">Đăng nhập</button>';
  const dialog = document.createElement('dialog'); dialog.className = 'tc-account-dialog';
  dialog.innerHTML = `<form><h1>Tài khoản chơi thử</h1><p>Dùng tài khoản staging đã được cấp quyền. Bản này không tạo tài khoản mới.</p><label>Email<input type="email" name="email" required autocomplete="username"></label><label>Mật khẩu<input type="password" name="password" required autocomplete="current-password"></label><p class="tc-account-error" role="alert"></p><div><button type="submit">Đăng nhập</button><button type="button" data-close>Quay lại</button></div><small>Phiên đăng nhập chỉ giữ trong bộ nhớ của tab này.</small></form>`;
  document.body.prepend(bar); document.body.append(dialog);
  let signedIn = false;
  bar.querySelector('button')!.addEventListener('click', async () => {
    if (!signedIn) { dialog.showModal(); return; }
    onSignOut();
    try { await client.auth.signOut({ scope: 'local' }); } finally { location.reload(); }
    signedIn = false;
    bar.querySelector('b')!.textContent = 'Chưa đăng nhập'; bar.querySelector('button')!.textContent = 'Đăng nhập';
  }, { signal });
  dialog.querySelector('[data-close]')!.addEventListener('click', () => dialog.close(), { signal });
  dialog.querySelector('form')!.addEventListener('submit', async event => {
    event.preventDefault(); const email = dialog.querySelector<HTMLInputElement>('[name=email]')!, password = dialog.querySelector<HTMLInputElement>('[name=password]')!, button = dialog.querySelector<HTMLButtonElement>('[type=submit]')!, error = dialog.querySelector<HTMLElement>('[role=alert]')!;
    button.disabled = true; error.textContent = '';
    try {
      const response = await client.auth.signInWithPassword({ email: email.value.trim(), password: password.value });
      if (response.error || !response.data.session || response.data.user?.is_anonymous) throw new Error();
      if (signal.aborted) return;
      signedIn = true; bar.querySelector('b')!.textContent = 'Đã đăng nhập'; bar.querySelector('button')!.textContent = 'Đăng xuất'; dialog.close();
    } catch { if (!signal.aborted) error.textContent = 'Không đăng nhập được. Kiểm tra tài khoản staging và thử lại.'; }
    finally { password.value = ''; button.disabled = false; }
  }, { signal });
  return { getToken: registeredTokenProvider(client), destroy() { abort.abort(); dialog.close(); bar.remove(); dialog.remove(); client.auth.stopAutoRefresh(); } };
}
