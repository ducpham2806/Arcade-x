import { DropRateConfig, GameAchievementDef, GameControlInfo } from '../../types';

export const NEON_RUNNER_ACHIEVEMENTS: GameAchievementDef[] = [
  {
    id: 'ach-runner-500',
    title: 'Tăng Tốc Neon',
    description: 'Đạt mốc 500 điểm trong Neon Runner.',
    icon: '🏃',
    target: 500,
    rewardExp: 100,
    rewardCoins: 200,
    rewardGems: 10,
  },
  {
    id: 'ach-runner-2000',
    title: 'Phá Vỡ Giới Hạn Âm Thanh',
    description: 'Đạt 2,000 điểm trong Neon Runner.',
    icon: '⚡',
    target: 2000,
    rewardExp: 300,
    rewardCoins: 600,
    rewardGems: 30,
  },
];

export const NEON_RUNNER_DROP_RATES: DropRateConfig = {
  baseChestDropChance: 0.4,
  scoreThresholdForDrop: 300,
  chestWeights: [
    { type: 'common', weight: 60 },
    { type: 'rare', weight: 30 },
    { type: 'epic', weight: 8 },
    { type: 'legendary', weight: 2 },
  ],
};

export const NEON_RUNNER_CONTROLS: GameControlInfo[] = [
  { key: 'Phím Space / W / ↑', action: 'Nhảy (Nhấn 2 lần để Nhảy Kép)' },
  { key: 'Phím S / ↓', action: 'Trượt / Tránh chướng ngại vật trên cao' },
  { key: 'Chạm màn hình', action: 'Nút ảo Nhảy / Trượt cho điện thoại' },
];

