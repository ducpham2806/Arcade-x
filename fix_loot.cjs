const fs = require('fs');
let code = fs.readFileSync('src/games/blocker/index.tsx', 'utf-8');

code = code.replace(/bridge\.triggerLootRoll\('score', newScore\);/g, 'bridge.triggerLootRoll(newScore);');

fs.writeFileSync('src/games/blocker/index.tsx', code);
