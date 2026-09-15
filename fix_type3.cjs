const fs = require('fs');
let code = fs.readFileSync('src/types/index.ts', 'utf-8');

code = code.replace(
  '  highlight?: boolean;\n}',
  '  highlight?: boolean;\n  bonusItem?: string;\n}'
);

fs.writeFileSync('src/types/index.ts', code);
