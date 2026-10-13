import { GameControlInfo, GameAchievementDef, DropRateConfig } from '../../types';

export const CHESS_CONTROLS: GameControlInfo[] = [
  { key: 'Chạm / Click quân cờ', action: 'Chọn quân cờ và hiển thị các ô di chuyển hợp lệ', touchInstruction: 'Chạm quân cờ để xem nước đi' },
  { key: 'Chạm ô chấm sáng', action: 'Thực hiện nước đi hoặc ăn quân đối phương', touchInstruction: 'Chạm điểm đến để di chuyển' },
  { key: 'Nút Đầu hàng / Cầu hòa', action: 'Xin đầu hàng hoặc gửi yêu cầu hòa cờ trực tuyến', touchInstruction: 'Chạm các nút chức năng bên dưới bàn cờ' },
];

export const CHESS_ACHIEVEMENTS: GameAchievementDef[] = [
  {
    id: 'chess_first_win',
    title: 'Chiếu Bí Đầu Tay',
    description: 'Giành chiến thắng trận đầu tiên trong chế độ Cờ Vua Quốc Tế',
    icon: '♟️',
    target: 1,
    rewardExp: 160,
    rewardCoins: 300,
    rewardGems: 10,
  },
  {
    id: 'chess_win_streak_3',
    title: 'Đại Kiện Tướng',
    description: 'Chiến thắng 3 trận Cờ Vua PvP liên tiếp',
    icon: '🏆',
    target: 3,
    rewardExp: 450,
    rewardCoins: 650,
    rewardGems: 25,
  },
  {
    id: 'chess_elo_1500',
    title: 'Kỳ Thủ Huyền Thoại',
    description: 'Đạt mốc 1500 điểm ELO Cờ Vua Xếp Hạng',
    icon: '👑',
    target: 1500,
    rewardExp: 800,
    rewardCoins: 1200,
    rewardGems: 50,
  },
];

export const CHESS_DROP_RATES: DropRateConfig = {
  baseChestDropChance: 0.65,
  scoreThresholdForDrop: 1,
  chestWeights: [
    { type: 'common', weight: 30 },
    { type: 'rare', weight: 38 },
    { type: 'epic', weight: 24 },
    { type: 'legendary', weight: 8 },
  ],
};

