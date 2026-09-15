const fs = require('fs');
let code = fs.readFileSync('src/services/storage.ts', 'utf-8');

code = code.replace(
  `        const existingIds = new Set(parsed.map(a => a.id));
        const missing = DEFAULT_ACHIEVEMENTS.filter(d => !existingIds.has(d.id));
        return [...parsed, ...missing];`,
  `        const existingIds = new Set(parsed.map(a => a.id));
        const missing = DEFAULT_ACHIEVEMENTS.filter(d => !existingIds.has(d.id));
        
        // Ensure rewardTitle is injected into parsed achievements
        const mergedParsed = parsed.map(p => {
          const def = DEFAULT_ACHIEVEMENTS.find(d => d.id === p.id);
          if (def && def.rewardTitle && !p.rewardTitle) {
            return { ...p, rewardTitle: def.rewardTitle };
          }
          return p;
        });
        
        return [...mergedParsed, ...missing];`
);
fs.writeFileSync('src/services/storage.ts', code);
