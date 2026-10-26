import React from "react";

export interface JewelPalette {
  name: string;
  outerTop: string;
  outerBottom: string;
  midTop: string;
  midBottom: string;
  core: string;
  spec: string;
  rim: string;
  glow: string;
}

export const JEWEL_PALETTES: Record<number, JewelPalette> = {
  1: {
    name: "Hồng Ngọc Lửa (Ruby)",
    outerTop: "#ff6b8b",
    outerBottom: "#9f1239",
    midTop: "#f43f5e",
    midBottom: "#be123c",
    core: "#ffe4e6",
    spec: "#ffffff",
    rim: "#fbbf24",
    glow: "rgba(244, 63, 94, 0.75)",
  },
  2: {
    name: "Hoàng Ngọc Mặt Trời (Topaz)",
    outerTop: "#fde047",
    outerBottom: "#b45309",
    midTop: "#f59e0b",
    midBottom: "#d97706",
    core: "#fef9c3",
    spec: "#ffffff",
    rim: "#fde68a",
    glow: "rgba(245, 158, 11, 0.78)",
  },
  3: {
    name: "Ngọc Lục Bảo (Emerald)",
    outerTop: "#6ee7b7",
    outerBottom: "#065f46",
    midTop: "#10b981",
    midBottom: "#047857",
    core: "#d1fae5",
    spec: "#ffffff",
    rim: "#fcd34d",
    glow: "rgba(16, 185, 129, 0.75)",
  },
  4: {
    name: "Lam Ngọc Đại Dương (Sapphire)",
    outerTop: "#60a5fa",
    outerBottom: "#1e3a8a",
    midTop: "#3b82f6",
    midBottom: "#1d4ed8",
    core: "#dbeafe",
    spec: "#ffffff",
    rim: "#93c5fd",
    glow: "rgba(59, 130, 246, 0.78)",
  },
  5: {
    name: "Tử Thạch Tinh Vân (Amethyst)",
    outerTop: "#c084fc",
    outerBottom: "#581c87",
    midTop: "#9333ea",
    midBottom: "#6b21a8",
    core: "#f3e8ff",
    spec: "#ffffff",
    rim: "#f0abfc",
    glow: "rgba(168, 85, 247, 0.78)",
  },
  6: {
    name: "Kim Cương Ánh Hồng (Prism)",
    outerTop: "#f472b6",
    outerBottom: "#831843",
    midTop: "#ec4899",
    midBottom: "#be185d",
    core: "#fce7f3",
    spec: "#22d3ee",
    rim: "#fde047",
    glow: "rgba(236, 72, 153, 0.78)",
  },
};

