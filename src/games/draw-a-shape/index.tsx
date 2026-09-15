import React, { useState, useEffect, useRef, useCallback } from 'react';
import { motion, AnimatePresence } from 'motion/react';
import { GameComponentProps } from '../../types';
import { usePlayer } from '../../context/PlayerContext';
import { Trophy, ArrowRight, RefreshCw, Star, Clock, Target, Edit3, Grid, Play, Home, Settings, Lightbulb } from 'lucide-react';
import confetti from 'canvas-confetti';

interface Point { r: number; c: number }
interface Seed { id: number; r: number; c: number; size: number; color: string }

const COLORS = [
  '#ef4444', '#f97316', '#f59e0b', '#84cc16', '#22c55e', 
  '#10b981', '#06b6d4', '#0ea5e9', '#3b82f6', '#6366f1', 
  '#8b5cf6', '#a855f7', '#d946ef', '#f43f5e', '#fb7185',
  '#14b8a6', '#eab308', '#ec4899', '#38bdf8', '#4ade80',
  '#a78bfa', '#f472b6', '#fb923c', '#2dd4bf', '#818cf8',
  '#c084fc', '#f87171', '#34d399'
];

type GameMode = 'classic' | 'time' | 'score' | 'strokes' | 'custom';

// Progressive level difficulty tuning based on player's chosen Game Intensity
export function getLevelConfig(level: number, intensity: 'casual' | 'normal' | 'hardcore' = 'normal') {
  let r = 4;
  let c = 4;
  let minSize = 3;
  let maxSize = 4;

  if (intensity === 'casual') {
    // Slower, more gentle progression
    if (level <= 2) { r = 4; c = 4; minSize = 3; maxSize = 4; }
    else if (level <= 4) { r = 5; c = 5; minSize = 3; maxSize = 6; }
    else if (level <= 7) { r = 6; c = 6; minSize = 4; maxSize = 8; }
    else if (level <= 10) { r = 7; c = 7; minSize = 4; maxSize = 12; }
    else if (level <= 13) { r = 8; c = 8; minSize = 5; maxSize = 16; }
    else if (level <= 16) { r = 9; c = 9; minSize = 5; maxSize = 20; }
    else { r = 10; c = 10; minSize = 6; maxSize = 24; }
  } else if (intensity === 'hardcore') {
    // Fast & intense progression with large shapes up to 24 tiles
    if (level === 1) { r = 5; c = 5; minSize = 3; maxSize = 6; }
    else if (level <= 3) { r = 6; c = 6; minSize = 4; maxSize = 10; }
    else if (level <= 5) { r = 7; c = 7; minSize = 5; maxSize = 14; }
    else if (level <= 7) { r = 8; c = 8; minSize = 6; maxSize = 18; }
    else if (level <= 9) { r = 9; c = 9; minSize = 6; maxSize = 22; }
    else { r = 10; c = 10; minSize = 7; maxSize = 24; }
  } else {
    // Normal balanced progression
    if (level === 1) { r = 4; c = 4; minSize = 3; maxSize = 4; }
    else if (level <= 3) { r = 5; c = 5; minSize = 3; maxSize = 6; }
    else if (level <= 5) { r = 6; c = 6; minSize = 4; maxSize = 8; }
    else if (level <= 8) { r = 7; c = 7; minSize = 4; maxSize = 12; }
    else if (level <= 11) { r = 8; c = 8; minSize = 5; maxSize = 16; }
    else if (level <= 14) { r = 9; c = 9; minSize = 6; maxSize = 20; }
    else { r = 10; c = 10; minSize = 6; maxSize = 24; }
  }

  // Strict constraint: max shape size is 24 tiles
  maxSize = Math.min(24, Math.max(minSize, maxSize));
  minSize = Math.max(3, Math.min(minSize, maxSize - 1));

  return { R: r, C: c, minSize, maxSize };
}

