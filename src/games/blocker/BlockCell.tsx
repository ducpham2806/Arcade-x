import React from 'react';

export type BlockTheme = 
  | 'wood_ruby' 
  | 'wood_amethyst' 
  | 'wood_sapphire' 
  | 'wood_topaz'
  | 'wood_plain' 
  | 'stone_olive' 
  | 'stone_jade' 
  | 'stone_teal'
  | 'stone_amber'
  | 'stone_ruby'
  | 'stone_amethyst'
  | 'stone_sapphire';

export interface BlockCellProps {
  theme: BlockTheme | string;
  size?: number | string;
  isGhost?: boolean;
  isValidGhost?: boolean;
  isClearing?: boolean;
  className?: string;
  showGemSparkle?: boolean;
  skinId?: string;
}

export const GemIcon: React.FC<{ type: 'ruby' | 'amethyst' | 'sapphire' | 'topaz'; size?: number }> = ({ type, size = 18 }) => {
  switch (type) {
    case 'ruby':
      return (
        <svg width={size} height={size} viewBox="0 0 24 24" className="drop-shadow-[0_2px_4px_rgba(225,29,72,0.8)] filter">
          <defs>
            <radialGradient id="rubyGrad" cx="35%" cy="35%" r="65%">
              <stop offset="0%" stopColor="#ffa4a4" />
              <stop offset="40%" stopColor="#f43f5e" />
              <stop offset="85%" stopColor="#be123c" />
              <stop offset="100%" stopColor="#881337" />
            </radialGradient>
          </defs>
          {/* 8-pointed Star Gem */}
          <polygon
            points="12,1 15,6 20,4 18,9 23,12 18,15 20,20 15,18 12,23 9,18 4,20 6,15 1,12 6,9 4,4 9,6"
            fill="url(#rubyGrad)"
            stroke="#ffe4e6"
            strokeWidth="0.9"
          />
          {/* Inner Facet */}
          <polygon
            points="12,6 16,12 12,18 8,12"
            fill="#ff6b8b"
            opacity="0.9"
          />
          {/* Specular Glint */}
          <circle cx="10" cy="9" r="1.5" fill="#ffffff" opacity="0.95" />
        </svg>
      );

    case 'amethyst':
      return (
        <svg width={size} height={size} viewBox="0 0 24 24" className="drop-shadow-[0_2px_4px_rgba(168,85,247,0.8)] filter">
          <defs>
            <radialGradient id="amethystGrad" cx="35%" cy="35%" r="65%">
              <stop offset="0%" stopColor="#f5d0fe" />
              <stop offset="40%" stopColor="#c084fc" />
              <stop offset="80%" stopColor="#9333ea" />
              <stop offset="100%" stopColor="#581c87" />
            </radialGradient>
          </defs>
          {/* 8-pointed Star Gem */}
          <polygon
            points="12,1 15,6 20,4 18,9 23,12 18,15 20,20 15,18 12,23 9,18 4,20 6,15 1,12 6,9 4,4 9,6"
            fill="url(#amethystGrad)"
            stroke="#fae8ff"
            strokeWidth="0.9"
          />
          {/* Inner Facet */}
          <polygon
            points="12,6 16,12 12,18 8,12"
            fill="#e9d5ff"
            opacity="0.9"
          />
          {/* Glint */}
          <circle cx="10" cy="9" r="1.5" fill="#ffffff" opacity="0.95" />
        </svg>
      );

    case 'sapphire':
      return (
        <svg width={size} height={size} viewBox="0 0 24 24" className="drop-shadow-[0_2px_4px_rgba(6,182,212,0.8)] filter">
          <defs>
            <linearGradient id="sapphireGrad" x1="0%" y1="0%" x2="100%" y2="100%">
              <stop offset="0%" stopColor="#e0f2fe" />
              <stop offset="35%" stopColor="#38bdf8" />
              <stop offset="75%" stopColor="#0284c7" />
              <stop offset="100%" stopColor="#0369a1" />
            </linearGradient>
          </defs>
          {/* Faceted Diamond Gem */}
          <polygon
            points="12,2 22,12 12,22 2,12"
            fill="url(#sapphireGrad)"
            stroke="#e0f2fe"
            strokeWidth="0.9"
          />
          <polygon
            points="12,6 18,12 12,18 6,12"
            fill="#7dd3fc"
            opacity="0.9"
          />
          <line x1="12" y1="2" x2="12" y2="22" stroke="#ffffff" strokeWidth="0.6" opacity="0.7" />
          <line x1="2" y1="12" x2="22" y2="12" stroke="#ffffff" strokeWidth="0.6" opacity="0.7" />
          {/* Specular */}
          <circle cx="9" cy="9" r="1.5" fill="#ffffff" opacity="0.95" />
        </svg>
      );

    case 'topaz':
      return (
        <svg width={size} height={size} viewBox="0 0 24 24" className="drop-shadow-[0_2px_4px_rgba(234,179,8,0.8)] filter">
          <defs>
            <radialGradient id="topazGrad" cx="35%" cy="35%" r="65%">
              <stop offset="0%" stopColor="#fef08a" />
              <stop offset="45%" stopColor="#eab308" />
              <stop offset="85%" stopColor="#ca8a04" />
              <stop offset="100%" stopColor="#854d0e" />
            </radialGradient>
          </defs>
          <polygon
            points="12,2 15,8 22,9 17,14 18,21 12,17 6,21 7,14 2,9 9,8"
            fill="url(#topazGrad)"
            stroke="#fefce8"
            strokeWidth="0.9"
          />
          <circle cx="10" cy="10" r="1.5" fill="#ffffff" opacity="0.95" />
        </svg>
      );
  }
};

