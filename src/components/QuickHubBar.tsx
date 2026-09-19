import React, { useMemo } from 'react';
import { usePlayer } from '../context/PlayerContext';
import { useGame } from '../context/GameContext';
import { ALL_GAMES_LIST } from '../games/registry';
import { getResolvedHallOfFame } from '../data/hallOfFameData';
import { soundEngine } from '../services/audio';
import { hapticService } from '../services/haptics';
import { Flame, Crown } from 'lucide-react';

export const QuickHubBar: React.FC = () => {
  const { profile } = usePlayer();
  const { setActiveModal, dailyChallenges } = useGame();

  const todayDateStr = useMemo(() => new Date().toISOString().split('T')[0], []);
  const currentDayOfMonth = useMemo(() => new Date().getDate(), []);
  const isClaimedStreakToday = profile.stats.lastLoginDate === todayDateStr;

  const hallOfFameEntries = useMemo(() => {
    return getResolvedHallOfFame(profile);
  }, [profile]);

  const completedChallengesCount = useMemo(() => {
    return Object.values(dailyChallenges || {}).filter((c: any) => c?.completed).length;
  }, [dailyChallenges]);

  return (
    <div
      id="quick-hub-bar"
      className="grid grid-cols-5 gap-1.5 sm:gap-2.5 bg-[#12111d]/90 border border-white/10 rounded-2xl p-1.5 sm:p-2 shadow-lg backdrop-blur-md"
    >
      {/* 1: Chuỗi Đăng Nhập (Daily Streak) */}
      <button
        id="btn-hub-daily-streak"
        type="button"
        onClick={() => {
          try {
            soundEngine.play('click');
            hapticService.tap();
          } catch {}
          setActiveModal('dailyReward');
        }}
        className="flex flex-col items-center justify-center p-1.5 rounded-xl bg-white/[0.03] hover:bg-orange-500/15 border border-white/5 hover:border-orange-500/30 transition-all active:scale-95 group text-center cursor-pointer relative overflow-hidden"
        title="Chuỗi điểm danh hàng ngày"
      >
        <div className="w-8 h-8 sm:w-10 sm:h-10 rounded-xl bg-orange-500/20 border border-orange-500/40 text-orange-400 flex items-center justify-center shrink-0 relative group-hover:scale-105 transition-transform">
          <Flame className="w-4 h-4 sm:w-5 sm:h-5 text-orange-400 fill-orange-400 animate-pulse" />
          <span className="absolute -bottom-1 -right-1 px-1 bg-black/90 rounded-full text-[8px] sm:text-[9px] font-black text-orange-400 border border-orange-500/60">
            {profile.stats.dailyStreak || 1}d
          </span>
          {!isClaimedStreakToday && (
            <span className="absolute -top-1 -right-1 w-2 h-2 rounded-full bg-amber-400 ring-2 ring-black animate-ping" />
          )}
        </div>
      </button>

      {/* 2: Vòng Quay May Mắn (Spin Wheel) */}
      <button
        id="btn-hub-spin-wheel"
        type="button"
        onClick={() => {
          try {
            soundEngine.play('click');
            hapticService.tap();
          } catch {}
          setActiveModal('spinWheel');
        }}
        className="flex flex-col items-center justify-center p-1.5 rounded-xl bg-white/[0.03] hover:bg-pink-500/15 border border-white/5 hover:border-pink-500/30 transition-all active:scale-95 group text-center cursor-pointer relative overflow-hidden"
        title="Vòng quay may mắn hàng ngày"
      >
        <div className="w-8 h-8 sm:w-10 sm:h-10 rounded-xl bg-pink-500/20 border border-pink-500/40 text-pink-400 flex items-center justify-center text-base sm:text-xl shrink-0 relative group-hover:scale-105 transition-transform">
          🎡
          {profile.stats.lastSpinDate !== todayDateStr && (
            <span className="absolute -top-1 -right-1 w-2 h-2 rounded-full bg-pink-400 ring-2 ring-black animate-pulse" />
          )}
        </div>
      </button>

      {/* 3: Lịch Điểm Danh Tháng 30 Ngày (Monthly Login) */}
      <button
        id="btn-hub-monthly-login"
        type="button"
        onClick={() => {
          try {
            soundEngine.play('click');
            hapticService.tap();
          } catch {}
          setActiveModal('monthlyLogin');
        }}
        className="flex flex-col items-center justify-center p-1.5 rounded-xl bg-white/[0.03] hover:bg-indigo-500/15 border border-white/5 hover:border-indigo-500/30 transition-all active:scale-95 group text-center cursor-pointer relative overflow-hidden"
        title="Lịch điểm danh 30 ngày"
      >
        <div className="w-8 h-8 sm:w-10 sm:h-10 rounded-xl bg-indigo-500/20 border border-indigo-500/40 text-indigo-400 flex items-center justify-center text-base sm:text-xl shrink-0 relative group-hover:scale-105 transition-transform">
          <div className="relative flex flex-col items-center">
            <span className="text-[7px] sm:text-[8px] font-black uppercase text-indigo-300 leading-none">DAY</span>
            <span className="text-[10px] sm:text-xs font-black text-white font-mono leading-tight">{currentDayOfMonth}</span>
          </div>
        </div>
      </button>

      {/* 4: Thử Thách Hàng Ngày (Daily Challenges) */}
      <button
        id="btn-hub-daily-challenge"
        type="button"
        onClick={() => {
          try {
            soundEngine.play('click');
            hapticService.tap();
          } catch {}
          setActiveModal('dailyChallengesList');
        }}
        className="flex flex-col items-center justify-center p-1.5 rounded-xl bg-white/[0.03] hover:bg-amber-500/15 border border-white/5 hover:border-amber-500/30 transition-all active:scale-95 group text-center cursor-pointer relative overflow-hidden"
        title="Nhiệm vụ & thử thách hàng ngày"
      >
        <div className="w-8 h-8 sm:w-10 sm:h-10 rounded-xl bg-amber-500/20 border border-amber-500/40 text-amber-400 flex items-center justify-center text-base sm:text-lg shrink-0 relative group-hover:scale-105 transition-transform">
          🎯
          <span className="absolute -bottom-1 -right-1 px-1 bg-black/90 rounded-full text-[8px] sm:text-[9px] font-black text-amber-400 border border-amber-500/60">
            {completedChallengesCount}/{ALL_GAMES_LIST.length}
          </span>
        </div>
      </button>

      {/* 5: Đại Sảnh Danh Vọng (Hall of Fame) */}
      <button
        id="btn-hub-hall-of-fame"
        type="button"
        onClick={() => {
          try {
            soundEngine.play('click');
            hapticService.tap();
          } catch {}
          setActiveModal('hallOfFame');
        }}
        className="flex flex-col items-center justify-center p-1.5 rounded-xl bg-white/[0.03] hover:bg-yellow-500/15 border border-white/5 hover:border-yellow-500/30 transition-all active:scale-95 group text-center cursor-pointer relative overflow-hidden"
        title="Đại sảnh danh vọng server"
      >
        <div className="w-8 h-8 sm:w-10 sm:h-10 rounded-xl bg-yellow-500/20 border border-yellow-500/40 text-yellow-400 flex items-center justify-center shrink-0 relative group-hover:scale-105 transition-transform">
          <Crown className="w-4 h-4 sm:w-5 sm:h-5 text-yellow-400" />
          <span className="absolute -bottom-1 -right-1 px-1 bg-black/90 rounded-full text-[8px] sm:text-[9px] font-black text-yellow-400 border border-yellow-500/60">
            {hallOfFameEntries.length}
          </span>
        </div>
      </button>
    </div>
  );
};
