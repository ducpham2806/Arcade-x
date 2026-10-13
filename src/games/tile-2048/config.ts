import { DropRateConfig, GameAchievementDef, GameControlInfo } from '../../types';

export const TILE_2048_ACHIEVEMENTS: GameAchievementDef[] = [
  {
    id: 'ach-2048-reach-512',
    title: 'Thợ Săn Ngọc 512',
    description: 'Ghép thành công ô số 512 và kích hoạt tính năng rớt 10 Ngọc.',
    icon: '💎',
    target: 512,
    rewardExp: 150,
    rewardCoins: 300,
    rewardGems: 15,
  },
  {
    id: 'ach-2048-reach-1024',
    title: 'Đại Phú Hào 1024',
    description: 'Ghép thành công ô số 1024 và kích hoạt rớt 25 Ngọc.',
    icon: '✨',
    target: 1024,
    rewardExp: 250,
    rewardCoins: 600,
    rewardGems: 30,
  },
  {
    id: 'ach-2048-reach-2048',
    title: 'Huyền Thoại 2048',
    description: 'Chinh phục ô số 2048 tối thượng và ẵm trọn 50 Ngọc thưởng.',
    icon: '👑',
    target: 2048,
    rewardExp: 500,
    rewardCoins: 1200,
    rewardGems: 60,
  },
  {
    id: 'ach-2048-score-5000',
    title: 'Bậc Thầy Tính Toán',
    description: 'Đạt tổng điểm 5,000 trong Xếp Gạch 2048.',
    icon: '🔢',
    target: 5000,
    rewardExp: 200,
    rewardCoins: 400,
    rewardGems: 20,
  },
];

export const TILE_2048_DROP_RATES: DropRateConfig = {
  baseChestDropChance: 0.5,
  scoreThresholdForDrop: 800,
  chestWeights: [
    { type: 'common', weight: 45 },
    { type: 'rare', weight: 35 },
    { type: 'epic', weight: 15 },
    { type: 'legendary', weight: 5 },
  ],
};

export const TILE_2048_CONTROLS: GameControlInfo[] = [
  {
    key: 'Vuốt màn hình (Lên / Xuống / Trái / Phải)',
    action: 'Trượt tất cả các ô số theo hướng vuốt để ghép các ô cùng giá trị',
    touchInstruction: 'Vuốt trực tiếp trên bàn cờ hoặc dùng cụm phím điều hướng ảo',
  },
  {
    key: 'Phím mũi tên / Phím W-A-S-D',
    action: 'Điều khiển trượt ô số trên bàn phím máy tính',
  },
  {
    key: 'Đạt mốc 512 / 1024 / 2048',
    action: 'Ghép các ô giống nhau để đạt ô số lớn hơn và tăng điểm',
  },
  {
    key: 'Kỹ năng Hoàn Tác & Xáo Ô',
    action: 'Dùng kỹ năng hỗ trợ cứu cánh khi bàn cờ bị tắc nghẽn',
  },
];

