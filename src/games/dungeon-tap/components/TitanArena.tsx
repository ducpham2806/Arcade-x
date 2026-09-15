import React from 'react';
import { TitanMonster, FloatingDamage, SlashEffect, DroppedLoot, StoryChapter, HeroAlly, ActiveSkill } from '../types';
import { Skull, ShieldAlert, Sparkles, Coins, Flame, Package, Lock, Zap, Swords } from 'lucide-react';
import { formatNumber } from '../utils/upgradeMath';

interface TitanArenaProps {
  monster: TitanMonster;
  stage: number;
  chapter: StoryChapter;
  isBossRushActive: boolean;
  bossTimer: number;
  onTapArena: (e: React.PointerEvent<HTMLDivElement>) => void;
  onFightBoss: () => void;
  onLeaveBoss: () => void;
  onLootClick: (loot: DroppedLoot) => void;
  floatingDamages: FloatingDamage[];
  slashes: SlashEffect[];
  loots: DroppedLoot[];
  heroLevel: number;
  heroSlashing: boolean;
  allies: HeroAlly[];
  alliesAttacking: boolean;
  onOpenAlliesTab?: () => void;
  bossToast?: string | null;
  autoPickup?: boolean;
  autoPickupToast?: { id: number; text: string; icon: string; rarityColor?: string } | null;
  onToggleAutoPickup?: () => void;
}

