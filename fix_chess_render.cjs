const fs = require('fs');
let code = fs.readFileSync('src/games/chess/index.tsx', 'utf-8');

const oldHeaderRegex = /(<header className="w-full max-w-4xl flex items-center justify-between bg-slate-900\/80 backdrop-blur-md border border-slate-800 rounded-2xl px-4 py-3 shadow-xl mb-3">)/;

const lobbyUI = `
      {/* LOBBY VIEW */}
      {!activeRoomId && !isAiMode && (
        <div className="w-full max-w-3xl flex flex-col gap-5 animate-in fade-in duration-300 z-10 mt-6">
          <div className="relative rounded-3xl overflow-hidden bg-gradient-to-br from-amber-950/80 via-[#181210] to-[#0c0a08] border border-amber-500/40 p-6 shadow-2xl shadow-amber-950/60">
            <div className="flex flex-col sm:flex-row items-center justify-between gap-4">
              <div className="flex items-center gap-4">
                <div className="w-16 h-16 rounded-2xl bg-amber-500/20 border border-amber-400/40 flex items-center justify-center text-3xl shadow-inner shadow-amber-400/30">
                  {profile.avatar}
                </div>
                <div>
                  <div className="flex items-center gap-2">
                    <h2 className="text-xl sm:text-2xl font-black italic uppercase tracking-tight text-white font-display">
                      {profile.username}
                    </h2>
                    <span className="px-2 py-0.5 rounded-md bg-amber-500/30 border border-amber-400/40 text-[10px] font-bold text-amber-300 uppercase">
                      Kỳ Thủ Cờ Vua
                    </span>
                  </div>
                  <p className="text-xs text-amber-200/70 mt-0.5">
                    Hệ thống thi đấu Cờ Vua (Chess) đối kháng thời gian thực
                  </p>
                </div>
              </div>
              <div className="flex items-center gap-3">
                <div className="px-4 py-2.5 rounded-2xl bg-black/50 border border-amber-500/40 flex items-center gap-2.5">
                  <Award className="w-5 h-5 text-amber-400" />
                  <div>
                    <div className="text-[10px] uppercase font-bold text-amber-300/80">Điểm ELO</div>
                    <div className="text-lg font-black text-amber-400 font-mono leading-none">{playerElo}</div>
                  </div>
                </div>
                <div className="px-4 py-2.5 rounded-2xl bg-black/50 border border-emerald-500/40 flex items-center gap-2.5">
                  <Flame className="w-5 h-5 text-emerald-400" />
                  <div>
                    <div className="text-[10px] uppercase font-bold text-emerald-300/80">Trận Thắng</div>
                    <div className="text-lg font-black text-emerald-400 font-mono leading-none">{playerWins}</div>
                  </div>
                </div>
              </div>
            </div>
          </div>
          <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
            <div className="rounded-3xl bg-gradient-to-b from-amber-950/40 to-[#161210] border border-amber-500/30 p-6 flex flex-col justify-between shadow-xl">
              <div className="space-y-3">
                <div className="w-12 h-12 rounded-2xl bg-amber-500/20 border border-amber-400/40 flex items-center justify-center text-amber-300">
                  <Users className="w-6 h-6 text-amber-400" />
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
                onClick={() => setIsMatchmakingOpen(true)}
                className="mt-6 w-full py-3.5 rounded-2xl bg-gradient-to-r from-amber-600 via-orange-600 to-red-600 hover:from-amber-500 hover:to-red-500 text-white font-extrabold uppercase text-xs tracking-wider shadow-lg shadow-amber-600/40 hover:scale-[1.02] active:scale-95 transition-all flex items-center justify-center gap-2 cursor-pointer"
              >
                <Zap className="w-4 h-4" />
                <span>Tìm Trận / Tạo Phòng Ngay</span>
              </button>
            </div>
            <div className="rounded-3xl bg-[#141214] border border-white/10 p-6 flex flex-col justify-between shadow-xl">
              <div className="space-y-3">
                <div className="w-12 h-12 rounded-2xl bg-blue-500/20 border border-blue-400/40 flex items-center justify-center text-blue-300">
                  <Bot className="w-6 h-6 text-blue-400" />
                </div>
                <div>
                  <h3 className="text-lg font-black uppercase text-white font-display">
                    Luyện Tập Với Máy (AI)
                  </h3>
                  <p className="text-xs text-slate-400 mt-1">
                    Luyện các thế khai cuộc, trung cuộc và sát cục với máy tính không cần kết nối mạng.
                  </p>
                </div>
              </div>
              <div className="mt-6 grid grid-cols-3 gap-2">
                <button
                  onClick={() => startAiPractice('easy')}
                  className="py-3 rounded-xl bg-emerald-950/60 hover:bg-emerald-900 border border-emerald-500/30 text-emerald-300 text-xs font-bold transition-all cursor-pointer"
                >
                  Tập Sự
                </button>
                <button
                  onClick={() => startAiPractice('medium')}
                  className="py-3 rounded-xl bg-amber-950/60 hover:bg-amber-900 border border-amber-500/30 text-amber-300 text-xs font-bold transition-all cursor-pointer"
                >
                  Cao Thủ
                </button>
                <button
                  onClick={() => startAiPractice('hard')}
                  className="py-3 rounded-xl bg-rose-950/60 hover:bg-rose-900 border border-rose-500/30 text-rose-300 text-xs font-bold transition-all cursor-pointer"
                >
                  Đại Kiện Tướng
                </button>
              </div>
            </div>
          </div>
        </div>
      )}
      {(activeRoomId || isAiMode) && (
      <>
        $1
`;

code = code.replace(oldHeaderRegex, lobbyUI);

code = code.replace(
  /<\/footer>\n    <\/div>\n  \);\n\};/,
  "</footer>\n      </>\n      )}\n    </div>\n  );\n};"
);

fs.writeFileSync('src/games/chess/index.tsx', code);
