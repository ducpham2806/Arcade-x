const fs = require('fs');
let code = fs.readFileSync('src/components/GameCatalog.tsx', 'utf-8');

if (!code.includes('import { Bot')) {
  code = code.replace(
    'import {\n  Search,\n  Play,',
    'import {\n  Search,\n  Play,\n  Bot,'
  );
}

fs.writeFileSync('src/components/GameCatalog.tsx', code);
