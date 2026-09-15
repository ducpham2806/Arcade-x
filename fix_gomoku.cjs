const fs = require('fs');
let code = fs.readFileSync('src/games/caro-gomoku/index.tsx', 'utf-8');

code = code.replace(`              )}
            }
          }
          controls={`, `              )}
          </div>
        }
        controls={`
);

// Check if there are other syntax errors. The error output says:
// src/games/caro-gomoku/index.tsx(848,10): error TS1382: Unexpected token. Did you mean `{'>'}` or `&gt;`?
fs.writeFileSync('src/games/caro-gomoku/index.tsx', code);
