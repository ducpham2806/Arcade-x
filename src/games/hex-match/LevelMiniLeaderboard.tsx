import React from 'react';
import { getLevelLeaderboard, LevelLeaderboardEntry } from './levelLeaderboard';
import { Trophy, Medal, Sparkles, User } from 'lucide-react';

interface LevelMiniLeaderboardProps {
  levelId: number;
  currentScore?: number;
}

export const LevelMiniLeaderboard: React.FC<LevelMiniLeaderboardProps> = ({
  levelId,
  currentScore,
}) => {
  const top3 = getLevelLeaderboard(levelId);

  const getRankBadge = (rank: number) => {
    switch (rank) {
      case 1:
        return (
          <div className="w-5 h-5 rounded-full bg-amber-400 text-slate-950 font-black text-xs flex items-center justify-center shadow-md shadow-amber-400/40">
            🥇
          </div>
        );
      case 2:
        return (
          <div className="w-5 h-5 rounded-full bg-slate-300 text-slate-950 font-black text-xs flex items-center justify-center shadow-md shadow-slate-300/30">
            🥈
          </div>
        );
      case 3:
        return (
          <div className="w-5 h-5 rounded-full bg-amber-700 text-amber-100 font-black text-xs flex items-center justify-center shadow-md shadow-amber-700/30">
            🥉
          </div>
        );
      default:
        return (
          <div className="w-5 h-5 rounded-full bg-slate-800 text-slate-400 font-black text-[10px] flex items-center justify-center">
            {rank}
          </div>
        );
    }
  };

  return (
    <div className="w-full bg-slate-950/70 border border-slate-800 rounded-2xl p-2.5 sm:p-3 select-none backdrop-blur-sm">
      <div className="flex items-center justify-between pb-2 mb-2 border-b border-slate-800/80">
        <div className="flex items-center gap-1.5 text-xs font-black text-amber-300">
          <Trophy className="w-3.5 h-3.5 text-amber-400" />
          <span>Top 3 Cao Thủ Màn {levelId}</span>
        </div>
        <span className="text-[10px] text-slate-400">BXH Màn Chơi</span>
      </div>

      <div className="space-y-1.5">
        {top3.map((entry) => {
          return (
            <div
              key={`${entry.rank}-${entry.playerName}`}
              className={`flex items-center justify-between p-1.5 sm:p-2 rounded-xl border text-xs transition-all ${
                entry.isCurrentPlayer
                  ? 'bg-amber-500/15 border-amber-500/40 text-amber-200 ring-1 ring-amber-400/30 shadow-sm'
                  : 'bg-slate-900/60 border-slate-800/60 text-slate-300'
              }`}
            >
              <div className="flex items-center gap-2 min-w-0">
                {getRankBadge(entry.rank)}
                <span className="text-sm">{entry.avatar}</span>
                <span
                  className={`truncate max-w-[110px] sm:max-w-[140px] font-bold ${
                    entry.isCurrentPlayer ? 'text-amber-300 font-black' : 'text-slate-200'
                  }`}
                >
                  {entry.playerName}
                </span>
                {entry.isCurrentPlayer && (
                  <span className="text-[9px] px-1.5 py-0.2 rounded bg-amber-400/20 text-amber-300 font-bold uppercase">
                    Bạn
                  </span>
                )}
              </div>

              <div className="font-mono font-black text-xs sm:text-sm text-cyan-300 shrink-0">
                {entry.score.toLocaleString()}
              </div>
            </div>
          );
        })}
      </div>
    </div>
  );
};
