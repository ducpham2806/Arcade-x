const fs = require('fs');
const path = './src/games/shikaku/index.tsx';
let content = fs.readFileSync(path, 'utf8');

// 1. Add usePlayer import
if (!content.includes('usePlayer')) {
  content = content.replace("import { GameComponentProps } from '../../types';", "import { GameComponentProps } from '../../types';\nimport { usePlayer } from '../../context/PlayerContext';");
}

// 2. Extract profile in component
if (!content.includes('const { profile } = usePlayer();')) {
  content = content.replace("const [difficulty, setDifficulty] = useState<Difficulty>('normal');", "const { profile } = usePlayer();\n  const [difficulty, setDifficulty] = useState<Difficulty>('normal');");
}

// 3. Define intensity in difficulty options (or grid size)
// Let's find where generatePuzzle is called and pass intensity. Or override difficulty if it's dynamic.
console.log('checked shikaku');
