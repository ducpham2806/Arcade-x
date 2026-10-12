import { motion, useReducedMotion } from 'motion/react';
import { slideBoard, spawnBoardTile, type Direction } from './engine';
import React, { useState, useEffect, useCallback, useRef } from 'react';
import { GameComponentProps } from '../../types';
import {
  Sparkles,
  RotateCcw,
  Gem,
  Award,
  Flame,
  ArrowUp,
  ArrowDown,
  ArrowLeft,
  ArrowRight,
  Shuffle,
  Hammer,
  Trophy,
  Users,
  Clock,
  Zap,
  Target,
  Share2,
  Check,
} from 'lucide-react';
import confetti from 'canvas-confetti';

type GameMode = 'classic' | 'big5x5' | 'rush';

interface BoardHistoryState {
  rngState?: number;
  movesCount?: number;
  maxTile?: number;
  rushTime?: number;
  grid: number[][];
  score: number;
  combo: number;
  gemsDroppedThisRun: number;
  milestonesReached: { [key: number]: boolean };
}

interface SavedBoard {
  version: 1;
  rngState?: number;
  assisted?: boolean;
  gameMode: GameMode;
  grid: number[][];
  score: number;
  combo: number;
  movesCount: number;
  maxTile: number;
  rushTime: number;
  gemsEarnedThisGame: number;
  milestonesReached: Record<number, boolean>;
  undoCharges: number;
  shuffleCharges: number;
  hammerCharges: number;
  history: BoardHistoryState[];
}

function readSavedBoard(value: unknown): SavedBoard | null {
  const saved = value as SavedBoard;
  if (!saved || saved.version !== 1 || !['classic', 'big5x5', 'rush'].includes(saved.gameMode)) return null;
  const size = saved.gameMode === 'big5x5' ? 5 : 4;
  if (!Array.isArray(saved.grid) || saved.grid.length !== size || !saved.grid.every(row =>
    Array.isArray(row) && row.length === size && row.every(n => Number.isSafeInteger(n) && (n === 0 || (n >= 2 && Number.isInteger(Math.log2(n))))))) return null;
  if (![saved.score, saved.combo, saved.movesCount, saved.maxTile, saved.rushTime,
    saved.gemsEarnedThisGame, saved.undoCharges, saved.shuffleCharges, saved.hammerCharges]
    .every(n => Number.isFinite(n) && n >= 0) || !saved.milestonesReached || !Array.isArray(saved.history)) return null;
  if (saved.history.length > 3 || saved.history.some(state => !state || !Array.isArray(state.grid) || state.grid.length !== size ||
    !state.grid.every(row => Array.isArray(row) && row.length === size && row.every(n => Number.isSafeInteger(n) && (n === 0 || n >= 2 && Number.isInteger(Math.log2(n))))) ||
    ![state.score, state.combo, state.gemsDroppedThisRun].every(n => Number.isFinite(n) && n >= 0) || !state.milestonesReached)) return null;
  return saved;
}

