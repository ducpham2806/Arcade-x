import React, { useEffect, useState } from 'react';
import { Trophy, X, Flame, Clock, Award, Users, RefreshCw, Play } from 'lucide-react';
import { FirebaseService } from '../../services/firebase';
import { StorageService } from '../../services/storage';
import { LeaderboardEntry } from '../../types';
import { soundEngine } from '../../services/audio';

interface DailyLeaderboardModalProps {
  isOpen: boolean;
  onClose: () => void;
  onPlayDaily: () => void;
  hasPlayedToday?: boolean;
  todayScore?: number | null;
}

export const DailyLeaderboardModal: React.FC<DailyLeaderboardModalProps> = ({
  isOpen,
  onClose,
  onPlayDaily,
  hasPlayedToday = false,
  todayScore = null,
}) => {
  const [entries, setEntries] = useState<LeaderboardEntry[]>([]);
  const [isLoading, setIsLoading] = useState(true);
  const todayKey = StorageService.getTodayDateString();

  useEffect(() => {
    if (!isOpen) return;

    setIsLoading(true);
    // Subscribe to real-time daily leaderboard for today
    const unsubscribe = FirebaseService.subscribeToDailyLeaderboard(
      'word-cross-daily',
      todayKey,
      (data) => {
        setEntries(data);
        setIsLoading(false);
      },
      30
    );

    return () => {
      unsubscribe();
    };
  }, [isOpen, todayKey]);

  if (!isOpen) return null;

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center p-3 sm:p-4 bg-black/80 backdrop-blur-sm animate-in fade-in duration-200">
      <div 
        className="relative w-full max-w-md bg-slate-900 border border-purple-500/30 rounded-3xl shadow-2xl overflow-hidden flex flex-col max-h-[90vh]"
        onClick={(e) => e.stopPropagation()}
      >
        {/* Header decoration */}
        <div className="relative p-5 sm:p-6 bg-gradient-to-br from-purple-900/60 via-indigo-900/40 to-slate-900 border-b border-white/10 shrink-0">
          <button
            onClick={() => {
              soundEngine.play('click');
              onClose();
            }}
            className="absolute top-4 right-4 p-2 rounded-full bg-white/10 hover:bg-white/20 text-slate-300 hover:text-white transition-colors"
          >
            <X className="w-5 h-5" />
          </button>

          <div className="flex items-center gap-3 mb-2">
            <div className="w-12 h-12 rounded-2xl bg-gradient-to-br from-amber-400 to-yellow-600 flex items-center justify-center shadow-lg shadow-amber-500/30">
              <Trophy className="w-6 h-6 text-slate-950 fill-slate-950" />
            </div>
            <div>
              <div className="flex items-center gap-2">
                <h3 className="text-xl font-black text-white uppercase tracking-wide">
                  Top Thử Thách Ngày
                </h3>
                <span className="text-[11px] px-2 py-0.5 rounded-full bg-purple-500/30 text-purple-300 border border-purple-400/30 font-bold">
                  Toàn Cầu
                </span>
              </div>
              <p className="text-xs text-slate-400">
                Ngày {todayKey.split('-').reverse().join('/')} • Cùng 1 ma trận cho tất cả
              </p>
            </div>
          </div>

          {/* Player personal status today */}
          {hasPlayedToday && todayScore !== null ? (
            <div className="mt-3 p-2.5 rounded-xl bg-emerald-500/20 border border-emerald-500/30 flex items-center justify-between text-xs">
              <span className="text-emerald-300 font-medium flex items-center gap-1.5">
                <Award className="w-4 h-4 text-emerald-400" /> Bạn đã hoàn thành hôm nay:
              </span>
              <span className="font-bold text-white bg-emerald-600/50 px-2 py-0.5 rounded-md">
                {todayScore} Điểm
              </span>
            </div>
          ) : (
            <div className="mt-3 p-2.5 rounded-xl bg-amber-500/10 border border-amber-500/20 flex items-center justify-between text-xs">
              <span className="text-amber-200/90 font-medium">Bạn chưa thử sức ma trận hôm nay!</span>
              <button
                onClick={() => {
                  soundEngine.play('click');
                  onClose();
                  onPlayDaily();
                }}
                className="font-bold text-slate-950 bg-amber-400 hover:bg-amber-300 px-3 py-1 rounded-lg transition-colors flex items-center gap-1 shadow-sm"
              >
                <Play className="w-3.5 h-3.5 fill-slate-950" /> Chơi Ngay
              </button>
            </div>
          )}
        </div>

        {/* Leaderboard list */}
        <div className="flex-1 overflow-y-auto custom-scrollbar p-3 sm:p-4 space-y-2">
          {isLoading ? (
            <div className="py-12 flex flex-col items-center justify-center text-slate-400 gap-3">
              <RefreshCw className="w-8 h-8 animate-spin text-purple-400" />
              <span className="text-sm">Đang tải bảng xếp hạng trực tuyến...</span>
            </div>
          ) : entries.length === 0 ? (
            <div className="py-12 text-center text-slate-400">
              <Users className="w-12 h-12 mx-auto mb-3 opacity-30 text-purple-300" />
              <p className="font-medium text-white mb-1">Chưa có ai hoàn thành hôm nay!</p>
              <p className="text-xs text-slate-400 max-w-xs mx-auto mb-4">
                Hãy là người đầu tiên giải mã ma trận chữ cái hôm nay và ghi tên lên đỉnh bảng vàng!
              </p>
              <button
                onClick={() => {
                  soundEngine.play('click');
                  onClose();
                  onPlayDaily();
                }}
                className="px-5 py-2.5 rounded-xl bg-purple-600 hover:bg-purple-500 text-white font-bold text-sm shadow-lg shadow-purple-600/30 transition-all"
              >
                Chinh Phục Ngay
              </button>
            </div>
          ) : (
            entries.map((entry, idx) => {
              const rank = entry.rank || idx + 1;
              const isTop1 = rank === 1;
              const isTop2 = rank === 2;
              const isTop3 = rank === 3;

              let rankBadge = (
                <span className="w-7 h-7 rounded-full bg-slate-800 text-slate-400 flex items-center justify-center font-bold text-xs">
                  {rank}
                </span>
              );

              if (isTop1) {
                rankBadge = (
                  <span className="w-7 h-7 rounded-full bg-gradient-to-br from-amber-300 to-yellow-500 text-slate-950 flex items-center justify-center font-black text-sm shadow-md shadow-yellow-500/30">
                    🥇
                  </span>
                );
              } else if (isTop2) {
                rankBadge = (
                  <span className="w-7 h-7 rounded-full bg-gradient-to-br from-slate-200 to-slate-400 text-slate-950 flex items-center justify-center font-black text-sm shadow-md">
                    🥈
                  </span>
                );
              } else if (isTop3) {
                rankBadge = (
                  <span className="w-7 h-7 rounded-full bg-gradient-to-br from-amber-600 to-orange-700 text-white flex items-center justify-center font-black text-sm shadow-md">
                    🥉
                  </span>
                );
              }

              return (
                <div
                  key={entry.id || `${entry.playerName}_${idx}`}
                  className={`flex items-center gap-3 p-3 rounded-2xl border transition-all ${
                    entry.isCurrentPlayer
                      ? 'bg-purple-600/20 border-purple-500 shadow-md shadow-purple-500/10'
                      : isTop1
                        ? 'bg-amber-500/10 border-amber-500/30'
                        : 'bg-slate-800/60 border-slate-700/40 hover:border-slate-600/60'
                  }`}
                >
                  <div className="shrink-0">{rankBadge}</div>

                  <div className="w-10 h-10 rounded-xl bg-slate-700/80 flex items-center justify-center text-xl shrink-0 border border-white/10 shadow-inner">
                    {entry.avatar || '👤'}
                  </div>

                  <div className="flex-1 min-w-0">
                    <div className="flex items-center gap-1.5">
                      <span className={`font-bold text-sm truncate ${entry.isCurrentPlayer ? 'text-purple-300' : 'text-white'}`}>
                        {entry.playerName}
                      </span>
                      {entry.isCurrentPlayer && (
                        <span className="text-[10px] px-1.5 py-0.2 rounded bg-purple-500/40 text-purple-200 font-semibold shrink-0">
                          Bạn
                        </span>
                      )}
                    </div>
                    <div className="flex items-center gap-2 text-[11px] text-slate-400">
                      {entry.extraStats?.comboMax ? (
                        <span className="flex items-center gap-0.5 text-amber-400">
                          <Flame className="w-3 h-3" /> x{entry.extraStats.comboMax}
                        </span>
                      ) : null}
                      {entry.extraStats?.timeSpent ? (
                        <span className="flex items-center gap-0.5 text-slate-400">
                          <Clock className="w-3 h-3" /> {entry.extraStats.timeSpent}s
                        </span>
                      ) : null}
                      <span className="truncate">{entry.title || 'Người Giải Đố'}</span>
                    </div>
                  </div>

                  <div className="text-right shrink-0">
                    <div className="font-black text-amber-400 text-base">
                      {entry.score.toLocaleString()}
                    </div>
                    <div className="text-[10px] text-slate-400 font-medium">điểm</div>
                  </div>
                </div>
              );
            })
          )}
        </div>

        {/* Footer actions */}
        <div className="p-4 bg-slate-950/80 border-t border-white/10 flex items-center justify-between shrink-0">
          <span className="text-xs text-slate-400">Bảng xếp hạng cập nhật tự động</span>
          <button
            onClick={() => {
              soundEngine.play('click');
              onClose();
              onPlayDaily();
            }}
            className="px-4 py-2 rounded-xl font-bold text-xs sm:text-sm bg-gradient-to-r from-purple-600 to-indigo-600 text-white shadow-lg shadow-purple-600/30 hover:scale-105 active:scale-95 transition-all flex items-center gap-1.5"
          >
            <Play className="w-4 h-4 fill-white" />
            {hasPlayedToday ? 'Chơi Lại Thử Thách' : 'Chơi Thử Thách Hôm Nay'}
          </button>
        </div>
      </div>
    </div>
  );
};
