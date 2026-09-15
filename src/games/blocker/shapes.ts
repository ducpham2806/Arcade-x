import { BlockTheme } from './BlockCell';

export type ShapeMatrix = number[][];

export interface BlockShape {
  id: string;
  matrix: ShapeMatrix;
  color: BlockTheme; // Block material theme
  gemType?: 'ruby' | 'amethyst' | 'sapphire' | 'topaz';
}

export const BLOCK_THEMES: BlockTheme[] = [
  'wood_plain',
  'wood_ruby',
  'wood_amethyst',
  'wood_sapphire',
  'wood_topaz',
  'stone_olive',
  'stone_jade',
  'stone_teal',
  'stone_amber',
  'stone_ruby',
  'stone_amethyst',
  'stone_sapphire',
];

export const SHAPES: { matrix: ShapeMatrix; name: string }[] = [
  // Single dot
  { name: 'dot', matrix: [[1]] },
  
  // 2-blocks
  { name: 'h2', matrix: [[1, 1]] },
  { name: 'v2', matrix: [[1], [1]] },
  
  // 3-blocks
  { name: 'h3', matrix: [[1, 1, 1]] },
  { name: 'v3', matrix: [[1], [1], [1]] },
  { name: 'L_sm1', matrix: [[1, 0], [1, 1]] },
  { name: 'L_sm2', matrix: [[0, 1], [1, 1]] },
  { name: 'L_sm3', matrix: [[1, 1], [1, 0]] },
  { name: 'L_sm4', matrix: [[1, 1], [0, 1]] },
  
  // 4-blocks
  { name: 'sq2', matrix: [[1, 1], [1, 1]] },
  { name: 'h4', matrix: [[1, 1, 1, 1]] },
  { name: 'v4', matrix: [[1], [1], [1], [1]] },
  { name: 'T1', matrix: [[1, 1, 1], [0, 1, 0]] },
  { name: 'T2', matrix: [[0, 1, 0], [1, 1, 1]] },
  { name: 'T3', matrix: [[1, 0], [1, 1], [1, 0]] },
  { name: 'T4', matrix: [[0, 1], [1, 1], [0, 1]] },
  { name: 'Z1', matrix: [[1, 1, 0], [0, 1, 1]] },
  { name: 'Z2', matrix: [[0, 1, 1], [1, 1, 0]] },
  { name: 'Z_v1', matrix: [[0, 1], [1, 1], [1, 0]] },
  { name: 'Z_v2', matrix: [[1, 0], [1, 1], [0, 1]] },

  // Big 5-blocks & Large Ls & Squares
  { name: 'h5', matrix: [[1, 1, 1, 1, 1]] },
  { name: 'v5', matrix: [[1], [1], [1], [1], [1]] },
  { name: 'L_lg1', matrix: [[1, 0, 0], [1, 0, 0], [1, 1, 1]] },
  { name: 'L_lg2', matrix: [[0, 0, 1], [0, 0, 1], [1, 1, 1]] },
  { name: 'L_lg3', matrix: [[1, 1, 1], [1, 0, 0], [1, 0, 0]] },
  { name: 'L_lg4', matrix: [[1, 1, 1], [0, 0, 1], [0, 0, 1]] },
  { name: 'sq3', matrix: [[1, 1, 1], [1, 1, 1], [1, 1, 1]] },
  { name: 'cross', matrix: [[0, 1, 0], [1, 1, 1], [0, 1, 0]] },
];

export function getRandomShapes(count: number): BlockShape[] {
  const shapes: BlockShape[] = [];
  
  for (let i = 0; i < count; i++) {
    const s = SHAPES[Math.floor(Math.random() * SHAPES.length)];
    const theme = BLOCK_THEMES[Math.floor(Math.random() * BLOCK_THEMES.length)];
    
    let gemType: 'ruby' | 'amethyst' | 'sapphire' | 'topaz' | undefined;
    if (theme === 'wood_ruby') gemType = 'ruby';
    else if (theme === 'wood_amethyst') gemType = 'amethyst';
    else if (theme === 'wood_sapphire') gemType = 'sapphire';
    else if (theme === 'wood_topaz') gemType = 'topaz';

    shapes.push({
      id: Math.random().toString(36).substring(7),
      matrix: s.matrix,
      color: theme,
      gemType,
    });
  }
  return shapes;
}
