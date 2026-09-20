import React, { useState, useMemo, useEffect } from 'react';
import { motion, AnimatePresence } from 'motion/react';
import { usePlayer } from '../context/PlayerContext';
import { useInventory } from '../context/InventoryContext';
import { useGame } from '../context/GameContext';
import { DAILY_LOGIN_REWARDS_LIST, getStreakMultiplier } from '../services/storage';
import { NotificationService } from '../services/notificationService';
import { DailyLoginRewardItem } from '../types';
import { soundEngine } from '../services/audio';
import { CloseButton } from './common/CloseButton';
import {
  Calendar,
  Sparkles,
  Coins,
  Gem,
  CheckCircle2,
  Flame,
  Gift,
  Crown,
  Trophy,
  RotateCw,
  Zap,
  Target,
  Users,
  Clock,
  ArrowRight,
  ShieldCheck,
  ChevronLeft,
  ChevronRight,
  HelpCircle,
  Award,
  Swords,
  Layers,
  Package,
} from 'lucide-react';

export type RewardsHubTab = 'checkin' | 'spin' | 'daily_quests' | 'weekly_quests' | 'economy';

interface WheelSlice {
  id: number;
  label: string;
  coins: number;
  gems: number;
  color: string;
  textColor: string;
}

const WHEEL_SLICES: WheelSlice[] = [
  { id: 0, label: '500 Vàng', coins: 500, gems: 0, color: '#f59e0b', textColor: '#000000' },
  { id: 1, label: '20 Đá Quý', coins: 0, gems: 20, color: '#3b82f6', textColor: '#ffffff' },
  { id: 2, label: '250 Vàng', coins: 250, gems: 0, color: '#10b981', textColor: '#ffffff' },
  { id: 3, label: '50 Đá Quý', coins: 0, gems: 50, color: '#8b5cf6', textColor: '#ffffff' },
  { id: 4, label: '1,000 Vàng', coins: 1000, gems: 0, color: '#ef4444', textColor: '#ffffff' },
  { id: 5, label: '15 Đá Quý', coins: 0, gems: 15, color: '#06b6d4', textColor: '#ffffff' },
  { id: 6, label: '350 Vàng', coins: 350, gems: 0, color: '#ec4899', textColor: '#ffffff' },
  { id: 7, label: '100 Đá Quý', coins: 0, gems: 100, color: '#f97316', textColor: '#ffffff' },
];

interface DailyRewardsHubModalProps {
  initialTab?: RewardsHubTab;
}