export const Tile2048Game: React.FC<GameComponentProps> = ({
  bridge,
  isPaused,
  onGameOver,
  onRestart,
  initialState,
}) => {
  const savedBoard = readSavedBoard(initialState !== undefined ? initialState : bridge.loadGameState());
  const [gameMode, setGameMode] = useState<GameMode>(savedBoard?.gameMode ?? 'classic');
  const gridSize = gameMode === 'big5x5' ? 5 : 4;

  const [grid, setGrid] = useState<number[][]>(() => savedBoard?.grid ?? createEmptyGrid(gridSize));
  const [score, setScore] = useState<number>(savedBoard?.score ?? 0);
  const [bestScore, setBestScore] = useState<number>(0);
  const [combo, setCombo] = useState<number>(savedBoard?.combo ?? 0);
  const [movesCount, setMovesCount] = useState<number>(savedBoard?.movesCount ?? 0);
  const [maxTile, setMaxTile] = useState<number>(savedBoard?.maxTile ?? 2);

  // Rush mode timer
  const [rushTime, setRushTime] = useState<number>(savedBoard?.rushTime ?? 60);

  // Gem drops tracking
  const [gemsEarnedThisGame, setGemsEarnedThisGame] = useState<number>(savedBoard?.gemsEarnedThisGame ?? 0);
  const [milestonesReached, setMilestonesReached] = useState<{ [key: number]: boolean }>(savedBoard?.milestonesReached ?? {
    512: false,
    1024: false,
    2048: false,
    4096: false,
    8192: false,
    16384: false,
  });

  // Floating gem reward alert
  const [gemNotification, setGemNotification] = useState<{
    tileValue: number;
    gemAmount: number;
    text: string;
  } | null>(null);

  // Aux Power-ups
  const [undoCharges, setUndoCharges] = useState<number>(savedBoard?.undoCharges ?? 3);
  const [shuffleCharges, setShuffleCharges] = useState<number>(savedBoard?.shuffleCharges ?? 1);
  const [hammerCharges, setHammerCharges] = useState<number>(savedBoard?.hammerCharges ?? 1);
  const [history, setHistory] = useState<BoardHistoryState[]>(savedBoard?.history ?? []);

  // Touch handling ref
  const touchStartPos = useRef<{ x: number; y: number } | null>(null);
  const boardRef = useRef<HTMLDivElement | null>(null);
  const initializedModeRef = useRef<GameMode | null>(savedBoard?.gameMode ?? null);
  const rngRef = useRef(savedBoard?.rngState ?? crypto.getRandomValues(new Uint32Array(1))[0]);
  const endedRef = useRef(false);
  const inputBusyRef = useRef(false);
  const [assisted, setAssisted] = useState(savedBoard?.assisted ?? (savedBoard ? true : false));
  const [pendingMode, setPendingMode] = useState<GameMode | null>(null);
  useEffect(() => { inputBusyRef.current = false; }, [grid]);
  const finish = useCallback((finalScore: number) => {
    if (endedRef.current) return;
    endedRef.current = true;
    onGameOver(finalScore, { mode: gameMode === 'classic' ? 0 : gameMode === 'big5x5' ? 1 : 2, assisted: assisted ? 1 : 0 });
  }, [onGameOver, gameMode, assisted]);


  function createEmptyGrid(size: number): number[][] {
    return Array.from({ length: size }, () => Array(size).fill(0));
  }

  // Find all empty cells
  const getEmptyCells = useCallback((currentGrid: number[][], size: number): { r: number; c: number }[] => {
    const cells: { r: number; c: number }[] = [];
    for (let r = 0; r < size; r++) {
      for (let c = 0; c < size; c++) {
        if (currentGrid[r][c] === 0) {
          cells.push({ r, c });
        }
      }
    }
    return cells;
  }, []);

  const spawnTile = useCallback((currentGrid: number[][], _size: number) => {
    const spawned = spawnBoardTile(currentGrid, rngRef.current);
    rngRef.current = spawned.seed;
    return { newGrid: spawned.grid, spawned: spawned.spawned };
  }, []);

  // Initialize Game
  const startNewGame = useCallback((mode: GameMode = gameMode) => {
    const size = mode === 'big5x5' ? 5 : 4;
    let newGrid = createEmptyGrid(size);
    const spawn1 = spawnTile(newGrid, size);
    newGrid = spawn1.newGrid;
    const spawn2 = spawnTile(newGrid, size);
    newGrid = spawn2.newGrid;

    setGrid(newGrid);
    setScore(0);
    setCombo(0);
    setMovesCount(0);
    setMaxTile(Math.max(...newGrid.flat()));
    endedRef.current = false;
    setAssisted(false);
    setGemsEarnedThisGame(0);
    setMilestonesReached({ 512: false, 1024: false, 2048: false, 4096: false, 8192: false, 16384: false });
    setGemNotification(null);
    setUndoCharges(3);
    setShuffleCharges(1);
    setHammerCharges(1);
    setHistory([]);
    setRushTime(60);

    bridge.playSound('click');
  }, [bridge, spawnTile, gameMode]);

  useEffect(() => {
    if (initializedModeRef.current !== gameMode) {
      initializedModeRef.current = gameMode;
      startNewGame(gameMode);
    }
    try {
      const saved = localStorage.getItem(`arcadex_best_2048_v2_${gameMode}_${assisted ? 'assisted' : 'pure'}`);
      if (saved) setBestScore(parseInt(saved, 10) || 0);
      else setBestScore(0);
    } catch {
      // ignore
    }
  }, [gameMode, startNewGame, assisted]);

  // Save every committed board change so suspend/auto-save has the actual game state.
  useEffect(() => {
    const snapshot: SavedBoard = { version: 1, rngState: rngRef.current, assisted, gameMode, grid, score, combo, movesCount,
      maxTile, rushTime, gemsEarnedThisGame, milestonesReached,
      undoCharges, shuffleCharges, hammerCharges, history };
    bridge.saveGameState(snapshot);
    bridge.updateSessionState?.({ score, moves: movesCount });
  }, [bridge, gameMode, grid, score, combo, movesCount, maxTile, rushTime,
    gemsEarnedThisGame, milestonesReached, undoCharges, shuffleCharges, hammerCharges, history, assisted]);

  useEffect(() => {
    if (isPaused || gameMode !== 'rush' || endedRef.current) return;
    const interval = setInterval(() => setRushTime(prev => Math.max(0, prev - 1)), 1000);
    return () => clearInterval(interval);
  }, [isPaused, gameMode]);
  useEffect(() => { if (!isPaused && gameMode === 'rush' && rushTime <= 0) finish(score); }, [isPaused, gameMode, rushTime, score, finish]);

  // Check if any valid moves remain
  const checkGameOver = useCallback((currentGrid: number[][], size: number): boolean => {
    for (let r = 0; r < size; r++) {
      for (let c = 0; c < size; c++) {
        if (currentGrid[r][c] === 0) return false;
      }
    }
    for (let r = 0; r < size; r++) {
      for (let c = 0; c < size - 1; c++) {
        if (currentGrid[r][c] === currentGrid[r][c + 1]) return false;
      }
    }
    for (let r = 0; r < size - 1; r++) {
      for (let c = 0; c < size; c++) {
        if (currentGrid[r][c] === currentGrid[r + 1][c]) return false;
      }
    }
    return true;
  }, []);

  const handleMilestoneRewards = useCallback((highest: number) => {
    const reached = [512, 1024, 2048, 4096, 8192, 16384].filter(value => highest >= value && !milestonesReached[value]);
    if (!reached.length) return;
    setMilestonesReached(previous => ({ ...previous, ...Object.fromEntries(reached.map(value => [value, true])) }));
    setGemNotification({ tileValue: highest, gemAmount: 0, text: `Đạt ô ${highest.toLocaleString()}! Tiếp tục chinh phục mốc mới.` });
    bridge.playSound('powerup');
    if (!window.matchMedia('(prefers-reduced-motion: reduce)').matches) confetti({ particleCount: 35, spread: 65, origin: { y: .5 } });
  }, [bridge, milestonesReached]);
  useEffect(() => { if (!gemNotification) return; const timer = setTimeout(() => setGemNotification(null), 2400); return () => clearTimeout(timer); }, [gemNotification]);

  // Core move engine supporting infinite merge & rush mode timer boost
  const move = useCallback(
    (direction: Direction) => {
      if (isPaused || endedRef.current || inputBusyRef.current) return;
      const result = slideBoard(grid, direction);
      const { moved, points: pointsEarned, merges: mergedTilesCount } = result;
      const currentHighest = result.maxTile;
      const newGrid = result.grid;
      const currentState: BoardHistoryState = {
        grid: grid.map(row => [...row]), score, combo, gemsDroppedThisRun: gemsEarnedThisGame,
        milestonesReached: { ...milestonesReached }, rngState: rngRef.current, movesCount, maxTile, rushTime,
      };
      if (moved) {
        inputBusyRef.current = true;
        const spawnResult = spawnTile(newGrid, gridSize);
        const finalGrid = spawnResult.newGrid;

        const newScore = score + pointsEarned;
        const newCombo = mergedTilesCount > 0 ? combo + 1 : 0;
        const newMoves = movesCount + 1;

        setGrid(finalGrid);
        setScore(newScore);
        setCombo(newCombo);
        setMovesCount(newMoves);
        setMaxTile(Math.max(currentHighest, ...finalGrid.flat()));

        // Add time in rush mode on successful merge
        if (gameMode === 'rush' && mergedTilesCount > 0) {
          setRushTime((prev) => prev + mergedTilesCount * 3);
        }

        // Check milestones
        handleMilestoneRewards(currentHighest);

        if (newScore > bestScore) {
          setBestScore(newScore);
          try {
            localStorage.setItem(`arcadex_best_2048_v2_${gameMode}_${assisted ? 'assisted' : 'pure'}`, newScore.toString());
          } catch {
            // ignore
          }
        }

        setHistory((prev) => [currentState, ...prev].slice(0, 3));
        bridge.playSound('click');

        // Check game over
        if (checkGameOver(finalGrid, gridSize)) {
          bridge.playSound('gameOver');
          finish(newScore);
        }
      }
    },
    [isPaused, grid, score, combo, movesCount, maxTile, gemsEarnedThisGame, milestonesReached, bestScore, gridSize, gameMode, spawnTile, handleMilestoneRewards, checkGameOver, bridge, onGameOver, finish, rushTime, assisted]
  );

  // Keyboard navigation
  useEffect(() => {
    const handleKeyDown = (e: KeyboardEvent) => {
      if (isPaused || pendingMode || (e.target instanceof HTMLElement && ['INPUT', 'TEXTAREA', 'SELECT'].includes(e.target.tagName))) return;
      if (['ArrowUp', 'KeyW'].includes(e.code)) {
        e.preventDefault();
        move('UP');
      } else if (['ArrowDown', 'KeyS'].includes(e.code)) {
        e.preventDefault();
        move('DOWN');
      } else if (['ArrowLeft', 'KeyA'].includes(e.code)) {
        e.preventDefault();
        move('LEFT');
      } else if (['ArrowRight', 'KeyD'].includes(e.code)) {
        e.preventDefault();
        move('RIGHT');
      }
    };
    window.addEventListener('keydown', handleKeyDown);
    return () => window.removeEventListener('keydown', handleKeyDown);
  }, [move, isPaused, pendingMode]);

  // Touch Swipe Handlers
  const handleTouchStart = (e: React.TouchEvent | React.MouseEvent) => {
    const clientX = 'touches' in e ? e.touches[0].clientX : (e as React.MouseEvent).clientX;
    const clientY = 'touches' in e ? e.touches[0].clientY : (e as React.MouseEvent).clientY;
    touchStartPos.current = { x: clientX, y: clientY };
  };

  const handleTouchEnd = (e: React.TouchEvent | React.MouseEvent) => {
    if (!touchStartPos.current) return;
    const clientX = 'changedTouches' in e ? e.changedTouches[0].clientX : (e as React.MouseEvent).clientX;
    const clientY = 'changedTouches' in e ? e.changedTouches[0].clientY : (e as React.MouseEvent).clientY;

    const diffX = clientX - touchStartPos.current.x;
    const diffY = clientY - touchStartPos.current.y;
    const absX = Math.abs(diffX);
    const absY = Math.abs(diffY);
    const threshold = 32;

    // Ignore tiny taps
    if (absX < threshold && absY < threshold) {
      touchStartPos.current = null;
      return;
    }

    // Deadzone filter for ambiguous diagonal swipes:
    // If smaller axis is > 80% of larger axis, reject to protect user from misdirected moves
    const maxAxis = Math.max(absX, absY);
    const minAxis = Math.min(absX, absY);
    if (minAxis / maxAxis > 0.8) {
      touchStartPos.current = null;
      return;
    }

    if (absX > absY) {
      if (diffX > 0) move('RIGHT');
      else move('LEFT');
    } else {
      if (diffY > 0) move('DOWN');
      else move('UP');
    }
    touchStartPos.current = null;
  };

  // Powerups handlers
  const handleUndo = () => {
    if (isPaused || endedRef.current || undoCharges <= 0 || history.length === 0) return;
    setAssisted(true);
    const lastState = history[0];
    setGrid(lastState.grid);
    rngRef.current = lastState.rngState ?? rngRef.current;
    setMovesCount(lastState.movesCount ?? Math.max(0, movesCount - 1));
    setMaxTile(lastState.maxTile ?? Math.max(...lastState.grid.flat()));
    setRushTime(lastState.rushTime ?? rushTime);
    setScore(lastState.score);
    setCombo(lastState.combo);
    setGemsEarnedThisGame(lastState.gemsDroppedThisRun);
    setMilestonesReached(lastState.milestonesReached);
    setHistory(history.slice(1));
    setUndoCharges((prev) => prev - 1);
    bridge.playSound('click');
  };

  const handleShuffle = () => {
    if (isPaused || endedRef.current || shuffleCharges <= 0) return;
    setAssisted(true);
    const flat: number[] = [];
    for (let r = 0; r < gridSize; r++) {
      for (let c = 0; c < gridSize; c++) {
        if (grid[r][c] > 0) flat.push(grid[r][c]);
      }
    }
    // Shuffle array
    for (let i = flat.length - 1; i > 0; i--) {
      const j = Math.floor(Math.random() * (i + 1));
      [flat[i], flat[j]] = [flat[j], flat[i]];
    }

    const newGrid = createEmptyGrid(gridSize);
    let idx = 0;
    for (let r = 0; r < gridSize; r++) {
      for (let c = 0; c < gridSize; c++) {
        if (idx < flat.length) {
          newGrid[r][c] = flat[idx++];
        }
      }
    }

    setGrid(newGrid);
    setShuffleCharges((prev) => prev - 1);
    bridge.playSound('powerup');
  };

  const handleHammer = () => {
    if (isPaused || endedRef.current || hammerCharges <= 0) return;
    setAssisted(true);
    // Clear all 2s and 4s
    const newGrid = grid.map((row) =>
      row.map((val) => (val === 2 || val === 4 ? 0 : val))
    );
    const spawned = newGrid.flat().some(Boolean) ? newGrid : spawnTile(newGrid, gridSize).newGrid;
    setGrid(spawned);
    setMaxTile(Math.max(...spawned.flat()));
    setHammerCharges((prev) => prev - 1);
    bridge.playSound('chestOpen');
  };

  const reducedMotion = useReducedMotion();

  // Tile Color Styling supporting infinite numbers (4096, 8192, 16384, etc.)
  const getTileStyle = (val: number) => {
    if (val === 0) return 'bg-[#132135] border-[#26374d] text-transparent';
    switch (val) {
      case 2:
        return 'bg-[#dbe6f2] text-[#24364a] border-[#f3f8ff]';
      case 4:
        return 'bg-[#b8def1] text-[#193c56] border-[#d8f4ff]';
      case 8:
        return 'bg-[#ffd28b] text-[#633b22] border-[#fff0c8]';
      case 16:
        return 'bg-[#ffad79] text-[#60251d] border-[#ffdab8]';
      case 32:
        return 'bg-[#fb827e] text-[#522135] border-[#ffc0af]';
      case 64:
        return 'bg-[#ed74a5] text-[#451b3a] border-[#ffb6da]';
      case 128:
        return 'bg-[#d7b0fa] text-[#3d2864] border-[#f0d5ff]';
      case 256:
        return 'bg-amber-600 text-white border-yellow-300 shadow-amber-500/30';
      case 512:
        return 'bg-purple-600 text-white border-purple-300 shadow-purple-500/40';
      case 1024:
        return 'bg-indigo-600 text-white border-indigo-300 shadow-indigo-500/40';
      case 2048:
        return 'bg-gradient-to-tr from-amber-500 to-yellow-400 text-slate-950 border-yellow-200 font-black shadow-yellow-500/50';
      case 4096:
        return 'bg-gradient-to-tr from-emerald-500 to-teal-400 text-slate-950 border-emerald-200 font-black shadow-emerald-500/50';
      case 8192:
        return 'bg-gradient-to-tr from-cyan-500 to-blue-500 text-slate-950 border-cyan-200 font-black shadow-cyan-500/50';
      case 16384:
        return 'bg-gradient-to-tr from-pink-500 to-rose-500 text-white border-pink-200 font-black shadow-pink-500/50';
      default:
        return 'bg-gradient-to-tr from-violet-600 to-fuchsia-600 text-white border-fuchsia-300 font-black shadow-fuchsia-500/50';
    }
  };

  return (
    <div className="arcade-game-surface [--tile2048-chrome:360px] sm:[--tile2048-chrome:480px] flex flex-col items-center justify-start w-full max-w-md mx-auto p-2 sm:p-4 select-none">
      {/* Floating Gem Notification Banner */}
      {gemNotification && (
        <div className="fixed top-20 z-50 bg-gradient-to-r from-amber-500 to-yellow-500 text-slate-950 px-4 py-2 rounded-2xl shadow-2xl font-black text-xs flex items-center gap-2 border-2 border-white">
          <Sparkles className="w-4 h-4" />
          <span>{gemNotification.text}</span>
        </div>
      )}

      {/* Header Stats Bar */}
      <div className="w-full flex items-center justify-between mb-3 bg-[#121212] border border-white/10 rounded-2xl p-2 sm:p-3 shadow-md">
        <div className="flex flex-col">
          <span className="text-[10px] text-slate-400 font-bold uppercase">Điểm Số</span>
          <span className="text-xl sm:text-2xl font-black text-indigo-400">{score}</span>
        </div>
        <div className="flex flex-col items-center">
          <span className="text-[10px] text-slate-400 font-bold uppercase">Kỉ Lục</span>
          <span className="text-xl sm:text-2xl font-black text-amber-400">{bestScore}</span>
        </div>
        <div className="flex flex-col items-end">
          <span className="text-[10px] text-slate-400 font-bold uppercase">Ô Max</span>
          <span className="text-xl sm:text-2xl font-black text-emerald-400">{maxTile}</span>
        </div>
      </div>

      {/* Mode Selector & Friend Challenge Bar */}
      <div className="w-full flex items-center justify-between gap-2 mb-3">
        <div className="flex items-center gap-1 bg-[#141414] p-1 rounded-xl border border-white/10">
          <button
            onClick={() => { if (gameMode === 'classic') return; if (movesCount > 0) setPendingMode('classic'); else setGameMode('classic'); }}
            className={`px-2.5 py-1 rounded-lg text-xs font-bold transition-all ${
              gameMode === 'classic' ? 'bg-indigo-600 text-white shadow' : 'text-slate-400 hover:text-white'
            }`}
          >
            Cổ Điển
          </button>
          <button
            onClick={() => { if (gameMode === 'big5x5') return; if (movesCount > 0) setPendingMode('big5x5'); else setGameMode('big5x5'); }}
            className={`px-2.5 py-1 rounded-lg text-xs font-bold transition-all ${
              gameMode === 'big5x5' ? 'bg-indigo-600 text-white shadow' : 'text-slate-400 hover:text-white'
            }`}
          >
            5x5 Lớn
          </button>
          <button
            onClick={() => { if (gameMode === 'rush') return; if (movesCount > 0) setPendingMode('rush'); else setGameMode('rush'); }}
            className={`px-2.5 py-1 rounded-lg text-xs font-bold transition-all ${
              gameMode === 'rush' ? 'bg-amber-600 text-white shadow' : 'text-slate-400 hover:text-white'
            }`}
          >
            Tốc Độ ⏱️
          </button>
        </div>


      </div>

      {/* Rush mode countdown banner if active */}
      {gameMode === 'rush' && (
        <div className="w-full bg-amber-950/40 border border-amber-500/40 rounded-2xl px-3 py-2 mb-3 flex items-center justify-between text-xs">
          <span className="text-amber-300 font-bold flex items-center gap-1.5">
            <Clock className="w-4 h-4 text-amber-400 " /> Thời Gian Tốc Độ:
          </span>
          <span className="text-base font-black text-amber-400 font-mono">
            {rushTime}s <span className="text-[10px] text-slate-400">(+3s mỗi lần ghép)</span>
          </span>
        </div>
      )}

      {/* Earned Gems & Combo Banner */}
      <div className="w-full flex items-center justify-between bg-[#121212] border border-white/10 rounded-2xl px-3 py-2 mb-3">
        <div className="flex items-center gap-2">
          <span className="flex items-center gap-1 text-xs text-slate-300 font-bold">
            <Flame className="w-4 h-4 text-orange-400" /> Combo:
          </span>
          <span className="text-sm font-black text-orange-400">x{combo}</span>
        </div>
        <span className="text-xs text-slate-400">{movesCount} lượt · {assisted ? 'Có trợ giúp' : 'Chưa dùng trợ giúp'}</span>
      </div>

      {/* Milestones Tracker Bar (Infinite) */}
      <div className="w-full [@media(max-height:650px)]:hidden bg-[#121212] border border-white/10 rounded-2xl px-3 py-2 mb-3 flex items-center justify-between text-xs overflow-x-auto">
        <span className="text-slate-400 font-bold flex items-center gap-1 flex-shrink-0">
          <Award className="w-4 h-4 text-amber-400" /> Mốc ô số:
        </span>
        <div className="flex items-center gap-2 flex-shrink-0 ml-2">
          {[512, 1024, 2048, 4096, 8192, 16384].map((m) => (
            <div
              key={m}
              className={`px-2 py-0.5 rounded-lg border text-[10px] font-bold flex items-center gap-1 transition-all ${
                milestonesReached[m]
                  ? 'bg-amber-900/60 border-amber-400 text-amber-200'
                  : 'bg-white/5 border-white/10 text-slate-500'
              }`}
            >
              <span>{m}</span>
            </div>
          ))}
        </div>
      </div>

      {/* Main Matrix Grid */}
      <div
        ref={boardRef}
        role="group" aria-label="Bàn 2048, vuốt hoặc dùng phím mũi tên"
        style={{ touchAction: 'none', width: 'min(100%, 400px, calc(100dvh - var(--tile2048-chrome)))' }}
        onTouchCancel={() => { touchStartPos.current = null; }}
        onMouseLeave={() => { touchStartPos.current = null; }}
        id="tile-2048-board"
        data-no-swipe="true"
        onTouchStart={handleTouchStart}
        onTouchEnd={handleTouchEnd}
        onMouseDown={handleTouchStart}
        onMouseUp={handleTouchEnd}
        className={`w-full aspect-square max-w-[400px] bg-[#0d0d0d] p-3 rounded-3xl border-2 border-indigo-500/30 shadow-2xl shadow-indigo-500/10 grid gap-2 sm:gap-2.5 cursor-grab active:cursor-grabbing relative ${
          gridSize === 5 ? 'grid-cols-5 grid-rows-5' : 'grid-cols-4 grid-rows-4'
        }`}
      >
        {grid.map((row, r) =>
          row.map((val, c) => (
            <div
              key={`${r}-${c}`}
              data-value={val}
              aria-label={`Hàng ${r + 1}, cột ${c + 1}: ${val || 'trống'}`}
              className={`arcade-piece w-full h-full rounded-2xl border flex items-center justify-center font-black transition-all duration-150 transform ${
                val > 0 ? 'scale-100 shadow-md' : 'scale-95'
              } ${gridSize === 5 ? 'text-sm sm:text-lg' : 'text-xl sm:text-2xl'} ${getTileStyle(val)}`}
            >
              {val > 0 ? (
                <div className="flex flex-col items-center justify-center">
                  <motion.span key={val} initial={reducedMotion ? false : { scale: .78, opacity: .65 }} animate={{ scale: 1, opacity: 1 }} transition={{ duration: .14 }}>{val}</motion.span>
                  {val >= 512 && (
                    <span className="text-[7px] sm:text-[9px] font-bold text-yellow-300/80 -mt-1 tracking-tighter">
                      💎
                    </span>
                  )}
                </div>
              ) : null}
            </div>
          ))
        )}
      </div>

      {/* Auxiliary Skills & Controls */}
      <div className="w-full max-w-[400px] flex items-center justify-between gap-2 mt-3">
        <button
          id="btn-2048-undo"
          type="button"
          disabled={isPaused || undoCharges <= 0 || history.length === 0}
          onClick={handleUndo}
          className={`flex-1 min-h-11 py-2 px-2 rounded-xl border text-xs font-bold flex items-center justify-center gap-1 transition-all ${
            undoCharges > 0 && history.length > 0
              ? 'bg-[#141414] hover:bg-indigo-600/20 border-indigo-500/40 text-indigo-300 shadow-sm active:scale-95 cursor-pointer'
              : 'bg-[#0a0a0a] border-white/5 text-slate-600 cursor-not-allowed opacity-50'
          }`}
          title="Hoàn tác nước đi"
        >
          <RotateCcw className="w-3.5 h-3.5" />
          <span>Hoàn Tác ({undoCharges})</span>
        </button>

        <button
          id="btn-2048-shuffle"
          type="button"
          disabled={isPaused || shuffleCharges <= 0}
          onClick={handleShuffle}
          className={`flex-1 min-h-11 py-2 px-2 rounded-xl border text-xs font-bold flex items-center justify-center gap-1 transition-all ${
            shuffleCharges > 0
              ? 'bg-[#141414] hover:bg-amber-600/20 border-amber-500/40 text-amber-300 shadow-sm active:scale-95 cursor-pointer'
              : 'bg-[#0a0a0a] border-white/5 text-slate-600 cursor-not-allowed opacity-50'
          }`}
          title="Xáo trộn bàn cờ"
        >
          <Shuffle className="w-3.5 h-3.5" />
          <span>Xáo Ô ({shuffleCharges})</span>
        </button>

        <button
          id="btn-2048-hammer"
          type="button"
          disabled={isPaused || hammerCharges <= 0}
          onClick={handleHammer}
          className={`flex-1 min-h-11 py-2 px-2 rounded-xl border text-xs font-bold flex items-center justify-center gap-1 transition-all ${
            hammerCharges > 0
              ? 'bg-[#141414] hover:bg-rose-600/20 border-rose-500/40 text-rose-300 shadow-sm active:scale-95 cursor-pointer'
              : 'bg-[#0a0a0a] border-white/5 text-slate-600 cursor-not-allowed opacity-50'
          }`}
          title="Đập bỏ ô số 2 và 4"
        >
          <Hammer className="w-3.5 h-3.5" />
          <span>Đập 2/4 ({hammerCharges})</span>
        </button>
      </div>

      {/* On-screen Directional D-Pad */}
      <div className="mt-3 grid grid-cols-4 gap-2 w-full sm:hidden" aria-label="Điều khiển hướng">
        {([{ direction: 'LEFT', label: 'Trượt Trái', Icon: ArrowLeft }, { direction: 'UP', label: 'Trượt Lên', Icon: ArrowUp }, { direction: 'DOWN', label: 'Trượt Xuống', Icon: ArrowDown }, { direction: 'RIGHT', label: 'Trượt Phải', Icon: ArrowRight }] as const).map(({ direction, label, Icon }) =>
          <button key={direction} type="button" aria-label={label} onClick={() => move(direction)} className="min-h-11 rounded-xl border border-white/15 bg-slate-900 flex items-center justify-center text-slate-200"><Icon className="w-5 h-5"/></button>
        )}
      </div>
      <div className="mt-3 hidden sm:flex flex-col items-center">
        <button
          id="btn-dpad-up"
          type="button"
          onClick={() => move('UP')}
          className="w-12 h-12 rounded-xl bg-[#141414] hover:bg-indigo-600/30 border border-white/10 active:scale-90 flex items-center justify-center text-slate-300 hover:text-white transition-all shadow-md cursor-pointer"
          aria-label="Trượt Lên"
        >
          <ArrowUp className="w-5 h-5" />
        </button>
        <div className="flex items-center gap-4 my-1">
          <button
            id="btn-dpad-left"
            type="button"
            onClick={() => move('LEFT')}
            className="w-12 h-12 rounded-xl bg-[#141414] hover:bg-indigo-600/30 border border-white/10 active:scale-90 flex items-center justify-center text-slate-300 hover:text-white transition-all shadow-md cursor-pointer"
            aria-label="Trượt Trái"
          >
            <ArrowLeft className="w-5 h-5" />
          </button>
          <div className="w-12 h-12 rounded-xl bg-black/40 border border-white/5 flex items-center justify-center text-[10px] text-slate-500 font-bold">
            SWIPE
          </div>
          <button
            id="btn-dpad-right"
            type="button"
            onClick={() => move('RIGHT')}
            className="w-12 h-12 rounded-xl bg-[#141414] hover:bg-indigo-600/30 border border-white/10 active:scale-90 flex items-center justify-center text-slate-300 hover:text-white transition-all shadow-md cursor-pointer"
            aria-label="Trượt Phải"
          >
            <ArrowRight className="w-5 h-5" />
          </button>
        </div>
        <button
          id="btn-dpad-down"
          type="button"
          onClick={() => move('DOWN')}
          className="w-12 h-12 rounded-xl bg-[#141414] hover:bg-indigo-600/30 border border-white/10 active:scale-90 flex items-center justify-center text-slate-300 hover:text-white transition-all shadow-md cursor-pointer"
          aria-label="Trượt Xuống"
        >
          <ArrowDown className="w-5 h-5" />
        </button>
      </div>

      {pendingMode && <div role="dialog" aria-label="Bắt đầu ván mới" className="fixed inset-0 z-50 bg-black/85 flex items-center justify-center p-4">
        <div className="rounded-2xl border border-white/20 bg-slate-950 p-6 max-w-sm space-y-4 text-slate-200">
          <h2 className="font-bold text-lg">Bắt đầu ván mới?</h2><p>Ván hiện tại sẽ kết thúc khi đổi chế độ.</p>
          <button className="w-full p-3 rounded-xl bg-indigo-600" onClick={() => { setGameMode(pendingMode); setPendingMode(null); }}>Bắt đầu ván mới</button>
          <button className="w-full p-3 rounded-xl border border-white/20" onClick={() => setPendingMode(null)}>Giữ ván hiện tại</button>
        </div>
      </div>}
    </div>
  );
};
