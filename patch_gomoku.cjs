const fs = require('fs');
let code = fs.readFileSync('src/games/caro-gomoku/index.tsx', 'utf-8');

code = code.replace(
  '  isMuted,\n  onGameOver,\n  onRestart,\n}) => {',
  '  isMuted,\n  isPracticeMode,\n  onGameOver,\n  onRestart,\n}) => {'
);

code = code.replace(
  "const [screenMode, setScreenMode] = useState<ScreenMode>('lobby');",
  "const [screenMode, setScreenMode] = useState<ScreenMode>(isPracticeMode ? 'ai_practice' : 'lobby');"
);

fs.writeFileSync('src/games/caro-gomoku/index.tsx', code);
