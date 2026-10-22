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
  {key:'← / → hoặc A / D',action:'Di chuyển và chọn tuyến đường'},
  {key:'Space / W / ↑',action:'Nhảy; kết hợp dash khi kỹ năng đã mở'},
  {key:'E / Tương tác',action:'Dùng máy, mở cổng và hoàn thành nhiệm vụ'},
  {key:'Điện thoại',action:'V-pad nhỏ cùng nút Nhảy và Tương tác'},
];
