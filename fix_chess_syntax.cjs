const fs = require('fs');
let code = fs.readFileSync('src/games/chess/index.tsx', 'utf-8');

// 1. Wrap the buttons in Fragment
code = code.replace(
  /\) : \(\n\s*<button\n\s*id="chess-btn-restart"[\s\S]*?<\/button>\n\s*<button\n\s*onClick=\{handleLeaveToLobby\}[\s\S]*?<\/button>\n\s*\)\}/,
  `) : (\n              <>\n                <button id="chess-btn-restart" onClick={handleResetGame} className="w-full py-1.5 px-3 rounded-xl bg-slate-800 hover:bg-slate-700 text-slate-200 text-xs font-semibold flex items-center justify-center gap-1.5 transition-colors"> <RotateCcw className="w-3.5 h-3.5" /> <span>Chơi Lại Ván Mới</span> </button>\n                <button onClick={handleLeaveToLobby} className="w-full py-1.5 px-3 rounded-xl bg-rose-950/50 hover:bg-rose-900/60 border border-rose-800/40 text-rose-300 text-xs font-semibold flex items-center justify-center gap-1.5 transition-colors mt-2"> <ArrowLeft className="w-3.5 h-3.5" /> <span>Thoát Luyện Tập</span> </button>\n              </>\n            )}`
);

// 2. Fix the missing closing tags for the `(activeRoomId || isAiMode)` block
// First, undo my bad previous replacement if it's there
code = code.replace(/<\/footer>\n      <\/>\n      \)}\n    <\/div>\n  \);\n\};/, "</footer>\n    </div>\n  );\n};");

// Find the footer block and insert `</>\n      )}` directly after `</footer>`
code = code.replace(
  /<\/footer>\n\s*{\/\* Matchmaking Modal \*\/}/,
  "</footer>\n      </>\n      )}\n\n      {/* Matchmaking Modal */}"
);

fs.writeFileSync('src/games/chess/index.tsx', code);
