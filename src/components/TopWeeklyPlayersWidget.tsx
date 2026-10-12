import React, { useState, useEffect } from 'react';
import { WeeklyTopPlayer } from '../types';
import { SupabaseService } from '../services/supabase';
import { useGame } from '../context/GameContext';
import { usePlayer } from '../context/PlayerContext';
import { Trophy, Crown, Medal, Flame, ChevronRight, Radio, Sparkles } from 'lucide-react';
import { PlayerAvatar } from './common/PlayerAvatar';

export const TopWeeklyPlayersWidget: React.FC = () => {
  const { setActiveModal } = useGame();
  const { profile } = usePlayer();
  const [players, setPlayers] = useState<WeeklyTopPlayer[]>([]);
  const [isLoading, setIsLoading] = useState<boolean>(true);

  useEffect(() => {
    setIsLoading(true);
    const unsubscribe = SupabaseService.subscribeToWeeklyTopPlayers((topList) => {
      setPlayers(topList);
      setIsLoading(false);
    });

    return () => {
      if (typeof unsubscribe === 'function') {
        unsubscribe();
      }
    };
  }, [profile.stats.totalScore, profile.username]);

  const currentPlayerRank = players.find(p => p.playerName === profile.username)?.rank || null;
  const userTotalScore = profile.stats.totalScore || Object.values(profile.stats.highScores).reduce((a, b) => a + b, 0);

  return (
    <div className="relative rounded-2xl bg-gradient-to-br from-[#121218] via-[#101014] to-[#0c0c10] border border-indigo-500/20 p-5 shadow-2xl overflow-hidden flex flex-col justify-between group">
      {/* Background neon ambient highlight */}
      <div className="absolute top-0 right-0 -mr-16 -mt-16 w-48 h-48 bg-indigo-600/10 rounded-full blur-3xl pointer-events-none" />
      <div className="absolute bottom-0 left-0 -ml-16 -mb-16 w-48 h-48 bg-amber-500/5 rounded-full blur-3xl pointer-events-none" />

      <div>
        {/* Header */}
        <div className="flex items-center justify-between gap-3 mb-3 pb-2.5 border-b border-white/5">
          <div className="flex items-center gap-2">
            <div className="w-7 h-7 rounded-xl bg-amber-500/20 border border-amber-500/40 flex items-center justify-center text-amber-400 shadow-md" title="Top Cao Thủ Tuần (Live Cloud)">
              <Crown className="w-4 h-4" />
            </div>
            <span className="w-2 h-2 rounded-full bg-emerald-400 animate-pulse" title="Live Cloud Sync" />
          </div>

          <button
            id="btn-open-full-leaderboard"
            type="button"
            onClick={() => setActiveModal('leaderboard')}
            className="p-1.5 rounded-lg bg-white/5 hover:bg-white/10 text-indigo-400 hover:text-indigo-300 border border-white/5 active:scale-95 transition-all cursor-pointer flex items-center justify-center"
            title="Mở Bảng Xếp Hạng Đầy Đủ"
          >
            <Trophy className="w-4 h-4 text-indigo-400" />
          </button>
        </div>

        {/* Players List */}
        <div className="space-y-2 mb-3">
          {isLoading && players.length === 0 ? (
            <div className="py-6 text-center text-xs text-slate-500 flex flex-col items-center gap-2">
              <div className="w-5 h-5 border-2 border-indigo-500 border-t-transparent rounded-full animate-spin" />
            </div>
          ) : (
            players.slice(0, 5).map((player, idx) => {
              const isUser = player.isCurrentPlayer || player.playerName === profile.username;
              const rank = idx + 1;

              // Rank styling
              let rankBadge = (
                <span className="w-6 h-6 rounded-lg bg-white/5 text-slate-400 text-xs font-bold font-mono flex items-center justify-center border border-white/5">
                  {rank}
                </span>
              );

              if (rank === 1) {
                rankBadge = (
                  <span className="w-6 h-6 rounded-lg bg-amber-500/20 text-amber-300 text-xs font-black font-mono flex items-center justify-center border border-amber-500/40 shadow-sm shadow-amber-500/20">
                    🥇
                  </span>
                );
              } else if (rank === 2) {
                rankBadge = (
                  <span className="w-6 h-6 rounded-lg bg-slate-300/20 text-slate-200 text-xs font-black font-mono flex items-center justify-center border border-slate-300/30">
                    🥈
                  </span>
                );
              } else if (rank === 3) {
                rankBadge = (
                  <span className="w-6 h-6 rounded-lg bg-amber-800/30 text-amber-400 text-xs font-black font-mono flex items-center justify-center border border-amber-700/40">
                    🥉
                  </span>
                );
              }

              return (
                <div
                  key={`${player.playerName}-${idx}`}
                  className={`flex items-center justify-between p-2 rounded-xl transition-all ${
                    isUser
                      ? 'bg-indigo-950/50 border border-indigo-500/40 shadow-md shadow-indigo-500/10'
                      : 'bg-white/[0.02] hover:bg-white/[0.05] border border-white/5'
                  }`}
                >
                  <div className="flex items-center gap-2 min-w-0">
                    {rankBadge}
                    <div className="relative">
                      <PlayerAvatar avatar={player.avatar} playerName={player.playerName} forceTop10={true} size="sm" />
                      {player.level && (
                        <span className="absolute -bottom-1 -right-1 text-[8px] font-bold px-1 rounded-sm bg-indigo-950 text-indigo-300 border border-indigo-500/30 z-40">
                          Lv.{player.level}
                        </span>
                      )}
                    </div>
                    <div className="min-w-0">
                      <div className="flex items-center gap-1">
                        <span className={`text-xs font-bold truncate ${isUser ? 'text-indigo-300' : 'text-slate-200'}`}>
                          {player.playerName}
                        </span>
                        {isUser && (
                          <span className="text-[9px] font-bold px-1 rounded bg-indigo-500 text-white shrink-0" title="Tài Khoản Của Bạn">
                            ⭐
                          </span>
                        )}
                      </div>
                      <span className="text-[10px] text-slate-500 block truncate">
                        {player.title || player.bestGameTitle || 'Game Thủ'}
                      </span>
                    </div>
                  </div>

                  <div className="text-right pl-2 shrink-0">
                    <span className="text-xs font-extrabold font-mono text-amber-400 block">
                      {(player.totalScore || 0).toLocaleString()}
                    </span>
                  </div>
                </div>
              );
            })
          )}
        </div>
      </div>

      {/* User's Current Weekly Standing Footer Card */}
      <div className="pt-2.5 border-t border-white/5 flex items-center justify-between gap-2 text-xs bg-[#0a0a0e]/60 rounded-xl p-2 border border-white/5">
        <div className="flex items-center gap-2 min-w-0">
          <div className="w-6 h-6 rounded-lg bg-indigo-600/30 border border-indigo-500/40 flex items-center justify-center text-xs">
            {profile.avatar}
          </div>
          <span className="text-xs font-bold text-white font-mono">
            {currentPlayerRank ? `#${currentPlayerRank}` : 'Top 100'}
          </span>
        </div>

        <div className="text-right shrink-0">
          <span className="text-xs font-mono font-bold text-indigo-300">
            {(userTotalScore || 0).toLocaleString()} pts
          </span>
        </div>
      </div>
    </div>
  );
};