// Guaranteed deterministic partition that ensures 100% solvable board
function generateDeterministicLevel(R: number, C: number, maxSize: number, minSize: number) {
  // Generate a continuous snake walk that visits all R * C cells
  const snake: Point[] = [];
  for (let r = 0; r < R; r++) {
    if (r % 2 === 0) {
      for (let c = 0; c < C; c++) snake.push({ r, c });
    } else {
      for (let c = C - 1; c >= 0; c--) snake.push({ r, c });
    }
  }

  const totalCells = R * C;
  const chunkSizes: number[] = [];
  let remaining = totalCells;

  while (remaining > 0) {
    if (remaining <= maxSize) {
      if (remaining >= minSize) {
        chunkSizes.push(remaining);
        break;
      } else {
        // Merge with last chunk if too small
        if (chunkSizes.length > 0) {
          const last = chunkSizes.pop()!;
          if (last + remaining <= maxSize) {
            chunkSizes.push(last + remaining);
          } else {
            const splitA = Math.floor((last + remaining) / 2);
            const splitB = (last + remaining) - splitA;
            chunkSizes.push(splitA, splitB);
          }
        } else {
          chunkSizes.push(remaining);
        }
        break;
      }
    }

    const availableMax = Math.min(maxSize, remaining - minSize);
    const target = Math.floor(Math.random() * (availableMax - minSize + 1)) + minSize;
    chunkSizes.push(target);
    remaining -= target;
  }

  const paths: Point[][] = [];
  let currentIdx = 0;
  for (const sz of chunkSizes) {
    paths.push(snake.slice(currentIdx, currentIdx + sz));
    currentIdx += sz;
  }

  const seeds: Seed[] = paths.map((path, idx) => ({
    id: idx,
    r: path[0].r,
    c: path[0].c,
    size: path.length,
    color: COLORS[idx % COLORS.length]
  }));

  return { seeds, R, C, solutionPaths: paths };
}

// Generate level with smart heuristic and cell-merging, falling back to deterministic
function generateLevel(R: number, C: number, maxSize: number = 8, minSize: number = 3) {
  const boundedMax = Math.min(24, Math.max(4, maxSize));
  const boundedMin = Math.max(3, Math.min(minSize, boundedMax - 1));

  for (let attempt = 0; attempt < 30; attempt++) {
    const grid = Array.from({ length: R }, () => Array(C).fill(-1));
    const paths: Point[][] = [];
    let id = 0;

    const emptyCells: Point[] = [];
    for (let r = 0; r < R; r++) {
      for (let c = 0; c < C; c++) {
        emptyCells.push({ r, c });
      }
    }
    // Random shuffle
    for (let i = emptyCells.length - 1; i > 0; i--) {
      const j = Math.floor(Math.random() * (i + 1));
      [emptyCells[i], emptyCells[j]] = [emptyCells[j], emptyCells[i]];
    }

    const getEmptyNeighbors = (p: Point) => {
      return [
        { r: p.r - 1, c: p.c },
        { r: p.r + 1, c: p.c },
        { r: p.r, c: p.c - 1 },
        { r: p.r, c: p.c + 1 },
      ].filter(n => n.r >= 0 && n.r < R && n.c >= 0 && n.c < C && grid[n.r][n.c] === -1);
    };

    for (const cell of emptyCells) {
      if (grid[cell.r][cell.c] === -1) {
        const target = Math.floor(Math.random() * (boundedMax - boundedMin + 1)) + boundedMin;
        const path: Point[] = [cell];
        grid[cell.r][cell.c] = id;
        let curr = cell;

        while (path.length < target) {
          const neighbors = getEmptyNeighbors(curr);
          if (neighbors.length === 0) break;
          // Warnsdorff's heuristic: prefer cells with fewer unvisited neighbors
          neighbors.sort((a, b) => getEmptyNeighbors(a).length - getEmptyNeighbors(b).length);
          const pick = Math.random() < 0.75 ? neighbors[0] : neighbors[Math.floor(Math.random() * neighbors.length)];
          grid[pick.r][pick.c] = id;
          path.push(pick);
          curr = pick;
        }

        paths.push(path);
        id++;
      }
    }

    // Merge any paths smaller than boundedMin into adjacent paths
    let valid = true;
    for (let i = paths.length - 1; i >= 0; i--) {
      if (paths[i].length < boundedMin) {
        const smallPath = paths[i];
        let merged = false;

        for (let j = 0; j < paths.length; j++) {
          if (i === j) continue;
          if (paths[j].length + smallPath.length <= boundedMax) {
            const targetTail = paths[j][paths[j].length - 1];
            const isAdj = Math.abs(targetTail.r - smallPath[0].r) + Math.abs(targetTail.c - smallPath[0].c) === 1;
            if (isAdj) {
              for (const p of smallPath) {
                grid[p.r][p.c] = j;
                paths[j].push(p);
              }
              paths.splice(i, 1);
              merged = true;
              break;
            }
          }
        }

        if (!merged) {
          valid = false;
          break;
        }
      }
    }

    // Validate all paths
    if (valid && paths.every(p => p.length >= boundedMin && p.length <= boundedMax)) {
      const seeds: Seed[] = paths.map((path, idx) => ({
        id: idx,
        r: path[0].r,
        c: path[0].c,
        size: path.length,
        color: COLORS[idx % COLORS.length]
      }));
      return { seeds, R, C, solutionPaths: paths };
    }
  }

  // 100% Solvable Fallback
  return generateDeterministicLevel(R, C, boundedMax, boundedMin);
}

