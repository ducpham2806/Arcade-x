import React, { useState, useMemo, useEffect } from 'react';
import { useGame } from '../context/GameContext';
import { usePlayer } from '../context/PlayerContext';
import { getResolvedHallOfFame } from '../data/hallOfFameData';
import { soundEngine } from '../services/audio';
import {
  Crown,
  Trophy,
  Sparkles,
  ChevronRight,
  ChevronDown,
  ChevronUp,
  Play,
  LayoutGrid,
  Columns3,
} from 'lucide-react';

export const HallOfFameSection: React.FC = () => {
  const { setActiveModal, launchGame } = useGame();
  const { profile } = usePlayer();
  const [selectedFilter, setSelectedFilter] = useState<'all' | 'user' | 'arcade' | 'puzzle' | 'pvp'>('all');

  // Collapse state: Default to true on mobile so the game catalog is immediately accessible!
  const [isCollapsed, setIsCollapsed] = useState<boolean>(() => {
    if (typeof window !== 'undefined') {
      const saved = localStorage.getItem('arcadex_hof_collapsed');
      if (saved !== null) {
        return saved === 'true';
      }
      return window.innerWidth < 768;
    }
    return false;
  });

  // Display mode on mobile when expanded: 'carousel' (horizontal reel) or 'grid' (vertical stack)
  const [mobileLayout, setMobileLayout] = useState<'carousel' | 'grid'>('carousel');

  const resolvedEntries = useMemo(() => {
    return getResolvedHallOfFame(profile);
  }, [profile]);

  const userRecordCount = useMemo(() => {
    return resolvedEntries.filter((e) => e.isUserHolder).length;
  }, [resolvedEntries]);

  const filteredEntries = useMemo(() => {
    if (selectedFilter === 'all') return resolvedEntries;
    if (selectedFilter === 'user') return resolvedEntries.filter((e) => e.isUserHolder);
    if (selectedFilter === 'arcade')
      return resolvedEntries.filter((e) =>
        ['neon-runner', 'cyber-slice', 'eat-em-all', 'dungeon-tap', 'cosmic-defense'].includes(e.gameId)
      );
    if (selectedFilter === 'puzzle')
      return resolvedEntries.filter((e) =>
        ['tile-2048', 'blocker', 'scoodoku', 'shikaku', 'hex-match'].includes(e.gameId)
      );
    if (selectedFilter === 'pvp')
      return resolvedEntries.filter((e) =>
        ['caro-gomoku', 'xiangqi', 'chess'].includes(e.gameId)
      );
    return resolvedEntries;
  }, [resolvedEntries, selectedFilter]);

  const handleToggleCollapse = () => {
    soundEngine.play('click');
    setIsCollapsed((prev) => {
      const next = !prev;
      localStorage.setItem('arcadex_hof_collapsed', String(next));
      return next;
    });
  };

  const handleOpenModal = () => {
    soundEngine.play('click');
    setActiveModal('hallOfFame');
  };

  const handleChallenge = (gameId: string, e: React.MouseEvent) => {
    e.stopPropagation();
    soundEngine.play('click');
    launchGame(gameId);
  };

  // Top 3 preview avatars for collapsed banner
  const topPreviewEntries = useMemo(() => {
    return resolvedEntries.slice(0, 4);
  }, [resolvedEntries]);

  // =========================================================================
  // 1. COLLAPSED VIEW: COMPACT SLIM BANNER (Only ~52px tall, doesn't push game catalog)
  // =========================================================================
  if (isCollapsed) {
    return (
      <section
        id="section-hall-of-fame-collapsed"
        className="relative rounded-2xl bg-gradient-to-r from-[#14120e] via-[#161420] to-[#0d0d14] border border-amber-500/30 p-2.5 sm:p-3 shadow-lg overflow-hidden mb-4 sm:mb-6 transition-all group"
      >
        {/* Subtle amber ambient glow */}
        <div className="absolute top-0 right-1/4 -mt-12 w-64 h-24 bg-amber-500/10 rounded-full blur-2xl pointer-events-none" />

        <div className="relative z-10 flex items-center justify-between gap-2.5 sm:gap-3 flex-wrap sm:flex-nowrap">
          {/* Left: Crown Icon & Title */}
          <div
            onClick={handleToggleCollapse}
            className="flex items-center gap-2.5 cursor-pointer select-none min-w-0 flex-1"
          >
            <div className="w-8 h-8 sm:w-9 sm:h-9 rounded-xl bg-gradient-to-tr from-amber-500 to-yellow-600 p-0.5 shadow-md shadow-amber-500/20 flex items-center justify-center shrink-0">
              <div className="w-full h-full rounded-[10px] bg-[#141208] flex items-center justify-center">
                <Crown className="w-4 h-4 text-amber-400 fill-amber-400/20" />
              </div>
            </div>

            <div className="min-w-0">
              <div className="flex items-center gap-1.5 flex-wrap">
                <h3 className="text-xs sm:text-sm font-black text-white uppercase tracking-wider font-display truncate">
                  Đại Sảnh Danh Vọng
                </h3>
                <span className="px-1.5 py-0.2 rounded-full bg-amber-500/20 text-amber-300 border border-amber-500/40 text-[9px] font-extrabold uppercase shrink-0">
                  13 Kỷ Lục
                </span>
                {userRecordCount > 0 && (
                  <span className="px-1.5 py-0.2 rounded-full bg-amber-400 text-black text-[9px] font-black uppercase shrink-0">
                    👑 Bạn: {userRecordCount}
                  </span>
                )}
              </div>
              <p className="text-[10px] text-slate-400 truncate hidden xs:block">
                Bảng vàng kỷ lục gia toàn thời gian & 13 Huy Hiệu Độc Quyền
              </p>
            </div>
          </div>

          {/* Right: Avatar Preview & Actions */}
          <div className="flex items-center gap-1.5 shrink-0">
            {/* Mini avatar stack preview */}
            <div
              onClick={handleOpenModal}
              className="hidden md:flex items-center -space-x-1.5 px-2 py-1 rounded-xl bg-black/40 border border-white/5 cursor-pointer hover:border-amber-500/30 transition-colors"
              title="Xem danh sách kỷ lục gia"
            >
              {topPreviewEntries.map((e, idx) => (
                <div
                  key={e.gameId}
                  className="w-6 h-6 rounded-full bg-[#1a1710] border border-amber-400/40 flex items-center justify-center text-xs shadow-sm"
                  style={{ zIndex: 10 - idx }}
                >
                  {e.holderAvatar}
                </div>
              ))}
              <span className="text-[10px] text-amber-300/80 font-bold pl-2 font-mono">
                +13
              </span>
            </div>

            {/* Open Full Modal Button */}
            <button
              id="btn-collapsed-hof-modal"
              type="button"
              onClick={handleOpenModal}
              className="px-2.5 sm:px-3 py-1.5 rounded-xl bg-amber-500/15 hover:bg-amber-500/25 border border-amber-500/40 text-amber-300 text-xs font-bold transition-all flex items-center gap-1 active:scale-95 cursor-pointer min-h-[34px]"
              title="Xem Chi Tiết & Bộ Sưu Tập Huy Hiệu"
            >
              <Trophy className="w-3.5 h-3.5 text-amber-400" />
              <span className="hidden sm:inline">Xem Tất Cả</span>
            </button>

            {/* Expand Toggle Button */}
            <button
              id="btn-expand-hall-of-fame"
              type="button"
              onClick={handleToggleCollapse}
              className="px-2.5 sm:px-3 py-1.5 rounded-xl bg-white/5 hover:bg-white/10 text-slate-300 hover:text-white border border-white/10 text-xs font-bold transition-all flex items-center gap-1 active:scale-95 cursor-pointer min-h-[34px]"
              title="Mở rộng để xem nhanh kỷ lục các game"
            >
              <span>Mở Rộng</span>
              <ChevronDown className="w-3.5 h-3.5 text-amber-400" />
            </button>
          </div>
        </div>
      </section>
    );
  }

  // =========================================================================
  // 2. EXPANDED VIEW: MOBILE HORIZONTAL CAROUSEL (OR GRID) & DESKTOP GRID
  // =========================================================================
  return (
    <section
      id="section-hall-of-fame"
      className="relative rounded-3xl bg-gradient-to-br from-[#12121a] via-[#0f0f15] to-[#0a0a0f] border border-amber-500/25 p-3.5 sm:p-5 shadow-2xl overflow-hidden mb-5 sm:mb-8 group"
    >
      {/* Ambient background glow */}
      <div className="absolute top-0 right-1/4 -mt-16 w-96 h-48 bg-amber-500/10 rounded-full blur-3xl pointer-events-none" />
      <div className="absolute bottom-0 left-10 -mb-16 w-72 h-40 bg-indigo-600/10 rounded-full blur-3xl pointer-events-none" />

      {/* Header Bar */}
      <div className="relative z-10 flex flex-col md:flex-row md:items-center justify-between gap-3 pb-3 sm:pb-4 border-b border-white/5">
        <div className="flex items-center gap-2.5 sm:gap-3.5">
          <div className="w-10 h-10 sm:w-11 sm:h-11 rounded-2xl bg-gradient-to-tr from-amber-500 to-yellow-600 p-0.5 shadow-lg shadow-amber-500/20 flex items-center justify-center shrink-0">
            <div className="w-full h-full rounded-[13px] bg-[#141208] flex items-center justify-center">
              <Crown className="w-5 h-5 text-amber-400 fill-amber-400/20" />
            </div>
          </div>
          <div>
            <div className="flex items-center gap-1.5 sm:gap-2 flex-wrap">
              <h2 className="text-base sm:text-lg font-black text-white uppercase tracking-wider font-display flex items-center gap-1.5">
                <span>Đại Sảnh Danh Vọng</span>
                <span className="text-amber-400 font-serif text-xs sm:text-sm font-normal">
                  (Hall of Fame)
                </span>
              </h2>
              <span className="px-2 py-0.5 rounded-full bg-amber-500/20 text-amber-300 border border-amber-500/40 text-[9px] sm:text-[10px] font-bold uppercase tracking-wider flex items-center gap-1">
                <Sparkles className="w-2.5 h-2.5 text-amber-300 animate-pulse" />
                <span>Kỷ Lục Toàn Thời Gian</span>
              </span>
            </div>
            <p className="text-[11px] text-slate-400 mt-0.5 hidden xs:block">
              Vinh danh các kỷ lục gia tối thượng & 13 Huy Hiệu Độc Quyền cho mỗi mini-game.
            </p>
          </div>
        </div>

        {/* Action Controls */}
        <div className="flex items-center gap-2 self-start md:self-auto flex-wrap">
          {userRecordCount > 0 && (
            <div className="flex items-center gap-1.5 px-2.5 py-1 rounded-xl bg-amber-500/20 border border-amber-500/40 text-amber-300 text-[11px] font-bold shadow-sm">
              <Crown className="w-3 h-3 fill-amber-300" />
              <span>Bạn giữ {userRecordCount} kỷ lục</span>
            </div>
          )}

          {/* Full Modal Trigger */}
          <button
            id="btn-view-all-hall-of-fame"
            type="button"
            onClick={handleOpenModal}
            className="px-3 py-1.5 rounded-xl bg-amber-500/15 hover:bg-amber-500/25 border border-amber-500/40 text-amber-300 text-xs font-bold transition-all flex items-center gap-1 active:scale-95 cursor-pointer shadow-sm shadow-amber-500/10 min-h-[34px]"
            title="Xem toàn bộ huy hiệu và bảng vàng"
          >
            <Trophy className="w-3.5 h-3.5 text-amber-400" />
            <span className="hidden sm:inline">Bộ Sưu Tập Huy Hiệu</span>
            <span className="sm:hidden">Chi Tiết</span>
            <ChevronRight className="w-3.5 h-3.5" />
          </button>

          {/* Collapse Button */}
          <button
            id="btn-collapse-hall-of-fame"
            type="button"
            onClick={handleToggleCollapse}
            className="px-2.5 py-1.5 rounded-xl bg-white/5 hover:bg-white/10 text-slate-300 hover:text-white border border-white/10 text-xs font-bold transition-all flex items-center gap-1 active:scale-95 cursor-pointer min-h-[34px]"
            title="Thu gọn lại để xem danh sách game nhanh hơn"
          >
            <ChevronUp className="w-3.5 h-3.5 text-amber-400" />
            <span className="hidden xs:inline">Thu Gọn</span>
          </button>
        </div>
      </div>

      {/* Filter Tabs & Mobile Layout Switcher */}
      <div className="relative z-10 flex items-center justify-between gap-2 pt-2.5 pb-1">
        {/* Category Pills */}
        <div className="flex items-center gap-1.5 overflow-x-auto scrollbar-none py-1 flex-1">
          {[
            { id: 'all', label: 'Tất Cả (13)' },
            { id: 'user', label: `Của Bạn 👑${userRecordCount > 0 ? ` (${userRecordCount})` : ''}` },
            { id: 'arcade', label: 'Arcade' },
            { id: 'puzzle', label: 'Giải Đố' },
            { id: 'pvp', label: 'Cờ & PvP' },
          ].map((filter) => (
            <button
              key={filter.id}
              id={`filter-hof-${filter.id}`}
              type="button"
              onClick={() => {
                soundEngine.play('click');
                setSelectedFilter(filter.id as any);
              }}
              className={`px-2.5 sm:px-3 py-1 rounded-xl text-[11px] font-bold transition-all shrink-0 cursor-pointer border ${
                selectedFilter === filter.id
                  ? 'bg-amber-500 text-black border-amber-400 shadow-md shadow-amber-500/20'
                  : 'bg-white/5 hover:bg-white/10 text-slate-400 border-white/5'
              }`}
            >
              {filter.label}
            </button>
          ))}
        </div>

        {/* Mobile View Switcher: Carousel vs Grid */}
        <div className="sm:hidden flex items-center bg-black/40 border border-white/10 rounded-lg p-0.5 shrink-0">
          <button
            type="button"
            onClick={() => setMobileLayout('carousel')}
            className={`p-1 rounded-md transition-colors ${
              mobileLayout === 'carousel' ? 'bg-amber-500 text-black' : 'text-slate-400'
            }`}
            title="Dạng cuộn ngang (Tiết kiệm diện tích)"
          >
            <Columns3 className="w-3.5 h-3.5" />
          </button>
          <button
            type="button"
            onClick={() => setMobileLayout('grid')}
            className={`p-1 rounded-md transition-colors ${
              mobileLayout === 'grid' ? 'bg-amber-500 text-black' : 'text-slate-400'
            }`}
            title="Dạng lưới"
          >
            <LayoutGrid className="w-3.5 h-3.5" />
          </button>
        </div>
      </div>

      {/* Cards Container:
          On mobile with 'carousel' mode: Horizontal Reel taking only ~210px total height!
          On mobile with 'grid' mode or desktop: Responsive Grid */}
      <div
        className={`relative z-10 mt-2.5 ${
          mobileLayout === 'carousel'
            ? 'flex sm:grid overflow-x-auto sm:overflow-visible snap-x snap-mandatory gap-2.5 sm:gap-3.5 pb-2 sm:pb-0 sm:grid-cols-2 lg:grid-cols-3 xl:grid-cols-4 scrollbar-thin'
            : 'grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 xl:grid-cols-4 gap-2.5 sm:gap-3.5'
        }`}
      >
        {filteredEntries.length === 0 ? (
          <div className="col-span-full py-8 text-center text-xs text-slate-400 bg-black/20 rounded-2xl border border-white/5 w-full">
            <Trophy className="w-7 h-7 text-slate-600 mx-auto mb-1.5 opacity-50" />
            <p>Chưa có kỷ lục nào trong danh mục này.</p>
            {selectedFilter === 'user' && (
              <p className="text-amber-400/80 mt-1 font-medium text-[11px]">
                Chơi mini-game để phá vỡ kỷ lục và khắc tên bạn vào Đại Sảnh!
              </p>
            )}
          </div>
        ) : (
          filteredEntries.map((entry) => {
            const userScore = profile.stats.highScores[entry.gameId] || 0;
            const percentOfRecord = Math.min(
              100,
              Math.round((userScore / Math.max(1, entry.recordScore)) * 100)
            );
            const isUser = entry.isUserHolder;
            const badge = entry.badge;

            return (
              <div
                key={entry.gameId}
                onClick={handleOpenModal}
                className={`relative rounded-2xl p-3 sm:p-3.5 border transition-all duration-300 flex flex-col justify-between cursor-pointer overflow-hidden group/card ${
                  mobileLayout === 'carousel'
                    ? 'w-[230px] shrink-0 snap-start sm:w-auto'
                    : 'w-full'
                } ${
                  isUser
                    ? 'bg-gradient-to-br from-[#1a1710] via-[#141208] to-[#0d0c07] border-amber-400/80 shadow-xl shadow-amber-500/15 ring-1 ring-amber-400/30'
                    : 'bg-[#12121c] hover:bg-[#161624] border-white/5 hover:border-amber-500/40 hover:shadow-lg hover:shadow-black/60'
                }`}
              >
                {/* Subtle corner light */}
                <div
                  className="absolute -top-8 -right-8 w-16 h-16 rounded-full blur-xl pointer-events-none opacity-20 group-hover/card:opacity-40 transition-opacity"
                  style={{ backgroundColor: badge.glowColor }}
                />

                <div>
                  {/* Top row: Game icon & Title */}
                  <div className="flex items-center gap-2 mb-2">
                    <span className="text-xl sm:text-2xl shrink-0 p-1 rounded-lg bg-white/5 border border-white/5">
                      {entry.gameIcon}
                    </span>
                    <div className="min-w-0 flex-1">
                      <h4 className="text-xs font-bold text-white truncate group-hover/card:text-amber-400 transition-colors">
                        {entry.gameTitle}
                      </h4>
                      <span className="text-[9px] text-slate-400 font-medium truncate block">
                        {entry.category}
                      </span>
                    </div>
                  </div>

                  {/* Exclusive Badge Chip */}
                  <div
                    className={`px-2 py-0.5 rounded-md border text-[9px] font-extrabold flex items-center justify-between gap-1 shadow-sm mb-2 bg-black/40 ${badge.borderColor} ${badge.textColor}`}
                    title={badge.description}
                  >
                    <div className="flex items-center gap-1 truncate">
                      <span>{badge.icon}</span>
                      <span className="truncate">{badge.name}</span>
                    </div>
                    <span className="text-[8px] uppercase tracking-wider font-mono opacity-80 shrink-0">
                      {badge.tier}
                    </span>
                  </div>

                  {/* Record Holder Info */}
                  <div className="rounded-xl bg-black/40 border border-white/5 p-2 flex items-center justify-between gap-1.5 mb-2">
                    <div className="flex items-center gap-1.5 min-w-0">
                      <div className="w-6 h-6 rounded-lg bg-amber-500/20 border border-amber-500/30 flex items-center justify-center text-xs shrink-0 relative">
                        {entry.holderAvatar}
                        <Crown className="w-2 h-2 text-amber-400 fill-amber-400 absolute -top-1 -right-0.5" />
                      </div>
                      <div className="min-w-0">
                        <div className="flex items-center gap-1">
                          <span className="text-[11px] font-bold text-white truncate max-w-[80px]">
                            {entry.holderName}
                          </span>
                          {isUser && (
                            <span className="px-1 py-0.2 rounded bg-amber-500 text-black text-[7.5px] font-black uppercase shrink-0">
                              BẠN
                            </span>
                          )}
                        </div>
                        <span className="text-[8.5px] text-amber-300/80 truncate block">
                          {entry.holderTitle}
                        </span>
                      </div>
                    </div>

                    <div className="text-right shrink-0">
                      <div className="text-[11px] font-mono font-black text-amber-400">
                        {entry.recordScore.toLocaleString()} {entry.scoreUnit || 'pts'}
                      </div>
                      <div className="text-[8px] text-slate-400 font-mono">
                        {entry.recordDate}
                      </div>
                    </div>
                  </div>
                </div>

                {/* Bottom: User Progress & Challenge Button */}
                <div className="pt-1.5 border-t border-white/5 space-y-1.5">
                  <div className="flex items-center justify-between text-[9.5px]">
                    <span className="text-slate-400">Bạn:</span>
                    <span className="font-mono font-bold text-white truncate">
                      {userScore.toLocaleString()} ({percentOfRecord}%)
                    </span>
                  </div>

                  {/* Progress Bar */}
                  <div className="w-full h-1 bg-black/60 rounded-full overflow-hidden border border-white/5">
                    <div
                      className={`h-full transition-all duration-500 rounded-full ${
                        isUser
                          ? 'bg-gradient-to-r from-amber-400 to-yellow-500'
                          : 'bg-gradient-to-r from-indigo-500 to-indigo-400'
                      }`}
                      style={{ width: `${percentOfRecord}%` }}
                    />
                  </div>

                  <button
                    type="button"
                    onClick={(e) => handleChallenge(entry.gameId, e)}
                    className={`w-full py-1 px-2 rounded-lg font-bold text-[10.5px] flex items-center justify-center gap-1 transition-all cursor-pointer min-h-[30px] ${
                      isUser
                        ? 'bg-amber-500/20 hover:bg-amber-500 text-amber-300 hover:text-black border border-amber-500/40'
                        : 'bg-white/5 hover:bg-indigo-600 text-slate-300 hover:text-white border border-white/10'
                    }`}
                  >
                    <Play className="w-2.5 h-2.5 fill-current" />
                    <span>{isUser ? 'Giữ Kỷ Lục' : 'Thách Đấu'}</span>
                  </button>
                </div>
              </div>
            );
          })
        )}
      </div>

      {/* Mobile Swipe Hint when in Carousel mode */}
      {mobileLayout === 'carousel' && (
        <div className="sm:hidden flex items-center justify-center gap-1.5 text-[10px] text-slate-500 mt-2 font-mono">
          <span>← Vuốt ngang để xem 13 kỷ lục gia →</span>
        </div>
      )}
    </section>
  );
};
