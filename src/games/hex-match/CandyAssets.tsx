import React from 'react';
import { TileColor, SpecialType, ObstacleType } from './types';

// Renders glossy, vibrant candy match-3 pieces matching the uploaded sprite sheet
export const CandyItemIcon: React.FC<{
  color: TileColor;
  special?: SpecialType;
  obstacle?: ObstacleType;
  className?: string;
}> = ({ color, special, obstacle, className = 'w-full h-full' }) => {
  // 1. OBSTACLE: Stone / Waffle / Chocolate Block (matching bottom row)
  if (obstacle === 'stone') {
    return (
      <svg viewBox="0 0 54 54" className={className} fill="none">
        {/* Waffle / Chocolate Tile Base */}
        <rect x="4" y="4" width="46" height="46" rx="8" fill="#78350f" stroke="#451a03" strokeWidth="2" />
        {/* 4 Checkerboard squares */}
        <rect x="7" y="7" width="18" height="18" rx="3" fill="#b45309" />
        <rect x="29" y="7" width="18" height="18" rx="3" fill="#92400e" />
        <rect x="7" y="29" width="18" height="18" rx="3" fill="#92400e" />
        <rect x="29" y="29" width="18" height="18" rx="3" fill="#b45309" />
        {/* Inner bevels */}
        <rect x="9" y="9" width="14" height="14" rx="2" fill="#d97706" fillOpacity="0.6" />
        <rect x="31" y="31" width="14" height="14" rx="2" fill="#d97706" fillOpacity="0.6" />
      </svg>
    );
  }

  // 2. SPECIAL: Rainbow Disco Sphere (Color Bomb from 5th row)
  if (special === 'rainbow') {
    return (
      <svg viewBox="0 0 54 54" className={className} fill="none">
        {/* Outer Cosmic Glow */}
        <circle cx="27" cy="27" r="23" fill="url(#rainbowGlow)" />
        {/* Spherical Base */}
        <circle cx="27" cy="27" r="20" fill="#1e1b4b" stroke="#f43f5e" strokeWidth="1.5" />
        {/* Swirling Rainbow Rings */}
        <ellipse cx="27" cy="27" rx="19" ry="8" stroke="#38bdf8" strokeWidth="3" transform="rotate(-25 27 27)" />
        <ellipse cx="27" cy="27" rx="19" ry="8" stroke="#fbbf24" strokeWidth="3" transform="rotate(25 27 27)" />
        <ellipse cx="27" cy="27" rx="19" ry="8" stroke="#ec4899" strokeWidth="2.5" transform="rotate(75 27 27)" />
        <ellipse cx="27" cy="27" rx="19" ry="8" stroke="#10b981" strokeWidth="2.5" transform="rotate(-75 27 27)" />
        {/* Center Sparkle Core */}
        <circle cx="27" cy="27" r="6" fill="#ffffff" />
        <circle cx="27" cy="27" r="10" fill="#ffffff" fillOpacity="0.3" className="animate-ping" />
        {/* Stars */}
        <circle cx="21" cy="19" r="1.5" fill="#ffffff" />
        <circle cx="33" cy="34" r="1.5" fill="#ffffff" />
        <defs>
          <radialGradient id="rainbowGlow" cx="50%" cy="50%" r="50%">
            <stop offset="0%" stopColor="#ec4899" stopOpacity="0.8" />
            <stop offset="50%" stopColor="#38bdf8" stopOpacity="0.5" />
            <stop offset="100%" stopColor="#10b981" stopOpacity="0" />
          </radialGradient>
        </defs>
      </svg>
    );
  }

  // 3. SPECIAL: Wrapped Candy Bomb (matching row 1 & row 6 wrapped candies)
  if (special === 'bomb') {
    return (
      <svg viewBox="0 0 54 54" className={className} fill="none">
        {/* Left Wrapper Twist */}
        <polygon points="12,27 2,16 2,38" fill={color} stroke="#ffffff" strokeWidth="1" strokeOpacity="0.6" />
        {/* Right Wrapper Twist */}
        <polygon points="42,27 52,16 52,38" fill={color} stroke="#ffffff" strokeWidth="1" strokeOpacity="0.6" />
        {/* Center Candy Cushion */}
        <rect x="10" y="10" width="34" height="34" rx="8" fill={color} stroke="#ffffff" strokeWidth="2" />
        {/* Crinkled Bag Edges */}
        <path d="M10 16L14 27L10 38" stroke="#ffffff" strokeWidth="1.5" strokeLinecap="round" />
        <path d="M44 16L40 27L44 38" stroke="#ffffff" strokeWidth="1.5" strokeLinecap="round" />
        {/* Big Juicy Center Glow */}
        <ellipse cx="27" cy="23" rx="10" ry="7" fill="#ffffff" fillOpacity="0.45" />
        {/* Burning Spark Fuse */}
        <circle cx="27" cy="27" r="5" fill="#facc15" />
        <circle cx="27" cy="27" r="8" fill="#facc15" fillOpacity="0.4" className="animate-ping" />
      </svg>
    );
  }

  // 4. SPECIAL: Striped Candy Rocket (matching row 1 & row 2 striped candies)
  if (special === 'rocket_h' || special === 'rocket_d') {
    return (
      <svg viewBox="0 0 54 54" className={className} fill="none">
        {/* Striped Candy Base */}
        <rect x="7" y="11" width="40" height="32" rx="12" fill={color} stroke="#ffffff" strokeWidth="1.5" />
        {/* Bright White Striped Blast Lines */}
        <path d="M16 11L10 43" stroke="#ffffff" strokeWidth="4.5" strokeLinecap="round" />
        <path d="M26 11L20 43" stroke="#ffffff" strokeWidth="4.5" strokeLinecap="round" />
        <path d="M36 11L30 43" stroke="#ffffff" strokeWidth="4.5" strokeLinecap="round" />
        <path d="M46 11L40 43" stroke="#ffffff" strokeWidth="4.5" strokeLinecap="round" />
        {/* Gloss Top Arc */}
        <path d="M14 15C19 13 35 13 40 15" stroke="#ffffff" strokeWidth="2.5" strokeLinecap="round" strokeOpacity="0.8" />
      </svg>
    );
  }

  // 5. REGULAR CANDY PIECES (Shape & Color Pairings from Asset Sheet)

  // RED HEART CANDY (Row 3, Col 2)
  if (color === '#f43f5e') {
    return (
      <svg viewBox="0 0 54 54" className={className} fill="none">
        {/* Drop shadow */}
        <path
          d="M27 46C27 46 8 33 8 20C8 12 14 7 21 7C24.5 7 26.5 9 27 10C27.5 9 29.5 7 33 7C40 7 46 12 46 20C46 33 27 46 27 46Z"
          fill="#be123c"
        />
        {/* Heart Body */}
        <path
          d="M27 44C27 44 9 31.5 9 19C9 11.5 15 6.5 21.5 6.5C25 6.5 26.5 8.5 27 9.5C27.5 8.5 29 6.5 32.5 6.5C39 6.5 45 11.5 45 19C45 31.5 27 44 27 44Z"
          fill="url(#redHeartGrad)"
        />
        {/* Top Gloss Arc */}
        <path
          d="M14 16C15 11 19 9 22 9"
          stroke="#ffffff"
          strokeWidth="3.5"
          strokeLinecap="round"
          strokeOpacity="0.85"
        />
        <circle cx="16" cy="20" r="1.5" fill="#ffffff" />
        <defs>
          <linearGradient id="redHeartGrad" x1="12" y1="8" x2="42" y2="44">
            <stop stopColor="#fb7185" />
            <stop offset="0.4" stopColor="#f43f5e" />
            <stop offset="1" stopColor="#e11d48" />
          </linearGradient>
        </defs>
      </svg>
    );
  }

  // GREEN GUMDROP / TRIANGLE CANDY (Row 3, Col 1)
  if (color === '#10b981') {
    return (
      <svg viewBox="0 0 54 54" className={className} fill="none">
        {/* Base shadow */}
        <path d="M27 7C37 7 47 27 47 38C47 44 39 46 27 46C15 46 7 44 7 38C7 27 17 7 27 7Z" fill="#047857" />
        {/* Gumdrop Body */}
        <path d="M27 6C36.5 6 46 26 46 36.5C46 42 38.5 44 27 44C15.5 44 8 42 8 36.5C8 26 17.5 6 27 6Z" fill="url(#greenDropGrad)" />
        {/* Specular Highlight */}
        <ellipse cx="27" cy="15" rx="8" ry="4" fill="#ffffff" fillOpacity="0.75" />
        <path d="M14 34C14 30 18 20 23 14" stroke="#ffffff" strokeWidth="2.5" strokeLinecap="round" strokeOpacity="0.6" />
        <defs>
          <linearGradient id="greenDropGrad" x1="12" y1="8" x2="42" y2="44">
            <stop stopColor="#6ee7b7" />
            <stop offset="0.3" stopColor="#34d399" />
            <stop offset="0.7" stopColor="#10b981" />
            <stop offset="1" stopColor="#059669" />
          </linearGradient>
        </defs>
      </svg>
    );
  }

  // YELLOW STAR CANDY (Row 3, Col 5)
  if (color === '#fbbf24') {
    return (
      <svg viewBox="0 0 54 54" className={className} fill="none">
        {/* Drop shadow */}
        <polygon
          points="27,6 33,18 47,19 36,29 39,43 27,36 15,43 18,29 7,19 21,18"
          fill="#d97706"
          stroke="#b45309"
          strokeWidth="3"
          strokeLinejoin="round"
        />
        {/* Star Body */}
        <polygon
          points="27,5 32.5,17 46,18 35.5,28 38.5,41.5 27,35 15.5,41.5 18.5,28 8,18 21.5,17"
          fill="url(#starGrad)"
          stroke="#fef08a"
          strokeWidth="1.5"
          strokeLinejoin="round"
        />
        {/* 3D Center Star facet */}
        <circle cx="27" cy="25" r="7" fill="#ffffff" fillOpacity="0.5" />
        <polygon points="27,10 29,22 36,22 30,26 32,33 27,28 22,33 24,26 18,22 25,22" fill="#ffffff" fillOpacity="0.6" />
        <defs>
          <linearGradient id="starGrad" x1="10" y1="5" x2="44" y2="43">
            <stop stopColor="#fef08a" />
            <stop offset="0.4" stopColor="#facc15" />
            <stop offset="0.9" stopColor="#f59e0b" />
          </linearGradient>
        </defs>
      </svg>
    );
  }

  // BLUE DIAMOND CANDY (Row 3, Col 4)
  if (color === '#06b6d4') {
    return (
      <svg viewBox="0 0 54 54" className={className} fill="none">
        {/* Base shadow */}
        <polygon points="27,5 48,27 27,49 6,27" fill="#0284c7" stroke="#0369a1" strokeWidth="2" strokeLinejoin="round" />
        {/* Diamond Gem Body */}
        <polygon points="27,4 47,27 27,47 7,27" fill="url(#blueGemGrad)" stroke="#e0f2fe" strokeWidth="1.5" strokeLinejoin="round" />
        {/* Top Facet */}
        <polygon points="27,7 43,27 27,27" fill="#bae6fd" fillOpacity="0.8" />
        {/* Left Facet Highlight */}
        <polygon points="27,7 11,27 27,27" fill="#ffffff" fillOpacity="0.85" />
        {/* Bottom Facets */}
        <polygon points="27,27 43,27 27,44" fill="#0284c7" fillOpacity="0.9" />
        <polygon points="27,27 11,27 27,44" fill="#0ea5e9" fillOpacity="0.9" />
        <defs>
          <linearGradient id="blueGemGrad" x1="8" y1="6" x2="46" y2="46">
            <stop stopColor="#67e8f9" />
            <stop offset="0.5" stopColor="#06b6d4" />
            <stop offset="1" stopColor="#0284c7" />
          </linearGradient>
        </defs>
      </svg>
    );
  }

  // PURPLE BOW / BUTTERFLY CANDY (Row 3, Col 3)
  if (color === '#a855f7') {
    return (
      <svg viewBox="0 0 54 54" className={className} fill="none">
        {/* Shadow */}
        <rect x="9" y="9" width="36" height="36" rx="14" fill="#6b21a8" transform="rotate(45 27 27)" />
        {/* Purple Gem Body */}
        <rect x="10" y="10" width="34" height="34" rx="13" fill="url(#purpleGrad)" stroke="#f3e8ff" strokeWidth="1.5" transform="rotate(45 27 27)" />
        {/* Specular Highlight Arc */}
        <path d="M20 14C23 12 31 12 34 14" stroke="#ffffff" strokeWidth="3" strokeLinecap="round" strokeOpacity="0.9" />
        {/* Inner Bow / Butterfly shape */}
        <circle cx="27" cy="27" r="5" fill="#f3e8ff" />
        <ellipse cx="20" cy="27" rx="4" ry="6" fill="#c084fc" />
        <ellipse cx="34" cy="27" rx="4" ry="6" fill="#c084fc" />
        <defs>
          <linearGradient id="purpleGrad" x1="10" y1="10" x2="44" y2="44">
            <stop stopColor="#e879f9" />
            <stop offset="0.4" stopColor="#c084fc" />
            <stop offset="0.8" stopColor="#a855f7" />
            <stop offset="1" stopColor="#7e22ce" />
          </linearGradient>
        </defs>
      </svg>
    );
  }

  // ORANGE SWIRL RING CANDY (Row 3, Col 6)
  return (
    <svg viewBox="0 0 54 54" className={className} fill="none">
      {/* Shadow */}
      <circle cx="27" cy="28" r="20" fill="#c2410c" />
      {/* Round Body */}
      <circle cx="27" cy="26" r="19.5" fill="url(#orangeRingGrad)" stroke="#ffedd5" strokeWidth="1.5" />
      {/* Inner Swirl / Indent */}
      <circle cx="27" cy="26" r="7.5" fill="#ea580c" stroke="#fed7aa" strokeWidth="1" />
      <circle cx="27" cy="26" r="4" fill="#ffedd5" fillOpacity="0.8" />
      {/* Top Gloss Arc */}
      <path d="M15 19C18 13 36 13 39 19" stroke="#ffffff" strokeWidth="3" strokeLinecap="round" strokeOpacity="0.85" />
      <defs>
        <linearGradient id="orangeRingGrad" x1="10" y1="8" x2="44" y2="44">
          <stop stopColor="#fdba74" />
          <stop offset="0.4" stopColor="#fb923c" />
          <stop offset="0.8" stopColor="#f97316" />
          <stop offset="1" stopColor="#ea580c" />
        </linearGradient>
      </defs>
    </svg>
  );
};

