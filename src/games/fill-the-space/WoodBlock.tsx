import React from 'react';
import { BlockShape } from './types';

interface WoodBlockProps {
  block: BlockShape;
  cellSize?: number; // Size of each cell in px
  isSelected?: boolean;
  isDragging?: boolean;
  onClick?: () => void;
  onPointerDown?: (e: React.PointerEvent) => void;
  showShadow?: boolean;
  className?: string;
}

export const WoodBlock: React.FC<WoodBlockProps> = ({
  block,
  cellSize = 44,
  isSelected = false,
  isDragging = false,
  onClick,
  onPointerDown,
  showShadow = true,
  className = '',
}) => {
  // Wood color tones based on colorVariant
  const woodShades = [
    {
      // Classic Light Oak (like the reference image)
      topFace: 'bg-gradient-to-br from-[#edd3b4] via-[#dfbe97] to-[#cd9d6d]',
      borderTopLeft: 'border-t-[#fff2df] border-l-[#fff2df]',
      borderBottomRight: 'border-b-[#9b6c43] border-r-[#9b6c43]',
      innerGrain: 'rgba(163, 107, 61, 0.15)',
    },
    {
      // Warm Amber Birch
      topFace: 'bg-gradient-to-br from-[#f2dbbe] via-[#e5c59e] to-[#d4a974]',
      borderTopLeft: 'border-t-[#fff6eb] border-l-[#fff6eb]',
      borderBottomRight: 'border-b-[#a67448] border-r-[#a67448]',
      innerGrain: 'rgba(175, 118, 68, 0.15)',
    },
    {
      // Golden Pine
      topFace: 'bg-gradient-to-br from-[#ebd0af] via-[#ddb78b] to-[#c9955d]',
      borderTopLeft: 'border-t-[#ffeed7] border-l-[#ffeed7]',
      borderBottomRight: 'border-b-[#935f33] border-r-[#935f33]',
      innerGrain: 'rgba(150, 95, 48, 0.15)',
    },
  ];

  const shade = woodShades[block.colorVariant % woodShades.length];

  return (
    <div
      id={`wood-block-${block.id}`}
      onClick={onClick}
      onPointerDown={onPointerDown}
      className={`relative select-none cursor-grab active:cursor-grabbing transition-transform duration-100 ${
        isSelected ? 'ring-4 ring-amber-400 ring-offset-2 ring-offset-amber-950 scale-105 z-20' : ''
      } ${isDragging ? 'opacity-90 scale-105 z-50 pointer-events-none' : 'hover:scale-[1.02]'} ${className}`}
      style={{
        width: block.width * cellSize,
        height: block.height * cellSize,
        touchAction: 'none',
      }}
    >
      {/* Cells rendering */}
      {block.cells.map(([r, c], idx) => {
        const x = c * cellSize;
        const y = r * cellSize;

        return (
          <div
            key={`cell-${idx}-${r}-${c}`}
            className={`absolute ${shade.topFace} border-t-2 border-l-2 border-b-[3px] border-r-[3px] ${shade.borderTopLeft} ${shade.borderBottomRight} rounded-[6px] flex items-center justify-center overflow-hidden transition-all`}
            style={{
              left: x,
              top: y,
              width: cellSize,
              height: cellSize,
              boxShadow: showShadow && !isDragging
                ? '0 6px 12px -2px rgba(45, 20, 8, 0.45), inset 0 1px 2px rgba(255, 255, 255, 0.5)'
                : isDragging
                ? '0 16px 28px rgba(0, 0, 0, 0.55), inset 0 1px 2px rgba(255, 255, 255, 0.6)'
                : 'inset 0 1px 2px rgba(255, 255, 255, 0.4)',
            }}
          >
            {/* Subtle natural wood grain texture lines */}
            <div
              className="absolute inset-0 pointer-events-none opacity-40 mix-blend-overlay"
              style={{
                backgroundImage: `repeating-linear-gradient(
                  115deg,
                  transparent,
                  transparent 6px,
                  ${shade.innerGrain} 7px,
                  transparent 9px
                )`,
              }}
            />
            {/* 3D Bevel Highlight */}
            <div className="absolute inset-0.5 rounded-[4px] border border-white/20 pointer-events-none" />
          </div>
        );
      })}
    </div>
  );
};
