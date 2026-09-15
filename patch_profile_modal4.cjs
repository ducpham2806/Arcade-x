const fs = require('fs');
let code = fs.readFileSync('src/components/ProfileModal.tsx', 'utf-8');

code = code.replace(
  `<div className="flex items-center justify-between">
                      <span className={\`text-sm font-bold truncate pr-2 \${t.isUnlocked && (t.rarity === 'legendary' || t.rarity === 'epic') ? 'drop-shadow-md' : ''}\`}>{t.title}</span>`,
  `<div className="flex items-center justify-between z-20 relative">
                      <span className={\`text-sm font-bold truncate pr-2 \${t.isUnlocked && (t.rarity === 'legendary' || t.rarity === 'epic') ? 'drop-shadow-md' : ''}\`}>{t.title}</span>`
);

fs.writeFileSync('src/components/ProfileModal.tsx', code);
