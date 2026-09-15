const fs = require('fs');
let code = fs.readFileSync('src/types/index.ts', 'utf-8');

// revert Profile interface
code = code.replace(
  '  exp: number;\n  bonusItem?: string;\n  coins: number;',
  '  exp: number;\n  coins: number;'
);

// fix DailyLoginRewardItem
code = code.replace(
  "  chestCount?: number;\n}",
  "  chestCount?: number;\n  bonusItem?: string;\n}"
);

fs.writeFileSync('src/types/index.ts', code);
