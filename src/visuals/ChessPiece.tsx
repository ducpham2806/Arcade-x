import React, { useMemo } from 'react';
import type { PieceSymbol, Color } from 'chess.js';

interface Palette {
  stoneHi: string;
  stoneLight: string;
  stoneMid: string;
  stoneDark: string;
  stoneDeep: string;
  armorHi: string;
  armorMid: string;
  armorDark: string;
  outline: string;
  glowCore: string;
  glowMid: string;
  glowOuter: string;
  arcaneMid?: string;
  capeLight: string;
  capeDark: string;
  pedestalTop: string;
  pedestalSide: string;
  pedestalRune: string;
}

export function getWizardPalette(color: Color): Palette {
  if (color === 'w') {
    // Ivory Alabaster Marble, Antique Gold Armor & Warm Golden Arcane Runes
    return {
      stoneHi: '#fffdf7',
      stoneLight: '#f5ebd6',
      stoneMid: '#d8c39e',
      stoneDark: '#9e845b',
      stoneDeep: '#59462b',
      armorHi: '#fff3b0',
      armorMid: '#e0a945',
      armorDark: '#8c5b14',
      outline: '#2b1e10',
      glowCore: '#fffbeb',
      glowMid: '#fbbf24',
      glowOuter: '#f59e0b',
      capeLight: '#e6d5b8',
      capeDark: '#786140',
      pedestalTop: '#ede0c8',
      pedestalSide: '#8c734b',
      pedestalRune: '#ffd966',
    };
  }
  // Dark Obsidian Basalt, Shadow Iron & Fiery Lava / Violet Arcane Runes
  return {
    stoneHi: '#7c8ba6',
    stoneLight: '#49566e',
    stoneMid: '#283142',
    stoneDark: '#161b26',
    stoneDeep: '#090c12',
    armorHi: '#94a3b8',
    armorMid: '#334155',
    armorDark: '#0f172a',
    outline: '#05070b',
    glowCore: '#fef08a',
    glowMid: '#f97316',
    glowOuter: '#e11d48',
    arcaneMid: '#c084fc',
    capeLight: '#312e48',
    capeDark: '#110f1d',
    pedestalTop: '#333d52',
    pedestalSide: '#151a24',
    pedestalRune: '#fb7185',
  };
}

function commonDefs(p: Palette, color: Color) {
  const isW = color === 'w';
  const runeGlow = isW ? p.glowMid : p.arcaneMid || p.glowMid;
  return `
    <defs>
      <linearGradient id="stoneBody" x1="0.15" y1="0.05" x2="0.85" y2="0.95">
        <stop offset="0%" stop-color="${p.stoneHi}"/>
        <stop offset="28%" stop-color="${p.stoneLight}"/>
        <stop offset="68%" stop-color="${p.stoneMid}"/>
        <stop offset="100%" stop-color="${p.stoneDark}"/>
      </linearGradient>
      <linearGradient id="stoneShadow" x1="0" y1="0" x2="1" y2="1">
        <stop offset="0%" stop-color="${p.stoneMid}"/>
        <stop offset="100%" stop-color="${p.stoneDeep}"/>
      </linearGradient>
      <linearGradient id="armorMetal" x1="0.1" y1="0" x2="0.9" y2="1">
        <stop offset="0%" stop-color="${p.armorHi}"/>
        <stop offset="45%" stop-color="${p.armorMid}"/>
        <stop offset="100%" stop-color="${p.armorDark}"/>
      </linearGradient>
      <linearGradient id="capeGrad" x1="0" y1="0" x2="0.8" y2="1">
        <stop offset="0%" stop-color="${p.capeLight}"/>
        <stop offset="100%" stop-color="${p.capeDark}"/>
      </linearGradient>
      <radialGradient id="arcaneOrb" cx="0.5" cy="0.5" r="0.5">
        <stop offset="0%" stop-color="#ffffff"/>
        <stop offset="40%" stop-color="${runeGlow}"/>
        <stop offset="100%" stop-color="${p.glowOuter}" stop-opacity="0"/>
      </radialGradient>
      <linearGradient id="bladeGlow" x1="0" y1="0" x2="1" y2="1">
        <stop offset="0%" stop-color="#ffffff"/>
        <stop offset="45%" stop-color="${p.glowMid}"/>
        <stop offset="100%" stop-color="${p.armorDark}"/>
      </linearGradient>
      <filter id="dropShadow" x="-15%" y="-15%" width="130%" height="130%">
        <feDropShadow dx="0" dy="8" stdDeviation="6" flood-color="#000000" flood-opacity="0.6"/>
      </filter>
      <filter id="runeBloom" x="-30%" y="-30%" width="160%" height="160%">
        <feGaussianBlur stdDeviation="3.2" result="blur"/>
        <feMerge>
          <feMergeNode in="blur"/>
          <feMergeNode in="SourceGraphic"/>
        </feMerge>
      </filter>
    </defs>
  `;
}