export const BlockCell: React.FC<BlockCellProps> = ({
  theme,
  size,
  isGhost = false,
  isValidGhost = true,
  isClearing = false,
  className = '',
  skinId,
}) => {
  // Ghost placement style (hovering over grid during drag)
  if (isGhost) {
    return (
      <div
        className={`w-full h-full rounded-[6px] transition-all duration-75 flex items-center justify-center ${
          isValidGhost
            ? 'bg-emerald-400/40 border-2 border-emerald-300 shadow-[0_0_14px_rgba(52,211,153,0.8)] animate-pulse'
            : 'bg-rose-500/35 border-2 border-rose-400 shadow-[0_0_10px_rgba(244,63,94,0.6)]'
        } ${className}`}
        style={size ? { width: size, height: size } : undefined}
      >
        <div className="w-2.5 h-2.5 rounded-full bg-white/70 shadow-sm" />
      </div>
    );
  }

  // Clear explosion animation
  if (isClearing) {
    return (
      <div
        className={`w-full h-full rounded-[6px] bg-white border-2 border-amber-300 shadow-[0_0_24px_#ffffff] animate-ping ${className}`}
        style={size ? { width: size, height: size } : undefined}
      />
    );
  }

  // Vibrant, high-contrast 3D materials exactly matching reference
  let bgStyle = '';
  let borderStyle = '';
  let innerBevelStyle = '';
  let gemType: 'ruby' | 'amethyst' | 'sapphire' | 'topaz' | null = null;
  let customClasses = '';

  switch (theme) {
    case 'wood_ruby':
      bgStyle = 'bg-gradient-to-br from-[#f5b885] via-[#e2995b] to-[#b86728]';
      borderStyle = 'border-[#582d0e]';
      innerBevelStyle = 'shadow-[inset_2.5px_2.5px_0px_rgba(255,245,225,0.9),inset_-2.5px_-2.5px_0px_rgba(80,35,5,0.7),0_3px_6px_rgba(0,0,0,0.45)]';
      gemType = 'ruby';
      break;

    case 'wood_amethyst':
      bgStyle = 'bg-gradient-to-br from-[#f5b885] via-[#e2995b] to-[#b86728]';
      borderStyle = 'border-[#582d0e]';
      innerBevelStyle = 'shadow-[inset_2.5px_2.5px_0px_rgba(255,245,225,0.9),inset_-2.5px_-2.5px_0px_rgba(80,35,5,0.7),0_3px_6px_rgba(0,0,0,0.45)]';
      gemType = 'amethyst';
      break;

    case 'wood_sapphire':
      bgStyle = 'bg-gradient-to-br from-[#f5b885] via-[#e2995b] to-[#b86728]';
      borderStyle = 'border-[#582d0e]';
      innerBevelStyle = 'shadow-[inset_2.5px_2.5px_0px_rgba(255,245,225,0.9),inset_-2.5px_-2.5px_0px_rgba(80,35,5,0.7),0_3px_6px_rgba(0,0,0,0.45)]';
      gemType = 'sapphire';
      break;

    case 'wood_topaz':
      bgStyle = 'bg-gradient-to-br from-[#f5b885] via-[#e2995b] to-[#b86728]';
      borderStyle = 'border-[#582d0e]';
      innerBevelStyle = 'shadow-[inset_2.5px_2.5px_0px_rgba(255,245,225,0.9),inset_-2.5px_-2.5px_0px_rgba(80,35,5,0.7),0_3px_6px_rgba(0,0,0,0.45)]';
      gemType = 'topaz';
      break;

    case 'wood_plain':
      bgStyle = 'bg-gradient-to-br from-[#f5ba89] via-[#e49c5e] to-[#ba692b]';
      borderStyle = 'border-[#582d0e]';
      innerBevelStyle = 'shadow-[inset_2.5px_2.5px_0px_rgba(255,245,225,0.9),inset_-2.5px_-2.5px_0px_rgba(80,35,5,0.7),0_3px_6px_rgba(0,0,0,0.45)]';
      break;

    case 'stone_olive':
      // Vibrant Lush Olive Green (High Contrast against dark board)
      bgStyle = 'bg-gradient-to-br from-[#8bd43f] via-[#6cb825] to-[#488712]';
      borderStyle = 'border-[#264e0b]';
      innerBevelStyle = 'shadow-[inset_2.5px_2.5px_0px_rgba(235,255,200,0.9),inset_-2.5px_-2.5px_0px_rgba(25,55,8,0.7),0_3px_6px_rgba(0,0,0,0.45)]';
      break;

    case 'stone_jade':
      // Bright Creamy Jade / Celadon Mint
      bgStyle = 'bg-gradient-to-br from-[#e6f8ea] via-[#bfe8c7] to-[#8ac996]';
      borderStyle = 'border-[#3f734b]';
      innerBevelStyle = 'shadow-[inset_2.5px_2.5px_0px_rgba(255,255,255,0.95),inset_-2.5px_-2.5px_0px_rgba(45,85,55,0.65),0_3px_6px_rgba(0,0,0,0.4)]';
      break;

    case 'stone_teal':
      // Rich Ocean Slate Cyan/Teal
      bgStyle = 'bg-gradient-to-br from-[#7ee0e8] via-[#48b6c0] to-[#25828a]';
      borderStyle = 'border-[#14494e]';
      innerBevelStyle = 'shadow-[inset_2.5px_2.5px_0px_rgba(225,250,255,0.9),inset_-2.5px_-2.5px_0px_rgba(15,60,65,0.7),0_3px_6px_rgba(0,0,0,0.45)]';
      break;

    case 'stone_amber':
      // Vibrant Sunflower Gold Amber
      bgStyle = 'bg-gradient-to-br from-[#fed563] via-[#f5ab27] to-[#c77a0c]';
      borderStyle = 'border-[#633a04]';
      innerBevelStyle = 'shadow-[inset_2.5px_2.5px_0px_rgba(255,250,215,0.95),inset_-2.5px_-2.5px_0px_rgba(75,40,0,0.7),0_3px_6px_rgba(0,0,0,0.45)]';
      break;

    case 'stone_ruby':
      // Bold Crimson Ruby Block
      bgStyle = 'bg-gradient-to-br from-[#ff6b81] via-[#f43f5e] to-[#be123c]';
      borderStyle = 'border-[#580616]';
      innerBevelStyle = 'shadow-[inset_2.5px_2.5px_0px_rgba(255,225,230,0.9),inset_-2.5px_-2.5px_0px_rgba(80,5,20,0.7),0_3px_6px_rgba(0,0,0,0.45)]';
      break;

    case 'stone_amethyst':
      // Royal Bright Amethyst Purple
      bgStyle = 'bg-gradient-to-br from-[#d8b4fe] via-[#a855f7] to-[#7e22ce]';
      borderStyle = 'border-[#450a6e]';
      innerBevelStyle = 'shadow-[inset_2.5px_2.5px_0px_rgba(250,235,255,0.9),inset_-2.5px_-2.5px_0px_rgba(55,10,85,0.7),0_3px_6px_rgba(0,0,0,0.45)]';
      break;

    case 'stone_sapphire':
      // Deep Azure Crystal Sapphire
      bgStyle = 'bg-gradient-to-br from-[#7dd3fc] via-[#0284c7] to-[#0369a1]';
      borderStyle = 'border-[#082f49]';
      innerBevelStyle = 'shadow-[inset_2.5px_2.5px_0px_rgba(225,245,255,0.9),inset_-2.5px_-2.5px_0px_rgba(5,45,80,0.7),0_3px_6px_rgba(0,0,0,0.45)]';
      break;

    default:
      bgStyle = 'bg-gradient-to-br from-[#f5ba89] via-[#e49c5e] to-[#ba692b]';
      borderStyle = 'border-[#582d0e]';
      innerBevelStyle = 'shadow-[inset_2.5px_2.5px_0px_rgba(255,245,225,0.9),inset_-2.5px_-2.5px_0px_rgba(80,35,5,0.7),0_3px_6px_rgba(0,0,0,0.45)]';
      break;
  }

  // Apply custom skin overrides
  if (skinId) {
    if (skinId === 'skin-blocker-crystal') {
      bgStyle = 'bg-gradient-to-br from-indigo-300 via-purple-400 to-indigo-600';
      borderStyle = 'border-white';
      innerBevelStyle = 'shadow-[inset_2.5px_2.5px_0px_rgba(255,255,255,0.7),inset_-2.5px_-2.5px_0px_rgba(50,0,100,0.5),0_3px_6px_rgba(0,0,0,0.45)]';
    } else if (skinId === 'skin-blocker-neon') {
      bgStyle = 'bg-gradient-to-br from-cyan-300 via-blue-500 to-indigo-700';
      borderStyle = 'border-cyan-200';
      innerBevelStyle = 'shadow-[inset_2.5px_2.5px_0px_rgba(255,255,255,0.8),inset_-2.5px_-2.5px_0px_rgba(0,0,255,0.6),0_3px_6px_rgba(34,211,238,0.7)]';
    }
  }

  return (
    <div
      className={`w-full h-full relative rounded-[5px] sm:rounded-[6px] border ${borderStyle} ${bgStyle} ${innerBevelStyle} flex items-center justify-center select-none overflow-hidden ${className}`}
      style={size ? { width: size, height: size } : undefined}
    >
      {/* 3D Diagonal Bevel Specular Highlights */}
      <div className="absolute inset-0 pointer-events-none opacity-25 bg-[radial-gradient(ellipse_at_top_left,_var(--tw-gradient-stops))] from-white via-transparent to-black" />

      {/* Gem Vector Icon */}
      {gemType && (
        <div className="relative z-10 scale-90 sm:scale-100 flex items-center justify-center">
          <GemIcon type={gemType} size={18} />
        </div>
      )}
    </div>
  );
};
