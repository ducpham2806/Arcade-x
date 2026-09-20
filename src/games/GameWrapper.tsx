import React, { useState, useMemo, useCallback, useEffect, useRef } from 'react';
import { GameMetadata } from '../types';
import { createGameBridge } from './GameBridge';
import { usePlayer } from '../context/PlayerContext';
import { useInventory } from '../context/InventoryContext';
import { useGame } from '../context/GameContext';
import { CHEST_TYPES, StorageService } from '../services/storage';
import { calculateAchievedRank, generateGameRecapCardImage } from '../utils/recapGenerator';
import { PreGameLoadingScreen } from '../components/PreGameLoadingScreen';
import { useDynamicViewportScale } from '../hooks/useDynamicViewportScale';
import {
  Pause,
  Play,
  RotateCcw,
  Home,
  Volume2,
  VolumeX,
  Music,
  Music2,
  Trophy,
  Sparkles,
  Zap,
  Coins,
  ShieldAlert,
  Gamepad2,
  Share2,
  Camera,
  Download,
  Award,
  Clock,
  Bookmark,
  BookmarkCheck,
  Bell,
  ScrollText,
  Save,
  CheckCircle2,
  Maximize2,
  Minimize2,
} from 'lucide-react';
import confetti from 'canvas-confetti';
import { soundEngine } from '../services/audio';

interface GameWrapperProps {
  gameMeta?: GameMetadata;
  metadata?: GameMetadata;
  onExit: () => void;
}

