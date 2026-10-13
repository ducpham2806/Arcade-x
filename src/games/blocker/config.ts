import { DropRateConfig, GameAchievementDef, GameControlInfo } from '../../types';

export const BLOCKER_ACHIEVEMENTS: GameAchievementDef[] = [
  {
    id: 'blocker-score-500',
    title: 'Gạch Sơ Cấp',
    description: 'Đạt 500 điểm',
    icon: '🧱',
    target: 500,
    rewardExp: 100,
    rewardCoins: 200,
    rewardGems: 0,
  },
  {
    id: 'blocker-score-2000',
    title: 'Thợ Xây Bậc Thầy',
    description: 'Đạt 2000 điểm',
    icon: '🏗️',
    target: 2000,
    rewardExp: 300,
    rewardCoins: 600,
    rewardGems: 10,
  },
  {
    id: 'blocker-score-5000',
    title: 'Kiến Trúc Sư Đỉnh Cao',
    description: 'Đạt 5000 điểm',
    icon: '⚡',
    target: 5000,
    rewardExp: 500,
    rewardCoins: 1200,
    rewardGems: 30,
  }
];

export const BLOCKER_DROP_RATES: DropRateConfig = {
  baseChestDropChance: 0.6,
  scoreThresholdForDrop: 1000,
  chestWeights: [
    { type: 'common', weight: 50 },
    { type: 'rare', weight: 30 },
    { type: 'epic', weight: 15 },
    { type: 'legendary', weight: 5 },
  ],
};

export const BLOCKER_CONTROLS: GameControlInfo[] = [
  {
    key: 'Kéo thả gạch',
    action: 'Kéo gạch từ khay bên dưới và thả vào vị trí trống trên bàn cờ',
    touchInstruction: 'Kéo thả hoặc chọn khối rồi chạm ô trên lưới; xoay và gợi ý miễn phí',
  },
  {
    key: 'Xóa hàng / cột',
    action: 'Lấp đầy 1 hàng hoặc 1 cột để xóa khối và ghi điểm',
  },
];

