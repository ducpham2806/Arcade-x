import React, { useState, useEffect, useRef, useMemo, useCallback } from 'react';
import { GameComponentProps } from '../../types';
import { BlockShape, CellCoord, PlacedBlock, PuzzleLevel, UndoSnapshot } from './types';
import { generateProceduralLevel, generateZenLevel, coordKey, hasCoord } from './generator';
import { WoodBlock } from './WoodBlock';
import { WinPopup } from './WinPopup';
import {
  RotateCcw,
  Undo2,
  ArrowLeft,
  Volume2,
  VolumeX,
  Sparkles,
  HelpCircle,
  Trophy,
  Lightbulb,
  Flame,
  Zap,
  Flower,
  Shuffle,
  CheckCircle2,
} from 'lucide-react';
import confetti from 'canvas-confetti';

export const FillTheSpaceGame: React.FC<GameComponentProps> = ({
  bridge,
  isPaused,
  isMuted,
  onGameOver,
  onRestart,
}) => {
  // Game Mode: Classic (progressive difficulty) vs Zen (relaxing free play)
  const [gameMode, setGameMode] = useState<'classic' | 'zen'>('classic');
  const [zenGridDim, setZenGridDim] = useState<number>(5);
  const [zenIndex, setZenIndex] = useState<number>(1);

  // Game Level & State
  const [levelNumber, setLevelNumber] = useState<number>(1);
  const [currentLevel, setCurrentLevel] = useState<PuzzleLevel>(() => generateProceduralLevel(1));
  const [placedBlocks, setPlacedBlocks] = useState<PlacedBlock[]>([]);
  const [availableBlocks, setAvailableBlocks] = useState<BlockShape[]>(() => currentLevel.blocks);
  const [selectedBlockId, setSelectedBlockId] = useState<string | null>(null);

  // Undo System (Max 3 charges per level in Classic, unlimited in Zen)
  const [undosRemaining, setUndosRemaining] = useState<number>(3);
  const [undoHistory, setUndoHistory] = useState<UndoSnapshot[]>([]);

  // Hint & No-Hint Streak System (3 consecutive no-hint levels gives x2 multiplier)
  const [noHintStreak, setNoHintStreak] = useState<number>(0);
  const [hintsUsedThisLevel, setHintsUsedThisLevel] = useState<number>(0);
  const [hintHighlight, setHintHighlight] = useState<{
    blockId: string;
    targetPosition: CellCoord;
    coveredCells: CellCoord[];
  } | null>(null);
  const [hintWarningNotice, setHintWarningNotice] = useState<string | null>(null);

  // 3-Streak Fireworks & Neon Burst Overlay Celebration
  const [showStreakBurstOverlay, setShowStreakBurstOverlay] = useState<boolean>(false);
  const [threeStreakCount, setThreeStreakCount] = useState<number>(0);

  // Scoring & Stats
  const [score, setScore] = useState<number>(0);
  const [highScore, setHighScore] = useState<number>(0);
  const [timeElapsed, setTimeElapsed] = useState<number>(0);
  const [movesCount, setMovesCount] = useState<number>(0);
  const [isLevelWon, setIsLevelWon] = useState<boolean>(false);
  const [levelWinScore, setLevelWinScore] = useState<number>(0);
  const [isWinDoubleScore, setIsWinDoubleScore] = useState<boolean>(false);
  const [winRewards, setWinRewards] = useState<{
    coins: number;
    exp: number;
    chest: 'common' | 'rare' | 'epic' | 'legendary' | null;
  }>({ coins: 0, exp: 0, chest: null });

  // Sound state
  const [muted, setMuted] = useState<boolean>(isMuted);

  useEffect(() => {
    setMuted(isMuted);
  }, [isMuted]);

  // Dragging state
  const [dragState, setDragState] = useState<{
    block: BlockShape;
    origin: 'tray' | 'board';
    originalPos?: CellCoord;
    pointerX: number;
    pointerY: number;
    grabOffset: { x: number; y: number };
  } | null>(null);

  const [snapPreview, setSnapPreview] = useState<{
    row: number;
    col: number;
    isValid: boolean;
    coveredCells: CellCoord[];
  } | null>(null);

  const boardRef = useRef<HTMLDivElement>(null);
  const gridRef = useRef<HTMLDivElement>(null);
  const timerRef = useRef<NodeJS.Timeout | null>(null);

  const BOARD_PADDING = 16;

  // Responsive width & height tracking so squares scale to fit screen without cropping
  const [containerWidth, setContainerWidth] = useState<number>(() =>
    typeof window !== 'undefined' ? Math.min(window.innerWidth - 16, 640) : 420
  );
  const [containerHeight, setContainerHeight] = useState<number>(() =>
    typeof window !== 'undefined' ? window.innerHeight : 700
  );

  useEffect(() => {
    const handleResize = () => {
      setContainerWidth(Math.min(window.innerWidth - 16, 640));
      setContainerHeight(window.innerHeight);
    };
    window.addEventListener('resize', handleResize);
    handleResize();
    return () => window.removeEventListener('resize', handleResize);
  }, []);

  // Calculate dynamic cell size to fill horizontal width and vertical height generously without cropping
  const cellSize = useMemo(() => {
    const maxDim = Math.max(currentLevel.gridWidth, currentLevel.gridHeight);
    const availableW = containerWidth - BOARD_PADDING * 2 - 16;
    const availableH = containerHeight - 280; // reserve space for header and tray
    const idealW = Math.floor(availableW / maxDim);
    const idealH = Math.floor(availableH / maxDim);
    const ideal = Math.min(idealW, idealH);
    return Math.max(38, Math.min(72, ideal));
  }, [currentLevel.gridWidth, currentLevel.gridHeight, containerWidth, containerHeight]);

  // Next level dimension teaser
  const nextGridDim = useMemo(() => {
    if (levelNumber + 1 <= 3) return 5;
    if (levelNumber + 1 <= 6) return 6;
    if (levelNumber + 1 <= 16) return 7;
    return 8;
  }, [levelNumber]);

  // Load saved state on mount
  useEffect(() => {
    const saved = bridge.loadGameState<{
      levelNumber: number;
      score: number;
      highScore: number;
      noHintStreak?: number;
      threeStreakCount?: number;
      gameMode?: 'classic' | 'zen';
      zenGridDim?: number;
    }>();
    if (saved) {
      if (saved.highScore) setHighScore(saved.highScore);
      if (typeof saved.noHintStreak === 'number') setNoHintStreak(saved.noHintStreak);
      if (typeof saved.threeStreakCount === 'number') setThreeStreakCount(saved.threeStreakCount);
      if (saved.gameMode) setGameMode(saved.gameMode);
      if (saved.zenGridDim) setZenGridDim(saved.zenGridDim);
    }
  }, [bridge]);

  // Save game state
  useEffect(() => {
    bridge.saveGameState({
      levelNumber,
      score,
      highScore: Math.max(score, highScore),
      noHintStreak,
      threeStreakCount,
      gameMode,
      zenGridDim,
    });
  }, [bridge, levelNumber, score, highScore, noHintStreak, threeStreakCount, gameMode, zenGridDim]);

  // Timer loop
  useEffect(() => {
    if (isPaused || isLevelWon) {
      if (timerRef.current) clearInterval(timerRef.current);
      return;
    }

    timerRef.current = setInterval(() => {
      setTimeElapsed((prev) => prev + 1);
    }, 1000);

    return () => {
      if (timerRef.current) clearInterval(timerRef.current);
    };
  }, [isPaused, isLevelWon]);

  // Set of cavity cell keys for fast O(1) lookup
  const cavityKeysSet = useMemo(() => {
    return new Set(currentLevel.cavityCells.map(([r, c]) => coordKey(r, c)));
  }, [currentLevel.cavityCells]);

  // Occupied cells map: "r,c" -> { blockId, cellCoord }
  const occupiedCellsMap = useMemo(() => {
    const map = new Map<string, { blockId: string; cell: CellCoord }>();
    placedBlocks.forEach((pb) => {
      pb.cellsOnBoard.forEach(([r, c]) => {
        map.set(coordKey(r, c), { blockId: pb.blockId, cell: [r, c] });
      });
    });
    return map;
  }, [placedBlocks]);

  // Validate if a block can be placed at board position [targetRow, targetCol]
  const checkPlacementValid = useCallback(
    (block: BlockShape, targetRow: number, targetCol: number, ignoreBlockId?: string): {
      isValid: boolean;
      coveredCells: CellCoord[];
    } => {
      const coveredCells: CellCoord[] = [];
      let isValid = true;

      for (const [relR, relC] of block.cells) {
        const boardR = targetRow + relR;
        const boardC = targetCol + relC;
        const key = coordKey(boardR, boardC);
        coveredCells.push([boardR, boardC]);

        // 1. Must be within grid bounds
        if (
          boardR < 0 ||
          boardR >= currentLevel.gridHeight ||
          boardC < 0 ||
          boardC >= currentLevel.gridWidth
        ) {
          isValid = false;
          continue;
        }

        // 2. Must be part of the carved cavity (cannot place outside the recessed hole!)
        if (!cavityKeysSet.has(key)) {
          isValid = false;
          continue;
        }

        // 3. Must not overlap with any other placed block
        const existing = occupiedCellsMap.get(key);
        if (existing && existing.blockId !== ignoreBlockId) {
          isValid = false;
          continue;
        }
      }

      return { isValid, coveredCells };
    },
    [currentLevel.gridHeight, currentLevel.gridWidth, cavityKeysSet, occupiedCellsMap]
  );

  // Check if puzzle is fully solved (all cavity cells covered)
  const checkWinCondition = useCallback(
    (currentPlaced: PlacedBlock[]) => {
      const coveredKeys = new Set<string>();
      currentPlaced.forEach((pb) => {
        pb.cellsOnBoard.forEach(([r, c]) => {
          coveredKeys.add(coordKey(r, c));
        });
      });

      // Every cavity cell must be covered
      const allCavityCovered = currentLevel.cavityCells.every(([r, c]) =>
        coveredKeys.has(coordKey(r, c))
      );

      // And no extra cells covered outside cavity
      const noOutsideCells = Array.from(coveredKeys).every((k) => cavityKeysSet.has(k));

      return allCavityCovered && noOutsideCells;
    },
    [currentLevel.cavityCells, cavityKeysSet]
  );

  // Handle victory with 2x score multiplier for 3+ consecutive no-hint streak and Zen handling
  const handleVictory = useCallback(
    async (finalPlaced: PlacedBlock[]) => {
      setIsLevelWon(true);
      if (!muted) bridge.playSound('win');

      if (gameMode === 'zen') {
        // Zen victory: relaxing exp & gentle rewards, no pressure
        setLevelWinScore(150);
        setWinRewards({
          coins: 20,
          exp: 30,
          chest: null,
        });
        bridge.reportQuest('play_any', 1);
        return;
      }

      // Streak calculation for Classic mode
      const usedHint = hintsUsedThisLevel > 0;
      let newStreak = noHintStreak;
      let isDouble = false;

      if (!usedHint) {
        newStreak = noHintStreak + 1;
        isDouble = newStreak >= 3;
      } else {
        newStreak = 0;
        isDouble = false;
      }

      setNoHintStreak(newStreak);
      setIsWinDoubleScore(isDouble);

      // Trigger Fireworks & Neon Glow celebration when 3-win streak milestone is hit
      if (!usedHint && newStreak >= 3) {
        // Milestone fireworks
        confetti({
          particleCount: 75,
          spread: 70,
          origin: { x: 0.15, y: 0.5 },
          colors: ['#fbbf24', '#f59e0b', '#ec4899', '#38bdf8', '#a855f7'],
        });
        setTimeout(() => {
          confetti({
            particleCount: 75,
            spread: 70,
            origin: { x: 0.85, y: 0.5 },
            colors: ['#ffd700', '#f97316', '#3b82f6', '#10b981', '#f43f5e'],
          });
        }, 220);

        setShowStreakBurstOverlay(true);
        setTimeout(() => {
          setShowStreakBurstOverlay(false);
        }, 3200);

        // Track achievement "Combo Master": 5 streaks of 3 wins without hints
        if (newStreak === 3 || newStreak % 3 === 0) {
          const updatedMasterStreaks = threeStreakCount + 1;
          setThreeStreakCount(updatedMasterStreaks);
          bridge.reportProgress('fts-combo-master', updatedMasterStreaks, true);
        }
      }

      // Calculate level score scaled with difficulty
      const gridMultiplier = currentLevel.gridWidth * 25;
      const basePoints = 300 + levelNumber * 100 + gridMultiplier;
      const timeBonus = Math.max(20, Math.floor(200 - timeElapsed * 2));
      const undoBonus = undosRemaining * 60;
      const rawEarned = basePoints + timeBonus + undoBonus;
      const totalEarned = isDouble ? rawEarned * 2 : rawEarned;

      setLevelWinScore(totalEarned);
      const newTotalScore = score + totalEarned;
      setScore(newTotalScore);
      if (newTotalScore > highScore) {
        setHighScore(newTotalScore);
      }

      // Submit score to bridge & leaderboard
      const res = await bridge.submitScore(newTotalScore, {
        level: levelNumber,
        moves: movesCount,
        timeSeconds: timeElapsed,
      });

      // Report achievements
      bridge.reportProgress('fts-level-3', levelNumber, true);
      bridge.reportProgress('fts-level-10', levelNumber, true);
      bridge.reportProgress('fts-level-25', levelNumber, true);
      if (!usedHint) {
        bridge.reportProgress('fts-streak-3', newStreak, true);
      }
      bridge.reportQuest('play_any', 1);

      const baseCoins = res.coinsEarned || Math.max(35, Math.floor(rawEarned / 7)) + levelNumber * 5;
      const baseExp = Math.max(30, Math.floor(rawEarned / 8)) + levelNumber * 5;

      setWinRewards({
        coins: isDouble ? baseCoins * 2 : baseCoins,
        exp: isDouble ? baseExp * 2 : baseExp,
        chest: res.droppedChest || null,
      });
    },
    [
      bridge,
      gameMode,
      levelNumber,
      timeElapsed,
      undosRemaining,
      score,
      highScore,
      movesCount,
      muted,
      currentLevel.gridWidth,
      hintsUsedThisLevel,
      noHintStreak,
      threeStreakCount,
    ]
  );

  // Place a block at position
  const placeBlockAt = useCallback(
    (block: BlockShape, targetRow: number, targetCol: number, origin: 'tray' | 'board', oldPos?: CellCoord) => {
      const { isValid, coveredCells } = checkPlacementValid(block, targetRow, targetCol, origin === 'board' ? block.id : undefined);

      if (!isValid) {
        if (!muted) bridge.playSound('error');
        return false;
      }

      // Clear hint highlight when player acts
      setHintHighlight(null);

      // Record snapshot for UNDO
      setUndoHistory((prev) => [
        ...prev,
        {
          placedBlocks: [...placedBlocks],
          availableBlockIds: availableBlocks.map((b) => b.id),
        },
      ]);

      let newPlaced: PlacedBlock[];
      let newAvailable: BlockShape[];

      if (origin === 'tray') {
        const newBlock: PlacedBlock = {
          blockId: block.id,
          position: [targetRow, targetCol],
          cellsOnBoard: coveredCells,
        };
        newPlaced = [...placedBlocks, newBlock];
        newAvailable = availableBlocks.filter((b) => b.id !== block.id);
      } else {
        // Moved from board to board
        newPlaced = placedBlocks.map((pb) =>
          pb.blockId === block.id
            ? {
                ...pb,
                position: [targetRow, targetCol],
                cellsOnBoard: coveredCells,
              }
            : pb
        );
        newAvailable = availableBlocks;
      }

      setPlacedBlocks(newPlaced);
      setAvailableBlocks(newAvailable);
      setSelectedBlockId(null);
      setMovesCount((m) => m + 1);

      if (!muted) bridge.playSound('pop');

      // Check for victory
      if (checkWinCondition(newPlaced)) {
        setTimeout(() => {
          handleVictory(newPlaced);
        }, 200);
      }

      return true;
    },
    [checkPlacementValid, placedBlocks, availableBlocks, muted, bridge, checkWinCondition, handleVictory]
  );

  // Remove a placed block from board back to tray
  const removeBlockToTray = useCallback(
    (blockId: string) => {
      const blockDef = currentLevel.blocks.find((b) => b.id === blockId);
      if (!blockDef) return;

      setHintHighlight(null);

      // Save Undo
      setUndoHistory((prev) => [
        ...prev,
        {
          placedBlocks: [...placedBlocks],
          availableBlockIds: availableBlocks.map((b) => b.id),
        },
      ]);

      setPlacedBlocks((prev) => prev.filter((pb) => pb.blockId !== blockId));
      setAvailableBlocks((prev) => [...prev, blockDef]);
      if (!muted) bridge.playSound('tap');
    },
    [currentLevel.blocks, placedBlocks, availableBlocks, muted, bridge]
  );

  // UNDO ACTION: Limited to 3 uses in Classic; Unlimited in Zen Mode
  const handleUndo = useCallback(() => {
    if (undoHistory.length === 0 || isLevelWon) {
      if (!muted) bridge.playSound('error');
      return;
    }

    if (gameMode === 'classic' && undosRemaining <= 0) {
      if (!muted) bridge.playSound('error');
      return;
    }

    setHintHighlight(null);

    const lastState = undoHistory[undoHistory.length - 1];
    setUndoHistory((prev) => prev.slice(0, -1));
    setPlacedBlocks(lastState.placedBlocks);
    setAvailableBlocks(
      currentLevel.blocks.filter((b) => lastState.availableBlockIds.includes(b.id))
    );
    if (gameMode === 'classic') {
      setUndosRemaining((u) => u - 1);
    }
    setSelectedBlockId(null);

    if (!muted) bridge.playSound('tap');
  }, [gameMode, undosRemaining, undoHistory, isLevelWon, muted, bridge, currentLevel.blocks]);

  // HINT ACTION: Shows correct target placement for an available block
  const handleUseHint = useCallback(() => {
    if (isLevelWon || availableBlocks.length === 0) {
      if (!muted) bridge.playSound('error');
      return;
    }

    // Look for an available block with solution
    let targetPlacement = currentLevel.solution.find((sol) =>
      availableBlocks.some((b) => b.id === sol.blockId)
    );

    if (!targetPlacement && currentLevel.solution.length > 0) {
      targetPlacement = currentLevel.solution[0];
    }

    if (!targetPlacement) {
      if (!muted) bridge.playSound('error');
      return;
    }

    const targetBlock = currentLevel.blocks.find((b) => b.id === targetPlacement!.blockId);
    if (!targetBlock) return;

    const coveredCells: CellCoord[] = targetBlock.cells.map(
      ([r, c]) => [targetPlacement!.position[0] + r, targetPlacement!.position[1] + c] as CellCoord
    );

    setHintHighlight({
      blockId: targetBlock.id,
      targetPosition: targetPlacement.position,
      coveredCells,
    });
    setSelectedBlockId(targetBlock.id);
    setHintsUsedThisLevel((prev) => prev + 1);

    if (!muted) bridge.playSound('pop');

    if (gameMode === 'zen') {
      setHintWarningNotice('💡 Gợi ý Zen: Vị trí chuẩn đã được làm nổi bật (miễn phí)');
    } else if (noHintStreak > 0) {
      setHintWarningNotice(`💡 Đã dùng gợi ý! Chuỗi tự lực (${noHintStreak} màn) sẽ bị đặt lại về 0.`);
    } else {
      setHintWarningNotice('💡 Đã làm nổi bật vị trí chuẩn xác của khối gỗ!');
    }

    setTimeout(() => {
      setHintWarningNotice(null);
    }, 3500);
  }, [isLevelWon, availableBlocks, currentLevel.solution, currentLevel.blocks, muted, bridge, gameMode, noHintStreak]);

  // Restart current level
  const handleRestartLevel = useCallback(() => {
    setPlacedBlocks([]);
    setAvailableBlocks(currentLevel.blocks);
    setSelectedBlockId(null);
    if (gameMode === 'classic') {
      setUndosRemaining(3);
    }
    setUndoHistory([]);
    setHintHighlight(null);
    setHintsUsedThisLevel(0);
    setHintWarningNotice(null);
    setTimeElapsed(0);
    setMovesCount(0);
    setIsLevelWon(false);
    if (!muted) bridge.playSound('tap');
  }, [currentLevel.blocks, gameMode, muted, bridge]);

  // Next level transition
  const handleNextLevel = useCallback(() => {
    if (gameMode === 'zen') {
      const nextZen = zenIndex + 1;
      const newLvl = generateZenLevel(zenGridDim, nextZen);
      setZenIndex(nextZen);
      setCurrentLevel(newLvl);
      setPlacedBlocks([]);
      setAvailableBlocks(newLvl.blocks);
      setSelectedBlockId(null);
      setUndoHistory([]);
      setHintHighlight(null);
      setHintsUsedThisLevel(0);
      setHintWarningNotice(null);
      setTimeElapsed(0);
      setMovesCount(0);
      setIsLevelWon(false);
      if (!muted) bridge.playSound('levelUp');
      return;
    }

    const nextLvlNum = levelNumber + 1;
    const newLvl = generateProceduralLevel(nextLvlNum);
    setLevelNumber(nextLvlNum);
    setCurrentLevel(newLvl);
    setPlacedBlocks([]);
    setAvailableBlocks(newLvl.blocks);
    setSelectedBlockId(null);
    setUndosRemaining(3);
    setUndoHistory([]);
    setHintHighlight(null);
    setHintsUsedThisLevel(0);
    setHintWarningNotice(null);
    setTimeElapsed(0);
    setMovesCount(0);
    setIsLevelWon(false);
    if (!muted) bridge.playSound('levelUp');
  }, [gameMode, zenIndex, zenGridDim, levelNumber, muted, bridge]);

  // Switch to Zen Mode or generate new Zen level
  const handleSwitchToZen = useCallback((newDim?: number) => {
    const dim = newDim ?? zenGridDim;
    setGameMode('zen');
    if (newDim) setZenGridDim(newDim);
    const newZen = zenIndex + 1;
    setZenIndex(newZen);
    const newLvl = generateZenLevel(dim, newZen);
    setCurrentLevel(newLvl);
    setPlacedBlocks([]);
    setAvailableBlocks(newLvl.blocks);
    setSelectedBlockId(null);
    setUndoHistory([]);
    setHintHighlight(null);
    setHintsUsedThisLevel(0);
    setHintWarningNotice(null);
    setTimeElapsed(0);
    setMovesCount(0);
    setIsLevelWon(false);
    if (!muted) bridge.playSound('tap');
  }, [zenGridDim, zenIndex, muted, bridge]);

  // Switch to Classic Challenge Mode
  const handleSwitchToClassic = useCallback(() => {
    setGameMode('classic');
    const newLvl = generateProceduralLevel(levelNumber);
    setCurrentLevel(newLvl);
    setPlacedBlocks([]);
    setAvailableBlocks(newLvl.blocks);
    setSelectedBlockId(null);
    setUndosRemaining(3);
    setUndoHistory([]);
    setHintHighlight(null);
    setHintsUsedThisLevel(0);
    setHintWarningNotice(null);
    setTimeElapsed(0);
    setMovesCount(0);
    setIsLevelWon(false);
    if (!muted) bridge.playSound('tap');
  }, [levelNumber, muted, bridge]);

  // Pointer drag start
  const handlePointerDown = (
    e: React.PointerEvent,
    block: BlockShape,
    origin: 'tray' | 'board',
    originalPos?: CellCoord
  ) => {
    if (isLevelWon || isPaused) return;
    e.preventDefault();
    (e.target as HTMLElement).setPointerCapture?.(e.pointerId);

    setDragState({
      block,
      origin,
      originalPos,
      pointerX: e.clientX,
      pointerY: e.clientY,
      grabOffset: { x: 0, y: 0 },
    });
  };

  // Pointer drag move
  const handlePointerMove = (e: React.PointerEvent) => {
    if (!dragState) return;

    setDragState((prev) =>
      prev
        ? {
            ...prev,
            pointerX: e.clientX,
            pointerY: e.clientY,
          }
        : null
    );

    // Compute snapped board row and col with 55px upward touch offset so finger doesn't block the block shape
    if (gridRef.current) {
      const gridRect = gridRef.current.getBoundingClientRect();
      const FINGER_OFFSET_Y = 55;
      
      const blockPixelW = dragState.block.width * cellSize;
      const blockPixelH = dragState.block.height * cellSize;

      const relativeX = e.clientX - gridRect.left - blockPixelW / 2;
      const relativeY = (e.clientY - FINGER_OFFSET_Y) - gridRect.top - blockPixelH / 2;

      const targetCol = Math.round(relativeX / cellSize);
      const targetRow = Math.round(relativeY / cellSize);

      const check = checkPlacementValid(
        dragState.block,
        targetRow,
        targetCol,
        dragState.origin === 'board' ? dragState.block.id : undefined
      );

      setSnapPreview({
        row: targetRow,
        col: targetCol,
        isValid: check.isValid,
        coveredCells: check.coveredCells,
      });
    }
  };

  // Pointer drag end
  const handlePointerUp = (e: React.PointerEvent) => {
    if (!dragState) return;

    if (snapPreview && snapPreview.isValid) {
      placeBlockAt(
        dragState.block,
        snapPreview.row,
        snapPreview.col,
        dragState.origin,
        dragState.originalPos
      );
    } else {
      // Snapped back
      if (!muted) bridge.playSound('tap');
    }

    setDragState(null);
    setSnapPreview(null);
  };

  // Click on a cell on board (for click-to-place flow)
  const handleBoardCellClick = (r: number, c: number) => {
    if (isLevelWon) return;

    const cellKey = coordKey(r, c);
    const existing = occupiedCellsMap.get(cellKey);

    // If clicking on already placed block -> pick it back up to tray
    if (existing) {
      removeBlockToTray(existing.blockId);
      return;
    }

    // If a block in tray is selected, attempt to place it with top-left origin at (r,c) or offset
    if (selectedBlockId) {
      const block = availableBlocks.find((b) => b.id === selectedBlockId);
      if (!block) return;

      const placed = placeBlockAt(block, r, c, 'tray');
      if (!placed) {
        // Try fitting with origin aligned to clicked cell
        let fitted = false;
        for (const [relR, relC] of block.cells) {
          const testOriginR = r - relR;
          const testOriginC = c - relC;
          if (placeBlockAt(block, testOriginR, testOriginC, 'tray')) {
            fitted = true;
            break;
          }
        }
        if (!fitted && !muted) {
          bridge.playSound('error');
        }
      }
    }
  };

  const formatTimer = (secs: number) => {
    const mins = Math.floor(secs / 60);
    const remainder = secs % 60;
    return `${mins}:${remainder.toString().padStart(2, '0')}`;
  };

  return (
    <div
      id="fts-game-container"
      onPointerMove={handlePointerMove}
      onPointerUp={handlePointerUp}
      className="arcade-game-surface relative w-full h-full min-h-[640px] flex flex-col justify-between items-center select-none overflow-hidden"
      style={{
        // Realistic warm wood background matching reference photo
        backgroundColor: '#cf9d69',
        backgroundImage: `
          radial-gradient(ellipse at 50% 30%, rgba(255, 238, 214, 0.45) 0%, rgba(184, 126, 75, 0.45) 100%),
          repeating-linear-gradient(
            0deg,
            transparent,
            transparent 78px,
            rgba(125, 78, 41, 0.25) 79px,
            rgba(255, 255, 255, 0.12) 80px,
            transparent 82px
          )
        `,
      }}
    >
      {/* MODE SWITCHER & STREAK NEON CELEBRATION OVERLAY */}
      {/* 3-WIN STREAK NEON CELEBRATION OVERLAY */}
      {showStreakBurstOverlay && (
        <div className="absolute inset-0 z-50 pointer-events-none flex flex-col items-center justify-center bg-black/40 backdrop-blur-[2px] animate-fade-in">
          <div className="relative flex flex-col items-center px-8 py-6 rounded-3xl bg-gradient-to-b from-amber-950/95 via-[#3f1e0d]/95 to-amber-950/95 border-4 border-yellow-400 shadow-[0_0_60px_rgba(250,204,21,0.95)] animate-bounce">
            <div className="flex items-center gap-2 mb-1">
              <Sparkles className="w-8 h-8 text-yellow-300 animate-spin" />
              <Flame className="w-10 h-10 text-orange-400 animate-pulse" />
              <Sparkles className="w-8 h-8 text-yellow-300 animate-spin" />
            </div>
            <h2 className="text-2xl sm:text-3xl font-black text-transparent bg-clip-text bg-gradient-to-r from-yellow-200 via-amber-300 to-yellow-100 drop-shadow-[0_0_20px_rgba(250,204,21,0.9)] uppercase tracking-wider text-center">
              CHUỖI 3 MÀN TỰ LỰC!
            </h2>
            <div className="mt-2 px-4 py-1.5 rounded-full bg-yellow-400 text-stone-950 font-black text-sm sm:text-base shadow-lg animate-pulse">
              🔥 NHÂN ĐÔI X2 ĐIỂM SỐ & THƯỞNG 🔥
            </div>
            <p className="mt-2 text-xs sm:text-sm text-amber-200 font-bold text-center">
              Thành tích "Combo Master": {threeStreakCount}/5 chuỗi 3 màn
            </p>
          </div>
        </div>
      )}

      {/* HEADER / TOOLBAR */}
      <div className="w-full max-w-4xl px-3 sm:px-6 pt-2 pb-1 flex flex-col gap-1.5 z-30">
        {/* Top bar: Mode Switcher tabs */}
        <div className="flex items-center justify-center gap-2">
          {/* Mode Switcher Tabs */}
          <div className="flex items-center p-1 rounded-2xl bg-[#361c0d]/90 border border-[#8a4e25]/60 shadow-inner">
            <button
              id="fts-mode-classic"
              onClick={handleSwitchToClassic}
              className={`flex items-center gap-1.5 px-3 py-1 rounded-xl text-xs font-black transition-all ${
                gameMode === 'classic'
                  ? 'bg-gradient-to-r from-amber-600 to-amber-700 text-amber-100 shadow-md border border-amber-400/50'
                  : 'text-amber-300/70 hover:text-amber-100'
              }`}
            >
              <Trophy className="w-3.5 h-3.5 text-yellow-300" />
              <span>Thử Thách</span>
            </button>
            <button
              id="fts-mode-zen"
              onClick={() => handleSwitchToZen()}
              className={`flex items-center gap-1.5 px-3 py-1 rounded-xl text-xs font-black transition-all ${
                gameMode === 'zen'
                  ? 'bg-gradient-to-r from-teal-700 to-emerald-700 text-teal-100 shadow-md border border-teal-300/50'
                  : 'text-teal-300/70 hover:text-teal-100'
              }`}
            >
              <Flower className="w-3.5 h-3.5 text-emerald-300" />
              <span>Zen Thư Giãn</span>
            </button>
          </div>
        </div>

        {/* Second row: Level Info, Stats & Tools */}
        <div className="flex flex-wrap items-center justify-between gap-2">
          {/* Level Title / Zen Dim selector */}
          {gameMode === 'classic' ? (
            <div className="flex flex-col">
              <div className="flex items-center gap-1.5">
                <span className="text-base sm:text-lg font-black text-[#2e1708] drop-shadow-sm">
                  Màn {levelNumber}
                </span>
                <span className="text-[10px] px-2 py-0.5 rounded-md font-extrabold bg-[#4a2712]/80 text-amber-200 border border-[#854d27]/60 shadow-xs">
                  {currentLevel.gridWidth}x{currentLevel.gridHeight}
                </span>
              </div>
              <span className="text-[10px] text-[#5c3318] font-bold truncate max-w-[140px] sm:max-w-none">
                {currentLevel.difficultyLabel} • {currentLevel.shapeComplexity}
              </span>
            </div>
          ) : (
            <div className="flex items-center gap-1.5">
              <span className="text-xs font-black text-[#2e1708]">Cỡ Bàn:</span>
              <div className="flex items-center gap-1">
                {[4, 5, 6, 7].map((dim) => (
                  <button
                    key={`zen-dim-${dim}`}
                    onClick={() => handleSwitchToZen(dim)}
                    className={`px-2 py-0.5 rounded-lg text-xs font-black border transition-all ${
                      zenGridDim === dim
                        ? 'bg-teal-700 text-white border-teal-300 shadow-sm'
                        : 'bg-[#4a2614]/70 text-amber-200 border-[#7d4422]/60 hover:bg-[#5e311a]'
                    }`}
                  >
                    {dim}x{dim}
                  </button>
                ))}
              </div>
              <button
                onClick={() => handleSwitchToZen()}
                className="p-1.5 rounded-lg bg-[#4a2614]/70 hover:bg-[#5e311a] text-amber-200 border border-[#7d4422]/60 ml-1"
                title="Đổi câu đố Zen ngẫu nhiên khác"
              >
                <Shuffle className="w-3.5 h-3.5" />
              </button>
            </div>
          )}

          {/* Center Stats */}
          <div className="flex items-center gap-2 sm:gap-3">
            <div className="flex items-center gap-2 sm:gap-3 bg-[#402211]/80 backdrop-blur-sm border border-[#965c32]/50 px-2.5 sm:px-3 py-1 rounded-2xl shadow-inner text-amber-100">
              {gameMode === 'classic' && (
                <>
                  <div className="flex flex-col items-center">
                    <span className="text-[8px] uppercase tracking-wider text-amber-300/80 font-bold">
                      Điểm
                    </span>
                    <span className="text-xs sm:text-sm font-black text-yellow-300">
                      {score}
                    </span>
                  </div>
                  <div className="h-5 w-[1px] bg-amber-700/40" />
                </>
              )}

              <div className="flex flex-col items-center">
                <span className="text-[8px] uppercase tracking-wider text-amber-300/80 font-bold">
                  {gameMode === 'zen' ? 'Thư Giãn' : 'Thời Gian'}
                </span>
                <span className="text-xs sm:text-sm font-black text-amber-100 font-mono">
                  {formatTimer(timeElapsed)}
                </span>
              </div>
            </div>

            {/* No-Hint Streak Multiplier Pill (Classic only) */}
            {gameMode === 'classic' && (
              <div
                id="fts-streak-indicator"
                className={`flex items-center gap-1.5 px-2.5 py-1 rounded-2xl text-xs font-black shadow-md border transition-all ${
                  noHintStreak >= 3
                    ? 'bg-gradient-to-r from-amber-500 via-yellow-400 to-amber-500 text-stone-950 border-yellow-200 shadow-[0_0_14px_rgba(250,204,21,0.65)] animate-pulse'
                    : noHintStreak === 2
                    ? 'bg-amber-900/90 text-amber-200 border-amber-500/60 shadow-inner'
                    : noHintStreak === 1
                    ? 'bg-[#3b2012]/90 text-amber-300 border-amber-700/50'
                    : 'bg-[#331c10]/80 text-amber-400/80 border-amber-800/40'
                }`}
                title={
                  noHintStreak >= 3
                    ? `Đang có chuỗi ${noHintStreak} màn không dùng gợi ý: Điểm thắng và phần thưởng được X2!`
                    : `Chuỗi tự lực: ${noHintStreak}/3 màn không dùng gợi ý. Hoàn thành chuỗi 3 màn để mở nhân đôi X2 điểm!`
                }
              >
                <Flame className={`w-3.5 h-3.5 ${noHintStreak >= 3 ? 'text-stone-950 animate-bounce' : 'text-orange-400'}`} />
                <span className="hidden xs:inline text-[10px] sm:text-[11px]">Tự Lực:</span>
                <span className="text-[10px] sm:text-[11px]">
                  {noHintStreak >= 3 ? `${noHintStreak} Màn (x2 🔥)` : `${noHintStreak}/3 Màn`}
                </span>
              </div>
            )}
          </div>

          {/* Right Action Tools: Hint, Undo, Restart */}
          <div className="flex items-center gap-1.5">
            {/* Hint Button */}
            <button
              id="fts-btn-hint"
              onClick={handleUseHint}
              disabled={isLevelWon || availableBlocks.length === 0}
              className={`flex items-center gap-1 p-1.5 sm:px-2.5 sm:py-1.5 rounded-xl border font-bold text-xs shadow-md transition-all ${
                !isLevelWon && availableBlocks.length > 0
                  ? 'bg-gradient-to-r from-yellow-600/80 to-amber-600/90 hover:from-yellow-500 hover:to-amber-500 text-yellow-100 border-yellow-400/60 active:scale-95 shadow-yellow-950/40'
                  : 'bg-stone-800/60 text-stone-400 border-stone-700/50 cursor-not-allowed opacity-60'
              }`}
              title={
                gameMode === 'zen'
                  ? 'Xem gợi ý xếp vị trí khối gỗ (Miễn phí trong chế độ Zen)'
                  : noHintStreak > 0
                  ? `Xem gợi ý vị trí chuẩn (Lưu ý: Dùng gợi ý sẽ đặt lại chuỗi tự lực ${noHintStreak} màn)`
                  : 'Xem gợi ý vị trí chuẩn cho khối gỗ'
              }
            >
              <Lightbulb className="w-3.5 h-3.5 text-yellow-300" />
              <span className="hidden sm:inline">Gợi Ý</span>
            </button>

            {/* Undo Button */}
            <button
              id="fts-btn-undo"
              onClick={handleUndo}
              disabled={
                undoHistory.length === 0 ||
                isLevelWon ||
                (gameMode === 'classic' && undosRemaining <= 0)
              }
              className={`flex items-center gap-1 px-2 sm:px-2.5 py-1.5 rounded-xl border font-bold text-xs shadow-md transition-all ${
                undoHistory.length > 0 && !isLevelWon && (gameMode === 'zen' || undosRemaining > 0)
                  ? 'bg-gradient-to-r from-amber-600 to-amber-700 hover:from-amber-500 hover:to-amber-600 text-white border-amber-400 active:scale-95 shadow-amber-900/40'
                  : 'bg-stone-800/60 text-stone-400 border-stone-700/50 cursor-not-allowed opacity-60'
              }`}
              title={
                gameMode === 'zen'
                  ? 'Lùi lại 1 bước (Không giới hạn trong chế độ Zen)'
                  : `Lùi lại 1 bước (${undosRemaining}/3 lượt còn lại)`
              }
            >
              <Undo2 className="w-3.5 h-3.5" />
              <span className="hidden sm:inline">Lùi</span>
              {gameMode === 'classic' && (
                <span
                  className={`text-[9px] px-1 py-0.2 rounded-full font-black ${
                    undosRemaining > 0 ? 'bg-amber-950/70 text-amber-200' : 'bg-stone-900 text-stone-300'
                  }`}
                >
                  {undosRemaining}/3
                </span>
              )}
            </button>

            {/* Restart Level Button */}
            <button
              id="fts-btn-restart"
              onClick={handleRestartLevel}
              className="flex items-center justify-center p-1.5 sm:p-2 rounded-xl bg-[#52301c]/80 hover:bg-[#3d2314] text-[#ffd8a8] border border-[#a66a3d]/60 shadow-md active:scale-95 transition-all"
              title="Chơi lại màn này"
            >
              <RotateCcw className="w-3.5 h-3.5" />
            </button>
          </div>
        </div>
      </div>

      {/* HINT / STREAK TOAST BANNER */}
      {hintWarningNotice && (
        <div className="absolute top-20 z-40 bg-gradient-to-r from-amber-950/95 via-[#4a2614]/95 to-amber-950/95 border-2 border-yellow-500/80 text-amber-100 text-xs font-bold px-4 py-2 rounded-2xl shadow-2xl backdrop-blur-md flex items-center gap-2 animate-bounce">
          <Sparkles className="w-4 h-4 text-yellow-400 shrink-0" />
          <span>{hintWarningNotice}</span>
        </div>
      )}

      {/* CENTER: THE WOODEN BOARD WITH 3D CARVED CAVITY */}
      <div className="relative flex-1 flex flex-col items-center justify-center p-2 sm:p-4 w-full">
        {/* Decorative Ambient shadow frame */}
        <div
          ref={boardRef}
          id="fts-board-canvas"
          className="relative rounded-2xl sm:rounded-3xl shadow-2xl transition-all duration-300 select-none overflow-hidden"
          style={{
            width: currentLevel.gridWidth * cellSize + BOARD_PADDING * 2,
            height: currentLevel.gridHeight * cellSize + BOARD_PADDING * 2,
            padding: BOARD_PADDING,
            backgroundColor: '#8a522c',
            backgroundImage: `
              radial-gradient(ellipse at 50% 30%, rgba(220, 160, 105, 0.4) 0%, rgba(100, 50, 20, 0.6) 100%),
              repeating-linear-gradient(
                45deg,
                transparent,
                transparent 12px,
                rgba(60, 30, 10, 0.08) 13px,
                transparent 16px
              )
            `,
            boxShadow: '0 20px 40px -10px rgba(25, 10, 5, 0.6), inset 0 2px 4px rgba(255, 230, 200, 0.3), inset 0 -4px 8px rgba(40, 15, 5, 0.6)',
            border: '3px solid #5a2e12',
            touchAction: 'none',
          }}
        >
          {/* INNER GRID CONTAINER (100% Exact Coordinate Reference for Tiles and Placed Blocks) */}
          <div
            ref={gridRef}
            className="relative"
            style={{
              width: currentLevel.gridWidth * cellSize,
              height: currentLevel.gridHeight * cellSize,
            }}
          >
            {/* CARVED RECESSED CAVITY HOLE BACKGROUND (Dark Walnut wood bottom with deep beveled shadow) */}
            {currentLevel.cavityCells.map(([r, c]) => (
              <div
                key={`cavity-bg-${r}-${c}`}
                className="absolute rounded-[4px] overflow-hidden"
                style={{
                  left: c * cellSize,
                  top: r * cellSize,
                  width: cellSize,
                  height: cellSize,
                  backgroundColor: '#441d0b',
                  backgroundImage: `
                    radial-gradient(circle at 50% 50%, rgba(95, 42, 16, 0.8) 0%, rgba(35, 14, 5, 0.95) 100%),
                    repeating-linear-gradient(
                      90deg,
                      transparent,
                      transparent 4px,
                      rgba(0, 0, 0, 0.25) 5px
                    )
                  `,
                  boxShadow: 'inset 0 4px 10px rgba(0, 0, 0, 0.75), inset 0 1px 3px rgba(0, 0, 0, 0.9)',
                  border: '1px solid rgba(85, 36, 15, 0.6)',
                }}
              />
            ))}

            {/* CAVITY CELL INTERACTIVE OVERLAY */}
            {currentLevel.cavityCells.map(([r, c]) => {
              const isOccupied = occupiedCellsMap.has(coordKey(r, c));

              return (
                <div
                  key={`cell-interactive-${r}-${c}`}
                  id={`cell-${r}-${c}`}
                  onClick={() => handleBoardCellClick(r, c)}
                  className={`absolute rounded-[4px] cursor-pointer transition-colors duration-150 flex items-center justify-center ${
                    !isOccupied && selectedBlockId ? 'hover:bg-amber-400/20' : ''
                  }`}
                  style={{
                    left: c * cellSize,
                    top: r * cellSize,
                    width: cellSize,
                    height: cellSize,
                  }}
                >
                  {/* Visual Dot if empty */}
                  {!isOccupied && (
                    <div className="w-1.5 h-1.5 rounded-full bg-amber-900/40 pointer-events-none" />
                  )}
                </div>
              );
            })}

            {/* PLACED WOOD BLOCKS ON THE BOARD */}
            {placedBlocks.map((pb) => {
              const blockDef = currentLevel.blocks.find((b) => b.id === pb.blockId);
              if (!blockDef) return null;

              return (
                <div
                  key={`placed-${pb.blockId}`}
                  className="absolute z-10 transition-transform"
                  style={{
                    left: pb.position[1] * cellSize,
                    top: pb.position[0] * cellSize,
                  }}
                >
                  <WoodBlock
                    block={blockDef}
                    cellSize={cellSize}
                    showShadow={false}
                    onClick={() => removeBlockToTray(pb.blockId)}
                    onPointerDown={(e) => handlePointerDown(e, blockDef, 'board', pb.position)}
                  />
                </div>
              );
            })}

            {/* HINT GHOST PREVIEW ON BOARD */}
            {hintHighlight && !dragState && (
              <div
                className="absolute pointer-events-none z-20 transition-all duration-300"
                style={{
                  left: hintHighlight.targetPosition[1] * cellSize,
                  top: hintHighlight.targetPosition[0] * cellSize,
                }}
              >
                {hintHighlight.coveredCells.map(([r, c], idx) => (
                  <div
                    key={`hint-ghost-${idx}-${r}-${c}`}
                    className="absolute rounded-[5px] border-2 border-yellow-300 bg-yellow-400/40 shadow-[0_0_16px_rgba(250,204,21,0.9)] animate-pulse"
                    style={{
                      left: (c - hintHighlight.targetPosition[1]) * cellSize,
                      top: (r - hintHighlight.targetPosition[0]) * cellSize,
                      width: cellSize,
                      height: cellSize,
                    }}
                  />
                ))}
              </div>
            )}

            {/* SNAP GHOST PREVIEW DURING DRAG */}
            {snapPreview && dragState && (
              <div
                className="absolute pointer-events-none z-20 transition-all duration-75"
                style={{
                  left: snapPreview.col * cellSize,
                  top: snapPreview.row * cellSize,
                }}
              >
                {dragState.block.cells.map(([r, c], idx) => (
                  <div
                    key={`snap-ghost-${idx}-${r}-${c}`}
                    className={`absolute rounded-[5px] border-2 ${
                      snapPreview.isValid
                        ? 'bg-emerald-500/35 border-emerald-300 shadow-[0_0_12px_rgba(52,211,153,0.6)] animate-pulse'
                        : 'bg-rose-500/35 border-rose-300 shadow-[0_0_10px_rgba(244,63,94,0.5)]'
                    }`}
                    style={{
                      left: c * cellSize,
                      top: r * cellSize,
                      width: cellSize,
                      height: cellSize,
                    }}
                  />
                ))}
              </div>
            )}
          </div>
        </div>
      </div>

      {/* BOTTOM STAGING TRAY / DOCK (Displays unplaced wooden blocks) */}
      <div className="w-full max-w-4xl px-3 sm:px-6 pb-4 pt-2 z-30">
        <div
          id="fts-blocks-tray"
          className="relative bg-gradient-to-b from-[#4d2c18]/90 via-[#3a1f10]/95 to-[#2a150a] border-2 border-[#a66a3d]/60 rounded-2xl sm:rounded-3xl p-3 sm:p-4 shadow-xl shadow-amber-950/60"
        >
          {/* Header indicator */}
          <div className="flex items-center justify-between mb-2 px-1">
            <span className="text-[11px] font-black uppercase tracking-wider text-amber-200/90 flex items-center gap-1.5">
              <Sparkles className="w-3.5 h-3.5 text-amber-400" />
              Khay Gạch Cần Lắp ({availableBlocks.length} khối còn lại)
            </span>
            <span className="text-[10px] text-amber-300/70 font-medium hidden sm:inline">
              Kéo thả hoặc Chạm để chọn & đặt vào ô trống
            </span>
          </div>

          {/* Tray block list */}
          <div className="flex flex-row overflow-x-auto overflow-y-visible custom-scrollbar items-center justify-start sm:justify-center gap-4 sm:gap-6 min-h-[100px] py-2 px-2">
            {availableBlocks.length === 0 ? (
              <div className="text-amber-300/60 text-xs font-bold py-4 animate-pulse w-full text-center">
                Đã đặt toàn bộ khối gạch vào bàn cờ!
              </div>
            ) : (
              availableBlocks.map((block) => {
                const isSelected = selectedBlockId === block.id;
                const isHinted = hintHighlight?.blockId === block.id;

                return (
                  <div
                    key={`tray-block-${block.id}`}
                    className={`shrink-0 p-1 rounded-xl transition-all ${
                      isHinted
                        ? 'ring-4 ring-yellow-400 shadow-[0_0_18px_rgba(250,204,21,0.9)] scale-110 animate-bounce'
                        : 'hover:scale-105'
                    }`}
                  >
                    <WoodBlock
                      block={block}
                      cellSize={Math.min(cellSize * 0.65, containerWidth < 640 ? 28 : 38)}
                      isSelected={isSelected}
                      onClick={() => {
                        setSelectedBlockId((prev) => (prev === block.id ? null : block.id));
                        if (!muted) bridge.playSound('tap');
                      }}
                      onPointerDown={(e) => handlePointerDown(e, block, 'tray')}
                    />
                  </div>
                );
              })
            )}
          </div>
        </div>
      </div>

      {/* FLOATING DRAGGED BLOCK FOLLOWER */}
      {dragState && (
        <div
          className="fixed pointer-events-none z-50 transition-transform duration-75"
          style={{
            left: dragState.pointerX,
            top: dragState.pointerY - 55,
            transform: 'translate(-50%, -50%)',
          }}
        >
          <WoodBlock
            block={dragState.block}
            cellSize={cellSize}
            isDragging={true}
          />
        </div>
      )}

      {/* WIN POPUP MODAL (When level is fully solved) */}
      {isLevelWon && (
        <WinPopup
          levelNumber={gameMode === 'zen' ? zenIndex : levelNumber}
          score={score}
          levelScore={levelWinScore}
          timeTakenSeconds={timeElapsed}
          movesCount={movesCount}
          undosLeft={undosRemaining}
          difficultyLabel={gameMode === 'zen' ? 'Zen Thư Giãn' : currentLevel.difficultyLabel}
          shapeComplexity={currentLevel.shapeComplexity}
          nextGridDim={gameMode === 'zen' ? zenGridDim : nextGridDim}
          coinsEarned={winRewards.coins}
          expEarned={winRewards.exp}
          droppedChest={winRewards.chest}
          noHintStreak={noHintStreak}
          isDoubleScore={isWinDoubleScore}
          hintsUsedCount={hintsUsedThisLevel}
          isZenMode={gameMode === 'zen'}
          onNextLevel={handleNextLevel}
          onReplayLevel={handleRestartLevel}
          onExit={() => { setIsLevelWon(false); onGameOver(score); }}
        />
      )}
    </div>
  );
};

