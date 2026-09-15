const fs = require('fs');
let code = fs.readFileSync('src/games/GameWrapper.tsx', 'utf-8');

code = code.replace(
  'const { profile, addCoins, addExp, unlockAchievement, updateStats } = usePlayer();',
  'const { profile, addCoins, addExp, unlockAchievement, updateStats } = usePlayer();\n  const { isPracticeMode } = useGame();'
);

code = code.replace(
  '<GameComponent\n          key={gameSessionKey}',
  '<GameComponent\n          key={gameSessionKey}\n          isPracticeMode={isPracticeMode}'
);

fs.writeFileSync('src/games/GameWrapper.tsx', code);
