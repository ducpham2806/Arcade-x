import React, { useRef, useEffect } from 'react';
import { Rect, Hint, Point } from './generator';

interface Props {
  size: number;
  hints: Hint[];
  userRects: Rect[];
  currentDrawing: Rect | null;
  onDrawStart: (p: Point) => void;
  onDrawMove: (p: Point) => void;
  onDrawEnd: () => void;
  skinId: string;
}

export const ShikakuBoard: React.FC<Props> = ({
  size,
  hints,
  userRects,
  currentDrawing,
  onDrawStart,
  onDrawMove,
  onDrawEnd,
  skinId
}) => {
  const boardRef = useRef<HTMLDivElement>(null);

  const getCell = (clientX: number, clientY: number): Point | null => {
    if (!boardRef.current) return null;
    const rect = boardRef.current.getBoundingClientRect();
    const x = clientX - rect.left;
    const y = clientY - rect.top;
    if (x < 0 || x >= rect.width || y < 0 || y >= rect.height) return null;
    const c = Math.floor((x / rect.width) * size);
    const r = Math.floor((y / rect.height) * size);
    return { r: Math.min(Math.max(r, 0), size - 1), c: Math.min(Math.max(c, 0), size - 1) };
  };

  const handlePointerDown = (e: React.PointerEvent) => {
    e.preventDefault();
    (e.target as HTMLElement).setPointerCapture(e.pointerId);
    const cell = getCell(e.clientX, e.clientY);
    if (cell) onDrawStart(cell);
  };

  const handlePointerMove = (e: React.PointerEvent) => {
    e.preventDefault();
    if ((e.buttons & 1) !== 1) return; // Only process move if primary button is pressed
    const cell = getCell(e.clientX, e.clientY);
    if (cell) onDrawMove(cell);
  };

  const handlePointerUp = (e: React.PointerEvent) => {
    e.preventDefault();
    if ((e.target as HTMLElement).hasPointerCapture(e.pointerId)) {
        (e.target as HTMLElement).releasePointerCapture(e.pointerId);
    }
    onDrawEnd();
  };

  const isNeon = skinId === 'skin-shikaku-neon';
  const isPastel = skinId === 'skin-shikaku-pastel';

  const renderRect = (rect: Rect, isDrawing = false) => {
    const top = `${(rect.r / size) * 100}%`;
    const left = `${(rect.c / size) * 100}%`;
    const width = `${(rect.w / size) * 100}%`;
    const height = `${(rect.h / size) * 100}%`;

    let isValid = true;
    let containedHints = 0;
    let hintValue = 0;
    
    if (!isDrawing) {
        hints.forEach(h => {
            if (h.r >= rect.r && h.r < rect.r + rect.h && h.c >= rect.c && h.c < rect.c + rect.w) {
                containedHints++;
                hintValue = h.value;
            }
        });
        if (containedHints > 1) isValid = false;
        if (containedHints === 1 && rect.w * rect.h !== hintValue) isValid = false;
    }

    const baseStyle: React.CSSProperties = {
        position: 'absolute',
        top, left, width, height,
        backgroundColor: rect.color || '#60a5fa',
        opacity: isDrawing ? 0.6 : 0.95,
        border: isNeon ? '2px solid rgba(255,255,255,0.7)' : (isPastel ? '3px solid rgba(255,255,255,0.8)' : '2px solid rgba(0,0,0,0.3)'),
        borderRadius: isPastel ? '12px' : '4px',
        pointerEvents: 'none',
        zIndex: 10,
        transition: 'all 0.15s cubic-bezier(0.4, 0, 0.2, 1)',
        boxShadow: isNeon ? `0 0 12px ${rect.color}, inset 0 0 8px rgba(255,255,255,0.5)` : (isPastel ? '0 4px 6px rgba(0,0,0,0.05)' : 'none')
    };

    if (!isValid && !isDrawing) {
        baseStyle.backgroundColor = '#ef4444';
        baseStyle.backgroundImage = 'repeating-linear-gradient(45deg, transparent, transparent 10px, rgba(0,0,0,0.15) 10px, rgba(0,0,0,0.15) 20px)';
    }

    return <div key={rect.id || 'drawing'} style={baseStyle} />;
  };

  const getFontSizeClass = (boardSize: number) => {
    if (boardSize <= 5) return 'text-2xl sm:text-3xl font-black';
    if (boardSize <= 7) return 'text-xl sm:text-2xl font-black';
    if (boardSize <= 9) return 'text-base sm:text-xl font-black';
    return 'text-sm sm:text-base font-black';
  };

  return (
    <div
      ref={boardRef}
      className={`relative w-[min(96vw,calc(100dvh-100px))] h-[min(96vw,calc(100dvh-100px))] select-none touch-none rounded-2xl overflow-hidden mx-auto shadow-2xl ${
          isNeon ? 'bg-[#0a0a1a] border-[3px] border-cyan-500 shadow-[0_0_25px_rgba(6,182,212,0.4)]' : 
          (isPastel ? 'bg-[#fdf2f8] border-4 border-pink-200 shadow-xl' : 'bg-[#e2e8f0] border-4 border-slate-400 shadow-lg')
      }`}
      onPointerDown={handlePointerDown}
      onPointerMove={handlePointerMove}
      onPointerUp={handlePointerUp}
      onPointerCancel={handlePointerUp}
      onContextMenu={(e) => e.preventDefault()}
    >
        {/* Grid Lines */}
        <div
          className="absolute inset-0 grid pointer-events-none"
          style={{
            gridTemplateColumns: `repeat(${size}, minmax(0, 1fr))`,
            gridTemplateRows: `repeat(${size}, minmax(0, 1fr))`
          }}
        >
            {Array.from({ length: size * size }).map((_, i) => (
                <div key={i} className={`border ${
                    isNeon ? 'border-cyan-900/40' : 
                    (isPastel ? 'border-pink-300/30' : 'border-slate-300/80')
                }`} />
            ))}
        </div>

        {/* User Rectangles */}
        {userRects.map(r => renderRect(r))}
        {currentDrawing && renderRect(currentDrawing, true)}

        {/* Hints - Rendered above rects so text is visible */}
        <div
          className="absolute inset-0 grid pointer-events-none z-20"
          style={{
            gridTemplateColumns: `repeat(${size}, minmax(0, 1fr))`,
            gridTemplateRows: `repeat(${size}, minmax(0, 1fr))`
          }}
        >
            {Array.from({ length: size * size }).map((_, i) => {
                const r = Math.floor(i / size);
                const c = i % size;
                const hint = hints.find(h => h.r === r && h.c === c);
                if (!hint) return <div key={i} />;

                const coveringRect = userRects.find(rect => r >= rect.r && r < rect.r + rect.h && c >= rect.c && c < rect.c + rect.w);
                const isCovered = !!coveringRect;

                return (
                    <div key={i} className="flex items-center justify-center">
                        <span className={`${getFontSizeClass(size)} drop-shadow-md transition-colors duration-200 ${
                            isCovered ? 
                                'text-white drop-shadow-[0_1px_2px_rgba(0,0,0,0.5)]' : 
                                (isNeon ? 'text-cyan-400 drop-shadow-[0_0_8px_rgba(6,182,212,0.8)]' : 
                                (isPastel ? 'text-pink-600' : 'text-slate-700'))
                        }`}>
                            {hint.value}
                        </span>
                    </div>
                );
            })}
        </div>
    </div>
  );
}
