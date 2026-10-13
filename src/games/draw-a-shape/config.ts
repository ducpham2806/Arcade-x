import { GameControlInfo, DropRateConfig } from '../../types';

export const DRAW_SHAPE_ACHIEVEMENTS = [];

export const DRAW_SHAPE_DROP_RATES: DropRateConfig = {
  baseChestDropChance: 0.25,
  scoreThresholdForDrop: 500,
  chestWeights: [
    { type: 'common', weight: 50 },
    { type: 'rare', weight: 30 },
    { type: 'epic', weight: 15 },
    { type: 'legendary', weight: 5 }
  ]
};

export const DRAW_SHAPE_CONTROLS: GameControlInfo[] = [
  { key: 'Touch/Drag', action: 'Kéo', touchInstruction: 'Kéo từ ô số để vẽ hình' },
  { key: 'Tap', action: 'Chạm', touchInstruction: 'Chạm vào ô đang vẽ để sửa' }
];

