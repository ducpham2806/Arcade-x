import { drawArenaBackdrop } from '../../visuals/arenaBackdrop';
import React, { useRef, useEffect, useState, useCallback } from 'react';
import { GameComponentProps } from '../../types';
import { usePlayer } from '../../context/PlayerContext';
import {
  Heart,
  Flame,
  Zap,
  Clock,
  Trophy,
  Sliders,
  Wind,
  RotateCcw,
  Sparkles,
  Target,
  CheckCircle2,
  AlertTriangle,
  Swords,
  ShieldAlert,
} from 'lucide-react';
import {
  GameMode,
  FruitKind,
  SliceTarget,
  TrailPoint,
  Particle,
  JuiceSplatter,
  StageConfig,
  StageObjective,
  BossDef,
  BossId,
  ActiveGameEffect,
} from './types';
import {
  FRUIT_DICTIONARY,
  drawWholeFruit,
  drawSlicedHalf,
  drawCyberBomb,
  drawCyberBoss,
} from './fruitAssets';
import { BOSS_RUSH_ROSTER, getBossByPhase } from './bossConfig';
import {
  CYBER_SLICE_STAGES,
  getUnlockedStage,
  saveUnlockedStage,
  saveStageStars,
} from './stages';
import { ModeSelectModal } from './ModeSelectModal';
import { StageSelectModal } from './StageSelectModal';
import { StageCompleteModal } from './StageCompleteModal';
import { EffectBar } from './EffectBar';
import { hapticService } from '../../services/haptics';

