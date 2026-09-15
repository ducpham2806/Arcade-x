const fs = require('fs');
let code = fs.readFileSync('src/games/chess/index.tsx', 'utf-8');

code = code.replace(
  `        await submitScore(100);
        triggerLootRoll(100);`,
  `        await submitScore(100, { win: 1 });
        bridge.reportQuest('quest-win-1-match', 1);
        triggerLootRoll(100);`
);

code = code.replace(
  `      } else if (winnerColor === 'draw') {
        sounds.playMove();`,
  `      } else if (winnerColor === 'draw') {
        bridge.reportQuest('play_any', 1);
        sounds.playMove();`
);

code = code.replace(
  `      } else {
        sounds.playDefeat();
      }`,
  `      } else {
        bridge.reportQuest('play_any', 1);
        sounds.playDefeat();
      }`
);

fs.writeFileSync('src/games/chess/index.tsx', code);
