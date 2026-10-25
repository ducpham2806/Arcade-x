import { MummySprite } from '../../visuals/MummySprite';
import React, { useRef, useState, useEffect } from 'react';
import { Position, MummyEntity, Gate, KeyItem, TrapItem, Direction, MummyThreatPath, GridPaletteTheme } from './types';
import { GRID_PALETTES } from './palettes';
import { hasWallBetween } from './levels';
import { Eye, EyeOff, Skull, Lightbulb } from 'lucide-react';

export interface HintCellHighlight {
  pos: Position;
  dir: Direction;
  isWait: boolean;
  reason: string;
  isWinningMove?: boolean;
}

interface MummyEscapeBoardProps {
  playerPos: Position;
  playerFacing: Direction;
  mummies: MummyEntity[];
  hWalls: Array<[number, number]>;
  vWalls: Array<[number, number]>;
  gates: Gate[];
  keys: KeyItem[];
  traps: TrapItem[];
  exitPos: Position;
  exitDirection?: Direction;
  gridSize?: { cols: number; rows: number };
  isGameOver: boolean;
  isVictory: boolean;
  threatPaths?: MummyThreatPath[];
  showWarningPaths?: boolean;
  onToggleWarningPaths?: () => void;
  shakeEffect?: 'none' | 'caught' | 'crush' | 'trap';
  shakeNonce?: number;
  hintCell?: HintCellHighlight | null;
  palette?: GridPaletteTheme;
  showWatermarks?: boolean;
  onMove: (dir: Direction) => void;
}

interface SandBurstEffect {
  id: number;
  x: number;
  y: number;
  kind: 'step' | 'crush' | 'trap' | 'caught';
}

