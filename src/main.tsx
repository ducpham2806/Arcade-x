import {StrictMode} from 'react';
import {createRoot} from 'react-dom/client';
import App from './App.tsx';
import './index.css';
import { registerSW } from 'virtual:pwa-register';

// Register Service Worker for offline PWA gameplay & asset caching
const updateSW = registerSW({
  immediate: true,
  onNeedRefresh() {
    console.log('[ArcadeX PWA] New update available. Updating service worker cache...');
    if (typeof window !== 'undefined') {
      window.__arcadex_sw_update_pending = true;
      window.dispatchEvent(new CustomEvent('arcadex:pwa_need_refresh'));
    }
    updateSW(true);
  },
  onOfflineReady() {
    console.log('[ArcadeX PWA] All mini-game assets are cached and ready for offline play!');
    if (typeof window !== 'undefined') {
      window.dispatchEvent(new CustomEvent('arcadex:pwa_offline_ready'));
    }
  },
  onRegistered(registration) {
    console.log('[ArcadeX PWA] Service Worker registered with scope:', registration?.scope);
  },
  onRegisterError(error) {
    console.warn('[ArcadeX PWA] Service Worker registration failed:', error);
  },
});

createRoot(document.getElementById('root')!).render(
  <StrictMode>
    <App />
  </StrictMode>,
);

