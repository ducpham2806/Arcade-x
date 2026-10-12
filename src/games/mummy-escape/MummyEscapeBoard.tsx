import { MummySprite } from '../../visuals/MummySprite';
import React, { useRef, useState, useEffect } from 'react';
import { Position, MummyEntity, Gate, KeyItem, TrapItem, Direction, MummyThreatPath, GridPaletteTheme } from './types';
import { GRID_PALETTES } from './palettes';
import { hasWallBetween } from './levels';
import { Flame, Sparkles, ShieldAlert, Eye, EyeOff, Skull, AlertTriangle, Lightbulb, Compass } from 'lucide-react';

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

  const cols = gridSize?.cols || 6;
  const rows = gridSize?.rows || 6;
  const cellWidthPercent = 100 / cols;
  const cellHeightPercent = 100 / rows;
  const totalTiles = cols * rows;

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

  // Screen-Shake Animation Trigger on mummy crush, caught, or trap triggers
  useEffect(() => {
    if (shakeEffect !== 'none' && shakeNonce > 0) {
      setActiveShake(shakeEffect);
      const timer = setTimeout(() => {
        setActiveShake('none');
      }, shakeEffect === 'caught' ? 650 : shakeEffect === 'crush' ? 500 : 350);
      return () => clearTimeout(timer);
    }
  }, [shakeEffect, shakeNonce]);

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
    <div className="mummy-board-shell relative flex flex-col items-center justify-center select-none w-full max-w-[500px] mx-auto p-1 sm:p-2">
      {/* Ancient Egyptian Tomb Chamber Top Hieroglyphic Frieze with Torches & Warning Radar Toggle */}
      <div className="w-full bg-[#3a2818] border-2 border-[#8b6534] rounded-t-xl px-3 py-1.5 flex items-center justify-between shadow-inner relative overflow-hidden">
        {/* Left Torch with flame */}
        <div className="flex items-center gap-1.5">
          <div className="relative flex items-center justify-center">
            <Flame className="w-5 h-5 text-amber-500 animate-pulse" />
            <div className="absolute -top-1 w-2.5 h-2.5 bg-yellow-300 rounded-full blur-[2px] animate-ping opacity-75" />
          </div>
          <span className="text-[11px] font-black text-[#f1d07c] tracking-wider uppercase drop-shadow">
            🏛️ LĂNG MỘ ({cols}x{rows})
          </span>
        </div>

        {/* Warning Path Indicator Toggle */}
        <div className="flex items-center gap-2">
          {onToggleWarningPaths && (
            <button
              type="button"
              onClick={onToggleWarningPaths}
              id="btn-toggle-warning-radar"
              title="Bật/Tắt đường cảnh báo bước đi của xác ướp"
              className={`px-2 py-0.5 rounded-lg text-[10px] font-bold flex items-center gap-1 border transition-all cursor-pointer ${
                showWarningPaths
                  ? 'bg-rose-950/80 border-rose-500/60 text-rose-200 shadow-[0_0_8px_rgba(244,63,94,0.4)]'
                  : 'bg-black/40 border-stone-700 text-stone-400 hover:text-stone-200'
              }`}
            >
              {showWarningPaths ? (
                <>
                  <Eye className="w-3 h-3 text-rose-400 animate-pulse" />
                  <span>Cảnh Báo: BẬT</span>
                </>
              ) : (
                <>
                  <EyeOff className="w-3 h-3 text-stone-400" />
                  <span>Cảnh Báo: TẮT</span>
                </>
              )}
            </button>
          )}

          {/* Right Torch with flame */}
          <div className="relative flex items-center justify-center">
            <Flame className="w-5 h-5 text-amber-500 animate-pulse" />
            <div className="absolute -top-1 w-2.5 h-2.5 bg-yellow-300 rounded-full blur-[2px] animate-ping opacity-75" />
          </div>
        </div>
      </div>

      {/* Main Chamber Grid with Dynamic Screen-Shake & Custom Palette */}
      <div
        ref={boardRef}
        id="mummy-maze-grid-container"
        onTouchStart={handleTouchStart}
        onTouchEnd={handleTouchEnd}
        className={`arcade-board relative w-full aspect-square border-4 rounded-b-xl shadow-2xl overflow-hidden touch-none transition-all duration-75 ${
          activeShake === 'caught'
            ? 'border-rose-600 animate-[bounce_0.15s_infinite] scale-[0.97] ring-4 ring-rose-500/80'
            : activeShake === 'crush'
            ? 'border-amber-400 animate-[pulse_0.15s_infinite] scale-[0.98] ring-4 ring-amber-400/80'
            : activeShake === 'trap'
            ? 'border-red-500 scale-[0.99] translate-x-1'
            : ''
        }`}
        style={{
          backgroundColor: palette.boardBg,
          borderColor: activeShake === 'none' ? palette.boardBorder : undefined,
          boxShadow:
            activeShake === 'caught'
              ? 'inset 0 0 50px rgba(225,29,72,0.8), 0 0 30px rgba(225,29,72,0.6)'
              : activeShake === 'crush'
              ? 'inset 0 0 40px rgba(245,158,11,0.8), 0 0 25px rgba(245,158,11,0.5)'
              : `inset 0 0 40px rgba(0,0,0,0.6), 0 10px 25px rgba(0,0,0,0.8), 0 0 15px ${palette.glowColor}`,
        }}
      >
        {/* Ambient Grid Texture Pattern */}
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
            return (
              <div
                key={`tile-${idx}`}
                className="relative transition-colors"
                style={{
                  backgroundColor: isDark ? palette.tileDark : palette.tileLight,
                  borderColor: palette.tileBorder,
                  borderWidth: '1px',
                  borderStyle: 'solid',
                }}
              >
                {/* Subtle hieroglyphic watermark in corners and center if enabled */}
                {showWatermarks &&
                  (idx === 0 ||
                    idx === cols - 1 ||
                    idx === totalTiles - cols ||
                    idx === totalTiles - 1 ||
                    (cols >= 6 && idx === Math.floor(totalTiles / 2))) && (
                    <div
                      className="absolute inset-0 flex items-center justify-center text-xs font-bold pointer-events-none transition-colors select-none"
                      style={{ color: palette.watermarkColor }}
                    >
                      {palette.watermarkSymbol}
                    </div>
                  )}
              </div>
            );
          })}
        </div>

        {/* Exit Stairs Doorway */}
        <div
          id="exit-stairs"
          className="absolute z-10 flex flex-col items-center justify-center transition-all duration-300 pointer-events-none"
          style={{
            left: `${exitPos.x * cellWidthPercent}%`,
            top: `${exitPos.y * cellHeightPercent}%`,
            width: `${cellWidthPercent}%`,
            height: `${cellHeightPercent}%`,
          }}
        >
          <div className="relative w-full h-full flex flex-col items-center justify-center bg-gradient-to-br from-emerald-600/40 via-teal-900/60 to-slate-950/80 border-2 border-emerald-400/80 rounded-lg shadow-[0_0_15px_rgba(52,211,153,0.6)] animate-pulse">
            <span className="text-xl">🪜</span>
            <span className="text-[9px] font-black text-emerald-300 uppercase tracking-tighter bg-black/60 px-1 rounded mt-0.5">
              Lối Thoát
            </span>
            <Sparkles className="w-3 h-3 text-emerald-300 absolute top-1 right-1 animate-spin" />
          </div>
        </div>

        {/* VISUAL 'WARNING' PATH INDICATOR ON THE GRID */}
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
                  {/* Intermediate Step Dots */}
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

                  {/* Final Destination Threat Zone */}
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

        {/* Interactive Clickable Grid overlay & Neighbor Highlights */}
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
                {/* Walkable indicator dot */}
                {isWalkable && !isHinted && (
                  <div className="absolute inset-0 flex items-center justify-center pointer-events-none">
                    <div className="w-3 h-3 rounded-full bg-amber-400/70 border border-amber-200 shadow-[0_0_8px_rgba(245,158,11,0.8)] animate-pulse" />
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
            {/* Glowing Beacon Rings */}
            <div className="absolute inset-1 rounded-xl bg-gradient-to-br from-yellow-400/35 via-amber-300/25 to-cyan-400/35 border-2 border-yellow-300 shadow-[0_0_25px_rgba(250,204,21,0.9),inset_0_0_15px_rgba(250,204,21,0.6)] animate-pulse" />
            <div className="absolute inset-0 rounded-2xl border-2 border-cyan-300/80 animate-ping opacity-60 pointer-events-none" />

            {/* Floating Hint Tag Banner */}
            <div className="relative z-10 flex flex-col items-center justify-center">
              <div className="flex items-center gap-1 bg-gradient-to-r from-amber-950 via-black to-amber-950 px-1.5 py-0.5 rounded-full border border-yellow-300 shadow-xl">
                <Lightbulb className="w-3 h-3 text-yellow-300 animate-bounce" />
                <span className="text-[8px] font-black text-yellow-200 uppercase tracking-tight whitespace-nowrap">
                  {hintCell.isWinningMove
                    ? '🏆 THOÁT NGAY'
                    : hintCell.isWait
                    ? '🛑 BỎ LƯỢT'
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

        {/* Traps (Pits / Spikes / Sarcophagi) */}
        {traps.map((trap) => (
          <div
            key={trap.id}
            className="absolute z-10 flex items-center justify-center pointer-events-none"
            style={{
              left: `${trap.x * cellWidthPercent}%`,
              top: `${trap.y * cellHeightPercent}%`,
              width: `${cellWidthPercent}%`,
              height: `${cellHeightPercent}%`,
            }}
          >
            <div className="w-4/5 h-4/5 rounded-lg bg-red-950/80 border-2 border-red-600/70 flex flex-col items-center justify-center shadow-inner">
              <span className="text-base">{trap.type === 'pit' ? '🕳️' : trap.type === 'spikes' ? '🗡️' : '⚰️'}</span>
              <span className="text-[8px] font-black text-red-300 uppercase tracking-tighter">
                {trap.type === 'pit' ? 'HỐ CÁT' : trap.type === 'spikes' ? 'BÀN CHÔNG' : 'QUAN TÀI'}
              </span>
            </div>
          </div>
        ))}

        {/* Keys (Golden Ankh / Red Key) */}
        {keys.map((key) => {
          if (key.collected) return null;
          return (
            <div
              key={key.id}
              className="absolute z-10 flex items-center justify-center pointer-events-none animate-bounce"
              style={{
                left: `${key.x * cellWidthPercent}%`,
                top: `${key.y * cellHeightPercent}%`,
                width: `${cellWidthPercent}%`,
                height: `${cellHeightPercent}%`,
              }}
            >
              <div
                className={`w-3/4 h-3/4 rounded-full flex flex-col items-center justify-center border-2 shadow-lg ${
                  key.color === 'yellow'
                    ? 'bg-amber-500/80 border-yellow-300 text-yellow-100 shadow-amber-500/50'
                    : 'bg-red-600/80 border-red-300 text-white shadow-red-500/50'
                }`}
              >
                <span className="text-lg">🗝️</span>
              </div>
            </div>
          );
        })}

        {/* Gates (Closed / Open Walls) */}
        {gates.map((gate) => {
          const isHoriz = gate.y1 === gate.y2;
          if (isHoriz) {
            const minX = Math.min(gate.x1, gate.x2);
            return (
              <div
                key={gate.id}
                className={`absolute z-25 transition-all duration-300 pointer-events-none ${
                  gate.isOpen ? 'opacity-25 bg-emerald-500 border-dashed' : 'opacity-100'
                }`}
                style={{
                  left: `${(minX + 1) * cellWidthPercent - 1.5}%`,
                  top: `${gate.y1 * cellHeightPercent}%`,
                  width: '3%',
                  height: `${cellHeightPercent}%`,
                  backgroundColor: gate.isOpen ? '#10b981' : gate.color === 'yellow' ? '#f59e0b' : '#ef4444',
                  boxShadow: gate.isOpen ? 'none' : '0 0 10px rgba(0,0,0,0.8)',
                }}
              >
                <div className="w-full h-full flex items-center justify-center">
                  <span className="text-[7px] font-bold text-white uppercase transform rotate-90">
                    {gate.isOpen ? 'MỞ' : 'CỔNG'}
                  </span>
                </div>
              </div>
            );
          } else {
            const minY = Math.min(gate.y1, gate.y2);
            return (
              <div
                key={gate.id}
                className={`absolute z-25 transition-all duration-300 pointer-events-none ${
                  gate.isOpen ? 'opacity-25 bg-emerald-500 border-dashed' : 'opacity-100'
                }`}
                style={{
                  left: `${gate.x1 * cellWidthPercent}%`,
                  top: `${(minY + 1) * cellHeightPercent - 1.5}%`,
                  width: `${cellWidthPercent}%`,
                  height: '3%',
                  backgroundColor: gate.isOpen ? '#10b981' : gate.color === 'yellow' ? '#f59e0b' : '#ef4444',
                  boxShadow: gate.isOpen ? 'none' : '0 0 10px rgba(0,0,0,0.8)',
                }}
              >
                <div className="w-full h-full flex items-center justify-center">
                  <span className="text-[7px] font-bold text-white uppercase">
                    {gate.isOpen ? 'MỞ' : 'CỔNG'}
                  </span>
                </div>
              </div>
            );
          }
        })}

        {/* Horizontal Walls */}
        {hWalls.map(([wx, wy], idx) => (
          <div
            key={`hwall-${idx}-${wx}-${wy}`}
            className="absolute z-25 rounded-sm pointer-events-none shadow-[0_3px_6px_rgba(0,0,0,0.7)]"
            style={{
              left: `${wx * cellWidthPercent}%`,
              top: `${(wy + 1) * cellHeightPercent - 2}%`,
              width: `${cellWidthPercent}%`,
              height: '4%',
              backgroundColor: palette.wallBg,
              borderTop: `2px solid ${palette.wallHighlight}`,
              borderBottom: `2px solid ${palette.wallShadow}`,
              boxShadow: `0 3px 6px rgba(0,0,0,0.7), 0 0 6px ${palette.glowColor}`,
            }}
          />
        ))}

        {/* Vertical Walls */}
        {vWalls.map(([wx, wy], idx) => (
          <div
            key={`vwall-${idx}-${wx}-${wy}`}
            className="absolute z-25 rounded-sm pointer-events-none shadow-[3px_0_6px_rgba(0,0,0,0.7)]"
            style={{
              left: `${(wx + 1) * cellWidthPercent - 2}%`,
              top: `${wy * cellHeightPercent}%`,
              width: '4%',
              height: `${cellHeightPercent}%`,
              backgroundColor: palette.wallBg,
              borderLeft: `2px solid ${palette.wallHighlight}`,
              borderRight: `2px solid ${palette.wallShadow}`,
              boxShadow: `3px 0 6px rgba(0,0,0,0.7), 0 0 6px ${palette.glowColor}`,
            }}
          />
        ))}

        {/* Living Mummies Entities with Smooth Sliding CSS Transitions */}
        {mummies.map((mummy) => {
          if (!mummy.alive) return null;
          const isWhite = mummy.type === 'white';
          const isRed = mummy.type === 'red';
          const isNearest = nearestThreat?.mummyId === mummy.id;
          const facing = mummy.facing || 'down';

          // Directional tilt angle
          const tiltRotate =
            facing === 'left'
              ? '-rotate-6'
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
              {/* Dynamic Dust Ripple & Ground Shadow */}
              <div className="absolute -bottom-1 w-3/4 h-2.5 bg-black/40 rounded-full blur-[2px] pointer-events-none animate-pulse" />

              <div
                className={`relative w-[85%] h-[85%] rounded-xl flex flex-col items-center justify-center border-2 shadow-xl transition-transform duration-200 ${tiltRotate} ${
                  isWhite
                    ? 'bg-slate-100/95 border-slate-300 text-slate-900 shadow-cyan-900/40'
                    : isRed
                    ? 'bg-rose-700/95 border-rose-400 text-white shadow-rose-950/60'
                    : 'bg-amber-600/95 border-amber-300 text-white shadow-amber-950/50'
                } ${
                  isNearest
                    ? 'ring-2 ring-yellow-400 shadow-[0_0_15px_rgba(250,204,21,0.6)]'
                    : ''
                }`}
              >
                {/* Mummy Avatar Icon */}
                <span className="text-2xl drop-shadow-md select-none transform hover:scale-110 transition-transform">
                  <MummySprite kind={isWhite ? "white" : isRed ? "red" : "scorpion"}/>
                </span>

                {/* Badge Tag */}
                <span
                  className={`text-[8px] font-black uppercase px-1 rounded mt-0.5 tracking-tighter ${
                    isWhite
                      ? 'bg-slate-300 text-slate-800'
                      : isRed
                      ? 'bg-rose-900 text-rose-200'
                      : 'bg-amber-900 text-amber-200'
                  }`}
                >
                  {isWhite ? 'X.Ướp Trắng' : isRed ? 'X.Ướp Đỏ' : 'Bọ Cạp'}
                </span>

                {/* Glow Eyes */}
                <div className="absolute top-2.5 flex gap-1.5 pointer-events-none">
                  <div
                    className={`w-1 h-1 rounded-full ${
                      isWhite
                        ? 'bg-cyan-400 animate-ping'
                        : isRed
                        ? 'bg-yellow-300 animate-ping'
                        : 'bg-red-400'
                    }`}
                  />
                  <div
                    className={`w-1 h-1 rounded-full ${
                      isWhite
                        ? 'bg-cyan-400 animate-ping'
                        : isRed
                        ? 'bg-yellow-300 animate-ping'
                        : 'bg-red-400'
                    }`}
                  />
                </div>
              </div>
            </div>
          );
        })}

        {/* Player Explorer Entity with Smooth Sliding CSS Transitions & Stepping Physics */}
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
          {/* Dust Sand Step Trail */}
          <div className="absolute -bottom-1 w-4/5 h-3 bg-amber-950/60 rounded-full blur-[2px] pointer-events-none" />

          <div
            className={`relative w-[85%] h-[85%] rounded-xl bg-gradient-to-b from-amber-500 to-yellow-600 border-2 border-yellow-200 flex flex-col items-center justify-center shadow-[0_0_16px_rgba(234,179,8,0.7)] transition-transform duration-150 ${
              playerFacing === 'left'
                ? '-rotate-3 scale-105'
                : playerFacing === 'right'
                ? 'rotate-3 scale-105'
                : playerFacing === 'up'
                ? '-translate-y-0.5 scale-105'
                : playerFacing === 'down'
                ? 'translate-y-0.5 scale-105'
                : ''
            } ${isVictory ? 'animate-bounce' : isGameOver ? 'animate-pulse opacity-85 rotate-45' : ''}`}
          >
            {/* Explorer Avatar */}
            <span className="text-2xl drop-shadow-lg select-none">
              {isVictory ? '🎉' : isGameOver ? '💀' : '🤠'}
            </span>
            <span className="text-[8px] font-black text-amber-950 uppercase tracking-tighter bg-yellow-200/90 px-1 rounded mt-0.5">
              Bạn
            </span>

            {/* Direction Indicator Notch */}
            {playerFacing && !isGameOver && !isVictory && playerFacing !== 'wait' && (
              <div
                className={`absolute w-2 h-2 rounded-full bg-yellow-200 border border-amber-800 shadow ${
                  playerFacing === 'up'
                    ? '-top-1 left-1/2 -translate-x-1/2'
                    : playerFacing === 'down'
                    ? '-bottom-1 left-1/2 -translate-x-1/2'
                    : playerFacing === 'left'
                    ? 'top-1/2 -left-1 -translate-y-1/2'
                    : 'top-1/2 -right-1 -translate-y-1/2'
                }`}
              />
            )}
          </div>
        </div>
      </div>
    </div>
  );
};
