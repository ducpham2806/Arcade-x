const fs = require('fs');
let code = fs.readFileSync('src/games/chess/index.tsx', 'utf-8');

// 1. Remove the wrongly placed closing tags at the end of the file
code = code.replace(
  /<\/footer>\n      <\/>\n      \)}\n    <\/div>\n  \);\n\};/g,
  "</footer>\n    </div>\n  );\n};"
);

// wait, the previous code had Modals between </footer> and </div>! So the replace in `update_chess_render` actually replaced THIS:
//   <VersusScreen ... />
//   )}
// </div>
// );
// };
// Because my regex in `update_chess_render.cjs` was: `/<\/footer>\n    <\/div>/` wait no.
