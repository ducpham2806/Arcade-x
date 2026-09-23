import React, { useState, useMemo, useRef, useEffect } from 'react';
import { ALL_GAMES_LIST, GAME_REGISTRY, FEATURED_SLIDER_GAME_IDS } from '../games/registry';
import { usePlayer } from '../context/PlayerContext';
import { useGame } from '../context/GameContext';
import { TopWeeklyPlayersWidget } from './TopWeeklyPlayersWidget';
import { LazyGameCard, getCategoryIcon } from './common/LazyGameCard';
import { soundEngine } from '../services/audio';
import { hapticService } from '../services/haptics';
import {
  Search,
  Play,
  Bot,
  Trophy,
  Heart,
  History,
  RefreshCw,
  ChevronRight,
  ChevronLeft,
  Sparkles,
  Layers,
  Gamepad2,
  Users,
  Flame,
  Swords,
  Puzzle,
  Zap,
} from 'lucide-react';

const CATEGORY_ITEMS = [
  { id: 'Tất Cả', icon: Gamepad2, title: 'Tất Cả Game', activeColor: 'bg-indigo-600 border-indigo-400 text-white shadow-indigo-600/40', defaultColor: 'text-indigo-400' },
  { id: 'Yêu Thích', icon: Heart, title: 'Yêu Thích', activeColor: 'bg-rose-600 border-rose-400 text-white shadow-rose-600/40', defaultColor: 'text-rose-400' },
  { id: 'Multiplayer', icon: Users, title: 'PvP Đối Kháng', activeColor: 'bg-cyan-600 border-cyan-400 text-white shadow-cyan-600/40', defaultColor: 'text-cyan-400' },
  { id: 'Arcade', icon: Flame, title: 'Arcade', activeColor: 'bg-amber-600 border-amber-400 text-white shadow-amber-600/40', defaultColor: 'text-amber-400' },
  { id: 'Action', icon: Swords, title: 'Hành Động', activeColor: 'bg-orange-600 border-orange-400 text-white shadow-orange-600/40', defaultColor: 'text-orange-400' },
  { id: 'Puzzle', icon: Puzzle, title: 'Giải Đố', activeColor: 'bg-emerald-600 border-emerald-400 text-white shadow-emerald-600/40', defaultColor: 'text-emerald-400' },
  { id: 'Reflex', icon: Zap, title: 'Phản Xạ', activeColor: 'bg-yellow-500 border-yellow-300 text-slate-950 shadow-yellow-500/40', defaultColor: 'text-yellow-400' },
] as const;

// Player count stats per game
const GAME_PLAYER_STATS: Record<string, { activePlayers: number; totalPlays: string; rating: number }> = {
  'mummy-escape': { activePlayers: 2850, totalPlays: '94.6K', rating: 5.0 },
  'xiangqi': { activePlayers: 3120, totalPlays: '112.8K', rating: 5.0 },
  'caro-gomoku': { activePlayers: 2450, totalPlays: '89.4K', rating: 5.0 },
  'neon-runner': { activePlayers: 1240, totalPlays: '48.2K', rating: 4.9 },
  'tile-2048': { activePlayers: 1890, totalPlays: '62.5K', rating: 5.0 },
  'cyber-slice': { activePlayers: 940, totalPlays: '33.1K', rating: 4.8 },
  'cosmic-defense': { activePlayers: 780, totalPlays: '27.4K', rating: 4.7 },
  'dungeon-tap': { activePlayers: 860, totalPlays: '31.9K', rating: 4.9 },
  'hex-match': { activePlayers: 650, totalPlays: '21.0K', rating: 4.6 },
};

