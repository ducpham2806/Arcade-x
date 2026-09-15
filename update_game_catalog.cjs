const fs = require('fs');
let code = fs.readFileSync('src/components/GameCatalog.tsx', 'utf-8');

// Replace the single play button with two if supportsAI is true
code = code.replace(
  '<Play className="w-3.5 h-3.5 fill-current" />\n                      <span>Chơi Ngay</span>\n                    </button>',
  '<Play className="w-3.5 h-3.5 fill-current" />\n                      <span>Chơi Ngay</span>\n                    </button>\n                    {game.supportsAI && (\n                      <button\n                        id={`btn-play-ai-${game.id}`}\n                        type="button"\n                        onClick={() => launchGame(game.id, true)}\n                        className="px-4 py-2.5 rounded-xl bg-indigo-600 hover:bg-indigo-500 text-white font-bold text-xs shadow-md transition-all flex items-center gap-1.5 active:scale-95"\n                      >\n                        <Bot className="w-3.5 h-3.5 fill-current" />\n                        <span>Luyện với Máy</span>\n                      </button>\n                    )}'
);

code = code.replace(
  '<Play className="w-4 h-4 fill-current" />\n                <span>Chơi Ngay (Instant Play)</span>\n              </button>',
  '<Play className="w-4 h-4 fill-current" />\n                <span>Chơi Ngay (Instant Play)</span>\n              </button>\n              {featuredGame.supportsAI && (\n                <button\n                  id="btn-launch-featured-ai"\n                  type="button"\n                  onClick={() => launchGame(featuredGame.id, true)}\n                  className="w-full sm:w-auto px-5 sm:px-8 py-3 rounded-xl bg-indigo-500 hover:bg-indigo-400 text-white font-bold uppercase text-xs sm:text-sm tracking-tight shadow-xl hover:scale-[1.02] active:scale-95 transition-all flex items-center justify-center gap-2"\n                >\n                  <Bot className="w-4 h-4 fill-current" />\n                  <span>Luyện với Máy</span>\n                </button>\n              )}'
);

// We need to make sure Bot is imported
if (!code.includes('Bot,')) {
  code = code.replace('import {', 'import { Bot,');
}

fs.writeFileSync('src/components/GameCatalog.tsx', code);
