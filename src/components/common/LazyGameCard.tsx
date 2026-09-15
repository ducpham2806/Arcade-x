import React, { useState, useEffect, useRef } from 'react';
import { GameConfig } from '../../types';
import { Heart, Trophy, Bot, Play } from 'lucide-react';

interface LazyGameCardProps {
  game: GameConfig;
  personalHighScore: number;
  isFav: boolean;
  stats?: { activePlayers: number; totalPlays: string; rating: number };
  onOpenDetail: (gameId: string) => void;
  onToggleFavorite: (gameId: string) => void;
  onLaunchGame: (gameId: string, aiMode?: boolean) => void;
}

export const LazyGameCard: React.FC<LazyGameCardProps> = ({
  game,
  personalHighScore,
  isFav,
  stats,
  onOpenDetail,
  onToggleFavorite,
  onLaunchGame,
}) => {
  const [isIntersected, setIsIntersected] = useState<boolean>(false);
  const containerRef = useRef<HTMLDivElement>(null);

  useEffect(() => {
    if (isIntersected) return;

    if (typeof window === 'undefined' || !('IntersectionObserver' in window)) {
      setIsIntersected(true);
      return;
    }

    const observer = new IntersectionObserver(
      (entries) => {
        if (entries[0].isIntersecting) {
          setIsIntersected(true);
          observer.disconnect();
        }
      },
      {
        root: null,
        rootMargin: '120px 0px', // Preload ahead of scrolling
        threshold: 0.05,
      }
    );

    const el = containerRef.current;
    if (el) {
      observer.observe(el);
    }

    return () => {
      observer.disconnect();
    };
  }, [isIntersected]);

  return (
    <div
      ref={containerRef}
      id={`game-card-${game.id}`}
      className="group relative rounded-2xl bg-[#141414] border border-white/5 hover:border-indigo-500/50 p-2.5 sm:p-3 flex flex-col justify-between transition-all duration-200 hover:bg-[#171717] hover:shadow-lg hover:shadow-indigo-500/10 overflow-hidden min-h-[148px]"
    >
      {!isIntersected ? (
        /* Lightweight Skeleton Placeholder: Zero Cumulative Layout Shift (CLS = 0) */
        <div className="w-full h-full flex flex-col justify-between animate-pulse">
          <div>
            <div className="flex items-start justify-between gap-2 mb-2.5">
              <div
                className="w-12 h-12 rounded-2xl bg-white/5 border border-white/10 shrink-0"
                style={{ backgroundColor: `${game.themeColor || '#6366f1'}15` }}
              />
              <div className="flex items-center gap-1.5">
                <div className="w-14 h-4 bg-white/5 rounded-md" />
                <div className="w-8 h-8 rounded-lg bg-white/5" />
              </div>
            </div>
            <div className="h-4 w-32 bg-white/10 rounded-md mb-2" />
          </div>

          <div className="pt-2 border-t border-white/5 flex items-center justify-between">
            <div className="w-12 h-5 bg-white/5 rounded" />
            <div className="flex items-center gap-1">
              <div className="w-8 h-8 bg-white/5 rounded-lg" />
              <div className="w-16 h-8 bg-white/10 rounded-lg" />
            </div>
          </div>
        </div>
      ) : (
        /* Loaded Full Game Card with Smooth Fade-in */
        <div className="w-full h-full flex flex-col justify-between transition-opacity duration-300 opacity-100">
          <div>
            {/* Card Header: Icon, Category Badge & Favorite Heart */}
            <div className="flex items-start justify-between gap-2 mb-2.5">
              <div
                className="w-12 h-12 rounded-2xl flex items-center justify-center text-2xl shadow-lg border border-white/10 group-hover:scale-105 group-hover:border-indigo-500/50 transition-all shrink-0 cursor-pointer"
                style={{ backgroundColor: `${game.themeColor}25` }}
                onClick={() => onOpenDetail(game.id)}
                title={`Mở chi tiết ${game.title}`}
              >
                {game.icon}
              </div>

              <div className="flex items-center gap-1.5 min-w-0">
                <span className="text-[9px] font-bold px-1.5 py-0.5 rounded bg-white/5 text-indigo-400 border border-white/10 uppercase truncate max-w-[75px]">
                  {game.category}
                </span>
                <div className="hidden sm:inline-flex items-center gap-1 text-[9px] text-slate-400 bg-[#0a0a0c] px-1.5 py-0.5 rounded border border-white/5">
                  <span className="w-1 h-1 rounded-full bg-emerald-400" />
                  <span>{(stats?.activePlayers || 500).toLocaleString()}</span>
                </div>

                {/* Favorite Heart Button */}
                <button
                  id={`btn-fav-card-${game.id}`}
                  type="button"
                  onClick={(e) => {
                    e.stopPropagation();
                    onToggleFavorite(game.id);
                  }}
                  className={`p-1.5 rounded-lg border transition-all duration-200 active:scale-95 cursor-pointer flex items-center justify-center min-h-[32px] min-w-[32px] ${
                    isFav
                      ? 'bg-rose-500/20 text-rose-400 border-rose-500/50 shadow-sm'
                      : 'bg-white/5 text-slate-500 border-white/5 hover:text-white hover:bg-white/10'
                  }`}
                  title={isFav ? 'Bỏ Yêu Thích' : 'Thêm Vào Yêu Thích'}
                >
                  <Heart className={`w-3.5 h-3.5 transition-transform active:scale-75 ${isFav ? 'fill-rose-500 text-rose-500' : ''}`} />
                </button>
              </div>
            </div>

            {/* Game Title - Click to open detail */}
            <div
              onClick={() => onOpenDetail(game.id)}
              className="cursor-pointer group/title mb-2"
            >
              <div className="flex items-center gap-1.5">
                <h4 className="text-xs sm:text-sm font-bold text-white group-hover/title:text-indigo-400 transition-colors font-display truncate">
                  {game.title}
                </h4>
                {game.id === 'blocker' && (
                  <span className="px-1.5 py-0.2 rounded bg-amber-500/20 text-amber-300 border border-amber-500/30 text-[8px] font-black uppercase shrink-0">
                    500 Xu
                  </span>
                )}
              </div>
            </div>
          </div>

          {/* Card Footer: High Score & Action Buttons */}
          <div className="pt-2 border-t border-white/5 flex items-center justify-between gap-1.5">
            <div className="text-left min-w-0">
              <span className="text-[8px] text-slate-500 uppercase tracking-wider block leading-tight">Kỷ Lục</span>
              <span className="text-xs font-black font-mono text-yellow-500 truncate block leading-tight">
                {personalHighScore.toLocaleString()}
              </span>
            </div>

            <div className="flex items-center gap-1 shrink-0">
              {/* Top 5 Button */}
              <button
                id={`btn-detail-card-${game.id}`}
                type="button"
                onClick={() => onOpenDetail(game.id)}
                className="p-1.5 rounded-lg bg-white/5 hover:bg-yellow-500/20 text-slate-300 hover:text-yellow-400 border border-white/10 hover:border-yellow-500/30 transition-all flex items-center justify-center active:scale-95 cursor-pointer min-h-[32px] min-w-[32px]"
                title="Xem Top 5 & Thể Lệ"
              >
                <Trophy className="w-3.5 h-3.5 text-yellow-400" />
              </button>

              {/* AI Practice Button */}
              {game.supportsAI && (
                <button
                  id={`btn-play-ai-${game.id}`}
                  type="button"
                  onClick={() => onLaunchGame(game.id, true)}
                  className="p-1.5 rounded-lg bg-white/5 hover:bg-indigo-500/20 text-indigo-300 border border-indigo-500/20 transition-all flex items-center justify-center active:scale-95 cursor-pointer min-h-[32px] min-w-[32px]"
                  title="Luyện Với AI"
                >
                  <Bot className="w-3.5 h-3.5 text-indigo-400" />
                </button>
              )}

              {/* Play Button */}
              <button
                id={`btn-play-${game.id}`}
                type="button"
                onClick={() => onLaunchGame(game.id)}
                className="px-2.5 py-1.5 rounded-lg bg-indigo-600 hover:bg-indigo-500 text-white shadow-md shadow-indigo-600/20 transition-all flex items-center justify-center gap-1 active:scale-95 cursor-pointer min-h-[32px]"
                title="Chơi Ngay"
              >
                <Play className="w-3.5 h-3.5 fill-current" />
                <span className="text-[11px] font-bold">Chơi</span>
              </button>
            </div>
          </div>
        </div>
      )}
    </div>
  );
};
