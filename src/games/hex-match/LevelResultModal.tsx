import React from 'react';
import { Star, RotateCcw, ArrowRight, Home, Sparkles } from 'lucide-react';
import confetti from 'canvas-confetti';
import { LevelMiniLeaderboard } from './LevelMiniLeaderboard';
import { saveLevelScore } from './levelLeaderboard';

interface LevelResultModalProps {
  isWin: boolean;
  score: number;
  starsEarned: number;
  levelId: number;
  hasNextLevel: boolean;
  onNextLevel: () => void;
  onRetry: () => void;
  onMenu: () => void;
}

export const LevelResultModal: React.FC<LevelResultModalProps> = ({
  isWin,
  score,
  starsEarned,
  levelId,
  hasNextLevel,
  onNextLevel,
  onRetry,
  onMenu,
}) => {
  React.useEffect(() => {
    if (isWin) {
      confetti({
        particleCount: 80,
        spread: 70,
        origin: { y: 0.6 },
      });
      saveLevelScore(levelId, score);
    }
  }, [isWin, levelId, score]);

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center p-3 sm:p-4 bg-black/85 backdrop-blur-md animate-fade-in select-none overflow-y-auto">
      <div className="relative w-full max-w-sm bg-slate-900 border border-slate-700 rounded-3xl p-5 shadow-2xl flex flex-col items-center text-center my-auto">
        {/* Header Icon / Title */}
        {isWin ? (
          <div className="w-14 h-14 rounded-2xl bg-gradient-to-tr from-amber-500 to-yellow-300 flex items-center justify-center shadow-lg shadow-amber-500/30 mb-2 animate-bounce">
            <Sparkles className="w-8 h-8 text-slate-950" />
          </div>
        ) : (
          <div className="w-14 h-14 rounded-2xl bg-rose-500/20 border border-rose-500/40 flex items-center justify-center mb-2">
            <span className="text-3xl">💔</span>
          </div>
        )}

        <h2 className="text-xl sm:text-2xl font-black text-white font-display mb-0.5">
          {isWin ? 'Hoàn Thành Màn Chơi!' : 'Hết Lượt Đi!'}
        </h2>
        <p className="text-[11px] text-slate-400 mb-3">
          {isWin
            ? `Chúc mừng bạn đã vượt qua Màn ${levelId}!`
            : 'Đừng nản lòng, hãy dùng booster và thử lại nhé!'}
        </p>

        {/* 3-Star Display */}
        {isWin && (
          <div className="flex items-center justify-center gap-2 mb-3 bg-slate-950/60 border border-slate-800 rounded-2xl px-5 py-2 w-full">
            <Star
              className={`w-7 h-7 transition-transform duration-500 ${
                starsEarned >= 1
                  ? 'text-amber-400 fill-amber-400 scale-110 drop-shadow-[0_0_10px_rgba(245,158,11,0.8)]'
                  : 'text-slate-700'
              }`}
            />
            <Star
              className={`w-9 h-9 transition-transform duration-500 delay-100 ${
                starsEarned >= 2
                  ? 'text-amber-400 fill-amber-400 scale-125 drop-shadow-[0_0_15px_rgba(245,158,11,0.9)]'
                  : 'text-slate-700'
              }`}
            />
            <Star
              className={`w-7 h-7 transition-transform duration-500 delay-200 ${
                starsEarned >= 3
                  ? 'text-amber-400 fill-amber-400 scale-110 drop-shadow-[0_0_10px_rgba(245,158,11,0.8)]'
                  : 'text-slate-700'
              }`}
            />
          </div>
        )}

        {/* Score Card */}
        <div className="w-full bg-slate-950/60 border border-slate-800 rounded-2xl p-2.5 mb-3">
          <div className="text-[10px] text-slate-400 font-bold uppercase tracking-wider mb-0.5">
            Điểm Đạt Được
          </div>
          <div className="text-xl font-black font-mono text-cyan-300">
            {score.toLocaleString()}
          </div>
        </div>

        {/* Mini Leaderboard for this Level */}
        <div className="w-full mb-4">
          <LevelMiniLeaderboard levelId={levelId} currentScore={score} />
        </div>

        {/* Action Buttons */}
        <div className="flex flex-col w-full gap-2">
          {isWin && hasNextLevel && (
            <button
              type="button"
              onClick={onNextLevel}
              className="w-full py-3 rounded-2xl bg-gradient-to-r from-indigo-500 to-purple-600 hover:from-indigo-400 hover:to-purple-500 text-white font-black text-xs sm:text-sm flex items-center justify-center gap-2 shadow-lg shadow-indigo-500/30 active:scale-95 transition-all cursor-pointer"
            >
              <span>Màn Tiếp Theo</span>
              <ArrowRight className="w-4 h-4" />
            </button>
          )}

          <button
            type="button"
            onClick={onRetry}
            className="w-full py-2.5 rounded-2xl bg-slate-800 hover:bg-slate-700 text-slate-200 font-bold text-xs sm:text-sm flex items-center justify-center gap-2 border border-slate-700 active:scale-95 transition-all cursor-pointer"
          >
            <RotateCcw className="w-3.5 h-3.5" />
            <span>Thử Lại</span>
          </button>

          <button
            type="button"
            onClick={onMenu}
            className="w-full py-2 rounded-xl bg-transparent hover:bg-white/5 text-slate-400 hover:text-white font-semibold text-xs flex items-center justify-center gap-1.5 transition-all cursor-pointer"
          >
            <Home className="w-3.5 h-3.5" />
            <span>Về Menu Màn Chơi</span>
          </button>
        </div>
      </div>
    </div>
  );
};
