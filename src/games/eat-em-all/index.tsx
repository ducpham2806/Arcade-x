import React, { useState, useEffect, useRef, useCallback } from 'react';
import { GameComponentProps } from '../../types';
import { usePlayer } from '../../context/PlayerContext';
import {
  ElementMode,
  GameMode,
  Difficulty,
  FallingItem,
  GameStats,
  ActivePowerUps,
  BackgroundTheme,
  PowerUpType,
} from './types';
import { DIFFICULTY_PRESETS, STAGES_CONFIG, getComboTier, THEME_CONFIGS } from './config';
import { EatEmAllCanvas } from './EatEmAllCanvas';
import { eatAudio } from './audio';
import {
  Heart,
  Zap,
  Flame,
  Snowflake,
  Target,
  Clock,
  Infinity as InfinityIcon,
  Play,
  RotateCcw,
  Sparkles,
  ChevronRight,
  Shield,
  RefreshCw,
  Compass,
} from 'lucide-react';

const STORAGE_KEY_UNLOCKED_STAGE = 'arcadex_eat_em_all_unlocked_stage';
const STORAGE_KEY_STAGE_STARS = 'arcadex_eat_em_all_stage_stars';

export const EatEmAllGame: React.FC<GameComponentProps> = ({
  bridge,
  isPaused: externalPaused,
  isMuted,
  onGameOver,
}) => {
  // Game Configuration State
  const [gameMode, setGameMode] = useState<GameMode>('target');
  const { profile } = usePlayer();
  const [difficulty, setDifficulty] = useState<Difficulty>('normal');
  const [currentStageId, setCurrentStageId] = useState<number>(1);
  const [unlockedStage, setUnlockedStage] = useState<number>(() => {
    const saved = localStorage.getItem(STORAGE_KEY_UNLOCKED_STAGE);
    return saved ? parseInt(saved, 10) : 1;
  });
  const [stageStars, setStageStars] = useState<Record<number, number>>(() => {
    const saved = localStorage.getItem(STORAGE_KEY_STAGE_STARS);
    return saved ? JSON.parse(saved) : {};
  });

  // Show Stage Picker modal
  const [showStagePicker, setShowStagePicker] = useState<boolean>(false);

  // In-Game Play State
  const [isPlaying, setIsPlaying] = useState<boolean>(false);
  const [playerMode, setPlayerMode] = useState<ElementMode>('ice');
  const [score, setScore] = useState<number>(0);
  const [lives, setLives] = useState<number>(3);
  const [maxLives, setMaxLives] = useState<number>(3);

  // Time Attack Mode timer (60s)
  const [timeLeft, setTimeLeft] = useState<number>(60);

  // Target Mode progress
  const [targetProgress, setTargetProgress] = useState<number>(0);
  const [targetGoal, setTargetGoal] = useState<number>(20);
  const [collectedCounts, setCollectedCounts] = useState<Record<string, number>>({});

  // Elemental Fury system
  const [furyEnergy, setFuryEnergy] = useState<number>(0); // 0 to 100
  const [furyActive, setFuryActive] = useState<boolean>(false);
  const [furyTimer, setFuryTimer] = useState<number>(0);

  // Combo system
  const [combo, setCombo] = useState<number>(0);
  const [maxCombo, setMaxCombo] = useState<number>(0);
  const comboDecayTimerRef = useRef<number>(0);
  const [comboDecayRatio, setComboDecayRatio] = useState<number>(0);

  // Power-Up system
  const [activePowerUps, setActivePowerUps] = useState<ActivePowerUps>({
    shield: false,
    shieldHits: 0,
    magnetTimer: 0,
    speedTimer: 0,
    slowmoTimer: 0,
  });

  // Victory modal state
  const [showVictoryModal, setShowVictoryModal] = useState<boolean>(false);

  // Overall Match Stats
  const statsRef = useRef<GameStats>({
    score: 0,
    itemsEaten: 0,
    bombsAvoided: 0,
    furyActivatedCount: 0,
    maxCombo: 0,
    iceEaten: 0,
    fireEaten: 0,
    starsEaten: 0,
    gemsEaten: 0,
    heartsCollected: 0,
  });

  const currentStage = STAGES_CONFIG.find((s) => s.id === currentStageId) || STAGES_CONFIG[0];
  const diffPreset = DIFFICULTY_PRESETS[difficulty];

  // Game Intensity Profile settings applied globally
  const intensityMultiplier = profile?.gameIntensity === 'casual' ? 0.75 : profile?.gameIntensity === 'hardcore' ? 1.5 : 1;


  // Dynamic Background Theme calculation
  const currentTheme: BackgroundTheme = (() => {
    if (gameMode === 'target') {
      return currentStage.theme || 'day';
    }
    if (gameMode === 'endless') {
      if (score < 400) return 'day';
      if (score < 900) return 'sunset';
      if (score < 1600) return 'night';
      if (score < 2500) return 'space';
      return 'solar';
    }
    // Time Attack Mode
    if (timeLeft > 40) return 'day';
    if (timeLeft > 20) return 'sunset';
    return 'night';
  })();

  // Report space theme achievement when player enters space
  useEffect(() => {
    if (isPlaying && currentTheme === 'space') {
      bridge.reportProgress('ach-eat-space-theme', 1);
    }
  }, [isPlaying, currentTheme, bridge]);

  // Initialize Game Session
  const startNewGame = useCallback(
    (mode: GameMode = gameMode, stageId: number = currentStageId) => {
      const stage = STAGES_CONFIG.find((s) => s.id === stageId) || STAGES_CONFIG[0];
      const initialLives = mode === 'time' ? 99 : diffPreset.initialLives;

      setGameMode(mode);
      setCurrentStageId(stageId);
      setScore(0);
      setLives(initialLives);
      setMaxLives(initialLives);
      setTimeLeft(60);
      setFuryEnergy(0);
      setFuryActive(false);
      setFuryTimer(0);
      setCombo(0);
      setMaxCombo(0);
      comboDecayTimerRef.current = 0;
      setComboDecayRatio(0);
      setActivePowerUps({
        shield: false,
        shieldHits: 0,
        magnetTimer: 0,
        speedTimer: 0,
        slowmoTimer: 0,
      });
      setPlayerMode('ice');
      setShowVictoryModal(false);
      setShowStagePicker(false);

      if (mode === 'target') {
        setTargetProgress(0);
        setTargetGoal(stage.targetCount);
        setCollectedCounts({});
      }

      statsRef.current = {
        score: 0,
        itemsEaten: 0,
        bombsAvoided: 0,
        furyActivatedCount: 0,
        maxCombo: 0,
        iceEaten: 0,
        fireEaten: 0,
        starsEaten: 0,
        gemsEaten: 0,
        heartsCollected: 0,
      };

      setIsPlaying(true);
    },
    [gameMode, currentStageId, diffPreset]
  );

  // Switch element mode
  const handleSwitchMode = useCallback(() => {
    setPlayerMode((prev) => (prev === 'ice' ? 'fire' : 'ice'));
  }, []);

  // Collect a Power-Up buff
  const handleCollectPowerUp = useCallback(
    (type: PowerUpType) => {
      setActivePowerUps((prev) => {
        switch (type) {
          case 'shield':
            return { ...prev, shield: true, shieldHits: 1 };
          case 'magnet':
            return { ...prev, magnetTimer: 8.0 };
          case 'speed':
            return { ...prev, speedTimer: 8.0 };
          case 'slowmo':
            return { ...prev, slowmoTimer: 6.0 };
          default:
            return prev;
        }
      });
      bridge.reportProgress('ach-eat-powerup-collector', 1);
    },
    [bridge]
  );

  // Consume active shield protection
  const handleConsumeShield = useCallback(() => {
    setActivePowerUps((prev) => ({
      ...prev,
      shield: false,
      shieldHits: 0,
    }));
  }, []);

  // Stage Victory Handler
  const handleStageVictory = useCallback(() => {
    setIsPlaying(false);
    eatAudio.playWin();

    // Calculate stars: 3 stars if >= 2 lives, 2 stars if 1 life
    const stars = lives >= 2 ? 3 : 2;
    const newStars = { ...stageStars, [currentStageId]: Math.max(stageStars[currentStageId] || 0, stars) };
    setStageStars(newStars);
    try {
      localStorage.setItem(STORAGE_KEY_STAGE_STARS, JSON.stringify(newStars));
    } catch {
      // ignore
    }

    const nextStage = Math.min(12, Math.max(unlockedStage, currentStageId + 1));
    setUnlockedStage(nextStage);
    try {
      localStorage.setItem(STORAGE_KEY_UNLOCKED_STAGE, nextStage.toString());
    } catch {
      // ignore
    }

    // Grant bonus coins and exp
    const stageBonus = currentStageId * 50 + 100;
    bridge.grantCoins(stageBonus);
    bridge.grantExp(currentStageId * 30 + 50);

    if (currentStageId >= 5) {
      bridge.reportProgress('ach-eat-target-stage-5', 1);
    }

    setShowVictoryModal(true);
  }, [lives, stageStars, currentStageId, unlockedStage, bridge]);

  // Handle Successfully Eating an Item
  const handleEatItem = useCallback(
    (item: FallingItem) => {
      const comboTier = getComboTier(combo);
      const isFury = furyActive;
      const multiplier = isFury ? 10 : comboTier.multiplier;

      let basePoints = 20;
      let furyGain = 8;

      if (item.type === 'star') {
        basePoints = 50;
        furyGain = 14;
        statsRef.current.starsEaten++;
      } else if (item.type === 'gem') {
        basePoints = 100;
        furyGain = 22;
        statsRef.current.gemsEaten++;
      } else if (item.type === 'heart') {
        basePoints = 30;
        furyGain = 10;
        setLives((prev) => Math.min(maxLives, prev + 1));
        statsRef.current.heartsCollected++;
      } else if (item.type === 'fury_pill') {
        basePoints = 40;
        furyGain = 35;
      } else if (item.type === 'ice') {
        statsRef.current.iceEaten++;
      } else if (item.type === 'fire') {
        statsRef.current.fireEaten++;
      } else if (item.type === 'bomb' || item.type === 'poison') {
        // Devoured in Fury mode!
        basePoints = 200;
        furyGain = 0;
      }

      const pointsEarned = Math.round(basePoints * multiplier * diffPreset.scoreBonus);
      const nextScore = score + pointsEarned;
      statsRef.current.score = nextScore;
      setScore(nextScore);

      statsRef.current.itemsEaten++;

      // Reset combo decay timer to 3.5 seconds
      comboDecayTimerRef.current = 3.5;
      setComboDecayRatio(1.0);

      // Increment combo count & check tier sounds
      const nextCombo = combo + 1;
      setCombo(nextCombo);
      if (nextCombo > maxCombo) {
        setMaxCombo(nextCombo);
        statsRef.current.maxCombo = nextCombo;
      }

      // Trigger combo sound effects at tier boundaries
      if (nextCombo === 5 || nextCombo === 10 || nextCombo === 15 || nextCombo === 20 || nextCombo === 30) {
        const tier = getComboTier(nextCombo);
        eatAudio.playComboTier(tier.multiplier);
      }

      if (nextCombo >= 15) {
        bridge.reportProgress('ach-eat-combo-master', nextCombo);
      }

      // Charge Fury Bar if not active
      if (!isFury) {
        const nextEnergy = Math.min(100, furyEnergy + furyGain);
        if (nextEnergy >= 100) {
          setFuryEnergy(0);
          setFuryActive(true);
          setFuryTimer(8.0);
          eatAudio.playFuryStart();
          statsRef.current.furyActivatedCount++;
          bridge.reportProgress('ach-eat-fury-master', 1);
        } else {
          setFuryEnergy(nextEnergy);
        }
      }

      // Update Target Mode Progress
      if (gameMode === 'target') {
        setCollectedCounts((prev) => ({
          ...prev,
          [item.type]: (prev[item.type] || 0) + 1,
        }));

        const nextProgress = targetProgress + 1;
        setTargetProgress(nextProgress);
        if (nextProgress >= targetGoal) {
          handleStageVictory();
        }
      }

      // Report achievements progress
      bridge.reportProgress('ach-eat-first-game', 1);
    },
    [
      combo,
      furyActive,
      diffPreset.scoreBonus,
      score,
      maxCombo,
      furyEnergy,
      gameMode,
      targetProgress,
      targetGoal,
      maxLives,
      bridge,
      handleStageVictory,
    ]
  );

  // Handle Hitting a Hazard (Bomb or Mismatched Element)
  const handleHitHazard = useCallback(
    (item: FallingItem) => {
      // Break combo
      setCombo(0);
      comboDecayTimerRef.current = 0;
      setComboDecayRatio(0);

      if (gameMode === 'time') {
        // Time penalty in time attack mode instead of death
        setTimeLeft((prev) => Math.max(0, prev - 4));
        setScore((prev) => {
          const next = Math.max(0, prev - 50);
          statsRef.current.score = next;
          return next;
        });
        return;
      }

      const nextLives = Math.max(0, lives - 1);
      setLives(nextLives);

      if (nextLives <= 0) {
        // Game Over!
        setIsPlaying(false);
        eatAudio.playHurt();
        onGameOver(statsRef.current.score, {
          itemsEaten: statsRef.current.itemsEaten,
          furyActivated: statsRef.current.furyActivatedCount,
          maxCombo: statsRef.current.maxCombo,
        });

        // Report endless score achievement if applicable
        if (gameMode === 'endless') {
          bridge.reportProgress('ach-eat-endless-1500', statsRef.current.score, true);
        }
      }
    },
    [gameMode, lives, onGameOver, bridge]
  );

  // Timer loop for Time Attack, Fury, Combo Decay, and Power-Up durations
  useEffect(() => {
    if (!isPlaying || externalPaused) return;

    const timer = setInterval(() => {
      // Countdown for Time Attack Mode
      if (gameMode === 'time') {
        setTimeLeft((prev) => {
          const next = Math.max(0, prev - 0.1);
          return Number(next.toFixed(1));
        });
      }

      // Countdown for Fury State
      if (furyActive) {
        setFuryTimer((prev) => {
          const next = Math.max(0, prev - 0.1);
          return Number(next.toFixed(1));
        });
      }

      // Countdown for Combo Decay (3.5s window per correct eat)
      if (comboDecayTimerRef.current > 0) {
        comboDecayTimerRef.current = Math.max(0, comboDecayTimerRef.current - 0.1);
        setComboDecayRatio(comboDecayTimerRef.current / 3.5);
        if (comboDecayTimerRef.current <= 0) {
          setCombo(0);
        }
      }

      // Countdown for Active Power-Ups
      setActivePowerUps((prev) => {
        if (prev.magnetTimer <= 0 && prev.speedTimer <= 0 && prev.slowmoTimer <= 0) {
          return prev;
        }
        return {
          ...prev,
          magnetTimer: Math.max(0, prev.magnetTimer - 0.1),
          speedTimer: Math.max(0, prev.speedTimer - 0.1),
          slowmoTimer: Math.max(0, prev.slowmoTimer - 0.1),
        };
      });
    }, 100);

    return () => clearInterval(timer);
  }, [isPlaying, externalPaused, gameMode, furyActive]);

  // Handle Fury expiration
  useEffect(() => {
    if (furyActive && furyTimer <= 0) {
      setFuryActive(false);
      setFuryEnergy(0);
    }
  }, [furyActive, furyTimer]);

  // Handle Time Attack expiration
  useEffect(() => {
    if (isPlaying && gameMode === 'time' && timeLeft <= 0) {
      setIsPlaying(false);
      onGameOver(statsRef.current.score, {
        itemsEaten: statsRef.current.itemsEaten,
        furyActivated: statsRef.current.furyActivatedCount,
        maxCombo: statsRef.current.maxCombo,
      });
    }
  }, [isPlaying, gameMode, timeLeft, onGameOver]);

  // Speed calculation based on mode and difficulty
  const effectiveSpeedMultiplier =
    diffPreset.speedMultiplier * intensityMultiplier *
    (gameMode === 'target'
      ? currentStage.fallSpeedMultiplier
      : gameMode === 'endless'
      ? 1 + Math.min(2.5, score / 600)
      : 1.25);

  const effectiveSpawnInterval = Math.max(
    380,
    (diffPreset.spawnIntervalMs / intensityMultiplier) *
      (gameMode === 'target'
        ? currentStage.spawnIntervalMs / 1000
        : gameMode === 'endless'
        ? Math.max(0.5, 1 - score / 3000)
        : 0.8)
  );

  const activeComboTier = getComboTier(combo);
  const currentThemeConfig = THEME_CONFIGS[currentTheme] || THEME_CONFIGS.day;

  // Check if any power-up is active
  const hasActivePowerUp =
    activePowerUps.shield ||
    activePowerUps.magnetTimer > 0 ||
    activePowerUps.speedTimer > 0 ||
    activePowerUps.slowmoTimer > 0;

  return (
    <div className="relative w-full h-full flex flex-col items-center justify-between p-1 sm:p-2 text-white select-none overflow-hidden max-w-4xl mx-auto">
      {/* Top HUD Bar */}
      <div className="w-full bg-[#0e0e16]/95 backdrop-blur-md border border-white/10 rounded-xl sm:rounded-2xl px-2.5 py-1.5 sm:px-3 sm:py-2 mb-1 flex items-center justify-between shadow-xl gap-2 z-10 shrink-0">
        {/* Left: Score & Combo Multiplier Tag */}
        <div className="flex items-center gap-2 sm:gap-3 min-w-0">
          <div className="flex flex-col">
            <span className="text-[9px] sm:text-xs font-bold text-slate-400 uppercase tracking-widest flex items-center gap-1">
              <span>ĐIỂM SỐ</span>
              {combo > 1 && (
                <span
                  className="px-1.5 py-0.2 text-[9px] rounded font-mono font-black"
                  style={{ backgroundColor: `${activeComboTier.color}33`, color: activeComboTier.color }}
                >
                  x{activeComboTier.multiplier}
                </span>
              )}
            </span>
            <span className="text-base sm:text-2xl font-black font-mono text-yellow-400 tracking-tight leading-none mt-0.5">
              {score.toLocaleString()}
            </span>
          </div>

          {/* Theme Indicator Tag */}
          <div className="hidden md:flex items-center gap-1.5 px-2.5 py-1 rounded-lg bg-white/5 border border-white/10 text-xs font-bold text-slate-300">
            <span>{currentThemeConfig.icon}</span>
            <span className="truncate max-w-[90px]">{currentThemeConfig.name}</span>
          </div>
        </div>

        {/* Center: Current Element Indicator (With Click / Space to switch) */}
        <div className="flex flex-col items-center">
          <button
            id="btn-switch-element-hud"
            type="button"
            onClick={handleSwitchMode}
            className={`px-3 sm:px-4 py-1 sm:py-1.5 rounded-xl border text-xs sm:text-sm font-black flex items-center gap-1.5 transition-all shadow-md active:scale-95 cursor-pointer ${
              playerMode === 'ice'
                ? 'bg-cyan-950/90 border-cyan-400 text-cyan-300 shadow-cyan-500/20'
                : 'bg-orange-950/90 border-orange-500 text-orange-300 shadow-orange-500/20'
            }`}
            title="Nhấn để đổi hệ BĂNG / LỬA (Phím Space)"
          >
            {playerMode === 'ice' ? (
              <>
                <Snowflake className="w-4 h-4 text-cyan-300 animate-spin-slow" />
                <span>BĂNG ❄</span>
              </>
            ) : (
              <>
                <Flame className="w-4 h-4 text-orange-400 animate-bounce" />
                <span>LỬA 🔥</span>
              </>
            )}
            <span className="text-[9px] opacity-70 bg-white/10 px-1 py-0.5 rounded font-mono hidden sm:inline">
              [SPACE]
            </span>
          </button>
        </div>

        {/* Right: Lives or Time Left */}
        <div className="flex items-center gap-2">
          {gameMode === 'time' ? (
            <div className="flex flex-col items-end">
              <span className="text-[9px] sm:text-[10px] font-bold text-slate-400 uppercase tracking-wider">
                THỜI GIAN
              </span>
              <div
                className={`flex items-center gap-1 font-mono text-sm sm:text-xl font-black ${
                  timeLeft <= 10 ? 'text-rose-500 animate-pulse' : 'text-emerald-400'
                }`}
              >
                <Clock className="w-3.5 h-3.5 sm:w-4 sm:h-4" />
                <span>{timeLeft}s</span>
              </div>
            </div>
          ) : (
            <div className="flex flex-col items-end">
              <span className="text-[9px] sm:text-[10px] font-bold text-slate-400 uppercase tracking-wider">
                MẠNG
              </span>
              <div className="flex items-center gap-0.5 sm:gap-1 text-rose-500">
                {Array.from({ length: maxLives }).map((_, i) => (
                  <Heart
                    key={i}
                    className={`w-3.5 h-3.5 sm:w-5 sm:h-5 transition-all ${
                      i < lives ? 'fill-rose-500 text-rose-500 scale-100' : 'text-slate-600 scale-90 opacity-40'
                    }`}
                  />
                ))}
              </div>
            </div>
          )}
        </div>
      </div>

      {/* Active Power-Ups Ribbon */}
      {hasActivePowerUp && (
        <div className="w-full bg-[#11111e]/90 border border-white/10 rounded-lg sm:rounded-xl px-2 py-1 mb-1 flex items-center justify-center gap-2 sm:gap-3 z-10 shrink-0 overflow-x-auto">
          {activePowerUps.shield && (
            <div className="flex items-center gap-1 px-2 py-0.5 rounded bg-cyan-950/80 border border-cyan-400 text-cyan-300 text-[10px] sm:text-[11px] font-bold shadow-[0_0_10px_rgba(6,182,212,0.4)] animate-pulse shrink-0">
              <Shield className="w-3 h-3 text-cyan-300" />
              <span>KHIÊN</span>
            </div>
          )}

          {activePowerUps.magnetTimer > 0 && (
            <div className="flex items-center gap-1 px-2 py-0.5 rounded bg-purple-950/80 border border-purple-400 text-purple-300 text-[10px] sm:text-[11px] font-bold shadow-[0_0_10px_rgba(168,85,247,0.4)] shrink-0">
              <span>🧲</span>
              <span>HÚT: {activePowerUps.magnetTimer.toFixed(1)}s</span>
            </div>
          )}

          {activePowerUps.speedTimer > 0 && (
            <div className="flex items-center gap-1 px-2 py-0.5 rounded bg-amber-950/80 border border-amber-400 text-amber-300 text-[10px] sm:text-[11px] font-bold shadow-[0_0_10px_rgba(245,158,11,0.4)] shrink-0">
              <Zap className="w-3 h-3 text-amber-300" />
              <span>TỐC ĐỘ: {activePowerUps.speedTimer.toFixed(1)}s</span>
            </div>
          )}

          {activePowerUps.slowmoTimer > 0 && (
            <div className="flex items-center gap-1 px-2 py-0.5 rounded bg-sky-950/80 border border-sky-400 text-sky-300 text-[10px] sm:text-[11px] font-bold shadow-[0_0_10px_rgba(56,189,248,0.4)] shrink-0">
              <Snowflake className="w-3 h-3 text-sky-300" />
              <span>CHẬM: {activePowerUps.slowmoTimer.toFixed(1)}s</span>
            </div>
          )}
        </div>
      )}

      {/* Target Mode Specific: Progress Bar to Finish Stage */}
      {gameMode === 'target' && (
        <div className="w-full bg-[#11111c] border border-white/10 rounded-lg sm:rounded-xl px-2.5 py-1 mb-1 shadow-md shrink-0">
          <div className="flex items-center justify-between text-[11px] sm:text-xs mb-0.5">
            <span className="font-bold text-slate-300 flex items-center gap-1 truncate">
              <Target className="w-3 h-3 text-indigo-400" />
              <span className="truncate">{currentStage.title}</span>
            </span>
            <span className="font-mono font-bold text-yellow-400 shrink-0">
              {targetProgress} / {targetGoal} ({Math.min(100, Math.round((targetProgress / targetGoal) * 100))}%)
            </span>
          </div>
          <div className="w-full h-1.5 sm:h-2 bg-black/60 rounded-full overflow-hidden border border-white/10 relative">
            <div
              className="h-full bg-gradient-to-r from-cyan-500 via-indigo-500 to-amber-400 transition-all duration-300 shadow-[0_0_12px_rgba(99,102,241,0.6)]"
              style={{ width: `${Math.min(100, (targetProgress / targetGoal) * 100)}%` }}
            />
          </div>
        </div>
      )}

      {/* Canvas Game Arena */}
      <div className="relative w-full flex-1 min-h-[460px] sm:min-h-[520px] flex items-center justify-center">
        <EatEmAllCanvas
          playerMode={playerMode}
          onSwitchMode={handleSwitchMode}
          isPaused={externalPaused || !isPlaying}
          isGameOver={!isPlaying}
          isMuted={isMuted}
          lives={lives}
          furyActive={furyActive}
          speedMultiplier={effectiveSpeedMultiplier}
          spawnIntervalMs={effectiveSpawnInterval}
          bombChance={diffPreset.bombRate}
          poisonChance={0.06}
          powerUpChance={currentStage.powerUpChance || 0.14}
          combo={combo}
          comboMultiplier={activeComboTier.multiplier}
          comboDecayRatio={comboDecayRatio}
          activePowerUps={activePowerUps}
          currentTheme={currentTheme}
          onEatItem={handleEatItem}
          onHitHazard={handleHitHazard}
          onCollectPowerUp={handleCollectPowerUp}
          onConsumeShield={handleConsumeShield}
          skinId={bridge.getSkin ? bridge.getSkin('eat-em-all') : 'default'}
        />

        {/* Start / Mode Selector Overlay if not playing */}
        {!isPlaying && !showVictoryModal && (
          <div className="absolute inset-0 bg-black/85 backdrop-blur-md rounded-2xl flex flex-col items-center justify-center p-4 z-30 text-center animate-in fade-in duration-200">
            <div className="w-16 h-16 rounded-2xl bg-gradient-to-br from-cyan-500 to-orange-500 p-0.5 shadow-2xl mb-3">
              <div className="w-full h-full bg-[#0c0c14] rounded-2xl flex items-center justify-center text-3xl">
                😋
              </div>
            </div>

            <h2 className="text-2xl sm:text-3xl font-black text-white font-display tracking-wide mb-1">
              EAT 'EM ALL: ARCADE
            </h2>
            <p className="text-xs sm:text-sm text-slate-400 max-w-md mb-3 leading-relaxed">
              Trượt để nuốt chửng quả cầu năng lượng! Đổi hệ Băng ❄ / Lửa 🔥 để ăn đúng vật phẩm, nhặt vật phẩm bổ trợ
              (Khiên 🛡️, Nam châm 🧲, Tăng tốc ⚡, Làm chậm ❄️) và kích hoạt bão điểm <strong>ELEMENTAL FURY x10</strong>!
            </p>

            {/* Mode Selectors */}
            <div className="flex items-center gap-2 mb-3">
              <button
                type="button"
                onClick={() => setGameMode('target')}
                className={`px-3 py-2 rounded-xl text-xs font-bold border transition-all flex items-center gap-1.5 cursor-pointer ${
                  gameMode === 'target'
                    ? 'bg-indigo-600 border-indigo-400 text-white shadow-lg shadow-indigo-600/30'
                    : 'bg-[#151522] border-white/10 text-slate-400 hover:text-white'
                }`}
              >
                <Target className="w-3.5 h-3.5" />
                <span>Chiến Dịch (12 Màn)</span>
              </button>

              <button
                type="button"
                onClick={() => setGameMode('endless')}
                className={`px-3 py-2 rounded-xl text-xs font-bold border transition-all flex items-center gap-1.5 cursor-pointer ${
                  gameMode === 'endless'
                    ? 'bg-cyan-600 border-cyan-400 text-white shadow-lg shadow-cyan-600/30'
                    : 'bg-[#151522] border-white/10 text-slate-400 hover:text-white'
                }`}
              >
                <InfinityIcon className="w-3.5 h-3.5" />
                <span>Sinh Tồn Vô Tận</span>
              </button>

              <button
                type="button"
                onClick={() => setGameMode('time')}
                className={`px-3 py-2 rounded-xl text-xs font-bold border transition-all flex items-center gap-1.5 cursor-pointer ${
                  gameMode === 'time'
                    ? 'bg-amber-600 border-amber-400 text-white shadow-lg shadow-amber-600/30'
                    : 'bg-[#151522] border-white/10 text-slate-400 hover:text-white'
                }`}
              >
                <Clock className="w-3.5 h-3.5" />
                <span>Thời Gian 60s</span>
              </button>
            </div>

            {/* Difficulty Selectors */}
            <div className="flex items-center gap-1.5 mb-3">
              <span className="text-[11px] text-slate-400 mr-1 font-bold">Độ khó:</span>
              {(['easy', 'normal', 'hard', 'insane'] as Difficulty[]).map((d) => {
                const conf = DIFFICULTY_PRESETS[d];
                return (
                  <button
                    key={d}
                    type="button"
                    onClick={() => setDifficulty(d)}
                    className={`px-2.5 py-1 rounded-lg text-xs font-bold border transition-all cursor-pointer ${
                      difficulty === d ? conf.color : 'bg-white/5 border-white/5 text-slate-400'
                    }`}
                  >
                    {conf.label}
                  </button>
                );
              })}
            </div>

            {/* Stage Selector Button for Target Mode */}
            {gameMode === 'target' && (
              <button
                type="button"
                onClick={() => setShowStagePicker(true)}
                className="text-xs text-indigo-400 hover:text-indigo-300 font-semibold underline mb-3 flex items-center gap-1 cursor-pointer"
              >
                <span>Chọn màn chơi (Đang ở: {currentStage.title})</span>
                <ChevronRight className="w-3.5 h-3.5" />
              </button>
            )}

            {/* Start Button */}
            <button
              id="btn-start-eat-em-all"
              type="button"
              onClick={() => startNewGame()}
              className="px-8 py-3 rounded-2xl bg-gradient-to-r from-cyan-500 via-indigo-600 to-orange-500 hover:opacity-95 active:scale-95 text-white font-black text-sm uppercase tracking-wider shadow-xl shadow-indigo-500/25 flex items-center gap-2 transition-all cursor-pointer"
            >
              <Play className="w-5 h-5 fill-white" />
              <span>BẮT ĐẦU CHƠI NGAY</span>
            </button>
          </div>
        )}

        {/* Stage Victory Modal */}
        {showVictoryModal && (
          <div className="absolute inset-0 bg-black/90 backdrop-blur-md rounded-2xl flex flex-col items-center justify-center p-4 z-40 text-center animate-in zoom-in-95 duration-200">
            <div className="w-16 h-16 rounded-2xl bg-amber-500/20 border border-amber-500/40 text-amber-400 flex items-center justify-center text-3xl shadow-xl shadow-amber-500/20 mb-3">
              👑
            </div>

            <h3 className="text-2xl font-black text-white font-display mb-1">HOÀN THÀNH MÀN CHƠI!</h3>
            <p className="text-xs text-slate-300 mb-3">{currentStage.title}</p>

            <div className="flex items-center gap-1 text-2xl text-amber-400 mb-4">
              {'⭐'.repeat(stageStars[currentStageId] || 3)}
            </div>

            <div className="grid grid-cols-2 gap-3 max-w-xs w-full bg-[#12121a] border border-white/10 rounded-xl p-3 mb-4 text-xs">
              <div>
                <span className="text-slate-400 block text-[10px]">Điểm màn này:</span>
                <strong className="text-yellow-400 font-mono text-sm">{score.toLocaleString()}</strong>
              </div>
              <div>
                <span className="text-slate-400 block text-[10px]">Vật phẩm ăn:</span>
                <strong className="text-white font-mono text-sm">{targetProgress} quả</strong>
              </div>
            </div>

            <div className="flex items-center gap-3">
              <button
                type="button"
                onClick={() => startNewGame('target', currentStageId)}
                className="px-4 py-2.5 rounded-xl bg-white/10 hover:bg-white/20 active:scale-95 text-xs font-bold flex items-center gap-1.5 transition-all cursor-pointer"
              >
                <RotateCcw className="w-3.5 h-3.5" />
                <span>Chơi Lại Màn Này</span>
              </button>

              {currentStageId < 12 ? (
                <button
                  type="button"
                  onClick={() => startNewGame('target', currentStageId + 1)}
                  className="px-5 py-2.5 rounded-xl bg-gradient-to-r from-emerald-500 to-teal-600 hover:opacity-95 active:scale-95 text-white text-xs font-black flex items-center gap-1.5 shadow-lg shadow-emerald-600/30 transition-all cursor-pointer"
                >
                  <span>Màn Kế Tiếp</span>
                  <ChevronRight className="w-4 h-4" />
                </button>
              ) : (
                <button
                  type="button"
                  onClick={() => setShowStagePicker(true)}
                  className="px-5 py-2.5 rounded-xl bg-indigo-600 hover:bg-indigo-500 text-white text-xs font-bold cursor-pointer"
                >
                  Chọn màn khác
                </button>
              )}
            </div>
          </div>
        )}

        {/* Stage Picker Modal */}
        {showStagePicker && (
          <div className="absolute inset-0 bg-black/90 backdrop-blur-md rounded-2xl flex flex-col p-4 z-40 overflow-y-auto animate-in fade-in duration-200">
            <div className="flex items-center justify-between pb-3 border-b border-white/10 mb-3">
              <h3 className="text-sm sm:text-base font-black text-white flex items-center gap-2">
                <Target className="w-4 h-4 text-indigo-400" />
                <span>CHỌN MÀN CHIẾN DỊCH (1 - 12)</span>
              </h3>
              <button
                type="button"
                onClick={() => setShowStagePicker(false)}
                className="text-xs text-slate-400 hover:text-white px-2 py-1 rounded bg-white/5 cursor-pointer"
              >
                Đóng
              </button>
            </div>

            <div className="grid grid-cols-2 sm:grid-cols-3 gap-2.5 overflow-y-auto pr-1">
              {STAGES_CONFIG.map((stage) => {
                const isUnlocked = stage.id <= unlockedStage;
                const stars = stageStars[stage.id] || 0;

                return (
                  <button
                    key={stage.id}
                    type="button"
                    disabled={!isUnlocked}
                    onClick={() => startNewGame('target', stage.id)}
                    className={`p-3 rounded-xl border text-left transition-all relative overflow-hidden ${
                      isUnlocked
                        ? stage.id === currentStageId
                          ? 'bg-indigo-950/70 border-indigo-400 ring-1 ring-indigo-400/50 cursor-pointer'
                          : 'bg-[#12121a] border-white/10 hover:border-white/30 cursor-pointer'
                        : 'bg-[#0a0a0f] border-white/5 opacity-50 cursor-not-allowed'
                    }`}
                  >
                    <div className="flex items-center justify-between mb-1">
                      <span className="text-xs font-bold text-white">Màn {stage.id}</span>
                      {stars > 0 && <span className="text-[10px] text-amber-400">{'⭐'.repeat(stars)}</span>}
                    </div>
                    <p className="text-[11px] text-slate-300 font-medium truncate">
                      {stage.title.split(': ')[1] || stage.title}
                    </p>
                    <span className="text-[10px] text-slate-500 mt-1 block">
                      Mục tiêu: {stage.targetCount} quả • {THEME_CONFIGS[stage.theme || 'day'].icon}
                    </span>
                  </button>
                );
              })}
            </div>
          </div>
        )}
      </div>

      {/* Bottom Bar: ELEMENTAL FURY Gauge & Switch Mode Button */}
      <div className="w-full bg-[#0d0d14]/90 backdrop-blur-md border border-white/10 rounded-xl sm:rounded-2xl p-2 sm:p-2.5 mt-1 flex flex-col gap-1.5 shadow-xl shrink-0">
        <div className="flex items-center justify-between text-xs">
          <span className="font-black text-[11px] sm:text-xs tracking-wider uppercase flex items-center gap-1 text-amber-400">
            <Zap className={`w-3.5 h-3.5 ${furyActive ? 'animate-bounce text-yellow-300' : ''}`} />
            <span>ELEMENTAL FURY</span>
            {furyActive && (
              <span className="ml-1 px-1.5 py-0.5 rounded bg-yellow-400 text-black font-black text-[10px] animate-pulse">
                FURY x10 ({furyTimer.toFixed(1)}s)
              </span>
            )}
          </span>

          <span className="font-mono text-[11px] font-bold text-slate-400">
            {furyActive ? 'CUỒNG NỘ BÙNG NỔ!' : `${Math.round(furyEnergy)}% NĂNG LƯỢNG`}
          </span>
        </div>

        {/* Elemental Fury Progress Bar */}
        <div className="w-full h-2 sm:h-2.5 bg-black/60 rounded-full overflow-hidden border border-white/10 relative p-0.5">
          <div
            className={`h-full rounded-full transition-all duration-200 ${
              furyActive
                ? 'bg-gradient-to-r from-amber-400 via-yellow-300 to-orange-500 shadow-[0_0_15px_rgba(245,158,11,0.9)] animate-pulse'
                : 'bg-gradient-to-r from-orange-600 via-amber-500 to-yellow-400 shadow-[0_0_10px_rgba(245,158,11,0.5)]'
            }`}
            style={{ width: `${furyActive ? (furyTimer / 8) * 100 : furyEnergy}%` }}
          />
        </div>

        {/* Virtual Controls for Mobile / Touch Play */}
        <div className="flex items-center justify-between gap-2 pt-0.5">
          <button
            type="button"
            onClick={handleSwitchMode}
            className={`flex-1 py-2 rounded-xl font-black text-xs sm:text-sm uppercase tracking-wider flex items-center justify-center gap-2 border transition-all active:scale-95 cursor-pointer ${
              playerMode === 'ice'
                ? 'bg-cyan-900/60 border-cyan-400/80 text-cyan-300 shadow-md shadow-cyan-500/20'
                : 'bg-orange-900/60 border-orange-500/80 text-orange-300 shadow-md shadow-orange-500/20'
            }`}
          >
            <RefreshCw className="w-4 h-4 animate-spin-slow" />
            <span>ĐỔI HỆ: {playerMode === 'ice' ? '❄ BĂNG ➔ LỬA 🔥' : '🔥 LỬA ➔ BĂNG ❄'}</span>
          </button>
        </div>
      </div>
    </div>
  );
};
