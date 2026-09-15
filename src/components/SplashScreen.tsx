import React, { useState, useEffect, useRef } from 'react';
import { motion, AnimatePresence } from 'motion/react';
import { soundEngine } from '../services/audio';
import {
  CURRENT_APP_VERSION,
  APP_CODENAME,
  APP_RELEASE_NOTES,
  checkPendingUpdate,
  setStoredVersion,
  isAutoUpdateEnabled,
  UpdateInfo,
} from '../services/updateService';
import {
  Sparkles,
  Gamepad2,
  RefreshCw,
  CheckCircle2,
  Zap,
  ShieldCheck,
  ChevronRight,
  ArrowUpCircle,
  Cpu,
} from 'lucide-react';

interface SplashScreenProps {
  onComplete?: () => void;
  forceUpdateMode?: boolean;
}

export const SplashScreen: React.FC<SplashScreenProps> = ({
  onComplete,
  forceUpdateMode = false,
}) => {
  const [isVisible, setIsVisible] = useState<boolean>(true);
  const [progress, setProgress] = useState<number>(0);
  const [isUpdating, setIsUpdating] = useState<boolean>(false);
  const [updateInfo, setUpdateInfo] = useState<UpdateInfo>(() => checkPendingUpdate());
  const [statusMessage, setStatusMessage] = useState<string>('Đang khởi tạo hệ thống ArcadeX...');
  const [isCompleted, setIsCompleted] = useState<boolean>(false);
  const progressIntervalRef = useRef<ReturnType<typeof setInterval> | null>(null);
  const isUpdatingRef = useRef<boolean>(false);
  const updateInfoRef = useRef<UpdateInfo>(updateInfo);
  const onCompleteRef = useRef<(() => void) | undefined>(onComplete);

  useEffect(() => {
    isUpdatingRef.current = isUpdating;
  }, [isUpdating]);

  useEffect(() => {
    updateInfoRef.current = updateInfo;
  }, [updateInfo]);

  useEffect(() => {
    onCompleteRef.current = onComplete;
  }, [onComplete]);

  // Check update status and determine mode
  useEffect(() => {
    const info = checkPendingUpdate();
    setUpdateInfo(info);

    const shouldAutoUpdate = (info.hasUpdate || forceUpdateMode) && isAutoUpdateEnabled();
    setIsUpdating(shouldAutoUpdate);

    // Listen for PWA Service Worker refresh event
    const handlePwaNeedRefresh = () => {
      setIsUpdating(true);
      setUpdateInfo({
        hasUpdate: true,
        currentVersion: CURRENT_APP_VERSION,
        newVersion: '2.5.1',
        releaseNotes: 'Bản vá sửa lỗi PWA Service Worker & cập nhật tài nguyên mới.',
        isServiceWorkerUpdate: true,
      });
    };

    window.addEventListener('arcadex:pwa_need_refresh', handlePwaNeedRefresh);
    return () => {
      window.removeEventListener('arcadex:pwa_need_refresh', handlePwaNeedRefresh);
    };
  }, [forceUpdateMode]);

  // Main progress simulation loop
  useEffect(() => {
    if (!isVisible) return;

    let current = 0;
    const isUpdateFlow = isUpdatingRef.current;
    const stepInterval = isUpdateFlow ? 35 : 22; // Slightly more paced for update feeling

    progressIntervalRef.current = setInterval(() => {
      // Dynamic increment
      let increment = 1;
      if (current < 30) increment = Math.random() * 2.5 + 1.2;
      else if (current < 70) increment = Math.random() * 1.8 + 0.8;
      else if (current < 90) increment = Math.random() * 1.2 + 0.5;
      else increment = Math.random() * 0.9 + 0.4;

      current = Math.min(100, current + increment);
      setProgress(Math.floor(current));

      // Update descriptive messages based on mode and percentage
      if (isUpdateFlow) {
        if (current < 25) {
          setStatusMessage('Đang phát hiện & tải gói cập nhật phiên bản mới...');
        } else if (current < 50) {
          setStatusMessage('Tối ưu hóa các trò chơi (Tap Titans 2, Shikaku Fullscreen)...');
        } else if (current < 75) {
          setStatusMessage('Cập nhật Service Worker & bộ nhớ đệm Offline PWA...');
        } else if (current < 95) {
          setStatusMessage('Xác thực tính toàn vẹn dữ liệu bản cập nhật mới...');
        } else {
          setStatusMessage('Cập nhật phiên bản mới thành công!');
        }
      } else {
        if (current < 25) {
          setStatusMessage('Đang khởi tạo nền tảng ArcadeX...');
        } else if (current < 50) {
          setStatusMessage('Kiểm tra phiên bản & kiểm tra cập nhật hệ thống...');
        } else if (current < 75) {
          setStatusMessage('Nạp thư viện Mini-Games, Đồ họa & WebAudio...');
        } else if (current < 95) {
          setStatusMessage('Đồng bộ hòm đồ, thành tựu & ELO cá nhân...');
        } else {
          setStatusMessage('Khởi động thành công! Đang vào sảnh game...');
        }
      }

      if (current >= 100) {
        if (progressIntervalRef.current) clearInterval(progressIntervalRef.current);
        setIsCompleted(true);

        // Sound effect on completion
        try {
          soundEngine.play(isUpdateFlow ? 'win' : 'powerup');
        } catch {
          // Ignore
        }

        // If it was an update, save the new version to localStorage
        if (typeof window !== 'undefined') {
          sessionStorage.setItem('arcadex_splash_completed', 'true');
        }
        const info = updateInfoRef.current;
        if (isUpdateFlow && info.newVersion) {
          setStoredVersion(info.newVersion);
        } else {
          setStoredVersion(CURRENT_APP_VERSION);
        }

        // Clear SW pending flag
        if (typeof window !== 'undefined') {
          window.__arcadex_sw_update_pending = false;
        }

        // Smooth exit delay
        setTimeout(() => {
          setIsVisible(false);
          setTimeout(() => {
            if (onCompleteRef.current) onCompleteRef.current();
          }, 400);
        }, 650);
      }
    }, stepInterval);

    return () => {
      if (progressIntervalRef.current) clearInterval(progressIntervalRef.current);
    };
  }, [isVisible]);

  const handleSkip = () => {
    if (progressIntervalRef.current) clearInterval(progressIntervalRef.current);
    setProgress(100);
    setIsCompleted(true);
    if (typeof window !== 'undefined') {
      sessionStorage.setItem('arcadex_splash_completed', 'true');
    }
    if (isUpdating && updateInfo.newVersion) {
      setStoredVersion(updateInfo.newVersion);
    }
    setTimeout(() => {
      setIsVisible(false);
      setTimeout(() => {
        if (onComplete) onComplete();
      }, 200);
    }, 150);
  };

  return (
    <AnimatePresence>
      {isVisible && (
        <motion.div
          key="arcadex-splash-screen"
          initial={{ opacity: 0 }}
          animate={{ opacity: 1 }}
          exit={{ opacity: 0, scale: 1.02 }}
          transition={{ duration: 0.35, ease: 'easeInOut' }}
          className="fixed inset-0 z-[9999] bg-[#050505] flex flex-col items-center justify-between p-6 select-none overflow-hidden"
        >
          {/* Ambient Lighting Background Accents */}
          <div className="absolute top-1/4 -left-20 w-80 h-80 rounded-full bg-indigo-600/15 blur-[120px] pointer-events-none" />
          <div className="absolute bottom-1/4 -right-20 w-80 h-80 rounded-full bg-amber-500/15 blur-[120px] pointer-events-none" />
          <div className="absolute top-1/2 left-1/2 -translate-x-1/2 -translate-y-1/2 w-96 h-96 rounded-full bg-cyan-500/10 blur-[140px] pointer-events-none" />

          {/* Top Header info (App Codename & Version) */}
          <div className="w-full max-w-md flex items-center justify-between text-xs text-slate-400 pt-2 z-10">
            <div className="flex items-center gap-2">
              <span className="flex h-2 w-2 relative">
                <span className="animate-ping absolute inline-flex h-full w-full rounded-full bg-cyan-400 opacity-75"></span>
                <span className="relative inline-flex rounded-full h-2 w-2 bg-cyan-500"></span>
              </span>
              <span className="font-mono text-[11px] text-slate-300 font-semibold tracking-wider uppercase">
                {APP_CODENAME}
              </span>
            </div>

            <div className="flex items-center gap-1.5 bg-white/5 border border-white/10 px-2.5 py-1 rounded-full text-[11px] font-mono">
              <ShieldCheck className="w-3.5 h-3.5 text-emerald-400" />
              <span>v{isUpdating ? updateInfo.newVersion : CURRENT_APP_VERSION}</span>
            </div>
          </div>

          {/* Center Brand & Update Notification Hero */}
          <div className="w-full max-w-md flex flex-col items-center justify-center my-auto z-10 text-center">
            {/* Animated Logo Container */}
            <motion.div
              initial={{ scale: 0.8, opacity: 0 }}
              animate={{ scale: 1, opacity: 1 }}
              transition={{ duration: 0.5, ease: 'easeOut' }}
              className="relative mb-6"
            >
              {/* Outer Pulsing Glow */}
              <div
                className={`absolute inset-0 rounded-3xl blur-xl opacity-60 animate-pulse ${
                  isUpdating
                    ? 'bg-gradient-to-r from-emerald-500 via-cyan-500 to-indigo-500'
                    : 'bg-gradient-to-r from-indigo-500 via-purple-500 to-amber-500'
                }`}
              />

              {/* Main App Icon Card */}
              <div className="relative w-24 h-24 sm:w-28 sm:h-28 rounded-3xl bg-gradient-to-br from-[#1c1c28] to-[#0d0d14] border-2 border-white/20 shadow-2xl flex items-center justify-center overflow-hidden">
                <div className="absolute inset-0 bg-[radial-gradient(#ffffff0a_1px,transparent_1px)] [background-size:12px_12px]" />
                <Gamepad2
                  className={`w-12 h-12 sm:w-14 sm:h-14 transition-colors ${
                    isUpdating
                      ? 'text-cyan-400 drop-shadow-[0_0_12px_rgba(34,211,238,0.6)]'
                      : 'text-amber-400 drop-shadow-[0_0_12px_rgba(251,191,36,0.6)]'
                  }`}
                />

                {/* Corner Status Badge */}
                {isUpdating && (
                  <span className="absolute top-2 right-2 flex h-3 w-3">
                    <span className="animate-ping absolute inline-flex h-full w-full rounded-full bg-emerald-400 opacity-75" />
                    <span className="relative inline-flex rounded-full h-3 w-3 bg-emerald-500" />
                  </span>
                )}
              </div>
            </motion.div>

            {/* Platform Brand Title */}
            <motion.h1
              initial={{ y: 10, opacity: 0 }}
              animate={{ y: 0, opacity: 1 }}
              transition={{ delay: 0.15, duration: 0.4 }}
              className="text-4xl sm:text-5xl font-black tracking-wider uppercase font-display bg-gradient-to-r from-white via-slate-100 to-slate-400 bg-clip-text text-transparent drop-shadow-sm"
            >
              ARCADEX
            </motion.h1>

            <motion.p
              initial={{ y: 10, opacity: 0 }}
              animate={{ y: 0, opacity: 1 }}
              transition={{ delay: 0.2, duration: 0.4 }}
              className="text-xs sm:text-sm text-slate-400 font-medium mt-1 tracking-wide"
            >
              Instant Game Launcher & PWA Platform
            </motion.p>

            {/* Dynamic Notice Banner: AUTO-UPDATE VS NORMAL LOADING */}
            <div className="w-full mt-6">
              {isUpdating ? (
                <motion.div
                  initial={{ scale: 0.95, opacity: 0 }}
                  animate={{ scale: 1, opacity: 1 }}
                  className="bg-gradient-to-r from-emerald-950/60 via-cyan-950/40 to-indigo-950/60 border border-cyan-500/40 rounded-2xl p-3.5 shadow-lg shadow-cyan-950/40 text-left"
                >
                  <div className="flex items-center justify-between mb-1.5">
                    <div className="flex items-center gap-2">
                      <span className="p-1 rounded-lg bg-cyan-500/20 text-cyan-300 border border-cyan-500/30">
                        <ArrowUpCircle className="w-4 h-4 animate-bounce" />
                      </span>
                      <span className="text-xs font-black text-cyan-300 uppercase tracking-wide">
                        Đang Cập Nhật Phiên Bản Mới
                      </span>
                    </div>

                    <span className="text-[10px] font-mono font-bold bg-cyan-400/20 text-cyan-200 border border-cyan-400/30 px-2 py-0.5 rounded-full">
                      v{updateInfo.newVersion}
                    </span>
                  </div>

                  <p className="text-[11px] text-slate-300 leading-relaxed">
                    Hệ thống đang tự động tải và cập nhật tài nguyên phiên bản mới nhất. Vui lòng giữ màn hình để hoàn tất.
                  </p>

                  <div className="mt-2 pt-2 border-t border-white/5 flex items-center gap-1.5 text-[10px] text-slate-400">
                    <Sparkles className="w-3 h-3 text-amber-400 shrink-0" />
                    <span className="truncate">{updateInfo.releaseNotes}</span>
                  </div>
                </motion.div>
              ) : (
                <div className="flex items-center justify-center gap-2 text-xs text-slate-400">
                  <Cpu className="w-3.5 h-3.5 text-indigo-400 animate-pulse" />
                  <span>Nền tảng Instant Gaming không cần cài đặt</span>
                </div>
              )}
            </div>
          </div>

          {/* Bottom Progress Bar & Status Section */}
          <div className="w-full max-w-md z-10 mb-4">
            {/* Status Message & Percentage */}
            <div className="flex items-center justify-between text-xs mb-2">
              <span className="text-slate-300 font-medium truncate pr-2 flex items-center gap-1.5">
                {isCompleted ? (
                  <CheckCircle2 className="w-4 h-4 text-emerald-400 shrink-0" />
                ) : (
                  <RefreshCw
                    className={`w-3.5 h-3.5 shrink-0 text-cyan-400 ${
                      isUpdating ? 'animate-spin' : 'animate-spin'
                    }`}
                  />
                )}
                <span className="truncate">{statusMessage}</span>
              </span>

              <span
                className={`font-mono font-extrabold text-sm ${
                  isUpdating ? 'text-cyan-300' : 'text-amber-300'
                }`}
              >
                {progress}%
              </span>
            </div>

            {/* Custom High-Tech Progress Bar */}
            <div className="relative w-full h-3.5 bg-slate-900/90 rounded-full border border-white/10 p-0.5 overflow-hidden shadow-inner">
              <motion.div
                className={`h-full rounded-full transition-all duration-150 relative ${
                  isUpdating
                    ? 'bg-gradient-to-r from-emerald-500 via-cyan-400 to-indigo-500 shadow-md shadow-cyan-500/50'
                    : 'bg-gradient-to-r from-amber-500 via-orange-400 to-indigo-500 shadow-md shadow-amber-500/50'
                }`}
                style={{ width: `${progress}%` }}
              >
                {/* Shimmer / Scanlight Effect */}
                <div className="absolute inset-0 bg-gradient-to-r from-transparent via-white/30 to-transparent animate-shimmer" />
              </motion.div>
            </div>

            {/* Skip Button & Offline Notice */}
            <div className="flex items-center justify-between mt-3 text-[11px] text-slate-500">
              <span className="flex items-center gap-1">
                <Zap className="w-3 h-3 text-amber-400" />
                <span>PWA Tự động lưu cache offline</span>
              </span>

              <button
                type="button"
                onClick={handleSkip}
                className="text-slate-400 hover:text-white flex items-center gap-0.5 hover:underline cursor-pointer active:scale-95 transition-all"
              >
                <span>Bỏ qua</span>
                <ChevronRight className="w-3 h-3" />
              </button>
            </div>
          </div>
        </motion.div>
      )}
    </AnimatePresence>
  );
};
