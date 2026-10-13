import React from 'react';
import { Trophy, Star, Sparkles, Coins, Zap, Gem, RotateCcw, ArrowRight, ArrowLeft, Package, TrendingUp, TrendingDown, Award } from 'lucide-react';
import { GameWinResult, SudokuDifficulty, SudokuGridSize } from './types';
import { DynamicDifficultySuggestion } from './dynamicDifficulty';

interface WinPopupProps {
  result: GameWinResult;
  title: string;
  stageNumber?: number;
  onNextStage?: () => void;
  onReplay: () => void;
  onBackToMenu: () => void;
  hasNextStage: boolean;
  suggestion?: DynamicDifficultySuggestion | null;
  onApplySuggestion?: (difficulty: SudokuDifficulty, size: SudokuGridSize) => void;
}

export const WinPopup: React.FC<WinPopupProps> = ({
  result,
  title,
  stageNumber,
  onNextStage,
  onReplay,
  onBackToMenu,
  hasNextStage,
  suggestion,
  onApplySuggestion,
}) => {
  const formatTime = (secs: number) => {
    const mins = Math.floor(secs / 60);
    const s = secs % 60;
    return `${mins}:${s < 10 ? '0' : ''}${s}`;
  };

  const diffNames: Record<SudokuDifficulty, string> = {
    easy: 'Dễ',
    medium: 'Vừa',
    hard: 'Khó',
    expert: 'Cực Khó (IQ 180)',
  };

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-black/75 backdrop-blur-sm animate-fade-in">
      <div className="relative w-full max-w-sm sm:max-w-md rounded-3xl bg-gradient-to-b from-[#2e170c] via-[#211108] to-[#170a04] border-4 border-[#c28f5b] p-5 sm:p-7 shadow-[0_0_50px_rgba(217,119,6,0.5)] flex flex-col items-center text-center text-amber-100 animate-scale-up">
        {/* Glow Header Icon */}
        <div className="relative -mt-14 mb-2 flex items-center justify-center w-20 h-20 rounded-3xl bg-gradient-to-tr from-amber-600 to-yellow-400 border-4 border-yellow-200 shadow-2xl animate-bounce">
          <Trophy className="w-10 h-10 text-stone-950" />
          <Sparkles className="absolute -top-2 -right-2 w-6 h-6 text-yellow-300 animate-spin" />
        </div>

        <h2 className="text-2xl sm:text-3xl font-black text-transparent bg-clip-text bg-gradient-to-r from-yellow-200 via-amber-300 to-yellow-100 drop-shadow-md uppercase">
          CHIẾN THẮNG RỰC RỠ!
        </h2>
        <p className="text-xs sm:text-sm text-amber-300/90 font-bold mt-1">
          {stageNumber ? `Hoàn Thành Cửa ${stageNumber}: ${title}` : title}
        </p>

        {/* 3-Star Rating */}
        <div className="flex items-center gap-2 my-3">
          {[1, 2, 3].map((starIdx) => (
            <div
              key={`win-star-${starIdx}`}
              className={`p-2 rounded-2xl border-2 transition-all ${
                starIdx <= result.stars
                  ? 'bg-yellow-400/20 border-yellow-400 text-yellow-300 scale-110 shadow-[0_0_15px_rgba(250,204,21,0.6)]'
                  : 'bg-stone-900/60 border-stone-700 text-stone-600'
              }`}
            >
              <Star className={`w-7 h-7 ${starIdx <= result.stars ? 'fill-yellow-400' : ''}`} />
            </div>
          ))}
        </div>

        {/* Stats Grid */}
        <div className="w-full grid grid-cols-3 gap-2 my-2 p-3 rounded-2xl bg-[#3f2110]/80 border border-[#854d24]/60 shadow-inner">
          <div className="flex flex-col items-center">
            <span className="text-[10px] text-amber-300/80 font-bold uppercase">Điểm Số</span>
            <span className="text-lg font-black text-yellow-300">+{result.score}</span>
          </div>
          <div className="flex flex-col items-center">
            <span className="text-[10px] text-amber-300/80 font-bold uppercase">Thời Gian</span>
            <span className="text-lg font-black text-amber-100 font-mono">
              {formatTime(result.timeSpentSeconds)}
            </span>
          </div>
          <div className="flex flex-col items-center">
            <span className="text-[10px] text-amber-300/80 font-bold uppercase">Lỗi / Gợi Ý</span>
            <span className="text-lg font-black text-rose-300">
              {result.mistakesCount} / {result.hintsUsedCount}
            </span>
          </div>
        </div>

        {/* Rewards Earned */}
        <div className="w-full flex items-center justify-around gap-2 my-2 py-2.5 px-3 rounded-2xl bg-amber-950/60 border border-amber-500/40">
          <div className="flex items-center gap-1.5 text-xs font-black text-yellow-300">
            <Coins className="w-4 h-4 text-yellow-400" />
            <span>+{result.coinsEarned} Vàng</span>
          </div>

          {result.gemsEarned > 0 && (
            <div className="flex items-center gap-1.5 text-xs font-black text-pink-300">
              <Gem className="w-4 h-4 text-pink-400" />
              <span>+{result.gemsEarned} Ngọc</span>
            </div>
          )}
          {result.chestDropped && (
            <div className="flex items-center gap-1.5 text-xs font-black text-purple-300 animate-bounce">
              <Package className="w-4 h-4 text-purple-400" />
              <span className="capitalize">Rương {result.chestDropped}</span>
            </div>
          )}
        </div>

        {/* Dynamic Difficulty Suggestion Box */}
        {suggestion && suggestion.trend !== 'balanced' && onApplySuggestion && (
          <div className="w-full p-2.5 my-2 rounded-2xl bg-[#33170a]/90 border border-amber-400/60 text-left flex flex-col gap-1.5 shadow-md">
            <div className="flex items-center justify-between">
              <span className="flex items-center gap-1 text-[11px] font-black text-yellow-300 uppercase">
                {suggestion.trend === 'harder' ? (
                  <TrendingUp className="w-3.5 h-3.5 text-emerald-400" />
                ) : (
                  <TrendingDown className="w-3.5 h-3.5 text-sky-400" />
                )}
                Đề Xuất Độ Khó Động (AI)
              </span>
              <span className="text-[10px] px-2 py-0.5 rounded-full bg-amber-500/20 text-amber-200 font-bold border border-amber-500/40">
                {suggestion.skillTier}
              </span>
            </div>
            <p className="text-[11px] text-amber-200/90 leading-tight">
              {suggestion.reason}
            </p>
            <button
              type="button"
              onClick={() => onApplySuggestion(suggestion.suggestedDifficulty, suggestion.suggestedSize)}
              className="mt-1 w-full py-1.5 px-3 rounded-xl bg-gradient-to-r from-yellow-500 via-amber-400 to-yellow-500 hover:from-yellow-400 hover:to-amber-300 text-stone-950 text-xs font-black flex items-center justify-center gap-1.5 shadow-md active:scale-95 transition-all"
            >
              <Sparkles className="w-3.5 h-3.5" />
              <span>Áp dụng độ khó {diffNames[suggestion.suggestedDifficulty]} cho ván sau</span>
            </button>
          </div>
        )}

        {/* Action Buttons */}
        <div className="w-full flex flex-col sm:flex-row items-center gap-2 mt-3">
          <button
            id="scoodoku-win-btn-menu"
            type="button"
            onClick={onBackToMenu}
            className="w-full sm:w-auto flex-1 flex items-center justify-center gap-1.5 py-3 px-3 rounded-2xl font-black text-xs bg-[#4d2813] hover:bg-[#381d0c] text-amber-200 border border-[#8a4e23]/70 active:scale-95 transition-all"
          >
            <ArrowLeft className="w-4 h-4" />
            <span>Về Menu</span>
          </button>

          <button
            id="scoodoku-win-btn-replay"
            type="button"
            onClick={onReplay}
            className="w-full sm:w-auto flex-1 flex items-center justify-center gap-1.5 py-3 px-3 rounded-2xl font-black text-xs bg-[#61361c] hover:bg-[#4a2712] text-amber-100 border border-[#a86533]/80 active:scale-95 transition-all"
          >
            <RotateCcw className="w-4 h-4" />
            <span>Chơi Lại</span>
          </button>

          {hasNextStage && onNextStage && (
            <button
              id="scoodoku-win-btn-next"
              type="button"
              onClick={onNextStage}
              className="w-full sm:w-auto flex-1 flex items-center justify-center gap-1.5 py-3 px-4 rounded-2xl font-black text-xs bg-gradient-to-r from-amber-500 via-yellow-400 to-amber-500 text-stone-950 border-2 border-yellow-200 shadow-lg active:scale-95 transition-all"
            >
              <span>Màn Kế Tiếp</span>
              <ArrowRight className="w-4 h-4" />
            </button>
          )}
        </div>
      </div>
    </div>
  );
};

