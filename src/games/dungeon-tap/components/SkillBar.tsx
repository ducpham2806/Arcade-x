import React from 'react';
import { ActiveSkill } from '../types';
import { Zap } from 'lucide-react';

interface SkillBarProps {
  skills: ActiveSkill[];
  mana: number;
  maxMana: number;
  heroLevel: number;
  onCastSkill: (skillId: ActiveSkill['id']) => void;
}

export const SkillBar: React.FC<SkillBarProps> = ({
  skills,
  mana,
  maxMana,
  heroLevel,
  onCastSkill,
}) => {
  const manaPercent = Math.min(100, Math.max(0, (mana / maxMana) * 100));

  return (
    <div className="w-full flex flex-col gap-1 bg-slate-900/90 border border-slate-700/80 rounded-xl p-2 shadow-lg">
      {/* Mana Bar */}
      <div className="flex items-center justify-between text-xs px-1">
        <div className="flex items-center gap-1 text-cyan-400 font-bold">
          <Zap className="w-3.5 h-3.5 fill-cyan-400" />
          <span>Mana:</span>
        </div>
        <span className="font-mono text-cyan-200 text-[11px]">
          {Math.floor(mana)} / {maxMana}
        </span>
      </div>

      <div className="w-full h-2 bg-slate-950 rounded-full overflow-hidden border border-cyan-900/50 p-0.5">
        <div
          className="h-full bg-gradient-to-r from-cyan-500 to-blue-500 rounded-full transition-all duration-300"
          style={{ width: `${manaPercent}%` }}
        />
      </div>

      {/* 4 Skill Buttons in a Row */}
      <div className="grid grid-cols-4 gap-1.5 mt-1">
        {skills.map((skill) => {
          const isUnlocked = heroLevel >= skill.unlockLevel;
          const isOnCooldown = skill.currentCooldown > 0;
          const isActive = skill.activeRemaining > 0;
          const hasEnoughMana = mana >= skill.manaCost;
          const canCast = isUnlocked && !isOnCooldown && !isActive && hasEnoughMana;

          return (
            <button
              key={skill.id}
              onClick={() => onCastSkill(skill.id)}
              disabled={!canCast}
              className={`relative overflow-hidden flex flex-col items-center justify-center p-1.5 rounded-xl border transition-all text-center select-none active:scale-95 ${
                isActive
                  ? 'bg-amber-500/30 border-amber-400 ring-2 ring-amber-400 animate-pulse text-amber-200'
                  : isOnCooldown
                  ? 'bg-slate-950/80 border-slate-800 text-slate-500 cursor-not-allowed opacity-75'
                  : !isUnlocked
                  ? 'bg-slate-950/60 border-slate-800 text-slate-600 cursor-not-allowed'
                  : !hasEnoughMana
                  ? 'bg-slate-900 border-cyan-950 text-cyan-700 cursor-not-allowed'
                  : 'bg-gradient-to-b from-slate-800 to-slate-900 border-cyan-500/50 hover:border-cyan-400 text-white shadow-md shadow-cyan-950/50 hover:from-slate-700 hover:to-slate-800'
              }`}
            >
              {/* Skill Icon */}
              <span className="text-xl sm:text-2xl leading-none drop-shadow">{skill.icon}</span>

              {/* Skill Level Badge */}
              {isUnlocked && (
                <span className="absolute top-1 right-1 text-[8px] font-bold font-mono px-1 rounded bg-cyan-950/90 text-cyan-300 border border-cyan-500/40">
                  Lv.{skill.level}
                </span>
              )}

              {/* Skill Name */}
              <span className="text-[10px] font-black tracking-tight truncate w-full mt-0.5">
                {skill.name}
              </span>

              {/* Status / Mana or Timer */}
              <div className="text-[9px] font-mono leading-none mt-0.5">
                {isActive ? (
                  <span className="text-amber-300 font-bold">{Math.ceil(skill.activeRemaining)}s</span>
                ) : isOnCooldown ? (
                  <span className="text-rose-400 font-bold">{Math.ceil(skill.currentCooldown)}s</span>
                ) : !isUnlocked ? (
                  <span className="text-slate-500">Lv.{skill.unlockLevel}</span>
                ) : (
                  <span className="text-cyan-300 font-bold">{skill.manaCost} MP</span>
                )}
              </div>

              {/* Cooldown Overlay */}
              {isOnCooldown && (
                <div
                  className="absolute inset-0 bg-black/75 rounded-xl flex items-center justify-center font-mono font-black text-xs text-rose-300 pointer-events-none"
                >
                  {Math.ceil(skill.currentCooldown)}s
                </div>
              )}
            </button>
          );
        })}
      </div>
    </div>
  );
};
