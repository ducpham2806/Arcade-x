import React, { useState, useEffect, useCallback, useRef, useMemo } from 'react';
import { AppModal } from '../../components/common/AppModal';
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
import { MummySprite } from '../../visuals/MummySprite';
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
  MummyAdaptiveProfile,
} from './adaptiveDifficulty';
import confetti from '../../utils/confetti';
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

/**
 * Ancient Egyptian Pharaoh's Tomb Splash Loading Screen (PopCap Mummy Maze Deluxe Inspired)
 */
const MummyEscapeSplashModal: React.FC<{ onDismiss: () => void }> = ({ onDismiss }) => {
  const [progress, setProgress] = useState(0);

  useEffect(() => {
    const start = Date.now();
    const duration = 1200;
    const interval = setInterval(() => {
      const elapsed = Date.now() - start;
      const pct = Math.min(100, Math.round((elapsed / duration) * 100));
      setProgress(pct);
      if (pct >= 100) clearInterval(interval);
    }, 40);
    return () => clearInterval(interval);
  }, []);

  return (
    <div className="fixed inset-0 z-50 bg-[#0d0804]/95 backdrop-blur-xl flex items-center justify-center p-4 select-none animate-fadeIn">
      <div className="relative w-full max-w-3xl rounded-3xl overflow-hidden border-2 border-[#d4a349] bg-gradient-to-b from-[#33210f] via-[#1c1208] to-[#0f0904] shadow-[0_25px_75px_rgba(0,0,0,0.9)] p-6 sm:p-8 flex flex-col items-center text-center">
        {/* Hieroglyphic Top Frieze */}
        <div className="text-xs text-amber-300/25 tracking-[0.5em] font-serif mb-2">
          𓂀 𓋹 𓆣 𓁹 𓊽 𓅃 𓆗 𓂀 𓋹 𓆣
        </div>

        <span className="inline-flex items-center gap-2 px-3.5 py-1 rounded-full text-[11px] font-serif font-extrabold tracking-widest uppercase bg-amber-500/15 text-yellow-300 border border-amber-400/40 mb-2">
          <span>𓋹</span> LĂNG MỘ ĐẠI ĐẾ PHARAOH · MUMMY MAZE HD <span>𓆣</span>
        </span>

        <h2 className="text-2xl sm:text-4xl font-serif font-black text-transparent bg-clip-text bg-gradient-to-r from-amber-100 via-yellow-300 to-amber-200 drop-shadow-[0_2px_12px_rgba(245,158,11,0.4)]">
          MUMMY ESCAPE · KIM TỰ THÁP CỔ ĐẠI
        </h2>
        <p className="text-xs sm:text-sm text-amber-100/75 max-w-xl mt-1">
          Bạn đi 1 bước, Xác Ướp Pharaoh đi 2 bước. Lợi dụng tường đá sa thạch, chìa khóa Ankh và bẫy lăng mộ để mở cổng thoát hiểm!
        </p>

        {/* Egyptian Tomb Confrontation Stage */}
        <div className="relative w-full max-w-xl h-48 sm:h-56 my-5 rounded-2xl border-2 border-[#c8963e]/60 bg-gradient-to-b from-[#3a2612] via-[#221509] to-[#120b04] overflow-hidden flex items-center justify-around px-4 shadow-inner">
          {/* Torch Sconces */}
          <div className="absolute top-3 left-4 w-8 h-8 opacity-90">
            <MummySprite kind="torch" />
          </div>
          <div className="absolute top-3 right-4 w-8 h-8 opacity-90">
            <MummySprite kind="torch" />
          </div>

          {/* Left: Explorer & Ankh Key */}
          <div className="relative z-10 flex items-end -space-x-3">
            <div className="w-28 h-28 sm:w-36 sm:h-36 drop-shadow-[0_10px_20px_rgba(245,158,11,0.45)]">
              <MummySprite kind="explorer" />
            </div>
            <div className="w-12 h-12 sm:w-14 sm:h-14 mb-4 animate-bounce">
              <MummySprite kind="key_yellow" />
            </div>
          </div>

          {/* Center Golden Scarab Emblem */}
          <div className="relative z-20 flex flex-col items-center">
            <div className="w-16 h-16 sm:w-20 sm:h-20 drop-shadow-[0_0_25px_rgba(250,204,21,0.85)] animate-pulse">
              <MummySprite kind="scarab" />
            </div>
          </div>

          {/* Right: Red Pharaoh Mummy, White Mummy & Scorpion */}
          <div className="relative z-10 flex items-end -space-x-5">
            <div className="w-16 h-16 sm:w-20 sm:h-20 mb-1">
              <MummySprite kind="scorpion" />
            </div>
            <div className="w-28 h-28 sm:w-36 sm:h-36 drop-shadow-[0_10px_20px_rgba(225,29,72,0.45)]">
              <MummySprite kind="red" />
            </div>
            <div className="w-20 h-20 sm:w-24 sm:h-24 opacity-90">
              <MummySprite kind="white" />
            </div>
          </div>
        </div>

        {/* Loading Bar & Enter Tomb Button */}
        <div className="w-full max-w-md space-y-3">
          <div className="w-full h-2.5 rounded-full bg-[#120b04] border border-amber-500/40 overflow-hidden p-0.5">
            <div
              className="h-full rounded-full bg-gradient-to-r from-amber-600 via-yellow-300 to-amber-500 shadow-[0_0_12px_rgba(245,158,11,0.8)] transition-all duration-75"
              style={{ width: `${progress}%` }}
            />
          </div>
          <div className="flex items-center justify-between text-[11px] text-amber-200/80 font-medium px-1">
            <span>
              {progress < 100
                ? 'Đang thắp đuốc lăng mộ & khởi động cơ quan đá...'
                : 'Cửa mật thất Kim Tự Tháp đã mở!'}
            </span>
            <span className="font-mono font-bold text-yellow-300">{progress}%</span>
          </div>

          <button
            type="button"
            onClick={onDismiss}
            className="w-full py-3 px-6 rounded-xl bg-gradient-to-r from-amber-500 via-yellow-400 to-amber-500 hover:from-amber-400 hover:to-yellow-300 text-stone-950 font-serif font-black text-sm tracking-wider uppercase shadow-[0_0_25px_rgba(245,158,11,0.5)] transition-all active:scale-98 cursor-pointer flex items-center justify-center gap-2 border border-yellow-200"
          >
            <span>𓋹</span>
            <span>Bước Vào Lăng Mộ Pharaoh</span>
            <span>𓆣</span>
          </button>
        </div>
      </div>
    </div>
  );
};

