const fs = require('fs');
let code = fs.readFileSync('src/services/storage.ts', 'utf-8');

code = code.replace(
  `    rewardGems: 5,
  },`,
  `    rewardGems: 5,
    rewardTitle: 'Tân Binh Arcade',
  },`
);

code = code.replace(
  `    rewardGems: 10,
  },
  {
    id: 'ach-runner-500',`,
  `    rewardGems: 10,
    rewardTitle: 'Thợ Săn Kho Báu',
  },
  {
    id: 'ach-runner-500',`
);

code = code.replace(
  `    rewardGems: 30,
  },
  {
    id: 'ach-cosmic-boss',`,
  `    rewardGems: 30,
    rewardTitle: 'Người Thích Tốc Độ',
  },
  {
    id: 'ach-cosmic-boss',`
);

code = code.replace(
  `    rewardGems: 60,
  },
  {
    id: 'ach-2048-score-5000',`,
  `    rewardGems: 60,
    rewardTitle: 'Đại Hào Phú',
  },
  {
    id: 'ach-2048-score-5000',`
);

// Add missing chess/caro achievements
code = code.replace(
  `];

export const DEFAULT_DAILY_QUESTS`,
  `  {
    id: 'caro_first_win',
    gameId: 'caro-gomoku',
    title: 'Kỳ Thủ Cờ Caro',
    description: 'Giành chiến thắng ván cờ Caro đầu tiên.',
    icon: '⭕',
    category: 'Cờ Caro',
    target: 1,
    current: 0,
    unlocked: false,
    claimed: false,
    rewardExp: 100,
    rewardCoins: 200,
    rewardGems: 10,
    rewardTitle: 'Kỳ Thủ Cờ Caro',
  },
  {
    id: 'chess_first_win',
    gameId: 'chess',
    title: 'Đại Kiện Tướng',
    description: 'Giành chiến thắng ván cờ vua đầu tiên.',
    icon: '♞',
    category: 'Cờ Vua',
    target: 1,
    current: 0,
    unlocked: false,
    claimed: false,
    rewardExp: 150,
    rewardCoins: 300,
    rewardGems: 20,
    rewardTitle: 'Đại Kiện Tướng',
  }
];

export const DEFAULT_DAILY_QUESTS`
);

fs.writeFileSync('src/services/storage.ts', code);
