import { GameControlInfo, GameAchievementDef, DropRateConfig } from '../../types';

export const WORD_CROSS_CONTROLS: GameControlInfo[] = [
  { key: 'Vuốt / Chạm', action: 'Nối các chữ cái lại với nhau để tạo thành từ có nghĩa' },
  { key: 'Nút Hint', action: 'Sử dụng xu (hoặc kim cương) để nhận gợi ý' },
];

export const WORD_CROSS_ACHIEVEMENTS: GameAchievementDef[] = [
  {
    id: 'wc_first_word',
    title: 'Khởi Đầu Mới',
    description: 'Tìm được từ đầu tiên.',
    icon: '🔤',
    target: 1,
    rewardExp: 50,
    rewardCoins: 50,
    rewardGems: 2
  },
  {
    id: 'wc_level_10',
    title: 'Học Giả Tân Binh',
    description: 'Hoàn thành 10 màn chơi.',
    icon: '🎓',
    target: 10,
    rewardExp: 300,
    rewardCoins: 500,
    rewardGems: 10
  }
];

export const WORD_CROSS_DROP_RATES: DropRateConfig = {
  baseChestDropChance: 0.1,
  scoreThresholdForDrop: 5, // drop after 5 levels
  chestWeights: [
    { type: 'common', weight: 70 },
    { type: 'rare', weight: 25 },
    { type: 'epic', weight: 5 },
    { type: 'legendary', weight: 0 },
  ],
};
