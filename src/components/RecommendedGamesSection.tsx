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
      className="rounded-2xl bg-gradient-to-r from-[#13111c] via-[#101018] to-[#12131e] border border-indigo-500/25 p-2.5 sm:p-3.5 shadow-xl shadow-indigo-950/20 space-y-2.5 relative overflow-hidden"
    >
      {/* Background ambient lighting */}
      <div className="absolute top-0 right-0 w-48 h-24 bg-indigo-600/10 rounded-full blur-3xl pointer-events-none" />
      <div className="absolute bottom-0 left-0 w-48 h-24 bg-purple-600/10 rounded-full blur-3xl pointer-events-none" />

      {/* Header bar */}
      <div className="relative z-10 flex items-center justify-between gap-2 border-b border-white/5 pb-2">
        <div className="flex items-center gap-2 min-w-0">
          <div className="w-7 h-7 rounded-xl bg-gradient-to-tr from-amber-500/20 via-purple-500/20 to-indigo-500/30 border border-indigo-500/30 flex items-center justify-center text-amber-300 shadow-inner shrink-0">
            <Sparkles className="w-3.5 h-3.5 animate-pulse" />
          </div>
          <div className="min-w-0">
            <div className="flex items-center gap-1.5">
              <h3
                id="heading-recommended-games"
                className="text-xs sm:text-sm font-black uppercase tracking-wider text-transparent bg-clip-text bg-gradient-to-r from-amber-300 via-white to-indigo-300 truncate font-display"
              >
                Game Đề Xuất Cho Bạn
              </h3>
              <span className="hidden md:inline-flex items-center gap-1 text-[9px] font-bold px-1.5 py-0.2 rounded-full bg-indigo-500/20 text-indigo-300 border border-indigo-500/30">
                <Compass className="w-2.5 h-2.5" />
                AI Curated
              </span>
            </div>
            <p className="text-[10px] text-slate-400 truncate hidden xs:block">
              Top 3 game phù hợp nhất với phong cách của bạn
            </p>
          </div>
        </div>

        {/* Refresh Suggestions Button */}
        <button
          id="btn-refresh-recommendations"
          type="button"
          onClick={handleRefresh}
          className="flex items-center gap-1 px-2 py-1 rounded-xl bg-white/5 hover:bg-indigo-600/20 text-slate-400 hover:text-indigo-300 border border-white/10 hover:border-indigo-500/40 text-[11px] font-semibold transition-all active:scale-95 cursor-pointer shrink-0"
          title="Đổi danh sách 3 game gợi ý"
        >
          <RefreshCw className={`w-3 h-3 ${isRotating ? 'animate-spin text-indigo-400' : ''}`} />
          <span className="text-[10px] sm:text-[11px]">Đổi 3 game</span>
        </button>
      </div>

      {/* Recommended Games: Exactly 3 games on 1 horizontal row, NO scroll */}
      <div className="relative z-10 grid grid-cols-3 gap-1.5 sm:gap-2.5">
        {recommendedItems.slice(0, 3).map(({ game, matchPercentage, reason, badge }) => {
          const isFav = favorites.includes(game.id);

          return (
            <div
              key={`rec-${game.id}`}
              className="group relative rounded-xl bg-[#14141d]/95 hover:bg-[#181826] border border-white/10 hover:border-indigo-500/50 p-2 sm:p-2.5 transition-all duration-200 shadow-md hover:shadow-indigo-500/15 flex flex-col justify-between overflow-hidden"
            >
              {/* Subtle top color bar */}
              <div
                className="absolute top-0 left-0 right-0 h-0.5 opacity-60 group-hover:opacity-100 transition-opacity"
                style={{ backgroundColor: game.themeColor || '#6366f1' }}
              />

              <div>
                {/* Top row: Match badge & Favorite button */}
                <div className="flex items-center justify-between gap-1 mb-1.5">
                  <span className="inline-flex items-center gap-0.5 text-[8px] sm:text-[9px] font-black px-1.5 py-0.5 rounded-full bg-emerald-500/15 text-emerald-300 border border-emerald-500/30 truncate">
                    <span className="w-1 h-1 rounded-full bg-emerald-400 animate-pulse shrink-0" />
                    <span>{matchPercentage}% Hợp</span>
                  </span>

                  <button
                    id={`btn-rec-fav-${game.id}`}
                    type="button"
                    onClick={(e) => {
                      e.stopPropagation();
                      onToggleFavorite(game.id);
                    }}
                    className={`p-1 rounded-lg border transition-all active:scale-95 cursor-pointer flex items-center justify-center ${
                      isFav
                        ? 'bg-rose-500/20 text-rose-400 border-rose-500/50'
                        : 'bg-white/5 text-slate-500 border-white/5 hover:text-white hover:bg-white/10'
                    }`}
                    title={isFav ? 'Bỏ Yêu Thích' : 'Thêm Vào Yêu Thích'}
                  >
                    <Heart className={`w-3 h-3 ${isFav ? 'fill-rose-500 text-rose-500' : ''}`} />
                  </button>
                </div>

                {/* Game Main Info (Click to open details) */}
                <div
                  className="flex flex-col items-center text-center cursor-pointer mb-1.5 group/info"
                  onClick={() => onOpenDetail(game.id)}
                  title={`Xem chi tiết ${game.title}`}
                >
                  <div
                    className="w-9 h-9 sm:w-11 sm:h-11 rounded-xl flex items-center justify-center text-xl sm:text-2xl shadow-md border border-white/10 mb-1 group-hover/info:scale-105 transition-transform shrink-0"
                    style={{ backgroundColor: `${game.themeColor || '#6366f1'}25` }}
                  >
                    {game.icon}
                  </div>
                  <h4 className="text-[11px] sm:text-xs font-bold text-white group-hover/info:text-indigo-300 transition-colors truncate w-full font-display">
                    {game.title}
                  </h4>
                  <span className="text-[9px] sm:text-[10px] text-slate-400 truncate w-full mt-0.5">
                    {badge.icon} {badge.text || game.category}
                  </span>
                </div>
              </div>

              {/* Action buttons footer */}
              <div className="pt-1.5 border-t border-white/5 flex items-center gap-1">
                <button
                  id={`btn-rec-detail-${game.id}`}
                  type="button"
                  onClick={() => onOpenDetail(game.id)}
                  className="p-1 sm:p-1.5 rounded-lg bg-white/5 hover:bg-yellow-500/20 text-slate-400 hover:text-yellow-400 border border-white/10 transition-all flex items-center justify-center active:scale-95 cursor-pointer shrink-0"
                  title="Xem top kỷ lục & thể lệ"
                >
                  <Trophy className="w-3 h-3 text-yellow-400" />
                </button>

                <button
                  id={`btn-rec-play-${game.id}`}
                  type="button"
                  onClick={() => onLaunchGame(game.id)}
                  className="flex-1 py-1 sm:py-1.5 px-1.5 rounded-lg bg-indigo-600 hover:bg-indigo-500 active:scale-95 text-white font-bold text-[10px] sm:text-xs shadow-md shadow-indigo-600/25 transition-all flex items-center justify-center gap-1 cursor-pointer truncate"
                  title="Chơi ngay"
                >
                  <Play className="w-3 h-3 fill-current shrink-0" />
                  <span className="truncate">Chơi</span>
                </button>
              </div>
            </div>
          );
        })}
      </div>
    </section>
  );
};
