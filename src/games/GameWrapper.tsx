import { PostGameSummary } from '../launcher/PostGameSummary';
import { useLauncher } from '../launcher/LauncherContext';
import { GameSaveGate, GameLoadBoundary } from '../components/GameSaveGate';
import { readGameSave } from '../services/gameSaves';
import { GameArtwork, GameAtmosphere, artStyle } from '../visuals/gameArt';
import React, { useState, useMemo, useCallback, useEffect, useRef, Suspense } from 'react';
import { GameMetadata } from '../types';
import { createGameBridge, type CreateBridgeOptions } from './GameBridge';
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

function readGameState(gameId: string): unknown {
  return readGameSave(gameId);
}

export const GameWrapper: React.FC<GameWrapperProps> = ({ gameMeta: propMeta, metadata, onExit }) => {
  const gameMeta = propMeta || metadata;
  const {finishPlay,recordPlay}=useLauncher();
  const endedRef=useRef(false);
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
    openChat,
    openShareModal,
    isPracticeMode,
    isDailyChallengeMode,
    activeModal,
    saveAndSuspendGame,
    autoSaveGameSession,
    pausedGameSession,
    discardPausedGame,
  } = useGame();

  const [isPaused, setIsPaused] = useState<boolean>(false);
  const [resumeCountdown, setResumeCountdown] = useState<number | null>(null);
  const [showPreGameLoading, setShowPreGameLoading] = useState<boolean>(() => {
    try {
      const skipped = localStorage.getItem('arcadex_skip_pregame_loading');
      return skipped !== 'true' && localStorage.getItem(`launcher_guide_seen_${gameMeta.id}`) !== 'true';
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
  const initialGameStateRef = useRef(readGameState(gameId) ?? (isResumingThisGame ? pausedGameSession.gameStateData : undefined));
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

  const handleTriggerExit = useCallback(() => {
    setShowExitConfirm(false);
    onExit();
  }, [onExit]);

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
    const score = currentScoreRef.current;
    saveAndSuspendGame({
      gameId: gameMeta.id,
      gameTitle: gameMeta.title,
      gameIcon: gameMeta.icon,
      currentScore: score,
      gameStateData: readGameState(gameMeta.id),
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
  }, [gameMeta, isPracticeMode, isDailyChallengeMode, saveAndSuspendGame]);

  // Periodic background auto-saving to cloud during active gameplay
  useEffect(() => {
    if (!gameMeta || gameOverData) return;
    const interval = setInterval(() => {
      if (document.hidden || isPaused) return;
      const timePlayed = initialTimeOffsetRef.current + Math.max(1, Math.floor((Date.now() - sessionStartTimeRef.current) / 1000));
      const score = currentScoreRef.current;
      autoSaveGameSession({
        gameId: gameMeta.id,
        gameTitle: gameMeta.title,
        gameIcon: gameMeta.icon,
        currentScore: score,
        gameStateData: readGameState(gameMeta.id),
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
  }, [gameMeta, gameOverData, isPaused, isPracticeMode, isDailyChallengeMode, autoSaveGameSession]);

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

  const bridgeOptions: CreateBridgeOptions = {
      gameId: gameId,
      dropRates: {
        baseChestDropChance: 0,
        scoreThresholdForDrop: Number.POSITIVE_INFINITY,
        chestWeights: [{ type: 'common', weight: 100 }],
      },
      onRecordScore: (gId, score) => recordGamePlayed(gId, score),
      onAddExp: (amt) => addExp(amt),
      onAddCoins: (amt) => addCoins(amt),
      onAddGems: (amt) => addGems(amt),
      onAddChest: (_cType) => {},
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
    };
  const bridgeOptionsRef = useRef(bridgeOptions);
  bridgeOptionsRef.current = bridgeOptions;
  // Keep the API identity stable, while callbacks and equipped skins stay current.
  const bridge = useMemo(() => createGameBridge(new Proxy(bridgeOptions, {
    get: (_target, key) => bridgeOptionsRef.current[key as keyof CreateBridgeOptions],
  })), [gameId]);

  const handleGameOver = useCallback(
    async (finalScore: number, stats?: Record<string, number>) => {
      if (endedRef.current) return;
      endedRef.current=true;
      finishPlay(finalScore);
      discardPausedGame();
      setIsPaused(true);
      setGameOverData({score:finalScore,isHighScore:false,droppedChest:null,stats});
      try {
        const result = await bridge.submitScore(finalScore, stats);
        if (result.isNewHighScore && !window.matchMedia('(prefers-reduced-motion: reduce)').matches) {
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
    [bridge,finishPlay,discardPausedGame]
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
    endedRef.current=false;
    recordPlay(gameId);
    initialGameStateRef.current = ['tile-2048', 'neon-runner', 'car-escape', 'scoodoku', 'shikaku', 'word-cross', 'cosmic-defense'].includes(gameId) ? null : undefined;
    currentScoreRef.current = 0;
    movesCountRef.current = 0;
    initialTimeOffsetRef.current = 0;
    sessionStartTimeRef.current = Date.now();
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
    <div id="game-wrapper-viewport" data-game={gameMeta.id} style={artStyle(gameMeta.id)} className="fixed inset-0 z-50 bg-[#050505] flex flex-col select-none overflow-hidden font-sans">
      {/* Top Header HUD */}
      <header className="h-12 sm:h-14 bg-[#0e0e0e]/95 backdrop-blur-md border-b border-white/5 px-2.5 sm:px-6 flex items-center justify-between z-30 shrink-0">
        <div className="flex items-center gap-2 sm:gap-3 min-w-0">
          <div className="w-8 h-8 rounded-lg bg-indigo-600/20 border border-indigo-500/30 flex items-center justify-center text-lg shrink-0">
            <GameArtwork gameId={gameMeta.id}/>
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
              <span id="game-save-status-slot" className="min-w-0 flex"/>
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
        style={{...cssVariables, ...(['cosmic-defense','blocker','shikaku'].includes(gameId)?{touchAction:'pan-y'}:{})} as React.CSSProperties}
        onTouchStart={handleStageTouchStart}
        onTouchEnd={handleStageTouchEnd}
        className="relative flex-1 w-full h-full bg-[#050505] flex items-center justify-center overflow-hidden p-0 scrollbar-thin select-none touch-none"
      >
        <GameAtmosphere gameId={gameMeta.id}/>
        <div
          ref={viewportStageRef}
          id="game-viewport-stage"
          style={stageStyle}
        >
          <GameSaveGate gameId={gameId} onResolved={() => { initialGameStateRef.current = readGameState(gameId); setGameSessionKey(key => key + 1); }}>
          <GameLoadBoundary onExit={onExit}>
          <Suspense fallback={<div role="status" className="p-8 text-center text-slate-200">Đang tải game…</div>}>
          <GameComponent
            key={gameSessionKey}
            isPracticeMode={isPracticeMode}
            isDailyChallengeMode={isDailyChallengeMode}
            bridge={bridge}
            initialState={initialGameStateRef.current}
            isPaused={isPaused || showPreGameLoading || gameOverData !== null || showExitConfirm || activeModal !== 'none' || resumeCountdown !== null}
            isMuted={isSoundMuted}
            onGameOver={handleGameOver}
            onRestart={handleRestart}
          />
          </Suspense>
          </GameLoadBoundary>
          </GameSaveGate>
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
                  <button type="button" onClick={openChat} className="arcade-pause-chat col-span-2 w-full py-2 text-xs text-slate-300 hover:text-white border border-white/10 rounded-xl">Trò chuyện</button>
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
                    Về thư viện
                  </button>
                </div>
              </div>
            </div>
          </div>
        )}

        {gameOverData && <PostGameSummary gameId={gameId} title={gameMeta.title} score={gameOverData.score} isBest={gameOverData.isHighScore} recap={recapCardImage} onReplay={handleRestart} onHome={onExit} onShare={handleOpenRecapShare} onDownload={handleDownloadRecapDirect}/>}

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
