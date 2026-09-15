import React, { useState, useEffect, useMemo } from 'react';
import { useGame } from '../context/GameContext';
import { Achievement } from '../types';
import { soundEngine } from '../services/audio';
import { useScrollLock } from '../hooks/useScrollLock';
import { CloseButton } from './common/CloseButton';
import {
  Award,
  Sparkles,
  Coins,
  Gem,
  Zap,
  CheckCircle2,
  Lock,
  Share2,
  Trophy,
  Flame,
  Crown,
  Filter,
} from 'lucide-react';
import {
  AchievementRarity,
  getAchievementRarity,
  ACHIEVEMENT_RARITY_CONFIG,
} from '../utils/achievementRarity';

export const AchievementsModal: React.FC = () => {
  useScrollLock(true);
  const {
    achievements,
    claimAchievement,
    setActiveModal,
    openShareModal,
    targetAchievementCategory,
    setTargetAchievementCategory,
  } = useGame();

  const [selectedCat, setSelectedCat] = useState<string>('Tất Cả');
  const [selectedRarity, setSelectedRarity] = useState<AchievementRarity | 'all'>('all');

  useEffect(() => {
    if (targetAchievementCategory) {
      setSelectedCat(targetAchievementCategory);
      setTargetAchievementCategory(null);
    }
  }, [targetAchievementCategory, setTargetAchievementCategory]);

  // Dynamically compile categories
  const categories = useMemo(() => {
    const set = new Set<string>();
    achievements.forEach((a) => {
      if (a.category) set.add(a.category);
      else set.add('Chung');
    });
    return ['Tất Cả', ...Array.from(set)];
  }, [achievements]);

  // Calculate statistics per rarity tier
  const rarityStats = useMemo(() => {
    const stats: Record<AchievementRarity, { total: number; unlocked: number }> = {
      common: { total: 0, unlocked: 0 },
      rare: { total: 0, unlocked: 0 },
      epic: { total: 0, unlocked: 0 },
      legendary: { total: 0, unlocked: 0 },
    };

    achievements.forEach((ach) => {
      const r = getAchievementRarity(ach);
      if (stats[r]) {
        stats[r].total += 1;
        if (ach.unlocked) {
          stats[r].unlocked += 1;
        }
      }
    });

    return stats;
  }, [achievements]);

  const totalUnlocked = achievements.filter((a) => a.unlocked).length;

  // Filtered achievements by both category and rarity
  const filtered = useMemo(() => {
    return achievements.filter((ach) => {
      const matchCat = selectedCat === 'Tất Cả' || (ach.category || 'Chung') === selectedCat;
      const achRarity = getAchievementRarity(ach);
      const matchRarity = selectedRarity === 'all' || achRarity === selectedRarity;
      return matchCat && matchRarity;
    });
  }, [achievements, selectedCat, selectedRarity]);

  const handleShareAll = () => {
    openShareModal({
      type: 'achievement',
      title: `Bộ Sưu Tập ${totalUnlocked}/${achievements.length} Thành Tựu ArcadeX`,
      description: `Đã mở khóa thành công ${totalUnlocked} huy hiệu thành tích trên đấu trường ArcadeX!`,
      badgeIcon: '👑',
    });
  };

  // Close on Escape key press
  useEffect(() => {
    const handleKeyDown = (e: KeyboardEvent) => {
      if (e.key === 'Escape') {
        soundEngine.play('click');
        setActiveModal('none');
      }
    };
    window.addEventListener('keydown', handleKeyDown);
    return () => window.removeEventListener('keydown', handleKeyDown);
  }, [setActiveModal]);

  const rarityTiers: AchievementRarity[] = ['common', 'rare', 'epic', 'legendary'];

  return (
    <div
      onClick={() => {
        soundEngine.play('click');
        setActiveModal('none');
      }}
      className="fixed inset-0 z-40 bg-black/85 backdrop-blur-md flex items-center justify-center p-2.5 sm:p-4 overflow-y-auto animate-in fade-in duration-200"
    >
      <div
        onClick={(e) => e.stopPropagation()}
        className="max-w-4xl w-full h-[92vh] sm:h-[88vh] max-h-[840px] bg-[#0c0c12] border border-white/10 rounded-2xl sm:rounded-3xl p-3 sm:p-6 shadow-2xl relative my-auto flex flex-col overflow-hidden"
      >
        {/* Header */}
        <div className="flex items-center justify-between pb-2.5 sm:pb-4 border-b border-white/10 shrink-0">
          <div className="flex items-center gap-2.5 sm:gap-3 min-w-0">
            <div className="w-9 h-9 sm:w-11 sm:h-11 rounded-xl bg-gradient-to-br from-yellow-500/20 to-amber-600/10 border border-yellow-500/30 text-yellow-400 flex items-center justify-center shadow-lg shadow-yellow-500/10 shrink-0">
              <Award className="w-4 h-4 sm:w-6 sm:h-6" />
            </div>
            <div className="min-w-0">
              <h2 className="text-base sm:text-xl font-black text-white font-display tracking-wide truncate">
                HỆ THỐNG THÀNH TỰU
              </h2>
              <p className="text-[11px] sm:text-xs text-slate-400 truncate">
                Đã đạt <strong className="text-white font-bold">{totalUnlocked}/{achievements.length}</strong> thành tựu ArcadeX
              </p>
            </div>
          </div>

          <div className="flex items-center gap-2 shrink-0">
            {totalUnlocked > 0 && (
              <button
                id="btn-share-achievements-header"
                type="button"
                onClick={handleShareAll}
                className="px-2.5 sm:px-3 py-1.5 rounded-xl bg-indigo-600/20 hover:bg-indigo-600/30 border border-indigo-500/40 text-indigo-300 text-xs font-bold flex items-center gap-1.5 transition-colors shadow-sm shadow-indigo-500/10 cursor-pointer"
                title="Chia sẻ toàn bộ thành tích đã đạt được"
              >
                <Share2 className="w-3.5 h-3.5" />
                <span className="hidden sm:inline">Khoe Thành Tích</span>
              </button>
            )}

            <CloseButton
              id="btn-close-achievements"
              onClose={() => setActiveModal('none')}
              ariaLabel="Đóng thành tựu"
            />
          </div>
        </div>

        {/* Visual Rarity Tier Bar - Compact Horizontal Scroll on Mobile */}
        <div className="pt-2 sm:pt-3 pb-1.5 sm:pb-2 shrink-0">
          <div className="flex items-center justify-between mb-1 sm:mb-1.5">
            <span className="text-[10px] sm:text-[11px] font-bold text-slate-400 uppercase tracking-wider flex items-center gap-1">
              <Filter className="w-3 h-3 text-indigo-400" />
              <span>Bậc Hiếm (Rarity):</span>
            </span>
            {selectedRarity !== 'all' && (
              <button
                type="button"
                onClick={() => setSelectedRarity('all')}
                className="text-[10px] sm:text-[11px] text-indigo-400 hover:text-indigo-300 underline font-semibold cursor-pointer"
              >
                Tất cả ({totalUnlocked}/{achievements.length})
              </button>
            )}
          </div>

          <div className="flex sm:grid sm:grid-cols-4 gap-1.5 sm:gap-2 overflow-x-auto scrollbar-none pb-1 sm:pb-0 flex-nowrap touch-pan-x">
            {rarityTiers.map((tier) => {
              const config = ACHIEVEMENT_RARITY_CONFIG[tier];
              const stats = rarityStats[tier];
              const isSelected = selectedRarity === tier;
              const TierIcon = config.iconComponent;

              return (
                <button
                  key={tier}
                  type="button"
                  onClick={() => setSelectedRarity(isSelected ? 'all' : tier)}
                  style={
                    isSelected
                      ? {
                          boxShadow: config.glowBoxShadowModal,
                          borderColor: config.glowBorderColor,
                        }
                      : {}
                  }
                  className={`px-2.5 py-1.5 sm:p-2.5 rounded-xl border text-left transition-colors relative overflow-hidden cursor-pointer flex items-center justify-between gap-2 shrink-0 ${
                    isSelected
                      ? `bg-[#13141f] ${config.borderClass} ring-1 ring-white/20`
                      : 'bg-[#111118] border-white/10 hover:border-white/20 text-slate-300'
                  }`}
                >
                  {/* Subtle top ambient tier strip */}
                  <div className={`absolute top-0 left-0 right-0 h-0.5 sm:h-1 ${config.topBannerClass} opacity-80`} />

                  <div className="flex items-center gap-1.5 sm:gap-2 min-w-0">
                    <div
                      className={`w-6 h-6 sm:w-7 sm:h-7 rounded-lg flex items-center justify-center shrink-0 border ${
                        isSelected ? config.iconBgClass : 'bg-white/5 border-white/10 text-slate-400'
                      }`}
                    >
                      <TierIcon className="w-3 h-3 sm:w-3.5 sm:h-3.5" />
                    </div>
                    <div className="min-w-0">
                      <div className="text-[11px] sm:text-xs font-bold text-white whitespace-nowrap flex items-center gap-1">
                        <span>{config.nameVi}</span>
                      </div>
                      <span className="text-[9px] sm:text-[10px] text-slate-400 hidden sm:block tracking-tight uppercase">
                        {config.nameEn}
                      </span>
                    </div>
                  </div>

                  <div className="text-right shrink-0">
                    <span
                      className={`text-[11px] sm:text-xs font-mono font-bold block ${
                        isSelected ? config.accentTextColor : 'text-slate-200'
                      }`}
                    >
                      {stats.unlocked}/{stats.total}
                    </span>
                    <span className="text-[8px] sm:text-[9px] text-slate-500 font-medium hidden sm:inline">Đạt</span>
                  </div>
                </button>
              );
            })}
          </div>
        </div>

        {/* Category Pills: Horizontal scroll on mobile to save vertical space */}
        <div className="flex items-center gap-1.5 py-1.5 sm:py-2 overflow-x-auto scrollbar-none shrink-0 flex-nowrap touch-pan-x">
          {categories.map((cat) => (
            <button
              key={cat}
              type="button"
              onClick={() => setSelectedCat(cat)}
              className={`px-2.5 sm:px-3 py-1 rounded-xl text-[11px] sm:text-xs font-bold whitespace-nowrap transition-colors cursor-pointer border shrink-0 ${
                selectedCat === cat
                  ? 'bg-indigo-600 text-white border-indigo-500 shadow-md shadow-indigo-600/30'
                  : 'bg-[#14141c] text-slate-400 hover:text-white border-white/5'
              }`}
            >
              {cat}
            </button>
          ))}
        </div>

        {/* Achievements List */}
        <div className="flex-1 overflow-y-auto space-y-3 pr-1 pt-2">
          {filtered.length === 0 ? (
            <div className="py-12 text-center text-slate-500 text-sm">
              Không có thành tựu nào khớp với bộ lọc này.
            </div>
          ) : (
            filtered.map((ach) => {
              const percent = Math.min(100, Math.round((ach.current / ach.target) * 100));
              const rarity = getAchievementRarity(ach);
              const config = ACHIEVEMENT_RARITY_CONFIG[rarity];
              const TierIcon = config.iconComponent;

              const isUnclaimed = ach.unlocked && !ach.claimed;

              return (
                <div
                  key={ach.id}
                  style={
                    isUnclaimed
                      ? {
                          boxShadow: config.glowBoxShadowModal,
                          borderColor: config.glowBorderColor,
                        }
                      : ach.unlocked
                      ? {
                          borderColor: config.glowBorderColor,
                        }
                      : {}
                  }
                  className={`p-3.5 sm:p-4 rounded-2xl border flex flex-col sm:flex-row items-start sm:items-center justify-between gap-3.5 transition-all relative overflow-hidden ${
                    isUnclaimed
                      ? `bg-gradient-to-r from-[#171724] via-[#12121c] to-[#0f0f18] ${config.borderClass} ${config.ringGlow}`
                      : ach.unlocked
                      ? 'bg-[#101017] border-white/15 opacity-90'
                      : 'bg-[#0b0b10] border-white/5 opacity-75'
                  }`}
                >
                  {/* Color-coded top line indicator for unlocked/prestigious achievements */}
                  <div
                    className={`absolute top-0 left-0 right-0 h-1 ${
                      ach.unlocked ? config.topBannerClass : 'bg-white/5'
                    }`}
                  />

                  {/* Left: Tier Badge, Icon & Info */}
                  <div className="flex items-center gap-3 min-w-0 flex-1">
                    {/* Icon container with tier-specific radiant aura */}
                    <div className="relative shrink-0">
                      {ach.unlocked && (
                        <div
                          className={`absolute inset-0 rounded-xl bg-gradient-to-tr ${config.iconAuraClass} blur-md opacity-50`}
                        />
                      )}
                      <div
                        className={`relative w-12 h-12 sm:w-13 sm:h-13 rounded-xl border flex items-center justify-center text-2xl shadow-md ${
                          ach.unlocked
                            ? config.iconBorderClass
                            : 'bg-[#101018] border-white/10 text-slate-600'
                        }`}
                      >
                        {ach.unlocked ? ach.icon : <Lock className="w-5 h-5 text-slate-600" />}
                      </div>

                      {/* Sparkle badge for unclaimed */}
                      {isUnclaimed && (
                        <div
                          className={`absolute -top-1 -right-1 w-4 h-4 rounded-full ${config.iconBadgeBg} flex items-center justify-center text-[9px] font-bold shadow-md animate-bounce`}
                        >
                          ✦
                        </div>
                      )}
                    </div>

                    <div className="min-w-0 flex-1">
                      <div className="flex flex-wrap items-center gap-1.5 mb-1">
                        {/* Visual Rarity Tier Badge */}
                        <div
                          className={`inline-flex items-center gap-1 px-2 py-0.5 rounded-md text-[10px] font-black uppercase tracking-wider border ${config.badgeClass}`}
                        >
                          <TierIcon className="w-3 h-3" />
                          <span>{config.nameVi}</span>
                        </div>

                        {ach.category && (
                          <span className="text-[10px] px-2 py-0.5 rounded-md bg-white/5 text-slate-400 border border-white/10 font-medium">
                            {ach.category}
                          </span>
                        )}
                      </div>

                      <h4 className="text-sm font-bold text-white truncate tracking-wide">
                        {ach.title}
                      </h4>
                      <p className="text-xs text-slate-400 mt-0.5 line-clamp-2 leading-relaxed">
                        {ach.description}
                      </p>

                      {/* Progress Bar with Tier Gradient */}
                      <div className="flex items-center gap-2.5 mt-2">
                        <div className="flex-1 h-1.5 bg-[#181822] rounded-full overflow-hidden border border-white/5">
                          <div
                            className={`h-full transition-all duration-300 ${
                              ach.unlocked ? config.progressBarGradient : 'bg-slate-600'
                            }`}
                            style={{ width: `${percent}%` }}
                          />
                        </div>
                        <span className="text-[11px] font-mono text-slate-400 shrink-0 font-medium">
                          {(ach.current || 0).toLocaleString()} / {(ach.target || 0).toLocaleString()}
                        </span>
                      </div>
                    </div>
                  </div>

                  {/* Right: Rewards & Claim / Share Button */}
                  <div className="flex items-center sm:flex-col sm:items-end gap-2.5 w-full sm:w-auto justify-between shrink-0 border-t sm:border-t-0 pt-2 sm:pt-0 border-white/5">
                    {/* Rewards preview */}
                    <div className="flex items-center gap-2 text-xs font-semibold">
                      <span className="text-indigo-400 flex items-center gap-0.5">
                        <Zap className="w-3.5 h-3.5" /> +{ach.rewardExp} EXP
                      </span>
                      <span className="text-yellow-500 flex items-center gap-0.5 font-mono">
                        <Coins className="w-3.5 h-3.5" /> +{ach.rewardCoins}
                      </span>
                      {ach.rewardGems > 0 && (
                        <span className="text-blue-400 flex items-center gap-0.5 font-mono">
                          <Gem className="w-3.5 h-3.5" /> +{ach.rewardGems}
                        </span>
                      )}
                    </div>

                    {/* Title preview if any */}
                    {ach.rewardTitle && (
                      <span className={`text-[10px] font-bold ${config.accentTextColor} hidden sm:inline-block`}>
                        👑 {ach.rewardTitle}
                      </span>
                    )}

                    {/* Action Buttons */}
                    <div className="flex items-center gap-2">
                      {ach.unlocked && (
                        <button
                          id={`btn-share-ach-${ach.id}`}
                          type="button"
                          onClick={() =>
                            openShareModal({
                              type: 'achievement',
                              title: ach.title,
                              description: ach.description,
                              badgeIcon: ach.icon,
                            })
                          }
                          className="p-2 rounded-xl bg-indigo-600/15 hover:bg-indigo-600/30 border border-indigo-500/30 text-indigo-300 text-xs font-bold flex items-center gap-1 transition-colors cursor-pointer"
                          title="Chia sẻ thành tựu này"
                        >
                          <Share2 className="w-3.5 h-3.5" />
                          <span className="text-[11px] hidden sm:inline">Chia sẻ</span>
                        </button>
                      )}

                      {ach.unlocked ? (
                        ach.claimed ? (
                          <div className="inline-flex items-center gap-1 text-xs text-emerald-400 font-bold px-3 py-1.5 rounded-xl bg-emerald-500/10 border border-emerald-500/30">
                            <CheckCircle2 className="w-4 h-4" />
                            <span>Đã Nhận</span>
                          </div>
                        ) : (
                          <button
                            id={`btn-claim-${ach.id}`}
                            type="button"
                            onClick={() => claimAchievement(ach.id)}
                            className={`px-4 py-2 rounded-xl bg-gradient-to-r ${config.buttonClaimClass} font-black uppercase text-xs shadow-lg transition-colors cursor-pointer flex items-center gap-1`}
                          >
                            <Sparkles className="w-3.5 h-3.5" />
                            <span>Nhận Thưởng</span>
                          </button>
                        )
                      ) : (
                        <div className="text-xs text-slate-500 font-semibold px-3 py-1.5 rounded-xl bg-[#12121a] border border-white/5 flex items-center gap-1">
                          <Lock className="w-3 h-3 text-slate-500" />
                          <span>Chưa Đạt</span>
                        </div>
                      )}
                    </div>
                  </div>
                </div>
              );
            })
          )}
        </div>
      </div>
    </div>
  );
};
