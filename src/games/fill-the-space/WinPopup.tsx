import React, { useEffect } from 'react';
import { Trophy, Star, ArrowRight, RotateCcw, Home, Sparkles, Coins, Zap, Gift, Layers, Flame, RefreshCw } from 'lucide-react';
import confetti from 'canvas-confetti';
import { useScrollLock } from '../../hooks/useScrollLock';

interface WinPopupProps {
  levelNumber: number;
  score: number;
  levelScore: number;
  timeTakenSeconds: number;
  movesCount: number;
  undosLeft: number;
  difficultyLabel: string;
  shapeComplexity: string;
  nextGridDim: number;
  coinsEarned: number;
  expEarned: number;
  droppedChest: 'common' | 'rare' | 'epic' | 'legendary' | null;
  noHintStreak: number;
  isDoubleScore: boolean;
  hintsUsedCount: number;
  isZenMode?: boolean;
  onNextLevel: () => void;
  onReplayLevel: () => void;
  onExit: () => void;
}

export const WinPopup: React.FC<WinPopupProps> = ({
  levelNumber,
  score,
  levelScore,
  timeTakenSeconds,
  movesCount,
  undosLeft,
  difficultyLabel,
  shapeComplexity,
  nextGridDim,
  coinsEarned,
  expEarned,
  droppedChest,
  noHintStreak,
  isDoubleScore,
  hintsUsedCount,
  isZenMode = false,
  onNextLevel,
  onReplayLevel,
  onExit,
}) => {
  useScrollLock(true);

  // Trigger celebration fireworks effect on mount
  useEffect(() => {
    if (isDoubleScore) {
      // Golden Multi-Firework Extravaganza for 3+ Streak
      confetti({
        particleCount: 70,
        spread: 70,
        origin: { x: 0.15, y: 0.5 },
        colors: ['#fbbf24', '#f59e0b', '#f43f5e', '#38bdf8', '#a855f7'],
      });
      setTimeout(() => {
        confetti({
          particleCount: 70,
          spread: 70,
          origin: { x: 0.85, y: 0.5 },
          colors: ['#fbbf24', '#eab308', '#ec4899', '#06b6d4', '#10b981'],
        });
      }, 250);
      setTimeout(() => {
        confetti({
          particleCount: 100,
          spread: 100,
          origin: { x: 0.5, y: 0.35 },
          colors: ['#ffd700', '#ffae00', '#ffffff', '#ff4500'],
        });
      }, 500);
    } else {
      confetti({
        particleCount: 45,
        spread: 60,
        origin: { y: 0.6 },
        colors: ['#fbbf24', '#d97706', '#f59e0b'],
      });
    }
  }, [isDoubleScore]);

  // Stars calculation based on undos left and time
  const starsCount = undosLeft === 3 && timeTakenSeconds < 45 ? 3 : undosLeft >= 1 ? 2 : 1;

  const formatTime = (secs: number) => {
    const mins = Math.floor(secs / 60);
    const remainder = secs % 60;
    return `${mins}:${remainder.toString().padStart(2, '0')}`;
  };

  const chestLabels = {
    common: { name: 'Rương Thường', color: 'text-amber-300', bg: 'bg-amber-900/40 border-amber-600/50' },
    rare: { name: 'Rương Hiếm', color: 'text-blue-300', bg: 'bg-blue-900/40 border-blue-600/50' },
    epic: { name: 'Rương Sử Thi', color: 'text-purple-300', bg: 'bg-purple-900/40 border-purple-600/50' },
    legendary: { name: 'Rương Huyền Thoại', color: 'text-yellow-400', bg: 'bg-yellow-950/60 border-yellow-500/60' },
  };

  return (
    <div
      id="fts-win-modal"
      className="absolute inset-0 z-50 flex items-center justify-center p-4 bg-black/80 backdrop-blur-md animate-in fade-in duration-200"
    >
      <div
        className={`relative w-full max-w-md border-2 rounded-3xl p-5 sm:p-7 shadow-2xl overflow-hidden flex flex-col text-center transition-all max-h-[95vh] ${
          isZenMode
            ? 'bg-gradient-to-b from-[#2d3a2e] via-[#1a241b] to-[#0e160f] border-emerald-500/60 shadow-emerald-950/80'
            : isDoubleScore
            ? 'bg-gradient-to-b from-[#3d2010] via-[#2a1307] to-[#170902] border-yellow-400/90 shadow-[0_0_50px_rgba(250,204,21,0.45)]'
            : 'bg-gradient-to-b from-[#3a2215] via-[#28170d] to-[#1a0f08] border-amber-600/60 shadow-amber-950/80'
        }`}
      >
        <div className="shrink-0 mb-1">
          {/* Neon Radiant Glow Aura for Double Score Streak */}
          {isDoubleScore && (
            <div className="absolute -inset-1 bg-gradient-to-r from-amber-500 via-yellow-400 to-amber-500 rounded-3xl opacity-20 blur-xl pointer-events-none animate-pulse" />
          )}

          {/* Subtle decorative wood grain pattern */}
          <div
            className="absolute inset-0 opacity-10 pointer-events-none mix-blend-screen"
            style={{
              backgroundImage: `repeating-linear-gradient(
                45deg,
                transparent,
                transparent 10px,
                rgba(245, 158, 11, 0.3) 11px,
                transparent 14px
              )`,
            }}
          />

          {/* Floating sparkles */}
          <div className="absolute top-4 left-4 text-amber-400/50 animate-pulse">
            <Sparkles className="w-6 h-6" />
          </div>
          <div className="absolute top-4 right-4 text-amber-400/50 animate-pulse">
            <Sparkles className="w-6 h-6" />
          </div>

          {/* Header Ribbon / Trophy */}
          <div
            className={`relative mx-auto w-16 h-16 sm:w-20 sm:h-20 -mt-1 mb-2.5 rounded-2xl flex items-center justify-center shadow-lg border-2 ${
              isZenMode
                ? 'bg-gradient-to-br from-emerald-400 via-teal-500 to-emerald-700 shadow-emerald-600/40 border-emerald-200'
                : isDoubleScore
                ? 'bg-gradient-to-br from-yellow-300 via-amber-400 to-orange-500 shadow-yellow-500/60 border-yellow-100 animate-bounce'
                : 'bg-gradient-to-br from-amber-400 via-amber-500 to-amber-700 shadow-amber-600/40 border-amber-200'
            }`}
          >
            {isZenMode ? (
              <span className="text-3xl">🌸</span>
            ) : (
              <Trophy className={`w-8 h-8 sm:w-10 sm:h-10 ${isDoubleScore ? 'text-stone-950' : 'text-amber-950'}`} />
            )}
          </div>

          {/* Title */}
          <h2
            className={`text-2xl sm:text-3xl font-black tracking-tight drop-shadow-sm ${
              isZenMode
                ? 'text-transparent bg-clip-text bg-gradient-to-r from-emerald-200 via-teal-100 to-emerald-300'
                : isDoubleScore
                ? 'text-transparent bg-clip-text bg-gradient-to-r from-yellow-200 via-yellow-100 to-amber-300'
                : 'text-transparent bg-clip-text bg-gradient-to-r from-amber-200 via-yellow-100 to-amber-300'
            }`}
          >
            {isZenMode ? 'HOÀN THÀNH XẾP HÌNH ZEN!' : 'LẤP ĐẦY THÀNH CÔNG!'}
          </h2>
          <p className={`text-xs sm:text-sm font-medium mt-0.5 ${isZenMode ? 'text-emerald-200/80' : 'text-amber-200/80'}`}>
            {isZenMode ? (
              <span>Tập luyện thư giãn hoàn tất • <span className="text-emerald-300 font-bold">{shapeComplexity}</span></span>
            ) : (
              <>Vượt qua <span className="text-amber-300 font-bold">Màn {levelNumber}</span> ({difficultyLabel})</>
            )}
          </p>

          {/* Stars */}
          <div className="flex justify-center items-center gap-2.5 my-3">
            {[1, 2, 3].map((starIndex) => (
              <div
                key={starIndex}
                className={`transition-all duration-500 transform ${
                  starIndex <= (isZenMode ? 3 : starsCount)
                    ? isZenMode
                      ? 'scale-110 text-emerald-400 drop-shadow-[0_0_8px_rgba(52,211,153,0.8)]'
                      : 'scale-110 text-yellow-400 drop-shadow-[0_0_8px_rgba(250,204,21,0.8)]'
                    : 'text-stone-600 scale-90'
                }`}
              >
                <Star className="w-8 h-8 fill-current" />
              </div>
            ))}
          </div>
        </div>

        <div className="flex-1 overflow-y-auto custom-scrollbar px-1 py-1 space-y-3 min-h-0 relative z-10">
          {/* SPECIAL 3-WIN STREAK MULTIPLIER CELEBRATION BANNER (Visual Neon & Fireworks Feedback) */}
        {!isZenMode && (
          <div
            id="fts-win-streak-card"
            className={`rounded-2xl p-2.5 mb-3 border text-left transition-all ${
              isDoubleScore
                ? 'bg-gradient-to-r from-amber-500/30 via-yellow-500/25 to-orange-500/30 border-yellow-300/90 shadow-[0_0_24px_rgba(250,204,21,0.5)] ring-2 ring-yellow-400/40'
                : 'bg-black/40 border-amber-900/60'
            }`}
          >
            <div className="flex items-center justify-between">
              <div className="flex items-center gap-2">
                <div
                  className={`p-1.5 rounded-xl ${
                    isDoubleScore
                      ? 'bg-gradient-to-br from-yellow-300 via-amber-400 to-orange-500 text-stone-950 font-black shadow-md shadow-yellow-500/60 animate-bounce'
                      : 'bg-amber-900/40 text-amber-300'
                  }`}
                >
                  <Flame className={`w-4 h-4 ${isDoubleScore ? 'text-stone-950' : 'text-amber-400'}`} />
                </div>
                <div>
                  <div className="text-xs font-black text-amber-200 flex items-center gap-1.5">
                    <span>Chuỗi Tự Lực Không Gợi Ý:</span>
                    <span
                      className={`px-2 py-0.5 rounded-md font-black text-[11px] ${
                        isDoubleScore
                          ? 'bg-yellow-400 text-stone-950 shadow-md font-black ring-1 ring-yellow-200'
                          : 'bg-amber-950/80 text-amber-300 border border-amber-600/40'
                      }`}
                    >
                      {noHintStreak >= 3 ? `${noHintStreak} Màn (x2 ĐIỂM 🔥)` : `${noHintStreak}/3 Màn`}
                    </span>
                  </div>
                  <div className={`text-[10px] font-bold mt-0.5 ${isDoubleScore ? 'text-yellow-300 animate-pulse' : 'text-amber-300/80'}`}>
                    {isDoubleScore
                      ? '✨ PHẦN THƯỞNG NHÂN ĐÔI X2 ĐÃ KÍCH HOẠT CHO MÀN NÀY!'
                      : hintsUsedCount > 0
                      ? 'Đã dùng gợi ý ở màn này (chuỗi bắt đầu lại từ 0)'
                      : noHintStreak === 1
                      ? '⚡ Đạt 1/3 màn! Thắng thêm 2 màn không gợi ý để mở X2 điểm'
                      : noHintStreak === 2
                      ? '🔥 Đạt 2/3 màn! Chỉ còn 1 màn nữa để mở X2 điểm thưởng!'
                      : 'Hoàn thành 3 màn liên tiếp không dùng gợi ý để mở X2 điểm'}
                  </div>
                </div>
              </div>

              {/* Visual 3-Dot Progress */}
              <div className="flex items-center gap-1 shrink-0 ml-2">
                {[1, 2, 3].map((step) => {
                  const isActive = noHintStreak >= step;
                  return (
                    <div
                      key={`streak-dot-${step}`}
                      className={`w-4 h-4 rounded-full flex items-center justify-center text-[9px] font-black transition-all ${
                        isActive
                          ? isDoubleScore
                            ? 'bg-yellow-400 text-stone-950 shadow-[0_0_10px_rgba(250,204,21,0.9)] scale-110'
                            : 'bg-amber-500 text-stone-950'
                          : 'bg-stone-800 text-stone-500 border border-stone-700'
                      }`}
                    >
                      {isActive ? '✓' : step}
                    </div>
                  );
                })}
              </div>
            </div>
          </div>
        )}

        {/* Zen Mode Info Card */}
        {isZenMode && (
          <div className="bg-emerald-950/60 border border-emerald-500/40 rounded-2xl p-2.5 mb-3 text-left">
            <div className="flex items-center gap-2">
              <span className="text-base">🌸</span>
              <div>
                <div className="text-xs font-bold text-emerald-200">Không Áp Lực Thời Gian & Thang Điểm</div>
                <div className="text-[10px] text-emerald-300/70">Bạn có thể tiếp tục chơi thử thách hoặc tạo bàn Zen với kích cỡ tùy ý.</div>
              </div>
            </div>
          </div>
        )}

        {/* Next Level Teaser Banner */}
        {!isZenMode && (
          <div className="flex items-center justify-between gap-2 bg-gradient-to-r from-amber-950/90 via-[#402313] to-amber-950/90 border border-amber-500/40 rounded-xl px-3 py-2 mb-3.5 text-left shadow-md">
            <div className="flex items-center gap-2">
              <div className="p-1.5 rounded-lg bg-amber-600/30 text-amber-300">
                <Flame className="w-4 h-4 text-orange-400 animate-pulse" />
              </div>
              <div>
                <div className="text-[11px] font-black text-amber-200 flex items-center gap-1.5">
                  <span>MÀN TIẾP THEO: MÀN {levelNumber + 1}</span>
                  <span className="text-[9px] px-1.5 py-0.5 rounded bg-amber-800/80 text-amber-200 font-bold">
                    BẢNG {nextGridDim}x{nextGridDim}
                  </span>
                </div>
                <div className="text-[10px] text-amber-300/80 font-medium">
                  Kích thước mở rộng & Hình khối gạch phức tạp hơn!
                </div>
              </div>
            </div>
            <Layers className="w-4 h-4 text-amber-400/60 shrink-0" />
          </div>
        )}

        {/* Stats Grid */}
        <div
          className={`grid grid-cols-3 gap-2 border rounded-2xl p-2.5 mb-3 text-xs ${
            isZenMode
              ? 'bg-black/40 border-emerald-900/50'
              : 'bg-black/40 border-amber-900/50'
          }`}
        >
          <div className={`flex flex-col items-center justify-center p-1.5 rounded-xl ${isZenMode ? 'bg-emerald-950/30' : 'bg-amber-950/30'}`}>
            <span className={`font-medium text-[10px] ${isZenMode ? 'text-emerald-400/80' : 'text-amber-400/80'}`}>
              {isZenMode ? 'Số Khối' : 'Điểm Màn'}
            </span>
            <span className={`text-base font-black mt-0.5 ${isZenMode ? 'text-emerald-200' : 'text-amber-100'}`}>
              {isZenMode ? 'Đầy đủ' : isDoubleScore ? `+${levelScore} (X2)` : `+${levelScore}`}
            </span>
          </div>
          <div className={`flex flex-col items-center justify-center p-1.5 rounded-xl ${isZenMode ? 'bg-emerald-950/30' : 'bg-amber-950/30'}`}>
            <span className={`font-medium text-[10px] ${isZenMode ? 'text-emerald-400/80' : 'text-amber-400/80'}`}>Thời Gian</span>
            <span className={`text-base font-black mt-0.5 ${isZenMode ? 'text-emerald-200' : 'text-amber-100'}`}>{formatTime(timeTakenSeconds)}</span>
          </div>
          <div className={`flex flex-col items-center justify-center p-1.5 rounded-xl ${isZenMode ? 'bg-emerald-950/30' : 'bg-amber-950/30'}`}>
            <span className={`font-medium text-[10px] ${isZenMode ? 'text-emerald-400/80' : 'text-amber-400/80'}`}>
              {isZenMode ? 'Hoàn Tác' : 'Lùi Bước Còn'}
            </span>
            <span className="text-base font-black text-emerald-400 mt-0.5">{isZenMode ? '∞ Vô Hạn' : `${undosLeft}/3`}</span>
          </div>
        </div>

        {/* Rewards Section */}
        {!isZenMode && (
          <div className="bg-gradient-to-r from-amber-950/60 via-[#341d11]/80 to-amber-950/60 border border-amber-600/40 rounded-2xl p-3 mb-4 text-left">
            <div className="flex items-center gap-2 mb-1.5 text-xs font-bold text-amber-300 uppercase tracking-wider">
              <Gift className="w-3.5 h-3.5 text-amber-400" />
              <span>Phần Thưởng Nhận Được {isDoubleScore && '(ĐÃ X2)'}</span>
            </div>

            <div className="flex flex-wrap items-center gap-2">
              {/* Coins */}
              <div className="flex items-center gap-1 px-2.5 py-1 rounded-xl bg-amber-900/40 border border-amber-500/30 text-amber-200 text-xs font-bold shadow-inner">
                <Coins className="w-3.5 h-3.5 text-yellow-400" />
                <span>+{coinsEarned} Xu</span>
              </div>

              {/* EXP */}
              <div className="flex items-center gap-1 px-2.5 py-1 rounded-xl bg-indigo-950/50 border border-indigo-500/30 text-indigo-200 text-xs font-bold shadow-inner">
                <Zap className="w-3.5 h-3.5 text-indigo-400" />
                <span>+{expEarned} EXP</span>
              </div>

              {/* Dropped Chest */}
              {droppedChest && chestLabels[droppedChest] && (
                <div className={`flex items-center gap-1 px-2.5 py-1 rounded-xl border text-xs font-bold shadow-inner ${chestLabels[droppedChest].bg} ${chestLabels[droppedChest].color}`}>
                  <Gift className="w-3.5 h-3.5" />
                  <span>Rớt {chestLabels[droppedChest].name}!</span>
                </div>
              )}
            </div>
          </div>
        )}

        </div>

        {/* Action Buttons */}
        <div className="shrink-0 pt-3 border-t border-white/5 mt-1 flex flex-col gap-2">
          {/* Primary Next / New Level Button */}
          <button
            id="fts-btn-next-level"
            onClick={onNextLevel}
            className={`w-full flex items-center justify-center gap-2 py-3 px-6 rounded-2xl font-black text-base transition-all active:scale-[0.98] shadow-lg border ${
              isZenMode
                ? 'text-emerald-950 bg-gradient-to-r from-emerald-400 via-teal-300 to-emerald-400 hover:from-emerald-300 hover:to-teal-200 shadow-emerald-500/30 border-emerald-200'
                : 'text-amber-950 bg-gradient-to-r from-amber-400 via-yellow-400 to-amber-400 hover:from-amber-300 hover:to-yellow-300 shadow-amber-500/30 border-amber-200'
            }`}
          >
            <span>{isZenMode ? '🌸 Màn Zen Tiếp Theo' : `Tiến Vào Màn ${levelNumber + 1}`}</span>
            <ArrowRight className="w-5 h-5" />
          </button>

          {/* Secondary Buttons Row */}
          <div className="flex justify-center mt-2">
            <button
              id="fts-btn-replay-level"
              onClick={onReplayLevel}
              className={`flex items-center justify-center gap-1.5 py-2 px-6 rounded-xl font-bold text-xs transition-all active:scale-95 border ${
                isZenMode
                  ? 'text-emerald-200 bg-emerald-950/60 hover:bg-emerald-900/70 border-emerald-600/40'
                  : 'text-amber-200 bg-amber-950/60 hover:bg-amber-900/70 border-amber-600/40'
              }`}
            >
              <RotateCcw className="w-3.5 h-3.5 text-amber-400" />
              <span>Chơi Lại</span>
            </button>
          </div>
        </div>
      </div>
    </div>
  );
};
