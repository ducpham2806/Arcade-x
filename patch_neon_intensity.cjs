const fs = require('fs');
const path = './src/games/neon-runner/index.tsx';
let content = fs.readFileSync(path, 'utf8');

// 1. Add usePlayer import if not exists
if (!content.includes('usePlayer')) {
  content = content.replace("import { GameComponentProps } from '../../types';", "import { GameComponentProps } from '../../types';\nimport { usePlayer } from '../../context/PlayerContext';");
}

// 2. Extract profile in component
if (!content.includes('const { profile } = usePlayer();')) {
  content = content.replace("const [isPlaying, setIsPlaying] = useState(false);", "const { profile } = usePlayer();\n  const [isPlaying, setIsPlaying] = useState(false);");
}

// 3. Define intensityMultiplier in stateRef initialization or startGame
const multiplierCode = `
      // Game Intensity profile applied
      const intensityMultiplier = profile?.gameIntensity === 'casual' ? 0.75 : profile?.gameIntensity === 'hardcore' ? 1.4 : 1;
      s.baseSpeed = 6 * intensityMultiplier;
      s.speed = s.baseSpeed;
`;
content = content.replace("s.speed = 6;\n      s.baseSpeed = 6;", multiplierCode);

fs.writeFileSync(path, content);
console.log('patched neon runner');
