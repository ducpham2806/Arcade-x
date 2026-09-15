const fs = require('fs');
let code = fs.readFileSync('src/components/ProfileModal.tsx', 'utf-8');

code = code.replace(
  `  const { achievements, setActiveModal, openShareModal } = useGame();`,
  `  const { achievements, setActiveModal, openShareModal, setTargetAchievementCategory } = useGame();`
);

code = code.replace(
  `  const allTitles = [
    {
      title: 'Tân Binh Arcade',
      description: 'Danh hiệu khởi đầu của tất cả game thủ ArcadeX.',
      isUnlocked: true,
      rarity: 'common'
    },
    ...achievements
      .filter(a => a.rewardTitle)
      .map(a => ({
        title: a.rewardTitle as string,
        description: \`Mở khóa qua thành tựu: \${a.title} - \${a.description}\`,
        isUnlocked: a.unlocked,
        rarity: a.rewardGems >= 30 ? 'legendary' : (a.rewardGems >= 20 ? 'epic' : 'rare')
      }))
  ];`,
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
  ];`
);

code = code.replace(
  `                    onClick={() => t.isUnlocked && handleEquipTitle(t.title)}`,
  `                    onClick={() => {
                      if (t.isUnlocked) {
                        handleEquipTitle(t.title);
                      } else if (t.category) {
                        setTargetAchievementCategory(t.category);
                        setActiveModal('achievements');
                      }
                    }}`
);

code = code.replace(
  `                    {!t.isUnlocked && (
                      <div className="absolute inset-0 flex items-center justify-center backdrop-blur-[1px] rounded-xl">
                        <span className="text-xs font-bold text-slate-300 bg-black/80 px-2 py-1 rounded-lg border border-white/10 flex items-center gap-1 shadow-xl">
                           🔒 Đã khóa
                        </span>
                      </div>
                    )}`,
  `                    {!t.isUnlocked && (
                      <div className="absolute inset-0 flex items-center justify-center backdrop-blur-[1px] rounded-xl">
                        <span className="text-xs font-bold text-slate-300 bg-black/80 px-2 py-1 rounded-lg border border-white/10 flex items-center gap-1 shadow-xl group-hover:text-indigo-300 group-hover:border-indigo-500/50 transition-colors">
                           🔒 Đã khóa (Nhấn để xem cách mở)
                        </span>
                      </div>
                    )}`
);

code = code.replace(
  `                      t.isUnlocked 
                        ? 'cursor-pointer' 
                        : 'opacity-50 grayscale cursor-not-allowed bg-[#0a0a0a] border-white/5'
                    } \${isEquipped`,
  `                      t.isUnlocked 
                        ? 'cursor-pointer' 
                        : 'group cursor-pointer opacity-70 hover:opacity-100 hover:grayscale-0 grayscale bg-[#0a0a0a] border-white/5'
                    } \${isEquipped`
);

fs.writeFileSync('src/components/ProfileModal.tsx', code);
