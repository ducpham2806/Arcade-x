const fs = require('fs');
let code = fs.readFileSync('src/games/registry.ts', 'utf-8');

// The faulty sed inserted these lines incorrectly:
code = code.replace(
  `import { CHESS_ACHIEVEMENTS, CHESS_DROP_RATES, CHESS_CONTROLS } from './chess/config';
    achievements: CHESS_ACHIEVEMENTS,
    dropRates: CHESS_DROP_RATES,
    multiplayer: true,
    supportsAI: true,
    component: ChessGame,
export const GAME_REGISTRY: Record<string, GameMetadata> = {`,
  `import { CHESS_ACHIEVEMENTS, CHESS_DROP_RATES, CHESS_CONTROLS } from './chess/config';

export const GAME_REGISTRY: Record<string, GameMetadata> = {`
);

fs.writeFileSync('src/games/registry.ts', code);
