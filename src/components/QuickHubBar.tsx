import React, { useMemo } from 'react';
import { usePlayer } from '../context/PlayerContext';
import { useGame } from '../context/GameContext';
import { ALL_GAMES_LIST } from '../games/registry';
import { getResolvedHallOfFame } from '../data/hallOfFameData';
import { soundEngine } from '../services/audio';
import { hapticService } from '../services/haptics';
import { Flame, Crown, Gift, Target, Sparkles, ChevronRight } from 'lucide-react';

export const QuickHubBar: React.FC = () => {
  const { profile } = usePlayer();
  const { setActiveModal, dailyChallenges, dailyQuests } = useGame();

  const todayDateStr = useMemo(() => new Date().toISOString().split('T')[0], []);
  const isClaimedStreakToday = profile.stats.lastLoginDate === todayDateStr;

  const hallOfFameEntries = useMemo(() => {
    return getResolvedHallOfFame(profile);
  }, [profile]);

  const completedChallengesCount = useMemo(() => {
    return Object.values(dailyChallenges || {}).filter((c: any) => c?.completed).length;
  }, [dailyChallenges]);

  const unclaimedQuestsCount = useMemo(() => {
    return (dailyQuests || []).filter((q) => q.completed && !q.claimed).length;
  }, [dailyQuests]);

  const totalRewardsPending = (!isClaimedStreakToday ? 1 : 0) + unclaimedQuestsCount;

  return (
    <div
      id="smart-quick-hub-bar"
      className="grid grid-cols-2 md:grid-cols-4 gap-2 sm:gap-3 select-none"
    >
      {/* 1: Trung Tâm Phúc Lợi (Unified Rewards Hub) */}
      <button
        id="btn-hub-rewards"
        type="button"
        onClick={() => {
          try {
            soundEngine.play('click');
            hapticService.tap();
          } catch {}
          setActiveModal('dailyReward');
        }}
        className={`group flex items-center justify-between p-2.5 sm:p-3 rounded-2xl border transition-all active:scale-[0.98] text-left cursor-pointer relative overflow-hidden ${
          totalRewardsPending > 0
            ? 'bg-gradient-to-br from-indigo-950/80 via-[#161426] to-[#12101e] border-indigo-500/40 shadow-lg shadow-indigo-500/10 hover:border-indigo-400'
            : 'bg-[#12111d]/90 hover:bg-[#181726] border-white/10 hover:border-white/20'
        }`}
        title="Trung Tâm Phúc Lợi: Điểm danh, vòng quay & nhiệm vụ"
      >
        <div className="flex items-center gap-2.5 min-w-0">
          <div className="w-9 h-9 sm:w-10 sm:h-10 rounded-xl bg-gradient-to-br from-indigo-500/20 to-purple-500/20 border border-indigo-500/40 text-indigo-400 flex items-center justify-center shrink-0 text-lg group-hover:scale-105 transition-transform shadow-inner relative">
            <span>🎁</span>
            {totalRewardsPending > 0 && (
              <span className="absolute -top-1 -right-1 w-2.5 h-2.5 rounded-full bg-orange-400 ring-2 ring-black animate-ping" />
            )}
          </div>
          <div className="min-w-0">
            <div className="flex items-center gap-1.5">
              <span className="text-xs sm:text-sm font-black text-white truncate">Phúc Lợi</span>
              <span className="flex items-center text-[10px] font-bold text-orange-400 font-mono">
                <Flame className="w-3 h-3 text-orange-400 fill-orange-400 mr-0.5" />
                {profile.stats.dailyStreak || 1}d
              </span>
            </div>
            <p className="text-[11px] text-slate-400 truncate">
              {totalRewardsPending > 0 ? (
                <span className="text-amber-300 font-bold">Có {totalRewardsPending} quà chờ nhận!</span>
              ) : (
                'Đã nhận hôm nay'
              )}
            </p>
          </div>
        </div>
        <ChevronRight className="w-4 h-4 text-slate-500 group-hover:text-white group-hover:translate-x-0.5 transition-all shrink-0" />
      </button>

      {/* 2: Thử Thách Ngày (Daily Challenge) */}
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
        className="group flex items-center justify-between p-2.5 sm:p-3 rounded-2xl bg-[#12111d]/90 hover:bg-[#181726] border border-white/10 hover:border-amber-500/40 transition-all active:scale-[0.98] text-left cursor-pointer relative overflow-hidden"
        title="Thử thách hàng ngày trong các mini-game"
      >
        <div className="flex items-center gap-2.5 min-w-0">
          <div className="w-9 h-9 sm:w-10 sm:h-10 rounded-xl bg-amber-500/15 border border-amber-500/30 text-amber-400 flex items-center justify-center shrink-0 text-lg group-hover:scale-105 transition-transform shadow-inner">
            <span>🎯</span>
          </div>
          <div className="min-w-0">
            <div className="flex items-center gap-1.5">
              <span className="text-xs sm:text-sm font-black text-white truncate">Thử Thách</span>
              <span className="text-[10px] font-black px-1.5 py-0.2 rounded bg-amber-500/20 text-amber-300 border border-amber-500/30 font-mono">
                {completedChallengesCount}/{ALL_GAMES_LIST.length}
              </span>
            </div>
            <p className="text-[11px] text-slate-400 truncate">
              Chơi & nhận thêm Xu Vàng
            </p>
          </div>
        </div>
        <ChevronRight className="w-4 h-4 text-slate-500 group-hover:text-white group-hover:translate-x-0.5 transition-all shrink-0" />
      </button>

      {/* 3: Lò Rèn Ma Thuật (Magic Forge) */}
      <button
        id="btn-hub-forge"
        type="button"
        onClick={() => {
          try {
            soundEngine.play('click');
            hapticService.tap();
          } catch {}
          setActiveModal('crafting');
        }}
        className="group flex items-center justify-between p-2.5 sm:p-3 rounded-2xl bg-[#12111d]/90 hover:bg-[#181726] border border-white/10 hover:border-purple-500/40 transition-all active:scale-[0.98] text-left cursor-pointer relative overflow-hidden"
        title="Lò rèn ma thuật: Dung hợp & Nâng cấp trang bị"
      >
        <div className="flex items-center gap-2.5 min-w-0">
          <div className="w-9 h-9 sm:w-10 sm:h-10 rounded-xl bg-purple-500/15 border border-purple-500/30 text-purple-400 flex items-center justify-center shrink-0 text-lg group-hover:scale-105 transition-transform shadow-inner">
            <span>🔨</span>
          </div>
          <div className="min-w-0">
            <div className="flex items-center gap-1.5">
              <span className="text-xs sm:text-sm font-black text-white truncate">Lò Rèn</span>
              <span className="text-[10px] font-black px-1.5 py-0.2 rounded bg-purple-500/20 text-purple-300 border border-purple-500/30">
                Nâng Cấp
              </span>
            </div>
            <p className="text-[11px] text-slate-400 truncate">
              Ghép 3 món lên bậc cao
            </p>
          </div>
        </div>
        <ChevronRight className="w-4 h-4 text-slate-500 group-hover:text-white group-hover:translate-x-0.5 transition-all shrink-0" />
      </button>

      {/* 4: Đại Sảnh Danh Vọng (Hall of Fame & Rank) */}
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
        className="group flex items-center justify-between p-2.5 sm:p-3 rounded-2xl bg-[#12111d]/90 hover:bg-[#181726] border border-white/10 hover:border-yellow-500/40 transition-all active:scale-[0.98] text-left cursor-pointer relative overflow-hidden"
        title="Đại sảnh danh vọng & Bảng vinh danh cao thủ server"
      >
        <div className="flex items-center gap-2.5 min-w-0">
          <div className="w-9 h-9 sm:w-10 sm:h-10 rounded-xl bg-yellow-500/15 border border-yellow-500/30 text-yellow-400 flex items-center justify-center shrink-0 text-lg group-hover:scale-105 transition-transform shadow-inner">
            <Crown className="w-4 h-4 sm:w-5 sm:h-5 text-yellow-400" />
          </div>
          <div className="min-w-0">
            <div className="flex items-center gap-1.5">
              <span className="text-xs sm:text-sm font-black text-white truncate">Đại Sảnh</span>
              <span className="text-[10px] font-black px-1.5 py-0.2 rounded bg-yellow-500/20 text-yellow-300 border border-yellow-500/30 font-mono">
                {hallOfFameEntries.length}
              </span>
            </div>
            <p className="text-[11px] text-slate-400 truncate">
              Bảng vinh danh cao thủ
            </p>
          </div>
        </div>
        <ChevronRight className="w-4 h-4 text-slate-500 group-hover:text-white group-hover:translate-x-0.5 transition-all shrink-0" />
      </button>
    </div>
  );
};

