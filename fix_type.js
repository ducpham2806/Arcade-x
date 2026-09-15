const fs = require('fs');
let c = fs.readFileSync('src/data/shopThemes.ts', 'utf8');
c = c.replace(/previewType: string; \/\/[\s\S]*?\| 'shikaku-pastel';/, 'previewType: string;');
fs.writeFileSync('src/data/shopThemes.ts', c);
