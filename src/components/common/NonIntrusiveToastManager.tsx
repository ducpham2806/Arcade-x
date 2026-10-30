import React, { useState, useEffect, useCallback, useRef } from 'react';
import { motion, AnimatePresence } from 'motion/react';
import { Swords, Check, X, Trophy, Coins, Gem, Sparkles, CheckCircle2 } from 'lucide-react';
import { useSocial } from '../../context/GameContext';
import { soundEngine } from '../../services/audio';
import { hapticService } from '../../services/haptics';
import { FriendChallenge } from '../../types';

export interface AchievementToastData {
  id: string;
  title: string;
  icon: string;
  rewardCoins: number;
  rewardGems: number;
  rewardExp: number;
}

export interface LevelUpToastData {
  newLevel: number;
  rewardCoins: number;
  rewardGems: number;
}

interface ToastItem {
  id: string;
  type: 'pvp_invite' | 'achievement_reward' | 'level_up';
  duration: number; // in milliseconds
  pvpData?: FriendChallenge;
  achievementData?: AchievementToastData;
  levelUpData?: LevelUpToastData;
  createdAt: number;
}

export const NonIntrusiveToastManager: React.FC = () => {
  const { activeIncomingChallenge, respondToIncomingChallenge, dismissIncomingChallenge } = useSocial();
  const [toasts, setToasts] = useState<ToastItem[]>([]);
  const processedPvPIdsRef = useRef<Set<string>>(new Set());

  // Helper to remove a toast
  const removeToast = useCallback((toastId: string) => {
    setToasts((prev) => prev.filter((t) => t.id !== toastId));
  }, []);

  // 1. Listen for incoming PvP Challenges from GameContext
  useEffect(() => {
    if (!activeIncomingChallenge) return;
    const senderKey = activeIncomingChallenge.senderUid || activeIncomingChallenge.fromUid || activeIncomingChallenge.fromId || 'opponent';
    const chalId = activeIncomingChallenge.id || `chal_${senderKey}_${activeIncomingChallenge.gameId}`;
    if (processedPvPIdsRef.current.has(chalId)) return;

    processedPvPIdsRef.current.add(chalId);

    const newToast: ToastItem = {
      id: chalId,
      type: 'pvp_invite',
      duration: 12000, // 12 seconds
      pvpData: activeIncomingChallenge,
      createdAt: Date.now(),
    };

    try {
      soundEngine.play('notification');
      hapticService.tap();
    } catch {}

    setToasts((prev) => [newToast, ...prev.slice(0, 2)]);
  }, [activeIncomingChallenge]);

  // Automatic timer countdown per toast
  useEffect(() => {
    if (toasts.length === 0) return;

    const interval = setInterval(() => {
      const now = Date.now();
      setToasts((prev) =>
        prev.filter((t) => {
          if (now - t.createdAt >= t.duration) {
            if (t.type === 'pvp_invite') {
              dismissIncomingChallenge();
            }
            return false;
          }
          return true;
        })
      );
    }, 500);

    return () => clearInterval(interval);
  }, [toasts, dismissIncomingChallenge]);

  const handleAcceptPvP = (toast: ToastItem) => {
    if (toast.pvpData) {
      respondToIncomingChallenge(toast.pvpData, true);
    }
    removeToast(toast.id);
  };

  const handleDeclinePvP = (toast: ToastItem) => {
    if (toast.pvpData) {
      respondToIncomingChallenge(toast.pvpData, false);
    }
    removeToast(toast.id);
  };

  return (
    <div
      id="non-intrusive-toast-container"
      aria-live="polite"
      className="fixed top-3 right-3 sm:top-5 sm:right-5 z-[125] flex flex-col gap-2.5 max-w-sm w-[calc(100%-1.5rem)] pointer-events-none"
    >
      <AnimatePresence mode="popLayout">
        {toasts.map((toast) => {
          if (toast.type === 'pvp_invite' && toast.pvpData) {
            const chal = toast.pvpData;
            const opponentName = chal.senderName || chal.fromName || 'Đối thủ';
            const opponentAvatar = chal.senderAvatar || chal.fromAvatar || '⚔️';
            const opponentElo = chal.senderElo || chal.fromElo || 1450;
            const gameName = chal.gameTitle || chal.gameName || 'Trò chơi';

            return (
              <motion.div
                key={toast.id}
                layout
                initial={{ opacity: 0, x: 50, scale: 0.92 }}
                animate={{ opacity: 1, x: 0, scale: 1 }}
                exit={{ opacity: 0, x: 40, scale: 0.95 }}
                transition={{ type: 'spring', damping: 22, stiffness: 280 }}
                className="pointer-events-auto rounded-2xl bg-[#0f111a]/95 border border-amber-500/60 p-3 shadow-2xl shadow-amber-950/40 backdrop-blur-xl overflow-hidden relative"
              >
                {/* Auto-expire countdown progress bar */}
                <motion.div
                  initial={{ width: '100%' }}
                  animate={{ width: '0%' }}
                  transition={{ duration: toast.duration / 1000, ease: 'linear' }}
                  className="absolute bottom-0 left-0 h-0.5 bg-gradient-to-r from-amber-500 to-rose-500"
                />

                <div className="flex items-start justify-between gap-2 mb-2">
                  <div className="flex items-center gap-1.5">
                    <span className="w-2 h-2 rounded-full bg-amber-400 animate-ping" />
                    <span className="text-[10px] font-black uppercase tracking-wider text-amber-400 flex items-center gap-1">
                      <Swords className="w-3 h-3" />
                      Mời Đấu PvP Trực Tiếp
                    </span>
                  </div>

                  <button
                    type="button"
                    onClick={() => {
                      dismissIncomingChallenge();
                      removeToast(toast.id);
                    }}
                    className="p-1 rounded-lg text-slate-400 hover:text-white hover:bg-white/10 transition-colors cursor-pointer"
                    title="Bỏ qua"
                  >
                    <X className="w-3.5 h-3.5" />
                  </button>
                </div>

                <div className="flex items-center gap-2.5 mb-2.5">
                  <div className="w-10 h-10 rounded-xl bg-gradient-to-br from-amber-600 to-rose-600 flex items-center justify-center text-xl shadow-md border border-amber-400/40 shrink-0">
                    {opponentAvatar}
                  </div>

                  <div className="min-w-0 flex-1">
                    <div className="flex items-center gap-1.5 flex-wrap">
                      <h5 className="text-xs font-bold text-white truncate max-w-[120px]">
                        {opponentName}
                      </h5>
                      <span className="text-[9px] px-1.5 py-0.2 rounded bg-amber-500/20 text-amber-300 font-bold border border-amber-500/30">
                        {'Mời bạn chơi cùng'}
                      </span>
                    </div>
                    <div className="flex items-center gap-1.5 mt-0.5 text-[10px] text-slate-300">
                      <span className="text-amber-400 font-mono font-bold flex items-center gap-0.5">
                        <Trophy className="w-2.5 h-2.5" />
                        {opponentElo}
                      </span>
                      <span className="text-slate-600">•</span>
                      <span className="text-purple-300 truncate font-semibold">{gameName}</span>
                    </div>
                  </div>
                </div>

                {/* Quick Action Buttons */}
                <div className="flex items-center gap-2">
                  <button
                    type="button"
                    onClick={() => handleAcceptPvP(toast)}
                    className="flex-1 py-1.5 px-3 rounded-xl bg-emerald-600 hover:bg-emerald-500 active:scale-95 text-white font-bold text-xs shadow-md shadow-emerald-950/40 transition-all flex items-center justify-center gap-1 cursor-pointer"
                    title="Chấp nhận thách đấu và vào trận ngay"
                  >
                    <Check className="w-3.5 h-3.5 stroke-[3]" />
                    <span>Chấp Nhận</span>
                  </button>

                  <button
                    type="button"
                    onClick={() => handleDeclinePvP(toast)}
                    className="py-1.5 px-2.5 rounded-xl bg-white/5 hover:bg-white/10 active:scale-95 text-slate-400 hover:text-rose-300 text-xs font-semibold border border-white/10 transition-all flex items-center justify-center gap-1 cursor-pointer"
                    title="Từ chối lời mời"
                  >
                    <X className="w-3.5 h-3.5" />
                    <span>Từ chối</span>
                  </button>
                </div>
              </motion.div>
            );
          }

          return null;
        })}
      </AnimatePresence>
    </div>
  );
};

