import React from 'react';
import { TileColor, SpecialType, ObstacleType } from './types';

// Renders the exact sweet bakery cupcake / pastry matching the tile's color & state
export const BakeryItemIcon: React.FC<{
  color: TileColor;
  special?: SpecialType;
  obstacle?: ObstacleType;
  className?: string;
}> = ({ color, special, obstacle, className = 'w-full h-full' }) => {
  // If Obstacle is a Wooden Crate / Stone (Thùng Gỗ)
  if (obstacle === 'stone') {
    return (
      <svg viewBox="0 0 48 48" className={className} fill="none">
        {/* Red wooden crate base */}
        <rect x="6" y="8" width="36" height="32" rx="4" fill="#dc2626" stroke="#991b1b" strokeWidth="2.5" />
        {/* Wooden planks */}
        <line x1="6" y1="18" x2="42" y2="18" stroke="#7f1d1d" strokeWidth="2" />
        <line x1="6" y1="28" x2="42" y2="28" stroke="#7f1d1d" strokeWidth="2" />
        {/* Gold lock/seal in middle */}
        <circle cx="24" cy="24" r="5" fill="#facc15" stroke="#ca8a04" strokeWidth="1.5" />
        <circle cx="24" cy="24" r="2.5" fill="#ca8a04" />
        {/* Reinforced metal corners */}
        <rect x="6" y="8" width="6" height="6" fill="#7f1d1d" />
        <rect x="36" y="8" width="6" height="6" fill="#7f1d1d" />
        <rect x="6" y="34" width="6" height="6" fill="#7f1d1d" />
        <rect x="36" y="34" width="6" height="6" fill="#7f1d1d" />
      </svg>
    );
  }

  // If Special is Rainbow Cloche / Rainbow Roll (Bánh Cuộn Cầu Vồng Lồng Kính)
  if (special === 'rainbow') {
    return (
      <svg viewBox="0 0 48 48" className={className} fill="none">
        {/* Glass Dome */}
        <path
          d="M10 38C10 22 16 12 24 12C32 12 38 22 38 38H10Z"
          fill="url(#rainbowDome)"
          stroke="#38bdf8"
          strokeWidth="1.5"
        />
        {/* Glass Shine */}
        <path d="M15 36C15 25 18 16 23 15" stroke="white" strokeWidth="2" strokeLinecap="round" opacity="0.8" />
        {/* Rainbow Swirl Cake inside */}
        <ellipse cx="24" cy="30" rx="9" ry="8" fill="url(#rainbowSwirl)" />
        {/* Pink Ribbon / Cloche Top Handle */}
        <circle cx="24" cy="11" r="3" fill="#f43f5e" stroke="#ffe4e6" strokeWidth="1" />
        <path d="M21 11C21 8 27 8 27 11" stroke="#f43f5e" strokeWidth="2" />
        {/* Base Plate */}
        <ellipse cx="24" cy="38" rx="15" ry="3.5" fill="#0284c7" stroke="#38bdf8" strokeWidth="1.5" />
        <defs>
          <linearGradient id="rainbowDome" x1="10" y1="12" x2="38" y2="38">
            <stop stopColor="#e0f2fe" stopOpacity="0.85" />
            <stop offset="0.6" stopColor="#bae6fd" stopOpacity="0.5" />
            <stop offset="1" stopColor="#38bdf8" stopOpacity="0.75" />
          </linearGradient>
          <linearGradient id="rainbowSwirl" x1="15" y1="22" x2="33" y2="38">
            <stop stopColor="#ef4444" />
            <stop offset="0.25" stopColor="#f59e0b" />
            <stop offset="0.5" stopColor="#10b981" />
            <stop offset="0.75" stopColor="#06b6d4" />
            <stop offset="1" stopColor="#a855f7" />
          </linearGradient>
        </defs>
      </svg>
    );
  }

  // If Special is Rocket (Tên Lửa Kẹo Pháo)
  if (special === 'rocket_h' || special === 'rocket_d') {
    return (
      <svg viewBox="0 0 48 48" className={className} fill="none">
        {/* Rocket Body */}
        <rect x="8" y="18" width="32" height="12" rx="6" fill="#f43f5e" stroke="#ffe4e6" strokeWidth="1.5" />
        {/* Stripes */}
        <path d="M16 18L12 30" stroke="white" strokeWidth="3" strokeLinecap="round" />
        <path d="M24 18L20 30" stroke="white" strokeWidth="3" strokeLinecap="round" />
        <path d="M32 18L28 30" stroke="white" strokeWidth="3" strokeLinecap="round" />
        {/* Laser Glow Tips */}
        <polygon points="6,24 10,17 10,31" fill="#fbbf24" />
        <polygon points="42,24 38,17 38,31" fill="#38bdf8" />
        <circle cx="24" cy="24" r="3" fill="#facc15" className="animate-ping" />
      </svg>
    );
  }

  // If Special is Cake Bomb (Bánh Kem Nổ Đa Tầng)
  if (special === 'bomb') {
    return (
      <svg viewBox="0 0 48 48" className={className} fill="none">
        {/* Cake Tier Base */}
        <ellipse cx="24" cy="36" rx="14" ry="5" fill="#f43f5e" />
        <rect x="10" y="25" width="28" height="11" fill="#fb7185" />
        <ellipse cx="24" cy="25" rx="14" ry="4.5" fill="#fbcfe8" />
        {/* Frosting drips */}
        <path d="M10 25C13 28 15 28 18 25C21 28 23 28 26 25C29 28 32 28 38 25" stroke="#f43f5e" strokeWidth="2.5" fill="none" />
        {/* Cherries / Sparklers on top */}
        <circle cx="24" cy="18" r="4" fill="#dc2626" stroke="#fef08a" strokeWidth="1" />
        <circle cx="18" cy="20" r="3" fill="#f59e0b" />
        <circle cx="30" cy="20" r="3" fill="#06b6d4" />
        {/* Sparkle spark */}
        <path d="M24 10L24 14M22 12L26 12" stroke="#facc15" strokeWidth="2" strokeLinecap="round" />
      </svg>
    );
  }

  // Normal Cupcake Sprites based on Color
  // 1. ROSE / PINK (Strawberry Cream Cupcake)
  if (color === '#f43f5e') {
    return (
      <svg viewBox="0 0 48 48" className={className} fill="none">
        {/* Cup */}
        <path d="M14 26L16 40C16 41.5 18 42.5 24 42.5C30 42.5 32 41.5 32 40L34 26H14Z" fill="#fbcfe8" stroke="#f43f5e" strokeWidth="1.5" />
        {/* Cup pleats */}
        <line x1="20" y1="28" x2="20" y2="41" stroke="#f472b6" strokeWidth="1.2" />
        <line x1="24" y1="28" x2="24" y2="42" stroke="#f472b6" strokeWidth="1.2" />
        <line x1="28" y1="28" x2="28" y2="41" stroke="#f472b6" strokeWidth="1.2" />
        {/* Swirled Pink Frosting */}
        <path d="M12 26C12 22 17 20 24 20C31 20 36 22 36 26C36 28 32 29 24 29C16 29 12 28 12 26Z" fill="#fb7185" />
        <path d="M16 21C16 16 19 14 24 14C29 14 32 16 32 21C32 23 29 24 24 24C19 24 16 23 16 21Z" fill="#f43f5e" />
        {/* Top Dollop Swirl */}
        <path d="M20 15C20 11 22 9 24 9C26 9 28 11 28 15C28 16.5 26 17 24 17C22 17 20 16.5 20 15Z" fill="#fbcfe8" />
        {/* Red Cherry On Top */}
        <circle cx="24" cy="8" r="3" fill="#dc2626" />
        <path d="M24 6C24 4 27 3 28 4" stroke="#15803d" strokeWidth="1.2" strokeLinecap="round" />
        {/* Sprinkles */}
        <circle cx="20" cy="22" r="1" fill="#fef08a" />
        <circle cx="27" cy="21" r="1" fill="#67e8f9" />
        <circle cx="23" cy="26" r="1" fill="#ffffff" />
      </svg>
    );
  }

  // 2. CYAN / BLUE (Blueberry Vanilla Cupcake)
  if (color === '#06b6d4') {
    return (
      <svg viewBox="0 0 48 48" className={className} fill="none">
        {/* Cup */}
        <path d="M14 26L16 40C16 41.5 18 42.5 24 42.5C30 42.5 32 41.5 32 40L34 26H14Z" fill="#cffafe" stroke="#06b6d4" strokeWidth="1.5" />
        <line x1="20" y1="28" x2="20" y2="41" stroke="#38bdf8" strokeWidth="1.2" />
        <line x1="24" y1="28" x2="24" y2="42" stroke="#38bdf8" strokeWidth="1.2" />
        <line x1="28" y1="28" x2="28" y2="41" stroke="#38bdf8" strokeWidth="1.2" />
        {/* Swirled Blue Frosting */}
        <path d="M12 26C12 22 17 20 24 20C31 20 36 22 36 26C36 28 32 29 24 29C16 29 12 28 12 26Z" fill="#38bdf8" />
        <path d="M16 21C16 16 19 14 24 14C29 14 32 16 32 21C32 23 29 24 24 24C19 24 16 23 16 21Z" fill="#0284c7" />
        <path d="M20 15C20 11 22 9 24 9C26 9 28 11 28 15C28 16.5 26 17 24 17C22 17 20 16.5 20 15Z" fill="#e0f2fe" />
        {/* Blueberries On Top */}
        <circle cx="23" cy="8.5" r="2.5" fill="#1e3a8a" />
        <circle cx="26" cy="9.5" r="2" fill="#3b82f6" />
        {/* Highlights */}
        <circle cx="20" cy="22" r="1" fill="#ffffff" />
        <circle cx="28" cy="22" r="1" fill="#fef08a" />
      </svg>
    );
  }

  // 3. AMBER / YELLOW (Vanilla Orange Citrus Cupcake)
  if (color === '#fbbf24') {
    return (
      <svg viewBox="0 0 48 48" className={className} fill="none">
        {/* Cup */}
        <path d="M14 26L16 40C16 41.5 18 42.5 24 42.5C30 42.5 32 41.5 32 40L34 26H14Z" fill="#fef3c7" stroke="#f59e0b" strokeWidth="1.5" />
        <line x1="20" y1="28" x2="20" y2="41" stroke="#fbbf24" strokeWidth="1.2" />
        <line x1="24" y1="28" x2="24" y2="42" stroke="#fbbf24" strokeWidth="1.2" />
        <line x1="28" y1="28" x2="28" y2="41" stroke="#fbbf24" strokeWidth="1.2" />
        {/* Swirled Orange Frosting */}
        <path d="M12 26C12 22 17 20 24 20C31 20 36 22 36 26C36 28 32 29 24 29C16 29 12 28 12 26Z" fill="#f59e0b" />
        <path d="M16 21C16 16 19 14 24 14C29 14 32 16 32 21C32 23 29 24 24 24C19 24 16 23 16 21Z" fill="#fbbf24" />
        <path d="M20 15C20 11 22 9 24 9C26 9 28 11 28 15C28 16.5 26 17 24 17C22 17 20 16.5 20 15Z" fill="#fffbeb" />
        {/* Orange Slice On Top */}
        <path d="M21 9C21 6 27 6 27 9Z" fill="#f97316" stroke="#ea580c" strokeWidth="1" />
        {/* Sprinkles */}
        <circle cx="21" cy="22" r="1" fill="#ef4444" />
        <circle cx="27" cy="23" r="1" fill="#ffffff" />
      </svg>
    );
  }

  // 4. EMERALD / GREEN (Mint Lime Cupcake)
  if (color === '#10b981') {
    return (
      <svg viewBox="0 0 48 48" className={className} fill="none">
        {/* Cup */}
        <path d="M14 26L16 40C16 41.5 18 42.5 24 42.5C30 42.5 32 41.5 32 40L34 26H14Z" fill="#d1fae5" stroke="#10b981" strokeWidth="1.5" />
        <line x1="20" y1="28" x2="20" y2="41" stroke="#34d399" strokeWidth="1.2" />
        <line x1="24" y1="28" x2="24" y2="42" stroke="#34d399" strokeWidth="1.2" />
        <line x1="28" y1="28" x2="28" y2="41" stroke="#34d399" strokeWidth="1.2" />
        {/* Swirled Mint Frosting */}
        <path d="M12 26C12 22 17 20 24 20C31 20 36 22 36 26C36 28 32 29 24 29C16 29 12 28 12 26Z" fill="#34d399" />
        <path d="M16 21C16 16 19 14 24 14C29 14 32 16 32 21C32 23 29 24 24 24C19 24 16 23 16 21Z" fill="#059669" />
        <path d="M20 15C20 11 22 9 24 9C26 9 28 11 28 15C28 16.5 26 17 24 17C22 17 20 16.5 20 15Z" fill="#ecfdf5" />
        {/* Mint Leaf on Top */}
        <path d="M23 9C21 7 24 5 26 6C27 8 25 10 23 9Z" fill="#047857" />
        {/* Choco Sprinkles */}
        <circle cx="19" cy="22" r="1" fill="#78350f" />
        <circle cx="28" cy="22" r="1" fill="#78350f" />
      </svg>
    );
  }

  // 5. PURPLE (Lavender Berry Cupcake)
  if (color === '#a855f7') {
    return (
      <svg viewBox="0 0 48 48" className={className} fill="none">
        {/* Cup */}
        <path d="M14 26L16 40C16 41.5 18 42.5 24 42.5C30 42.5 32 41.5 32 40L34 26H14Z" fill="#f3e8ff" stroke="#a855f7" strokeWidth="1.5" />
        <line x1="20" y1="28" x2="20" y2="41" stroke="#c084fc" strokeWidth="1.2" />
        <line x1="24" y1="28" x2="24" y2="42" stroke="#c084fc" strokeWidth="1.2" />
        <line x1="28" y1="28" x2="28" y2="41" stroke="#c084fc" strokeWidth="1.2" />
        {/* Swirled Purple Frosting */}
        <path d="M12 26C12 22 17 20 24 20C31 20 36 22 36 26C36 28 32 29 24 29C16 29 12 28 12 26Z" fill="#c084fc" />
        <path d="M16 21C16 16 19 14 24 14C29 14 32 16 32 21C32 23 29 24 24 24C19 24 16 23 16 21Z" fill="#7e22ce" />
        <path d="M20 15C20 11 22 9 24 9C26 9 28 11 28 15C28 16.5 26 17 24 17C22 17 20 16.5 20 15Z" fill="#faf5ff" />
        {/* Purple Berry Top */}
        <circle cx="24" cy="8.5" r="3" fill="#6b21a8" />
        {/* Sprinkles */}
        <circle cx="20" cy="22" r="1" fill="#fde047" />
        <circle cx="27" cy="22" r="1" fill="#f472b6" />
      </svg>
    );
  }

  // 6. ORANGE / PEACH
  return (
    <svg viewBox="0 0 48 48" className={className} fill="none">
      {/* Cup */}
      <path d="M14 26L16 40C16 41.5 18 42.5 24 42.5C30 42.5 32 41.5 32 40L34 26H14Z" fill="#ffedd5" stroke="#f97316" strokeWidth="1.5" />
      <line x1="20" y1="28" x2="20" y2="41" stroke="#fb923c" strokeWidth="1.2" />
      <line x1="24" y1="28" x2="24" y2="42" stroke="#fb923c" strokeWidth="1.2" />
      <line x1="28" y1="28" x2="28" y2="41" stroke="#fb923c" strokeWidth="1.2" />
      {/* Swirled Orange Frosting */}
      <path d="M12 26C12 22 17 20 24 20C31 20 36 22 36 26C36 28 32 29 24 29C16 29 12 28 12 26Z" fill="#fb923c" />
      <path d="M16 21C16 16 19 14 24 14C29 14 32 16 32 21C32 23 29 24 24 24C19 24 16 23 16 21Z" fill="#c2410c" />
      <path d="M20 15C20 11 22 9 24 9C26 9 28 11 28 15C28 16.5 26 17 24 17C22 17 20 16.5 20 15Z" fill="#fff7ed" />
      {/* Peach Slice on Top */}
      <ellipse cx="24" cy="8.5" rx="3.5" ry="2.5" fill="#ea580c" />
      {/* Sprinkles */}
      <circle cx="21" cy="22" r="1" fill="#ffffff" />
      <circle cx="27" cy="22" r="1" fill="#facc15" />
    </svg>
  );
};

