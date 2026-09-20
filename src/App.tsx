import React, { useState, useEffect } from 'react';
import { motion, AnimatePresence } from 'motion/react';
import { AuthProvider } from './context/AuthContext';
import { PlayerProvider } from './context/PlayerContext';
import { InventoryProvider } from './context/InventoryContext';
import { GameProvider, useGame } from './context/GameContext';
import { Header } from './components/Header';
import { NewsTicker } from './components/NewsTicker';
import { GameCatalog } from './components/GameCatalog';
import { CraftingModal } from './components/CraftingModal';
import { CharacterInventoryModal } from './components/CharacterInventoryModal';
import { AchievementsModal } from './components/AchievementsModal';
import { LeaderboardModal } from './components/LeaderboardModal';
import { FriendsModal } from './components/FriendsModal';
import { NonIntrusiveToastManager } from './components/common/NonIntrusiveToastManager';
import { DailyChallengesModal } from './components/DailyChallengesModal';
import { ProfileModal } from './components/ProfileModal';
import { AuthModal } from './components/AuthModal';
import { ShareModal } from './components/ShareModal';
import { GlobalChat } from './components/GlobalChat';
import { FloatingChatBubble } from './components/FloatingChatBubble';
import { GameDetailModal } from './components/GameDetailModal';
import { SettingsModal } from './components/SettingsModal';
import { ArcadeShopModal } from './components/ArcadeShopModal';
import { HallOfFameModal } from './components/HallOfFameModal';
import { InteractiveOnboarding } from './components/InteractiveOnboarding';
import { PWAInstallPrompt } from './components/PWAInstallPrompt';
import { OfflineIndicator } from './components/OfflineIndicator';
import { MobileNav } from './components/MobileNav';
import { SplashScreen } from './components/SplashScreen';
import { PublicProfileModal } from './components/PublicProfileModal';
import { GameErrorBoundary } from './components/common/GameErrorBoundary';
import { GameWrapper } from './games/GameWrapper';
import { GAME_REGISTRY } from './games/registry';
import { usePlayer } from './context/PlayerContext';
import { useRippleEffect } from './hooks/useRippleEffect';
import { AchievementUnlockedPopup } from './components/AchievementUnlockedPopup';
import { LevelUpModal } from './components/LevelUpModal';
import { ForceUpdateModal } from './components/ForceUpdateModal';
import { DailyRewardsHubModal } from './components/DailyRewardsHubModal';
import { PvpMatchHistoryModal } from './components/PvpMatchHistoryModal';
import { DiscardSessionConfirmModal } from './components/common/DiscardSessionConfirmModal';
import { CloudSyncStatusIndicator } from './components/common/CloudSyncStatusIndicator';
import { QuickHubBar } from './components/QuickHubBar';
import { Flame, Gift, Play, XCircle, Cloud, Clock, Footprints, Trophy, Pause, Save, Bot, Trash2 } from 'lucide-react';

