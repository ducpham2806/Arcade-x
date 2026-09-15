const fs = require('fs');
let code = fs.readFileSync('src/games/chess/index.tsx', 'utf-8');

code = code.replace(
  /const handleStartAiPractice = \(\w+: 'easy'\|'medium'\|'hard'\) => \{[\s\S]*?setPossibleMoves\(\[\]\);\n  \};/,
  "const handleStartAiPractice = (diff: 'easy'|'medium'|'hard') => {\n    setIsAiMode(true);\n    setAiDifficulty(diff);\n    chessInstanceRef.current = new Chess();\n    setFen(chessInstanceRef.current.fen());\n    setMoveHistory([]);\n    setCapturedWhite([]);\n    setCapturedBlack([]);\n    setSelectedSquare(null);\n  };"
);

fs.writeFileSync('src/games/chess/index.tsx', code);
