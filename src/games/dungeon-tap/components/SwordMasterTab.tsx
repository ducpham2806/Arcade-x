import React, { useState } from 'react';
import { ActiveSkill } from '../types';
import { Swords, Zap, ChevronUp, Award, ArrowUpCircle } from 'lucide-react';
import {
  calculateHeroUpgradeCost,
  calculateMaxHeroLevels,
  getHeroMilestoneData,
  getSkillData,
  calculateSkillUpgradeCost,
  calculateMaxSkillLevels,
  formatNumber,
} from '../utils/upgradeMath';
import { INITIAL_SKILLS } from '../skillsAndAllies';

interface SwordMasterTabProps {
  heroLevel: number;
  tapDamage: number;
  nextTapDamage: number;
  levelUpCost: number;
  gold: number;
  skills: ActiveSkill[];
  onLevelUp: (count: number) => void;
  onUpgradeSkill: (skillId: ActiveSkill['id'], count?: number) => void;
}

export const SwordMasterTab: React.FC<SwordMasterTabProps> = ({
  heroLevel,
  tapDamage,
  gold,
  skills,
  onLevelUp,
  onUpgradeSkill,
}) => {
  // Selected upgrade increment: 1, 5, 10, 15, 20, or 'max'
  const [multiplier, setMultiplier] = useState<number | 'max'>(1);

  const milestoneData = getHeroMilestoneData(heroLevel);

  // Compute exact cost based on selected multiplier
  let targetCount = 1;
  let batchCost = 0;
  let canAfford = false;

  if (multiplier === 'max') {
    const maxData = calculateMaxHeroLevels(heroLevel, gold);
    targetCount = maxData.count;
    batchCost = maxData.totalCost;
    canAfford = targetCount > 0 && gold >= batchCost && batchCost > 0;
  } else {
    targetCount = multiplier;
    batchCost = calculateHeroUpgradeCost(heroLevel, targetCount);
    canAfford = gold >= batchCost;
  }

  return (
    <div className="flex flex-col gap-3 p-3 text-slate-200">
      {/* Hero Profile Header */}
      <div className="flex items-center justify-between bg-slate-900/90 border border-amber-500/30 p-3 rounded-2xl shadow-lg gap-2">
        <div className="flex items-center gap-2.5 min-w-0 flex-1">
          <div className="text-3xl sm:text-4xl p-2 bg-black/50 rounded-xl border border-amber-500/30 shadow-inner shrink-0">
            🤺
          </div>
          <div className="min-w-0 flex-1">
            <div className="flex items-center gap-1.5 flex-wrap">
              <h3 className="text-sm sm:text-base font-black text-amber-300 truncate">
                Kiếm Sĩ (Sword Master)
              </h3>
              <span className="text-[11px] bg-amber-500/20 text-amber-300 px-2 py-0.5 rounded-full font-mono font-bold border border-amber-500/40 shrink-0">
                Lv.{formatNumber(heroLevel)}
              </span>
            </div>
            <div className="text-xs text-slate-400 flex items-center gap-1.5 mt-0.5">
              <Swords className="w-3.5 h-3.5 text-amber-400 shrink-0" />
              <span className="shrink-0">Sát Thương Tap:</span>
              <span className="font-mono font-bold text-amber-300 text-sm">
                {formatNumber(tapDamage)}
              </span>
            </div>
          </div>
        </div>

        {/* Upgrade Button */}
        <button
          onClick={() => onLevelUp(targetCount)}
          disabled={!canAfford}
          className={`px-3 sm:px-4 py-2 sm:py-2.5 rounded-xl font-black text-xs flex flex-col items-center justify-center gap-0.5 active:scale-95 transition-all shadow-md shrink-0 ${
            canAfford
              ? 'bg-gradient-to-r from-amber-500 to-yellow-500 hover:from-amber-400 hover:to-yellow-400 text-slate-950 shadow-amber-500/30'
              : 'bg-slate-800 text-slate-500 cursor-not-allowed border border-slate-700'
          }`}
        >
          <div className="flex items-center gap-1 text-[11px] sm:text-[12px] whitespace-nowrap">
            <ChevronUp className="w-4 h-4" />
            <span>TĂNG CẤP +{formatNumber(targetCount)}</span>
          </div>
          <span className="font-mono text-[10px] sm:text-[11px] font-bold">
            💰 {formatNumber(batchCost)}
          </span>
        </button>
      </div>

      {/* Accurate Upgrade Multipliers Bar (+1, +5, +10, +15, +20, MAX) */}
      <div className="flex flex-col gap-1.5 bg-slate-900/60 border border-white/5 p-2.5 rounded-xl">
        <div className="flex items-center justify-between text-xs text-slate-400 px-0.5">
          <span className="font-semibold text-[11px] text-slate-300">Mức tăng cấp nhanh:</span>
          <span className="text-[10px] font-mono text-amber-400">
            {multiplier === 'max' ? `Tối đa +${formatNumber(targetCount)}` : `+${multiplier} Cấp`}
          </span>
        </div>

        <div className="grid grid-cols-6 gap-1">
          {([1, 5, 10, 15, 20, 'max'] as const).map((m) => {
            const isSelected = multiplier === m;
            const cost =
              m === 'max'
                ? calculateMaxHeroLevels(heroLevel, gold).totalCost
                : calculateHeroUpgradeCost(heroLevel, m);
            const canBuy = gold >= cost && cost > 0;

            return (
              <button
                key={m}
                onClick={() => setMultiplier(m)}
                className={`py-1.5 px-1 rounded-lg text-center font-mono text-[11px] font-bold border transition-all ${
                  isSelected
                    ? 'bg-amber-500 text-slate-950 border-amber-400 shadow-md shadow-amber-500/20 ring-1 ring-amber-300'
                    : canBuy
                    ? 'bg-slate-800 hover:bg-slate-700 text-amber-300 border-amber-500/30'
                    : 'bg-slate-950/80 text-slate-600 border-slate-800'
                }`}
              >
                {m === 'max' ? 'MAX' : `+${m}`}
              </button>
            );
          })}
        </div>
      </div>

      {/* Milestone 5-Level Breakthrough Progress Card */}
      <div className="bg-gradient-to-r from-amber-950/40 via-slate-900 to-indigo-950/40 border border-amber-500/30 p-3 rounded-2xl">
        <div className="flex items-center justify-between text-xs mb-1.5">
          <div className="flex items-center gap-1.5 font-bold text-amber-300">
            <Award className="w-4 h-4 text-amber-400" />
            <span>Mốc Đột Phá Tiếp Theo: Lv.{formatNumber(milestoneData.nextMilestone)}</span>
          </div>
          <span className="text-[10px] text-emerald-400 font-bold bg-emerald-950/80 border border-emerald-500/40 px-1.5 py-0.5 rounded">
            +50% Sát Thương
          </span>
        </div>

        {/* Milestone Progress Bar */}
        <div className="w-full h-2.5 bg-slate-950 rounded-full overflow-hidden border border-amber-500/20 p-0.5">
          <div
            className="h-full bg-gradient-to-r from-amber-500 to-yellow-400 rounded-full transition-all duration-300"
            style={{ width: `${milestoneData.progressPercent}%` }}
          />
        </div>

        <div className="flex items-center justify-between text-[10px] text-slate-400 font-mono mt-1.5">
          <span>
            Tiến độ: {5 - milestoneData.levelsToNext}/5 cấp (còn {milestoneData.levelsToNext} cấp)
          </span>
          <span className="text-amber-300 font-bold">
            Thưởng mốc hiện tại: x{formatNumber(milestoneData.multiplier)}
          </span>
        </div>
      </div>

      {/* Skills Milestone List with Level Up capability (Compact Grid Layout) */}
      <div className="flex flex-col gap-2">
        <div className="flex items-center justify-between px-1">
          <h4 className="text-xs font-bold uppercase tracking-wider text-slate-300 flex items-center gap-1.5">
            <Zap className="w-3.5 h-3.5 text-cyan-400" />
            <span>Kỹ Năng Kiếm Sĩ</span>
          </h4>
          <span className="text-[10px] text-cyan-400/80 font-mono">
            {skills.filter((s) => heroLevel >= s.unlockLevel).length}/{INITIAL_SKILLS.length} Mở
          </span>
        </div>

        {/* 2-Column Grid Layout for Skills */}
        <div className="grid grid-cols-2 gap-2">
          {INITIAL_SKILLS.map((initSkill) => {
            const skill = skills.find((s) => s.id === initSkill.id) || initSkill;
            const isUnlocked = heroLevel >= skill.unlockLevel;
            const skillInfo = getSkillData(skill.id, skill.level);
            const canAfford = isUnlocked && gold >= skill.upgradeCost;

            const cost1 = isUnlocked ? calculateSkillUpgradeCost(skill.baseUpgradeCost || 100, skill.level, 1) : 0;
            const canAfford1 = isUnlocked && gold >= cost1;

            const cost5 = isUnlocked ? calculateSkillUpgradeCost(skill.baseUpgradeCost || 100, skill.level, 5) : 0;
            const canAfford5 = isUnlocked && gold >= cost5;

            const maxData = isUnlocked ? calculateMaxSkillLevels(skill.baseUpgradeCost || 100, skill.level, gold) : { count: 0, totalCost: 0 };
            const canAffordMax = isUnlocked && maxData.count > 0 && gold >= maxData.totalCost;

            return (
              <div
                key={skill.id}
                className={`flex flex-col justify-between p-2 rounded-xl border transition-all min-h-[140px] ${
                  isUnlocked
                    ? 'bg-slate-900/90 border-cyan-500/40 text-slate-200 shadow-sm'
                    : 'bg-slate-950/60 border-slate-800 text-slate-500 opacity-60'
                }`}
              >
                {/* Header: Icon, Name, Level */}
                <div>
                  <div className="flex items-center gap-1.5 justify-between">
                    <div className="flex items-center gap-1.5 min-w-0">
                      <span className="text-xl shrink-0 p-1 bg-black/40 rounded-lg border border-slate-800/80">
                        {skill.icon}
                      </span>
                      <div className="min-w-0">
                        <div className="font-bold text-xs text-cyan-300 truncate leading-tight">
                          {skill.name}
                        </div>
                        <div className="text-[9px] font-mono text-slate-400">
                          {isUnlocked ? `Lv.${formatNumber(skill.level)}` : `🔒 Lv.${skill.unlockLevel}`}
                        </div>
                      </div>
                    </div>

                    <span className="text-[9px] font-mono font-bold text-cyan-400 shrink-0">
                      💧{skill.manaCost}
                    </span>
                  </div>

                  {/* Compact Effect Summary */}
                  <div className="text-[10px] text-amber-200/95 font-medium line-clamp-2 mt-1.5">
                    {isUnlocked ? skillInfo.currentEffect : skill.description}
                  </div>
                </div>

                {/* Compact Upgrade Button Bar */}
                {isUnlocked ? (
                  <div className="pt-1.5 border-t border-slate-800/80 mt-1.5 flex items-center gap-1 justify-between">
                    <button
                      id={`btn-upgrade-skill-1-${skill.id}`}
                      onClick={() => onUpgradeSkill(skill.id, 1)}
                      disabled={!canAfford1}
                      className={`flex-1 py-1 px-1 rounded-lg font-bold text-[10px] flex items-center justify-center gap-0.5 transition-all shadow-sm active:scale-95 ${
                        canAfford1
                          ? 'bg-gradient-to-r from-cyan-600 to-blue-600 text-white shadow-cyan-900/30'
                          : 'bg-slate-800/80 text-slate-500 cursor-not-allowed'
                      }`}
                      title={`+1 Cấp: 💰${formatNumber(cost1)}`}
                    >
                      <ArrowUpCircle className="w-3 h-3 shrink-0" />
                      <span className="truncate">💰{formatNumber(cost1)}</span>
                    </button>

                    <button
                      id={`btn-upgrade-skill-5-${skill.id}`}
                      onClick={() => onUpgradeSkill(skill.id, 5)}
                      disabled={!canAfford5}
                      className={`py-1 px-1.5 rounded-lg font-bold text-[10px] transition-all active:scale-95 shrink-0 ${
                        canAfford5
                          ? 'bg-cyan-950/90 text-cyan-300 border border-cyan-700/60'
                          : 'bg-slate-800/80 text-slate-500 cursor-not-allowed'
                      }`}
                      title={`+5 Cấp: 💰${formatNumber(cost5)}`}
                    >
                      +5
                    </button>

                    <button
                      id={`btn-upgrade-skill-max-${skill.id}`}
                      onClick={() => onUpgradeSkill(skill.id, maxData.count)}
                      disabled={!canAffordMax}
                      className={`py-1 px-1.5 rounded-lg font-bold text-[10px] transition-all active:scale-95 shrink-0 ${
                        canAffordMax
                          ? 'bg-amber-500 text-slate-950 font-black'
                          : 'bg-slate-800/80 text-slate-500 cursor-not-allowed'
                      }`}
                      title={`Tối đa (+${formatNumber(maxData.count)} cấp): 💰${formatNumber(maxData.totalCost)}`}
                    >
                      MAX
                    </button>
                  </div>
                ) : (
                  <div className="pt-1 text-center text-[10px] font-mono text-slate-600">
                    Mở tại Cấp {formatNumber(skill.unlockLevel)}
                  </div>
                )}
              </div>
            );
          })}
        </div>
      </div>
    </div>
  );
};

