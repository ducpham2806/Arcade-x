import React from 'react';
import { ActiveGameEffect } from './types';
import { Sparkles } from 'lucide-react';

interface EffectBarProps {
  effects: ActiveGameEffect[];
}

export const EffectBar: React.FC<EffectBarProps> = ({ effects }) => {
  return (
    <div className="pointer-events-none select-none flex items-center justify-center w-full">
      <div className="flex items-center gap-1.5 sm:gap-2 px-3 py-1.5 rounded-2xl bg-slate-950/85 backdrop-blur-md border border-cyan-500/30 shadow-xl shadow-cyan-950/30 max-w-full overflow-x-auto no-scrollbar">
        {/* Effect Bar Header Label */}
        <div className="flex items-center gap-1 text-[10px] sm:text-[11px] font-black uppercase tracking-wider text-cyan-400 shrink-0 pr-1 border-r border-slate-800">
          <Sparkles className="w-3 h-3 text-cyan-400 animate-pulse" />
          <span className="hidden xs:inline sm:inline">Thanh Hiệu Ứng:</span>
          <span className="xs:hidden sm:hidden">Hiệu Ứng:</span>
        </div>

        {/* Empty state when no effects are active */}
        {effects.length === 0 ? (
          <div className="flex items-center gap-2 px-1 text-[10px] text-slate-500 italic">
            <span className="opacity-70">Chưa kích hoạt (Chém quả đặc biệt)</span>
            <div className="flex items-center gap-1 opacity-40">
              <span title="Đóng Băng">❄️</span>
              <span title="Bão Quả">🌪️</span>
              <span title="Cuồng Nhiệt">🔥</span>
              <span title="Hoàng Kim">⭐</span>
            </div>
          </div>
        ) : (
          /* Active Effect Icons in a single horizontal row */
          <div className="flex items-center gap-1.5 sm:gap-2 shrink-0">
            {effects.map((eff) => {
              const progressPct = Math.min(100, Math.max(0, (eff.remainingSeconds / eff.totalSeconds) * 100));

              return (
                <div
                  key={eff.id}
                  className={`relative flex items-center gap-1.5 px-2 py-1 rounded-xl border transition-all duration-200 overflow-hidden ${eff.bgColor} ${eff.borderColor} ${eff.color} shadow-md`}
                  style={{
                    boxShadow: `0 0 12px ${eff.glowColor}`,
                  }}
                >
                  {/* Glowing Icon */}
                  <span className="text-xs sm:text-sm animate-pulse shrink-0">
                    {eff.icon}
                  </span>

                  {/* Effect Name and Remaining Seconds */}
                  <div className="flex flex-col leading-none">
                    <div className="flex items-center gap-1">
                      <span className="text-[10px] sm:text-[11px] font-black tracking-tight whitespace-nowrap">
                        {eff.name}
                      </span>
                      <span className="text-[9px] sm:text-[10px] font-mono font-extrabold px-1 py-0.2 rounded bg-black/50 border border-white/10 shrink-0">
                        {eff.remainingSeconds.toFixed(1)}s
                      </span>
                    </div>
                  </div>

                  {/* Bottom Duration Progress Gauge */}
                  <div className="absolute bottom-0 left-0 right-0 h-[2.5px] bg-black/40">
                    <div
                      className="h-full transition-all duration-100 ease-linear rounded-full"
                      style={{
                        width: `${progressPct}%`,
                        backgroundColor: eff.color,
                      }}
                    />
                  </div>
                </div>
              );
            })}
          </div>
        )}
      </div>
    </div>
  );
};
