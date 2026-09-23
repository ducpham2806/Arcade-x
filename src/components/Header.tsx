import React, { useState, useEffect } from 'react';
import { usePlayer } from '../context/PlayerContext';
import { useGame } from '../context/GameContext';
import { useInventory } from '../context/InventoryContext';
import { useAuth } from '../context/AuthContext';
import { QuestProgressToast } from './common/QuestProgressToast';
import {
  Gamepad2,
  Coins,
  Gem,
  LogIn,
  Package,
  ShoppingBag,
  Target,
  Trophy,
  Users,
  LayoutGrid,
  Download,
} from 'lucide-react';

export const Header: React.FC = () => {
  const { profile, expNeeded, levelUpInfo } = usePlayer();
  const {
    activeModal,
    setActiveModal,
    activeQuestToast,
    dismissQuestToast,
    dailyQuests,
    achievements,
    activeGameId,
    exitGame,
  } = useGame();
  const { chestCounts } = useInventory();
  const { isLoggedIn, setAuthModalMode } = useAuth();
  const [isOnline, setIsOnline] = useState<boolean>(typeof navigator !== "undefined" ? navigator.onLine : true);

  useEffect(() => {
    const handleOnline = () => setIsOnline(true);
    const handleOffline = () => setIsOnline(false);
    window.addEventListener("online", handleOnline);
    window.addEventListener("offline", handleOffline);
    return () => {
      window.removeEventListener("online", handleOnline);
      window.removeEventListener("offline", handleOffline);
    };
  }, []);

  const handleOpenLogin = () => {
    setAuthModalMode('login');
    setActiveModal('auth');
  };

  const expPercent = Math.min(100, Math.round((profile.exp / expNeeded) * 100));
  const totalChests = Object.values(chestCounts).reduce((a, b) => a + b, 0);
  const unclaimedQuests = dailyQuests.filter((q) => q.completed && !q.claimed).length;
  const unclaimedAchievements = achievements.filter((a) => a.unlocked && !a.claimed).length;
  const today = new Date().toISOString().split('T')[0];
  const isClaimedToday = profile.stats.lastLoginDate === today;
  const hasUnclaimedMenuBadge = !isClaimedToday || unclaimedAchievements > 0;

  return (
    <header className="sticky top-0 z-50 bg-[#0a0a0a]/95 backdrop-blur-lg border-b border-white/5 px-2 sm:px-6 py-2 sm:py-2.5 select-none shadow-md relative">
      <QuestProgressToast toast={activeQuestToast} onDismiss={dismissQuestToast} />
      <div className="max-w-7xl mx-auto flex items-center justify-between gap-1.5 sm:gap-4">
        {/* Left: Brand Logo & Player Profile */}
        <div className="flex items-center gap-1 sm:gap-2.5 min-w-0">
          <button
            id="btn-header-home"
            type="button"
            className="flex items-center gap-1.5 cursor-pointer shrink-0 transition-colors"
            onClick={() => setActiveModal('none')}
            title="ArcadeX Trang Chủ"
          >
            <div className="w-8 h-8 sm:w-9 sm:h-9 rounded-xl bg-gradient-to-br from-indigo-500 to-indigo-700 shadow-md shadow-indigo-500/20 flex items-center justify-center text-white shrink-0">
              <Gamepad2 className="w-4 h-4 sm:w-5 sm:h-5" />
            </div>
            <div className="hidden md:block">
              <div className="flex items-center gap-1">
                <span className="font-extrabold text-sm sm:text-base text-white tracking-wider font-display">
                  ARCADE<span className="text-indigo-400">X</span>
                </span>
                <span className="text-[9px] font-bold px-1.5 py-0.2 rounded bg-indigo-500/15 text-indigo-300 border border-indigo-500/30 uppercase">
                  PWA
                </span>
              </div>
            </div>
          </button>

          {/* Player Quick Info / Auth Badge */}
          <button
            id="btn-header-profile"
            type="button"
            onClick={() => setActiveModal('profile')}
            className="flex items-center gap-1.5 sm:gap-2 pl-1 pr-2 sm:pr-2.5 py-1 rounded-xl bg-[#141414] hover:bg-[#1a1a1a] border border-white/5 hover:border-indigo-500/30 transition-colors text-left group shrink-0 cursor-pointer min-h-[36px] sm:min-h-[38px]"
            title={`Hồ sơ: ${profile.username} | Cấp ${profile.level} (${profile.exp}/${expNeeded} XP)`}
          >
            <div className="w-7 h-7 sm:w-8 sm:h-8 rounded-lg bg-indigo-950/60 border border-indigo-500/20 flex items-center justify-center text-sm sm:text-base shrink-0 relative">
              {profile.avatar}
              {isOnline ? (
                <span className="absolute -top-1 -right-1 w-2.5 h-2.5 bg-emerald-500 rounded-full border-2 border-[#0a0a0a]" title="Đang online (Đã kết nối)" />
              ) : (
                <span className="absolute -top-1 -right-1 w-2.5 h-2.5 bg-rose-500 rounded-full border-2 border-[#0a0a0a] animate-pulse" title="Đang offline (Mất kết nối mạng)" />
              )}
            </div>
            <div className="min-w-0">
              <div className="flex items-center gap-1">
                <span className="text-xs font-bold text-white truncate max-w-[55px] xs:max-w-[75px] sm:max-w-[100px]">{profile.username}</span>
                <span className={`text-[9px] px-1.5 py-0.2 rounded-full font-bold shrink-0 transition-all ${
                  levelUpInfo
                    ? 'bg-gradient-to-r from-amber-500 to-indigo-500 text-white shadow-md shadow-amber-500/50 animate-bounce ring-1 ring-amber-300'
                    : 'bg-indigo-500/20 text-indigo-300 border border-indigo-500/30'
                }`}>
                  {levelUpInfo ? `Lv.${profile.level} UP!` : `Lv.${profile.level}`}
                </span>
              </div>
              <div className="w-14 sm:w-20 h-1.5 bg-[#050505] rounded-full overflow-hidden mt-0.5">
                <div
                  className="h-full bg-indigo-500 transition-all"
                  style={{ width: `${expPercent}%` }}
                />
              </div>
            </div>
          </button>

          {/* Guest Quick Auth Trigger */}
          {!isLoggedIn && (
            <button
              id="btn-header-quick-auth"
              type="button"
              onClick={handleOpenLogin}
              className="hidden lg:flex items-center gap-1.5 px-3 py-1.5 rounded-xl bg-indigo-600/20 hover:bg-indigo-600/30 border border-indigo-500/40 text-indigo-300 text-xs font-bold transition-colors shadow-sm shadow-indigo-500/10 shrink-0 cursor-pointer min-h-[38px]"
            >
              <LogIn className="w-3.5 h-3.5 text-indigo-400" />
              <span>Đăng Nhập</span>
            </button>
          )}
        </div>

        {/* Center: Desktop Main Navigation Toolbar (Primary Actions) */}
        <nav
          aria-label="Thanh công cụ điều hướng chính"
          className="hidden md:flex items-center gap-1 lg:gap-1.5 px-2 py-1 bg-[#12121a]/80 border border-white/10 rounded-2xl shadow-inner backdrop-blur-md"
        >
          {/* 1. Trò Chơi */}
          <button
            id="nav-desktop-games"
            type="button"
            onClick={() => {
              if (activeModal !== 'none') {
                setActiveModal('none');
              } else if (activeGameId) {
                exitGame();
              }
              window.scrollTo({ top: 0, behavior: 'smooth' });
            }}
            className={`flex items-center gap-1.5 px-2.5 py-1.5 rounded-xl text-xs font-bold transition-all cursor-pointer ${
              activeModal === 'none' && !activeGameId
                ? 'bg-indigo-600 text-white shadow-md shadow-indigo-600/30'
                : 'text-slate-300 hover:text-white hover:bg-white/5'
            }`}
            title="Thư viện Trò chơi"
          >
            <Gamepad2 className="w-4 h-4 text-indigo-300" />
            <span className="hidden xl:inline">Trò Chơi</span>
          </button>

          {/* 2. Kho Đồ */}
          <button
            id="nav-desktop-inventory"
            type="button"
            onClick={() => setActiveModal(activeModal === 'inventory' ? 'none' : 'inventory')}
            className={`flex items-center gap-1.5 px-2.5 py-1.5 rounded-xl text-xs font-bold transition-all cursor-pointer relative ${
              activeModal === 'inventory'
                ? 'bg-indigo-600 text-white shadow-md shadow-indigo-600/30'
                : 'text-slate-300 hover:text-white hover:bg-white/5'
            }`}
            title="Kho Đồ & Rương Thưởng"
          >
            <Package className="w-4 h-4 text-indigo-300" />
            <span className="hidden xl:inline">Kho Đồ</span>
            {totalChests > 0 && (
              <span className="px-1.5 py-0.2 rounded-full bg-indigo-500 text-white font-extrabold text-[10px] leading-tight">
                {totalChests}
              </span>
            )}
          </button>

          {/* 3. Lò Rèn */}
          <button
            id="nav-desktop-crafting"
            type="button"
            onClick={() => setActiveModal(activeModal === 'crafting' ? 'none' : 'crafting')}
            className={`flex items-center gap-1.5 px-2.5 py-1.5 rounded-xl text-xs font-bold transition-all cursor-pointer ${
              activeModal === 'crafting'
                ? 'bg-purple-600 text-white shadow-md shadow-purple-600/30'
                : 'text-slate-300 hover:text-white hover:bg-white/5'
            }`}
            title="Lò Rèn Ma Thuật (Nâng cấp & Chế tác bảo vật)"
          >
            <span className="text-sm leading-none">🔨</span>
            <span className="hidden xl:inline">Lò Rèn</span>
          </button>

          {/* 4. Phúc Lợi (Trung Tâm Phúc Lợi Hợp Nhất) */}
          <button
            id="nav-desktop-rewards-hub"
            type="button"
            onClick={() => setActiveModal(activeModal === 'dailyReward' ? 'none' : 'dailyReward')}
            className={`flex items-center gap-1.5 px-2.5 py-1.5 rounded-xl text-xs font-bold transition-all cursor-pointer relative ${
              activeModal === 'dailyReward' || activeModal === 'quests' || activeModal === 'dailyQuests'
                ? 'bg-emerald-600 text-white shadow-md shadow-emerald-600/30'
                : 'text-slate-300 hover:text-white hover:bg-white/5'
            }`}
            title="Trung Tâm Phúc Lợi & Quà Điểm Danh"
          >
            <span className="text-sm leading-none">🎁</span>
            <span className="hidden xl:inline">Phúc Lợi</span>
            {(!isClaimedToday || unclaimedQuests > 0) && (
              <span className="px-1.5 py-0.2 rounded-full bg-emerald-400 text-black font-extrabold text-[10px] leading-tight animate-pulse">
                {(!isClaimedToday ? 1 : 0) + unclaimedQuests}
              </span>
            )}
          </button>

          {/* 5. Cửa Hàng */}
          <button
            id="nav-desktop-shop"
            type="button"
            onClick={() => setActiveModal(activeModal === 'shop' ? 'none' : 'shop')}
            className={`flex items-center gap-1.5 px-2.5 py-1.5 rounded-xl text-xs font-bold transition-all cursor-pointer ${
              activeModal === 'shop'
                ? 'bg-amber-600 text-white shadow-md shadow-amber-600/30'
                : 'text-slate-300 hover:text-white hover:bg-white/5'
            }`}
            title="Cửa Hàng Arcade Shop"
          >
            <ShoppingBag className="w-4 h-4 text-amber-400" />
            <span className="hidden xl:inline">Cửa Hàng</span>
          </button>

          {/* 6. Bảng Vàng */}
          <button
            id="nav-desktop-leaderboard"
            type="button"
            onClick={() => setActiveModal(activeModal === 'leaderboard' ? 'none' : 'leaderboard')}
            className={`flex items-center gap-1.5 px-2.5 py-1.5 rounded-xl text-xs font-bold transition-all cursor-pointer ${
              activeModal === 'leaderboard'
                ? 'bg-yellow-600 text-white shadow-md shadow-yellow-600/30'
                : 'text-slate-300 hover:text-white hover:bg-white/5'
            }`}
            title="Bảng Vàng Cao Thủ"
          >
            <Trophy className="w-4 h-4 text-yellow-400" />
            <span className="hidden xl:inline">Bảng Vàng</span>
          </button>

          {/* 7. Menu Tiện Ích */}
          <button
            id="nav-desktop-more"
            type="button"
            onClick={() => {
              window.dispatchEvent(new CustomEvent('arcadex:open_more_menu'));
            }}
            className="flex items-center gap-1.5 px-2.5 py-1.5 rounded-xl text-xs font-bold transition-all cursor-pointer text-slate-300 hover:text-white hover:bg-white/5 relative"
            title="Menu & Tiện Ích Đầy Đủ"
          >
            <LayoutGrid className="w-4 h-4 text-amber-400" />
            <span className="hidden xl:inline">Menu</span>
            {hasUnclaimedMenuBadge && (
              <span className="w-2 h-2 rounded-full bg-amber-400 animate-ping absolute top-1 right-1" />
            )}
          </button>
        </nav>

        {/* Right: Currency (Coins & Gems) & PWA Download */}
        <div className="flex items-center gap-1.5 sm:gap-2 shrink-0">
          {/* Tải PWA Trigger Button */}
          <button
            id="btn-header-install-pwa"
            type="button"
            onClick={() => {
              window.dispatchEvent(new CustomEvent('arcadex:trigger_pwa_install'));
            }}
            className="flex items-center gap-1 sm:gap-1.5 px-2 sm:px-2.5 py-1.5 rounded-xl bg-gradient-to-r from-indigo-600/30 to-purple-600/30 hover:from-indigo-600/50 hover:to-purple-600/50 border border-indigo-500/40 text-indigo-200 hover:text-white text-[11px] sm:text-xs font-bold transition-all shadow-sm cursor-pointer shrink-0 min-h-[36px]"
            title="Tải & Cài Đặt ArcadeX PWA (Chơi Không Cần Mạng)"
          >
            <Download className="w-3.5 h-3.5 text-indigo-400 animate-bounce shrink-0" />
            <span className="hidden xs:inline">Tải PWA</span>
          </button>

          {/* Arcade Coins (Click to open Arcade Shop) */}
          <button
            id="header-arcade-coins"
            type="button"
            onClick={() => setActiveModal('shop')}
            title="Arcade Coins - Nhấn để mở Cửa Hàng Arcade Shop"
            className="flex items-center gap-1 sm:gap-1.5 px-2 sm:px-3 py-1.5 rounded-xl bg-amber-500/10 hover:bg-amber-500/20 border border-amber-500/30 hover:border-amber-500/50 text-amber-400 text-[11px] sm:text-xs font-bold font-mono transition-colors shadow-sm shadow-amber-500/5 min-h-[36px] cursor-pointer"
          >
            <Coins className="w-3.5 h-3.5 sm:w-4 sm:h-4 text-amber-400 shrink-0" />
            <span className="font-extrabold text-amber-300">
              {profile.coins > 9999 ? `${(profile.coins / 1000).toFixed(1)}k` : profile.coins.toLocaleString()}
            </span>
          </button>

          {/* Gems */}
          <div className="flex items-center gap-1 px-2 sm:px-2.5 py-1.5 rounded-xl bg-[#141414] border border-white/5 text-blue-400 text-[11px] sm:text-xs font-bold font-mono min-h-[36px]">
            <Gem className="w-3.5 h-3.5 sm:w-4 sm:h-4 text-blue-400 shrink-0" />
            <span>{profile.gems.toLocaleString()}</span>
          </div>
        </div>
      </div>
    </header>
  );
};
