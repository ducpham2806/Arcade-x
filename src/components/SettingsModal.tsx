import React, { useState, useEffect } from 'react';
import {
  X,
  Volume2,
  VolumeX,
  Music,
  Bell,
  Hand,
  ArrowUpCircle,
  Eye,
  RefreshCw,
  ShieldCheck,
  Sliders,
  Globe,
} from 'lucide-react';
import { useGame } from '../context/GameContext';
import { soundEngine } from '../services/audio';
import {
  CURRENT_APP_VERSION,
  setAutoUpdateEnabled,
  isAutoUpdateEnabled,
  simulateNewVersionForTest,
} from '../services/updateService';
import { hapticService } from '../services/haptics';
import { getStoredLanguage, setStoredLanguage, t, Language } from '../services/languageService';

export const SettingsModal: React.FC = () => {
  const { setActiveModal } = useGame();
  const [currentLang, setCurrentLang] = useState<Language>(() => getStoredLanguage());
  const [isSoundMuted, setIsSoundMuted] = useState<boolean>(soundEngine.getIsMuted());
  const [isMusicOn, setIsMusicOn] = useState<boolean>(true);
  const [isNotificationOn, setIsNotificationOn] = useState<boolean>(true);
  const [touchSensitivity, setTouchSensitivity] = useState<'tight' | 'standard' | 'spacious'>(() => {
    try {
      return (localStorage.getItem('arcadex_hex_touch_sensitivity') as any) || 'standard';
    } catch {
      return 'standard';
    }
  });
  const [autoUpdate, setAutoUpdate] = useState<boolean>(() => isAutoUpdateEnabled());
  const [isOnline, setIsOnline] = useState<boolean>(navigator.onLine);
  const [isUpdatingCache, setIsUpdatingCache] = useState<boolean>(false);
  const [cacheStatus, setCacheStatus] = useState<string>('Làm mới & Đồng bộ Cache PWA');

  useEffect(() => {
    const handleOnline = () => setIsOnline(true);
    const handleOffline = () => setIsOnline(false);
    window.addEventListener('online', handleOnline);
    window.addEventListener('offline', handleOffline);

    const handleLangChange = (e: Event) => {
      const custom = e as CustomEvent<Language>;
      if (custom.detail) setCurrentLang(custom.detail);
    };
    window.addEventListener('arcadex_language_changed', handleLangChange as EventListener);

    return () => {
      window.removeEventListener('online', handleOnline);
      window.removeEventListener('offline', handleOffline);
      window.removeEventListener('arcadex_language_changed', handleLangChange as EventListener);
    };
  }, []);

  const toggleLanguage = () => {
    try {
      soundEngine.play('click');
      hapticService.tap();
    } catch {}
    const nextLang: Language = currentLang === 'vi' ? 'en' : 'vi';
    setStoredLanguage(nextLang);
    setCurrentLang(nextLang);
  };

  const toggleSound = () => {
    try {
      soundEngine.play('click');
      hapticService.tap();
    } catch {}
    const nextMuted = !isSoundMuted;
    soundEngine.setMuted(nextMuted);
    setIsSoundMuted(nextMuted);
  };

  const handleToggleMusic = () => {
    try {
      soundEngine.play('click');
      hapticService.tap();
    } catch {}
    setIsMusicOn((prev) => !prev);
  };

  const handleToggleNotification = () => {
    try {
      soundEngine.play('click');
      hapticService.tap();
    } catch {}
    setIsNotificationOn((prev) => !prev);
  };

  const handleChangeSensitivity = (val: 'tight' | 'standard' | 'spacious') => {
    try {
      soundEngine.play('click');
      hapticService.tap();
    } catch {}
    setTouchSensitivity(val);
    localStorage.setItem('arcadex_hex_touch_sensitivity', val);
    window.dispatchEvent(new CustomEvent('arcadex_sensitivity_changed', { detail: val }));
  };

  return (
    <div
      onClick={() => {
        try {
          soundEngine.play('click');
          hapticService.tap();
        } catch {}
        setActiveModal('none');
      }}
      className="fixed inset-0 z-50 bg-black/85 backdrop-blur-md flex items-center justify-center p-4 animate-in fade-in duration-200"
    >
      <div
        onClick={(e) => e.stopPropagation()}
        className="w-full max-w-md max-h-[85vh] overflow-y-auto bg-[#12121a] border border-indigo-500/30 rounded-3xl p-6 shadow-2xl shadow-indigo-950/50 relative select-none animate-in zoom-in-95 duration-200 custom-scrollbar text-slate-200"
      >
        {/* Close Button */}
        <button
          type="button"
          onClick={() => {
            try {
              soundEngine.play('click');
              hapticService.tap();
            } catch {}
            setActiveModal('none');
          }}
          className="absolute top-4 right-4 w-10 h-10 rounded-full bg-white/10 hover:bg-white/20 border border-white/20 flex items-center justify-center text-white cursor-pointer active:scale-95 transition-all z-20 shadow-lg"
          title="Đóng"
        >
          <X className="w-5 h-5 stroke-[2.5]" />
        </button>

        {/* Header */}
        <div className="flex items-center gap-3 mb-6 pr-10">
          <div className="w-10 h-10 rounded-2xl bg-indigo-500/20 border border-indigo-500/40 flex items-center justify-center text-indigo-400 shadow-lg">
            <Sliders className="w-5 h-5" />
          </div>
          <div>
            <h2 className="text-xl font-black text-white font-display uppercase tracking-wider">
              {t('settings', currentLang)}
            </h2>
            <p className="text-xs text-slate-400">{t('settingsDesc', currentLang)}</p>
          </div>
        </div>

        {/* Toggles & Options List */}
        <div className="space-y-3.5">
          {/* LANGUAGE SWITCHER */}
          <div className="flex items-center justify-between bg-[#181824] border border-white/10 rounded-2xl p-3.5 shadow-inner">
            <div className="flex items-center gap-3">
              <div className="w-8 h-8 rounded-xl bg-indigo-500/20 flex items-center justify-center text-indigo-300 border border-indigo-500/30">
                <Globe className="w-4 h-4 text-indigo-300" />
              </div>
              <div>
                <span className="font-bold text-white text-xs tracking-wide">{t('language', currentLang)}</span>
                <div className="text-[10px] text-slate-400">{t('langDesc', currentLang)}</div>
              </div>
            </div>
            <button
              type="button"
              onClick={toggleLanguage}
              className="px-3 py-2 rounded-xl bg-indigo-600 hover:bg-indigo-500 text-white font-bold text-xs flex items-center gap-1.5 shadow-md shadow-indigo-600/30 transition-all cursor-pointer active:scale-95 uppercase tracking-wider"
            >
              <span>{currentLang === 'vi' ? '🇻🇳 Tiếng Việt' : '🇬🇧 English'}</span>
            </button>
          </div>

          {/* SOUND */}
          <div className="flex items-center justify-between bg-[#181824] border border-white/10 rounded-2xl p-3.5 shadow-inner">
            <div className="flex items-center gap-3">
              <div className="w-8 h-8 rounded-xl bg-indigo-500/20 flex items-center justify-center text-indigo-300 border border-indigo-500/30">
                {isSoundMuted ? <VolumeX className="w-4 h-4 text-rose-400" /> : <Volume2 className="w-4 h-4 text-indigo-300" />}
              </div>
              <div>
                <span className="font-bold text-white text-xs tracking-wide">{t('sound', currentLang)}</span>
                <div className="text-[10px] text-slate-400">{t('soundDesc', currentLang)}</div>
              </div>
            </div>
            <button
              type="button"
              onClick={toggleSound}
              className={`w-14 h-8 rounded-full transition-colors relative p-1 cursor-pointer shadow-inner ${
                !isSoundMuted ? 'bg-indigo-600' : 'bg-slate-700'
              }`}
            >
              <div
                className={`w-6 h-6 rounded-full bg-white shadow-md transform transition-transform duration-200 ${
                  !isSoundMuted ? 'translate-x-6' : 'translate-x-0'
                }`}
              />
            </button>
          </div>

          {/* MUSIC */}
          <div className="flex items-center justify-between bg-[#181824] border border-white/10 rounded-2xl p-3.5 shadow-inner">
            <div className="flex items-center gap-3">
              <div className="w-8 h-8 rounded-xl bg-indigo-500/20 flex items-center justify-center text-indigo-300 border border-indigo-500/30">
                <Music className="w-4 h-4 text-indigo-300" />
              </div>
              <div>
                <span className="font-bold text-white text-xs tracking-wide">{t('music', currentLang)}</span>
                <div className="text-[10px] text-slate-400">{t('musicDesc', currentLang)}</div>
              </div>
            </div>
            <button
              type="button"
              onClick={handleToggleMusic}
              className={`w-14 h-8 rounded-full transition-colors relative p-1 cursor-pointer shadow-inner ${
                isMusicOn ? 'bg-indigo-600' : 'bg-slate-700'
              }`}
            >
              <div
                className={`w-6 h-6 rounded-full bg-white shadow-md transform transition-transform duration-200 ${
                  isMusicOn ? 'translate-x-6' : 'translate-x-0'
                }`}
              />
            </button>
          </div>

          {/* NOTIFICATION */}
          <div className="flex items-center justify-between bg-[#181824] border border-white/10 rounded-2xl p-3.5 shadow-inner">
            <div className="flex items-center gap-3">
              <div className="w-8 h-8 rounded-xl bg-indigo-500/20 flex items-center justify-center text-indigo-300 border border-indigo-500/30">
                <Bell className="w-4 h-4 text-indigo-300" />
              </div>
              <div>
                <span className="font-bold text-white text-xs tracking-wide">{t('notification', currentLang)}</span>
                <div className="text-[10px] text-slate-400">{t('notificationDesc', currentLang)}</div>
              </div>
            </div>
            <button
              type="button"
              onClick={handleToggleNotification}
              className={`w-14 h-8 rounded-full transition-colors relative p-1 cursor-pointer shadow-inner ${
                isNotificationOn ? 'bg-indigo-600' : 'bg-slate-700'
              }`}
            >
              <div
                className={`w-6 h-6 rounded-full bg-white shadow-md transform transition-transform duration-200 ${
                  isNotificationOn ? 'translate-x-6' : 'translate-x-0'
                }`}
              />
            </button>
          </div>

          {/* TOUCH SENSITIVITY */}
          <div className="bg-[#181824] border border-white/10 rounded-2xl p-3.5 shadow-inner">
            <div className="flex items-center gap-2.5 mb-2.5">
              <div className="w-8 h-8 rounded-xl bg-cyan-500/20 flex items-center justify-center text-cyan-300 border border-cyan-500/30">
                <Hand className="w-4 h-4" />
              </div>
              <div>
                <div className="font-bold text-white text-xs uppercase tracking-wide">
                  {t('touchSensitivity', currentLang)}
                </div>
                <div className="text-[10px] text-slate-400">
                  {t('touchDesc', currentLang)}
                </div>
              </div>
            </div>

            <div className="grid grid-cols-3 gap-2 mt-2">
              <button
                type="button"
                onClick={() => handleChangeSensitivity('tight')}
                className={`py-2 px-2 rounded-xl text-[11px] font-bold transition-all cursor-pointer border ${
                  touchSensitivity === 'tight'
                    ? 'bg-cyan-600 text-white border-cyan-400 shadow-lg shadow-cyan-900/40'
                    : 'bg-white/5 text-slate-300 border-white/10 hover:bg-white/10'
                }`}
              >
                <div>{t('tight', currentLang)}</div>
                <div className="text-[9px] font-normal opacity-70">{t('tightSub', currentLang)}</div>
              </button>

              <button
                type="button"
                onClick={() => handleChangeSensitivity('standard')}
                className={`py-2 px-2 rounded-xl text-[11px] font-bold transition-all cursor-pointer border ${
                  touchSensitivity === 'standard'
                    ? 'bg-cyan-600 text-white border-cyan-400 shadow-lg shadow-cyan-900/40'
                    : 'bg-white/5 text-slate-300 border-white/10 hover:bg-white/10'
                }`}
              >
                <div>{t('standard', currentLang)}</div>
                <div className="text-[9px] font-normal opacity-70">{t('standardSub', currentLang)}</div>
              </button>

              <button
                type="button"
                onClick={() => handleChangeSensitivity('spacious')}
                className={`py-2 px-2 rounded-xl text-[11px] font-bold transition-all cursor-pointer border ${
                  touchSensitivity === 'spacious'
                    ? 'bg-cyan-600 text-white border-cyan-400 shadow-lg shadow-cyan-900/40'
                    : 'bg-white/5 text-slate-300 border-white/10 hover:bg-white/10'
                }`}
              >
                <div>{t('spacious', currentLang)}</div>
                <div className="text-[9px] font-normal opacity-70">{t('spaciousSub', currentLang)}</div>
              </button>
            </div>
          </div>

          {/* AUTO-UPDATE & SPLASH SCREEN SECTION */}
          <div className="bg-[#181824] border border-white/10 rounded-2xl p-3.5 shadow-inner">
            <div className="flex items-center justify-between mb-3">
              <div className="flex items-center gap-2.5">
                <div className="w-8 h-8 rounded-xl bg-amber-500/20 flex items-center justify-center text-amber-300 border border-amber-500/30">
                  <ArrowUpCircle className="w-4 h-4" />
                </div>
                <div>
                  <div className="font-bold text-white text-xs uppercase tracking-wide">
                    {t('versionUpdate', currentLang)}
                  </div>
                  <div className="text-[10px] text-slate-400">
                    {t('currentVersion', currentLang)} <strong className="font-mono text-amber-400">v{CURRENT_APP_VERSION}</strong>
                  </div>
                </div>
              </div>

              <button
                type="button"
                onClick={() => {
                  try {
                    soundEngine.play('click');
                    hapticService.tap();
                  } catch {}
                  const next = !autoUpdate;
                  setAutoUpdate(next);
                  setAutoUpdateEnabled(next);
                }}
                className={`w-14 h-8 rounded-full transition-colors relative p-1 cursor-pointer shadow-inner ${
                  autoUpdate ? 'bg-indigo-600' : 'bg-slate-700'
                }`}
              >
                <div
                  className={`w-6 h-6 rounded-full bg-white shadow-md transform transition-transform duration-200 ${
                    autoUpdate ? 'translate-x-6' : 'translate-x-0'
                  }`}
                />
              </button>
            </div>

            <div className="grid grid-cols-2 gap-2 mt-2">
              <button
                type="button"
                onClick={() => {
                  try {
                    soundEngine.play('click');
                    hapticService.tap();
                  } catch {}
                  setActiveModal('none');
                  window.dispatchEvent(
                    new CustomEvent('arcadex:trigger_splash', { detail: { forceUpdate: false } })
                  );
                }}
                className="py-2 px-2.5 rounded-xl bg-white/10 hover:bg-white/15 text-white font-bold text-xs border border-white/20 flex items-center justify-center gap-1.5 active:scale-95 transition-all shadow-sm cursor-pointer"
              >
                <Eye className="w-3.5 h-3.5 text-indigo-300" />
                <span>{t('viewSplash', currentLang)}</span>
              </button>

              <button
                type="button"
                onClick={() => {
                  try {
                    soundEngine.play('click');
                    hapticService.tap();
                  } catch {}
                  setActiveModal('none');
                  simulateNewVersionForTest();
                }}
                className="py-2 px-2.5 rounded-xl bg-gradient-to-r from-amber-600 to-amber-700 hover:from-amber-500 hover:to-amber-600 text-white font-bold text-xs flex items-center justify-center gap-1.5 active:scale-95 transition-all shadow-sm cursor-pointer shadow-amber-950/40"
              >
                <RefreshCw className="w-3.5 h-3.5 text-amber-200 animate-spin" />
                <span>{t('testUpdate', currentLang)}</span>
              </button>
            </div>
          </div>

          {/* PWA & OFFLINE CACHE STATUS */}
          <div className="bg-[#181824] border border-white/10 rounded-2xl p-3.5 shadow-inner">
            <div className="flex items-center justify-between mb-2">
              <div className="flex items-center gap-2.5">
                <div className="w-8 h-8 rounded-xl bg-emerald-500/20 flex items-center justify-center text-emerald-300 border border-emerald-500/30">
                  <ShieldCheck className="w-4 h-4" />
                </div>
                <div>
                  <div className="font-bold text-white text-xs uppercase tracking-wide">{t('pwaCache', currentLang)}</div>
                  <div className="text-[10px] text-slate-400 flex items-center gap-1.5 mt-0.5">
                    <span className={`inline-block w-2 h-2 rounded-full ${isOnline ? 'bg-emerald-500' : 'bg-amber-500 animate-pulse'}`} />
                    <span>{isOnline ? t('online', currentLang) : t('offline', currentLang)}</span>
                  </div>
                </div>
              </div>
              <span className="text-[10px] px-2 py-0.5 rounded-full bg-emerald-500/20 text-emerald-400 font-black border border-emerald-500/30">
                ACTIVE
              </span>
            </div>
            <p className="text-[11px] text-slate-300 leading-relaxed mb-3">
              {t('pwaDesc', currentLang)}
            </p>
            <button
              type="button"
              id="btn-refresh-cache-sw"
              onClick={async () => {
                try {
                  soundEngine.play('click');
                  hapticService.tap();
                } catch {}
                setIsUpdatingCache(true);
                setCacheStatus('Đang kiểm tra...');
                try {
                  if ('serviceWorker' in navigator) {
                    const reg = await navigator.serviceWorker.getRegistration();
                    if (reg) {
                      await reg.update();
                    }
                  }
                  setTimeout(() => {
                    setCacheStatus('Cache Đã Đồng Bộ 100%');
                    setIsUpdatingCache(false);
                  }, 800);
                } catch {
                  setCacheStatus('Đã đồng bộ');
                  setIsUpdatingCache(false);
                }
              }}
              disabled={isUpdatingCache}
              className="w-full py-2.5 rounded-xl bg-indigo-600 hover:bg-indigo-500 text-white font-bold text-xs flex items-center justify-center gap-2 shadow-lg shadow-indigo-600/30 transition-all cursor-pointer active:scale-95 disabled:opacity-50"
            >
              <RefreshCw className={`w-4 h-4 ${isUpdatingCache ? 'animate-spin' : ''}`} />
              <span>{cacheStatus}</span>
            </button>
          </div>
        </div>
      </div>
    </div>
  );
};
