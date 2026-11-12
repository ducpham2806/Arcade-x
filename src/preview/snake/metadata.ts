import { packageLazy } from '../../games/gamePackages';
import { SNAKE_GAME_ID } from '../../games/snake-legend/catalog-mode';
import { snakeMetadata } from '../../games/snake-legend/metadata';

export const snakePreview = snakeMetadata(
  packageLazy(SNAKE_GAME_ID, () => import('../../games/snake-legend/SnakeLegendPreview')),
);
