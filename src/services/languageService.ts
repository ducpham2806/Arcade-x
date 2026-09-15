export type Language = 'vi' | 'en';

export const getStoredLanguage = (): Language => {
  try {
    return (localStorage.getItem('arcadex_language') as Language) || 'vi';
  } catch {
    return 'vi';
  }
};

export const setStoredLanguage = (lang: Language) => {
  try {
    localStorage.setItem('arcadex_language', lang);
    window.dispatchEvent(new CustomEvent('arcadex_language_changed', { detail: lang }));
  } catch {}
};

export const translations = {
  vi: {
    settings: 'Cài Đặt Hệ Thống',
    settingsDesc: 'Tùy chỉnh âm thanh, độ nhạy, ngôn ngữ & phiên bản ArcadeX',
    sound: 'Âm Thanh Hiệu Ứng',
    soundDesc: 'Tiếng bấm nút, chiến thắng & phần thưởng',
    music: 'Nhạc Nền Arcade',
    musicDesc: 'Giai điệu synthwave & điện tử sảnh chờ',
    notification: 'Thông Báo Quà Tặng',
    notificationDesc: 'Nhắc nhở nhiệm vụ, vòng quay & thành tựu',
    touchSensitivity: 'Độ Nhạy Chạm & Vuốt Kẹo',
    touchDesc: 'Tối ưu hóa theo kích cỡ tay & ngón bấm',
    tight: 'Chính Xác',
    tightSub: 'Tay Nhỏ',
    standard: 'Tiêu Chuẩn',
    standardSub: 'Vừa Tay',
    spacious: 'Rộng / Nhạy',
    spaciousSub: 'Tay Lớn',
    versionUpdate: 'Phiên Bản & Cập Nhật Tự Động',
    currentVersion: 'Phiên bản hiện tại:',
    viewSplash: 'Xem Splash Screen',
    testUpdate: 'Thử Nghiệm Update',
    pwaCache: 'PWA & Offline Cache',
    online: 'Đang Online',
    offline: 'Đang Ngoại Tuyến (Offline)',
    pwaDesc: 'Service Worker tự động lưu trữ mã nguồn, đồ họa và âm thanh mini-game vào bộ nhớ máy để bạn chơi mượt mà kể cả khi mất mạng.',
    syncCache: 'Làm mới & Đồng bộ Cache PWA',
    language: 'Ngôn Ngữ Hiển Thị',
    langDesc: 'Chuyển đổi giữa Tiếng Việt & Tiếng Anh',
    pullToRefresh: 'Kéo xuống để làm mới & đồng bộ dữ liệu...',
    refreshing: 'Đang đồng bộ với Backend & Local Storage...',
    synced: 'Đã đồng bộ dữ liệu thành công!',
  },
  en: {
    settings: 'System Settings',
    settingsDesc: 'Customize sound, sensitivity, language & ArcadeX version',
    sound: 'Sound Effects',
    soundDesc: 'Button clicks, wins & rewards',
    music: 'Arcade Music',
    musicDesc: 'Synthwave & lobby electronic melodies',
    notification: 'Gift Notifications',
    notificationDesc: 'Quest reminders, spin wheel & achievements',
    touchSensitivity: 'Touch & Swipe Sensitivity',
    touchDesc: 'Optimized for hand size & tap precision',
    tight: 'Precise',
    tightSub: 'Small Hands',
    standard: 'Standard',
    standardSub: 'Normal',
    spacious: 'Spacious',
    spaciousSub: 'Large Hands',
    versionUpdate: 'Version & Auto-Update',
    currentVersion: 'Current Version:',
    viewSplash: 'View Splash Screen',
    testUpdate: 'Test Update',
    pwaCache: 'PWA & Offline Cache',
    online: 'Online',
    offline: 'Offline Mode',
    pwaDesc: 'Service Worker automatically caches mini-game code, assets, and audio for seamless offline play.',
    syncCache: 'Refresh & Sync PWA Cache',
    language: 'Display Language',
    langDesc: 'Switch between Vietnamese & English',
    pullToRefresh: 'Pull down to refresh & sync data...',
    refreshing: 'Syncing with backend & local state...',
    synced: 'Data successfully synced!',
  },
};

export const t = (key: keyof typeof translations['vi'], lang: Language = getStoredLanguage()): string => {
  return translations[lang]?.[key] || translations['vi'][key] || key;
};
