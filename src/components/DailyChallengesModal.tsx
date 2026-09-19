import React, { useEffect, useMemo } from 'react';
import { useGame } from '../context/GameContext';
import { ALL_GAMES_LIST, GAME_REGISTRY } from '../games/registry';
import { useScrollLock } from '../hooks/useScrollLock';
import { CloseButton } from './common/CloseButton';
import {
  Flame,
  Trophy,
  Play,
  Gift,
  Coins,
  Gem,
  Zap,
  CheckCircle2,
  Clock,
  Sparkles,
  Target,
  Gamepad2,
} from 'lucide-react';

export const DailyChallengesModal: React.FC = () => {
  useScrollLock(true);
  const { dailyChallenges, launchDailyChallenge, claimDailyChallenge, setActiveModal } = useGame();

  // Close on Escape key press
  useEffect(() => {
    const handleKeyDown = (e: KeyboardEvent) => {
      if (e.key === 'Escape') {
        setActiveModal('none');
      }
    };
    window.addEventListener('keydown', handleKeyDown);
    return () => window.removeEventListener('keydown', handleKeyDown);
  }, [setActiveModal]);

  // Overall stats
  const stats = useMemo(() => {
    const challengesList = Object.values(dailyChallenges);
    const total = ALL_GAMES_LIST.length;
    const completed = challengesList.filter((c) => c?.completed).length;
    const claimed = challengesList.filter((c) => c?.claimed).length;
    const percent = total > 0 ? Math.round((completed / total) * 100) : 0;
    return { total, completed, claimed, percent };
  }, [dailyChallenges]);

  return (
    <div
      id="daily-challenges-modal-overlay"
      className="fixed inset-0 z-50 bg-black/80 backdrop-blur-md flex items-center justify-center p-3 sm:p-6 animate-fadeIn select-none"
      onClick={() => setActiveModal('none')}
    >
      <div
        id="daily-challenges-modal-content"
        className="relative w-full max-w-4xl h-[92vh] sm:h-[85vh] max-h-[780px] bg-gradient-to-br from-[#12121c] via-[#0d0d14] to-[#08080c] border border-amber-500/30 rounded-2xl sm:rounded-3xl shadow-2xl overflow-hidden flex flex-col"
        onClick={(e) => e.stopPropagation()}
      >
        {/* Top Glow Decor */}
        <div className="absolute top-0 left-1/2 -translate-x-1/2 w-96 h-32 bg-amber-500/15 rounded-full blur-3xl pointer-events-none" />

        {/* Header */}
        <div className="relative z-10 p-3 sm:p-6 border-b border-white/10 flex items-center justify-between bg-black/40">
          <div className="flex items-center gap-2.5 sm:gap-3 min-w-0">
            <div className="w-9 h-9 sm:w-11 sm:h-11 rounded-xl bg-amber-500/20 border border-amber-500/40 text-amber-400 flex items-center justify-center text-xl sm:text-2xl shadow-[0_0_20px_rgba(245,158,11,0.25)] shrink-0">
              🔥
            </div>
            <div className="min-w-0">
              <div className="flex items-center gap-2">
                <h2 id="modal-title-daily-challenges" className="text-sm sm:text-xl font-black text-white font-display tracking-tight truncate">
                  Thử Thách Hàng Ngày
                </h2>
                <span className="px-1.5 py-0.2 rounded-full bg-amber-500/20 text-amber-300 border border-amber-500/30 text-[9px] sm:text-[10px] font-mono font-bold shrink-0">
                  24h
                </span>
              </div>
              <p className="text-[11px] text-slate-400 hidden sm:block truncate">
                Hoàn thành thử thách đa dạng của từng game để nhận thưởng xu, ngọc và EXP lớn!
              </p>
            </div>
          </div>

          <CloseButton onClick={() => setActiveModal('none')} />
        </div>

        {/* Progress Summary Bar */}
        <div className="px-3 sm:px-6 py-2 sm:py-2.5 bg-[#161622]/80 border-b border-white/5 flex items-center justify-between gap-2.5 relative z-10 shrink-0">
          <div className="flex items-center gap-1.5 sm:gap-2 text-[11px] sm:text-xs text-slate-300 shrink-0">
            <Trophy className="w-3.5 h-3.5 text-amber-400 shrink-0" />
            <span>
              Tiến độ: <strong className="text-amber-400 font-bold">{stats.completed}</strong>/{stats.total} ({stats.percent}%)
            </span>
          </div>

          <div className="w-28 sm:w-64 bg-black/50 rounded-full h-2 sm:h-2.5 overflow-hidden border border-white/10 shrink-0">
            <div
              className="bg-gradient-to-r from-amber-500 to-orange-500 h-full transition-all duration-500 rounded-full"
              style={{ width: `${stats.percent}%` }}
            />
          </div>
        </div>

        {/* Scrollable Games List of Daily Challenges */}
        <div className="relative z-10 flex-1 overflow-y-auto p-3 sm:p-6 space-y-2.5 sm:space-y-3.5 scrollbar-thin">
          {ALL_GAMES_LIST.map((game) => {
            const challenge = dailyChallenges[game.id] || {
              gameId: game.id,
              title: `Thử Thách ${game.title}`,
              description: `Đạt điểm cao trong ${game.title}`,
              targetScore: 1000,
              timeLimitSeconds: 180,
              rewardCoins: 500,
              rewardGems: 25,
              rewardExp: 150,
              completed: false,
              claimed: false,
              bestScoreAchieved: 0,
            };

            const bestScore = challenge.bestScoreAchieved ?? 0;
            const targetScore = challenge.targetScore ?? 1000;
            const isCompleted = challenge.completed || bestScore >= targetScore;
            const isClaimed = challenge.claimed;

            return (
              <div
                key={`dc-${game.id}`}
                className={`rounded-2xl border p-3.5 sm:p-4 transition-all flex flex-col md:flex-row items-start md:items-center justify-between gap-4 ${
                  isClaimed
                    ? 'bg-[#101014]/60 border-white/5 opacity-80'
                    : isCompleted
                    ? 'bg-gradient-to-r from-amber-950/20 via-[#161622] to-[#12121a] border-amber-500/40 shadow-lg shadow-amber-500/5'
                    : 'bg-[#14141c] border-white/10 hover:border-indigo-500/40'
                }`}
              >
                {/* Left: Game Info & Challenge details */}
                <div className="flex items-start gap-3.5 flex-1 min-w-0">
                  <div
                    className="w-12 h-12 rounded-xl flex items-center justify-center text-2xl shadow-md border border-white/10 shrink-0"
                    style={{ backgroundColor: `${game.themeColor}25` }}
                  >
                    {game.icon}
                  </div>

                  <div className="space-y-1 min-w-0 flex-1">
                    <div className="flex flex-wrap items-center gap-2">
                      <h3 className="text-sm sm:text-base font-bold text-white font-display truncate">
                        {game.title}
                      </h3>
                      <span className="text-[10px] font-bold px-2 py-0.5 rounded bg-white/5 text-indigo-300 border border-white/10">
                        {game.category}
                      </span>
                      {isClaimed ? (
                        <span className="px-2 py-0.5 rounded-full bg-emerald-500/20 text-emerald-300 border border-emerald-500/30 text-[10px] font-black uppercase tracking-wider flex items-center gap-1">
                          <CheckCircle2 className="w-3 h-3 text-emerald-400" />
                          <span>Đã Nhận Thưởng</span>
                        </span>
                      ) : isCompleted ? (
                        <span className="px-2 py-0.5 rounded-full bg-amber-500/20 text-amber-300 border border-amber-500/30 text-[10px] font-black uppercase tracking-wider flex items-center gap-1 animate-pulse">
                          <Sparkles className="w-3 h-3 text-amber-400" />
                          <span>Hoàn Thành!</span>
                        </span>
                      ) : (
                        <span className="px-2 py-0.5 rounded-full bg-slate-800 text-slate-400 border border-white/5 text-[10px] font-mono">
                          Mục tiêu: {targetScore.toLocaleString()}
                        </span>
                      )}
                    </div>

                    <p className="text-xs font-semibold text-amber-200/90">
                      {challenge.title}
                    </p>
                    <p className="text-[11px] text-slate-400 leading-relaxed">
                      {challenge.description}
                    </p>

                    {/* Progress & Rewards Row - Icon only */}
                    <div className="flex flex-wrap items-center gap-3 pt-1 text-xs">
                      <div className="flex items-center gap-1.5 text-slate-300 bg-black/40 px-2.5 py-1 rounded-lg border border-white/5" title="Kỷ lục đạt được / Mục tiêu">
                        <Target className="w-3.5 h-3.5 text-indigo-400" />
                        <strong className="text-yellow-400 font-mono">
                          {bestScore.toLocaleString()} / {targetScore.toLocaleString()}
                        </strong>
                      </div>

                      <div className="flex items-center gap-2 text-[11px]">
                        <span className="inline-flex items-center gap-1 text-amber-400 font-mono font-bold" title="Arcade Coins">
                          <Coins className="w-3.5 h-3.5" /> +{challenge.rewardCoins}
                        </span>
                        <span className="inline-flex items-center gap-1 text-purple-400 font-mono font-bold" title="Gems">
                          <Gem className="w-3.5 h-3.5" /> +{challenge.rewardGems}
                        </span>
                        <span className="inline-flex items-center gap-1 text-indigo-400 font-mono font-bold" title="EXP">
                          <Zap className="w-3.5 h-3.5" /> +{challenge.rewardExp}
                        </span>
                      </div>
                    </div>
                  </div>
                </div>

                {/* Right: Action Buttons */}
                <div className="flex items-center gap-2 w-full md:w-auto justify-end shrink-0">
                  {isClaimed ? (
                    <button
                      id={`btn-dc-claimed-${game.id}`}
                      type="button"
                      disabled
                      title="Đã Nhận Thưởng"
                      aria-label="Đã Nhận Thưởng"
                      className="px-4 py-2 rounded-xl bg-white/5 text-slate-500 font-bold text-xs border border-white/5 cursor-not-allowed min-h-[40px] flex items-center justify-center"
                    >
                      <CheckCircle2 className="w-4 h-4 text-emerald-400" />
                    </button>
                  ) : isCompleted && !isClaimed ? (
                    <button
                      id={`btn-dc-claim-${game.id}`}
                      type="button"
                      onClick={() => claimDailyChallenge(game.id)}
                      title="Nhận Thưởng"
                      aria-label="Nhận Thưởng"
                      className="px-4 py-2 rounded-xl bg-gradient-to-r from-amber-400 to-orange-500 hover:from-amber-300 hover:to-orange-400 text-black font-black text-xs uppercase tracking-tight shadow-lg shadow-amber-500/25 flex items-center justify-center gap-1.5 active:scale-95 transition-all cursor-pointer animate-pulse min-h-[40px]"
                    >
                      <Gift className="w-4 h-4" />
                    </button>
                  ) : (
                    <button
                      id={`btn-dc-play-${game.id}`}
                      type="button"
                      onClick={() => {
                        setActiveModal('none');
                        launchDailyChallenge(game.id);
                      }}
                      title="Chơi Thử Thách"
                      aria-label="Chơi Thử Thách"
                      className="px-4 py-2 rounded-xl bg-gradient-to-r from-indigo-600 to-indigo-500 hover:from-indigo-500 hover:to-indigo-400 text-white font-black text-xs uppercase tracking-tight shadow-lg shadow-indigo-500/25 flex items-center justify-center gap-1.5 active:scale-95 transition-all cursor-pointer min-h-[40px]"
                    >
                      <Play className="w-4 h-4 fill-current" />
                    </button>
                  )}
                </div>
              </div>
            );
          })}
        </div>

        {/* Footer info */}
        <div className="p-3.5 bg-black/50 border-t border-white/10 text-center text-xs text-slate-400 relative z-10">
          💡 Mẹo: Hoàn thành thử thách mỗi ngày để tích lũy tài nguyên nâng cấp rương vũ khí và trang bị huyền thoại!
        </div>
      </div>
    </div>
  );
};
