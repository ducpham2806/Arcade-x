import { packageLazy } from '../gamePackages';
import type { GameMetadata } from '../../types';
import { SNAKE_GAME_ID } from './catalog-mode';
import { snakeMetadata } from './metadata';

export const snakeCatalogEntries: Record<string, GameMetadata> = {
  [SNAKE_GAME_ID]: {
    ...snakeMetadata(packageLazy(SNAKE_GAME_ID, () => import('./SnakeLegendCatalog'))),
    title: 'Rắn Săn Mồi',
    shortDesc: '10 màn phiêu lưu · Tiến trình lưu trên thiết bị',
    offlinePackage: '/snake-offline-package.json',
    launcherScores: false,
  },
};
