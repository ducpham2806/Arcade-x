import type { GameMetadata } from '../../types';
import icon from '../../preview/snake/art/icon.webp';
import banner from '../../preview/snake/art/banner.webp';
import { SNAKE_GAME_ID } from './catalog-mode';

export function snakeMetadata(component: GameMetadata['component']): GameMetadata {
  return {
    id: SNAKE_GAME_ID,
    title: 'Rắn Săn Mồi · R01',
    shortDesc: 'Theo dấu ngọc xanh qua 10 màn',
    description: 'Cùng Tiểu Xà vượt đồng cỏ, qua ba cây cầu và đối mặt với Nhện Mẹ.',
    category: 'Arcade',
    difficulty: 'Trung Bình',
    icon: '🐍',
    bannerGradient: 'from-emerald-900 to-lime-800',
    themeColor: '#214d3e',
    tags: ['R01', 'Bản thử'],
    controls: [
      { key: 'WASD / Mũi tên', action: 'Lái', touchInstruction: 'Kéo joystick' },
      { key: 'Space', action: 'Dash', touchInstruction: 'Giữ nút Dash' },
      { key: 'Escape', action: 'Tạm dừng' },
    ],
    achievements: [],
    dropRates: { baseChestDropChance: 0, scoreThresholdForDrop: Number.MAX_SAFE_INTEGER, chestWeights: [] },
    artwork: { icon, banner },
    component,
  };
}
