const fs = require('fs');
const content = `import React, { useState } from 'react';
import { useGame } from '../context/GameContext';
import { usePlayer } from '../context/PlayerContext';
import { ALL_GAMES_LIST } from '../games/registry';
import { Trophy, Medal, Crown, X, Flame, Sparkles, Share2, Shield } from 'lucide-react';
import { motion } from 'motion/react';

export const LeaderboardModal: React.FC = () => {
  const { leaderboards, setActiveModal, openShareModal } = useGame();
  const { profile } = usePlayer();
  const [selectedGameId, setSelectedGameId] = useState<string>('neon-runner');

  const activeLeaderboard = leaderboards[selectedGameId] || [];
  const selectedGame = ALL_GAMES_LIST.find((g) => g.id === selectedGameId) || ALL_GAMES_LIST[0];

  const userHighScore = profile?.stats?.highScores?.[selectedGameId] || 0;
  const userRankEntry = activeLeaderboard.find((e) => e.playerName === profile.username);

  const top3 = activeLeaderboard.slice(0, 3);
  const rest = activeLeaderboard.slice(3);
  
  const maxScore = activeLeaderboard.length > 0 ? activeLeaderboard[0].score : 1;

  const getEloTier = (score: number, rank: number) => {
    if (rank === 1) return { name: 'Master', color: 'from-purple-500 to-fuchsia-500', border: 'border-fuchsia-500/50', text: 'text-fuchsia-400', icon: '💎', shadow: 'shadow-[0_0_15px_rgba(217,70,239,0.3)]' };
    const ratio = score / maxScore;
    if (ratio >= 0.7) return { name: 'Gold', color: 'from-yellow-400 to-amber-500', border: 'border-yellow-500/50', text: 'text-yellow-400', icon: '🏅', shadow: 'shadow-[0_0_15px_rgba(234,179,8,0.3)]' };
    if (ratio >= 0.4) return { name: 'Silver', color: 'from-slate-300 to-slate-400', border: 'border-slate-400/50', text: 'text-slate-300', icon: '🥈', shadow: 'shadow-[0_0_10px_rgba(148,163,184,0.2)]' };
    return { name: 'Bronze', color: 'from-orange-700 to-amber-800', border: 'border-orange-700/50', text: 'text-orange-500', icon: '🥉', shadow: '' };
  };

  const handleShareLeaderboard = () => {
    openShareModal({
      type: 'score',
      title: \`Bảng Xếp Hạng - \${selectedGame.title}\`,
      description: userRankEntry
        ? \`Đang xếp hạng #\${userRankEntry.rank} toàn server trong \${selectedGame.title} với \${userRankEntry.score.toLocaleString()} điểm!\`
        : \`Điểm kỷ lục cá nhân: \${userHighScore.toLocaleString()} điểm trong \${selectedGame.title}!\`,
      score: userRankEntry ? userRankEntry.score : userHighScore,
      gameId: selectedGame.id,
      gameTitle: selectedGame.title,
    });
  };

  return (
    <div className="fixed inset-0 z-50 bg-black/80 backdrop-blur-md flex items-center justify-center p-3 sm:p-6 overflow-y-auto animate-in fade-in duration-200">
      <div className="max-w-4xl w-full bg-[#0a0a0a] border border-white/10 rounded-2xl sm:rounded-3xl shadow-2xl relative my-auto max-h-[90vh] flex flex-col overflow-hidden">
        {/* Header */}
        <div className="p-5 sm:p-6 border-b border-white/5 shrink-0 bg-gradient-to-b from-white/5 to-transparent">
          <div className="flex items-center justify-between">
            <div className="flex items-center gap-4">
              <div className="w-12 h-12 rounded-xl bg-yellow-500/10 border border-yellow-500/20 text-yellow-400 flex items-center justify-center shadow-[0_0_20px_rgba(234,179,8,0.15)]">
                <Trophy className="w-6 h-6" />
              </div>
              <div>
                <h2 className="text-xl sm:text-2xl font-black text-white uppercase tracking-tight">BẢNG XẾP HẠNG TOÀN SERVER</h2>
                <p className="text-xs sm:text-sm text-slate-400 font-medium">Hệ Thống Phân Hạng Bậc Tích Luỹ (ELO)</p>
              </div>
            </div>

            <div className="flex items-center gap-2">
              <button
                id="btn-share-leaderboard"
                type="button"
                onClick={handleShareLeaderboard}
                className="hidden sm:flex px-4 py-2 rounded-xl bg-indigo-600/20 hover:bg-indigo-600/30 border border-indigo-500/40 text-indigo-300 text-sm font-bold items-center gap-2 transition-all shadow-sm shadow-indigo-500/10 active:scale-95"
              >
                <Share2 className="w-4 h-4" /> Khoe Điểm
              </button>
              <button
                id="btn-close-leaderboard"
                type="button"
                onClick={() => setActiveModal('none')}
                className="w-10 h-10 rounded-xl bg-[#141414] hover:bg-rose-500/20 border border-white/5 hover:border-rose-500/50 text-slate-400 hover:text-rose-400 flex items-center justify-center transition-colors"
              >
                <X className="w-5 h-5" />
              </button>
            </div>
          </div>
        </div>

        {/* Game Selector Tabs */}
        <div className="flex items-center gap-2 overflow-x-auto p-4 shrink-0 scrollbar-none border-b border-white/5 bg-black/20">
          {ALL_GAMES_LIST.map((game) => (
            <button
              key={game.id}
              type="button"
              onClick={() => setSelectedGameId(game.id)}
              className={\`px-4 py-2.5 rounded-xl text-sm font-bold whitespace-nowrap transition-all flex items-center gap-2 \${
                selectedGameId === game.id
                  ? 'bg-indigo-600 text-white shadow-[0_0_15px_rgba(79,70,229,0.3)]'
                  : 'bg-[#141414] text-slate-400 hover:text-white border border-white/5 hover:bg-white/5'
              }\`}
            >
              <span className="text-lg">{game.icon}</span>
              <span>{game.title}</span>
            </button>
          ))}
        </div>

        {/* Content Body */}
        <div className="flex-1 overflow-y-auto p-4 sm:p-6 bg-gradient-to-b from-[#0a0a0a] to-[#050505]">
          {/* Top 3 Podium Cards */}
          {top3.length > 0 && (
            <div className="grid grid-cols-1 sm:grid-cols-3 gap-4 mb-8">
              {top3.map((entry, idx) => {
                const rank = idx + 1;
                const tier = getEloTier(entry.score, rank);
                
                // Podium styling adjustments based on rank
                const heightClass = rank === 1 ? 'sm:-mt-4 sm:mb-4 sm:z-10' : 'sm:mt-4 opacity-90 hover:opacity-100';

                return (
                  <motion.div
                    initial={{ y: 20, opacity: 0 }}
                    animate={{ y: 0, opacity: 1 }}
                    transition={{ delay: idx * 0.1 }}
                    key={entry.id}
                    className={\`rounded-3xl p-5 border bg-[#0e0e0e] \${tier.border} \${tier.shadow} text-center relative flex flex-col items-center justify-between transition-all hover:scale-105 \${heightClass}\`}
                  >
                    {/* Rank Badge */}
                    <div className="absolute -top-3 left-1/2 -translate-x-1/2 bg-black border border-white/10 px-3 py-1 rounded-full text-xs font-black flex items-center gap-1 shadow-lg">
                      <span className={tier.text}>#{rank}</span>
                    </div>

                    <div className="mt-2 mb-3 relative">
                      <div className={\`w-20 h-20 rounded-2xl bg-[#050505] border-2 \${tier.border} flex items-center justify-center text-5xl shadow-inner relative z-10\`}>
                        {entry.avatar}
                      </div>
                      {rank === 1 && (
                         <Crown className="w-8 h-8 text-yellow-400 absolute -top-5 -right-3 rotate-12 drop-shadow-[0_0_10px_rgba(253,224,71,0.5)]" />
                      )}
                    </div>

                    <div className="mb-4">
                      <h4 className="text-base font-bold text-white truncate max-w-[160px]">{entry.playerName}</h4>
                      <p className="text-[11px] text-slate-500 truncate max-w-[160px]">{entry.title || 'Cao Thủ Arcade'}</p>
                    </div>

                    {/* Tier Badge */}
                    <div className="w-full flex items-center justify-center gap-2 mb-4 bg-[#141414] py-1.5 rounded-lg border border-white/5">
                       <span className="text-sm">{tier.icon}</span>
                       <span className={\`text-xs font-black uppercase \${tier.text}\`}>{tier.name}</span>
                    </div>

                    <div className="w-full py-2.5 rounded-xl bg-[#050505] border border-white/10 shadow-inner">
                      <div className="text-[10px] text-slate-500 uppercase font-bold mb-0.5 tracking-widest">ELO Score</div>
                      <div className={\`text-xl font-extrabold font-mono \${tier.text}\`}>
                        {entry.score.toLocaleString()}
                      </div>
                    </div>
                  </motion.div>
                );
              })}
            </div>
          )}

          {/* Ranks 4+ Table */}
          <div className="bg-[#141414]/50 border border-white/10 rounded-2xl overflow-hidden backdrop-blur-sm">
            <div className="px-5 py-3 bg-[#0a0a0a]/80 border-b border-white/5 flex items-center justify-between text-xs font-bold text-slate-400 uppercase tracking-wider">
              <div className="flex-1">Xếp Hạng & Game Thủ</div>
              <div className="w-24 text-center">Bậc Hạng</div>
              <div className="w-24 text-right">ELO Điểm</div>
            </div>

            <div className="divide-y divide-white/5">
              {rest.length === 0 && top3.length === 0 ? (
                <div className="py-12 flex flex-col items-center justify-center text-center opacity-50">
                  <Shield className="w-12 h-12 text-slate-500 mb-3" />
                  <p className="text-sm text-slate-400">Chưa có dữ liệu xếp hạng. Hãy là người mở màn!</p>
                </div>
              ) : (
                rest.map((entry) => {
                  const tier = getEloTier(entry.score, entry.rank);
                  return (
                    <motion.div
                      initial={{ opacity: 0, x: -10 }}
                      animate={{ opacity: 1, x: 0 }}
                      key={entry.id}
                      className={\`px-5 py-3.5 flex items-center justify-between transition-colors \${
                        entry.playerName === profile.username
                          ? 'bg-indigo-950/40 border-l-4 border-l-indigo-500'
                          : 'hover:bg-white/5'
                      }\`}
                    >
                      <div className="flex items-center gap-4 flex-1 min-w-0">
                        <span className="w-6 text-center text-sm font-black text-slate-500 font-mono">
                          #{entry.rank}
                        </span>
                        <div className={\`w-10 h-10 rounded-xl bg-[#0a0a0a] border \${tier.border} flex items-center justify-center text-xl shrink-0\`}>
                          {entry.avatar}
                        </div>
                        <div className="min-w-0 pr-4">
                          <div className="text-sm font-bold text-white flex items-center gap-2 truncate">
                            {entry.playerName}
                            {entry.playerName === profile.username && (
                              <span className="text-[10px] px-2 py-0.5 rounded bg-indigo-500/20 text-indigo-300 font-bold border border-indigo-500/30">
                                Bạn
                              </span>
                            )}
                          </div>
                          <span className="text-[11px] text-slate-500 truncate block">{entry.title || 'Tân Binh Arcade'}</span>
                        </div>
                      </div>

                      <div className="w-24 flex items-center justify-center gap-1.5 shrink-0">
                        <span className="text-sm">{tier.icon}</span>
                        <span className={\`text-[10px] font-black uppercase \${tier.text}\`}>{tier.name}</span>
                      </div>

                      <div className={\`w-24 text-right text-base font-black font-mono \${tier.text} shrink-0\`}>
                        {entry.score.toLocaleString()}
                      </div>
                    </motion.div>
                  );
                })
              )}
            </div>
          </div>
        </div>
      </div>
    </div>
  );
};
`
fs.writeFileSync('src/components/LeaderboardModal.tsx', content);
