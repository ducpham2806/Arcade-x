import React, { useState, useEffect } from 'react';
import { motion, AnimatePresence } from 'motion/react';
import { RefreshCw, Zap, ShieldAlert, Sparkles, CheckCircle, ArrowRight, AlertTriangle } from 'lucide-react';
import { useGame } from '../context/GameContext';
import { CURRENT_APP_VERSION, checkPendingUpdate, executeForceUpdate } from '../services/updateService';
import { soundEngine } from '../services/audio';
import { hapticService } from '../services/haptics';

export const ForceUpdateModal: React.FC = () => {
  const { activeGameId } = useGame();
  const [hasUpdate, setHasUpdate] = useState(false);
  const [targetVersion, setTargetVersion] = useState('2.5.2');
  const [releaseNotes, setReleaseNotes] = useState('');
  const [isUpdating, setIsUpdating] = useState(false);
  const [updateProgress, setUpdateProgress] = useState(0);
  const [updateStepText, setUpdateStepText] = useState('Đang chuẩn bị gói cập nhật...');

  // Initial and periodic update detection
  useEffect(() => {
    const evaluateUpdate = () => {
      const info = checkPendingUpdate();
      if (info.hasUpdate) {
        setHasUpdate(true);
        setTargetVersion(info.newVersion || '2.5.2');
        setReleaseNotes(info.releaseNotes || 'Bản nâng cấp tối ưu hóa hệ thống ArcadeX Launcher.');
      }
    };

    evaluateUpdate();

    // Listen for custom trigger events from SW or Settings
    const handleForceUpdateDetected = (e: Event) => {
      const customEvent = e as CustomEvent;
      const detail = customEvent.detail;
      setHasUpdate(true);
      if (detail?.targetVersion) setTargetVersion(detail.targetVersion);
      if (detail?.releaseNotes) setReleaseNotes(detail.releaseNotes);
    };

    window.addEventListener('arcadex:force_update_detected', handleForceUpdateDetected);

    // Periodic check every 60s
    const interval = setInterval(evaluateUpdate, 60000);

    return () => {
      window.removeEventListener('arcadex:force_update_detected', handleForceUpdateDetected);
      clearInterval(interval);
    };
  }, []);

  // Block Escape key closing
  useEffect(() => {
    if (!hasUpdate) return;
    const handleKeyDown = (e: KeyboardEvent) => {
      if (e.key === 'Escape') {
        e.preventDefault();
        e.stopPropagation();
      }
    };
    window.addEventListener('keydown', handleKeyDown, true);
    return () => window.removeEventListener('keydown', handleKeyDown, true);
  }, [hasUpdate]);

  // Handle user clicking "Update Now"
  const handlePerformUpdate = async () => {
    if (isUpdating) return;

    try {
      soundEngine.play('powerup');
      hapticService.claimReward();
    } catch {}

    setIsUpdating(true);
    setUpdateProgress(15);
    setUpdateStepText('Đang tải gói bản vá hệ thống...');

    await new Promise((r) => setTimeout(r, 600));
    setUpdateProgress(45);
    setUpdateStepText('Tối ưu hóa bộ nhớ đệm & tài nguyên game...');

    await new Promise((r) => setTimeout(r, 700));
    setUpdateProgress(85);
    setUpdateStepText('Đồng bộ tài khoản & cấu hình phiên bản mới...');

    await new Promise((r) => setTimeout(r, 600));
    setUpdateProgress(100);
    setUpdateStepText('Cập nhật hoàn tất! Đang khởi động lại Launcher...');

    try {
      soundEngine.play('win');
    } catch {}

    await executeForceUpdate(targetVersion);

    setTimeout(() => {
      window.location.reload();
    }, 800);
  };

  // CRITICAL REQUIREMENT:
  // "Nếu user đang chơi game thì không force update, chỉ khi user hoàn thành màn chơi hiện tại mới hiển thị."
  // If user is currently playing any game (activeGameId !== null), do not show modal!
  if (!hasUpdate || activeGameId !== null) {
    return null;
  }

  return (
    <div
      id="force-update-modal-overlay"
      role="dialog"
      aria-modal="true"
      aria-label="Cập nhật bắt buộc Launcher"
      className="fixed inset-0 z-[99999] flex items-center justify-center p-4 sm:p-6 bg-black/90 backdrop-blur-2xl select-none"
      onClick={(e) => e.stopPropagation()}
    >
      <motion.div
        initial={{ scale: 0.85, opacity: 0, y: 25 }}
        animate={{ scale: 1, opacity: 1, y: 0 }}
        transition={{ type: 'spring', damping: 22, stiffness: 280 }}
        className="relative w-full max-w-lg bg-gradient-to-b from-[#18152e] via-[#121120] to-[#0c0a17] border-2 border-indigo-500/70 rounded-3xl shadow-[0_0_60px_rgba(99,102,241,0.35)] p-6 sm:p-8 text-center overflow-hidden"
      >
        {/* Radiant Background ambient glows */}
        <div className="absolute -top-28 -left-28 w-56 h-56 bg-indigo-500/25 rounded-full blur-3xl pointer-events-none" />
        <div className="absolute -bottom-28 -right-28 w-56 h-56 bg-amber-500/20 rounded-full blur-3xl pointer-events-none" />

        {/* Top Animated Badge Icon */}
        <div className="relative mx-auto w-20 h-20 sm:w-24 sm:h-24 rounded-3xl bg-gradient-to-tr from-indigo-600 via-indigo-500 to-amber-500 p-0.5 shadow-2xl shadow-indigo-500/50 mb-4 flex items-center justify-center">
          <div className="w-full h-full bg-[#100e24] rounded-[22px] flex items-center justify-center text-3xl sm:text-4xl relative overflow-hidden">
            <motion.div
              animate={{ rotate: 360 }}
              transition={{ duration: 10, repeat: Infinity, ease: 'linear' }}
              className="absolute inset-0 bg-[conic-gradient(from_0deg,transparent_0_300deg,rgba(99,102,241,0.5)_360deg)] opacity-60 pointer-events-none"
            />
            <span className="relative z-10 animate-bounce">🚀</span>
          </div>
          <span className="absolute -bottom-1 -right-1 flex h-4 w-4">
            <span className="animate-ping absolute inline-flex h-full w-full rounded-full bg-amber-400 opacity-75" />
            <span className="relative inline-flex rounded-full h-4 w-4 bg-amber-500 border-2 border-[#100e24]" />
          </span>
        </div>

        {/* Tag Pill */}
        <div className="inline-flex items-center gap-1.5 px-3.5 py-1 rounded-full bg-amber-500/15 border border-amber-500/40 text-amber-300 font-extrabold text-[11px] uppercase tracking-wider mb-3">
          <AlertTriangle className="w-3.5 h-3.5 text-amber-400 shrink-0" />
          <span>Bản Cập Nhật Bắt Buộc</span>
        </div>

        {/* Header Title */}
        <h2 className="text-2xl sm:text-3xl font-black text-white font-display tracking-wide mb-1.5">
          CẬP NHẬT LAUNCHER
        </h2>

        {/* Version comparison */}
        <div className="flex items-center justify-center gap-2 text-xs font-mono mb-4 text-slate-300">
          <span className="px-2 py-0.5 rounded-md bg-white/5 border border-white/10 text-slate-400">
            Hiện tại: v{CURRENT_APP_VERSION}
          </span>
          <ArrowRight className="w-3.5 h-3.5 text-indigo-400" />
          <span className="px-2 py-0.5 rounded-md bg-indigo-500/20 border border-indigo-500/40 text-indigo-300 font-bold">
            Mới nhất: v{targetVersion}
          </span>
        </div>

        {/* Description */}
        <p className="text-xs sm:text-sm text-slate-300 leading-relaxed mb-5 px-2">
          Hệ thống vừa phát hành bản nâng cấp mới cho ArcadeX. Vui lòng cập nhật ngay để tiếp tục chơi game, nhận thưởng chuỗi ngày và đồng bộ dữ liệu tài khoản an toàn.
        </p>

        {/* What's New Feature List */}
        <div className="text-left bg-black/40 border border-white/10 rounded-2xl p-3.5 sm:p-4 mb-6 space-y-2.5">
          <div className="text-[11px] font-bold uppercase tracking-wider text-indigo-300 flex items-center gap-1.5 mb-1">
            <Sparkles className="w-3.5 h-3.5 text-amber-400" />
            <span>Điểm Mới Trong Phiên Bản Này:</span>
          </div>
          <div className="flex items-start gap-2 text-xs text-slate-200">
            <Zap className="w-3.5 h-3.5 text-amber-400 shrink-0 mt-0.5" />
            <span>Tối ưu hóa hiệu năng & tốc độ khởi động game tức thì.</span>
          </div>
          <div className="flex items-start gap-2 text-xs text-slate-200">
            <CheckCircle className="w-3.5 h-3.5 text-emerald-400 shrink-0 mt-0.5" />
            <span>Nâng cấp hệ thống thông báo Lên Cấp không làm gián đoạn game.</span>
          </div>
          <div className="flex items-start gap-2 text-xs text-slate-200">
            <ShieldAlert className="w-3.5 h-3.5 text-indigo-400 shrink-0 mt-0.5" />
            <span>Cập nhật bảo mật & tính toàn vẹn dữ liệu Cloud Firestore.</span>
          </div>
        </div>

        {/* Progress Bar (when updating) */}
        {isUpdating ? (
          <div className="space-y-2 mb-2">
            <div className="flex items-center justify-between text-xs text-indigo-300 font-semibold px-1">
              <span className="flex items-center gap-1.5">
                <RefreshCw className="w-3.5 h-3.5 animate-spin text-amber-400" />
                {updateStepText}
              </span>
              <span className="font-mono font-bold text-amber-400">{updateProgress}%</span>
            </div>
            <div className="w-full h-3 bg-black/60 rounded-full overflow-hidden border border-indigo-500/30 p-0.5">
              <motion.div
                initial={{ width: '0%' }}
                animate={{ width: `${updateProgress}%` }}
                transition={{ duration: 0.4, ease: 'easeOut' }}
                className="h-full bg-gradient-to-r from-indigo-500 via-purple-500 to-amber-500 rounded-full shadow-lg shadow-indigo-500/50"
              />
            </div>
            <p className="text-[11px] text-slate-400 italic">Vui lòng không tắt trình duyệt trong quá trình cập nhật...</p>
          </div>
        ) : (
          <button
            id="btn-force-update-action"
            type="button"
            onClick={handlePerformUpdate}
            className="w-full py-3.5 sm:py-4 px-6 rounded-2xl bg-gradient-to-r from-indigo-600 via-indigo-500 to-purple-600 hover:from-indigo-500 hover:to-purple-500 active:scale-95 text-white font-black text-sm sm:text-base tracking-wide shadow-xl shadow-indigo-600/40 transition-all cursor-pointer flex items-center justify-center gap-2 border border-indigo-400/40"
          >
            <RefreshCw className="w-4 h-4 text-amber-300" />
            <span>CẬP NHẬT NGAY (TẢI LẠI TRÌNH DUYỆT)</span>
          </button>
        )}
      </motion.div>
    </div>
  );
};
