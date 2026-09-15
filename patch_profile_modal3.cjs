const fs = require('fs');
let code = fs.readFileSync('src/components/ProfileModal.tsx', 'utf-8');

code = code.replace(
  `  const allTitles = [
    {
      title: 'Tân Binh Arcade',
      description: 'Danh hiệu khởi đầu của tất cả game thủ ArcadeX.',
      isUnlocked: true,
      rarity: 'common',
      category: null
    },
    ...achievements
      .filter(a => a.rewardTitle)
      .map(a => ({
        title: a.rewardTitle as string,
        description: \`Mở khóa qua thành tựu: \${a.title} - \${a.description}\`,
        isUnlocked: a.unlocked,
        rarity: a.rewardGems >= 30 ? 'legendary' : (a.rewardGems >= 20 ? 'epic' : 'rare'),
        category: a.category || 'Chung'
      }))
  ];`,
  `  const allTitles = [
    {
      title: 'Tân Binh Arcade',
      description: 'Danh hiệu khởi đầu của tất cả game thủ ArcadeX.',
      isUnlocked: true,
      rarity: 'common',
      category: null,
      current: 1,
      target: 1
    },
    ...achievements
      .filter(a => a.rewardTitle)
      .map(a => ({
        title: a.rewardTitle as string,
        description: \`Mở khóa qua thành tựu: \${a.title} - \${a.description}\`,
        isUnlocked: a.unlocked,
        rarity: a.rewardGems >= 30 ? 'legendary' : (a.rewardGems >= 20 ? 'epic' : 'rare'),
        category: a.category || 'Chung',
        current: a.current,
        target: a.target
      }))
  ];`
);

code = code.replace(
  `                    <p className="text-[10px] text-slate-400 line-clamp-2 leading-tight">{t.description}</p>
                    {!t.isUnlocked && (
                      <div className="absolute inset-0 flex items-center justify-center backdrop-blur-[1px] rounded-xl">
                        <span className="text-xs font-bold text-slate-300 bg-black/80 px-2 py-1 rounded-lg border border-white/10 flex items-center gap-1 shadow-xl group-hover:text-indigo-300 group-hover:border-indigo-500/50 transition-colors">
                           🔒 Đã khóa (Nhấn để xem cách mở)
                        </span>
                      </div>
                    )}`,
  `                    <p className="text-[10px] text-slate-400 line-clamp-2 leading-tight z-20 relative">{t.description}</p>
                    
                    {!t.isUnlocked && t.target !== undefined && (
                      <div className="mt-auto pt-2 z-20 relative">
                        <div className="flex items-center justify-between text-[9px] text-slate-300 font-bold mb-1">
                          <span>Tiến độ</span>
                          <span>{Math.min(t.current || 0, t.target)}/{t.target}</span>
                        </div>
                        <div className="w-full h-1.5 bg-black/60 rounded-full overflow-hidden border border-white/10">
                          <div 
                            className="h-full bg-indigo-500 rounded-full transition-all duration-500" 
                            style={{ width: \`\${Math.min(((t.current || 0) / t.target) * 100, 100)}%\` }}
                          />
                        </div>
                      </div>
                    )}

                    {!t.isUnlocked && (
                      <div className="absolute inset-0 flex items-center justify-center bg-black/50 rounded-xl z-10 transition-all group-hover:bg-black/70">
                        <span className="text-xs font-bold text-slate-300 bg-black/80 px-2 py-1 rounded-lg border border-white/10 flex items-center gap-1 shadow-xl group-hover:text-indigo-300 group-hover:border-indigo-500/50 transition-colors absolute top-1/2 -translate-y-1/2">
                           🔒 Đã khóa (Nhấn để xem)
                        </span>
                      </div>
                    )}`
);

fs.writeFileSync('src/components/ProfileModal.tsx', code);
