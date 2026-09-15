const fs = require('fs');
let code = fs.readFileSync('src/games/chess/index.tsx', 'utf-8');

code = code.replace(
  /const \{ profile \} = usePlayer\(\);/,
  "const { profile } = usePlayer();\n  const playerElo = profile?.stats?.highScores?.['chess-elo'] || 1200;\n  const playerWins = profile?.stats?.gamesPlayedCount?.['chess'] || 0;"
);

fs.writeFileSync('src/games/chess/index.tsx', code);