export const GameWrapper: React.FC<GameWrapperProps> = ({ gameMeta: propMeta, metadata, onExit }) => {
  const gameMeta = propMeta || metadata;
  const { profile, recordGamePlayed, addExp, addCoins, addGems } = usePlayer();
  const { addChest, getEquippedSkinForGame, openChest } = useInventory();
  const {
    reportAchievementProgress,
    reportQuestProgress,
    submitGameScore,
    isSoundMuted,
    toggleSound,
    isMusicMuted,
    toggleMusic,
    setActiveModal,
    openShareModal,
    isPracticeMode,
    isDailyChallengeMode,
    activeModal,
    saveAndSuspendGame,
    autoSaveGameSession,
    pausedGameSession,
  } = useGame();

  const [isPaused, setIsPaused] = useState<boolean>(false);
  const [resumeCountdown, setResumeCountdown] = useState<number | null>(null);
  const [showPreGameLoading, setShowPreGameLoading] = useState<boolean>(() => {
    try {
      const skipped = localStorage.getItem('arcadex_skip_pregame_loading');
      return skipped !== 'true';
    } catch {
      return true;
    }
  });

  const handleResume = useCallback(() => {
    setIsPaused(false);
    setResumeCountdown(3);
  }, []);

  useEffect(() => {
    if (resumeCountdown === null) return;
    if (resumeCountdown > 0) {
      soundEngine.play('click');
      const timer = setTimeout(() => {
        setResumeCountdown((prev) => (prev !== null ? prev - 1 : null));
      }, 750);
      return () => clearTimeout(timer);
    } else {
      soundEngine.play('pop');
      const timer = setTimeout(() => {
        setResumeCountdown(null);
      }, 500);
      return () => clearTimeout(timer);
    }
  }, [resumeCountdown]);
  const [hasAutoSaved, setHasAutoSaved] = useState<boolean>(false);
  const [gameOverData, setGameOverData] = useState<{
    score: number;
    isHighScore: boolean;
    droppedChest: 'common' | 'rare' | 'epic' | 'legendary' | null;
    stats?: Record<string, number>;
    expEarned?: number;
    coinsEarned?: number;
  } | null>(null);
  const [gameSessionKey, setGameSessionKey] = useState<number>(0);
  const [showExitConfirm, setShowExitConfirm] = useState<boolean>(false);

  // Active Game Session Stats & Timer Tracking
  const gameId = gameMeta?.id || 'default';
  const highScore = profile?.stats?.highScores?.[gameId] || 0;

  const sessionStartTimeRef = useRef<number>(Date.now());
  const isResumingThisGame = pausedGameSession && pausedGameSession.gameId === gameId;
  const initialTimeOffsetRef = useRef<number>(
    isResumingThisGame
      ? (pausedGameSession.timeElapsedSeconds ?? pausedGameSession.sessionStats?.timeElapsed ?? 0)
      : 0
  );
  const movesCountRef = useRef<number>(
    isResumingThisGame
      ? (pausedGameSession.totalMoves ?? pausedGameSession.sessionStats?.moves ?? 0)
      : 0
  );
  const currentScoreRef = useRef<number>(
    isResumingThisGame ? pausedGameSession.currentScore : 0
  );

  // Listen to user inputs (keys, taps) to accurately record player moves across all mini-games
  useEffect(() => {
    const handleKeyDown = (e: KeyboardEvent) => {
      if (['ArrowUp', 'ArrowDown', 'ArrowLeft', 'ArrowRight', 'KeyW', 'KeyA', 'KeyS', 'KeyD', 'Space', 'Enter'].includes(e.code)) {
        movesCountRef.current += 1;
      }
    };
    window.addEventListener('keydown', handleKeyDown, { passive: true });
    return () => window.removeEventListener('keydown', handleKeyDown);
  }, []);

  const [sessionSummaryData, setSessionSummaryData] = useState<{
    timePlayedSeconds: number;
    scoreEarned: number;
    isHighScore: boolean;
    droppedChest: string | null;
    rankText: string;
    coinsEarned: number;
    expEarned: number;
  } | null>(null);
  const [showSessionSummaryModal, setShowSessionSummaryModal] = useState<boolean>(false);

  const handleTriggerExit = useCallback(() => {
    setShowExitConfirm(false);
    const timePlayed = Math.max(1, Math.floor((Date.now() - sessionStartTimeRef.current) / 1000));
    const score = gameOverData?.score || highScore || 0;
    const calculatedRank = calculateAchievedRank(gameId, score);

    setSessionSummaryData({
      timePlayedSeconds: timePlayed,
      scoreEarned: score,
      isHighScore: !!gameOverData?.isHighScore,
      droppedChest: gameOverData?.droppedChest || null,
      rankText: calculatedRank.rankText,
      coinsEarned: Math.max(5, Math.floor(score / 15)),
      expEarned: Math.max(10, Math.floor(score / 10)),
    });
    setShowSessionSummaryModal(true);
  }, [gameOverData, highScore, gameId]);

  // Auto-pause whenever an overlay modal (leaderboard, quests, profile, etc.) is opened
  useEffect(() => {
    if (activeModal !== 'none' && !gameOverData) {
      setIsPaused(true);
    }
  }, [activeModal, gameOverData]);

  // Auto-pause if user switches tab or minimizes browser window
  useEffect(() => {
    const handleVisibilityChange = () => {
      if (document.hidden && !gameOverData) {
        setIsPaused(true);
      }
    };
    document.addEventListener('visibilitychange', handleVisibilityChange);
    return () => document.removeEventListener('visibilitychange', handleVisibilityChange);
  }, [gameOverData]);

  // Game Recap State
  const [recapCardImage, setRecapCardImage] = useState<string | null>(null);
  const [isGeneratingRecap, setIsGeneratingRecap] = useState<boolean>(false);
  const [matchTimestamp, setMatchTimestamp] = useState<string>('');

  // Dynamic Viewport Scaling Hook for adaptive mobile resolution & overlap prevention
  const [isFullscreen, setIsFullscreen] = useState<boolean>(false);

  useEffect(() => {
    const handleFullscreenChange = () => {
      setIsFullscreen(!!(document.fullscreenElement || (document as any).webkitFullscreenElement));
    };
    document.addEventListener('fullscreenchange', handleFullscreenChange);
    document.addEventListener('webkitfullscreenchange', handleFullscreenChange);
    return () => {
      document.removeEventListener('fullscreenchange', handleFullscreenChange);
      document.removeEventListener('webkitfullscreenchange', handleFullscreenChange);
    };
  }, []);

  const toggleFullscreen = useCallback(() => {
    try {
      if (!document.fullscreenElement && !(document as any).webkitFullscreenElement) {
        const docEl = document.documentElement;
        if (docEl.requestFullscreen) {
          docEl.requestFullscreen().catch(() => {});
        } else if ((docEl as any).webkitRequestFullscreen) {
          (docEl as any).webkitRequestFullscreen();
        }
      } else {
        if (document.exitFullscreen) {
          document.exitFullscreen().catch(() => {});
        } else if ((document as any).webkitExitFullscreen) {
          (document as any).webkitExitFullscreen();
        }
      }
    } catch {
      // Ignore fullscreen permission exceptions
    }
  }, []);

  const {
    containerRef: viewportContainerRef,
    stageRef: viewportStageRef,
    scalePercent,
    renderResolution,
    safeInsets,
    zoomMode,
    toggleZoomMode,
    stageStyle,
    cssVariables,
  } = useDynamicViewportScale({
    gameId: gameMeta?.id,
    category: gameMeta?.category,
  });

  // Handle Save Game and Exit to Main Hub safely
  const handleSaveAndExit = useCallback(() => {
    if (!gameMeta) return;
    const timePlayed = initialTimeOffsetRef.current + Math.max(1, Math.floor((Date.now() - sessionStartTimeRef.current) / 1000));
    const score = currentScoreRef.current > 0 ? currentScoreRef.current : (highScore > 0 ? Math.round(highScore * 0.5) : 100);
    saveAndSuspendGame({
      gameId: gameMeta.id,
      gameTitle: gameMeta.title,
      gameIcon: gameMeta.icon,
      currentScore: score,
      isPracticeMode,
      isDailyChallengeMode,
      savedAt: Date.now(),
      totalMoves: movesCountRef.current,
      timeElapsedSeconds: timePlayed,
      sessionStats: {
        moves: movesCountRef.current,
        timeElapsed: timePlayed,
        score,
      },
    }, true);
    setHasAutoSaved(true);
  }, [gameMeta, highScore, isPracticeMode, isDailyChallengeMode, saveAndSuspendGame]);

  // Periodic background auto-saving to cloud during active gameplay
  useEffect(() => {
    if (!gameMeta || gameOverData) return;
    const interval = setInterval(() => {
      if (document.hidden || isPaused) return;
      const timePlayed = initialTimeOffsetRef.current + Math.max(1, Math.floor((Date.now() - sessionStartTimeRef.current) / 1000));
      const score = currentScoreRef.current > 0 ? currentScoreRef.current : (highScore > 0 ? Math.round(highScore * 0.5) : 100);
      autoSaveGameSession({
        gameId: gameMeta.id,
        gameTitle: gameMeta.title,
        gameIcon: gameMeta.icon,
        currentScore: score,
        isPracticeMode,
        isDailyChallengeMode,
        savedAt: Date.now(),
        totalMoves: movesCountRef.current,
        timeElapsedSeconds: timePlayed,
        sessionStats: {
          moves: movesCountRef.current,
          timeElapsed: timePlayed,
          score,
        },
      });
    }, 30000);
    return () => clearInterval(interval);
  }, [gameMeta, gameOverData, isPaused, isPracticeMode, isDailyChallengeMode, highScore, autoSaveGameSession]);

  const rankInfo = useMemo(() => {
    if (!gameOverData) return null;
    return calculateAchievedRank(gameId, gameOverData.score);
  }, [gameId, gameOverData]);

  // Auto-generate shareable image card on Game Over
  useEffect(() => {
    if (!gameOverData || !gameMeta) {
      setRecapCardImage(null);
      setMatchTimestamp('');
      return;
    }

    let isMounted = true;
    const now = new Date();
    const timeFormatted = `${now.getHours().toString().padStart(2, '0')}:${now.getMinutes().toString().padStart(2, '0')}:${now.getSeconds().toString().padStart(2, '0')} - ${now.getDate().toString().padStart(2, '0')}/${(now.getMonth() + 1).toString().padStart(2, '0')}/${now.getFullYear()}`;
    setMatchTimestamp(timeFormatted);

    const calculatedRank = calculateAchievedRank(gameMeta.id, gameOverData.score);
    setIsGeneratingRecap(true);

    generateGameRecapCardImage({
      gameTitle: gameMeta.title,
      gameId: gameMeta.id,
      score: gameOverData.score,
      achievedRank: calculatedRank.rankText,
      rankBadge: calculatedRank.tierBadge,
      timestamp: timeFormatted,
      playerName: profile.username,
      playerAvatar: profile.avatar,
      playerTitle: profile.currentTitle,
      playerLevel: profile.level,
      coinsEarned: Math.max(5, Math.floor(gameOverData.score / 15)),
      expEarned: Math.max(10, Math.floor(gameOverData.score / 10)),
      isHighScore: gameOverData.isHighScore,
    })
      .then((dataUrl) => {
        if (isMounted) {
          setRecapCardImage(dataUrl);
        }
      })
      .catch((err) => {
        console.warn('Game Recap card generation error:', err);
      })
      .finally(() => {
        if (isMounted) {
          setIsGeneratingRecap(false);
        }
      });

    return () => {
      isMounted = false;
    };
  }, [gameOverData, gameMeta, profile]);

  const bridge = useMemo(() => {
    return createGameBridge({
      gameId: gameId,
      dropRates: gameMeta?.dropRates || {
        baseChestDropChance: 0.3,
        scoreThresholdForDrop: 100,
        chestWeights: [{ type: 'common', weight: 100 }],
      },
      onRecordScore: (gId, score) => recordGamePlayed(gId, score),
      onAddExp: (amt) => addExp(amt),
      onAddCoins: (amt) => addCoins(amt),
      onAddGems: (amt) => addGems(amt),
      onAddChest: (cType) => addChest(cType),
      onReportAchievement: (aId, val, isAbs) => reportAchievementProgress(aId, val, isAbs),
      onReportQuest: (qCat, delta) => reportQuestProgress(qCat, delta),
      onSubmitLeaderboard: async (gId, score, extraStats) => {
        await submitGameScore(gId, score, extraStats);
      },
      getSkin: (gId) => {
        const item = getEquippedSkinForGame(gId);
        return item ? item.id : 'default';
      },
      onUpdateSessionState: (state) => {
        if (state.score !== undefined) currentScoreRef.current = state.score;
        if (state.moves !== undefined) movesCountRef.current = state.moves;
      },
      onRecordMove: (count = 1) => {
        movesCountRef.current += count;
      },
    });
  }, [
    gameId,
    gameMeta?.dropRates,
    recordGamePlayed,
    addExp,
    addCoins,
    addGems,
    addChest,
    reportAchievementProgress,
    reportQuestProgress,
    submitGameScore,
    getEquippedSkinForGame,
  ]);

  const handleGameOver = useCallback(
    async (finalScore: number, stats?: Record<string, number>) => {
      try {
        const result = await bridge.submitScore(finalScore, stats);
        if (result.isNewHighScore) {
          confetti({
            particleCount: 100,
            spread: 80,
            origin: { y: 0.6 },
          });
        }
        setGameOverData({
          score: finalScore,
          isHighScore: result.isNewHighScore,
          droppedChest: result.droppedChest || null,
          stats,
          expEarned: result.expEarned,
          coinsEarned: result.coinsEarned,
        });
      } catch (err) {
        console.error("Game over submission error:", err);
        setGameOverData({
          score: finalScore,
          isHighScore: false,
          droppedChest: null,
          stats,
        });
      }
    },
    [bridge]
  );

  // Mobile Swipe Gesture Handler for flick-based movement across all directional games
  const touchStartRef = useRef<{ x: number; y: number; time: number; target: EventTarget | null } | null>(null);
  const [swipeVisualCue, setSwipeVisualCue] = useState<{ dir: 'up' | 'down' | 'left' | 'right'; x: number; y: number } | null>(null);

  const handleStageTouchStart = useCallback((e: React.TouchEvent<HTMLElement>) => {
    if (e.touches.length === 1) {
      touchStartRef.current = {
        x: e.touches[0].clientX,
        y: e.touches[0].clientY,
        time: Date.now(),
        target: e.target,
      };
    }
  }, []);

  const handleStageTouchEnd = useCallback((e: React.TouchEvent<HTMLElement>) => {
    if (!touchStartRef.current || e.changedTouches.length === 0) return;

    // Ignore swipe if initiated on interactive buttons, inputs, modals
    const startTarget = touchStartRef.current.target as HTMLElement | null;
    if (
      startTarget &&
      (startTarget.tagName === 'BUTTON' ||
        startTarget.tagName === 'INPUT' ||
        startTarget.closest('button, input, select, textarea, [data-no-swipe]'))
    ) {
      touchStartRef.current = null;
      return;
    }

    const endTouch = e.changedTouches[0];
    const dx = endTouch.clientX - touchStartRef.current.x;
    const dy = endTouch.clientY - touchStartRef.current.y;
    const dt = Date.now() - touchStartRef.current.time;
    const absDx = Math.abs(dx);
    const absDy = Math.abs(dy);
    const minDistance = 22; // Flick threshold

    if (dt < 700 && Math.max(absDx, absDy) >= minDistance) {
      let direction: 'up' | 'down' | 'left' | 'right';
      let keyCode: string;
      let keyVal: string;

      if (absDx > absDy) {
        if (dx > 0) {
          direction = 'right';
          keyCode = 'ArrowRight';
          keyVal = 'ArrowRight';
        } else {
          direction = 'left';
          keyCode = 'ArrowLeft';
          keyVal = 'ArrowLeft';
        }
      } else {
        if (dy > 0) {
          direction = 'down';
          keyCode = 'ArrowDown';
          keyVal = 'ArrowDown';
        } else {
          direction = 'up';
          keyCode = 'ArrowUp';
          keyVal = 'ArrowUp';
        }
      }

      // Show brief visual feedback cue on mobile
      setSwipeVisualCue({ dir: direction, x: endTouch.clientX, y: endTouch.clientY });
      setTimeout(() => setSwipeVisualCue(null), 300);

      // Dispatch standard KeyboardEvent so active game receives move
      const keyEvent = new KeyboardEvent('keydown', {
        key: keyVal,
        code: keyCode,
        bubbles: true,
        cancelable: true,
      });
      window.dispatchEvent(keyEvent);

      // Also dispatch custom arcadex:swipe event
      const customSwipeEvent = new CustomEvent('arcadex:swipe', {
        detail: { direction, dx, dy, dt },
        bubbles: true,
      });
      window.dispatchEvent(customSwipeEvent);
    }

    touchStartRef.current = null;
  }, []);

  const handleRestart = useCallback(() => {
    setGameOverData(null);
    setRecapCardImage(null);
    setMatchTimestamp('');
    setIsPaused(false);
    setShowExitConfirm(false);
    setGameSessionKey((k) => k + 1);
  }, []);

  const handlePreGameStart = useCallback(() => {
    setShowPreGameLoading(false);
  }, []);

  const handleOpenRecapShare = useCallback(() => {
    if (!gameOverData || !gameMeta) return;
    const currentRank = rankInfo || calculateAchievedRank(gameMeta.id, gameOverData.score);

    openShareModal({
      type: 'recap',
      title: `Game Recap: ${gameMeta.title}`,
      description: `Đạt ${gameOverData.score.toLocaleString()} điểm • Xếp Hạng: ${currentRank.rankText}`,
      score: gameOverData.score,
      gameId: gameMeta.id,
      gameTitle: gameMeta.title,
      achievedRank: currentRank.rankText,
      timestamp: matchTimestamp || Date.now(),
      recapImageUrl: recapCardImage || undefined,
      playerName: profile.username,
      playerAvatar: profile.avatar,
      playerLevel: profile.level,
      playerTitle: profile.currentTitle,
      stats: {
        coinsEarned: Math.max(5, Math.floor(gameOverData.score / 15)),
        expEarned: Math.max(10, Math.floor(gameOverData.score / 10)),
        isNewHighScore: gameOverData.isHighScore,
      },
    });
  }, [gameOverData, gameMeta, rankInfo, openShareModal, matchTimestamp, recapCardImage, profile]);

  const handleDownloadRecapDirect = useCallback(() => {
    if (!recapCardImage || !gameMeta) return;
    const link = document.createElement('a');
    link.download = `arcadex-recap-${gameMeta.id}-${Date.now()}.png`;
    link.href = recapCardImage;
    link.click();
    confetti({ particleCount: 30, spread: 50, origin: { y: 0.7 } });
  }, [recapCardImage, gameMeta]);

  const handleQuickOpenChest = (cType: 'common' | 'rare' | 'epic' | 'legendary') => {
    onExit();
    setActiveModal('inventory');
  };

  if (!gameMeta) {
    return null;
  }

  const GameComponent = gameMeta.component;

  return (
    <div id="game-wrapper-viewport" className="fixed inset-0 z-50 bg-[#050505] flex flex-col select-none overflow-hidden font-sans">
      {/* Top Header HUD */}
      <header className="h-12 sm:h-14 bg-[#0e0e0e]/95 backdrop-blur-md border-b border-white/5 px-2.5 sm:px-6 flex items-center justify-between z-30 shrink-0">
        <div className="flex items-center gap-2 sm:gap-3 min-w-0">
          <div className="w-8 h-8 rounded-lg bg-indigo-600/20 border border-indigo-500/30 flex items-center justify-center text-lg shrink-0">
            {gameMeta.icon}
          </div>
          <div className="min-w-0">
            <div className="flex items-center gap-2">
              <h1 className="text-sm sm:text-base font-bold text-white tracking-wide truncate">
                {gameMeta.title}
              </h1>
              {isDailyChallengeMode && (
                <span className="hidden sm:inline-flex items-center gap-1 px-2 py-0.5 rounded-full text-[10px] font-extrabold bg-gradient-to-r from-amber-500 to-orange-500 text-black uppercase tracking-wider animate-pulse">
                  🔥 Thử Thách 3 Phút
                </span>
              )}
            </div>
            <div className="flex items-center gap-1.5 text-xs text-slate-400" title="Kỷ lục">
              <Trophy className="w-3 h-3 text-yellow-500 shrink-0" />
              <strong className="text-yellow-400 font-mono">{(highScore || 0).toLocaleString()}</strong>
            </div>
          </div>
        </div>

        {/* Action Controls */}
        <div className="flex items-center gap-1.5 sm:gap-2 shrink-0">
          <button
            id="btn-game-toggle-sound"
            type="button"
            onClick={toggleSound}
            aria-label={isSoundMuted ? "Bật âm thanh" : "Tắt âm thanh"}
            title={isSoundMuted ? "Bật hiệu ứng âm thanh" : "Tắt hiệu ứng âm thanh"}
            className="w-9 h-9 rounded-xl bg-[#141414] hover:bg-white/10 active:scale-90 text-slate-300 hover:text-white flex items-center justify-center border border-white/5 transition-all cursor-pointer"
          >
            {isSoundMuted ? <VolumeX className="w-4 h-4 text-rose-400" /> : <Volume2 className="w-4 h-4 text-indigo-400" />}
          </button>

          <button
            id="btn-game-toggle-music"
            type="button"
            onClick={toggleMusic}
            aria-label={isMusicMuted ? "Bật nhạc nền" : "Tắt nhạc nền"}
            title={isMusicMuted ? "Bật nhạc nền game" : "Tắt nhạc nền game"}
            className="w-9 h-9 rounded-xl bg-[#141414] hover:bg-white/10 active:scale-90 text-slate-300 hover:text-white flex items-center justify-center border border-white/5 transition-all cursor-pointer"
          >
            {isMusicMuted ? <Music2 className="w-4 h-4 text-slate-500" /> : <Music className="w-4 h-4 text-emerald-400" />}
          </button>

          <button
            id="btn-game-pause"
            type="button"
            onClick={() => {
              if (isPaused) {
                handleResume();
              } else {
                setIsPaused(true);
              }
            }}
            aria-label={isPaused ? "Tiếp tục chơi" : "Tạm dừng"}
            className="w-9 h-9 rounded-xl bg-[#141414] hover:bg-white/10 active:scale-90 text-slate-300 hover:text-white flex items-center justify-center border border-white/5 transition-all cursor-pointer"
          >
            {isPaused ? <Play className="w-4 h-4 text-emerald-400" /> : <Pause className="w-4 h-4 text-yellow-400" />}
          </button>

          <button
            id="btn-game-restart"
            type="button"
            onClick={handleRestart}
            title="Chơi lại ván mới"
            className="w-9 h-9 rounded-xl bg-[#141414] hover:bg-white/10 active:scale-90 text-slate-300 hover:text-white flex items-center justify-center border border-white/5 transition-all cursor-pointer"
          >
            <RotateCcw className="w-4 h-4" />
          </button>

          <button
            id="btn-game-exit"
            type="button"
            onClick={() => setShowExitConfirm(true)}
            title="Trở về màn hình chính"
            aria-label="Thoát trò chơi"
            className="w-9 h-9 rounded-xl bg-rose-500/10 hover:bg-rose-500/20 active:scale-90 text-rose-400 hover:text-white flex items-center justify-center border border-rose-500/30 transition-all cursor-pointer"
          >
            <Home className="w-4 h-4 text-rose-400" />
          </button>
        </div>
      </header>

      {/* Main Game Stage with Dynamic Viewport Scaling */}
      <main
        ref={viewportContainerRef}
        id="game-main-viewport"
        style={cssVariables as React.CSSProperties}
        onTouchStart={handleStageTouchStart}
        onTouchEnd={handleStageTouchEnd}
        className="relative flex-1 w-full h-full bg-[#050505] flex items-center justify-center overflow-hidden p-0 scrollbar-thin select-none touch-none"
      >
        <div
          ref={viewportStageRef}
          id="game-viewport-stage"
          style={stageStyle}
        >
          <GameComponent
            key={gameSessionKey}
            isPracticeMode={isPracticeMode}
            isDailyChallengeMode={isDailyChallengeMode}
            bridge={bridge}
            isPaused={isPaused || showPreGameLoading || gameOverData !== null || showExitConfirm || activeModal !== 'none' || resumeCountdown !== null}
            isMuted={isSoundMuted}
            onGameOver={handleGameOver}
            onRestart={handleRestart}
          />
        </div>

        {/* Unpause / Resume 3-2-1 Countdown Overlay */}
        {resumeCountdown !== null && (
          <div className="absolute inset-0 z-50 bg-black/80 backdrop-blur-md flex flex-col items-center justify-center pointer-events-none select-none">
            <div className="text-center animate-in zoom-in-75 duration-200">
              <div className="text-7xl sm:text-9xl font-black font-display text-transparent bg-clip-text bg-gradient-to-br from-amber-300 via-orange-400 to-rose-500 drop-shadow-[0_0_35px_rgba(245,158,11,0.8)] tracking-tighter">
                {resumeCountdown > 0 ? resumeCountdown : 'GO!'}
              </div>
              <p className="text-xs sm:text-sm text-slate-300 mt-3 font-semibold tracking-widest uppercase">
                {resumeCountdown > 0 ? 'Chuẩn bị quay lại ván chơi...' : 'Tiếp tục chiến đấu!'}
              </p>
            </div>
          </div>
        )}

        {/* Transient Swipe Visual Direction Feedback Cue */}
        {swipeVisualCue && (
          <div
            className="pointer-events-none absolute z-50 transform -translate-x-1/2 -translate-y-1/2 flex items-center justify-center"
            style={{ left: swipeVisualCue.x, top: swipeVisualCue.y }}
          >
            <div className="w-12 h-12 rounded-full bg-amber-500/20 border border-amber-400/50 backdrop-blur-sm flex items-center justify-center text-amber-300 font-bold text-lg shadow-[0_0_20px_rgba(245,158,11,0.5)] animate-in zoom-in-50 duration-200">
              {swipeVisualCue.dir === 'up' && '▲'}
              {swipeVisualCue.dir === 'down' && '▼'}
              {swipeVisualCue.dir === 'left' && '◀'}
              {swipeVisualCue.dir === 'right' && '▶'}
            </div>
          </div>
        )}

        {/* Pause Overlay */}
        {isPaused && !gameOverData && !showExitConfirm && (
          <div className="absolute inset-0 bg-black/85 backdrop-blur-md z-40 flex items-center justify-center p-4">
            <div className="max-w-md w-full bg-[#0e0e0e] border border-white/10 rounded-2xl p-5 shadow-2xl flex flex-col text-center max-h-[95vh] overflow-hidden">
              <div className="shrink-0 mb-3 mt-1">
                <div className="w-12 h-12 rounded-full bg-yellow-500/10 border border-yellow-500/20 text-yellow-400 flex items-center justify-center mx-auto mb-2.5">
                  <Pause className="w-6 h-6" />
                </div>
                <h2 className="text-xl font-bold text-white mb-0.5 font-display">TẠM DỪNG TRÒ CHƠI</h2>
                <p className="text-xs text-slate-400">{gameMeta.title}</p>
              </div>

              <div className="flex-1 overflow-y-auto custom-scrollbar px-1 py-1 space-y-4 min-h-0 text-left">
                {/* Auto-save Status Pill */}
                <div className="flex items-center justify-center gap-1.5 text-[11px] text-emerald-400 bg-emerald-500/10 border border-emerald-500/20 py-1.5 px-3 rounded-xl font-semibold">
                  <CheckCircle2 className="w-3.5 h-3.5" />
                  <span>Tiến trình game được tự động lưu an toàn</span>
                </div>

                {/* Dynamic Viewport Resolution Info */}
                <div className="bg-[#141414] border border-white/5 rounded-xl p-2.5 text-left flex items-center justify-between text-xs">
                  <div className="flex items-center gap-2 text-slate-300">
                    <Maximize2 className="w-4 h-4 text-cyan-400 shrink-0" />
                    <div>
                      <div className="font-bold text-[11px] text-white">Độ Phân Giải Tự Động</div>
                      <div className="text-[9px] text-slate-400">
                        Khung hình: {renderResolution.width}x{renderResolution.height} ({scalePercent})
                      </div>
                    </div>
                  </div>
                  <button
                    type="button"
                    onClick={toggleZoomMode}
                    className="px-2.5 py-1 rounded-lg bg-cyan-500/15 hover:bg-cyan-500/25 border border-cyan-500/30 text-cyan-300 text-[10px] font-bold cursor-pointer uppercase transition-all"
                  >
                    {zoomMode === 'auto' ? 'Tự động' : zoomMode === 'contain' ? 'Vừa khung' : '100% Gốc'}
                  </button>
                </div>

                {/* Quick Check Hub without losing game progress */}
                <div className="grid grid-cols-2 gap-2 text-left">
                  <button
                    type="button"
                    onClick={() => setActiveModal('leaderboard')}
                    className="p-2.5 rounded-xl bg-[#141414] hover:bg-white/10 border border-white/5 transition-all text-xs flex items-center gap-2 cursor-pointer"
                  >
                    <Trophy className="w-4 h-4 text-amber-400 shrink-0" />
                    <div>
                      <div className="font-bold text-white text-[11px]">Bảng Xếp Hạng</div>
                      <div className="text-[9px] text-slate-400">Xem top cao thủ</div>
                    </div>
                  </button>

                  <button
                    type="button"
                    onClick={() => setActiveModal('quests')}
                    className="p-2.5 rounded-xl bg-[#141414] hover:bg-white/10 border border-white/5 transition-all text-xs flex items-center gap-2 cursor-pointer"
                  >
                    <Bell className="w-4 h-4 text-indigo-400 shrink-0" />
                    <div>
                      <div className="font-bold text-white text-[11px]">Nhiệm Vụ / Báo Cáo</div>
                      <div className="text-[9px] text-slate-400">Kiểm tra thông báo</div>
                    </div>
                  </button>
                </div>

                {/* Controls mini guide */}
                <div className="bg-[#141414] border border-white/5 rounded-xl p-3 text-left">
                  <div className="flex items-center gap-2 text-xs font-semibold text-indigo-400 mb-1.5">
                    <Gamepad2 className="w-3.5 h-3.5" />
                    <span>Hướng dẫn điều khiển:</span>
                  </div>
                  <div className="space-y-1 text-xs text-slate-300">
                    {gameMeta.controls.map((ctrl, i) => (
                      <div key={i} className="flex items-center justify-between">
                        <span className="text-slate-400 text-[11px]">{ctrl.action}</span>
                        <kbd className="px-2 py-0.5 bg-[#050505] text-indigo-300 border border-white/10 rounded text-[10px] font-mono">
                          {ctrl.key}
                        </kbd>
                      </div>
                    ))}
                  </div>

                  <button
                    id="btn-pause-open-onboarding"
                    type="button"
                    onClick={() => {
                      setIsPaused(false);
                      setShowPreGameLoading(true);
                    }}
                    className="w-full mt-2 py-2 px-3 rounded-xl bg-indigo-600/15 hover:bg-indigo-600/25 text-indigo-300 border border-indigo-500/25 font-semibold text-xs transition-all active:scale-95 cursor-pointer flex items-center justify-center gap-1.5"
                  >
                    <Gamepad2 className="w-3.5 h-3.5" />
                    <span>Xem Chi Tiết Mục Tiêu & Cử Chỉ</span>
                  </button>
                </div>
              </div>

              <div className="shrink-0 pt-3 border-t border-white/5 mt-1 space-y-2">
                <button
                  id="btn-pause-resume"
                  type="button"
                  onClick={handleResume}
                  title="Tiếp Tục Chơi"
                  aria-label="Tiếp Tục Chơi"
                  className="w-full py-2.5 px-4 rounded-xl bg-white text-black hover:bg-indigo-400 font-bold uppercase text-xs shadow-lg transition-all active:scale-95 cursor-pointer flex items-center justify-center gap-2"
                >
                  <Play className="w-5 h-5 fill-current" />
                  <span className="font-bold">Tiếp Tục Chơi</span>
                </button>

                <div className="grid grid-cols-2 gap-2">
                  <button
                    id="btn-pause-save-exit"
                    type="button"
                    onClick={handleSaveAndExit}
                    className="w-full py-2.5 px-3 rounded-xl bg-indigo-600/20 hover:bg-indigo-600/30 text-indigo-300 border border-indigo-500/30 font-semibold text-xs transition-all active:scale-95 cursor-pointer flex items-center justify-center gap-1.5"
                    title="Lưu & Ra Ngoài"
                    aria-label="Lưu & Ra Ngoài"
                  >
                    <Save className="w-4 h-4" />
                  </button>

                  <button
                    id="btn-pause-restart"
                    type="button"
                    onClick={handleRestart}
                    className="w-full py-2.5 px-3 rounded-xl bg-[#141414] hover:bg-white/10 active:scale-95 text-slate-200 font-semibold text-xs border border-white/5 transition-all cursor-pointer flex items-center justify-center gap-1.5"
                    title="Chơi Lại"
                    aria-label="Chơi Lại"
                  >
                    <RotateCcw className="w-4 h-4" />
                  </button>
                </div>
              </div>
            </div>
          </div>
        )}

        {/* Exit Confirmation Dialog */}
        {showExitConfirm && (
          <div className="absolute inset-0 bg-black/80 backdrop-blur-sm z-50 flex items-center justify-center p-4">
            <div className="max-w-sm w-full bg-[#0e0e0e] border border-white/10 rounded-2xl p-6 shadow-2xl text-center">
              <div className="w-12 h-12 rounded-full bg-amber-500/10 border border-amber-500/20 text-amber-400 flex items-center justify-center mx-auto mb-3">
                <ShieldAlert className="w-6 h-6" />
              </div>
              <h2 className="text-lg font-bold text-white mb-2 font-display">TẠM DỪNG HOẶC RỜI GAME?</h2>
              <p className="text-xs text-slate-400 mb-5">
                Bạn có thể lưu tiến trình để trở lại chơi tiếp bất cứ lúc nào từ sảnh chính, hoặc hủy ván chơi này.
              </p>

              <div className="space-y-2">
                <button
                  id="btn-exit-save-suspend"
                  type="button"
                  onClick={handleSaveAndExit}
                  className="w-full py-2.5 px-4 rounded-xl bg-indigo-600 hover:bg-indigo-500 active:scale-95 text-white font-bold text-xs shadow-lg shadow-indigo-600/20 transition-all cursor-pointer flex items-center justify-center gap-2"
                >
                  <Save className="w-4 h-4" />
                  <span>Lưu Tiến Trình & Trở Về Sảnh</span>
                </button>

                <div className="grid grid-cols-2 gap-2">
                  <button
                    id="btn-exit-cancel"
                    type="button"
                    onClick={() => setShowExitConfirm(false)}
                    className="w-full py-2 px-3 rounded-xl bg-[#141414] hover:bg-white/10 active:scale-95 text-slate-300 font-semibold text-xs border border-white/5 transition-all cursor-pointer"
                  >
                    Ở Lại Chơi
                  </button>
                  <button
                    id="btn-exit-confirm"
                    type="button"
                    onClick={handleTriggerExit}
                    className="w-full py-2 px-3 rounded-xl bg-rose-600/20 hover:bg-rose-600/30 active:scale-95 text-rose-400 border border-rose-500/30 font-semibold text-xs transition-all cursor-pointer"
                  >
                    Hủy Ván
                  </button>
                </div>
              </div>
            </div>
          </div>
        )}

        {/* Post-Game Summary Modal Screen */}
        {gameOverData && (
          <div className="absolute inset-0 bg-black/85 backdrop-blur-md z-50 flex items-center justify-center p-3 sm:p-4 animate-fade-in">
            <div className="max-w-md w-full bg-[#0e0e0e] border border-white/10 rounded-2xl sm:rounded-3xl p-4 sm:p-6 shadow-2xl flex flex-col text-center relative overflow-hidden my-auto max-h-[95vh]">
              {/* Background ambient glow */}
              <div className="absolute -top-24 left-1/2 -translate-x-1/2 w-64 h-64 bg-indigo-500/20 rounded-full blur-3xl pointer-events-none" />
              <div className="absolute -bottom-20 right-0 w-48 h-48 bg-amber-500/10 rounded-full blur-3xl pointer-events-none" />

              {/* Header Title & Badge */}
              <div className="shrink-0 mb-3 relative z-10">
                <div className="inline-flex items-center gap-1.5 px-3 py-1 rounded-full bg-indigo-500/15 border border-indigo-500/30 text-indigo-300 text-[11px] sm:text-xs font-black tracking-wider uppercase mb-2 shadow-inner">
                  <Sparkles className="w-3.5 h-3.5 text-indigo-400" />
                  BẢNG TỔNG KẾT VÁN ĐẤU • POST-GAME
                </div>

                {gameOverData.isHighScore && (
                  <div className="inline-flex items-center gap-1.5 px-3 py-1 rounded-full bg-yellow-500/20 border border-yellow-500/40 text-yellow-400 text-xs font-bold mb-2 animate-bounce mx-auto">
                    <Sparkles className="w-3.5 h-3.5" />
                    KỶ LỤC MỚI ĐƯỢC THIẾT LẬP!
                  </div>
                )}

                <h2 className="text-3xl sm:text-4xl font-black text-white tracking-tight font-display drop-shadow-md">
                  {(gameOverData.score || 0).toLocaleString()}
                </h2>
                <p className="text-xs text-slate-400 mt-0.5">Tổng điểm đạt được trong ván</p>
              </div>

              {/* Scrollable middle content */}
              <div className="flex-1 overflow-y-auto custom-scrollbar px-1 py-1 min-h-0 relative z-10 space-y-3">
                {/* Rewards Earned Grid (Coins + EXP) */}
                <div className="grid grid-cols-2 gap-2.5">
                  <div className="bg-[#141414] border border-amber-500/25 rounded-2xl p-3 flex flex-col justify-between shadow-lg shadow-amber-500/5">
                    <div className="flex items-center gap-2.5 mb-1.5">
                      <div className="w-9 h-9 rounded-xl bg-amber-500/15 border border-amber-500/30 text-amber-400 flex items-center justify-center text-base shrink-0 shadow-inner">
                        <Coins className="w-5 h-5 text-amber-400 fill-amber-400/30" />
                      </div>
                      <div className="text-left overflow-hidden">
                        <div className="text-[10px] sm:text-xs text-slate-400 font-medium truncate">Xu Nhận Được</div>
                        <div className="text-sm sm:text-base font-black text-amber-300 font-mono truncate">
                          +{gameOverData.coinsEarned ?? Math.max(5, Math.floor(gameOverData.score / 15))} Xu
                        </div>
                      </div>
                    </div>
                    <span className="text-[10px] text-amber-400/80 text-left font-medium">Đã cộng vào số dư</span>
                  </div>

                  <div className="bg-[#141414] border border-indigo-500/30 rounded-2xl p-3 flex flex-col justify-between shadow-lg shadow-indigo-500/5">
                    <div className="flex items-center gap-2.5 mb-1.5">
                      <div className="w-9 h-9 rounded-xl bg-indigo-600/20 border border-indigo-500/30 text-indigo-400 flex items-center justify-center text-base shrink-0 shadow-inner">
                        <Zap className="w-5 h-5 text-indigo-400 fill-indigo-400/30" />
                      </div>
                      <div className="text-left overflow-hidden">
                        <div className="text-[10px] sm:text-xs text-slate-400 font-medium truncate">Kinh Nghiệm</div>
                        <div className="text-sm sm:text-base font-black text-indigo-300 font-mono truncate">
                          +{gameOverData.expEarned ?? Math.max(10, Math.floor(gameOverData.score / 10))} EXP
                        </div>
                      </div>
                    </div>
                    <span className="text-[10px] text-indigo-400/80 text-left font-medium">Level {profile.level} ({profile.currentTitle || profile.equippedTitle || 'Tân Binh'})</span>
                  </div>
                </div>

                {/* Dropped Chest Card if any */}
                {gameOverData.droppedChest && (
                  <div className="p-3.5 rounded-2xl bg-[#141414] border border-indigo-500/40 shadow-lg shadow-indigo-500/10 text-left animate-pulse">
                    <div className="flex items-center justify-between mb-1.5">
                      <span className="text-xs font-bold text-indigo-400 flex items-center gap-1.5">
                        <Sparkles className="w-3.5 h-3.5" />
                        RƯƠNG BÁU RƠI TỰ DO!
                      </span>
                      <span className="text-[10px] px-2 py-0.5 rounded-md bg-white/5 text-slate-300 border border-white/10 uppercase font-bold">
                        {CHEST_TYPES[gameOverData.droppedChest].name}
                      </span>
                    </div>
                    <p className="text-[11px] sm:text-xs text-slate-400 mb-2.5">
                      Bạn vừa nhận được 1 <strong>{CHEST_TYPES[gameOverData.droppedChest].name}</strong> vào Kho Rương Đồ.
                    </p>
                    <button
                      id="btn-open-dropped-chest"
                      type="button"
                      onClick={() => handleQuickOpenChest(gameOverData.droppedChest!)}
                      className="w-full py-2 rounded-xl bg-white text-black hover:bg-indigo-300 active:scale-95 font-bold uppercase text-xs transition-all cursor-pointer flex items-center justify-center gap-1.5 shadow-md"
                    >
                      🎁 Mở Rương Ngay Trong Kho Đồ
                    </button>
                  </div>
                )}

                {/* Achieved Rank Badge Banner */}
                {rankInfo && (
                  <div className="p-2.5 rounded-2xl bg-gradient-to-r from-[#17162e] via-[#1c1b3a] to-[#17162e] border border-cyan-500/30 flex items-center justify-between shadow-inner">
                    <div className="flex items-center gap-2.5">
                      <div className="w-8 h-8 rounded-xl bg-cyan-500/20 border border-cyan-400/40 flex items-center justify-center text-base shrink-0 shadow-md">
                        {rankInfo.tierIcon}
                      </div>
                      <div className="text-left">
                        <div className="flex items-center gap-1.5">
                          <span className="text-[9px] uppercase font-black text-cyan-300 tracking-wider">Xếp Hạng</span>
                          <span className="text-[9px] text-slate-400 font-mono">• {rankInfo.tierName || rankInfo.tierBadge}</span>
                        </div>
                        <div className="text-xs sm:text-sm font-black text-white">{rankInfo.rankText}</div>
                      </div>
                    </div>
                    <div className="text-right">
                      <span className="text-[9px] text-slate-400 font-mono block">Giờ đấu</span>
                      <span className="text-[10px] font-mono text-cyan-300 font-bold">{matchTimestamp.split(' - ')[0] || 'Vừa xong'}</span>
                    </div>
                  </div>
                )}

                {/* Game Recap Card Preview & Share Hub */}
                <div className="p-3 rounded-2xl bg-[#111224] border border-cyan-500/40 text-left shadow-lg">
                  <div className="flex items-center justify-between mb-2">
                    <div className="flex items-center gap-1.5 text-[11px] sm:text-xs font-black text-cyan-300 uppercase tracking-wide">
                      <Camera className="w-3.5 h-3.5 text-cyan-400" />
                      <span>Thẻ Tổng Kết Game Recap</span>
                    </div>
                    {isGeneratingRecap ? (
                      <span className="text-[10px] text-amber-300 animate-pulse font-mono">Đang tạo thẻ...</span>
                    ) : (
                      <span className="text-[10px] text-emerald-400 font-bold flex items-center gap-1">
                        <Sparkles className="w-3 h-3" /> Sẵn sàng
                      </span>
                    )}
                  </div>

                  {recapCardImage && (
                    <div className="mb-2.5 rounded-xl overflow-hidden border border-cyan-500/30 relative group shadow-md bg-black">
                      <img
                        src={recapCardImage}
                        alt="Game Recap Preview"
                        className="w-full h-auto object-cover max-h-28 sm:max-h-32 transition-transform duration-300 group-hover:scale-105"
                      />
                      <div className="absolute inset-0 bg-gradient-to-t from-black/80 via-transparent to-transparent flex items-end p-2 justify-between">
                        <span className="text-[9px] font-mono text-white/90 font-bold">ArcadeX Recap</span>
                        <button
                          type="button"
                          onClick={handleDownloadRecapDirect}
                          className="px-2 py-0.5 rounded-lg bg-white/20 hover:bg-white/30 backdrop-blur-md text-[10px] font-bold text-white flex items-center gap-1 cursor-pointer transition-all active:scale-95"
                        >
                          <Download className="w-3 h-3" /> Tải về
                        </button>
                      </div>
                    </div>
                  )}

                  <div className="grid grid-cols-2 gap-2">
                    <button
                      id="btn-gameover-recap-share"
                      type="button"
                      onClick={handleOpenRecapShare}
                      className="w-full py-2 px-2.5 rounded-xl bg-gradient-to-r from-cyan-600 via-indigo-600 to-fuchsia-600 hover:opacity-90 text-white font-bold text-[10px] sm:text-xs flex items-center justify-center gap-1.5 transition-all shadow-md active:scale-95 cursor-pointer"
                    >
                      <Share2 className="w-3.5 h-3.5" />
                      <span>Chia Sẻ</span>
                    </button>

                    <button
                      id="btn-gameover-download-recap"
                      type="button"
                      onClick={handleDownloadRecapDirect}
                      disabled={!recapCardImage}
                      className="w-full py-2 px-2.5 rounded-xl bg-[#1a1b32] hover:bg-[#252648] disabled:opacity-50 text-cyan-300 border border-cyan-500/30 font-bold text-[10px] sm:text-xs flex items-center justify-center gap-1.5 transition-all active:scale-95 cursor-pointer"
                    >
                      <Download className="w-3.5 h-3.5" />
                      <span>Tải Ảnh (.PNG)</span>
                    </button>
                  </div>
                </div>
              </div>

              {/* Action Buttons: Play Again & Return Home (High Priority) */}
              <div className="shrink-0 pt-3 border-t border-white/10 mt-2 grid grid-cols-2 gap-2.5 relative z-10">
                <button
                  id="btn-gameover-replay"
                  type="button"
                  onClick={handleRestart}
                  title="Chơi Lại"
                  aria-label="Chơi Lại"
                  className="w-full py-3 px-3 rounded-xl bg-gradient-to-r from-emerald-500 via-teal-500 to-emerald-600 hover:from-emerald-400 hover:to-teal-400 active:scale-95 text-white font-black uppercase text-xs sm:text-sm shadow-lg shadow-emerald-950/40 transition-all cursor-pointer flex items-center justify-center gap-2"
                >
                  <RotateCcw className="w-5 h-5" />
                </button>
                <button
                  id="btn-gameover-home"
                  type="button"
                  onClick={handleTriggerExit}
                  title="Về Trang Chủ"
                  aria-label="Về Trang Chủ"
                  className="w-full py-3 px-3 rounded-xl bg-[#1a1a1a] hover:bg-white/10 active:scale-95 text-slate-200 hover:text-white font-bold text-xs sm:text-sm border border-white/10 transition-all cursor-pointer flex items-center justify-center gap-2 shadow-md"
                >
                  <Home className="w-5 h-5 text-slate-300" />
                </button>
              </div>
            </div>
          </div>
        )}

        {/* Play Session Summary Popup */}
        {showSessionSummaryModal && sessionSummaryData && (
          <div className="absolute inset-0 bg-black/90 backdrop-blur-md z-50 flex items-center justify-center p-4 overflow-y-auto">
            <div className="max-w-md w-full bg-[#0e0e0e] border border-white/10 rounded-2xl sm:rounded-3xl p-6 sm:p-8 shadow-2xl text-center relative overflow-hidden my-auto animate-in zoom-in-95 duration-200">
              <div className="absolute -top-24 left-1/2 -translate-x-1/2 w-64 h-64 bg-cyan-500/15 rounded-full blur-3xl pointer-events-none" />

              <div className="w-14 h-14 mx-auto mb-4 rounded-2xl bg-cyan-600/20 border border-cyan-500/40 text-cyan-400 flex items-center justify-center text-2xl shadow-lg shadow-cyan-500/20">
                📊
              </div>

              <h3 className="text-xl font-bold text-white font-display mb-1">TỔNG KẾT PHIÊN CHƠI</h3>
              <p className="text-xs text-slate-400 mb-6">{gameMeta?.title || 'Trò Chơi Arcade'}</p>

              {/* Stats Grid - Icon only stats */}
              <div className="grid grid-cols-2 gap-3 mb-6">
                <div className="p-3.5 rounded-2xl bg-[#141414] border border-white/5 text-center flex flex-col items-center justify-center" title="Thời gian chơi">
                  <div className="flex items-center justify-center mb-1">
                    <Clock className="w-5 h-5 text-indigo-400" />
                  </div>
                  <div className="text-base font-bold text-white font-mono">
                    {Math.floor(sessionSummaryData.timePlayedSeconds / 60)}:{String(sessionSummaryData.timePlayedSeconds % 60).padStart(2, '0')}
                  </div>
                </div>

                <div className="p-3.5 rounded-2xl bg-[#141414] border border-white/5 text-center flex flex-col items-center justify-center" title="Điểm đạt được">
                  <div className="flex items-center justify-center mb-1">
                    <Trophy className="w-5 h-5 text-amber-400" />
                  </div>
                  <div className="text-base font-bold text-amber-400 font-mono">
                    {sessionSummaryData.scoreEarned.toLocaleString()}
                  </div>
                </div>
              </div>

              {/* Milestones Reached */}
              <div className="p-4 rounded-2xl bg-[#141414] border border-white/5 text-left space-y-2.5 mb-6">
                <h4 className="text-xs font-bold text-slate-300 uppercase tracking-wider flex items-center gap-1.5">
                  <Sparkles className="w-3.5 h-3.5 text-yellow-400" />
                  Cột Mốc & Phần Thưởng Trong Phiên
                </h4>
                <div className="space-y-1.5 text-xs text-slate-300">
                  {sessionSummaryData.isHighScore && (
                    <div className="flex items-center gap-2 text-yellow-400 font-bold">
                      <span className="w-1.5 h-1.5 rounded-full bg-yellow-400 animate-pulse" />
                      🔥 Kỷ Lục Điểm Cao Mới!
                    </div>
                  )}
                  {sessionSummaryData.droppedChest && (
                    <div className="flex items-center gap-2 text-indigo-400 font-bold">
                      <span className="w-1.5 h-1.5 rounded-full bg-indigo-400" />
                      🎁 Rương Báu ({sessionSummaryData.droppedChest.toUpperCase()})
                    </div>
                  )}
                  <div className="flex items-center gap-2 text-cyan-400 font-semibold">
                    <span className="w-1.5 h-1.5 rounded-full bg-cyan-400" />
                    ⭐ {sessionSummaryData.rankText}
                  </div>
                  <div className="flex items-center gap-2 text-emerald-400 font-semibold">
                    <span className="w-1.5 h-1.5 rounded-full bg-emerald-400" />
                    🪙 +{sessionSummaryData.coinsEarned} Coins, ✨ +{sessionSummaryData.expEarned} EXP
                  </div>
                </div>
              </div>

              <button
                id="btn-session-summary-confirm"
                type="button"
                onClick={onExit}
                title="Về Trang Chủ"
                aria-label="Về Trang Chủ"
                className="w-full py-3 px-4 rounded-xl bg-indigo-600 hover:bg-indigo-500 active:scale-95 text-white font-bold uppercase text-xs shadow-lg shadow-indigo-600/30 transition-all cursor-pointer flex items-center justify-center gap-2"
              >
                <Home className="w-5 h-5" />
              </button>
            </div>
          </div>
        )}
      </main>

      {/* Animated Pre-Game Loading Screen for Mobile & Desktop Onboarding */}
      {showPreGameLoading && gameMeta && (
        <PreGameLoadingScreen
          gameMeta={gameMeta}
          isDailyChallengeMode={isDailyChallengeMode}
          isPracticeMode={isPracticeMode}
          highScore={highScore}
          isSoundMuted={isSoundMuted}
          onToggleSound={toggleSound}
          onStartGame={handlePreGameStart}
          onExit={onExit}
        />
      )}
    </div>
  );
};