// Renders obstacle overlays matching the asset sheet:
// - Ice: Transparent Blue Ice Block with Frozen Gummy Bear inside! (Row 8, Col 4 & 5)
// - Chain: Golden Ribbon Lock (Row 4, Gift Boxes)
export const CandyObstacleOverlay: React.FC<{
  type: ObstacleType;
}> = ({ type }) => {
  if (type === 'ice') {
    return (
      <div className="absolute inset-0 z-10 pointer-events-none flex items-center justify-center p-0.5">
        <svg viewBox="0 0 54 54" className="w-full h-full filter drop-shadow-md">
          {/* Ice Block Frame */}
          <rect
            x="3"
            y="3"
            width="48"
            height="48"
            rx="10"
            fill="url(#iceBlockGrad)"
            stroke="#e0f2fe"
            strokeWidth="2"
            strokeOpacity="0.9"
          />
          {/* Crack lines on ice */}
          <path d="M8 12L20 22L16 34" stroke="#ffffff" strokeWidth="1.5" strokeLinecap="round" opacity="0.8" />
          <path d="M46 14L34 26L40 40" stroke="#ffffff" strokeWidth="1.5" strokeLinecap="round" opacity="0.8" />
          {/* Frozen Gummy Bear silhouette */}
          <ellipse cx="27" cy="30" rx="9" ry="11" fill="#38bdf8" fillOpacity="0.35" />
          <circle cx="27" cy="18" r="7" fill="#38bdf8" fillOpacity="0.35" />
          <circle cx="21" cy="14" r="3" fill="#38bdf8" fillOpacity="0.35" />
          <circle cx="33" cy="14" r="3" fill="#38bdf8" fillOpacity="0.35" />
          {/* Ice Surface Specular Gloss */}
          <path d="M10 8C20 6 36 6 44 8" stroke="#ffffff" strokeWidth="2" strokeLinecap="round" opacity="0.9" />
          <defs>
            <linearGradient id="iceBlockGrad" x1="4" y1="4" x2="50" y2="50">
              <stop stopColor="#bae6fd" stopOpacity="0.75" />
              <stop offset="0.5" stopColor="#38bdf8" stopOpacity="0.45" />
              <stop offset="1" stopColor="#0284c7" stopOpacity="0.7" />
            </linearGradient>
          </defs>
        </svg>
      </div>
    );
  }

  if (type === 'chain') {
    return (
      <div className="absolute inset-0 z-10 pointer-events-none flex items-center justify-center p-0.5">
        <svg viewBox="0 0 54 54" className="w-full h-full">
          {/* Crossed Golden Ribbon */}
          <line x1="6" y1="6" x2="48" y2="48" stroke="#f59e0b" strokeWidth="4.5" strokeLinecap="round" />
          <line x1="6" y1="6" x2="48" y2="48" stroke="#fef08a" strokeWidth="2" strokeLinecap="round" />
          <line x1="48" y1="6" x2="6" y2="48" stroke="#f59e0b" strokeWidth="4.5" strokeLinecap="round" />
          <line x1="48" y1="6" x2="6" y2="48" stroke="#fef08a" strokeWidth="2" strokeLinecap="round" />
          {/* Purple Bow Ribbon (Gift Box Ribbon) */}
          <ellipse cx="21" cy="23" rx="5" ry="3" fill="#d946ef" transform="rotate(-30 21 23)" />
          <ellipse cx="33" cy="23" rx="5" ry="3" fill="#d946ef" transform="rotate(30 33 23)" />
          <circle cx="27" cy="25" r="4.5" fill="#a855f7" stroke="#fef08a" strokeWidth="1" />
        </svg>
      </div>
    );
  }

  return null;
};
