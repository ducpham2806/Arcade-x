import React, { useState, useEffect, useCallback, useMemo, useRef } from 'react';
import { motion, AnimatePresence } from 'motion/react';
import { ArrowLeft, RefreshCw, Trophy, Coins, Settings, X, Check } from 'lucide-react';
import { usePlayer } from '../../context/PlayerContext';
import { useInventory } from '../../context/InventoryContext';
import { soundEngine } from '../../services/audio';
import { hapticService } from '../../services/haptics';
import confetti from 'canvas-confetti';
import { LevelMap } from './LevelMap';
import { generatePuzzle, generateBossPuzzle } from './generator';
import { Vehicle, LevelConfig } from './types';
import { GameComponentProps } from '../../types';
import { TopDownCar } from './TopDownCar';

function getBounds(vehicle: Vehicle, allVehicles: Vehicle[], size: number) {
  let min = 0;
  let max = size - vehicle.length;
  
  if (vehicle.isTarget) {
    max = size; // Allow moving off the right edge (winning condition)
  }
  
  allVehicles.forEach(other => {
    if (other.id === vehicle.id) return;
    
    if (vehicle.isHorizontal) {
      if (other.isHorizontal) {
        if (other.row === vehicle.row) {
          if (other.col < vehicle.col) min = Math.max(min, other.col + other.length);
          if (other.col > vehicle.col) max = Math.min(max, other.col - vehicle.length);
        }
      } else {
        // Vertical other
        if (other.row <= vehicle.row && other.row + other.length - 1 >= vehicle.row) {
          if (other.col < vehicle.col) min = Math.max(min, other.col + 1);
          if (other.col > vehicle.col) max = Math.min(max, other.col - vehicle.length);
        }
      }
    } else {
      // Vehicle is vertical
      if (!other.isHorizontal) {
        if (other.col === vehicle.col) {
          if (other.row < vehicle.row) min = Math.max(min, other.row + other.length);
          if (other.row > vehicle.row) max = Math.min(max, other.row - vehicle.length);
        }
      } else {
        // Horizontal other
        if (other.col <= vehicle.col && other.col + other.length - 1 >= vehicle.col) {
          if (other.row < vehicle.row) min = Math.max(min, other.row + 1);
          if (other.row > vehicle.row) max = Math.min(max, other.row - vehicle.length);
        }
      }
    }
  });
  return { min, max };
}

