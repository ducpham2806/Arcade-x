import React, { useState } from 'react';
import { motion, AnimatePresence } from 'motion/react';
import {
  Calendar,
  Clock,
  Gift,
  Trophy,
  CheckCircle2,
  Sparkles,
  Zap,
  ChevronRight,
  X,
  Coins,
  Gem,
  Award,
  Flame,
  Swords
} from 'lucide-react';
import { useGame } from '../context/GameContext';
import { soundEngine } from '../services/audio';

export const WeeklyQuestsModal: React.FC = () => {
  const {
    activeModal,
    setActiveModal,
    weeklyQuests,
    weeklyMilestones,
    weeklyPoints,
    claimWeeklyQuest,
    claimWeeklyMilestoneReward,
    weeklyCountdown,
  } = useGame();

  const [selectedMilestonePreview, setSelectedMilestonePreview] = useState<number | null>(null);

  if (activeModal !== 'weeklyQuests') return null;

  const maxPoints = 100;
  const progressPercentage = Math.min(100, Math.round((weeklyPoints / maxPoints) * 100));

  const completedQuestsCount = weeklyQuests.filter((q) => q.completed).length;

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center p-3 sm:p-4 bg-black/80 backdrop-blur-md overflow-y-auto">
      <motion.div
        initial={{ scale: 0.92, opacity: 0, y: 15 }}
        animate={{ scale: 1, opacity: 1, y: 0 }}
        exit={{ scale: 0.92, opacity: 0, y: 15 }}
        transition={{ type: 'spring', damping: 24, stiffness: 300 }}
        className="relative w-full max-w-2xl bg-neutral-900/95 border border-purple-500/30 rounded-2xl shadow-2xl shadow-purple-950/50 overflow-hidden flex flex-col max-h-[90vh]"
      >
        {/* Header */}
        <div className="relative px-5 py-4 border-b border-neutral-800 bg-gradient-to-r from-purple-950/50 via-neutral-900 to-indigo-950/50 flex items-center justify-between">
          <div className="flex items-center space-x-3">
            <div className="p-2.5 rounded-xl bg-purple-500/10 border border-purple-500/30 text-purple-400 shadow-sm">
              <Calendar className="w-6 h-6" />
            </div>
            <div>
              <div className="flex items-center space-x-2">
                <h2 className="text-xl font-bold text-neutral-100 tracking-wide">Nhiệm Vụ Tuần & Cột Mốc</h2>
                <span className="px-2 py-0.5 text-xs font-semibold rounded-full bg-purple-500/20 text-purple-300 border border-purple-500/30">
                  {completedQuestsCount}/{weeklyQuests.length} Hoàn Thành
                </span>
              </div>
              <div className="flex items-center space-x-2 text-xs text-purple-300/80 mt-0.5 font-medium">
                <Clock className="w-3.5 h-3.5 text-amber-400" />
                <span>Làm mới sau: <span className="font-mono text-amber-300 font-bold">{weeklyCountdown.formatted}</span></span>
              </div>
            </div>
          </div>

          <div className="flex items-center space-x-2">
            <button
              onClick={() => {
                soundEngine.play('click');
                setActiveModal('dailyQuests');
              }}
              className="px-3 py-1.5 rounded-lg bg-neutral-800 hover:bg-neutral-700 text-xs font-semibold text-neutral-300 hover:text-white transition flex items-center space-x-1"
            >
              <span>Nhiệm Vụ Ngày</span>
              <ChevronRight className="w-3.5 h-3.5" />
            </button>
            <button
              onClick={() => {
                soundEngine.play('click');
                setActiveModal('none');
              }}
              className="p-2 rounded-lg text-neutral-400 hover:text-white hover:bg-neutral-800 transition"
              aria-label="Đóng"
            >
              <X className="w-5 h-5" />
            </button>
          </div>
        </div>

        {/* Modal Scroll Content */}
        <div className="p-5 flex-1 overflow-y-auto space-y-6">
          {/* 1. WEEKLY MILESTONE PROGRESSION BAR */}
          <div className="p-4 rounded-2xl bg-neutral-950/70 border border-purple-500/20 shadow-inner relative overflow-hidden">
            <div className="flex items-center justify-between mb-2">
              <div className="flex items-center space-x-2">
                <Trophy className="w-4 h-4 text-amber-400" />
                <h3 className="text-sm font-bold text-neutral-200">Tiến Độ Cột Mốc Tuần</h3>
              </div>
              <div className="flex items-center space-x-1 font-mono font-bold text-xs bg-purple-500/20 px-2.5 py-1 rounded-full border border-purple-500/30 text-purple-300">
                <Sparkles className="w-3.5 h-3.5 text-amber-400 inline" />
                <span>{weeklyPoints} / {maxPoints} Điểm</span>
              </div>
            </div>

            {/* Custom Progress Bar with Milestone Nodes */}
            <div className="relative pt-6 pb-2 px-3">
              {/* Background Track */}
              <div className="h-3 w-full bg-neutral-800 rounded-full overflow-hidden relative">
                <motion.div
                  initial={{ width: 0 }}
                  animate={{ width: `${progressPercentage}%` }}
                  transition={{ duration: 0.8, ease: 'easeOut' }}
                  className="h-full bg-gradient-to-r from-purple-500 via-indigo-500 to-amber-400 rounded-full shadow-lg shadow-purple-500/50"
                />
              </div>

              {/* 4 Milestone Tier Checkpoints */}
              <div className="relative flex justify-between -mt-4">
                {weeklyMilestones.map((m) => {
                  const isUnlocked = weeklyPoints >= m.requiredPoints;
                  const isClaimed = m.claimed;
                  const canClaim = isUnlocked && !isClaimed;

                  return (
                    <div
                      key={m.tier}
                      className="flex flex-col items-center cursor-pointer group"
                      onClick={() => {
                        if (canClaim) {
                          claimWeeklyMilestoneReward(m.tier);
                        } else {
                          soundEngine.play('click');
                          setSelectedMilestonePreview(selectedMilestonePreview === m.tier ? null : m.tier);
                        }
                      }}
                    >
                      {/* Node Bubble */}
                      <motion.div
                        whileHover={{ scale: 1.15 }}
                        whileTap={{ scale: 0.95 }}
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
                        {canClaim && (
                          <span className="absolute -top-1 -right-1 w-3.5 h-3.5 rounded-full bg-red-500 border border-white animate-ping"></span>
                        )}
                      </motion.div>

                      {/* Points Label */}
                      <span className="text-[11px] font-bold text-neutral-400 mt-1.5 font-mono">
                        {m.requiredPoints}đ
                      </span>

                      {/* Mini Action Tag */}
                      {canClaim ? (
                        <span className="px-1.5 py-0.2 rounded bg-amber-500 text-neutral-950 font-bold text-[9px] uppercase tracking-wider animate-pulse mt-0.5">
                          Nhận!
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

            {/* Milestone Preview Box if clicked */}
            <AnimatePresence>
              {selectedMilestonePreview !== null && (
                <motion.div
                  initial={{ opacity: 0, height: 0 }}
                  animate={{ opacity: 1, height: 'auto' }}
                  exit={{ opacity: 0, height: 0 }}
                  className="mt-3 p-3 rounded-xl bg-purple-950/40 border border-purple-500/30 text-xs"
                >
                  {(() => {
                    const m = weeklyMilestones.find((item) => item.tier === selectedMilestonePreview);
                    if (!m) return null;
                    return (
                      <div className="flex items-center justify-between">
                        <div>
                          <p className="font-bold text-neutral-200">{m.title}</p>
                          <p className="text-[11px] text-neutral-400 mt-0.5">{m.description}</p>
                          <div className="flex items-center space-x-3 mt-1 text-amber-300 font-semibold font-mono">
                            <span>+{m.rewardCoins} Coins</span>
                            <span>+{m.rewardGems} Gems</span>
                            <span>+{m.rewardExp} EXP</span>
                            {m.specialTitle && <span className="text-purple-300">{m.specialTitle}</span>}
                          </div>
                        </div>
                        {weeklyPoints >= m.requiredPoints && !m.claimed && (
                          <button
                            onClick={() => claimWeeklyMilestoneReward(m.tier)}
                            className="px-4 py-1.5 rounded-lg bg-amber-500 hover:bg-amber-400 text-neutral-950 font-bold text-xs shadow-md"
                          >
                            Nhận Quà
                          </button>
                        )}
                      </div>
                    );
                  })()}
                </motion.div>
              )}
            </AnimatePresence>
          </div>

          {/* 2. WEEKLY QUESTS LIST */}
          <div className="space-y-3">
            <div className="flex items-center justify-between">
              <h3 className="text-xs font-bold text-neutral-400 uppercase tracking-wider flex items-center space-x-1.5">
                <Flame className="w-3.5 h-3.5 text-amber-400" />
                <span>Nhiệm Vụ Tuần ({completedQuestsCount}/{weeklyQuests.length})</span>
              </h3>
              <span className="text-[11px] text-neutral-400">Tích lũy điểm tuần để mở rương báu</span>
            </div>

            <div className="space-y-2.5">
              {weeklyQuests.map((quest) => {
                const percent = Math.min(100, Math.round((quest.current / quest.target) * 100));

                return (
                  <div
                    key={quest.id}
                    className={`p-3.5 rounded-xl border transition flex flex-col sm:flex-row sm:items-center justify-between gap-3 ${
                      quest.claimed
                        ? 'bg-neutral-900/40 border-neutral-800 opacity-60'
                        : quest.completed
                        ? 'bg-purple-950/30 border-purple-500/50 shadow-md shadow-purple-950/40'
                        : 'bg-neutral-850/70 border-neutral-700/60 hover:border-neutral-600'
                    }`}
                  >
                    {/* Left: Info */}
                    <div className="flex items-center space-x-3.5 min-w-0 flex-1">
                      <div className="w-11 h-11 rounded-xl bg-neutral-800 border border-neutral-700 flex items-center justify-center text-2xl flex-shrink-0">
                        {quest.icon}
                      </div>
                      <div className="min-w-0 flex-1">
                        <div className="flex items-center space-x-2">
                          <h4 className="font-bold text-sm text-neutral-100 truncate">{quest.title}</h4>
                          <span className="px-1.5 py-0.2 rounded bg-purple-500/20 text-purple-300 font-bold text-[10px] font-mono border border-purple-500/30">
                            +{quest.questPoints}đ
                          </span>
                        </div>
                        <p className="text-xs text-neutral-400 mt-0.5 leading-snug">{quest.description}</p>

                        {/* Progress bar */}
                        <div className="mt-2 flex items-center space-x-2.5">
                          <div className="h-1.5 flex-1 bg-neutral-750 rounded-full overflow-hidden">
                            <div
                              className={`h-full rounded-full transition-all duration-500 ${
                                quest.completed
                                  ? 'bg-emerald-400 shadow-sm shadow-emerald-500'
                                  : 'bg-purple-500'
                              }`}
                              style={{ width: `${percent}%` }}
                            />
                          </div>
                          <span className="text-[11px] font-mono font-medium text-neutral-400 flex-shrink-0">
                            {quest.current.toLocaleString()} / {quest.target.toLocaleString()}
                          </span>
                        </div>
                      </div>
                    </div>

                    {/* Right: Rewards & Action */}
                    <div className="flex items-center justify-between sm:justify-end space-x-3 sm:flex-shrink-0 border-t sm:border-t-0 pt-2 sm:pt-0 border-neutral-800">
                      <div className="flex items-center space-x-2 text-xs font-mono font-semibold text-neutral-300">
                        <span className="text-amber-300">+{quest.rewardCoins}C</span>
                        <span className="text-cyan-300">+{quest.rewardGems}G</span>
                        <span className="text-purple-300">+{quest.rewardExp}EXP</span>
                      </div>

                      <div>
                        {quest.claimed ? (
                          <span className="flex items-center space-x-1 px-3 py-1.5 rounded-lg bg-neutral-800 text-neutral-500 text-xs font-semibold">
                            <CheckCircle2 className="w-3.5 h-3.5 text-neutral-500" />
                            <span>Đã Nhận</span>
                          </span>
                        ) : quest.completed ? (
                          <button
                            onClick={() => claimWeeklyQuest(quest.id)}
                            className="px-4 py-1.5 rounded-lg bg-gradient-to-r from-amber-500 to-amber-600 hover:from-amber-400 hover:to-amber-500 text-neutral-950 font-bold text-xs shadow-md shadow-amber-950/50 transition active:scale-95 animate-pulse"
                          >
                            Nhận Quà
                          </button>
                        ) : (
                          <span className="px-3 py-1.5 rounded-lg bg-neutral-800/80 text-neutral-400 text-xs font-medium">
                            {percent}%
                          </span>
                        )}
                      </div>
                    </div>
                  </div>
                );
              })}
            </div>
          </div>
        </div>
      </motion.div>
    </div>
  );
};
