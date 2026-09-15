import { DropRateConfig, GameAchievementDef, GameControlInfo } from '../../types';

export const HEX_MATCH_ACHIEVEMENTS: GameAchievementDef[] = [
  {
    id: 'ach-hex-1000',
    title: 'Bậc Thầy Xếp Lưới',
    description: 'Đạt 1,000 điểm trong Hex Match.',
    icon: '🔷',
    target: 1000,
    rewardExp: 180,
    rewardCoins: 350,
    rewardGems: 20,
  },
  {
    id: 'ach-hex-level5',
    title: 'Phá Băng Bắc Cực',
    description: 'Vượt qua Màn 5 trong Chế độ Chiến Dịch Level.',
    icon: '🧊',
    target: 5,
    rewardExp: 250,
    rewardCoins: 500,
    rewardGems: 30,
  },
  {
    id: 'ach-hex-combo',
    title: 'Sugar Crush Hexa',
    description: 'Đạt chuỗi liên hoàn Combo x4 trở lên.',
    icon: '⚡',
    target: 4,
    rewardExp: 200,
    rewardCoins: 400,
    rewardGems: 25,
  },
];

export const HEX_MATCH_DROP_RATES: DropRateConfig = {
  baseChestDropChance: 0.5,
  scoreThresholdForDrop: 400,
  chestWeights: [
    { type: 'common', weight: 45 },
    { type: 'rare', weight: 35 },
    { type: 'epic', weight: 15 },
    { type: 'legendary', weight: 5 },
  ],
};

export const HEX_MATCH_CONTROLS: GameControlInfo[] = [
  { key: 'Chạm ô lục giác (≥3 ô cùng màu)', action: 'Nổ cụm màu và kích hoạt chuỗi dây chuyền Combo' },
  { key: 'Ăn cụm 4 ô', action: 'Tạo Tên Lửa (Rocket ⚡) bắn quét sạch 1 hàng' },
  { key: 'Ăn cụm 5 ô', action: 'Tạo Bom Hex (Bomb 💣) nổ tan diện tích lớn' },
  { key: 'Ăn cụm ≥6 ô', action: 'Tạo Viên Ngọc Cầu Vồng (Rainbow 🌈) quét sạch toàn bộ 1 màu' },
  { key: 'Booster Búa (🔨)', action: 'Đập vỡ lập tức 1 ô bất kỳ hoặc chướng ngại vật' },
  { key: 'Chướng ngại vật', action: 'Ăn kề để phá Băng (🧊), Đá (🪨) và bẻ Xích (🔒)' },
];