export const DailyRewardsHubModal: React.FC<DailyRewardsHubModalProps> = ({ initialTab }) => {
  const { profile, claimDailyLoginReward, spinDailyWheel } = usePlayer();
  const { addChest, grantItemById } = useInventory();
  const {
    activeModal,
    setActiveModal,
    triggerConfetti,
    dailyQuests,
    claimDailyQuest,
    generateNewDailyQuests,
    weeklyQuests,
    weeklyMilestones,
    weeklyPoints,
    claimWeeklyQuest,
    claimWeeklyMilestoneReward,
    friendQuests,
    claimFriendQuest,
  } = useGame();

  // Determine initial tab based on activeModal or props
  const resolveInitialTab = (): RewardsHubTab => {
    if (initialTab) return initialTab;
    if (activeModal === 'spinWheel') return 'spin';
    if (activeModal === 'weeklyQuests') return 'weekly_quests';
    if (activeModal === 'quests' || activeModal === 'dailyQuests') return 'daily_quests';
    return 'checkin';
  };

  const [currentTab, setCurrentTab] = useState<RewardsHubTab>(resolveInitialTab);
  const [questFilter, setQuestFilter] = useState<'all' | 'in_progress' | 'completed'>('all');

  // Lucky spin wheel local state
  const [isSpinning, setIsSpinning] = useState<boolean>(false);
  const [rotation, setRotation] = useState<number>(0);
  const [wonPrize, setWonPrize] = useState<WheelSlice | null>(null);

  // Calendar month state
  const [calendarDate, setCalendarDate] = useState(() => new Date());

  // Check login streak status
  const today = new Date().toISOString().split('T')[0];
  const isClaimedToday = profile.stats.lastLoginDate === today;
  const currentStreak = profile.stats.dailyStreak;
  const hasSpunToday = profile.stats.lastSpinDate === today;

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

  // Count unclaimed items across the entire app
  const unclaimedDailyLogin = !isClaimedToday;
  const claimableDailyQuests = useMemo(
    () => dailyQuests.filter((q) => q.completed && !q.claimed),
    [dailyQuests]
  );
  const claimableWeeklyQuests = useMemo(
    () => weeklyQuests.filter((q) => q.completed && !q.claimed),
    [weeklyQuests]
  );
  const claimableFriendQuests = useMemo(
    () => (friendQuests || []).filter((q) => q.status === 'completed'),
    [friendQuests]
  );
  const claimableMilestones = useMemo(
    () => weeklyMilestones.filter((m) => weeklyPoints >= m.requiredPoints && !m.claimed),
    [weeklyMilestones, weeklyPoints]
  );

  const totalClaimableCount =
    (unclaimedDailyLogin ? 1 : 0) +
    claimableDailyQuests.length +
    claimableWeeklyQuests.length +
    claimableFriendQuests.length +
    claimableMilestones.length;

  // Sync tab if activeModal changes while modal is mounted
  useEffect(() => {
    if (activeModal === 'spinWheel') setCurrentTab('spin');
    else if (activeModal === 'weeklyQuests') setCurrentTab('weekly_quests');
    else if (activeModal === 'quests' || activeModal === 'dailyQuests') setCurrentTab('daily_quests');
    else if (activeModal === 'dailyReward' || activeModal === 'monthlyLogin') setCurrentTab('checkin');
  }, [activeModal]);

  // Lock background scroll
  useEffect(() => {
    const originalOverflow = document.body.style.overflow;
    document.body.style.overflow = 'hidden';
    return () => {
      document.body.style.overflow = originalOverflow;
    };
  }, []);

  const handleClose = () => {
    soundEngine.play('click');
    setActiveModal('none');
  };

  // Single-Click "Claim All" (Nhận Tất Cả)
  const handleClaimAll = () => {
    if (totalClaimableCount === 0) return;

    soundEngine.play('win');
    triggerConfetti();

    let addedCoins = 0;
    let addedGems = 0;
    let addedExp = 0;

    // 1. Claim Daily Login
    if (unclaimedDailyLogin) {
      if (currentReward.bonusItem) {
        if (currentReward.bonusItem.includes('chest')) {
          const rarity = currentReward.bonusItem.split('-')[0] as 'common' | 'rare' | 'epic' | 'legendary';
          addChest(rarity);
        } else {
          grantItemById(currentReward.bonusItem);
        }
      }
      claimDailyLoginReward(currentReward, targetDay);
      addedCoins += currentReward.coins * streakMultiplier;
      addedGems += currentReward.gems;
      addedExp += currentReward.exp;
    }

    // 2. Claim All Daily Quests
    claimableDailyQuests.forEach((q) => {
      claimDailyQuest(q.id);
      addedCoins += q.rewardCoins;
      addedGems += q.rewardGems;
      addedExp += q.rewardExp;
    });

    // 3. Claim All Weekly Quests
    claimableWeeklyQuests.forEach((q) => {
      claimWeeklyQuest(q.id);
      addedCoins += q.rewardCoins;
      addedGems += q.rewardGems;
      addedExp += q.rewardExp;
    });

    // 4. Claim All Friend Quests
    claimableFriendQuests.forEach((q) => {
      claimFriendQuest(q.id);
      addedCoins += q.rewardCoins;
      addedGems += q.rewardGems;
      addedExp += q.rewardExp;
    });

    // 5. Claim All Weekly Milestones
    claimableMilestones.forEach((m) => {
      claimWeeklyMilestoneReward(m.tier);
      addedCoins += m.rewardCoins;
      addedGems += m.rewardGems;
      addedExp += m.rewardExp;
    });

    NotificationService.notifyGiftReceived(
      'Nhận Tất Cả Phúc Lợi!',
      `+${addedCoins.toLocaleString()} Vàng, +${addedGems.toLocaleString()} Đá Quý, +${addedExp.toLocaleString()} EXP!`
    );
  };

  // Claim Daily Login explicitly
  const handleClaimDailyLogin = () => {
    if (isClaimedToday) return;
    soundEngine.play('win');
    triggerConfetti();

    if (currentReward.bonusItem) {
      if (currentReward.bonusItem.includes('chest')) {
        const rarity = currentReward.bonusItem.split('-')[0] as 'common' | 'rare' | 'epic' | 'legendary';
        addChest(rarity);
      } else {
        grantItemById(currentReward.bonusItem);
      }
    }
    claimDailyLoginReward(currentReward, targetDay);
    NotificationService.notifyGiftReceived(
      `Điểm Danh Ngày ${targetDay}`,
      `+${(currentReward.coins * streakMultiplier).toLocaleString()} Vàng, +${currentReward.gems} Đá Quý, +${currentReward.exp} EXP`
    );
  };

  // Handle Lucky Spin
  const handleSpin = () => {
    if (isSpinning || hasSpunToday) return;

    soundEngine.play('click');
    setIsSpinning(true);
    setWonPrize(null);

    const prizeIndex = Math.floor(Math.random() * WHEEL_SLICES.length);
    const sliceAngle = 360 / WHEEL_SLICES.length;
    const targetDeg = 1800 + (WHEEL_SLICES.length - prizeIndex) * sliceAngle - sliceAngle / 2;

    setRotation(targetDeg);

    setTimeout(() => {
      setIsSpinning(false);
      const prize = WHEEL_SLICES[prizeIndex];
      setWonPrize(prize);
      spinDailyWheel(prize);
      soundEngine.play('win');
      triggerConfetti();
      NotificationService.notifyGiftReceived(
        'Vòng Quay May Mắn!',
        `Bạn đã trúng ${prize.label}!`
      );
    }, 4000);
  };

  // Calendar calculations
  const year = calendarDate.getFullYear();
  const month = calendarDate.getMonth();
  const monthNames = [
    'Tháng 1', 'Tháng 2', 'Tháng 3', 'Tháng 4', 'Tháng 5', 'Tháng 6',
    'Tháng 7', 'Tháng 8', 'Tháng 9', 'Tháng 10', 'Tháng 11', 'Tháng 12',
  ];
  const firstDayOfMonth = new Date(year, month, 1);
  const lastDayOfMonth = new Date(year, month + 1, 0);
  const daysInMonth = lastDayOfMonth.getDate();
  let startDayOfWeek = firstDayOfMonth.getDay();
  startDayOfWeek = startDayOfWeek === 0 ? 6 : startDayOfWeek - 1;

  const loginDates = profile.stats.loginHistoryDates || [];
  const currentMonthPrefix = `${year}-${String(month + 1).padStart(2, '0')}`;
  const checkInsThisMonth = loginDates.filter((d) => d.startsWith(currentMonthPrefix)).length;

  return (
    <div
      onClick={handleClose}
      className="fixed inset-0 z-50 flex items-center justify-center p-2 sm:p-4 bg-black/85 backdrop-blur-md overflow-hidden animate-in fade-in duration-200 select-none"
    >
      <motion.div
        initial={{ scale: 0.95, opacity: 0, y: 15 }}
        animate={{ scale: 1, opacity: 1, y: 0 }}
        exit={{ scale: 0.95, opacity: 0, y: 15 }}
        transition={{ type: 'spring', damping: 25, stiffness: 320 }}
        onClick={(e) => e.stopPropagation()}
        className="w-full h-full sm:h-[92vh] sm:max-h-[900px] sm:max-w-4xl lg:max-w-5xl bg-[#0d0e14] border border-indigo-500/30 rounded-2xl sm:rounded-3xl shadow-2xl shadow-indigo-950/50 flex flex-col overflow-hidden relative"
      >
        {/* TOP HEADER HUD */}
        <div className="relative p-3.5 sm:p-5 bg-gradient-to-r from-indigo-950/90 via-purple-950/70 to-[#0e0e14] border-b border-white/10 shrink-0 flex flex-wrap items-center justify-between gap-3">
          {/* Title & Stats */}
          <div className="flex items-center gap-3 min-w-0">
            <div className="w-10 h-10 sm:w-12 sm:h-12 rounded-2xl bg-gradient-to-br from-amber-400 via-orange-500 to-indigo-600 flex items-center justify-center text-white shadow-lg shadow-orange-500/20 shrink-0">
              <Gift className="w-5 h-5 sm:w-6 sm:h-6" />
            </div>
            <div className="min-w-0">
              <div className="flex items-center gap-2">
                <h2 className="text-base sm:text-xl font-black text-white tracking-tight truncate">
                  Trung Tâm Phúc Lợi & Quà Tặng
                </h2>
                {totalClaimableCount > 0 && (
                  <span className="px-2 py-0.5 rounded-full text-[10px] font-bold bg-rose-500 text-white animate-pulse">
                    {totalClaimableCount} quà chờ nhận
                  </span>
                )}
              </div>
              <p className="text-[11px] sm:text-xs text-slate-400 truncate">
                Điểm danh chuỗi, vòng quay may mắn và hệ thống nhiệm vụ thống nhất
              </p>
            </div>
          </div>

          {/* Quick Wallet & Action Buttons */}
          <div className="flex items-center gap-2 sm:gap-3 ml-auto pr-9">
            {/* Wallet Badges (Tập trung Vàng & Đá Quý) */}
            <div className="hidden sm:flex items-center gap-2 bg-black/40 border border-white/10 px-3 py-1.5 rounded-xl">
              <div className="flex items-center gap-1.5 text-xs font-bold text-amber-400">
                <Coins className="w-3.5 h-3.5 text-amber-400" />
                <span>{(profile.coins || 0).toLocaleString()}</span>
              </div>
              <div className="w-[1px] h-3.5 bg-white/10" />
              <div className="flex items-center gap-1.5 text-xs font-bold text-cyan-400">
                <Gem className="w-3.5 h-3.5 text-cyan-400" />
                <span>{(profile.gems || 0).toLocaleString()}</span>
              </div>
            </div>

            {/* Prominent "CLAIM ALL" (Nhận Tất Cả) Button */}
            <button
              id="btn-rewards-claim-all"
              type="button"
              disabled={totalClaimableCount === 0}
              onClick={handleClaimAll}
              className={`px-3.5 sm:px-4 py-2 rounded-xl font-bold text-xs sm:text-sm flex items-center gap-1.5 transition-all shadow-lg active:scale-95 cursor-pointer ${
                totalClaimableCount > 0
                  ? 'bg-gradient-to-r from-amber-400 via-orange-500 to-rose-500 text-white shadow-orange-500/30 hover:brightness-110 ring-2 ring-amber-300/60'
                  : 'bg-white/5 text-slate-500 border border-white/5 cursor-not-allowed'
              }`}
            >
              <Sparkles className="w-4 h-4 text-white" />
              <span>Nhận Tất Cả</span>
              {totalClaimableCount > 0 && (
                <span className="bg-black/30 px-1.5 py-0.2 rounded-full text-[11px] font-black">
                  {totalClaimableCount}
                </span>
              )}
            </button>
          </div>

          {/* Close Button */}
          <CloseButton onClick={handleClose} />
        </div>

        {/* TAB NAVIGATION BAR */}
        <div className="flex items-center gap-1.5 px-3 sm:px-6 py-2 bg-[#090a0f] border-b border-white/5 overflow-x-auto custom-scrollbar shrink-0">
          <button
            type="button"
            onClick={() => {
              soundEngine.play('click');
              setCurrentTab('checkin');
            }}
            className={`px-3 sm:px-4 py-2 rounded-xl text-xs sm:text-sm font-bold flex items-center gap-2 whitespace-nowrap transition-all cursor-pointer ${
              currentTab === 'checkin'
                ? 'bg-indigo-600 text-white shadow-lg shadow-indigo-600/30 border border-indigo-400/40'
                : 'bg-white/5 text-slate-400 hover:text-white hover:bg-white/10'
            }`}
          >
            <Calendar className="w-4 h-4" />
            <span>Điểm Danh & Lịch Tháng</span>
            {unclaimedDailyLogin && (
              <span className="w-2 h-2 rounded-full bg-rose-500 animate-pulse" />
            )}
          </button>

          <button
            type="button"
            onClick={() => {
              soundEngine.play('click');
              setCurrentTab('spin');
            }}
            className={`px-3 sm:px-4 py-2 rounded-xl text-xs sm:text-sm font-bold flex items-center gap-2 whitespace-nowrap transition-all cursor-pointer ${
              currentTab === 'spin'
                ? 'bg-amber-600 text-white shadow-lg shadow-amber-600/30 border border-amber-400/40'
                : 'bg-white/5 text-slate-400 hover:text-white hover:bg-white/10'
            }`}
          >
            <RotateCw className="w-4 h-4" />
            <span>Vòng Quay May Mắn</span>
            {!hasSpunToday && (
              <span className="w-2 h-2 rounded-full bg-amber-400 animate-ping" />
            )}
          </button>

          <button
            type="button"
            onClick={() => {
              soundEngine.play('click');
              setCurrentTab('daily_quests');
            }}
            className={`px-3 sm:px-4 py-2 rounded-xl text-xs sm:text-sm font-bold flex items-center gap-2 whitespace-nowrap transition-all cursor-pointer ${
              currentTab === 'daily_quests'
                ? 'bg-emerald-600 text-white shadow-lg shadow-emerald-600/30 border border-emerald-400/40'
                : 'bg-white/5 text-slate-400 hover:text-white hover:bg-white/10'
            }`}
          >
            <Target className="w-4 h-4" />
            <span>Nhiệm Vụ Ngày</span>
            {claimableDailyQuests.length > 0 && (
              <span className="px-1.5 py-0.2 rounded-full text-[10px] bg-rose-500 text-white">
                {claimableDailyQuests.length}
              </span>
            )}
          </button>

          <button
            type="button"
            onClick={() => {
              soundEngine.play('click');
              setCurrentTab('weekly_quests');
            }}
            className={`px-3 sm:px-4 py-2 rounded-xl text-xs sm:text-sm font-bold flex items-center gap-2 whitespace-nowrap transition-all cursor-pointer ${
              currentTab === 'weekly_quests'
                ? 'bg-purple-600 text-white shadow-lg shadow-purple-600/30 border border-purple-400/40'
                : 'bg-white/5 text-slate-400 hover:text-white hover:bg-white/10'
            }`}
          >
            <Trophy className="w-4 h-4" />
            <span>Nhiệm Vụ Tuần & Bạn Bè</span>
            {claimableWeeklyQuests.length + claimableFriendQuests.length + claimableMilestones.length > 0 && (
              <span className="px-1.5 py-0.2 rounded-full text-[10px] bg-rose-500 text-white">
                {claimableWeeklyQuests.length + claimableFriendQuests.length + claimableMilestones.length}
              </span>
            )}
          </button>

          <button
            type="button"
            onClick={() => {
              soundEngine.play('click');
              setCurrentTab('economy');
            }}
            className={`px-3 sm:px-4 py-2 rounded-xl text-xs sm:text-sm font-bold flex items-center gap-2 whitespace-nowrap transition-all cursor-pointer ${
              currentTab === 'economy'
                ? 'bg-cyan-600 text-white shadow-lg shadow-cyan-600/30 border border-cyan-400/40'
                : 'bg-white/5 text-slate-400 hover:text-white hover:bg-white/10'
            }`}
          >
            <Coins className="w-4 h-4" />
            <span>Kinh Tế & Tiền Tệ</span>
          </button>
        </div>

        {/* TAB CONTENTS (Independent Scroll Container strictly per AGENTS.md) */}
        <div className="flex-1 overflow-y-auto min-h-0 custom-scrollbar p-3 sm:p-6 bg-[#0a0a0f]/60">
          {/* TAB 1: CHECK-IN & MONTHLY CALENDAR */}
          {currentTab === 'checkin' && (
            <div className="space-y-6 max-w-4xl mx-auto">
              {/* Daily Streak Card */}
              <div className="p-4 sm:p-6 rounded-2xl sm:rounded-3xl bg-gradient-to-br from-indigo-950/40 via-purple-950/20 to-black/60 border border-indigo-500/20 relative overflow-hidden">
                <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4 mb-5">
                  <div>
                    <div className="flex items-center gap-2">
                      <span className="px-2.5 py-1 rounded-lg bg-orange-500/20 text-orange-400 text-xs font-black flex items-center gap-1.5 border border-orange-500/30">
                        <Flame className="w-3.5 h-3.5 fill-orange-400 text-orange-400" />
                        Chuỗi Điểm Danh: {currentStreak} Ngày
                      </span>
                      {streakMultiplier > 1 && (
                        <span className="px-2 py-1 rounded-lg bg-amber-500/20 text-amber-300 text-xs font-black border border-amber-500/30">
                          x{streakMultiplier} Thưởng Vàng
                        </span>
                      )}
                    </div>
                    <h3 className="text-lg sm:text-xl font-black text-white mt-1.5">
                      Chuỗi Phúc Lợi 7 Ngày Liên Tiếp
                    </h3>
                    <p className="text-xs text-slate-400">
                      Điểm danh đều đặn mỗi ngày để nhận Rương Báu Huyền Thoại và hệ số x2 Vàng!
                    </p>
                  </div>

                  <button
                    type="button"
                    disabled={isClaimedToday}
                    onClick={handleClaimDailyLogin}
                    className={`px-5 py-2.5 rounded-xl font-black text-sm flex items-center justify-center gap-2 shadow-xl transition-all active:scale-95 cursor-pointer ${
                      !isClaimedToday
                        ? 'bg-gradient-to-r from-amber-400 to-orange-500 text-black shadow-orange-500/30 hover:brightness-110 ring-2 ring-amber-300'
                        : 'bg-emerald-500/20 text-emerald-400 border border-emerald-500/30 cursor-default'
                    }`}
                  >
                    {isClaimedToday ? (
                      <>
                        <CheckCircle2 className="w-4 h-4 text-emerald-400" />
                        <span>Đã Điểm Danh Hôm Nay</span>
                      </>
                    ) : (
                      <>
                        <Sparkles className="w-4 h-4 fill-black" />
                        <span>Điểm Danh Ngày {targetDay}</span>
                      </>
                    )}
                  </button>
                </div>

                {/* 7 Days Streak Track */}
                <div className="grid grid-cols-2 sm:grid-cols-4 lg:grid-cols-7 gap-2.5 sm:gap-3">
                  {DAILY_LOGIN_REWARDS_LIST.map((reward) => {
                    const isTarget = reward.day === targetDay;
                    const isPast =
                      isClaimedToday
                        ? reward.day <= targetDay
                        : reward.day < targetDay;
                    const isTodayPending = isTarget && !isClaimedToday;

                    return (
                      <div
                        key={reward.day}
                        className={`relative rounded-xl p-3 flex flex-col items-center justify-between border transition-all text-center min-h-[130px] ${
                          isPast
                            ? 'bg-emerald-950/20 border-emerald-500/30 opacity-75'
                            : isTodayPending
                            ? 'bg-gradient-to-b from-amber-500/20 to-orange-600/10 border-amber-400/80 ring-2 ring-amber-400/40 shadow-lg shadow-amber-500/20 scale-[1.02]'
                            : 'bg-white/5 border-white/10 opacity-60'
                        }`}
                      >
                        <div className="flex items-center justify-between w-full text-[11px] font-bold text-slate-400 mb-1">
                          <span>Ngày {reward.day}</span>
                          {isPast && <CheckCircle2 className="w-3.5 h-3.5 text-emerald-400" />}
                          {isTodayPending && (
                            <span className="text-[10px] text-amber-300 font-black">HÔM NAY</span>
                          )}
                        </div>

                        <div className="my-1.5 w-10 h-10 rounded-xl bg-white/5 flex items-center justify-center text-xl">
                          {reward.day === 7 ? '👑' : reward.bonusItem ? '🎁' : '🪙'}
                        </div>

                        <div className="w-full space-y-0.5">
                          <div className="text-xs font-black text-amber-400">
                            +{(reward.coins * (isTodayPending ? streakMultiplier : 1)).toLocaleString()} Vàng
                          </div>
                          {reward.gems > 0 && (
                            <div className="text-[11px] font-bold text-cyan-400">
                              +{reward.gems} Đá Quý
                            </div>
                          )}
                          {reward.bonusItem && (
                            <div className="text-[10px] font-bold text-purple-300 truncate">
                              {reward.specialItemTitle || 'Rương Thần Bí'}
                            </div>
                          )}
                        </div>
                      </div>
                    );
                  })}
                </div>
              </div>

              {/* Monthly Attendance Calendar */}
              <div className="p-4 sm:p-6 rounded-2xl sm:rounded-3xl bg-[#0e0e14] border border-white/10">
                <div className="flex items-center justify-between mb-4">
                  <div className="flex items-center gap-2">
                    <Calendar className="w-5 h-5 text-indigo-400" />
                    <h3 className="text-base sm:text-lg font-black text-white">
                      Lịch Điểm Danh {monthNames[month]} {year}
                    </h3>
                    <span className="text-xs text-indigo-300 bg-indigo-500/20 border border-indigo-500/30 px-2.5 py-0.5 rounded-full font-bold">
                      Đã điểm danh: {checkInsThisMonth}/{daysInMonth} ngày
                    </span>
                  </div>

                  <div className="flex items-center gap-1">
                    <button
                      type="button"
                      onClick={() => setCalendarDate(new Date(year, month - 1, 1))}
                      className="p-1.5 rounded-lg bg-white/5 hover:bg-white/10 text-slate-300 transition-colors"
                    >
                      <ChevronLeft className="w-4 h-4" />
                    </button>
                    <button
                      type="button"
                      onClick={() => setCalendarDate(new Date(year, month + 1, 1))}
                      className="p-1.5 rounded-lg bg-white/5 hover:bg-white/10 text-slate-300 transition-colors"
                    >
                      <ChevronRight className="w-4 h-4" />
                    </button>
                  </div>
                </div>

                {/* Days of Week header */}
                <div className="grid grid-cols-7 gap-1.5 mb-2 text-center text-[11px] font-bold text-slate-500 uppercase">
                  {['T2', 'T3', 'T4', 'T5', 'T6', 'T7', 'CN'].map((d) => (
                    <div key={d}>{d}</div>
                  ))}
                </div>

                {/* Calendar Grid */}
                <div className="grid grid-cols-7 gap-1.5 text-center">
                  {Array.from({ length: startDayOfWeek }).map((_, i) => (
                    <div key={`empty-${i}`} className="h-10 sm:h-12 rounded-xl bg-transparent" />
                  ))}

                  {Array.from({ length: daysInMonth }).map((_, i) => {
                    const dayNum = i + 1;
                    const dateStr = `${year}-${String(month + 1).padStart(2, '0')}-${String(dayNum).padStart(2, '0')}`;
                    const isCheckedIn = loginDates.includes(dateStr);
                    const isTodayDate = dateStr === today;

                    return (
                      <div
                        key={`day-${dayNum}`}
                        className={`h-10 sm:h-12 rounded-xl border flex flex-col items-center justify-center relative transition-all ${
                          isCheckedIn
                            ? 'bg-emerald-500/15 border-emerald-500/40 text-emerald-300 font-black'
                            : isTodayDate
                            ? 'bg-amber-500/20 border-amber-400 text-amber-300 font-black shadow-md'
                            : 'bg-white/5 border-white/5 text-slate-400 hover:bg-white/10'
                        }`}
                      >
                        <span className="text-xs">{dayNum}</span>
                        {isCheckedIn && (
                          <CheckCircle2 className="w-3 h-3 text-emerald-400 mt-0.5" />
                        )}
                        {!isCheckedIn && isTodayDate && !isClaimedToday && (
                          <span className="w-1.5 h-1.5 rounded-full bg-amber-400 animate-ping mt-0.5" />
                        )}
                      </div>
                    );
                  })}
                </div>
              </div>
            </div>
          )}

          {/* TAB 2: LUCKY SPIN WHEEL */}
          {currentTab === 'spin' && (
            <div className="flex flex-col items-center justify-center max-w-xl mx-auto py-4 space-y-6">
              <div className="text-center space-y-1">
                <h3 className="text-xl sm:text-2xl font-black text-white flex items-center justify-center gap-2">
                  <RotateCw className={`w-6 h-6 text-amber-400 ${isSpinning ? 'animate-spin' : ''}`} />
                  Vòng Quay May Mắn Mỗi Ngày
                </h3>
                <p className="text-xs text-slate-400">
                  Mỗi ngày 1 lượt quay hoàn toàn miễn phí. Cơ hội trúng lên đến 1,000 Vàng & 100 Đá Quý!
                </p>
              </div>

              {/* Wheel Container */}
              <div className="relative w-64 h-64 sm:w-80 sm:h-80 flex items-center justify-center">
                {/* Pointer indicator */}
                <div className="absolute top-0 left-1/2 -translate-x-1/2 -translate-y-2 z-20 w-0 h-0 border-l-[14px] border-l-transparent border-r-[14px] border-r-transparent border-t-[26px] border-t-amber-400 drop-shadow-[0_4px_8px_rgba(251,191,36,0.6)]" />

                {/* Rotating Wheel */}
                <div
                  style={{
                    transform: `rotate(${rotation}deg)`,
                    transition: isSpinning ? 'transform 4s cubic-bezier(0.15, 0.9, 0.2, 1)' : 'none',
                  }}
                  className="w-full h-full rounded-full border-4 border-amber-400/80 shadow-[0_0_35px_rgba(245,158,11,0.3)] relative overflow-hidden bg-[#12131c]"
                >
                  {WHEEL_SLICES.map((slice, idx) => {
                    const angle = 360 / WHEEL_SLICES.length;
                    const rotate = idx * angle;

                    return (
                      <div
                        key={slice.id}
                        style={{
                          transform: `rotate(${rotate}deg)`,
                          transformOrigin: '50% 100%',
                          clipPath: 'polygon(50% 100%, 0 0, 100% 0)',
                          backgroundColor: slice.color,
                        }}
                        className="absolute top-0 left-0 w-full h-1/2 flex items-start justify-center pt-3 border-r border-black/20"
                      >
                        <span
                          style={{ color: slice.textColor }}
                          className="text-[11px] sm:text-xs font-black tracking-tight"
                        >
                          {slice.label}
                        </span>
                      </div>
                    );
                  })}
                </div>

                {/* Wheel Center Button */}
                <button
                  type="button"
                  disabled={isSpinning || hasSpunToday}
                  onClick={handleSpin}
                  className={`absolute z-20 w-16 h-16 sm:w-20 sm:h-20 rounded-full border-4 flex flex-col items-center justify-center text-center shadow-2xl transition-transform active:scale-95 cursor-pointer ${
                    hasSpunToday
                      ? 'bg-slate-800 border-slate-600 text-slate-400 cursor-not-allowed'
                      : isSpinning
                      ? 'bg-amber-600 border-amber-300 text-white animate-pulse'
                      : 'bg-gradient-to-br from-amber-400 to-orange-500 border-white text-black font-black hover:scale-105'
                  }`}
                >
                  <span className="text-xs font-black uppercase">
                    {hasSpunToday ? 'Đã Quay' : isSpinning ? '...' : 'QUAY!'}
                  </span>
                </button>
              </div>

              {/* Prize banner if just won */}
              {wonPrize && (
                <motion.div
                  initial={{ scale: 0.8, opacity: 0 }}
                  animate={{ scale: 1, opacity: 1 }}
                  className="px-6 py-3 rounded-2xl bg-gradient-to-r from-amber-500/20 via-orange-500/30 to-amber-500/20 border border-amber-400/50 text-center"
                >
                  <div className="text-xs text-amber-300 font-bold uppercase">Chúc mừng bạn đã nhận được:</div>
                  <div className="text-xl font-black text-white">{wonPrize.label}</div>
                </motion.div>
              )}

              {/* Status Note */}
              <div className="text-xs text-slate-400 text-center">
                {hasSpunToday ? (
                  <span className="text-emerald-400 font-bold">
                    ✓ Bạn đã hoàn thành lượt quay hôm nay. Hãy quay lại vào ngày mai!
                  </span>
                ) : (
                  <span>Chạm vào nút trung tâm để quay số may mắn!</span>
                )}
              </div>
            </div>
          )}

          {/* TAB 3: DAILY QUESTS */}
          {currentTab === 'daily_quests' && (
            <div className="space-y-4 max-w-4xl mx-auto">
              <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-3 pb-2 border-b border-white/5">
                <div>
                  <h3 className="text-base sm:text-lg font-black text-white">Nhiệm Vụ Hàng Ngày</h3>
                  <p className="text-xs text-slate-400">
                    Làm mới mỗi ngày vào 00:00. Hoàn thành để nhận Vàng, Đá Quý và Điểm Tuần.
                  </p>
                </div>

                {/* Filters */}
                <div className="flex items-center gap-1.5 bg-black/40 p-1 rounded-xl border border-white/5">
                  <button
                    type="button"
                    onClick={() => setQuestFilter('all')}
                    className={`px-3 py-1 rounded-lg text-xs font-bold transition-all ${
                      questFilter === 'all'
                        ? 'bg-white/15 text-white'
                        : 'text-slate-400 hover:text-white'
                    }`}
                  >
                    Tất Cả ({dailyQuests.length})
                  </button>
                  <button
                    type="button"
                    onClick={() => setQuestFilter('in_progress')}
                    className={`px-3 py-1 rounded-lg text-xs font-bold transition-all ${
                      questFilter === 'in_progress'
                        ? 'bg-white/15 text-white'
                        : 'text-slate-400 hover:text-white'
                    }`}
                  >
                    Đang Làm ({dailyQuests.filter((q) => !q.completed).length})
                  </button>
                  <button
                    type="button"
                    onClick={() => setQuestFilter('completed')}
                    className={`px-3 py-1 rounded-lg text-xs font-bold transition-all ${
                      questFilter === 'completed'
                        ? 'bg-white/15 text-white'
                        : 'text-slate-400 hover:text-white'
                    }`}
                  >
                    Hoàn Thành ({dailyQuests.filter((q) => q.completed).length})
                  </button>
                </div>
              </div>

              {/* Quests List */}
              <div className="grid grid-cols-1 md:grid-cols-2 gap-3">
                {dailyQuests
                  .filter((q) => {
                    if (questFilter === 'in_progress') return !q.completed;
                    if (questFilter === 'completed') return q.completed;
                    return true;
                  })
                  .map((quest) => {
                    const percent = Math.min(
                      100,
                      Math.round((quest.current / quest.target) * 100)
                    );
                    const canClaim = quest.completed && !quest.claimed;

                    return (
                      <div
                        key={quest.id}
                        className={`p-4 rounded-2xl border transition-all flex flex-col justify-between gap-3 ${
                          quest.claimed
                            ? 'bg-white/[0.02] border-white/5 opacity-50'
                            : quest.completed
                            ? 'bg-emerald-950/20 border-emerald-500/40 shadow-lg shadow-emerald-950/40'
                            : 'bg-[#10111a] border-white/10 hover:border-white/20'
                        }`}
                      >
                        <div className="flex items-start justify-between gap-3">
                          <div className="min-w-0">
                            <h4 className="text-sm font-bold text-white tracking-tight truncate">
                              {quest.title}
                            </h4>
                            <p className="text-xs text-slate-400 mt-0.5 line-clamp-1">
                              {quest.description}
                            </p>
                          </div>
                          {quest.claimed ? (
                            <span className="px-2 py-0.5 rounded-md bg-white/5 text-slate-400 text-[11px] font-bold">
                              Đã Nhận
                            </span>
                          ) : (
                            <div className="flex items-center gap-1.5 shrink-0 text-xs font-bold">
                              <span className="text-amber-400 flex items-center gap-1">
                                <Coins className="w-3.5 h-3.5" />+{quest.rewardCoins}
                              </span>
                              {quest.rewardGems > 0 && (
                                <span className="text-cyan-400 flex items-center gap-1">
                                  <Gem className="w-3.5 h-3.5" />+{quest.rewardGems}
                                </span>
                              )}
                            </div>
                          )}
                        </div>

                        {/* Progress Bar & Claim Button */}
                        <div className="flex items-center justify-between gap-3">
                          <div className="flex-1">
                            <div className="flex justify-between text-[11px] text-slate-400 mb-1">
                              <span>Tiến độ</span>
                              <span>
                                {quest.current}/{quest.target}
                              </span>
                            </div>
                            <div className="h-2 rounded-full bg-white/10 overflow-hidden">
                              <div
                                style={{ width: `${percent}%` }}
                                className={`h-full rounded-full transition-all duration-300 ${
                                  quest.completed
                                    ? 'bg-gradient-to-r from-emerald-400 to-teal-500'
                                    : 'bg-gradient-to-r from-indigo-500 to-purple-500'
                                }`}
                              />
                            </div>
                          </div>

                          {canClaim && (
                            <button
                              type="button"
                              onClick={() => {
                                soundEngine.play('click');
                                triggerConfetti();
                                claimDailyQuest(quest.id);
                              }}
                              className="px-3 py-1.5 rounded-xl bg-gradient-to-r from-emerald-500 to-teal-600 text-white text-xs font-black shadow-lg shadow-emerald-500/20 active:scale-95 transition-transform shrink-0 cursor-pointer"
                            >
                              Nhận Quà
                            </button>
                          )}
                        </div>
                      </div>
                    );
                  })}
              </div>
            </div>
          )}

          {/* TAB 4: WEEKLY & FRIEND QUESTS */}
          {currentTab === 'weekly_quests' && (
            <div className="space-y-6 max-w-4xl mx-auto">
              {/* Weekly Milestones Bar */}
              <div className="p-4 sm:p-6 rounded-2xl bg-gradient-to-br from-purple-950/30 to-indigo-950/20 border border-purple-500/20">
                <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-2 mb-4">
                  <div>
                    <h3 className="text-base sm:text-lg font-black text-white flex items-center gap-2">
                      <Trophy className="w-5 h-5 text-purple-400" />
                      Mốc Tích Lũy Năng Động Tuần
                    </h3>
                    <p className="text-xs text-slate-400">
                      Điểm hiện tại:{' '}
                      <span className="font-bold text-purple-300">{weeklyPoints}/100 Điểm</span>
                    </p>
                  </div>
                </div>

                {/* Milestone Nodes */}
                <div className="grid grid-cols-2 sm:grid-cols-4 gap-3">
                  {weeklyMilestones.map((m) => {
                    const isReached = weeklyPoints >= m.requiredPoints;
                    const canClaim = isReached && !m.claimed;

                    return (
                      <div
                        key={m.tier}
                        className={`p-3 rounded-xl border flex flex-col justify-between transition-all ${
                          m.claimed
                            ? 'bg-white/5 border-white/5 opacity-60'
                            : isReached
                            ? 'bg-purple-950/40 border-purple-400 shadow-lg shadow-purple-500/20'
                            : 'bg-black/30 border-white/10'
                        }`}
                      >
                        <div className="flex items-center justify-between mb-2">
                          <span className="text-xs font-black text-purple-300">
                            {m.requiredPoints} Điểm
                          </span>
                          {m.claimed ? (
                            <CheckCircle2 className="w-4 h-4 text-emerald-400" />
                          ) : (
                            <Crown className="w-4 h-4 text-amber-400" />
                          )}
                        </div>

                        <div className="space-y-0.5 mb-3 text-xs">
                          <div className="text-amber-400 font-bold">+{m.rewardCoins} Vàng</div>
                          <div className="text-cyan-400 font-bold">+{m.rewardGems} Đá Quý</div>
                          {m.chestType && (
                            <div className="text-purple-300 font-bold uppercase text-[10px]">
                              Rương {m.chestType}
                            </div>
                          )}
                        </div>

                        {canClaim ? (
                          <button
                            type="button"
                            onClick={() => {
                              soundEngine.play('click');
                              triggerConfetti();
                              claimWeeklyMilestoneReward(m.tier);
                            }}
                            className="w-full py-1.5 rounded-lg bg-gradient-to-r from-purple-500 to-indigo-500 text-white font-bold text-xs shadow-md active:scale-95"
                          >
                            Nhận Thưởng
                          </button>
                        ) : (
                          <div className="text-center text-[11px] text-slate-500">
                            {m.claimed ? 'Đã Nhận' : `${m.requiredPoints - weeklyPoints} điểm nữa`}
                          </div>
                        )}
                      </div>
                    );
                  })}
                </div>
              </div>

              {/* Weekly Quests List */}
              <div className="space-y-3">
                <h4 className="text-sm font-bold text-white uppercase tracking-wider">
                  Mục Tiêu Tuần Lớn
                </h4>
                <div className="grid grid-cols-1 md:grid-cols-2 gap-3">
                  {weeklyQuests.map((q) => {
                    const percent = Math.min(100, Math.round((q.current / q.target) * 100));
                    const canClaim = q.completed && !q.claimed;

                    return (
                      <div
                        key={q.id}
                        className={`p-4 rounded-2xl border transition-all flex flex-col justify-between gap-3 ${
                          q.claimed
                            ? 'bg-white/[0.02] border-white/5 opacity-50'
                            : q.completed
                            ? 'bg-purple-950/20 border-purple-500/40'
                            : 'bg-[#10111a] border-white/10'
                        }`}
                      >
                        <div className="flex items-start justify-between gap-2">
                          <div>
                            <h5 className="text-sm font-bold text-white">{q.title}</h5>
                            <p className="text-xs text-slate-400 mt-0.5">{q.description}</p>
                          </div>
                          <span className="text-xs font-black text-amber-400 shrink-0">
                            +{q.rewardCoins} Vàng
                          </span>
                        </div>

                        <div className="flex items-center justify-between gap-3">
                          <div className="flex-1">
                            <div className="flex justify-between text-[11px] text-slate-400 mb-1">
                              <span>Tiến độ</span>
                              <span>
                                {q.current}/{q.target}
                              </span>
                            </div>
                            <div className="h-2 rounded-full bg-white/10 overflow-hidden">
                              <div
                                style={{ width: `${percent}%` }}
                                className="h-full rounded-full bg-gradient-to-r from-purple-500 to-indigo-500"
                              />
                            </div>
                          </div>

                          {canClaim && (
                            <button
                              type="button"
                              onClick={() => {
                                soundEngine.play('click');
                                triggerConfetti();
                                claimWeeklyQuest(q.id);
                              }}
                              className="px-3 py-1.5 rounded-xl bg-gradient-to-r from-purple-500 to-indigo-600 text-white text-xs font-black shadow-md active:scale-95 cursor-pointer"
                            >
                              Nhận Quà
                            </button>
                          )}
                        </div>
                      </div>
                    );
                  })}
                </div>
              </div>
            </div>
          )}

          {/* TAB 5: ECONOMY & CURRENCIES EXPLAINER */}
          {currentTab === 'economy' && (
            <div className="space-y-6 max-w-3xl mx-auto py-2">
              <div className="p-5 rounded-2xl bg-gradient-to-br from-indigo-950/40 to-cyan-950/30 border border-cyan-500/20">
                <h3 className="text-lg font-black text-white flex items-center gap-2 mb-2">
                  <Coins className="w-5 h-5 text-amber-400" />
                  Mô Hình Kinh Tế Tinh Gọn ArcadeX
                </h3>
                <p className="text-xs sm:text-sm text-slate-300 leading-relaxed">
                  ArcadeX đã tinh gọn tối đa các đơn vị tiền tệ phụ phức tạp (Ruby, Amethyst, Quặng sắt, Xúc tác...). Giờ đây, toàn bộ nền tảng tập trung thống nhất vào <strong>2 Đơn Vị Tiền Tệ Cốt Lõi</strong>:
                </p>
              </div>

              <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
                {/* Coins Card */}
                <div className="p-5 rounded-2xl bg-[#12131f] border border-amber-500/30 space-y-3">
                  <div className="w-12 h-12 rounded-xl bg-amber-500/20 border border-amber-500/40 flex items-center justify-center text-amber-400">
                    <Coins className="w-7 h-7" />
                  </div>
                  <h4 className="text-base font-black text-white flex items-center gap-2">
                    Vàng (Gold Coins)
                  </h4>
                  <p className="text-xs text-slate-400 leading-relaxed">
                    Tiền tệ thông dụng kiếm được khi chiến thắng mọi ván chơi, điểm danh ngày, vòng quay may mắn và hoàn thành nhiệm vụ. Dùng để mở khóa skin game, mua thẻ chơi và rèn trang bị cơ bản.
                  </p>
                  <div className="pt-2 border-t border-white/5 flex items-center justify-between text-xs font-bold text-amber-400">
                    <span>Số dư hiện tại:</span>
                    <span>{(profile.coins || 0).toLocaleString()} Vàng</span>
                  </div>
                </div>

                {/* Gems Card */}
                <div className="p-5 rounded-2xl bg-[#12131f] border border-cyan-500/30 space-y-3">
                  <div className="w-12 h-12 rounded-xl bg-cyan-500/20 border border-cyan-500/40 flex items-center justify-center text-cyan-400">
                    <Gem className="w-7 h-7" />
                  </div>
                  <h4 className="text-base font-black text-white flex items-center gap-2">
                    Đá Quý / Ngọc (Gems)
                  </h4>
                  <p className="text-xs text-slate-400 leading-relaxed">
                    Tiền tệ cao cấp quý hiếm nhận từ các mốc streak lớn, leo rank BXH, vòng quay đặc biệt và nhiệm vụ tuần. Dùng để sở hữu skin huyền thoại, danh hiệu vinh danh và rương báu quý.
                  </p>
                  <div className="pt-2 border-t border-white/5 flex items-center justify-between text-xs font-bold text-cyan-400">
                    <span>Số dư hiện tại:</span>
                    <span>{(profile.gems || 0).toLocaleString()} Đá Quý</span>
                  </div>
                </div>
              </div>

              <div className="p-4 rounded-xl bg-black/40 border border-white/5 text-xs text-slate-400 space-y-1">
                <div className="font-bold text-slate-200">Ghi chú tinh gọn:</div>
                <p>
                  Các nguyên liệu phụ như mảnh ghép hay tinh thể trong minigame (như Blocker) được tự động quy đổi thành Điểm Số & Vàng trực tiếp sau mỗi trận đấu, giúp túi đồ của bạn luôn sạch sẽ và dễ quản lý.
                </p>
              </div>
            </div>
          )}
        </div>
      </motion.div>
    </div>
  );
};
