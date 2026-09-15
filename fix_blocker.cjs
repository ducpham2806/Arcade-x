const fs = require('fs');
let code = fs.readFileSync('src/games/blocker/index.tsx', 'utf-8');

// replace profile.stats.highScores['blocker'] with local bestScore state
if (!code.includes('const [bestScore, setBestScore]')) {
  code = code.replace('const [score, setScore] = useState(0);', 'const [score, setScore] = useState(0);\n  const [bestScore, setBestScore] = useState(() => parseInt(localStorage.getItem("blocker_best") || "0"));');
}

code = code.replace(/profile\.stats\.highScores\['blocker'\] \|\| 0/g, 'bestScore');

code = code.replace(/bridge\.updateStats\(\{[\s\S]*?\}\);/g, 'setBestScore(finalScore);\n      localStorage.setItem("blocker_best", finalScore.toString());');

fs.writeFileSync('src/games/blocker/index.tsx', code);
