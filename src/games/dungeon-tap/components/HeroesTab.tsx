import React, { useState } from 'react';
import { HeroAlly, AllyEquipSlot } from '../types';
import { Sparkles, ChevronUp, Award, Zap, Shield, Swords, ArrowRight } from 'lucide-react';
import {
  calculateAllyUpgradeCost,
  calculateMaxAllyLevels,
  getAllyMilestoneData,
  getAllySkillEffect,
  formatNumber,
} from '../utils/upgradeMath';
import { RARITY_CONFIG } from '../equipmentData';
import { PROFESSION_METAS } from '../allyEquipmentData';

interface HeroesTabProps {
  allies: HeroAlly[];
  gold: number;
  totalHeroDps: number;
  onUpgradeAlly: (allyId: string, count?: number) => void;
  onUpgradeAllyEquipment?: (allyId: string, slot: AllyEquipSlot) => void;
  onOpenAllyEquipment?: () => void;
}

export const HeroesTab: React.FC<HeroesTabProps> = ({
  allies,
  gold,
  totalHeroDps,
  onUpgradeAlly,
  onUpgradeAllyEquipment,
  onOpenAllyEquipment,
}) => {
  const [multiplier, setMultiplier] = useState<number | 'max'>(1);

  return (
    <div className="flex flex-col gap-3 p-3 text-slate-200">
      {/* Total Hero DPS Header */}
      <div className="flex items-center justify-between bg-slate-900/90 border border-purple-500/30 p-3 rounded-2xl shadow-lg gap-2">
        <div className="flex items-center gap-2.5 min-w-0 flex-1">
          <div className="text-3xl p-2 bg-black/50 rounded-xl border border-purple-500/30 shrink-0">
            👥
          </div>
          <div className="min-w-0 flex-1">
            <h3 className="text-sm sm:text-base font-black text-purple-300 truncate">
              Đội Hình Anh Hùng Đồng Đội
            </h3>
            <div className="text-xs text-slate-400 flex items-center gap-1.5 mt-0.5">
              <Sparkles className="w-3.5 h-3.5 text-purple-400 shrink-0" />
              <span className="shrink-0">Tổng Tự Động DPS:</span>
              <span className="font-mono font-bold text-purple-300 text-sm">
                {formatNumber(totalHeroDps)} / s
              </span>
            </div>
          </div>
        </div>

        {onOpenAllyEquipment && (
          <button
            id="btn-open-ally-equipment-header"
            onClick={onOpenAllyEquipment}
            className="px-2.5 py-1.5 rounded-xl text-[11px] font-bold bg-purple-950/80 hover:bg-purple-900/90 text-purple-300 border border-purple-700/50 flex items-center gap-1 shadow-sm shrink-0"
          >
            <Shield className="w-3.5 h-3.5 text-purple-400" />
            <span>KHO TRANG BỊ</span>
            <ArrowRight className="w-3 h-3" />
          </button>
        )}
      </div>

      {/* Accurate Upgrade Multipliers Bar (+1, +5, +10, +15, +20, MAX) */}
      <div className="flex flex-col gap-1.5 bg-slate-900/60 border border-white/5 p-2.5 rounded-xl">
        <div className="flex items-center justify-between text-xs text-slate-400 px-0.5">
          <span className="font-semibold text-[11px] text-slate-300">Mức tăng cấp đồng đội:</span>
          <span className="text-[10px] font-mono text-purple-400">
            {multiplier === 'max' ? 'Nâng cấp Tối Đa (MAX)' : `+${multiplier} Cấp mỗi lần nhấn`}
          </span>
        </div>

        <div className="grid grid-cols-6 gap-1">
          {([1, 5, 10, 15, 20, 'max'] as const).map((m) => {
            const isSelected = multiplier === m;
            return (
              <button
                key={m}
                onClick={() => setMultiplier(m)}
                className={`py-1.5 px-1 rounded-lg text-center font-mono text-[11px] font-bold border transition-all ${
                  isSelected
                    ? 'bg-purple-600 text-white border-purple-400 shadow-md shadow-purple-500/20 ring-1 ring-purple-300'
                    : 'bg-slate-800 hover:bg-slate-700 text-purple-300 border-purple-500/30'
                }`}
              >
                {m === 'max' ? 'MAX' : `+${m}`}
              </button>
            );
          })}
        </div>
      </div>

      {/* Allies List */}
      <div className="flex flex-col gap-3">
        {allies.map((ally) => {
          let countToUpgrade = 1;
          let cost = 0;
          let canAfford = false;

          if (!ally.unlocked) {
            countToUpgrade = 1;
            cost = ally.upgradeCost;
            canAfford = gold >= cost;
          } else if (multiplier === 'max') {
            const maxData = calculateMaxAllyLevels(ally.baseCost, ally.level, gold);
            countToUpgrade = maxData.count;
            cost = maxData.totalCost;
            canAfford = countToUpgrade > 0 && gold >= cost && cost > 0;
          } else {
            countToUpgrade = multiplier;
            cost = calculateAllyUpgradeCost(ally.baseCost, ally.level, countToUpgrade);
            canAfford = gold >= cost;
          }

          const milestone = getAllyMilestoneData(ally.level);
          const profMeta = PROFESSION_METAS[ally.profession] || {
            name: ally.professionName,
            icon: ally.professionIcon,
            weaponSlotName: 'Vũ Khí',
            armorSlotName: 'Giáp',
            accessorySlotName: 'Phụ Kiện',
            weaponIcon: '⚔️',
            armorIcon: '🛡️',
            accessoryIcon: '💍',
          };

          const skill = ally.skill;
          const skillEffect = skill
            ? getAllySkillEffect(skill.baseMultiplier, skill.level, skill.effectType)
            : null;

          const weapon = ally.equippedWeapon;
          const armor = ally.equippedArmor;
          const accessory = ally.equippedAccessory;
          const weaponCanUpgrade = weapon && gold >= weapon.upgradeCost;
          const armorCanUpgrade = armor && gold >= armor.upgradeCost;
          const accessoryCanUpgrade = accessory && gold >= accessory.upgradeCost;
          const allySkills = ally.skills || (ally.skill ? [ally.skill] : []);

          return (
            <div
              key={ally.id}
              className={`flex flex-col gap-2.5 p-3 rounded-2xl border transition-all ${
                ally.unlocked
                  ? 'bg-slate-900/90 border-purple-500/40 text-slate-200 shadow-sm'
                  : 'bg-slate-950/70 border-slate-800 text-slate-400'
              }`}
            >
              {/* Ally Header & Level Up Button */}
              <div className="flex items-center justify-between gap-2">
                <div className="flex items-center gap-2.5 min-w-0 flex-1">
                  <div className="text-3xl p-1.5 bg-black/40 rounded-xl border border-white/5 shrink-0">
                    {ally.avatar}
                  </div>
                  <div className="min-w-0 flex-1">
                    <div className="flex items-center gap-1.5 flex-wrap">
                      <span className="font-bold text-xs text-slate-100 truncate">{ally.name}</span>
                      <span className="text-[10px] bg-indigo-950/90 text-indigo-300 border border-indigo-700/50 px-1.5 py-0.2 rounded font-medium flex items-center gap-1">
                        <span>{profMeta.icon}</span>
                        <span>{profMeta.name}</span>
                      </span>
                      <span className="text-[10px] bg-purple-950 text-purple-300 border border-purple-700/50 px-1.5 py-0.2 rounded font-mono font-bold shrink-0">
                        {ally.unlocked ? `Lv.${ally.level}` : 'Chưa Chiêu Mộ'}
                      </span>
                    </div>
                    <div className="text-[11px] text-purple-300 font-mono font-bold mt-0.5">
                      DPS: {formatNumber(ally.currentDmg)} / s
                    </div>
                  </div>
                </div>

                {/* Upgrade / Hire Button */}
                <button
                  id={`btn-upgrade-ally-${ally.id}`}
                  onClick={() => onUpgradeAlly(ally.id, countToUpgrade)}
                  disabled={!canAfford}
                  className={`px-3 sm:px-3.5 py-2 rounded-xl font-bold text-xs flex flex-col items-center justify-center gap-0.5 active:scale-95 transition-all shadow-md shrink-0 ${
                    canAfford
                      ? 'bg-gradient-to-r from-purple-600 to-indigo-600 hover:from-purple-500 hover:to-indigo-500 text-white shadow-purple-900/40'
                      : 'bg-slate-800 text-slate-500 cursor-not-allowed border border-slate-700'
                  }`}
                >
                  <div className="flex items-center gap-1 text-[11px] whitespace-nowrap">
                    <ChevronUp className="w-3.5 h-3.5" />
                    <span>{ally.unlocked ? `TĂNG CẤP +${countToUpgrade}` : 'CHIÊU MỘ'}</span>
                  </div>
                  <span className="font-mono text-[10px] font-bold">
                    💰 {formatNumber(cost)}
                  </span>
                </button>
              </div>

              {/* Requirement: 3 Rotating Skills for Companion */}
              <div className="bg-slate-950/80 border border-indigo-950/80 rounded-xl p-2.5 flex flex-col gap-2">
                <div className="flex items-center justify-between">
                  <div className="flex items-center gap-1.5 text-xs font-bold text-indigo-300">
                    <Zap className="w-3.5 h-3.5 text-amber-400" />
                    <span>Bộ 3 Kỹ Năng Luân Phiên (Tự Động)</span>
                  </div>
                  {ally.unlocked && (
                    <span className="text-[10px] text-slate-400 font-mono">
                      Hồi: <strong className="text-amber-300">{Math.ceil(skill?.currentCooldown || 0)}s</strong>
                    </span>
                  )}
                </div>

                {/* 3 Skills List */}
                <div className="grid grid-cols-1 sm:grid-cols-3 gap-1.5">
                  {allySkills.map((sk, idx) => {
                    const isCurrent = ally.currentSkillIndex === idx || (!ally.currentSkillIndex && idx === 0);
                    const effect = getAllySkillEffect(sk.baseMultiplier, sk.level || 1, sk.effectType);

                    return (
                      <div
                        key={sk.id}
                        className={`p-1.5 rounded-lg border text-[11px] flex flex-col justify-between transition-all ${
                          isCurrent && ally.unlocked
                            ? 'bg-indigo-950/70 border-indigo-400/80 shadow-sm ring-1 ring-indigo-400/40'
                            : 'bg-slate-900/60 border-slate-800/80 opacity-75'
                        }`}
                      >
                        <div className="flex items-center justify-between gap-1">
                          <div className="flex items-center gap-1 truncate font-bold text-indigo-200">
                            <span>{sk.icon}</span>
                            <span className="truncate">{sk.name}</span>
                          </div>
                          {isCurrent && ally.unlocked && (
                            <span className="text-[8px] font-black bg-indigo-500 text-slate-950 px-1 rounded uppercase shrink-0">
                              Đang dùng
                            </span>
                          )}
                        </div>
                        <div className="text-[10px] text-amber-200/90 font-medium truncate mt-0.5">
                          {effect.label}
                        </div>
                        <div className="text-[9px] text-slate-400 font-mono mt-0.5">
                          Hồi: {sk.cooldown}s • Lv.{sk.level || 1}
                        </div>
                      </div>
                    );
                  })}
                </div>

                {/* Cooldown progress bar for current active skill */}
                {ally.unlocked && skill && (
                  <div className="w-full h-1.5 bg-slate-900 rounded-full overflow-hidden border border-slate-800">
                    <div
                      className="h-full bg-gradient-to-r from-indigo-500 via-purple-500 to-amber-400 transition-all duration-300 rounded-full"
                      style={{
                        width: `${Math.max(
                          0,
                          Math.min(100, ((skill.cooldown - skill.currentCooldown) / skill.cooldown) * 100)
                        )}%`,
                      }}
                    />
                  </div>
                )}
              </div>

              {/* Requirement 4: 3 Equipment Slots (Weapon, Armor, Accessory) */}
              <div className="grid grid-cols-1 sm:grid-cols-3 gap-2 mt-0.5">
                {/* Slot 1: Weapon */}
                <div className="bg-slate-950/70 border border-slate-800 rounded-xl p-2 flex flex-col justify-between gap-1">
                  <div className="flex items-center gap-1.5 min-w-0">
                    <span className="text-lg shrink-0">{weapon?.icon || profMeta.weaponIcon}</span>
                    <div className="min-w-0 flex-1">
                      <div className="text-[11px] font-bold text-slate-200 truncate">
                        {weapon?.name || profMeta.weaponSlotName}
                      </div>
                      <div className="text-[10px] font-mono text-purple-300 truncate">
                        {weapon ? `+${weapon.dpsBonusPercent}% DPS • +${weapon.skillBonusPercent}% Skill` : 'Chưa có'}
                      </div>
                    </div>
                  </div>

                  {weapon && ally.unlocked && onUpgradeAllyEquipment && (
                    <div className="flex items-center justify-between pt-1 border-t border-slate-800/80 text-[10px]">
                      <span className="text-slate-400 font-mono">Lv.{weapon.level}</span>
                      <button
                        id={`btn-upg-gear-wpn-${ally.id}`}
                        onClick={() => onUpgradeAllyEquipment(ally.id, 'ally_weapon')}
                        disabled={!weaponCanUpgrade}
                        className={`px-2 py-0.5 rounded font-bold transition-all ${
                          weaponCanUpgrade
                            ? 'bg-purple-600 hover:bg-purple-500 text-white shadow-sm'
                            : 'bg-slate-800 text-slate-500 cursor-not-allowed'
                        }`}
                      >
                        Cường hóa (💰{formatNumber(weapon.upgradeCost)})
                      </button>
                    </div>
                  )}
                </div>

                {/* Slot 2: Armor */}
                <div className="bg-slate-950/70 border border-slate-800 rounded-xl p-2 flex flex-col justify-between gap-1">
                  <div className="flex items-center gap-1.5 min-w-0">
                    <span className="text-lg shrink-0">{armor?.icon || profMeta.armorIcon}</span>
                    <div className="min-w-0 flex-1">
                      <div className="text-[11px] font-bold text-slate-200 truncate">
                        {armor?.name || profMeta.armorSlotName}
                      </div>
                      <div className="text-[10px] font-mono text-cyan-300 truncate">
                        {armor ? `+${armor.dpsBonusPercent}% DPS • -${armor.cooldownReductionSec}s Hồi` : 'Chưa có'}
                      </div>
                    </div>
                  </div>

                  {armor && ally.unlocked && onUpgradeAllyEquipment && (
                    <div className="flex items-center justify-between pt-1 border-t border-slate-800/80 text-[10px]">
                      <span className="text-slate-400 font-mono">Lv.{armor.level}</span>
                      <button
                        id={`btn-upg-gear-arm-${ally.id}`}
                        onClick={() => onUpgradeAllyEquipment(ally.id, 'ally_armor')}
                        disabled={!armorCanUpgrade}
                        className={`px-2 py-0.5 rounded font-bold transition-all ${
                          armorCanUpgrade
                            ? 'bg-purple-600 hover:bg-purple-500 text-white shadow-sm'
                            : 'bg-slate-800 text-slate-500 cursor-not-allowed'
                        }`}
                      >
                        Cường hóa (💰{formatNumber(armor.upgradeCost)})
                      </button>
                    </div>
                  )}
                </div>

                {/* Slot 3: Accessory */}
                <div className="bg-slate-950/70 border border-slate-800 rounded-xl p-2 flex flex-col justify-between gap-1">
                  <div className="flex items-center gap-1.5 min-w-0">
                    <span className="text-lg shrink-0">{accessory?.icon || profMeta.accessoryIcon}</span>
                    <div className="min-w-0 flex-1">
                      <div className="text-[11px] font-bold text-slate-200 truncate">
                        {accessory?.name || profMeta.accessorySlotName}
                      </div>
                      <div className="text-[10px] font-mono text-emerald-300 truncate">
                        {accessory ? `+${accessory.dpsBonusPercent}% DPS • +${accessory.teamBuffBonusPercent}% Đội` : 'Chưa có'}
                      </div>
                    </div>
                  </div>

                  {accessory && ally.unlocked && onUpgradeAllyEquipment && (
                    <div className="flex items-center justify-between pt-1 border-t border-slate-800/80 text-[10px]">
                      <span className="text-slate-400 font-mono">Lv.{accessory.level}</span>
                      <button
                        id={`btn-upg-gear-acc-${ally.id}`}
                        onClick={() => onUpgradeAllyEquipment(ally.id, 'ally_accessory')}
                        disabled={!accessoryCanUpgrade}
                        className={`px-2 py-0.5 rounded font-bold transition-all ${
                          accessoryCanUpgrade
                            ? 'bg-purple-600 hover:bg-purple-500 text-white shadow-sm'
                            : 'bg-slate-800 text-slate-500 cursor-not-allowed'
                        }`}
                      >
                        Cường hóa (💰{formatNumber(accessory.upgradeCost)})
                      </button>
                    </div>
                  )}
                </div>
              </div>

              {/* Milestone Indicator for unlocked allies */}
              {ally.unlocked && (
                <div className="flex items-center justify-between text-[10px] text-slate-400 border-t border-white/5 pt-1.5">
                  <div className="flex items-center gap-1 text-purple-300 font-medium truncate">
                    <Award className="w-3 h-3 text-purple-400 shrink-0" />
                    <span className="truncate">Mốc đột phá: Lv.{milestone.nextMilestone} (+60% DPS)</span>
                  </div>
                  <span className="font-mono text-slate-400 shrink-0 ml-1">
                    Thưởng: x{formatNumber(milestone.multiplier)}
                  </span>
                </div>
              )}
            </div>
          );
        })}
      </div>
    </div>
  );
};
