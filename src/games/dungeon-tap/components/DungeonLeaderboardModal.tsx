import React, { useState, useEffect } from 'react';
import { AppModal } from '../../../components/common/AppModal';
import { Trophy, Flame, Crown, RefreshCw, X, Shield, Calendar, Sparkles } from 'lucide-react';
import { LeaderboardEntry } from '../../../types';
import { SupabaseService } from '../../../services/supabase';
import { StorageService } from '../../../services/storage';
import { formatNumber } from '../utils/upgradeMath';

interface DungeonLeaderboardModalProps {
  isOpen: boolean;
  onClose: () => void;
  maxStageReached: number;
  currentStage: number;
  bossesSlain: number;
  monstersSlain: number;
  playerName: string;
  playerAvatar: string;
  playerTitle: string;
  onRefreshScore?: () => void;
}

export const DungeonLeaderboardModal: React.FC<DungeonLeaderboardModalProps> = ({
  isOpen,
  onClose,
  maxStageReached,
  bossesSlain,
  monstersSlain,
  playerName,
  playerAvatar,
  playerTitle,
  onRefreshScore,
}) => {
  const [filterMode, setFilterMode] = useState<'all_time' | 'daily'>('all_time');
  const [liveEntries, setLiveEntries] = useState<LeaderboardEntry[]>([]);
  const [isLoading, setIsLoading] = useState<boolean>(true);
  const [isSyncing, setIsSyncing] = useState<boolean>(false);

  // Subscribe to real-time Supabase leaderboard for Dungeon Titan ('dungeon-tap')
  useEffect(() => {
    if (!isOpen) return;

    setIsLoading(true);
    let unsubscribe: () => void;

    if (filterMode === 'daily') {
      const todayKey = StorageService.getTodayDateString();
      unsubscribe = SupabaseService.subscribeToDailyLeaderboard(
        'dungeon-tap',
        todayKey,
        (entries) => {
          setLiveEntries(entries);
          setIsLoading(false);
        },
        50
      );
    } else {
      unsubscribe = SupabaseService.subscribeToGameLeaderboard(
        'dungeon-tap',
        (entries) => {
          setLiveEntries(entries);
          setIsLoading(false);
        },
        50
      );
    }

    return () => {
      if (unsubscribe) unsubscribe();
    };
  }, [isOpen, filterMode]);

  if (!isOpen) return null;

  // Find player's position in the current leaderboard list
  const userRankIndex = liveEntries.findIndex(
    (e) => e.playerName.toLowerCase() === (playerName || '').toLowerCase()
  );
  const topScore = liveEntries.length > 0 ? liveEntries[0].score : maxStageReached;
  const userRank = userRankIndex >= 0 ? userRankIndex + 1 : null;
  const floorGapToLeader = topScore > maxStageReached ? topScore - maxStageReached : 0;

  const handleManualSync = async () => {
    setIsSyncing(true);
    try {
      if (onRefreshScore) {
        onRefreshScore();
      }
      await SupabaseService.submitLeaderboardScore(
        'dungeon-tap',
        playerName,
        maxStageReached,
        playerAvatar,
        playerTitle,
        {
          maxFloor: maxStageReached,
          bossesSlain,
          monstersSlain,
        }
      );
    } catch (e) {
      console.error('Error syncing score to Supabase leaderboard:', e);
    } finally {
      setTimeout(() => setIsSyncing(false), 600);
    }
  };

  return (
    <AppModal
      bare
      onClose={onClose}
      label="Bảng xếp hạng Dungeon"
      closeOnBackdrop={false}
      className="bg-slate-950 border border-amber-500/40 shadow-2xl text-slate-100"
    >
        {/* Modal Header */}
        <div className="flex items-center justify-between p-3.5 sm:p-4 border-b border-white/10 bg-gradient-to-r from-amber-950/60 via-slate-900/90 to-purple-950/60">
          <div className="flex items-center gap-2.5">
            <div className="w-9 h-9 rounded-2xl bg-amber-500/20 border border-amber-400/50 flex items-center justify-center shadow-lg shadow-amber-500/10">
              <Trophy className="w-5 h-5 text-amber-400" />
            </div>
            <div>
              <div className="flex items-center gap-2">
                <h3 className="text-sm sm:text-base font-black text-amber-300 tracking-wide uppercase">
                  Bảng Xếp Hạng Tầng
                </h3>
                <span className="flex items-center gap-1 text-[10px] font-bold text-emerald-400 bg-emerald-950/80 border border-emerald-500/40 px-2 py-0.5 rounded-full animate-pulse">
                  <span className="w-1.5 h-1.5 rounded-full bg-emerald-400" />
                  <span>Trực Tiếp</span>
                </span>
              </div>
              <p className="text-[11px] text-slate-400">
                Xếp hạng cao thủ theo số Tầng Hầm Ngục cao nhất đã vượt qua
              </p>
            </div>
          </div>

          <button
            onClick={onClose}
            className="p-1.5 rounded-xl bg-slate-900/80 hover:bg-slate-800 text-slate-400 hover:text-white border border-white/10 transition-all cursor-pointer"
            title="Đóng"
          >
            <X className="w-5 h-5" />
          </button>
        </div>

        {/* Filter Tabs & Sync Action */}
        <div className="p-3 bg-slate-900/60 border-b border-white/5 flex items-center justify-between gap-2">
          <div className="flex items-center gap-1 bg-slate-950 p-1 rounded-xl border border-white/5">
            <button
              onClick={() => setFilterMode('all_time')}
              className={`px-3 py-1 rounded-lg text-xs font-bold transition-all flex items-center gap-1.5 ${
                filterMode === 'all_time'
                  ? 'bg-amber-500 text-slate-950 shadow-md shadow-amber-500/20'
                  : 'text-slate-400 hover:text-slate-200'
              }`}
            >
              <Crown className="w-3.5 h-3.5" />
              <span>Kỷ Lục Toàn Thời Gian</span>
            </button>

            <button
              onClick={() => setFilterMode('daily')}
              className={`px-3 py-1 rounded-lg text-xs font-bold transition-all flex items-center gap-1.5 ${
                filterMode === 'daily'
                  ? 'bg-amber-500 text-slate-950 shadow-md shadow-amber-500/20'
                  : 'text-slate-400 hover:text-slate-200'
              }`}
            >
              <Calendar className="w-3.5 h-3.5" />
              <span>Hôm Nay (24h)</span>
            </button>
          </div>

          <button
            onClick={handleManualSync}
            disabled={isSyncing}
            className="p-1.5 px-2.5 rounded-xl bg-slate-800 hover:bg-slate-700 text-amber-300 border border-amber-500/30 text-xs font-bold flex items-center gap-1.5 active:scale-95 transition-all cursor-pointer shrink-0 disabled:opacity-50"
            title="Đồng bộ kỷ lục tầng hiện tại lên máy chủ"
          >
            <RefreshCw className={`w-3.5 h-3.5 ${isSyncing ? 'animate-spin' : ''}`} />
            <span className="hidden sm:inline">Cập Nhật</span>
          </button>
        </div>

        {/* Current Player Standings Card */}
        <div className="p-3 sm:px-4 bg-gradient-to-r from-amber-950/40 via-slate-900/60 to-purple-950/40 border-b border-amber-500/20 flex items-center justify-between gap-3">
          <div className="flex items-center gap-2.5 min-w-0">
            <div className="text-2xl p-1 bg-black/50 rounded-xl border border-amber-500/40 shrink-0">
              {playerAvatar || '🤺'}
            </div>
            <div className="min-w-0">
              <div className="flex items-center gap-1.5">
                <span className="font-bold text-xs text-white truncate">{playerName || 'Kiếm Sĩ'}</span>
                <span className="text-[9px] bg-amber-500/20 text-amber-300 border border-amber-500/40 px-1.5 py-0.2 rounded font-mono font-bold">
                  BẠN
                </span>
              </div>
              <div className="text-[10px] text-slate-400 flex items-center gap-1 mt-0.5">
                <Shield className="w-3 h-3 text-cyan-400" />
                <span>{playerTitle || 'Tân Binh Hầm Ngục'}</span>
              </div>
            </div>
          </div>

          <div className="flex items-center gap-3 shrink-0 text-right">
            <div>
              <div className="text-[10px] uppercase font-bold text-slate-400">Tầng Của Bạn</div>
              <div className="text-base sm:text-lg font-black font-mono text-amber-300">
                TẦNG {formatNumber(maxStageReached)}
              </div>
            </div>

            <div className="pl-3 border-l border-white/10">
              <div className="text-[10px] uppercase font-bold text-slate-400">Hạng</div>
              <div className="text-base sm:text-lg font-black font-mono text-cyan-300">
                {userRank ? `#${userRank}` : 'Top 50+'}
              </div>
            </div>
          </div>
        </div>

        {/* Gap to Leader Notice */}
        {floorGapToLeader > 0 ? (
          <div className="px-4 py-1.5 bg-slate-900/80 border-b border-white/5 flex items-center justify-between text-[11px] text-slate-400">
            <span className="flex items-center gap-1">
              <Flame className="w-3.5 h-3.5 text-rose-400" />
              <span>Cách Top 1: <b className="text-rose-300 font-mono font-bold">{formatNumber(floorGapToLeader)} Tầng</b></span>
            </span>
            <span className="text-slate-500 italic">Vượt thêm Boss để leo hạng!</span>
          </div>
        ) : (
          <div className="px-4 py-1.5 bg-amber-950/40 border-b border-amber-500/20 flex items-center justify-between text-[11px] text-amber-300">
            <span className="flex items-center gap-1 font-bold">
              👑 Bạn đang dẫn đầu đỉnh cao Hầm Ngục Titan!
            </span>
            <span className="text-amber-400 font-mono">Top 1 Server</span>
          </div>
        )}

        {/* Real-time Rankings List */}
        <div className="flex-1 overflow-y-auto min-h-0 custom-scrollbar p-3 flex flex-col gap-2">
          {isLoading ? (
            <div className="py-16 text-center flex flex-col items-center justify-center gap-2 text-slate-500 text-xs">
              <RefreshCw className="w-6 h-6 animate-spin text-amber-400" />
              <span>Đang kết nối Supabase và tải bảng xếp hạng trực tiếp...</span>
            </div>
          ) : liveEntries.length === 0 ? (
            <div className="py-16 text-center flex flex-col items-center justify-center gap-2 text-slate-500 text-xs">
              <Trophy className="w-8 h-8 text-slate-600" />
              <span className="text-slate-400 font-bold">Chưa có người chơi nào trên bảng xếp hạng này.</span>
              <span>Hãy vượt qua các tầng quái vật để trở thành Nhà Vô Địch đầu tiên!</span>
            </div>
          ) : (
            liveEntries.map((entry, idx) => {
              const rank = idx + 1;
              const isUser = entry.playerName.toLowerCase() === (playerName || '').toLowerCase();

              // Top 3 distinct styles
              let rankBadge = (
                <span className="w-6 h-6 rounded-full bg-slate-800 text-slate-300 font-mono font-bold text-xs flex items-center justify-center">
                  #{rank}
                </span>
              );
              let cardBorder = isUser ? 'border-amber-400/80 ring-1 ring-amber-400/60' : 'border-slate-800/80';
              let cardBg = isUser
                ? 'bg-gradient-to-r from-amber-950/40 via-slate-900 to-amber-950/40'
                : 'bg-slate-900/60 hover:bg-slate-900';

              if (rank === 1) {
                rankBadge = (
                  <div className="w-7 h-7 rounded-xl bg-gradient-to-br from-amber-400 to-yellow-500 text-slate-950 font-black text-xs flex items-center justify-center shadow-lg shadow-amber-500/30">
                    🥇 1
                  </div>
                );
                cardBorder = 'border-amber-500/60 shadow-md shadow-amber-500/10';
                cardBg = 'bg-gradient-to-r from-amber-950/60 via-slate-900 to-slate-900';
              } else if (rank === 2) {
                rankBadge = (
                  <div className="w-7 h-7 rounded-xl bg-gradient-to-br from-slate-300 to-slate-400 text-slate-950 font-black text-xs flex items-center justify-center shadow-md">
                    🥈 2
                  </div>
                );
                cardBorder = 'border-slate-400/50';
              } else if (rank === 3) {
                rankBadge = (
                  <div className="w-7 h-7 rounded-xl bg-gradient-to-br from-amber-700 to-amber-800 text-amber-100 font-black text-xs flex items-center justify-center shadow-md">
                    🥉 3
                  </div>
                );
                cardBorder = 'border-amber-700/50';
              }

              return (
                <div
                  key={entry.id || `${entry.playerName}-${rank}`}
                  className={`p-2.5 sm:p-3 rounded-2xl border transition-all flex items-center justify-between gap-2.5 ${cardBg} ${cardBorder}`}
                >
                  {/* Left: Rank & Player info */}
                  <div className="flex items-center gap-2.5 min-w-0">
                    <div className="shrink-0">{rankBadge}</div>

                    <div className="text-2xl p-1 bg-black/40 rounded-xl shrink-0">
                      {entry.avatar || '🤺'}
                    </div>

                    <div className="min-w-0 flex-1">
                      <div className="flex items-center gap-1.5 flex-wrap">
                        <span className={`font-bold text-xs truncate ${rank === 1 ? 'text-amber-200' : 'text-slate-100'}`}>
                          {entry.playerName}
                        </span>
                        {isUser && (
                          <span className="text-[9px] bg-amber-500/20 text-amber-300 border border-amber-500/40 px-1 py-0.2 rounded font-mono font-bold">
                            BẠN
                          </span>
                        )}
                      </div>

                      <div className="text-[10px] text-slate-400 truncate flex items-center gap-1 mt-0.5">
                        <span className="text-purple-300">{entry.title || 'Dũng Giả'}</span>
                        {entry.extraStats?.bossesSlain ? (
                          <span className="text-slate-500 font-mono">
                            • {formatNumber(entry.extraStats.bossesSlain)} Boss
                          </span>
                        ) : null}
                      </div>
                    </div>
                  </div>

                  {/* Right: Highest Floor Reached */}
                  <div className="text-right shrink-0">
                    <div className="text-[10px] uppercase font-bold text-slate-400">
                      Tiến Trình
                    </div>
                    <div className="flex items-center gap-1 text-sm sm:text-base font-black font-mono text-amber-300">
                      <span>TẦNG</span>
                      <span className="text-base sm:text-lg text-yellow-300 drop-shadow">
                        {formatNumber(entry.score)}
                      </span>
                    </div>
                  </div>
                </div>
              );
            })
          )}
        </div>

        {/* Modal Footer */}
        <div className="p-3 bg-slate-950 border-t border-white/5 flex items-center justify-between text-xs text-slate-400">
          <span className="flex items-center gap-1">
            <Sparkles className="w-3.5 h-3.5 text-amber-400" />
            <span>Leo tầng cao hơn để vinh danh trên BXH toàn cầu!</span>
          </span>
          <button
            onClick={onClose}
            className="px-3.5 py-1.5 rounded-xl bg-slate-800 hover:bg-slate-700 text-slate-200 font-bold transition-all active:scale-95 cursor-pointer text-xs"
          >
            Đóng
          </button>
        </div>
    </AppModal>
  );
};
