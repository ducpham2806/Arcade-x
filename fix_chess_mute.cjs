const fs = require('fs');
let code = fs.readFileSync('src/games/chess/index.tsx', 'utf-8');

code = code.replace(/setIsMuted/g, "setSoundMuted");
code = code.replace(/isMuted/g, "soundMuted");

fs.writeFileSync('src/games/chess/index.tsx', code);
