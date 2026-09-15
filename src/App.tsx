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
import { DailyQuestsModal } from './components/DailyQuestsModal';
import { WeeklyQuestsModal } from './components/WeeklyQuestsModal';
import { FriendsModal } from './components/FriendsModal';
import { NonIntrusiveToastManager } from './components/common/NonIntrusiveToastManager';
import { DailyChallengesModal } from './components/DailyChallengesModal';
import { ProfileModal } from './components/ProfileModal';
import { AuthModal } from './components/AuthModal';
import { ShareModal } from './components/ShareModal';
import { GlobalChat } from './components/GlobalChat';
import { FloatingChatBubble } from './components/FloatingChatBubble';
import { DailyLoginRewardModal } from './components/DailyLoginRewardModal';
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
import { MonthlyLoginCalendarModal } from './components/MonthlyLoginCalendarModal';
import { DailySpinWheelModal } from './components/DailySpinWheelModal';
import { PvpMatchHistoryModal } from './components/PvpMatchHistoryModal';
import { DiscardSessionConfirmModal } from './components/common/DiscardSessionConfirmModal';
import { CloudSyncStatusIndicator } from './components/common/CloudSyncStatusIndicator';
import { Flame, Gift, Play, XCircle, Cloud, Clock, Footprints, Trophy } from 'lucide-react';

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

            {/* Paused Game Session Sticky Banner (Auto-save / Resume with Quick Session Stats) */}
            {pausedGameSession && (
              <aside
                id="paused-game-banner"
                aria-label="Tiếp tục ván game đang tạm dừng"
                className="bg-gradient-to-r from-amber-950/90 via-[#181824] to-indigo-950/90 border-b border-amber-500/40 px-3.5 py-3 text-xs shadow-xl shadow-amber-500/10 backdrop-blur-md relative z-20"
              >
                <div className="max-w-7xl mx-auto flex flex-col lg:flex-row items-start lg:items-center justify-between gap-3">
                  {/* Left: Game information & status badges */}
                  <div className="flex items-center gap-3 min-w-0">
                    <div className="w-10 h-10 rounded-xl bg-amber-500/20 border border-amber-500/40 flex items-center justify-center text-xl shrink-0 shadow-inner shadow-amber-500/20">
                      {pausedGameSession.gameIcon || '🎮'}
                    </div>
                    <div>
                      <div className="font-bold text-white flex flex-wrap items-center gap-2">
                        <span className="text-sm font-semibold tracking-wide">
                          Ván đang tạm dừng: {pausedGameSession.gameTitle}
                        </span>
                        <span className="text-[10px] px-2 py-0.5 rounded-full bg-emerald-500/20 text-emerald-300 border border-emerald-500/30 flex items-center gap-1 font-medium">
                          <Cloud className="w-2.5 h-2.5 text-emerald-400" />
                          <span>Đồng bộ Cloud</span>
                        </span>
                        {pausedGameSession.isPracticeMode && (
                          <span className="text-[10px] px-2 py-0.5 rounded-full bg-blue-500/20 text-blue-300 border border-blue-500/30 font-medium">
                            Luyện Tập
                          </span>
                        )}
                        {pausedGameSession.isDailyChallengeMode && (
                          <span className="text-[10px] px-2 py-0.5 rounded-full bg-orange-500/20 text-orange-300 border border-orange-500/30 font-medium">
                            Thử Thách Ngày
                          </span>
                        )}
                      </div>
                      <div className="text-[11px] text-slate-400 flex items-center gap-1.5 mt-0.5">
                        <span>Lưu gần nhất:</span>
                        <span className="text-slate-300 font-medium">
                          {pausedGameSession.savedAt ? new Date(pausedGameSession.savedAt).toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' }) : 'Vừa xong'}
                        </span>
                      </div>
                    </div>
                  </div>

                  {/* Middle: Quick Session Stats Summary (Total moves, time elapsed, current score) */}
                  <div
                    id="quick-session-stats-bar"
                    className="flex items-center flex-wrap gap-2 w-full lg:w-auto py-1 px-2.5 rounded-xl bg-black/40 border border-white/10 shadow-inner"
                  >
                    <span className="text-[10px] uppercase font-bold text-amber-400/90 tracking-wider mr-1 hidden sm:inline">
                      Quick Session Stats:
                    </span>

                    {/* Stat: Time Elapsed */}
                    <div
                      id="session-stat-time"
                      className="flex items-center gap-1.5 px-2.5 py-1 rounded-lg bg-white/5 border border-white/5 text-slate-200"
                      title="Tổng thời gian đã trôi qua trong ván"
                    >
                      <Clock className="w-3.5 h-3.5 text-amber-400 shrink-0" />
                      <span className="text-[10px] text-slate-400">Thời gian:</span>
                      <span className="font-mono font-bold text-amber-300">
                        {(() => {
                          const secs = pausedGameSession.timeElapsedSeconds ?? pausedGameSession.sessionStats?.timeElapsed ?? 0;
                          const m = Math.floor(secs / 60);
                          const s = secs % 60;
                          return `${m.toString().padStart(2, '0')}:${s.toString().padStart(2, '0')}`;
                        })()}
                      </span>
                    </div>

                    {/* Stat: Total Moves Made */}
                    <div
                      id="session-stat-moves"
                      className="flex items-center gap-1.5 px-2.5 py-1 rounded-lg bg-white/5 border border-white/5 text-slate-200"
                      title="Tổng số lượt hoặc thao tác nước đi đã thực hiện"
                    >
                      <Footprints className="w-3.5 h-3.5 text-indigo-400 shrink-0" />
                      <span className="text-[10px] text-slate-400">Nước đi:</span>
                      <span className="font-mono font-bold text-indigo-300">
                        {(pausedGameSession.totalMoves ?? pausedGameSession.sessionStats?.moves ?? 0) > 0
                          ? `${pausedGameSession.totalMoves ?? pausedGameSession.sessionStats?.moves} lượt`
                          : '1+ lượt'}
                      </span>
                    </div>

                    {/* Stat: Score */}
                    <div
                      id="session-stat-score"
                      className="flex items-center gap-1.5 px-2.5 py-1 rounded-lg bg-white/5 border border-white/5 text-slate-200"
                      title="Điểm số đạt được trong ván"
                    >
                      <Trophy className="w-3.5 h-3.5 text-yellow-400 shrink-0" />
                      <span className="text-[10px] text-slate-400">Điểm số:</span>
                      <span className="font-mono font-bold text-yellow-300">
                        {pausedGameSession.currentScore.toLocaleString()} pts
                      </span>
                    </div>
                  </div>

                  {/* Right: Actions (Resume or Discard with Confirmation Modal) */}
                  <div className="flex items-center gap-2 shrink-0 self-end lg:self-center w-full sm:w-auto justify-end">
                    <button
                      id="btn-resume-paused-game"
                      type="button"
                      onClick={resumePausedGame}
                      className="flex-1 sm:flex-initial px-4 py-2 rounded-xl bg-gradient-to-r from-amber-500 to-amber-600 hover:from-amber-400 hover:to-amber-500 active:scale-95 text-black font-extrabold text-xs shadow-md shadow-amber-500/20 flex items-center justify-center gap-1.5 transition-all cursor-pointer"
                    >
                      <Play className="w-3.5 h-3.5 fill-black" />
                      <span>Tiếp Tục Ván Chơi</span>
                    </button>
                    <button
                      id="btn-discard-paused-game"
                      type="button"
                      onClick={() => setShowDiscardConfirmModal(true)}
                      className="px-3 py-2 rounded-xl bg-white/5 hover:bg-rose-500/10 active:scale-95 text-slate-400 hover:text-rose-400 text-xs border border-white/5 hover:border-rose-500/30 transition-all cursor-pointer font-medium"
                      title="Hủy ván game đang tạm dừng (yêu cầu xác nhận)"
                    >
                      Hủy ván
                    </button>
                  </div>
                </div>
              </aside>
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
      {activeModal === 'leaderboard' && <LeaderboardModal />}
      {activeModal === 'gameDetail' && <GameDetailModal />}
      {(activeModal === 'quests' || activeModal === 'dailyQuests') && <DailyQuestsModal />}
      {activeModal === 'weeklyQuests' && <WeeklyQuestsModal />}
      {activeModal === 'friends' && <FriendsModal />}
      {activeModal === 'monthlyLogin' && <MonthlyLoginCalendarModal />}
      {activeModal === 'spinWheel' && <DailySpinWheelModal />}
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

      {/* Daily Login Reward Popup Modal */}
      <DailyLoginRewardModal />

      {/* Level Up Celebration Modal */}
      <LevelUpModal />

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
