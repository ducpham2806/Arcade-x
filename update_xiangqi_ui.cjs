const fs = require('fs');
let code = fs.readFileSync('src/games/xiangqi/index.tsx', 'utf-8');

const mainRegex = /\{\/\* Top In-Match Header Bar \*\/\}\n\s*<div className="w-full max-w-2xl rounded-2xl bg-\[#120f12\]\/95 border border-amber-500\/30 p-3 sm:p-4 shadow-xl backdrop-blur-md flex items-center justify-between gap-3">[\s\S]*?\{\/\* XIANGQI BOARD \(Responsive\) \*\/\}/;

const newMain = `{/* Opponent Player Card */}
          <div className={\`w-full max-w-md flex flex-col justify-between items-stretch bg-slate-900/60 backdrop-blur-md border rounded-xl sm:rounded-2xl p-2 sm:p-3 shadow-lg transition-colors \${((activeRoomId && !isMyTurn && !isMatchEnded) || (isAiMode && aiTurn === 'b')) ? 'border-amber-400/50 shadow-amber-900/20' : 'border-slate-800/80'}\`}>
            <div className="flex items-center justify-between">
              <div className="flex items-center gap-2.5">
                <div className="relative">
                  <img
                    src={activeRoomId ? opponentInfo?.avatarUrl || 'https://api.dicebear.com/7.x/avataaars/svg?seed=Opponent' : 'https://api.dicebear.com/7.x/bottts/svg?seed=XiangqiBot'}
                    alt="Opponent"
                    className="w-10 h-10 sm:w-12 sm:h-12 rounded-lg bg-slate-800 border-2 border-slate-700 object-cover shadow-sm"
                  />
                  <span className="absolute -bottom-1 -right-1 px-1 rounded-full bg-blue-500 border border-slate-800 text-white font-black text-[8px]">
                    ĐEN
                  </span>
                </div>
                <div className="flex flex-col">
                  <div className="font-bold text-sm sm:text-base text-slate-100 leading-tight truncate max-w-[150px]">
                    {activeRoomId ? opponentInfo?.name || 'Đối thủ' : 'ArcadeX Bot'}
                  </div>
                  <div className="text-[10px] sm:text-xs text-slate-400 flex items-center gap-1 mt-0.5">
                    <span className="font-mono bg-slate-800 px-1.5 py-0.5 rounded text-amber-300">
                      {activeRoomId ? opponentInfo?.elo || 1200 : 1400}
                    </span>
                    {((activeRoomId && !isMyTurn && !isMatchEnded) || (isAiMode && aiTurn === 'b')) && <span className="text-amber-400 animate-pulse ml-1 font-semibold text-[10px] uppercase">Đang nghĩ...</span>}
                  </div>
                </div>
              </div>
              
              {/* Timer */}
              <div className="flex flex-col items-end justify-center">
                {((activeRoomId && !isMyTurn && !isMatchEnded) || (isAiMode && aiTurn === 'b')) && (
                  <div className={\`flex items-center gap-1 font-mono font-bold text-sm px-2 py-0.5 rounded-md border \${turnTimeLeft <= 10 ? 'bg-rose-950/80 text-rose-400 border-rose-500/50 animate-pulse' : 'bg-slate-800 text-amber-400 border-slate-700'}\`}>
                    00:{turnTimeLeft < 10 ? \`0\${turnTimeLeft}\` : turnTimeLeft}
                  </div>
                )}
              </div>
            </div>
          </div>

          {/* XIANGQI BOARD (Responsive) */}`;

code = code.replace(mainRegex, newMain);
fs.writeFileSync('src/games/xiangqi/index.tsx', code);