export const TitanArena: React.FC<TitanArenaProps> = ({
  monster,
  stage,
  chapter,
  bossTimer,
  onTapArena,
  onFightBoss,
  onLeaveBoss,
  onLootClick,
  floatingDamages,
  slashes,
  loots,
  heroLevel,
  heroSlashing,
  allies,
  alliesAttacking,
  onOpenAlliesTab,
  bossToast,
  autoPickup = true,
  autoPickupToast = null,
  onToggleAutoPickup,
}) => {
  const hpPercent = Math.max(0, Math.min(100, (monster.hp / monster.maxHp) * 100));
  const isBossStage = stage % 10 === 0;
  const stageInCycle = ((stage - 1) % 10) + 1; // 1 to 10

  const unlockedAllies = allies.filter((a) => a.unlocked);

  // Filter equipment and ally_equipment loots to display as clean chest, auto-limiting clutter
  const equipmentLoots = loots.filter((l) => l.type === 'equipment' || l.type === 'ally_equipment').slice(-1);
  // Gold loots limited to max 2 subtle floating coin particles
  const goldLoots = loots.filter((l) => l.type === 'gold').slice(-2);

  return (
    <div
      onPointerDown={onTapArena}
      className={`relative w-full h-[320px] sm:h-[360px] select-none touch-none overflow-hidden rounded-3xl flex flex-col justify-between p-3 border border-white/10 shadow-2xl transition-all duration-500 bg-gradient-to-b ${chapter.bgGradient}`}
    >
      {/* Subtle ambient lighting */}
      <div className="absolute inset-0 pointer-events-none bg-[radial-gradient(ellipse_at_center,_var(--tw-gradient-stops))] from-amber-500/10 via-transparent to-black/75" />

      {/* Top Section: Chapter Title, Stage Indicator, Boss Timer & Health */}
      <div className="relative z-10 w-full flex flex-col gap-1.5 pointer-events-none shrink-0">
        <div className="flex items-center justify-between text-xs px-1">
          <div className="flex items-center gap-1.5 font-bold text-amber-300 drop-shadow">
            <span>{chapter.badge}</span>
            <span className="truncate max-w-[150px] sm:max-w-[220px]">{chapter.name}</span>
          </div>

          <div className="flex items-center gap-1.5">
            {onToggleAutoPickup && (
              <button
                type="button"
                onClick={(e) => {
                  e.stopPropagation();
                  onToggleAutoPickup();
                }}
                title={autoPickup ? 'Tự động nhặt trang bị: Đang BẬT' : 'Tự động nhặt trang bị: Đang TẮT (bấm để bật)'}
                className={`flex items-center gap-1 px-2 py-0.5 rounded-full text-[10px] font-bold border transition-all active:scale-95 cursor-pointer pointer-events-auto ${
                  autoPickup
                    ? 'bg-emerald-950/80 text-emerald-300 border-emerald-500/60 shadow-sm'
                    : 'bg-slate-900/80 text-slate-400 border-slate-700 hover:text-slate-200'
                }`}
              >
                <Zap className={`w-3 h-3 ${autoPickup ? 'text-emerald-400 fill-emerald-400' : 'text-slate-500'}`} />
                <span>{autoPickup ? 'Tự Nhặt' : 'Thủ Công'}</span>
              </button>
            )}

            <div className="flex items-center gap-1.5 bg-black/60 backdrop-blur-md px-2.5 py-0.5 rounded-full border border-amber-500/30 text-amber-200 font-mono font-bold text-xs">
              <span>TẦNG {stage}</span>
              {isBossStage && <Skull className="w-3.5 h-3.5 text-rose-400 animate-pulse" />}
            </div>
          </div>
        </div>

        {/* 10-Stage Progress Bar (Clean & Compact) */}
        <div className="flex items-center justify-between gap-1 px-1 bg-black/50 backdrop-blur-sm rounded-lg p-1 border border-white/5">
          {Array.from({ length: 10 }).map((_, idx) => {
            const stepNum = idx + 1;
            const isCompleted = stepNum < stageInCycle;
            const isCurrent = stepNum === stageInCycle;
            const isBossDot = stepNum === 10;

            let dotColor = 'bg-slate-800 text-slate-500';
            if (isCompleted) dotColor = 'bg-amber-500/90 text-slate-950';
            if (isCurrent)
              dotColor = isBossDot
                ? 'bg-rose-500 text-white animate-bounce ring-2 ring-rose-400'
                : 'bg-yellow-400 text-slate-950 ring-2 ring-yellow-300';

            return (
              <div
                key={idx}
                className={`flex-1 h-2 sm:h-2.5 rounded flex items-center justify-center text-[8px] font-bold transition-all ${dotColor}`}
              >
                {isBossDot ? '💀' : isCurrent ? stepNum : ''}
              </div>
            );
          })}
        </div>

        {/* Boss Fight Timer / Retreat Button */}
        {monster.isBoss && (
          <div className="flex items-center justify-between px-1 pointer-events-auto">
            <div className="flex items-center gap-1.5 bg-rose-950/80 border border-rose-500/50 px-2.5 py-1 rounded-lg text-rose-200 text-xs font-bold shadow-md">
              <ShieldAlert className="w-3.5 h-3.5 text-rose-400 animate-spin" />
              <span>Thời Gian Trùm:</span>
              <span
                className={`font-mono text-sm ${
                  bossTimer <= 5 ? 'text-rose-400 animate-ping' : 'text-amber-300'
                }`}
              >
                {bossTimer}s
              </span>
            </div>

            <button
              onClick={(e) => {
                e.stopPropagation();
                onLeaveBoss();
              }}
              className="px-2.5 py-1 rounded-lg bg-slate-800/90 hover:bg-slate-700 text-slate-300 border border-slate-600 text-xs font-medium active:scale-95 transition-all shadow-md"
            >
              Rút lui farm
            </button>
          </div>
        )}

        {/* Fight Boss Button (Disabled if not boss stage, active if boss stage) */}
        {!monster.isBoss && (
          <div className="flex flex-col items-center pointer-events-auto py-0.5 space-y-1">
            {bossToast && (
              <div className="px-3 py-1 rounded-lg bg-rose-600 text-white text-xs font-bold shadow-xl animate-bounce border border-rose-300 z-20 max-w-xs text-center">
                {bossToast}
              </div>
            )}
            <button
              type="button"
              disabled={!isBossStage}
              onClick={(e) => {
                e.stopPropagation();
                if (!isBossStage) return;
                onFightBoss();
              }}
              title={
                isBossStage
                  ? `Khiêu chiến Boss Tầng ${stage}!`
                  : `Chưa đủ điều kiện: Cần đạt Tầng Boss (mốc ${Math.ceil(stage / 10) * 10 || 10}) để mở khóa`
              }
              className={`px-4 py-1.5 rounded-xl font-black text-xs uppercase tracking-wider shadow-lg border flex items-center gap-2 transition-all ${
                isBossStage
                  ? 'bg-gradient-to-r from-rose-600 via-amber-600 to-rose-600 hover:from-rose-500 hover:to-amber-500 text-white border-amber-300/40 animate-pulse cursor-pointer active:scale-95'
                  : 'bg-slate-900/80 border-slate-800 text-slate-500 opacity-50 cursor-not-allowed'
              }`}
            >
              {isBossStage ? <Skull className="w-4 h-4" /> : <Lock className="w-3.5 h-3.5" />}
              {isBossStage
                ? `Đấu Trùm Tầng ${stage} (Fight Boss)`
                : `Đấu Trùm (Mở ở Tầng ${Math.ceil(stage / 10) * 10 || 10})`}
            </button>
          </div>
        )}

        {/* Titan Monster Health Bar */}
        <div className="w-full bg-black/60 backdrop-blur-md px-2.5 py-1.5 rounded-xl border border-white/10">
          <div className="flex items-center justify-between text-xs mb-1 font-bold">
            <span
              className={`truncate max-w-[200px] ${
                monster.isBoss ? 'text-rose-300 font-extrabold' : 'text-slate-200'
              }`}
            >
              {monster.name}
            </span>
            <span className="font-mono text-amber-300 text-[11px]">
              {formatNumber(monster.hp)} / {formatNumber(monster.maxHp)} HP
            </span>
          </div>

          {/* Health Bar Track */}
          <div className="w-full h-3 bg-slate-900 rounded-full overflow-hidden border border-slate-700/80 relative">
            <div
              className={`h-full rounded-full transition-all duration-75 ${
                monster.isBoss
                  ? 'bg-gradient-to-r from-red-600 via-rose-500 to-amber-400'
                  : 'bg-gradient-to-r from-emerald-500 via-teal-400 to-cyan-400'
              }`}
              style={{ width: `${hpPercent}%` }}
            />
            <div className="absolute inset-0 flex items-center justify-center text-[9px] font-black text-white/90 drop-shadow">
              {Math.ceil(hpPercent)}%
            </div>
          </div>
        </div>
      </div>

      {/* Arena Center: Titan Monster (Spacious & Impressive) */}
      <div className="relative z-0 flex-1 flex flex-col items-center justify-center my-auto min-h-[110px]">
        {/* Monster Ambient Glow */}
        <div
          className={`absolute w-36 h-36 rounded-full blur-3xl transition-all duration-300 ${
            monster.isBoss ? 'bg-rose-600/30' : 'bg-cyan-600/20'
          }`}
        />

        {/* Titan Avatar Graphic */}
        <div
          className={`relative transition-transform duration-75 select-none ${
            monster.isBoss
              ? 'text-7xl sm:text-8xl scale-110 drop-shadow-[0_12px_24px_rgba(225,29,72,0.6)]'
              : 'text-6xl sm:text-7xl drop-shadow-[0_8px_16px_rgba(0,0,0,0.9)]'
          } ${heroSlashing ? 'scale-90 translate-y-1' : 'animate-[bounce_3s_infinite_ease-in-out]'}`}
        >
          {monster.avatar}

          {/* Titan Boss Crown */}
          {monster.isBoss && (
            <span className="absolute -top-3 left-1/2 -translate-x-1/2 text-2xl animate-spin">
              👑
            </span>
          )}
        </div>

        {/* Titan Floor Shadow */}
        <div className="w-24 h-3 bg-black/60 rounded-full blur-sm mt-2" />
      </div>

      {/* Clean Floating Damage Numbers (Max 4 items, quick fade) */}
      <div className="absolute inset-0 pointer-events-none overflow-hidden z-20">
        {floatingDamages.slice(-4).map((dmg) => (
          <div
            key={dmg.id}
            className="absolute font-black tracking-wider transition-all duration-300 animate-[fade-up_0.5s_ease-out_forwards]"
            style={{
              left: `${dmg.x}px`,
              top: `${dmg.y}px`,
              color: dmg.color,
              fontSize: dmg.isCrit ? '18px' : '14px',
              textShadow: dmg.isCrit
                ? '0 0 8px rgba(239,68,68,0.9), 0 1px 3px #000'
                : '0 1px 2px rgba(0,0,0,0.9)',
            }}
          >
            {dmg.text}
          </div>
        ))}
      </div>

      {/* Clean Slash Effect Trails (Max 2 trails) */}
      <div className="absolute inset-0 pointer-events-none z-20">
        {slashes.slice(-2).map((s) => (
          <div
            key={s.id}
            className="absolute h-0.5 rounded-full shadow-[0_0_8px_#fff] opacity-80"
            style={{
              left: `${s.x - 30}px`,
              top: `${s.y - 1}px`,
              width: '60px',
              transform: `rotate(${s.angle}deg)`,
              backgroundColor: s.color,
            }}
          />
        ))}
      </div>

      {/* Subtle Floating Gold Particle (Clean & non-intrusive) */}
      <div className="absolute inset-0 pointer-events-none z-25 overflow-hidden">
        {goldLoots.map((l) => (
          <div
            key={l.id}
            className="absolute flex items-center gap-1 font-mono font-bold text-xs text-yellow-300 drop-shadow animate-[fade-up_0.8s_ease-out_forwards]"
            style={{ left: `${l.x}px`, top: `${l.y}px` }}
          >
            <Coins className="w-3.5 h-3.5 text-yellow-400 fill-yellow-400 animate-spin" />
            <span>+{formatNumber(l.amount)}</span>
          </div>
        ))}
      </div>

      {/* Auto-Pickup Floating Toast Alert */}
      {autoPickupToast && (
        <div className="absolute top-24 left-1/2 -translate-x-1/2 z-40 pointer-events-none animate-bounce">
          <div className="flex items-center gap-2 px-3 py-1.5 rounded-xl bg-slate-950/90 border border-emerald-500/80 text-emerald-300 text-xs font-bold shadow-2xl shadow-emerald-950/80 backdrop-blur-md">
            <span className="text-base">{autoPickupToast.icon}</span>
            <span className="truncate max-w-[180px] sm:max-w-[240px] text-white">{autoPickupToast.text}</span>
            <span className="text-[9px] bg-emerald-900/80 text-emerald-300 border border-emerald-500/50 px-1.5 py-0.5 rounded font-mono uppercase tracking-wider shrink-0">
              ⚡ Đã Nhặt
            </span>
          </div>
        </div>
      )}

      {/* Equipment Drop (When Auto-Pickup is OFF: click to collect manually) */}
      {!autoPickup &&
        equipmentLoots.map((loot) => (
          <div
            key={loot.id}
            className="absolute bottom-20 left-3 z-30 pointer-events-auto"
          >
            <button
              onClick={(e) => {
                e.stopPropagation();
                onLootClick(loot);
              }}
              className="px-2.5 py-1.5 rounded-xl bg-gradient-to-r from-amber-600 to-yellow-600 hover:from-amber-500 hover:to-yellow-500 text-slate-950 font-bold text-xs border border-amber-300 shadow-lg shadow-amber-950/80 animate-bounce flex items-center gap-1.5 active:scale-95 transition-all"
            >
              <Package className="w-4 h-4 text-slate-950" />
              <span>Nhặt {loot.type === 'ally_equipment' ? loot.allyItem?.name : loot.item?.name}!</span>
            </button>
          </div>
        ))}

      {/* Battlefield Ground: Sword Master and Allies Line-Up (Bottom of Arena) */}
      <div className="relative z-10 w-full pt-1.5 pb-1 border-t border-white/10 bg-black/50 backdrop-blur-md rounded-2xl px-2.5 shrink-0">
        <div className="flex items-end justify-between gap-2 py-0.5">
          {/* Unlocked Hero Allies Standing in Battle Formation */}
          <div className="flex items-end gap-2.5 flex-1 min-w-0 overflow-x-auto no-scrollbar py-0.5 pr-1">
            {unlockedAllies.length > 0 ? (
              unlockedAllies.map((ally) => {
                const isSkillReadySoon = ally.skill && ally.skill.currentCooldown <= 1.0;
                const skillProgressPercent = ally.skill
                  ? Math.min(100, Math.max(0, ((ally.skill.cooldown - ally.skill.currentCooldown) / ally.skill.cooldown) * 100))
                  : 0;

                return (
                  <div
                    key={ally.id}
                    className="flex flex-col items-center pointer-events-auto group cursor-pointer shrink-0"
                    onClick={(e) => {
                      e.stopPropagation();
                      if (onOpenAlliesTab) onOpenAlliesTab();
                    }}
                  >
                    {/* Ally Character Figure with dynamic attack animation & skill glow */}
                    <div
                      className={`text-2xl sm:text-3xl transition-transform duration-100 select-none ${
                        isSkillReadySoon
                          ? 'animate-pulse drop-shadow-[0_0_12px_rgba(234,179,8,0.9)] scale-115'
                          : alliesAttacking
                          ? '-translate-y-1.5 scale-110 drop-shadow-[0_0_8px_rgba(168,85,247,0.7)]'
                          : 'translate-y-0 hover:scale-105'
                      }`}
                    >
                      {ally.avatar}
                    </div>

                    {/* Ally Level Badge */}
                    <div className="text-[9px] font-bold text-purple-300 bg-slate-950/90 px-1.5 py-0.5 rounded-full border border-purple-500/40 whitespace-nowrap mt-0.5 font-mono">
                      {ally.name.split(' ')[0]} Lv.{ally.level}
                    </div>

                    {/* Ally Auto-Skill Mini Cooldown Indicator */}
                    {ally.skill && (
                      <div
                        className="w-8 h-1 bg-slate-950 rounded-full overflow-hidden border border-purple-500/30 mt-0.5"
                        title={`${ally.skill.name}: Tự dùng mỗi ${ally.skill.cooldown}s`}
                      >
                        <div
                          className="h-full bg-gradient-to-r from-purple-400 to-amber-400 transition-all duration-300"
                          style={{ width: `${skillProgressPercent}%` }}
                        />
                      </div>
                    )}
                  </div>
                );
              })
            ) : (
              <div
                onClick={(e) => {
                  e.stopPropagation();
                  if (onOpenAlliesTab) onOpenAlliesTab();
                }}
                className="flex items-center gap-1 text-[10px] text-purple-300/80 bg-purple-950/40 border border-purple-500/30 px-2 py-1 rounded-lg cursor-pointer pointer-events-auto hover:bg-purple-900/50 shrink-0"
              >
                <span>👥</span>
                <span>+ Chiêu Mộ Đồng Đội</span>
              </div>
            )}
          </div>

          {/* Sword Master Hero (Front & Center, pinned on right) */}
          <div className="flex flex-col items-center shrink-0 pointer-events-none pl-2.5 border-l border-white/10">
            {/* Hero Figure with Slash animation */}
            <div
              className={`text-3xl sm:text-4xl transition-transform duration-75 select-none ${
                heroSlashing
                  ? '-translate-y-2 rotate-12 scale-110 drop-shadow-[0_0_10px_rgba(245,158,11,0.8)]'
                  : 'translate-y-0'
              }`}
            >
              🤺
            </div>

            {/* Hero Level Badge */}
            <div className="text-[10px] font-bold text-amber-300 bg-black/90 px-2 py-0.5 rounded-full border border-amber-500/50 shadow-sm font-mono mt-0.5 whitespace-nowrap">
              Kiếm Sĩ Lv.{heroLevel}
            </div>
          </div>
        </div>
      </div>
    </div>
  );
};
