import { GamePackageGate } from './components/GamePackageGate';
import { installReadability } from './accessibility/readability.js';
import './accessibility/readability.css';
import React, { useState, useEffect } from 'react';
import { LauncherProvider, useLauncher } from './launcher/LauncherContext';
import { ResumeCard } from './launcher/ResumeCard';
import { SupportPanel } from './launcher/SupportPanel';
import { motion, AnimatePresence } from 'motion/react';
import { AuthProvider, useAuth } from './context/AuthContext';
import { PlayerProvider } from './context/PlayerContext';
import { InventoryProvider } from './context/InventoryContext';
import { GameProvider, useGame } from './context/GameContext';
import { Header } from './components/Header';
import { GameCatalog } from './components/GameCatalog';
import { LeaderboardModal } from './components/LeaderboardModal';
import { NonIntrusiveToastManager } from './components/common/NonIntrusiveToastManager';
import { ProfileModal } from './components/ProfileModal';
import { ShareModal } from './components/ShareModal';
import { GlobalChat } from './components/GlobalChat';
import { GameDetailModal } from './components/GameDetailModal';
import { SettingsModal } from './components/SettingsModal';
import { PWAInstallPrompt } from './components/PWAInstallPrompt';
import { OfflineIndicator } from './components/OfflineIndicator';
import { SplashScreen } from './components/SplashScreen';
import { MobileNav } from './components/MobileNav';
import { GameErrorBoundary } from './components/common/GameErrorBoundary';
const GameWrapper = React.lazy(() => import('./games/GameWrapper').then(module => ({ default: module.GameWrapper }))); 
import { GAME_REGISTRY } from './games/registry';
import { useRippleEffect } from './hooks/useRippleEffect';
import { ForceUpdateModal } from './components/ForceUpdateModal';
import { PvpMatchHistoryModal } from './components/PvpMatchHistoryModal';
import { DiscardSessionConfirmModal } from './components/common/DiscardSessionConfirmModal';
import { CloudSyncStatusIndicator } from './components/common/CloudSyncStatusIndicator';
import { Flame, Gift, Play, XCircle, Cloud, Clock, Footprints, Trophy, Pause, Save, Bot, Trash2 } from 'lucide-react';

