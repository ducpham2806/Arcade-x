const fs = require('fs');
const path = './src/components/DailyQuestsModal.tsx';
let content = fs.readFileSync(path, 'utf8');

// Add friend quests to imports
if (!content.includes('friendQuests')) {
  content = content.replace(
    'const { dailyQuests, claimDailyQuest, setActiveModal } = useGame();',
    'const { dailyQuests, claimDailyQuest, friendQuests, claimFriendQuest, setActiveModal } = useGame();'
  );
  
  content = content.replace(
    "const [questFilter, setQuestFilter] = useState<'all' | 'in_progress' | 'completed'>('all');",
    "const [mainTab, setMainTab] = useState<'daily' | 'friends'>('daily');\n  const [questFilter, setQuestFilter] = useState<'all' | 'in_progress' | 'completed'>('all');"
  );
  
  content = content.replace(
    "import { CloseButton } from './common/CloseButton';",
    "import { CloseButton } from './common/CloseButton';\nimport { Users } from 'lucide-react';"
  );
}

// Find header
const headerSearch = `<h2 className="text-xl font-bold text-white font-display">NHIỆM VỤ HÀNG NGÀY</h2>`;
if (content.includes(headerSearch)) {
  content = content.replace(headerSearch, `<h2 className="text-xl font-bold text-white font-display">SỔ NHIỆM VỤ</h2>`);
}

// Subheader text
const descSearch = `<p className="text-xs text-slate-400">Hoàn thành để nhận điểm kinh nghiệm và tài nguyên</p>`;
if (content.includes(descSearch)) {
  content = content.replace(descSearch, `<p className="text-xs text-slate-400">Hoàn thành nhiệm vụ cá nhân hoặc cùng bạn bè</p>`);
}

// Inject Main Tabs
const injectMainTabs = `
        {/* Main Tabs */}
        <div className="flex gap-2 border-b border-white/5 mb-4 mt-2 shrink-0">
          <button
            onClick={() => setMainTab('daily')}
            className={\`px-4 py-2 text-sm font-bold border-b-2 transition-all flex items-center gap-2 \${
              mainTab === 'daily'
                ? 'border-indigo-500 text-indigo-400'
                : 'border-transparent text-slate-400 hover:text-slate-300'
            }\`}
          >
            <Calendar className="w-4 h-4" /> Hàng Ngày
          </button>
          <button
            onClick={() => setMainTab('friends')}
            className={\`px-4 py-2 text-sm font-bold border-b-2 transition-all flex items-center gap-2 \${
              mainTab === 'friends'
                ? 'border-indigo-500 text-indigo-400'
                : 'border-transparent text-slate-400 hover:text-slate-300'
            }\`}
          >
            <Users className="w-4 h-4" /> Bạn Bè (Cộng Tác)
          </button>
        </div>
`;

if (!content.includes('Main Tabs')) {
  content = content.replace('        {/* Quick Stats Banner */}', injectMainTabs + '\n        {/* Quick Stats Banner */}');
}

const mainBodyRegex = /\{\/\* Filters \*\/\}([\s\S]*?)<div className="mt-4 pt-4 border-t/g;
// Instead of regex replace, let's just use JS string manipulation.
