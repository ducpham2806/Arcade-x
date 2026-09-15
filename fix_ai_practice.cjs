const fs = require('fs');
let code = fs.readFileSync('src/games/chess/index.tsx', 'utf-8');

code = code.replace(
  /const handleStartAiPractice = \([\s\S]*?setSelectedSquare\(null\);\n  \};\n/,
  ""
);
code = code.replace(
  /onClick=\{\(\) => handleStartAiPractice/g,
  "onClick={() => startAiPractice"
);

fs.writeFileSync('src/games/chess/index.tsx', code);
