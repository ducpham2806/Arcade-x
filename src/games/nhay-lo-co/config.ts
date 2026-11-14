import type { DropRateConfig, GameAchievementDef, GameControlInfo } from '../../types';

export const NHAY_LO_CO_CONTROLS: GameControlInfo[] = [
  { key: 'Nút THẢY CHÀM', action: 'Canh thanh lực dừng ở vùng Xanh để ném mảnh sành vào đúng ô mục tiêu.' },
  { key: '🦶 1 CHÂN / 🦶🦶 2 CHÂN', action: 'Bấm đúng nhịp nhảy qua 10 ô (nhảy vọt qua ô có Chàm và Nhà đối thủ).' },
  { key: 'Phòng 1vs1', action: 'Ghép trận ngẫu nhiên hoặc tạo phòng gửi mã 6 ký tự cho bạn bè.' },
];

export const NHAY_LO_CO_ACHIEVEMENTS: GameAchievementDef[] = [];

export const NHAY_LO_CO_DROP_RATES: DropRateConfig = {
  baseChestDropChance: 0.25,
  scoreThresholdForDrop: 30,
  chestWeights: [
    { type: 'common', weight: 65 },
    { type: 'rare', weight: 28 },
    { type: 'epic', weight: 7 },
  ],
};