const AppContent: React.FC = () => {
  useRippleEffect();
  useEffect(() => installReadability(), []);
  const launcher = useLauncher();
  const { openEntry, authModalMode, notice, dismissNotice } = useAuth();
  const [showSplash, setShowSplash] = useState(false);
  const [showDiscardConfirmModal, setShowDiscardConfirmModal] = useState(false);

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
  } = useGame();

  useEffect(() => { if (activeModal === 'auth') { setActiveModal('none'); openEntry(authModalMode); } }, [activeModal, authModalMode, openEntry, setActiveModal]);

  useEffect(() => {
    const preview = () => { if (!activeGameId) setShowSplash(true); };
    window.addEventListener('arcadex:trigger_splash', preview);
    return () => window.removeEventListener('arcadex:trigger_splash', preview);
  }, [activeGameId]);

  // Listen to notification click events to automatically open corresponding modal
  useEffect(() => {
    const handleOpenModalEvent = (e: Event) => {
      const custom = e as CustomEvent<{ modal?: string }>;
      if (custom.detail?.modal === 'friends') { openChat(); return; }
      if (custom.detail?.modal) {
        setActiveModal(custom.detail.modal as any);
      }
    };
    window.addEventListener('arcadex:open_modal', handleOpenModalEvent);
    return () => window.removeEventListener('arcadex:open_modal', handleOpenModalEvent);
  }, [setActiveModal]);

  return (
    <div className={`${!activeGameId ? "launcher-light " : ""}arcade-app relative w-full min-h-screen bg-[#050505] text-slate-200 overflow-x-hidden selection:bg-indigo-500 selection:text-white`}>
      {showSplash && !activeGameId && <SplashScreen onComplete={() => setShowSplash(false)}/>}

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
              <GamePackageGate key={activeGameId} game={GAME_REGISTRY[activeGameId]} onExit={exitGame}>
              <GameWrapper
                gameMeta={GAME_REGISTRY[activeGameId]}
                metadata={GAME_REGISTRY[activeGameId]}
                onExit={exitGame}
              />
              </GamePackageGate>
            </GameErrorBoundary>
          </motion.div>
        ) : (
          <motion.div
            key="main-menu-hub"
            initial={{ opacity: 0, scale: 1.01, filter: 'blur(6px)' }}
            animate={{ opacity: 1, scale: 1, filter: 'blur(0px)' }}
            exit={{ opacity: 0, scale: 0.99, filter: 'blur(6px)' }}
            transition={{ duration: 0.28, ease: [0.22, 1, 0.36, 1] }}
            className="arcade-launcher min-h-screen flex flex-col relative"
          >
            {/* Platform Header */}
            <Header />

            {/* Platform News & System Updates Marquee Ticker */}


            {notice && <div role="status" className="launcher-notice max-w-7xl mx-auto w-full px-6 py-3 text-sm flex gap-3"><p>{notice}</p><button onClick={dismissNotice} aria-label="Đóng thông báo">×</button></div>}

            {launcher.notice && <div className="launcher-notice" role="status"><span>{launcher.notice}</span><button onClick={launcher.dismissNotice} aria-label="Đóng thông báo thư viện">×</button></div>}
            {launcher.busy && <p className="launcher-notice" role="status">Đang chuẩn bị trò chơi…</p>}
            {pausedGameSession && <ResumeCard session={pausedGameSession} onResume={resumePausedGame} onDiscard={()=>setShowDiscardConfirmModal(true)}/>}

            {/* Main Game Catalog Hub */}
            <main className="flex-1 pb-16 md:pb-6">
              <GameCatalog />
            </main>

            <SupportPanel/>
            {/* Footer */}
            <footer className="launcher-footer border-t border-white/5 py-6 px-4 text-center text-xs text-slate-500 bg-[#0a0a0a] pb-24 md:pb-6">
              <div className="max-w-7xl mx-auto flex flex-col sm:flex-row items-center justify-between gap-3">
                <p>© {new Date().getFullYear()} ArcadeX. Chơi theo cách của bạn.</p>
                <div className="flex items-center gap-4 text-slate-400">
                  <span>{launcher.catalog.games.length} trò chơi</span>
                  <span>•</span>
                  <span>Game đơn có thể chơi offline sau lần tải đầu</span>
                  <span>•</span>
                  <span>Chọn game & chơi ngay</span>
                </div>
              </div>
            </footer>
          </motion.div>
        )}
      </AnimatePresence>

      <div className="platform-ui">
      {/* Global Modals & Overlays (Available from anywhere) */}
      {activeModal === 'profile' && <ProfileModal />}
      {activeModal === 'settings' && <SettingsModal />}
      {activeModal === 'leaderboard' && <LeaderboardModal initialGameId={activeGameId || undefined} />}
      {activeModal === 'gameDetail' && <GameDetailModal />}
      {activeModal === 'pvpHistory' && <PvpMatchHistoryModal />}
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

      {/* Non-intrusive game invitations */}
      <NonIntrusiveToastManager />

      {/* Launcher Force Update Modal (Hidden when in-game, shown on launcher with persistent blur overlay) */}
      <ForceUpdateModal />

      </div>
      {/* Primary Fixed Mobile Bottom Navigation Bar (Active on Main Menu & Hub) */}
      {!activeGameId && <MobileNav />}

      {/* Offline Status Indicator */}
      <div className="platform-ui"><OfflineIndicator /></div>

      {/* PWA Prompt */}
      {activeModal !== 'auth' && !activeGameId && <div className="platform-ui"><PWAInstallPrompt /></div>}

      {/* Draggable Chat Bubble (Active across all games and views, draggable & closable) */}


      {/* Real-time Global Chat Floating Window - Rendered last so it sits on top of all views */}
      <div className="platform-ui"><GlobalChat isOpen={isChatOpen} onToggle={toggleChat} onOpenShare={() => setActiveModal('share')} /></div>
    </div>
  );
};

export function App({ reviewControls }: { reviewControls?: React.ReactNode } = {}) {
  return (
    <AuthProvider>
      <LauncherProvider>
      <PlayerProvider>
        <InventoryProvider>
          <GameProvider>
            <AppContent />
            {reviewControls}
          </GameProvider>
        </InventoryProvider>
      </PlayerProvider>
      </LauncherProvider>
    </AuthProvider>
  );
}

export default App;
