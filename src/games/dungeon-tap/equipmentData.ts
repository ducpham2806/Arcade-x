import { EquipmentItem, EquipmentSlot, ItemRarity } from './types';

export const RARITY_CONFIG: Record<
  ItemRarity,
  {
    name: string;
    color: string;
    border: string;
    bg: string;
    statMultiplier: number;
    dropWeight: number;
  }
> = {
  common: {
    name: 'Phổ Thông',
    color: '#94a3b8',
    border: 'border-slate-500',
    bg: 'bg-slate-900/80',
    statMultiplier: 1.0,
    dropWeight: 55,
  },
  rare: {
    name: 'Hiếm',
    color: '#38bdf8',
    border: 'border-cyan-500',
    bg: 'bg-cyan-950/80',
    statMultiplier: 1.8,
    dropWeight: 30,
  },
  epic: {
    name: 'Sử Thi',
    color: '#c084fc',
    border: 'border-purple-500',
    bg: 'bg-purple-950/80',
    statMultiplier: 3.2,
    dropWeight: 12,
  },
  legendary: {
    name: 'Thần Thoại',
    color: '#fbbf24',
    border: 'border-amber-400 shadow-[0_0_15px_rgba(251,191,36,0.5)]',
    bg: 'bg-amber-950/80',
    statMultiplier: 6.0,
    dropWeight: 3,
  },
};

const WEAPON_NAMES = [
  'Kiếm Rỉ Sét',
  'Kiếm Thép Rèn',
  'Đao Lửa Hỏa Ngục',
  'Thánh Kiếm Excalibur',
  'Song Kiếm Cuồng Phong',
  'Lưỡi Hái Hư Vô',
  'Búa Sấm Sét Titan',
];

const ARMOR_NAMES = [
  'Áo Vải Tân Binh',
  'Giáp Da Báo',
  'Giáp Sắt Hiệp Sĩ',
  'Giáp Titan Bất Hoại',
  'Long Bào Hỏa Long',
  'Áo Choàng Bóng Tối',
  'Chiến Giáp Thái Cổ',
];

const HELMET_NAMES = [
  'Mũ Vải Gai',
  'Mũ Sắt Chiến Binh',
  'Vương Miện Ma Thuật',
  'Mũ Rồng Huyết Tộc',
  'Mặt Nạ Sát Thủ',
  'Vương Miện Titan',
];

const CLOAK_NAMES = [
  'Khăn Choàng Đỏ',
  'Áo Choàng Gió',
  'Cánh Dơi Huyết Dạ',
  'Áo Choàng Sao Băng',
  'Cánh Phượng Hoàng Lửa',
  'Hư Vô Phi Phong',
];

const RING_NAMES = [
  'Nhẫn Đồng Cổ',
  'Nhẫn Bạc Tinh Xảo',
  'Nhẫn Ngọc Lục Bảo',
  'Nhẫn Midas Hoàng Kim',
  'Nhẫn Ma Thần Hỗn Mang',
  'Vòng Cổ Rồng Đen',
];

const SLOT_ICONS: Record<EquipmentSlot, string> = {
  weapon: '⚔️',
  armor: '🛡️',
  helmet: '👑',
  cloak: '🧣',
  ring: '💍',
};

export function getRandomRarity(stage: number, rng: () => number = Math.random): ItemRarity {
  // Higher stages give better odds for rare/epic/legendary
  const bonusRarity = Math.min(25, Math.floor(stage / 10) * 3);
  const roll = rng() * 100;

  if (roll < 3 + bonusRarity * 0.3) return 'legendary';
  if (roll < 15 + bonusRarity * 0.6) return 'epic';
  if (roll < 45 + bonusRarity * 0.8) return 'rare';
  return 'common';
}

