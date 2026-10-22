import { DropRateConfig, GameAchievementDef, GameControlInfo } from '../../types';

export const DUNGEON_TAP_ACHIEVEMENTS: GameAchievementDef[] = [
  {
    id: 'ach-dungeon-floor-5',
    title: 'Chinh Phục Tầng 5',
    description: 'Vượt qua 5 tầng quái vật và Boss hầm ngục.',
    icon: '🛡️',
    target: 5,
    rewardExp: 200,
    rewardCoins: 450,
    rewardGems: 25,
  },
];

export const DUNGEON_TAP_DROP_RATES: DropRateConfig = {
  baseChestDropChance: 0.5,
  scoreThresholdForDrop: 3, // 3 floors
  chestWeights: [
    { type: 'common', weight: 45 },
    { type: 'rare', weight: 35 },
    { type: 'epic', weight: 15 },
    { type: 'legendary', weight: 5 },
  ],
};

export const DUNGEON_TAP_CONTROLS: GameControlInfo[] = [
  { key: 'Chạm / giữ Tấn công', action: 'Chạm Titan hoặc giữ nút Tấn công để tự chém 4 đòn/giây, tích combo và hồi năng lượng' },
  { key: '7 tuyệt kỹ / Đỡ đòn', action: 'Dùng tuyệt kỹ khi Titan lộ lõi. Đỡ khi vòng cảnh báo sáng để tránh mất thời gian và nhận +10 MP' },
  { key: 'Nâng Cấp & Trang Bị', action: 'Tăng cấp Kiếm Sĩ, chiêu mộ Đồng Đội và mặc trang bị rớt từ quái' },
];