export const MummyEscapeGame: React.FC<MummyEscapeGameProps> = ({
  bridge,
  isPaused = false,
}) => {
  // Game Modes
  const [mode, setMode] = useState<GameMode>('campaign');
  const [currentLevelIdx, setCurrentLevelIdx] = useState<number>(0);
  const [endlessFloor, setEndlessFloor] = useState<number>(1);
  const [showSplash, setShowSplash] = useState<boolean>(() => {
    try {
      return sessionStorage.getItem('arcadex_mummy_splash_seen') !== '1';
    } catch {
      return false;
    }
  });

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

  useEffect(() => {
    if (hintCooldown <= 0) return;
    const interval = setInterval(() => {
      setHintCooldown((prev) => Math.max(0, prev - 1));
    }, 1000);
    return () => clearInterval(interval);
  }, [hintCooldown]);

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
      setStatusMessage(`Đã kiến tạo mật thất cổ đại (${chamber.gridSize?.cols || 6}×${chamber.gridSize?.rows || 6})!`);
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
            setStatusMessage('Ngọn đuốc đã tắt! Xác ướp đã tóm được bạn trong bóng tối.');
            mummyAudio.playPlayerDeath();
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

      setActiveHint(null);

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

      setTurnPhase('mummy_moving');

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

      let nextScore = score;
      let newTrapped = totalMummiesTrapped;
      let newTrappedThisLevel = mummiesDestroyedThisLevel;

      mummyAudio.playTurnStart();

      let hasMummyMovement = false;

      sim.events.forEach((ev) => {
        if (ev.type === 'mummy_step') {
          hasMummyMovement = true;
        } else if (ev.type === 'key_pickup') {
          mummyAudio.playKeyPickup();
          setStatusMessage(ev.message || 'Đã kích hoạt Chìa Khóa Ankh mở cổng đá!');
        } else if (ev.type === 'mummy_crush') {
          mummyAudio.playMummyCrush();
          nextScore += 200;
          newTrapped += 2;
          newTrappedThisLevel += 2;
          setStatusMessage(ev.message || 'Hai xác ướp đâm sầm vào nhau và vỡ vụn!');
          bridge.reportProgress('mummy-trapper', 1);

          setShakeEffect('crush');
          setShakeNonce((n) => n + 1);
        } else if (ev.type === 'trap_trigger') {
          mummyAudio.playTrapTrigger();
          nextScore += 150;
          newTrapped += 1;
          newTrappedThisLevel += 1;
          setStatusMessage(ev.message || 'Kẻ thù đã sa vào bẫy cổ đại!');
          bridge.reportProgress('mummy-trapper', 1);

          setShakeEffect('trap');
          setShakeNonce((n) => n + 1);
        }
      });

      if (hasMummyMovement) {
        mummyAudio.playMummyMove();
      }

      const nextTurns = turnsTaken + 1;

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

      if (sim.playerCaught) {
        setIsCaught(true);
        setTurnPhase('game_over');
        setShakeEffect('caught');
        setShakeNonce((n) => n + 1);
        setStatusMessage('Bạn đã bị xác ướp tóm gọn! Hãy dùng Bình Canopic Hoàn Tác hoặc Thử lại.');
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
      endlessFloor,
      saveProgress,
      bridge,
    ]
  );

  // Revert Turn Action
  const handleRevertTurn = useCallback(() => {
    if (isVictory) return;
    if (revertCharges <= 0) {
      soundEngine.play('hit');
      setStatusMessage('Đã cạn cả 3 Bình Canopic Hoàn Tác cho mật thất này!');
      return;
    }
    if (history.length === 0) {
      soundEngine.play('click');
      setStatusMessage('Bạn đang ở vị trí xuất phát, chưa thể hoàn tác.');
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
    setStatusMessage(`Đã kích hoạt Cát Thời Gian lùi 1 bước. (Còn ${remaining}/${MAX_REVERT_CHARGES} bình)`);
    setHistory((prev) => prev.slice(0, -1));
    setActiveHint(null);
    mummyAudio.playRevertTurn();
  }, [history, isVictory, revertCharges]);

  // Reset Chamber
  const handleReset = useCallback(() => {
    mummyAudio.playTurnStart();
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
    setStatusMessage(`𓂀 Cuộn Giấy Papyrus: ${suggestion.reason}`);
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

  const handleNextLevel = () => {
    mummyAudio.playTurnStart();
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
  }, [handleMove, handleRevertTurn, handleReset, handleRequestHint, isPaused, isVictory, isCaught]);

  const dismissSplash = () => {
    setShowSplash(false);
    try {
      sessionStorage.setItem('arcadex_mummy_splash_seen', '1');
    } catch {}
  };

  return (
    <div
      id="mummy-escape-root"
      className="arcade-game-surface flex flex-col items-center justify-start w-full h-full max-w-5xl mx-auto text-white select-none overflow-y-auto overflow-x-hidden p-1.5 sm:p-3 scrollbar-thin bg-[radial-gradient(circle_at_50%_10%,#3d2712_0%,#1c1107_55%,#0c0703_100%)] rounded-2xl"
    >
      {/* Splash Screen Modal */}
      {showSplash && <MummyEscapeSplashModal onDismiss={dismissSplash} />}

      {/* Ancient Egyptian Royal Temple Pylon Header */}
      <div className="w-full flex flex-col sm:flex-row items-center justify-between gap-2 mb-3 bg-gradient-to-r from-[#28190b] via-[#3c2712] to-[#28190b] border-2 border-[#d4a349] rounded-2xl p-2.5 sm:px-4 shadow-[0_10px_30px_rgba(0,0,0,0.75),inset_0_1px_0_rgba(254,240,138,0.35)] relative overflow-hidden">
        {/* Left Brand with Golden Scarab Crest */}
        <div className="flex items-center gap-3 relative z-10">
          <button
            type="button"
            onClick={() => setShowSplash(true)}
            title="Xem màn hình giới thiệu Lăng Mộ Pharaoh"
            className="w-11 h-11 rounded-xl bg-[#180f06] border-2 border-yellow-400/80 p-1 shadow-md hover:scale-105 transition-transform cursor-pointer shrink-0"
          >
            <MummySprite kind="scarab" />
          </button>
          <div>
            <div className="flex items-center gap-2">
              <h1 className="text-sm sm:text-lg font-serif font-black tracking-wider text-transparent bg-clip-text bg-gradient-to-r from-yellow-200 via-amber-300 to-yellow-200 uppercase drop-shadow">
                MUMMY ESCAPE · PHARAOH&apos;S TOMB
              </h1>
              <span className="px-2 py-0.5 rounded-full bg-amber-500/20 text-yellow-200 text-[10px] font-bold border border-amber-400/40">
                𓋹 Giải Đố Lăng Mộ
              </span>
            </div>
            <p className="text-[11px] text-[#e7cba0]">
              {mode === 'endless'
                ? `Mê Cung Bất Tận · Tầng ${endlessFloor}`
                : `${levelData.pyramidName} · Mật Thất ${currentLevelIdx + 1}/${CAMPAIGN_LEVELS.length} (${levelData.name})`}
            </p>
          </div>
        </div>

        {/* Mode Cartouche Selector Tabs */}
        <div className="flex items-center gap-1 bg-[#140c05]/85 p-1 rounded-xl border border-[#8b632d] overflow-x-auto max-w-full relative z-10">
          {(
            [
              ['campaign', '🏛️', 'Chiến Dịch'],
              ['turn_limit', '🎯', 'Giới Hạn Bước'],
              ['time_attack', '⏳', 'Ngọn Đuốc'],
              ['endless', '♾️', 'Vô Tận'],
            ] as const
          ).map(([mId, icon, label]) => (
            <button
              key={mId}
              type="button"
              onClick={() => handleSelectMode(mId)}
              className={`px-2.5 py-1.5 rounded-lg text-xs font-serif font-bold transition-all cursor-pointer flex items-center gap-1 ${
                mode === mId
                  ? 'bg-gradient-to-b from-amber-500 to-amber-700 text-stone-950 font-black shadow-md ring-1 ring-yellow-300'
                  : 'text-amber-200/75 hover:text-yellow-200 hover:bg-white/5'
              }`}
            >
              <span>{icon}</span>
              <span className="hidden xs:inline">{label}</span>
            </button>
          ))}

          {/* Adaptive Skill Cartouche */}
          <button
            type="button"
            onClick={() => setShowSettingsModal(true)}
            className="px-2 py-1.5 rounded-lg text-xs font-bold transition-all cursor-pointer flex items-center gap-1 bg-amber-500/15 hover:bg-amber-500/25 text-yellow-200 border border-amber-400/40 ml-1"
            title="Độ Khó Thích Ứng (Adaptive AI Difficulty)"
          >
            <Sparkles className="w-3.5 h-3.5 text-yellow-300" />
            <span className="hidden sm:inline">{getSkillTierInfo(adaptiveProfile.skillRating).title}</span>
          </button>

          {/* Settings Button */}
          <button
            id="btn-open-settings"
            type="button"
            onClick={() => setShowSettingsModal(true)}
            className="px-2.5 py-1.5 rounded-lg text-xs font-bold transition-all cursor-pointer flex items-center gap-1 bg-[#2b1b0c] hover:bg-[#3d2611] text-yellow-300 border border-amber-400/50 ml-1"
            title="Cài Đặt Lăng Mộ & Bảng Màu Đá"
          >
            <Settings className="w-3.5 h-3.5 text-yellow-400" />
            <span className="hidden sm:inline">Cài Đặt</span>
          </button>
        </div>
      </div>

      {/* Main Temple Layout: Left Carved Stone Obelisk Panel (4 cols) & Right Tomb Chamber (8 cols) */}
      <div className="w-full grid grid-cols-1 md:grid-cols-12 gap-3.5 items-start">
        {/* LEFT COLUMN: Egyptian Stone Stele Control Panel & Jeweled Scarab Compass */}
        <div className="md:col-span-4 flex flex-col gap-3 bg-gradient-to-b from-[#2c1d0e] via-[#1f1409] to-[#150c05] border-2 border-[#c8963e] rounded-2xl p-3.5 shadow-[0_16px_40px_rgba(0,0,0,0.8),inset_0_1px_0_rgba(254,240,138,0.28)] relative">
          {/* Score & Step Royal Cartouches */}
          <div className="grid grid-cols-2 gap-2.5">
            <div className="bg-[#160e06] border border-[#9a7032] rounded-xl p-2.5 text-center shadow-inner">
              <div className="text-[10px] font-serif font-bold text-amber-300/80 uppercase flex items-center justify-center gap-1">
                <Trophy className="w-3.5 h-3.5 text-yellow-400" />
                <span>Kho Báu Điểm</span>
              </div>
              <div className="text-xl font-black text-yellow-300 font-mono tracking-wider mt-0.5">
                {score.toLocaleString()}
              </div>
            </div>

            <div className="bg-[#160e06] border border-[#9a7032] rounded-xl p-2.5 text-center shadow-inner">
              <div className="text-[10px] font-serif font-bold text-amber-300/80 uppercase flex items-center justify-center gap-1">
                <Footprints className="w-3.5 h-3.5 text-amber-400" />
                <span>Bước / Chuẩn</span>
              </div>
              <div className="text-xl font-black text-amber-100 font-mono mt-0.5">
                {mode === 'turn_limit'
                  ? Math.max(0, (levelData.maxTurns || 25) - turnsTaken)
                  : `${turnsTaken} / ${levelData.parTurns}`}
              </div>
            </div>
          </div>

          {/* JEWELED GOLDEN SCARAB COMPASS D-PAD (Primary Interactive Controller) */}
          <div className="bg-gradient-to-b from-[#23160a] to-[#130b04] border-2 border-[#a87932] rounded-2xl p-3 flex flex-col items-center shadow-inner relative overflow-hidden">
            <div className="w-full flex items-center justify-between mb-2">
              <span className="text-[11px] font-serif font-black text-yellow-300 uppercase tracking-wider flex items-center gap-1">
                <span>𓆣</span> La Bàn Bọ Hung Vàng
              </span>
              <span className="text-[10px] text-amber-300/75 font-mono">WASD / Mũi tên</span>
            </div>

            {/* Circular Egyptian Compass Rose */}
            <div className="relative w-44 h-44 rounded-full bg-gradient-to-br from-[#473016] via-[#27190a] to-[#140c04] border-2 border-[#d4a349] shadow-[0_8px_24px_rgba(0,0,0,0.85),inset_0_0_16px_rgba(245,158,11,0.2)] flex items-center justify-center">
              {/* Outer Engraved Compass Ring */}
              <div className="pointer-events-none absolute inset-2 rounded-full border border-dashed border-amber-400/35" />

              {/* UP (North) */}
              <button
                id="dpad-up"
                type="button"
                onClick={() => handleMove('up')}
                aria-label="Lên"
                className="absolute top-1.5 left-1/2 -translate-x-1/2 w-13 h-12 rounded-t-2xl rounded-b-lg bg-gradient-to-b from-[#d4a349] via-[#9e6f21] to-[#63420e] hover:brightness-110 active:scale-92 border border-yellow-200/80 text-stone-950 flex flex-col items-center justify-center shadow-lg cursor-pointer transition-transform"
              >
                <ArrowUp className="w-5 h-5 stroke-[2.8]" />
                <span className="text-[8px] font-black uppercase leading-none">Bắc</span>
              </button>

              {/* DOWN (South) */}
              <button
                id="dpad-down"
                type="button"
                onClick={() => handleMove('down')}
                aria-label="Xuống"
                className="absolute bottom-1.5 left-1/2 -translate-x-1/2 w-13 h-12 rounded-b-2xl rounded-t-lg bg-gradient-to-b from-[#d4a349] via-[#9e6f21] to-[#63420e] hover:brightness-110 active:scale-92 border border-yellow-200/80 text-stone-950 flex flex-col items-center justify-center shadow-lg cursor-pointer transition-transform"
              >
                <span className="text-[8px] font-black uppercase leading-none">Nam</span>
                <ArrowDown className="w-5 h-5 stroke-[2.8]" />
              </button>

              {/* LEFT (West) */}
              <button
                id="dpad-left"
                type="button"
                onClick={() => handleMove('left')}
                aria-label="Trái"
                className="absolute left-1.5 top-1/2 -translate-y-1/2 w-12 h-13 rounded-l-2xl rounded-r-lg bg-gradient-to-b from-[#d4a349] via-[#9e6f21] to-[#63420e] hover:brightness-110 active:scale-92 border border-yellow-200/80 text-stone-950 flex items-center justify-center shadow-lg cursor-pointer transition-transform"
              >
                <ArrowLeft className="w-5 h-5 stroke-[2.8]" />
              </button>

              {/* RIGHT (East) */}
              <button
                id="dpad-right"
                type="button"
                onClick={() => handleMove('right')}
                aria-label="Phải"
                className="absolute right-1.5 top-1/2 -translate-y-1/2 w-12 h-13 rounded-r-2xl rounded-l-lg bg-gradient-to-b from-[#d4a349] via-[#9e6f21] to-[#63420e] hover:brightness-110 active:scale-92 border border-yellow-200/80 text-stone-950 flex items-center justify-center shadow-lg cursor-pointer transition-transform"
              >
                <ArrowRight className="w-5 h-5 stroke-[2.8]" />
              </button>

              {/* CENTER SCARAB BUTTON: WAIT / SKIP TURN */}
              <button
                id="dpad-wait"
                type="button"
                onClick={() => handleMove('wait')}
                disabled={isVictory || isCaught}
                aria-label="Đứng yên"
                title="Đứng Yên 1 Lượt (Space) để dụ xác ướp vào bẫy"
                className="relative z-10 w-15 h-15 rounded-full bg-gradient-to-b from-amber-600 to-amber-950 hover:brightness-110 active:scale-90 border-2 border-yellow-300 shadow-[0_0_16px_rgba(245,158,11,0.6)] flex flex-col items-center justify-center cursor-pointer transition-transform p-1"
              >
                <div className="w-8 h-8">
                  <MummySprite kind="scarab" />
                </div>
                <span className="text-[7px] font-black text-yellow-200 uppercase leading-none -mt-0.5">
                  Đứng Yên
                </span>
              </button>
            </div>
          </div>

          {/* Egyptian Relic Action Buttons: Canopic Revert, Papyrus Hint, Reset */}
          <div className="flex flex-col gap-2">
            {/* Canopic Jar Revert Turn Button */}
            <button
              id="btn-mummy-revert-turn"
              type="button"
              onClick={handleRevertTurn}
              disabled={history.length === 0 || isVictory || revertCharges <= 0}
              title="Hoàn Tác Lượt (Phím Z / U)"
              aria-label="Hoàn Tác Lượt"
              className={`w-full py-2.5 px-3 rounded-xl font-serif font-black text-xs uppercase tracking-wider flex items-center justify-between border-2 shadow-lg transition-all cursor-pointer ${
                history.length > 0 && !isVictory && revertCharges > 0
                  ? 'bg-gradient-to-r from-[#5c3d18] via-[#7c5321] to-[#5c3d18] hover:brightness-110 text-yellow-200 border-[#e0ab43] active:scale-[0.98]'
                  : 'bg-[#17110b] text-stone-500 border-stone-800 cursor-not-allowed opacity-60'
              }`}
            >
              <div className="flex items-center gap-2">
                <div className="w-6 h-6 shrink-0">
                  <MummySprite kind="canopic_jar" />
                </div>
                <span>Cát Thời Gian (Lùi Lượt)</span>
              </div>
              <span className="px-2 py-0.5 rounded-lg bg-black/60 border border-yellow-400/40 text-[11px] font-mono text-yellow-300">
                {revertCharges}/{MAX_REVERT_CHARGES}
              </span>
            </button>

            {/* Eye of Horus Safest Move Hint Button */}
            <button
              id="btn-mummy-hint-safest"
              type="button"
              onClick={handleRequestHint}
              disabled={isVictory || isCaught || isPaused || hintCooldown > 0}
              className={`w-full py-2.5 px-3 rounded-xl font-serif font-black text-xs uppercase tracking-wider flex items-center justify-between transition-all cursor-pointer shadow-md border-2 ${
                hintCooldown > 0
                  ? 'bg-[#17110b] text-stone-400 border-stone-800 cursor-not-allowed'
                  : 'bg-gradient-to-r from-amber-500 via-yellow-400 to-amber-500 hover:from-amber-400 hover:to-yellow-300 text-stone-950 border-yellow-200 shadow-[0_0_15px_rgba(250,204,21,0.35)] active:scale-[0.98]'
              }`}
            >
              <div className="flex items-center gap-2">
                <Lightbulb className={`w-4 h-4 ${hintCooldown === 0 ? 'animate-bounce' : ''}`} />
                <span>Soi Đường Mắt Horus (H)</span>
              </div>
              <span className="text-[10px] font-mono font-bold px-2 py-0.5 rounded-full bg-black/25">
                {hintCooldown > 0 ? `${hintCooldown}s` : 'SẴN SÀNG'}
              </span>
            </button>

            {/* Secondary Action Row: Wait, Reset, Map, Generator, Palette */}
            <div className="grid grid-cols-5 gap-1.5">
              <button
                id="btn-mummy-wait"
                type="button"
                onClick={() => handleMove('wait')}
                disabled={isVictory || isCaught}
                title="Đứng Yên (Bỏ Lượt / Space)"
                aria-label="Đứng Yên (Bỏ Lượt / Space)"
                className="py-2 rounded-xl bg-[#2a1b0d] hover:bg-[#3b2612] text-amber-200 border border-[#8b632d] flex flex-col items-center justify-center gap-0.5 cursor-pointer transition-all"
              >
                <Flame className="w-4 h-4 text-amber-400" />
                <span className="text-[9px] font-bold">Đứng Yên</span>
              </button>

              <button
                id="btn-mummy-reset"
                type="button"
                onClick={handleReset}
                title="Chơi Lại Mật Thất (Phím R)"
                aria-label="Chơi Lại (Reset)"
                className="py-2 rounded-xl bg-[#2a1b0d] hover:bg-[#3b2612] text-amber-200 border border-[#8b632d] flex flex-col items-center justify-center gap-0.5 cursor-pointer transition-all"
              >
                <RotateCcw className="w-4 h-4 text-amber-400" />
                <span className="text-[9px] font-bold">Chơi Lại</span>
              </button>

              <button
                id="btn-mummy-world-map"
                type="button"
                onClick={() => setShowLevelSelect(true)}
                title="Bản Đồ 15 Mật Thất Kim Tự Tháp"
                aria-label="Bản Đồ"
                className="py-2 rounded-xl bg-[#2a1b0d] hover:bg-[#3b2612] text-amber-200 border border-[#8b632d] flex flex-col items-center justify-center gap-0.5 cursor-pointer transition-all"
              >
                <Map className="w-4 h-4 text-yellow-400" />
                <span className="text-[9px] font-bold">Bản Đồ</span>
              </button>

              <button
                id="btn-mummy-procedural-gen"
                type="button"
                onClick={() => setShowProceduralModal(true)}
                title="Kiến Tạo Mật Thất Ngẫu Nhiên"
                aria-label="Tự Sinh"
                className="py-2 rounded-xl bg-[#2a1b0d] hover:bg-[#3b2612] text-amber-200 border border-[#8b632d] flex flex-col items-center justify-center gap-0.5 cursor-pointer transition-all"
              >
                <Wand2 className="w-4 h-4 text-yellow-300" />
                <span className="text-[9px] font-bold">Tự Sinh</span>
              </button>

              <button
                id="btn-mummy-open-display-settings"
                type="button"
                onClick={() => setShowSettingsModal(true)}
                title="Đổi Bảng Màu Đá Lăng Mộ"
                aria-label="Đổi Bảng Màu & Cài Đặt Hiển Thị"
                className="py-2 rounded-xl bg-[#2a1b0d] hover:bg-[#3b2612] text-amber-200 border border-[#8b632d] flex flex-col items-center justify-center gap-0.5 cursor-pointer transition-all"
              >
                <Palette className="w-4 h-4 text-amber-400" />
                <span className="text-[9px] font-bold">Màu Đá</span>
              </button>
            </div>
          </div>

          {/* Active Papyrus Scroll Hint Card */}
          {activeHint && !isVictory && !isCaught && (
            <div className="bg-gradient-to-b from-[#3d2812] to-[#211408] border-2 border-yellow-400 rounded-2xl p-3 shadow-xl animate-fadeIn">
              <div className="flex items-center justify-between pb-1.5 border-b border-amber-400/30 mb-2">
                <div className="flex items-center gap-1.5 text-yellow-300 text-xs font-serif font-black uppercase">
                  <Compass className="w-3.5 h-3.5 text-yellow-400 animate-spin" />
                  <span>Chỉ Dẫn Cuộn Giấy Papyrus</span>
                </div>
                <button
                  type="button"
                  onClick={() => setActiveHint(null)}
                  className="text-amber-200 hover:text-white text-xs px-1 cursor-pointer"
                >
                  ✕
                </button>
              </div>
              <p className="text-[11px] text-amber-100 leading-relaxed mb-2">{activeHint.reason}</p>
              <button
                type="button"
                onClick={() => handleMove(activeHint.bestDir)}
                className="w-full py-1.5 px-2 rounded-xl bg-yellow-400 hover:bg-yellow-300 text-stone-950 text-xs font-black flex items-center justify-center gap-1.5 transition-all cursor-pointer"
              >
                <span>Đi Theo Chỉ Dẫn Này Ngay</span>
                <span>➔</span>
              </button>
            </div>
          )}

          {/* Ancient Tomb Bestiary & Law Tablet */}
          <div className="bg-[#160e06]/90 border border-[#7d5626] rounded-xl p-2.5 text-[11px] text-amber-100/85 space-y-1.5">
            <div className="font-serif font-bold text-yellow-300 text-xs uppercase flex items-center justify-between border-b border-amber-500/20 pb-1">
              <span>📜 Luật Cổ Ngữ Pharaoh</span>
              <span className="text-[10px] text-amber-300 font-mono">1 Bước = 2 Bước Địch</span>
            </div>
            <div className="flex items-center gap-2">
              <div className="w-6 h-6 shrink-0">
                <MummySprite kind="white" />
              </div>
              <span>
                <strong className="text-cyan-300">Xác Ướp Trắng:</strong> Đi 2 bước, luôn ưu tiên kéo <strong>NGANG</strong> trước.
              </span>
            </div>
            <div className="flex items-center gap-2">
              <div className="w-6 h-6 shrink-0">
                <MummySprite kind="red" />
              </div>
              <span>
                <strong className="text-rose-300">Xác Ướp Pharaoh Đỏ:</strong> Đi 2 bước, luôn ưu tiên kéo <strong>DỌC</strong> trước.
              </span>
            </div>
            <div className="flex items-center gap-2">
              <div className="w-6 h-6 shrink-0">
                <MummySprite kind="scorpion" />
              </div>
              <span>
                <strong className="text-amber-300">Bọ Cạp Vàng:</strong> Đi 1 bước mỗi lượt, có thể kích hoạt bẫy.
              </span>
            </div>
          </div>
        </div>

        {/* RIGHT COLUMN: Turn Cartouche + Ancient Tomb Chamber Grid (8 cols) */}
        <div className="mummy-board-panel md:col-span-8 flex flex-col items-center justify-center bg-gradient-to-b from-[#24170b] via-[#180f06] to-[#110a04] border-2 border-[#c8963e] rounded-2xl p-2.5 sm:p-4 shadow-[0_20px_50px_rgba(0,0,0,0.85)] relative">
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

          {/* Papyrus Status Alert Banner */}
          {statusMessage && (
            <div className="w-full max-w-[520px] mb-2 px-3.5 py-2 rounded-xl bg-gradient-to-r from-amber-900/70 via-amber-800/70 to-amber-900/70 border border-yellow-400/50 text-yellow-100 text-xs font-semibold flex items-center justify-between animate-fadeIn shadow-md">
              <span>{statusMessage}</span>
              <button
                type="button"
                onClick={() => setStatusMessage('')}
                className="text-yellow-300 text-xs hover:text-white ml-2 cursor-pointer"
              >
                ✕
              </button>
            </div>
          )}

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
        </div>
      </div>

      {/* PROCEDURAL LEVEL GENERATOR MODAL */}
      {showProceduralModal && (
        <AppModal
          bare
          onClose={() => setShowProceduralModal(false)}
          label="Tạo mật thất ngẫu nhiên"
          closeOnBackdrop={false}
          className="bg-[#1d1309] border-2 border-[#d4af37] p-5 shadow-2xl"
        >
            <div className="flex items-center justify-between pb-3 border-b border-amber-600/30 mb-4 shrink-0">
              <div className="flex items-center gap-2.5">
                <div className="w-9 h-9">
                  <MummySprite kind="scarab" />
                </div>
                <div>
                  <h3 className="text-base font-serif font-black text-yellow-300 uppercase tracking-wide">
                    KIẾN TẠO MẬT THẤT NGẪU NHIÊN
                  </h3>
                  <p className="text-[10px] text-amber-200/70">
                    Tùy biến kích thước lăng mộ, kiến trúc cột đá và mật độ xác ướp
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

            <div className="flex-1 overflow-y-auto min-h-0 custom-scrollbar space-y-4 pr-1">
              <div>
                <label className="block text-xs font-bold text-amber-300 uppercase mb-1.5 flex items-center gap-1.5">
                  <Sliders className="w-3.5 h-3.5" />
                  <span>1. Kích Thước Mật Thất:</span>
                </label>
                <div className="grid grid-cols-4 gap-2">
                  {(['5x5', '6x6', '7x7', '8x8'] as MapSizePreset[]).map((size) => (
                    <button
                      key={`size-${size}`}
                      type="button"
                      onClick={() => setProcSizePreset(size)}
                      className={`py-2 px-1 rounded-xl text-xs font-black transition-all cursor-pointer border ${
                        procSizePreset === size
                          ? 'bg-amber-600 border-yellow-300 text-white shadow-md ring-2 ring-yellow-400'
                          : 'bg-[#281b0f] border-[#5d3f1c] text-stone-300 hover:bg-[#3b2817]'
                      }`}
                    >
                      {size}
                    </button>
                  ))}
                </div>
              </div>

              <div>
                <label className="block text-xs font-bold text-amber-300 uppercase mb-1.5 flex items-center gap-1.5">
                  <Map className="w-3.5 h-3.5" />
                  <span>2. Kiến Trúc Điện Thờ:</span>
                </label>
                <div className="grid grid-cols-2 sm:grid-cols-3 gap-2">
                  {[
                    { id: 'random', label: '🎲 Ngẫu Nhiên' },
                    { id: 'labyrinth', label: '🌀 Mê Cung Cổ' },
                    { id: 'pillars_of_karnak', label: '🏛️ Cột Đá Karnak' },
                    { id: 'gauntlet_of_traps', label: '🗡️ Đại Trận Bẫy' },
                    { id: 'royal_vault', label: '👑 Kho Báu Cổng Ankh' },
                    { id: 'scorpion_nest', label: '🦂 Tổ Bọ Cạp Vàng' },
                  ].map((arch) => (
                    <button
                      key={`arch-${arch.id}`}
                      type="button"
                      onClick={() => setProcArchetype(arch.id as any)}
                      className={`p-2 rounded-xl text-[11px] font-bold text-left transition-all cursor-pointer border ${
                        procArchetype === arch.id
                          ? 'bg-amber-600 border-yellow-300 text-white shadow-md'
                          : 'bg-[#281b0f] border-[#5d3f1c] text-stone-300 hover:bg-[#3b2817]'
                      }`}
                    >
                      {arch.label}
                    </button>
                  ))}
                </div>
              </div>

              <div className="grid grid-cols-2 gap-3">
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

              <div>
                <label className="block text-xs font-bold text-amber-300 uppercase mb-1.5 flex items-center justify-between">
                  <span>5. Mã Khắc Cổ Ngữ (Seed):</span>
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
                  placeholder="Ví dụ: PHARAOH-99, ANUBIS-77..."
                  className="w-full bg-[#120b06] border border-[#7d5626] rounded-xl px-3 py-2 text-xs text-yellow-200 font-mono focus:outline-none focus:border-yellow-400"
                />
              </div>

              <button
                type="button"
                onClick={() => handleGenerateCustomChamber()}
                className="w-full py-3.5 rounded-2xl font-serif font-black text-sm uppercase tracking-wider bg-gradient-to-r from-amber-500 via-yellow-400 to-amber-500 hover:from-amber-400 hover:to-yellow-300 text-stone-950 shadow-xl flex items-center justify-center gap-2 cursor-pointer transition-transform active:scale-[0.98]"
              >
                <Wand2 className="w-4 h-4 text-stone-950" />
                <span>MỞ CỬA MẬT THẤT MỚI</span>
              </button>
            </div>
        </AppModal>
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
            <div className="w-16 h-16 mx-auto mb-3 rounded-full bg-amber-500/20 border border-amber-400 p-2 shadow-[0_0_25px_rgba(245,158,11,0.5)]">
              <MummySprite kind="scarab" />
            </div>

            <h2 className="text-xl font-serif font-black text-yellow-300 tracking-wider uppercase mb-1">
              THOÁT HIỂM THÀNH CÔNG!
            </h2>
            <p className="text-xs text-amber-200/80 mb-4">{levelData.name}</p>

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
                className="flex-1 py-3 rounded-xl font-black text-xs uppercase bg-gradient-to-r from-amber-500 to-yellow-500 hover:from-amber-400 hover:to-yellow-400 text-stone-950 shadow-lg cursor-pointer"
              >
                {mode === 'endless' ? `Tầng ${endlessFloor + 1} ➔` : 'Mật Thất Tiếp ➔'}
              </button>
            </div>
          </div>
        </div>
      )}

      {/* GAME OVER DIALOG */}
      {isCaught && !isVictory && (
        <div className="fixed inset-0 z-50 bg-black/80 backdrop-blur-sm flex items-center justify-center p-4 animate-fadeIn">
          <div className="w-full max-w-sm bg-gradient-to-b from-[#2a100d] to-[#120504] border-2 border-rose-600 rounded-3xl p-6 shadow-2xl text-center">
            <div className="w-20 h-20 mx-auto mb-3 rounded-2xl bg-rose-950/60 border border-rose-500 p-1.5 shadow-[0_0_25px_rgba(225,29,72,0.5)]">
              <MummySprite kind="red" />
            </div>

            <h2 className="text-xl font-serif font-black text-rose-400 tracking-wider uppercase mb-1">
              LỜI NGUYỀN XÁC ƯỚP!
            </h2>
            <p className="text-xs text-rose-200/80 mb-4">
              {statusMessage || 'Bạn đã rơi vào móng vuốt của hộ vệ Pharaoh.'}
            </p>

            <div className="flex flex-col gap-2">
              {revertCharges > 0 && history.length > 0 && (
                <button
                  type="button"
                  onClick={handleRevertTurn}
                  className="w-full py-3 rounded-xl font-serif font-black text-xs uppercase bg-gradient-to-r from-amber-500 to-yellow-500 hover:from-amber-400 hover:to-yellow-400 text-stone-950 shadow-lg flex items-center justify-center gap-2 cursor-pointer"
                >
                  <Undo2 className="w-4 h-4" />
                  <span>Dùng Bình Canopic Lùi Lượt ({revertCharges}/{MAX_REVERT_CHARGES})</span>
                </button>
              )}

              <button
                type="button"
                onClick={handleReset}
                className="w-full py-3 rounded-xl font-serif font-black text-xs uppercase bg-gradient-to-r from-rose-700 to-amber-700 hover:from-rose-600 hover:to-amber-600 text-white shadow-lg cursor-pointer"
              >
                Khởi Động Lại Mật Thất ↻
              </button>
            </div>
          </div>
        </div>
      )}

      {/* PYRAMID LEVEL SELECTOR MODAL */}
      {showLevelSelect && (
        <AppModal
          bare
          onClose={() => setShowLevelSelect(false)}
          label="Bản đồ kim tự tháp"
          closeOnBackdrop={false}
          className="bg-[#1d1309] border-2 border-[#d4a349] p-5 shadow-2xl"
        >
            <div className="flex items-center justify-between pb-3 border-b border-amber-500/20 mb-3 shrink-0">
              <div className="flex items-center gap-2.5">
                <div className="w-9 h-9">
                  <MummySprite kind="exit_portal" />
                </div>
                <div>
                  <h3 className="text-base font-serif font-black text-yellow-300 uppercase">
                    BẢN ĐỒ KIM TỰ THÁP (15 MẬT THẤT)
                  </h3>
                  <p className="text-[10px] text-amber-200/70">
                    Chọn mật thất đã giải ấn để bắt đầu hành trình
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

            <div className="grid grid-cols-3 sm:grid-cols-5 lg:grid-cols-6 gap-2.5 content-start overflow-y-auto min-h-0 custom-scrollbar p-1 flex-1">
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
                      mummyAudio.playTurnStart();
                    }}
                    className={`relative p-3 rounded-2xl border flex flex-col items-center justify-center gap-1 transition-all cursor-pointer ${
                      isCurrent
                        ? 'bg-amber-600/35 border-yellow-400 ring-2 ring-yellow-400 shadow-lg'
                        : isUnlocked
                        ? 'bg-[#281b0f] hover:bg-[#3b2817] border-[#8b632d] text-white'
                        : 'bg-black/40 border-white/5 text-stone-400 cursor-not-allowed opacity-50'
                    }`}
                  >
                    <span className="text-sm font-serif font-black text-yellow-200">#{idx + 1}</span>
                    <span className="text-[9px] text-center line-clamp-1 text-amber-200/80">
                      {isUnlocked ? lvl.name.split(' ')[0] : 'Phong Ấn'}
                    </span>

                    {isUnlocked ? (
                      <div className="flex gap-0.5 mt-0.5">
                        {[1, 2, 3].map((s) => (
                          <Star
                            key={`lvl-star-${idx}-${s}`}
                            className={`w-2.5 h-2.5 ${
                              s <= starsEarned ? 'text-yellow-400 fill-yellow-400' : 'text-stone-600'
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
        </AppModal>
      )}

      {/* SETTINGS MODAL */}
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
