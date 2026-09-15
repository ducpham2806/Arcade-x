const fs = require('fs');
let code = fs.readFileSync('src/games/caro-gomoku/index.tsx', 'utf-8');

const oldGridRegex = /(<div className="grid grid-cols-1 md:grid-cols-2 gap-4">)[\s\S]*?(<\/div>\n          <\/div>\n        <\/div>\n      \)\})/;

const newGridUI = `
          <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
            {/* Play Online */}
            <div className="rounded-3xl bg-gradient-to-b from-indigo-900/40 to-[#121220] border border-indigo-500/30 hover:border-indigo-400 p-6 flex flex-col justify-between shadow-xl hover:shadow-indigo-500/20 transition-all">
              <div className="space-y-3">
                <div className="w-12 h-12 rounded-2xl bg-indigo-500/20 border border-indigo-400/40 flex items-center justify-center text-indigo-300">
                  <Users className="w-6 h-6 text-indigo-400" />
                </div>
                <div>
                  <h3 className="text-lg font-black uppercase text-white font-display">
                    Đấu Online PvP
                  </h3>
                  <p className="text-xs text-slate-300 mt-1">
                    Ghép trận tự động cùng cấp ELO hoặc tạo phòng có mã mời 6 số để thách đấu bạn bè.
                  </p>
                </div>
              </div>
              <button
                onClick={() => setScreenMode('matchmaking')}
                className="mt-6 w-full py-3.5 rounded-2xl bg-gradient-to-r from-indigo-600 via-purple-600 to-pink-600 hover:from-indigo-500 hover:to-pink-500 text-white font-extrabold uppercase text-xs tracking-wider shadow-lg shadow-indigo-600/40 hover:scale-[1.02] active:scale-95 transition-all flex items-center justify-center gap-2 cursor-pointer"
              >
                <Zap className="w-4 h-4" />
                <span>Tìm Trận / Tạo Phòng Ngay</span>
              </button>
            </div>
            {/* Play AI Practice */}
            <div className="rounded-3xl bg-[#151522] border border-white/10 p-6 flex flex-col justify-between shadow-xl">
              <div className="space-y-3">
                <div className="w-12 h-12 rounded-2xl bg-amber-500/20 border border-amber-400/40 flex items-center justify-center text-amber-300">
                  <Bot className="w-6 h-6 text-amber-400" />
                </div>
                <div>
                  <h3 className="text-lg font-black uppercase text-white font-display">
                    Luyện Tập Với Máy (AI)
                  </h3>
                  <p className="text-xs text-slate-400 mt-1">
                    Rèn luyện thế cờ, phản xạ và mẹo chặn 3-4 nước với thuật toán AI pattern.
                  </p>
                </div>
              </div>
              <div className="mt-6 grid grid-cols-3 gap-2">
                <button
                  onClick={() => handleStartAiPractice('easy')}
                  className="py-3 rounded-xl bg-emerald-950/60 hover:bg-emerald-900 border border-emerald-500/30 text-emerald-300 text-xs font-bold transition-all cursor-pointer"
                >
                  Tập Sự
                </button>
                <button
                  onClick={() => handleStartAiPractice('medium')}
                  className="py-3 rounded-xl bg-amber-950/60 hover:bg-amber-900 border border-amber-500/30 text-amber-300 text-xs font-bold transition-all cursor-pointer"
                >
                  Cao Thủ
                </button>
                <button
                  onClick={() => handleStartAiPractice('hard')}
                  className="py-3 rounded-xl bg-rose-950/60 hover:bg-rose-900 border border-rose-500/30 text-rose-300 text-xs font-bold transition-all cursor-pointer"
                >
                  Bất Bại
                </button>
              </div>
            </div>
          </div>
        </div>
      )}
`;

code = code.replace(oldGridRegex, newGridUI);
fs.writeFileSync('src/games/caro-gomoku/index.tsx', code);
console.log('Update gomoku index.tsx');
