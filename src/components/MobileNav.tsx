import React, { useState } from 'react';
import { motion, AnimatePresence } from 'motion/react';
import { useGame } from '../context/GameContext';
import { useInventory } from '../context/InventoryContext';
import { usePlayer } from '../context/PlayerContext';
import { CloseButton } from './common/CloseButton';
import { hapticService } from '../services/haptics';
import { soundEngine } from '../services/audio';
import {
  Gamepad2,
  Gift,
  Trophy,
  Package,
  MessageSquare,
  Award,
  Calendar,
  LayoutGrid,
  User,
  X,
  ChevronRight,
  Flame,
  Sparkles,
  Hammer,
  ShoppingBag,
  Crown,
  Compass,
  Settings,
  Users,
  Target,
  History,
  Download,
} from 'lucide-react';

export const MobileNav: React.FC = () => {
  const {
    activeGameId,
    exitGame,
    activeModal,
    setActiveModal,
    isChatOpen,
    toggleChat,
    dailyQuests,
    achievements,
    startOnboarding,
  } = useGame();
  const { chestCounts } = useInventory();
  const { profile } = usePlayer();

  const [isMoreMenuOpen, setIsMoreMenuOpen] = useState<boolean>(false);

  // Listen for event from desktop Header menu button to open More Menu
  React.useEffect(() => {
    const handleOpenMoreMenu = () => setIsMoreMenuOpen(true);
    window.addEventListener('arcadex:open_more_menu', handleOpenMoreMenu);
    return () => window.removeEventListener('arcadex:open_more_menu', handleOpenMoreMenu);
  }, []);

  // When playing an active game, hide the nav bar so it does not block game controls or viewports
  if (activeGameId) {
    return null;
  }

  const today = new Date().toISOString().split('T')[0];
  const isClaimedToday = profile.stats.lastLoginDate === today;
  const totalChests = Object.values(chestCounts).reduce((a, b) => a + b, 0);
  const unclaimedQuests = dailyQuests.filter((q) => q.completed && !q.claimed).length;
  const unclaimedAchievements = achievements.filter((a) => a.unlocked && !a.claimed).length;
  const hasUnclaimedSubItems = !isClaimedToday || unclaimedQuests > 0 || unclaimedAchievements > 0;

  const isSubModalActive = [
    'dailyReward',
    'leaderboard',
    'achievements',
    'quests',
    'weeklyQuests',
    'friends',
    'profile',
    'crafting',
    'hallOfFame',
    'settings',
    'pvpHistory',
    'spinWheel',
    'monthlyLogin',
  ].includes(activeModal);

  const handleOpenSubModal = (
    modalName:
      | 'dailyReward'
      | 'leaderboard'
      | 'achievements'
      | 'quests'
      | 'weeklyQuests'
      | 'friends'
      | 'profile'
      | 'crafting'
      | 'shop'
      | 'hallOfFame'
      | 'settings'
      | 'pvpHistory'
      | 'spinWheel'
      | 'monthlyLogin'
  ) => {
    setIsMoreMenuOpen(false);
    if (isChatOpen) toggleChat();
    setActiveModal(modalName);
  };

  return (
    <>
      {/* Primary Navigation Toolbar - Full width on mobile, sleek floating dock on desktop/web */}
      {!isMoreMenuOpen && (
        <nav
          aria-label="Thanh công cụ điều hướng chính"
          className="fixed bottom-0 inset-x-0 z-[95] bg-[#0a0a12]/95 backdrop-blur-xl border-t border-indigo-500/20 px-2 py-1 flex items-center justify-around shadow-2xl safe-area-bottom select-none md:bottom-4 md:inset-x-auto md:left-1/2 md:-translate-x-1/2 md:w-auto md:min-w-[460px] md:max-w-xl md:rounded-2xl md:border md:border-indigo-500/30 md:px-5 md:py-1.5 md:shadow-[0_12px_40px_rgba(0,0,0,0.8)]"
        >
        {/* 1. Games Library / Trang Chủ */}
        <motion.button
          id="mobile-nav-games"
          type="button"
          whileTap={{ scale: 0.92 }}
          onClick={() => {
            hapticService.tap();
            setIsMoreMenuOpen(false);
            if (isChatOpen) toggleChat();
            if (activeModal !== 'none') {
              setActiveModal('none');
            } else if (activeGameId) {
              exitGame();
            }
            window.scrollTo({ top: 0, behavior: 'smooth' });
          }}
          className={`flex-1 min-h-[48px] flex flex-col items-center justify-center py-1.5 px-2 rounded-xl transition-colors cursor-pointer relative ${
            activeModal === 'none' && !isChatOpen && !isMoreMenuOpen
              ? 'text-indigo-400 font-bold'
              : 'text-slate-400 hover:text-slate-200 font-bold'
          }`}
        >
          <Gamepad2 className="w-5 h-5" />
          <span className="text-[11px] mt-0.5 font-medium">Trò Chơi</span>
          {activeModal === 'none' && !isChatOpen && !isMoreMenuOpen && (
            <motion.span layoutId="activeTabIndicator" className="absolute bottom-0.5 w-6 h-1 bg-indigo-500 rounded-full" />
          )}
        </motion.button>

        {/* 2. Inventory / Kho Đồ */}
        <motion.button
          id="mobile-nav-inventory"
          type="button"
          whileTap={{ scale: 0.92 }}
          onClick={() => {
            hapticService.tap();
            setIsMoreMenuOpen(false);
            if (isChatOpen) toggleChat();
            setActiveModal(activeModal === 'inventory' ? 'none' : 'inventory');
          }}
          className={`flex-1 min-h-[48px] flex flex-col items-center justify-center py-1.5 px-2 rounded-xl transition-colors cursor-pointer relative ${
            activeModal === 'inventory'
              ? 'text-indigo-400 font-bold'
              : 'text-slate-400 hover:text-slate-200 font-bold'
          }`}
        >
          <div className="relative">
            <Package className="w-5 h-5" />
            {totalChests > 0 && (
              <span className="absolute -top-1 -right-2 bg-indigo-600 text-white font-extrabold text-[9px] px-1 rounded-full border border-[#0a0a12]">
                {totalChests}
              </span>
            )}
          </div>
          <span className="text-[11px] mt-0.5 font-medium">Kho Đồ</span>
          {activeModal === 'inventory' && (
            <motion.span layoutId="activeTabIndicator" className="absolute bottom-0.5 w-6 h-1 bg-indigo-500 rounded-full" />
          )}
        </motion.button>

        {/* 3. Arcade Shop / Cửa Hàng */}
        <motion.button
          id="mobile-nav-shop"
          type="button"
          whileTap={{ scale: 0.92 }}
          onClick={() => {
            hapticService.tap();
            setIsMoreMenuOpen(false);
            if (isChatOpen) toggleChat();
            setActiveModal(activeModal === 'shop' ? 'none' : 'shop');
          }}
          className={`flex-1 min-h-[48px] flex flex-col items-center justify-center py-1.5 px-2 rounded-xl transition-colors cursor-pointer relative ${
            activeModal === 'shop'
              ? 'text-amber-400 font-bold'
              : 'text-slate-400 hover:text-slate-200 font-bold'
          }`}
        >
          <ShoppingBag className="w-5 h-5 text-amber-400" />
          <span className="text-[11px] mt-0.5 font-medium">Cửa Hàng</span>
          {activeModal === 'shop' && (
            <motion.span layoutId="activeTabIndicator" className="absolute bottom-0.5 w-6 h-1 bg-amber-500 rounded-full" />
          )}
        </motion.button>

        {/* 3. Global Realtime Chat */}
        <motion.button
          id="mobile-nav-chat"
          type="button"
          whileTap={{ scale: 0.92 }}
          onClick={() => {
            hapticService.tap();
            setIsMoreMenuOpen(false);
            toggleChat();
          }}
          className={`flex-1 min-h-[48px] flex flex-col items-center justify-center py-1.5 px-2 rounded-xl transition-colors cursor-pointer relative ${
            isChatOpen
              ? 'text-cyan-400 font-bold'
              : 'text-slate-400 hover:text-slate-200 font-bold'
          }`}
        >
          <div className="relative">
            <MessageSquare className="w-5 h-5" />
            <span className="absolute top-0 right-0 w-2 h-2 rounded-full bg-emerald-400 animate-pulse" />
          </div>
          <span className="text-[11px] mt-0.5 font-medium">Chat</span>
          {isChatOpen && (
            <motion.span layoutId="activeTabIndicator" className="absolute bottom-0.5 w-6 h-1 bg-cyan-500 rounded-full" />
          )}
        </motion.button>

        {/* 4. Secondary Sub-Menu Trigger (Menu & Tiện Ích) */}
        <motion.button
          id="mobile-nav-more"
          type="button"
          whileTap={{ scale: 0.92 }}
          onClick={() => {
            hapticService.tap();
            setIsMoreMenuOpen((prev) => !prev);
          }}
          className={`flex-1 min-h-[48px] flex flex-col items-center justify-center py-1.5 px-2 rounded-xl transition-colors cursor-pointer relative ${
            isMoreMenuOpen || isSubModalActive
              ? 'text-amber-400 font-bold'
              : 'text-slate-400 hover:text-slate-200 font-bold'
          }`}
        >
          <div className="relative">
            <LayoutGrid className="w-5 h-5" />
            {hasUnclaimedSubItems && (
              <span className="absolute -top-1 -right-1.5 w-2.5 h-2.5 bg-amber-400 rounded-full animate-ping" />
            )}
          </div>
          <span className="text-[11px] mt-0.5 font-medium">Menu</span>
          {(isMoreMenuOpen || isSubModalActive) && (
            <motion.span layoutId="activeTabIndicator" className="absolute bottom-0.5 w-6 h-1 bg-amber-500 rounded-full" />
          )}
        </motion.button>
        </nav>
      )}

      {/* Secondary Menu Drawer / Popup Modal - Responsive for Web and Mobile */}
      {isMoreMenuOpen && (
        <div 
          className="fixed inset-0 z-[110] flex items-end sm:items-center justify-center p-0 sm:p-4 md:p-6 bg-black/80 backdrop-blur-md animate-in fade-in duration-200"
          onClick={() => setIsMoreMenuOpen(false)}
        >
          <div
            className="w-full sm:max-w-2xl bg-[#0c0d14] border-t sm:border border-white/10 rounded-t-3xl sm:rounded-3xl shadow-2xl flex flex-col max-h-[85vh] sm:max-h-[88vh] overflow-hidden p-4 sm:p-6 animate-in slide-in-from-bottom-5 sm:zoom-in-95 duration-200"
            onClick={(e) => e.stopPropagation()}
          >
            <div
              className="w-full flex-1 overflow-y-auto bg-[#0c0d14] flex flex-col space-y-3 pb-2"
              onClick={(e) => e.stopPropagation()}
            >
              {/* Drawer Header */}
              <div className="flex items-center justify-between border-b border-white/10 pb-3 pt-2 shrink-0">
                <div className="flex items-center gap-2.5">
                  <div className="w-9 h-9 rounded-xl bg-amber-500/20 border border-amber-400/30 flex items-center justify-center text-amber-400">
                    <LayoutGrid className="w-5 h-5" />
                  </div>
                  <div>
                    <h3 className="text-sm font-black uppercase text-white tracking-wide font-display">
                      Menu & Tiện Ích Nâng Cao
                    </h3>
                    <p className="text-[11px] text-slate-400">Truy cập nhanh tất cả tính năng ArcadeX</p>
                  </div>
                </div>
                <CloseButton
                  id="btn-close-mobile-more-menu"
                  onClose={() => setIsMoreMenuOpen(false)}
                  size="sm"
                  ariaLabel="Đóng menu tiện ích"
                />
              </div>

              {/* Sub-menu Grid Options */}
              <div className="grid grid-cols-2 sm:grid-cols-3 gap-2 sm:gap-2.5 pt-1">
              {/* 0a. Daily Spin Wheel */}
              <button
                id="btn-more-menu-spin-wheel"
                type="button"
                onClick={() => handleOpenSubModal('spinWheel')}
                className="p-3 rounded-2xl bg-[#151722] hover:bg-[#1f2233] border border-amber-500/40 hover:border-amber-400/80 flex items-center justify-between text-left transition-colors group cursor-pointer shadow-sm"
              >
                <div className="flex items-center gap-2.5 min-w-0">
                  <div className="w-8 h-8 rounded-xl bg-gradient-to-br from-amber-500/30 to-orange-500/30 border border-amber-400/50 flex items-center justify-center text-amber-300 relative shrink-0">
                    <span className="text-base leading-none">🎡</span>
                    {profile.stats.lastSpinDate !== today && (
                      <span className="absolute -top-1 -right-1 w-2 h-2 bg-amber-400 rounded-full animate-ping" />
                    )}
                  </div>
                  <div className="min-w-0">
                    <div className="text-xs font-bold text-white group-hover:text-amber-300 truncate">Vòng Quay</div>
                    <div className="text-[10px] text-slate-400 truncate">
                      {profile.stats.lastSpinDate !== today ? '🎁 Lượt quay mới' : 'Đã quay hôm nay'}
                    </div>
                  </div>
                </div>
                <ChevronRight className="w-4 h-4 text-slate-500 group-hover:text-amber-400 shrink-0" />
              </button>

              {/* 0b. Monthly Login Calendar */}
              <button
                id="btn-more-menu-monthly-login"
                type="button"
                onClick={() => handleOpenSubModal('monthlyLogin')}
                className="p-3 rounded-2xl bg-[#151722] hover:bg-[#1f2233] border border-indigo-500/40 hover:border-indigo-400/80 flex items-center justify-between text-left transition-colors group cursor-pointer shadow-sm"
              >
                <div className="flex items-center gap-2.5 min-w-0">
                  <div className="w-8 h-8 rounded-xl bg-indigo-500/20 border border-indigo-400/40 flex items-center justify-center text-indigo-400 relative shrink-0">
                    <Calendar className="w-4 h-4" />
                    {!profile.stats.loginHistoryDates?.includes(today) && (
                      <span className="absolute -top-1 -right-1 w-2 h-2 bg-indigo-400 rounded-full animate-ping" />
                    )}
                  </div>
                  <div className="min-w-0">
                    <div className="text-xs font-bold text-white group-hover:text-indigo-300 truncate">Lịch Điểm Danh</div>
                    <div className="text-[10px] text-slate-400 truncate">Quà tháng 30 ngày</div>
                  </div>
                </div>
                <ChevronRight className="w-4 h-4 text-slate-500 group-hover:text-indigo-400 shrink-0" />
              </button>

              {/* 1. Daily Rewards */}
              <button
                type="button"
                onClick={() => handleOpenSubModal('dailyReward')}
                className="p-3 rounded-2xl bg-[#151722] hover:bg-[#1f2233] border border-amber-500/30 hover:border-amber-400/60 flex items-center justify-between text-left transition-colors group cursor-pointer shadow-sm"
              >
                <div className="flex items-center gap-2.5 min-w-0">
                  <div className="w-8 h-8 rounded-xl bg-amber-500/20 border border-amber-400/40 flex items-center justify-center text-amber-400 relative shrink-0">
                    <Gift className="w-4 h-4" />
                    {!isClaimedToday && (
                      <span className="absolute -top-1 -right-1 w-2 h-2 bg-amber-400 rounded-full animate-ping" />
                    )}
                  </div>
                  <div className="min-w-0">
                    <div className="text-xs font-bold text-white group-hover:text-amber-300 truncate">Điểm Danh</div>
                    <div className="text-[10px] text-slate-400 truncate">
                      {!isClaimedToday ? '🎁 Có quà mới' : `Chuỗi ${profile.stats.dailyStreak} ngày`}
                    </div>
                  </div>
                </div>
                <ChevronRight className="w-4 h-4 text-slate-500 group-hover:text-amber-400 shrink-0" />
              </button>

              {/* 2. Quests / Tasks */}
              <button
                type="button"
                onClick={() => handleOpenSubModal('quests')}
                className="p-3 rounded-2xl bg-[#151722] hover:bg-[#1f2233] border border-emerald-500/30 hover:border-emerald-400/60 flex items-center justify-between text-left transition-colors group cursor-pointer shadow-sm"
              >
                <div className="flex items-center gap-2.5 min-w-0">
                  <div className="w-8 h-8 rounded-xl bg-emerald-500/20 border border-emerald-400/40 flex items-center justify-center text-emerald-400 relative shrink-0">
                    <Calendar className="w-4 h-4" />
                    {unclaimedQuests > 0 && (
                      <span className="absolute -top-1 -right-1.5 bg-emerald-500 text-black font-extrabold text-[8px] px-1 rounded-full animate-pulse">
                        {unclaimedQuests}
                      </span>
                    )}
                  </div>
                  <div className="min-w-0">
                    <div className="text-xs font-bold text-white group-hover:text-emerald-300 truncate">Nhiệm Vụ</div>
                    <div className="text-[10px] text-slate-400 truncate">
                      {unclaimedQuests > 0 ? `${unclaimedQuests} nhận quà` : 'Hằng ngày'}
                    </div>
                  </div>
                </div>
                <ChevronRight className="w-4 h-4 text-slate-500 group-hover:text-emerald-400 shrink-0" />
              </button>

              {/* 2b. Friends & 1v1 Challenges */}
              <button
                type="button"
                onClick={() => handleOpenSubModal('friends')}
                className="p-3 rounded-2xl bg-[#151722] hover:bg-[#1f2233] border border-cyan-500/30 hover:border-cyan-400/60 flex items-center justify-between text-left transition-colors group cursor-pointer shadow-sm"
              >
                <div className="flex items-center gap-2.5 min-w-0">
                  <div className="w-8 h-8 rounded-xl bg-cyan-500/20 border border-cyan-400/40 flex items-center justify-center text-cyan-400 relative shrink-0">
                    <Users className="w-4 h-4" />
                  </div>
                  <div className="min-w-0">
                    <div className="text-xs font-bold text-white group-hover:text-cyan-300 truncate">Bạn Bè</div>
                    <div className="text-[10px] text-slate-400 truncate">Thách đấu 1v1</div>
                  </div>
                </div>
                <ChevronRight className="w-4 h-4 text-slate-500 group-hover:text-cyan-400 shrink-0" />
              </button>

              {/* 2c. Weekly Quests */}
              <button
                type="button"
                onClick={() => handleOpenSubModal('weeklyQuests')}
                className="p-3 rounded-2xl bg-[#151722] hover:bg-[#1f2233] border border-purple-500/30 hover:border-purple-400/60 flex items-center justify-between text-left transition-colors group cursor-pointer shadow-sm"
              >
                <div className="flex items-center gap-2.5 min-w-0">
                  <div className="w-8 h-8 rounded-xl bg-purple-500/20 border border-purple-400/40 flex items-center justify-center text-purple-400 relative shrink-0">
                    <Target className="w-4 h-4" />
                  </div>
                  <div className="min-w-0">
                    <div className="text-xs font-bold text-white group-hover:text-purple-300 truncate">Nhiệm Vụ Tuần</div>
                    <div className="text-[10px] text-slate-400 truncate">Tiến độ & Mốc quà</div>
                  </div>
                </div>
                <ChevronRight className="w-4 h-4 text-slate-500 group-hover:text-purple-400 shrink-0" />
              </button>

              {/* 3. Achievements */}
              <button
                type="button"
                onClick={() => handleOpenSubModal('achievements')}
                className="p-3 rounded-2xl bg-[#151722] hover:bg-[#1f2233] border border-pink-500/30 hover:border-pink-400/60 flex items-center justify-between text-left transition-colors group cursor-pointer shadow-sm"
              >
                <div className="flex items-center gap-2.5 min-w-0">
                  <div className="w-8 h-8 rounded-xl bg-pink-500/20 border border-pink-400/40 flex items-center justify-center text-pink-400 relative shrink-0">
                    <Award className="w-4 h-4" />
                    {unclaimedAchievements > 0 && (
                      <span className="absolute -top-1 -right-1.5 bg-pink-500 text-white font-extrabold text-[8px] px-1 rounded-full animate-pulse">
                        {unclaimedAchievements}
                      </span>
                    )}
                  </div>
                  <div className="min-w-0">
                    <div className="text-xs font-bold text-white group-hover:text-pink-300 truncate">Thành Tựu</div>
                    <div className="text-[10px] text-slate-400 truncate">Danh hiệu & Cup</div>
                  </div>
                </div>
                <ChevronRight className="w-4 h-4 text-slate-500 group-hover:text-pink-400 shrink-0" />
              </button>

              {/* 4. Leaderboard */}
              <button
                type="button"
                onClick={() => handleOpenSubModal('leaderboard')}
                className="p-3 rounded-2xl bg-[#151722] hover:bg-[#1f2233] border border-yellow-500/30 hover:border-yellow-400/60 flex items-center justify-between text-left transition-colors group cursor-pointer shadow-sm"
              >
                <div className="flex items-center gap-2.5 min-w-0">
                  <div className="w-8 h-8 rounded-xl bg-yellow-500/20 border border-yellow-400/40 flex items-center justify-center text-yellow-400 shrink-0">
                    <Trophy className="w-4 h-4" />
                  </div>
                  <div className="min-w-0">
                    <div className="text-xs font-bold text-white group-hover:text-yellow-300 truncate">Bảng Vàng</div>
                    <div className="text-[10px] text-slate-400 truncate">BXH cao thủ tuần</div>
                  </div>
                </div>
                <ChevronRight className="w-4 h-4 text-slate-500 group-hover:text-yellow-400 shrink-0" />
              </button>

              {/* 5. Forge / Crafting */}
              <button
                type="button"
                onClick={() => handleOpenSubModal('crafting')}
                className="p-3 rounded-2xl bg-[#151722] hover:bg-[#1f2233] border border-purple-500/30 hover:border-purple-400/60 flex items-center justify-between text-left transition-colors group cursor-pointer shadow-sm"
              >
                <div className="flex items-center gap-2.5 min-w-0">
                  <div className="w-8 h-8 rounded-xl bg-purple-500/20 border border-purple-400/40 flex items-center justify-center text-purple-400 shrink-0">
                    <Hammer className="w-4 h-4" />
                  </div>
                  <div className="min-w-0">
                    <div className="text-xs font-bold text-white group-hover:text-purple-300 truncate">Lò Rèn</div>
                    <div className="text-[10px] text-slate-400 truncate">Dung hợp phẩm cấp</div>
                  </div>
                </div>
                <ChevronRight className="w-4 h-4 text-slate-500 group-hover:text-purple-400 shrink-0" />
              </button>

              {/* 6. Arcade Shop */}
              <button
                type="button"
                onClick={() => handleOpenSubModal('shop')}
                className="p-3 rounded-2xl bg-[#151722] hover:bg-[#1f2233] border border-amber-500/30 hover:border-amber-400/60 flex items-center justify-between text-left transition-colors group cursor-pointer shadow-sm"
              >
                <div className="flex items-center gap-2.5 min-w-0">
                  <div className="w-8 h-8 rounded-xl bg-amber-500/20 border border-amber-400/40 flex items-center justify-center text-amber-400 shrink-0">
                    <ShoppingBag className="w-4 h-4" />
                  </div>
                  <div className="min-w-0">
                    <div className="text-xs font-bold text-white group-hover:text-amber-300 truncate">Cửa Hàng</div>
                    <div className="text-[10px] text-slate-400 truncate">Skins & Themes</div>
                  </div>
                </div>
                <ChevronRight className="w-4 h-4 text-slate-500 group-hover:text-amber-400 shrink-0" />
              </button>

              {/* 7. Hall of Fame */}
              <button
                type="button"
                onClick={() => handleOpenSubModal('hallOfFame')}
                className="p-3 rounded-2xl bg-[#151722] hover:bg-[#1f2233] border border-amber-500/30 hover:border-amber-400/60 flex items-center justify-between text-left transition-colors group cursor-pointer shadow-sm"
              >
                <div className="flex items-center gap-2.5 min-w-0">
                  <div className="w-8 h-8 rounded-xl bg-amber-500/20 border border-amber-400/40 flex items-center justify-center text-amber-400 shrink-0">
                    <Crown className="w-4 h-4" />
                  </div>
                  <div className="min-w-0">
                    <div className="text-xs font-bold text-white group-hover:text-amber-300 truncate">Hall of Fame</div>
                    <div className="text-[10px] text-slate-400 truncate">Kỷ lục toàn thời gian</div>
                  </div>
                </div>
                <ChevronRight className="w-4 h-4 text-slate-500 group-hover:text-amber-400 shrink-0" />
              </button>

              {/* 8. Settings */}
              <button
                type="button"
                onClick={() => handleOpenSubModal('settings')}
                className="p-3 rounded-2xl bg-[#151722] hover:bg-[#1f2233] border border-slate-700 hover:border-slate-500 flex items-center justify-between text-left transition-colors group cursor-pointer shadow-sm"
              >
                <div className="flex items-center gap-2.5 min-w-0">
                  <div className="w-8 h-8 rounded-xl bg-slate-800 border border-slate-600 flex items-center justify-center text-slate-300 shrink-0">
                    <Settings className="w-4 h-4" />
                  </div>
                  <div className="min-w-0">
                    <div className="text-xs font-bold text-white group-hover:text-slate-200 truncate">Cài Đặt</div>
                    <div className="text-[10px] text-slate-400 truncate">Âm thanh & thông báo</div>
                  </div>
                </div>
                <ChevronRight className="w-4 h-4 text-slate-500 group-hover:text-slate-300 shrink-0" />
              </button>

              {/* 9. PWA Install */}
              <button
                id="btn-more-menu-pwa"
                type="button"
                onClick={() => {
                  setIsMoreMenuOpen(false);
                  window.dispatchEvent(new CustomEvent('arcadex:trigger_pwa_install'));
                }}
                className="p-3 rounded-2xl bg-[#151722] hover:bg-[#1f2233] border border-indigo-500/40 hover:border-indigo-400 flex items-center justify-between text-left transition-colors group cursor-pointer shadow-sm col-span-2"
              >
                <div className="flex items-center gap-2.5 min-w-0">
                  <div className="w-8 h-8 rounded-xl bg-indigo-500/20 border border-indigo-400/40 flex items-center justify-center text-indigo-400 shrink-0">
                    <Download className="w-4 h-4 animate-bounce" />
                  </div>
                  <div className="min-w-0">
                    <div className="text-xs font-bold text-white group-hover:text-indigo-300 flex items-center gap-2 truncate">
                      <span>Tải ArcadeX PWA</span>
                      <span className="text-[9px] px-1.5 py-0.2 rounded bg-emerald-500/20 text-emerald-300 border border-emerald-500/30">Offline</span>
                    </div>
                    <div className="text-[10px] text-slate-400 truncate">Cài đặt ứng dụng về màn hình chính</div>
                  </div>
                </div>
                <ChevronRight className="w-4 h-4 text-slate-500 group-hover:text-indigo-400 shrink-0" />
              </button>
            </div>

            {/* Profile Button in Drawer */}
            <button
              type="button"
              onClick={() => handleOpenSubModal('profile')}
              className="w-full p-3 rounded-2xl bg-[#151722] hover:bg-[#1f2233] border border-indigo-500/30 hover:border-indigo-400/60 flex items-center justify-between text-left transition-colors group cursor-pointer shadow-sm"
            >
              <div className="flex items-center gap-3 min-w-0">
                <div className="w-9 h-9 rounded-xl bg-indigo-500/20 border border-indigo-400/40 flex items-center justify-center text-lg shrink-0">
                  {profile.avatar}
                </div>
                <div className="min-w-0">
                  <div className="text-xs font-bold text-white group-hover:text-indigo-300 flex items-center gap-2 truncate">
                    <span className="truncate">{profile.username}</span>
                    <span className="text-[9px] px-1.5 py-0.2 rounded bg-indigo-600/40 text-indigo-300 font-normal shrink-0">
                      Cấp {profile.level}
                    </span>
                  </div>
                  <div className="text-[10px] text-slate-400 truncate">Xem hồ sơ & thông số cá nhân</div>
                </div>
              </div>
              <ChevronRight className="w-4 h-4 text-slate-500 group-hover:text-indigo-400 shrink-0" />
            </button>
          </div>

          {/* Bottom Center Back / Close Button */}
          <div className="pt-2 pb-1 shrink-0 flex justify-center border-t border-white/5">
            <button
              type="button"
              onClick={() => setIsMoreMenuOpen(false)}
              className="px-8 py-3 rounded-2xl bg-gradient-to-r from-purple-600 to-indigo-600 hover:from-purple-500 hover:to-indigo-500 text-white font-bold text-xs uppercase tracking-wider shadow-lg shadow-indigo-500/25 transition cursor-pointer active:scale-95 flex items-center gap-2"
            >
              <span>Quay Lại</span>
            </button>
          </div>
          </div>
        </div>
      )}
    </>
  );
};


