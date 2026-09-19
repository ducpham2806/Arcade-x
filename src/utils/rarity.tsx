import type { CSSProperties } from 'react';
import { Rarity } from '../types';

export interface RarityConfig {
  id: Rarity;
  tier: number; // 1 to 9
  shortHand: string; // e.g. "( C )"
  shortCode: string; // e.g. "C"
  name: string; // e.g. "Common"
  nameVi: string; // e.g. "Thường"
  hex: string; // Exact hex from table
  glowColor: string; // RGBA for box shadow
  gradientBg: string; // Tailored dark ambient background
  borderCss: string; // Inline border style or classes
  badgeBg: string; // Badge background
  badgeText: string; // Badge text color
  badgeBorder: string;
  nextRarity: Rarity | null;
  craftCost: number;
}

export const RARITY_ORDER: Rarity[] = [
  'common',
  'uncommon',
  'rare',
  'epic',
  'legendary',
  'mythic',
  'relic',
  'masterwork',
  'eternal',
];

export const RARITIES: Record<Rarity, RarityConfig> = {
  common: {
    id: 'common',
    tier: 1,
    shortHand: '( C )',
    shortCode: 'C',
    name: 'Common',
    nameVi: 'Thường',
    hex: '#FDFEFE',
    glowColor: 'rgba(253, 254, 254, 0.35)',
    gradientBg: 'linear-gradient(180deg, #1c222e 0%, #11151c 100%)',
    borderCss: '#FDFEFE',
    badgeBg: 'rgba(253, 254, 254, 0.12)',
    badgeText: '#FDFEFE',
    badgeBorder: 'rgba(253, 254, 254, 0.4)',
    nextRarity: 'uncommon',
    craftCost: 100,
  },
  uncommon: {
    id: 'uncommon',
    tier: 2,
    shortHand: '( U )',
    shortCode: 'U',
    name: 'Uncommon',
    nameVi: 'Đặc Biệt',
    hex: '#27AE60',
    glowColor: 'rgba(39, 174, 96, 0.45)',
    gradientBg: 'linear-gradient(180deg, #0e2a1b 0%, #07170f 100%)',
    borderCss: '#27AE60',
    badgeBg: 'rgba(39, 174, 96, 0.18)',
    badgeText: '#2ECC71',
    badgeBorder: 'rgba(39, 174, 96, 0.5)',
    nextRarity: 'rare',
    craftCost: 250,
  },
  rare: {
    id: 'rare',
    tier: 3,
    shortHand: '( R )',
    shortCode: 'R',
    name: 'Rare',
    nameVi: 'Hiếm',
    hex: '#2471A3',
    glowColor: 'rgba(36, 113, 163, 0.55)',
    gradientBg: 'linear-gradient(180deg, #0f2c42 0%, #071724 100%)',
    borderCss: '#2471A3',
    badgeBg: 'rgba(36, 113, 163, 0.2)',
    badgeText: '#3498DB',
    badgeBorder: 'rgba(36, 113, 163, 0.6)',
    nextRarity: 'epic',
    craftCost: 500,
  },
  epic: {
    id: 'epic',
    tier: 4,
    shortHand: '( E )',
    shortCode: 'E',
    name: 'Epic',
    nameVi: 'Sử Thi',
    hex: '#7D3C98',
    glowColor: 'rgba(125, 60, 152, 0.6)',
    gradientBg: 'linear-gradient(180deg, #2b1338 0%, #15081c 100%)',
    borderCss: '#7D3C98',
    badgeBg: 'rgba(125, 60, 152, 0.22)',
    badgeText: '#AF7AC5',
    badgeBorder: 'rgba(125, 60, 152, 0.6)',
    nextRarity: 'legendary',
    craftCost: 1000,
  },
  legendary: {
    id: 'legendary',
    tier: 5,
    shortHand: '( L )',
    shortCode: 'L',
    name: 'Legendary',
    nameVi: 'Huyền Thoại',
    hex: '#F1C40F',
    glowColor: 'rgba(241, 196, 15, 0.65)',
    gradientBg: 'linear-gradient(180deg, #3d3007 0%, #1c1502 100%)',
    borderCss: '#F1C40F',
    badgeBg: 'rgba(241, 196, 15, 0.2)',
    badgeText: '#F4D03F',
    badgeBorder: 'rgba(241, 196, 15, 0.7)',
    nextRarity: 'mythic',
    craftCost: 2500,
  },
  mythic: {
    id: 'mythic',
    tier: 6,
    shortHand: '( M )',
    shortCode: 'M',
    name: 'Mythic',
    nameVi: 'Thần Thoại',
    hex: '#D35400',
    glowColor: 'rgba(211, 84, 0, 0.7)',
    gradientBg: 'linear-gradient(180deg, #3d1b06 0%, #1c0b02 100%)',
    borderCss: '#D35400',
    badgeBg: 'rgba(211, 84, 0, 0.25)',
    badgeText: '#E67E22',
    badgeBorder: 'rgba(211, 84, 0, 0.7)',
    nextRarity: 'relic',
    craftCost: 5000,
  },
  relic: {
    id: 'relic',
    tier: 7,
    shortHand: '( Re )',
    shortCode: 'Re',
    name: 'Relic',
    nameVi: 'Cổ Vật',
    hex: '#7B241C',
    glowColor: 'rgba(123, 36, 28, 0.75)',
    gradientBg: 'linear-gradient(180deg, #350f0c 0%, #180504 100%)',
    borderCss: '#7B241C',
    badgeBg: 'rgba(123, 36, 28, 0.3)',
    badgeText: '#EC7063',
    badgeBorder: 'rgba(231, 76, 60, 0.65)',
    nextRarity: 'masterwork',
    craftCost: 10000,
  },
  masterwork: {
    id: 'masterwork',
    tier: 8,
    shortHand: '( Ma )',
    shortCode: 'Ma',
    name: 'Masterwork',
    nameVi: 'Tuyệt Tác',
    hex: '#B3CA1F',
    glowColor: 'rgba(179, 202, 31, 0.8)',
    gradientBg: 'linear-gradient(180deg, #2d3307 0%, #151802 100%)',
    borderCss: '#B3CA1F',
    badgeBg: 'rgba(179, 202, 31, 0.25)',
    badgeText: '#D4E157',
    badgeBorder: 'rgba(179, 202, 31, 0.75)',
    nextRarity: 'eternal',
    craftCost: 25000,
  },
  eternal: {
    id: 'eternal',
    tier: 9,
    shortHand: '( Et )',
    shortCode: 'Et',
    name: 'Eternal',
    nameVi: 'Bất Diệt',
    hex: '#DC2367',
    glowColor: 'rgba(220, 35, 103, 0.85)',
    gradientBg: 'linear-gradient(180deg, #40091e 0%, #1a030b 100%)',
    borderCss: '#DC2367',
    badgeBg: 'rgba(220, 35, 103, 0.28)',
    badgeText: '#F48FB1',
    badgeBorder: 'rgba(220, 35, 103, 0.85)',
    nextRarity: null,
    craftCost: 0,
  },
};