export const JewelBlockSvg: React.FC<{
  color: number;
  gem?: boolean;
  ice?: number;
}> = ({ color, gem, ice }) => {
  const pal = JEWEL_PALETTES[color] || JEWEL_PALETTES[1];
  const uid = `jw-${color}-${gem ? "g" : "n"}-${ice ? "i" : "0"}`;

  return (
    <svg
      className="bp-jewel-svg"
      viewBox="0 0 100 100"
      aria-hidden="true"
      focusable="false"
    >
      <defs>
        <linearGradient id={`${uid}-outer`} x1="0" y1="0" x2="1" y2="1">
          <stop offset="0%" stopColor={ice ? "#e0f2fe" : pal.outerTop} />
          <stop offset="100%" stopColor={ice ? "#0284c7" : pal.outerBottom} />
        </linearGradient>
        <linearGradient id={`${uid}-inner`} x1="0" y1="0" x2="1" y2="1">
          <stop offset="0%" stopColor={ice ? "#bae6fd" : pal.midTop} />
          <stop offset="55%" stopColor={ice ? "#38bdf8" : pal.midBottom} />
          <stop offset="100%" stopColor={ice ? "#0369a1" : pal.outerBottom} />
        </linearGradient>
        <radialGradient id={`${uid}-core`} cx="38%" cy="34%" r="62%">
          <stop offset="0%" stopColor={ice ? "#ffffff" : pal.core} stopOpacity="0.95" />
          <stop offset="45%" stopColor={ice ? "#7dd3fc" : pal.midTop} stopOpacity="0.55" />
          <stop offset="100%" stopColor={ice ? "#0c4a6e" : pal.outerBottom} stopOpacity="0" />
        </radialGradient>
        <linearGradient id={`${uid}-gold`} x1="0" y1="0" x2="1" y2="1">
          <stop offset="0%" stopColor="#fef08a" />
          <stop offset="50%" stopColor="#f59e0b" />
          <stop offset="100%" stopColor="#78350f" />
        </linearGradient>
      </defs>

      {/* Outer Carved Gold / Obsidian Bezel */}
      <rect
        x="2"
        y="2"
        width="96"
        height="96"
        rx="16"
        fill={`url(#${uid}-outer)`}
        stroke={gem ? "#fde047" : ice ? "#bae6fd" : pal.rim}
        strokeWidth={gem ? "4" : "2.5"}
      />

      {/* 4 Faceted Trapezoid Bevels (Top, Right, Bottom, Left) */}
      {/* Top Facet (Brightest) */}
      <polygon
        points="10,8 90,8 76,24 24,24"
        fill="#ffffff"
        fillOpacity={ice ? "0.6" : "0.42"}
      />
      {/* Left Facet (Lit) */}
      <polygon
        points="8,10 24,24 24,76 8,90"
        fill="#ffffff"
        fillOpacity="0.22"
      />
      {/* Right Facet (Shaded) */}
      <polygon
        points="92,10 92,90 76,76 76,24"
        fill="#000000"
        fillOpacity="0.28"
      />
      {/* Bottom Facet (Deepest Shade) */}
      <polygon
        points="24,76 76,76 90,92 10,92"
        fill="#000000"
        fillOpacity="0.42"
      />

      {/* Diagonal Corner Facet Lines */}
      <line x1="6" y1="6" x2="24" y2="24" stroke="#ffffff" strokeOpacity="0.65" strokeWidth="2" />
      <line x1="94" y1="6" x2="76" y2="24" stroke="#ffffff" strokeOpacity="0.4" strokeWidth="1.8" />
      <line x1="6" y1="94" x2="24" y2="76" stroke="#000000" strokeOpacity="0.45" strokeWidth="2" />
      <line x1="94" y1="94" x2="76" y2="76" stroke="#000000" strokeOpacity="0.55" strokeWidth="2" />

      {/* Inner Crown Table of the Gemstone */}
      <rect
        x="22"
        y="22"
        width="56"
        height="56"
        rx="8"
        fill={`url(#${uid}-inner)`}
        stroke="#ffffff"
        strokeOpacity="0.55"
        strokeWidth="1.8"
      />

      {/* Inner Diamond Refraction Cut */}
      <polygon
        points="50,24 76,50 50,76 24,50"
        fill={`url(#${uid}-core)`}
        stroke="#ffffff"
        strokeOpacity="0.35"
        strokeWidth="1.2"
      />

      {/* Golden Corner Clasps for Luxury Jewel Look */}
      <polygon points="2,18 18,2 2,2" fill={`url(#${uid}-gold)`} opacity="0.85" />
      <polygon points="82,2 98,18 98,2" fill={`url(#${uid}-gold)`} opacity="0.85" />
      <polygon points="2,82 18,98 2,98" fill={`url(#${uid}-gold)`} opacity="0.85" />
      <polygon points="82,98 98,82 98,98" fill={`url(#${uid}-gold)`} opacity="0.85" />

      {/* Top-Left Specular Star Gleam */}
      <ellipse
        cx="31"
        cy="29"
        rx="12"
        ry="5"
        transform="rotate(-28 31 29)"
        fill="#ffffff"
        fillOpacity="0.78"
      />
      <circle cx="67" cy="68" r="3.5" fill={pal.spec} fillOpacity="0.6" />

      {/* Star Core Jewel Overlay (when gem === true and not ice) */}
      {gem && !ice && (
        <g className="bp-jewel-star-core">
          <circle cx="50" cy="50" r="22" fill="#fde047" fillOpacity="0.22" />
          <polygon
            points="50,16 57,41 82,50 57,59 50,84 43,59 18,50 43,41"
            fill={`url(#${uid}-gold)`}
            stroke="#ffffff"
            strokeWidth="2"
          />
          <polygon
            points="50,26 54,44 72,50 54,56 50,74 46,56 28,50 46,44"
            fill="#fef9c3"
          />
          <circle cx="50" cy="50" r="5" fill="#ffffff" />
        </g>
      )}

      {/* Frozen Cryo Crystal Overlay (when ice > 0) */}
      {Boolean(ice) && (
        <g className="bp-jewel-ice-core">
          <path
            d="M8,6 H92 L88,26 L78,14 L66,28 L52,12 L38,26 L24,14 L12,28 Z"
            fill="#e0f2fe"
            fillOpacity="0.88"
          />
          <path
            d="M28,28 L46,48 L36,68 M72,32 L54,52 L68,72"
            fill="none"
            stroke="#ffffff"
            strokeWidth="3"
            strokeLinecap="round"
          />
          <g stroke="#ffffff" strokeWidth="3.2" strokeLinecap="round">
            <line x1="50" y1="24" x2="50" y2="76" />
            <line x1="24" y1="50" x2="76" y2="50" />
            <line x1="32" y1="32" x2="68" y2="68" />
            <line x1="68" y1="32" x2="32" y2="68" />
          </g>
          <circle cx="50" cy="50" r="7" fill="#e0f2fe" stroke="#0284c7" strokeWidth="2" />
        </g>
      )}
    </svg>
  );
};