// Renders the Obstacle overlays: Pink Jelly, Glass Cloche, or Locked Chain
export const BakeryObstacleOverlay: React.FC<{
  type: ObstacleType;
}> = ({ type }) => {
  if (type === 'ice') {
    // Pink Jelly / Strawberry Jello Mold (matching the image)
    return (
      <div className="absolute inset-0 z-10 pointer-events-none flex items-center justify-center">
        <svg viewBox="0 0 48 48" className="w-full h-full opacity-90 filter drop-shadow">
          {/* Jelly Mold Shape */}
          <path
            d="M12 16C12 12 17 10 24 10C31 10 36 12 36 16L38 36C38 40 33 42 24 42C15 42 10 40 10 36L12 16Z"
            fill="url(#pinkJellyGrad)"
            stroke="#f43f5e"
            strokeWidth="1.5"
          />
          {/* Glossy Highlights */}
          <path d="M16 16C16 13 19 12 24 12" stroke="white" strokeWidth="2.5" strokeLinecap="round" opacity="0.85" />
          <path d="M14 20L13 34" stroke="white" strokeWidth="2" strokeLinecap="round" opacity="0.6" />
          <defs>
            <linearGradient id="pinkJellyGrad" x1="12" y1="10" x2="36" y2="42">
              <stop stopColor="#f472b6" stopOpacity="0.8" />
              <stop offset="0.5" stopColor="#f43f5e" stopOpacity="0.6" />
              <stop offset="1" stopColor="#be123c" stopOpacity="0.85" />
            </linearGradient>
          </defs>
        </svg>
      </div>
    );
  }

  if (type === 'chain') {
    // Golden Ribbon & Lock
    return (
      <div className="absolute inset-0 z-10 pointer-events-none flex items-center justify-center">
        <svg viewBox="0 0 48 48" className="w-full h-full">
          {/* Crossed Golden Ribbon */}
          <line x1="8" y1="8" x2="40" y2="40" stroke="#f59e0b" strokeWidth="4" strokeLinecap="round" />
          <line x1="8" y1="8" x2="40" y2="40" stroke="#fef08a" strokeWidth="2" strokeLinecap="round" />
          <line x1="40" y1="8" x2="8" y2="40" stroke="#f59e0b" strokeWidth="4" strokeLinecap="round" />
          <line x1="40" y1="8" x2="8" y2="40" stroke="#fef08a" strokeWidth="2" strokeLinecap="round" />
          {/* Padlock in Center */}
          <rect x="18" y="22" width="12" height="10" rx="2" fill="#d97706" stroke="#fef08a" strokeWidth="1.5" />
          <path d="M21 22V18C21 16 23 15 24 15C25 15 27 16 27 18V22" stroke="#fef08a" strokeWidth="2" fill="none" />
          <circle cx="24" cy="26" r="1.5" fill="#78350f" />
        </svg>
      </div>
    );
  }

  return null;
};
