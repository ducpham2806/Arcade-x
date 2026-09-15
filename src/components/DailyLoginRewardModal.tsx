import React, { useState, useEffect } from 'react';
import { usePlayer } from '../context/PlayerContext';
import { useInventory } from '../context/InventoryContext';
import { useGame } from '../context/GameContext';
import { DAILY_LOGIN_REWARDS_LIST, getStreakMultiplier } from '../services/storage';
import { NotificationService } from '../services/notificationService';
import { DailyLoginRewardItem } from '../types';
import { motion, AnimatePresence } from 'motion/react';
import { CloseButton } from './common/CloseButton';
import {
  Calendar,
  Sparkles,
  Coins,
  Gem,
  Zap,
  CheckCircle2,
  Flame,
  Gift,
  Lock,
  Crown,
  Package,
  ShieldCheck,
  Award,
} from 'lucide-react';

interface DailyLoginRewardModalProps {
  forceOpen?: boolean;
  onClose?: () => void;
}

export const DailyLoginRewardModal: React.FC<DailyLoginRewardModalProps> = ({
  forceOpen = false,
  onClose,
}) => {
  const { profile, claimDailyLoginReward } = usePlayer();
  const { addChest, grantItemById } = useInventory();
  const { activeModal, setActiveModal, triggerConfetti } = useGame();

  const [isOpen, setIsOpen] = useState<boolean>(false);
  const [hasAutoTriggered, setHasAutoTriggered] = useState<boolean>(false);
  const [justClaimedReward, setJustClaimedReward] = useState<DailyLoginRewardItem | null>(null);
  const [showClaimSuccess, setShowClaimSuccess] = useState<boolean>(false);

  const today = new Date().toISOString().split('T')[0];
  const isClaimedToday = profile.stats.lastLoginDate === today;
  const currentStreak = profile.stats.dailyStreak;
  const hasLuckBuff = Boolean(profile.stats?.hasPermanentLuckBuff || currentStreak >= 7);

  // Calculate which day the user is targeting (1 to 7)
  let targetDay = 1;
  if (isClaimedToday) {
    targetDay = currentStreak % 7;
    if (targetDay === 0) targetDay = 7;
  } else {
    targetDay = (currentStreak + 1) % 7;
    if (targetDay === 0) targetDay = 7;
  }

  const streakMultiplier = getStreakMultiplier(targetDay);
  const currentReward =
    DAILY_LOGIN_REWARDS_LIST.find((r) => r.day === targetDay) || DAILY_LOGIN_REWARDS_LIST[0];

  // Auto popup on open if unclaimed
  useEffect(() => {
    if (!hasAutoTriggered && !isClaimedToday) {
      const timer = setTimeout(() => {
        setIsOpen(true);
        setHasAutoTriggered(true);
      }, 500);
      return () => clearTimeout(timer);
    }
  }, [hasAutoTriggered, isClaimedToday]);

  // Sync with activeModal
  useEffect(() => {
    if (activeModal === 'dailyReward' || forceOpen) {
      setIsOpen(true);
    } else if (!forceOpen && hasAutoTriggered) {
      if (activeModal !== 'none') {
        setIsOpen(false);
      }
    }
  }, [activeModal, forceOpen, hasAutoTriggered]);

  // Lock background scroll when modal is open
  useEffect(() => {
    if (isOpen) {
      const originalOverflow = document.body.style.overflow;
      document.body.style.overflow = 'hidden';
      return () => {
        document.body.style.overflow = originalOverflow;
      };
    }
  }, [isOpen]);

  const handleClose = () => {
    setIsOpen(false);
    if (activeModal === 'dailyReward') {
      setActiveModal('none');
    }
    if (onClose) onClose();
  };

  const handleClaim = () => {
    if (isClaimedToday) return;

    // Distribute special items if configured
    if (currentReward.bonusItem) {
      if (currentReward.bonusItem.includes('chest')) {
        const rarity = currentReward.bonusItem.split('-')[0] as 'common' | 'rare' | 'epic' | 'legendary';
        addChest(rarity);
      } else {
        grantItemById(currentReward.bonusItem);
      }
    }

    claimDailyLoginReward(currentReward, targetDay);
    setJustClaimedReward(currentReward);
    setShowClaimSuccess(true);
    triggerConfetti();
    NotificationService.notifyGiftReceived(
      `Điểm Danh Ngày ${targetDay}`,
      `+${currentReward.coins} Xu, +${currentReward.gems} Ngọc, +${currentReward.exp} EXP`
    );
  };

  // Close on Escape key press
  useEffect(() => {
    if (!isOpen) return;
    const handleKeyDown = (e: KeyboardEvent) => {
      if (e.key === 'Escape') {
        handleClose();
      }
    };
    window.addEventListener('keydown', handleKeyDown);
    return () => window.removeEventListener('keydown', handleKeyDown);
  }, [isOpen]);

  if (!isOpen) return null;

  return (
    <div
      onClick={handleClose}
      className="fixed inset-0 z-50 flex items-center justify-center p-2 sm:p-4 bg-black/80 backdrop-blur-md animate-in fade-in duration-200"
    >
      <div
        onClick={(e) => e.stopPropagation()}
        className="max-w-4xl w-full bg-[#0d0d11] border border-white/10 rounded-2xl sm:rounded-3xl shadow-2xl relative flex flex-col overflow-hidden max-h-[95vh]"
      >
        {/* Header BG Banner */}
        <div className="relative p-3 sm:p-5 bg-gradient-to-r from-amber-950/40 via-purple-950/40 to-[#0d0d11] border-b border-white/5 shrink-0">
          <div className="relative z-10 flex flex-col sm:flex-row sm:items-center justify-between gap-2.5 sm:gap-4">
            <div className="flex items-start sm:items-center justify-between gap-2.5 sm:gap-3.5 min-w-0">
              <div className="flex items-center gap-2.5 sm:gap-3.5 min-w-0">
                <div className="w-10 h-10 sm:w-12 sm:h-12 rounded-xl sm:rounded-2xl bg-gradient-to-br from-amber-400 to-orange-600 shadow-lg shadow-orange-500/20 flex items-center justify-center text-white shrink-0 text-xl sm:text-2xl">
                  <Calendar className="w-5 h-5 sm:w-6 sm:h-6" />
                </div>
                <div className="min-w-0">
                  <h2 className="text-lg sm:text-xl font-black text-transparent bg-clip-text bg-gradient-to-r from-amber-200 to-yellow-400 uppercase tracking-tight font-display truncate">
                    Điểm Danh 7 Ngày
                  </h2>
                  <p className="text-[10px] sm:text-xs text-indigo-200/90 font-medium flex items-center gap-1 mt-0.5">
                    <Sparkles className="w-3.5 h-3.5 text-amber-400 shrink-0" />
                    <span className="truncate">Đăng nhập mỗi ngày nhận Arcade Coins & Quà Thần Thoại!</span>
                  </p>
                </div>
              </div>

              {/* Mobile Close Button (at top-right of the title row, never overlapping text) */}
              <div className="sm:hidden shrink-0">
                <CloseButton
                  id="btn-close-daily-login-mobile"
                  onClose={handleClose}
                  ariaLabel="Đóng điểm danh"
                />
              </div>
            </div>

            {/* Badges & Desktop Close Button */}
            <div className="flex items-center gap-2 sm:gap-3 shrink-0 self-start sm:self-center">
              <div className="flex items-center gap-2 bg-black/50 px-2.5 sm:px-3 py-1.5 sm:py-2 rounded-xl border border-white/10 backdrop-blur-md">
                <Flame className="w-4 h-4 text-orange-500 fill-orange-500 shrink-0" />
                <div className="flex flex-col">
                  <span className="text-[9px] text-slate-400 uppercase font-bold tracking-wider leading-none">Chuỗi ngày</span>
                  <span className="text-sm font-black text-white font-mono leading-none mt-0.5">{currentStreak} Ngày</span>
                </div>
              </div>

              <div className="flex items-center gap-2 bg-amber-500/10 px-2.5 sm:px-3 py-1.5 sm:py-2 rounded-xl border border-amber-500/30 backdrop-blur-md">
                <Zap className="w-4 h-4 text-amber-400 shrink-0" />
                <div className="flex flex-col">
                  <span className="text-[9px] text-amber-400 uppercase font-bold tracking-wider leading-none">Hệ số</span>
                  <span className="text-sm font-black text-amber-400 font-mono leading-none mt-0.5">x{streakMultiplier.toFixed(1)}</span>
                </div>
              </div>

              {/* Desktop Close Button (inline in flex row with proper margin, never overlapping badges) */}
              <div className="hidden sm:flex items-center pl-1 sm:pl-2">
                <CloseButton
                  id="btn-close-daily-login"
                  onClose={handleClose}
                  ariaLabel="Đóng điểm danh"
                />
              </div>
            </div>
          </div>
        </div>

        {/* 7 Days Grid Track (No scrollbar, clean proportional grid) */}
        <div className="p-3 sm:p-5 space-y-2 sm:space-y-3">
          <div className="grid grid-cols-4 lg:grid-cols-7 gap-1.5 sm:gap-2.5">
            {DAILY_LOGIN_REWARDS_LIST.map((item, idx) => {
              const isPast = isClaimedToday ? targetDay >= item.day : targetDay > item.day;
              const isToday = targetDay === item.day;
              const isClaimableNow = isToday && !isClaimedToday;
              const isMilestone = item.day === 7;

              return (
                <motion.div
                  key={item.day}
                  initial={{ y: 15, opacity: 0 }}
                  animate={{ y: 0, opacity: 1 }}
                  transition={{ delay: idx * 0.05 }}
                  className={`relative rounded-xl sm:rounded-2xl flex flex-col p-1.5 sm:p-2 border transition-all ${
                    idx === 6 ? 'col-span-2 lg:col-span-1' : ''
                  } ${
                    isClaimableNow
                      ? 'bg-gradient-to-b from-amber-500/20 via-[#181824] to-[#12121a] border-amber-400 shadow-[0_0_15px_rgba(245,158,11,0.25)] ring-1 ring-amber-400/50 scale-[1.02] z-10'
                      : isPast
                      ? 'bg-[#0f0f14]/80 border-emerald-500/30 opacity-75'
                      : isMilestone
                      ? 'bg-gradient-to-b from-purple-950/40 via-[#161320] to-[#100e18] border-purple-500/40'
                      : 'bg-[#121218] border-white/5'
                  }`}
                >
                  {/* Day Badge */}
                  <div className="flex items-center justify-between mb-1 sm:mb-2">
                    <span
                      className={`px-1.5 py-0.5 rounded-full text-[9px] font-black uppercase tracking-wider flex items-center gap-1 ${
                        isPast
                          ? 'bg-emerald-500/20 text-emerald-400 border border-emerald-500/30'
                          : isClaimableNow
                          ? 'bg-amber-500 text-black font-extrabold shadow-sm'
                          : 'bg-black/40 text-slate-400 border border-white/10'
                      }`}
                    >
                      {isPast ? <CheckCircle2 className="w-2.5 h-2.5" /> : (isMilestone ? <Crown className="w-2.5 h-2.5" /> : null)}
                      N{item.day}
                    </span>

                    {isPast && (
                      <span className="text-[8px] sm:text-[9px] font-bold text-emerald-400 hidden sm:inline-block">Đã nhận</span>
                    )}
                    {isClaimableNow && (
                      <span className="text-[8px] sm:text-[9px] font-bold text-amber-400 animate-pulse hidden sm:inline-block">Hôm nay</span>
                    )}
                  </div>

                  {/* Icon */}
                  <div className="flex justify-center my-1">
                    <div
                      className={`w-8 h-8 sm:w-10 sm:h-10 rounded-lg sm:rounded-xl flex items-center justify-center text-lg sm:text-xl shadow-inner ${
                        isClaimableNow
                          ? 'bg-amber-500/20 border border-amber-400/60 text-amber-300 animate-bounce'
                          : isMilestone
                          ? 'bg-purple-500/20 border border-purple-500/40'
                          : 'bg-black/40 border border-white/5'
                      }`}
                    >
                      {item.icon}
                    </div>
                  </div>

                  {/* Title */}
                  <h4
                    className={`text-[9px] sm:text-[11px] font-bold text-center truncate mb-1 sm:mb-2 ${
                      isClaimableNow ? 'text-amber-300' : isMilestone ? 'text-purple-300' : 'text-slate-300'
                    }`}
                    title={item.title}
                  >
                    {item.title}
                  </h4>

                  {/* Rewards Breakdown */}
                  <div className="space-y-0.5 sm:space-y-1 w-full mt-auto">
                    <div className="flex justify-between items-center bg-black/40 px-1 sm:px-2 py-0.5 rounded border border-white/5">
                      <Coins className="w-2.5 h-2.5 text-yellow-500" />
                      <span className="text-[9px] sm:text-[10px] font-mono text-yellow-400 font-bold">
                        +{isClaimableNow ? Math.round(item.coins * streakMultiplier) : item.coins}
                      </span>
                    </div>
                    {item.gems > 0 && (
                      <div className="flex justify-between items-center bg-black/40 px-1 sm:px-2 py-0.5 rounded border border-white/5">
                        <Gem className="w-2.5 h-2.5 text-blue-400" />
                        <span className="text-[9px] sm:text-[10px] font-mono text-blue-400 font-bold">+{item.gems}</span>
                      </div>
                    )}
                    {item.bonusItem && (
                      <div className="flex justify-between items-center bg-black/40 px-1 sm:px-2 py-0.5 rounded border border-white/5">
                        <Package className="w-2.5 h-2.5 text-purple-400" />
                        <span className="text-[8px] sm:text-[9px] font-mono text-purple-400 font-bold uppercase truncate max-w-[40px] sm:max-w-[50px]">
                          {item.bonusItem.split('-')[0]}
                        </span>
                      </div>
                    )}
                  </div>
                </motion.div>
              );
            })}
          </div>

          {/* PERMANENT LUCK BUFF SHOWCASE */}
          <div
            className={`p-2.5 sm:p-4 rounded-xl sm:rounded-2xl border backdrop-blur-md flex flex-col sm:flex-row items-start sm:items-center justify-between gap-2 sm:gap-3 transition-all ${
              hasLuckBuff
                ? 'bg-gradient-to-r from-amber-500/15 via-yellow-500/10 to-purple-500/15 border-amber-500/40 shadow-[0_0_15px_rgba(245,158,11,0.1)]'
                : 'bg-[#12121a] border-white/10'
            }`}
          >
            <div className="flex items-center gap-2.5">
              <div
                className={`w-8 h-8 sm:w-10 sm:h-10 rounded-lg sm:rounded-xl flex items-center justify-center text-lg sm:text-xl shrink-0 ${
                  hasLuckBuff
                    ? 'bg-amber-500/20 border border-amber-400/50 text-amber-300'
                    : 'bg-black/50 border border-white/10 text-slate-400'
                }`}
              >
                {hasLuckBuff ? '✨' : <Lock className="w-3 h-3 sm:w-4 sm:h-4 text-slate-400" />}
              </div>
              <div>
                <h4 className="text-[10px] sm:text-sm font-black uppercase tracking-wider text-white flex items-center gap-1.5">
                  {hasLuckBuff ? (
                    <>
                      <ShieldCheck className="w-3 h-3 sm:w-4 sm:h-4 text-emerald-400" />
                      <span className="text-transparent bg-clip-text bg-gradient-to-r from-amber-300 to-yellow-400">
                        BÙA MAY MẮN: ĐÃ KÍCH HOẠT (+10% ĐỒ HIẾM)
                      </span>
                    </>
                  ) : (
                    <>
                      <Award className="w-3 h-3 sm:w-4 sm:h-4 text-amber-400" />
                      <span>Bùa May Mắn Vĩnh Cửu (Luck Buff)</span>
                    </>
                  )}
                </h4>
                <p className="text-[9px] sm:text-[11px] text-slate-400 mt-0.5 leading-tight">
                  {hasLuckBuff
                    ? 'Tự động tăng 10% tỷ lệ mở ra trang bị Thần Thoại từ Rương báu!'
                    : 'Đạt chuỗi điểm danh 7 ngày để mở khóa vĩnh viễn: Tăng 10% tỷ lệ rớt đồ phẩm cấp cao!'}
                </p>
              </div>
            </div>
            {!hasLuckBuff && (
              <div className="w-full sm:w-44 shrink-0 bg-black/50 p-2 rounded-lg border border-white/10">
                <div className="flex justify-between text-[9px] sm:text-[10px] font-bold text-slate-400 mb-1">
                  <span>Tiến độ chuỗi</span>
                  <span className="text-amber-400 font-mono">{Math.min(7, currentStreak)}/7 Ngày</span>
                </div>
                <div className="w-full h-1 sm:h-1.5 bg-slate-800 rounded-full overflow-hidden">
                  <div
                    className="h-full bg-gradient-to-r from-amber-500 to-orange-500 transition-all duration-500"
                    style={{ width: `${Math.min(100, (currentStreak / 7) * 100)}%` }}
                  />
                </div>
              </div>
            )}
          </div>

          {/* Action Bottom */}
          <div className="flex justify-center pt-1 pb-1">
            {isClaimedToday ? (
              <div className="px-4 py-2 rounded-xl bg-[#14141a] border border-white/10 flex items-center gap-1.5 text-emerald-400 font-bold text-[10px] sm:text-xs">
                <CheckCircle2 className="w-3.5 h-3.5 text-emerald-400" />
                <span>Bạn đã nhận quà hôm nay. Hãy quay lại vào ngày mai!</span>
              </div>
            ) : (
              <button
                id="btn-claim-daily-login"
                type="button"
                onClick={handleClaim}
                className="px-6 sm:px-8 py-2 sm:py-2.5 rounded-xl bg-gradient-to-r from-amber-500 via-orange-500 to-amber-600 hover:from-amber-400 hover:to-orange-400 active:scale-95 text-black font-black uppercase tracking-wider text-xs sm:text-sm shadow-[0_0_20px_rgba(245,158,11,0.3)] transition-all flex items-center gap-2 cursor-pointer"
              >
                <Gift className="w-4 h-4 sm:w-5 sm:h-5" />
                <span>Nhận Quà Ngày {targetDay}</span>
              </button>
            )}
          </div>
        </div>

        {/* Claim Success Overlay */}
        <AnimatePresence>
          {showClaimSuccess && justClaimedReward && (
            <motion.div
              initial={{ opacity: 0 }}
              animate={{ opacity: 1 }}
              exit={{ opacity: 0 }}
              className="absolute inset-0 z-50 bg-black/95 flex flex-col items-center justify-center p-4 backdrop-blur-md"
            >
              <motion.div
                initial={{ scale: 0.8, y: 30 }}
                animate={{ scale: 1, y: 0 }}
                className="max-w-sm w-full bg-gradient-to-b from-[#1a1a2e] to-[#0a0a0a] rounded-3xl p-6 text-center border border-amber-500/40 shadow-[0_0_50px_rgba(245,158,11,0.3)] relative overflow-hidden"
              >
                <motion.div
                  animate={{ y: [0, -10, 0] }}
                  transition={{ duration: 2, repeat: Infinity, ease: 'easeInOut' }}
                  className="text-6xl mb-3"
                >
                  {justClaimedReward.icon}
                </motion.div>
                <h3 className="text-xl font-black text-transparent bg-clip-text bg-gradient-to-r from-amber-300 to-yellow-400 uppercase tracking-wide mb-1">
                  Đã Nhận Thưởng!
                </h3>
                <p className="text-indigo-200 text-xs mb-4">{justClaimedReward.title}</p>

                <div className="grid grid-cols-2 gap-2 mb-4">
                  <div className="bg-[#050505] p-2.5 rounded-xl border border-white/5">
                    <Coins className="w-5 h-5 text-yellow-500 mx-auto mb-0.5" />
                    <div className="text-yellow-400 font-bold font-mono text-base">
                      +{Math.round(justClaimedReward.coins * streakMultiplier)}
                    </div>
                    {streakMultiplier > 1 && (
                      <div className="text-[9px] text-amber-300 font-medium">x{streakMultiplier.toFixed(1)} Chuỗi</div>
                    )}
                  </div>
                  {justClaimedReward.gems > 0 && (
                    <div className="bg-[#050505] p-2.5 rounded-xl border border-white/5">
                      <Gem className="w-5 h-5 text-blue-400 mx-auto mb-0.5" />
                      <div className="text-blue-400 font-bold font-mono text-base">+{justClaimedReward.gems}</div>
                      <div className="text-[9px] text-blue-300/70 font-medium">Kim Cương</div>
                    </div>
                  )}
                  <div className="bg-[#050505] p-2 rounded-xl border border-white/5 col-span-2 flex items-center justify-center gap-2">
                    <Zap className="w-4 h-4 text-emerald-400" />
                    <span className="text-emerald-400 font-bold font-mono text-sm">
                      +{Math.round(justClaimedReward.exp * streakMultiplier)} EXP
                    </span>
                  </div>
                  {justClaimedReward.bonusItem && (
                    <div className="bg-[#050505] p-2 rounded-xl border border-white/5 col-span-2 flex items-center justify-center gap-2">
                      <Package className="w-4 h-4 text-purple-400" />
                      <span className="text-purple-400 font-bold font-mono text-xs uppercase">
                        {justClaimedReward.bonusItem.split('-')[0]} Box x1
                      </span>
                    </div>
                  )}
                </div>

                <button
                  id="btn-confirm-daily-claim"
                  type="button"
                  onClick={() => setShowClaimSuccess(false)}
                  className="w-full py-3 rounded-xl bg-gradient-to-r from-amber-500 to-orange-500 text-black font-extrabold uppercase text-xs tracking-wider shadow-lg transition-all cursor-pointer"
                >
                  Tuyệt Vời
                </button>
              </motion.div>
            </motion.div>
          )}
        </AnimatePresence>
      </div>
    </div>
  );
};
