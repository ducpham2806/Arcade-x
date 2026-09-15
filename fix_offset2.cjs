const fs = require('fs');
let code = fs.readFileSync('src/games/blocker/index.tsx', 'utf-8');

code = code.replace(
  'offsetX: e.clientX - rect.left,\n      offsetY: e.clientY - rect.top + yOffset,',
  'offsetX: e.clientX - rect.left,\n      offsetY: e.clientY - rect.top,'
);

fs.writeFileSync('src/games/blocker/index.tsx', code);
