import { AuthService } from './auth';
export type BootPhase = { progress: number; message: string; error?: string };
export const pwaState: BootPhase = { progress: 20, message: 'Đang kiểm tra phiên bản…' };
let registration: ServiceWorkerRegistration | undefined;
export function reportPwa(progress: number, message: string, error?: string) {
  Object.assign(pwaState, { progress, message, error });
  window.dispatchEvent(new Event('arcadex:boot_progress'));
}
export function setPwaRegistration(value: ServiceWorkerRegistration | undefined) { registration = value; }
export async function checkForUpdate(): Promise<void> {
  if (!('serviceWorker' in navigator) || import.meta.env.DEV) { reportPwa(80, 'Ứng dụng đã sẵn sàng.'); return; }
  let reg = registration || await navigator.serviceWorker.getRegistration();
  if (!reg) {
    await new Promise<void>(resolve => {
      const finish = () => { clearTimeout(timer); window.removeEventListener('arcadex:boot_progress', finish); resolve(); };
      const timer = setTimeout(finish, 4000);
      window.addEventListener('arcadex:boot_progress', finish);
    });
    reg = registration || await navigator.serviceWorker.getRegistration();
  }
  if (!reg) { reportPwa(80, 'Đang dùng ứng dụng trực tuyến.'); return; }
  if (navigator.onLine) await reg.update();
  if (reg.installing) await new Promise<void>((resolve, reject) => {
    const worker = reg.installing!;
    const timer = setTimeout(() => { worker.removeEventListener('statechange', changed); reject(new Error('Tải cập nhật quá lâu. Hãy thử lại.')); }, 15000);
    const changed = () => {
      if (worker.state === 'installed' || worker.state === 'activated') { clearTimeout(timer); worker.removeEventListener('statechange', changed); resolve(); }
      else if (worker.state === 'redundant') { clearTimeout(timer); worker.removeEventListener('statechange', changed); reject(new Error('Chưa tải được bản cập nhật. Bản hiện tại vẫn được giữ.')); }
    };
    worker.addEventListener('statechange', changed); changed();
  });
  window.__arcadex_sw_update_pending = !!reg.waiting;
  reportPwa(80, reg.waiting ? 'Có bản cập nhật mới sẵn sàng.' : 'Ứng dụng đã sẵn sàng.');
}
export async function installUpdate(): Promise<void> {
  await AuthService.checkpoint();
  await checkForUpdate();
  const reg = registration || await navigator.serviceWorker.getRegistration();
  if (!reg?.waiting) { reportPwa(80, 'Bạn đang dùng bản mới nhất.'); return; }
  reportPwa(90, 'Đang kích hoạt bản cập nhật…');
  const worker = reg.waiting;
  await new Promise<void>((resolve, reject) => {
    const cleanup = () => { clearTimeout(timer); worker.removeEventListener('statechange', changed); };
    const timer = setTimeout(() => { cleanup(); reject(new Error('Chưa kích hoạt được cập nhật. Hãy thử lại.')); }, 15000);
    const changed = () => {
      if (worker.state === 'activated') { cleanup(); resolve(); }
      else if (worker.state === 'redundant') { cleanup(); reject(new Error('Bản cập nhật không kích hoạt được.')); }
    };
    worker.addEventListener('statechange', changed);
    worker.postMessage({ type: 'SKIP_WAITING' });
    changed();
  });
  sessionStorage.removeItem('arcadex_splash_completed');
  window.location.reload();
}