export function generateLootItem(stage: number, forcedSlot?: EquipmentSlot, rng: () => number = Math.random): EquipmentItem {
  const slots: EquipmentSlot[] = ['weapon', 'armor', 'helmet', 'cloak', 'ring'];
  const slot = forcedSlot || slots[Math.floor(rng() * slots.length)];
  const rarity = getRandomRarity(stage, rng);
  const rarityInfo = RARITY_CONFIG[rarity];

  let nameList = WEAPON_NAMES;
  if (slot === 'armor') nameList = ARMOR_NAMES;
  if (slot === 'helmet') nameList = HELMET_NAMES;
  if (slot === 'cloak') nameList = CLOAK_NAMES;
  if (slot === 'ring') nameList = RING_NAMES;

  const baseName = nameList[Math.floor(rng() * nameList.length)];
  // All equipment dropped in dungeons starts at Level 1
  const itemLevel = 1;

  // Base stats at level 1 scale based on the dungeon stage where dropped and rarity multiplier
  const stageScale = 1 + .03 * Math.max(0, stage - 1);
  const statScale = stageScale * rarityInfo.statMultiplier;

  let tapDmgBonus = 0;
  let heroDmgBonus = 0;
  let critRateBonus = 0;
  let goldBonus = 0;

  if (slot === 'weapon') {
    tapDmgBonus = Math.round(15 * statScale);
    critRateBonus = Math.min(25, Math.round(3 * rarityInfo.statMultiplier));
  } else if (slot === 'armor') {
    tapDmgBonus = Math.round(8 * statScale);
    heroDmgBonus = Math.round(10 * statScale);
  } else if (slot === 'helmet') {
    heroDmgBonus = Math.round(18 * statScale);
  } else if (slot === 'cloak') {
    critRateBonus = Math.min(30, Math.round(4 * rarityInfo.statMultiplier));
    tapDmgBonus = Math.round(10 * statScale);
  } else if (slot === 'ring') {
    goldBonus = Math.round(12 * statScale);
    heroDmgBonus = Math.round(8 * statScale);
  }

  const sellValue = Math.round(20 * statScale);
  const upgradeCost = Math.round(35 * statScale);

  return {
    id: `item-${Math.floor(rng() * 1e12)}-${rng().toString(36).substring(2, 7)}`,
    name: baseName,
    slot,
    rarity,
    level: 1,
    tapDmgBonus,
    heroDmgBonus,
    critRateBonus,
    goldBonus,
    icon: SLOT_ICONS[slot],
    description: `Trang bị ${rarityInfo.name} cấp 1 nhặt được tại Tầng ${stage}.`,
    sellValue,
    upgradeCost,
    baseLevelStats: {
      tapDmgBonus,
      heroDmgBonus,
      critRateBonus,
      goldBonus,
    },
  };
}

export const STARTER_EQUIPMENT: Record<EquipmentSlot, EquipmentItem> = {
  weapon: {
    id: 'starter-weapon',
    name: 'Kiếm Gỗ Tập Sự',
    slot: 'weapon',
    rarity: 'common',
    level: 1,
    tapDmgBonus: 10,
    heroDmgBonus: 0,
    critRateBonus: 2,
    goldBonus: 0,
    icon: '🗡️',
    description: 'Vũ khí khởi đầu mộc mạc của Kiếm Sĩ.',
    sellValue: 10,
    upgradeCost: 25,
    baseLevelStats: {
      tapDmgBonus: 10,
      heroDmgBonus: 0,
      critRateBonus: 2,
      goldBonus: 0,
    },
  },
  armor: {
    id: 'starter-armor',
    name: 'Áo Vải Tân Binh',
    slot: 'armor',
    rarity: 'common',
    level: 1,
    tapDmgBonus: 5,
    heroDmgBonus: 5,
    critRateBonus: 0,
    goldBonus: 0,
    icon: '🛡️',
    description: 'Giáp nhẹ bảo hộ cơ bản.',
    sellValue: 10,
    upgradeCost: 25,
    baseLevelStats: {
      tapDmgBonus: 5,
      heroDmgBonus: 5,
      critRateBonus: 0,
      goldBonus: 0,
    },
  },
  helmet: {
    id: 'starter-helmet',
    name: 'Băng Đầu Vải',
    slot: 'helmet',
    rarity: 'common',
    level: 1,
    tapDmgBonus: 0,
    heroDmgBonus: 8,
    critRateBonus: 0,
    goldBonus: 0,
    icon: '👑',
    description: 'Băng đầu giúp tăng tập trung.',
    sellValue: 10,
    upgradeCost: 25,
    baseLevelStats: {
      tapDmgBonus: 0,
      heroDmgBonus: 8,
      critRateBonus: 0,
      goldBonus: 0,
    },
  },
  cloak: {
    id: 'starter-cloak',
    name: 'Khăn Quàng Du Mục',
    slot: 'cloak',
    rarity: 'common',
    level: 1,
    tapDmgBonus: 4,
    heroDmgBonus: 0,
    critRateBonus: 3,
    goldBonus: 0,
    icon: '🧣',
    description: 'Khăn quàng phất phơ trong gió bão.',
    sellValue: 10,
    upgradeCost: 25,
    baseLevelStats: {
      tapDmgBonus: 4,
      heroDmgBonus: 0,
      critRateBonus: 3,
      goldBonus: 0,
    },
  },
  ring: {
    id: 'starter-ring',
    name: 'Nhẫn Đồng Thô',
    slot: 'ring',
    rarity: 'common',
    level: 1,
    tapDmgBonus: 0,
    heroDmgBonus: 0,
    critRateBonus: 0,
    goldBonus: 10,
    icon: '💍',
    description: 'Nhẫn đồng thô mang lại chút may mắn.',
    sellValue: 10,
    upgradeCost: 25,
    baseLevelStats: {
      tapDmgBonus: 0,
      heroDmgBonus: 0,
      critRateBonus: 0,
      goldBonus: 10,
    },
  },
};
