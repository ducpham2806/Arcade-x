const fs = require('fs');
let c = fs.readFileSync('src/data/shopThemes.ts', 'utf8');
c = c.replace(/cho Eat 'Em All/g, 'cho Eat \\\'Em All');
fs.writeFileSync('src/data/shopThemes.ts', c);
