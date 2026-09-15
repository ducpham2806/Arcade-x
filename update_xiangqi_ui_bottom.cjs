const fs = require('fs');
let code = fs.readFileSync('src/games/xiangqi/index.tsx', 'utf-8');

const targetStr = '{/* In-Match Bottom Control Actions */}';

const newBottom = `{/* Player Profile Card */}
          <div className={\`w-full max-w-[560px] flex flex-col justify-between items-stretch bg-slate-900/60 backdrop-blur-md border rounded-xl sm:rounded-2xl p-2 sm:p-3 shadow-lg transition-colors \${(((activeRoomId && isMyTurn) || (isAiMode && aiTurn === 'r')) && !isMatchEnded) ? 'border-rose-500/50 shadow-rose-900/20' : 'border-slate-800/80'}\`}>
            <div className="flex items-center justify-between">
              <div className="flex items-center gap-2.5">
                <div className="relative">
                  <img
                    src={profile?.avatar || 'https://api.dicebear.com/7.x/avataaars/svg?seed=Me'}
                    alt="Me"
                    className="w-10 h-10 sm:w-12 sm:h-12 rounded-lg bg-slate-800 border-2 border-rose-500/60 object-cover shadow-sm"
                  />
                  <span className="absolute -bottom-1 -right-1 px-1 rounded-full bg-rose-500 border border-slate-800 text-white font-black text-[8px]">
                    ĐỎ
                  </span>
                </div>
                <div className="flex flex-col">
                  <div className="font-bold text-sm sm:text-base text-slate-100 leading-tight truncate max-w-[150px]">
                    {profile?.username || 'Bạn'}
                  </div>
                  <div className="text-[10px] sm:text-xs text-slate-400 flex items-center gap-1 mt-0.5">
                    <span className="font-mono bg-slate-800 px-1.5 py-0.5 rounded text-rose-300">
                      {playerElo}
                    </span>
                    {(((activeRoomId && isMyTurn) || (isAiMode && aiTurn === 'r')) && !isMatchEnded) && <span className="text-rose-400 animate-pulse ml-1 font-semibold text-[10px] uppercase">Lượt của bạn</span>}
                  </div>
                </div>
              </div>
              
              {/* Timer & Status */}
              <div className="flex flex-col items-end justify-center">
                {(((activeRoomId && isMyTurn) || (isAiMode && aiTurn === 'r')) && !isMatchEnded) && (
                  <div className={\`flex items-center gap-1 font-mono font-bold text-sm px-2 py-0.5 rounded-md border \${turnTimeLeft <= 10 ? 'bg-rose-950/80 text-rose-400 border-rose-500/50 animate-pulse' : 'bg-slate-800 text-rose-300 border-slate-700'}\`}>
                    00:{turnTimeLeft < 10 ? \`0\${turnTimeLeft}\` : turnTimeLeft}
                  </div>
                )}
              </div>
            </div>
          </div>

          {/* In-Match Bottom Control Actions */}`;

code = code.replace(targetStr, newBottom);
fs.writeFileSync('src/games/xiangqi/index.tsx', code);
