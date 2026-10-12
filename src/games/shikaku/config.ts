import { GameControlInfo, GameAchievementDef, DropRateConfig } from '../../types';

export const SHIKAKU_CONTROLS: GameControlInfo[] = [
  { key: 'Mouse/Touch', action: 'Draw', touchInstruction: 'Chạm và kéo thả trên màn hình để vẽ hình chữ nhật.' },
  { key: 'Tap', action: 'Delete', touchInstruction: 'Chạm vào vùng đã vẽ rồi bấm Xóa vùng để sửa.' },
  { key: 'Undo', action: 'Revert', touchInstruction: 'Bấm Hoàn tác miễn phí để quay lại bước trước.' },
];

export const SHIKAKU_ACHIEVEMENTS: GameAchievementDef[] = [
  {
    id: 'shikaku_beginner',
    title: 'Người Mới Bắt Đầu',
    description: 'Hoàn thành 1 câu đố Shikaku',
    icon: '👶',
    target: 1,
    rewardExp: 50,
    rewardCoins: 50,
    rewardGems: 0,
  },
  {
    id: 'shikaku_master',
    title: 'Bậc Thầy Không Gian',
    description: 'Đạt điểm 10 trong Zen Mode',
    icon: '👑',
    target: 10,
    rewardExp: 150,
    rewardCoins: 200,
    rewardGems: 5,
  },
  {
    id: 'shikaku_speed',
    title: 'Bàn Tay Chớp Nhoáng',
    description: 'Đạt điểm 5 trong Time Attack (3 phút)',
    icon: '⚡',
    target: 5,
    rewardExp: 200,
    rewardCoins: 300,
    rewardGems: 10,
  },
];

export const SHIKAKU_DROP_RATES: DropRateConfig = {
  baseChestDropChance: 0.4,
  scoreThresholdForDrop: 3,
  chestWeights: [
    { type: 'common', weight: 50 },
    { type: 'rare', weight: 30 },
    { type: 'epic', weight: 15 },
    { type: 'legendary', weight: 5 },
  ],
};
