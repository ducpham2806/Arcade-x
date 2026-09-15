import React from 'react';
import { LevelTarget, GameplayType } from './types';
import { Clock, Move, Star, CheckCircle2, Zap, ShieldAlert, Gift } from 'lucide-react';
import { CandyItemIcon } from './CandyAssets';

interface TargetBarProps {
  levelId: number;
  levelName: string;
  gameplayType: GameplayType;
  score: number;
  movesLeft?: number;
  timeLeft?: number;
  stars: [number, number, number];
  targets: LevelTarget[];
  combo: number;
}

export const TargetBar: React.FC<TargetBarProps> = ({
  levelId,
  levelName,
  gameplayType,
  score,
  movesLeft,
  timeLeft,
  stars,
  targets,
  combo,
}) => {
  // Compute star progress
  const starCount = score >= stars[2]
    ? 3
    : score >= stars[1]
    ? 2
    : score >= stars[0]
    ? 1
    : 0;

  const maxStarScore = stars[2] || 5000;
  const progressPercent = Math.min(100, Math.round((score / maxStarScore) * 100));

  return (
    <div className="w-full max-w-[480px] mx-auto bg-slate-900/90 border border-slate-800 rounded-2xl p-2 sm:p-2.5 shadow-xl backdrop-blur-sm flex flex-col gap-1.5 select-none">
      {/* Top row: Level Badge, Mode Type, Moves/Time, Score */}
      <div className="flex items-center justify-between gap-1.5">
        <div className="flex items-center gap-1.5 flex-wrap">
          {/* Level number */}
          <div className="px-2.5 py-1 rounded-xl bg-indigo-500/20 border border-indigo-500/40 text-indigo-300 font-black text-xs">
            Màn {levelId}
          </div>

          {/* Gameplay Badge */}
          {gameplayType === 'time' && (
            <div className="px-2 py-0.5 rounded-lg bg-amber-500/20 border border-amber-500/40 text-amber-300 font-bold text-[11px] flex items-center gap-1">
              <Clock className="w-3 h-3 text-amber-400" />
              <span>Đua Giờ</span>
            </div>
          )}

          {gameplayType === 'rescue' && (
            <div className="px-2 py-0.5 rounded-lg bg-cyan-500/20 border border-cyan-500/40 text-cyan-300 font-bold text-[11px] flex items-center gap-1">
              <span>🧊 Cứu Gấu</span>
            </div>
          )}

          {gameplayType === 'chocolate' && (
            <div className="px-2 py-0.5 rounded-lg bg-amber-900/40 border border-amber-600/40 text-amber-300 font-bold text-[11px] flex items-center gap-1">
              <span>🍫 Chocolate</span>
            </div>
          )}

          {gameplayType === 'gift' && (
            <div className="px-2 py-0.5 rounded-lg bg-purple-500/20 border border-purple-500/40 text-purple-300 font-bold text-[11px] flex items-center gap-1">
              <Gift className="w-3 h-3 text-purple-400" />
              <span>Nơ Quà</span>
            </div>
          )}

          {gameplayType === 'boss' && (
            <div className="px-2 py-0.5 rounded-lg bg-rose-500/20 border border-rose-500/50 text-rose-300 font-black text-[11px] flex items-center gap-1 animate-pulse">
              <ShieldAlert className="w-3 h-3 text-rose-400" />
              <span>Đại Thử Thách</span>
            </div>
          )}

          {combo > 1 && (
            <div className="px-2 py-0.5 rounded-lg bg-rose-500/25 border border-rose-500/60 text-rose-300 text-xs font-black animate-bounce flex items-center gap-0.5">
              <Zap className="w-3 h-3 text-yellow-400" />
              <span>x{combo}</span>
            </div>
          )}
        </div>

        {/* Moves or Time Display */}
        {gameplayType === 'time' ? (
          <div
            className={`px-3 py-1 rounded-xl border font-black text-sm flex items-center gap-1.5 shadow-md ${
              (timeLeft ?? 0) <= 10
                ? 'bg-rose-500/20 border-rose-500/70 text-rose-300 animate-pulse'
                : 'bg-slate-950/80 border-slate-700 text-slate-200'
            }`}
          >
            <Clock className="w-3.5 h-3.5 text-amber-400" />
            <span>{Math.max(0, timeLeft ?? 0)}s</span>
          </div>
        ) : (
          <div
            className={`px-3 py-1 rounded-xl border font-black text-sm flex items-center gap-1.5 shadow-md ${
              (movesLeft ?? 0) <= 4
                ? 'bg-rose-500/20 border-rose-500/70 text-rose-300 animate-bounce'
                : 'bg-indigo-950/80 border-indigo-500/40 text-indigo-200'
            }`}
          >
            <Move className="w-3.5 h-3.5 text-indigo-400" />
            <span>{Math.max(0, movesLeft ?? 0)} lượt</span>
          </div>
        )}

        {/* Score */}
        <div className="text-right">
          <div className="text-[10px] text-slate-400 uppercase font-bold tracking-wider">Điểm</div>
          <div className="text-sm sm:text-base font-black font-mono text-cyan-300 leading-none">
            {score.toLocaleString()}
          </div>
        </div>
      </div>

      {/* Star Progress Gauge */}
      <div className="relative w-full bg-slate-950/80 h-2 rounded-full border border-slate-800 overflow-hidden flex items-center">
        <div
          className="h-full bg-gradient-to-r from-cyan-500 via-pink-500 to-amber-400 transition-all duration-300 rounded-full"
          style={{ width: `${progressPercent}%` }}
        />

        <div className="absolute inset-0 flex justify-between items-center px-4 pointer-events-none">
          <Star
            className={`w-3 h-3 drop-shadow ${
              starCount >= 1 ? 'text-amber-300 fill-amber-300 scale-125' : 'text-slate-600'
            }`}
          />
          <Star
            className={`w-3 h-3 drop-shadow ${
              starCount >= 2 ? 'text-amber-300 fill-amber-300 scale-125' : 'text-slate-600'
            }`}
          />
          <Star
            className={`w-3 h-3 drop-shadow ${
              starCount >= 3 ? 'text-amber-300 fill-amber-300 scale-125' : 'text-slate-600'
            }`}
          />
        </div>
      </div>

      {/* Targets List */}
      {targets.length > 0 && (
        <div className="flex flex-wrap items-center gap-1.5 pt-1 border-t border-slate-800/80">
          <div className="text-[10px] font-bold text-slate-400 flex items-center gap-1 mr-0.5">
            <span>Mục tiêu:</span>
          </div>

          {targets.map((tgt, idx) => {
            const isDone = tgt.current >= tgt.target;
            return (
              <div
                key={idx}
                className={`px-2 py-0.5 rounded-lg border text-xs font-bold flex items-center gap-1 transition-all ${
                  isDone
                    ? 'bg-emerald-500/20 border-emerald-500/50 text-emerald-300 line-through opacity-80'
                    : 'bg-slate-950/80 border-slate-700/80 text-slate-200'
                }`}
              >
                {/* Target Type Icon */}
                {tgt.type === 'collect_color' && tgt.color && (
                  <div className="w-4 h-4 flex items-center justify-center">
                    <CandyItemIcon color={tgt.color} />
                  </div>
                )}
                {tgt.type === 'clear_ice' && <span title="Băng Gấu Dẻo">🧊🐻</span>}
                {tgt.type === 'clear_stone' && <span title="Khối Chocolate">🍫</span>}
                {tgt.type === 'clear_chain' && <span title="Nơ Quà">🎁</span>}
                {tgt.type === 'score' && <span className="text-amber-400">⭐️</span>}

                <span>
                  {tgt.current}/{tgt.target}
                </span>

                {isDone && <CheckCircle2 className="w-3 h-3 text-emerald-400" />}
              </div>
            );
          })}
        </div>
      )}
    </div>
  );
};
