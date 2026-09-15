import React from 'react';
import { PopEffect } from './types';

interface HexVFXProps {
  effects: PopEffect[];
}

export const HexVFX: React.FC<HexVFXProps> = ({ effects }) => {
  return (
    <div className="absolute inset-0 pointer-events-none z-30 overflow-hidden">
      {/* SVG Connecting Lines for Cluster Matches */}
      <svg className="absolute inset-0 w-full h-full pointer-events-none">
        {effects
          .filter((fx) => fx.type === 'lines' && fx.lines)
          .map((fx) =>
            fx.lines?.map((line, idx) => (
              <line
                key={`${fx.id}-${idx}`}
                x1={line.x1}
                y1={line.y1}
                x2={line.x2}
                y2={line.y2}
                stroke={line.color || '#ffffff'}
                strokeWidth="5"
                strokeLinecap="round"
                className="animate-pulse"
                style={{
                  filter: `drop-shadow(0 0 8px ${line.color})`,
                  animation: 'lineVanish 0.4s ease-out forwards',
                }}
              />
            ))
          )}
      </svg>

      {/* Floating Elements */}
      {effects.map((fx) => {
        if (fx.type === 'score') {
          return (
            <div
              key={fx.id}
              className="absolute font-black font-mono text-sm sm:text-base select-none pointer-events-none transform -translate-x-1/2 -translate-y-1/2 drop-shadow-[0_2px_6px_rgba(0,0,0,0.9)]"
              style={{
                left: `${Math.max(40, Math.min(window.innerWidth - 40, fx.x))}px`,
                top: `${Math.max(40, fx.y)}px`,
                color: fx.color || '#facc15',
                textShadow: `0 0 10px ${fx.color || '#facc15'}`,
                animation: 'scoreFloat 0.75s cubic-bezier(0.2, 0.8, 0.2, 1) forwards',
              }}
            >
              {fx.text}
            </div>
          );
        }

        if (fx.type === 'combo') {
          return (
            <div
              key={fx.id}
              className="absolute left-1/2 -translate-x-1/2 pointer-events-none select-none z-40"
              style={{
                top: `${Math.max(120, fx.y - 20)}px`,
                animation: 'cleanComboBadge 1s cubic-bezier(0.175, 0.885, 0.32, 1.275) forwards',
              }}
            >
              <div className="px-4 py-1.5 rounded-2xl bg-slate-950/90 border border-white/30 backdrop-blur-md shadow-[0_0_25px_rgba(244,63,94,0.6)] flex items-center gap-2">
                <span className="text-base sm:text-lg font-black tracking-wider uppercase text-transparent bg-clip-text bg-gradient-to-r from-amber-300 via-rose-400 to-cyan-300">
                  {fx.text}
                </span>
              </div>
            </div>
          );
        }

        if (fx.type === 'invalid') {
          return (
            <div
              key={fx.id}
              className="absolute left-1/2 -translate-x-1/2 text-xs font-bold text-rose-200 bg-rose-950/90 border border-rose-500/80 rounded-full px-3 py-1 shadow-xl select-none pointer-events-none whitespace-nowrap"
              style={{
                top: `${fx.y}px`,
                animation: 'scoreFloat 0.6s ease-out forwards',
              }}
            >
              {fx.text || 'Cần ≥3 ô cùng loại kẹo!'}
            </div>
          );
        }

        if (fx.type === 'rocket') {
          return (
            <div
              key={fx.id}
              className="absolute pointer-events-none transform -translate-x-1/2 -translate-y-1/2 w-[90%] left-1/2"
              style={{
                top: `${fx.y}px`,
                height: '6px',
                background: 'linear-gradient(90deg, transparent, #38bdf8, #ffffff, #38bdf8, transparent)',
                boxShadow: '0 0 20px #38bdf8, 0 0 35px #0284c7',
                animation: 'laserSweep 0.4s ease-out forwards',
              }}
            />
          );
        }

        if (fx.type === 'rainbow') {
          return (
            <div
              key={fx.id}
              className="absolute rounded-full pointer-events-none transform -translate-x-1/2 -translate-y-1/2 left-1/2"
              style={{
                top: `${fx.y}px`,
                width: '60px',
                height: '60px',
                background: 'radial-gradient(circle, rgba(255,255,255,1) 0%, rgba(244,63,94,0.7) 40%, rgba(6,182,212,0.5) 70%, transparent 100%)',
                animation: 'rainbowNova 0.65s ease-out forwards',
              }}
            />
          );
        }

        return null;
      })}

      <style>{`
        @keyframes scoreFloat {
          0% {
            opacity: 1;
            transform: translate(-50%, -30%) scale(0.85);
          }
          50% {
            opacity: 1;
            transform: translate(-50%, -70%) scale(1.15);
          }
          100% {
            opacity: 0;
            transform: translate(-50%, -120%) scale(0.9);
          }
        }

        @keyframes cleanComboBadge {
          0% {
            opacity: 0;
            transform: scale(0.6) translateY(10px);
          }
          20% {
            opacity: 1;
            transform: scale(1.15) translateY(0);
          }
          75% {
            opacity: 1;
            transform: scale(1) translateY(-5px);
          }
          100% {
            opacity: 0;
            transform: scale(0.85) translateY(-20px);
          }
        }

        @keyframes laserSweep {
          0% {
            opacity: 0;
            transform: scaleX(0.1);
          }
          50% {
            opacity: 1;
            transform: scaleX(1);
          }
          100% {
            opacity: 0;
            transform: scaleX(1.1);
          }
        }

        @keyframes rainbowNova {
          0% {
            opacity: 1;
            transform: translate(-50%, -50%) scale(0.3);
          }
          50% {
            opacity: 0.9;
            transform: translate(-50%, -50%) scale(5);
          }
          100% {
            opacity: 0;
            transform: translate(-50%, -50%) scale(9);
          }
        }

        @keyframes lineVanish {
          0% {
            opacity: 1;
            stroke-width: 6;
          }
          70% {
            opacity: 0.8;
            stroke-width: 4;
          }
          100% {
            opacity: 0;
            stroke-width: 1;
          }
        }
      `}</style>
    </div>
  );
};
