const fs = require('fs');
let code = fs.readFileSync('src/components/DailyLoginRewardModal.tsx', 'utf-8');

code = code.replace(
  'claimDailyLoginReward(currentReward.coins, currentReward.gems, currentReward.exp);',
  'claimDailyLoginReward(currentReward, targetDay);'
);

// We should also replace the claimDailyLoginReward usage if it was just fixed above.

fs.writeFileSync('src/components/DailyLoginRewardModal.tsx', code);
