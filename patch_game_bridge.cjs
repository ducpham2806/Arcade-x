const fs = require('fs');

// Patch types/index.ts
let typesStr = fs.readFileSync('src/types/index.ts', 'utf-8');
typesStr = typesStr.replace(
  '  reportProgress: (achievementId: string, progressDeltaOrValue: number, isAbsolute?: boolean) => void;',
  '  reportProgress: (achievementId: string, progressDeltaOrValue: number, isAbsolute?: boolean) => void;\n  reportQuest: (questCategory: string, delta: number) => void;'
);
fs.writeFileSync('src/types/index.ts', typesStr);

// Patch games/GameBridge.ts
let bridgeStr = fs.readFileSync('src/games/GameBridge.ts', 'utf-8');
bridgeStr = bridgeStr.replace(
  '    reportProgress: (achievementId: string, deltaOrVal: number, isAbsolute: boolean = false) => {\n      opts.onReportAchievement(achievementId, deltaOrVal, isAbsolute);\n    },',
  '    reportProgress: (achievementId: string, deltaOrVal: number, isAbsolute: boolean = false) => {\n      opts.onReportAchievement(achievementId, deltaOrVal, isAbsolute);\n    },\n    reportQuest: (questCategory: string, delta: number) => {\n      opts.onReportQuest(questCategory, delta);\n    },'
);
fs.writeFileSync('src/games/GameBridge.ts', bridgeStr);

// Patch services/storage.ts
let storageStr = fs.readFileSync('src/services/storage.ts', 'utf-8');
storageStr = storageStr.replace(
  `  {
    id: 'quest-score-1000',
    title: 'Tay Đua Siêu Cấp',
    description: 'Đạt tổng cộng 1,000 điểm trên tất cả các game.',
    target: 1000,
    current: 0,
    completed: false,
    claimed: false,
    rewardCoins: 300,
    rewardGems: 15,
    rewardExp: 150,
  },`,
  `  {
    id: 'quest-score-1000',
    title: 'Tay Đua Siêu Cấp',
    description: 'Đạt tổng cộng 1,000 điểm trên tất cả các game.',
    target: 1000,
    current: 0,
    completed: false,
    claimed: false,
    rewardCoins: 300,
    rewardGems: 15,
    rewardExp: 150,
  },
  {
    id: 'quest-win-1-match',
    title: 'Chiến Binh Bất Bại',
    description: 'Giành chiến thắng 1 ván đấu (PvP hoặc luyện tập với AI).',
    target: 1,
    current: 0,
    completed: false,
    claimed: false,
    rewardCoins: 200,
    rewardGems: 10,
    rewardExp: 100,
  },`
);
fs.writeFileSync('src/services/storage.ts', storageStr);

