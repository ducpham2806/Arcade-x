import { DropRateConfig, GameAchievementDef, GameControlInfo } from '../../types';

export const CYBER_SLICE_ACHIEVEMENTS: GameAchievementDef[] = [
  {
    id: 'ach-slice-combo-10',
    title: 'Kiếm Thuật Thần Sầu',
    description: 'Cắt đứt liên hoàn 10 mục tiêu trong 1 đường kiếm.',
    icon: '🗡️',
    target: 10,
    rewardExp: 150,
    rewardCoins: 300,
    rewardGems: 15,
  },
  {
    id: 'ach-slice-fruits-100',
    title: 'Bậc Thầy Trảm Quả',
    description: 'Chém nát 100 loại trái cây mọng nước.',
    icon: '🍉',
    target: 100,
    rewardExp: 200,
    rewardCoins: 400,
    rewardGems: 20,
  },
  {
    id: 'ach-slice-stage-5',
    title: 'Đao Khách Viễn Chinh',
    description: 'Vượt qua 5 màn chơi mục tiêu trong Chế Độ Chinh Phục.',
    icon: '🏆',
    target: 5,
    rewardExp: 250,
    rewardCoins: 500,
    rewardGems: 25,
  },
];

export const CYBER_SLICE_DROP_RATES: DropRateConfig = {
  baseChestDropChance: 0.5,
  scoreThresholdForDrop: 150,
  chestWeights: [
    { type: 'common', weight: 50 },
    { type: 'rare', weight: 32 },
    { type: 'epic', weight: 14 },
    { type: 'legendary', weight: 4 },
  ],
};

export const CYBER_SLICE_CONTROLS: GameControlInfo[] = [
  { key: 'Vuốt Màn Hình / Kéo Chuột', action: 'Tung đường kiếm ánh sáng chém nát hoa quả tươi ngon' },
  { key: 'Tránh Xa Bom Gai Đỏ (☠️)', action: 'Khối cơ khí đầu lâu nguy hiểm sẽ phát nổ và trừ mạng' },
  { key: 'Mục Tiêu Màn Chơi (Target)', action: 'Thu thập đủ số lượng quả yêu cầu để kết thúc và thắng màn' },
  { key: 'Quả Băng Giá ❄️ & Bão Táp 🌪️', action: 'Làm chậm thời gian Matrix hoặc kích hoạt mưa hoa quả' },
];

