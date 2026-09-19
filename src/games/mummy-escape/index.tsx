import React, { useState, useEffect, useCallback, useRef, useMemo } from 'react';
import { GameBridgeAPI } from '../../types';
import {
  Direction,
  GameMode,
  MummyEntity,
  Position,
  Gate,
  KeyItem,
  TrapItem,
  MoveStepRecord,
  LevelData,
  TurnPhase,
  MummyThreatPath,
  MapSizePreset,
  ChamberArchetype,
  ProceduralGenerationOptions,
  GridPaletteId,
} from './types';
import { CAMPAIGN_LEVELS, generateProceduralChamber } from './levels';
import { simulatePlayerAndMummiesTurn, calculateMummyThreatPaths } from './mummyAI';
import { findSafestMove, HintSuggestion } from './hintPathfinder';
import { MummyEscapeBoard } from './MummyEscapeBoard';
import { MummyEscapeTurnIndicator } from './MummyEscapeTurnIndicator';
import { LevelClearToast } from './LevelClearToast';
import { SettingsModal } from './SettingsModal';
import {
  GRID_PALETTES,
  getSavedPalette,
  getSavedWatermarkPreference,
  getSavedScreenShakePreference,
} from './palettes';
import { soundEngine } from '../../services/audio';
import { mummyAudio } from './audio';
import {
  recordMatchResult,
  loadAdaptiveProfile,
  computeAdaptiveTuning,
  getAdaptiveProceduralOptions,
  getSkillTierInfo,
  updateAdaptiveSettings,
  MummyAdaptiveProfile,
} from './adaptiveDifficulty';
import confetti from 'canvas-confetti';
import {
  RotateCcw,
  Undo2,
  Hourglass,
  Star,
  Map,
  Lightbulb,
  ArrowUp,
  ArrowDown,
  ArrowLeft,
  ArrowRight,
  Flame,
  Wand2,
  Dices,
  Sliders,
  Settings,
  Compass,
  Sparkles,
  BarChart3,
  Palette,
  Trophy,
  Footprints,
} from 'lucide-react';

interface MummyEscapeGameProps {
  isPracticeMode?: boolean;
  isDailyChallengeMode?: boolean;
  bridge: GameBridgeAPI;
  isPaused?: boolean;
  isMuted?: boolean;
  onGameOver?: (finalScore: number, stats?: Record<string, number>) => void;
  onRestart?: () => void;
}

const STORAGE_KEY = 'mummy_escape_save_v1';
const MAX_REVERT_CHARGES = 3;