export const MummyEscapeBoard: React.FC<MummyEscapeBoardProps> = ({
  playerPos,
  playerFacing,
  mummies,
  hWalls,
  vWalls,
  gates,
  keys,
  traps,
  exitPos,
  gridSize = { cols: 6, rows: 6 },
  isGameOver,
  isVictory,
  threatPaths = [],
  showWarningPaths = true,
  onToggleWarningPaths,
  shakeEffect = 'none',
  shakeNonce = 0,
  hintCell,
  palette = GRID_PALETTES.classic_sand,
  showWatermarks = true,
  onMove,
}) => {
  const boardRef = useRef<HTMLDivElement>(null);
  const touchStartRef = useRef<{ x: number; y: number } | null>(null);
  const [activeShake, setActiveShake] = useState<'none' | 'caught' | 'crush' | 'trap'>('none');
  const [sandBursts, setSandBursts] = useState<SandBurstEffect[]>([]);
  const prevPlayerPosRef = useRef<Position>(playerPos);

  const cols = gridSize?.cols || 6;
  const rows = gridSize?.rows || 6;
  const cellWidthPercent = 100 / cols;
  const cellHeightPercent = 100 / rows;
  const totalTiles = cols * rows;

  // Spawn sand dust puffs whenever explorer moves
  useEffect(() => {
    const prev = prevPlayerPosRef.current;
    if (prev.x !== playerPos.x || prev.y !== playerPos.y) {
      const id = Date.now() + Math.random();
      setSandBursts((cur) => [...cur.slice(-5), { id, x: prev.x, y: prev.y, kind: 'step' }]);
      prevPlayerPosRef.current = playerPos;
      const timer = setTimeout(() => {
        setSandBursts((cur) => cur.filter((b) => b.id !== id));
      }, 420);
      return () => clearTimeout(timer);
    }
  }, [playerPos]);

  // Screen-Shake & Tomb Impact Burst on mummy crush, caught, or trap triggers
  useEffect(() => {
    if (shakeEffect !== 'none' && shakeNonce > 0) {
      setActiveShake(shakeEffect);
      const id = Date.now() + Math.random();
      const targetPos =
        shakeEffect === 'caught'
          ? playerPos
          : mummies.find((m) => !m.alive) || mummies[0] || playerPos;
      setSandBursts((cur) => [
        ...cur.slice(-5),
        { id, x: targetPos.x, y: targetPos.y, kind: shakeEffect },
      ]);
      const timer = setTimeout(() => {
        setActiveShake('none');
        setSandBursts((cur) => cur.filter((b) => b.id !== id));
      }, shakeEffect === 'caught' ? 680 : shakeEffect === 'crush' ? 580 : 450);
      return () => clearTimeout(timer);
    }
  }, [shakeEffect, shakeNonce, playerPos, mummies]);

  // Swipe gesture handling on board
  const handleTouchStart = (e: React.TouchEvent) => {
    if (e.touches.length > 0) {
      touchStartRef.current = {
        x: e.touches[0].clientX,
        y: e.touches[0].clientY,
      };
    }
  };

  const handleTouchEnd = (e: React.TouchEvent) => {
    if (!touchStartRef.current || e.changedTouches.length === 0) return;
    const endX = e.changedTouches[0].clientX;
    const endY = e.changedTouches[0].clientY;
    const dx = endX - touchStartRef.current.x;
    const dy = endY - touchStartRef.current.y;
    const absDx = Math.abs(dx);
    const absDy = Math.abs(dy);

    const minSwipeDistance = 24;

    if (Math.max(absDx, absDy) > minSwipeDistance) {
      if (absDx > absDy) {
        onMove(dx > 0 ? 'right' : 'left');
      } else {
        onMove(dy > 0 ? 'down' : 'up');
      }
    }
    touchStartRef.current = null;
  };

  // Check valid adjacent moves from current player pos for clickable hints
  const getWalkableNeighbors = () => {
    const directions: Array<{ dir: Direction; dx: number; dy: number }> = [
      { dir: 'up', dx: 0, dy: -1 },
      { dir: 'down', dx: 0, dy: 1 },
      { dir: 'left', dx: -1, dy: 0 },
      { dir: 'right', dx: 1, dy: 0 },
    ];

    return directions.filter(({ dx, dy }) => {
      const targetX = playerPos.x + dx;
      const targetY = playerPos.y + dy;
      if (targetX < 0 || targetX >= cols || targetY < 0 || targetY >= rows) return false;
      return !hasWallBetween(playerPos.x, playerPos.y, targetX, targetY, hWalls, vWalls, gates, cols, rows);
    });
  };

  const walkableNeighbors = getWalkableNeighbors();

  // Handle cell click
  const handleCellClick = (x: number, y: number) => {
    if (isGameOver || isVictory) return;
    if (x === playerPos.x && y === playerPos.y) {
      onMove('wait');
      return;
    }

    const neighbor = walkableNeighbors.find(
      (n) => playerPos.x + n.dx === x && playerPos.y + n.dy === y
    );
    if (neighbor) {
      onMove(neighbor.dir);
    }
  };

  // Identify nearest threat path for prominent styling
  const nearestThreat = threatPaths.find((t) => t.isNearest);

  return (
    <div className="mummy-board-shell relative flex flex-col items-center justify-center select-none w-full max-w-[520px] mx-auto p-1">
      {/* Ancient Egyptian Temple Pylon & Winged Sun Lintel Frieze */}
      <div className="w-full bg-gradient-to-b from-[#4a3219] via-[#33210f] to-[#221509] border-2 border-[#c8963e] rounded-t-2xl px-3 py-2 flex items-center justify-between shadow-[0_6px_20px_rgba(0,0,0,0.7),inset_0_1px_0_rgba(254,240,138,0.35)] relative overflow-hidden">
        {/* Carved Hieroglyph Background Strip */}
        <div className="pointer-events-none absolute inset-0 flex items-center justify-center opacity-15 text-amber-200 text-xs tracking-[0.45em] font-serif">
          𓂀 𓋹 𓆣 𓁹 𓊽 𓅃 𓆗 𓂀 𓋹 𓆣
        </div>

        {/* Left Flickering Wall Torch + Chamber Dimension */}
        <div className="flex items-center gap-2 relative z-10">
          <div className="w-7 h-7 shrink-0 drop-shadow-[0_0_8px_rgba(249,115,22,0.85)] animate-pulse">
            <MummySprite kind="torch" />
          </div>
          <div>
            <span className="text-[11px] sm:text-xs font-serif font-black text-[#fde68a] tracking-wider uppercase drop-shadow block leading-tight">
              ĐIỆN THỜ PHARAOH ({cols}×{rows})
            </span>
            <span className="text-[9px] text-amber-300/75 font-medium block">
              Chạm ô sáng hoặc vuốt để hành quân
            </span>
          </div>
        </div>

        {/* Eye of Horus Warning Path Radar Toggle + Right Wall Torch */}
        <div className="flex items-center gap-2 relative z-10">
          {onToggleWarningPaths && (
            <button
              type="button"
              onClick={onToggleWarningPaths}
              id="btn-toggle-warning-radar"
              title="Bật/Tắt Con Mắt Horus dự đoán bước đi của xác ướp"
              className={`px-2.5 py-1 rounded-xl text-[10px] font-black flex items-center gap-1.5 border transition-all cursor-pointer ${
                showWarningPaths
                  ? 'bg-gradient-to-r from-amber-700/90 to-rose-900/90 border-yellow-400/70 text-yellow-100 shadow-[0_0_12px_rgba(245,158,11,0.45)]'
                  : 'bg-black/50 border-amber-900/60 text-amber-300/60 hover:text-amber-200'
              }`}
            >
              {showWarningPaths ? (
                <>
                  <Eye className="w-3.5 h-3.5 text-yellow-300 animate-pulse" />
                  <span>MẮT HORUS: BẬT</span>
                </>
              ) : (
                <>
                  <EyeOff className="w-3.5 h-3.5 text-stone-400" />
                  <span>MẮT HORUS: TẮT</span>
                </>
              )}
            </button>
          )}

          <div className="w-7 h-7 shrink-0 drop-shadow-[0_0_8px_rgba(249,115,22,0.85)] animate-pulse">
            <MummySprite kind="torch" />
          </div>
        </div>
      </div>

      {/* Outer Sandstone Temple Pillars Frame */}
      <div className="relative w-full p-2 sm:p-2.5 bg-gradient-to-b from-[#3b2713] via-[#26180b] to-[#1a1007] border-x-2 border-b-2 border-[#c8963e] rounded-b-2xl shadow-[0_20px_50px_rgba(0,0,0,0.85),inset_0_0_24px_rgba(0,0,0,0.8)]">
        {/* Corner Golden Cartouche Rivets */}
        <span className="pointer-events-none absolute top-1 left-1.5 text-[10px] text-amber-400/70">𓋹</span>
        <span className="pointer-events-none absolute top-1 right-1.5 text-[10px] text-amber-400/70">𓋹</span>
        <span className="pointer-events-none absolute bottom-1 left-1.5 text-[10px] text-amber-400/70">𓆣</span>
        <span className="pointer-events-none absolute bottom-1 right-1.5 text-[10px] text-amber-400/70">𓆣</span>

        {/* Main Chamber Grid with Dynamic Screen-Shake & Custom Palette */}
        <div
          ref={boardRef}
          id="mummy-maze-grid-container"
          onTouchStart={handleTouchStart}
          onTouchEnd={handleTouchEnd}
          className={`arcade-board relative w-full aspect-square border-4 rounded-xl shadow-2xl overflow-hidden touch-none transition-all duration-75 ${
            activeShake === 'caught'
              ? 'border-rose-600 animate-[bounce_0.14s_infinite] scale-[0.97] ring-4 ring-rose-500/80'
              : activeShake === 'crush'
              ? 'border-amber-400 animate-[pulse_0.14s_infinite] scale-[0.98] ring-4 ring-amber-400/80'
              : activeShake === 'trap'
              ? 'border-red-500 scale-[0.99] translate-x-1'
              : ''
          }`}
          style={{
            backgroundColor: palette.boardBg,
            borderColor: activeShake === 'none' ? palette.boardBorder : undefined,
            boxShadow:
              activeShake === 'caught'
                ? 'inset 0 0 55px rgba(225,29,72,0.85), 0 0 30px rgba(225,29,72,0.6)'
                : activeShake === 'crush'
                ? 'inset 0 0 45px rgba(245,158,11,0.85), 0 0 25px rgba(245,158,11,0.5)'
                : `inset 0 0 42px rgba(0,0,0,0.68), 0 10px 25px rgba(0,0,0,0.85), 0 0 15px ${palette.glowColor}`,
          }}
        >
          {/* Carved Sandstone Floor Slabs */}
          <div
            className="absolute inset-0 grid pointer-events-none"
            style={{
              gridTemplateColumns: `repeat(${cols}, minmax(0, 1fr))`,
              gridTemplateRows: `repeat(${rows}, minmax(0, 1fr))`,
            }}
          >
            {Array.from({ length: totalTiles }).map((_, idx) => {
              const row = Math.floor(idx / cols);
              const col = idx % cols;
              const isDark = (row + col) % 2 === 1;
              const glyphList = ['𓂀', '𓋹', '𓆣', '𓁹', '𓊽', '𓅃'];
              const glyph = glyphList[(row * 3 + col) % glyphList.length];

              return (
                <div
                  key={`tile-${idx}`}
                  className="relative transition-colors"
                  style={{
                    backgroundColor: isDark ? palette.tileDark : palette.tileLight,
                    borderColor: palette.tileBorder,
                    borderWidth: '1px',
                    borderStyle: 'solid',
                    boxShadow: isDark
                      ? 'inset 0 2px 4px rgba(0,0,0,0.32), inset 0 -1px 1px rgba(255,255,255,0.08)'
                      : 'inset 0 1px 2px rgba(255,255,255,0.28), inset 0 -2px 4px rgba(68,42,14,0.25)',
                  }}
                >
                  {/* Inner Stone Slab Bevel */}
                  <div className="absolute inset-[3px] border border-black/10 rounded-[3px] pointer-events-none" />

                  {/* Subtle Engraved Hieroglyphic Relief */}
                  {showWatermarks && (idx % 2 === 0 || idx === Math.floor(totalTiles / 2)) && (
                    <div
                      className="absolute inset-0 flex items-center justify-center text-sm sm:text-base font-bold pointer-events-none select-none"
                      style={{ color: palette.watermarkColor }}
                    >
                      {glyph}
                    </div>
                  )}
                </div>
              );
            })}
          </div>

          {/* Ancient Temple Exit Staircase Portal */}
          <div
            id="exit-stairs"
            className="absolute z-10 flex flex-col items-center justify-center transition-all duration-300 pointer-events-none p-0.5"
            style={{
              left: `${exitPos.x * cellWidthPercent}%`,
              top: `${exitPos.y * cellHeightPercent}%`,
              width: `${cellWidthPercent}%`,
              height: `${cellHeightPercent}%`,
            }}
          >
            <div className="relative w-full h-full flex flex-col items-center justify-center rounded-xl bg-gradient-to-b from-emerald-500/25 via-teal-900/45 to-amber-950/80 border-2 border-emerald-400/90 shadow-[0_0_20px_rgba(16,185,129,0.7)]">
              <div className="w-[86%] h-[86%]">
                <MummySprite kind="exit_portal" />
              </div>
              <span className="absolute bottom-0.5 text-[8px] font-black text-emerald-200 uppercase tracking-tighter bg-black/80 px-1.5 rounded border border-emerald-400/50 shadow">
                Lối Thoát
              </span>
            </div>
          </div>

          {/* VISUAL 'WARNING' PATH INDICATOR ON THE GRID (Eye of Horus Radar) */}
          {showWarningPaths && !isGameOver && !isVictory && (
            <svg className="absolute inset-0 w-full h-full z-15 pointer-events-none overflow-visible">
              <defs>
                <marker
                  id="arrowhead-threat"
                  markerWidth="6"
                  markerHeight="6"
                  refX="3"
                  refY="3"
                  orient="auto"
                >
                  <polygon points="0 0, 6 3, 0 6" fill="#ef4444" />
                </marker>
                <marker
                  id="arrowhead-nearest"
                  markerWidth="8"
                  markerHeight="8"
                  refX="4"
                  refY="4"
                  orient="auto"
                >
                  <polygon points="0 0, 8 4, 0 8" fill="#dc2626" />
                </marker>
              </defs>

              {threatPaths.map((threat) => {
                if (threat.steps.length === 0) return null;
                const isNearest = threat.isNearest;
                const isWhite = threat.type === 'white';
                const isRed = threat.type === 'red';
                const lineColor = threat.willCatchPlayer
                  ? '#dc2626'
                  : isRed
                  ? '#e11d48'
                  : isWhite
                  ? '#38bdf8'
                  : '#f59e0b';

                return (
                  <g key={`threat-svg-${threat.mummyId}`}>
                    {threat.steps.map((step, sIdx) => {
                      const fromX = (step.from.x + 0.5) * cellWidthPercent;
                      const fromY = (step.from.y + 0.5) * cellHeightPercent;
                      const toX = (step.to.x + 0.5) * cellWidthPercent;
                      const toY = (step.to.y + 0.5) * cellHeightPercent;

                      return (
                        <line
                          key={`step-line-${threat.mummyId}-${sIdx}`}
                          x1={`${fromX}%`}
                          y1={`${fromY}%`}
                          x2={`${toX}%`}
                          y2={`${toY}%`}
                          stroke={lineColor}
                          strokeWidth={isNearest ? '3.5' : '2.5'}
                          strokeDasharray={isNearest ? '4,3' : '3,3'}
                          strokeLinecap="round"
                          opacity={isNearest ? 0.95 : 0.75}
                          markerEnd={isNearest ? 'url(#arrowhead-nearest)' : 'url(#arrowhead-threat)'}
                        />
                      );
                    })}
                  </g>
                );
              })}
            </svg>
          )}

          {/* VISUAL DANGER TILES & WARNING HAZARD BOXES */}
          {showWarningPaths && !isGameOver && !isVictory && (
            <div className="absolute inset-0 z-18 pointer-events-none">
              {threatPaths.map((threat) => {
                if (threat.steps.length === 0) return null;
                const final = threat.finalPos;
                const willCatch = threat.willCatchPlayer;
                const isNearest = threat.isNearest;

                return (
                  <React.Fragment key={`danger-tile-group-${threat.mummyId}`}>
                    {threat.steps.map((step, sIdx) => (
                      <div
                        key={`step-marker-${threat.mummyId}-${sIdx}`}
                        className="absolute flex items-center justify-center transition-all"
                        style={{
                          left: `${step.to.x * cellWidthPercent}%`,
                          top: `${step.to.y * cellHeightPercent}%`,
                          width: `${cellWidthPercent}%`,
                          height: `${cellHeightPercent}%`,
                        }}
                      >
                        <div
                          className={`w-5 h-5 rounded-full flex items-center justify-center border font-mono font-black text-[9px] shadow-lg ${
                            willCatch
                              ? 'bg-red-600/90 border-red-300 text-white animate-bounce'
                              : isNearest
                              ? 'bg-rose-950/90 border-rose-400 text-rose-200'
                              : 'bg-black/75 border-amber-400 text-amber-200'
                          }`}
                        >
                          {step.stepIndex}
                        </div>
                      </div>
                    ))}

                    <div
                      className="absolute flex items-center justify-center transition-all"
                      style={{
                        left: `${final.x * cellWidthPercent}%`,
                        top: `${final.y * cellHeightPercent}%`,
                        width: `${cellWidthPercent}%`,
                        height: `${cellHeightPercent}%`,
                      }}
                    >
                      <div
                        className={`w-[90%] h-[90%] rounded-xl border-2 flex flex-col items-center justify-center transition-all ${
                          willCatch
                            ? 'bg-red-600/40 border-red-500 shadow-[0_0_20px_rgba(239,68,68,0.9)] animate-pulse'
                            : isNearest
                            ? 'bg-rose-900/30 border-rose-500/70 shadow-[0_0_10px_rgba(244,63,94,0.5)]'
                            : 'bg-amber-900/20 border-amber-500/50'
                        }`}
                      >
                        {willCatch && (
                          <div className="flex items-center gap-0.5 bg-red-950/90 px-1 py-0.2 rounded border border-red-400 animate-pulse">
                            <Skull className="w-3 h-3 text-red-400 shrink-0" />
                            <span className="text-[7px] font-black text-red-200 uppercase">NGUY CƠ!</span>
                          </div>
                        )}
                      </div>
                    </div>
                  </React.Fragment>
                );
              })}
            </div>
          )}

          {/* Interactive Clickable Grid overlay & Golden Scarab Footstep Indicators */}
          <div
            className="absolute inset-0 grid z-20"
            style={{
              gridTemplateColumns: `repeat(${cols}, minmax(0, 1fr))`,
              gridTemplateRows: `repeat(${rows}, minmax(0, 1fr))`,
            }}
          >
            {Array.from({ length: totalTiles }).map((_, idx) => {
              const x = idx % cols;
              const y = Math.floor(idx / cols);
              const isPlayer = x === playerPos.x && y === playerPos.y;
              const isWalkable = walkableNeighbors.some(
                (n) => playerPos.x + n.dx === x && playerPos.y + n.dy === y
              );
              const isHinted = hintCell && hintCell.pos.x === x && hintCell.pos.y === y;

              return (
                <button
                  key={`click-tile-${x}-${y}`}
                  type="button"
                  id={`grid-cell-${x}-${y}`}
                  onClick={() => handleCellClick(x, y)}
                  aria-label={`Ô (${x + 1}, ${y + 1})`}
                  className={`w-full h-full relative cursor-pointer focus:outline-none transition-all ${
                    isHinted
                      ? 'ring-2 ring-yellow-400 bg-yellow-400/20'
                      : isWalkable
                      ? 'hover:bg-amber-400/25 active:bg-amber-400/40'
                      : isPlayer
                      ? 'cursor-pointer hover:bg-white/15'
                      : 'cursor-default'
                  }`}
                >
                  {isWalkable && !isHinted && (
                    <div className="absolute inset-0 flex items-center justify-center pointer-events-none">
                      <div className="w-3.5 h-3.5 rounded-full bg-amber-400/80 border-2 border-yellow-100 shadow-[0_0_10px_rgba(245,158,11,0.9)] animate-pulse" />
                    </div>
                  )}
                </button>
              );
            })}
          </div>

          {/* HINT SAFEST CELL HIGHLIGHT OVERLAY */}
          {hintCell && !isGameOver && !isVictory && (
            <div
              id="hint-safest-cell"
              className="absolute z-28 flex items-center justify-center pointer-events-none transition-all duration-300"
              style={{
                left: `${hintCell.pos.x * cellWidthPercent}%`,
                top: `${hintCell.pos.y * cellHeightPercent}%`,
                width: `${cellWidthPercent}%`,
                height: `${cellHeightPercent}%`,
              }}
            >
              <div className="absolute inset-1 rounded-xl bg-gradient-to-br from-yellow-400/35 via-amber-300/25 to-cyan-400/35 border-2 border-yellow-300 shadow-[0_0_25px_rgba(250,204,21,0.9),inset_0_0_15px_rgba(250,204,21,0.6)] animate-pulse" />
              <div className="absolute inset-0 rounded-2xl border-2 border-cyan-300/80 animate-ping opacity-60 pointer-events-none" />

              <div className="relative z-10 flex flex-col items-center justify-center">
                <div className="flex items-center gap-1 bg-gradient-to-r from-amber-950 via-black to-amber-950 px-1.5 py-0.5 rounded-full border border-yellow-300 shadow-xl">
                  <Lightbulb className="w-3 h-3 text-yellow-300 animate-bounce" />
                  <span className="text-[8px] font-black text-yellow-200 uppercase tracking-tight whitespace-nowrap">
                    {hintCell.isWinningMove
                      ? '🏆 THOÁT NGAY'
                      : hintCell.isWait
                      ? '🛑 ĐỨNG YÊN'
                      : `👉 ${
                          hintCell.dir === 'up'
                            ? 'LÊN'
                            : hintCell.dir === 'down'
                            ? 'XUỐNG'
                            : hintCell.dir === 'left'
                            ? 'TRÁI'
                            : 'PHẢI'
                        }`}
                  </span>
                </div>
                <div className="text-[7px] font-bold text-amber-200/90 bg-black/80 px-1 rounded mt-0.5 tracking-tighter max-w-[90px] truncate text-center shadow">
                  {hintCell.isWinningMove ? 'Chiến thắng!' : 'Ô an toàn nhất'}
                </div>
              </div>
            </div>
          )}

          {/* Traps (Quicksand Pit / Iron Spikes / Golden Sarcophagus) */}
          {traps.map((trap) => (
            <div
              key={trap.id}
              className="absolute z-10 flex items-center justify-center pointer-events-none p-0.5"
              style={{
                left: `${trap.x * cellWidthPercent}%`,
                top: `${trap.y * cellHeightPercent}%`,
                width: `${cellWidthPercent}%`,
                height: `${cellHeightPercent}%`,
              }}
            >
              <div className="relative w-[92%] h-[92%] flex flex-col items-center justify-center">
                <MummySprite
                  kind={trap.type === 'pit' ? 'pit' : trap.type === 'spikes' ? 'spikes' : 'sarcophagus'}
                />
                <span className="absolute bottom-0 text-[7px] font-black text-amber-200 bg-black/80 px-1 rounded border border-red-500/40 uppercase tracking-tighter">
                  {trap.type === 'pit' ? 'HỐ CÁT' : trap.type === 'spikes' ? 'BÀN CHÔNG' : 'QUAN TÀI'}
                </span>
              </div>
            </div>
          ))}

          {/* Keys (Golden Ankh / Ruby Ankh) */}
          {keys.map((key) => {
            if (key.collected) return null;
            return (
              <div
                key={key.id}
                className="absolute z-12 flex items-center justify-center pointer-events-none animate-bounce"
                style={{
                  left: `${key.x * cellWidthPercent}%`,
                  top: `${key.y * cellHeightPercent}%`,
                  width: `${cellWidthPercent}%`,
                  height: `${cellHeightPercent}%`,
                }}
              >
                <div
                  className={`w-[82%] h-[82%] rounded-full flex items-center justify-center p-1 ${
                    key.color === 'yellow'
                      ? 'drop-shadow-[0_0_12px_rgba(250,204,21,0.9)]'
                      : 'drop-shadow-[0_0_12px_rgba(244,63,94,0.9)]'
                  }`}
                >
                  <MummySprite kind={key.color === 'yellow' ? 'key_yellow' : 'key_red'} />
                </div>
              </div>
            );
          })}

          {/* Gates (Carved Ankh Laser/Stone Barrier) */}
          {gates.map((gate) => {
            const isHoriz = gate.y1 === gate.y2;
            const gateColor = gate.color === 'yellow' ? '#f59e0b' : '#e11d48';
            const borderColor = gate.color === 'yellow' ? '#fef08a' : '#fda4af';

            if (isHoriz) {
              const minX = Math.min(gate.x1, gate.x2);
              return (
                <div
                  key={gate.id}
                  className={`absolute z-25 transition-all duration-300 pointer-events-none rounded-full ${
                    gate.isOpen ? 'opacity-20 scale-y-50' : 'opacity-100'
                  }`}
                  style={{
                    left: `${(minX + 1) * cellWidthPercent - 2.2}%`,
                    top: `${gate.y1 * cellHeightPercent + 4}%`,
                    width: '4.4%',
                    height: `${cellHeightPercent - 8}%`,
                    background: gate.isOpen
                      ? '#10b981'
                      : `linear-gradient(180deg, ${borderColor}, ${gateColor}, #451a03)`,
                    border: `1.5px solid ${borderColor}`,
                    boxShadow: gate.isOpen ? 'none' : `0 0 12px ${gateColor}`,
                  }}
                />
              );
            } else {
              const minY = Math.min(gate.y1, gate.y2);
              return (
                <div
                  key={gate.id}
                  className={`absolute z-25 transition-all duration-300 pointer-events-none rounded-full ${
                    gate.isOpen ? 'opacity-20 scale-x-50' : 'opacity-100'
                  }`}
                  style={{
                    left: `${gate.x1 * cellWidthPercent + 4}%`,
                    top: `${(minY + 1) * cellHeightPercent - 2.2}%`,
                    width: `${cellWidthPercent - 8}%`,
                    height: '4.4%',
                    background: gate.isOpen
                      ? '#10b981'
                      : `linear-gradient(90deg, ${borderColor}, ${gateColor}, #451a03)`,
                    border: `1.5px solid ${borderColor}`,
                    boxShadow: gate.isOpen ? 'none' : `0 0 12px ${gateColor}`,
                  }}
                />
              );
            }
          })}

          {/* 3D Beveled Sandstone Horizontal Walls with Golden Cartouche Trim */}
          {hWalls.map(([wx, wy], idx) => (
            <div
              key={`hwall-${idx}-${wx}-${wy}`}
              className="absolute z-25 rounded-sm pointer-events-none"
              style={{
                left: `${wx * cellWidthPercent - 1}%`,
                top: `${(wy + 1) * cellHeightPercent - 2.6}%`,
                width: `${cellWidthPercent + 2}%`,
                height: '5.2%',
                background: `linear-gradient(180deg, ${palette.wallHighlight} 0%, ${palette.wallBg} 55%, ${palette.wallShadow} 100%)`,
                borderTop: '2px solid #f5d087',
                borderBottom: `2px solid ${palette.wallShadow}`,
                boxShadow: '0 4px 8px rgba(0,0,0,0.8)',
              }}
            />
          ))}

          {/* 3D Beveled Sandstone Vertical Walls with Golden Cartouche Trim */}
          {vWalls.map(([wx, wy], idx) => (
            <div
              key={`vwall-${idx}-${wx}-${wy}`}
              className="absolute z-25 rounded-sm pointer-events-none"
              style={{
                left: `${(wx + 1) * cellWidthPercent - 2.6}%`,
                top: `${wy * cellHeightPercent - 1}%`,
                width: '5.2%',
                height: `${cellHeightPercent + 2}%`,
                background: `linear-gradient(90deg, ${palette.wallHighlight} 0%, ${palette.wallBg} 55%, ${palette.wallShadow} 100%)`,
                borderLeft: '2px solid #f5d087',
                borderRight: `2px solid ${palette.wallShadow}`,
                boxShadow: '4px 0 8px rgba(0,0,0,0.8)',
              }}
            />
          ))}

          {/* Animated Sand Dust Puffs & Mummy Collision Shockwaves */}
          {sandBursts.map((burst) => (
            <div
              key={burst.id}
              className="absolute z-28 pointer-events-none flex items-center justify-center"
              style={{
                left: `${burst.x * cellWidthPercent}%`,
                top: `${burst.y * cellHeightPercent}%`,
                width: `${cellWidthPercent}%`,
                height: `${cellHeightPercent}%`,
              }}
            >
              {burst.kind === 'step' ? (
                <div className="w-3/5 h-3/5 rounded-full bg-amber-300/35 blur-[3px] animate-ping" />
              ) : (
                <div className="relative w-full h-full flex items-center justify-center">
                  <div className="absolute inset-0 rounded-full border-4 border-amber-400 animate-ping" />
                  <div className="w-4/5 h-4/5 rounded-full bg-gradient-to-r from-amber-500/70 via-red-500/70 to-yellow-300/70 blur-sm animate-pulse" />
                </div>
              )}
            </div>
          ))}

          {/* Living Mummies & Scorpions with HD 2D Sprites & Smooth Sliding */}
          {mummies.map((mummy) => {
            if (!mummy.alive) return null;
            const isWhite = mummy.type === 'white';
            const isRed = mummy.type === 'red';
            const isNearest = nearestThreat?.mummyId === mummy.id;
            const facing = mummy.facing || 'down';

            const tiltRotate =
              facing === 'left'
                ? '-rotate-6 scale-x-[-1]'
                : facing === 'right'
                ? 'rotate-6'
                : facing === 'up'
                ? '-translate-y-0.5'
                : 'translate-y-0.5';

            return (
              <div
                key={mummy.id}
                className="absolute z-30 flex items-center justify-center pointer-events-none transition-transform will-change-transform"
                style={{
                  top: 0,
                  left: 0,
                  width: `${cellWidthPercent}%`,
                  height: `${cellHeightPercent}%`,
                  transform: `translate3d(${mummy.x * 100}%, ${mummy.y * 100}%, 0)`,
                  transition: 'transform 260ms cubic-bezier(0.22, 1, 0.36, 1)',
                }}
              >
                <div
                  className={`relative w-[92%] h-[92%] flex flex-col items-center justify-center transition-transform duration-200 ${tiltRotate} ${
                    isNearest ? 'drop-shadow-[0_0_12px_rgba(239,68,68,0.85)]' : ''
                  }`}
                >
                  <div className="w-full h-full animate-[pulse_2.4s_ease-in-out_infinite]">
                    <MummySprite kind={isWhite ? 'white' : isRed ? 'red' : 'scorpion'} />
                  </div>
                  <span
                    className={`absolute -bottom-0.5 text-[7px] font-black uppercase px-1 rounded tracking-tighter border shadow ${
                      isWhite
                        ? 'bg-slate-900/90 text-cyan-300 border-cyan-400/50'
                        : isRed
                        ? 'bg-rose-950/90 text-yellow-200 border-amber-400/60'
                        : 'bg-amber-950/90 text-amber-200 border-yellow-400/50'
                    }`}
                  >
                    {isWhite ? 'X.Ướp Trắng' : isRed ? 'X.Ướp Đỏ' : 'Bọ Cạp Vàng'}
                  </span>
                </div>
              </div>
            );
          })}

          {/* Player Explorer Archaeologist with Torch Aura & Smooth Sliding */}
          <div
            id="player-explorer"
            className="absolute z-35 flex items-center justify-center pointer-events-none transition-transform will-change-transform"
            style={{
              top: 0,
              left: 0,
              width: `${cellWidthPercent}%`,
              height: `${cellHeightPercent}%`,
              transform: `translate3d(${playerPos.x * 100}%, ${playerPos.y * 100}%, 0)`,
              transition: 'transform 240ms cubic-bezier(0.22, 1, 0.36, 1)',
            }}
          >
            {/* Dynamic Warm Torchlight Aura Around Explorer */}
            <div className="absolute inset-[-28%] rounded-full bg-amber-400/20 blur-md pointer-events-none animate-pulse" />

            <div
              className={`relative w-[92%] h-[92%] flex flex-col items-center justify-center transition-transform duration-150 ${
                playerFacing === 'left'
                  ? 'scale-x-[-1]'
                  : playerFacing === 'right'
                  ? 'scale-105'
                  : playerFacing === 'up'
                  ? '-translate-y-0.5 scale-105'
                  : 'translate-y-0.5 scale-105'
              } ${isVictory ? 'animate-bounce' : isGameOver ? 'opacity-75 rotate-45 grayscale' : ''}`}
            >
              <div className="w-full h-full drop-shadow-[0_6px_10px_rgba(0,0,0,0.75)]">
                <MummySprite kind="explorer" />
              </div>
              <span className="absolute -bottom-0.5 text-[7px] font-black text-amber-950 uppercase tracking-tighter bg-gradient-to-r from-yellow-200 to-amber-400 px-1.5 rounded border border-amber-900 shadow">
                Thám Hiểm
              </span>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
};
