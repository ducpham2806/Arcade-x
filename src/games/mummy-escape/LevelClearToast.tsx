import React, { useEffect, useState } from 'react';
import { Star, Coins, Zap, Trophy, ArrowRight, RotateCcw, Map, Sparkles, X, CheckCircle2, Flame, Shield } from 'lucide-react';
import { LevelData, GameMode } from './types';

export interface LevelClearToastProps {
  levelData: LevelData;
  turnsTaken: number;
  stars: number;
  score: number;
  levelScoreBonus: number;
  mummiesDestroyed: number;
  revertChargesUsed: number;
  mode: GameMode;
  floor?: number;
  onNextLevel: () => void;
  onReplay: () => void;
  onOpenMap: () => void;
  onDismiss: () => void;
}

export const LevelClearToast: React.FC<LevelClearToastProps> = ({
  levelData,
  turnsTaken,
  stars,
  score,
  levelScoreBonus,
  mummiesDestroyed,
  revertChargesUsed,
  mode,
  floor = 1,
  onNextLevel,
  onReplay,
  onOpenMap,
  onDismiss,
}) => {
  const [animStep, setAnimStep] = useState<number>(0);

  useEffect(() => {
    const t1 = setTimeout(() => setAnimStep(1), 100);
    const t2 = setTimeout(() => setAnimStep(2), 350);
    const t3 = setTimeout(() => setAnimStep(3), 600);
    return () => {
      clearTimeout(t1);
      clearTimeout(t2);
      clearTimeout(t3);
    };
  }, []);

  // Calculate rewards based on performance
  const coinsEarned = Math.max(15, 10 + stars * 15 + mummiesDestroyed * 10);
  const expEarned = Math.max(30, 20 + stars * 25 + (mode === 'endless' ? floor * 15 : 40));

  const performanceRating =
    stars === 3
      ? { title: 'BẬC THẦY GIẢI ĐỐ', desc: 'Hoàn thành số bước tối ưu hoàn hảo!', color: 'text-yellow-400' }
      : stars === 2
      ? { title: 'XUẤT SẮC', desc: 'Thoát hiểm rất nhanh nhẹn!', color: 'text-amber-300' }
      : { title: 'THOÁT HIỂM THÀNH CÔNG', desc: 'Sống sót khỏi lăng mộ cổ đại!', color: 'text-emerald-400' };

  return (
    <div className="fixed top-3 left-1/2 -translate-x-1/2 z-50 w-full max-w-md px-3 animate-in fade-in slide-in-from-top-4 duration-300 pointer-events-auto">
      <div className="relative w-full bg-gradient-to-b from-[#24170a] via-[#1a1106] to-[#120b04] border-2 border-[#f59e0b] rounded-3xl p-4 sm:p-5 shadow-[0_12px_40px_rgba(245,158,11,0.35)] text-white overflow-hidden">
        {/* Glow & Backdrop decorative beams */}
        <div className="absolute -top-12 left-1/2 -translate-x-1/2 w-48 h-24 bg-amber-500/25 blur-2xl rounded-full pointer-events-none" />
        <div className="absolute top-0 right-0 w-24 h-24 bg-yellow-400/10 rounded-full blur-xl pointer-events-none" />

        {/* Close / Dismiss button */}
        <button
          type="button"
          onClick={onDismiss}
          className="absolute top-3 right-3 w-7 h-7 rounded-full bg-black/40 hover:bg-black/60 border border-white/10 flex items-center justify-center text-slate-300 hover:text-white transition-colors cursor-pointer z-10"
          title="Đóng thông báo"
        >
          <X className="w-4 h-4" />
        </button>

        {/* Header with Trophy / Stars */}
        <div className="flex items-center gap-3 mb-3">
          <div className="relative w-12 h-12 rounded-2xl bg-gradient-to-br from-amber-400 to-yellow-600 p-0.5 shadow-lg shadow-amber-500/30 shrink-0">
            <div className="w-full h-full bg-[#1c1207] rounded-2xl flex items-center justify-center text-2xl">
              👑
            </div>
            <div className="absolute -top-1 -right-1">
              <Sparkles className="w-4 h-4 text-yellow-300 animate-spin" style={{ animationDuration: '6s' }} />
            </div>
          </div>

          <div className="min-w-0 flex-1">
            <div className="flex items-center gap-1.5 flex-wrap">
              <span className={`text-[11px] font-extrabold uppercase tracking-wider ${performanceRating.color}`}>
                {performanceRating.title}
              </span>
              <span className="px-1.5 py-0.2 rounded bg-amber-500/20 text-amber-300 text-[10px] font-mono font-bold border border-amber-500/30">
                {mode === 'endless' ? `Tầng ${floor}` : `Phòng ${levelData.id}`}
              </span>
            </div>
            <h3 className="text-base sm:text-lg font-black text-white font-display truncate">
              {levelData.name}
            </h3>
          </div>
        </div>

        {/* Star Rating Animation Bar */}
        <div className="flex items-center justify-center gap-2 py-2 mb-3 bg-[#170e05]/90 border border-amber-500/20 rounded-2xl">
          {[1, 2, 3].map((starIdx) => {
            const isEarned = starIdx <= stars;
            return (
              <div
                key={`toast-star-${starIdx}`}
                className={`transition-all duration-300 flex flex-col items-center ${
                  animStep >= starIdx && isEarned ? 'scale-110' : 'scale-90 opacity-40'
                }`}
              >
                <Star
                  className={`w-7 h-7 sm:w-8 sm:h-8 transition-colors ${
                    isEarned
                      ? 'text-yellow-400 fill-yellow-400 drop-shadow-[0_0_10px_rgba(250,204,21,0.9)]'
                      : 'text-stone-700'
                  }`}
                />
              </div>
            );
          })}
        </div>

        {/* Performance & Rewards Grid */}
        <div className="grid grid-cols-2 gap-2 mb-3">
          {/* Performance Box */}
          <div className="bg-[#120b04]/80 border border-[#6b4718] rounded-xl p-2.5 flex flex-col justify-between text-xs">
            <div className="text-[10px] text-amber-200/70 font-bold uppercase mb-1 flex items-center gap-1">
              <CheckCircle2 className="w-3 h-3 text-emerald-400" />
              <span>Thành tích:</span>
            </div>
            <div className="space-y-0.5 text-[11px]">
              <div className="flex justify-between">
                <span className="text-slate-400">Bước đi:</span>
                <span className="font-bold text-white font-mono">
                  {turnsTaken} / {levelData.parTurns} lượt
                </span>
              </div>
              <div className="flex justify-between">
                <span className="text-slate-400">Xác ướp diệt:</span>
                <span className="font-bold text-amber-300 font-mono">+{mummiesDestroyed} 💀</span>
              </div>
              <div className="flex justify-between">
                <span className="text-slate-400">Điểm màn:</span>
                <span className="font-bold text-yellow-400 font-mono">+{levelScoreBonus}</span>
              </div>
            </div>
          </div>

          {/* Rewards Box */}
          <div className="bg-[#120b04]/80 border border-[#6b4718] rounded-xl p-2.5 flex flex-col justify-between text-xs">
            <div className="text-[10px] text-amber-200/70 font-bold uppercase mb-1 flex items-center gap-1">
              <Trophy className="w-3 h-3 text-yellow-400" />
              <span>Phần thưởng:</span>
            </div>
            <div className="space-y-1 text-[11px]">
              <div className="flex items-center justify-between text-amber-300 font-bold">
                <span className="flex items-center gap-1">
                  <Coins className="w-3.5 h-3.5 text-yellow-400" />
                  <span>Arcade Xu:</span>
                </span>
                <span className="font-mono text-yellow-400">+{coinsEarned}</span>
              </div>
              <div className="flex items-center justify-between text-cyan-300 font-bold">
                <span className="flex items-center gap-1">
                  <Zap className="w-3.5 h-3.5 text-cyan-400" />
                  <span>Kinh nghiệm:</span>
                </span>
                <span className="font-mono text-cyan-400">+{expEarned} EXP</span>
              </div>
              <div className="flex items-center justify-between text-emerald-300 text-[10px]">
                <span>Tổng Điểm:</span>
                <span className="font-mono font-bold text-white">{score.toLocaleString()}</span>
              </div>
            </div>
          </div>
        </div>

        {/* Quick Action Buttons */}
        <div className="flex items-center gap-2 pt-1">
          <button
            type="button"
            onClick={onReplay}
            className="px-3 py-2.5 rounded-xl bg-white/5 hover:bg-white/10 active:scale-95 text-stone-300 hover:text-white text-xs font-bold flex items-center justify-center gap-1.5 border border-white/10 transition-all cursor-pointer"
            title="Chơi lại màn này"
          >
            <RotateCcw className="w-3.5 h-3.5" />
            <span className="hidden xs:inline">Chơi Lại</span>
          </button>

          <button
            type="button"
            onClick={onOpenMap}
            className="px-3 py-2.5 rounded-xl bg-[#281b0f] hover:bg-[#382615] active:scale-95 text-amber-300 text-xs font-bold flex items-center justify-center gap-1.5 border border-[#7d5626] transition-all cursor-pointer"
            title="Xem bản đồ kim tự tháp"
          >
            <Map className="w-3.5 h-3.5" />
            <span className="hidden xs:inline">Bản Đồ</span>
          </button>

          <button
            type="button"
            onClick={onNextLevel}
            className="flex-1 py-2.5 px-4 rounded-xl bg-gradient-to-r from-amber-500 via-yellow-500 to-amber-600 hover:from-amber-400 hover:to-yellow-400 active:scale-95 text-stone-950 font-black text-xs uppercase tracking-wider flex items-center justify-center gap-1.5 shadow-lg shadow-amber-500/30 transition-all cursor-pointer"
          >
            <span>{mode === 'endless' ? `Tầng ${floor + 1}` : 'Màn Kế Tiếp'}</span>
            <ArrowRight className="w-4 h-4" />
          </button>
        </div>
      </div>
    </div>
  );
};
