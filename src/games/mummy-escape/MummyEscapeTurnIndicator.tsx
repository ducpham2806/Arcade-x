import React from 'react';
import { GameMode, TurnPhase } from './types';
import { Hourglass, Flame, Footprints, ShieldAlert, Sparkles, Undo2 } from 'lucide-react';

interface MummyEscapeTurnIndicatorProps {
  turnPhase: TurnPhase;
  turnsTaken: number;
  parTurns: number;
  maxTurns?: number;
  mode: GameMode;
  timeLeft: number;
  timeLimitSec?: number;
  revertCharges: number;
  maxRevertCharges: number;
  mummiesAliveCount: number;
  nearestMummyDistance?: number;
  isThreatCritical?: boolean;
}

export const MummyEscapeTurnIndicator: React.FC<MummyEscapeTurnIndicatorProps> = ({
  turnPhase,
  turnsTaken,
  parTurns,
  maxTurns,
  mode,
  timeLeft,
  timeLimitSec = 60,
  revertCharges,
  maxRevertCharges,
  mummiesAliveCount,
  nearestMummyDistance,
  isThreatCritical = false,
}) => {
  const isTimeAttack = mode === 'time_attack';
  const isTurnLimit = mode === 'turn_limit';
  const timePercent = Math.max(0, Math.min(100, (timeLeft / (timeLimitSec || 60)) * 100));
  const isTimeCritical = isTimeAttack && timeLeft <= 10;

  // Star calculation preview
  const currentStarPreview =
    turnsTaken <= parTurns ? 3 : turnsTaken <= parTurns + 4 ? 2 : 1;

  return (
    <div
      id="mummy-turn-indicator-component"
      className="w-full max-w-[480px] mx-auto mb-2 bg-[#1c140c] border-2 border-[#7d5626] rounded-2xl p-2 sm:p-2.5 shadow-xl flex flex-col gap-1.5 relative overflow-hidden"
    >
      {/* Background Ambience Glow */}
      <div
        className={`absolute inset-0 opacity-10 pointer-events-none transition-colors duration-500 ${
          turnPhase === 'player_turn'
            ? isThreatCritical
              ? 'bg-rose-600 animate-pulse'
              : 'bg-amber-400'
            : turnPhase === 'mummy_moving'
            ? 'bg-rose-600'
            : turnPhase === 'victory'
            ? 'bg-emerald-500'
            : 'bg-red-800'
        }`}
      />

      {/* Primary Turn Status Banner & Dynamic Badge */}
      <div className="flex items-center justify-between gap-2 relative z-10">
        {/* Left: Whose Turn Indicator */}
        <div className="flex items-center gap-2">
          {turnPhase === 'player_turn' && (
            <div className="flex items-center gap-2">
              <div className="relative flex items-center justify-center w-8 h-8 rounded-xl bg-gradient-to-br from-amber-400 to-yellow-600 border border-yellow-200 shadow-md shadow-amber-500/40">
                <span className="text-base">🤠</span>
                <div className="absolute -top-1 -right-1 w-2.5 h-2.5 bg-emerald-400 rounded-full border border-black animate-ping" />
              </div>
              <div>
                <div className="flex items-center gap-1.5">
                  <span className="text-xs font-black text-amber-300 uppercase tracking-wider">
                    LƯỢT CỦA BẠN
                  </span>
                  <span className="px-1.5 py-0.2 rounded-full bg-emerald-500/20 text-emerald-300 text-[9px] font-bold border border-emerald-500/40 animate-pulse">
                    Sẵn Sàng
                  </span>
                </div>
                <span className="text-[10px] text-stone-400">
                  {isThreatCritical ? (
                    <span className="text-rose-400 font-bold animate-pulse flex items-center gap-1">
                      <ShieldAlert className="w-3 h-3 text-rose-400 inline" /> Nguy Hiểm! Xác ướp đang áp sát
                    </span>
                  ) : (
                    'Chọn 1 bước đi hoặc Đứng Yên'
                  )}
                </span>
              </div>
            </div>
          )}

          {turnPhase === 'mummy_moving' && (
            <div className="flex items-center gap-2">
              <div className="relative flex items-center justify-center w-8 h-8 rounded-xl bg-gradient-to-br from-rose-700 to-slate-900 border border-rose-400 shadow-md shadow-rose-900/60 animate-pulse">
                <span className="text-base">🧟‍♂️</span>
              </div>
              <div>
                <div className="flex items-center gap-1.5">
                  <span className="text-xs font-black text-rose-400 uppercase tracking-wider">
                    XÁC ƯỚP ĐANG ĐI...
                  </span>
                  <span className="px-1.5 py-0.2 rounded-full bg-rose-500/20 text-rose-300 text-[9px] font-bold border border-rose-500/40 animate-spin">
                    ✦
                  </span>
                </div>
                <span className="text-[10px] text-rose-300/80">
                  {mummiesAliveCount} kẻ thù đang phản ứng
                </span>
              </div>
            </div>
          )}

          {turnPhase === 'victory' && (
            <div className="flex items-center gap-2">
              <div className="flex items-center justify-center w-8 h-8 rounded-xl bg-emerald-600 border border-emerald-300 text-base shadow-md">
                🎉
              </div>
              <div>
                <span className="text-xs font-black text-emerald-300 uppercase tracking-wider">
                  THOÁT HIỂM THÀNH CÔNG!
                </span>
                <span className="text-[10px] text-emerald-200/80 block">Đã an toàn tới lối ra</span>
              </div>
            </div>
          )}

          {turnPhase === 'game_over' && (
            <div className="flex items-center gap-2">
              <div className="flex items-center justify-center w-8 h-8 rounded-xl bg-rose-800 border border-rose-400 text-base shadow-md">
                💀
              </div>
              <div>
                <span className="text-xs font-black text-rose-400 uppercase tracking-wider">
                  BỊ XÁC ƯỚP BẮT GIỮ!
                </span>
                <span className="text-[10px] text-rose-300/80 block">Hãy dùng Revert Turn để thử lại</span>
              </div>
            </div>
          )}
        </div>

        {/* Right: Step Status & Revert Turn Tokens */}
        <div className="flex items-center gap-2">
          {/* Revert Charges Pill */}
          <div
            className={`flex items-center gap-1 px-2 py-1 rounded-xl border text-[10px] font-bold ${
              revertCharges > 0
                ? 'bg-amber-950/60 border-amber-500/40 text-amber-200'
                : 'bg-stone-900 border-stone-800 text-stone-500'
            }`}
            title={`Còn ${revertCharges}/${maxRevertCharges} lượt Hoàn Tác (Revert Turn) ở màn này`}
          >
            <Undo2 className="w-3 h-3 text-amber-400 shrink-0" />
            <span className="hidden sm:inline">Revert:</span>
            <div className="flex gap-0.5 items-center">
              {Array.from({ length: maxRevertCharges }).map((_, idx) => (
                <div
                  key={`charge-dot-${idx}`}
                  className={`w-1.5 h-1.5 rounded-full transition-all ${
                    idx < revertCharges
                      ? 'bg-yellow-400 shadow-[0_0_4px_rgba(250,204,21,0.8)]'
                      : 'bg-stone-700'
                  }`}
                />
              ))}
            </div>
            <span className="font-mono text-[9px] text-amber-300">
              {revertCharges}/{maxRevertCharges}
            </span>
          </div>

          {/* Turns vs Par Star Indicator */}
          <div className="flex items-center gap-1 bg-black/40 border border-white/10 px-2 py-1 rounded-xl">
            <Footprints className="w-3 h-3 text-amber-400" />
            <span className="text-[11px] font-mono font-black text-white">
              {turnsTaken}
            </span>
            <span className="text-[9px] text-stone-400 font-mono">/ {parTurns}p</span>
            <span className="text-[10px] text-yellow-400 ml-0.5">
              {'★'.repeat(currentStarPreview)}
            </span>
          </div>
        </div>
      </div>

      {/* Bottom Sub-Bar: Countdown Timer (for Time Attack) or Turn Limit Progress */}
      {isTimeAttack && (
        <div className="w-full bg-[#120b06] border border-cyan-500/30 rounded-xl p-1.5 flex items-center justify-between gap-2 relative overflow-hidden z-10">
          <div className="flex items-center gap-1.5">
            <Hourglass
              className={`w-3.5 h-3.5 ${
                isTimeCritical ? 'text-rose-500 animate-spin' : 'text-cyan-400 animate-pulse'
              }`}
            />
            <span className="text-[10px] font-bold uppercase tracking-wider text-cyan-200">
              Ngọn Đuốc Thời Gian:
            </span>
          </div>

          {/* Time Progress Bar */}
          <div className="flex-1 max-w-[160px] h-2 bg-black/60 rounded-full border border-cyan-500/30 overflow-hidden relative">
            <div
              className={`h-full transition-all duration-300 rounded-full ${
                isTimeCritical
                  ? 'bg-gradient-to-r from-rose-600 to-amber-500 animate-pulse'
                  : 'bg-gradient-to-r from-cyan-500 to-teal-400'
              }`}
              style={{ width: `${timePercent}%` }}
            />
          </div>

          <div
            className={`font-mono font-black text-xs px-1.5 py-0.5 rounded ${
              isTimeCritical
                ? 'bg-rose-950 text-rose-300 border border-rose-500 animate-bounce'
                : 'bg-cyan-950 text-cyan-300 border border-cyan-500/40'
            }`}
          >
            {timeLeft}s
          </div>
        </div>
      )}

      {isTurnLimit && maxTurns && (
        <div className="w-full bg-[#120b06] border border-amber-500/30 rounded-xl p-1.5 flex items-center justify-between gap-2 relative overflow-hidden z-10 text-[10px]">
          <span className="text-amber-200 font-bold flex items-center gap-1">
            <Footprints className="w-3 h-3 text-amber-400" />
            Giới hạn số bước còn lại:
          </span>
          <span
            className={`font-mono font-black px-1.5 py-0.5 rounded ${
              maxTurns - turnsTaken <= 3
                ? 'bg-rose-950 text-rose-300 border border-rose-500 animate-pulse'
                : 'bg-amber-950 text-amber-300 border border-amber-500/40'
            }`}
          >
            {Math.max(0, maxTurns - turnsTaken)} / {maxTurns}
          </span>
        </div>
      )}
    </div>
  );
};

