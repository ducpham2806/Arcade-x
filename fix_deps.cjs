const fs = require('fs');
let code = fs.readFileSync('src/games/chess/index.tsx', 'utf-8');

code = code.replace(/unlockAchievement, addScore, dropLootItem/g, 'reportProgress, submitScore, triggerLootRoll');

fs.writeFileSync('src/games/chess/index.tsx', code);
