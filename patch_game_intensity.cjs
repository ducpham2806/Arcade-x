const fs = require('fs');
const path = './src/games/eat-em-all/index.tsx';
let content = fs.readFileSync(path, 'utf8');

// 1. Add usePlayer import
if (!content.includes('usePlayer')) {
  content = content.replace("import { GameComponentProps } from '../../types';", "import { GameComponentProps } from '../../types';\nimport { usePlayer } from '../../context/PlayerContext';");
}

// 2. Extract profile in component
if (!content.includes('const { profile } = usePlayer();')) {
  content = content.replace("const [difficulty, setDifficulty] = useState<Difficulty>('normal');", "const { profile } = usePlayer();\n  const [difficulty, setDifficulty] = useState<Difficulty>('normal');");
}

// 3. Define intensityMultiplier
const multiplierCode = `
  // Game Intensity Profile settings applied globally
  const intensityMultiplier = profile?.gameIntensity === 'casual' ? 0.75 : profile?.gameIntensity === 'hardcore' ? 1.5 : 1;
`;
if (!content.includes('intensityMultiplier')) {
  content = content.replace("const diffPreset = DIFFICULTY_PRESETS[difficulty];", "const diffPreset = DIFFICULTY_PRESETS[difficulty];\n" + multiplierCode);
}

// 4. Apply to speed and spawnInterval
content = content.replace(
  "const effectiveSpeedMultiplier =\n    diffPreset.speedMultiplier *",
  "const effectiveSpeedMultiplier =\n    diffPreset.speedMultiplier * intensityMultiplier *"
);

content = content.replace(
  "const effectiveSpawnInterval = Math.max(\n    380,\n    diffPreset.spawnIntervalMs *",
  "const effectiveSpawnInterval = Math.max(\n    380,\n    (diffPreset.spawnIntervalMs / intensityMultiplier) *"
);

fs.writeFileSync(path, content);
console.log('patched eat em all');
