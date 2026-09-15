const fs = require('fs');
let code = fs.readFileSync('src/games/caro-gomoku/index.tsx', 'utf-8');

code = code.replace(
  `      if (isWin) {
        setAiWinner('human');
        setAiWinningLine(winningLine);
        bridge.playSound('levelUp');
        addExp(60);
        addCoins(100);
        return;
      }`,
  `      if (isWin) {
        setAiWinner('human');
        setAiWinningLine(winningLine);
        bridge.playSound('levelUp');
        addExp(60);
        addCoins(100);
        bridge.reportQuest('quest-win-1-match', 1);
        bridge.reportQuest('play_any', 1);
        return;
      }`
);

code = code.replace(
  `      // Check draw
      if (Object.keys(updated).length >= BOARD_SIZE * BOARD_SIZE) {
        setAiWinner('draw');
        bridge.playSound('coin');
        return;
      }`,
  `      // Check draw
      if (Object.keys(updated).length >= BOARD_SIZE * BOARD_SIZE) {
        setAiWinner('draw');
        bridge.playSound('coin');
        bridge.reportQuest('play_any', 1);
        return;
      }`
);

code = code.replace(
  `        const botWin = checkCaroWin(botUpdated, botMove.x, botMove.y, 'O');
        if (botWin.isWin) {
          setAiWinner('bot');
          setAiWinningLine(botWin.winningLine);
          bridge.playSound('gameOver');
        } else if (Object.keys(botUpdated).length >= BOARD_SIZE * BOARD_SIZE) {
          setAiWinner('draw');
        }`,
  `        const botWin = checkCaroWin(botUpdated, botMove.x, botMove.y, 'O');
        if (botWin.isWin) {
          setAiWinner('bot');
          setAiWinningLine(botWin.winningLine);
          bridge.playSound('gameOver');
          bridge.reportQuest('play_any', 1);
        } else if (Object.keys(botUpdated).length >= BOARD_SIZE * BOARD_SIZE) {
          setAiWinner('draw');
          bridge.reportQuest('play_any', 1);
        }`
);

code = code.replace(
  `    if (isWinner) {
      bridge.playSound('levelUp');
      addExp(150);
      addCoins(250);
      bridge.reportProgress('caro_first_win', 1, true);
    }`,
  `    if (isWinner) {
      bridge.playSound('levelUp');
      addExp(150);
      addCoins(250);
      bridge.reportProgress('caro_first_win', 1, true);
      bridge.reportQuest('quest-win-1-match', 1);
    }`
);

fs.writeFileSync('src/games/caro-gomoku/index.tsx', code);