const AppContent: React.FC = () => {
  useRippleEffect();
  const [showSplash, setShowSplash] = useState<boolean>(() => {
    if (typeof window !== 'undefined') {
      return sessionStorage.getItem('arcadex_splash_completed') !== 'true';
    }
    return true;
  });
  const [forceSplashUpdate, setForceSplashUpdate] = useState<boolean>(false);
  const [showDiscardConfirmModal, setShowDiscardConfirmModal] = useState<boolean>(false);

  useEffect(() => {
    const handleTriggerSplash = (e: Event) => {
      const custom = e as CustomEvent<{ forceUpdate?: boolean }>;
      setForceSplashUpdate(Boolean(custom.detail?.forceUpdate));
      setShowSplash(true);
    };
    window.addEventListener('arcadex:trigger_splash', handleTriggerSplash);
    return () => window.removeEventListener('arcadex:trigger_splash', handleTriggerSplash);
  }, []);

  const {
    activeGameId,
    activeModal,
    exitGame,
    setActiveModal,
    shareData,
    closeShareModal,
    isChatOpen,
    toggleChat,
    openChat,
    pausedGameSession,
    resumePausedGame,
    discardPausedGame,
    unlockedAchievement,
    dismissUnlockedAchievement,
    claimAchievement,
    openShareModal,
    openPublicProfile,
  } = useGame();
  const { profile } = usePlayer();

  // Listen to notification click events to automatically open corresponding modal
  useEffect(() => {
    const handleOpenModalEvent = (e: Event) => {
      const custom = e as CustomEvent<{ modal?: string }>;
      if (custom.detail?.modal) {
        setActiveModal(custom.detail.modal as any);
      }
    };
    window.addEventListener('arcadex:open_modal', handleOpenModalEvent);
    return () => window.removeEventListener('arcadex:open_modal', handleOpenModalEvent);
  }, [setActiveModal]);

  // Detect ?profile=... in URL and open public profile card automatically
  useEffect(() => {
    if (typeof window !== 'undefined') {
      const params = new URLSearchParams(window.location.search);
      const profileParam = params.get('profile');
      if (profileParam) {
        openPublicProfile(profileParam);
      }
    }
  }, [openPublicProfile]);

  const today = new Date().toISOString().split('T')[0];
  const isClaimedToday = profile.stats.lastLoginDate === today;

  // Auto-open unified rewards hub on launch if daily reward is unclaimed
  const [hasAutoOpenedRewards, setHasAutoOpenedRewards] = useState(false);
  useEffect(() => {
    if (!hasAutoOpenedRewards && !isClaimedToday && !showSplash && activeGameId === null) {
      const timer = setTimeout(() => {
        if (activeModal === 'none') {
          setActiveModal('dailyReward');
          setHasAutoOpenedRewards(true);
        }
      }, 700);
      return () => clearTimeout(timer);
    }
  }, [hasAutoOpenedRewards, isClaimedToday, showSplash, activeGameId, activeModal, setActiveModal]);

  return (
    <div className="relative w-full min-h-screen bg-[#050505] text-slate-200 overflow-x-hidden selection:bg-indigo-500 selection:text-white">
      {/* Platform Splash Screen & Auto-Update Progress Overlay */}
      {showSplash && (
        <SplashScreen
          forceUpdateMode={forceSplashUpdate}
          onComplete={() => {
            setShowSplash(false);
            setForceSplashUpdate(false);
          }}
        />
      )}

      {/* Smooth Transition between Main Menu Hub and Active Game Session */}
      <AnimatePresence mode="wait">
        {activeGameId && GAME_REGISTRY[activeGameId] ? (
          <motion.div
            key={`game-session-${activeGameId}`}
            initial={{ opacity: 0, scale: 0.98, filter: 'blur(6px)' }}
            animate={{ opacity: 1, scale: 1, filter: 'blur(0px)' }}
            exit={{ opacity: 0, scale: 0.98, filter: 'blur(6px)' }}
            transition={{ duration: 0.28, ease: [0.22, 1, 0.36, 1] }}
            className="relative w-full min-h-screen"
          >
            <GameErrorBoundary onExit={exitGame}>
              <GameWrapper
                gameMeta={GAME_REGISTRY[activeGameId]}
                metadata={GAME_REGISTRY[activeGameId]}
                onExit={exitGame}
              />
            </GameErrorBoundary>
          </motion.div>
        ) : (
          <motion.div
            key="main-menu-hub"
            initial={{ opacity: 0, scale: 1.01, filter: 'blur(6px)' }}
            animate={{ opacity: 1, scale: 1, filter: 'blur(0px)' }}
            exit={{ opacity: 0, scale: 0.99, filter: 'blur(6px)' }}
            transition={{ duration: 0.28, ease: [0.22, 1, 0.36, 1] }}
            className="min-h-screen flex flex-col relative"
          >
            {/* Platform Header */}
            <Header />

            {/* Platform News & System Updates Marquee Ticker */}
            <NewsTicker />

            {/* Quick Hub Bar (Daily Streak, Spin Wheel, 30-Day Calendar, Daily Challenge, Hall of Fame) - Placed Above Paused Game */}
            <div className="max-w-7xl mx-auto w-full px-2.5 sm:px-6 pt-2.5 sm:pt-3">
              <QuickHubBar />
            </div>

            {/* Paused Game Session Banner (Auto-save / Resume with Quick Session Stats) */}
            {pausedGameSession && (
              <div className="max-w-7xl mx-auto w-full px-2.5 sm:px-6 pt-2 sm:pt-2.5">
                <aside
                  id="paused-game-banner"
                  aria-label="Tiếp tục ván game đang tạm dừng"
                  className="rounded-2xl bg-gradient-to-r from-amber-950/80 via-[#14141e] to-indigo-950/80 border border-amber-500/30 px-2.5 sm:px-3.5 py-1.5 sm:py-2 text-xs shadow-lg shadow-amber-500/10 backdrop-blur-md relative z-20 overflow-hidden"
                >
                  <div className="flex items-center justify-between gap-1.5 sm:gap-3 flex-nowrap min-w-0">
                    {/* Left: Game Icon, Title & Status Badges */}
                    <div className="flex items-center gap-1.5 sm:gap-2 min-w-0 flex-1">
                      <div className="w-7 h-7 sm:w-8 sm:h-8 rounded-lg bg-amber-500/20 border border-amber-500/40 flex items-center justify-center text-base sm:text-lg shrink-0 shadow-inner">
                        {pausedGameSession.gameIcon || '🎮'}
                      </div>
                      <div className="flex items-center gap-1 min-w-0">
                        <span className="font-bold text-white text-xs sm:text-sm tracking-tight truncate flex items-center gap-1">
                          <Pause className="w-3 h-3 text-amber-400 shrink-0" />
                          <span className="truncate max-w-[85px] min-[370px]:max-w-[120px] sm:max-w-[200px] md:max-w-none">{pausedGameSession.gameTitle}</span>
                        </span>
                        <span className="p-0.5 rounded-full bg-emerald-500/20 text-emerald-300 border border-emerald-500/30 flex items-center justify-center shrink-0" title="Đồng bộ Cloud">
                          <Cloud className="w-2.5 h-2.5 text-emerald-400" />
                        </span>
                        {pausedGameSession.isPracticeMode && (
                          <span className="p-0.5 rounded-full bg-blue-500/20 text-blue-300 border border-blue-500/30 flex items-center justify-center shrink-0" title="Luyện Tập">
                            <Bot className="w-2.5 h-2.5 text-blue-400" />
                          </span>
                        )}
                        {pausedGameSession.isDailyChallengeMode && (
                          <span className="p-0.5 rounded-full bg-orange-500/20 text-orange-300 border border-orange-500/30 flex items-center justify-center shrink-0" title="Thử Thách Ngày">
                            <Flame className="w-2.5 h-2.5 text-orange-400" />
                          </span>
                        )}
                      </div>
                    </div>

                    {/* Middle: Compact Session Stats (Time, Moves, Score) */}
                    <div
                      id="quick-session-stats-bar"
                      className="flex items-center gap-1 sm:gap-1.5 py-0.5 px-1.5 sm:px-2 rounded-lg bg-black/50 border border-white/10 shrink-0 text-[10px] sm:text-xs"
                    >
                      {/* Time */}
                      <div
                        id="session-stat-time"
                        className="flex items-center gap-1 text-slate-200"
                        title="Thời gian đã chơi"
                      >
                        <Clock className="w-2.5 h-2.5 sm:w-3 sm:h-3 text-amber-400 shrink-0" />
                        <span className="font-mono font-bold text-amber-300">
                          {(() => {
                            const secs = pausedGameSession.timeElapsedSeconds ?? pausedGameSession.sessionStats?.timeElapsed ?? 0;
                            const m = Math.floor(secs / 60);
                            const s = secs % 60;
                            return `${m.toString().padStart(2, '0')}:${s.toString().padStart(2, '0')}`;
                          })()}
                        </span>
                      </div>

                      <span className="text-white/20 text-[9px]">|</span>

                      {/* Moves */}
                      <div
                        id="session-stat-moves"
                        className="flex items-center gap-1 text-slate-200"
                        title="Số nước đi"
                      >
                        <Footprints className="w-2.5 h-2.5 sm:w-3 sm:h-3 text-indigo-400 shrink-0" />
                        <span className="font-mono font-bold text-indigo-300">
                          {(pausedGameSession.totalMoves ?? pausedGameSession.sessionStats?.moves ?? 0) > 0
                            ? (pausedGameSession.totalMoves ?? pausedGameSession.sessionStats?.moves)
                            : 1}
                        </span>
                      </div>

                      <span className="text-white/20 text-[9px]">|</span>

                      {/* Score */}
                      <div
                        id="session-stat-score"
                        className="flex items-center gap-1 text-slate-200"
                        title="Điểm số"
                      >
                        <Trophy className="w-2.5 h-2.5 sm:w-3 sm:h-3 text-yellow-400 shrink-0" />
                        <span className="font-mono font-bold text-yellow-300">
                          {pausedGameSession.currentScore.toLocaleString()}
                        </span>
                      </div>
                    </div>

                    {/* Right: Actions (Resume / Discard) */}
                    <div className="flex items-center gap-1 shrink-0">
                      <button
                        id="btn-resume-paused-game"
                        type="button"
                        onClick={resumePausedGame}
                        title="Tiếp tục chơi"
                        aria-label="Tiếp tục chơi"
                        className="p-1.5 sm:px-2.5 sm:py-1.5 rounded-lg bg-gradient-to-r from-amber-500 to-amber-600 hover:from-amber-400 hover:to-amber-500 active:scale-95 text-black font-extrabold text-xs shadow-md shadow-amber-500/20 flex items-center justify-center transition-all cursor-pointer shrink-0"
                      >
                        <Play className="w-3.5 h-3.5 fill-black" />
                      </button>
                      <button
                        id="btn-discard-paused-game"
                        type="button"
                        onClick={() => setShowDiscardConfirmModal(true)}
                        title="Hủy ván game"
                        aria-label="Hủy ván game"
                        className="p-1.5 rounded-lg bg-white/5 hover:bg-rose-500/10 active:scale-95 text-slate-400 hover:text-rose-400 border border-white/5 hover:border-rose-500/30 transition-all cursor-pointer flex items-center justify-center shrink-0"
                      >
                        <Trash2 className="w-3.5 h-3.5 text-rose-400" />
                      </button>
                    </div>
                  </div>
                </aside>
              </div>
            )}

            {/* Unclaimed Daily Login Notification Sticky Bar (if not claimed today and not playing a game) */}
            {!isClaimedToday && (
              <aside
                aria-label="Nhắc nhở điểm danh hàng ngày"
                className="bg-gradient-to-r from-indigo-950/90 via-[#141414] to-purple-950/90 border-b border-indigo-500/30 px-3 py-2 text-xs"
              >
                <div className="max-w-7xl mx-auto flex items-center justify-between gap-3">
                  <div className="flex items-center gap-2 text-indigo-200">
                    <span className="flex h-2 w-2 relative">
                      <span className="animate-ping absolute inline-flex h-full w-full rounded-full bg-orange-400 opacity-75"></span>
                      <span className="relative inline-flex rounded-full h-2 w-2 bg-orange-500"></span>
                    </span>
                    <Gift className="w-4 h-4 text-amber-400 shrink-0" />
                    <span>
                      Bạn có{' '}
                      <strong>
                        Quà Điểm Danh Ngày{' '}
                        {profile.stats.dailyStreak + 1 > 7 ? 1 : profile.stats.dailyStreak + 1}
                      </strong>{' '}
                      chưa nhận!
                    </span>
                  </div>
                  <button
                    id="btn-banner-claim-daily"
                    type="button"
                    onClick={() => setActiveModal('dailyReward')}
                    className="px-3 py-1 rounded-lg bg-indigo-600 hover:bg-indigo-500 text-white font-bold text-[11px] flex items-center gap-1 shadow-md shadow-indigo-500/20 transition-all shrink-0"
                  >
                    <Flame className="w-3 h-3 fill-orange-400 text-orange-400" />
                    <span>Nhận Quà Ngay</span>
                  </button>
                </div>
              </aside>
            )}

            {/* Main Game Catalog Hub */}
            <main className="flex-1 pb-24 md:pb-24">
              <GameCatalog />
            </main>

            {/* Interactive Onboarding Tour Overlay */}
            <InteractiveOnboarding />

            {/* Footer */}
            <footer className="border-t border-white/5 py-6 px-4 text-center text-xs text-slate-500 bg-[#0a0a0a] pb-28 md:pb-24">
              <div className="max-w-7xl mx-auto flex flex-col sm:flex-row items-center justify-between gap-3">
                <p>© {new Date().getFullYear()} ArcadeX Instant Game Platform — Plug-and-Play Architecture.</p>
                <div className="flex items-center gap-4 text-slate-400">
                  <span>5 Mini-Games Tích Hợp</span>
                  <span>•</span>
                  <span>Offline PWA Ready</span>
                  <span>•</span>
                  <span>Hệ Thống Rương Đồ & Gacha</span>
                </div>
              </div>
            </footer>
          </motion.div>
        )}
      </AnimatePresence>

      {/* Global Modals & Overlays (Available from anywhere) */}
      {activeModal === 'inventory' && <CharacterInventoryModal />}
      {activeModal === 'shop' && <ArcadeShopModal />}
      {activeModal === 'hallOfFame' && <HallOfFameModal />}
      {activeModal === 'profile' && <ProfileModal />}
      {activeModal === 'publicProfile' && <PublicProfileModal />}
      {activeModal === 'settings' && <SettingsModal />}
      {activeModal === 'crafting' && <CraftingModal initialTab="forge" />}
      {activeModal === 'achievements' && <AchievementsModal />}
      {activeModal === 'leaderboard' && <LeaderboardModal initialGameId={activeGameId || undefined} />}
      {activeModal === 'gameDetail' && <GameDetailModal />}
      {(activeModal === 'quests' ||
        activeModal === 'dailyQuests' ||
        activeModal === 'weeklyQuests' ||
        activeModal === 'monthlyLogin' ||
        activeModal === 'spinWheel' ||
        activeModal === 'dailyReward') && <DailyRewardsHubModal />}
      {activeModal === 'friends' && <FriendsModal />}
      {activeModal === 'pvpHistory' && <PvpMatchHistoryModal />}
      {activeModal === 'dailyChallengesList' && <DailyChallengesModal />}
      {activeModal === 'auth' && <AuthModal />}
      {activeModal === 'share' && shareData && (
        <ShareModal data={shareData} onClose={closeShareModal} onOpenChat={openChat} />
      )}

      {/* Discard Paused Game Session Confirmation Modal */}
      <DiscardSessionConfirmModal
        isOpen={showDiscardConfirmModal}
        session={pausedGameSession}
        onClose={() => setShowDiscardConfirmModal(false)}
        onConfirmDiscard={() => {
          discardPausedGame();
          setShowDiscardConfirmModal(false);
        }}
      />

      {/* Subtle Cloud Auto-saving Status Indicator (Floating Top-Right) */}
      <CloudSyncStatusIndicator />

      {/* Non-intrusive Floating Toast Notifications (PvP Invites & Achievement Rewards) */}
      <NonIntrusiveToastManager />

      {/* Level Up Celebration Modal (Displayed on Launcher) */}
      <LevelUpModal />

      {/* Launcher Force Update Modal (Hidden when in-game, shown on launcher with persistent blur overlay) */}
      <ForceUpdateModal />

      {/* Primary Fixed Mobile Bottom Navigation Bar (Active on Main Menu & Hub) */}
      {!activeGameId && <MobileNav />}

      {/* Celebratory Achievement Unlocked Popup Animation */}
      <AchievementUnlockedPopup
        achievement={unlockedAchievement}
        onDismiss={dismissUnlockedAchievement}
        onClaim={claimAchievement}
        onShare={(ach) =>
          openShareModal({
            type: 'achievement',
            title: `Mở khóa thành tựu: ${ach.title}`,
            description: `Tôi vừa hoàn thành thành tựu "${ach.title}" trên ArcadeX và nhận ${ach.rewardCoins} Arcade Coins!`,
            achievement: ach,
          })
        }
      />

      {/* Offline Status Indicator */}
      <OfflineIndicator />

      {/* PWA Prompt */}
      <PWAInstallPrompt />

      {/* Draggable Chat Bubble (Active across all games and views, draggable & closable) */}
      <FloatingChatBubble />

      {/* Real-time Global Chat Floating Window - Rendered last so it sits on top of all views */}
      <GlobalChat isOpen={isChatOpen} onToggle={toggleChat} onOpenShare={() => setActiveModal('share')} />
    </div>
  );
};

export function App() {
  return (
    <AuthProvider>
      <PlayerProvider>
        <InventoryProvider>
          <GameProvider>
            <AppContent />
          </GameProvider>
        </InventoryProvider>
      </PlayerProvider>
    </AuthProvider>
  );
}

export default App;