export const GameCatalog: React.FC = () => {
  const { profile } = usePlayer();
  const {
    launchGame,
    favorites,
    toggleFavorite,
    recentlyPlayed,
    openGameDetail,
    dailyChallenge,
    dailyChallenges,
    launchDailyChallenge,
    claimDailyChallenge,
    setActiveModal,
  } = useGame();

  const [selectedCategory, setSelectedCategory] = useState<string>('Tất Cả');
  const [searchQuery, setSearchQuery] = useState<string>('');

  // Resolve recently played games metadata (last 3 games)
  const recentGamesList = useMemo(() => {
    const validIds = (recentlyPlayed && recentlyPlayed.length > 0)
      ? recentlyPlayed
      : ['neon-runner', 'tile-2048', 'cyber-slice'];

    return validIds
      .map(id => GAME_REGISTRY[id])
      .filter(Boolean)
      .slice(0, 3);
  }, [recentlyPlayed]);

  // Filtered games based on category, search, and favorites
  const filteredGames = useMemo(() => {
    return ALL_GAMES_LIST.filter((game) => {
      const isFav = favorites.includes(game.id);
      let matchCategory = true;
      if (selectedCategory === 'Yêu Thích') {
        matchCategory = isFav;
      } else if (selectedCategory === 'Multiplayer') {
        matchCategory = game.tags.some(t => t.toLowerCase().includes('multiplayer') || t.toLowerCase().includes('pvp') || t.toLowerCase().includes('online')) || game.category === 'Multiplayer';
      } else if (selectedCategory !== 'Tất Cả') {
        matchCategory = game.category === selectedCategory;
      }

      const query = searchQuery.toLowerCase().trim();
      const matchSearch =
        !query ||
        game.title.toLowerCase().includes(query) ||
        game.description.toLowerCase().includes(query) ||
        game.tags.some((t) => t.toLowerCase().includes(query));

      return matchCategory && matchSearch;
    });
  }, [selectedCategory, searchQuery, favorites]);

  // 5 New & Featured Highlight Games for the top slider
  const sliderGames = useMemo(() => {
    return FEATURED_SLIDER_GAME_IDS
      .map((id) => GAME_REGISTRY[id])
      .filter(Boolean);
  }, []);

  const [activeSlide, setActiveSlide] = useState<number>(0);
  const [isSliderHovered, setIsSliderHovered] = useState<boolean>(false);
  const sliderTouchStartX = useRef<number>(0);

  // Auto-advance slider every 4.5 seconds unless user hovers
  useEffect(() => {
    if (isSliderHovered || sliderGames.length <= 1) return;
    const interval = setInterval(() => {
      setActiveSlide((prev) => (prev + 1) % sliderGames.length);
    }, 4500);
    return () => clearInterval(interval);
  }, [isSliderHovered, sliderGames.length]);

  const activeGame = sliderGames[activeSlide] || sliderGames[0] || ALL_GAMES_LIST[0];
  const isActiveGameFav = favorites.includes(activeGame.id);

  const getSliderBadge = (gameId: string) => {
    switch (gameId) {
      case 'word-cross':
        return { label: 'GAME MỚI RA MẮT ⭐', bg: 'bg-fuchsia-500/25 text-fuchsia-300 border-fuchsia-400/40' };
      case 'car-escape':
        return { label: 'HOT • 100 LEVEL 🚗', bg: 'bg-rose-500/25 text-rose-300 border-rose-400/40' };
      case 'dungeon-tap':
        return { label: 'GAME NỔI BẬT ⚔️', bg: 'bg-amber-500/25 text-amber-300 border-amber-400/40' };
      case 'mummy-escape':
        return { label: 'CHIẾN THUẬT VƯỢT NGỤC 🧟‍♂️', bg: 'bg-emerald-500/25 text-emerald-300 border-emerald-400/40' };
      case 'tile-2048':
        return { label: 'SĂN NGỌC BÁU 💎', bg: 'bg-cyan-500/25 text-cyan-300 border-cyan-400/40' };
      default:
        return { label: 'GAME MỚI & NỔI BẬT ✨', bg: 'bg-indigo-500/25 text-indigo-300 border-indigo-400/40' };
    }
  };

  const [isRefreshing, setIsRefreshing] = useState<boolean>(false);
  const [pullDist, setPullDist] = useState<number>(0);
  const touchStartYRef = useRef<number>(0);

  const handleTouchStart = (e: React.TouchEvent) => {
    if (window.scrollY <= 5) {
      touchStartYRef.current = e.touches[0].clientY;
    } else {
      touchStartYRef.current = 0;
    }
  };

  const handleTouchMove = (e: React.TouchEvent) => {
    if (touchStartYRef.current === 0) return;
    const currentY = e.touches[0].clientY;
    const diff = currentY - touchStartYRef.current;
    if (diff > 0 && window.scrollY <= 5) {
      setPullDist(Math.min(130, diff * 0.45));
    }
  };

  const handleTouchEnd = () => {
    if (pullDist > 65 && !isRefreshing) {
      setIsRefreshing(true);
      try {
        soundEngine.play('powerup');
        hapticService.tap();
      } catch {}

      setTimeout(() => {
        setIsRefreshing(false);
      }, 1400);
    }
    setPullDist(0);
    touchStartYRef.current = 0;
  };

  return (
    <div
      onTouchStart={handleTouchStart}
      onTouchMove={handleTouchMove}
      onTouchEnd={handleTouchEnd}
      className="max-w-7xl mx-auto px-2.5 sm:px-6 py-2.5 sm:py-4 pb-28 md:pb-6 space-y-3 sm:space-y-4 select-none"
    >
      {/* Pull to refresh indicator animation */}
      {(pullDist > 0 || isRefreshing) && (
        <div
          className="flex items-center justify-center transition-all overflow-hidden"
          style={{ height: `${Math.max(pullDist, isRefreshing ? 54 : 0)}px` }}
        >
          <div className="flex items-center gap-2 px-4 py-2 rounded-2xl bg-indigo-950/90 border border-indigo-500/40 text-white shadow-xl backdrop-blur-md">
            <RefreshCw className={`w-4 h-4 text-cyan-400 ${isRefreshing ? 'animate-spin' : ''}`} />
            <span className="text-xs font-bold">
              {isRefreshing ? 'Đang đồng bộ trạng thái với Backend...' : 'Thả ra để làm mới & đồng bộ...'}
            </span>
          </div>
        </div>
      )}

      {/* ========================================================================= */}
      {/* 1. NEW & FEATURED GAMES SLIDER (3-5 GAMES BANNER WITH AUTO-SLIDE & SWIPE)  */}
      {/* ========================================================================= */}
      <section
        className="relative rounded-2xl overflow-hidden border border-white/10 bg-gradient-to-r from-indigo-950/90 via-[#10101c] to-[#0d0d14] p-3 sm:p-4 shadow-xl group transition-all"
        onMouseEnter={() => setIsSliderHovered(true)}
        onMouseLeave={() => setIsSliderHovered(false)}
        onTouchStart={(e) => {
          sliderTouchStartX.current = e.touches[0].clientX;
        }}
        onTouchEnd={(e) => {
          if (!sliderTouchStartX.current) return;
          const diff = e.changedTouches[0].clientX - sliderTouchStartX.current;
          if (diff > 45) {
            // Swiped right -> prev
            setActiveSlide((prev) => (prev - 1 + sliderGames.length) % sliderGames.length);
            try { hapticService.tap(); soundEngine.play('click'); } catch {}
          } else if (diff < -45) {
            // Swiped left -> next
            setActiveSlide((prev) => (prev + 1) % sliderGames.length);
            try { hapticService.tap(); soundEngine.play('click'); } catch {}
          }
          sliderTouchStartX.current = 0;
        }}
      >
        <div className="absolute inset-0 bg-[radial-gradient(ellipse_at_top_right,rgba(99,102,241,0.18),transparent_70%)] pointer-events-none" />

        <div className="relative z-10 flex flex-col gap-2.5">
          {/* Top Row: Badge + Category + Slider Nav Controls */}
          <div className="flex items-center justify-between gap-2">
            <div className="flex items-center gap-1.5 flex-wrap">
              {(() => {
                const badge = getSliderBadge(activeGame.id);
                return (
                  <span className={`inline-flex items-center gap-1 px-2.5 py-0.5 rounded-full border text-[9px] sm:text-[10px] font-black uppercase tracking-wider ${badge.bg}`}>
                    <Sparkles className="w-3 h-3 text-amber-300 animate-pulse" />
                    <span>{badge.label}</span>
                  </span>
                );
              })()}
              <span className="text-xs px-2 py-0.5 rounded bg-white/5 border border-white/10 flex items-center justify-center" title={`Thể loại: ${activeGame.category}`}>
                {getCategoryIcon(activeGame.category)}
              </span>
            </div>

            {/* Slider Navigation Arrows & Page Indicator */}
            <div className="flex items-center gap-1">
              <button
                type="button"
                onClick={() => {
                  setActiveSlide((prev) => (prev - 1 + sliderGames.length) % sliderGames.length);
                  try { soundEngine.play('click'); hapticService.tap(); } catch {}
                }}
                className="w-6 h-6 rounded-lg bg-white/5 hover:bg-white/10 active:scale-90 border border-white/10 text-slate-300 flex items-center justify-center transition-all cursor-pointer"
                title="Game trước"
              >
                <ChevronLeft className="w-3.5 h-3.5" />
              </button>

              <span className="text-[10px] font-mono font-bold text-slate-400 px-1">
                {activeSlide + 1}/{sliderGames.length}
              </span>

              <button
                type="button"
                onClick={() => {
                  setActiveSlide((prev) => (prev + 1) % sliderGames.length);
                  try { soundEngine.play('click'); hapticService.tap(); } catch {}
                }}
                className="w-6 h-6 rounded-lg bg-white/5 hover:bg-white/10 active:scale-90 border border-white/10 text-slate-300 flex items-center justify-center transition-all cursor-pointer"
                title="Game tiếp theo"
              >
                <ChevronRight className="w-3.5 h-3.5" />
              </button>
            </div>
          </div>

          {/* Main Content: Icon, Title, Description, and Actions */}
          <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-3">
            {/* Left: Icon, Title, Short Description */}
            <div className="flex items-center gap-3 min-w-0">
              <div
                className="w-12 h-12 sm:w-13 sm:h-13 rounded-2xl flex items-center justify-center text-2xl sm:text-3xl shadow-lg border border-white/15 shrink-0 group-hover:scale-105 transition-transform cursor-pointer"
                style={{ backgroundColor: `${activeGame.themeColor}25` }}
                onClick={() => openGameDetail(activeGame.id)}
              >
                {activeGame.icon}
              </div>

              <div className="min-w-0">
                <h2
                  onClick={() => openGameDetail(activeGame.id)}
                  className="text-base sm:text-lg font-black italic uppercase text-white tracking-tight truncate font-display group-hover:text-indigo-300 transition-colors cursor-pointer"
                >
                  {activeGame.title}
                </h2>
                <p className="text-[11px] sm:text-xs text-slate-300 line-clamp-1 font-medium">
                  {activeGame.shortDesc}
                </p>
              </div>
            </div>

            {/* Right: Actions & High Score */}
            <div className="flex items-center gap-1.5 sm:gap-2 shrink-0 justify-end flex-wrap sm:flex-nowrap pt-1 sm:pt-0 border-t sm:border-t-0 border-white/5">
              {/* Personal Record (Icon Only) */}
              <div className="flex items-center gap-1.5 px-2.5 py-1.5 rounded-xl bg-black/40 border border-white/5 text-[11px] text-slate-300" title="Kỷ lục cá nhân">
                <Trophy className="w-3.5 h-3.5 text-yellow-500 shrink-0" />
                <strong className="text-yellow-400 font-mono text-xs">
                  {(profile?.stats?.highScores?.[activeGame.id] || 0).toLocaleString()}
                </strong>
              </div>

              {/* Favorite Button */}
              <button
                id="btn-fav-featured"
                type="button"
                onClick={() => toggleFavorite(activeGame.id)}
                className={`p-2 rounded-xl border transition-all active:scale-95 cursor-pointer min-h-[36px] min-w-[36px] flex items-center justify-center ${
                  isActiveGameFav
                    ? 'bg-rose-500/20 text-rose-400 border-rose-500/40 shadow-sm'
                    : 'bg-white/5 text-slate-400 border-white/10 hover:text-white hover:bg-white/10'
                }`}
                title={isActiveGameFav ? 'Đã Yêu Thích' : 'Thêm Vào Yêu Thích'}
              >
                <Heart className={`w-4 h-4 ${isActiveGameFav ? 'fill-rose-500 text-rose-500' : ''}`} />
              </button>

              {/* Top 5 & Details Button */}
              <button
                id="btn-detail-featured"
                type="button"
                onClick={() => openGameDetail(activeGame.id)}
                className="p-2 rounded-xl bg-white/5 hover:bg-white/10 text-slate-300 hover:text-white border border-white/10 flex items-center justify-center active:scale-95 transition-all cursor-pointer min-h-[36px] min-w-[36px]"
                title="Xem Top 5 & Thể Lệ"
              >
                <Trophy className="w-4 h-4 text-yellow-400" />
              </button>

              {/* AI Practice Button */}
              {activeGame.supportsAI && (
                <button
                  id="btn-launch-featured-ai"
                  type="button"
                  onClick={() => launchGame(activeGame.id, true)}
                  className="p-2 rounded-xl bg-indigo-600/30 hover:bg-indigo-600/50 text-indigo-300 border border-indigo-500/30 flex items-center justify-center active:scale-95 transition-all cursor-pointer min-h-[36px] min-w-[36px]"
                  title="Luyện Với AI"
                >
                  <Bot className="w-4 h-4" />
                </button>
              )}

              {/* Launch Play Button (Icon Only) */}
              <button
                id="btn-launch-featured"
                type="button"
                onClick={() => launchGame(activeGame.id)}
                className="p-2 sm:px-3 rounded-xl bg-gradient-to-r from-indigo-500 via-indigo-600 to-purple-600 hover:from-indigo-400 hover:to-purple-500 text-white font-extrabold shadow-lg shadow-indigo-500/25 hover:scale-105 active:scale-95 transition-all flex items-center justify-center cursor-pointer min-h-[36px] min-w-[36px]"
                title="Chơi Ngay"
              >
                <Play className="w-4 h-4 fill-current text-white" />
              </button>
            </div>
          </div>

          {/* Bottom Pagination Dots */}
          <div className="flex items-center justify-center gap-1.5 pt-1">
            {sliderGames.map((game, idx) => {
              const isActive = idx === activeSlide;
              return (
                <button
                  key={game.id}
                  type="button"
                  onClick={() => {
                    setActiveSlide(idx);
                    try { soundEngine.play('click'); hapticService.tap(); } catch {}
                  }}
                  className={`transition-all duration-300 rounded-full cursor-pointer ${
                    isActive
                      ? 'w-6 h-1.5 bg-gradient-to-r from-indigo-400 to-fuchsia-400 shadow-sm shadow-indigo-500/50'
                      : 'w-1.5 h-1.5 bg-white/20 hover:bg-white/40'
                  }`}
                  title={game.title}
                />
              );
            })}
          </div>
        </div>
      </section>

      {/* ========================================================================= */}
      {/* 2-COLUMN MAIN LAYOUT: GAMES GRID (LEFT) & SIDEBAR (RIGHT)                   */}
      {/* ========================================================================= */}
      <div className="grid grid-cols-1 lg:grid-cols-12 gap-5 items-start">
        
        {/* LEFT / MAIN COLUMN: GAMES CATALOG (Pushed Up for Immediate Play) */}
        <div className="lg:col-span-8 xl:col-span-8 2xl:col-span-9 space-y-3.5 sm:space-y-4">
          
          {/* Compact Icon-Only Category Filters & Search Bar */}
          <div className="flex flex-col sm:flex-row items-center justify-between gap-2.5 sm:gap-3">
            {/* 7 Icon-Only Filter Buttons in a single balanced row, saving space and eliminating multi-row wrap */}
            <div className="grid grid-cols-7 gap-1 sm:gap-1.5 w-full sm:w-auto">
              {CATEGORY_ITEMS.map((item) => {
                const isSelected = selectedCategory === item.id;
                const favCount = favorites.length;
                const IconComp = item.icon;

                return (
                  <button
                    key={item.id}
                    id={`btn-filter-${item.id.toLowerCase().replace(/\s+/g, '-')}`}
                    type="button"
                    title={item.title}
                    aria-label={item.title}
                    onClick={() => {
                      setSelectedCategory(item.id);
                      try {
                        soundEngine.play('click');
                        hapticService.tap();
                      } catch {}
                    }}
                    className={`relative min-h-[46px] h-11 sm:h-12 w-full sm:w-12 rounded-xl flex items-center justify-center transition-all cursor-pointer border touch-manipulation select-none overflow-hidden ${
                      isSelected
                        ? `${item.activeColor} shadow-md scale-105 z-10 font-bold`
                        : 'bg-[#14141c] hover:bg-white/10 text-slate-300 hover:text-white border-white/10 active:scale-95'
                    }`}
                  >
                    <div className="w-full h-full flex items-center justify-center pointer-events-none p-2.5">
                      <IconComp
                        className={`w-5 h-5 pointer-events-none transition-transform ${
                          isSelected ? 'text-current scale-110 drop-shadow-sm' : `${item.defaultColor}`
                        }`}
                        strokeWidth={2.4}
                      />
                    </div>
                    {item.id === 'Yêu Thích' && favCount > 0 && (
                      <span className={`absolute top-1 right-1 px-1 min-w-[15px] h-3.5 text-[8px] font-black rounded-full border shadow-sm flex items-center justify-center pointer-events-none ${
                        isSelected ? 'bg-white text-rose-600 border-rose-300 font-bold' : 'bg-rose-500 text-white border-slate-900'
                      }`}>
                        {favCount}
                      </span>
                    )}
                  </button>
                );
              })}
            </div>

            {/* Search Field */}
            <div className="relative w-full sm:w-56">
              <Search className="absolute left-3.5 top-1/2 -translate-y-1/2 w-4 h-4 text-slate-500" />
              <input
                id="input-search-games"
                type="text"
                value={searchQuery}
                onChange={(e) => setSearchQuery(e.target.value)}
                placeholder="Tìm kiếm..."
                className="w-full pl-10 pr-4 py-2 rounded-xl bg-[#141414] border border-white/5 focus:border-indigo-500 text-xs sm:text-sm text-white placeholder-slate-500 outline-none transition-colors min-h-[40px]"
              />
            </div>
          </div>

          {/* Section Header */}
          <div className="flex items-center justify-between pt-0.5">
            <div id="heading-game-library" className="flex items-center gap-2">
              <Layers className="w-4 h-4 text-indigo-400" />
              <span className="text-xs font-mono font-bold text-slate-400">
                ({filteredGames.length})
              </span>
            </div>
          </div>

          {/* Empty state when filtering favorites */}
          {filteredGames.length === 0 ? (
            <div className="rounded-2xl border border-white/5 bg-[#121216] p-10 text-center space-y-4">
              <div className="w-14 h-14 rounded-2xl bg-rose-500/10 border border-rose-500/20 text-rose-400 flex items-center justify-center mx-auto text-2xl">
                <Heart className="w-7 h-7" />
              </div>
              <div className="max-w-md mx-auto space-y-1.5">
                <h4 className="text-base font-bold text-white">
                  {selectedCategory === 'Yêu Thích' ? 'Chưa có trò chơi yêu thích' : 'Không tìm thấy kết quả phù hợp'}
                </h4>
                <p className="text-xs text-slate-400 leading-relaxed">
                  {selectedCategory === 'Yêu Thích'
                    ? 'Nhấp vào biểu tượng trái tim ❤️ ở góc bất kỳ thẻ game nào để lưu vào danh sách yêu thích truy cập nhanh.'
                    : 'Hãy thử đổi từ khóa tìm kiếm hoặc chọn danh mục khác.'}
                </p>
              </div>
              {selectedCategory === 'Yêu Thích' && (
                <button
                  id="btn-show-all-games"
                  type="button"
                  onClick={() => setSelectedCategory('Tất Cả')}
                  className="px-4 py-2 rounded-xl bg-indigo-600 hover:bg-indigo-500 active:scale-95 text-white font-bold text-xs transition-all inline-flex items-center gap-1.5 cursor-pointer min-h-[40px]"
                >
                  <span>Khám phá tất cả trò chơi</span>
                </button>
              )}
            </div>
          ) : (
            <div className="grid grid-cols-2 sm:grid-cols-3 md:grid-cols-3 lg:grid-cols-3 xl:grid-cols-3 2xl:grid-cols-4 gap-2 sm:gap-2.5">
              {filteredGames.map((game) => {
                const personalHighScore = profile?.stats?.highScores?.[game.id] || 0;
                const isFav = favorites.includes(game.id);
                const stats = GAME_PLAYER_STATS[game.id] || { activePlayers: 500, totalPlays: '15.0K', rating: 4.8 };

                return (
                  <LazyGameCard
                    key={game.id}
                    game={game}
                    personalHighScore={personalHighScore}
                    isFav={isFav}
                    stats={stats}
                    onOpenDetail={openGameDetail}
                    onToggleFavorite={toggleFavorite}
                    onLaunchGame={launchGame}
                  />
                );
              })}
            </div>
          )}
        </div>

        {/* RIGHT / SIDEBAR COLUMN: RECENTLY PLAYED, TOP CAO THỦ & QUICK PVP */}
        <aside className="lg:col-span-4 xl:col-span-4 2xl:col-span-3 space-y-4">
          
          {/* RECENTLY PLAYED SECTION (Moved to right sidebar, vertical layout, right above Top Cao Thủ) */}
          <section aria-labelledby="heading-recently-played" className="rounded-2xl bg-gradient-to-br from-[#121218] via-[#101014] to-[#0c0c10] border border-white/10 p-3.5 shadow-xl space-y-2.5">
            <div className="flex items-center justify-between pb-2 border-b border-white/5">
              <div className="flex items-center gap-2">
                <div className="w-6 h-6 rounded-lg bg-indigo-500/20 border border-indigo-500/30 flex items-center justify-center text-indigo-400" title="Vừa Chơi Gần Đây">
                  <History className="w-3.5 h-3.5" />
                </div>
              </div>
            </div>

            <div className="space-y-2">
              {recentGamesList.map((game) => {
                const isFav = favorites.includes(game.id);
                const personalHighScore = profile?.stats?.highScores?.[game.id] || 0;

                return (
                  <div
                    key={`recent-${game.id}`}
                    className="relative rounded-xl bg-[#16161c] border border-white/5 hover:border-indigo-500/40 p-2.5 transition-all duration-300 flex items-center justify-between gap-2 group"
                  >
                    <div className="flex items-center gap-2 min-w-0 flex-1">
                      <div
                        className="w-9 h-9 rounded-xl flex items-center justify-center text-lg shadow-md border border-white/5 shrink-0 group-hover:scale-105 transition-transform"
                        style={{ backgroundColor: `${game.themeColor}25` }}
                      >
                        {game.icon}
                      </div>
                      <div className="min-w-0 flex-1">
                        <h4 className="text-xs font-bold text-white group-hover:text-indigo-400 transition-colors truncate">
                          {game.title}
                        </h4>
                        <span className="text-[10px] font-mono text-yellow-400 font-semibold block truncate">
                          🏆 {personalHighScore.toLocaleString()}
                        </span>
                      </div>
                    </div>

                    <div className="flex items-center gap-1 shrink-0">
                      {/* Favorite Icon Only */}
                      <button
                        id={`btn-fav-recent-${game.id}`}
                        type="button"
                        onClick={(e) => {
                          e.stopPropagation();
                          toggleFavorite(game.id);
                        }}
                        className={`p-1.5 rounded-lg border transition-all active:scale-95 cursor-pointer min-h-[30px] min-w-[30px] flex items-center justify-center ${
                          isFav
                            ? 'bg-rose-500/20 text-rose-400 border-rose-500/40'
                            : 'bg-white/5 text-slate-500 border-white/5 hover:text-white hover:bg-white/10'
                        }`}
                        title={isFav ? 'Bỏ Yêu Thích' : 'Thêm Vào Yêu Thích'}
                      >
                        <Heart className={`w-3.5 h-3.5 ${isFav ? 'fill-rose-500 text-rose-500' : ''}`} />
                      </button>

                      {/* Top 5 Icon Only */}
                      <button
                        id={`btn-detail-recent-${game.id}`}
                        type="button"
                        onClick={() => openGameDetail(game.id)}
                        className="p-1.5 rounded-lg bg-white/5 hover:bg-white/10 text-slate-300 hover:text-white border border-white/5 transition-all flex items-center justify-center active:scale-95 cursor-pointer min-h-[30px] min-w-[30px]"
                        title="Top 5 & Thể Lệ"
                      >
                        <Trophy className="w-3.5 h-3.5 text-yellow-400" />
                      </button>

                      {/* Play Icon Only */}
                      <button
                        id={`btn-play-recent-${game.id}`}
                        type="button"
                        onClick={() => launchGame(game.id)}
                        className="p-1.5 rounded-lg bg-indigo-600 hover:bg-indigo-500 text-white shadow-md shadow-indigo-500/20 transition-all flex items-center justify-center active:scale-95 cursor-pointer min-h-[30px] min-w-[30px]"
                        title="Chơi Ngay"
                      >
                        <Play className="w-3 h-3 fill-current" />
                      </button>
                    </div>
                  </div>
                );
              })}
            </div>
          </section>

          {/* Top Weekly Players Leaderboard Widget */}
          <TopWeeklyPlayersWidget />

          {/* Quick PvP Matchmaking Shortcut Card (Icon Buttons) */}
          <div className="rounded-2xl bg-gradient-to-br from-[#14121a] to-[#0e0d14] border border-purple-500/20 p-3.5 shadow-xl space-y-2.5">
            <div className="flex items-center justify-between pb-2 border-b border-white/5">
              <div className="flex items-center gap-2">
                <span className="text-base" title="Đấu Đối Kháng PvP Nổi Bật">⚔️</span>
              </div>
              <span className="w-2 h-2 rounded-full bg-purple-400 animate-pulse" title="Real-time PvP" />
            </div>

            <div className="space-y-2">
              <div 
                onClick={() => launchGame('caro-gomoku')}
                className="p-2 rounded-xl bg-black/40 hover:bg-white/5 border border-white/5 hover:border-indigo-500/40 transition-all cursor-pointer flex items-center justify-between group active:scale-95"
              >
                <div className="flex items-center gap-2">
                  <span className="text-xl">⭕</span>
                  <div>
                    <div className="text-xs font-bold text-white group-hover:text-indigo-400 transition-colors">Cờ Caro</div>
                    <div className="text-[10px] text-slate-400">15x15 • ELO</div>
                  </div>
                </div>
                <button 
                  type="button"
                  onClick={(e) => {
                    e.stopPropagation();
                    launchGame('caro-gomoku');
                  }}
                  className="p-2 rounded-lg bg-indigo-600 hover:bg-indigo-500 text-white shadow transition-all cursor-pointer flex items-center justify-center"
                  title="Vào Bàn Đấu Cờ Caro"
                >
                  <Play className="w-3.5 h-3.5 fill-current" />
                </button>
              </div>

              <div 
                onClick={() => launchGame('chess')}
                className="p-2 rounded-xl bg-black/40 hover:bg-white/5 border border-white/5 hover:border-amber-500/40 transition-all cursor-pointer flex items-center justify-between group active:scale-95"
              >
                <div className="flex items-center gap-2">
                  <span className="text-xl">♟️</span>
                  <div>
                    <div className="text-xs font-bold text-white group-hover:text-amber-400 transition-colors">Cờ Vua</div>
                    <div className="text-[10px] text-slate-400">FIDE • ELO</div>
                  </div>
                </div>
                <button 
                  type="button"
                  onClick={(e) => {
                    e.stopPropagation();
                    launchGame('chess');
                  }}
                  className="p-2 rounded-lg bg-amber-600 hover:bg-amber-500 text-white shadow transition-all cursor-pointer flex items-center justify-center"
                  title="Vào Bàn Đấu Cờ Vua"
                >
                  <Play className="w-3.5 h-3.5 fill-current" />
                </button>
              </div>
            </div>
          </div>
        </aside>

      </div>
    </div>
  );
};
