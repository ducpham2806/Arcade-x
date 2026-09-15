import { GameControlInfo, GameAchievementDef, DropRateConfig } from '../../types';

export const XIANGQI_CONTROLS: GameControlInfo[] = [
  { key: 'Chạm / Click quân cờ', action: 'Chọn quân cờ và hiển thị các ô di chuyển hợp lệ', touchInstruction: 'Chạm quân cờ để xem nước đi' },
  { key: 'Chạm ô chấm sáng', action: 'Thực hiện nước đi hoặc ăn quân đối phương', touchInstruction: 'Chạm điểm đến để di chuyển' },
  { key: 'Nút Đầu hàng / Cầu hòa', action: 'Xin đầu hàng hoặc gửi yêu cầu hòa cờ trực tuyến', touchInstruction: 'Chạm các nút chức năng bên dưới bàn cờ' },
];

export const XIANGQI_ACHIEVEMENTS: GameAchievementDef[] = [
  {
    id: 'xiangqi_first_win',
    title: 'Kỳ Nghệ Sơ Khai',
    description: 'Giành chiến thắng trận đầu tiên trong chế độ Cờ Tướng Online',
    icon: '🎴',
    target: 1,
    rewardExp: 150,
    rewardCoins: 300,
    rewardGems: 10,
  },
  {
    id: 'xiangqi_win_streak_3',
    title: 'Đại Sư Kỳ Đạo',
    description: 'Chiến thắng 3 trận Cờ Tướng PvP liên tiếp',
    icon: '🔥',
    target: 3,
    rewardExp: 400,
    rewardCoins: 600,
    rewardGems: 20,
  },
  {
    id: 'xiangqi_elo_1500',
    title: 'Kỳ Thánh Xuất Thế',
    description: 'Đạt mốc 1500 điểm ELO Cờ Tướng Xếp Hạng',
    icon: '👑',
    target: 1500,
    rewardExp: 800,
    rewardCoins: 1200,
    rewardGems: 40,
  },
];

export const XIANGQI_DROP_RATES: DropRateConfig = {
  baseChestDropChance: 0.6,
  scoreThresholdForDrop: 1,
  chestWeights: [
    { type: 'common', weight: 35 },
    { type: 'rare', weight: 35 },
    { type: 'epic', weight: 22 },
    { type: 'legendary', weight: 8 },
  ],
};
