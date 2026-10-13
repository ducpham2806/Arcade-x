import {StrictMode} from 'react';
import {createRoot} from 'react-dom/client';
import App from './App.tsx';
import './index.css';
import './launcher/launcher.css';
import './launcher/platform-theme.css';
import { registerSW } from 'virtual:pwa-register';
import { reportPwa, setPwaRegistration } from './services/pwaLifecycle';
registerSW({
  immediate: true,
  // The launcher owns activation/reload so games and duplicate worker events stay safe.
  onNeedReload() {},
  onNeedRefresh() {
    window.__arcadex_sw_update_pending = true;
    reportPwa(80, 'Có bản cập nhật mới sẵn sàng.');
    window.dispatchEvent(new Event('arcadex:pwa_need_refresh'));
  },
  onOfflineReady() { reportPwa(80, 'Đã lưu tài nguyên để chơi ngoại tuyến.'); },
  onRegisteredSW(_url, registration) {
    setPwaRegistration(registration);
    reportPwa(50, 'Đã kết nối dịch vụ cập nhật.');
    const check = () => { if (navigator.onLine) void registration?.update().catch(() => {}); };
    setInterval(check, 60000);
    window.addEventListener('online', check);
  },
  onRegisterError() { reportPwa(80, 'Đang dùng ứng dụng trực tuyến; bộ nhớ ngoại tuyến chưa sẵn sàng.'); },
});
createRoot(document.getElementById('root')!).render(<StrictMode><App /></StrictMode>);

