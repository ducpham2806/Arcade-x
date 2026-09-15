export const CURRENT_APP_VERSION = '2.5.0';
export const APP_CODENAME = 'Titan & Neon Odyssey';
export const APP_RELEASE_NOTES = 'Bổ sung hệ thống Splash Screen với thanh tiến trình loading, tự động kiểm tra & cập nhật phiên bản mới, tối ưu hóa Tap Titans 2 RPG & Shikaku Fullscreen.';

export interface UpdateInfo {
  hasUpdate: boolean;
  currentVersion: string;
  newVersion: string;
  releaseNotes: string;
  isServiceWorkerUpdate?: boolean;
}

// Global flag to track SW update status
declare global {
  interface Window {
    __arcadex_sw_update_pending?: boolean;
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
export const checkPendingUpdate = (): UpdateInfo => {
  const stored = getStoredVersion();
  const isSWPending = typeof window !== 'undefined' && Boolean(window.__arcadex_sw_update_pending);
  
  // Prevent infinite loops if localStorage fails or if user already saw update this session
  const sessionSkipped = typeof window !== 'undefined' && sessionStorage.getItem('arcadex_splash_completed') === 'true';
  if (sessionSkipped && !isSWPending) {
    return {
      hasUpdate: false,
      currentVersion: CURRENT_APP_VERSION,
      newVersion: CURRENT_APP_VERSION,
      releaseNotes: APP_RELEASE_NOTES,
    };
  }

  // If local stored version is older than CURRENT_APP_VERSION, or SW update pending
  if (stored !== CURRENT_APP_VERSION && !sessionSkipped) {
    return {
      hasUpdate: true,
      currentVersion: stored,
      newVersion: CURRENT_APP_VERSION,
      releaseNotes: APP_RELEASE_NOTES,
      isServiceWorkerUpdate: isSWPending,
    };
  }

  if (isSWPending) {
    return {
      hasUpdate: true,
      currentVersion: CURRENT_APP_VERSION,
      newVersion: '2.5.1',
      releaseNotes: 'Bản vá sửa lỗi PWA Service Worker và cập nhật bộ đệm tài nguyên trò chơi.',
      isServiceWorkerUpdate: true,
    };
  }

  return {
    hasUpdate: false,
    currentVersion: CURRENT_APP_VERSION,
    newVersion: CURRENT_APP_VERSION,
    releaseNotes: APP_RELEASE_NOTES,
  };
};

/**
 * Trigger a simulated new version for user testing in settings
 */
export const simulateNewVersionForTest = (): void => {
  try {
    // Set stored version to previous version to trigger update flow
    localStorage.setItem('arcadex_app_version', '2.4.9');
    if (typeof window !== 'undefined') {
      window.__arcadex_sw_update_pending = true;
      window.dispatchEvent(new CustomEvent('arcadex:trigger_splash', { detail: { forceUpdate: true } }));
    }
  } catch {
    // Ignore
  }
};
