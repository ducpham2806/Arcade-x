export const CURRENT_APP_VERSION = '2.6.0';
export const APP_CODENAME = 'Ready to Play';
export const APP_RELEASE_NOTES = 'Màn hình đăng nhập riêng, hồ sơ với tên duy nhất và cập nhật PWA an toàn.';

export interface UpdateInfo {
  hasUpdate: boolean;
  currentVersion: string;
  newVersion: string;
  releaseNotes: string;
  isServiceWorkerUpdate?: boolean;
  isForceUpdate?: boolean;
}

// Global flag to track SW update status & force update triggers
declare global {
  interface Window {
    __arcadex_sw_update_pending?: boolean;
    __arcadex_force_update_pending?: boolean;
    __arcadex_force_update_target_version?: string;
  }
}

export const getStoredVersion = (): string => {
  try {
    return localStorage.getItem('arcadex_app_version') || CURRENT_APP_VERSION;
  } catch {
    return CURRENT_APP_VERSION;
  }
};

export const setStoredVersion = (version: string): void => {
  try {
    localStorage.setItem('arcadex_app_version', version);
  } catch {
    // Ignore storage quota or disabled errors
  }
};

export const isAutoUpdateEnabled = (): boolean => {
  try {
    return localStorage.getItem('arcadex_auto_update') !== 'false';
  } catch {
    return true;
  }
};

export const setAutoUpdateEnabled = (enabled: boolean): void => {
  try {
    localStorage.setItem('arcadex_auto_update', String(enabled));
  } catch {
    // Ignore
  }
};

/**
 * Check if there is an update pending either from Service Worker
 * or from a version bump compared to localStorage.
 */
export const checkPendingUpdate = (): UpdateInfo => ({
  hasUpdate: typeof window !== 'undefined' && !!window.__arcadex_sw_update_pending,
  currentVersion: CURRENT_APP_VERSION,
  newVersion: 'bản mới',
  releaseNotes: APP_RELEASE_NOTES,
  isServiceWorkerUpdate: typeof window !== 'undefined' && !!window.__arcadex_sw_update_pending,
});
// Compatibility for older settings buttons: always check the real worker.
export const simulateNewVersionForTest = (): void => { void import('./pwaLifecycle').then(m => m.checkForUpdate()).catch(() => {}); };
export const triggerForceUpdateModal = (_targetVersion?: string): void => { simulateNewVersionForTest(); };
export const executeForceUpdate = async (_newVersion?: string): Promise<void> => { const { installUpdate } = await import('./pwaLifecycle'); await installUpdate(); };
