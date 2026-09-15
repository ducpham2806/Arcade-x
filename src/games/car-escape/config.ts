import { GameControlInfo, DropRateConfig, GameAchievementDef } from '../../types';

export const CAR_ESCAPE_CONTROLS: GameControlInfo[] = [
  { key: 'Mouse/Touch', action: 'Kéo thả dọc/ngang', touchInstruction: 'Trượt để kéo xe di chuyển' },
  { key: 'Mục Tiêu', action: 'Đưa Xe Đỏ ra cửa', touchInstruction: 'Giải phóng đường ra' },
];

export const CAR_ESCAPE_DROP_RATES: DropRateConfig = {
  baseChestDropChance: 0.2,
  scoreThresholdForDrop: 10,
  chestWeights: [
    { type: 'common', weight: 60 },
    { type: 'rare', weight: 30 },
    { type: 'epic', weight: 9 },
    { type: 'legendary', weight: 1 }
  ]
};

export const CAR_ESCAPE_ACHIEVEMENTS: GameAchievementDef[] = [
  { 
    id: 'car-escape-lvl10', 
    title: 'Tài Xế Tập Sự', 
    description: 'Hoàn thành Thành phố 1 (10 màn đầu tiên)', 
    icon: '🚙', 
    target: 10, 
    rewardExp: 100, 
    rewardCoins: 50, 
    rewardGems: 1 
  },
  { 
    id: 'car-escape-speed', 
    title: 'Đường Thoáng', 
    description: 'Hoàn thành một màn chơi trong dưới 15 giây', 
    icon: '💨', 
    target: 1, 
    rewardExp: 150, 
    rewardCoins: 100, 
    rewardGems: 2 
  },
  { 
    id: 'car-escape-lvl50', 
    title: 'Chuyên Gia Gỡ Rối', 
    description: 'Hoàn thành 50 màn chơi Car Escape', 
    icon: '🏆', 
    target: 50, 
    rewardExp: 500, 
    rewardCoins: 300, 
    rewardGems: 5 
  }
];
