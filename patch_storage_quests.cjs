const fs = require('fs');
let code = fs.readFileSync('src/services/storage.ts', 'utf-8');

code = code.replace(
  `      const data = localStorage.getItem(STORAGE_KEYS.DAILY_QUESTS);
      if (data) {
        return JSON.parse(data);
      }`,
  `      const data = localStorage.getItem(STORAGE_KEYS.DAILY_QUESTS);
      if (data) {
        const parsed = JSON.parse(data) as DailyQuest[];
        // Merge missing defaults in case we update the app mid-day
        const merged = [...parsed];
        for (const defaultQuest of DEFAULT_DAILY_QUESTS) {
          if (!merged.find(q => q.id === defaultQuest.id)) {
            merged.push({ ...defaultQuest });
          }
        }
        return merged;
      }`
);

fs.writeFileSync('src/services/storage.ts', code);
