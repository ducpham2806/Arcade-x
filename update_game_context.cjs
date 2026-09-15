const fs = require('fs');
let code = fs.readFileSync('src/context/GameContext.tsx', 'utf-8');

code = code.replace(
  'const [activeGameId, setActiveGameId] = useState<string | null>(null);',
  'const [activeGameId, setActiveGameId] = useState<string | null>(null);\n  const [isPracticeMode, setIsPracticeMode] = useState<boolean>(false);'
);

code = code.replace(
  'const launchGame = useCallback((gameId: string) => {',
  'const launchGame = useCallback((gameId: string, isPracticeMode = false) => {\n    setIsPracticeMode(isPracticeMode);'
);

code = code.replace(
  'launchGame,\n        exitGame,',
  'launchGame,\n        isPracticeMode,\n        exitGame,'
);

fs.writeFileSync('src/context/GameContext.tsx', code);
