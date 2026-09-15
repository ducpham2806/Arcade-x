const fs = require('fs');
let code = fs.readFileSync('src/services/SimpleAI.ts', 'utf-8');

code = code.replace(/isAiTurn/g, 'isMaximizingPlayer');

fs.writeFileSync('src/services/SimpleAI.ts', code);
