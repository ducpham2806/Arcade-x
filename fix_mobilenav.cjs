const fs = require('fs');
let code = fs.readFileSync('src/components/MobileNav.tsx', 'utf-8');

const achievementBtn = `
      {/* 4. Achievements */}
      <button
        id="mobile-nav-achievements"
        type="button"
        onClick={() => {
          if (isChatOpen) toggleChat();
          setActiveModal(activeModal === 'achievements' ? 'none' : 'achievements');
        }}
        className={\`flex flex-col items-center justify-center py-1 px-1.5 rounded-xl transition-all relative \${
          activeModal === 'achievements'
            ? 'text-pink-400 font-bold'
            : 'text-slate-400 hover:text-slate-200'
        }\`}
      >
        <div className="relative">
          <Award className="w-5 h-5" />
          {unclaimedAchievements > 0 && (
            <span className="absolute -top-1 -right-1.5 bg-pink-500 text-white font-extrabold text-[9px] px-1 rounded-full border border-[#0a0a12] animate-pulse">
              {unclaimedAchievements}
            </span>
          )}
        </div>
        <span className="text-[10px] mt-0.5 font-medium truncate w-[45px] text-center">Thành Tựu</span>
        {activeModal === 'achievements' && (
          <span className="absolute -bottom-1 w-5 h-1 bg-pink-500 rounded-full" />
        )}
      </button>
`;

code = code.replace(
  '{/* 4. Inventory */}',
  achievementBtn + '\n      {/* 5. Inventory */}'
);

// We need to change the px-2.5 on all buttons to px-1 or px-1.5 to fit 7 items.
code = code.replace(/px-2\.5/g, 'px-1.5');
code = code.replace(/w-\[45px\]/g, 'max-w-[45px] truncate');

fs.writeFileSync('src/components/MobileNav.tsx', code);
