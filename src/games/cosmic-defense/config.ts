import { DropRateConfig, GameAchievementDef, GameControlInfo } from '../../types';

export const COSMIC_DEFENSE_ACHIEVEMENTS: GameAchievementDef[] = [
  {
    id: 'ach-cosmic-boss',
    title: 'Tiêu Diệt Tàu Mẹ',
    description: 'Hạ gục Boss hạm đội trong Cosmic Defense (Đạt 1,500 điểm).',
    icon: '🛸',
    target: 1500,
    rewardExp: 200,
    rewardCoins: 400,
    rewardGems: 20,
  },
];

export const COSMIC_DEFENSE_DROP_RATES: DropRateConfig = {
  baseChestDropChance: 0.45,
  scoreThresholdForDrop: 500,
  chestWeights: [
    { type: 'common', weight: 50 },
    { type: 'rare', weight: 35 },
    { type: 'epic', weight: 12 },
    { type: 'legendary', weight: 3 },
  ],
};

export const COSMIC_DEFENSE_CONTROLS: GameControlInfo[] = [
  { key: 'Kéo Chuột / Cảm Ứng / Phím Mũi Tên', action: 'Di chuyển phi thuyền né đạn' },
  { key: 'Tự động bắn', action: 'Phi thuyền tự kích hoạt laser liên tục' },
  { key: 'Phím Space / Chạm nút EMP', action: 'Kích hoạt Bom EMP quét sạch kẻ địch' },
];
