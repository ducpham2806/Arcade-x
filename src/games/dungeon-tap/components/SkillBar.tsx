import React from 'react';
import { ActiveSkill } from '../types';
import { Zap, Sparkles } from 'lucide-react';
import { soundEngine } from '../../../services/audio';
import { hapticService } from '../../../services/haptics';

interface SkillBarProps {
  skills: ActiveSkill[];
  heroLevel: number;
  mana: number;
  maxMana: number;
  onCastSkill: (skillId: ActiveSkill['id']) => void;
  isBerserkActive?: boolean;
  isMidasActive?: boolean;
  isShadowCloneActive?: boolean;
  isWarCryActive?: boolean;
  isBladeStormActive?: boolean;
  isArmorBreakActive?: boolean;
}

export const SkillBar: React.FC<SkillBarProps> = ({
  skills,
  heroLevel,
  mana,
  maxMana,
  onCastSkill,
  isBerserkActive = false,
  isMidasActive = false,
  isShadowCloneActive = false,
  isWarCryActive = false,
  isBladeStormActive = false,
  isArmorBreakActive = false,
}) => {
  // Collect active buffs for clean horizontal pills
  const activeBuffs: { id: string; name: string; icon: string; duration: number; color: string; textColor?: string }[] = [];

  const berserkSkill = skills.find((s) => s.id === 'berserker_rage');
  if (isBerserkActive && berserkSkill && berserkSkill.activeRemaining > 0) {
    activeBuffs.push({
      id: 'berserk',
      name: 'Cuồng Nộ x3',
      icon: '🔥',
      duration: Math.ceil(berserkSkill.activeRemaining),
      color: '#ef4444',
      textColor: '#fca5a5',
    });
  }

  const midasSkill = skills.find((s) => s.id === 'hand_of_midas');
  if (isMidasActive && midasSkill && midasSkill.activeRemaining > 0) {
    activeBuffs.push({
      id: 'midas',
      name: 'Midas x5 Vàng',
      icon: '💰',
      duration: Math.ceil(midasSkill.activeRemaining),
      color: '#eab308',
      textColor: '#fef08a',
    });
  }

  const cloneSkill = skills.find((s) => s.id === 'shadow_clone');
  if (isShadowCloneActive && cloneSkill && cloneSkill.activeRemaining > 0) {
    activeBuffs.push({
      id: 'clone',
      name: 'Phân Thân',
      icon: '🗡️',
      duration: Math.ceil(cloneSkill.activeRemaining),
      color: '#a855f7',
      textColor: '#e9d5ff',
    });
  }

  const bladeStormSkill = skills.find((s) => s.id === 'blade_storm');
  if (isBladeStormActive && bladeStormSkill && bladeStormSkill.activeRemaining > 0) {
    activeBuffs.push({
      id: 'blade_storm',
      name: 'Bão Kiếm Trảm',
      icon: '🌪️',
      duration: Math.ceil(bladeStormSkill.activeRemaining),
      color: '#06b6d4',
      textColor: '#a5f3fc',
    });
  }

  const warCrySkill = skills.find((s) => s.id === 'war_cry');
  if (isWarCryActive && warCrySkill && warCrySkill.activeRemaining > 0) {
    activeBuffs.push({
      id: 'war_cry',
      name: 'Chiến Khải +150% DPS',
      icon: '🎺',
      duration: Math.ceil(warCrySkill.activeRemaining),
      color: '#f59e0b',
      textColor: '#fde68a',
    });
  }

  const radiantSkill = skills.find((s) => s.id === 'radiant_slash');
  if (isArmorBreakActive && radiantSkill && radiantSkill.activeRemaining > 0) {
    activeBuffs.push({
      id: 'armor_break',
      name: 'Phá Giáp Quái +50%',
      icon: '⚡⚔️',
      duration: Math.ceil(radiantSkill.activeRemaining),
      color: '#3b82f6',
      textColor: '#bfdbfe',
    });
  }

  const manaPercent = Math.min(100, Math.max(0, (mana / maxMana) * 100));

  return (
    <div className="w-full bg-[#0d1322] border border-cyan-500/30 rounded-2xl p-2.5 sm:p-3 shadow-xl shadow-black/60 flex flex-col gap-2">
      {/* Top Row: Mana Gauge & Active Buffs Indicator */}
      <div className="flex items-center justify-between gap-2 flex-wrap">
        {/* Mana Bar Gauge */}
        <div className="flex items-center gap-2 bg-black/50 border border-cyan-500/20 px-2.5 py-1 rounded-xl">
          <Zap className="w-4 h-4 text-cyan-400 fill-cyan-400 animate-pulse shrink-0" />
          <div className="flex flex-col">
            <div className="flex items-center justify-between text-[11px] font-mono font-bold leading-none gap-2">
              <span className="text-cyan-300">NĂNG LƯỢNG (MP)</span>
              <span className="text-white">
                {Math.floor(mana)}/{maxMana}
              </span>
            </div>
            <div className="w-28 sm:w-36 h-2 bg-slate-900 rounded-full overflow-hidden border border-cyan-500/30 mt-1">
              <div
                className="h-full bg-gradient-to-r from-cyan-500 to-blue-500 transition-all duration-150 rounded-full"
                style={{ width: `${manaPercent}%` }}
              />
            </div>
          </div>
        </div>

        {/* Active Buffs (Horizontal Row of Pills) */}
        {activeBuffs.length > 0 ? (
          <div className="flex items-center gap-1.5 overflow-x-auto no-scrollbar py-0.5 max-w-full">
            {activeBuffs.map((buff) => (
              <div
                key={buff.id}
                className="flex items-center gap-1 px-2 py-0.5 rounded-full text-[10px] font-bold border shadow-md whitespace-nowrap animate-pulse shrink-0"
                style={{
                  backgroundColor: `${buff.color}25`,
                  borderColor: buff.color,
                  color: buff.textColor || '#fff',
                }}
              >
                <span>{buff.icon}</span>
                <span>{buff.name}</span>
                <span className="font-mono font-black text-amber-300">({buff.duration}s)</span>
              </div>
            ))}
          </div>
        ) : (
          <div className="text-[11px] text-slate-400 italic hidden xs:block">
            ⚡ Bấm skill khi đủ MP để trảm quái & buff đội!
          </div>
        )}
      </div>

      {/* Main Skills Row: Large, Easy-to-Press Skill Buttons */}
      <div className="flex items-center gap-2 overflow-x-auto no-scrollbar py-1 px-0.5">
        {skills.map((skill) => {
          const isUnlocked = heroLevel >= skill.unlockLevel;
          const isOnCooldown = skill.currentCooldown > 0;
          const isActive = (skill.activeRemaining || 0) > 0;
          const canAfford = mana >= skill.manaCost;
          const isCastable = isUnlocked && !isOnCooldown && !isActive && canAfford;

          return (
            <button
              key={skill.id}
              type="button"
              disabled={!isCastable}
              onClick={() => {
                if (isCastable) {
                  try {
                    soundEngine.play('click');
                    hapticService.tap();
                  } catch {}
                  onCastSkill(skill.id);
                }
              }}
              title={`${skill.name} (${skill.manaCost} MP): ${skill.description}`}
              className={`relative flex flex-col items-center justify-center rounded-2xl border transition-all shrink-0 cursor-pointer select-none active:scale-90 ${
                // Size: Large and easily touchable
                'w-14 h-14 sm:w-16 sm:h-16'
              } ${
                isActive
                  ? 'bg-amber-500/25 border-amber-400 ring-2 ring-amber-400 shadow-lg shadow-amber-500/40 animate-pulse'
                  : isCastable
                  ? 'bg-gradient-to-b from-slate-800 to-slate-950 hover:from-cyan-900/60 hover:to-slate-900 border-cyan-400/80 shadow-lg shadow-cyan-950/60 cursor-pointer ring-1 ring-cyan-400/50 hover:scale-105'
                  : 'bg-slate-950/80 border-slate-800 text-slate-500 opacity-60 cursor-not-allowed'
              }`}
            >
              {/* Skill Icon */}
              <span className="text-xl sm:text-2xl leading-none select-none drop-shadow">
                {skill.icon}
              </span>

              {/* Skill Name */}
              <span className="text-[9px] sm:text-[10px] font-bold text-slate-200 truncate max-w-[50px] sm:max-w-[58px] leading-tight mt-0.5">
                {skill.name}
              </span>

              {/* Mana Cost Badge */}
              {isUnlocked && !isOnCooldown && !isActive && (
                <span className="absolute -bottom-1.5 px-1.5 py-0.2 rounded-full bg-cyan-950 text-[8px] sm:text-[9px] font-mono font-bold text-cyan-300 border border-cyan-500/60 shadow-sm leading-tight">
                  {skill.manaCost} MP
                </span>
              )}

              {/* Active Timer Overlay */}
              {isActive && (
                <div className="absolute inset-0 bg-amber-950/80 backdrop-blur-[1px] rounded-2xl flex flex-col items-center justify-center">
                  <span className="text-[9px] text-amber-300 font-bold uppercase">Đang Dùng</span>
                  <span className="font-mono font-black text-amber-300 text-sm">
                    {Math.ceil(skill.activeRemaining)}s
                  </span>
                </div>
              )}

              {/* Cooldown Overlay */}
              {isOnCooldown && !isActive && (
                <div className="absolute inset-0 bg-black/85 backdrop-blur-[1px] rounded-2xl flex flex-col items-center justify-center">
                  <span className="font-mono font-black text-amber-400 text-base drop-shadow">
                    {Math.ceil(skill.currentCooldown)}s
                  </span>
                </div>
              )}

              {/* Locked State Overlay */}
              {!isUnlocked && (
                <div className="absolute inset-0 bg-slate-950/90 rounded-2xl flex flex-col items-center justify-center">
                  <span className="text-[10px]">🔒</span>
                  <span className="text-[8px] font-mono text-slate-400 font-bold">
                    Lv.{skill.unlockLevel}
                  </span>
                </div>
              )}
            </button>
          );
        })}
      </div>
    </div>
  );
};

