const fs = require('fs');
let code = fs.readFileSync('src/games/caro-gomoku/index.tsx', 'utf-8');

code = code.replace("onClick={handleAcceptDraw}", "onClick={() => handleRespondDraw(true)}");
code = code.replace("onClick={handleRejectDraw}", "onClick={() => handleRespondDraw(false)}");

fs.writeFileSync('src/games/caro-gomoku/index.tsx', code);
