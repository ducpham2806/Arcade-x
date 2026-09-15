import { GameMetadata } from '../../types';
import { DrawAShapeGame } from './index';
import { DRAW_SHAPE_ACHIEVEMENTS, DRAW_SHAPE_CONTROLS, DRAW_SHAPE_DROP_RATES } from './config';

export const DrawAShapeMeta: GameMetadata = {
  id: 'draw-a-shape',
  title: 'Draw A Shape',
  shortDesc: 'Vuốt để vẽ đường đi qua các ô vuông sao cho độ dài đường đi bằng đúng con số ở ô xuất phát',
  description: 'Trò chơi giải đố thông minh: Vuốt ngón tay từ những ô chứa số để tạo thành đường đi qua các ô trống. Hãy lấp đầy toàn bộ bảng với các đường vẽ sao cho mỗi vùng có số lượng ô chính xác bằng với số được ghi!',
  icon: '🖍️',
  bannerGradient: 'from-blue-600/60 via-indigo-900/80 to-slate-900',
  themeColor: '#6366f1',
  category: 'Puzzle',
  difficulty: 'Trung Bình',
  tags: ['Puzzle', 'Trí tuệ', 'Draw', 'Vẽ'],
  controls: DRAW_SHAPE_CONTROLS,
  achievements: DRAW_SHAPE_ACHIEVEMENTS,
  dropRates: DRAW_SHAPE_DROP_RATES,
  component: DrawAShapeGame,
};
