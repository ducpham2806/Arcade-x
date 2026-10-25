import React from 'react';
import { GameMode, TurnPhase } from './types';
import { MummySprite } from '../../visuals/MummySprite';
import { Hourglass, Footprints, ShieldAlert } from 'lucide-react';

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
  isThreatCritical = false,
}) => {
  const isTimeAttack = mode === 'time_attack';
  const isTurnLimit = mode === 'turn_limit';
  const timePercent = Math.max(0, Math.min(100, (timeLeft / (timeLimitSec || 60)) * 100));
  const isTimeCritical = isTimeAttack && timeLeft <= 10;

  const currentStarPreview =
    turnsTaken <= parTurns ? 3 : turnsTaken <= parTurns + 4 ? 2 : 1;

  return (
    <div
      id="mummy-turn-indicator-component"
      className="w-full max-w-[520px] mx-auto mb-2.5 bg-gradient-to-r from-[#2c1d0e] via-[#3d2814] to-[#2c1d0e] border-2 border-[#d4a349] rounded-2xl p-2 sm:p-2.5 shadow-[0_8px_24px_rgba(0,0,0,0.65),inset_0_1px_0_rgba(254,240,138,0.3)] flex flex-col gap-1.5 relative overflow-hidden"
    >
      {/* Subtle Hieroglyphic Watermark */}
      <div className="pointer-events-none absolute right-3 top-1 text-lg text-amber-300/10 font-serif select-none">
        𓂀 𓋹 𓆣
      </div>

      {/* Primary Turn Status Banner & Canopic Jar Revert Counter */}
      <div className="flex items-center justify-between gap-2 relative z-10">
        {/* Left: Whose Turn Cartouche */}
        <div className="flex items-center gap-2.5">
          {turnPhase === 'player_turn' && (
            <div className="flex items-center gap-2.5">
              <div className="relative w-10 h-10 rounded-xl bg-gradient-to-br from-amber-500/30 to-amber-950 border-2 border-yellow-400/80 p-0.5 shadow-md">
                <MummySprite kind="explorer" />
                <div className="absolute -top-1 -right-1 w-2.5 h-2.5 bg-emerald-400 rounded-full border border-black animate-ping" />
              </div>
              <div>
                <div className="flex items-center gap-1.5">
                  <span className="text-xs sm:text-sm font-serif font-black text-yellow-200 uppercase tracking-wider drop-shadow">
                    LƯỢT THÁM HIỂM
                  </span>
                  <span className="px-1.5 py-0.2 rounded-full bg-emerald-500/25 text-emerald-200 text-[9px] font-bold border border-emerald-400/50">
                    1 Bước
                  </span>
                </div>
                <span className="text-[10px] text-amber-200/80 block">
                  {isThreatCritical ? (
                    <span className="text-rose-300 font-bold animate-pulse flex items-center gap-1">
                      <ShieldAlert className="w-3 h-3 text-rose-400 inline" /> Nguy hiểm! Xác ướp áp sát!
                    </span>
                  ) : (
                    'Chọn ô đá sáng hoặc bấm La Bàn Bọ Hung'
                  )}
                </span>
              </div>
            </div>
          )}

          {turnPhase === 'mummy_moving' && (
            <div className="flex items-center gap-2.5">
              <div className="relative w-10 h-10 rounded-xl bg-gradient-to-br from-rose-800/60 to-slate-950 border-2 border-rose-400 p-0.5 shadow-md animate-pulse">
                <MummySprite kind="red" />
              </div>
              <div>
                <div className="flex items-center gap-1.5">
                  <span className="text-xs sm:text-sm font-serif font-black text-rose-300 uppercase tracking-wider">
                    XÁC ƯỚP TRUY ĐUỔI...
                  </span>
                  <span className="px-1.5 py-0.2 rounded-full bg-rose-500/25 text-rose-200 text-[9px] font-bold border border-rose-400/50">
                    2 Bước
                  </span>
                </div>
                <span className="text-[10px] text-rose-200/80 block">
                  {mummiesAliveCount} hộ vệ lăng mộ đang di chuyển
                </span>
              </div>
            </div>
          )}

          {turnPhase === 'victory' && (
            <div className="flex items-center gap-2.5">
              <div className="w-10 h-10 rounded-xl bg-emerald-900/60 border-2 border-emerald-400 p-1 shadow-md">
                <MummySprite kind="scarab" />
              </div>
              <div>
                <span className="text-xs sm:text-sm font-serif font-black text-emerald-300 uppercase tracking-wider">
                  VƯỢT LĂNG MỘ THÀNH CÔNG!
                </span>
                <span className="text-[10px] text-emerald-200/80 block">Cầu thang Pharaoh đã mở</span>
              </div>
            </div>
          )}

          {turnPhase === 'game_over' && (
            <div className="flex items-center gap-2.5">
              <div className="w-10 h-10 rounded-xl bg-rose-950 border-2 border-rose-500 p-0.5 shadow-md">
                <MummySprite kind="white" />
              </div>
              <div>
                <span className="text-xs sm:text-sm font-serif font-black text-rose-400 uppercase tracking-wider">
                  LỜI NGUYỀN PHARAOH!
                </span>
                <span className="text-[10px] text-rose-200/80 block">Dùng Bình Canopic để quay ngược lượt</span>
              </div>
            </div>
          )}
        </div>

        {/* Right: Canopic Jars (Revert Charges) & Step Cartouche */}
        <div className="flex items-center gap-2">
          {/* Canopic Jar Revert Indicator */}
          <div
            className="flex items-center gap-1 px-2 py-1 rounded-xl bg-[#1a1007]/90 border border-[#c8963e]/60"
            title={`Còn ${revertCharges}/${maxRevertCharges} Bình Canopic Hoàn Tác Lượt`}
          >
            <div className="flex items-center -space-x-1">
              {Array.from({ length: maxRevertCharges }).map((_, idx) => (
                <div
                  key={`canopic-${idx}`}
                  className={`w-5 h-5 transition-all ${
                    idx < revertCharges
                      ? 'opacity-100 drop-shadow-[0_0_5px_rgba(250,204,21,0.8)]'
                      : 'opacity-25 grayscale'
                  }`}
                >
                  <MummySprite kind="canopic_jar" />
                </div>
              ))}
            </div>
            <span className="font-mono text-[10px] font-black text-yellow-300 ml-1">
              {revertCharges}/{maxRevertCharges}
            </span>
          </div>

          {/* Steps vs Par Star Cartouche */}
          <div className="flex items-center gap-1 bg-[#1a1007]/90 border border-[#c8963e]/60 px-2.5 py-1 rounded-xl">
            <Footprints className="w-3.5 h-3.5 text-amber-400" />
            <span className="text-xs font-mono font-black text-yellow-100">{turnsTaken}</span>
            <span className="text-[10px] text-amber-300/70 font-mono">/{parTurns}</span>
            <span className="text-xs text-yellow-400 ml-0.5">{'★'.repeat(currentStarPreview)}</span>
          </div>
        </div>
      </div>

      {/* Countdown Torch Bar for Time Attack */}
      {isTimeAttack && (
        <div className="w-full bg-[#160d05] border border-cyan-500/40 rounded-xl p-1.5 flex items-center justify-between gap-2 relative z-10">
          <div className="flex items-center gap-1.5">
            <Hourglass
              className={`w-3.5 h-3.5 ${
                isTimeCritical ? 'text-rose-500 animate-spin' : 'text-cyan-400 animate-pulse'
              }`}
            />
            <span className="text-[10px] font-bold uppercase tracking-wider text-cyan-200">
              Ngọn Đuốc Sinh Mệnh:
            </span>
          </div>
          <div className="flex-1 max-w-[180px] h-2 bg-black/70 rounded-full border border-cyan-500/30 overflow-hidden">
            <div
              className={`h-full transition-all duration-300 rounded-full ${
                isTimeCritical
                  ? 'bg-gradient-to-r from-rose-600 to-amber-500 animate-pulse'
                  : 'bg-gradient-to-r from-amber-400 via-emerald-400 to-cyan-400'
              }`}
              style={{ width: `${timePercent}%` }}
            />
          </div>
          <div className="font-mono font-black text-xs px-1.5 py-0.5 rounded bg-cyan-950 text-cyan-200 border border-cyan-500/40">
            {timeLeft}s
          </div>
        </div>
      )}

      {isTurnLimit && maxTurns && (
        <div className="w-full bg-[#160d05] border border-amber-500/40 rounded-xl p-1.5 flex items-center justify-between gap-2 relative z-10 text-[10px]">
          <span className="text-amber-200 font-bold flex items-center gap-1">
            <Footprints className="w-3 h-3 text-amber-400" />
            Số bước hành quân còn lại:
          </span>
          <span className="font-mono font-black px-2 py-0.5 rounded bg-amber-950 text-yellow-300 border border-amber-500/40">
            {Math.max(0, maxTurns - turnsTaken)} / {maxTurns}
          </span>
        </div>
      )}
    </div>
  );
};
