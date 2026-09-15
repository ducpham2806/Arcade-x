const fs = require('fs');
let code = fs.readFileSync('src/games/caro-gomoku/index.tsx', 'utf-8');

const mainRegex = /\{\/\* Top In-Match Header Bar \*\/\}\n\s*<div className="w-full max-w-4xl rounded-2xl bg-\[#10101c\]\/95 border border-white\/10 p-3 sm:p-4 shadow-xl backdrop-blur-md flex flex-col sm:flex-row items-center justify-between gap-3">[\s\S]*?\{\/\* GOMOKU \/ CARO 15x15 INTERACTIVE BOARD \*\/\}/;

const newMain = `{/* Opponent Player Card */}
          <div className={\`w-full max-w-md flex flex-col justify-between items-stretch bg-slate-900/60 backdrop-blur-md border rounded-xl sm:rounded-2xl p-2 sm:p-3 shadow-lg transition-colors \${(!isMyTurn && !isMatchFinished) ? 'border-rose-400/50 shadow-rose-900/20' : 'border-slate-800/80'}\`}>
            <div className="flex items-center justify-between">
              <div className="flex items-center gap-2.5">
                <div className="relative">
                  <img
                    src={screenMode === 'ai_practice' ? 'https://api.dicebear.com/7.x/bottts/svg?seed=GomokuAI' : 'https://api.dicebear.com/7.x/avataaars/svg?seed=Opponent'}
                    alt="Opponent"
                    className="w-10 h-10 sm:w-12 sm:h-12 rounded-lg bg-slate-800 border-2 border-slate-700 object-cover shadow-sm"
                  />
                  <span className="absolute -bottom-1 -right-1 w-4 h-4 rounded-full bg-slate-900 text-rose-400 font-black text-[9px] flex items-center justify-center border border-slate-700">
                    {opponentSymbol}
                  </span>
                </div>
                <div className="flex flex-col">
                  <div className="font-bold text-sm sm:text-base text-slate-100 leading-tight truncate max-w-[150px]">
                    {screenMode === 'ai_practice' ? 'AI Bot' : roomData?.players?.guest?.name || 'Đối thủ'}
                  </div>
                  <div className="text-[10px] sm:text-xs text-slate-400 flex items-center gap-1 mt-0.5">
                    <span className="font-mono bg-slate-800 px-1.5 py-0.5 rounded text-rose-300">
                      {screenMode === 'ai_practice' ? 1400 : roomData?.players?.guest?.elo || 1200}
                    </span>
                    {!isMyTurn && !isMatchFinished && <span className="text-rose-400 animate-pulse ml-1 font-semibold text-[10px] uppercase">Đang nghĩ...</span>}
                  </div>
                </div>
              </div>
              
              {/* Timer & Status */}
              <div className="flex flex-col items-end justify-center">
                {screenMode === 'playing' && !isMyTurn && !isMatchFinished && (
                  <div className={\`flex items-center gap-1 font-mono font-bold text-sm px-2 py-0.5 rounded-md border \${secondsRemaining <= 10 ? 'bg-rose-950/80 text-rose-400 border-rose-500/50 animate-pulse' : 'bg-slate-800 text-rose-300 border-slate-700'}\`}>
                    00:{secondsRemaining < 10 ? \`0\${secondsRemaining}\` : secondsRemaining}
                  </div>
                )}
              </div>
            </div>
          </div>

          {/* GOMOKU / CARO 15x15 INTERACTIVE BOARD                     */}`;

code = code.replace(mainRegex, newMain);
fs.writeFileSync('src/games/caro-gomoku/index.tsx', code);