export const CyberSliceGame: React.FC<GameComponentProps> = ({
  bridge,
  isPaused,
  onGameOver,
}) => {
  const { addCoins, addExp } = usePlayer();
  const canvasRef = useRef<HTMLCanvasElement | null>(null);
  const containerRef = useRef<HTMLDivElement | null>(null);

  // Settings & Modes
  const [gameMode, setGameMode] = useState<GameMode>('stage');
  const [speedMultiplier, setSpeedMultiplier] = useState<number>(() => {
    try {
      const saved = localStorage.getItem('arcadex_cyber_slice_speed');
      return saved ? parseFloat(saved) : 1.0;
    } catch {
      return 1.0;
    }
  });

  // Modals
  const [showModeModal, setShowModeModal] = useState<boolean>(false);
  const [showStageSelect, setShowStageSelect] = useState<boolean>(false);

  // Synchronized pause state whenever an in-game modal is opened
  const isEffectivelyPaused = isPaused || showModeModal || showStageSelect;

  // Active Effects for the new "Thanh Hiệu Ứng" (Effect Bar)
  const [activeEffects, setActiveEffects] = useState<ActiveGameEffect[]>([]);

  const [stageResult, setStageResult] = useState<{
    isVictory: boolean;
    stage: StageConfig;
    score: number;
    stars: number;
    objectives: StageObjective[];
    coinsEarned: number;
  } | null>(null);

  // Boss Rush Specific Result Modal
  const [bossRushResult, setBossRushResult] = useState<{
    isVictory: boolean;
    bossDefeatedCount: number;
    currentBossName: string;
    score: number;
    stars: number;
    coinsEarned: number;
  } | null>(null);

  // Current Stage (for 'stage' mode)
  const [currentStage, setCurrentStage] = useState<StageConfig>(() => {
    const unlocked = getUnlockedStage();
    const found = CYBER_SLICE_STAGES.find((s) => s.id === unlocked);
    return found || CYBER_SLICE_STAGES[0];
  });

  // Live HUD States
  const [score, setScore] = useState<number>(0);
  const [lives, setLives] = useState<number>(3);
  const [feverEnergy, setFeverEnergy] = useState<number>(0);
  const [isFever, setIsFever] = useState<boolean>(false);
  const [isFrozen, setIsFrozen] = useState<boolean>(false);
  const [timeLeft, setTimeLeft] = useState<number>(60);
  const [activeObjectives, setActiveObjectives] = useState<StageObjective[]>([]);
  const [comboText, setComboText] = useState<{
    text: string;
    x: number;
    y: number;
    id: number;
    color?: string;
  } | null>(null);

  // High-Impact Center COMBO Banner
  const [comboBanner, setComboBanner] = useState<{
    count: number;
    text: string;
    bonus: number;
    color: string;
    id: number;
  } | null>(null);

  // Live Boss HUD State in Boss Rush mode
  const [bossData, setBossData] = useState<{
    boss: BossDef;
    hp: number;
    maxHp: number;
    phase: number;
  } | null>(null);

  // Total fruit sliced in current session for achievements
  const totalFruitsSlicedRef = useRef<number>(0);

  // Main animation / physics state ref
  const stateRef = useRef({
    score: 0,
    lives: 3,
    feverEnergy: 0,
    isFever: false,
    feverTimer: 0,
    isFrozen: false,
    freezeTimer: 0,
    frenzyTimer: 0,
    goldenTimer: 0,
    targets: [] as SliceTarget[],
    trail: [] as TrailPoint[],
    particles: [] as Particle[],
    splatters: [] as JuiceSplatter[],
    isPointerDown: false,
    nextId: 1,
    spawnTimer: 0,
    comboCountInSwipe: 0,
    comboChain: 0, // consecutive slices within 1.3s
    lastSliceTime: 0,
    shakeIntensity: 0, // Screen shake intensity (decays each frame)
    hitStopFrames: 0, // Slow-mo / impact freeze frames
    bossPhase: 1, // Boss Rush phase 1, 2, 3
    bossDefeatedCount: 0,
    bossRushTimeRemaining: 45,
    isOver: false,
    gameMode: 'stage' as GameMode,
    currentStage: CYBER_SLICE_STAGES[0],
    objectives: [] as StageObjective[],
    timeTick: 0,
    speedMultiplier: 1.0,
    timeRemaining: 60,
    strikes: 0, // Missed fruit strike counter for Classic mode
    bombSlicedThisGame: false,
  });

  // Safe Modal Handlers preventing game freeze and stale overlays
  const handleOpenModeModal = () => {
    stateRef.current.isPointerDown = false;
    stateRef.current.trail = [];
    setComboText(null);
    setComboBanner(null);
    setShowModeModal(true);
  };

  const handleCloseModeModal = () => {
    setShowModeModal(false);
    // If the game was previously over (e.g. returning to menu after victory/defeat),
    // start a fresh new session cleanly so the screen is never frozen
    if (stateRef.current.isOver) {
      resetGameSession(gameMode, currentStage);
    } else {
      stateRef.current.isPointerDown = false;
      stateRef.current.trail = [];
      stateRef.current.lastSliceTime = Date.now();
    }
    setComboText(null);
    setComboBanner(null);
  };

  const handleOpenStageSelect = () => {
    stateRef.current.isPointerDown = false;
    stateRef.current.trail = [];
    setComboText(null);
    setComboBanner(null);
    setShowStageSelect(true);
  };

  const handleCloseStageSelect = () => {
    setShowStageSelect(false);
    if (stateRef.current.isOver) {
      resetGameSession('stage', currentStage);
    } else {
      stateRef.current.isPointerDown = false;
      stateRef.current.trail = [];
      stateRef.current.lastSliceTime = Date.now();
    }
    setComboText(null);
    setComboBanner(null);
  };

  // Sync speed changes to ref & localStorage
  const handleSetSpeed = (val: number) => {
    setSpeedMultiplier(val);
    stateRef.current.speedMultiplier = val;
    try {
      localStorage.setItem('arcadex_cyber_slice_speed', val.toString());
    } catch {}
  };

  // Setup / reset game session
  const resetGameSession = useCallback(
    (mode: GameMode = gameMode, stage: StageConfig = currentStage) => {
      const s = stateRef.current;
      s.score = 0;
      s.lives = mode === 'zen' ? 999 : 3;
      s.feverEnergy = 0;
      s.isFever = false;
      s.feverTimer = 0;
      s.isFrozen = false;
      s.freezeTimer = 0;
      s.frenzyTimer = 0;
      s.goldenTimer = 0;
      s.targets = [];
      s.trail = [];
      s.particles = [];
      s.splatters = [];
      s.isPointerDown = false;
      s.spawnTimer = 0;
      s.comboCountInSwipe = 0;
      s.comboChain = 0;
      s.lastSliceTime = 0;
      s.shakeIntensity = 0;
      s.hitStopFrames = 0;
      s.bossPhase = 1;
      s.bossDefeatedCount = 0;
      s.bossRushTimeRemaining = 45;
      s.isOver = false;
      s.gameMode = mode;
      s.currentStage = stage;
      s.timeTick = 0;
      s.speedMultiplier = speedMultiplier;
      s.strikes = 0;
      s.bombSlicedThisGame = false;
      s.timeRemaining =
        mode === 'time_attack'
          ? 60
          : mode === 'zen'
          ? 90
          : mode === 'boss_rush'
          ? 45
          : 999;

      // Deep clone objectives for live mutation
      const clonedObjs: StageObjective[] = stage.objectives.map((o) => ({
        ...o,
        current: 0,
      }));
      s.objectives = clonedObjs;

      setScore(0);
      setLives(s.lives);
      setFeverEnergy(0);
      setIsFever(false);
      setIsFrozen(false);
      setTimeLeft(s.timeRemaining);
      setActiveObjectives(clonedObjs);
      setActiveEffects([]);
      setStageResult(null);
      setBossRushResult(null);
      setComboBanner(null);
      setComboText(null);

      if (mode === 'boss_rush') {
        const firstBoss = getBossByPhase(1);
        setBossData({
          boss: firstBoss,
          hp: firstBoss.maxHp,
          maxHp: firstBoss.maxHp,
          phase: 1,
        });
      } else {
        setBossData(null);
      }
    },
    [gameMode, currentStage, speedMultiplier]
  );

  // Initialize or restart on mode/stage change
  useEffect(() => {
    resetGameSession(gameMode, currentStage);
  }, [gameMode, currentStage, resetGameSession]);

  // Auto-dismiss floating combo text
  useEffect(() => {
    if (!comboText) return;
    const t = setTimeout(() => setComboText(null), 800);
    return () => clearTimeout(t);
  }, [comboText]);

  // Auto-dismiss center combo banner
  useEffect(() => {
    if (!comboBanner) return;
    const t = setTimeout(() => setComboBanner(null), 1100);
    return () => clearTimeout(t);
  }, [comboBanner]);

  // Clean combo effects when stage changes or ends
  useEffect(() => {
    if (stageResult || bossRushResult) {
      setComboText(null);
      setComboBanner(null);
    }
  }, [stageResult, bossRushResult]);

  // Pointer event handlers
  const handlePointerDown = (e: React.PointerEvent) => {
    if (stateRef.current.isOver || isEffectivelyPaused) return;
    stateRef.current.isPointerDown = true;
    stateRef.current.comboCountInSwipe = 0;
    const rect = containerRef.current?.getBoundingClientRect();
    if (rect) {
      stateRef.current.trail = [
        { x: e.clientX - rect.left, y: e.clientY - rect.top, time: Date.now() },
      ];
    }
  };

  const handlePointerUp = () => {
    stateRef.current.isPointerDown = false;
  };

  const handlePointerMove = (e: React.PointerEvent) => {
    const s = stateRef.current;
    if (!s.isPointerDown || s.isOver || isEffectivelyPaused) return;
    const rect = containerRef.current?.getBoundingClientRect();
    if (!rect) return;

    const curX = e.clientX - rect.left;
    const curY = e.clientY - rect.top;
    const now = Date.now();

    s.trail.push({ x: curX, y: curY, time: now });
    if (s.trail.length > 16) s.trail.shift();

    // Check line segment intersection with targets
    if (s.trail.length >= 2) {
      const p1 = s.trail[s.trail.length - 2];
      const p2 = s.trail[s.trail.length - 1];

      for (const t of s.targets) {
        if (t.sliced) continue;

        // Line-circle distance
        const dx = p2.x - p1.x;
        const dy = p2.y - p1.y;
        const len = Math.hypot(dx, dy);
        if (len === 0) continue;

        const u = Math.max(
          0,
          Math.min(1, ((t.x - p1.x) * dx + (t.y - p1.y) * dy) / (len * len))
        );
        const closestX = p1.x + u * dx;
        const closestY = p1.y + u * dy;
        const dist = Math.hypot(t.x - closestX, t.y - closestY);

        if (dist < t.radius) {
          const cutAngle = Math.atan2(dy, dx);
          t.cutAngle = cutAngle;

          if (t.itemType === 'boss') {
            // Check hit cooldown/invulnerability frame
            if ((t.hitFlash || 0) > 0) continue;

            t.bossHp = Math.max(0, (t.bossHp || 1) - 1);
            t.hitFlash = 10;
            s.shakeIntensity = 12;
            s.hitStopFrames = 5;
            bridge.playSound('slice');

            // Metallic electric spark burst
            for (let p = 0; p < 18; p++) {
              const ang = Math.random() * Math.PI * 2;
              const spd = Math.random() * 8 + 2;
              s.particles.push({
                x: t.x,
                y: t.y,
                vx: Math.cos(ang) * spd,
                vy: Math.sin(ang) * spd,
                size: Math.random() * 4 + 2,
                color: Math.random() > 0.5 ? '#fbbf24' : '#38bdf8',
                alpha: 1,
                life: 0,
                maxLife: 24,
              });
            }

            const currentBossDef = getBossByPhase(s.bossPhase);
            setBossData({
              boss: currentBossDef,
              hp: t.bossHp,
              maxHp: t.bossMaxHp || currentBossDef.maxHp,
              phase: s.bossPhase,
            });

            setComboText({
              text: `⚔️ BẠO KÍCH TRÙM! -1 HP (${t.bossHp}/${t.bossMaxHp})`,
              x: t.x,
              y: t.y,
              id: Date.now(),
              color: '#f43f5e',
            });

            if (t.bossHp <= 0) {
              t.sliced = true;
              s.shakeIntensity = 24;
              s.hitStopFrames = 10;
              bridge.playSound('explosion');
              bridge.playSound('powerup');

              s.bossDefeatedCount += 1;
              const phaseBonus = 2500 * s.bossPhase;
              s.score += phaseBonus;
              setScore(s.score);

              // Huge Boss Defeat Explosion
              for (let p = 0; p < 45; p++) {
                const ang = Math.random() * Math.PI * 2;
                const spd = Math.random() * 12 + 3;
                s.particles.push({
                  x: t.x,
                  y: t.y,
                  vx: Math.cos(ang) * spd,
                  vy: Math.sin(ang) * spd,
                  size: Math.random() * 6 + 3,
                  color:
                    Math.random() > 0.6
                      ? '#fbbf24'
                      : Math.random() > 0.3
                      ? '#f43f5e'
                      : '#38bdf8',
                  alpha: 1,
                  life: 0,
                  maxLife: 45,
                });
              }

              if (s.bossPhase < 3) {
                s.bossPhase += 1;
                s.bossRushTimeRemaining += 35;
                setTimeLeft(s.bossRushTimeRemaining);
                const nextBoss = getBossByPhase(s.bossPhase);
                setBossData({
                  boss: nextBoss,
                  hp: nextBoss.maxHp,
                  maxHp: nextBoss.maxHp,
                  phase: s.bossPhase,
                });
                setComboBanner({
                  count: s.bossPhase,
                  text: `👑 TRẢM THÀNH CÔNG! BƯỚC VÀO TẦNG ${s.bossPhase}!`,
                  bonus: phaseBonus,
                  color: '#10b981',
                  id: Date.now(),
                });
              } else {
                // Complete all 3 bosses! VICTORY!
                s.isOver = true;
                addCoins(500);
                addExp(1000);
                bridge.reportProgress('ach-boss-rush-slayer', 1, true);
                bridge.playSound('levelUp');
                setBossRushResult({
                  isVictory: true,
                  bossDefeatedCount: 3,
                  currentBossName: currentBossDef.name,
                  score: s.score,
                  stars: 3,
                  coinsEarned: 500,
                });
              }
            }
          } else if (t.itemType === 'bomb') {
            // Cut lethal cyber bomb!
            t.sliced = true;
            bridge.playSound('explosion');
            hapticService.bomb();
            s.bombSlicedThisGame = true;
            s.shakeIntensity = 18;
            s.hitStopFrames = 8;

            // In Time Attack: bomb deducts 100 points, does not kill
            if (s.gameMode === 'time_attack') {
              s.score = Math.max(0, s.score - 100);
              setScore(s.score);
              setComboText({
                text: '💥 -100 ĐIỂM (CHÉM TRÚNG BOM)!',
                x: t.x,
                y: t.y,
                id: Date.now(),
                color: '#ef4444',
              });
            } else if (s.gameMode !== 'zen') {
              s.lives -= 1;
              setLives(s.lives);

              // Red alert combo text
              setComboText({
                text: '⚠️ CHÉM TRÚNG BOM TỬ THẦN! -1 MẠNG',
                x: t.x,
                y: t.y,
                id: Date.now(),
                color: '#ef4444',
              });

              if (s.lives <= 0) {
                s.isOver = true;
                bridge.playSound('gameOver');
                if (s.gameMode === 'stage') {
                  setStageResult({
                    isVictory: false,
                    stage: s.currentStage,
                    score: s.score,
                    stars: 0,
                    objectives: [...s.objectives],
                    coinsEarned: 0,
                  });
                } else if (s.gameMode === 'boss_rush') {
                  setBossRushResult({
                    isVictory: false,
                    bossDefeatedCount: s.bossDefeatedCount,
                    currentBossName: getBossByPhase(s.bossPhase).name,
                    score: s.score,
                    stars: 0,
                    coinsEarned: 0,
                  });
                } else {
                  onGameOver(s.score);
                }
              }
            }

            // Big fiery explosive particle burst
            for (let p = 0; p < 35; p++) {
              const ang = Math.random() * Math.PI * 2;
              const spd = Math.random() * 9 + 2;
              s.particles.push({
                x: t.x,
                y: t.y,
                vx: Math.cos(ang) * spd,
                vy: Math.sin(ang) * spd,
                size: Math.random() * 7 + 2,
                color: Math.random() > 0.4 ? '#ef4444' : '#fbbf24',
                alpha: 1,
                life: 0,
                maxLife: 40,
              });
            }
          } else if (t.fruitKind) {
            // Cut delicious fruit!
            t.sliced = true;
            bridge.playSound('slice');
            hapticService.slice();
            s.comboCountInSwipe += 1;
            totalFruitsSlicedRef.current += 1;

            if (totalFruitsSlicedRef.current >= 100) {
              bridge.reportProgress('ach-slice-fruits-100', totalFruitsSlicedRef.current, true);
            }

            const fDef = FRUIT_DICTIONARY[t.fruitKind];
            const multiplier = s.isFever ? 2 : 1;
            const pointsGained = fDef.points * multiplier;
            s.score += pointsGained;
            setScore(s.score);

            // Add fever energy
            s.feverEnergy = Math.min(100, s.feverEnergy + fDef.feverEnergy);
            setFeverEnergy(s.feverEnergy);

            if (s.feverEnergy >= 100 && !s.isFever) {
              s.isFever = true;
              s.feverTimer = 380; // ~6.3 seconds
              setIsFever(true);
              bridge.playSound('powerup');
              hapticService.sliceSpecial();
            }

            // Handle special fruit effects with Screen Shake, Hit Stop & Effect Bar Buffs!
            if (t.fruitKind === 'freeze_fruit') {
              bridge.playSound('powerup');
              hapticService.sliceSpecial();
              s.isFrozen = true;
              s.freezeTimer = 240; // 4 seconds of slow-mo
              s.shakeIntensity = 8;
              s.hitStopFrames = 4;
              setIsFrozen(true);
              setComboText({
                text: '+10 ❄️',
                x: t.x,
                y: t.y,
                id: Date.now(),
                color: '#38bdf8',
              });
            } else if (t.fruitKind === 'frenzy_fruit') {
              bridge.playSound('powerup');
              hapticService.sliceSpecial();
              s.frenzyTimer = 240; // 4 seconds of fruit storm
              s.shakeIntensity = 8;
              s.hitStopFrames = 4;
              setComboText({
                text: '+10 🌪️',
                x: t.x,
                y: t.y,
                id: Date.now(),
                color: '#c084fc',
              });
            } else if (t.fruitKind === 'golden_fruit') {
              bridge.playSound('coin');
              hapticService.sliceSpecial();
              s.goldenTimer = 240; // 4 seconds of golden fruit buff
              s.shakeIntensity = 8;
              s.hitStopFrames = 4;
              setComboText({
                text: '+50 ⭐',
                x: t.x,
                y: t.y,
                id: Date.now(),
                color: '#fbbf24',
              });
            }

            // Report achievement progress for high combos
            if (s.comboCountInSwipe >= 10) {
              bridge.reportProgress('ach-slice-combo-10', s.comboCountInSwipe, true);
            }

            // CONSECUTIVE COMBO SYSTEM:
            const nowTime = Date.now();
            if (nowTime - s.lastSliceTime < 1300) {
              s.comboChain += 1;
            } else {
              s.comboChain = 1;
            }
            s.lastSliceTime = nowTime;

            const currentCombo = Math.max(s.comboCountInSwipe, s.comboChain);
            if (currentCombo >= 2) {
              bridge.playSound('combo');
              hapticService.combo(currentCombo);
              const comboBonus = currentCombo * 20;
              s.score += comboBonus;
              setScore(s.score);

              let comboLabel = `COMBO x${currentCombo}!`;
              let comboColor = '#38bdf8';
              if (currentCombo >= 10) {
                comboLabel = `🔥 COMBO x${currentCombo}! CYBER THẦN ĐAO`;
                comboColor = '#fbbf24';
              } else if (currentCombo >= 7) {
                comboLabel = `⚡ COMBO x${currentCombo}! ULTRA SLICE`;
                comboColor = '#c084fc';
              } else if (currentCombo >= 5) {
                comboLabel = `💥 COMBO x${currentCombo}! MEGA SLICE`;
                comboColor = '#f43f5e';
              } else if (currentCombo >= 3) {
                comboLabel = `✨ COMBO x${currentCombo}! TRIPLE SLICE`;
                comboColor = '#fbbf24';
              }

              // Screen shake & hit-stop for intense tactile feedback!
              if (currentCombo >= 4) {
                s.shakeIntensity = Math.min(14, 5 + currentCombo * 1.3);
                s.hitStopFrames = 3;
              }

              // High-impact center screen combo banner (prevents bottom text piling)
              setComboBanner({
                count: currentCombo,
                text: comboLabel,
                bonus: comboBonus,
                color: comboColor,
                id: Date.now(),
              });
            }

            // Sliced pieces separated along the cut angle
            const normalX = -Math.sin(cutAngle);
            const normalY = Math.cos(cutAngle);
            const sepSpeed = 4.5;

            t.pieces = [
              {
                x: t.x - normalX * 8,
                y: t.y - normalY * 8,
                vx: t.vx * 0.5 - normalX * sepSpeed + (Math.random() - 0.5) * 2,
                vy: t.vy * 0.6 - normalY * sepSpeed - 1.5,
                rot: t.rotation,
                vRot: -0.15 - Math.random() * 0.1,
                half: 'left',
              },
              {
                x: t.x + normalX * 8,
                y: t.y + normalY * 8,
                vx: t.vx * 0.5 + normalX * sepSpeed + (Math.random() - 0.5) * 2,
                vy: t.vy * 0.6 + normalY * sepSpeed - 1.5,
                rot: t.rotation,
                vRot: 0.15 + Math.random() * 0.1,
                half: 'right',
              },
            ];

            // Soft juice splatter on background
            s.splatters.push({
              id: Date.now() + Math.random(),
              x: t.x,
              y: t.y,
              radius: Math.random() * 20 + 35,
              color: fDef.splatterColor,
              alpha: 0.8,
              time: Date.now(),
            });
            if (s.splatters.length > 25) s.splatters.shift();

            // Juicy splash particles
            for (let p = 0; p < 18; p++) {
              s.particles.push({
                x: t.x,
                y: t.y,
                vx: (Math.random() - 0.5) * 9,
                vy: (Math.random() - 0.5) * 9 - 1.5,
                size: Math.random() * 5 + 2,
                color: fDef.juiceColor,
                alpha: 1,
                life: 0,
                maxLife: 28,
              });
            }

            // Update Stage Mode Objectives
            if (s.gameMode === 'stage') {
              let changed = false;
              s.objectives.forEach((obj) => {
                if (obj.type === 'fruit_type' && obj.fruitKind === t.fruitKind) {
                  obj.current += 1;
                  changed = true;
                } else if (obj.type === 'fruit_count') {
                  obj.current += 1;
                  changed = true;
                } else if (obj.type === 'score') {
                  obj.current = s.score;
                  changed = true;
                } else if (obj.type === 'combo' && s.comboCountInSwipe >= 3) {
                  obj.current += 1;
                  changed = true;
                } else if (obj.type === 'no_bomb') {
                  obj.current = s.bombSlicedThisGame ? 0 : 1;
                }
              });

              if (changed) {
                setActiveObjectives([...s.objectives]);
              }

              // Check if ALL stage objectives are completed!
              const allDone = s.objectives.every((obj) => {
                if (obj.type === 'no_bomb') {
                  return !s.bombSlicedThisGame;
                }
                return obj.current >= obj.target;
              });

              if (allDone) {
                // VICTORY! Finish Stage!
                s.isOver = true;
                bridge.playSound('powerup');

                // Compute stars: 1 star minimum for completing targets, 2 & 3 stars for score
                const [s1, s2, s3] = s.currentStage.starScores;
                let earnedStars = 1;
                if (s.score >= s3) earnedStars = 3;
                else if (s.score >= s2) earnedStars = 2;

                const coinsEarned = earnedStars * 50;
                addCoins(coinsEarned);
                addExp(earnedStars * 40);

                // Save progression
                saveUnlockedStage(s.currentStage.id + 1);
                saveStageStars(s.currentStage.id, earnedStars);

                if (s.currentStage.id >= 5) {
                  bridge.reportProgress('ach-slice-stage-5', 5, true);
                }

                setStageResult({
                  isVictory: true,
                  stage: s.currentStage,
                  score: s.score,
                  stars: earnedStars,
                  objectives: [...s.objectives],
                  coinsEarned,
                });
              }
            }
          }
        }
      }
    }
  };

  // Main Game Loop Effect
  useEffect(() => {
    const canvas = canvasRef.current;
    const container = containerRef.current;
    if (!canvas || !container) return;

    const ctx = canvas.getContext('2d');
    if (!ctx) return;

    let animId: number;

    const resize = () => {
      const rect = container.getBoundingClientRect();
      const dpr = Math.min(window.devicePixelRatio || 1, 2);
      canvas.width = rect.width * dpr;
      canvas.height = rect.height * dpr;
      ctx.scale(dpr, dpr);
    };

    resize();
    window.addEventListener('resize', resize);

    const s = stateRef.current;
    const skin = bridge.getEquippedSkin();

    // Determine blade trail colors based on skin
    let bladeColor = '#06b6d4'; // default cyber cyan
    if (skin.includes('dragon') || skin.includes('magma') || skin.includes('lava')) {
      bladeColor = '#f97316';
    } else if (skin.includes('ice')) {
      bladeColor = '#38bdf8';
    } else if (skin.includes('golden')) {
      bladeColor = '#fbbf24';
    } else if (skin.includes('forest')) {
      bladeColor = '#22c55e';
    } else if (skin.includes('cyberpunk') || skin.includes('neon')) {
      bladeColor = '#ec4899';
    } else if (skin.includes('shadow')) {
      bladeColor = '#818cf8';
    }

    let secondTimer = 0;

    const updateAndDraw = () => {
      const width = container.clientWidth;
      const height = container.clientHeight;
      s.timeTick += 1;

      if (!isEffectivelyPaused && !s.isOver) {
        // Handle Countdown timer for Time Attack, Zen, or Boss Rush
        secondTimer += 1;
        if (secondTimer >= 60) {
          secondTimer = 0;
          if (s.gameMode === 'time_attack' || s.gameMode === 'zen') {
            s.timeRemaining -= 1;
            setTimeLeft(s.timeRemaining);

            if (s.timeRemaining <= 0) {
              s.isOver = true;
              bridge.playSound('gameOver');
              onGameOver(s.score);
            }
          } else if (s.gameMode === 'boss_rush') {
            s.bossRushTimeRemaining -= 1;
            setTimeLeft(s.bossRushTimeRemaining);

            if (s.bossRushTimeRemaining <= 0) {
              s.isOver = true;
              bridge.playSound('gameOver');
              setBossRushResult({
                isVictory: false,
                bossDefeatedCount: s.bossDefeatedCount,
                currentBossName: getBossByPhase(s.bossPhase).name,
                score: s.score,
                stars: 0,
                coinsEarned: 0,
              });
            }
          }
        }

        // Freeze Timer
        if (s.isFrozen) {
          s.freezeTimer -= 1;
          if (s.freezeTimer <= 0) {
            s.isFrozen = false;
            setIsFrozen(false);
          }
        }

        // Frenzy Timer
        if (s.frenzyTimer > 0) {
          s.frenzyTimer -= 1;
        }

        // Golden Fruit Buff Timer
        if (s.goldenTimer > 0) {
          s.goldenTimer -= 1;
        }

        // Fever Timer
        if (s.isFever) {
          s.feverTimer -= 1;
          if (s.feverTimer <= 0) {
            s.isFever = false;
            s.feverEnergy = 0;
            setIsFever(false);
            setFeverEnergy(0);
          }
        }

        // Sync active buffs to Effect Bar every 6 frames (~10fps update)
        if (s.timeTick % 6 === 0) {
          const effs: ActiveGameEffect[] = [];

          if (s.freezeTimer > 0) {
            effs.push({
              id: 'freeze',
              icon: '❄️',
              name: 'Đóng Băng',
              subtext: 'Chậm 45%',
              remainingSeconds: Math.max(0, s.freezeTimer / 60),
              totalSeconds: 4.0,
              color: '#38bdf8',
              borderColor: 'border-cyan-400',
              bgColor: 'bg-cyan-500/20',
              glowColor: 'rgba(56, 189, 248, 0.4)',
            });
          }

          if (s.frenzyTimer > 0) {
            effs.push({
              id: 'frenzy',
              icon: '🌪️',
              name: 'Bão Quả',
              subtext: 'Spawn x3',
              remainingSeconds: Math.max(0, s.frenzyTimer / 60),
              totalSeconds: 4.0,
              color: '#c084fc',
              borderColor: 'border-purple-400',
              bgColor: 'bg-purple-500/20',
              glowColor: 'rgba(192, 132, 252, 0.4)',
            });
          }

          if (s.isFever && s.feverTimer > 0) {
            effs.push({
              id: 'fever',
              icon: '🔥',
              name: 'Cuồng Nhiệt',
              subtext: 'x2 Điểm',
              remainingSeconds: Math.max(0, s.feverTimer / 60),
              totalSeconds: 6.3,
              color: '#f59e0b',
              borderColor: 'border-amber-400',
              bgColor: 'bg-amber-500/20',
              glowColor: 'rgba(245, 158, 11, 0.4)',
            });
          }

          if (s.goldenTimer > 0) {
            effs.push({
              id: 'golden',
              icon: '⭐',
              name: 'Hoàng Kim',
              subtext: '+50Đ',
              remainingSeconds: Math.max(0, s.goldenTimer / 60),
              totalSeconds: 4.0,
              color: '#fbbf24',
              borderColor: 'border-yellow-400',
              bgColor: 'bg-yellow-500/20',
              glowColor: 'rgba(251, 191, 36, 0.4)',
            });
          }

          const comboTimeLeft = 1300 - (Date.now() - s.lastSliceTime);
          if (s.comboChain >= 3 && comboTimeLeft > 0) {
            const mult = Math.min(5, Math.floor(s.comboChain / 3) + 1);
            effs.push({
              id: 'combo',
              icon: '⚡',
              name: `Combo x${mult}`,
              subtext: `${s.comboChain} Quả`,
              remainingSeconds: Math.max(0, comboTimeLeft / 1000),
              totalSeconds: 1.3,
              color: '#34d399',
              borderColor: 'border-emerald-400',
              bgColor: 'bg-emerald-500/20',
              glowColor: 'rgba(52, 211, 153, 0.4)',
            });
          }

          setActiveEffects(effs);
        }

        // Time scale for physics (slow-mo when frozen or impact frame)
        let timeScale = s.isFrozen ? 0.45 : 1.0;
        if (s.hitStopFrames > 0) {
          s.hitStopFrames -= 1;
          timeScale = 0.08; // High-impact freeze frame moment
        }

        const currentSpeedMult = s.speedMultiplier * (s.currentStage.speedMultiplier || 1.0);

        // Spawn Boss in Boss Rush Mode
        if (s.gameMode === 'boss_rush' && !s.isOver) {
          const hasBoss = s.targets.some((t) => t.itemType === 'boss' && !t.sliced);
          if (!hasBoss && s.bossDefeatedCount < 3) {
            const bDef = getBossByPhase(s.bossPhase);
            s.targets.push({
              id: s.nextId++,
              x: width / 2,
              y: 115,
              vx: 2.2 * bDef.speed,
              vy: 0,
              radius: bDef.radius,
              rotation: 0,
              vRot: 0.015,
              itemType: 'boss',
              bossId: bDef.id,
              bossHp: bDef.maxHp,
              bossMaxHp: bDef.maxHp,
              hitFlash: 0,
              sliced: false,
            });

            setBossData({
              boss: bDef,
              hp: bDef.maxHp,
              maxHp: bDef.maxHp,
              phase: s.bossPhase,
            });
          }
        }

        // Spawn targets
        s.spawnTimer += 1 * timeScale;
        const baseInterval =
          s.gameMode === 'boss_rush'
            ? 45
            : s.frenzyTimer > 0
            ? 12
            : s.isFever
            ? 24
            : 52;
        const spawnInterval = Math.round(baseInterval / currentSpeedMult);

        const baseGravity = 0.22;
        const gravity = baseGravity * timeScale;

        // Dynamic launch physics calculated from canvas height
        // Guarantees items launch gracefully into the upper-middle screen (20% to 42% from top)
        const calcFruitLaunch = (startX: number) => {
          // Peak target Y between 20% and 40% of the canvas height
          const peakTargetY = height * (0.20 + Math.random() * 0.20);
          const totalVerticalRise = Math.max(320, (height + 35) - peakTargetY);
          // vy = -sqrt(2 * g * d) ensures peak height reaches peakTargetY
          const baseVy = -Math.sqrt(2 * baseGravity * totalVerticalRise);
          const vy = baseVy * Math.min(1.15, Math.max(0.92, currentSpeedMult));

          // Inward horizontal arc towards the screen center
          const centerRatio = (width / 2 - startX) / Math.max(100, width / 2);
          const vx = (centerRatio * (Math.random() * 2.2 + 1.2) + (Math.random() - 0.5) * 1.5) * currentSpeedMult;

          return { vx, vy };
        };

        const calcBombLaunch = (startX: number) => {
          // Bomb peak apex slightly lower / varied (25% to 45% from top)
          const peakTargetY = height * (0.25 + Math.random() * 0.20);
          const totalVerticalRise = Math.max(290, (height + 35) - peakTargetY);
          const baseVy = -Math.sqrt(2 * baseGravity * totalVerticalRise);
          const vy = baseVy * Math.min(1.15, Math.max(0.92, currentSpeedMult));

          const centerRatio = (width / 2 - startX) / Math.max(100, width / 2);
          const vx = (centerRatio * (Math.random() * 2.0 + 1.0) + (Math.random() - 0.5) * 1.4) * currentSpeedMult;

          return { vx, vy };
        };

        if (s.spawnTimer >= spawnInterval) {
          s.spawnTimer = 0;

          if (s.gameMode === 'boss_rush') {
            // In Boss Rush, the Boss throws satellite hazard bombs and tricky fruits
            const boss = s.targets.find((t) => t.itemType === 'boss' && !t.sliced);
            if (boss) {
              const isBomb = Math.random() < 0.3;
              if (isBomb) {
                s.targets.push({
                  id: s.nextId++,
                  x: boss.x + (Math.random() - 0.5) * 60,
                  y: boss.y + 40,
                  vx: (Math.random() - 0.5) * 3.5 * currentSpeedMult,
                  vy: (Math.random() * 2 + 3) * currentSpeedMult,
                  radius: 28,
                  rotation: 0,
                  vRot: (Math.random() - 0.5) * 0.09,
                  itemType: 'bomb',
                  sliced: false,
                });
              } else {
                const bossFruitPool: FruitKind[] = ['watermelon', 'pineapple', 'banana', 'orange'];
                const fKind = bossFruitPool[Math.floor(Math.random() * bossFruitPool.length)];
                const fDef = FRUIT_DICTIONARY[fKind];
                const marginX = Math.max(45, Math.min(85, width * 0.15));
                const startX = Math.random() * (width - marginX * 2) + marginX;
                const launch = calcFruitLaunch(startX);

                s.targets.push({
                  id: s.nextId++,
                  x: startX,
                  y: height + 35,
                  vx: launch.vx,
                  vy: launch.vy,
                  radius: fDef.radius,
                  rotation: 0,
                  vRot: (Math.random() - 0.5) * 0.08,
                  itemType: 'fruit',
                  fruitKind: fKind,
                  sliced: false,
                });
              }
            }
          } else {
            const count =
              s.frenzyTimer > 0
                ? Math.floor(Math.random() * 3) + 3
                : s.isFever
                ? Math.floor(Math.random() * 2) + 2
                : Math.floor(Math.random() * 2) + 1;

            // Determine allowed fruit pool
            const stageFruits =
              s.gameMode === 'stage'
                ? s.currentStage.allowedFruits
                : ([
                    'watermelon',
                    'pineapple',
                    'banana',
                    'orange',
                    'apple_red',
                    'apple_green',
                    'strawberry',
                    'kiwi',
                    'coconut',
                    'lemon',
                    'pomegranate',
                  ] as FruitKind[]);

            const bombChance =
              s.gameMode === 'zen'
                ? 0
                : s.gameMode === 'stage'
                ? s.currentStage.bombChance
                : s.gameMode === 'time_attack'
                ? 0.1
                : 0.16;

            for (let i = 0; i < count; i++) {
              const marginX = Math.max(45, Math.min(85, width * 0.15));
              const startX = Math.random() * (width - marginX * 2) + marginX;
              const isBomb = !s.isFever && Math.random() < bombChance;

              if (isBomb) {
                // Spawn distinct CYBER BOMB
                const launch = calcBombLaunch(startX);
                s.targets.push({
                  id: s.nextId++,
                  x: startX,
                  y: height + 35,
                  vx: launch.vx,
                  vy: launch.vy,
                  radius: 28,
                  rotation: 0,
                  vRot: (Math.random() - 0.5) * 0.08,
                  itemType: 'bomb',
                  sliced: false,
                });
              } else {
                // Spawn juicy fruit
                let fruitKind: FruitKind =
                  stageFruits[Math.floor(Math.random() * stageFruits.length)];

                // Small chance of special fruit if not already in pool
                const specialRoll = Math.random();
                if (s.gameMode === 'time_attack' || s.isFever) {
                  if (specialRoll < 0.12) fruitKind = 'golden_fruit';
                  else if (specialRoll < 0.22) fruitKind = 'freeze_fruit';
                  else if (specialRoll < 0.32) fruitKind = 'frenzy_fruit';
                }

                const fDef = FRUIT_DICTIONARY[fruitKind] || FRUIT_DICTIONARY.watermelon;
                const launch = calcFruitLaunch(startX);

                s.targets.push({
                  id: s.nextId++,
                  x: startX,
                  y: height + 35,
                  vx: launch.vx,
                  vy: launch.vy,
                  radius: fDef.radius,
                  rotation: 0,
                  vRot: (Math.random() - 0.5) * 0.08,
                  itemType: 'fruit',
                  fruitKind,
                  sliced: false,
                });
              }
            }
          }
        }

        // Update target physics

        for (let i = s.targets.length - 1; i >= 0; i--) {
          const t = s.targets[i];

          if (t.itemType === 'boss') {
            // Boss physics: hover wave motion & horizontal bounce
            t.x += t.vx * timeScale;
            t.y = 115 + Math.sin(s.timeTick * 0.04) * 22;
            t.rotation += t.vRot * timeScale;

            if (t.x < t.radius + 20) {
              t.x = t.radius + 20;
              t.vx = Math.abs(t.vx);
            } else if (t.x > width - t.radius - 20) {
              t.x = width - t.radius - 20;
              t.vx = -Math.abs(t.vx);
            }

            if (t.hitFlash && t.hitFlash > 0) {
              t.hitFlash -= 1;
            }

            // If boss is sliced & defeated, remove
            if (t.sliced) {
              s.targets.splice(i, 1);
              continue;
            }
          } else {
            t.x += t.vx * timeScale;
            t.y += t.vy * timeScale;
            t.vy += gravity;
            t.rotation += t.vRot * timeScale;

            if (t.pieces) {
              t.pieces.forEach((p) => {
                p.x += p.vx * timeScale;
                p.y += p.vy * timeScale;
                p.vy += gravity * 1.3;
                p.rot += p.vRot * timeScale;
              });
            }

            // Target dropped off screen
            if (t.y > height + 70) {
              // In Classic mode, missing unsliced fruits adds a strike
              if (
                !t.sliced &&
                t.itemType !== 'bomb' &&
                s.gameMode === 'classic' &&
                !s.isFever
              ) {
                s.strikes += 1;
                bridge.playSound('hit');

                if (s.strikes >= 3) {
                  s.lives -= 1;
                  s.strikes = 0;
                  setLives(s.lives);

                  if (s.lives <= 0) {
                    s.isOver = true;
                    bridge.playSound('gameOver');
                    onGameOver(s.score);
                  }
                }
              }
              s.targets.splice(i, 1);
            }
          }
        }

        // Clean stale blade trail points
        const now = Date.now();
        s.trail = s.trail.filter((pt) => now - pt.time < 180);

        // Update juice splash particles
        for (let i = s.particles.length - 1; i >= 0; i--) {
          const p = s.particles[i];
          p.x += p.vx * timeScale;
          p.y += p.vy * timeScale;
          p.vy += 0.25 * timeScale;
          p.life += 1;
          p.alpha = 1 - p.life / p.maxLife;
          if (p.life >= p.maxLife) {
            s.particles.splice(i, 1);
          }
        }
      }

      // RENDER CANVAS WITH SCREEN SHAKE
      ctx.clearRect(0, 0, width, height);
      ctx.save();
      if (s.shakeIntensity > 0.2) {
        const sx = (Math.random() - 0.5) * s.shakeIntensity * 2;
        const sy = (Math.random() - 0.5) * s.shakeIntensity * 2;
        ctx.translate(sx, sy);
        s.shakeIntensity *= 0.88;
      } else {
        s.shakeIntensity = 0;
      }

      // Dynamic cyberpunk background
      ctx.fillStyle = s.isFever ? '#180726' : s.isFrozen ? '#051624' : '#070a14';
      ctx.fillRect(-30, -30, width + 60, height + 60);

      ctx.save();
      ctx.globalAlpha = s.isFever || s.isFrozen ? 0.55 : 1;
      drawArenaBackdrop(ctx, 'blade', width, height);
      ctx.restore();

      // Subtle background grid lines
      ctx.strokeStyle = s.isFever
        ? 'rgba(217, 70, 239, 0.08)'
        : s.isFrozen
        ? 'rgba(56, 189, 248, 0.08)'
        : 'rgba(30, 41, 59, 0.3)';
      ctx.lineWidth = 1;
      const gridSize = 40;
      for (let x = 0; x < width; x += gridSize) {
        ctx.beginPath();
        ctx.moveTo(x, 0);
        ctx.lineTo(x, height);
        ctx.stroke();
      }
      for (let y = 0; y < height; y += gridSize) {
        ctx.beginPath();
        ctx.moveTo(0, y);
        ctx.lineTo(width, y);
        ctx.stroke();
      }

      // Render Soft Juice Splatters on canvas
      s.splatters.forEach((sp) => {
        const age = (Date.now() - sp.time) / 1000;
        const currentAlpha = Math.max(0, sp.alpha - age * 0.06);
        if (currentAlpha > 0) {
          ctx.save();
          ctx.globalAlpha = currentAlpha;
          ctx.fillStyle = sp.color;
          ctx.beginPath();
          ctx.arc(sp.x, sp.y, sp.radius, 0, Math.PI * 2);
          ctx.fill();

          // Splatter droplets
          ctx.beginPath();
          ctx.arc(sp.x + sp.radius * 0.7, sp.y + sp.radius * 0.5, sp.radius * 0.3, 0, Math.PI * 2);
          ctx.arc(sp.x - sp.radius * 0.6, sp.y + sp.radius * 0.4, sp.radius * 0.25, 0, Math.PI * 2);
          ctx.fill();
          ctx.restore();
        }
      });

      // Render Targets
      s.targets.forEach((t) => {
        ctx.save();
        if (t.sliced && t.pieces) {
          // Render two split halves flying apart
          t.pieces.forEach((p) => {
            ctx.save();
            ctx.translate(p.x, p.y);
            ctx.rotate(p.rot);
            if (t.fruitKind) {
              drawSlicedHalf(ctx, t.fruitKind, t.radius, p.half);
            }
            ctx.restore();
          });
        } else {
          // Render whole unsliced target or Boss
          ctx.translate(t.x, t.y);
          ctx.rotate(t.rotation);

          if (t.itemType === 'boss' && t.bossId) {
            drawCyberBoss(
              ctx,
              t.bossId,
              t.radius,
              t.bossHp || 1,
              t.bossMaxHp || 1,
              s.timeTick,
              t.hitFlash || 0
            );
          } else if (t.itemType === 'bomb') {
            // Draw unmistakable LETHAL CYBER BOMB
            drawCyberBomb(ctx, t.radius, s.timeTick);
          } else if (t.fruitKind) {
            // Draw rich fruit matching asset sheet
            drawWholeFruit(ctx, t.fruitKind, t.radius);
          }
        }
        ctx.restore();
      });

      // Render Juice Droplets Particles
      s.particles.forEach((p) => {
        ctx.save();
        ctx.fillStyle = p.color;
        ctx.globalAlpha = p.alpha;
        ctx.beginPath();
        ctx.arc(p.x, p.y, p.size, 0, Math.PI * 2);
        ctx.fill();
        ctx.restore();
      });

      // Render Laser Blade Trail
      if (s.trail.length > 1) {
        ctx.save();
        // Dynamic rainbow cycling if rainbow skin equipped
        const currentBladeColor = skin.includes('rainbow')
          ? `hsl(${(s.timeTick * 4) % 360}, 90%, 60%)`
          : bladeColor;

        // Outer glow
        ctx.strokeStyle = currentBladeColor;
        ctx.lineWidth = 7;
        ctx.lineCap = 'round';
        ctx.lineJoin = 'round';
        ctx.shadowColor = currentBladeColor;
        ctx.shadowBlur = 18;

        ctx.beginPath();
        ctx.moveTo(s.trail[0].x, s.trail[0].y);
        for (let i = 1; i < s.trail.length; i++) {
          ctx.lineTo(s.trail[i].x, s.trail[i].y);
        }
        ctx.stroke();

        // Inner white-hot laser core
        ctx.strokeStyle = '#ffffff';
        ctx.lineWidth = 2.5;
        ctx.stroke();
        ctx.restore();
      }

      // Freeze slow-mo icy border vignette
      if (s.isFrozen) {
        ctx.save();
        const borderGrad = ctx.createRadialGradient(
          width / 2,
          height / 2,
          Math.min(width, height) * 0.4,
          width / 2,
          height / 2,
          Math.max(width, height) * 0.7
        );
        borderGrad.addColorStop(0, 'rgba(56, 189, 248, 0)');
        borderGrad.addColorStop(1, 'rgba(56, 189, 248, 0.35)');
        ctx.fillStyle = borderGrad;
        ctx.fillRect(0, 0, width, height);
        ctx.restore();
      }

      // Restore screen shake coordinate transform
      ctx.restore();

      animId = requestAnimationFrame(updateAndDraw);
    };

    animId = requestAnimationFrame(updateAndDraw);

    return () => {
      window.removeEventListener('resize', resize);
      cancelAnimationFrame(animId);
    };
  }, [bridge, isEffectivelyPaused, onGameOver, speedMultiplier]);

  return (
    <div
      ref={containerRef}
      onPointerDown={handlePointerDown}
      onPointerMove={handlePointerMove}
      onPointerUp={handlePointerUp}
      onPointerCancel={handlePointerUp}
      className="relative w-full h-full flex items-center justify-center overflow-hidden touch-none cursor-crosshair select-none bg-slate-950"
    >
      <canvas ref={canvasRef} className="w-full h-full block" />

      {/* TOP FLOATING HUD */}
      <div className="absolute top-3 inset-x-3 sm:inset-x-5 flex items-start justify-between pointer-events-none z-10 gap-2">
        {/* Left: Score & Lives / Mode Info */}
        <div className="flex flex-col gap-1.5 pointer-events-auto">
          <div className="flex items-center gap-2">
            <div className="px-3 py-1.5 rounded-xl bg-slate-900/90 backdrop-blur-md border border-cyan-500/40 text-cyan-300 font-mono font-black text-xs sm:text-sm shadow-lg shadow-cyan-500/20">
              Điểm: {score.toLocaleString()}
            </div>

            {/* Lives Display (if not Zen mode) */}
            {gameMode !== 'zen' && (
              <div className="flex items-center gap-1 px-2.5 py-1.5 rounded-xl bg-slate-900/90 backdrop-blur-md border border-rose-500/40 shadow-lg">
                {Array.from({ length: 3 }).map((_, i) => (
                  <Heart
                    key={i}
                    className={`w-3.5 h-3.5 sm:w-4 sm:h-4 ${
                      i < lives ? 'text-rose-500 fill-rose-500' : 'text-slate-600'
                    }`}
                  />
                ))}
              </div>
            )}

            {/* Time Left (if Time Attack, Zen, or Boss Rush) */}
            {(gameMode === 'time_attack' || gameMode === 'zen' || gameMode === 'boss_rush') && (
              <div
                className={`flex items-center gap-1 px-2.5 py-1.5 rounded-xl backdrop-blur-md border font-mono font-bold text-xs ${
                  gameMode === 'boss_rush'
                    ? 'bg-rose-950/90 border-rose-500/50 text-rose-300 animate-pulse shadow-lg shadow-rose-950/50'
                    : 'bg-slate-900/90 border-cyan-500/40 text-cyan-300 shadow-lg'
                }`}
              >
                <Clock
                  className={`w-3.5 h-3.5 ${
                    gameMode === 'boss_rush' ? 'text-rose-400' : 'text-cyan-400'
                  }`}
                />
                <span>{timeLeft}s</span>
              </div>
            )}
          </div>

          {/* Quick Mode & Speed Switcher Buttons */}
          <div className="flex items-center gap-1.5">
            <button
              type="button"
              onClick={handleOpenModeModal}
              className="px-2.5 py-1 rounded-lg bg-slate-900/80 hover:bg-slate-800 border border-slate-700 text-slate-300 hover:text-white font-bold text-[11px] flex items-center gap-1 shadow-md cursor-pointer transition-all active:scale-95"
            >
              <Trophy className="w-3 h-3 text-amber-400" />
              <span>
                {gameMode === 'stage'
                  ? `Màn ${currentStage.id}`
                  : gameMode === 'classic'
                  ? 'Cổ Điển'
                  : gameMode === 'zen'
                  ? 'Zen Thư Giãn'
                  : gameMode === 'boss_rush'
                  ? 'Boss Rush'
                  : 'Đua 60s'}
              </span>
            </button>

            <button
              type="button"
              onClick={() => {
                const nextSpeed =
                  speedMultiplier === 0.75 ? 1.0 : speedMultiplier === 1.0 ? 1.25 : 0.75;
                handleSetSpeed(nextSpeed);
              }}
              className="px-2 py-1 rounded-lg bg-slate-900/80 hover:bg-slate-800 border border-slate-700 text-slate-300 hover:text-white font-bold text-[11px] flex items-center gap-1 shadow-md cursor-pointer transition-all active:scale-95"
            >
              <Sliders className="w-3 h-3 text-emerald-400" />
              <span>{speedMultiplier === 0.75 ? '75% Chậm' : speedMultiplier === 1.0 ? '100% Chuẩn' : '125% Nhanh'}</span>
            </button>
          </div>
        </div>

        {/* Center: BOSS RUSH BOSS HEALTH BAR HUD (if in 'boss_rush' mode) */}
        {gameMode === 'boss_rush' && bossData && (
          <div className="flex flex-col items-center gap-1 pointer-events-auto max-w-xs sm:max-w-sm w-full mx-2">
            <div className="w-full bg-slate-950/95 backdrop-blur-md px-3 py-1.5 rounded-2xl border border-rose-500/60 shadow-2xl shadow-rose-950/60 flex flex-col gap-1">
              <div className="flex items-center justify-between text-xs">
                <div className="flex items-center gap-1.5 font-black text-rose-300">
                  <Swords className="w-3.5 h-3.5 text-amber-400 animate-spin" />
                  <span className="text-[11px] sm:text-xs tracking-wide truncate max-w-[160px] sm:max-w-[200px]">
                    {bossData.boss.title} - {bossData.boss.name}
                  </span>
                </div>
                <span className="text-[11px] font-mono font-extrabold text-amber-300 shrink-0">
                  {bossData.hp} / {bossData.maxHp} HP
                </span>
              </div>

              {/* Boss HP Gauge Bar */}
              <div className="w-full h-3 bg-slate-900 rounded-full overflow-hidden border border-rose-600/60 p-0.5">
                <div
                  className="h-full rounded-full bg-gradient-to-r from-amber-500 via-rose-500 to-red-600 transition-all duration-150 shadow-[0_0_10px_rgba(244,63,94,0.8)]"
                  style={{ width: `${Math.max(0, (bossData.hp / bossData.maxHp) * 100)}%` }}
                />
              </div>

              <div className="flex items-center justify-between text-[10px] text-slate-400">
                <span className="text-amber-400 font-bold">
                  TẦNG {bossData.phase} / 3
                </span>
                <span className="italic text-rose-300/80 truncate ml-2">
                  "{bossData.boss.dialogue}"
                </span>
              </div>
            </div>
          </div>
        )}

        {/* Center / Right: STAGE TARGET OBJECTIVES HUD (if in 'stage' mode) */}
        {gameMode === 'stage' && activeObjectives.length > 0 && (
          <div className="flex flex-col items-end gap-1 pointer-events-auto">
            <div className="flex items-center gap-1.5 bg-slate-900/90 backdrop-blur-md px-3 py-1.5 rounded-2xl border border-amber-500/40 shadow-xl max-w-[220px] sm:max-w-xs">
              <div className="text-[10px] font-black text-amber-400 uppercase tracking-wider flex items-center gap-1 shrink-0">
                <Target className="w-3.5 h-3.5" />
                <span className="hidden sm:inline">Mục tiêu:</span>
              </div>

              <div className="flex flex-wrap items-center gap-1.5 justify-end">
                {activeObjectives.map((obj, i) => {
                  const isDone =
                    obj.type === 'no_bomb'
                      ? !stateRef.current.bombSlicedThisGame
                      : obj.current >= obj.target;

                  return (
                    <div
                      key={i}
                      className={`px-2 py-0.5 rounded-lg border flex items-center gap-1 text-[11px] font-bold font-mono transition-all ${
                        isDone
                          ? 'bg-emerald-950/80 border-emerald-500/60 text-emerald-300'
                          : 'bg-slate-950/70 border-slate-700 text-slate-200'
                      }`}
                    >
                      <span>{obj.icon}</span>
                      <span>
                        {obj.current}/{obj.target}
                      </span>
                      {isDone && <CheckCircle2 className="w-3 h-3 text-emerald-400" />}
                    </div>
                  );
                })}
              </div>
            </div>

            <button
              type="button"
              onClick={handleOpenStageSelect}
              className="text-[10px] font-bold text-amber-300 hover:text-white flex items-center gap-1 bg-slate-900/60 px-2 py-0.5 rounded-md border border-amber-500/20 cursor-pointer"
            >
              <span>Đổi Màn Chơi</span>
            </button>
          </div>
        )}

        {/* Right: Fever Gauge */}
        <div className="flex items-center gap-2 bg-slate-900/80 backdrop-blur-md px-3 py-1.5 rounded-xl border border-purple-500/40 pointer-events-auto">
          <Flame
            className={`w-4 h-4 ${
              isFever ? 'text-amber-400 animate-bounce' : 'text-purple-400'
            }`}
          />
          <div className="w-20 sm:w-28 h-2.5 bg-slate-950 rounded-full overflow-hidden border border-purple-500/50">
            <div
              className={`h-full transition-all duration-150 ${
                isFever
                  ? 'bg-gradient-to-r from-amber-400 to-rose-500 animate-pulse'
                  : 'bg-gradient-to-r from-purple-500 to-cyan-400'
              }`}
              style={{ width: `${feverEnergy}%` }}
            />
          </div>
          {isFever && (
            <span className="text-[10px] font-extrabold text-amber-300 animate-pulse hidden sm:inline">
              FEVER x2!
            </span>
          )}
        </div>
      </div>

      {/* THANH HIỆU ỨNG (EFFECT BAR) ROW */}
      <div className="absolute top-16 sm:top-14 inset-x-3 sm:inset-x-5 flex justify-center pointer-events-none z-10">
        <EffectBar effects={activeEffects} />
      </div>

      {/* Warning Legend Strip at bottom center */}
      <div className="absolute bottom-3 inset-x-0 flex justify-center pointer-events-none z-10">
        <div className="px-3 py-1 rounded-full bg-slate-950/70 backdrop-blur-sm border border-slate-800/80 flex items-center gap-3 text-[10px] text-slate-400">
          <span className="flex items-center gap-1 text-emerald-400 font-bold">
            <span>🍉 🍍 🍌 🍊 🍎</span>
            <span>= Chém Quả</span>
          </span>
          <span>•</span>
          <span className="flex items-center gap-1 text-rose-400 font-bold">
            <span>☠️ BOM GAI</span>
            <span>= NÉ TRÁNH!</span>
          </span>
        </div>
      </div>

      {/* Subtle Floating Slice Score / Alert */}
      {comboText && (
        <div
          key={comboText.id}
          className="absolute z-20 pointer-events-none text-xs sm:text-sm font-black font-mono drop-shadow-[0_2px_4px_rgba(0,0,0,0.9)] transition-all animate-bounce"
          style={{
            left: Math.min(
              window.innerWidth - 120,
              Math.max(20, comboText.x - 30)
            ),
            top: Math.max(70, comboText.y - 25),
            color: comboText.color || '#fbbf24',
          }}
        >
          {comboText.text}
        </div>
      )}

      {/* Mode Select Modal */}
      {showModeModal && (
        <ModeSelectModal
          currentMode={gameMode}
          speedMultiplier={speedMultiplier}
          onSelectMode={(m) => {
            setGameMode(m);
            resetGameSession(m, currentStage);
            setShowModeModal(false);
          }}
          onSelectSpeed={handleSetSpeed}
          onOpenStageSelect={() => {
            setShowModeModal(false);
            handleOpenStageSelect();
          }}
          onClose={handleCloseModeModal}
        />
      )}

      {/* Stage Select Modal */}
      {showStageSelect && (
        <StageSelectModal
          onSelectStage={(stage) => {
            setCurrentStage(stage);
            setGameMode('stage');
            resetGameSession('stage', stage);
            setShowStageSelect(false);
          }}
          onClose={handleCloseStageSelect}
        />
      )}

      {/* Stage Complete / Defeat Modal */}
      {stageResult && (
        <StageCompleteModal
          isVictory={stageResult.isVictory}
          stage={stageResult.stage}
          score={stageResult.score}
          stars={stageResult.stars}
          objectives={stageResult.objectives}
          coinsEarned={stageResult.coinsEarned}
          onNextStage={() => {
            const nextId = stageResult.stage.id + 1;
            const next = CYBER_SLICE_STAGES.find((s) => s.id === nextId);
            if (next) {
              setCurrentStage(next);
              resetGameSession('stage', next);
            } else {
              handleOpenStageSelect();
            }
          }}
          onRetry={() => {
            resetGameSession('stage', stageResult.stage);
          }}
          onStageSelect={() => {
            setStageResult(null);
            handleOpenStageSelect();
          }}
          onBackToMenu={() => {
            setStageResult(null);
            handleOpenModeModal();
          }}
        />
      )}

      {/* Boss Rush Complete / Defeat Modal */}
      {bossRushResult && (
        <StageCompleteModal
          isVictory={bossRushResult.isVictory}
          stage={{
            id: 99,
            name: 'Boss Rush Cyber',
            chapter: 'Đại Chiến Trùm',
            allowedFruits: ['watermelon', 'pineapple', 'banana'],
            bombChance: 0.3,
            objectives: [],
            starScores: [5000, 10000, 20000],
            speedMultiplier: 1.1,
            description: 'Chế độ Trảm Trùm Cyber khốc liệt',
          }}
          score={bossRushResult.score}
          stars={bossRushResult.stars}
          objectives={[]}
          coinsEarned={bossRushResult.coinsEarned}
          mode="boss_rush"
          bossDefeatedCount={bossRushResult.bossDefeatedCount}
          currentBossName={bossRushResult.currentBossName}
          onNextStage={() => {
            resetGameSession('boss_rush');
          }}
          onRetry={() => {
            resetGameSession('boss_rush');
          }}
          onStageSelect={() => {
            setBossRushResult(null);
            handleOpenModeModal();
          }}
          onBackToMenu={() => {
            setBossRushResult(null);
            handleOpenModeModal();
          }}
        />
      )}
    </div>
  );
};
