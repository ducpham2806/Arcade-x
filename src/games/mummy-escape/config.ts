import { GameControlInfo, GameAchievementDef, DropRateConfig } from '../../types';

export const MUMMY_ESCAPE_CONTROLS: GameControlInfo[] = [
  {
    key: 'Arrow Keys / WASD',
    action: 'Di chuyển thám hiểm 1 ô (Lên/Xuống/Trái/Phải)',
    touchInstruction: 'Vuốt 4 hướng hoặc bấm phím D-Pad',
  },
  {
    key: 'Spacebar / Phím 5',
    action: 'Đứng yên / Bỏ lượt (Skip Turn) để lừa xác ướp di chuyển',
    touchInstruction: 'Bấm nút Bỏ Lượt (Wait)',
  },
  {
    key: 'Z / U',
    action: 'Hoàn Tác Lượt (Revert Turn) - Giới hạn 3 lần mỗi màn',
    touchInstruction: 'Bấm nút Hoàn Tác (Revert)',
  },
  {
    key: 'T',
    action: 'Bật / Tắt Radar cảnh báo đường đi của xác ướp (Warning Path)',
    touchInstruction: 'Bấm nút Cảnh Báo trên góc hầm mộ',
  },
  {
    key: 'R / Reset',
    action: 'Chơi lại màn ma trận hiện tại',
    touchInstruction: 'Bấm nút Chơi Lại (Reset)',
  },
  {
    key: 'Chạm Ô Kế Bên',
    action: 'Chạm trực tiếp vào ô có chấm sáng để đi tới đó',
    touchInstruction: 'Chạm 1 chạm vào ô hợp lệ',
  },
];

export const MUMMY_ESCAPE_ACHIEVEMENTS: GameAchievementDef[] = [
  {
    id: 'mummy-first-escape',
    title: 'Thoát Hiểm Kim Tự Tháp',
    description: 'Vượt qua căn phòng hầm mộ đầu tiên an toàn.',
    icon: '🏛️',
    target: 1,
    rewardCoins: 50,
    rewardGems: 1,
    rewardExp: 100,
  },
  {
    id: 'mummy-trapper',
    title: 'Bậc Thầy Bẫy Xác Ướp',
    description: 'Lừa thành công 5 xác ướp va chạm vào nhau hoặc rơi vào góc chết.',
    icon: '🪤',
    target: 5,
    rewardCoins: 100,
    rewardGems: 2,
    rewardExp: 200,
  },
  {
    id: 'mummy-speedrunner',
    title: 'Bàn Chân Vàng Pharaoh',
    description: 'Vượt qua 5 phòng hầm mộ trong chế độ Thử Thách Thời Gian (Time Attack).',
    icon: '⚡',
    target: 5,
    rewardCoins: 150,
    rewardGems: 3,
    rewardExp: 300,
  },
  {
    id: 'mummy-perfectionist',
    title: 'Nhà Khảo Cổ Xuất Sắc',
    description: 'Đạt trọn vẹn 3 sao ở 6 màn chơi bất kỳ.',
    icon: '⭐',
    target: 6,
    rewardCoins: 200,
    rewardGems: 4,
    rewardExp: 400,
  },
  {
    id: 'mummy-pyramid-master',
    title: 'Chinh Phục Lăng Mộ Vua',
    description: 'Vượt qua toàn bộ 15 tầng hầm mộ trong chế độ Chiến Dịch.',
    icon: '👑',
    target: 15,
    rewardCoins: 500,
    rewardGems: 10,
    rewardExp: 1000,
  },
];

export const MUMMY_ESCAPE_DROP_RATES: DropRateConfig = {
  scoreThresholdForDrop: 300,
  baseChestDropChance: 0.25,
  chestWeights: [
    { type: 'common', weight: 60 },
    { type: 'rare', weight: 28 },
    { type: 'epic', weight: 10 },
    { type: 'legendary', weight: 2 },
  ],
};
