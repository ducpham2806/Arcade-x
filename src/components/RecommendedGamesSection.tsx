import React, { useState, useMemo } from 'react';
import { GameConfig } from '../types';
import { computeGameRecommendations } from '../utils/gameRecommendations';
import { soundEngine } from '../services/audio';
import { hapticService } from '../services/haptics';
import { Sparkles, Play, Heart, Trophy, RefreshCw, Compass } from 'lucide-react';

interface RecommendedGamesSectionProps {
  allGames: GameConfig[];
  gamesPlayedCount?: Record<string, number>;
  recentlyPlayed?: string[];
  favorites: string[];
  highScores?: Record<string, number>;
  onLaunchGame: (gameId: string) => void;
  onOpenDetail: (gameId: string) => void;
  onToggleFavorite: (gameId: string) => void;
}

export const RecommendedGamesSection: React.FC<RecommendedGamesSectionProps> = ({
  allGames,
  gamesPlayedCount = {},
  recentlyPlayed = [],
  favorites,
  highScores = {},
  onLaunchGame,
  onOpenDetail,
  onToggleFavorite,
}) => {
  const [refreshOffset, setRefreshOffset] = useState<number>(0);
  const [isRotating, setIsRotating] = useState<boolean>(false);

  const recommendedItems = useMemo(() => {
    return computeGameRecommendations(
      allGames,
      gamesPlayedCount,
      recentlyPlayed,
      favorites,
      highScores,
      refreshOffset
    );
  }, [allGames, gamesPlayedCount, recentlyPlayed, favorites, highScores, refreshOffset]);

  const handleRefresh = () => {
    setIsRotating(true);
    try {
      soundEngine.play('click');
      hapticService.tap();
    } catch {}
    setRefreshOffset((prev) => prev + 2);
    setTimeout(() => {
      setIsRotating(false);
    }, 450);
  };

  if (!recommendedItems || recommendedItems.length === 0) {
    return null;
  }

  return (
    <section
      id="section-recommended-games"
      aria-labelledby="heading-recommended-games"
      className="rounded-2xl bg-gradient-to-r from-[#13111c] via-[#101018] to-[#12131e] border border-indigo-500/25 p-3.5 sm:p-4 shadow-xl shadow-indigo-950/20 space-y-3 relative overflow-hidden"
    >
      {/* Background ambient lighting */}
      <div className="absolute top-0 right-0 w-64 h-32 bg-indigo-600/10 rounded-full blur-3xl pointer-events-none" />
      <div className="absolute bottom-0 left-0 w-64 h-32 bg-purple-600/10 rounded-full blur-3xl pointer-events-none" />

      {/* Header bar */}
      <div className="relative z-10 flex items-center justify-between gap-2 border-b border-white/5 pb-2.5">
        <div className="flex items-center gap-2.5 min-w-0">
          <div className="w-8 h-8 rounded-xl bg-gradient-to-tr from-amber-500/20 via-purple-500/20 to-indigo-500/30 border border-indigo-500/30 flex items-center justify-center text-amber-300 shadow-inner shrink-0">
            <Sparkles className="w-4 h-4 animate-pulse" />
          </div>
          <div className="min-w-0">
            <div className="flex items-center gap-2">
              <h3
                id="heading-recommended-games"
                className="text-xs sm:text-sm font-black uppercase tracking-wider text-transparent bg-clip-text bg-gradient-to-r from-amber-300 via-white to-indigo-300 truncate font-display"
              >
                Game Đề Xuất Cho Bạn
              </h3>
              <span className="hidden sm:inline-flex items-center gap-1 text-[9px] font-bold px-1.5 py-0.2 rounded-full bg-indigo-500/20 text-indigo-300 border border-indigo-500/30">
                <Compass className="w-2.5 h-2.5" />
                AI Curated
              </span>
            </div>
            <p className="text-[10px] sm:text-[11px] text-slate-400 truncate">
              Phân tích từ lịch sử trải nghiệm & phong cách chơi của bạn
            </p>
          </div>
        </div>

        {/* Refresh Suggestions Button */}
        <button
          id="btn-refresh-recommendations"
          type="button"
          onClick={handleRefresh}
          className="flex items-center gap-1.5 px-2.5 py-1.5 rounded-xl bg-white/5 hover:bg-indigo-600/20 text-slate-400 hover:text-indigo-300 border border-white/10 hover:border-indigo-500/40 text-xs font-semibold transition-all active:scale-95 cursor-pointer shrink-0"
          title="Làm mới danh sách gợi ý"
        >
          <RefreshCw className={`w-3.5 h-3.5 ${isRotating ? 'animate-spin text-indigo-400' : ''}`} />
          <span className="hidden sm:inline text-[11px]">Đổi gợi ý</span>
        </button>
      </div>

      {/* Recommended Games Grid: 1 col on xs, 2 cols on sm, 4 cols on lg/xl */}
      <div className="relative z-10 grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-2.5">
        {recommendedItems.map(({ game, matchPercentage, reason, badge }) => {
          const isFav = favorites.includes(game.id);
          const personalHighScore = highScores[game.id] || 0;

          return (
            <div
              key={`rec-${game.id}`}
              className="group relative rounded-xl bg-[#14141d]/90 hover:bg-[#181824] border border-white/10 hover:border-indigo-500/50 p-3 transition-all duration-200 shadow-md hover:shadow-indigo-500/15 flex flex-col justify-between overflow-hidden"
            >
              {/* Subtle top color bar */}
              <div
                className="absolute top-0 left-0 right-0 h-0.5 opacity-60 group-hover:opacity-100 transition-opacity"
                style={{ backgroundColor: game.themeColor || '#6366f1' }}
              />

              <div>
                {/* Top row: Match pill & Favorite button */}
                <div className="flex items-center justify-between gap-1.5 mb-2">
                  <span className="inline-flex items-center gap-1 text-[10px] font-black px-2 py-0.5 rounded-full bg-emerald-500/15 text-emerald-300 border border-emerald-500/30">
                    <span className="w-1.5 h-1.5 rounded-full bg-emerald-400 animate-pulse" />
                    <span>{matchPercentage}% Hợp gu</span>
                  </span>

                  <button
                    id={`btn-rec-fav-${game.id}`}
                    type="button"
                    onClick={(e) => {
                      e.stopPropagation();
                      onToggleFavorite(game.id);
                    }}
                    className={`p-1.5 rounded-lg border transition-all active:scale-95 cursor-pointer min-h-[28px] min-w-[28px] flex items-center justify-center ${
                      isFav
                        ? 'bg-rose-500/20 text-rose-400 border-rose-500/50'
                        : 'bg-white/5 text-slate-500 border-white/5 hover:text-white hover:bg-white/10'
                    }`}
                    title={isFav ? 'Bỏ Yêu Thích' : 'Thêm Vào Yêu Thích'}
                  >
                    <Heart className={`w-3.5 h-3.5 ${isFav ? 'fill-rose-500 text-rose-500' : ''}`} />
                  </button>
                </div>

                {/* Game Main Info: Big Icon & Title */}
                <div
                  className="flex items-center gap-2.5 mb-2 cursor-pointer"
                  onClick={() => onOpenDetail(game.id)}
                >
                  <div
                    className="w-11 h-11 rounded-xl flex items-center justify-center text-2xl shadow-md border border-white/10 shrink-0 group-hover:scale-105 transition-transform"
                    style={{ backgroundColor: `${game.themeColor || '#6366f1'}25` }}
                  >
                    {game.icon}
                  </div>
                  <div className="min-w-0 flex-1">
                    <h4 className="text-xs font-bold text-white group-hover:text-indigo-300 transition-colors truncate font-display">
                      {game.title}
                    </h4>
                    <span className="text-[10px] text-slate-400 block truncate">
                      {game.category} • {personalHighScore > 0 ? `Kỷ lục ${personalHighScore.toLocaleString()}` : 'Mới mẻ'}
                    </span>
                  </div>
                </div>

                {/* Personalized recommendation reason badge */}
                <div
                  className={`px-2 py-1 rounded-lg border text-[10px] leading-tight mb-2 flex items-center gap-1.5 ${badge.colorClass}`}
                  title={reason}
                >
                  <span className="shrink-0">{badge.icon}</span>
                  <span className="truncate font-medium">{reason}</span>
                </div>
              </div>

              {/* Action buttons footer */}
              <div className="pt-2 border-t border-white/5 flex items-center justify-between gap-1.5">
                <button
                  id={`btn-rec-detail-${game.id}`}
                  type="button"
                  onClick={() => onOpenDetail(game.id)}
                  className="p-1.5 rounded-lg bg-white/5 hover:bg-yellow-500/20 text-slate-400 hover:text-yellow-400 border border-white/10 transition-all flex items-center justify-center active:scale-95 cursor-pointer min-h-[30px] min-w-[30px]"
                  title="Xem chi tiết & Top kỷ lục"
                >
                  <Trophy className="w-3.5 h-3.5 text-yellow-400" />
                </button>

                <button
                  id={`btn-rec-play-${game.id}`}
                  type="button"
                  onClick={() => onLaunchGame(game.id)}
                  className="flex-1 py-1.5 px-3 rounded-lg bg-indigo-600 hover:bg-indigo-500 active:scale-95 text-white font-bold text-xs shadow-md shadow-indigo-600/25 transition-all flex items-center justify-center gap-1.5 cursor-pointer min-h-[30px]"
                  title="Chơi ngay"
                >
                  <Play className="w-3.5 h-3.5 fill-current" />
                  <span>Chơi Ngay</span>
                </button>
              </div>
            </div>
          );
        })}
      </div>
    </section>
  );
};
