import { MonsterArt } from '../../../visuals/MonsterArt';
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
      className={`arcade-battle-scene relative w-full h-[340px] sm:h-[380px] select-none touch-none overflow-hidden rounded-3xl flex flex-col justify-between p-3 border border-white/10 shadow-2xl transition-all duration-500 bg-gradient-to-b ${chapter.bgGradient}`}
    >
      <svg className="absolute inset-0 w-full h-full pointer-events-none" viewBox="0 0 600 380" preserveAspectRatio="xMidYMid slice" aria-hidden="true">
        <path d="M0 380V0H112V290H160V30H205V290H395V30H440V290H488V0H600V380Z" fill="#080d1b" opacity=".5"/>
        <path d="M205 290V140Q205 42 300 42Q395 42 395 140V290" fill="none" stroke="#c2a37a" strokeOpacity=".17" strokeWidth="13"/>
        <path d="M0 315H600M0 355H600M90 290L35 380M230 290L210 380M370 290L390 380M510 290L565 380" stroke="#d5b48a" strokeOpacity=".12" strokeWidth="2"/>
        <ellipse cx="300" cy="308" rx="120" ry="22" fill="#f7ac53" opacity=".06"/>
        <path d="M98 95V242M502 95V242" stroke="#ffd69a" strokeOpacity=".22" strokeWidth="3"/>
      </svg>
      {/* Subtle ambient lighting */}
      <div className="absolute inset-0 pointer-events-none bg-[radial-gradient(ellipse_at_center,_var(--tw-gradient-stops))] from-amber-500/10 via-transparent to-black/75" />

      {/* Top Section: Integrated Ultra-Compact HUD for Monster HP & Stage Progress */}
      <div className="relative z-10 w-full flex flex-col gap-1 pointer-events-none shrink-0">
        {/* Row 1: Monster Name, Boss Controls & HP stats */}
        <div className="flex items-center justify-between gap-2 px-1">
          {/* Monster Name & Type */}
          <div className="flex items-center gap-1.5 min-w-0">
            <span className="text-sm shrink-0">{monster.isBoss ? '👑' : chapter.badge}</span>
            <span
              className={`text-xs sm:text-sm font-black truncate drop-shadow ${
                monster.isBoss ? 'text-rose-400 font-extrabold animate-pulse' : 'text-slate-100'
              }`}
            >
              {monster.name}
            </span>
            {monster.isBoss && (
              <span className="text-[9px] bg-rose-950/90 text-rose-300 border border-rose-500/60 px-1.5 py-0.2 rounded font-black uppercase tracking-wider shrink-0">
                TRÙM TẦNG {formatNumber(stage)}
              </span>
            )}
          </div>

          {/* Right: Boss Countdown / Challenge Action & HP Numbers */}
          <div className="flex items-center gap-1.5 shrink-0">
            {/* Boss Fight Timer / Retreat */}
            {monster.isBoss && (
              <div className="flex items-center gap-1 pointer-events-auto">
                <span
                  className={`font-mono text-xs font-bold px-1.5 py-0.5 rounded bg-rose-950/90 border border-rose-500/50 ${
                    bossTimer <= 5 ? 'text-rose-400 animate-ping' : 'text-amber-300'
                  }`}
                >
                  ⏱️ {bossTimer}s
                </span>
                <button
                  type="button"
                  onClick={(e) => {
                    e.stopPropagation();
                    onLeaveBoss();
                  }}
                  className="px-1.5 py-0.5 rounded bg-slate-800/90 hover:bg-slate-700 text-slate-300 border border-slate-600 text-[10px] font-medium active:scale-95 transition-all shadow"
                >
                  Rút lui
                </button>
              </div>
            )}

            {/* If Boss Stage & Not in Boss Fight -> Compact Glowing Boss Trigger Button */}
            {!monster.isBoss && isBossStage && (
              <div className="pointer-events-auto">
                <button
                  type="button"
                  onClick={(e) => {
                    e.stopPropagation();
                    onFightBoss();
                  }}
                  className="px-2.5 py-0.5 rounded-full font-black text-[10px] uppercase tracking-wider bg-gradient-to-r from-rose-600 to-amber-600 hover:from-rose-500 hover:to-amber-500 text-white border border-amber-300/60 shadow-lg shadow-rose-950/60 animate-pulse active:scale-95 cursor-pointer flex items-center gap-1"
                >
                  <Skull className="w-3 h-3 text-white" />
                  <span>Đấu Trùm</span>
                </button>
              </div>
            )}

            {/* HP Value */}
            <div className="flex items-center gap-1 bg-black/60 backdrop-blur-md px-2 py-0.5 rounded-full border border-white/10 text-amber-300 font-mono font-bold text-[11px] sm:text-xs">
              <span>{formatNumber(monster.hp)}</span>
              <span className="text-slate-500 font-normal">/</span>
              <span className="text-slate-400">{formatNumber(monster.maxHp)}</span>
              <span className="text-[10px] text-amber-400/90 font-sans font-black ml-0.5">({Math.ceil(hpPercent)}%)</span>
            </div>
          </div>
        </div>

        {/* Row 2: Slim Monster Health Bar */}
        <div className="w-full h-2 sm:h-2.5 bg-black/80 rounded-full overflow-hidden border border-white/10 relative shadow-inner">
          <div
            className={`h-full rounded-full transition-all duration-75 ${
              monster.isBoss
                ? 'bg-gradient-to-r from-red-600 via-rose-500 to-amber-400'
                : 'bg-gradient-to-r from-emerald-500 via-teal-400 to-cyan-400'
            }`}
            style={{ width: `${hpPercent}%` }}
          />
        </div>

        {/* Row 3: Ultra-Slim Segmented 10-Stage Progress Line (Zero Clutter) */}
        <div className="flex items-center gap-1 px-0.5">
          {Array.from({ length: 10 }).map((_, idx) => {
            const stepNum = idx + 1;
            const isCompleted = stepNum < stageInCycle;
            const isCurrent = stepNum === stageInCycle;
            const isBossDot = stepNum === 10;

            let barColor = 'bg-white/10';
            if (isCompleted) barColor = 'bg-amber-500/80';
            if (isCurrent) barColor = isBossDot ? 'bg-rose-500 ring-1 ring-rose-300 animate-pulse' : 'bg-yellow-400 ring-1 ring-yellow-300';

            return (
              <div
                key={idx}
                className={`flex-1 h-1 rounded-full transition-all ${barColor}`}
                title={`Tầng ${stage - stageInCycle + stepNum} ${isBossDot ? '(Trùm)' : ''}`}
              />
            );
          })}
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
          <MonsterArt avatar={monster.avatar} boss={monster.isBoss}/>

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
                      {ally.name.split(' ')[0]} Lv.{formatNumber(ally.level)}
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
              Kiếm Sĩ Lv.{formatNumber(heroLevel)}
            </div>
          </div>
        </div>
      </div>
    </div>
  );
};
