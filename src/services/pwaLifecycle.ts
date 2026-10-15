import { AuthService } from './auth';
export type BootPhase = { progress: number; message: string; error?: string };
export const pwaState: BootPhase = { progress: 20, message: 'Đang kiểm tra phiên bản…' };
let registration: ServiceWorkerRegistration | undefined;
let checking: Promise<void> | undefined;
let installing: Promise<void> | undefined;
export function reportPwa(progress: number, message: string, error?: string) {
  Object.assign(pwaState, { progress, message, error });
  window.dispatchEvent(new Event('arcadex:boot_progress'));
}
export function setPwaRegistration(value: ServiceWorkerRegistration | undefined) { registration = value; }
// Bound network and browser APIs without leaving a timeout or unhandled rejection behind.
export function withDeadline<T>(task: Promise<T>, ms: number): Promise<T> {
  return new Promise((resolve, reject) => {
    const timer = setTimeout(() => reject(new Error('update-timeout')), ms);
    task.then(value => { clearTimeout(timer); resolve(value); }, error => { clearTimeout(timer); reject(error); });
  });
}
async function check(): Promise<void> {
  if (!('serviceWorker' in navigator) || import.meta.env.DEV) { reportPwa(80, 'Ứng dụng đã sẵn sàng.'); return; }
  try {
    // Registration can finish after this check; main.tsx delivers the later update event.
    const reg = registration || await withDeadline(navigator.serviceWorker.getRegistration(), 1000);
    if (!reg) { reportPwa(80, 'Đang dùng ứng dụng trực tuyến.'); return; }
    registration = reg;
    if (navigator.onLine && !reg.waiting && !reg.installing) await withDeadline(reg.update(), 2500);
    window.__arcadex_sw_update_pending = !!reg.waiting;
    reportPwa(80, reg.waiting ? 'Có bản cập nhật mới sẵn sàng.' : reg.installing ? 'Bản cập nhật đang tải trong nền.' : 'Ứng dụng đã sẵn sàng.');
  } catch {
    // An optional update must never prevent online or cached play.
    reportPwa(80, 'Sẵn sàng mở launcher; sẽ kiểm tra cập nhật lại khi có kết nối.');
  }
}
export function checkForUpdate(): Promise<void> {
  if (!checking) checking = check().finally(() => { checking = undefined; });
  return checking;
}
async function activate(): Promise<void> {
  await withDeadline(AuthService.checkpoint(), 4000);
  if (!('serviceWorker' in navigator)) return;
  await checkForUpdate();
  const reg = registration || await withDeadline(navigator.serviceWorker.getRegistration(), 1000);
  if (!reg?.waiting) { reportPwa(80, reg?.installing ? 'Bản cập nhật vẫn đang tải trong nền.' : 'Bạn đang dùng bản mới nhất.'); return; }
  reportPwa(90, 'Đang kích hoạt bản cập nhật…');
  const worker = reg.waiting;
  await new Promise<void>((resolve, reject) => {
    const cleanup = () => { clearTimeout(timer); worker.removeEventListener('statechange', changed); };
    const timer = setTimeout(() => { cleanup(); reject(new Error('Chưa kích hoạt được cập nhật. Bạn có thể tiếp tục dùng bản hiện tại.')); }, 8000);
    const changed = () => {
      if (worker.state === 'activated') { cleanup(); resolve(); }
      else if (worker.state === 'redundant') { cleanup(); reject(new Error('Bản cập nhật chưa sẵn sàng. Hãy thử lại sau.')); }
    };
    worker.addEventListener('statechange', changed);
    try { worker.postMessage({ type: 'SKIP_WAITING' }); changed(); }
    catch (error) { cleanup(); reject(error); }
  });
  try { sessionStorage.removeItem('arcadex_splash_completed'); } catch { /* Storage may be unavailable. */ }
  window.location.reload();
}
export function installUpdate(): Promise<void> {
  if (!installing) installing = activate().finally(() => { installing = undefined; });
  return installing;
}
