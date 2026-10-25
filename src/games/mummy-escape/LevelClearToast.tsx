import React, { useEffect, useState } from 'react';
import { Star, Coins, Zap, Trophy, ArrowRight, RotateCcw, Map, Sparkles, X, CheckCircle2 } from 'lucide-react';
import { LevelData, GameMode } from './types';
import { MummySprite } from '../../visuals/MummySprite';

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

  const coinsEarned = Math.max(15, 10 + stars * 15 + mummiesDestroyed * 10);
  const expEarned = Math.max(30, 20 + stars * 25 + (mode === 'endless' ? floor * 15 : 40));

  const performanceRating =
    stars === 3
      ? { title: 'ĐẠI HỌC GIẢ PHARAOH', desc: 'Giải mã lăng mộ với số bước tối ưu!', color: 'text-yellow-300' }
      : stars === 2
      ? { title: 'THợ SĂN CỔ VẬT', desc: 'Thoát hiểm nhanh nhạy khỏi xác ướp!', color: 'text-amber-300' }
      : { title: 'VƯỢT NGỤC THÀNH CÔNG', desc: 'Sống sót rời khỏi hầm mộ cổ đại!', color: 'text-emerald-300' };

  return (
    <div className="fixed top-3 left-1/2 -translate-x-1/2 z-50 w-full max-w-md px-3 animate-in fade-in slide-in-from-top-4 duration-300 pointer-events-auto">
      <div className="relative w-full bg-gradient-to-b from-[#33210f] via-[#211408] to-[#140b04] border-2 border-[#e0ab43] rounded-3xl p-4 sm:p-5 shadow-[0_18px_50px_rgba(0,0,0,0.85),0_0_30px_rgba(245,158,11,0.35)] text-white overflow-hidden">
        {/* Hieroglyphic Header Frieze */}
        <div className="pointer-events-none absolute top-1 left-1/2 -translate-x-1/2 text-[11px] text-amber-300/15 tracking-[0.4em] font-serif whitespace-nowrap">
          𓂀 𓋹 𓆣 𓁹 𓊽 𓅃 𓆗
        </div>

        <button
          type="button"
          onClick={onDismiss}
          className="absolute top-3 right-3 w-7 h-7 rounded-full bg-black/50 hover:bg-black/70 border border-amber-500/30 flex items-center justify-center text-amber-200 hover:text-white transition-colors cursor-pointer z-10"
          title="Đóng thông báo"
        >
          <X className="w-4 h-4" />
        </button>

        {/* Header with Golden Scarab Seal */}
        <div className="flex items-center gap-3 mb-3">
          <div className="relative w-13 h-13 rounded-2xl bg-gradient-to-br from-amber-400 to-yellow-700 p-0.5 shadow-lg shadow-amber-500/30 shrink-0">
            <div className="w-full h-full bg-[#1c1107] rounded-2xl flex items-center justify-center p-1">
              <MummySprite kind="scarab" />
            </div>
            <div className="absolute -top-1 -right-1">
              <Sparkles className="w-4 h-4 text-yellow-300 animate-spin" style={{ animationDuration: '6s' }} />
            </div>
          </div>

          <div className="min-w-0 flex-1">
            <div className="flex items-center gap-1.5 flex-wrap">
              <span className={`text-[11px] font-serif font-extrabold uppercase tracking-wider ${performanceRating.color}`}>
                {performanceRating.title}
              </span>
              <span className="px-1.5 py-0.2 rounded bg-amber-500/25 text-yellow-200 text-[10px] font-mono font-bold border border-amber-400/40">
                {mode === 'endless' ? `Tầng ${floor}` : `Mật Thất ${levelData.id}`}
              </span>
            </div>
            <h3 className="text-base sm:text-lg font-serif font-black text-amber-100 truncate">
              {levelData.name}
            </h3>
          </div>
        </div>

        {/* Golden Star Rating Cartouche */}
        <div className="flex items-center justify-center gap-3 py-2 mb-3 bg-[#170e05]/95 border border-amber-500/30 rounded-2xl shadow-inner">
          {[1, 2, 3].map((starIdx) => {
            const isEarned = starIdx <= stars;
            return (
              <div
                key={`toast-star-${starIdx}`}
                className={`transition-all duration-300 flex flex-col items-center ${
                  animStep >= starIdx && isEarned ? 'scale-110' : 'scale-90 opacity-35'
                }`}
              >
                <Star
                  className={`w-7 h-7 sm:w-8 sm:h-8 transition-colors ${
                    isEarned
                      ? 'text-yellow-400 fill-yellow-400 drop-shadow-[0_0_12px_rgba(250,204,21,0.9)]'
                      : 'text-stone-700'
                  }`}
                />
              </div>
            );
          })}
        </div>

        {/* Performance & Rewards Sandstone Tablets */}
        <div className="grid grid-cols-2 gap-2 mb-3">
          <div className="bg-[#180f06]/90 border border-[#7d5626] rounded-xl p-2.5 flex flex-col justify-between text-xs">
            <div className="text-[10px] text-amber-200/80 font-bold uppercase mb-1 flex items-center gap-1">
              <CheckCircle2 className="w-3 h-3 text-emerald-400" />
              <span>Chiến tích:</span>
            </div>
            <div className="space-y-0.5 text-[11px]">
              <div className="flex justify-between">
                <span className="text-amber-200/70">Bước đi:</span>
                <span className="font-bold text-yellow-100 font-mono">
                  {turnsTaken} / {levelData.parTurns}
                </span>
              </div>
              <div className="flex justify-between">
                <span className="text-amber-200/70">Hạ xác ướp:</span>
                <span className="font-bold text-amber-300 font-mono">+{mummiesDestroyed}</span>
              </div>
              <div className="flex justify-between">
                <span className="text-amber-200/70">Thưởng màn:</span>
                <span className="font-bold text-yellow-400 font-mono">+{levelScoreBonus}</span>
              </div>
            </div>
          </div>

          <div className="bg-[#180f06]/90 border border-[#7d5626] rounded-xl p-2.5 flex flex-col justify-between text-xs">
            <div className="text-[10px] text-amber-200/80 font-bold uppercase mb-1 flex items-center gap-1">
              <Trophy className="w-3 h-3 text-yellow-400" />
              <span>Kho báu Pharaoh:</span>
            </div>
            <div className="space-y-1 text-[11px]">
              <div className="flex items-center justify-between text-amber-300 font-bold">
                <span className="flex items-center gap-1">
                  <Coins className="w-3.5 h-3.5 text-yellow-400" />
                  <span>Xu Vàng:</span>
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
            className="px-3 py-2.5 rounded-xl bg-[#26180b] hover:bg-[#362210] active:scale-95 text-amber-200 hover:text-white text-xs font-bold flex items-center justify-center gap-1.5 border border-[#8b632d] transition-all cursor-pointer"
          >
            <RotateCcw className="w-3.5 h-3.5" />
            <span>Chơi Lại</span>
          </button>

          <button
            type="button"
            onClick={onOpenMap}
            className="px-3 py-2.5 rounded-xl bg-[#26180b] hover:bg-[#362210] active:scale-95 text-amber-300 text-xs font-bold flex items-center justify-center gap-1.5 border border-[#8b632d] transition-all cursor-pointer"
          >
            <Map className="w-3.5 h-3.5" />
            <span>Bản Đồ</span>
          </button>

          <button
            type="button"
            onClick={onNextLevel}
            className="flex-1 py-2.5 px-4 rounded-xl bg-gradient-to-r from-amber-500 via-yellow-400 to-amber-500 hover:from-amber-400 hover:to-yellow-300 active:scale-95 text-stone-950 font-serif font-black text-xs uppercase tracking-wider flex items-center justify-center gap-1.5 shadow-lg shadow-amber-500/35 transition-all cursor-pointer"
          >
            <span>{mode === 'endless' ? `Mật Thất ${floor + 1}` : 'Mật Thất Kế Tiếp'}</span>
            <ArrowRight className="w-4 h-4" />
          </button>
        </div>
      </div>
    </div>
  );
};
