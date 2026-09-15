const fs = require('fs');
const path = './src/context/GameContext.tsx';
let content = fs.readFileSync(path, 'utf8');

if (!content.includes('FriendQuest')) {
  content = content.replace(
    'DailyQuest,',
    'DailyQuest,\n  FriendQuest,'
  );
}

if (!content.includes('friendQuests: FriendQuest[];')) {
  content = content.replace(
    'dailyQuests: DailyQuest[];',
    'dailyQuests: DailyQuest[];\n  friendQuests: FriendQuest[];\n  claimFriendQuest: (questId: string) => void;'
  );
}

if (!content.includes('const [friendQuests')) {
  const fqMock = `
  const [friendQuests, setFriendQuests] = useState<FriendQuest[]>([
    {
      id: 'fq_1',
      title: 'Đồng Đội Săn Mồi',
      description: 'Cùng đạt tổng 1000 điểm trong Eat \\'Em All',
      gameId: 'eat-em-all',
      target: 1000,
      current: 750,
      status: 'active',
      participants: [
        { name: 'Player1', avatar: '🐉', contribution: 450 },
        { name: 'Bạn', avatar: '🎮', contribution: 300 }
      ],
      rewardCoins: 500,
      rewardGems: 20,
      rewardExp: 1000
    },
    {
      id: 'fq_2',
      title: 'Bộ Đôi Hoàn Hảo',
      description: 'Cả hai cùng qua màn 5 Block Puzzle',
      gameId: 'block-puzzle',
      target: 2,
      current: 2,
      status: 'completed',
      participants: [
        { name: 'Gosu', avatar: '🔥', contribution: 1 },
        { name: 'Bạn', avatar: '🎮', contribution: 1 }
      ],
      rewardCoins: 1000,
      rewardGems: 50,
      rewardExp: 2500
    }
  ]);
  
  const claimFriendQuest = (questId: string) => {
    setFriendQuests(prev => prev.map(q => {
      if (q.id === questId && q.status === 'completed') {
        addCoins(q.rewardCoins);
        addGems(q.rewardGems);
        addExp(q.rewardExp);
        soundEngine.play('claim');
        return { ...q, status: 'claimed' };
      }
      return q;
    }));
  };
`;
  content = content.replace(
    'const [dailyQuests, setDailyQuests] = useState<DailyQuest[]>(() => StorageService.loadDailyQuests());',
    'const [dailyQuests, setDailyQuests] = useState<DailyQuest[]>(() => StorageService.loadDailyQuests());\n' + fqMock
  );
}

if (!content.includes('claimFriendQuest,')) {
  content = content.replace(
    'claimDailyQuest,',
    'claimDailyQuest,\n        friendQuests,\n        claimFriendQuest,'
  );
}

fs.writeFileSync(path, content);
console.log('patched context');
