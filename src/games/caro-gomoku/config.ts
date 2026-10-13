import { GameControlInfo, GameAchievementDef, DropRateConfig } from '../../types';

export const CARO_GOMOKU_CONTROLS: GameControlInfo[] = [
  { key: 'Chạm / Click', action: 'Đặt quân cờ vào ô 15x15', touchInstruction: 'Chạm trực tiếp vào ô trên bàn cờ' },
  { key: 'Phím Rộng / Kéo', action: 'Phóng to/thu nhỏ hoặc di chuyển bàn cờ trên di động', touchInstruction: 'Vuốt để quan sát toàn bộ bàn cờ' },
];

export const CARO_GOMOKU_ACHIEVEMENTS: GameAchievementDef[] = [
  {
    id: 'caro_first_win',
    title: 'Kỳ Thủ Sơ Nhập',
    description: 'Giành chiến thắng trận đầu tiên trong chế độ Cờ Caro Online',
    icon: '🎯',
    target: 1,
    rewardExp: 100,
    rewardCoins: 200,
    rewardGems: 5,
  },
  {
    id: 'caro_win_streak_3',
    title: 'Tam Liên Thắng',
    description: 'Thắng liên tiếp 3 ván cờ Caro PvP',
    icon: '🔥',
    target: 3,
    rewardExp: 300,
    rewardCoins: 500,
    rewardGems: 15,
  },
  {
    id: 'caro_elo_1400',
    title: 'Bậc Thầy Bàn Cờ',
    description: 'Đạt mốc 1400 điểm ELO xếp hạng trực tuyến',
    icon: '👑',
    target: 1400,
    rewardExp: 600,
    rewardCoins: 1000,
    rewardGems: 30,
  },
  {
    id: 'caro_quick_win',
    title: 'Tốc Chiến Tốc Thắng',
    description: 'Hạ gục đối thủ chỉ trong vòng 15 nước đi',
    icon: '⚡',
    target: 1,
    rewardExp: 250,
    rewardCoins: 400,
    rewardGems: 10,
  },
];

export const CARO_GOMOKU_DROP_RATES: DropRateConfig = {
  baseChestDropChance: 0.5,
  scoreThresholdForDrop: 1,
  chestWeights: [
    { type: 'common', weight: 40 },
    { type: 'rare', weight: 35 },
    { type: 'epic', weight: 20 },
    { type: 'legendary', weight: 5 },
  ],
};