export const BoosterRelicSvg: React.FC<{
  kind: "hammer" | "shuffle" | "undo" | "rotate" | "hint";
  size?: number;
}> = ({ kind, size = 24 }) => {
  switch (kind) {
    case "hammer":
      return (
        <svg width={size} height={size} viewBox="0 0 64 64" aria-hidden="true">
          <defs>
            <linearGradient id="relic-gold" x1="0" y1="0" x2="1" y2="1">
              <stop offset="0%" stopColor="#fef08a" />
              <stop offset="50%" stopColor="#f59e0b" />
              <stop offset="100%" stopColor="#92400e" />
            </linearGradient>
            <linearGradient id="relic-cyan" x1="0" y1="0" x2="1" y2="1">
              <stop offset="0%" stopColor="#e0f2fe" />
              <stop offset="50%" stopColor="#38bdf8" />
              <stop offset="100%" stopColor="#0369a1" />
            </linearGradient>
          </defs>
          <circle cx="32" cy="32" r="28" fill="#1e1b4b" stroke="url(#relic-gold)" strokeWidth="3" />
          <line x1="18" y1="48" x2="38" y2="28" stroke="url(#relic-gold)" strokeWidth="7" strokeLinecap="round" />
          <g transform="rotate(-42 36 24)">
            <rect x="20" y="13" width="32" height="18" rx="4" fill="url(#relic-cyan)" stroke="url(#relic-gold)" strokeWidth="3" />
            <polygon points="36,16 44,22 36,28 28,22" fill="#ffffff" opacity="0.85" />
          </g>
          <circle cx="16" cy="50" r="4" fill="#38bdf8" stroke="#fef08a" strokeWidth="1.5" />
        </svg>
      );
    case "shuffle":
      return (
        <svg width={size} height={size} viewBox="0 0 64 64" aria-hidden="true">
          <circle cx="32" cy="32" r="28" fill="#1e1b4b" stroke="#34d399" strokeWidth="3" />
          <path
            d="M18 26 A15 15 0 0 1 45 22"
            fill="none"
            stroke="#6ee7b7"
            strokeWidth="5"
            strokeLinecap="round"
          />
          <polygon points="48,15 51,28 39,25" fill="#fde047" />
          <path
            d="M46 38 A15 15 0 0 1 19 42"
            fill="none"
            stroke="#f472b6"
            strokeWidth="5"
            strokeLinecap="round"
          />
          <polygon points="16,49 13,36 25,39" fill="#fde047" />
          <circle cx="32" cy="32" r="6" fill="#fef08a" />
        </svg>
      );
    case "undo":
      return (
        <svg width={size} height={size} viewBox="0 0 64 64" aria-hidden="true">
          <circle cx="32" cy="32" r="28" fill="#1e1b4b" stroke="#60a5fa" strokeWidth="3" />
          <path
            d="M22 16 H42 L34 32 L42 48 H22 L30 32 Z"
            fill="#38bdf8"
            fillOpacity="0.35"
            stroke="#fef08a"
            strokeWidth="3"
            strokeLinejoin="round"
          />
          <line x1="18" y1="16" x2="46" y2="16" stroke="#f59e0b" strokeWidth="4" strokeLinecap="round" />
          <line x1="18" y1="48" x2="46" y2="48" stroke="#f59e0b" strokeWidth="4" strokeLinecap="round" />
          <circle cx="32" cy="24" r="4" fill="#fde047" />
          <polygon points="25,45 39,45 32,37" fill="#fde047" />
        </svg>
      );
    case "rotate":
      return (
        <svg width={size} height={size} viewBox="0 0 64 64" aria-hidden="true">
          <circle cx="32" cy="32" r="28" fill="#1e1b4b" stroke="#c084fc" strokeWidth="3" />
          <path
            d="M32 14 A18 18 0 1 1 15 38"
            fill="none"
            stroke="#e879f9"
            strokeWidth="5"
            strokeLinecap="round"
          />
          <polygon points="32,7 43,15 31,22" fill="#fde047" />
          <polygon points="32,24 40,32 32,40 24,32" fill="#38bdf8" stroke="#ffffff" strokeWidth="1.5" />
        </svg>
      );
    case "hint":
      return (
        <svg width={size} height={size} viewBox="0 0 64 64" aria-hidden="true">
          <circle cx="32" cy="32" r="28" fill="#1e1b4b" stroke="#fde047" strokeWidth="3" />
          <circle cx="32" cy="28" r="14" fill="#f59e0b" fillOpacity="0.35" stroke="#fef08a" strokeWidth="3" />
          <polygon
            points="32,14 35,24 45,28 35,32 32,42 29,32 19,28 29,24"
            fill="#fef9c3"
          />
          <rect x="25" y="44" width="14" height="6" rx="3" fill="#f59e0b" />
        </svg>
      );
  }
};
