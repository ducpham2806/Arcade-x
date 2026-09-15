const fs = require('fs');
let code = fs.readFileSync('src/games/chess/index.tsx', 'utf-8');

code = code.replace(
  /import \{\n  Zap,\n  Award,\n  Flame,\n Chess, Square, PieceSymbol, Color \} from 'chess\.js';/,
  "import { Chess, Square, PieceSymbol, Color } from 'chess.js';"
);
code = code.replace(
  /import \{\n  Users,/,
  "import {\n  Users,\n  Zap,\n  Award,\n  Flame,"
);

fs.writeFileSync('src/games/chess/index.tsx', code);