function renderPedestal(p: Palette) {
  return `
    <ellipse cx="128" cy="238" rx="88" ry="14" fill="#000000" opacity="0.55"/>
    <path d="M44 214 L212 214 L224 232 L32 232 Z" fill="url(#stoneShadow)" stroke="${p.outline}" stroke-width="4.5" stroke-linejoin="round"/>
    <ellipse cx="128" cy="214" rx="84" ry="15" fill="url(#stoneBody)" stroke="${p.outline}" stroke-width="4"/>
    <path d="M52 198 L204 198 L212 214 L44 214 Z" fill="url(#armorMetal)" stroke="${p.outline}" stroke-width="4" stroke-linejoin="round"/>
    <ellipse cx="128" cy="198" rx="76" ry="13" fill="${p.pedestalTop}" stroke="${p.outline}" stroke-width="3.8"/>
    <g stroke="${p.pedestalRune}" stroke-width="2.4" stroke-linecap="round" filter="url(#runeBloom)" opacity="0.92">
      <path d="M72 204 L72 211 M69 206 L75 208"/>
      <path d="M96 203 L100 211 L104 203"/>
      <path d="M128 202 L128 212 M123 207 L133 207"/>
      <path d="M154 203 L158 207 L154 211"/>
      <path d="M182 204 L182 211 M179 208 L185 205"/>
    </g>
    <path d="M62 218 L68 228 M190 216 L184 229 M114 216 L112 226" stroke="${p.outline}" stroke-width="2" opacity="0.55"/>
  `;
}

