import { supabase, pauseCloudIdentity, resumeCloudIdentity } from './supabaseClient';

export type RecoveryState = { status: 'idle' | 'pending' | 'ready' | 'error'; owner?: string; error?: string };
const KEY = 'auth-recovery-v1';
const MAX_AGE = 30 * 60 * 1000;
const url = new URL(window.location.href);
const fragment = new URLSearchParams(url.hash.slice(1));
const incoming = url.searchParams.get('auth') === 'recovery' || fragment.get('type') === 'recovery';
const callbackFailed = url.searchParams.has('error') || fragment.has('error');
let remembered: { owner: string; startedAt: number } | null = null;
try { remembered = JSON.parse(sessionStorage.getItem(KEY) || 'null'); } catch { /* unusable recovery state */ }
if (remembered && (!remembered.owner || Date.now() - remembered.startedAt > MAX_AGE)) remembered = null;
let state: RecoveryState = incoming || remembered ? { status: callbackFailed ? 'error' : 'pending', error: callbackFailed ? 'Link đã hết hạn hoặc không hợp lệ. Hãy yêu cầu email mới.' : undefined } : { status: 'idle' };
let init: Promise<RecoveryState> | null = null;
let callbackMessage = callbackFailed && !incoming ? 'Link xác nhận đã hết hạn hoặc không hợp lệ. Hãy đăng nhập để gửi lại email xác nhận.' : '';
export function takeAuthCallbackMessage() { const message = callbackMessage; callbackMessage = ''; if (message) scrubCallback(); return message; }
export function getRecoveryState(): RecoveryState { return state; }
function notify(next: RecoveryState) {
  state = next;
  window.dispatchEvent(new Event('arcadex:auth_recovery'));
}
function scrubCallback() {
  const current = new URL(window.location.href);
  for (const key of ['auth', 'code', 'error', 'error_code', 'error_description']) current.searchParams.delete(key);
  const hash = new URLSearchParams(current.hash.slice(1));
  for (const key of ['access_token', 'refresh_token', 'expires_in', 'expires_at', 'token_type', 'type', 'error', 'error_code', 'error_description']) hash.delete(key);
  // Preserve unrelated application paths/query parameters.
  if (current.hash.includes('=')) current.hash = hash.toString();
  history.replaceState(history.state, '', current.pathname + current.search + current.hash);
}
if (callbackFailed && incoming) scrubCallback();
if (state.status !== 'idle') void pauseCloudIdentity();
supabase?.auth.onAuthStateChange((event, session) => {
  if (event === 'PASSWORD_RECOVERY') {
    void pauseCloudIdentity();
    if (!session?.user || session.user.is_anonymous) {
      notify({ status: 'error', error: 'Phiên khôi phục không hợp lệ. Hãy yêu cầu email mới.' });
      return;
    }
    remembered = { owner: session.user.id, startedAt: Date.now() };
    sessionStorage.setItem(KEY, JSON.stringify(remembered));
    notify({ status: 'ready', owner: session.user.id });
    scrubCallback();
  } else if (event === 'SIGNED_OUT' && state.status !== 'idle') {
    sessionStorage.removeItem(KEY);
    notify({ status: 'error', error: 'Phiên khôi phục đã kết thúc. Hãy yêu cầu email mới.' });
  }
});
export function initializeRecovery(): Promise<RecoveryState> {
  if (state.status === 'ready' || state.status === 'error') { if (incoming) scrubCallback(); return Promise.resolve(state); }
  if (!init) init = (async () => {
    if (state.status === 'idle' || state.status === 'error') { if (incoming) scrubCallback(); return state; }
    try {
      if (!supabase) throw new Error('Chưa cấu hình Supabase.');
      // getSession waits for the SDK to consume the callback; no SDK calls inside its event callback.
      const { error } = await supabase.auth.getSession();
      if (error) throw error;
      if (state.status === 'ready') return state;
      // A URL marker is only intent. It cannot authorize changing a previously signed-in user's password.
      if (!incoming && remembered) {
        const { data, error: userError } = await supabase.auth.getUser();
        if (!userError && data.user && !data.user.is_anonymous && data.user.id === remembered.owner) {
          notify({ status: 'ready', owner: data.user.id });
          return state;
        }
      }
      throw new Error('Phiên khôi phục không hợp lệ.');
    } catch {
      sessionStorage.removeItem(KEY);
      notify({ status: 'error', error: 'Link đã hết hạn hoặc không hợp lệ. Hãy yêu cầu email mới.' });
      scrubCallback();
      return state;
    }
  })();
  return init;
}
export function clearRecovery() {
  remembered = null; sessionStorage.removeItem(KEY); scrubCallback();
  notify({ status: 'idle' }); init = null; resumeCloudIdentity();
}
export function authRedirect(recovery = false) {
  return new URL(recovery ? '/?auth=recovery' : '/?auth=confirmation', window.location.origin).href;
}
