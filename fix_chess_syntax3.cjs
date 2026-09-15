const fs = require('fs');
let code = fs.readFileSync('src/games/chess/index.tsx', 'utf-8');

// Insert the closing tags after </footer>
code = code.replace(
  /<\/footer>\n/,
  "</footer>\n      </>\n      )}\n"
);

fs.writeFileSync('src/games/chess/index.tsx', code);
