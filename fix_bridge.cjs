const fs = require('fs');
let code = fs.readFileSync('src/games/blocker/index.tsx', 'utf-8');

code = code.replace(/const profile = bridge.getUserProfile\(\);/g, 'const profile = bridge.getUserProfile ? bridge.getUserProfile() : { id: "p1", username: "Player", avatar: "😎", stats: { highScores: {} } };');
code = code.replace(/const sounds = bridge.getSoundManager\(\);/g, 'const sounds = { enabled: !bridge.isMuted, playTap: () => bridge.playSound("tap"), playPop: () => bridge.playSound("pop"), playWin: () => bridge.playSound("win"), playError: () => bridge.playSound("error"), playGameOver: () => bridge.playSound("gameover") };');

fs.writeFileSync('src/games/blocker/index.tsx', code);
