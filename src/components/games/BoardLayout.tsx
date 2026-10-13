import { PlayerAvatar } from '../../visuals/PlayerAvatar';
import React, { ReactNode } from 'react';
import { Timer } from 'lucide-react';

export interface PlayerInfo {
  name: string;
  avatar: ReactNode;
  elo?: number;
  isTurn: boolean;
  timeLeft?: number;
  statusText?: string;
  capturedPieces?: ReactNode;
  materialAdvantage?: string | number;
  isOnline?: boolean;
  colorTheme?: 'emerald' | 'amber' | 'rose' | 'indigo' | 'blue' | 'cyan';
  symbolMarker?: ReactNode;
}

interface PlayerCardProps {
  player: PlayerInfo;
  isTop?: boolean;
}

const colorMap = {
  emerald: {
    border: 'border-emerald-500/50',
    shadow: 'shadow-emerald-900/20',
    bgBadge: 'bg-emerald-500',
    textHighlight: 'text-emerald-400',
    timerBg: 'border-emerald-500/30',
  },
  amber: {
    border: 'border-amber-400/50',
    shadow: 'shadow-amber-900/20',
    bgBadge: 'bg-amber-500',
    textHighlight: 'text-amber-400',
    timerBg: 'border-amber-500/30',
  },
  rose: {
    border: 'border-rose-400/50',
    shadow: 'shadow-rose-900/20',
    bgBadge: 'bg-rose-500',
    textHighlight: 'text-rose-400',
    timerBg: 'border-rose-500/30',
  },
  indigo: {
    border: 'border-indigo-400/50',
    shadow: 'shadow-indigo-900/20',
    bgBadge: 'bg-indigo-500',
    textHighlight: 'text-indigo-400',
    timerBg: 'border-indigo-500/30',
  },
  blue: {
    border: 'border-blue-400/50',
    shadow: 'shadow-blue-900/20',
    bgBadge: 'bg-blue-500',
    textHighlight: 'text-blue-400',
    timerBg: 'border-blue-500/30',
  },
  cyan: {
    border: 'border-cyan-400/50',
    shadow: 'shadow-cyan-900/20',
    bgBadge: 'bg-cyan-500',
    textHighlight: 'text-cyan-400',
    timerBg: 'border-cyan-500/30',
  }
};

export const PlayerCard = ({ player, isTop }: PlayerCardProps) => {
  const theme = colorMap[player.colorTheme || 'amber'];
  const isActive = player.isTurn;

  return (
    <div className={`w-full flex flex-col justify-between items-stretch bg-slate-900/60 backdrop-blur-md border rounded-xl sm:rounded-2xl p-2 sm:p-3 shadow-lg transition-colors ${isActive ? `${theme.border} ${theme.shadow}` : 'border-slate-800/80'}`}>
      {/* 
        Use CSS Grid for perfect alignment of Avatar, Info (name/elo), and Right Side (timer/captured)
      */}
      <div className="grid grid-cols-[auto_1fr_auto] gap-2.5 items-center">
        {/* Avatar */}
        <div className="relative">
          {typeof player.avatar === 'string' && player.avatar.startsWith('http') ? (
            <PlayerAvatar src={player.avatar} name={player.name}/>
          ) : (
            <div className="w-10 h-10 sm:w-12 sm:h-12 rounded-lg bg-slate-800 border-2 border-slate-700 flex items-center justify-center text-xl sm:text-2xl shadow-sm">
              {player.avatar}
            </div>
          )}
          {player.isOnline !== undefined && (
            <span className={`absolute -bottom-1 -right-1 w-3.5 h-3.5 rounded-full border-2 border-slate-900 ${player.isOnline ? 'bg-emerald-500' : 'bg-rose-500'}`} />
          )}
          {player.symbolMarker && (
            <span className="absolute -top-2 -left-2 w-5 h-5 rounded-full bg-slate-800 border border-slate-600 text-[10px] flex items-center justify-center shadow-md">
              {player.symbolMarker}
            </span>
          )}
        </div>

        {/* Info */}
        <div className="flex flex-col justify-center overflow-hidden">
          <div className="font-bold text-sm sm:text-base text-slate-100 leading-tight truncate">
            {player.name}
          </div>
          <div className="text-[10px] sm:text-xs text-slate-400 flex items-center gap-1 mt-0.5 truncate">
            {player.elo !== undefined && (
              <span className="font-mono bg-slate-800 px-1.5 py-0.5 rounded text-amber-300">
                {player.elo}
              </span>
            )}
            {isActive && player.statusText && (
              <span className={`${theme.textHighlight} animate-pulse ml-1 font-semibold text-[10px] uppercase truncate`}>
                {player.statusText}
              </span>
            )}
          </div>
        </div>

        {/* Right side: Timer & Captured */}
        <div className="flex flex-col items-end justify-center gap-1.5">
          {isActive && player.timeLeft !== undefined && (
            <div className={`flex items-center gap-1 font-mono font-bold text-sm px-2 py-0.5 rounded-md border ${player.timeLeft <= 10 ? 'bg-rose-950/80 text-rose-400 border-rose-500/50 animate-pulse' : `bg-slate-800 ${theme.textHighlight} ${theme.timerBg}`}`}>
              <Timer className="w-3.5 h-3.5" />
              {player.timeLeft}s
            </div>
          )}
          
          {(player.capturedPieces || player.materialAdvantage !== undefined) && (
            <div className="flex items-center h-6 overflow-hidden rounded bg-slate-950/40 px-1 border border-slate-800/50 max-w-[120px] sm:max-w-none">
              {player.capturedPieces && (
                <div className="flex text-lg sm:text-xl leading-none tracking-tighter text-slate-300">
                  {player.capturedPieces}
                </div>
              )}
              {player.materialAdvantage !== undefined && player.materialAdvantage !== 0 && (
                <span className="text-[10px] font-bold text-slate-400 ml-1.5 mr-1">
                  {player.materialAdvantage}
                </span>
              )}
            </div>
          )}
        </div>
      </div>
    </div>
  );
};

export interface BoardLayoutProps {
  header: ReactNode;
  topPlayer?: PlayerInfo;
  bottomPlayer?: PlayerInfo;
  board: ReactNode;
  controls?: ReactNode;
  history?: ReactNode;
}

export const BoardLayout = ({ header, topPlayer, bottomPlayer, board, controls, history }: BoardLayoutProps) => {
  return (
    <div className="w-full max-w-5xl mx-auto flex flex-col md:flex-row items-start justify-center gap-4 sm:gap-6 md:gap-8 z-10 w-full">
      {/* Main Board Column */}
      <main className="w-full max-w-[480px] mx-auto flex flex-col items-center justify-center gap-2 sm:gap-3">
        {header}
        
        {topPlayer && <PlayerCard player={topPlayer} isTop={true} />}
        
        <div className="relative flex flex-col items-center justify-center w-full my-1 sm:my-2">
          {board}
        </div>
        
        {bottomPlayer && <PlayerCard player={bottomPlayer} isTop={false} />}
        
        {controls && (
          <div className="w-full mt-2">
            {controls}
          </div>
        )}
      </main>

      {/* History / Sidebar Column */}
      {history && (
        <aside className="w-full max-w-[480px] md:max-w-[320px] mx-auto md:mx-0 flex flex-col md:sticky md:top-6 md:h-[600px]">
          {history}
        </aside>
      )}
    </div>
  );
};

