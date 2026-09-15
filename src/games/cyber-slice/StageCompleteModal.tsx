import React from 'react';
import { StageConfig, StageObjective } from './types';
import { Star, Trophy, RotateCcw, ChevronRight, CheckCircle2, XCircle, Home, Coins, Swords } from 'lucide-react';

interface StageCompleteModalProps {
  isVictory: boolean;
  stage?: StageConfig;
  score: number;
  stars: number;
  objectives?: StageObjective[];
  coinsEarned: number;
  mode?: 'stage' | 'boss_rush';
  bossDefeatedCount?: number;
  currentBossName?: string;
  onNextStage?: () => void;
  onRetry: () => void;
  onStageSelect?: () => void;
  onBackToMenu: () => void;
}

export const StageCompleteModal: React.FC<StageCompleteModalProps> = ({
  isVictory,
  stage,
  score,
  stars,
  objectives,
  coinsEarned,
  mode = 'stage',
  bossDefeatedCount = 0,
  currentBossName,
  onNextStage,
  onRetry,
  onStageSelect,
  onBackToMenu,
}) => {
  const isBossRush = mode === 'boss_rush';

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-black/85 backdrop-blur-md animate-fade-in select-none">
      <div className="relative w-full max-w-sm sm:max-w-md bg-slate-900 border border-slate-700 rounded-3xl p-5 sm:p-6 shadow-2xl flex flex-col items-center text-center space-y-4">
        {/* Banner / Title */}
        <div>
          <div className="text-[11px] font-extrabold text-slate-400 uppercase tracking-wider mb-1 flex items-center justify-center gap-1.5">
            {isBossRush ? (
              <>
                <Swords className="w-3.5 h-3.5 text-rose-400" />
                <span>CHẾ ĐỘ ĐẠI CHIẾN TRÙM (BOSS RUSH)</span>
              </>
            ) : (
              <span>Màn {stage?.id}: {stage?.name}</span>
            )}
          </div>
          <h2
            className={`text-xl sm:text-2xl font-black ${
              isVictory
                ? 'bg-gradient-to-r from-amber-300 via-yellow-200 to-amber-400 bg-clip-text text-transparent'
                : 'text-rose-400'
            }`}
          >
            {isVictory
              ? isBossRush
                ? '🏆 PHÁ ĐẢO BOSS RUSH!'
                : '🎉 CHIẾN THẮNG HOÀN THÀNH!'
              : isBossRush
              ? `💥 GỤC NGÃ TRƯỚC ${currentBossName || 'TRÙM'}!`
              : '💥 CHƯA ĐẠT MỤC TIÊU!'}
          </h2>
          {isBossRush && !isVictory && (
            <p className="text-xs text-slate-400 mt-1">
              Hết thời gian hoặc cạn sinh lực! Hãy rèn luyện thêm kiếm thuật và quay lại phục thù!
            </p>
          )}
        </div>

        {/* Stars (If Victory) */}
        {isVictory && (
          <div className="flex items-center justify-center gap-2 py-1">
            {[1, 2, 3].map((starNum) => (
              <div
                key={starNum}
                className={`p-2 rounded-2xl border transition-all duration-300 ${
                  stars >= starNum
                    ? 'bg-amber-500/20 border-amber-400 scale-110 shadow-lg shadow-amber-500/30'
                    : 'bg-slate-950/40 border-slate-800 opacity-40'
                }`}
              >
                <Star
                  className={`w-7 h-7 sm:w-8 sm:h-8 ${
                    stars >= starNum ? 'text-amber-400 fill-amber-400 animate-pulse' : 'text-slate-600'
                  }`}
                />
              </div>
            ))}
          </div>
        )}

        {/* Score & Coins Earned */}
        <div className="w-full flex items-center justify-around py-3 px-4 rounded-2xl bg-slate-950/70 border border-slate-800">
          <div>
            <div className="text-[10px] text-slate-400 font-bold uppercase">Điểm Đạt Được</div>
            <div className="text-lg sm:text-xl font-black font-mono text-cyan-300">
              {score.toLocaleString()}
            </div>
          </div>

          {isVictory && coinsEarned > 0 && (
            <div className="border-l border-slate-800 pl-4">
              <div className="text-[10px] text-slate-400 font-bold uppercase">Thưởng Xu</div>
              <div className="text-lg sm:text-xl font-black font-mono text-amber-400 flex items-center gap-1">
                <Coins className="w-4 h-4 text-amber-400" />
                <span>+{coinsEarned}</span>
              </div>
            </div>
          )}
        </div>

        {/* Boss Rush Progress or Stage Objectives Checklist */}
        {isBossRush ? (
          <div className="w-full text-left p-3.5 rounded-2xl bg-slate-950/50 border border-slate-800/80 space-y-2">
            <div className="text-xs font-black text-rose-400 flex items-center gap-1.5">
              <Swords className="w-4 h-4 text-rose-400" />
              <span>TIẾN TRÌNH TRẢM TRÙM (3 PHASES):</span>
            </div>
            <div className="space-y-1.5">
              {[
                { phase: 1, name: 'Hắc Long Dưa Hấu', icon: '🐲🍉' },
                { phase: 2, name: 'Cơ Khí Đại Bát Khóm', icon: '🤖🍍' },
                { phase: 3, name: 'Ma Vương Dừa Xiêm Cực Quang', icon: '👑🥥' },
              ].map((b) => {
                const isCleared = bossDefeatedCount >= b.phase;
                return (
                  <div key={b.phase} className="flex items-center justify-between text-xs text-slate-200">
                    <span className="flex items-center gap-1.5">
                      {isCleared ? (
                        <CheckCircle2 className="w-4 h-4 text-emerald-400 shrink-0" />
                      ) : (
                        <XCircle className="w-4 h-4 text-slate-600 shrink-0" />
                      )}
                      <span>
                        {b.icon} Tầng {b.phase}: {b.name}
                      </span>
                    </span>
                    <span
                      className={`font-mono font-bold text-[11px] ${
                        isCleared ? 'text-emerald-400' : 'text-slate-500'
                      }`}
                    >
                      {isCleared ? 'ĐÃ TRẢM' : 'CHƯA ĐẠT'}
                    </span>
                  </div>
                );
              })}
            </div>
          </div>
        ) : (
          objectives && objectives.length > 0 && (
            <div className="w-full text-left p-3.5 rounded-2xl bg-slate-950/50 border border-slate-800/80 space-y-2">
              <div className="text-xs font-black text-slate-300 flex items-center gap-1.5">
                <Trophy className="w-4 h-4 text-amber-400" />
                <span>KẾT QUẢ MỤC TIÊU (OBJECTIVES):</span>
              </div>

              <div className="space-y-1.5">
                {objectives.map((obj, i) => {
                  const isMet = obj.current >= obj.target;
                  return (
                    <div key={i} className="flex items-center justify-between text-xs text-slate-200">
                      <span className="flex items-center gap-1.5">
                        {isMet ? (
                          <CheckCircle2 className="w-4 h-4 text-emerald-400 shrink-0" />
                        ) : (
                          <XCircle className="w-4 h-4 text-rose-400 shrink-0" />
                        )}
                        <span>
                          {obj.icon} {obj.label}
                        </span>
                      </span>
                      <span
                        className={`font-mono font-bold ${
                          isMet ? 'text-emerald-400' : 'text-slate-400'
                        }`}
                      >
                        {obj.current} / {obj.target}
                      </span>
                    </div>
                  );
                })}
              </div>
            </div>
          )
        )}

        {/* Actions Buttons */}
        <div className="w-full flex flex-col gap-2 pt-2">
          {isVictory && onNextStage && !isBossRush && (
            <button
              type="button"
              onClick={onNextStage}
              className="w-full py-3 rounded-2xl bg-gradient-to-r from-amber-400 via-rose-500 to-amber-500 hover:from-amber-300 hover:to-rose-400 text-slate-950 font-black text-sm flex items-center justify-center gap-2 shadow-lg shadow-amber-500/25 active:scale-95 transition-all cursor-pointer"
            >
              <span>Màn Kế Tiếp</span>
              <ChevronRight className="w-4 h-4" />
            </button>
          )}

          <div className="flex items-center gap-2">
            <button
              type="button"
              onClick={onRetry}
              className="flex-1 py-2.5 rounded-xl bg-slate-800 hover:bg-slate-700 text-white font-bold text-xs flex items-center justify-center gap-1.5 transition-all cursor-pointer"
            >
              <RotateCcw className="w-4 h-4" />
              <span>Chơi Lại</span>
            </button>

            {!isBossRush && onStageSelect && (
              <button
                type="button"
                onClick={onStageSelect}
                className="flex-1 py-2.5 rounded-xl bg-slate-800 hover:bg-slate-700 text-slate-300 font-bold text-xs flex items-center justify-center gap-1.5 transition-all cursor-pointer"
              >
                <Trophy className="w-4 h-4 text-amber-400" />
                <span>Chọn Màn</span>
              </button>
            )}

            <button
              type="button"
              onClick={onBackToMenu}
              className="p-2.5 rounded-xl bg-slate-800 hover:bg-slate-700 text-slate-400 hover:text-white transition-all cursor-pointer"
              title="Về Menu"
            >
              <Home className="w-4 h-4" />
            </button>
          </div>
        </div>
      </div>
    </div>
  );
};
