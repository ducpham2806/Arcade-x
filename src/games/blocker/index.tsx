import React, { useState, useEffect, useRef, useCallback } from 'react';
import { createPortal } from 'react-dom';
import { GameComponentProps } from '../../types';
import { useGame } from '../../context/GameContext';
import { BlockShape, getRandomShapes, ShapeMatrix } from './shapes';
import { BlockCell, GemIcon, BlockTheme } from './BlockCell';
import { Trophy, RotateCcw, Volume2, VolumeX, Sparkles, Flame, Zap, Clock, Target, Gift, CheckCircle2 } from 'lucide-react';
import { motion, AnimatePresence } from 'motion/react';

const GRID_SIZE = 8;
const GAP_SIZE = 3; // px gap between cells
type GridState = (BlockTheme | null)[][];

interface FloatingText {
  id: string;
  text: string;
  x: number;
  y: number;
  color: string;
}

interface ComboNotification {
  id: string;
  type: 'double' | 'triple' | 'quad' | 'mega' | 'streak';
  title: string;
  subtitle: string;
  multiplier: number;
  points: number;
  lines: number;
  streak: number;
}

export const BlockerGame: React.FC<GameComponentProps> = ({
  bridge,
  onGameOver,
  isPaused,
  isMuted,
  isDailyChallengeMode: propChallengeMode,
}) => {
  const {
    isDailyChallengeMode: contextChallengeMode,
    dailyChallenge,
    recordDailyChallengeAttempt,
    claimDailyChallenge,
  } = useGame();

  const [isChallengeMode, setIsChallengeMode] = useState<boolean>(
    Boolean(propChallengeMode ?? contextChallengeMode)
  );
  const [challengeTimeLeft, setChallengeTimeLeft] = useState<number>(180); // 3 minutes = 180 seconds
  const [challengeStarted, setChallengeStarted] = useState<boolean>(false);
  const [challengeVictoryModal, setChallengeVictoryModal] = useState<boolean>(false);
  const [challengeTimeUpModal, setChallengeTimeUpModal] = useState<boolean>(false);
  const [hasCompletedInSession, setHasCompletedInSession] = useState<boolean>(false);

  const sounds = {
    enabled: !isMuted,
    playTap: () => bridge.playSound('tap'),
    playPop: () => bridge.playSound('pop'),
    playWin: () => bridge.playSound('win'),
    playError: () => bridge.playSound('error'),
    playGameOver: () => bridge.playSound('gameOver'),
  };

  const [grid, setGrid] = useState<GridState>(() => 
    Array(GRID_SIZE).fill(null).map(() => Array(GRID_SIZE).fill(null))
  );
  const [shapes, setShapes] = useState<(BlockShape | null)[]>([]);
  const [score, setScore] = useState(0);
  const [bestScore, setBestScore] = useState(() => parseInt(localStorage.getItem('blocker_best') || '0'));
  const [combo, setCombo] = useState(0);
  const [gameOver, setGameOver] = useState(false);

  // Gems collected during the game session
  const [rubyCount, setRubyCount] = useState(0);
  const [amethystCount, setAmethystCount] = useState(0);

  // Sync prop changes
  useEffect(() => {
    if (propChallengeMode !== undefined) {
      setIsChallengeMode(propChallengeMode);
    }
  }, [propChallengeMode]);

  // Challenge Timer Countdown Loop
  useEffect(() => {
    if (!isChallengeMode || !challengeStarted || isPaused || gameOver || challengeVictoryModal || challengeTimeUpModal) {
      return;
    }

    const timer = setInterval(() => {
      setChallengeTimeLeft((prev) => {
        if (prev <= 1) {
          clearInterval(timer);
          setChallengeTimeUpModal(true);
          sounds.playGameOver();
          recordDailyChallengeAttempt(score, 180);
          bridge.submitScore(score, { ruby: rubyCount, timeSpent: 180 });
          return 0;
        }
        return prev - 1;
      });
    }, 1000);

    return () => clearInterval(timer);
  }, [
    isChallengeMode,
    challengeStarted,
    isPaused,
    gameOver,
    challengeVictoryModal,
    challengeTimeUpModal,
    score,
    rubyCount,
    sounds,
    recordDailyChallengeAttempt,
    bridge,
  ]);
  
  // Clearing animation active rows/cols
  const [clearingCells, setClearingCells] = useState<{ r: number; c: number }[]>([]);
  const [floatingTexts, setFloatingTexts] = useState<FloatingText[]>([]);

  const skinId = bridge.getSkin ? bridge.getSkin('blocker') : 'default';

  const getBlockSkinStyle = () => {
    if (skinId === 'skin-blocker-crystal') return 'bg-gradient-to-br from-indigo-400/80 to-purple-500/80 border border-white/40 shadow-inner backdrop-blur-sm';
    if (skinId === 'skin-blocker-neon') return 'bg-gradient-to-br from-cyan-400 to-blue-600 border border-cyan-300 shadow-[0_0_15px_rgba(34,211,238,0.7)]';
    
    // Default
    return 'bg-gradient-to-r from-amber-500 to-orange-500 shadow-[0_0_8px_rgba(245,158,11,0.6)]';
  };

  const gridRef = useRef<HTMLDivElement>(null);
  const boardGridRef = useRef<HTMLDivElement>(null);
  const [cellSize, setCellSize] = useState<number>(44);

  // Measure exact viewport geometry of the 8x8 grid on screen
  const getGridGeometry = useCallback(() => {
    const el = boardGridRef.current || gridRef.current;
    if (!el) return null;
    const rect = el.getBoundingClientRect();
    const cellWidth = (rect.width - (GRID_SIZE - 1) * GAP_SIZE) / GRID_SIZE;
    const cellHeight = (rect.height - (GRID_SIZE - 1) * GAP_SIZE) / GRID_SIZE;
    const effectiveCellSize = Math.max(12, (cellWidth + cellHeight) / 2);
    return {
      left: rect.left,
      top: rect.top,
      width: rect.width,
      height: rect.height,
      cellSize: effectiveCellSize,
      gap: GAP_SIZE,
    };
  }, []);

  // Measure dynamic cell size from grid container
  const updateCellDimensions = useCallback(() => {
    const geo = getGridGeometry();
    if (geo && geo.cellSize > 0) {
      setCellSize(geo.cellSize);
    }
  }, [getGridGeometry]);

  useEffect(() => {
    updateCellDimensions();
    window.addEventListener('resize', updateCellDimensions);
    return () => window.removeEventListener('resize', updateCellDimensions);
  }, [updateCellDimensions]);

  // Dragging state
  const [dragging, setDragging] = useState<{
    shape: BlockShape;
    index: number;
    pointerX: number;
    pointerY: number;
    isTouch: boolean;
  } | null>(null);

  // Active Visual Combo Notification
  const [activeCombo, setActiveCombo] = useState<ComboNotification | null>(null);
  const [isBoardShaking, setIsBoardShaking] = useState(false);
  const comboTimeoutRef = useRef<NodeJS.Timeout | null>(null);

  const triggerComboNotification = useCallback((event: ComboNotification) => {
    if (comboTimeoutRef.current) {
      clearTimeout(comboTimeoutRef.current);
    }
    setActiveCombo(event);
    comboTimeoutRef.current = setTimeout(() => {
      setActiveCombo(null);
    }, 1900);
  }, []);

  useEffect(() => {
    return () => {
      if (comboTimeoutRef.current) clearTimeout(comboTimeoutRef.current);
    };
  }, []);

  // Hover target coordinates on grid
  const [hoverPlacement, setHoverPlacement] = useState<{
    row: number;
    col: number;
    valid: boolean;
    clearingPreview: { rows: number[]; cols: number[] };
    potentialMultiplier?: number;
    potentialLines?: number;
  } | null>(null);

  // Initialize shapes
  useEffect(() => {
    setShapes(getRandomShapes(3));
  }, []);

  // Check if shape can be placed at (r, c)
  const checkPlaceable = (currentGrid: GridState, shapeMatrix: ShapeMatrix, r: number, c: number) => {
    for (let i = 0; i < shapeMatrix.length; i++) {
      for (let j = 0; j < shapeMatrix[i].length; j++) {
        if (shapeMatrix[i][j]) {
          const row = r + i;
          const col = c + j;
          if (row < 0 || row >= GRID_SIZE || col < 0 || col >= GRID_SIZE || currentGrid[row][col] !== null) {
            return false;
          }
        }
      }
    }
    return true;
  };

  // Check if any shape in tray can be placed anywhere on the board
  const checkAnyPlaceable = useCallback((currentGrid: GridState, availableShapes: (BlockShape | null)[]) => {
    for (const shape of availableShapes) {
      if (!shape) continue;
      for (let r = 0; r < GRID_SIZE; r++) {
        for (let c = 0; c < GRID_SIZE; c++) {
          if (checkPlaceable(currentGrid, shape.matrix, r, c)) {
            return true;
          }
        }
      }
    }
    return false;
  }, []);

  // Bad-luck protection: ensure rolling a new batch gives the player at least 1 placeable shape whenever board has open possibilities
  const getFairShapesBatch = useCallback((gridToCheck: GridState): BlockShape[] => {
    let batch = getRandomShapes(3);
    let attempts = 0;
    while (!checkAnyPlaceable(gridToCheck, batch) && attempts < 10) {
      batch = getRandomShapes(3);
      attempts++;
    }
    return batch;
  }, [checkAnyPlaceable]);

  // Check which lines will clear with a hypothetical grid
  const checkLines = (currentGrid: GridState) => {
    const rowsToClear: number[] = [];
    const colsToClear: number[] = [];

    for (let r = 0; r < GRID_SIZE; r++) {
      if (currentGrid[r].every(cell => cell !== null)) {
        rowsToClear.push(r);
      }
    }

    for (let c = 0; c < GRID_SIZE; c++) {
      let colFull = true;
      for (let r = 0; r < GRID_SIZE; r++) {
        if (currentGrid[r][c] === null) {
          colFull = false;
          break;
        }
      }
      if (colFull) colsToClear.push(c);
    }

    return { rowsToClear, colsToClear };
  };

  // Trigger floating point popup
  const addFloatingText = (text: string, x: number, y: number, color = 'text-amber-300') => {
    const id = Math.random().toString(36).substring(7);
    setFloatingTexts(prev => [...prev, { id, text, x, y, color }]);
    setTimeout(() => {
      setFloatingTexts(prev => prev.filter(t => t.id !== id));
    }, 1200);
  };

  // Pointer Down to start dragging
  const handlePointerDown = (e: React.PointerEvent, shape: BlockShape, index: number) => {
    if (gameOver || isPaused) return;
    updateCellDimensions();

    const isTouch = e.pointerType === 'touch' || (typeof window !== 'undefined' && 'ontouchstart' in window && window.innerWidth < 768);
    setDragging({
      shape,
      index,
      pointerX: e.clientX,
      pointerY: e.clientY,
      isTouch,
    });

    if (sounds.enabled) sounds.playTap();
  };

  // Calculate target grid coordinate from pointer position with 100% precision
  const calculateGridCoord = useCallback((pointerX: number, pointerY: number, shape: BlockShape, isTouch: boolean) => {
    const geo = getGridGeometry();
    if (!geo) return null;

    const rows = shape.matrix.length;
    const cols = shape.matrix[0].length;

    const shapePixelWidth = cols * geo.cellSize + (cols - 1) * geo.gap;
    const shapePixelHeight = rows * geo.cellSize + (rows - 1) * geo.gap;

    // Comfortable lift offset for touch screens so finger doesn't obscure the tile placement,
    // kept moderate (~55-65px) so the piece is right above the thumb and easily controllable!
    const liftOffset = isTouch ? Math.round(geo.cellSize * 1.25 + 15) : 0;

    const targetCenterX = pointerX;
    const targetCenterY = pointerY - liftOffset;

    const shapeTopLeftX = targetCenterX - shapePixelWidth / 2;
    const shapeTopLeftY = targetCenterY - shapePixelHeight / 2;

    const col = Math.round((shapeTopLeftX - geo.left) / (geo.cellSize + geo.gap));
    const row = Math.round((shapeTopLeftY - geo.top) / (geo.cellSize + geo.gap));

    return {
      row,
      col,
      shapeTopLeftX,
      shapeTopLeftY,
      targetCenterX,
      targetCenterY,
      cellSize: geo.cellSize,
      shapePixelWidth,
      shapePixelHeight,
      liftOffset,
    };
  }, [getGridGeometry]);

  // Global Pointer Move and Pointer Up
  useEffect(() => {
    const handlePointerMove = (e: PointerEvent) => {
      if (!dragging) return;

      const pointerX = e.clientX;
      const pointerY = e.clientY;

      setDragging(prev => prev ? { ...prev, pointerX, pointerY } : null);

      const target = calculateGridCoord(pointerX, pointerY, dragging.shape, dragging.isTouch);
      if (!target) {
        setHoverPlacement(null);
        return;
      }

      const { row, col } = target;
      const isValid = checkPlaceable(grid, dragging.shape.matrix, row, col);

      if (isValid) {
        // Calculate potential line clears for preview glow
        const tempGrid = grid.map(r => [...r]);
        for (let i = 0; i < dragging.shape.matrix.length; i++) {
          for (let j = 0; j < dragging.shape.matrix[i].length; j++) {
            if (dragging.shape.matrix[i][j]) {
              tempGrid[row + i][col + j] = dragging.shape.color;
            }
          }
        }
        const { rowsToClear, colsToClear } = checkLines(tempGrid);
        const potentialLines = rowsToClear.length + colsToClear.length;
        const potentialMultiplier = potentialLines >= 2
          ? (potentialLines + (combo > 0 ? combo : 0))
          : (potentialLines === 1 && combo > 0 ? combo + 1 : 1);

        setHoverPlacement({
          row,
          col,
          valid: true,
          clearingPreview: { rows: rowsToClear, cols: colsToClear },
          potentialMultiplier: potentialLines > 0 ? potentialMultiplier : undefined,
          potentialLines,
        });
      } else {
        // Only show invalid ghost if somewhat inside bounds
        const isNearGrid = row >= -1 && row <= GRID_SIZE && col >= -1 && col <= GRID_SIZE;
        if (isNearGrid) {
          setHoverPlacement({
            row,
            col,
            valid: false,
            clearingPreview: { rows: [], cols: [] }
          });
        } else {
          setHoverPlacement(null);
        }
      }
    };

    const handlePointerUp = (e: PointerEvent) => {
      if (!dragging) return;

      const target = calculateGridCoord(e.clientX, e.clientY, dragging.shape, dragging.isTouch);
      let placed = false;

      if (target) {
        const { row, col } = target;
        if (checkPlaceable(grid, dragging.shape.matrix, row, col)) {
          // PLACE SHAPE ON GRID
          const newGrid = grid.map(r => [...r]);
          let blocksPlaced = 0;
          let newRubies = 0;
          let newAmethysts = 0;

          for (let i = 0; i < dragging.shape.matrix.length; i++) {
            for (let j = 0; j < dragging.shape.matrix[i].length; j++) {
              if (dragging.shape.matrix[i][j]) {
                newGrid[row + i][col + j] = dragging.shape.color;
                blocksPlaced++;
              }
            }
          }

          if (sounds.enabled) sounds.playPop();

          // Check line clears
          const { rowsToClear, colsToClear } = checkLines(newGrid);
          const totalLinesCleared = rowsToClear.length + colsToClear.length;

          let pointsGained = blocksPlaced * 10;
          let nextCombo = combo;

          // Collect gems and prepare clear effects
          const clearedCellCoords: { r: number; c: number }[] = [];

          if (totalLinesCleared > 0) {
            nextCombo += 1;

            // Simultaneous line clear combo multiplier:
            // 1 line = 1x
            // 2 lines simultaneously = 2x multiplier (Double Clear)
            // 3 lines simultaneously = 3x multiplier (Triple Clear)
            // 4 lines simultaneously = 4x multiplier (Quad Clear)
            // 5+ lines simultaneously = 5x+ multiplier (Mega Clear)
            // Plus streak combo bonus if consecutive turns cleared lines:
            const simultaneousMultiplier = totalLinesCleared;
            const streakBonus = nextCombo > 1 ? (nextCombo - 1) : 0;
            const totalMultiplier = simultaneousMultiplier + streakBonus;

            const baseLineScore = totalLinesCleared * 100;
            const comboBonus = baseLineScore * totalMultiplier;
            pointsGained += comboBonus;

            // Harvest gems from cleared rows
            for (const r of rowsToClear) {
              for (let c = 0; c < GRID_SIZE; c++) {
                const cellTheme = newGrid[r][c];
                if (cellTheme === 'wood_ruby') newRubies++;
                if (cellTheme === 'wood_amethyst') newAmethysts++;
                clearedCellCoords.push({ r, c });
                newGrid[r][c] = null;
              }
            }

            // Harvest gems from cleared columns
            for (const c of colsToClear) {
              for (let r = 0; r < GRID_SIZE; r++) {
                const cellTheme = newGrid[r][c];
                if (cellTheme === 'wood_ruby') newRubies++;
                if (cellTheme === 'wood_amethyst') newAmethysts++;
                if (!clearedCellCoords.some(coord => coord.r === r && coord.c === c)) {
                  clearedCellCoords.push({ r, c });
                }
                newGrid[r][c] = null;
              }
            }

            // Gem bonus points
            const gemPoints = (newRubies * 50) + (newAmethysts * 50);
            pointsGained += gemPoints;

            if (sounds.enabled) {
              sounds.playWin();
              if (totalLinesCleared >= 2) {
                setTimeout(() => sounds.playPop(), 140);
              }
            }

            // Set clearing animations
            setClearingCells(clearedCellCoords);
            setTimeout(() => setClearingCells([]), 350);

            // Trigger Visual 'Combo!' Notification on screen
            if (totalLinesCleared >= 2 || nextCombo >= 2) {
              let title = 'COMBO!';
              let subtitle = `${totalLinesCleared} Lines Cleared!`;
              let type: 'double' | 'triple' | 'quad' | 'mega' | 'streak' = 'double';

              if (totalLinesCleared >= 5) {
                title = 'MEGA COMBO!';
                subtitle = `${totalLinesCleared} Lines Cleared At Once!`;
                type = 'mega';
              } else if (totalLinesCleared === 4) {
                title = 'QUAD COMBO!';
                subtitle = '4 Lines Cleared At Once!';
                type = 'quad';
              } else if (totalLinesCleared === 3) {
                title = 'TRIPLE COMBO!';
                subtitle = '3 Lines Cleared At Once!';
                type = 'triple';
              } else if (totalLinesCleared === 2) {
                title = 'DOUBLE COMBO!';
                subtitle = '2 Lines Cleared At Once!';
                type = 'double';
              } else {
                title = 'COMBO STREAK!';
                subtitle = `Streak x${nextCombo} in a row!`;
                type = 'streak';
              }

              triggerComboNotification({
                id: Math.random().toString(36).substring(7),
                type,
                title,
                subtitle,
                multiplier: totalMultiplier,
                points: comboBonus,
                lines: totalLinesCleared,
                streak: nextCombo,
              });

              setIsBoardShaking(true);
              setTimeout(() => setIsBoardShaking(false), 380);
            }

            // Floating feedback text
            if (gridRef.current) {
              const rect = gridRef.current.getBoundingClientRect();
              const centerX = rect.left + rect.width / 2;
              const centerY = rect.top + rect.height / 2;

              if (totalLinesCleared >= 2 || nextCombo > 1) {
                addFloatingText(
                  `⚡ ${totalMultiplier}x COMBO! +${pointsGained}`,
                  centerX,
                  centerY - 25,
                  totalLinesCleared >= 3 ? 'text-amber-300' : 'text-emerald-300'
                );
              } else {
                addFloatingText(`✨ +${pointsGained}`, centerX, centerY, 'text-emerald-300');
              }

              if (newRubies > 0) {
                addFloatingText(`💎 +${newRubies} Ruby!`, centerX - 35, centerY + 30, 'text-rose-400');
              }
              if (newAmethysts > 0) {
                addFloatingText(`🔮 +${newAmethysts} Amethyst!`, centerX + 35, centerY + 30, 'text-purple-400');
              }
            }

            // Progress combo achievement
            if (totalLinesCleared >= 3 || totalMultiplier >= 3) {
              bridge.reportProgress('blocker-combo-3', 1);
            }
          } else {
            nextCombo = 0;
            // Normal placement float text
            if (gridRef.current) {
              const rect = gridRef.current.getBoundingClientRect();
              const targetX = rect.left + (col + 1) * cellSize;
              const targetY = rect.top + row * cellSize;
              addFloatingText(`+${pointsGained}`, targetX, targetY, 'text-slate-200');
            }
          }

          setGrid(newGrid);
          setCombo(nextCombo);
          setScore(s => s + pointsGained);
          if (newRubies > 0) setRubyCount(r => r + newRubies);
          if (newAmethysts > 0) setAmethystCount(a => a + newAmethysts);

          // Achievements, Loot Roll & Challenge Progress
          const newScore = score + pointsGained;
          if (newScore >= 500) bridge.reportProgress('blocker-score-500', 1);
          if (newScore >= 2000) bridge.reportProgress('blocker-score-2000', 1);
          if (newScore >= 5000) bridge.reportProgress('blocker-score-5000', 1);
          bridge.triggerLootRoll(newScore);

          if (isChallengeMode) {
            setChallengeStarted(true);
            const timeSpent = Math.max(1, 180 - challengeTimeLeft);
            recordDailyChallengeAttempt(newScore, timeSpent);
            if (newScore >= 5000 && !hasCompletedInSession) {
              setHasCompletedInSession(true);
              setChallengeVictoryModal(true);
              sounds.playWin();
            }
          }

          // Update available shapes in tray
          const newShapes = [...shapes];
          newShapes[dragging.index] = null;

          if (newShapes.every(s => s === null)) {
            const nextBatch = getFairShapesBatch(newGrid);
            setShapes(nextBatch);
            if (!checkAnyPlaceable(newGrid, nextBatch)) {
              handleGameOver(newScore);
            }
          } else {
            setShapes(newShapes);
            if (!checkAnyPlaceable(newGrid, newShapes)) {
              handleGameOver(newScore);
            }
          }

          placed = true;
        }
      }

      if (!placed && sounds.enabled) {
        sounds.playError();
      }

      setDragging(null);
      setHoverPlacement(null);
    };

    if (dragging) {
      window.addEventListener('pointermove', handlePointerMove);
      window.addEventListener('pointerup', handlePointerUp);
      window.addEventListener('pointercancel', handlePointerUp);
    }

    return () => {
      window.removeEventListener('pointermove', handlePointerMove);
      window.removeEventListener('pointerup', handlePointerUp);
      window.removeEventListener('pointercancel', handlePointerUp);
    };
  }, [dragging, grid, shapes, combo, score, bridge, checkAnyPlaceable, calculateGridCoord, sounds]);

  const handleGameOver = (finalScore: number) => {
    setGameOver(true);
    if (sounds.enabled) sounds.playGameOver();

    if (isChallengeMode) {
      const timeSpent = Math.max(1, 180 - challengeTimeLeft);
      recordDailyChallengeAttempt(finalScore, timeSpent);
    }

    if (finalScore > bestScore) {
      setBestScore(finalScore);
      localStorage.setItem('blocker_best', finalScore.toString());
    }
    
    // Call the global wrapper's game over directly
    onGameOver(finalScore, { ruby: rubyCount });
  };

  const handleRestart = (forceMode?: 'challenge' | 'endless') => {
    setGrid(Array(GRID_SIZE).fill(null).map(() => Array(GRID_SIZE).fill(null)));
    setShapes(getRandomShapes(3));
    setScore(0);
    setCombo(0);
    setRubyCount(0);
    setAmethystCount(0);
    setGameOver(false);
    setClearingCells([]);
    setFloatingTexts([]);
    setActiveCombo(null);
    setIsBoardShaking(false);
    setChallengeTimeLeft(180);
    setChallengeStarted(false);
    setChallengeVictoryModal(false);
    setChallengeTimeUpModal(false);
    setHasCompletedInSession(false);
    if (forceMode !== undefined) {
      setIsChallengeMode(forceMode === 'challenge');
    }
  };

  // Render a shape matrix with true cell sizing or compact tray scaling
  const renderShapeMatrix = (
    shape: BlockShape,
    isTrueSize = false,
    sizePerCell = 32
  ) => {
    const matrix = shape.matrix;
    const actualCellSize = isTrueSize ? cellSize : sizePerCell;
    const gap = isTrueSize ? GAP_SIZE : 2;

    return (
      <div
        className="flex flex-col select-none pointer-events-none"
        style={{ gap: `${gap}px` }}
      >
        {matrix.map((row, r) => (
          <div key={`shape-row-${r}`} className="flex" style={{ gap: `${gap}px` }}>
            {row.map((val, c) => (
              <div
                key={`shape-col-${c}`}
                style={{ width: `${actualCellSize}px`, height: `${actualCellSize}px` }}
                className="flex items-center justify-center shrink-0"
              >
                {val === 1 ? (
                  <BlockCell
                    theme={shape.color}
                    size={actualCellSize}
                    showGemSparkle
                    skinId={skinId}
                  />
                ) : (
                  <div className="w-full h-full bg-transparent" />
                )}
              </div>
            ))}
          </div>
        ))}
      </div>
    );
  };

  const formatTime = (seconds: number) => {
    const mins = Math.floor(seconds / 60);
    const secs = seconds % 60;
    return `${mins.toString().padStart(2, '0')}:${secs.toString().padStart(2, '0')}`;
  };

  return (
    <div className="w-full max-w-md mx-auto flex flex-col items-center gap-2.5 sm:gap-3.5 select-none touch-none pb-4">
      {/* MODE TOGGLE SWITCHER */}
      <div className="w-full flex items-center justify-between gap-2 px-1">
        <div className="flex items-center bg-[#101e13] p-1 rounded-xl border border-[#274830] shadow-inner">
          <button
            id="btn-mode-endless"
            type="button"
            onClick={() => handleRestart('endless')}
            className={`px-3 py-1 rounded-lg text-xs font-bold transition-all flex items-center gap-1.5 cursor-pointer ${
              !isChallengeMode
                ? 'bg-[#24422b] text-emerald-300 shadow-sm border border-emerald-500/30'
                : 'text-slate-400 hover:text-white'
            }`}
          >
            <span>🌟 Vô Tận</span>
          </button>

          <button
            id="btn-mode-challenge"
            type="button"
            onClick={() => handleRestart('challenge')}
            className={`px-3 py-1 rounded-lg text-xs font-bold transition-all flex items-center gap-1.5 cursor-pointer ${
              isChallengeMode
                ? 'bg-gradient-to-r from-amber-600 to-orange-600 text-white shadow-[0_0_12px_rgba(245,158,11,0.5)] border border-amber-400/40'
                : 'text-slate-400 hover:text-amber-300'
            }`}
          >
            <Flame className="w-3.5 h-3.5 fill-amber-300 text-amber-200" />
            <span>🔥 Thử Thách 3 Phút</span>
            {dailyChallenge.completed && !dailyChallenge.claimed && (
              <span className="w-2 h-2 rounded-full bg-amber-300 animate-ping" />
            )}
          </button>
        </div>

        {isChallengeMode && (
          <div className="text-[11px] font-bold text-amber-300 bg-amber-950/40 border border-amber-600/40 px-2.5 py-1 rounded-xl flex items-center gap-1 shrink-0">
            <span>Thưởng:</span>
            <span className="text-amber-400 font-black">+500 Xu</span>
          </div>
        )}
      </div>

      {/* DAILY CHALLENGE LIVE PROGRESS BAR (WHEN IN CHALLENGE MODE) */}
      {isChallengeMode && (
        <div className="w-full bg-gradient-to-r from-amber-950/60 via-[#181512] to-[#121c14] border-2 border-amber-500/40 rounded-2xl p-3 shadow-lg flex flex-col gap-2 relative overflow-hidden">
          <div className="flex items-center justify-between">
            <div className="flex items-center gap-2">
              <div
                className={`flex items-center gap-1.5 px-2.5 py-0.5 rounded-lg border font-mono font-black text-xs sm:text-sm ${
                  challengeTimeLeft <= 30
                    ? 'bg-rose-500/20 text-rose-300 border-rose-500/50 animate-pulse'
                    : 'bg-black/40 text-amber-300 border-amber-500/30'
                }`}
              >
                <Clock className="w-3.5 h-3.5 text-amber-400" />
                <span>{formatTime(challengeTimeLeft)}</span>
              </div>
              <span className="text-[11px] text-slate-300 font-medium">
                {!challengeStarted ? 'Kéo khối để bắt đầu' : 'Thời gian còn lại'}
              </span>
            </div>

            <div className="flex items-center gap-1.5 text-xs">
              <Target className="w-3.5 h-3.5 text-amber-400" />
              <span className="text-slate-400">Mục tiêu:</span>
              <span className="font-mono font-black text-amber-300">5,000</span>
            </div>
          </div>

          {/* Progress bar */}
          <div className="w-full h-2.5 bg-black/60 rounded-full border border-white/10 overflow-hidden p-0.5">
            <div
              className="h-full rounded-full bg-gradient-to-r from-amber-500 to-orange-500 transition-all duration-300 shadow-[0_0_8px_rgba(245,158,11,0.6)]"
              style={{ width: `${Math.min(100, Math.round((score / 5000) * 100))}%` }}
            />
          </div>
        </div>
      )}

      {/* TOP HEADER: GEMS, SCORE & BEST */}
      <div className="w-full bg-[#16271a]/90 backdrop-blur-md rounded-2xl border-2 border-[#2b4c33] p-3 shadow-[0_8px_24px_rgba(0,0,0,0.5)] flex flex-col gap-2">
        <div className="flex items-center justify-between">
          
          {/* Gem Counters (Matching reference image) */}
          <div className="flex items-center gap-3 sm:gap-4">
            {/* Red Star Gem Counter */}
            <div className="flex items-center gap-1.5 bg-[#0e1c12] px-2.5 py-1 rounded-xl border border-rose-900/60 shadow-inner">
              <GemIcon type="ruby" size={20} />
              <span className="font-black text-rose-300 font-mono text-sm sm:text-base leading-none">
                {rubyCount}
              </span>
            </div>

            {/* Purple Amethyst Gem Counter */}
            <div className="flex items-center gap-1.5 bg-[#0e1c12] px-2.5 py-1 rounded-xl border border-purple-900/60 shadow-inner">
              <GemIcon type="amethyst" size={20} />
              <span className="font-black text-purple-300 font-mono text-sm sm:text-base leading-none">
                {amethystCount}
              </span>
            </div>
          </div>

          {/* Controls & Best */}
          <div className="flex items-center gap-2">
            <button
              onClick={() => handleRestart()}
              className="p-1.5 rounded-lg bg-[#203a27] hover:bg-[#2c5036] text-emerald-300 border border-[#376343] transition-colors active:scale-95"
              title="Chơi lại"
            >
              <RotateCcw className="w-4 h-4" />
            </button>
            <div className="flex items-center gap-1 text-[11px] font-bold text-amber-300 bg-[#243315] px-2 py-1 rounded-lg border border-amber-700/50">
              <Trophy className="w-3.5 h-3.5 text-amber-400" />
              <span className="font-mono">{Math.max(score, bestScore)}</span>
            </div>
          </div>
        </div>

        {/* Big Score Display */}
        <div className="flex items-baseline justify-between pt-1 border-t border-white/5">
          <div className="flex items-baseline gap-2">
            <span className="text-[10px] sm:text-xs font-black uppercase text-emerald-400/80 tracking-wider">
              SCORE
            </span>
            <span className="text-3xl sm:text-4xl font-black text-white font-mono tracking-tight drop-shadow-md">
              {score}
            </span>
          </div>

          {/* Combo Multiplier Badge */}
          {combo > 1 && (
            <motion.div
              initial={{ scale: 0.8, y: 5 }}
              animate={{ scale: [1, 1.08, 1], y: 0 }}
              transition={{ repeat: Infinity, duration: 1 }}
              className="flex items-center gap-1.5 bg-gradient-to-r from-amber-500 via-orange-600 to-rose-600 text-white font-black text-xs sm:text-sm px-3 py-0.5 rounded-full shadow-[0_0_14px_rgba(245,158,11,0.7)] border border-amber-300/40"
            >
              <Flame className="w-3.5 h-3.5 fill-amber-300 text-amber-200 animate-pulse" />
              <span>COMBO x{combo}</span>
              <span className="text-[10px] bg-black/40 px-1.5 py-0.2 rounded font-mono text-amber-200">
                {combo}x
              </span>
            </motion.div>
          )}
        </div>
      </div>

      {/* 8x8 BOARD CONTAINER */}
      <div className="relative w-full flex justify-center">
        <div
          ref={gridRef}
          className={`w-full max-w-[390px] aspect-square bg-[#101e13] rounded-2xl p-1.5 sm:p-2 border-4 border-[#2d4d35] shadow-[0_12px_36px_rgba(0,0,0,0.7),inset_0_2px_8px_rgba(0,0,0,0.8)] relative overflow-hidden flex flex-col justify-between transition-all duration-200 ${
            isBoardShaking ? 'scale-[1.02] shadow-[0_0_36px_rgba(245,158,11,0.6)] ring-2 ring-amber-400' : ''
          }`}
        >
          {/* Ambient Wood/Forest Texture Glow */}
          <div className="absolute inset-0 bg-gradient-to-b from-[#18311f] via-[#0f1d13] to-[#0a150c] pointer-events-none opacity-80" />

          {/* Hover Potential Combo Opportunity Indicator */}
          {hoverPlacement?.potentialMultiplier && hoverPlacement.potentialMultiplier >= 2 && (
            <div className="absolute top-2.5 left-1/2 -translate-x-1/2 z-30 pointer-events-none px-3 py-1 rounded-full bg-gradient-to-r from-amber-500 via-orange-500 to-amber-500 backdrop-blur-md border border-amber-200 text-black font-black text-[11px] sm:text-xs shadow-[0_0_18px_rgba(245,158,11,0.9)] flex items-center gap-1.5 animate-pulse">
              <Zap className="w-3.5 h-3.5 fill-black text-black" />
              <span>{hoverPlacement.potentialMultiplier}X COMBO OPPORTUNITY!</span>
            </div>
          )}

          {/* VISUAL COMBO NOTIFICATION POPUP */}
          <AnimatePresence>
            {activeCombo && (
              <motion.div
                key={activeCombo.id}
                initial={{ scale: 0.3, opacity: 0, y: 15 }}
                animate={{ scale: [0.3, 1.1, 1], opacity: 1, y: 0 }}
                exit={{ scale: 0.9, opacity: 0, y: -20 }}
                transition={{ duration: 0.35, ease: [0.16, 1, 0.3, 1] }}
                className="absolute top-1/2 left-1/2 -translate-x-1/2 -translate-y-1/2 z-40 pointer-events-none flex flex-col items-center justify-center w-[88%] max-w-[300px]"
              >
                <div
                  className={`relative w-full rounded-2xl p-3.5 sm:p-4 flex flex-col items-center text-center backdrop-blur-xl border-2 shadow-[0_12px_40px_rgba(0,0,0,0.95)] overflow-hidden ${
                    activeCombo.type === 'mega' || activeCombo.type === 'quad'
                      ? 'bg-gradient-to-b from-[#340c2e]/95 via-[#1e071a]/95 to-[#120410]/95 border-fuchsia-400 shadow-[0_0_35px_rgba(232,121,249,0.7)]'
                      : activeCombo.type === 'triple'
                      ? 'bg-gradient-to-b from-[#381a05]/95 via-[#231003]/95 to-[#140801]/95 border-amber-400 shadow-[0_0_35px_rgba(251,191,36,0.7)]'
                      : 'bg-gradient-to-b from-[#0a2e1d]/95 via-[#071d13]/95 to-[#030e09]/95 border-emerald-400 shadow-[0_0_30px_rgba(52,211,153,0.7)]'
                  }`}
                >
                  {/* Soft Radial Ambient Highlight */}
                  <div className="absolute -top-12 left-1/2 -translate-x-1/2 w-44 h-24 bg-white/20 blur-xl rounded-full pointer-events-none" />

                  {/* Subtitle tag with icons */}
                  <div className="flex items-center gap-1.5 mb-1 z-10">
                    <Flame className="w-4 h-4 text-amber-300 fill-amber-400 animate-bounce" />
                    <span className="text-[10px] sm:text-xs font-black uppercase tracking-wider text-amber-200">
                      {activeCombo.subtitle}
                    </span>
                    <Sparkles className="w-3.5 h-3.5 text-amber-300 animate-spin" />
                  </div>

                  {/* Big Impact Title */}
                  <div className="text-2xl sm:text-3xl font-black italic tracking-wide text-transparent bg-clip-text bg-gradient-to-b from-white via-amber-100 to-amber-300 drop-shadow-[0_2px_8px_rgba(0,0,0,0.9)] uppercase z-10">
                    {activeCombo.title}
                  </div>

                  {/* Multiplier & Points Award */}
                  <div className="mt-2 flex items-center gap-2 z-10">
                    <div className="px-2.5 py-0.5 rounded-full bg-gradient-to-r from-amber-400 to-orange-500 text-black font-black text-xs shadow-[0_2px_6px_rgba(245,158,11,0.6)] flex items-center gap-1">
                      <Zap className="w-3 h-3 fill-black text-black" />
                      <span>{activeCombo.multiplier}X MULTIPLIER</span>
                    </div>

                    <span className="font-mono font-black text-base sm:text-lg text-emerald-300 drop-shadow-[0_2px_4px_rgba(0,0,0,0.8)]">
                      +{activeCombo.points}
                    </span>
                  </div>
                </div>
              </motion.div>
            )}
          </AnimatePresence>

          {/* Grid Rows */}
          <div
            ref={boardGridRef}
            data-grid-board="true"
            className="relative z-10 w-full h-full grid"
            style={{
              gridTemplateColumns: `repeat(${GRID_SIZE}, minmax(0, 1fr))`,
              gridTemplateRows: `repeat(${GRID_SIZE}, minmax(0, 1fr))`,
              gap: `${GAP_SIZE}px`,
            }}
          >
            {grid.map((row, r) =>
              row.map((cell, c) => {
                // Check if this cell is part of the ghost preview
                let isGhostCell = false;
                let isValidGhost = true;

                if (dragging && hoverPlacement) {
                  const shapeMatrix = dragging.shape.matrix;
                  const shapeR = r - hoverPlacement.row;
                  const shapeC = c - hoverPlacement.col;
                  if (
                    shapeR >= 0 &&
                    shapeR < shapeMatrix.length &&
                    shapeC >= 0 &&
                    shapeC < shapeMatrix[shapeR].length &&
                    shapeMatrix[shapeR][shapeC] === 1
                  ) {
                    isGhostCell = true;
                    isValidGhost = hoverPlacement.valid;
                  }
                }

                // Check if this cell is clearing or part of line clear preview
                const isClearing = clearingCells.some(coord => coord.r === r && coord.c === c);
                const isClearingPreview =
                  hoverPlacement?.valid &&
                  (hoverPlacement.clearingPreview.rows.includes(r) ||
                    hoverPlacement.clearingPreview.cols.includes(c));

                return (
                  <div
                    key={`cell-${r}-${c}`}
                    className={`relative w-full h-full rounded-[6px] transition-all flex items-center justify-center ${
                      cell
                        ? ''
                        : 'bg-[#0e1c11]/95 border border-[#1b3420] shadow-[inset_0_2px_5px_rgba(0,0,0,0.8)]'
                    } ${
                      isClearingPreview
                        ? 'ring-2 ring-amber-300 shadow-[0_0_14px_rgba(251,191,36,0.8)] z-20 animate-pulse'
                        : ''
                    }`}
                  >
                    {/* Empty cell center guide dot */}
                    {!cell && !isGhostCell && (
                      <div className="w-1.5 h-1.5 rounded-full bg-[#274b2f]/60 pointer-events-none" />
                    )}

                    {/* Render Placed Block with 100% original vibrant material */}
                    {cell && (
                      <BlockCell
                        theme={cell}
                        isClearing={isClearing}
                        showGemSparkle
                        skinId={skinId}
                      />
                    )}

                    {/* Render Ghost Cell Preview (when dragging over board) */}
                    {isGhostCell && !cell && (
                      <BlockCell
                        theme={dragging?.shape.color || 'wood_plain'}
                        isGhost
                        isValidGhost={isValidGhost}
                        skinId={skinId}
                      />
                    )}
                  </div>
                );
              })
            )}
          </div>
        </div>
      </div>

      {/* TRAY: 3 BOTTOM SHAPE SLOTS */}
      <div className="w-full grid grid-cols-3 gap-2 sm:gap-3 px-1 h-32 sm:h-36 relative">
        {shapes.map((shape, i) => {
          const isCurrentDragging = dragging?.index === i;
          const canFitSomewhere = shape ? checkAnyPlaceable(grid, [shape]) : true;

          return (
            <div
              key={`tray-slot-${i}`}
              className="bg-[#142317]/90 rounded-2xl border-2 border-[#243f2a] shadow-[inset_0_2px_6px_rgba(0,0,0,0.5)] flex items-center justify-center relative p-2 transition-all hover:border-[#386342]"
            >
              {shape && (
                <div
                  className={`cursor-grab active:cursor-grabbing touch-none flex items-center justify-center p-2 rounded-xl transition-all ${
                    isCurrentDragging ? 'opacity-20 scale-90' : 'hover:scale-105 active:scale-95'
                  } ${!canFitSomewhere ? 'opacity-40 grayscale-[40%]' : ''}`}
                  onPointerDown={(e) => handlePointerDown(e, shape, i)}
                >
                  {/* Compact Preview in Tray */}
                  {renderShapeMatrix(shape, false, 24)}
                </div>
              )}
            </div>
          );
        })}
      </div>

      {/* FLOATING DRAGGED SHAPE (PORTAL TO BODY FOR TRUE VIEWPORT ACCURACY WITHOUT CSS SCALING DISTORTION) */}
      {dragging && typeof document !== 'undefined' && createPortal(
        (() => {
          const geo = getGridGeometry();
          const activeCellSize = geo?.cellSize || cellSize;
          const rows = dragging.shape.matrix.length;
          const cols = dragging.shape.matrix[0].length;
          const shapeWidth = cols * activeCellSize + (cols - 1) * GAP_SIZE;
          const shapeHeight = rows * activeCellSize + (rows - 1) * GAP_SIZE;
          const liftOffset = dragging.isTouch ? Math.round(activeCellSize * 1.25 + 15) : 0;
          const targetY = dragging.pointerY - liftOffset;

          return (
            <div
              className="fixed pointer-events-none z-[99999] flex items-center justify-center drop-shadow-[0_18px_40px_rgba(0,0,0,0.85)] filter"
              style={{
                left: `${dragging.pointerX}px`,
                top: `${targetY}px`,
                transform: 'translate(-50%, -50%)',
                width: `${shapeWidth}px`,
                height: `${shapeHeight}px`,
              }}
            >
              {/* True 1:1 Cell Size matching the Board on screen */}
              <div className="scale-100">
                {renderShapeMatrix(dragging.shape, true, activeCellSize)}
              </div>
            </div>
          );
        })(),
        document.body
      )}

      {/* FLOATING POPUP TEXTS (+100, COMBO x2, GEMS) VIA PORTAL */}
      {typeof document !== 'undefined' && createPortal(
        <AnimatePresence>
          {floatingTexts.map(item => (
            <motion.div
              key={item.id}
              initial={{ opacity: 0, scale: 0.5, y: 0 }}
              animate={{ opacity: 1, scale: 1.2, y: -40 }}
              exit={{ opacity: 0, scale: 0.8, y: -60 }}
              transition={{ duration: 0.9, ease: 'easeOut' }}
              className={`fixed pointer-events-none z-[99998] font-black font-mono text-base sm:text-xl drop-shadow-[0_2px_8px_rgba(0,0,0,0.8)] ${item.color}`}
              style={{ left: item.x, top: item.y, transform: 'translate(-50%, -50%)' }}
            >
              {item.text}
            </motion.div>
          ))}
        </AnimatePresence>,
        document.body
      )}

      {/* DAILY CHALLENGE VICTORY MODAL */}
      <AnimatePresence>
        {challengeVictoryModal && (
          <motion.div
            initial={{ opacity: 0 }}
            animate={{ opacity: 1 }}
            exit={{ opacity: 0 }}
            className="fixed inset-0 z-50 flex items-center justify-center bg-black/85 backdrop-blur-md p-4"
          >
            <motion.div
              initial={{ scale: 0.85, y: 20 }}
              animate={{ scale: 1, y: 0 }}
              className="w-full max-w-sm bg-gradient-to-b from-[#1e1710] via-[#16120e] to-[#0f0d0c] border-2 border-amber-500/50 rounded-3xl p-6 flex flex-col items-center gap-5 shadow-[0_20px_50px_rgba(245,158,11,0.25)] text-center relative overflow-hidden"
            >
              <div className="absolute -top-12 left-1/2 -translate-x-1/2 w-40 h-24 bg-amber-500/20 blur-2xl rounded-full pointer-events-none" />

              <div className="w-16 h-16 rounded-2xl bg-gradient-to-br from-amber-400 to-orange-500 text-black flex items-center justify-center text-3xl shadow-lg shadow-amber-500/30">
                🏆
              </div>

              <div>
                <span className="inline-flex items-center gap-1 px-3 py-1 rounded-full bg-amber-500/20 border border-amber-400/40 text-xs font-bold text-amber-300 uppercase tracking-wider mb-2">
                  <Flame className="w-3.5 h-3.5 text-amber-400 animate-bounce" />
                  MỤC TIÊU HOÀN THÀNH!
                </span>
                <h2 className="text-2xl font-black text-white uppercase tracking-tight">
                  Xuất Sắc Vượt Thử Thách!
                </h2>
                <p className="text-xs text-slate-300 mt-1">
                  Bạn đã chạm mốc 5,000 điểm trong thời gian 3 phút quy định!
                </p>
              </div>

              {/* Reward Highlights */}
              <div className="w-full bg-black/50 rounded-2xl p-4 border border-amber-500/30 flex flex-col gap-2.5">
                <span className="text-[11px] font-bold text-slate-400 uppercase tracking-wider">
                  Phần thưởng đã mở khóa
                </span>
                <div className="flex items-center justify-center gap-3 text-xs font-black">
                  <span className="bg-amber-500/20 text-amber-300 border border-amber-500/30 px-3 py-1.5 rounded-xl flex items-center gap-1">
                    🪙 +500 Xu
                  </span>
                  <span className="bg-purple-500/20 text-purple-300 border border-purple-500/30 px-3 py-1.5 rounded-xl flex items-center gap-1">
                    💎 +25 Ngọc
                  </span>
                  <span className="bg-indigo-500/20 text-indigo-300 border border-indigo-500/30 px-3 py-1.5 rounded-xl flex items-center gap-1">
                    ⚡ +150 EXP
                  </span>
                </div>
                <div className="text-xs text-slate-400 pt-1">
                  Điểm hiện tại:{' '}
                  <strong className="text-amber-400 font-mono text-sm">{score}</strong> (Thời gian còn:{' '}
                  {formatTime(challengeTimeLeft)})
                </div>
              </div>

              {/* Actions */}
              <div className="w-full flex flex-col gap-2 pt-1">
                {!dailyChallenge.claimed && (
                  <button
                    id="btn-victory-claim-reward"
                    type="button"
                    onClick={() => {
                      claimDailyChallenge();
                      setChallengeVictoryModal(false);
                    }}
                    className="w-full py-3 bg-gradient-to-r from-amber-400 to-orange-500 hover:from-amber-300 hover:to-orange-400 text-black font-black rounded-xl transition-all shadow-lg shadow-amber-500/30 active:scale-95 text-xs uppercase tracking-wide flex items-center justify-center gap-2 cursor-pointer"
                  >
                    <Gift className="w-4 h-4" />
                    <span>Nhận Thưởng Ngay (+500 Xu)</span>
                  </button>
                )}

                <button
                  id="btn-victory-keep-playing"
                  type="button"
                  onClick={() => setChallengeVictoryModal(false)}
                  className="w-full py-2.5 bg-white/10 hover:bg-white/20 text-white font-bold rounded-xl transition-all border border-white/10 active:scale-95 text-xs uppercase cursor-pointer"
                >
                  Tiếp Tục Chơi Lấy Điểm Cao
                </button>
              </div>
            </motion.div>
          </motion.div>
        )}
      </AnimatePresence>

      {/* DAILY CHALLENGE TIME UP MODAL */}
      <AnimatePresence>
        {challengeTimeUpModal && (
          <motion.div
            initial={{ opacity: 0 }}
            animate={{ opacity: 1 }}
            exit={{ opacity: 0 }}
            className="fixed inset-0 z-50 flex items-center justify-center bg-black/85 backdrop-blur-md p-4"
          >
            <motion.div
              initial={{ scale: 0.85, y: 20 }}
              animate={{ scale: 1, y: 0 }}
              className="w-full max-w-sm bg-[#181412] border-2 border-amber-600/40 rounded-3xl p-6 flex flex-col items-center gap-5 shadow-[0_20px_50px_rgba(0,0,0,0.9)] text-center"
            >
              <div className="w-16 h-16 rounded-2xl bg-amber-500/20 border border-amber-500/40 flex items-center justify-center text-3xl shadow-lg">
                ⏰
              </div>

              <div>
                <h2 className="text-2xl font-black text-amber-300 uppercase tracking-tight">
                  Hết Giờ Thử Thách!
                </h2>
                <p className="text-xs text-slate-400 mt-1">
                  Đã hết 3 phút quy định cho Thử Thách Hàng Ngày
                </p>
              </div>

              <div className="w-full bg-black/40 rounded-2xl p-4 border border-white/5 flex flex-col gap-2">
                <div className="flex justify-between items-center text-xs">
                  <span className="text-slate-400 uppercase font-bold">Điểm đạt được:</span>
                  <span className="text-xl font-black font-mono text-white">{score}</span>
                </div>
                <div className="flex justify-between items-center text-xs border-t border-white/5 pt-2">
                  <span className="text-slate-400 uppercase font-bold">Mục tiêu:</span>
                  <span className="font-mono font-bold text-amber-400">5,000 điểm</span>
                </div>
                <div className="w-full h-2 bg-black rounded-full overflow-hidden mt-1">
                  <div
                    className="h-full bg-gradient-to-r from-amber-500 to-orange-500"
                    style={{ width: `${Math.min(100, Math.round((score / 5000) * 100))}%` }}
                  />
                </div>
              </div>

              <div className="w-full grid grid-cols-2 gap-3 pt-1">
                <button
                  id="btn-retry-challenge"
                  type="button"
                  onClick={() => handleRestart('challenge')}
                  className="w-full py-3 bg-gradient-to-r from-amber-500 to-orange-500 hover:from-amber-400 hover:to-orange-400 text-black font-black rounded-xl transition-all shadow-md active:scale-95 text-xs uppercase tracking-wide cursor-pointer"
                >
                  Thử Lại 3 Phút
                </button>

                <button
                  id="btn-switch-endless"
                  type="button"
                  onClick={() => handleRestart('endless')}
                  className="w-full py-3 bg-slate-800 hover:bg-slate-700 text-slate-300 font-bold rounded-xl transition-all border border-slate-700 active:scale-95 text-xs uppercase cursor-pointer"
                >
                  Chơi Vô Tận
                </button>
              </div>
            </motion.div>
          </motion.div>
        )}
      </AnimatePresence>

    </div>
  );
};

export default BlockerGame;