export function buildWizardPieceSvg(type: PieceSymbol, color: Color): string {
  const p = getWizardPalette(color);
  const isW = color === 'w';
  const eyeColor = isW ? '#fde047' : type === 'r' || type === 'n' ? '#fb923c' : '#e879f9';
  const runeColor = isW ? '#fbbf24' : type === 'r' ? '#f97316' : '#c084fc';

  let characterArt = '';

  if (type === 'k') {
    characterArt = `
      <path d="M52 198 L62 86 Q128 64 194 86 L204 198 Z" fill="url(#capeGrad)" stroke="${p.outline}" stroke-width="4.5" stroke-linejoin="round"/>
      <path d="M64 196 L72 94 Q128 76 184 94 L192 196 Z" fill="url(#stoneBody)" stroke="${p.outline}" stroke-width="4.5" stroke-linejoin="round"/>
      <path d="M84 96 L128 112 L172 96 L164 166 L128 182 L92 166 Z" fill="url(#armorMetal)" stroke="${p.outline}" stroke-width="3.8" stroke-linejoin="round"/>
      <path d="M48 114 Q56 76 92 84 L88 128 Q64 132 48 114 Z" fill="url(#armorMetal)" stroke="${p.outline}" stroke-width="4"/>
      <path d="M208 114 Q200 76 164 84 L168 128 Q192 132 208 114 Z" fill="url(#armorMetal)" stroke="${p.outline}" stroke-width="4"/>
      <circle cx="74" cy="105" r="8" fill="url(#stoneBody)" stroke="${p.outline}" stroke-width="2.5"/>
      <circle cx="182" cy="105" r="8" fill="url(#stoneBody)" stroke="${p.outline}" stroke-width="2.5"/>
      <path d="M98 44 H158 V84 Q128 106 98 84 Z" fill="url(#stoneBody)" stroke="${p.outline}" stroke-width="4" stroke-linejoin="round"/>
      <path d="M104 72 Q128 66 152 72 L144 98 L128 108 L112 98 Z" fill="url(#stoneShadow)" stroke="${p.outline}" stroke-width="3.2"/>
      <g filter="url(#runeBloom)">
        <polygon points="108,59 121,62 110,65" fill="${eyeColor}"/>
        <polygon points="148,59 135,62 146,65" fill="${eyeColor}"/>
      </g>
      <path d="M92 46 L96 20 L112 35 L128 12 L144 35 L160 20 L164 46 Z" fill="url(#armorMetal)" stroke="${p.outline}" stroke-width="4" stroke-linejoin="round"/>
      <circle cx="128" cy="32" r="5" fill="${eyeColor}" filter="url(#runeBloom)"/>
      <circle cx="106" cy="36" r="3.5" fill="${runeColor}"/>
      <circle cx="150" cy="36" r="3.5" fill="${runeColor}"/>
      <path d="M56 122 L106 138 L106 156 L54 142 Z" fill="url(#stoneBody)" stroke="${p.outline}" stroke-width="3.8"/>
      <path d="M200 122 L150 138 L150 156 L202 142 Z" fill="url(#stoneBody)" stroke="${p.outline}" stroke-width="3.8"/>
      <rect x="122" y="96" width="12" height="36" rx="3" fill="url(#armorMetal)" stroke="${p.outline}" stroke-width="3.2"/>
      <circle cx="128" cy="92" r="9" fill="url(#armorMetal)" stroke="${p.outline}" stroke-width="3.2"/>
      <path d="M88 130 L128 122 L168 130 L162 140 L128 135 L94 140 Z" fill="url(#armorMetal)" stroke="${p.outline}" stroke-width="3.6"/>
      <path d="M115 136 H141 L137 198 L128 212 L119 198 Z" fill="url(#bladeGlow)" stroke="${p.outline}" stroke-width="3.6"/>
      <g stroke="${eyeColor}" stroke-width="2.6" stroke-linecap="round" filter="url(#runeBloom)">
        <line x1="128" y1="142" x2="128" y2="196"/>
        <path d="M124 152 L132 156 M124 166 L132 170 M124 180 L132 184"/>
      </g>
    `;
  } else if (type === 'q') {
    characterArt = `
      <path d="M58 198 L78 96 L60 66 L96 78 L128 72 L160 78 L196 66 L178 96 L198 198 Z" fill="url(#capeGrad)" stroke="${p.outline}" stroke-width="4.5" stroke-linejoin="round"/>
      <path d="M74 198 L90 100 Q128 86 166 100 L182 198 Z" fill="url(#stoneBody)" stroke="${p.outline}" stroke-width="4.2"/>
      <path d="M96 98 L128 114 L160 98 L148 196 L128 182 L108 196 Z" fill="url(#armorMetal)" stroke="${p.outline}" stroke-width="3.6"/>
      <g stroke="${runeColor}" stroke-width="2.5" stroke-linecap="round" filter="url(#runeBloom)">
        <path d="M118 124 L128 136 L138 124"/>
        <path d="M128 136 V176"/>
        <circle cx="128" cy="116" r="4.5" fill="${eyeColor}"/>
      </g>
      <path d="M104 48 Q128 40 152 48 L148 84 Q128 96 108 84 Z" fill="url(#stoneBody)" stroke="${p.outline}" stroke-width="3.8"/>
      <g filter="url(#runeBloom)">
        <ellipse cx="117" cy="64" rx="4.5" ry="2.5" fill="${eyeColor}"/>
        <ellipse cx="139" cy="64" rx="4.5" ry="2.5" fill="${eyeColor}"/>
      </g>
      <path d="M96 50 L102 22 L116 38 L128 12 L140 38 L154 22 L160 50 Z" fill="url(#armorMetal)" stroke="${p.outline}" stroke-width="3.8" stroke-linejoin="round"/>
      <circle cx="128" cy="28" r="5" fill="${eyeColor}" filter="url(#runeBloom)"/>
      <g transform="rotate(-32 128 128)">
        <rect x="124" y="20" width="8" height="205" rx="4" fill="url(#armorMetal)" stroke="${p.outline}" stroke-width="3.2"/>
        <path d="M128 32 C104 26 102 4 118 -8 C114 10 120 18 128 20 C136 18 142 10 138 -8 C154 4 152 26 128 32 Z" fill="url(#bladeGlow)" stroke="${p.outline}" stroke-width="3.2"/>
        <circle cx="128" cy="8" r="9" fill="${eyeColor}" filter="url(#runeBloom)"/>
      </g>
    `;
  } else if (type === 'r') {
    characterArt = `
      <rect x="74" y="156" width="38" height="42" rx="8" fill="url(#stoneShadow)" stroke="${p.outline}" stroke-width="4.2"/>
      <rect x="144" y="156" width="38" height="42" rx="8" fill="url(#stoneShadow)" stroke="${p.outline}" stroke-width="4.2"/>
      <path d="M36 96 L74 82 L82 162 L42 172 L28 140 Z" fill="url(#stoneBody)" stroke="${p.outline}" stroke-width="4.5" stroke-linejoin="round"/>
      <path d="M220 96 L182 82 L174 162 L214 172 L228 140 Z" fill="url(#stoneBody)" stroke="${p.outline}" stroke-width="4.5" stroke-linejoin="round"/>
      <path d="M68 72 H188 L178 168 H78 Z" fill="url(#stoneBody)" stroke="${p.outline}" stroke-width="4.5" stroke-linejoin="round"/>
      <path d="M64 22 H92 V42 H112 V22 H144 V42 H164 V22 H192 V72 H64 Z" fill="url(#stoneBody)" stroke="${p.outline}" stroke-width="4.5" stroke-linejoin="round"/>
      <path d="M64 56 H192 M96 56 V72 M156 56 V72 M42 124 H76 M180 124 H214" stroke="${p.outline}" stroke-width="3"/>
      <path d="M78 78 L98 66 L128 76 L158 66 L178 78 L166 146 L128 162 L90 146 Z" fill="url(#stoneShadow)" stroke="${p.outline}" stroke-width="4" stroke-linejoin="round"/>
      <g filter="url(#runeBloom)">
        <polygon points="94,92 118,100 98,106" fill="${eyeColor}"/>
        <polygon points="162,92 138,100 158,106" fill="${eyeColor}"/>
        <path d="M102 120 H154 L148 146 L128 152 L108 146 Z" fill="${runeColor}"/>
      </g>
      <polygon points="106,120 114,120 110,133" fill="${p.stoneLight}" stroke="${p.outline}" stroke-width="2"/>
      <polygon points="142,120 150,120 146,133" fill="${p.stoneLight}" stroke="${p.outline}" stroke-width="2"/>
      <polygon points="112,146 120,146 116,135" fill="${p.stoneLight}" stroke="${p.outline}" stroke-width="2"/>
      <polygon points="136,146 144,146 140,135" fill="${p.stoneLight}" stroke="${p.outline}" stroke-width="2"/>
      <g stroke="${runeColor}" stroke-width="2.8" stroke-linecap="round" filter="url(#runeBloom)">
        <path d="M52 104 L62 122 L48 144"/>
        <path d="M204 104 L194 122 L208 144"/>
        <path d="M88 168 L100 184 M168 168 L156 184"/>
      </g>
    `;
  } else if (type === 'b') {
    characterArt = `
      <path d="M56 198 L78 92 Q128 74 178 92 L200 198 Z" fill="url(#stoneBody)" stroke="${p.outline}" stroke-width="4.5" stroke-linejoin="round"/>
      <path d="M62 104 Q128 78 194 104 L178 134 Q128 114 78 134 Z" fill="url(#armorMetal)" stroke="${p.outline}" stroke-width="4"/>
      <path d="M104 114 L94 198 H118 L124 120 Z" fill="url(#armorMetal)" stroke="${p.outline}" stroke-width="3.2"/>
      <path d="M152 114 L162 198 H138 L132 120 Z" fill="url(#armorMetal)" stroke="${p.outline}" stroke-width="3.2"/>
      <path d="M92 84 C88 46 106 20 128 12 C150 20 168 46 164 84 Z" fill="url(#armorMetal)" stroke="${p.outline}" stroke-width="4.2" stroke-linejoin="round"/>
      <path d="M128 18 V54 M114 36 H142" stroke="${p.stoneLight}" stroke-width="3.5" stroke-linecap="round"/>
      <path d="M102 88 Q128 52 154 88 L146 104 Q128 112 110 104 Z" fill="#09080f" stroke="${p.outline}" stroke-width="3.6"/>
      <g filter="url(#runeBloom)">
        <circle cx="118" cy="84" r="4.2" fill="${eyeColor}"/>
        <circle cx="138" cy="84" r="4.2" fill="${eyeColor}"/>
      </g>
      <circle cx="186" cy="112" r="22" fill="url(#arcaneOrb)" filter="url(#runeBloom)"/>
      <circle cx="186" cy="112" r="11" fill="${eyeColor}" stroke="${p.outline}" stroke-width="2.5"/>
      <rect x="52" y="42" width="8" height="162" rx="4" fill="url(#armorMetal)" stroke="${p.outline}" stroke-width="3.2"/>
      <path d="M56 18 L78 44 L56 70 L34 44 Z" fill="url(#bladeGlow)" stroke="${p.outline}" stroke-width="3.5"/>
      <circle cx="56" cy="44" r="7" fill="${eyeColor}" filter="url(#runeBloom)"/>
    `;
  } else if (type === 'n') {
    characterArt = `
      <path d="M168 142 Q206 138 202 178 Q192 162 174 160 Z" fill="url(#capeGrad)" stroke="${p.outline}" stroke-width="3.8"/>
      <path d="M84 198 L98 148 L72 156 L58 136 L74 118 L92 128 L88 86 L66 78 L80 42 L106 32 L118 46 C158 58 182 108 172 154 L164 198 H142 L146 158 L116 158 L104 198 Z" fill="url(#stoneBody)" stroke="${p.outline}" stroke-width="4.4" stroke-linejoin="round"/>
      <path d="M66 78 L80 42 L106 32 L112 58 L84 82 Z" fill="url(#armorMetal)" stroke="${p.outline}" stroke-width="3.6"/>
      <path d="M88 104 Q128 96 168 124 L162 150 Q124 132 88 128 Z" fill="url(#armorMetal)" stroke="${p.outline}" stroke-width="3.6"/>
      <circle cx="88" cy="56" r="4.5" fill="${eyeColor}" filter="url(#runeBloom)"/>
      <path d="M122 52 Q146 38 164 56 L150 64 Z" fill="url(#capeGrad)" stroke="${p.outline}" stroke-width="3"/>
      <rect x="116" y="54" width="28" height="28" rx="6" fill="url(#stoneBody)" stroke="${p.outline}" stroke-width="3.8"/>
      <line x1="120" y1="66" x2="136" y2="66" stroke="${eyeColor}" stroke-width="3.2" filter="url(#runeBloom)"/>
      <path d="M112 82 H152 L148 134 H116 Z" fill="url(#stoneBody)" stroke="${p.outline}" stroke-width="3.8"/>
      <path d="M126 84 L170 88 L164 134 L142 150 L122 130 Z" fill="url(#armorMetal)" stroke="${p.outline}" stroke-width="4" stroke-linejoin="round"/>
      <path d="M144 96 L144 136 M132 112 H156" stroke="${eyeColor}" stroke-width="3" filter="url(#runeBloom)"/>
      <path d="M26 14 L184 128 L178 136 L20 22 Z" fill="url(#bladeGlow)" stroke="${p.outline}" stroke-width="3.4" stroke-linejoin="round"/>
    `;
  } else {
    characterArt = `
      <path d="M80 148 L72 198 H104 L112 156 H134 L142 198 H174 L164 148 Z" fill="url(#stoneBody)" stroke="${p.outline}" stroke-width="4.2" stroke-linejoin="round"/>
      <path d="M64 92 Q122 74 180 92 L170 156 H74 Z" fill="url(#stoneBody)" stroke="${p.outline}" stroke-width="4.4" stroke-linejoin="round"/>
      <path d="M48 112 Q56 80 88 88 L84 126 Q62 128 48 112 Z" fill="url(#armorMetal)" stroke="${p.outline}" stroke-width="4"/>
      <path d="M196 112 Q188 80 156 88 L160 126 Q182 128 196 112 Z" fill="url(#armorMetal)" stroke="${p.outline}" stroke-width="4"/>
      ${!isW ? `<path d="M86 58 Q64 42 74 22 Q84 38 98 48 M158 58 Q180 42 170 22 Q160 38 146 48" fill="url(#armorMetal)" stroke="${p.outline}" stroke-width="3.8" stroke-linejoin="round"/>` : ''}
      <rect x="94" y="42" width="56" height="48" rx="10" fill="url(#stoneBody)" stroke="${p.outline}" stroke-width="4.2"/>
      <path d="M94 62 H150 M122 44 V88" stroke="url(#armorMetal)" stroke-width="6"/>
      <g filter="url(#runeBloom)">
        <rect x="102" y="59" width="12" height="5" rx="2" fill="${eyeColor}"/>
        <rect x="130" y="59" width="12" height="5" rx="2" fill="${eyeColor}"/>
      </g>
      <path d="M126 88 L198 96 L190 162 L158 188 L124 162 Z" fill="url(#armorMetal)" stroke="${p.outline}" stroke-width="4.4" stroke-linejoin="round"/>
      <path d="M136 98 L188 104 L182 156 L158 176 L134 156 Z" fill="url(#stoneShadow)" stroke="${p.outline}" stroke-width="3"/>
      <path d="M160 108 V164 M144 132 H176" stroke="${eyeColor}" stroke-width="3.2" stroke-linecap="round" filter="url(#runeBloom)"/>
      <path d="M46 132 L66 146 L152 192 L138 168 L56 120 Z" fill="url(#bladeGlow)" stroke="${p.outline}" stroke-width="3.6" stroke-linejoin="round"/>
      <circle cx="48" cy="126" r="8" fill="url(#armorMetal)" stroke="${p.outline}" stroke-width="3"/>
    `;
  }

  return `<svg xmlns="http://www.w3.org/2000/svg" width="256" height="256" viewBox="0 0 256 256">${commonDefs(p, color)}<g filter="url(#dropShadow)">${renderPedestal(p)}${characterArt}</g></svg>`;
}

