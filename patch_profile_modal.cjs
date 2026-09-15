const fs = require('fs');
let code = fs.readFileSync('src/components/ProfileModal.tsx', 'utf-8');

// Insert availableTitles computation
code = code.replace(
  `  const expPercent = Math.min(100, Math.round((profile.exp / expNeeded) * 100));`,
  `  const expPercent = Math.min(100, Math.round((profile.exp / expNeeded) * 100));

  const availableTitles = Array.from(new Set([
    'Tân Binh Arcade',
    ...achievements.filter(a => a.unlocked && a.rewardTitle).map(a => a.rewardTitle as string)
  ]));`
);

// Insert Title Selection UI after Avatar Selection UI
code = code.replace(
  `            <div className="flex flex-wrap gap-2">
              {AVATAR_OPTIONS.map((av) => (
                <button
                  key={av}
                  type="button"
                  onClick={() => updateAvatar(av)}
                  className={\`w-10 h-10 rounded-xl text-xl flex items-center justify-center transition-all \${
                    profile.avatar === av
                      ? 'bg-indigo-600/30 border border-indigo-400 scale-105'
                      : 'bg-[#141414] border border-white/5 hover:border-white/20'
                  }\`}
                >
                  {av}
                </button>
              ))}
            </div>
          </div>`,
  `            <div className="flex flex-wrap gap-2">
              {AVATAR_OPTIONS.map((av) => (
                <button
                  key={av}
                  type="button"
                  onClick={() => updateAvatar(av)}
                  className={\`w-10 h-10 rounded-xl text-xl flex items-center justify-center transition-all \${
                    profile.avatar === av
                      ? 'bg-indigo-600/30 border border-indigo-400 scale-105'
                      : 'bg-[#141414] border border-white/5 hover:border-white/20'
                  }\`}
                >
                  {av}
                </button>
              ))}
            </div>
          </div>
          
          {/* Change Title Section */}
          <div className="space-y-2 mt-4">
            <h4 className="text-xs font-bold text-slate-400 uppercase tracking-wider">Chọn Danh Hiệu</h4>
            <div className="flex flex-wrap gap-2">
              {availableTitles.map((title) => (
                <button
                  key={title}
                  type="button"
                  onClick={() => updateTitle(title)}
                  className={\`px-3 py-1.5 rounded-xl text-xs font-bold transition-all border \${
                    profile.currentTitle === title
                      ? 'bg-amber-600/30 border-amber-400 text-amber-300 shadow-md shadow-amber-500/20'
                      : 'bg-[#141414] border-white/5 text-slate-400 hover:border-white/20 hover:text-white'
                  }\`}
                >
                  {title}
                </button>
              ))}
            </div>
          </div>`
);

fs.writeFileSync('src/components/ProfileModal.tsx', code);