export const getRarityInfo = (rarity: Rarity | string): RarityConfig => {
  return RARITIES[rarity as Rarity] || RARITIES.common;
};

export const getRaritySlotBoxStyle = (rarity: Rarity, isEquipped = false, isSelected = false): CSSProperties => {
  const info = getRarityInfo(rarity);
  const glow = info.glowColor;
  
  const boxShadow = isSelected
    ? `0 0 10px ${glow}, inset 0 1px 0 rgba(255,255,255,0.3)`
    : `0 0 4px ${glow}`;

  return {
    background: info.gradientBg,
    borderColor: info.hex,
    borderWidth: '1.5px',
    borderStyle: 'solid',
    boxShadow,
  };
};


export const getRaritySlotStyle = (rarity: Rarity, isEquipped: boolean = false, isSelected: boolean = false): string => {
  let base = 'relative group transition-all duration-200 aspect-square rounded-xl flex items-center justify-center select-none ';
  
  if (isSelected) {
    base += 'z-10 shadow-md ';
  } else {
    base += 'hover:brightness-110 active:scale-98 cursor-pointer ';
  }

  return base;
};

export const RarityBadge = ({ rarity, compact = true }: { rarity: Rarity; compact?: boolean }) => {
  const info = getRarityInfo(rarity);
  return (
    <span
      title={`${info.nameVi} (${info.name})`}
      className="inline-flex items-center gap-1 font-black uppercase rounded-full border shadow-sm backdrop-blur-sm whitespace-nowrap select-none shrink-0 text-[8px] sm:text-[9px] px-1.5 py-0.5 font-mono cursor-default"
      style={{
        backgroundColor: info.badgeBg,
        color: info.badgeText,
        borderColor: info.badgeBorder,
      }}
    >
      <span
        className="w-1.5 h-1.5 rounded-full animate-pulse shrink-0 shadow-sm"
        style={{ backgroundColor: info.hex, boxShadow: `0 0 6px ${info.hex}` }}
      />
      <span>{info.shortCode}</span>
    </span>
  );
};

