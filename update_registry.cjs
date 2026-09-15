const fs = require('fs');

let content = fs.readFileSync('src/games/registry.ts', 'utf-8');

const importStr = `
import { BlockerGame } from './blocker';
import { BLOCKER_ACHIEVEMENTS, BLOCKER_DROP_RATES, BLOCKER_CONTROLS } from './blocker/config';
`;

content = content.replace("import { ChessGame } from './chess';", "import { ChessGame } from './chess';" + importStr);

const registryStr = `
  'blocker': {
    id: 'blocker',
    title: 'Xếp Gạch (Block Puzzle)',
    shortDesc: 'Xếp gạch phá hàng ngang dọc ghi điểm rớt ngọc',
    description: 'Game xếp gạch cổ điển! Kéo thả các khối gạch đủ hình dạng vào bàn cờ 8x8. Khi một hàng hoặc cột được lấp đầy, nó sẽ biến mất và ghi điểm. Cố gắng đạt combo và điểm cao để nhận ngọc và vật phẩm!',
    category: 'Puzzle',
    difficulty: 'Dễ',
    icon: '🧱',
    bannerGradient: 'from-blue-900/60 via-purple-950/80 to-slate-900',
    themeColor: '#3b82f6',
    tags: ['Giải Đố', 'Xếp Hình', 'Block Puzzle', 'Combo', 'Trí Tuệ'],
    controls: BLOCKER_CONTROLS,
    achievements: BLOCKER_ACHIEVEMENTS,
    dropRates: BLOCKER_DROP_RATES,
    component: BlockerGame,
  },
`;

content = content.replace("export const GAME_REGISTRY: Record<string, GameMetadata> = {", "export const GAME_REGISTRY: Record<string, GameMetadata> = {" + registryStr);

fs.writeFileSync('src/games/registry.ts', content);