export const CarEscapeGame: React.FC<GameComponentProps> = ({ bridge, isPaused, onGameOver }) => {
  const { addCoins } = usePlayer();
  const { items, getEquippedSkinForGame, equipItem, unequipItem } = useInventory();
  
  const [maxCompletedLevel, setMaxCompletedLevel] = useState(0);
  const [currentLevelNum, setCurrentLevelNum] = useState<number | null>(null);
  const [showSettings, setShowSettings] = useState(false);
  
  const [config, setConfig] = useState<LevelConfig | null>(null);
  const [vehicles, setVehicles] = useState<Vehicle[]>([]);
  
  const [isWon, setIsWon] = useState(false);
  const [moves, setMoves] = useState(0);
  const startTimeRef = useRef<number>(Date.now());
  
  const equippedSkin = getEquippedSkinForGame('car-escape');
  let targetEmoji = '🚑';
  if (equippedSkin?.id === 'skin-car-escape-firetruck') targetEmoji = '🚒';
  if (equippedSkin?.id === 'skin-car-escape-police') targetEmoji = '🚓';
  if (equippedSkin?.id === 'skin-car-escape-sports') targetEmoji = '🏎️';

  const boardRef = useRef<HTMLDivElement>(null);
  
  const [draggingId, setDraggingId] = useState<number | null>(null);
  const [dragOffset, setDragOffset] = useState({ x: 0, y: 0 });
  const [dragStartPos, setDragStartPos] = useState({ col: 0, row: 0 });
  
  useEffect(() => {
    const saved = localStorage.getItem('car-escape-progress-v2');
    if (saved) {
      try {
        setMaxCompletedLevel(parseInt(saved, 10) || 0);
      } catch (e) {}
    }
  }, []);

  const loadLevel = useCallback((levelNum: number) => {
    soundEngine.play('click');
    hapticService.tap();
    setCurrentLevelNum(levelNum);
    setIsWon(false);
    setMoves(0);
    startTimeRef.current = Date.now();
    
    const newConfig = levelNum === 999 ? generateBossPuzzle() : generatePuzzle(levelNum);
    setConfig(newConfig);
    setVehicles(newConfig.vehicles);
  }, []);

  const handleLevelComplete = useCallback(() => {
    soundEngine.play('win');
    hapticService.success();
    setIsWon(true);
    
    confetti({
      particleCount: 150,
      spread: 100,
      origin: { y: 0.6 },
    });

    if (currentLevelNum) {
      const timeTaken = (Date.now() - startTimeRef.current) / 1000;
      let reward = 10;
      if (timeTaken < 30) reward += 5;
      if (currentLevelNum === 999) reward = 200; // Boss reward
      
      addCoins(reward);
      
      if (currentLevelNum !== 999) {
        const nextMax = Math.max(maxCompletedLevel, currentLevelNum);
        setMaxCompletedLevel(nextMax);
        localStorage.setItem('car-escape-progress-v2', nextMax.toString());
      }
    }
  }, [currentLevelNum, maxCompletedLevel, addCoins]);

  // Touch & Mouse handling
  const activeVehicle = useMemo(() => vehicles.find(v => v.id === draggingId), [vehicles, draggingId]);
  
  const handlePointerDown = (e: React.PointerEvent, v: Vehicle) => {
    if (isWon) return;
    e.preventDefault();
    (e.target as HTMLElement).setPointerCapture(e.pointerId);
    
    setDraggingId(v.id);
    setDragStartPos({ col: v.col, row: v.row });
    
    const rect = (e.currentTarget as HTMLElement).getBoundingClientRect();
    setDragOffset({
      x: e.clientX - rect.left,
      y: e.clientY - rect.top
    });
    
    soundEngine.play('click');
    hapticService.tap();
  };

  const lastBumpTimeRef = useRef<number>(0);

  const handlePointerMove = (e: React.PointerEvent) => {
    if (isWon || draggingId === null || !activeVehicle || !config || !boardRef.current) return;
    
    const boardRect = boardRef.current.getBoundingClientRect();
    const cellSize = boardRect.width / config.size;
    
    const { min, max } = getBounds(activeVehicle, vehicles, config.size);
    
    let newCol = activeVehicle.col;
    let newRow = activeVehicle.row;
    let bumped = false;

    if (activeVehicle.isHorizontal) {
      const relativeX = e.clientX - boardRect.left - dragOffset.x;
      let targetCol = Math.round(relativeX / cellSize);
      if (targetCol < min || targetCol > max) bumped = true;
      targetCol = Math.max(min, Math.min(max, targetCol));
      newCol = targetCol;
    } else {
      const relativeY = e.clientY - boardRect.top - dragOffset.y;
      let targetRow = Math.round(relativeY / cellSize);
      if (targetRow < min || targetRow > max) bumped = true;
      targetRow = Math.max(min, Math.min(max, targetRow));
      newRow = targetRow;
    }

    if (bumped) {
      const now = Date.now();
      if (now - lastBumpTimeRef.current > 300) {
        lastBumpTimeRef.current = now;
        soundEngine.play('metalHit');
        hapticService.error(); // Stronger vibration
        boardRef.current.animate([
          { transform: 'translate3d(-4px, 0, 0)' },
          { transform: 'translate3d(4px, 0, 0)' },
          { transform: 'translate3d(-3px, 0, 0)' },
          { transform: 'translate3d(2px, 0, 0)' },
          { transform: 'translate3d(0, 0, 0)' }
        ], { duration: 250, easing: 'ease-in-out' });
      }
    }

    if (newCol !== activeVehicle.col || newRow !== activeVehicle.row) {
      setVehicles(prev => {
        const nextVehicles = prev.map(v => v.id === draggingId ? { ...v, col: newCol, row: newRow } : v);
        const currentTarget = nextVehicles.find(v => v.isTarget);
        if (currentTarget && currentTarget.col >= config.size - currentTarget.length) {
          setTimeout(() => handleLevelComplete(), 50);
        }
        return nextVehicles;
      });
      // Subtle haptic when snapping to a new grid cell
      hapticService.tap();
    }
  };

  const handlePointerUp = (e: React.PointerEvent) => {
    if (draggingId === null || !config) return;
    try {
      (e.target as HTMLElement).releasePointerCapture(e.pointerId);
    } catch {}
    
    // Find current vehicle
    const currentVeh = vehicles.find(v => v.id === draggingId);
    if (currentVeh) {
      if (currentVeh.col !== dragStartPos.col || currentVeh.row !== dragStartPos.row) {
        setMoves(m => m + 1);
        soundEngine.play('tap');
      }
      
      // Check win
      if (currentVeh.isTarget && currentVeh.col >= config.size - currentVeh.length) {
        handleLevelComplete();
      }
    }
    
    setDraggingId(null);
  };
  
  return (
    <div className="relative w-full h-full max-w-4xl mx-auto flex flex-col justify-between p-1 sm:p-2 select-none bg-[#080c18] overflow-hidden text-white">
      {currentLevelNum === null ? (
        <LevelMap maxCompletedLevel={maxCompletedLevel} onSelectLevel={loadLevel} />
      ) : (
        <div className="flex-1 flex flex-col items-center p-4">
          
          {/* Header */}
          <div className="w-full max-w-md flex items-center justify-between mb-8 mt-2">
            <button 
              onClick={() => setCurrentLevelNum(null)}
              className="w-12 h-12 bg-slate-800/80 rounded-2xl flex items-center justify-center text-slate-300 hover:text-white hover:bg-slate-700 transition-colors"
            >
              <ArrowLeft className="w-5 h-5" />
            </button>
            <div className="text-center">
              <h2 className="text-2xl font-black font-display tracking-wide uppercase shadow-sm">
                LEVEL {currentLevelNum}
              </h2>
              <div className="text-sm text-slate-400">
                Thành phố {config?.city || 1}
              </div>
            </div>
            {/* Empty space for balance */}
            <div className="w-12 h-12" />
          </div>
          
          {/* Board Area */}
          <div className="w-full max-w-md aspect-square relative mb-8">
            {config && (
              <div 
                ref={boardRef}
                className="w-full h-full bg-[#374151] rounded-2xl border-4 border-[#1f2937] relative shadow-2xl touch-none"
                style={{
                  display: 'grid',
                  gridTemplateColumns: `repeat(${config.size}, minmax(0, 1fr))`,
                  gridTemplateRows: `repeat(${config.size}, minmax(0, 1fr))`,
                }}
              >
                {/* Background Grid Cells */}
                {Array.from({ length: config.size * config.size }).map((_, i) => (
                  <div key={i} className="border border-[#4b5563]/30"></div>
                ))}
                
                {/* Exit Marker */}
                <div 
                  className="absolute right-[-24px] h-[calc(100%_/_var(--size)_-_8px)] bg-red-500/10 border-2 border-dashed border-red-500/50 rounded-r-xl z-0 flex items-center justify-center animate-pulse"
                  style={{
                    '--size': config.size,
                    top: `calc(${config.targetRow * 100 / config.size}% + 6px)`,
                    width: '32px'
                  } as React.CSSProperties}
                >
                  <span className="text-red-500 font-bold text-xs uppercase -rotate-90">Exit</span>
                </div>
                
                {/* Vehicles */}
                {vehicles.map(v => {
                  const isDragging = v.id === draggingId;
                  return (
                    <motion.div
                      key={v.id}
                      onPointerDown={(e: any) => handlePointerDown(e, v)}
                      onPointerMove={(e: any) => handlePointerMove(e)}
                      onPointerUp={(e: any) => handlePointerUp(e)}
                      onPointerCancel={(e: any) => handlePointerUp(e)}
                      animate={{
                        left: `${v.col * 100 / config.size}%`,
                        top: `${v.row * 100 / config.size}%`,
                        scale: isDragging ? 1.05 : 1,
                        zIndex: isDragging ? 10 : 1
                      }}
                      transition={{
                        type: 'spring',
                        stiffness: 400,
                        damping: 30,
                        mass: 0.8
                      }}
                      className={`absolute top-0 left-0 p-1 touch-none select-none`}
                      style={{
                        width: `${(v.isHorizontal ? v.length : 1) * 100 / config.size}%`,
                        height: `${(v.isHorizontal ? 1 : v.length) * 100 / config.size}%`,
                      }}
                    >
                      <TopDownCar 
                        color={v.color} 
                        length={v.length} 
                        isHorizontal={v.isHorizontal} 
                        isTarget={v.isTarget}
                        skinId={equippedSkin?.id}
                      />
                    </motion.div>
                  );
                })}
              </div>
            )}
          </div>
          
          <div className="flex gap-6 items-center">
            <div className="px-6 py-3 bg-slate-800/80 rounded-2xl flex flex-col items-center">
              <span className="text-xs font-bold text-slate-400 uppercase tracking-widest">Nước Đi</span>
              <span className="text-2xl font-black text-white">{moves}</span>
            </div>
          </div>
          
          {/* Win Popup Overlay */}
          <AnimatePresence>
            {isWon && (
              <motion.div
                initial={{ opacity: 0 }}
                animate={{ opacity: 1 }}
                exit={{ opacity: 0 }}
                className="absolute inset-0 z-50 flex items-center justify-center bg-black/80 backdrop-blur-sm p-6"
              >
                <motion.div
                  initial={{ scale: 0.8, y: 20 }}
                  animate={{ scale: 1, y: 0 }}
                  exit={{ scale: 0.8, y: -20 }}
                  className="bg-gradient-to-b from-slate-800 to-slate-900 border border-slate-700 p-8 rounded-3xl w-full max-w-sm text-center shadow-2xl relative overflow-hidden"
                >
                  <div className="absolute top-0 left-0 w-full h-32 bg-emerald-500/10 blur-3xl rounded-full" />
                  
                  <div className="w-20 h-20 bg-gradient-to-br from-emerald-400 to-teal-500 rounded-2xl mx-auto mb-6 flex items-center justify-center shadow-lg shadow-emerald-500/30">
                    <Trophy className="w-10 h-10 text-white" />
                  </div>
                  
                  <h3 className="text-3xl font-black text-white font-display mb-2">{currentLevelNum === 999 ? "BOSS BỊ HẠ!" : "Thoát Hiểm!"}</h3>
                  <p className="text-slate-400 mb-8">Bạn đã dọn đường thành công trong {moves} nước đi.</p>
                  
                  <div className="flex gap-4 mb-8 justify-center">
                    <div className="flex items-center gap-2 bg-slate-950/50 px-4 py-2 rounded-xl">
                      <Coins className="w-5 h-5 text-amber-400" />
                      <span className="text-white font-bold">+{currentLevelNum === 999 ? 200 : 10} Xu</span>
                    </div>
                  </div>
                  
                  <div className="flex flex-col gap-3">
                    {currentLevelNum !== 999 && (
                      <button
                        onClick={() => {
                          soundEngine.play('click');
                          hapticService.tap();
                          loadLevel(currentLevelNum! + 1);
                        }}
                        className="w-full py-3.5 rounded-xl font-bold text-base bg-gradient-to-r from-emerald-500 to-teal-500 text-white shadow-lg shadow-emerald-500/30 hover:scale-105 transition-transform"
                      >
                        Màn Tiếp Theo
                      </button>
                    )}
                    {onGameOver && (
                      <button
                        onClick={() => {
                          soundEngine.play('click');
                          setIsWon(false);
                          const calculatedScore = Math.max(
                            100,
                            Math.round(1000 - Math.min(800, moves * 15))
                          );
                          onGameOver(calculatedScore, {
                            level: currentLevelNum || 1,
                            moves,
                          });
                        }}
                        className="w-full py-3 rounded-xl font-bold text-sm bg-gradient-to-r from-amber-500 to-yellow-500 text-black hover:opacity-95 transition-all flex items-center justify-center gap-2 shadow-lg shadow-amber-500/20"
                      >
                        <Trophy className="w-4 h-4" />
                        Bảng Tổng Kết Ván Đấu
                      </button>
                    )}
                    <button
                      onClick={() => {
                        soundEngine.play('click');
                        hapticService.tap();
                        setCurrentLevelNum(null);
                      }}
                      className="w-full py-3 rounded-xl font-bold text-base bg-slate-800 text-white hover:bg-slate-700 transition-colors"
                    >
                      Bản Đồ Màn Chơi
                    </button>
                  </div>
                </motion.div>
              </motion.div>
            )}
          </AnimatePresence>
          
          {/* Settings Modal */}
          <AnimatePresence>
            {showSettings && (
              <motion.div
                initial={{ opacity: 0 }}
                animate={{ opacity: 1 }}
                exit={{ opacity: 0 }}
                className="absolute inset-0 z-50 flex items-center justify-center bg-black/80 backdrop-blur-sm p-4"
              >
                <motion.div
                  initial={{ scale: 0.9, y: 20 }}
                  animate={{ scale: 1, y: 0 }}
                  exit={{ scale: 0.9, y: 20 }}
                  className="bg-slate-900 border border-slate-700 p-6 rounded-3xl w-full max-w-sm flex flex-col shadow-2xl max-h-[80vh] overflow-hidden"
                >
                  <div className="flex justify-between items-center mb-6">
                    <h3 className="text-xl font-bold text-white font-display">Tùy Chỉnh Xe</h3>
                    <button 
                      onClick={() => setShowSettings(false)}
                      className="p-2 bg-slate-800 rounded-full text-slate-400 hover:text-white"
                    >
                      <X className="w-5 h-5" />
                    </button>
                  </div>
                  <div className="overflow-y-auto custom-scrollbar flex-1 pr-2">
                    <div className="grid gap-3">
                      <button
                        onClick={() => {
                          if (equippedSkin) unequipItem(equippedSkin.id);
                          hapticService.tap();
                        }}
                        className={`p-4 rounded-2xl border-2 flex items-center gap-4 transition-all text-left ${!equippedSkin ? "bg-indigo-500/20 border-indigo-500" : "bg-slate-800 border-slate-700 hover:border-slate-600"}`}
                      >
                        <div className="text-3xl">🚑</div>
                        <div className="flex-1">
                          <h4 className="font-bold text-white">Cứu Thương</h4>
                        </div>
                        {!equippedSkin && <Check className="w-5 h-5 text-indigo-400" />}
                      </button>
                      {items.filter(i => i.type === "skin" && i.gameId === "car-escape").map(skin => {
                        const isEquipped = equippedSkin?.id === skin.id;
                        return (
                          <button
                            key={skin.id}
                            onClick={() => {
                              equipItem(skin.id);
                              hapticService.tap();
                            }}
                            className={`p-4 rounded-2xl border-2 flex items-center gap-4 transition-all text-left ${isEquipped ? "bg-indigo-500/20 border-indigo-500" : "bg-slate-800 border-slate-700 hover:border-slate-600"}`}
                          >
                            <div className="text-3xl">{skin.icon}</div>
                            <div className="flex-1">
                              <h4 className="font-bold text-white">{skin.name}</h4>
                              <p className="text-xs text-slate-400 line-clamp-1">{skin.description}</p>
                            </div>
                            {isEquipped && <Check className="w-5 h-5 text-indigo-400" />}
                          </button>
                        );
                      })}
                    </div>
                  </div>
                  <p className="text-center text-xs text-slate-500 mt-4">Mở khóa thêm xe từ Rương Kho Báu</p>
                </motion.div>
              </motion.div>
            )}
          </AnimatePresence>

          
        </div>
      )}
    </div>
  );
};
