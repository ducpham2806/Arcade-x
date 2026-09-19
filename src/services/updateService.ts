export const CURRENT_APP_VERSION = '2.5.1';
export const APP_CODENAME = 'Titan & Neon Odyssey';
export const APP_RELEASE_NOTES = 'Bổ sung hệ thống Force Update độc lập cho Launcher, tối ưu hóa trải nghiệm Level Up với In-Game Toast thông minh, nâng cấp bảo mật và đồng bộ Firebase Cloud.';

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
export const checkPendingUpdate = (): UpdateInfo => {
  const stored = getStoredVersion();
  const isSWPending = typeof window !== 'undefined' && Boolean(window.__arcadex_sw_update_pending);
  const isForcePending = typeof window !== 'undefined' && Boolean(window.__arcadex_force_update_pending);
  
  if (isForcePending) {
    return {
      hasUpdate: true,
      currentVersion: stored,
      newVersion: window.__arcadex_force_update_target_version || '2.5.2',
      releaseNotes: APP_RELEASE_NOTES,
      isServiceWorkerUpdate: isSWPending,
      isForceUpdate: true,
    };
  }

  // Prevent infinite loops if localStorage fails or if user already saw update this session
  const sessionSkipped = typeof window !== 'undefined' && sessionStorage.getItem('arcadex_splash_completed') === 'true';
  if (sessionSkipped && !isSWPending) {
    return {
      hasUpdate: false,
      currentVersion: CURRENT_APP_VERSION,
      newVersion: CURRENT_APP_VERSION,
      releaseNotes: APP_RELEASE_NOTES,
      isForceUpdate: false,
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
      isForceUpdate: true,
    };
  }

  if (isSWPending) {
    return {
      hasUpdate: true,
      currentVersion: CURRENT_APP_VERSION,
      newVersion: '2.5.2',
      releaseNotes: 'Bản vá sửa lỗi PWA Service Worker và cập nhật bộ đệm tài nguyên trò chơi.',
      isServiceWorkerUpdate: true,
      isForceUpdate: true,
    };
  }

  return {
    hasUpdate: false,
    currentVersion: CURRENT_APP_VERSION,
    newVersion: CURRENT_APP_VERSION,
    releaseNotes: APP_RELEASE_NOTES,
    isForceUpdate: false,
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

/**
 * Trigger Force Update Modal directly (e.g. from Settings or remote push event)
 */
export const triggerForceUpdateModal = (targetVersion: string = '2.5.2'): void => {
  if (typeof window !== 'undefined') {
    window.__arcadex_force_update_pending = true;
    window.__arcadex_force_update_target_version = targetVersion;
    window.dispatchEvent(
      new CustomEvent('arcadex:force_update_detected', {
        detail: {
          targetVersion,
          releaseNotes: APP_RELEASE_NOTES,
        },
      })
    );
  }
};

/**
 * Execute Force Update: purge outdated cache, record version, and refresh page cleanly
 */
export const executeForceUpdate = async (newVersion: string = CURRENT_APP_VERSION): Promise<void> => {
  try {
    setStoredVersion(newVersion);
    if (typeof window !== 'undefined') {
      sessionStorage.removeItem('arcadex_splash_completed');
      window.__arcadex_force_update_pending = false;
      window.__arcadex_sw_update_pending = false;

      // Clear Service Worker caches if available
      if ('caches' in window) {
        try {
          const cacheNames = await caches.keys();
          await Promise.all(cacheNames.map((name) => caches.delete(name)));
        } catch {
          // Ignore cache errors
        }
      }

      // If SW registration is waiting, activate it
      if ('serviceWorker' in navigator) {
        try {
          const registrations = await navigator.serviceWorker.getRegistrations();
          for (const registration of registrations) {
            registration.update().catch(() => {});
          }
        } catch {
          // Ignore
        }
      }
    }
  } catch {
    // Ignore
  }
};

