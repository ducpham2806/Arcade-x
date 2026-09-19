
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
  Play,
  RotateCw,
  Zap,
  Trophy,
  Clock,
  Flame,
  Swords,
  UserPlus
} from 'lucide-react';

export const DailyQuestsModal: React.FC = () => {
  useScrollLock(true);
  const {
    dailyQuests,
    claimDailyQuest,
    generateNewDailyQuests,
    launchGame,
    friendQuests,
    claimFriendQuest,
    setActiveModal,
    weeklyQuests,
    weeklyMilestones,
    weeklyPoints,
    claimWeeklyQuest,
    claimWeeklyMilestoneReward,
    weeklyCountdown,
  } = useGame();
  const { profile } = usePlayer();

  const [mainTab, setMainTab] = useState<'daily' | 'weekly' | 'friends'>('daily');
  const [questFilter, setQuestFilter] = useState<'all' | 'in_progress' | 'completed'>('all');
  const [selectedMilestonePreview, setSelectedMilestonePreview] = useState<number | null>(null);

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

  const maxWeeklyPoints = 100;
  const weeklyProgressPercent = Math.min(100, Math.round((weeklyPoints / maxWeeklyPoints) * 100));

  const now = new Date();
  const endOfDay = new Date(now);
  endOfDay.setHours(23, 59, 59, 999);
  const resetMs = endOfDay.getTime() - now.getTime();
  const resetHours = Math.floor(resetMs / (1000 * 60 * 60));
  const resetMinutes = Math.floor((resetMs % (1000 * 60 * 60)) / (1000 * 60));

  return (
    <div
      onClick={() => setActiveModal('none')}
      className="arcadex-modal-overlay"
    >
      <div
        onClick={(e) => e.stopPropagation()}
        className="arcadex-modal-container bg-[#0e0e0e] border border-white/10 p-3.5 sm:p-6"
      >
        <div className="flex items-center justify-between pb-3 sm:pb-4 border-b border-white/5 shrink-0">
          <div className="flex items-center gap-2.5 sm:gap-3 min-w-0">
            <div className="w-9 h-9 sm:w-10 sm:h-10 rounded-xl bg-indigo-600/20 border border-indigo-500/30 text-indigo-400 flex items-center justify-center shadow-lg shadow-indigo-500/10 shrink-0">
              <Calendar className="w-4 h-4 sm:w-5 sm:h-5" />
            </div>
            <div className="min-w-0">
              <h2 className="text-base sm:text-xl font-bold text-white font-display truncate">SỔ NHIỆM VỤ & CỘT MỐC</h2>
              <p className="text-[11px] sm:text-xs text-slate-400 truncate">Nhiệm vụ ngày, cột mốc tuần và thử thách bạn bè</p>
            </div>
          </div>
          <CloseButton id="btn-close-quests" onClose={() => setActiveModal('none')} ariaLabel="Đóng nhiệm vụ" />
        </div>

        {/* Main Tabs - 3 tabs on mobile and desktop */}
        <div className="grid grid-cols-3 gap-1.5 border-b border-white/5 mt-2.5 sm:mt-4 shrink-0">
          <button
            onClick={() => setMainTab('daily')}
            className={`px-2 sm:px-4 py-2 sm:py-2.5 text-xs sm:text-sm font-bold border-b-2 transition-colors flex items-center justify-center gap-1.5 cursor-pointer truncate ${
              mainTab === 'daily'
                ? 'border-indigo-500 text-indigo-400 bg-indigo-500/10'
                : 'border-transparent text-slate-400 hover:text-slate-300'
            }`}
          >
            <Calendar className="w-3.5 h-3.5 sm:w-4 sm:h-4" /> Hàng Ngày
          </button>
          <button
            onClick={() => setMainTab('weekly')}
            className={`px-2 sm:px-4 py-2 sm:py-2.5 text-xs sm:text-sm font-bold border-b-2 transition-colors flex items-center justify-center gap-1.5 cursor-pointer truncate relative ${
              mainTab === 'weekly'
                ? 'border-purple-500 text-purple-300 bg-purple-500/10'
                : 'border-transparent text-slate-400 hover:text-slate-300'
            }`}
          >
            <Trophy className="w-3.5 h-3.5 sm:w-4 sm:h-4 text-amber-400" /> Cột Mốc Tuần
            {weeklyQuests.some(q => q.completed && !q.claimed) && (
              <span className="w-2 h-2 rounded-full bg-amber-400 animate-pulse ml-0.5"></span>
            )}
          </button>
          <button
            onClick={() => setMainTab('friends')}
            className={`px-2 sm:px-4 py-2 sm:py-2.5 text-xs sm:text-sm font-bold border-b-2 transition-colors flex items-center justify-center gap-1.5 cursor-pointer truncate ${
              mainTab === 'friends'
                ? 'border-cyan-500 text-cyan-400 bg-cyan-500/10'
                : 'border-transparent text-slate-400 hover:text-slate-300'
            }`}
          >
            <Users className="w-3.5 h-3.5 sm:w-4 sm:h-4" /> Bạn Bè
            {(friendQuests || []).filter(q => q.status === 'completed').length > 0 && (
              <span className="w-2 h-2 rounded-full bg-rose-500 animate-pulse ml-0.5"></span>
            )}
          </button>
        </div>

        <div className="arcadex-modal-body space-y-2.5 sm:space-y-4 pr-1 mt-2.5 sm:mt-4 custom-scrollbar">
          {/* TAB 1: DAILY QUESTS */}
          {mainTab === 'daily' && (
            <>
              {/* Quick Stats Banner - Compact on mobile */}
              <div className="flex flex-col sm:flex-row items-stretch sm:items-center justify-between p-2.5 sm:p-3 bg-[#141414] border border-white/5 rounded-xl sm:rounded-2xl shrink-0 gap-2">
                <div className="flex items-center justify-between sm:justify-start gap-4">
                  <div className="flex items-center gap-2">
                    <Target className="w-4 h-4 text-indigo-400 shrink-0" />
                    <div className="flex items-baseline gap-1.5">
                      <span className="text-[11px] sm:text-xs text-slate-400 font-semibold">Tiến độ:</span>
                      <span className="text-sm sm:text-base font-black text-white font-mono">
                        {progressStats.completed}/{progressStats.total}
                      </span>
                    </div>
                  </div>

                  <div className="flex items-center gap-2">
                    <Hourglass className="w-3.5 h-3.5 text-rose-400 shrink-0" />
                    <div className="flex items-baseline gap-1.5">
                      <span className="text-[11px] sm:text-xs text-slate-400 font-semibold">Reset sau:</span>
                      <span className="text-xs sm:text-sm font-black text-rose-300 font-mono">
                        {resetHours.toString().padStart(2, '0')}:{resetMinutes.toString().padStart(2, '0')}
                      </span>
                    </div>
                  </div>
                </div>

                <button
                  id="btn-generate-random-quests"
                  type="button"
                  onClick={generateNewDailyQuests}
                  className="px-2.5 py-1.5 rounded-xl bg-indigo-600/20 hover:bg-indigo-600/30 border border-indigo-500/30 text-indigo-300 text-[11px] font-bold flex items-center justify-center gap-1.5 transition-all shadow-sm active:scale-95 cursor-pointer"
                  title="Tự động bốc 3 nhiệm vụ ngẫu nhiên từ kho mục tiêu"
                >
                  <RotateCw className="w-3.5 h-3.5 text-indigo-400 hover:rotate-180 transition-transform duration-500" />
                  <span>Bốc 3 Nhiệm Vụ Mới</span>
                </button>
              </div>

              {/* Filters */}
              <div className="shrink-0 bg-[#0a0a0a] p-1 rounded-xl border border-white/5">
                <div className="grid grid-cols-3 gap-1 text-[10px] sm:text-xs text-center">
                  <button
                    type="button"
                    onClick={() => setQuestFilter('all')}
                    className={`px-2 py-1.5 rounded-lg transition-colors cursor-pointer truncate ${
                      questFilter === 'all' ? 'bg-indigo-600 text-white font-bold shadow-sm' : 'text-slate-400 hover:text-white'
                    }`}
                  >
                    Tất Cả ({progressStats.total})
                  </button>
                  <button
                    type="button"
                    onClick={() => setQuestFilter('in_progress')}
                    className={`px-2 py-1.5 rounded-lg transition-colors cursor-pointer truncate ${
                      questFilter === 'in_progress' ? 'bg-indigo-600 text-white font-bold shadow-sm' : 'text-slate-400 hover:text-white'
                    }`}
                  >
                    Đang Làm ({progressStats.inProgress})
                  </button>
                  <button
                    type="button"
                    onClick={() => setQuestFilter('completed')}
                    className={`px-2 py-1.5 rounded-lg transition-colors cursor-pointer truncate ${
                      questFilter === 'completed' ? 'bg-indigo-600 text-white font-bold shadow-sm' : 'text-slate-400 hover:text-white'
                    }`}
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
                        className={`p-3.5 sm:p-4 rounded-2xl border flex flex-col sm:flex-row sm:items-center justify-between gap-3 transition-all ${
                          quest.completed
                            ? quest.claimed
                              ? 'bg-[#0a0a0a] border-white/5 opacity-60'
                              : 'bg-[#12131e] border-indigo-500/50 shadow-md shadow-indigo-500/15'
                            : 'bg-[#141414] border-white/5 hover:border-white/10'
                        }`}
                      >
                        <div className="flex items-start gap-3 flex-1 min-w-0">
                          <div className="w-10 h-10 rounded-xl bg-indigo-950/70 border border-indigo-500/30 flex items-center justify-center text-xl shrink-0 shadow-sm">
                            {quest.icon || '🎯'}
                          </div>

                          <div className="flex-1 min-w-0">
                            <div className="flex items-center gap-2 flex-wrap">
                              <h4 className="text-sm font-bold text-white truncate">{quest.title}</h4>
                              <span className="text-[10px] font-mono px-1.5 py-0.5 rounded bg-indigo-500/10 text-indigo-400 border border-indigo-500/20">
                                +{quest.rewardExp} EXP
                              </span>
                            </div>
                            <p className="text-xs text-slate-400 mt-0.5 leading-snug">{quest.description}</p>

                            <div className="mt-2.5 flex items-center gap-2">
                              <div className="flex-1 h-2 bg-[#050505] rounded-full overflow-hidden border border-white/5">
                                <div
                                  className={`h-full transition-all duration-300 ${
                                    quest.completed ? 'bg-emerald-500 shadow-sm shadow-emerald-500/50' : 'bg-indigo-500'
                                  }`}
                                  style={{ width: `${percent}%` }}
                                />
                              </div>
                              <span className="text-[11px] font-mono text-slate-400 font-bold shrink-0">
                                {quest.current}/{quest.target}
                              </span>
                            </div>
                          </div>
                        </div>

                        <div className="flex items-center justify-between sm:justify-end gap-3 shrink-0 pt-2 sm:pt-0 border-t sm:border-t-0 border-white/5">
                          <div className="flex items-center gap-2 text-xs font-mono font-bold bg-[#0a0a0a] px-2.5 py-1.5 rounded-xl border border-white/5">
                            <span className="text-amber-400 flex items-center gap-1">
                              <Coins className="w-3.5 h-3.5 text-amber-400" />+{quest.rewardCoins}
                            </span>
                            {quest.rewardGems > 0 && (
                              <span className="text-blue-400 flex items-center gap-1">
                                <Gem className="w-3.5 h-3.5 text-blue-400" />+{quest.rewardGems}
                              </span>
                            )}
                          </div>

                          {quest.claimed ? (
                            <span className="text-xs text-slate-500 font-semibold flex items-center gap-1 px-3 py-1.5">
                              <CheckCircle2 className="w-4 h-4 text-emerald-500/50" /> Đã nhận
                            </span>
                          ) : quest.completed ? (
                            <button
                              id={`btn-claim-quest-${quest.id}`}
                              type="button"
                              onClick={() => claimDailyQuest(quest.id)}
                              className="px-4 py-1.5 rounded-xl bg-gradient-to-r from-emerald-500 to-teal-600 hover:from-emerald-400 hover:to-teal-500 text-white font-bold text-xs shadow-lg shadow-emerald-500/20 transition-all active:scale-95 cursor-pointer animate-pulse"
                            >
                              Nhận Thưởng
                            </button>
                          ) : quest.gameId ? (
                            <button
                              type="button"
                              onClick={() => {
                                setActiveModal('none');
                                launchGame(quest.gameId!);
                              }}
                              className="px-3 py-1.5 rounded-xl bg-white/5 hover:bg-white/10 text-slate-300 hover:text-white font-semibold text-xs flex items-center gap-1 transition-colors cursor-pointer"
                            >
                              <span>Chơi</span>
                              <Play className="w-3 h-3 text-indigo-400" />
                            </button>
                          ) : (
                            <span className="text-xs text-slate-500 font-mono px-2">{percent}%</span>
                          )}
                        </div>
                      </div>
                    );
                  })
                )}
              </div>
            </>
          )}

          {/* TAB 2: WEEKLY QUESTS & MILESTONE PROGRESSION */}
          {mainTab === 'weekly' && (
            <div className="space-y-4">
              {/* Milestone Progress Bar Component */}
              <div className="p-4 rounded-2xl bg-neutral-950/80 border border-purple-500/30 relative">
                <div className="flex items-center justify-between mb-2">
                  <div className="flex items-center space-x-2">
                    <Trophy className="w-4 h-4 text-amber-400" />
                    <h3 className="text-sm font-bold text-neutral-100">Tiến Độ Cột Mốc Tuần</h3>
                  </div>
                  <div className="flex items-center space-x-1.5 text-xs text-purple-300 font-mono font-bold bg-purple-500/20 px-2.5 py-1 rounded-full border border-purple-500/30">
                    <Sparkles className="w-3.5 h-3.5 text-amber-400 inline" />
                    <span>{weeklyPoints} / {maxWeeklyPoints} Điểm</span>
                  </div>
                </div>

                <div className="flex items-center space-x-1.5 text-[11px] text-amber-300/90 mb-3">
                  <Clock className="w-3.5 h-3.5 text-amber-400" />
                  <span>Reset sau: <strong className="font-mono">{weeklyCountdown.formatted}</strong></span>
                </div>

                {/* Milestone Bar */}
                <div className="relative pt-6 pb-2 px-3">
                  <div className="h-3 w-full bg-neutral-800 rounded-full overflow-hidden relative">
                    <div
                      className="h-full bg-gradient-to-r from-purple-500 via-indigo-500 to-amber-400 rounded-full transition-all duration-700"
                      style={{ width: `${weeklyProgressPercent}%` }}
                    />
                  </div>

                  <div className="relative flex justify-between -mt-4">
                    {weeklyMilestones.map((m) => {
                      const isUnlocked = weeklyPoints >= m.requiredPoints;
                      const isClaimed = m.claimed;
                      const canClaim = isUnlocked && !isClaimed;

                      return (
                        <div
                          key={m.tier}
                          onClick={() => {
                            if (canClaim) {
                              claimWeeklyMilestoneReward(m.tier);
                            } else {
                              setSelectedMilestonePreview(selectedMilestonePreview === m.tier ? null : m.tier);
                            }
                          }}
                          className="flex flex-col items-center cursor-pointer group"
                        >
                          <div
                            className={`w-9 h-9 rounded-full flex items-center justify-center text-base border-2 shadow-lg transition-all relative ${
                              isClaimed
                                ? 'bg-neutral-800 border-neutral-600 text-neutral-400'
                                : canClaim
                                ? 'bg-gradient-to-br from-amber-400 to-amber-600 border-white text-white animate-bounce shadow-amber-500/50 ring-4 ring-amber-400/30'
                                : isUnlocked
                                ? 'bg-purple-600 border-purple-300 text-white shadow-purple-900/50'
                                : 'bg-neutral-900 border-neutral-700 text-neutral-500'
                            }`}
                          >
                            {isClaimed ? '✓' : m.icon}
                          </div>
                          <span className="text-[11px] font-bold text-neutral-400 mt-1 font-mono">{m.requiredPoints}đ</span>
                          {canClaim ? (
                            <span className="px-1.5 py-0.2 rounded bg-amber-500 text-neutral-950 font-bold text-[9px] uppercase tracking-wider animate-pulse">
                              Nhận
                            </span>
                          ) : isClaimed ? (
                            <span className="text-[9px] text-neutral-500">Đã nhận</span>
                          ) : (
                            <span className="text-[9px] text-neutral-500">{m.percentage}%</span>
                          )}
                        </div>
                      );
                    })}
                  </div>
                </div>

                {selectedMilestonePreview !== null && (
                  <div className="mt-3 p-3 rounded-xl bg-purple-950/50 border border-purple-500/40 text-xs">
                    {(() => {
                      const m = weeklyMilestones.find((item) => item.tier === selectedMilestonePreview);
                      if (!m) return null;
                      return (
                        <div className="flex items-center justify-between">
                          <div>
                            <p className="font-bold text-neutral-100">{m.title}</p>
                            <p className="text-[11px] text-neutral-400">{m.description}</p>
                            <div className="flex items-center space-x-2 mt-1 text-amber-300 font-semibold font-mono text-[11px]">
                              <span>+{m.rewardCoins} Coins</span>
                              <span>+{m.rewardGems} Gems</span>
                              <span>+{m.rewardExp} EXP</span>
                            </div>
                          </div>
                          {weeklyPoints >= m.requiredPoints && !m.claimed && (
                            <button
                              onClick={() => claimWeeklyMilestoneReward(m.tier)}
                              className="px-3.5 py-1.5 rounded-lg bg-amber-500 hover:bg-amber-400 text-neutral-950 font-bold text-xs"
                            >
                              Nhận Quà
                            </button>
                          )}
                        </div>
                      );
                    })()}
                  </div>
                )}
              </div>

              {/* 6 Weekly Quests List */}
              <div className="space-y-2.5">
                <div className="flex items-center justify-between">
                  <h4 className="text-xs font-bold text-neutral-400 uppercase tracking-wider flex items-center space-x-1.5">
                    <Flame className="w-3.5 h-3.5 text-amber-400" />
                    <span>6 Nhiệm Vụ Tuần ({weeklyQuests.filter(q => q.completed).length}/6)</span>
                  </h4>
                  <span className="text-[11px] text-purple-300">Hoàn thành để nhận điểm tuần</span>
                </div>

                {weeklyQuests.map((quest) => {
                  const percent = Math.min(100, Math.round((quest.current / quest.target) * 100));
                  return (
                    <div
                      key={quest.id}
                      className={`p-3.5 rounded-2xl border flex flex-col sm:flex-row sm:items-center justify-between gap-3 transition-all ${
                        quest.claimed
                          ? 'bg-[#0a0a0a] border-white/5 opacity-60'
                          : quest.completed
                          ? 'bg-purple-950/30 border-purple-500/50 shadow-md shadow-purple-950/30'
                          : 'bg-[#141414] border-white/5 hover:border-white/10'
                      }`}
                    >
                      <div className="flex items-start gap-3 flex-1 min-w-0">
                        <div className="w-10 h-10 rounded-xl bg-purple-950/70 border border-purple-500/30 flex items-center justify-center text-xl shrink-0">
                          {quest.icon}
                        </div>
                        <div className="flex-1 min-w-0">
                          <div className="flex items-center gap-2">
                            <h4 className="text-sm font-bold text-white truncate">{quest.title}</h4>
                            <span className="text-[10px] font-mono font-bold px-1.5 py-0.2 rounded bg-purple-500/20 text-purple-300 border border-purple-500/30">
                              +{quest.questPoints}đ
                            </span>
                          </div>
                          <p className="text-xs text-slate-400 mt-0.5 leading-snug">{quest.description}</p>
                          <div className="mt-2 flex items-center gap-2">
                            <div className="flex-1 h-2 bg-[#050505] rounded-full overflow-hidden border border-white/5">
                              <div
                                className={`h-full transition-all duration-300 ${
                                  quest.completed ? 'bg-emerald-500 shadow-sm' : 'bg-purple-500'
                                }`}
                                style={{ width: `${percent}%` }}
                              />
                            </div>
                            <span className="text-[11px] font-mono text-slate-400 font-bold shrink-0">
                              {quest.current.toLocaleString()}/{quest.target.toLocaleString()}
                            </span>
                          </div>
                        </div>
                      </div>

                      <div className="flex items-center justify-between sm:justify-end gap-3 shrink-0 pt-2 sm:pt-0 border-t sm:border-t-0 border-white/5">
                        <div className="flex items-center gap-2 text-xs font-mono font-bold bg-[#0a0a0a] px-2.5 py-1.5 rounded-xl border border-white/5">
                          <span className="text-amber-400">+{quest.rewardCoins}C</span>
                          <span className="text-blue-400">+{quest.rewardGems}G</span>
                          <span className="text-purple-400">+{quest.rewardExp}EXP</span>
                        </div>
                        {quest.claimed ? (
                          <span className="text-xs text-slate-500 font-semibold flex items-center gap-1 px-3 py-1.5">
                            <CheckCircle2 className="w-4 h-4 text-emerald-500/50" /> Đã nhận
                          </span>
                        ) : quest.completed ? (
                          <button
                            type="button"
                            onClick={() => claimWeeklyQuest(quest.id)}
                            className="px-4 py-1.5 rounded-xl bg-gradient-to-r from-amber-500 to-amber-600 hover:from-amber-400 hover:to-amber-500 text-neutral-950 font-bold text-xs shadow-lg shadow-amber-500/20 transition-all active:scale-95 cursor-pointer animate-pulse"
                          >
                            Nhận Quà
                          </button>
                        ) : (
                          <span className="text-xs text-slate-500 font-mono px-2">{percent}%</span>
                        )}
                      </div>
                    </div>
                  );
                })}
              </div>
            </div>
          )}

          {/* TAB 3: FRIENDS & COLLABORATION */}
          {mainTab === 'friends' && (
            <div className="space-y-4">
              <div className="p-3.5 bg-gradient-to-r from-cyan-950/40 via-neutral-900 to-indigo-950/40 border border-cyan-500/30 rounded-2xl flex items-center justify-between">
                <div>
                  <h3 className="text-sm font-bold text-cyan-300 flex items-center space-x-1.5">
                    <Users className="w-4 h-4" />
                    <span>Hệ Thống Bạn Bè & Thách Đấu 1v1</span>
                  </h3>
                  <p className="text-xs text-neutral-400 mt-0.5">
                    Kết bạn theo tên, theo dõi trạng thái online và thách đấu trực tiếp!
                  </p>
                </div>
                <button
                  onClick={() => setActiveModal('friends')}
                  className="px-3.5 py-1.5 rounded-xl bg-cyan-600 hover:bg-cyan-500 text-white text-xs font-bold shadow-md transition flex items-center space-x-1.5 active:scale-95"
                >
                  <UserPlus className="w-3.5 h-3.5" />
                  <span>Mở Bạn Bè</span>
                </button>
              </div>

              <div className="space-y-3">
                {friendQuests.map((quest) => {
                  const percent = Math.min(100, Math.round((quest.current / quest.target) * 100));
                  return (
                    <div
                      key={quest.id}
                      className="p-4 rounded-2xl bg-[#141414] border border-white/5 space-y-3 hover:border-white/10 transition-colors"
                    >
                      <div className="flex items-center justify-between">
                        <div>
                          <div className="flex items-center gap-2">
                            <span className="text-lg">🤝</span>
                            <h4 className="text-sm font-bold text-white">{quest.title}</h4>
                          </div>
                          <p className="text-xs text-slate-400 mt-1">{quest.description}</p>
                        </div>
                        <div className="flex items-center gap-2 text-xs font-mono font-bold bg-[#0a0a0a] px-2 py-1 rounded-lg border border-white/5">
                          <span className="text-amber-400 flex items-center gap-0.5">
                            <Coins className="w-3 h-3 text-amber-400" />+{quest.rewardCoins}
                          </span>
                          <span className="text-blue-400 flex items-center gap-0.5">
                            <Gem className="w-3 h-3 text-blue-400" />+{quest.rewardGems}
                          </span>
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
                                  className={`h-full ${idx === 0 ? 'bg-indigo-500' : 'bg-purple-500'} transition-all`}
                                  style={{ width: `${pPercent}%` }}
                                  title={`${p.name}: ${p.contribution}`}
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
                                   <span className={`font-mono ${idx === 0 ? 'text-indigo-400' : 'text-purple-400'}`}>{p.contribution} đ</span>
                                 </div>
                               </div>
                             ))}
                          </div>
                          
                          {quest.status === 'completed' && (
                            <button
                              onClick={() => claimFriendQuest(quest.id)}
                              className="px-4 py-1.5 rounded-xl bg-gradient-to-r from-amber-400 to-yellow-500 hover:from-amber-300 hover:to-yellow-400 text-black font-black uppercase text-[10px] shadow-lg shadow-amber-500/20 transition-colors cursor-pointer"
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
              </div>
            </div>
          )}
        </div>
      </div>
    </div>
  );
};

