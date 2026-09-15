const fs = require('fs');
let code = fs.readFileSync('src/games/chess/index.tsx', 'utf-8');

// 1. Add handleLeaveToLobby
code = code.replace(
  /const handleResetGame = \(\) => \{/,
  "const handleLeaveToLobby = () => {\n    setActiveRoomId(null);\n    setIsAiMode(false);\n  };\n\n  const handleResetGame = () => {"
);

// 2. Add "Thoát Luyện Tập" button
code = code.replace(
  /(\<button\s+id="chess-btn-restart"[\s\S]*?\<\/button\>)/,
  `$1\n              <button\n                onClick={handleLeaveToLobby}\n                className="w-full py-1.5 px-3 rounded-xl bg-rose-950/50 hover:bg-rose-900/60 border border-rose-800/40 text-rose-300 text-xs font-semibold flex items-center justify-center gap-1.5 transition-colors mt-2"\n              >\n                <ArrowLeft className="w-3.5 h-3.5" />\n                <span>Thoát Luyện Tập</span>\n              </button>`
);

fs.writeFileSync('src/games/chess/index.tsx', code);
