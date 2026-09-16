import React, { useState, useMemo, useRef } from 'react';
import { ALL_GAMES_LIST, GAME_REGISTRY } from '../games/registry';
import { usePlayer } from '../context/PlayerContext';
import { useGame } from '../context/GameContext';
import { TopWeeklyPlayersWidget } from './TopWeeklyPlayersWidget';
import { RecommendedGamesSection } from './RecommendedGamesSection';
import { LazyGameCard } from './common/LazyGameCard';
import { getResolvedHallOfFame } from '../data/hallOfFameData';
import { soundEngine } from '../services/audio';
import { hapticService } from '../services/haptics';
import {
  Search,
  Play,
  Bot,
  Trophy,
  Sparkles,
  Zap,
  Tag,
  ShieldCheck,
  Flame,
  Layers,
  Heart,
  History,
  Clock,
  RotateCcw,
  Users,
  Info,
  Gamepad2,
  CheckCircle2,
  Gift,
  RefreshCw,
  Crown,
  ChevronRight,
} from 'lucide-react';

const CATEGORIES = ['Tất Cả', 'Yêu Thích', 'Multiplayer', 'Arcade', 'Action', 'Puzzle', 'Reflex'] as const;

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

  const featuredGame = ALL_GAMES_LIST[0]; // Neon Runner 2099 as spotlight hero
  const isFeaturedFav = favorites.includes(featuredGame.id);

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

  // Hall of Fame quick stats for the 1-row hub
  const hallOfFameEntries = useMemo(() => {
    return getResolvedHallOfFame(profile);
  }, [profile]);
  const userHofCount = useMemo(() => {
    return hallOfFameEntries.filter(e => e.isUserHolder).length;
  }, [hallOfFameEntries]);

  // Daily Challenge completed count
  const completedChallengesCount = useMemo(() => {
    return Object.values(dailyChallenges || {}).filter((c: any) => c?.completed).length;
  }, [dailyChallenges]);

  // Streak status
  const todayDateStr = useMemo(() => new Date().toISOString().split('T')[0], []);
  const isClaimedStreakToday = profile.stats.lastLoginDate === todayDateStr;

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
      {/* 1. COMPACT SPOTLIGHT FEATURED GAME BANNER                                 */}
      {/* ========================================================================= */}
      <section className="relative rounded-2xl overflow-hidden border border-white/10 bg-gradient-to-r from-indigo-950/80 via-[#10101c] to-[#0d0d14] p-3 sm:p-4 shadow-lg group">
        <div className="absolute inset-0 bg-[radial-gradient(ellipse_at_top_right,rgba(99,102,241,0.18),transparent_70%)] pointer-events-none" />

        <div className="relative z-10 flex flex-col sm:flex-row sm:items-center justify-between gap-3">
          {/* Left: Icon, Badge, Title & Tags */}
          <div className="flex items-center gap-3 min-w-0">
            <div
              className="w-11 h-11 sm:w-12 sm:h-12 rounded-xl flex items-center justify-center text-2xl shadow-md border border-white/10 shrink-0 group-hover:scale-105 transition-transform cursor-pointer"
              style={{ backgroundColor: `${featuredGame.themeColor}25` }}
              onClick={() => openGameDetail(featuredGame.id)}
            >
              {featuredGame.icon}
            </div>

            <div className="min-w-0">
              <div className="flex items-center gap-2 mb-0.5 flex-wrap">
                <span className="inline-flex items-center gap-1 px-2 py-0.5 rounded-full bg-indigo-500/25 border border-indigo-400/30 text-[9px] sm:text-[10px] font-black text-indigo-300 uppercase tracking-wider">
                  <Flame className="w-3 h-3 text-amber-400 animate-pulse" />
                  <span>GAME NỔI BẬT HÔM NAY</span>
                </span>
                <span className="text-[10px] text-slate-400 font-bold uppercase px-1.5 py-0.5 rounded bg-white/5 border border-white/5">
                  {featuredGame.category}
                </span>
              </div>

              <h2
                onClick={() => openGameDetail(featuredGame.id)}
                className="text-sm sm:text-base font-black italic uppercase text-white tracking-tight truncate font-display group-hover:text-indigo-300 transition-colors cursor-pointer"
              >
                {featuredGame.title}
              </h2>
            </div>
          </div>

          {/* Right: Actions & High Score */}
          <div className="flex items-center gap-2 shrink-0 justify-end flex-wrap sm:flex-nowrap pt-1 sm:pt-0 border-t sm:border-t-0 border-white/5">
            {/* Personal Record */}
            <div className="flex items-center gap-1.5 px-2.5 py-1.5 rounded-xl bg-black/40 border border-white/5 text-[11px] text-slate-300">
              <Trophy className="w-3.5 h-3.5 text-yellow-500 shrink-0" />
              <span className="text-slate-400 hidden xs:inline">Kỷ lục:</span>
              <strong className="text-yellow-400 font-mono text-xs">
                {(profile?.stats?.highScores?.[featuredGame.id] || 0).toLocaleString()}
              </strong>
            </div>

            {/* Favorite Button */}
            <button
              id="btn-fav-featured"
              type="button"
              onClick={() => toggleFavorite(featuredGame.id)}
              className={`p-2 rounded-xl border transition-all active:scale-95 cursor-pointer min-h-[36px] min-w-[36px] flex items-center justify-center ${
                isFeaturedFav
                  ? 'bg-rose-500/20 text-rose-400 border-rose-500/40 shadow-sm'
                  : 'bg-white/5 text-slate-400 border-white/10 hover:text-white hover:bg-white/10'
              }`}
              title={isFeaturedFav ? 'Đã Yêu Thích' : 'Thêm Vào Yêu Thích'}
            >
              <Heart className={`w-4 h-4 ${isFeaturedFav ? 'fill-rose-500 text-rose-500' : ''}`} />
            </button>

            {/* Top 5 & Details Button */}
            <button
              id="btn-detail-featured"
              type="button"
              onClick={() => openGameDetail(featuredGame.id)}
              className="p-2 rounded-xl bg-white/5 hover:bg-white/10 text-slate-300 hover:text-white border border-white/10 flex items-center justify-center active:scale-95 transition-all cursor-pointer min-h-[36px] min-w-[36px]"
              title="Xem Top 5 & Thể Lệ"
            >
              <Trophy className="w-4 h-4 text-yellow-400" />
            </button>

            {/* AI Practice Button */}
            {featuredGame.supportsAI && (
              <button
                id="btn-launch-featured-ai"
                type="button"
                onClick={() => launchGame(featuredGame.id, true)}
                className="p-2 rounded-xl bg-indigo-600/30 hover:bg-indigo-600/50 text-indigo-300 border border-indigo-500/30 flex items-center justify-center active:scale-95 transition-all cursor-pointer min-h-[36px] min-w-[36px]"
                title="Luyện Với AI"
              >
                <Bot className="w-4 h-4" />
              </button>
            )}

            {/* Launch Play Button */}
            <button
              id="btn-launch-featured"
              type="button"
              onClick={() => launchGame(featuredGame.id)}
              className="px-3.5 py-1.5 rounded-xl bg-gradient-to-r from-indigo-500 to-indigo-600 hover:from-indigo-400 hover:to-indigo-500 text-white font-extrabold text-xs shadow-md shadow-indigo-500/20 hover:scale-105 active:scale-95 transition-all flex items-center justify-center gap-1.5 cursor-pointer min-h-[36px]"
              title="Chơi Ngay"
            >
              <Play className="w-4 h-4 fill-current text-white" />
              <span>Chơi Ngay</span>
            </button>
          </div>
        </div>
      </section>

      {/* ========================================================================= */}
      {/* 2. UNIFIED QUICK HUB: 5 ICONS ON 1 SINGLE HORIZONTAL ROW (NO SCROLL)        */}
      {/* ĐIỂM DANH | VÒNG QUAY | LỊCH THÁNG | THỬ THÁCH | DANH VỌNG                */}
      {/* ========================================================================= */}
      <div className="grid grid-cols-5 gap-1.5 sm:gap-2.5 bg-[#12111d]/90 border border-white/10 rounded-2xl p-1.5 sm:p-2.5 shadow-lg">
        {/* ICON 1: Chuỗi Đăng Nhập (Daily Streak) */}
        <button
          id="btn-hub-daily-streak"
          type="button"
          onClick={() => {
            try {
              soundEngine.play('click');
              hapticService.tap();
            } catch {}
            setActiveModal('dailyReward');
          }}
          className="flex flex-col items-center justify-center p-1 sm:p-2 rounded-xl bg-white/[0.03] hover:bg-orange-500/15 border border-white/5 hover:border-orange-500/30 transition-all active:scale-95 group text-center cursor-pointer relative overflow-hidden"
          title="Điểm danh nhận quà theo chuỗi"
        >
          <div className="w-8 h-8 sm:w-10 sm:h-10 rounded-xl bg-orange-500/20 border border-orange-500/40 text-orange-400 flex items-center justify-center shrink-0 relative group-hover:scale-105 transition-transform">
            <Flame className="w-4 h-4 sm:w-5 sm:h-5 text-orange-400 fill-orange-400 animate-pulse" />
            <span className="absolute -bottom-1 -right-1 px-1 bg-black/90 rounded-full text-[8px] sm:text-[9px] font-black text-orange-400 border border-orange-500/60">
              {profile.stats.dailyStreak || 1}d
            </span>
            {!isClaimedStreakToday && (
              <span className="absolute -top-1 -right-1 w-2 h-2 rounded-full bg-amber-400 ring-2 ring-black animate-ping" />
            )}
          </div>
          <span className="text-[10px] sm:text-[11px] font-bold text-white group-hover:text-orange-300 truncate w-full mt-1">
            Điểm Danh
          </span>
          <span className="text-[8px] sm:text-[9px] text-orange-400/90 font-medium truncate w-full hidden xs:block">
            {!isClaimedStreakToday ? 'Nhận ngay' : 'Đã nhận ✓'}
          </span>
        </button>

        {/* ICON 2: Vòng Quay May Mắn (Daily Spin Wheel) */}
        <button
          id="btn-hub-spin-wheel"
          type="button"
          onClick={() => {
            try {
              soundEngine.play('click');
              hapticService.tap();
            } catch {}
            setActiveModal('spinWheel');
          }}
          className="flex flex-col items-center justify-center p-1 sm:p-2 rounded-xl bg-white/[0.03] hover:bg-pink-500/15 border border-white/5 hover:border-pink-500/30 transition-all active:scale-95 group text-center cursor-pointer relative overflow-hidden"
          title="Vòng quay may mắn hàng ngày"
        >
          <div className="w-8 h-8 sm:w-10 sm:h-10 rounded-xl bg-pink-500/20 border border-pink-500/40 text-pink-400 flex items-center justify-center text-base sm:text-xl shrink-0 relative group-hover:scale-105 transition-transform">
            🎡
            {profile.stats.lastSpinDate !== todayDateStr && (
              <span className="absolute -top-1 -right-1 w-2 h-2 rounded-full bg-pink-400 ring-2 ring-black animate-pulse" />
            )}
          </div>
          <span className="text-[10px] sm:text-[11px] font-bold text-white group-hover:text-pink-300 truncate w-full mt-1">
            Vòng Quay
          </span>
          <span className="text-[8px] sm:text-[9px] text-pink-400/90 font-medium truncate w-full hidden xs:block">
            {profile.stats.lastSpinDate !== todayDateStr ? 'Có lượt' : 'Đã quay'}
          </span>
        </button>

        {/* ICON 3: Lịch Điểm Danh Tháng 30 Ngày (Monthly Login) */}
        <button
          id="btn-hub-monthly-login"
          type="button"
          onClick={() => {
            try {
              soundEngine.play('click');
              hapticService.tap();
            } catch {}
            setActiveModal('monthlyLogin');
          }}
          className="flex flex-col items-center justify-center p-1 sm:p-2 rounded-xl bg-white/[0.03] hover:bg-indigo-500/15 border border-white/5 hover:border-indigo-500/30 transition-all active:scale-95 group text-center cursor-pointer relative overflow-hidden"
          title="Lịch điểm danh tích lũy 30 ngày"
        >
          <div className="w-8 h-8 sm:w-10 sm:h-10 rounded-xl bg-indigo-500/20 border border-indigo-500/40 text-indigo-400 flex items-center justify-center text-base sm:text-xl shrink-0 relative group-hover:scale-105 transition-transform">
            📅
          </div>
          <span className="text-[10px] sm:text-[11px] font-bold text-white group-hover:text-indigo-300 truncate w-full mt-1">
            Lịch Tháng
          </span>
          <span className="text-[8px] sm:text-[9px] text-indigo-400/90 font-medium truncate w-full hidden xs:block">
            30 Ngày
          </span>
        </button>

        {/* ICON 4: Thử Thách Hàng Ngày (Daily Challenge) */}
        <button
          id="btn-hub-daily-challenge"
          type="button"
          onClick={() => {
            try {
              soundEngine.play('click');
              hapticService.tap();
            } catch {}
            setActiveModal('dailyChallengesList');
          }}
          className="flex flex-col items-center justify-center p-1 sm:p-2 rounded-xl bg-white/[0.03] hover:bg-amber-500/15 border border-white/5 hover:border-amber-500/30 transition-all active:scale-95 group text-center cursor-pointer relative overflow-hidden"
          title="Nhiệm vụ và thử thách hàng ngày"
        >
          <div className="w-8 h-8 sm:w-10 sm:h-10 rounded-xl bg-amber-500/20 border border-amber-500/40 text-amber-400 flex items-center justify-center text-base sm:text-lg shrink-0 relative group-hover:scale-105 transition-transform">
            🎯
            <span className="absolute -bottom-1 -right-1 px-1 bg-black/90 rounded-full text-[8px] sm:text-[9px] font-black text-amber-400 border border-amber-500/60">
              {completedChallengesCount}/{ALL_GAMES_LIST.length}
            </span>
          </div>
          <span className="text-[10px] sm:text-[11px] font-bold text-white group-hover:text-amber-300 truncate w-full mt-1">
            Thử Thách
          </span>
          <span className="text-[8px] sm:text-[9px] text-amber-400/90 font-medium truncate w-full hidden xs:block">
            Nhiệm vụ
          </span>
        </button>

        {/* ICON 5: Đại Sảnh Danh Vọng (Hall of Fame) */}
        <button
          id="btn-hub-hall-of-fame"
          type="button"
          onClick={() => {
            try {
              soundEngine.play('click');
              hapticService.tap();
            } catch {}
            setActiveModal('hallOfFame');
          }}
          className="flex flex-col items-center justify-center p-1 sm:p-2 rounded-xl bg-white/[0.03] hover:bg-yellow-500/15 border border-white/5 hover:border-yellow-500/30 transition-all active:scale-95 group text-center cursor-pointer relative overflow-hidden"
          title="Bảng kỷ lục đại sảnh danh vọng server"
        >
          <div className="w-8 h-8 sm:w-10 sm:h-10 rounded-xl bg-yellow-500/20 border border-yellow-500/40 text-yellow-400 flex items-center justify-center shrink-0 relative group-hover:scale-105 transition-transform">
            <Crown className="w-4 h-4 sm:w-5 sm:h-5 text-yellow-400" />
            <span className="absolute -bottom-1 -right-1 px-1 bg-black/90 rounded-full text-[8px] sm:text-[9px] font-black text-yellow-400 border border-yellow-500/60">
              {hallOfFameEntries.length}
            </span>
          </div>
          <span className="text-[10px] sm:text-[11px] font-bold text-white group-hover:text-yellow-300 truncate w-full mt-1">
            Danh Vọng
          </span>
          <span className="text-[8px] sm:text-[9px] text-yellow-400/90 font-medium truncate w-full hidden xs:block">
            Kỷ lục
          </span>
        </button>
      </div>

      {/* ========================================================================= */}
      {/* 2-COLUMN MAIN LAYOUT: GAMES GRID (LEFT) & SIDEBAR (RIGHT)                   */}
      {/* ========================================================================= */}
      <div className="grid grid-cols-1 lg:grid-cols-12 gap-5 items-start">
        
        {/* LEFT / MAIN COLUMN: GAMES CATALOG (Pushed Up for Immediate Play) */}
        <div className="lg:col-span-8 xl:col-span-8 2xl:col-span-9 space-y-3.5 sm:space-y-4">
          
          {/* Hệ thống gợi ý game dựa trên lịch sử chơi (Game Đề Xuất Cho Bạn) */}
          <RecommendedGamesSection
            allGames={ALL_GAMES_LIST}
            gamesPlayedCount={profile?.stats?.gamesPlayedCount}
            recentlyPlayed={recentlyPlayed}
            favorites={favorites}
            highScores={profile?.stats?.highScores}
            onLaunchGame={launchGame}
            onOpenDetail={openGameDetail}
            onToggleFavorite={toggleFavorite}
          />

          {/* Category Filter Chips & Search Bar */}
          <div className="flex flex-col sm:flex-row items-center justify-between gap-2.5 sm:gap-3">
            {/* Category & Favorites Pills: Naturally wrapping on mobile, NO horizontal scroll */}
            <div className="flex flex-wrap items-center gap-1.5 w-full sm:w-auto">
              {CATEGORIES.map((cat) => {
                const isSelected = selectedCategory === cat;
                const favCount = favorites.length;

                // Map category to icon and label
                let iconSymbol = '🎮';
                let label: string = cat;
                if (cat === 'Yêu Thích') { iconSymbol = '❤️'; label = 'Yêu Thích'; }
                else if (cat === 'Multiplayer') { iconSymbol = '👥'; label = 'PvP'; }
                else if (cat === 'Arcade') { iconSymbol = '🕹️'; label = 'Arcade'; }
                else if (cat === 'Action') { iconSymbol = '⚔️'; label = 'Hành Động'; }
                else if (cat === 'Puzzle') { iconSymbol = '🧩'; label = 'Giải Đố'; }
                else if (cat === 'Reflex') { iconSymbol = '⚡'; label = 'Phản Xạ'; }

                return (
                  <button
                    key={cat}
                    id={`btn-filter-${cat.toLowerCase().replace(/\s+/g, '-')}`}
                    type="button"
                    onClick={() => setSelectedCategory(cat)}
                    className={`px-3 py-2 rounded-xl text-xs font-bold whitespace-nowrap transition-colors flex items-center justify-center gap-1.5 cursor-pointer min-h-[38px] shrink-0 border ${
                      isSelected
                        ? cat === 'Yêu Thích'
                          ? 'bg-rose-600 text-white border-rose-500 shadow-lg shadow-rose-500/25'
                          : 'bg-indigo-600 text-white border-indigo-500 shadow-lg shadow-indigo-500/25'
                        : 'bg-[#141414] hover:bg-white/10 text-slate-300 border-white/5'
                    }`}
                  >
                    <span>{iconSymbol}</span>
                    <span>{label}</span>
                    {cat === 'Yêu Thích' && favCount > 0 && (
                      <span className={`text-[10px] px-1.5 py-0.2 rounded-full font-mono ${
                        isSelected ? 'bg-white/20 text-white' : 'bg-rose-500/20 text-rose-300'
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
                placeholder="Tìm kiếm mini-game..."
                className="w-full pl-10 pr-4 py-2 rounded-xl bg-[#141414] border border-white/5 focus:border-indigo-500 text-xs sm:text-sm text-white placeholder-slate-500 outline-none transition-colors min-h-[40px]"
              />
            </div>
          </div>

          {/* Section Header */}
          <div className="flex items-center justify-between pt-0.5">
            <h3 id="heading-game-library" className="text-xs font-bold uppercase tracking-widest text-slate-400 flex items-center gap-2">
              <Layers className="w-4 h-4 text-indigo-400" />
              <span>
                {selectedCategory === 'Yêu Thích' ? 'Trò chơi yêu thích của bạn' : 'Thư Viện Mini-Games'} ({filteredGames.length})
              </span>
            </h3>
            <span className="text-[11px] text-slate-500 font-medium hidden sm:inline">Chạm vào để chơi tức thì</span>
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
            <div className="grid grid-cols-2 sm:grid-cols-2 xl:grid-cols-3 gap-2 sm:gap-3">
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
          <section aria-labelledby="heading-recently-played" className="rounded-2xl bg-gradient-to-br from-[#121218] via-[#101014] to-[#0c0c10] border border-white/10 p-4 shadow-xl space-y-3">
            <div className="flex items-center justify-between pb-2 border-b border-white/5">
              <div className="flex items-center gap-2">
                <div className="w-6 h-6 rounded-lg bg-indigo-500/20 border border-indigo-500/30 flex items-center justify-center text-indigo-400">
                  <History className="w-3.5 h-3.5" />
                </div>
                <h3 id="heading-recently-played" className="text-xs font-bold uppercase tracking-wider text-white">
                  Vừa Chơi Gần Đây
                </h3>
              </div>
              <span className="text-[10px] text-slate-500 font-medium">Truy cập tức thì</span>
            </div>

            <div className="space-y-2.5">
              {recentGamesList.map((game) => {
                const isFav = favorites.includes(game.id);
                const personalHighScore = profile?.stats?.highScores?.[game.id] || 0;

                return (
                  <div
                    key={`recent-${game.id}`}
                    className="relative rounded-xl bg-[#16161c] border border-white/5 hover:border-indigo-500/40 p-3 transition-all duration-300 flex items-center justify-between gap-2.5 group"
                  >
                    <div className="flex items-center gap-2.5 min-w-0 flex-1">
                      <div
                        className="w-10 h-10 rounded-xl flex items-center justify-center text-xl shadow-md border border-white/5 shrink-0 group-hover:scale-105 transition-transform"
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

                    <div className="flex items-center gap-1.5 shrink-0">
                      {/* Favorite Icon Only */}
                      <button
                        id={`btn-fav-recent-${game.id}`}
                        type="button"
                        onClick={(e) => {
                          e.stopPropagation();
                          toggleFavorite(game.id);
                        }}
                        className={`p-2 rounded-lg border transition-all active:scale-95 cursor-pointer min-h-[34px] min-w-[34px] flex items-center justify-center ${
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
                        className="p-2 rounded-lg bg-white/5 hover:bg-white/10 text-slate-300 hover:text-white border border-white/5 transition-all flex items-center justify-center active:scale-95 cursor-pointer min-h-[34px] min-w-[34px]"
                        title="Top 5 & Thể Lệ"
                      >
                        <Trophy className="w-3.5 h-3.5 text-yellow-400" />
                      </button>

                      {/* Play Icon Only */}
                      <button
                        id={`btn-play-recent-${game.id}`}
                        type="button"
                        onClick={() => launchGame(game.id)}
                        className="p-2 rounded-lg bg-indigo-600 hover:bg-indigo-500 text-white shadow-md shadow-indigo-500/20 transition-all flex items-center justify-center active:scale-95 cursor-pointer min-h-[34px] min-w-[34px]"
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

          {/* Quick PvP Matchmaking Shortcut Card (Fixed working Đấu button) */}
          <div className="rounded-2xl bg-gradient-to-br from-[#14121a] to-[#0e0d14] border border-purple-500/20 p-4 shadow-xl space-y-3">
            <div className="flex items-center justify-between pb-2 border-b border-white/5">
              <div className="flex items-center gap-2">
                <span className="text-lg">⚔️</span>
                <h4 className="text-xs font-black uppercase tracking-wider text-purple-300 font-display">
                  Đấu Đối Kháng PvP Nổi Bật
                </h4>
              </div>
              <span className="text-[10px] font-mono text-purple-400/80 bg-purple-500/10 px-2 py-0.5 rounded-full">
                Real-time
              </span>
            </div>

            <div className="space-y-2">
              <div 
                onClick={() => launchGame('caro-gomoku')}
                className="p-2.5 rounded-xl bg-black/40 hover:bg-white/5 border border-white/5 hover:border-indigo-500/40 transition-all cursor-pointer flex items-center justify-between group active:scale-95"
              >
                <div className="flex items-center gap-2.5">
                  <span className="text-2xl">⭕</span>
                  <div>
                    <div className="text-xs font-bold text-white group-hover:text-indigo-400 transition-colors">Cờ Caro Online</div>
                    <div className="text-[10px] text-slate-400">Bàn cờ 15x15 • Xếp hạng ELO</div>
                  </div>
                </div>
                <button 
                  type="button"
                  onClick={(e) => {
                    e.stopPropagation();
                    launchGame('caro-gomoku');
                  }}
                  className="px-3 py-1.5 rounded-lg bg-indigo-600 hover:bg-indigo-500 text-white text-[11px] font-bold shadow transition-all cursor-pointer"
                >
                  Đấu
                </button>
              </div>

              <div 
                onClick={() => launchGame('chess')}
                className="p-2.5 rounded-xl bg-black/40 hover:bg-white/5 border border-white/5 hover:border-amber-500/40 transition-all cursor-pointer flex items-center justify-between group active:scale-95"
              >
                <div className="flex items-center gap-2.5">
                  <span className="text-2xl">♟️</span>
                  <div>
                    <div className="text-xs font-bold text-white group-hover:text-amber-400 transition-colors">Cờ Vua</div>
                    <div className="text-[10px] text-slate-400">Chuẩn FIDE • Đối kháng PvP</div>
                  </div>
                </div>
                <button 
                  type="button"
                  onClick={(e) => {
                    e.stopPropagation();
                    launchGame('chess');
                  }}
                  className="px-3 py-1.5 rounded-lg bg-amber-600 hover:bg-amber-500 text-white text-[11px] font-bold shadow transition-all cursor-pointer"
                >
                  Đấu
                </button>
              </div>
            </div>
          </div>
        </aside>

      </div>
    </div>
  );
};