export const MummyEscapeGame: React.FC<MummyEscapeGameProps> = ({
  bridge,
  isPaused = false,
  isMuted = false,
  onGameOver,
  onRestart,
}) => {
  // Game Modes
  const [mode, setMode] = useState<GameMode>('campaign');
  const [currentLevelIdx, setCurrentLevelIdx] = useState<number>(0);
  const [endlessFloor, setEndlessFloor] = useState<number>(1);

  // Procedural Generator Config State
  const [procSizePreset, setProcSizePreset] = useState<MapSizePreset>('6x6');
  const [procArchetype, setProcArchetype] = useState<ChamberArchetype | 'random'>('random');
  const [procMummyCount, setProcMummyCount] = useState<number>(2);
  const [procTrapDensity, setProcTrapDensity] = useState<'none' | 'low' | 'medium' | 'high'>('medium');
  const [procSeed, setProcSeed] = useState<string>('');
  const [showProceduralModal, setShowProceduralModal] = useState<boolean>(false);
  const [showSettingsModal, setShowSettingsModal] = useState<boolean>(false);
  const [paletteId, setPaletteId] = useState<GridPaletteId>(getSavedPalette());
  const [showWatermarks, setShowWatermarks] = useState<boolean>(getSavedWatermarkPreference());
  const [screenShakeEnabled, setScreenShakeEnabled] = useState<boolean>(getSavedScreenShakePreference());
  const [adaptiveProfile, setAdaptiveProfile] = useState<MummyAdaptiveProfile>(loadAdaptiveProfile());

  // Level Progression Storage
  const [unlockedLevels, setUnlockedLevels] = useState<number>(1);
  const [starsMap, setStarsMap] = useState<Record<number, number>>({});
  const [totalMummiesTrapped, setTotalMummiesTrapped] = useState<number>(0);

  // Active Chamber Data
  const [levelData, setLevelData] = useState<LevelData>(CAMPAIGN_LEVELS[0]);
  const [playerPos, setPlayerPos] = useState<Position>(CAMPAIGN_LEVELS[0].playerStart);
  const [playerFacing, setPlayerFacing] = useState<Direction>('down');
  const [mummies, setMummies] = useState<MummyEntity[]>([]);
  const [gates, setGates] = useState<Gate[]>([]);
  const [keys, setKeys] = useState<KeyItem[]>([]);
  const [traps, setTraps] = useState<TrapItem[]>([]);

  // Turn History & Scores
  const [history, setHistory] = useState<MoveStepRecord[]>([]);
  const [turnsTaken, setTurnsTaken] = useState<number>(0);
  const [score, setScore] = useState<number>(0);
  const [highScore, setHighScore] = useState<number>(0);
  const [mummiesDestroyedThisLevel, setMummiesDestroyedThisLevel] = useState<number>(0);

  // Revert Turn Charges (Limited to 3 per level)
  const [revertCharges, setRevertCharges] = useState<number>(MAX_REVERT_CHARGES);

  // Turn Phase & Screen-Shake Feedback
  const [turnPhase, setTurnPhase] = useState<TurnPhase>('player_turn');
  const [shakeEffect, setShakeEffect] = useState<'none' | 'caught' | 'crush' | 'trap'>('none');
  const [shakeNonce, setShakeNonce] = useState<number>(0);

  // Visual Warning Path Radar Toggle
  const [showWarningPaths, setShowWarningPaths] = useState<boolean>(true);

  // Timers & State Status
  const [timeLeft, setTimeLeft] = useState<number>(60);
  const [isVictory, setIsVictory] = useState<boolean>(false);
  const [isCaught, setIsCaught] = useState<boolean>(false);
  const [showLevelSelect, setShowLevelSelect] = useState<boolean>(false);
  const [showHint, setShowHint] = useState<boolean>(false);
  const [statusMessage, setStatusMessage] = useState<string>('');
  const [levelVictoryData, setLevelVictoryData] = useState<{
    stars: number;
    levelScoreBonus: number;
    turnsTaken: number;
    mummiesDestroyed: number;
  } | null>(null);

  // Hint Pathfinding & Cooldown Management
  const HINT_COOLDOWN_SECONDS = 5;
  const [hintCooldown, setHintCooldown] = useState<number>(0);
  const [activeHint, setActiveHint] = useState<HintSuggestion | null>(null);

  // Hint cooldown countdown timer
  useEffect(() => {
    if (hintCooldown <= 0) return;
    const interval = setInterval(() => {
      setHintCooldown((prev) => Math.max(0, prev - 1));
    }, 1000);
    return () => clearInterval(interval);
  }, [hintCooldown]);

  // Reload adaptive profile on turn changes or level start
  useEffect(() => {
    setAdaptiveProfile(loadAdaptiveProfile());
  }, [turnsTaken, currentLevelIdx, isVictory, isCaught]);

  const timerRef = useRef<NodeJS.Timeout | null>(null);

  // Calculate Predicted Threat Paths for all living mummies
  const threatPaths = useMemo<MummyThreatPath[]>(() => {
    if (isVictory || isCaught) return [];
    return calculateMummyThreatPaths(
      playerPos,
      mummies,
      levelData.horizontalWalls,
      levelData.verticalWalls,
      gates,
      levelData.gridSize
    );
  }, [playerPos, mummies, levelData, gates, isVictory, isCaught]);

  const isThreatCritical = threatPaths.some((t) => t.willCatchPlayer);
  const aliveMummiesCount = mummies.filter((m) => m.alive).length;

  // Load Saved Progress
  useEffect(() => {
    try {
      const saved = localStorage.getItem(STORAGE_KEY);
      if (saved) {
        const parsed = JSON.parse(saved);
        if (parsed.unlockedLevels) setUnlockedLevels(parsed.unlockedLevels);
        if (parsed.starsMap) setStarsMap(parsed.starsMap);
        if (parsed.highScore) setHighScore(parsed.highScore);
        if (parsed.totalMummiesTrapped) setTotalMummiesTrapped(parsed.totalMummiesTrapped);
      }
    } catch (e) {
      console.warn('Failed to load mummy escape progress', e);
    }
  }, []);

  // Save Progress
  const saveProgress = useCallback(
    (newUnlocked: number, newStars: Record<number, number>, newHighScore: number, newTrapped: number) => {
      try {
        localStorage.setItem(
          STORAGE_KEY,
          JSON.stringify({
            unlockedLevels: newUnlocked,
            starsMap: newStars,
            highScore: newHighScore,
            totalMummiesTrapped: newTrapped,
          })
        );
      } catch (e) {
        console.warn('Failed to save mummy escape progress', e);
      }
    },
    []
  );

  // Initialize Level Chamber
  const initLevel = useCallback((lvl: LevelData) => {
    const profile = loadAdaptiveProfile();
    const tuning = computeAdaptiveTuning(profile, lvl.id || 1);
    const initialReverts = MAX_REVERT_CHARGES + (tuning.bonusRevertCharges || 0);

    setLevelData(lvl);
    setPlayerPos({ ...lvl.playerStart });
    setPlayerFacing('down');
    setMummies(
      lvl.mummies.map((m, idx) => ({
        id: `mummy-${idx}-${m.type}`,
        type: m.type,
        x: m.x,
        y: m.y,
        alive: true,
        facing: 'down',
      }))
    );
    setGates(lvl.gates ? lvl.gates.map((g) => ({ ...g })) : []);
    setKeys(lvl.keys ? lvl.keys.map((k) => ({ ...k })) : []);
    setTraps(lvl.traps ? lvl.traps.map((t) => ({ ...t })) : []);
    setHistory([]);
    setTurnsTaken(0);
    setMummiesDestroyedThisLevel(0);
    setRevertCharges(initialReverts);
    setIsVictory(false);
    setIsCaught(false);
    setLevelVictoryData(null);
    setTurnPhase('player_turn');
    setShowHint(false);
    setStatusMessage('');
    setTimeLeft(lvl.timeLimitSec || 60);
  }, []);

  // Start Level by Index
  const startCampaignLevel = useCallback(
    (idx: number) => {
      const validIdx = Math.max(0, Math.min(idx, CAMPAIGN_LEVELS.length - 1));
      setCurrentLevelIdx(validIdx);
      initLevel(CAMPAIGN_LEVELS[validIdx]);
    },
    [initLevel]
  );

  // Start Endless Floor with Adaptive Difficulty
  const startEndlessLevel = useCallback(
    (floor: number) => {
      setEndlessFloor(floor);
      const chamber = generateProceduralChamber(getAdaptiveProceduralOptions({ floor }));
      initLevel(chamber);
    },
    [initLevel]
  );

  // Generate Custom Procedural Level
  const handleGenerateCustomChamber = useCallback(
    (customOptions?: ProceduralGenerationOptions) => {
      const options: ProceduralGenerationOptions = customOptions || {
        floor: endlessFloor,
        sizePreset: procSizePreset,
        archetype: procArchetype === 'random' ? undefined : procArchetype,
        mummyCount: procMummyCount,
        trapDensity: procTrapDensity,
        seed: procSeed.trim() || undefined,
        timeLimitSec: mode === 'time_attack' ? 70 : undefined,
      };

      const chamber = generateProceduralChamber(getAdaptiveProceduralOptions(options));
      initLevel(chamber);
      setShowProceduralModal(false);
      mummyAudio.playKeyPickup();
      setStatusMessage(`Đã tạo phòng hầm mộ ngẫu nhiên (${chamber.gridSize?.cols || 6}x${chamber.gridSize?.rows || 6})!`);
    },
    [endlessFloor, procSizePreset, procArchetype, procMummyCount, procTrapDensity, procSeed, mode, initLevel]
  );

  // Switch Game Mode
  const handleSelectMode = (newMode: GameMode) => {
    setMode(newMode);
    soundEngine.play('click');
    if (newMode === 'campaign' || newMode === 'turn_limit' || newMode === 'time_attack') {
      startCampaignLevel(currentLevelIdx);
    } else {
      startEndlessLevel(1);
    }
  };

  // On Mount
  useEffect(() => {
    startCampaignLevel(0);
  }, [startCampaignLevel]);

  // Timer Tick for Time Attack Mode
  useEffect(() => {
    if (mode === 'time_attack' && !isVictory && !isCaught && !isPaused) {
      timerRef.current = setInterval(() => {
        setTimeLeft((prev) => {
          if (prev <= 1) {
            clearInterval(timerRef.current!);
            setIsCaught(true);
            setTurnPhase('game_over');
            setShakeEffect('caught');
            setShakeNonce((n) => n + 1);
            setStatusMessage('Hết giờ! Ngọn đuốc đã tắt và xác ướp đã đuổi kịp bạn trong bóng tối.');
            soundEngine.play('gameOver');
            return 0;
          }
          return prev - 1;
        });
      }, 1000);
    }

    return () => {
      if (timerRef.current) clearInterval(timerRef.current);
    };
  }, [mode, isVictory, isCaught, isPaused]);

  // Handle Player Turn
  const handleMove = useCallback(
    (dir: Direction) => {
      if (isVictory || isCaught || isPaused) return;

      // Clear previous active hint highlight
      setActiveHint(null);

      // Save current state to history for Revert Turn
      const currentStateRecord: MoveStepRecord = {
        playerPos: { ...playerPos },
        playerFacing,
        mummies: mummies.map((m) => ({ ...m })),
        gates: gates.map((g) => ({ ...g })),
        keys: keys.map((k) => ({ ...k })),
        traps: traps.map((t) => ({ ...t })),
        turnsCount: turnsTaken,
        score,
        mummiesTrappedCount: mummiesDestroyedThisLevel,
      };

      // Set animated turn indicator phase to mummy moving
      setTurnPhase('mummy_moving');

      // Simulate turn with dynamic chamber dimensions
      const sim = simulatePlayerAndMummiesTurn(
        playerPos,
        dir,
        mummies,
        levelData.horizontalWalls,
        levelData.verticalWalls,
        gates,
        keys,
        traps,
        levelData.exitPos,
        levelData.gridSize
      );

      // Sound & message triggers
      let nextScore = score;
      let newTrapped = totalMummiesTrapped;
      let newTrappedThisLevel = mummiesDestroyedThisLevel;

      mummyAudio.playTurnStart();

      let hasMummyMovement = false;

      sim.events.forEach((ev) => {
        if (ev.type === 'step') {
          soundEngine.play('click');
        } else if (ev.type === 'mummy_step') {
          hasMummyMovement = true;
        } else if (ev.type === 'key_pickup') {
          mummyAudio.playKeyPickup();
          setStatusMessage(ev.message || 'Nhặt chìa khóa!');
        } else if (ev.type === 'mummy_crush') {
          mummyAudio.playMummyCrush();
          nextScore += 200;
          newTrapped += 2;
          newTrappedThisLevel += 2;
          setStatusMessage(ev.message || 'Xác ướp va chạm tan biến!');
          bridge.reportProgress('mummy-trapper', 1);

          // Screen-shake trigger for mummy destruction!
          setShakeEffect('crush');
          setShakeNonce((n) => n + 1);
        } else if (ev.type === 'trap_trigger') {
          mummyAudio.playTrapTrigger();
          nextScore += 150;
          newTrapped += 1;
          newTrappedThisLevel += 1;
          setStatusMessage(ev.message || 'Xác ướp sập bẫy!');
          bridge.reportProgress('mummy-trapper', 1);

          // Screen-shake trigger for trap activation!
          setShakeEffect('trap');
          setShakeNonce((n) => n + 1);
        }
      });

      if (hasMummyMovement) {
        mummyAudio.playMummyMove();
      }

      const nextTurns = turnsTaken + 1;

      // Check Turn Limit mode constraint
      if (mode === 'turn_limit' && levelData.maxTurns && nextTurns >= levelData.maxTurns && !sim.playerEscaped) {
        setIsCaught(true);
        setTurnPhase('game_over');
        setShakeEffect('caught');
        setShakeNonce((n) => n + 1);
        setStatusMessage(`Hết số bước cho phép (${levelData.maxTurns} bước)! Bạn đã kiệt sức.`);
        mummyAudio.playPlayerDeath();
        recordMatchResult({
          won: false,
          turnsTaken: nextTurns,
          parTurns: levelData.parTurns || 15,
          mummiesDestroyed: newTrappedThisLevel,
          scoreEarned: nextScore,
          mode,
          gridSize: levelData.gridSize || { cols: 6, rows: 6 },
          levelId: levelData.id,
          floor: endlessFloor,
        });
        return;
      }

      setHistory((prev) => [...prev, currentStateRecord]);
      setPlayerPos(sim.nextPlayerPos);
      setPlayerFacing(sim.nextPlayerFacing);
      setMummies(sim.nextMummies);
      setGates(sim.nextGates);
      setKeys(sim.nextKeys);
      setTraps(sim.nextTraps);
      setTurnsTaken(nextTurns);
      setScore(nextScore);
      setTotalMummiesTrapped(newTrapped);
      setMummiesDestroyedThisLevel(newTrappedThisLevel);

      // Handle Caught / Game Over
      if (sim.playerCaught) {
        setIsCaught(true);
        setTurnPhase('game_over');
        setShakeEffect('caught');
        setShakeNonce((n) => n + 1);
        setStatusMessage('Bạn đã bị xác ướp bắt giữ! Hãy dùng Revert Turn hoặc Chơi lại.');
        mummyAudio.playPlayerDeath();
        recordMatchResult({
          won: false,
          turnsTaken: nextTurns,
          parTurns: levelData.parTurns || 15,
          mummiesDestroyed: newTrappedThisLevel,
          scoreEarned: nextScore,
          mode,
          gridSize: levelData.gridSize || { cols: 6, rows: 6 },
          levelId: levelData.id,
          floor: endlessFloor,
        });
        return;
      }

      // Handle Victory / Escape
      if (sim.playerEscaped) {
        setIsVictory(true);
        setTurnPhase('victory');
        mummyAudio.playLevelClear();
        confetti({
          particleCount: 70,
          spread: 60,
          origin: { y: 0.6 },
          colors: ['#f59e0b', '#10b981', '#fbbf24'],
        });

        // Calculate stars
        let stars = 1;
        if (nextTurns <= levelData.parTurns) {
          stars = 3;
        } else if (nextTurns <= levelData.parTurns + 4) {
          stars = 2;
        }

        const levelScoreBonus = Math.max(100, 1000 - nextTurns * 20 + stars * 150 + newTrappedThisLevel * 200);
        const finalScore = nextScore + levelScoreBonus;
        setScore(finalScore);

        setLevelVictoryData({
          stars,
          levelScoreBonus,
          turnsTaken: nextTurns,
          mummiesDestroyed: newTrappedThisLevel,
        });

        const newHigh = Math.max(highScore, finalScore);
        setHighScore(newHigh);

        const newStarsMap = { ...starsMap, [levelData.id]: Math.max(starsMap[levelData.id] || 0, stars) };
        setStarsMap(newStarsMap);

        const nextUnlocked = Math.max(unlockedLevels, currentLevelIdx + 2);
        setUnlockedLevels(nextUnlocked);

        saveProgress(nextUnlocked, newStarsMap, newHigh, newTrapped);

        recordMatchResult({
          won: true,
          turnsTaken: nextTurns,
          parTurns: levelData.parTurns || 15,
          mummiesDestroyed: newTrappedThisLevel,
          scoreEarned: finalScore,
          mode,
          gridSize: levelData.gridSize || { cols: 6, rows: 6 },
          levelId: levelData.id,
          floor: endlessFloor,
        });

        // Report achievements & score to bridge
        bridge.reportProgress('mummy-first-escape', 1);
        if (stars === 3) {
          bridge.reportProgress('mummy-perfectionist', 1);
        }
        if (mode === 'time_attack') {
          bridge.reportProgress('mummy-speedrunner', 1);
        }
        if (currentLevelIdx === CAMPAIGN_LEVELS.length - 1) {
          bridge.reportProgress('mummy-pyramid-master', 15, true);
        }
        bridge.submitScore(finalScore);
      } else {
        // Return turn phase to player after brief moment
        setTurnPhase('player_turn');
      }
    },
    [
      isVictory,
      isCaught,
      isPaused,
      playerPos,
      playerFacing,
      mummies,
      gates,
      keys,
      traps,
      turnsTaken,
      score,
      mummiesDestroyedThisLevel,
      totalMummiesTrapped,
      levelData,
      mode,
      highScore,
      starsMap,
      unlockedLevels,
      currentLevelIdx,
      saveProgress,
      bridge,
    ]
  );

  // Revert Turn Action (Restricted to MAX_REVERT_CHARGES per level)
  const handleRevertTurn = useCallback(() => {
    if (isVictory) return;
    if (revertCharges <= 0) {
      soundEngine.play('hit');
      setStatusMessage('Đã hết số lượt Hoàn Tác (0/3) cho màn chơi này!');
      return;
    }
    if (history.length === 0) {
      soundEngine.play('click');
      setStatusMessage('Bạn đang ở bước khởi đầu, chưa thể hoàn tác.');
      return;
    }

    const previousState = history[history.length - 1];
    setPlayerPos(previousState.playerPos);
    setPlayerFacing(previousState.playerFacing);
    setMummies(previousState.mummies);
    setGates(previousState.gates);
    setKeys(previousState.keys);
    setTraps(previousState.traps);
    setTurnsTaken(previousState.turnsCount);
    setScore(previousState.score);
    setMummiesDestroyedThisLevel(previousState.mummiesTrappedCount);
    setIsCaught(false);
    setTurnPhase('player_turn');
    setShakeEffect('none');
    const remaining = revertCharges - 1;
    setRevertCharges(remaining);
    setStatusMessage(`Đã hoàn tác 1 lượt bước đi. (Còn lại: ${remaining}/${MAX_REVERT_CHARGES} lượt)`);
    setHistory((prev) => prev.slice(0, -1));
    setActiveHint(null);
    mummyAudio.playRevertTurn();
  }, [history, isVictory, revertCharges]);

  // Reset Chamber
  const handleReset = useCallback(() => {
    soundEngine.play('click');
    setActiveHint(null);
    if (mode === 'endless') {
      startEndlessLevel(endlessFloor);
    } else {
      startCampaignLevel(currentLevelIdx);
    }
  }, [mode, endlessFloor, currentLevelIdx, startEndlessLevel, startCampaignLevel]);

  // Request Pathfinding Safest Move Hint
  const handleRequestHint = useCallback(() => {
    if (isVictory || isCaught || isPaused || hintCooldown > 0) return;

    const suggestion = findSafestMove({
      playerPos,
      mummies,
      hWalls: levelData.horizontalWalls,
      vWalls: levelData.verticalWalls,
      gates,
      keys,
      traps,
      exitPos: levelData.exitPos,
      gridSize: levelData.gridSize,
    });

    setActiveHint(suggestion);
    setHintCooldown(HINT_COOLDOWN_SECONDS);
    mummyAudio.playHint();
    setStatusMessage(`💡 Gợi ý: ${suggestion.reason}`);
  }, [
    isVictory,
    isCaught,
    isPaused,
    hintCooldown,
    playerPos,
    mummies,
    levelData,
    gates,
    keys,
    traps,
  ]);

  // Next Level Action
  const handleNextLevel = () => {
    soundEngine.play('click');
    setActiveHint(null);
    if (mode === 'endless') {
      startEndlessLevel(endlessFloor + 1);
    } else {
      const nextIdx = currentLevelIdx + 1;
      if (nextIdx < CAMPAIGN_LEVELS.length) {
        startCampaignLevel(nextIdx);
      } else {
        setShowLevelSelect(true);
      }
    }
  };

  // Keyboard Controller
  useEffect(() => {
    const handleKeyDown = (e: KeyboardEvent) => {
      if (isPaused) return;

      if (e.key === 'ArrowUp' || e.key === 'w' || e.key === 'W') {
        e.preventDefault();
        handleMove('up');
      } else if (e.key === 'ArrowDown' || e.key === 's' || e.key === 'S') {
        e.preventDefault();
        handleMove('down');
      } else if (e.key === 'ArrowLeft' || e.key === 'a' || e.key === 'A') {
        e.preventDefault();
        handleMove('left');
      } else if (e.key === 'ArrowRight' || e.key === 'd' || e.key === 'D') {
        e.preventDefault();
        handleMove('right');
      } else if (e.key === ' ' || e.key === '5' || e.key === 'NumPad5') {
        e.preventDefault();
        handleMove('wait');
      } else if (e.key === 'h' || e.key === 'H') {
        e.preventDefault();
        handleRequestHint();
      } else if (e.key === 'z' || e.key === 'Z' || e.key === 'u' || e.key === 'U') {
        e.preventDefault();
        handleRevertTurn();
      } else if (e.key === 'r' || e.key === 'R') {
        e.preventDefault();
        handleReset();
      } else if (e.key === 't' || e.key === 'T') {
        e.preventDefault();
        setShowWarningPaths((prev) => !prev);
      }
    };

    window.addEventListener('keydown', handleKeyDown);

    const handleCustomSwipe = (e: Event) => {
      if (isPaused || isVictory || isCaught) return;
      const customEvt = e as CustomEvent<{ direction: Direction }>;
      if (customEvt.detail && customEvt.detail.direction) {
        handleMove(customEvt.detail.direction);
      }
    };
    window.addEventListener('arcadex:swipe', handleCustomSwipe);

    return () => {
      window.removeEventListener('keydown', handleKeyDown);
      window.removeEventListener('arcadex:swipe', handleCustomSwipe);
    };
  }, [handleMove, handleRevertTurn, handleReset, isPaused, isVictory, isCaught]);

  return (
    <div
      id="mummy-escape-root"
      className="flex flex-col items-center justify-start w-full h-full max-w-4xl mx-auto text-white select-none overflow-y-auto overflow-x-hidden p-1 sm:p-3 scrollbar-thin"
    >
      {/* Game Header Bar & Mode Selector */}
      <div className="w-full flex flex-col sm:flex-row items-center justify-between gap-2 mb-2 bg-[#1b140e] border border-[#7d5626] rounded-2xl p-2 sm:px-4 shadow-lg">
        {/* Game Title & Egyptian Logo */}
        <div className="flex items-center gap-2">
          <span className="text-2xl sm:text-3xl">🏜️</span>
          <div>
            <div className="flex items-center gap-1.5">
              <h1 className="text-sm sm:text-base font-black tracking-wider text-[#f59e0b] uppercase drop-shadow">
                MUMMY ESCAPE
              </h1>
              <span className="px-1.5 py-0.5 rounded bg-amber-500/20 text-amber-300 text-[10px] font-bold border border-amber-500/40">
                Tactical Puzzle
              </span>
            </div>
            <p className="text-[10px] text-[#d4b483]">
              {mode === 'endless'
                ? `Mê Cung Bất Tận - Tầng ${endlessFloor}`
                : `${levelData.pyramidName} (${currentLevelIdx + 1}/${CAMPAIGN_LEVELS.length})`}
            </p>
          </div>
        </div>

        {/* Mode Selector Tabs */}
        <div className="flex items-center gap-1 bg-black/40 p-1 rounded-xl border border-white/5 overflow-x-auto max-w-full">
          <button
            type="button"
            onClick={() => handleSelectMode('campaign')}
            className={`px-2.5 py-1 rounded-lg text-xs font-bold transition-all cursor-pointer flex items-center gap-1 ${
              mode === 'campaign'
                ? 'bg-amber-600 text-white shadow-md shadow-amber-600/30 ring-1 ring-amber-400'
                : 'text-stone-400 hover:text-white hover:bg-white/5'
            }`}
          >
            <span>🏛️</span>
            <span className="hidden xs:inline">Chiến Dịch</span>
          </button>

          <button
            type="button"
            onClick={() => handleSelectMode('turn_limit')}
            className={`px-2.5 py-1 rounded-lg text-xs font-bold transition-all cursor-pointer flex items-center gap-1 ${
              mode === 'turn_limit'
                ? 'bg-amber-600 text-white shadow-md shadow-amber-600/30 ring-1 ring-amber-400'
                : 'text-stone-400 hover:text-white hover:bg-white/5'
            }`}
          >
            <span>🎯</span>
            <span className="hidden xs:inline">Giới Hạn Bước</span>
          </button>

          <button
            type="button"
            onClick={() => handleSelectMode('time_attack')}
            className={`px-2.5 py-1 rounded-lg text-xs font-bold transition-all cursor-pointer flex items-center gap-1 ${
              mode === 'time_attack'
                ? 'bg-amber-600 text-white shadow-md shadow-amber-600/30 ring-1 ring-amber-400'
                : 'text-stone-400 hover:text-white hover:bg-white/5'
            }`}
          >
            <Hourglass className="w-3 h-3 text-cyan-400" />
            <span className="hidden xs:inline">Thời Gian</span>
          </button>

          <button
            type="button"
            onClick={() => handleSelectMode('endless')}
            className={`px-2.5 py-1 rounded-lg text-xs font-bold transition-all cursor-pointer flex items-center gap-1 ${
              mode === 'endless'
                ? 'bg-amber-600 text-white shadow-md shadow-amber-600/30 ring-1 ring-amber-400'
                : 'text-stone-400 hover:text-white hover:bg-white/5'
            }`}
          >
            <span>♾️</span>
            <span className="hidden xs:inline">Vô Tận</span>
          </button>

          {/* Adaptive Difficulty Pill Button */}
          <button
            type="button"
            onClick={() => setShowSettingsModal(true)}
            className="px-2 py-1 rounded-lg text-xs font-bold transition-all cursor-pointer flex items-center gap-1 bg-amber-500/10 hover:bg-amber-500/20 text-amber-300 border border-amber-500/30 ml-1"
            title="Độ Khó Thích Ứng (Adaptive AI Difficulty)"
          >
            <Sparkles className="w-3 h-3 text-amber-400" />
            <span className="hidden sm:inline">{getSkillTierInfo(adaptiveProfile.skillRating).title}</span>
            <span className="font-mono text-[10px] text-amber-200">({adaptiveProfile.skillRating})</span>
          </button>

          {/* Settings & Display Palette Modal Button */}
          <button
            id="btn-open-settings"
            type="button"
            onClick={() => setShowSettingsModal(true)}
            className="px-2.5 py-1 rounded-lg text-xs font-bold transition-all cursor-pointer flex items-center gap-1.5 bg-amber-600/20 hover:bg-amber-600/30 text-yellow-300 border border-amber-500/40 ml-1"
            title="Cài Đặt Trò Chơi & Bảng Màu Lưới (Display & Game Settings)"
          >
            <Settings className="w-3.5 h-3.5 text-yellow-400" />
            <span className="hidden sm:inline">Cài Đặt</span>
          </button>
        </div>
      </div>

      {/* Main Game Layout: Side Control Panel & Board Grid */}
      <div className="w-full grid grid-cols-1 md:grid-cols-12 gap-3 items-start">
        {/* LEFT COLUMN: Tactical Mummy Escape Side Panel (4 cols) */}
        <div className="md:col-span-4 flex flex-col gap-2.5 bg-[#17110a] border border-[#5d3f1c] rounded-2xl p-3 shadow-xl">
          {/* Score & Step Counters - Icon-focused */}
          <div className="grid grid-cols-2 gap-2">
            {/* Score */}
            <div className="bg-[#24190e] border border-[#7d5626]/50 rounded-xl p-2 text-center shadow-inner" title="Điểm Số">
              <Trophy className="w-4 h-4 text-amber-400 mx-auto mb-0.5" />
              <div className="text-xl font-black text-yellow-300 font-mono tracking-wider">{score}</div>
            </div>

            {/* Turns Taken / Par */}
            <div className="bg-[#24190e] border border-[#7d5626]/50 rounded-xl p-2 text-center shadow-inner" title="Số Bước">
              <Footprints className="w-4 h-4 text-amber-400 mx-auto mb-0.5" />
              <div className="text-xl font-black text-white font-mono">
                {mode === 'turn_limit'
                  ? Math.max(0, (levelData.maxTurns || 25) - turnsTaken)
                  : `${turnsTaken} / ${levelData.parTurns}`}
              </div>
            </div>
          </div>

          {/* Time Limit bar if Time Attack */}
          {mode === 'time_attack' && (
            <div className="bg-[#24190e] border border-cyan-500/40 rounded-xl p-2 flex items-center justify-between" title="Thời Gian Còn Lại">
              <div className="flex items-center gap-1.5 text-cyan-300 text-xs font-bold">
                <Hourglass className="w-4 h-4 animate-spin" />
              </div>
              <span className="text-lg font-black font-mono text-cyan-200">{timeLeft}s</span>
            </div>
          )}

          {/* Tactical Action Buttons: REVERT TURN with Limited Charges */}
          <div className="flex flex-col gap-2">
            {/* Revert Turn Button (Restricted uses per level) */}
            <button
              id="btn-mummy-revert-turn"
              type="button"
              onClick={handleRevertTurn}
              disabled={history.length === 0 || isVictory || revertCharges <= 0}
              title="Hoàn Tác Lượt"
              aria-label="Hoàn Tác Lượt"
              className={`w-full py-2.5 px-3 rounded-xl font-black text-xs uppercase tracking-wider flex items-center justify-between border shadow-lg transition-all cursor-pointer ${
                history.length > 0 && !isVictory && revertCharges > 0
                  ? 'bg-gradient-to-b from-[#8f6826] to-[#593d11] hover:from-[#a77a2f] hover:to-[#6d4b17] text-yellow-200 border-[#d4af37] active:scale-[0.98]'
                  : 'bg-stone-900 text-stone-600 border-stone-800 cursor-not-allowed opacity-60'
              }`}
            >
              <div className="flex items-center gap-1.5">
                <Undo2 className="w-4 h-4 text-yellow-300" />
              </div>
              <div className="flex items-center gap-1 bg-black/60 px-2 py-0.5 rounded-lg border border-yellow-500/30">
                <span className="text-[10px] text-yellow-300 font-mono">
                  {revertCharges}/{MAX_REVERT_CHARGES}
                </span>
              </div>
            </button>

            {/* Reset Maze Button */}
            <button
              id="btn-mummy-reset"
              type="button"
              onClick={handleReset}
              title="Chơi Lại (Reset)"
              aria-label="Chơi Lại (Reset)"
              className="w-full py-2 px-3 rounded-xl font-black text-xs uppercase tracking-wider flex items-center justify-center gap-2 bg-[#2d1e0d] hover:bg-[#3d2912] text-[#d4b483] border border-[#7d5626] active:scale-[0.98] transition-all cursor-pointer"
            >
              <RotateCcw className="w-4 h-4 text-amber-400" />
            </button>

            {/* Skip / Wait Turn Button */}
            <button
              id="btn-mummy-wait"
              type="button"
              onClick={() => handleMove('wait')}
              disabled={isVictory || isCaught}
              title="Đứng Yên (Bỏ Lượt / Space)"
              aria-label="Đứng Yên (Bỏ Lượt / Space)"
              className="w-full py-2 px-3 rounded-xl font-bold text-xs uppercase tracking-wider flex items-center justify-center gap-2 bg-[#3b2a14] hover:bg-[#4d371a] text-amber-200 border border-amber-500/40 active:scale-[0.98] transition-all cursor-pointer"
            >
              <Flame className="w-4 h-4 text-amber-400" />
            </button>
          </div>

          {/* Procedural Generator, Map Modal & Display Settings Triggers */}
          <div className="grid grid-cols-3 gap-1.5 mt-1">
            <button
              id="btn-mummy-procedural-gen"
              type="button"
              onClick={() => setShowProceduralModal(true)}
              title="Tự Sinh"
              aria-label="Tự Sinh"
              className="py-2 px-1 rounded-xl bg-gradient-to-r from-amber-700/80 to-yellow-800/80 hover:from-amber-600 hover:to-yellow-700 text-yellow-100 border border-amber-400/50 flex items-center justify-center cursor-pointer transition-all shadow-md"
            >
              <Wand2 className="w-4 h-4 text-yellow-300 shrink-0" />
            </button>

            <button
              id="btn-mummy-world-map"
              type="button"
              onClick={() => setShowLevelSelect(true)}
              title="Bản Đồ"
              aria-label="Bản Đồ"
              className="py-2 px-1 rounded-xl bg-[#1d140b] hover:bg-[#2c1e11] text-amber-300 border border-[#5d3f1c] flex items-center justify-center cursor-pointer transition-all"
            >
              <Map className="w-4 h-4 shrink-0" />
            </button>

            <button
              id="btn-mummy-open-display-settings"
              type="button"
              onClick={() => setShowSettingsModal(true)}
              className="py-2 px-1 rounded-xl bg-[#1d140b] hover:bg-[#2c1e11] text-yellow-300 border border-[#5d3f1c] flex items-center justify-center cursor-pointer transition-all"
              title="Đổi Bảng Màu & Cài Đặt Hiển Thị"
              aria-label="Đổi Bảng Màu & Cài Đặt Hiển Thị"
            >
              <Palette className="w-4 h-4 text-amber-400 shrink-0" />
            </button>
          </div>

          {/* PATHFINDING HINT BUTTON & STRATEGIC OVERVIEW */}
          <div className="flex flex-col gap-1.5 mt-1">
            <button
              id="btn-mummy-hint-safest"
              type="button"
              onClick={handleRequestHint}
              disabled={isVictory || isCaught || isPaused || hintCooldown > 0}
              className={`w-full py-2.5 px-3 rounded-xl font-black text-xs uppercase tracking-wider flex items-center justify-between transition-all cursor-pointer shadow-md border ${
                hintCooldown > 0
                  ? 'bg-stone-900/90 text-stone-500 border-stone-800 cursor-not-allowed'
                  : 'bg-gradient-to-r from-amber-600 via-yellow-500 to-amber-600 hover:from-amber-500 hover:to-yellow-400 text-stone-950 border-yellow-300 shadow-[0_0_15px_rgba(250,204,21,0.4)] active:scale-[0.98]'
              }`}
            >
              <div className="flex items-center gap-2">
                <div
                  className={`p-1 rounded-lg ${
                    hintCooldown > 0 ? 'bg-stone-800 text-stone-600' : 'bg-black/20 text-stone-950'
                  }`}
                >
                  <Lightbulb className={`w-4 h-4 ${hintCooldown === 0 ? 'animate-bounce' : ''}`} />
                </div>
                <div className="flex flex-col text-left">
                  <span className="leading-none">GỢI Ý NƯỚC ĐI AN TOÀN</span>
                  <span className="text-[9px] font-bold opacity-80 lowercase font-mono">
                    {hintCooldown > 0 ? 'tìm đường tự động' : 'phím tắt: H'}
                  </span>
                </div>
              </div>

              <div className="flex items-center">
                {hintCooldown > 0 ? (
                  <div className="flex items-center gap-1 bg-stone-950/80 px-2 py-1 rounded-lg border border-stone-800 text-[10px] font-mono font-bold text-amber-400">
                    <Hourglass className="w-3 h-3 animate-spin text-amber-400" />
                    <span>{hintCooldown}s</span>
                  </div>
                ) : (
                  <span className="bg-black/30 text-stone-950 text-[10px] font-black px-2 py-0.5 rounded-full border border-black/20 animate-pulse">
                    SẴN SÀNG
                  </span>
                )}
              </div>
            </button>

            {/* Active Hint Tactical Recommendation Card */}
            {activeHint && !isVictory && !isCaught && (
              <div className="bg-gradient-to-b from-[#2b1c0b] to-[#160d05] border-2 border-yellow-400/80 rounded-2xl p-3 shadow-xl animate-fadeIn relative overflow-hidden">
                <div className="absolute top-0 right-0 w-24 h-24 bg-yellow-400/10 rounded-full blur-xl pointer-events-none" />

                <div className="flex items-center justify-between pb-1.5 border-b border-amber-500/20 mb-2">
                  <div className="flex items-center gap-1.5 text-yellow-300 text-xs font-black uppercase tracking-wide">
                    <Compass className="w-3.5 h-3.5 text-yellow-400 animate-spin" />
                    <span>Chiến Thuật Tối Ưu</span>
                  </div>
                  <button
                    type="button"
                    onClick={() => setActiveHint(null)}
                    className="text-stone-400 hover:text-white text-xs px-1 cursor-pointer"
                    title="Đóng gợi ý"
                  >
                    ✕
                  </button>
                </div>

                <div className="flex items-center gap-2 mb-2">
                  <div className="w-10 h-10 rounded-xl bg-gradient-to-br from-amber-500 to-yellow-600 border border-yellow-200 flex items-center justify-center text-stone-950 font-black shadow shrink-0">
                    {activeHint.isWait ? (
                      <span className="text-sm">🛑</span>
                    ) : activeHint.bestDir === 'up' ? (
                      <ArrowUp className="w-5 h-5 font-black" />
                    ) : activeHint.bestDir === 'down' ? (
                      <ArrowDown className="w-5 h-5 font-black" />
                    ) : activeHint.bestDir === 'left' ? (
                      <ArrowLeft className="w-5 h-5 font-black" />
                    ) : (
                      <ArrowRight className="w-5 h-5 font-black" />
                    )}
                  </div>

                  <div className="flex flex-col">
                    <span className="text-xs font-black text-yellow-200">
                      {activeHint.isWinningMove
                        ? 'LỐI THOÁT TRỰC TIẾP!'
                        : activeHint.isWait
                        ? 'BỎ LƯỢT (WAIT)'
                        : `DI CHUYỂN: ${
                            activeHint.bestDir === 'up'
                              ? 'HƯỚNG LÊN'
                              : activeHint.bestDir === 'down'
                              ? 'HƯỚNG XUỐNG'
                              : activeHint.bestDir === 'left'
                              ? 'SANG TRÁI'
                              : 'SANG PHẢI'
                          }`}
                    </span>
                    <span className="text-[10px] text-amber-300/80 font-mono">
                      Tới ô tọa độ ({activeHint.targetPos.x + 1}, {activeHint.targetPos.y + 1})
                    </span>
                  </div>
                </div>

                <p className="text-[11px] text-amber-100/90 leading-relaxed bg-black/40 p-2 rounded-xl border border-amber-500/20 mb-2">
                  {activeHint.reason}
                </p>

                {/* Direct Move Execute Action */}
                <button
                  type="button"
                  onClick={() => handleMove(activeHint.bestDir)}
                  className="w-full py-1.5 px-2 rounded-lg bg-yellow-500/20 hover:bg-yellow-500/30 text-yellow-300 border border-yellow-400/50 text-[11px] font-bold flex items-center justify-center gap-1.5 transition-all cursor-pointer"
                >
                  <span>Thực hiện nước đi này ngay</span>
                  <span>➔</span>
                </button>
              </div>
            )}
          </div>

          {/* Hint Card */}
          {showHint && (
            <div className="bg-[#241708] border border-amber-500/30 rounded-xl p-2.5 text-xs text-amber-200/90 animate-fadeIn">
              <div className="font-bold text-amber-300 mb-1 flex items-center gap-1">
                <span>💡 Gợi ý phòng mộ:</span>
              </div>
              <p className="text-[11px] leading-relaxed">{levelData.hintTip || 'Dụ xác ướp vào các góc tường cụt!'}</p>
            </div>
          )}

          {/* Tactical Guide / Rules Reminder */}
          <div className="bg-[#120e09] border border-white/5 rounded-xl p-2.5 text-[11px] text-stone-400 flex flex-col gap-1">
            <div className="font-bold text-stone-300 text-[11px] uppercase flex items-center justify-between">
              <span>Quy Luật Di Chuyển:</span>
              <span className="text-[9px] text-amber-400 font-mono">Radar ⚠️: Bật</span>
            </div>
            <div className="flex items-center gap-1.5 text-slate-300">
              <span className="w-2 h-2 rounded-full bg-slate-200 inline-block shrink-0" />
              <span>Xác ướp trắng: Đi 2 bước (Ưu tiên NGANG).</span>
            </div>
            <div className="flex items-center gap-1.5 text-rose-300">
              <span className="w-2 h-2 rounded-full bg-rose-500 inline-block shrink-0" />
              <span>Xác ướp đỏ: Đi 2 bước (Ưu tiên DỌC).</span>
            </div>
            <div className="flex items-center gap-1.5 text-amber-300">
              <span className="w-2 h-2 rounded-full bg-amber-500 inline-block shrink-0" />
              <span>Bọ cạp: Đi 1 bước mỗi lượt.</span>
            </div>
          </div>
        </div>

        {/* RIGHT COLUMN: Turn Indicator + Game Board + Mobile D-Pad (8 cols) */}
        <div className="md:col-span-8 flex flex-col items-center justify-center bg-[#151009] border border-[#5d3f1c] rounded-2xl p-2 sm:p-4 shadow-2xl relative">
          {/* Visual Turn Indicator UI Component with Countdown Timer */}
          <MummyEscapeTurnIndicator
            turnPhase={turnPhase}
            turnsTaken={turnsTaken}
            parTurns={levelData.parTurns}
            maxTurns={levelData.maxTurns}
            mode={mode}
            timeLeft={timeLeft}
            timeLimitSec={levelData.timeLimitSec || 60}
            revertCharges={revertCharges}
            maxRevertCharges={MAX_REVERT_CHARGES}
            mummiesAliveCount={aliveMummiesCount}
            isThreatCritical={isThreatCritical}
          />

          {/* Status Alert Banner */}
          {statusMessage && (
            <div className="w-full max-w-[500px] mb-2 px-3 py-1.5 rounded-xl bg-amber-500/15 border border-amber-500/30 text-amber-200 text-xs font-semibold flex items-center justify-between animate-fadeIn">
              <span>{statusMessage}</span>
              <button
                type="button"
                onClick={() => setStatusMessage('')}
                className="text-amber-400 text-xs hover:text-white ml-2"
              >
                ✕
              </button>
            </div>
          )}

          {/* Mummy Escape Board with Dynamic Grid Sizes, Warning Path Indicators and Screen-Shake */}
          <MummyEscapeBoard
            playerPos={playerPos}
            playerFacing={playerFacing}
            mummies={mummies}
            hWalls={levelData.horizontalWalls}
            vWalls={levelData.verticalWalls}
            gates={gates}
            keys={keys}
            traps={traps}
            exitPos={levelData.exitPos}
            exitDirection={levelData.exitDirection}
            gridSize={levelData.gridSize}
            isGameOver={isCaught}
            isVictory={isVictory}
            threatPaths={threatPaths}
            showWarningPaths={showWarningPaths}
            onToggleWarningPaths={() => setShowWarningPaths((prev) => !prev)}
            shakeEffect={screenShakeEnabled ? shakeEffect : 'none'}
            shakeNonce={shakeNonce}
            palette={GRID_PALETTES[paletteId] || GRID_PALETTES.classic_sand}
            showWatermarks={showWatermarks}
            hintCell={
              activeHint && !isCaught && !isVictory
                ? {
                    pos: activeHint.targetPos,
                    dir: activeHint.bestDir,
                    isWait: activeHint.isWait,
                    reason: activeHint.reason,
                    isWinningMove: activeHint.isWinningMove,
                  }
                : null
            }
            onMove={handleMove}
          />

          {/* On-Screen Mobile Compass D-Pad */}
          <div className="w-full max-w-[340px] mt-3 flex flex-col items-center justify-center gap-1 bg-[#20150a] border border-[#6d4c20]/50 rounded-2xl p-2.5 shadow-inner">
            <div className="flex items-center justify-between w-full px-2 mb-1 gap-1">
              <span className="text-[10px] font-bold text-amber-400/70 uppercase tracking-wider truncate">
                Phím Điều Hướng
              </span>
              <div className="flex items-center gap-1.5 shrink-0">
                <button
                  id="dpad-quick-hint"
                  type="button"
                  onClick={handleRequestHint}
                  disabled={hintCooldown > 0 || isVictory || isCaught}
                  className={`text-[9px] font-bold flex items-center gap-1 px-1.5 py-0.5 rounded border transition-all ${
                    hintCooldown === 0 && !isVictory && !isCaught
                      ? 'bg-gradient-to-r from-yellow-600 to-amber-600 text-stone-950 font-black border-yellow-300 shadow cursor-pointer active:scale-95'
                      : 'bg-stone-900 text-stone-500 border-stone-800 cursor-not-allowed'
                  }`}
                >
                  <Lightbulb className="w-2.5 h-2.5" />
                  <span>{hintCooldown > 0 ? `Hint (${hintCooldown}s)` : 'Hint (H)'}</span>
                </button>
                <button
                  type="button"
                  onClick={handleRevertTurn}
                  disabled={history.length === 0 || isVictory || revertCharges <= 0}
                  className={`text-[9px] font-bold flex items-center gap-1 px-1.5 py-0.5 rounded border ${
                    revertCharges > 0 && history.length > 0
                      ? 'bg-amber-950 text-amber-300 border-amber-500/40 cursor-pointer'
                      : 'bg-stone-900 text-stone-600 border-stone-800 cursor-not-allowed'
                  }`}
                >
                  <Undo2 className="w-2.5 h-2.5" />
                  <span>Revert ({revertCharges}/{MAX_REVERT_CHARGES})</span>
                </button>
              </div>
            </div>

            {/* UP */}
            <div className="flex justify-center">
              <button
                id="dpad-up"
                type="button"
                onClick={() => handleMove('up')}
                className="w-12 h-11 rounded-xl bg-gradient-to-b from-[#8f6826] to-[#593d11] hover:from-[#a77a2f] hover:to-[#6d4b17] border border-[#d4af37] text-yellow-100 flex items-center justify-center active:scale-90 shadow-md transition-transform cursor-pointer"
                aria-label="Lên"
              >
                <ArrowUp className="w-5 h-5 font-black" />
              </button>
            </div>

            {/* LEFT, WAIT, RIGHT */}
            <div className="flex items-center gap-2">
              <button
                id="dpad-left"
                type="button"
                onClick={() => handleMove('left')}
                className="w-12 h-11 rounded-xl bg-gradient-to-b from-[#8f6826] to-[#593d11] hover:from-[#a77a2f] hover:to-[#6d4b17] border border-[#d4af37] text-yellow-100 flex items-center justify-center active:scale-90 shadow-md transition-transform cursor-pointer"
                aria-label="Trái"
              >
                <ArrowLeft className="w-5 h-5 font-black" />
              </button>

              {/* Center Wait Button */}
              <button
                id="dpad-wait"
                type="button"
                onClick={() => handleMove('wait')}
                className="w-14 h-11 rounded-xl bg-gradient-to-b from-amber-700 to-amber-950 hover:from-amber-600 hover:to-amber-900 border-2 border-amber-400 text-amber-100 font-black text-[10px] uppercase flex flex-col items-center justify-center active:scale-90 shadow-md transition-transform cursor-pointer"
                aria-label="Đứng yên"
              >
                <span>BỎ LƯỢT</span>
                <span className="text-[8px] text-amber-300">Wait</span>
              </button>

              <button
                id="dpad-right"
                type="button"
                onClick={() => handleMove('right')}
                className="w-12 h-11 rounded-xl bg-gradient-to-b from-[#8f6826] to-[#593d11] hover:from-[#a77a2f] hover:to-[#6d4b17] border border-[#d4af37] text-yellow-100 flex items-center justify-center active:scale-90 shadow-md transition-transform cursor-pointer"
                aria-label="Phải"
              >
                <ArrowRight className="w-5 h-5 font-black" />
              </button>
            </div>

            {/* DOWN */}
            <div className="flex justify-center">
              <button
                id="dpad-down"
                type="button"
                onClick={() => handleMove('down')}
                className="w-12 h-11 rounded-xl bg-gradient-to-b from-[#8f6826] to-[#593d11] hover:from-[#a77a2f] hover:to-[#6d4b17] border border-[#d4af37] text-yellow-100 flex items-center justify-center active:scale-90 shadow-md transition-transform cursor-pointer"
                aria-label="Xuống"
              >
                <ArrowDown className="w-5 h-5 font-black" />
              </button>
            </div>
          </div>
        </div>
      </div>

      {/* PROCEDURAL LEVEL GENERATOR MODAL */}
      {showProceduralModal && (
        <div className="fixed inset-0 z-50 bg-black/85 backdrop-blur-md flex items-center justify-center p-3 animate-fadeIn">
          <div className="w-full max-w-lg bg-[#1a1209] border-2 border-[#d4af37] rounded-3xl p-5 shadow-2xl flex flex-col max-h-[90vh] overflow-y-auto scrollbar-thin">
            {/* Modal Header */}
            <div className="flex items-center justify-between pb-3 border-b border-amber-600/30 mb-4">
              <div className="flex items-center gap-2">
                <span className="text-2xl">✨</span>
                <div>
                  <h3 className="text-base font-black text-yellow-300 uppercase tracking-wide">
                    TẠO MÀN THỦ TỤC NGẪU NHIÊN (PROCEDURAL GENERATOR)
                  </h3>
                  <p className="text-[10px] text-amber-200/70">
                    Sinh mê cung vô tận với bố cục bẫy và kích thước bản đồ tùy biến
                  </p>
                </div>
              </div>
              <button
                type="button"
                onClick={() => setShowProceduralModal(false)}
                className="w-8 h-8 rounded-full bg-white/5 hover:bg-white/10 flex items-center justify-center text-slate-300 hover:text-white cursor-pointer"
              >
                ✕
              </button>
            </div>

            {/* Form Controls */}
            <div className="space-y-4">
              {/* 1. Map Size Preset */}
              <div>
                <label className="block text-xs font-bold text-amber-300 uppercase mb-1.5 flex items-center gap-1.5">
                  <Sliders className="w-3.5 h-3.5" />
                  <span>1. Kích Thước Bản Đồ:</span>
                </label>
                <div className="grid grid-cols-4 gap-2">
                  {(['5x5', '6x6', '7x7', '8x8'] as MapSizePreset[]).map((size) => (
                    <button
                      key={`size-${size}`}
                      type="button"
                      onClick={() => setProcSizePreset(size)}
                      className={`py-2 px-1 rounded-xl text-xs font-black transition-all cursor-pointer border ${
                        procSizePreset === size
                          ? 'bg-amber-600 border-yellow-300 text-white shadow-md shadow-amber-600/40 ring-2 ring-yellow-400'
                          : 'bg-[#281b0f] border-[#5d3f1c] text-stone-300 hover:bg-[#3b2817]'
                      }`}
                    >
                      {size}
                    </button>
                  ))}
                </div>
              </div>

              {/* 2. Chamber Archetype */}
              <div>
                <label className="block text-xs font-bold text-amber-300 uppercase mb-1.5 flex items-center gap-1.5">
                  <Map className="w-3.5 h-3.5" />
                  <span>2. Bố Cục Kiến Trúc Phòng Mộ:</span>
                </label>
                <div className="grid grid-cols-2 sm:grid-cols-3 gap-2">
                  {[
                    { id: 'random', label: '🎲 Ngẫu Nhiên' },
                    { id: 'labyrinth', label: '🌀 Mê Cung' },
                    { id: 'pillars_of_karnak', label: '🏛️ Hàng Thạch Trụ' },
                    { id: 'gauntlet_of_traps', label: '🗡️ Đại Trận Bẫy' },
                    { id: 'royal_vault', label: '👑 Kho Báu Cổng Khóa' },
                    { id: 'scorpion_nest', label: '🦂 Tổ Bọ Cạp' },
                  ].map((arch) => (
                    <button
                      key={`arch-${arch.id}`}
                      type="button"
                      onClick={() => setProcArchetype(arch.id as any)}
                      className={`p-2 rounded-xl text-[11px] font-bold text-left transition-all cursor-pointer border ${
                        procArchetype === arch.id
                          ? 'bg-amber-600 border-yellow-300 text-white shadow-md shadow-amber-600/30'
                          : 'bg-[#281b0f] border-[#5d3f1c] text-stone-300 hover:bg-[#3b2817]'
                      }`}
                    >
                      {arch.label}
                    </button>
                  ))}
                </div>
              </div>

              {/* 3. Mummy Count & Trap Density */}
              <div className="grid grid-cols-2 gap-3">
                {/* Mummy Count */}
                <div>
                  <label className="block text-xs font-bold text-amber-300 uppercase mb-1.5">
                    3. Số Xác Ướp ({procMummyCount}):
                  </label>
                  <div className="flex items-center gap-1">
                    {[1, 2, 3, 4].map((count) => (
                      <button
                        key={`mummies-${count}`}
                        type="button"
                        onClick={() => setProcMummyCount(count)}
                        className={`flex-1 py-1.5 rounded-lg text-xs font-bold border ${
                          procMummyCount === count
                            ? 'bg-amber-600 border-yellow-300 text-white'
                            : 'bg-[#281b0f] border-[#5d3f1c] text-stone-300'
                        }`}
                      >
                        {count}
                      </button>
                    ))}
                  </div>
                </div>

                {/* Trap Density */}
                <div>
                  <label className="block text-xs font-bold text-amber-300 uppercase mb-1.5">
                    4. Mật Độ Bẫy:
                  </label>
                  <div className="flex items-center gap-1">
                    {(['none', 'low', 'medium', 'high'] as const).map((density) => (
                      <button
                        key={`trap-${density}`}
                        type="button"
                        onClick={() => setProcTrapDensity(density)}
                        className={`flex-1 py-1.5 rounded-lg text-[10px] font-bold border capitalize ${
                          procTrapDensity === density
                            ? 'bg-amber-600 border-yellow-300 text-white'
                            : 'bg-[#281b0f] border-[#5d3f1c] text-stone-300'
                        }`}
                      >
                        {density === 'none' ? '0' : density === 'low' ? 'Ít' : density === 'medium' ? 'Vừa' : 'Nhiều'}
                      </button>
                    ))}
                  </div>
                </div>
              </div>

              {/* 4. Seed (Optional) */}
              <div>
                <label className="block text-xs font-bold text-amber-300 uppercase mb-1.5 flex items-center justify-between">
                  <span>5. Mã Hạt Giống Hầm Mộ (Seed):</span>
                  <button
                    type="button"
                    onClick={() => setProcSeed(Math.random().toString(36).substring(2, 8).toUpperCase())}
                    className="text-[10px] text-yellow-400 hover:underline flex items-center gap-1"
                  >
                    <Dices className="w-3 h-3" />
                    <span>Tạo Mã Mới</span>
                  </button>
                </label>
                <input
                  type="text"
                  value={procSeed}
                  onChange={(e) => setProcSeed(e.target.value)}
                  placeholder="Ví dụ: PHARAOH-99, TUTO-77..."
                  className="w-full bg-[#120b06] border border-[#7d5626] rounded-xl px-3 py-2 text-xs text-yellow-200 font-mono focus:outline-none focus:border-yellow-400"
                />
              </div>

              {/* Generate Button */}
              <button
                type="button"
                onClick={() => handleGenerateCustomChamber()}
                className="w-full py-3.5 rounded-2xl font-black text-sm uppercase tracking-wider bg-gradient-to-r from-amber-500 via-yellow-500 to-amber-500 hover:from-amber-400 hover:to-yellow-400 text-stone-950 shadow-xl shadow-amber-500/30 flex items-center justify-center gap-2 cursor-pointer transition-transform active:scale-[0.98]"
              >
                <Wand2 className="w-4 h-4 text-stone-950" />
                <span>SINH PHÒNG MỘ TỰ ĐỘNG (GENERATE CHAMBER)</span>
              </button>
            </div>
          </div>
        </div>
      )}

      {/* LEVEL CLEAR ANIMATED TOAST NOTIFICATION */}
      {isVictory && levelVictoryData && (
        <LevelClearToast
          levelData={levelData}
          turnsTaken={levelVictoryData.turnsTaken}
          stars={levelVictoryData.stars}
          score={score}
          levelScoreBonus={levelVictoryData.levelScoreBonus}
          mummiesDestroyed={levelVictoryData.mummiesDestroyed}
          revertChargesUsed={MAX_REVERT_CHARGES - revertCharges}
          mode={mode}
          floor={endlessFloor}
          onNextLevel={handleNextLevel}
          onReplay={handleReset}
          onOpenMap={() => setShowLevelSelect(true)}
          onDismiss={() => setLevelVictoryData(null)}
        />
      )}

      {/* VICTORY OVERLAY DIALOG (FALLBACK / MODAL) */}
      {isVictory && !levelVictoryData && (
        <div className="fixed inset-0 z-50 bg-black/80 backdrop-blur-sm flex items-center justify-center p-4 animate-fadeIn">
          <div className="w-full max-w-sm bg-gradient-to-b from-[#2e1d0f] to-[#120b06] border-2 border-[#d4af37] rounded-3xl p-6 shadow-2xl text-center relative overflow-hidden">
            <div className="w-16 h-16 mx-auto mb-3 rounded-full bg-amber-500/20 border border-amber-400 flex items-center justify-center text-3xl shadow-[0_0_25px_rgba(245,158,11,0.5)]">
              🪜
            </div>

            <h2 className="text-xl font-black text-yellow-300 tracking-wider uppercase mb-1">
              THOÁT HIỂM THÀNH CÔNG!
            </h2>
            <p className="text-xs text-amber-200/80 mb-4">{levelData.name}</p>

            {/* Stars Rating */}
            <div className="flex items-center justify-center gap-2 mb-4">
              {[1, 2, 3].map((starNum) => {
                const isEarned =
                  starNum === 1 ||
                  (starNum === 2 && turnsTaken <= levelData.parTurns + 4) ||
                  (starNum === 3 && turnsTaken <= levelData.parTurns);
                return (
                  <Star
                    key={`star-${starNum}`}
                    className={`w-8 h-8 transition-transform ${
                      isEarned
                        ? 'text-yellow-400 fill-yellow-400 drop-shadow-[0_0_8px_rgba(250,204,21,0.8)] scale-110'
                        : 'text-stone-700'
                    }`}
                  />
                );
              })}
            </div>

            {/* Performance Stats */}
            <div className="bg-black/40 border border-white/5 rounded-2xl p-3 mb-5 text-left text-xs space-y-1.5 font-mono">
              <div className="flex justify-between text-slate-300">
                <span>Số bước đã đi:</span>
                <span className="font-bold text-white">
                  {turnsTaken} bước (Chuẩn: {levelData.parTurns})
                </span>
              </div>
              <div className="flex justify-between text-slate-300">
                <span>Xác ướp tiêu diệt:</span>
                <span className="font-bold text-amber-300">+{mummiesDestroyedThisLevel}</span>
              </div>
              <div className="flex justify-between text-slate-300">
                <span>Lượt Revert còn lại:</span>
                <span className="font-bold text-emerald-400">
                  {revertCharges}/{MAX_REVERT_CHARGES}
                </span>
              </div>
              <div className="flex justify-between text-yellow-300 pt-1 border-t border-white/10 font-bold">
                <span>Tổng Điểm:</span>
                <span className="text-base">{score}</span>
              </div>
            </div>

            {/* Action Buttons */}
            <div className="flex gap-2">
              <button
                type="button"
                onClick={handleReset}
                className="flex-1 py-3 rounded-xl font-bold text-xs bg-[#3d2912] hover:bg-[#523819] text-amber-200 border border-[#7d5626] cursor-pointer"
              >
                Chơi Lại
              </button>
              <button
                type="button"
                onClick={handleNextLevel}
                className="flex-1 py-3 rounded-xl font-black text-xs uppercase bg-gradient-to-r from-amber-500 to-yellow-500 hover:from-amber-400 hover:to-yellow-400 text-stone-950 shadow-lg shadow-amber-500/40 cursor-pointer"
              >
                {mode === 'endless' ? `Tầng ${endlessFloor + 1} ➔` : 'Tầng Tiếp Theo ➔'}
              </button>
            </div>
          </div>
        </div>
      )}

      {/* GAME OVER DIALOG (With Revert Turn Charge Option) */}
      {isCaught && !isVictory && (
        <div className="fixed inset-0 z-50 bg-black/80 backdrop-blur-sm flex items-center justify-center p-4 animate-fadeIn">
          <div className="w-full max-w-sm bg-gradient-to-b from-[#2a100d] to-[#120504] border-2 border-rose-600 rounded-3xl p-6 shadow-2xl text-center">
            <div className="w-16 h-16 mx-auto mb-3 rounded-full bg-rose-600/20 border border-rose-500 flex items-center justify-center text-3xl shadow-[0_0_25px_rgba(225,29,72,0.5)]">
              💀
            </div>

            <h2 className="text-xl font-black text-rose-400 tracking-wider uppercase mb-1">
              BỊ XÁC ƯỚP BẮT GIỮ!
            </h2>
            <p className="text-xs text-rose-200/80 mb-4">{statusMessage || 'Bạn đã rơi vào móng vuốt của Pharaoh.'}</p>

            {/* Action Buttons: Allows Revert Turn if charges remain */}
            <div className="flex flex-col gap-2">
              {revertCharges > 0 && history.length > 0 && (
                <button
                  type="button"
                  onClick={handleRevertTurn}
                  className="w-full py-3 rounded-xl font-black text-xs uppercase bg-gradient-to-r from-amber-600 to-yellow-600 hover:from-amber-500 hover:to-yellow-500 text-white shadow-lg shadow-amber-600/40 flex items-center justify-center gap-2 cursor-pointer"
                >
                  <Undo2 className="w-4 h-4" />
                  <span>Dùng 1 Hoàn Tác (Còn {revertCharges}/{MAX_REVERT_CHARGES})</span>
                </button>
              )}

              <div className="flex gap-2">
                <button
                  type="button"
                  onClick={handleReset}
                  className="flex-1 py-3 rounded-xl font-black text-xs uppercase bg-gradient-to-r from-rose-600 to-amber-600 hover:from-rose-500 hover:to-amber-500 text-white shadow-lg shadow-rose-600/40 cursor-pointer"
                >
                  Thử Lại ↻
                </button>
              </div>
            </div>
          </div>
        </div>
      )}

      {/* PYRAMID LEVEL SELECTOR MODAL */}
      {showLevelSelect && (
        <div className="fixed inset-0 z-50 bg-black/85 backdrop-blur-md flex items-center justify-center p-3 animate-fadeIn">
          <div className="w-full max-w-lg bg-[#1a1209] border-2 border-[#8b6534] rounded-3xl p-5 shadow-2xl flex flex-col max-h-[85vh]">
            <div className="flex items-center justify-between pb-3 border-b border-white/10 mb-3">
              <div className="flex items-center gap-2">
                <span className="text-2xl">🏛️</span>
                <div>
                  <h3 className="text-base font-black text-yellow-300 uppercase">
                    BẢN ĐỒ KIM TỰ THÁP (15 PHÒNG MỘ)
                  </h3>
                  <p className="text-[10px] text-amber-200/70">
                    Chọn phòng hầm mộ đã mở khóa để bắt đầu thám hiểm
                  </p>
                </div>
              </div>
              <button
                type="button"
                onClick={() => setShowLevelSelect(false)}
                className="w-8 h-8 rounded-full bg-white/5 hover:bg-white/10 flex items-center justify-center text-slate-300 hover:text-white cursor-pointer"
              >
                ✕
              </button>
            </div>

            {/* Grid of 15 levels */}
            <div className="grid grid-cols-3 sm:grid-cols-5 gap-2.5 overflow-y-auto p-1 scrollbar-thin flex-1">
              {CAMPAIGN_LEVELS.map((lvl, idx) => {
                const isUnlocked = idx < unlockedLevels;
                const isCurrent = idx === currentLevelIdx;
                const starsEarned = starsMap[lvl.id] || 0;

                return (
                  <button
                    key={`lvl-select-${lvl.id}`}
                    type="button"
                    disabled={!isUnlocked}
                    onClick={() => {
                      setShowLevelSelect(false);
                      startCampaignLevel(idx);
                      soundEngine.play('click');
                    }}
                    className={`relative p-3 rounded-2xl border flex flex-col items-center justify-center gap-1 transition-all cursor-pointer ${
                      isCurrent
                        ? 'bg-amber-600/30 border-yellow-400 ring-2 ring-yellow-400 shadow-lg shadow-amber-500/30'
                        : isUnlocked
                        ? 'bg-[#281b0f] hover:bg-[#3b2817] border-[#7d5626] text-white'
                        : 'bg-black/40 border-white/5 text-stone-600 cursor-not-allowed opacity-50'
                    }`}
                  >
                    <span className="text-sm font-black font-mono">#{idx + 1}</span>
                    <span className="text-[9px] text-center line-clamp-1 text-amber-200/80">
                      {isUnlocked ? lvl.name.split(' ')[0] : 'Khóa'}
                    </span>

                    {/* Stars Earned */}
                    {isUnlocked ? (
                      <div className="flex gap-0.5 mt-0.5">
                        {[1, 2, 3].map((s) => (
                          <Star
                            key={`lvl-star-${idx}-${s}`}
                            className={`w-2.5 h-2.5 ${
                              s <= starsEarned
                                ? 'text-yellow-400 fill-yellow-400'
                                : 'text-stone-600'
                            }`}
                          />
                        ))}
                      </div>
                    ) : (
                      <span className="text-xs">🔒</span>
                    )}
                  </button>
                );
              })}
            </div>
          </div>
        </div>
      )}

      {/* SETTINGS MODAL: DISPLAY SETTINGS & ADAPTIVE AI */}
      <SettingsModal
        isOpen={showSettingsModal}
        onClose={() => setShowSettingsModal(false)}
        currentPaletteId={paletteId}
        onSelectPalette={(id) => {
          setPaletteId(id);
          mummyAudio.playKeyPickup();
        }}
        showWatermarks={showWatermarks}
        onToggleWatermarks={setShowWatermarks}
        showWarningPaths={showWarningPaths}
        onToggleWarningPaths={() => setShowWarningPaths((prev) => !prev)}
        screenShakeEnabled={screenShakeEnabled}
        onToggleScreenShake={setScreenShakeEnabled}
        adaptiveProfile={adaptiveProfile}
        onUpdateAdaptiveProfile={setAdaptiveProfile}
        currentLevelId={levelData.id || 1}
      />
    </div>
  );
};
