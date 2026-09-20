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

type Direction = 'UP' | 'DOWN' | 'LEFT' | 'RIGHT';
type GameMode = 'classic' | 'big5x5' | 'rush';

interface BoardHistoryState {
  grid: number[][];
  score: number;
  combo: number;
  gemsDroppedThisRun: number;
  milestonesReached: { [key: number]: boolean };
}

interface FriendChallenge {
  id: string;
  name: string;
  avatar: string;
  score: number;
  title: string;
  timeAgo: string;
}

const FRIEND_CHALLENGES: FriendChallenge[] = [
  { id: 'fc1', name: 'MatrixLord_2048', avatar: '👑', score: 18450, title: 'Huyền Thoại 2048', timeAgo: '2 giờ trước' },
  { id: 'fc2', name: 'NeonSwipe', avatar: '⚡', score: 12600, title: 'Bậc Thầy Tính Toán', timeAgo: '1 ngày trước' },
  { id: 'fc3', name: 'GemHunter_VN', avatar: '💎', score: 8940, title: 'Thợ Săn Ngọc', timeAgo: '3 ngày trước' },
  { id: 'fc4', name: 'TileMaster', avatar: '🔢', score: 5420, title: 'Cao Thủ', timeAgo: '5 ngày trước' },
];

export const Tile2048Game: React.FC<GameComponentProps> = ({
  bridge,
  isPaused,
  onGameOver,
  onRestart,
}) => {
  const [gameMode, setGameMode] = useState<GameMode>('classic');
  const gridSize = gameMode === 'big5x5' ? 5 : 4;

  const [grid, setGrid] = useState<number[][]>(() => createEmptyGrid(gridSize));
  const [score, setScore] = useState<number>(0);
  const [bestScore, setBestScore] = useState<number>(0);
  const [combo, setCombo] = useState<number>(0);
  const [movesCount, setMovesCount] = useState<number>(0);
  const [maxTile, setMaxTile] = useState<number>(2);

  // Rush mode timer
  const [rushTime, setRushTime] = useState<number>(60);

  // Friend challenge modal
  const [isChallengeModalOpen, setIsChallengeModalOpen] = useState<boolean>(false);
  const [selectedFriendChallenge, setSelectedFriendChallenge] = useState<FriendChallenge | null>(null);
  const [challengeMessage, setChallengeMessage] = useState<string | null>(null);

  // Gem drops tracking
  const [gemsEarnedThisGame, setGemsEarnedThisGame] = useState<number>(0);
  const [milestonesReached, setMilestonesReached] = useState<{ [key: number]: boolean }>({
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
  const [undoCharges, setUndoCharges] = useState<number>(3);
  const [shuffleCharges, setShuffleCharges] = useState<number>(1);
  const [hammerCharges, setHammerCharges] = useState<number>(1);
  const [history, setHistory] = useState<BoardHistoryState[]>([]);

  // Touch handling ref
  const touchStartPos = useRef<{ x: number; y: number } | null>(null);
  const boardRef = useRef<HTMLDivElement | null>(null);

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

  // Spawn random tile (90% 2, 10% 4)
  const spawnTile = useCallback(
    (currentGrid: number[][], size: number): { newGrid: number[][]; spawned: boolean } => {
      const emptyCells = getEmptyCells(currentGrid, size);
      if (emptyCells.length === 0) return { newGrid: currentGrid, spawned: false };

      const randomCell = emptyCells[Math.floor(Math.random() * emptyCells.length)];
      const newValue = Math.random() < 0.9 ? 2 : 4;

      const newGrid = currentGrid.map((row) => [...row]);
      newGrid[randomCell.r][randomCell.c] = newValue;
      return { newGrid, spawned: true };
    },
    [getEmptyCells]
  );

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
    setMaxTile(4);
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
    startNewGame(gameMode);
    try {
      const saved = localStorage.getItem(`arcadex_best_2048_${gameMode}`);
      if (saved) setBestScore(parseInt(saved, 10) || 0);
      else {
        const genSaved = localStorage.getItem('arcadex_best_2048');
        if (genSaved) setBestScore(parseInt(genSaved, 10) || 0);
      }
    } catch {
      // ignore
    }
  }, [gameMode, startNewGame]);

  // Rush mode timer effect
  useEffect(() => {
    if (isPaused || gameMode !== 'rush') return;
    const interval = setInterval(() => {
      setRushTime((prev) => {
        if (prev <= 1) {
          clearInterval(interval);
          bridge.playSound('gameOver');
          onGameOver(score);
          return 0;
        }
        return prev - 1;
      });
    }, 1000);
    return () => clearInterval(interval);
  }, [isPaused, gameMode, score, onGameOver, bridge]);

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

  // Trigger infinite milestone rewards (512, 1024, 2048, 4096, 8192, 16384, ...)
  const handleMilestoneRewards = useCallback(
    (newHighest: number) => {
      const milestones = [512, 1024, 2048, 4096, 8192, 16384];
      const rewards: { [key: number]: { gems: number; text: string; sound: 'powerup' | 'levelUp' | 'chestOpen' } } = {
        512: { gems: 10, text: '💎 RỚT NGỌC! Mốc 512 (+10 Ngọc)', sound: 'powerup' },
        1024: { gems: 25, text: '✨ ĐẠI PHÁT NGỌC! Mốc 1024 (+25 Ngọc)', sound: 'levelUp' },
        2048: { gems: 50, text: '👑 HUYỀN THOẠI 2048! (+50 Ngọc Quý)', sound: 'chestOpen' },
        4096: { gems: 100, text: '🚀 VÔ CỰC 4096! (+100 Ngọc Siêu Cấp)', sound: 'chestOpen' },
        8192: { gems: 200, text: '⚡ TỐI THƯỢNG 8192! (+200 Ngọc Thần Thánh)', sound: 'chestOpen' },
        16384: { gems: 500, text: '🌌 VŨ TRỤ 16384! (+500 Ngọc Tối Cao)', sound: 'chestOpen' },
      };

      for (const m of milestones) {
        if (newHighest >= m && !milestonesReached[m] && rewards[m]) {
          const { gems, text, sound } = rewards[m];
          milestonesReached[m] = true;
          bridge.grantGems(gems);
          bridge.grantExp(gems * 10);
          bridge.playSound(sound);
          setGemsEarnedThisGame((prev) => prev + gems);
          setMilestonesReached({ ...milestonesReached });
          setGemNotification({
            tileValue: m,
            gemAmount: gems,
            text,
          });

          confetti({
            particleCount: m >= 2048 ? 140 : 70,
            spread: 90,
            origin: { y: 0.5 },
            colors: ['#06b6d4', '#f59e0b', '#ec4899', '#10b981', '#a855f7', '#ffffff'],
          });

          setTimeout(() => {
            setGemNotification(null);
          }, 4500);

          if (m === 2048) {
            bridge.reportProgress('ach-2048-reach-2048', 2048, true);
          } else if (m === 1024) {
            bridge.reportProgress('ach-2048-reach-1024', 1024, true);
          } else if (m === 512) {
            bridge.reportProgress('ach-2048-reach-512', 512, true);
          }
        }
      }
    },
    [bridge, milestonesReached]
  );

  // Core move engine supporting infinite merge & rush mode timer boost
  const move = useCallback(
    (direction: Direction) => {
      if (isPaused) return;

      let moved = false;
      let pointsEarned = 0;
      let currentHighest = maxTile;
      let mergedTilesCount = 0;

      const newGrid = grid.map((row) => [...row]);

      const currentState: BoardHistoryState = {
        grid: grid.map((r) => [...r]),
        score,
        combo,
        gemsDroppedThisRun: gemsEarnedThisGame,
        milestonesReached: { ...milestonesReached },
      };

      const slideAndMergeRow = (row: number[]): number[] => {
        const nonZero = row.filter((v) => v !== 0);
        const result: number[] = [];

        for (let i = 0; i < nonZero.length; i++) {
          if (i < nonZero.length - 1 && nonZero[i] === nonZero[i + 1]) {
            const mergedValue = nonZero[i] * 2;
            result.push(mergedValue);
            pointsEarned += mergedValue;
            mergedTilesCount++;
            if (mergedValue > currentHighest) {
              currentHighest = mergedValue;
            }
            i++;
            moved = true;
          } else {
            result.push(nonZero[i]);
          }
        }

        while (result.length < gridSize) {
          result.push(0);
        }

        for (let i = 0; i < gridSize; i++) {
          if (row[i] !== result[i]) moved = true;
        }

        return result;
      };

      if (direction === 'LEFT') {
        for (let r = 0; r < gridSize; r++) {
          newGrid[r] = slideAndMergeRow(newGrid[r]);
        }
      } else if (direction === 'RIGHT') {
        for (let r = 0; r < gridSize; r++) {
          const reversed = [...newGrid[r]].reverse();
          const merged = slideAndMergeRow(reversed);
          newGrid[r] = merged.reverse();
        }
      } else if (direction === 'UP') {
        for (let c = 0; c < gridSize; c++) {
          const col = Array.from({ length: gridSize }, (_, r) => newGrid[r][c]);
          const merged = slideAndMergeRow(col);
          for (let r = 0; r < gridSize; r++) {
            newGrid[r][c] = merged[r];
          }
        }
      } else if (direction === 'DOWN') {
        for (let c = 0; c < gridSize; c++) {
          const col = Array.from({ length: gridSize }, (_, r) => newGrid[gridSize - 1 - r][c]);
          const merged = slideAndMergeRow(col);
          for (let r = 0; r < gridSize; r++) {
            newGrid[gridSize - 1 - r][c] = merged[r];
          }
        }
      }

      if (moved) {
        const spawnResult = spawnTile(newGrid, gridSize);
        const finalGrid = spawnResult.newGrid;

        const newScore = score + pointsEarned;
        const newCombo = mergedTilesCount > 0 ? combo + 1 : 0;
        const newMoves = movesCount + 1;

        setGrid(finalGrid);
        setScore(newScore);
        setCombo(newCombo);
        setMovesCount(newMoves);
        setMaxTile(currentHighest);

        // Add time in rush mode on successful merge
        if (gameMode === 'rush' && mergedTilesCount > 0) {
          setRushTime((prev) => prev + mergedTilesCount * 3);
        }

        // Check milestones
        handleMilestoneRewards(currentHighest);

        if (newScore > bestScore) {
          setBestScore(newScore);
          try {
            localStorage.setItem(`arcadex_best_2048_${gameMode}`, newScore.toString());
            localStorage.setItem('arcadex_best_2048', newScore.toString());
          } catch {
            // ignore
          }
        }

        setHistory((prev) => [currentState, ...prev].slice(0, 3));
        bridge.playSound('click');

        // Check game over
        if (checkGameOver(finalGrid, gridSize)) {
          bridge.playSound('gameOver');
          onGameOver(newScore);
        }
      }
    },
    [isPaused, grid, score, combo, movesCount, maxTile, gemsEarnedThisGame, milestonesReached, bestScore, gridSize, gameMode, spawnTile, handleMilestoneRewards, checkGameOver, bridge, onGameOver]
  );

  // Keyboard navigation
  useEffect(() => {
    const handleKeyDown = (e: KeyboardEvent) => {
      if (isPaused) return;
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
  }, [move, isPaused]);

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
    if (undoCharges <= 0 || history.length === 0) return;
    const lastState = history[0];
    setGrid(lastState.grid);
    setScore(lastState.score);
    setCombo(lastState.combo);
    setGemsEarnedThisGame(lastState.gemsDroppedThisRun);
    setMilestonesReached(lastState.milestonesReached);
    setHistory(history.slice(1));
    setUndoCharges((prev) => prev - 1);
    bridge.playSound('click');
  };

  const handleShuffle = () => {
    if (shuffleCharges <= 0) return;
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
    if (hammerCharges <= 0) return;
    // Clear all 2s and 4s
    const newGrid = grid.map((row) =>
      row.map((val) => (val === 2 || val === 4 ? 0 : val))
    );
    setGrid(newGrid);
    setHammerCharges((prev) => prev - 1);
    bridge.playSound('chestOpen');
  };

  // Tile Color Styling supporting infinite numbers (4096, 8192, 16384, etc.)
  const getTileStyle = (val: number) => {
    switch (val) {
      case 2:
        return 'bg-neutral-800 text-neutral-200 border-neutral-700';
      case 4:
        return 'bg-neutral-700 text-neutral-100 border-neutral-600';
      case 8:
        return 'bg-amber-950/70 text-amber-300 border-amber-500/40';
      case 16:
        return 'bg-orange-950/70 text-orange-300 border-orange-500/40';
      case 32:
        return 'bg-red-950/70 text-red-300 border-red-500/40';
      case 64:
        return 'bg-rose-950/70 text-rose-300 border-rose-500/40';
      case 128:
        return 'bg-yellow-900/60 text-yellow-200 border-yellow-400/50';
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
    <div className="flex flex-col items-center justify-start w-full max-w-md mx-auto p-2 sm:p-4 select-none">
      {/* Floating Gem Notification Banner */}
      {gemNotification && (
        <div className="fixed top-20 z-50 animate-bounce bg-gradient-to-r from-amber-500 to-yellow-500 text-slate-950 px-4 py-2 rounded-2xl shadow-2xl font-black text-xs flex items-center gap-2 border-2 border-white">
          <Sparkles className="w-4 h-4" />
          <span>{gemNotification.text}</span>
        </div>
      )}

      {/* Header Stats Bar */}
      <div className="w-full flex items-center justify-between mb-3 bg-[#121212] border border-white/10 rounded-2xl p-3 shadow-md">
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
            onClick={() => setGameMode('classic')}
            className={`px-2.5 py-1 rounded-lg text-xs font-bold transition-all ${
              gameMode === 'classic' ? 'bg-indigo-600 text-white shadow' : 'text-slate-400 hover:text-white'
            }`}
          >
            Cổ Điển
          </button>
          <button
            onClick={() => setGameMode('big5x5')}
            className={`px-2.5 py-1 rounded-lg text-xs font-bold transition-all ${
              gameMode === 'big5x5' ? 'bg-indigo-600 text-white shadow' : 'text-slate-400 hover:text-white'
            }`}
          >
            5x5 Lớn
          </button>
          <button
            onClick={() => setGameMode('rush')}
            className={`px-2.5 py-1 rounded-lg text-xs font-bold transition-all ${
              gameMode === 'rush' ? 'bg-amber-600 text-white shadow' : 'text-slate-400 hover:text-white'
            }`}
          >
            Tốc Độ ⏱️
          </button>
        </div>

        <button
          onClick={() => {
            bridge.playSound('click');
            setIsChallengeModalOpen(true);
          }}
          className="flex items-center gap-1 px-3 py-1.5 rounded-xl bg-gradient-to-r from-purple-600 to-indigo-600 hover:from-purple-500 hover:to-indigo-500 text-white text-xs font-bold shadow-lg shadow-purple-950/40 active:scale-95 transition-all cursor-pointer"
        >
          <Users className="w-3.5 h-3.5" />
          <span>Thách Đấu</span>
        </button>
      </div>

      {/* Rush mode countdown banner if active */}
      {gameMode === 'rush' && (
        <div className="w-full bg-amber-950/40 border border-amber-500/40 rounded-2xl px-3 py-2 mb-3 flex items-center justify-between text-xs">
          <span className="text-amber-300 font-bold flex items-center gap-1.5">
            <Clock className="w-4 h-4 text-amber-400 animate-spin" /> Thời Gian Tốc Độ:
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
        <div className="flex items-center gap-2">
          <span className="flex items-center gap-1 text-xs text-slate-300 font-bold">
            <Gem className="w-3.5 h-3.5 text-cyan-400 animate-pulse" /> Ngọc Nhặt Vô Hạn:
          </span>
          <span className="text-sm font-black text-cyan-300">+{gemsEarnedThisGame}</span>
        </div>
      </div>

      {/* Milestones Tracker Bar (Infinite) */}
      <div className="w-full bg-[#121212] border border-white/10 rounded-2xl px-3 py-2 mb-3 flex items-center justify-between text-xs overflow-x-auto">
        <span className="text-slate-400 font-bold flex items-center gap-1 flex-shrink-0">
          <Award className="w-4 h-4 text-amber-400" /> Mốc Rớt Ngọc:
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
        id="tile-2048-board"
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
              className={`w-full h-full rounded-2xl border flex items-center justify-center font-black transition-all duration-150 transform ${
                val > 0 ? 'scale-100 shadow-md' : 'scale-95'
              } ${gridSize === 5 ? 'text-sm sm:text-lg' : 'text-xl sm:text-2xl'} ${getTileStyle(val)}`}
            >
              {val > 0 ? (
                <div className="flex flex-col items-center justify-center">
                  <span>{val}</span>
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
          disabled={undoCharges <= 0 || history.length === 0}
          onClick={handleUndo}
          className={`flex-1 py-2 px-2 rounded-xl border text-xs font-bold flex items-center justify-center gap-1 transition-all ${
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
          disabled={shuffleCharges <= 0}
          onClick={handleShuffle}
          className={`flex-1 py-2 px-2 rounded-xl border text-xs font-bold flex items-center justify-center gap-1 transition-all ${
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
          disabled={hammerCharges <= 0}
          onClick={handleHammer}
          className={`flex-1 py-2 px-2 rounded-xl border text-xs font-bold flex items-center justify-center gap-1 transition-all ${
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
      <div className="mt-3 flex flex-col items-center">
        <button
          id="btn-dpad-up"
          type="button"
          onClick={() => move('UP')}
          className="w-12 h-10 rounded-xl bg-[#141414] hover:bg-indigo-600/30 border border-white/10 active:scale-90 flex items-center justify-center text-slate-300 hover:text-white transition-all shadow-md cursor-pointer"
          aria-label="Trượt Lên"
        >
          <ArrowUp className="w-5 h-5" />
        </button>
        <div className="flex items-center gap-4 my-1">
          <button
            id="btn-dpad-left"
            type="button"
            onClick={() => move('LEFT')}
            className="w-12 h-10 rounded-xl bg-[#141414] hover:bg-indigo-600/30 border border-white/10 active:scale-90 flex items-center justify-center text-slate-300 hover:text-white transition-all shadow-md cursor-pointer"
            aria-label="Trượt Trái"
          >
            <ArrowLeft className="w-5 h-5" />
          </button>
          <div className="w-12 h-10 rounded-xl bg-black/40 border border-white/5 flex items-center justify-center text-[10px] text-slate-500 font-bold">
            SWIPE
          </div>
          <button
            id="btn-dpad-right"
            type="button"
            onClick={() => move('RIGHT')}
            className="w-12 h-10 rounded-xl bg-[#141414] hover:bg-indigo-600/30 border border-white/10 active:scale-90 flex items-center justify-center text-slate-300 hover:text-white transition-all shadow-md cursor-pointer"
            aria-label="Trượt Phải"
          >
            <ArrowRight className="w-5 h-5" />
          </button>
        </div>
        <button
          id="btn-dpad-down"
          type="button"
          onClick={() => move('DOWN')}
          className="w-12 h-10 rounded-xl bg-[#141414] hover:bg-indigo-600/30 border border-white/10 active:scale-90 flex items-center justify-center text-slate-300 hover:text-white transition-all shadow-md cursor-pointer"
          aria-label="Trượt Xuống"
        >
          <ArrowDown className="w-5 h-5" />
        </button>
      </div>

      {/* Friend Challenge Modal */}
      {isChallengeModalOpen && (
        <div className="fixed inset-0 z-60 bg-black/80 backdrop-blur-md flex items-center justify-center p-4 animate-fadeIn">
          <div className="w-full max-w-sm bg-[#141726] border border-purple-500/40 rounded-3xl p-5 shadow-2xl relative">
            <div className="flex items-center space-x-3 mb-4">
              <div className="w-12 h-12 rounded-2xl bg-gradient-to-tr from-purple-600 to-indigo-600 flex items-center justify-center text-2xl shadow-lg">
                🏆
              </div>
              <div>
                <h3 className="font-bold text-base text-white">Thách Đấu Kỉ Lục Bạn Bè</h3>
                <p className="text-xs text-slate-400">Chọn bạn bè để thách đấu vượt điểm số</p>
              </div>
            </div>

            {challengeMessage ? (
              <div className="p-4 rounded-2xl bg-purple-950/50 border border-purple-500/40 text-purple-200 text-xs font-semibold text-center my-4">
                {challengeMessage}
              </div>
            ) : (
              <div className="space-y-2.5 my-3 max-h-[260px] overflow-y-auto pr-1">
                {FRIEND_CHALLENGES.map((friend) => (
                  <div
                    key={friend.id}
                    className="flex items-center justify-between p-3 rounded-2xl bg-neutral-900/80 border border-white/5 hover:border-purple-500/40 transition"
                  >
                    <div className="flex items-center space-x-3">
                      <div className="w-10 h-10 rounded-xl bg-purple-500/20 border border-purple-500/30 flex items-center justify-center text-xl">
                        {friend.avatar}
                      </div>
                      <div>
                        <p className="font-bold text-xs text-white">{friend.name}</p>
                        <p className="text-[10px] text-amber-400 font-mono">Kỉ lục: {friend.score.toLocaleString()} điểm</p>
                      </div>
                    </div>
                    <button
                      onClick={() => {
                        bridge.playSound('powerup');
                        setSelectedFriendChallenge(friend);
                        setChallengeMessage(`Đã gửi lời thách đấu tới ${friend.name} (Mục tiêu: ${friend.score.toLocaleString()} điểm)! Hãy chứng tỏ bản lĩnh.`);
                        setTimeout(() => {
                          setChallengeMessage(null);
                          setIsChallengeModalOpen(false);
                        }, 2200);
                      }}
                      className="px-3 py-1.5 rounded-xl bg-purple-600 hover:bg-purple-500 text-white text-xs font-bold shadow-md transition active:scale-95 cursor-pointer"
                    >
                      Thách Đấu
                    </button>
                  </div>
                ))}
              </div>
            )}

            <button
              onClick={() => setIsChallengeModalOpen(false)}
              className="w-full mt-3 py-2.5 rounded-xl bg-white/10 hover:bg-white/15 text-white text-xs font-bold transition-all cursor-pointer"
            >
              Đóng
            </button>
          </div>
        </div>
      )}
    </div>
  );
};
