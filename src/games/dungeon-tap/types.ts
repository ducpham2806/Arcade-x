export type EquipmentSlot = 'weapon' | 'armor' | 'helmet' | 'cloak' | 'ring';
export type ItemRarity = 'common' | 'rare' | 'epic' | 'legendary';

export interface EquipmentItem {
  id: string;
  name: string;
  slot: EquipmentSlot;
  rarity: ItemRarity;
  level: number;
  tapDmgBonus: number;     // e.g. +35% Tap Damage
  heroDmgBonus: number;    // e.g. +20% Hero DPS
  critRateBonus: number;   // e.g. +5% Crit Chance
  goldBonus: number;       // e.g. +15% Gold Drop
  icon: string;
  description: string;
  sellValue: number;
  upgradeCost: number;
  baseLevelStats?: {
    tapDmgBonus: number;
    heroDmgBonus: number;
    critRateBonus: number;
    goldBonus: number;
  };
}

export interface TitanMonster {
  id: string;
  name: string;
  title: string;
  avatar: string;
  level: number;
  stage: number;
  hp: number;
  maxHp: number;
  attackPower: number;     // damage to hero when timer expires or attacks
  goldReward: number;
  isBoss: boolean;
  isChestTitan?: boolean;
  timeRemaining: number;   // For boss: 30s timer
  maxTime: number;
  theme: string;           // Background environment
}

export type AllyProfession = 'archer' | 'mage' | 'golem' | 'assassin' | 'priestess' | 'dragon_knight';

export type AllyEquipSlot = 'ally_weapon' | 'ally_armor' | 'ally_accessory';

export interface AllySkill {
  id: string;
  name: string;
  icon: string;
  description: string;
  cooldown: number;         // in seconds
  currentCooldown: number;  // countdown in seconds
  level: number;            // Auto-increases with ally level
  baseMultiplier: number;   // Damage multiplier or effect magnitude
  effectType: 'damage' | 'burst' | 'mana' | 'quake' | 'buff' | 'cd_reduction';
}

export interface AllyEquipmentItem {
  id: string;
  name: string;
  profession: AllyProfession;
  professionName: string;
  slot: AllyEquipSlot;
  rarity: ItemRarity;
  level: number;
  dpsBonusPercent: number;      // e.g. +40% Ally DPS
  skillBonusPercent: number;    // e.g. +35% Ally Skill Damage
  cooldownReductionSec: number; // e.g. -1.0s cooldown
  teamBuffBonusPercent: number; // e.g. +10% Team DPS or Gold
  icon: string;
  description: string;
  sellValue: number;
  upgradeCost: number;
}

export interface HeroAlly {
  id: string;
  name: string;
  avatar: string;
  title: string;
  profession: AllyProfession;
  professionName: string;
  professionIcon: string;
  level: number;
  baseDmg: number;
  currentDmg: number;
  baseCost: number;
  upgradeCost: number;
  unlocked: boolean;
  dpsBonusType: 'all' | 'crit' | 'tap' | 'gold';
  description: string;
  skill: AllySkill;
  skills: AllySkill[];
  currentSkillIndex: number;
  equippedWeapon: AllyEquipmentItem | null;
  equippedArmor: AllyEquipmentItem | null;
  equippedAccessory: AllyEquipmentItem | null;
}

export interface ActiveSkill {
  id:
    | 'heavenly_strike'
    | 'berserker_rage'
    | 'hand_of_midas'
    | 'shadow_clone'
    | 'blade_storm'
    | 'war_cry'
    | 'radiant_slash';
  name: string;
  icon: string;
  description: string;
  manaCost: number;
  cooldown: number;        // in seconds
  currentCooldown: number; // in seconds
  duration: number;        // in seconds (0 for instant)
  activeRemaining: number; // in seconds
  level: number;
  unlockLevel: number;     // Sword Master level required
  baseUpgradeCost: number;
  upgradeCost: number;
  multiplier: number;      // Primary value per level
}

export interface StoryChapter {
  id: number;
  name: string;
  title: string;
  lore: string;
  startStage: number;
  endStage: number;
  bossName: string;
  bossAvatar: string;
  bgGradient: string;
  badge: string;
}

export interface FloatingDamage {
  id: number;
  text: string;
  x: number;
  y: number;
  isCrit: boolean;
  color: string;
  createdAt: number;
}

export interface SlashEffect {
  id: number;
  x: number;
  y: number;
  angle: number;
  color: string;
}

export interface DroppedLoot {
  id: number;
  type: 'gold' | 'equipment' | 'ally_equipment';
  amount?: number;
  item?: EquipmentItem;
  allyItem?: AllyEquipmentItem;
  x: number;
  y: number;
  createdAt: number;
}