export type EquipmentSlot = 
  | 'weapon'
  | 'armor'
  | 'helmet'
  | 'ship'
  | 'blade'
  | 'necklace'
  | 'ringLeft'
  | 'ringRight'
  | 'avatar'
  | 'title';

export const SLOT_INFO: Record<EquipmentSlot, { name: string; icon: string; desc: string }> = {
  weapon: { name: 'Vũ Khí', icon: '⚔️', desc: 'Vũ khí chiến đấu chính' },
  armor: { name: 'Y Phục', icon: '🏃', desc: 'Trang phục & Giáp bảo hộ' },
  helmet: { name: 'Mũ/Nón', icon: '👑', desc: 'Mũ & Nón giáp chiến binh' },
  ship: { name: 'Tàu Không Gian', icon: '🚀', desc: 'Phi thuyền chiến đấu' },
  blade: { name: 'Kiếm Laser', icon: '⚡', desc: 'Vũ khí năng lượng cắt gọt' },
  necklace: { name: 'Dây Chuyền', icon: '📿', desc: 'Dây chuyền & Bùa hộ mệnh' },
  ringLeft: { name: 'Nhẫn Trái', icon: '💍', desc: 'Nhẫn ngón tay trái' },
  ringRight: { name: 'Nhẫn Phải', icon: '💍', desc: 'Nhẫn ngón tay phải' },
  avatar: { name: 'Avatar', icon: '👾', desc: 'Ảnh đại diện nhân vật' },
  title: { name: 'Danh Hiệu', icon: '🏷️', desc: 'Danh hiệu vinh danh cao quý' },
};

export function getItemSlot(item: any): EquipmentSlot {
  if (item.slot) return item.slot;
  if (item.type === 'weapon') return 'weapon';
  if (item.type === 'helmet') return 'helmet';
  if (item.type === 'necklace') return 'necklace';
  if (item.type === 'ringLeft') return 'ringLeft';
  if (item.type === 'ringRight') return 'ringRight';
  if (item.type === 'avatar') return 'avatar';
  if (item.type === 'title') return 'title';
  if (item.type === 'skin') {
    if (item.gameId === 'neon-runner' || item.gameId === 'runner') return 'armor';
    if (item.gameId === 'cosmic-defense' || item.gameId === 'blocker') return 'ship';
    if (item.gameId === 'cyber-slice' || item.gameId === 'slash') return 'blade';
    return 'armor';
  }
  return 'weapon';
}

export function getItemTier(rarity: Rarity | string): number {
  const idx = RARITY_ORDER.indexOf(rarity as Rarity);
  return idx !== -1 ? idx + 1 : 1;
}

export function isItemRecommended(item: any, allItems: any[]): boolean {
  if (!item || item.isChest || ['material', 'consumable', 'boost', 'crate'].includes(item.type)) {
    return false;
  }
  const slot = getItemSlot(item);
  // Find all equipped items in the same slot
  const equippedInSlot = allItems.filter(i => getItemSlot(i) === slot && i.equipped);
  
  // Case 1: Slot is empty -> recommended!
  if (equippedInSlot.length === 0) {
    return true;
  }

  // Case 2: Compare rarity tier
  const itemTier = getItemTier(item.rarity);
  const maxEquippedTier = Math.max(...equippedInSlot.map(i => getItemTier(i.rarity)));

  if (itemTier > maxEquippedTier) {
    return true;
  }

  // If same tier or lower, check if stats or bonuses are stronger (simple bonus string length or keyword heuristics)
  return false;
}
