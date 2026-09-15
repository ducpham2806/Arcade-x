const fs = require('fs');
let code = fs.readFileSync('src/games/registry.ts', 'utf-8');

code = code.replace(
`    controls: CHESS_CONTROLS,
    achievements: CHESS_ACHIEVEMENTS,
    dropRates: CHESS_DROP_RATES,
    multiplayer: true,
    supportsAI: true,
    component: ChessGame,
    dropRates: CHESS_DROP_RATES,
    multiplayer: true,
    supportsAI: true,
    component: ChessGame,`,
`    controls: CHESS_CONTROLS,
    achievements: CHESS_ACHIEVEMENTS,
    dropRates: CHESS_DROP_RATES,
    multiplayer: true,
    supportsAI: true,
    component: ChessGame,`
);

fs.writeFileSync('src/games/registry.ts', code);
