import React, { useState, useEffect, useCallback, useRef } from 'react';
import { GameComponentProps } from '../../types';
import {
  HexTile,
  TileColor,
  SpecialType,
  ObstacleType,
  LevelConfig,
  LevelTarget,
  Booster,
  BoosterType,
  PopEffect,
  HEX_COLORS,
} from './types';
import { HEX_LEVELS } from './levels';
import { TargetBar } from './TargetBar';
import { HexBoard } from './HexBoard';
import { BoosterBar } from './BoosterBar';
import { HexVFX } from './HexVFX';
import { LevelSelectModal } from './LevelSelectModal';
import { LevelResultModal } from './LevelResultModal';
import { HexBoosterShopModal } from './HexBoosterShopModal';
import { LevelMiniLeaderboard } from './LevelMiniLeaderboard';
import { getStoredHexBoosters, saveStoredHexBoosters } from './boosterData';
import {
  Play,
  RotateCcw,
  Sparkles,
  Trophy,
  Home,
  Map,
  Compass,
  ShoppingBag,
  Sliders,
  X,
} from 'lucide-react';

const ROWS = 8;
const COLS = 7;

export const HexMatchGame: React.FC<GameComponentProps> = ({
  bridge,
  isPaused,
  onGameOver,
}) => {
  // Navigation & Level State
  const [inMenu, setInMenu] = useState<boolean>(true);
  const [currentLevel, setCurrentLevel] = useState<LevelConfig>(HEX_LEVELS[0]);
  const [unlockedLevel, setUnlockedLevel] = useState<number>(() => {
    try {
      const saved = localStorage.getItem('arcadex_hex_unlocked_lvl');
      return saved ? Math.min(150, Math.max(1, parseInt(saved, 10))) : 1;
    } catch {
      return 1;
    }
  });
  const [levelStars, setLevelStars] = useState<Record<number, number>>(() => {
    try {
      const saved = localStorage.getItem('arcadex_hex_stars');
      return saved ? JSON.parse(saved) : {};
    } catch {
      return {};
    }
  });
  const [showLevelSelect, setShowLevelSelect] = useState<boolean>(false);
  const [levelResult, setLevelResult] = useState<{
    show: boolean;
    isWin: boolean;
    stars: number;
  } | null>(null);

  // Gameplay State
  const [grid, setGrid] = useState<HexTile[][]>([]);
  const [score, setScore] = useState<number>(0);
  const [movesLeft, setMovesLeft] = useState<number>(25);
  const [timeLeft, setTimeLeft] = useState<number>(60);
  const [combo, setCombo] = useState<number>(1);
  const [comboTimer, setComboTimer] = useState<NodeJS.Timeout | null>(null);
  const [targets, setTargets] = useState<LevelTarget[]>([]);
  const [shakeTile, setShakeTile] = useState<{ r: number; c: number } | null>(null);
  const [effects, setEffects] = useState<PopEffect[]>([]);
  const [isProcessing, setIsProcessing] = useState<boolean>(false);

  // Boosters State synced with persistent storage
  const [storedBoosters, setStoredBoosters] = useState(() => getStoredHexBoosters());
  const [activeBooster, setActiveBooster] = useState<BoosterType | null>(null);
  const [showBoosterShop, setShowBoosterShop] = useState<boolean>(false);
  const [showLevelLeaderboard, setShowLevelLeaderboard] = useState<boolean>(false);

  // Touch Sensitivity state
  const [touchSensitivity, setTouchSensitivity] = useState<'tight' | 'standard' | 'spacious'>(() => {
    return (localStorage.getItem('arcadex_hex_touch_sensitivity') as any) || 'standard';
  });

  // Listen for sensitivity and booster external updates
  useEffect(() => {
    const handleSensitivity = (e: any) => {
      if (e?.detail) setTouchSensitivity(e.detail);
    };
    const handleBoostersUpdate = () => {
      setStoredBoosters(getStoredHexBoosters());
    };

    window.addEventListener('arcadex_sensitivity_changed', handleSensitivity);
    window.addEventListener('arcadex_hex_boosters_updated', handleBoostersUpdate);
    return () => {
      window.removeEventListener('arcadex_sensitivity_changed', handleSensitivity);
      window.removeEventListener('arcadex_hex_boosters_updated', handleBoostersUpdate);
    };
  }, []);

  const boosters: Booster[] = [
    { id: 'hammer', name: 'Búa Kẹo', icon: '🔨', description: 'Đập vỡ 1 viên kẹo hoặc vật cản', count: storedBoosters.hammer },
    { id: 'rocket', name: 'Kẹo Sọc', icon: '⚡', description: 'Bắn phá cả 1 hàng ngang', count: storedBoosters.rocket },
    { id: 'color_bomb', name: 'Cầu Vồng', icon: '💣', description: 'Quét sạch 1 màu kẹo trên bàn', count: storedBoosters.color_bomb },
    { id: 'shuffle', name: 'Xáo Trộn', icon: '🔄', description: 'Đảo vị trí toàn bộ kẹo', count: storedBoosters.shuffle },
  ];

  // Helper: Add visual effect with automatic cleanup
  const addEffect = useCallback((effect: Omit<PopEffect, 'id'>) => {
    const id = `fx-${Date.now()}-${Math.random()}`;
    setEffects((prev) => [...prev, { ...effect, id }]);
    setTimeout(() => {
      setEffects((prev) => prev.filter((e) => e.id !== id));
    }, 1100);
  }, []);

  // Board Initializer
  const initializeGrid = useCallback((level: LevelConfig) => {
    const activeColors = level.colors || HEX_COLORS.slice(0, 4);
    const presetObstacles = level.boardPreset?.obstacles || [];
    const obstacleMap: Record<string, ObstacleType> = {};
    presetObstacles.forEach((o) => {
      obstacleMap[`${o.r},${o.c}`] = o.type;
    });

    const newGrid: HexTile[][] = [];
    for (let r = 0; r < ROWS; r++) {
      const row: HexTile[] = [];
      for (let c = 0; c < COLS; c++) {
        const obsType = obstacleMap[`${r},${c}`] || 'none';
        const color = activeColors[Math.floor(Math.random() * activeColors.length)];
        row.push({
          id: `tile-${r}-${c}-${Date.now()}-${Math.random()}`,
          r,
          c,
          color,
          special: 'none',
          obstacle: obsType,
          isPopping: false,
          isDropping: false,
        });
      }
      newGrid.push(row);
    }
    return newGrid;
  }, []);

  // Start / Load a Level
  const startLevel = useCallback(
    (levelConfig: LevelConfig) => {
      setCurrentLevel(levelConfig);
      setScore(0);
      setCombo(1);
      setActiveBooster(null);
      setLevelResult(null);
      setIsProcessing(false);
      setInMenu(false);

      if (levelConfig.gameplayType === 'time') {
        setTimeLeft(levelConfig.timeLimit || 60);
      } else {
        setMovesLeft(levelConfig.moves || 25);
      }

      setTargets(levelConfig.targets.map((t) => ({ ...t, current: 0 })));
      setGrid(initializeGrid(levelConfig));
    },
    [initializeGrid]
  );

  // Countdown timer for Time Attack levels
  useEffect(() => {
    if (inMenu || isPaused || currentLevel.gameplayType !== 'time' || levelResult) return;

    const timer = setInterval(() => {
      setTimeLeft((prev) => {
        if (prev <= 1) {
          clearInterval(timer);
          // Check if targets were met before timing out
          setTargets((curTargets) => {
            const allMet = curTargets.every((t) => t.current >= t.target);
            if (allMet) {
              handleWin(score, curTargets);
            } else {
              bridge.playSound('gameOver');
              setLevelResult({
                show: true,
                isWin: false,
                stars: 0,
              });
            }
            return curTargets;
          });
          return 0;
        }
        return prev - 1;
      });
    }, 1000);

    return () => clearInterval(timer);
  }, [inMenu, isPaused, currentLevel.gameplayType, levelResult, score, bridge]);

  // Hex Neighbors (odd-r offset grid coordinate system)
  const getNeighbors = (r: number, c: number): { r: number; c: number }[] => {
    const isOdd = r % 2 === 1;
    const candidates = [
      { r: r - 1, c: isOdd ? c : c - 1 },
      { r: r - 1, c: isOdd ? c + 1 : c },
      { r, c: c - 1 },
      { r, c: c + 1 },
      { r: r + 1, c: isOdd ? c : c - 1 },
      { r: r + 1, c: isOdd ? c + 1 : c },
    ];
    return candidates.filter((n) => n.r >= 0 && n.r < ROWS && n.c >= 0 && n.c < COLS);
  };

  // Find connected cluster using BFS
  const findCluster = (
    startR: number,
    startC: number,
    currentGrid: HexTile[][]
  ): { r: number; c: number }[] => {
    const target = currentGrid[startR]?.[startC];
    if (!target || target.obstacle === 'stone') return [];

    const targetColor = target.color;
    const cluster: { r: number; c: number }[] = [];
    const queue: { r: number; c: number }[] = [{ r: startR, c: startC }];
    const visited = new Set<string>();
    visited.add(`${startR},${startC}`);

    while (queue.length > 0) {
      const current = queue.shift()!;
      cluster.push(current);

      const neighbors = getNeighbors(current.r, current.c);
      for (const n of neighbors) {
        const neighborTile = currentGrid[n.r]?.[n.c];
        if (
          neighborTile &&
          neighborTile.color === targetColor &&
          neighborTile.obstacle !== 'stone'
        ) {
          if (!visited.has(`${n.r},${n.c}`)) {
            visited.add(`${n.r},${n.c}`);
            queue.push(n);
          }
        }
      }
    }

    return cluster;
  };

  // Handle Level Victory
  const handleWin = (finalScore: number, finalTargets: LevelTarget[]) => {
    const starsArr = currentLevel.stars;
    const starsEarned =
      finalScore >= starsArr[2] ? 3 : finalScore >= starsArr[1] ? 2 : 1;

    // Save star rating
    setLevelStars((prev) => {
      const next = { ...prev, [currentLevel.id]: Math.max(prev[currentLevel.id] || 0, starsEarned) };
      try {
        localStorage.setItem('arcadex_hex_stars', JSON.stringify(next));
      } catch {}
      return next;
    });

    // Unlock next level (up to 150)
    const nextLvlNum = currentLevel.id + 1;
    if (nextLvlNum > unlockedLevel && nextLvlNum <= HEX_LEVELS.length) {
      setUnlockedLevel(nextLvlNum);
      try {
        localStorage.setItem('arcadex_hex_unlocked_lvl', nextLvlNum.toString());
      } catch {}
    }

    bridge.playSound('levelUp');
    bridge.reportProgress('ach-hex-1000', finalScore, true);

    setLevelResult({
      show: true,
      isWin: true,
      stars: starsEarned,
    });
  };

  // Check Win / Loss Condition
  const checkLevelCompletion = (
    currentScore: number,
    remainingMoves: number,
    updatedTargets: LevelTarget[]
  ) => {
    // Check if all targets met
    const allTargetsMet = updatedTargets.every((t) => t.current >= t.target);

    if (allTargetsMet) {
      handleWin(currentScore, updatedTargets);
    } else if (currentLevel.gameplayType !== 'time' && remainingMoves <= 0) {
      bridge.playSound('gameOver');
      setLevelResult({
        show: true,
        isWin: false,
        stars: 0,
      });
    }
  };

  // Main Match Execution: Step-by-step VFX, Pop, and Refill Sequence
  const executeMatch = (
    cluster: { r: number; c: number }[],
    clickR: number,
    clickC: number,
    clientX: number,
    clientY: number
  ) => {
    if (isProcessing) return;
    setIsProcessing(true);

    const clickedTile = grid[clickR][clickC];
    const matchSize = cluster.length;
    const isSpecialCreation = matchSize >= 4;

    // Determine created special
    let createdSpecial: SpecialType = 'none';
    if (matchSize === 4) createdSpecial = 'rocket_h';
    else if (matchSize === 5) createdSpecial = 'bomb';
    else if (matchSize >= 6) createdSpecial = 'rainbow';

    // Calculate score
    const basePts = matchSize * 25;
    const comboPts = basePts * combo;
    const nextScore = score + comboPts;
    setScore(nextScore);

    // Audio SFX based on combo/size
    if (combo >= 3 || matchSize >= 5) {
      bridge.playSound('explosion');
    } else {
      bridge.playSound('pop');
    }

    // Floating score popup (strictly within screen boundaries)
    addEffect({
      x: clientX,
      y: clientY,
      text: `+${comboPts}`,
      color: clickedTile.color,
      type: 'score',
    });

    // Combo / Match Announcements
    if (combo >= 2 || matchSize >= 5) {
      const compliments = ['SWEET! 🍬', 'TASTY! 🍓', 'DELICIOUS! 🍰', 'SUGAR CRUSH! 💥'];
      const compliment = compliments[Math.min(compliments.length - 1, combo - 1)];
      addEffect({
        x: clientX,
        y: clientY,
        text: `${compliment} x${combo}`,
        color: clickedTile.color,
        type: 'combo',
      });
    }

    // 1. Mark matched tiles as isPopping to animate shrinking and dissolve
    setGrid((prev) =>
      prev.map((row) =>
        row.map((tile) => {
          const isMatched = cluster.some((p) => p.r === tile.r && p.c === tile.c);
          return isMatched ? { ...tile, isPopping: true } : tile;
        })
      )
    );

    // Collect targeted colors & obstacles
    let clearedIce = 0;
    let clearedStone = 0;
    let clearedChain = 0;

    // Find adjacent positions for damaging surrounding obstacles (ice & stone)
    const adjacentPositions: { r: number; c: number }[] = [];
    cluster.forEach((pos) => {
      const neighbors = getNeighbors(pos.r, pos.c);
      neighbors.forEach((n) => {
        if (!cluster.some((p) => p.r === n.r && p.c === n.c)) {
          adjacentPositions.push(n);
        }
      });
    });

    // 2. Wait 240ms for the Pop Animation to play out, then apply Gravity & Refill
    setTimeout(() => {
      setGrid((prevGrid) => {
        const copy: (HexTile | null)[][] = prevGrid.map((row) =>
          row.map((t) => ({ ...t, isPopping: false }))
        );

        // Clear matched tiles
        cluster.forEach((pos) => {
          const tile = copy[pos.r][pos.c];
          if (!tile) return;

          if (tile.obstacle === 'ice') clearedIce++;
          if (tile.obstacle === 'chain') clearedChain++;

          if (pos.r === clickR && pos.c === clickC && isSpecialCreation) {
            // Replace with special tile instead of empty
            copy[pos.r][pos.c] = {
              ...tile,
              special: createdSpecial,
              obstacle: 'none',
              isPopping: false,
              isDropping: false,
            };
          } else {
            copy[pos.r][pos.c] = null;
          }
        });

        // Damage adjacent obstacles
        adjacentPositions.forEach((pos) => {
          const tile = copy[pos.r]?.[pos.c];
          if (!tile) return;

          if (tile.obstacle === 'ice') {
            tile.obstacle = 'none';
            clearedIce++;
          } else if (tile.obstacle === 'stone') {
            tile.obstacle = 'none';
            clearedStone++;
          }
        });

        // Gravity: drop tiles down per column and refill from top
        const nextResult: HexTile[][] = [];
        for (let r = 0; r < ROWS; r++) {
          nextResult.push(new Array(COLS));
        }

        const activeColors = currentLevel.colors || HEX_COLORS.slice(0, 4);

        for (let c = 0; c < COLS; c++) {
          const remaining: HexTile[] = [];
          for (let r = 0; r < ROWS; r++) {
            if (copy[r][c] !== null) {
              remaining.push(copy[r][c]!);
            }
          }

          const missing = ROWS - remaining.length;
          const newTiles: HexTile[] = [];
          for (let m = 0; m < missing; m++) {
            newTiles.push({
              id: `tile-${m}-${c}-${Date.now()}-${Math.random()}`,
              r: m,
              c,
              color: activeColors[Math.floor(Math.random() * activeColors.length)],
              special: 'none',
              obstacle: 'none',
              isDropping: true,
            });
          }

          const fullCol = [...newTiles, ...remaining];
          fullCol.forEach((t, r) => {
            nextResult[r][c] = { ...t, r, c, isDropping: true };
          });
        }

        return nextResult;
      });

      // Update target objectives
      const updatedTargets = targets.map((tgt) => {
        let current = tgt.current;
        if (tgt.type === 'collect_color' && tgt.color === clickedTile.color) {
          current += matchSize;
        } else if (tgt.type === 'clear_ice') {
          current += clearedIce;
        } else if (tgt.type === 'clear_stone') {
          current += clearedStone;
        } else if (tgt.type === 'clear_chain') {
          current += clearedChain;
        } else if (tgt.type === 'score') {
          current = nextScore;
        }
        return { ...tgt, current: Math.min(tgt.target, current) };
      });

      setTargets(updatedTargets);

      // Decrement move strictly (clamped at 0)
      let nextMoves = movesLeft;
      if (currentLevel.gameplayType !== 'time') {
        nextMoves = Math.max(0, movesLeft - 1);
        setMovesLeft(nextMoves);
      }

      // Combo management
      setCombo((prev) => Math.min(prev + 1, 6));
      if (comboTimer) clearTimeout(comboTimer);
      const newTimer = setTimeout(() => {
        setCombo(1);
      }, 2500);
      setComboTimer(newTimer);

      // Settle drop animations and unlock processing
      setTimeout(() => {
        setGrid((prev) =>
          prev.map((row) =>
            row.map((t) => ({ ...t, isDropping: false, isPopping: false }))
          )
        );
        setIsProcessing(false);
        checkLevelCompletion(nextScore, nextMoves, updatedTargets);
      }, 300);
    }, 240);
  };

  // Trigger Special Tile (Rocket, Bomb, Rainbow)
  const triggerSpecialTile = (r: number, c: number, clientX: number, clientY: number) => {
    if (isProcessing) return;
    const tile = grid[r][c];
    if (tile.special === 'none') return;

    bridge.playSound('powerup');
    const toClear: { r: number; c: number }[] = [];

    if (tile.special === 'rocket_h') {
      addEffect({ x: clientX, y: clientY, type: 'rocket' });
      for (let col = 0; col < COLS; col++) {
        toClear.push({ r, c: col });
      }
    } else if (tile.special === 'bomb') {
      addEffect({ x: clientX, y: clientY, text: 'BOOM! 💥', type: 'combo', color: '#f43f5e' });
      for (let dr = -1; dr <= 1; dr++) {
        for (let dc = -1; dc <= 1; dc++) {
          const nr = r + dr;
          const nc = c + dc;
          if (nr >= 0 && nr < ROWS && nc >= 0 && nc < COLS) {
            toClear.push({ r: nr, c: nc });
          }
        }
      }
    } else if (tile.special === 'rainbow') {
      addEffect({ x: clientX, y: clientY, type: 'rainbow' });
      const targetColor = tile.color;
      for (let row = 0; row < ROWS; row++) {
        for (let col = 0; col < COLS; col++) {
          if (grid[row][col].color === targetColor) {
            toClear.push({ r: row, c: col });
          }
        }
      }
    }

    if (toClear.length > 0) {
      executeMatch(toClear, r, c, clientX, clientY);
    }
  };

  // Handle Booster Application
  const applyBooster = (
    boosterType: BoosterType,
    r: number,
    c: number,
    clientX: number,
    clientY: number
  ) => {
    const updated = {
      ...storedBoosters,
      [boosterType]: Math.max(0, (storedBoosters[boosterType] || 0) - 1),
    };
    setStoredBoosters(updated);
    saveStoredHexBoosters(updated);
    setActiveBooster(null);

    if (boosterType === 'hammer') {
      bridge.playSound('hit');
      addEffect({ x: clientX, y: clientY, text: '🔨 CRASH!', color: '#fbbf24', type: 'combo' });
      executeMatch([{ r, c }], r, c, clientX, clientY);
    } else if (boosterType === 'rocket') {
      bridge.playSound('laser');
      addEffect({ x: clientX, y: clientY, type: 'rocket' });
      const rowTiles = [];
      for (let col = 0; col < COLS; col++) rowTiles.push({ r, c: col });
      executeMatch(rowTiles, r, c, clientX, clientY);
    } else if (boosterType === 'color_bomb') {
      bridge.playSound('explosion');
      addEffect({ x: clientX, y: clientY, type: 'rainbow' });
      const targetColor = grid[r][c].color;
      const sameColorTiles = [];
      for (let row = 0; row < ROWS; row++) {
        for (let col = 0; col < COLS; col++) {
          if (grid[row][col].color === targetColor) {
            sameColorTiles.push({ r: row, c: col });
          }
        }
      }
      executeMatch(sameColorTiles, r, c, clientX, clientY);
    } else if (boosterType === 'shuffle') {
      bridge.playSound('click');
      addEffect({ x: clientX, y: clientY, text: '🔄 SHUFFLE!', color: '#10b981', type: 'combo' });
      const activeColors = currentLevel.colors || HEX_COLORS.slice(0, 4);
      setGrid((prev) =>
        prev.map((row) =>
          row.map((t) =>
            t.obstacle === 'stone'
              ? t
              : { ...t, color: activeColors[Math.floor(Math.random() * activeColors.length)] }
          )
        )
      );
    }
  };

  // Main Tile Click Handler
  const handleTileClick = (r: number, c: number, clientX: number, clientY: number) => {
    if (isPaused || inMenu || levelResult || isProcessing) return;

    // Check move availability before proceeding
    if (currentLevel.gameplayType !== 'time' && movesLeft <= 0) return;

    if (activeBooster) {
      applyBooster(activeBooster, r, c, clientX, clientY);
      return;
    }

    const clickedTile = grid[r]?.[c];
    if (!clickedTile) return;

    // Special item activation
    if (clickedTile.special !== 'none') {
      triggerSpecialTile(r, c, clientX, clientY);
      return;
    }

    // Find cluster of identical candies
    const cluster = findCluster(r, c, grid);

    if (cluster.length < 3) {
      bridge.playSound('click');
      setShakeTile({ r, c });
      setTimeout(() => setShakeTile(null), 400);

      addEffect({
        x: clientX,
        y: clientY - 15,
        text: 'Cần ≥3 viên kẹo cùng màu!',
        type: 'invalid',
      });
      return;
    }

    executeMatch(cluster, r, c, clientX, clientY);
  };

  // --- MENU VIEW ---
  if (inMenu) {
    const totalStarsCollected = Object.values(levelStars).reduce((a, b) => a + b, 0);

    return (
      <div className="relative w-full h-full max-w-lg mx-auto flex flex-col items-center justify-between p-4 sm:p-6 select-none bg-gradient-to-b from-[#080c18] to-[#04060d] text-white overflow-y-auto">
        {/* Menu Header */}
        <div className="text-center space-y-2 mt-3">
          <div className="inline-flex p-3 rounded-3xl bg-gradient-to-tr from-pink-500 via-rose-500 to-amber-300 shadow-xl shadow-pink-500/25 mb-2">
            <Sparkles className="w-8 h-8 text-white animate-pulse" />
          </div>
          <h1 className="text-3xl sm:text-4xl font-black font-display tracking-tight text-transparent bg-clip-text bg-gradient-to-r from-pink-400 via-amber-300 to-cyan-300 drop-shadow-md">
            Candy Hex Match
          </h1>
          <p className="text-xs sm:text-sm text-slate-300 max-w-xs mx-auto font-medium">
            150 Màn Chơi Chinh Phục: Đua Giờ 🕒, Cứu Gấu Băng 🧊, Đập Chocolate 🍫 & Mở Khóa Quà 🎁!
          </p>
        </div>

        {/* Level & Star Progress Badge */}
        <div className="flex items-center gap-3 px-4 py-2 rounded-2xl bg-slate-900/90 border border-slate-700/80 shadow-lg">
          <div className="flex items-center gap-1 text-amber-300 font-black text-sm">
            <Trophy className="w-4 h-4 text-amber-400" />
            <span>Màn {unlockedLevel}/150</span>
          </div>
          <div className="h-4 w-[1px] bg-slate-700" />
          <div className="flex items-center gap-1 text-pink-300 font-black text-sm">
            <Sparkles className="w-4 h-4 text-pink-400" />
            <span>{totalStarsCollected} / 450 Sao</span>
          </div>
        </div>

        {/* Game Mode Selector Cards */}
        <div className="w-full space-y-2.5 my-auto max-w-sm">
          {/* Continue Campaign Button */}
          <button
            type="button"
            onClick={() => startLevel(HEX_LEVELS[unlockedLevel - 1] || HEX_LEVELS[0])}
            className="w-full p-4 rounded-2xl bg-gradient-to-r from-pink-600 via-rose-600 to-amber-500 hover:from-pink-500 hover:to-amber-400 text-white font-black text-base flex items-center justify-between shadow-lg shadow-pink-600/30 active:scale-95 transition-all cursor-pointer border border-pink-400/30"
          >
            <div className="flex items-center gap-3">
              <div className="p-2 rounded-xl bg-white/20">
                <Play className="w-5 h-5 fill-white" />
              </div>
              <div className="text-left">
                <div>Tiếp Tục Chơi</div>
                <div className="text-[11px] text-pink-100 font-medium">
                  {HEX_LEVELS[unlockedLevel - 1]?.name || `Màn ${unlockedLevel}`}
                </div>
              </div>
            </div>
            <Play className="w-5 h-5 fill-white" />
          </button>

          {/* Level Map (150 Levels) */}
          <button
            type="button"
            onClick={() => setShowLevelSelect(true)}
            className="w-full p-3.5 rounded-2xl bg-slate-900/90 hover:bg-slate-800 border border-slate-700 text-slate-200 font-bold text-sm flex items-center justify-between active:scale-95 transition-all cursor-pointer"
          >
            <div className="flex items-center gap-2.5">
              <Map className="w-4 h-4 text-cyan-400" />
              <span>Bản Đồ 150 Màn Chơi</span>
            </div>
            <span className="text-xs text-pink-300 font-semibold">15 Chương</span>
          </button>

          {/* Quick Booster Shop & Sensitivity Row in Menu */}
          <div className="grid grid-cols-2 gap-2">
            <button
              type="button"
              onClick={() => setShowBoosterShop(true)}
              className="p-3 rounded-2xl bg-gradient-to-br from-amber-950/40 to-slate-900 hover:bg-amber-950/60 border border-amber-500/40 text-amber-300 font-bold text-xs flex items-center justify-center gap-2 active:scale-95 transition-all cursor-pointer shadow-md"
            >
              <ShoppingBag className="w-4 h-4 text-amber-400" />
              <span>Shop Trợ Lực</span>
            </button>

            <button
              type="button"
              onClick={() => {
                const nextSens =
                  touchSensitivity === 'tight'
                    ? 'standard'
                    : touchSensitivity === 'standard'
                    ? 'spacious'
                    : 'tight';
                setTouchSensitivity(nextSens);
                localStorage.setItem('arcadex_hex_touch_sensitivity', nextSens);
              }}
              className="p-3 rounded-2xl bg-slate-900/90 hover:bg-slate-800 border border-slate-700 text-slate-300 font-bold text-xs flex items-center justify-center gap-2 active:scale-95 transition-all cursor-pointer"
            >
              <Sliders className="w-4 h-4 text-emerald-400" />
              <span className="truncate">
                Độ nhạy: {touchSensitivity === 'tight' ? 'Nhỏ' : touchSensitivity === 'standard' ? 'Chuẩn' : 'Lớn'}
              </span>
            </button>
          </div>
        </div>

        {/* Tip footer */}
        <div className="text-[11px] text-slate-400 text-center pb-2">
          💡 Chạm vào cụm từ 3 viên kẹo cùng màu để ăn điểm. Cụm 4-5 viên tạo Kẹo Sọc & Bom Nổ!
        </div>

        {/* Level Select Modal */}
        {showLevelSelect && (
          <LevelSelectModal
            unlockedLevel={unlockedLevel}
            levelStars={levelStars}
            onSelectLevel={(lvl) => startLevel(lvl)}
            onClose={() => setShowLevelSelect(false)}
          />
        )}

        {/* Booster Shop Modal */}
        {showBoosterShop && (
          <HexBoosterShopModal
            onClose={() => {
              setShowBoosterShop(false);
              setStoredBoosters(getStoredHexBoosters());
            }}
          />
        )}
      </div>
    );
  }

  // --- IN-GAME VIEW ---
  return (
    <div className="relative w-full h-full max-w-lg mx-auto flex flex-col justify-between p-1 sm:p-2 select-none bg-[#080c18] overflow-hidden">
      {/* Visual Effects & Particle Layer */}
      <HexVFX effects={effects} />

      {/* Target & Score Status Bar */}
      <TargetBar
        levelId={currentLevel.id}
        levelName={currentLevel.name}
        gameplayType={currentLevel.gameplayType}
        score={score}
        movesLeft={movesLeft}
        timeLeft={timeLeft}
        stars={currentLevel.stars}
        targets={targets}
        combo={combo}
      />

      {/* Hex Board */}
      <div className="my-auto py-0.5 w-full flex items-center justify-center flex-1">
        <HexBoard
          grid={grid}
          onTileClick={handleTileClick}
          activeBooster={activeBooster}
          shakeTile={shakeTile}
          isProcessing={isProcessing}
          touchSensitivity={touchSensitivity}
        />
      </div>

      {/* Booster Bar & In-Game Controls */}
      <div className="flex flex-col gap-1.5 w-full max-w-[480px] mx-auto">
        <BoosterBar
          boosters={boosters}
          activeBooster={activeBooster}
          onSelectBooster={(b) => setActiveBooster(activeBooster === b ? null : b)}
          onOpenShop={() => setShowBoosterShop(true)}
          disabled={isPaused || !!levelResult || isProcessing}
        />

        <div className="flex items-center justify-between text-xs text-slate-400 px-1 pb-1">
          <button
            type="button"
            onClick={() => setInMenu(true)}
            className="flex items-center gap-1 hover:text-white transition-colors cursor-pointer py-1 font-semibold"
          >
            <Home className="w-3.5 h-3.5" />
            <span>Menu</span>
          </button>

          <button
            type="button"
            onClick={() => setShowLevelLeaderboard(true)}
            className="flex items-center gap-1 hover:text-white transition-colors cursor-pointer py-1 font-semibold text-amber-300"
          >
            <Trophy className="w-3.5 h-3.5 text-amber-400" />
            <span>BXH Màn</span>
          </button>

          <button
            type="button"
            onClick={() => setShowLevelSelect(true)}
            className="flex items-center gap-1 hover:text-white transition-colors cursor-pointer py-1 font-semibold text-pink-300"
          >
            <Map className="w-3.5 h-3.5" />
            <span>Chọn Màn</span>
          </button>

          <button
            type="button"
            onClick={() => startLevel(currentLevel)}
            className="flex items-center gap-1 hover:text-white transition-colors cursor-pointer py-1 font-semibold"
          >
            <RotateCcw className="w-3.5 h-3.5" />
            <span>Chơi Lại</span>
          </button>
        </div>
      </div>

      {/* Level Leaderboard Modal In-Game */}
      {showLevelLeaderboard && (
        <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-black/85 backdrop-blur-md animate-fade-in select-none">
          <div className="relative w-full max-w-sm bg-slate-900 border border-slate-700 rounded-3xl p-5 shadow-2xl space-y-4">
            <div className="flex items-center justify-between pb-2 border-b border-slate-800">
              <h3 className="text-base font-black text-white flex items-center gap-2">
                <Trophy className="w-5 h-5 text-amber-400" />
                <span>BXH Màn {currentLevel.id}: {currentLevel.name}</span>
              </h3>
              <button
                type="button"
                onClick={() => setShowLevelLeaderboard(false)}
                className="p-1.5 rounded-xl bg-slate-800 hover:bg-slate-700 text-slate-400 hover:text-white cursor-pointer"
              >
                <X className="w-4 h-4" />
              </button>
            </div>

            <LevelMiniLeaderboard levelId={currentLevel.id} currentScore={score} />

            <button
              type="button"
              onClick={() => setShowLevelLeaderboard(false)}
              className="w-full py-2.5 rounded-xl bg-slate-800 hover:bg-slate-700 text-white font-bold text-xs cursor-pointer"
            >
              Đóng
            </button>
          </div>
        </div>
      )}

      {/* Booster Shop Modal */}
      {showBoosterShop && (
        <HexBoosterShopModal
          onClose={() => {
            setShowBoosterShop(false);
            setStoredBoosters(getStoredHexBoosters());
          }}
        />
      )}

      {/* Level Select Modal */}
      {showLevelSelect && (
        <LevelSelectModal
          unlockedLevel={unlockedLevel}
          levelStars={levelStars}
          onSelectLevel={(lvl) => startLevel(lvl)}
          onClose={() => setShowLevelSelect(false)}
        />
      )}

      {/* Level Win / Loss Modal */}
      {levelResult && (
        <LevelResultModal
          isWin={levelResult.isWin}
          score={score}
          starsEarned={levelResult.stars}
          levelId={currentLevel.id}
          hasNextLevel={currentLevel.id < HEX_LEVELS.length}
          onNextLevel={() => {
            const nextIdx = currentLevel.id; // currentLevel.id is 1-indexed, so next level index is currentLevel.id
            if (nextIdx < HEX_LEVELS.length) {
              startLevel(HEX_LEVELS[nextIdx]);
            } else {
              setInMenu(true);
            }
          }}
          onRetry={() => startLevel(currentLevel)}
          onMenu={() => setInMenu(true)}
        />
      )}
    </div>
  );
};
