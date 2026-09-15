const fs = require('fs');
const path = './src/components/ProfileModal.tsx';
let content = fs.readFileSync(path, 'utf8');

const replacement = `
          {/* Game Intensity Settings */}
          <div className="p-4 rounded-2xl bg-[#141414] border border-white/5 space-y-4">
            <h4 className="text-xs font-bold text-slate-400 uppercase tracking-wider flex items-center gap-2">
              <Flame className="w-4 h-4 text-orange-500" />
              Độ Khó Trò Chơi (Game Intensity)
            </h4>
            <p className="text-[11px] text-slate-500">Tùy chỉnh độ khó tổng thể và tốc độ trong các mini-game theo sở thích của bạn.</p>
            <div className="grid grid-cols-3 gap-2">
              <button
                onClick={() => updateIntensity('casual')}
                className={\`p-3 rounded-xl border flex flex-col items-center gap-1 transition-all \${
                  profile.gameIntensity === 'casual' 
                  ? 'bg-blue-500/20 border-blue-500 text-blue-300 shadow-[0_0_15px_rgba(59,130,246,0.3)]' 
                  : 'bg-white/5 border-white/10 text-slate-400 hover:bg-white/10'
                }\`}
              >
                <span className="text-sm">🍃</span>
                <span className="text-xs font-bold">Casual</span>
              </button>
              <button
                onClick={() => updateIntensity('normal')}
                className={\`p-3 rounded-xl border flex flex-col items-center gap-1 transition-all \${
                  (!profile.gameIntensity || profile.gameIntensity === 'normal')
                  ? 'bg-emerald-500/20 border-emerald-500 text-emerald-300 shadow-[0_0_15px_rgba(16,185,129,0.3)]' 
                  : 'bg-white/5 border-white/10 text-slate-400 hover:bg-white/10'
                }\`}
              >
                <span className="text-sm">⚖️</span>
                <span className="text-xs font-bold">Normal</span>
              </button>
              <button
                onClick={() => updateIntensity('hardcore')}
                className={\`p-3 rounded-xl border flex flex-col items-center gap-1 transition-all \${
                  profile.gameIntensity === 'hardcore' 
                  ? 'bg-rose-500/20 border-rose-500 text-rose-300 shadow-[0_0_15px_rgba(244,63,94,0.3)]' 
                  : 'bg-white/5 border-white/10 text-slate-400 hover:bg-white/10'
                }\`}
              >
                <span className="text-sm">🔥</span>
                <span className="text-xs font-bold">Hardcore</span>
              </button>
            </div>
          </div>

          {/* Backup / Export / Import */}
          <div className="p-4 rounded-2xl bg-[#141414] border border-white/5 space-y-3">
            <h4 className="text-xs font-bold text-slate-400 uppercase tracking-wider">Sao Lưu & Khôi Phục Dữ Liệu</h4>
            {exportMessage && <p className="text-xs text-emerald-400 font-semibold">{exportMessage}</p>}
            <div className="flex flex-wrap gap-2.5">
              <button
                type="button"
                onClick={handleExportData}
                className="px-3.5 py-2 rounded-xl bg-[#0a0a0a] hover:bg-white/10 text-slate-300 text-xs font-bold flex items-center gap-1.5 transition-colors border border-white/5"
              >
                <Download className="w-4 h-4" />
                <span>Xuất File Backup</span>
              </button>
              <label className="px-3.5 py-2 rounded-xl bg-[#0a0a0a] hover:bg-white/10 text-slate-300 text-xs font-bold flex items-center gap-1.5 cursor-pointer transition-colors border border-white/5">
                <Upload className="w-4 h-4" />
                <span>Nhập File Backup</span>
                <input type="file" accept=".json" onChange={handleImportData} className="hidden" />
              </label>
              <button
                type="button"
                onClick={handleReset}
                className="px-3.5 py-2 rounded-xl bg-rose-500/10 hover:bg-rose-500/20 text-rose-400 border border-rose-500/30 text-xs font-bold flex items-center gap-1.5 transition-colors ml-auto"
              >
                <RotateCcw className="w-4 h-4" />
                <span>Reset Mặc Định</span>
              </button>
            </div>
          </div>
          </>
          )}

          {activeTab === 'performance' && (
            <ProfilePerformanceTab stats={profile.stats} />
          )}
        </div>
      </div>
    </div>
  );
};
`;

const lines = content.split('\n');
const searchIndex = lines.findIndex(l => l.includes('          {/* Backup / Export / Import */}'));
if (searchIndex !== -1) {
  content = lines.slice(0, searchIndex).join('\n') + '\n' + replacement;
}

fs.writeFileSync(path, content);
console.log('patched');