const spriteDataUriCache = new Map<string, string>();

export function getWizardPieceSpriteUrl(type: PieceSymbol, color: Color): string {
  const key = `${color}${type}`;
  if (!spriteDataUriCache.has(key)) {
    const svg = buildWizardPieceSvg(type, color);
    spriteDataUriCache.set(key, `data:image/svg+xml;charset=utf-8,${encodeURIComponent(svg)}`);
  }
  return spriteDataUriCache.get(key)!;
}

export const WIZARD_PIECE_LORE: Record<string, { name: string; title: string; weapon: string }> = {
  wk: { name: 'Vua Trắng', title: 'Đế Vương Cẩm Thạch', weapon: 'Đại Kiếm Ánh Sáng' },
  wq: { name: 'Hậu Trắng', title: 'Nữ Hoàng Thánh Quang', weapon: 'Quyền Trượng Song Nhận' },
  wr: { name: 'Xe Trắng', title: 'Tháp Hộ Vệ Hoàng Gia', weapon: 'Nắm Đấm Đá Cẩm Thạch' },
  wb: { name: 'Tượng Trắng', title: 'Đại Pháp Sư Tháp Cao', weapon: 'Trượng Tinh Cầu Vàng' },
  wn: { name: 'Mã Trắng', title: 'Kỵ Sĩ Chiến Mã', weapon: 'Trường Thương Ánh Vàng' },
  wp: { name: 'Tốt Trắng', title: 'Vệ Binh Cẩm Thạch', weapon: 'Kiếm & Khiên Tháp' },
  bk: { name: 'Vua Đen', title: 'Lãnh Chúa Hắc Diện Thạch', weapon: 'Đại Kiếm Cổ Ngữ Đỏ' },
  bq: { name: 'Hậu Đen', title: 'Nữ Hoàng Hắc Ám', weapon: 'Trượng Hư Không Tím' },
  br: { name: 'Xe Đen', title: 'Khổng Lồ Tháp Gargoyle', weapon: 'Nham Thạch Nóng Chảy' },
  bb: { name: 'Tượng Đen', title: 'Pháp Sư Hắc Ám', weapon: 'Trượng Đầu Lâu Cổ Ngữ' },
  bn: { name: 'Mã Đen', title: 'Kỵ Sĩ Hỏa Ngục', weapon: 'Thương Lửa Đỏ Thẫm' },
  bp: { name: 'Tốt Đen', title: 'Thiết Giáp Tiên Phong', weapon: 'Kiếm Đen & Khiên Gai' },
};

/**
 * High-Detail 2D Sprite Renderer for Harry Potter Wizard's Chess Pieces.
 * Uses pre-cached 256x256 HD sprite data URLs so each piece renders as a crisp,
 * richly shaded living stone statue with glowing eyes and runes.
 */
export function ChessPiece({
  type,
  color,
  className = '',
}: {
  type: PieceSymbol;
  color: Color;
  className?: string;
}) {
  const spriteUrl = useMemo(() => getWizardPieceSpriteUrl(type, color), [type, color]);
  const info = WIZARD_PIECE_LORE[`${color}${type}`];

  return (
    <img
      src={spriteUrl}
      alt={info?.name || `${color}${type}`}
      draggable={false}
      decoding="async"
      className={`chess-piece-art wizard-statue-sprite w-full h-full object-contain select-none pointer-events-none ${className}`}
    />
  );
}
