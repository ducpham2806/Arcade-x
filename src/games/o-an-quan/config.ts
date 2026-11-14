import type { DropRateConfig, GameAchievementDef, GameControlInfo } from '../../types';

export const O_AN_QUAN_CONTROLS: GameControlInfo[] = [
  { key: 'Chạm ô Dân', action: 'Chọn 1 trong 5 ô Dân phía dưới để xem trước đường rải sỏi.' },
  { key: '◀ Rải Trái / Rải Phải ▶', action: 'Chọn hướng rải sỏi theo hoặc ngược chiều kim đồng hồ.' },
  { key: 'Phòng 1vs1', action: 'Ghép trận ngẫu nhiên hoặc tạo phòng gửi mã 6 ký tự cho bạn bè.' },
];

export const O_AN_QUAN_ACHIEVEMENTS: GameAchievementDef[] = [];

export const O_AN_QUAN_DROP_RATES: DropRateConfig = {
  baseChestDropChance: 0.25,
  scoreThresholdForDrop: 20,
  chestWeights: [
    { type: 'common', weight: 65 },
    { type: 'rare', weight: 28 },
    { type: 'epic', weight: 7 },
  ],
};
