const fs = require('fs');
let c = fs.readFileSync('src/data/shopThemes.ts', 'utf8');
c = c.replace(/gameTitle: 'Eat 'Em All',/g, 'gameTitle: "Eat \'Em All",');
fs.writeFileSync('src/data/shopThemes.ts', c);
