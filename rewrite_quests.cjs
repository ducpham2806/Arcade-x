const fs = require('fs');
const path = './src/components/DailyQuestsModal.tsx';
let content = fs.readFileSync(path, 'utf8');

const replacement = `
import React, { useState, useMemo } from 'react';
import { useGame } from '../context/GameContext';
import { usePlayer } from '../context/PlayerContext';
import { useScrollLock } from '../hooks/useScrollLock';
import { CloseButton } from './common/CloseButton';
import {
  Calendar,
  Sparkles,
  Coins,
  Gem,
  CheckCircle2,
  Hourglass,
  Users,
  Target,
  ArrowRight,
} from 'lucide-react';

export const DailyQuestsModal: React.FC = () => {
  useScrollLock(true);
  const { dailyQuests, claimDailyQuest, friendQuests, claimFriendQuest, setActiveModal } = useGame();
  const { profile } = usePlayer();

  const [mainTab, setMainTab] = useState<'daily' | 'friends'>('daily');
  const [questFilter, setQuestFilter] = useState<'all' | 'in_progress' | 'completed'>('all');

  const filteredQuests = useMemo(() => {
    return dailyQuests.filter((q) => {
      if (questFilter === 'in_progress') return !q.completed;
      if (questFilter === 'completed') return q.completed;
      return true;
    });
  }, [dailyQuests, questFilter]);

  const progressStats = useMemo(() => {
    return {
      total: dailyQuests.length,
      completed: dailyQuests.filter((q) => q.completed).length,
      inProgress: dailyQuests.filter((q) => !q.completed).length,
    };
  }, [dailyQuests]);

  const now = new Date();
  const endOfDay = new Date(now);
  endOfDay.setHours(23, 59, 59, 999);
  const resetMs = endOfDay.getTime() - now.getTime();
  const resetHours = Math.floor(resetMs / (1000 * 60 * 60));
  const resetMinutes = Math.floor((resetMs % (1000 * 60 * 60)) / (1000 * 60));

  return (
    <div
      onClick={() => setActiveModal('none')}
      className="fixed inset-0 z-50 bg-black/80 backdrop-blur-md flex items-center justify-center p-3 sm:p-4 overflow-y-auto"
    >
      <div
        onClick={(e) => e.stopPropagation()}
        className="max-w-2xl w-full max-h-[90vh] bg-[#0e0e0e] border border-white/10 rounded-2xl sm:rounded-3xl p-5 sm:p-6 shadow-2xl relative my-auto flex flex-col"
      >
        <div className="flex items-center justify-between pb-4 border-b border-white/5 shrink-0">
          <div className="flex items-center gap-3">
            <div className="w-10 h-10 rounded-xl bg-indigo-600/20 border border-indigo-500/30 text-indigo-400 flex items-center justify-center shadow-lg shadow-indigo-500/10">
              <Calendar className="w-5 h-5" />
            </div>
            <div>
              <h2 className="text-xl font-bold text-white font-display">SỔ NHIỆM VỤ</h2>
              <p className="text-xs text-slate-400">Hoàn thành nhiệm vụ cá nhân hoặc cùng bạn bè</p>
            </div>
          </div>
          <CloseButton id="btn-close-quests" onClose={() => setActiveModal('none')} ariaLabel="Đóng nhiệm vụ" />
        </div>

        {/* Main Tabs */}
        <div className="flex gap-2 border-b border-white/5 mt-4 shrink-0">
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
            <Users className="w-4 h-4" /> Bạn Bè
            {(friendQuests || []).filter(q => q.status === 'completed').length > 0 && (
              <span className="w-2 h-2 rounded-full bg-rose-500 animate-pulse ml-1"></span>
            )}
          </button>
        </div>

        <div className="flex-1 overflow-y-auto space-y-4 pr-1 mt-4">
          {mainTab === 'daily' && (
            <>
              {/* Quick Stats Banner */}
              <div className="grid grid-cols-2 gap-2 shrink-0">
                <div className="p-3 bg-[#141414] border border-white/5 rounded-2xl flex flex-col items-center justify-center gap-1">
                  <div className="text-xs text-slate-400 font-bold uppercase tracking-wider flex items-center gap-1.5">
                    <Target className="w-3.5 h-3.5 text-indigo-400" />
                    Tiến Độ Tổng
                  </div>
                  <div className="text-xl font-black text-white font-mono">
                    {progressStats.completed} <span className="text-slate-600">/ {progressStats.total}</span>
                  </div>
                </div>
                <div className="p-3 bg-[#141414] border border-white/5 rounded-2xl flex flex-col items-center justify-center gap-1">
                  <div className="text-xs text-slate-400 font-bold uppercase tracking-wider flex items-center gap-1.5">
                    <Hourglass className="w-3.5 h-3.5 text-rose-400" />
                    Làm Mới Sau
                  </div>
                  <div className="text-lg font-black text-rose-300 font-mono flex items-center gap-1">
                    <span>{resetHours.toString().padStart(2, '0')}</span>
                    <span className="text-rose-500/50 animate-pulse">:</span>
                    <span>{resetMinutes.toString().padStart(2, '0')}</span>
                  </div>
                </div>
              </div>

              {/* Filters */}
              <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-3 shrink-0 bg-[#0a0a0a] p-2 rounded-xl border border-white/5">
                <div className="flex items-center gap-1 text-[10px] sm:text-xs">
                  <button
                    type="button"
                    onClick={() => setQuestFilter('all')}
                    className={\`px-2.5 py-1 rounded-lg transition-all cursor-pointer \${
                      questFilter === 'all' ? 'bg-indigo-600 text-white font-bold' : 'text-slate-400 hover:text-white'
                    }\`}
                  >
                    Tất Cả ({progressStats.total})
                  </button>
                  <button
                    type="button"
                    onClick={() => setQuestFilter('in_progress')}
                    className={\`px-2.5 py-1 rounded-lg transition-all cursor-pointer \${
                      questFilter === 'in_progress' ? 'bg-indigo-600 text-white font-bold' : 'text-slate-400 hover:text-white'
                    }\`}
                  >
                    Đang Làm ({progressStats.inProgress})
                  </button>
                  <button
                    type="button"
                    onClick={() => setQuestFilter('completed')}
                    className={\`px-2.5 py-1 rounded-lg transition-all cursor-pointer \${
                      questFilter === 'completed' ? 'bg-indigo-600 text-white font-bold' : 'text-slate-400 hover:text-white'
                    }\`}
                  >
                    Xong ({progressStats.completed})
                  </button>
                </div>
              </div>

              <div className="space-y-2.5">
                {filteredQuests.length === 0 ? (
                  <div className="p-8 text-center bg-[#141414] rounded-2xl border border-white/5 text-slate-500 text-xs">
                    Không có nhiệm vụ nào trong mục này.
                  </div>
                ) : (
                  filteredQuests.map((quest) => {
                    const percent = Math.min(100, Math.round((quest.current / quest.target) * 100));
                    return (
                      <div
                        key={quest.id}
                        className={\`p-4 rounded-2xl border flex flex-col sm:flex-row sm:items-center justify-between gap-3 transition-all \${
                          quest.completed
                            ? quest.claimed
                              ? 'bg-[#0a0a0a] border-white/5 opacity-60'
                              : 'bg-[#12131e] border-indigo-500/50 shadow-md shadow-indigo-500/15'
                            : 'bg-[#141414] border-white/5 hover:border-white/10'
                        }\`}
                      >
                        <div className="flex-1 min-w-0">
                          <div className="flex items-center gap-2">
                            <h4 className="text-sm font-bold text-white truncate">{quest.title}</h4>
                            {quest.completed ? (
                              quest.claimed ? (
                                <span className="px-2 py-0.5 rounded-md text-[10px] font-bold bg-emerald-500/10 text-emerald-400 border border-emerald-500/20">
                                  Đã Nhận
                                </span>
                              ) : (
                                <span className="px-2 py-0.5 rounded-md text-[10px] font-black bg-amber-500/20 text-amber-300 border border-amber-500/40 animate-pulse">
                                  Sẵn Sàng Nhận
                                </span>
                              )
                            ) : (
                              <span className="px-2 py-0.5 rounded-md text-[10px] font-bold bg-indigo-500/15 text-indigo-300 border border-indigo-500/20">
                                Đang Tiến Hành • {percent}%
                              </span>
                            )}
                          </div>
                          <p className="text-xs text-slate-400 mt-1">{quest.description}</p>
                          <div className="flex items-center gap-3 mt-2.5">
                            <div className="flex-1 h-2 bg-[#050505] rounded-full overflow-hidden border border-white/5">
                              <div
                                className={\`h-full transition-all duration-300 \${
                                  quest.completed
                                    ? 'bg-gradient-to-r from-indigo-500 to-emerald-400'
                                    : 'bg-gradient-to-r from-indigo-500 to-purple-500'
                                }\`}
                                style={{ width: \`\${percent}%\` }}
                              />
                            </div>
                            <span className="text-[11px] font-mono text-slate-300 font-bold shrink-0">
                              {quest.current} / {quest.target}
                            </span>
                          </div>
                        </div>
                        <div className="flex items-center sm:flex-col sm:items-end justify-between sm:justify-center gap-2 pt-2 sm:pt-0 border-t sm:border-t-0 border-white/5 shrink-0">
                          <div className="flex items-center gap-2 text-xs font-mono font-bold">
                            <span className="text-amber-400 flex items-center gap-0.5">
                              <Coins className="w-3 h-3 text-amber-400" />+{quest.rewardCoins}
                            </span>
                            <span className="text-blue-400 flex items-center gap-0.5">
                              <Gem className="w-3 h-3 text-blue-400" />+{quest.rewardGems}
                            </span>
                          </div>
                          {quest.completed ? (
                            quest.claimed ? (
                              <span className="text-xs text-emerald-400 font-semibold flex items-center gap-1">
                                <CheckCircle2 className="w-4 h-4" /> Đã Nhận
                              </span>
                            ) : (
                              <button
                                id={\`btn-claim-quest-\${quest.id}\`}
                                type="button"
                                onClick={() => claimDailyQuest(quest.id)}
                                className="px-3.5 py-1.5 rounded-xl bg-gradient-to-r from-amber-400 to-yellow-500 hover:from-amber-300 hover:to-yellow-400 active:scale-95 text-black font-black uppercase text-xs shadow-lg shadow-amber-500/20 transition-all cursor-pointer"
                              >
                                Nhận Quà
                              </button>
                            )
                          ) : (
                            <span className="text-[11px] text-slate-500 font-medium">Chưa hoàn thành</span>
                          )}
                        </div>
                      </div>
                    );
                  })
                )}
              </div>
            </>
          )}

          {mainTab === 'friends' && (
            <div className="space-y-4">
              <div className="p-4 bg-gradient-to-r from-indigo-500/10 to-purple-500/10 rounded-2xl border border-indigo-500/20 flex flex-col sm:flex-row items-center justify-between gap-4">
                <div>
                  <h3 className="text-sm font-bold text-indigo-300 flex items-center gap-2">
                    <Sparkles className="w-4 h-4" />
                    Thử Thách Cộng Tác
                  </h3>
                  <p className="text-xs text-slate-400 mt-1 max-w-sm">Mời bạn bè cùng hoàn thành mục tiêu để nhận phần thưởng đặc biệt! Các mục tiêu được cộng dồn dựa trên nỗ lực của cả hai.</p>
                </div>
                <button className="px-4 py-2 bg-indigo-600 hover:bg-indigo-500 text-white text-xs font-bold rounded-xl transition-colors whitespace-nowrap">
                  Gửi Lời Mời Mới
                </button>
              </div>

              <div className="space-y-3">
                {(friendQuests || []).map((quest) => {
                  const percent = Math.min(100, Math.round((quest.current / quest.target) * 100));
                  return (
                    <div
                      key={quest.id}
                      className={\`p-4 rounded-2xl border flex flex-col gap-4 transition-all \${
                        quest.status === 'completed'
                          ? 'bg-[#12131e] border-indigo-500/50 shadow-md shadow-indigo-500/15'
                          : quest.status === 'claimed'
                            ? 'bg-[#0a0a0a] border-white/5 opacity-60'
                            : 'bg-[#141414] border-white/5'
                      }\`}
                    >
                      <div className="flex items-start justify-between gap-3">
                        <div>
                          <div className="flex items-center gap-2">
                            <h4 className="text-sm font-bold text-white">{quest.title}</h4>
                            {quest.status === 'completed' && (
                              <span className="px-2 py-0.5 rounded-md text-[10px] font-black bg-amber-500/20 text-amber-300 border border-amber-500/40 animate-pulse">
                                Sẵn Sàng Nhận
                              </span>
                            )}
                            {quest.status === 'claimed' && (
                              <span className="px-2 py-0.5 rounded-md text-[10px] font-bold bg-emerald-500/10 text-emerald-400 border border-emerald-500/20">
                                Đã Nhận
                              </span>
                            )}
                          </div>
                          <p className="text-xs text-slate-400 mt-1">{quest.description}</p>
                        </div>
                        <div className="flex flex-col items-end gap-1 shrink-0">
                           <div className="flex items-center gap-2 text-xs font-mono font-bold bg-[#0a0a0a] px-2 py-1 rounded-lg border border-white/5">
                            <span className="text-amber-400 flex items-center gap-0.5">
                              <Coins className="w-3 h-3 text-amber-400" />+{quest.rewardCoins}
                            </span>
                            <span className="text-blue-400 flex items-center gap-0.5">
                              <Gem className="w-3 h-3 text-blue-400" />+{quest.rewardGems}
                            </span>
                          </div>
                        </div>
                      </div>

                      <div className="flex flex-col gap-2">
                        <div className="flex items-center gap-3">
                          <div className="flex-1 h-3 bg-[#050505] rounded-full overflow-hidden border border-white/5 flex">
                            {quest.participants.map((p, idx) => {
                              const pPercent = (p.contribution / quest.target) * 100;
                              return (
                                <div 
                                  key={idx}
                                  className={\`h-full \${idx === 0 ? 'bg-indigo-500' : 'bg-purple-500'} transition-all\`}
                                  style={{ width: \`\${pPercent}%\` }}
                                  title={\`\${p.name}: \${p.contribution}\`}
                                />
                              );
                            })}
                          </div>
                          <span className="text-xs font-mono text-slate-300 font-bold shrink-0">
                            {quest.current} / {quest.target}
                          </span>
                        </div>
                        
                        <div className="flex items-center justify-between text-[11px]">
                          <div className="flex items-center gap-4">
                             {quest.participants.map((p, idx) => (
                               <div key={idx} className="flex items-center gap-1.5">
                                 <span className="w-5 h-5 rounded-full bg-white/10 flex items-center justify-center text-[10px]">{p.avatar}</span>
                                 <div className="flex flex-col">
                                   <span className="text-slate-300 font-bold">{p.name}</span>
                                   <span className={\`font-mono \${idx === 0 ? 'text-indigo-400' : 'text-purple-400'}\`}>{p.contribution} đ</span>
                                 </div>
                               </div>
                             ))}
                          </div>
                          
                          {quest.status === 'completed' && (
                            <button
                              onClick={() => claimFriendQuest(quest.id)}
                              className="px-4 py-1.5 rounded-xl bg-gradient-to-r from-amber-400 to-yellow-500 hover:from-amber-300 hover:to-yellow-400 active:scale-95 text-black font-black uppercase text-[10px] shadow-lg shadow-amber-500/20 transition-all cursor-pointer"
                            >
                              Nhận Quà Nhóm
                            </button>
                          )}
                          {quest.status === 'claimed' && (
                            <span className="text-emerald-400 font-semibold flex items-center gap-1">
                              <CheckCircle2 className="w-3 h-3" /> Hoàn thành
                            </span>
                          )}
                        </div>
                      </div>
                    </div>
                  );
                })}
                {(!friendQuests || friendQuests.length === 0) && (
                   <div className="p-8 text-center bg-[#141414] rounded-2xl border border-white/5 text-slate-500 text-xs">
                     Chưa có thử thách cộng tác nào. Hãy mời bạn bè ngay!
                   </div>
                )}
              </div>
            </div>
          )}
        </div>
      </div>
    </div>
  );
};
`;

fs.writeFileSync(path, replacement);
console.log('rewrote daily quests modal');