const ModeCard = ({ icon, title, desc, onClick }: { icon: React.ReactNode, title: string, desc: string, onClick: () => void }) => (
  <button 
    onClick={onClick}
    className="p-3 sm:p-4 rounded-xl border-2 border-white/10 bg-slate-800/50 hover:bg-slate-700 hover:border-indigo-500/50 flex flex-col items-center gap-2 text-center transition-colors cursor-pointer"
  >
    <div className="p-3 rounded-full bg-slate-700 text-indigo-400">
      {icon}
    </div>
    <div>
      <h3 className="font-bold text-white text-sm sm:text-base leading-tight">{title}</h3>
      <p className="text-xs text-slate-400 mt-1 line-clamp-2">{desc}</p>
    </div>
  </button>
);

export const DrawAShapeGame: React.FC<GameComponentProps> = ({ bridge, onGameOver }) => {
  const { profile } = usePlayer();
  const intensity = profile?.gameIntensity || 'normal';

  const [screen, setScreen] = useState<'menu' | 'playing'>('menu');
  const [mode, setMode] = useState<GameMode>('classic');
  const [showCustomSettings, setShowCustomSettings] = useState(false);
  const [customR, setCustomR] = useState(6);
  const [customC, setCustomC] = useState(6);
  
  const [levelNum, setLevelNum] = useState(1);
  const [gridSize, setGridSize] = useState({ R: 4, C: 4 });
  const [currentMaxSize, setCurrentMaxSize] = useState(4);
  const [seeds, setSeeds] = useState<Seed[]>([]);
  const [solutionPaths, setSolutionPaths] = useState<Point[][]>([]);
  const [playerPaths, setPlayerPaths] = useState<Record<number, Point[]>>({});
  const [isWon, setIsWon] = useState(false);
  const [isFailed, setIsFailed] = useState(false);
  const [score, setScore] = useState(0);
  const [hintsRemaining, setHintsRemaining] = useState(3);
  
  const [timeLeft, setTimeLeft] = useState<number>(0);
  const [strokesLeft, setStrokesLeft] = useState<number>(0);

  const activeSeedIdRef = useRef<number | null>(null);

  const initLevel = useCallback((r: number, c: number, currentMode: GameMode, maxSz: number, minSz: number) => {
    const { seeds: generatedSeeds, solutionPaths: paths } = generateLevel(r, c, maxSz, minSz);
    setSeeds(generatedSeeds);
    setSolutionPaths(paths);
    setPlayerPaths({});
    setIsWon(false);
    setCurrentMaxSize(maxSz);
    if (currentMode === 'strokes') {
      setStrokesLeft(generatedSeeds.length + 4); 
    }
  }, []);

  const startGame = (selectedMode: GameMode = mode) => {
    bridge.playSound('click');
    setMode(selectedMode);
    setScreen('playing');
    setLevelNum(1);
    setScore(0);
    setIsFailed(false);
    setHintsRemaining(3);
    
    let initialR = 4;
    let initialC = 4;
    let maxSz = 4;
    let minSz = 3;

    if (selectedMode === 'custom') {
      initialR = customR;
      initialC = customC;
      maxSz = Math.min(24, Math.max(4, Math.floor((customR * customC) / 3)));
    } else {
      const config = getLevelConfig(1, intensity);
      initialR = config.R;
      initialC = config.C;
      maxSz = config.maxSize;
      minSz = config.minSize;
    }

    setGridSize({ R: initialR, C: initialC });
    
    if (selectedMode === 'time') {
      setTimeLeft(intensity === 'casual' ? 75 : intensity === 'hardcore' ? 45 : 60);
    } else if (selectedMode === 'score') {
      setTimeLeft(0);
    } else {
      setTimeLeft(0);
    }
    
    initLevel(initialR, initialC, selectedMode, maxSz, minSz);
  };

  useEffect(() => {
    if (screen === 'playing' && mode === 'time' && !isWon && !isFailed && timeLeft > 0) {
      const timer = setInterval(() => {
        setTimeLeft(t => {
          if (t <= 1) {
            clearInterval(timer);
            setIsFailed(true);
            bridge.playSound('pop');
            return 0;
          }
          return t - 1;
        });
      }, 1000);
      return () => clearInterval(timer);
    }
  }, [screen, mode, isWon, isFailed, timeLeft, bridge]);

  useEffect(() => {
    if (screen === 'playing' && mode === 'score' && !isWon && !isFailed) {
      const timer = setInterval(() => setTimeLeft(t => t + 1), 1000);
      return () => clearInterval(timer);
    }
  }, [screen, mode, isWon, isFailed]);

  useEffect(() => {
    if (seeds.length === 0 || isWon || isFailed) return;
    let win = true;
    for (let s of seeds) {
      if (!playerPaths[s.id] || playerPaths[s.id].length !== s.size) {
        win = false;
        break;
      }
    }
    
    if (win) {
      setIsWon(true);
      bridge.playSound('levelUp');
      confetti({ particleCount: 100, spread: 70, origin: { y: 0.6 } });
      
      const levelScore = 100 + (levelNum * 25) + (currentMaxSize * 10);
      const newScore = score + levelScore;
      setScore(newScore);
      bridge.submitScore(newScore);

      if (mode === 'time') {
        const bonusTime = intensity === 'casual' ? 20 : intensity === 'hardcore' ? 10 : 15;
        setTimeLeft(t => t + bonusTime);
      }
    } else if (mode === 'strokes' && strokesLeft <= 0) {
      setIsFailed(true);
      bridge.playSound('pop');
    }
  }, [playerPaths, seeds, isWon, isFailed, bridge, score, levelNum, mode, strokesLeft, currentMaxSize, intensity]);

  const handleNextLevel = () => {
    bridge.playSound('click');
    
    if (mode === 'score' && score >= 5000) {
      onGameOver(score);
      return;
    }

    const nextLevel = levelNum + 1;
    setLevelNum(nextLevel);
    
    if (mode !== 'custom') {
      const config = getLevelConfig(nextLevel, intensity);
      setGridSize({ R: config.R, C: config.C });
      initLevel(config.R, config.C, mode, config.maxSize, config.minSize);
    } else {
      const maxSz = Math.min(24, Math.max(4, Math.floor((gridSize.R * gridSize.C) / 3)));
      initLevel(gridSize.R, gridSize.C, mode, maxSz, 3);
    }
  };

  const handleRestart = () => {
    bridge.playSound('click');
    if (mode !== 'custom') {
      const config = getLevelConfig(levelNum, intensity);
      initLevel(gridSize.R, gridSize.C, mode, config.maxSize, config.minSize);
    } else {
      const maxSz = Math.min(24, Math.max(4, Math.floor((gridSize.R * gridSize.C) / 3)));
      initLevel(gridSize.R, gridSize.C, mode, maxSz, 3);
    }
  };

  const handleUseHint = () => {
    if (hintsRemaining <= 0 || isWon || isFailed || solutionPaths.length === 0) return;
    bridge.playSound('click');

    // Find the first seed that is incomplete
    const targetSeed = seeds.find(s => !playerPaths[s.id] || playerPaths[s.id].length < s.size);
    if (!targetSeed) return;

    const solPath = solutionPaths[targetSeed.id];
    if (!solPath) return;

    const currentP = playerPaths[targetSeed.id] || [{ r: targetSeed.r, c: targetSeed.c }];
    const nextIdx = currentP.length;
    if (nextIdx < solPath.length) {
      setPlayerPaths(prev => ({
        ...prev,
        [targetSeed.id]: solPath.slice(0, nextIdx + 1)
      }));
      setHintsRemaining(h => Math.max(0, h - 1));
    }
  };

  const handleCellDown = (r: number, c: number) => {
    if (isWon || isFailed) return;
    
    const seed = seeds.find(s => s.r === r && s.c === c);
    if (seed) {
      activeSeedIdRef.current = seed.id;
      setPlayerPaths(prev => ({ ...prev, [seed.id]: [{r, c}] }));
      bridge.playSound('click');
      return;
    }
    
    setPlayerPaths(prev => {
      for (let idStr in prev) {
        const id = Number(idStr);
        const path = prev[id];
        const idx = path.findIndex(p => p.r === r && p.c === c);
        if (idx !== -1) {
          activeSeedIdRef.current = id;
          bridge.playSound('click');
          return { ...prev, [id]: path.slice(0, idx + 1) };
        }
      }
      return prev;
    });
  };

  const handleCellEnter = (r: number, c: number) => {
    const activeId = activeSeedIdRef.current;
    if (activeId === null || isWon || isFailed) return;
    
    setPlayerPaths(prev => {
      const currentPath = prev[activeId] || [];
      const seed = seeds.find(s => s.id === activeId);
      if (!seed) return prev;
      
      const existingIdx = currentPath.findIndex(p => p.r === r && p.c === c);
      if (existingIdx !== -1) {
        return { ...prev, [activeId]: currentPath.slice(0, existingIdx + 1) };
      }
      
      const isOccupiedByOther = Object.entries(prev).some(([idStr, path]) => {
        if (Number(idStr) === activeId) return false;
        return path.some(p => p.r === r && p.c === c);
      });
      if (isOccupiedByOther) return prev;
      
      const lastCell = currentPath[currentPath.length - 1];
      if (!lastCell) return prev;
      
      const isAdj = Math.abs(lastCell.r - r) + Math.abs(lastCell.c - c) === 1;
      if (isAdj && currentPath.length < seed.size) {
        bridge.playSound('click');
        return { ...prev, [activeId]: [...currentPath, {r, c}] };
      }
      
      return prev;
    });
  };

  useEffect(() => {
    const handleUp = () => {
      if (activeSeedIdRef.current !== null) {
        if (mode === 'strokes' && !isWon && !isFailed) {
          setStrokesLeft(prev => prev - 1);
        }
      }
      activeSeedIdRef.current = null;
    };
    window.addEventListener('pointerup', handleUp);
    window.addEventListener('touchend', handleUp);
    return () => {
      window.removeEventListener('pointerup', handleUp);
      window.removeEventListener('touchend', handleUp);
    };
  }, [mode, isWon, isFailed]);

  const handleMove = (clientX: number, clientY: number) => {
    if (activeSeedIdRef.current === null) return;
    const el = document.elementFromPoint(clientX, clientY);
    if (el) {
      const rStr = el.getAttribute('data-r');
      const cStr = el.getAttribute('data-c');
      if (rStr !== null && cStr !== null) {
        const r = parseInt(rStr, 10);
        const c = parseInt(cStr, 10);
        if (!isNaN(r) && !isNaN(c)) {
          handleCellEnter(r, c);
        }
      }
    }
  };

  const onPointerMove = (e: React.PointerEvent) => {
    if (e.buttons > 0) {
      handleMove(e.clientX, e.clientY);
    }
  };

  const onTouchMove = (e: React.TouchEvent) => {
    handleMove(e.touches[0].clientX, e.touches[0].clientY);
  };

  // Compute completed shapes count
  const completedShapesCount = seeds.filter(
    s => playerPaths[s.id] && playerPaths[s.id].length === s.size
  ).length;

  const maxDimension = Math.max(gridSize.R, gridSize.C);
  const cellFontClass = maxDimension >= 9 ? 'text-xs sm:text-sm font-extrabold' : maxDimension >= 7 ? 'text-sm sm:text-base font-black' : 'text-xl sm:text-2xl font-black';

  if (screen === 'menu') {
    return (
      <div className="w-full h-full flex flex-col items-center justify-center bg-[#0a0b12] text-white p-4">
        <div className="w-full max-w-md bg-slate-900/80 p-6 sm:p-8 rounded-3xl border border-white/10 shadow-2xl flex flex-col gap-6 relative">
          
          <button onClick={() => onGameOver(0)} className="absolute top-4 left-4 p-2 text-slate-400 hover:text-white bg-slate-800/80 hover:bg-slate-700 rounded-full transition-colors z-10 cursor-pointer">
            <Home className="w-5 h-5" />
          </button>
          
          <div className="text-center mt-4">
            <div className="inline-flex items-center gap-1.5 px-3 py-1 rounded-full bg-indigo-500/20 border border-indigo-500/30 text-indigo-300 text-xs font-bold mb-2">
              <span>Độ khó: {intensity === 'casual' ? 'Thư Giãn' : intensity === 'hardcore' ? 'Khắc Nghiệt' : 'Tiêu Chuẩn'}</span>
              <span>• Max 24 Ô</span>
            </div>
            <h1 className="text-3xl sm:text-4xl font-black text-indigo-400 mb-1">Draw A Shape</h1>
            <p className="text-slate-400 text-xs">Vẽ đường đi lấp đầy bảng theo số lượng từng ô</p>
          </div>

          {!showCustomSettings ? (
            <div className="grid grid-cols-2 gap-3">
              <ModeCard 
                icon={<Star />} title="Cổ Điển" desc="Tăng dần 4x4 tới 10x10 (max 24 ô)" 
                onClick={() => startGame('classic')} 
              />
              <ModeCard 
                icon={<Clock />} title="Thời Gian" desc="Đua top thời gian gấp gáp" 
                onClick={() => startGame('time')} 
              />
              <ModeCard 
                icon={<Target />} title="Đạt Điểm" desc="Mục tiêu 5000 điểm" 
                onClick={() => startGame('score')} 
              />
              <ModeCard 
                icon={<Edit3 />} title="Giới Hạn Bước" desc="Số nét vẽ có giới hạn" 
                onClick={() => startGame('strokes')} 
              />
              <button 
                onClick={() => setShowCustomSettings(true)}
                className="col-span-2 py-3 bg-slate-800 hover:bg-slate-700 rounded-xl font-bold flex items-center justify-center gap-2 text-slate-300 border border-white/10 transition-colors cursor-pointer mt-2"
              >
                <Grid className="w-5 h-5" /> Tùy Chỉnh Kích Thước (4x4 - 10x10)
              </button>
            </div>
          ) : (
            <div className="flex flex-col gap-4 animate-in fade-in slide-in-from-bottom-4">
              <div className="flex items-center justify-between mb-2">
                <h3 className="font-bold text-lg">Chế độ tùy chỉnh</h3>
                <button onClick={() => setShowCustomSettings(false)} className="text-slate-400 hover:text-white text-sm underline cursor-pointer">Quay lại</button>
              </div>
              <div className="bg-slate-800 p-4 rounded-xl flex flex-col gap-4 border border-white/5">
                <div className="flex items-center justify-between">
                  <span className="font-bold text-sm">Hàng: <span className="text-indigo-400">{customR}</span></span>
                  <input type="range" min={4} max={10} value={customR} onChange={e => setCustomR(+e.target.value)} className="w-32 sm:w-40 accent-indigo-500" />
                </div>
                <div className="flex items-center justify-between">
                  <span className="font-bold text-sm">Cột: <span className="text-indigo-400">{customC}</span></span>
                  <input type="range" min={4} max={10} value={customC} onChange={e => setCustomC(+e.target.value)} className="w-32 sm:w-40 accent-indigo-500" />
                </div>
              </div>
              <button onClick={() => startGame('custom')} className="w-full py-4 bg-indigo-600 hover:bg-indigo-500 rounded-xl font-bold flex items-center justify-center gap-2 text-lg transition-colors shadow-lg shadow-indigo-500/20 cursor-pointer">
                <Play className="w-5 h-5" /> Chơi Ngay
              </button>
            </div>
          )}
        </div>
      </div>
    );
  }

  return (
    <div className="w-full h-full flex flex-col items-center bg-[#0a0b12] text-white p-3 sm:p-4 font-sans select-none overflow-hidden touch-none relative">
      {/* Top HUD */}
      <div className="w-full max-w-xl flex items-center justify-between p-3 sm:p-4 bg-slate-900/60 rounded-2xl border border-white/10 mb-4 shrink-0 mt-2 sm:mt-4">
        <div className="flex flex-col">
          <div className="flex items-center gap-2">
            <span className="text-xs sm:text-sm font-bold text-slate-300">
              {mode === 'custom' ? `Tùy chỉnh ${gridSize.R}x${gridSize.C}` : `Level ${levelNum} (${gridSize.R}x${gridSize.C})`}
            </span>
            <span className="px-2 py-0.5 rounded-md bg-indigo-500/20 text-indigo-300 text-[10px] font-extrabold border border-indigo-500/30">
              Max {currentMaxSize} ô
            </span>
          </div>
          <span className="text-lg sm:text-2xl font-black text-indigo-400 flex items-center gap-2">
            {mode === 'classic' && <><Star className="w-4 h-4 sm:w-5 sm:h-5 text-amber-400" /> Cổ Điển</>}
            {mode === 'time' && <><Clock className="w-4 h-4 sm:w-5 sm:h-5 text-red-400" /> {timeLeft}s</>}
            {mode === 'score' && <><Target className="w-4 h-4 sm:w-5 sm:h-5 text-emerald-400" /> {timeLeft}s</>}
            {mode === 'strokes' && <><Edit3 className="w-4 h-4 sm:w-5 sm:h-5 text-amber-400" /> {strokesLeft} Nét</>}
            {mode === 'custom' && <><Grid className="w-4 h-4 sm:w-5 sm:h-5" /> Tùy Chọn</>}
          </span>
        </div>

        <div className="flex items-center gap-3">
          {/* Hint button */}
          <button
            type="button"
            onClick={handleUseHint}
            disabled={hintsRemaining <= 0 || isWon || isFailed}
            className={`px-2.5 py-1.5 rounded-xl border text-xs font-bold flex items-center gap-1.5 transition-colors cursor-pointer ${
              hintsRemaining > 0 && !isWon && !isFailed
                ? 'bg-amber-500/15 border-amber-500/40 text-amber-300 hover:bg-amber-500/25'
                : 'bg-white/5 border-white/5 text-slate-500 cursor-not-allowed opacity-50'
            }`}
            title="Gợi ý nét vẽ tiếp theo"
          >
            <Lightbulb className="w-3.5 h-3.5" />
            <span className="hidden sm:inline">Gợi ý</span>
            <span className="font-mono text-[11px]">({hintsRemaining})</span>
          </button>

          <div className="flex flex-col items-end">
            <span className="text-[11px] sm:text-xs font-bold text-slate-400">
              {mode === 'score' ? 'Mục Tiêu' : 'Tiến Độ'}
            </span>
            <span className="text-base sm:text-xl font-black text-amber-400 font-mono">
              {mode === 'score' ? `${score}/5000` : `${completedShapesCount}/${seeds.length}`}
            </span>
          </div>
        </div>
      </div>

      {/* Playing Board Grid */}
      <div className="flex-1 flex items-center justify-center w-full min-h-0 relative shrink-0 perspective-1000">
        <AnimatePresence mode="wait">
          <motion.div 
            key={levelNum + "-" + mode}
            initial={{ opacity: 0, scale: 0.9 }}
            animate={{ opacity: 1, scale: 1 }}
            exit={{ opacity: 0, scale: 0.9 }}
            transition={{ type: "spring", stiffness: 260, damping: 25 }}
            className="relative bg-slate-900/60 p-1 sm:p-2.5 rounded-2xl border border-white/10 shadow-2xl"
            style={{
              display: 'grid',
              gridTemplateRows: `repeat(${gridSize.R}, minmax(0, 1fr))`,
              gridTemplateColumns: `repeat(${gridSize.C}, minmax(0, 1fr))`,
              gap: maxDimension >= 8 ? '2px' : '3px',
              width: '100%',
              maxWidth: maxDimension >= 9 ? '460px' : '440px',
              aspectRatio: `${gridSize.C} / ${gridSize.R}`,
              maxHeight: '100%'
            }}
            onPointerMove={onPointerMove}
            onTouchMove={onTouchMove}
          >
          {Array.from({length: gridSize.R}).map((_, r) => 
            Array.from({length: gridSize.C}).map((_, c) => {
              const seed = seeds.find(s => s.r === r && s.c === c);
              let bgColor = '#141420';
              let content = '';
              let isSeed = !!seed;
              let isPath = false;
              let isComplete = false;

              for (let idStr in playerPaths) {
                const id = Number(idStr);
                const path = playerPaths[id];
                const idx = path.findIndex(p => p.r === r && p.c === c);
                if (idx !== -1) {
                  const s = seeds.find(x => x.id === id);
                  if (s) {
                    bgColor = s.color;
                    isPath = true;
                    if (path.length === s.size) isComplete = true;
                  }
                  break;
                }
              }

              if (seed) content = seed.size.toString();

              return (
                <div
                  key={`${r}-${c}`}
                  data-r={r}
                  data-c={c}
                  onPointerDown={() => handleCellDown(r, c)}
                  className={`
                    relative flex items-center justify-center ${cellFontClass} rounded-md sm:rounded-lg
                    transition-colors duration-100 ease-out select-none cursor-pointer
                    ${isPath ? 'opacity-100' : 'opacity-85 hover:opacity-100'}
                    ${isComplete ? 'shadow-[inset_0_0_15px_rgba(255,255,255,0.35)]' : ''}
                    ${isSeed ? 'ring-2 ring-white/40 ring-inset font-black' : ''}
                  `}
                  style={{
                    backgroundColor: bgColor,
                    color: '#fff',
                    textShadow: '0 1px 3px rgba(0,0,0,0.8)'
                  }}
                >
                  {content}
                  
                  {isSeed && isComplete && (
                    <motion.div
                      className="absolute inset-0 rounded-md sm:rounded-lg bg-white/25 pointer-events-none"
                      animate={{ opacity: [0, 0.4, 0] }}
                      transition={{ duration: 1.5, repeat: Infinity }}
                    />
                  )}
                </div>
              );
            })
          )}
          </motion.div>
        </AnimatePresence>

        <AnimatePresence>
          {isWon && (
            <motion.div
              initial={{ opacity: 0, scale: 0.85 }}
              animate={{ opacity: 1, scale: 1 }}
              exit={{ opacity: 0, scale: 0.85 }}
              className="absolute inset-0 flex items-center justify-center bg-black/70 backdrop-blur-sm z-20 rounded-2xl p-4"
            >
              <div className="bg-slate-900 border border-indigo-500/50 p-6 sm:p-8 rounded-3xl shadow-2xl flex flex-col items-center gap-5 text-center max-w-sm w-full">
                <div className="w-16 h-16 sm:w-20 sm:h-20 bg-indigo-500/20 rounded-full flex items-center justify-center border-2 border-indigo-500">
                  <Trophy className="w-8 h-8 sm:w-10 sm:h-10 text-indigo-400" />
                </div>
                <div>
                  <h2 className="text-2xl sm:text-3xl font-black text-white mb-1">Xuất Sắc!</h2>
                  <p className="text-indigo-300 font-bold text-sm">Hoàn thành Level {levelNum} ({gridSize.R}x{gridSize.C})</p>
                  <p className="text-slate-400 font-bold mt-1 text-xs">Tổng Điểm: {score}</p>
                  {mode === 'score' && score >= 5000 && (
                    <p className="text-emerald-400 font-bold mt-2">🎉 Đạt mốc 5000 điểm!</p>
                  )}
                </div>
                
                <div className="flex flex-col w-full gap-2.5">
                  {(mode !== 'score' || score < 5000) && (
                    <button
                      onClick={handleNextLevel}
                      className="w-full py-3.5 bg-indigo-600 hover:bg-indigo-500 text-white rounded-xl font-bold flex items-center justify-center gap-2 transition-colors cursor-pointer"
                    >
                      Màn Kế Tiếp <ArrowRight className="w-5 h-5" />
                    </button>
                  )}
                  <button
                    onClick={() => onGameOver(score)}
                    className="w-full py-3 bg-slate-800 hover:bg-slate-700 text-white rounded-xl font-bold flex items-center justify-center gap-2 transition-colors cursor-pointer border border-white/5"
                  >
                    Về Trang Chủ
                  </button>
                </div>
              </div>
            </motion.div>
          )}

          {isFailed && (
            <motion.div
              initial={{ opacity: 0, scale: 0.85 }}
              animate={{ opacity: 1, scale: 1 }}
              exit={{ opacity: 0, scale: 0.85 }}
              className="absolute inset-0 flex items-center justify-center bg-black/80 backdrop-blur-sm z-50 rounded-2xl p-4"
            >
              <div className="bg-slate-900 border border-red-500/50 p-6 sm:p-8 rounded-3xl shadow-2xl flex flex-col items-center gap-5 text-center max-w-sm w-full">
                <h2 className="text-2xl sm:text-3xl font-black text-red-400 mb-1">Chưa Hoàn Thành!</h2>
                <p className="text-slate-300 font-bold text-sm">
                  {mode === 'time' ? 'Đã hết thời gian thi đấu!' : 'Đã hết lượt vẽ hợp lệ!'}
                </p>
                <p className="text-lg font-bold text-amber-400 font-mono">Điểm: {score}</p>
                
                <div className="flex w-full gap-3 mt-2">
                  <button onClick={() => setScreen('menu')} className="flex-1 py-3 bg-slate-800 hover:bg-slate-700 text-white rounded-xl font-bold border border-white/10 transition-colors cursor-pointer">Menu</button>
                  <button onClick={() => startGame(mode)} className="flex-1 py-3 bg-red-600 hover:bg-red-500 text-white rounded-xl font-bold border border-red-500/50 transition-colors cursor-pointer">Thử Lại</button>
                </div>
              </div>
            </motion.div>
          )}
        </AnimatePresence>
      </div>

      {/* Bottom controls */}
      <div className="w-full max-w-xl flex items-center justify-center gap-3 mt-4 pb-4 shrink-0">
        <button
          onClick={handleRestart}
          className="flex items-center gap-2 px-5 py-2.5 bg-slate-800 hover:bg-slate-700 text-white rounded-full font-bold transition-colors border border-white/10 cursor-pointer text-xs sm:text-sm"
        >
          <RefreshCw className="w-4 h-4" /> Chơi Lại Màn
        </button>
        <button
          onClick={() => setScreen('menu')}
          className="flex items-center gap-2 px-5 py-2.5 bg-slate-800 hover:bg-slate-700 text-white rounded-full font-bold transition-colors border border-white/10 cursor-pointer text-xs sm:text-sm"
        >
          <Settings className="w-4 h-4" /> Đổi Chế Độ
        </button>
      </div>
    </div>
  );
};
