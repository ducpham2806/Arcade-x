import { EquipmentItem } from '../types';

/**
 * Accurate level-up math for Sword Master and Hero Allies
 * Supports exact compound costs for +1, +5, +10, +15, +20, and MAX
 * Includes milestone multipliers for every 5 levels (5, 10, 15, 20, 25...)
 */

export const HERO_BASE_COST = 18;
export const HERO_COST_GROWTH = 1.12;
export const HERO_BASE_TAP_DMG = 10;
export const HERO_DMG_GROWTH = 1.14;

/**
 * Calculates exact total cost to upgrade Sword Master by `count` levels
 */
export function calculateHeroUpgradeCost(currentLevel: number, count: number): number {
  if (count <= 0) return 0;
  let total = 0;
  for (let i = 0; i < count; i++) {
    total += Math.round(HERO_BASE_COST * Math.pow(HERO_COST_GROWTH, currentLevel + i - 1));
  }
  return total;
}

/**
 * Calculates max levels affordable for Sword Master given available gold
 */
export function calculateMaxHeroLevels(
  currentLevel: number,
  availableGold: number
): { count: number; totalCost: number } {
  let count = 0;
  let total = 0;
  let cur = currentLevel;
  while (true) {
    const cost = Math.round(HERO_BASE_COST * Math.pow(HERO_COST_GROWTH, cur - 1));
    if (total + cost <= availableGold && count < 1000) {
      total += cost;
      count++;
      cur++;
    } else {
      break;
    }
  }
  return { count, totalCost: total };
}

/**
 * Calculates milestone multiplier for Sword Master
 * Every 5 levels (5, 10, 15, 20, 25...) grants a milestone damage multiplier!
 */
export function getHeroMilestoneData(level: number): {
  multiplier: number;
  nextMilestone: number;
  progressPercent: number;
  levelsToNext: number;
} {
  let multiplier = 1;
  for (let m = 5; m <= level; m += 5) {
    if (m === 10 || m === 15 || m === 20) {
      multiplier *= 2.0;
    } else {
      multiplier *= 1.5;
    }
  }

  const prevMilestone = Math.floor(level / 5) * 5;
  const nextMilestone = prevMilestone + 5;
  const levelsToNext = nextMilestone - level;
  const progressPercent = Math.min(100, Math.max(0, ((level - prevMilestone) / 5) * 100));

  return { multiplier, nextMilestone, progressPercent, levelsToNext };
}

/**
 * Calculates exact total cost to upgrade a Hero Ally by `count` levels
 */
export function calculateAllyUpgradeCost(baseCost: number, currentLevel: number, count: number): number {
  if (count <= 0) return 0;
  let total = 0;
  for (let i = 0; i < count; i++) {
    total += Math.round(baseCost * Math.pow(1.2, currentLevel + i));
  }
  return total;
}

/**
 * Calculates max levels affordable for a Hero Ally given available gold
 */
export function calculateMaxAllyLevels(
  baseCost: number,
  currentLevel: number,
  availableGold: number
): { count: number; totalCost: number } {
  let count = 0;
  let total = 0;
  let cur = currentLevel;
  while (true) {
    const cost = Math.round(baseCost * Math.pow(1.2, cur));
    if (total + cost <= availableGold && count < 1000) {
      total += cost;
      count++;
      cur++;
    } else {
      break;
    }
  }
  return { count, totalCost: total };
}

/**
 * Calculates milestone multiplier for an Ally
 * Every 5 levels (5, 10, 15, 20, 25...) grants a 1.6x DPS bonus!
 */
export function getAllyMilestoneData(level: number): {
  multiplier: number;
  nextMilestone: number;
  progressPercent: number;
} {
  let multiplier = 1;
  for (let m = 5; m <= level; m += 5) {
    multiplier *= 1.6;
  }
  const prevMilestone = Math.floor(level / 5) * 5;
  const nextMilestone = prevMilestone + 5;
  const progressPercent = Math.min(100, Math.max(0, ((level - prevMilestone) / 5) * 100));

  return { multiplier, nextMilestone, progressPercent };
}

/**
 * Formats large numbers with standard idle RPG abbreviations:
 * K (Thousand, 10^3)
 * M (Million, 10^6)
 * B (Billion, 10^9)
 * T (Trillion, 10^12)
 * q (Quadrillion, 10^15)
 * Q (Quintillion, 10^18)
 * s (Sextillion, 10^21)
 * S (Septillion, 10^24)
 * O (Octillion, 10^27)
 * N (Nonillion, 10^30)
 * d (Decillion, 10^33)
 * U, D, aa, ab...
 */
export function formatNumber(num: number | null | undefined, decimals: number = 2): string {
  if (num === null || num === undefined || isNaN(num)) return '0';
  if (num === 0) return '0';
  if (num < 0) return '-' + formatNumber(-num, decimals);

  if (num < 1000) {
    if (Math.floor(num) === num) {
      return num.toString();
    }
    const str = num.toFixed(decimals);
    return str.includes('.') ? str.replace(/\.?0+$/, '') : str;
  }

  const suffixes = [
    '', 'K', 'M', 'B', 'T', 'q', 'Q', 's', 'S', 'O', 'N',
    'd', 'U', 'D', 'aa', 'ab', 'ac', 'ad', 'ae', 'af', 'ag'
  ];

  const tier = Math.floor(Math.log10(num) / 3);

  if (tier <= 0) {
    return Math.floor(num).toString();
  }

  if (tier >= suffixes.length) {
    return num.toExponential(2);
  }

  const suffix = suffixes[tier];
  const scale = Math.pow(10, tier * 3);
  const scaled = num / scale;

  let formatted: string;
  if (scaled >= 100) {
    formatted = scaled.toFixed(0);
  } else if (scaled >= 10) {
    formatted = scaled.toFixed(1);
  } else {
    formatted = scaled.toFixed(decimals);
  }

  // Remove trailing .0 or .00
  if (formatted.includes('.')) {
    formatted = formatted.replace(/\.?0+$/, '');
  }

  return `${formatted}${suffix}`;
}

/**
 * Retrieves the base Level 1 stats of an equipment item.
 * When comparing items, the game compares their Level 1 base stats rather than their post-upgraded stats.
 */
export function getItemBaseStats(item: EquipmentItem | null | undefined): {
  tapDmgBonus: number;
  heroDmgBonus: number;
  critRateBonus: number;
  goldBonus: number;
  power: number;
} {
  if (!item) {
    return { tapDmgBonus: 0, heroDmgBonus: 0, critRateBonus: 0, goldBonus: 0, power: 0 };
  }

  if (item.baseLevelStats) {
    const b = item.baseLevelStats;
    const power = Math.round(
      (b.tapDmgBonus || 0) * 1.0 +
      (b.heroDmgBonus || 0) * 1.0 +
      (b.critRateBonus || 0) * 2.5 +
      (b.goldBonus || 0) * 0.8
    );
    return {
      tapDmgBonus: b.tapDmgBonus || 0,
      heroDmgBonus: b.heroDmgBonus || 0,
      critRateBonus: b.critRateBonus || 0,
      goldBonus: b.goldBonus || 0,
      power,
    };
  }

  const lvl = Math.max(1, item.level || 1);
  if (lvl === 1) {
    const power = Math.round(
      (item.tapDmgBonus || 0) * 1.0 +
      (item.heroDmgBonus || 0) * 1.0 +
      (item.critRateBonus || 0) * 2.5 +
      (item.goldBonus || 0) * 0.8
    );
    return {
      tapDmgBonus: item.tapDmgBonus || 0,
      heroDmgBonus: item.heroDmgBonus || 0,
      critRateBonus: item.critRateBonus || 0,
      goldBonus: item.goldBonus || 0,
      power,
    };
  }

  // Reverse 1.25x scaling per level to recover Level 1 base stats
  const factor = Math.pow(1.25, lvl - 1);
  const tapDmgBonus = Math.round((item.tapDmgBonus || 0) / factor);
  const heroDmgBonus = Math.round((item.heroDmgBonus || 0) / factor);
  const critRateBonus = Math.max(0, (item.critRateBonus || 0) - (lvl - 1));
  const goldBonus = Math.round((item.goldBonus || 0) / factor);
  const power = Math.round(
    tapDmgBonus * 1.0 +
    heroDmgBonus * 1.0 +
    critRateBonus * 2.5 +
    goldBonus * 0.8
  );
  return { tapDmgBonus, heroDmgBonus, critRateBonus, goldBonus, power };
}

/**
 * Calculates a Combat Power score for an equipment item based strictly on its Level 1 Base Stats!
 * As requested: "Khi so sánh sẽ so sánh chỉ số của cấp 1 giữa 2 đồ, chứ ko phải cấp sau khi đã tăng cấp."
 */
export function calculateItemBasePower(item: EquipmentItem | null | undefined): number {
  if (!item) return 0;
  const base = getItemBaseStats(item);
  return base.power;
}

/**
 * Calculates current actual Combat Power score for an equipment item based on its current stats
 */
export function calculateItemPower(item: EquipmentItem | null | undefined): number {
  if (!item) return 0;
  return Math.round(
    (item.tapDmgBonus || 0) * 1.0 +
    (item.heroDmgBonus || 0) * 1.0 +
    (item.critRateBonus || 0) * 2.5 +
    (item.goldBonus || 0) * 0.8 +
    (item.level || 1) * 2
  );
}

/**
 * Determines whether a candidate item is better than the currently equipped item in that slot
 * Always compares base Level 1 stats!
 */
export function isBetterItem(
  candidate: EquipmentItem,
  currentEquipped: EquipmentItem | null | undefined
): boolean {
  if (!currentEquipped) return true; // Slot is empty, always recommend equipping!
  if (candidate.id === currentEquipped.id) return false;
  return calculateItemBasePower(candidate) > calculateItemBasePower(currentEquipped);
}

/**
 * Calculates total cost to upgrade an Active Skill by `count` levels
 */
export function calculateSkillUpgradeCost(
  baseCost: number,
  currentLevel: number,
  count: number = 1
): number {
  if (count <= 0) return 0;
  let total = 0;
  for (let i = 0; i < count; i++) {
    total += Math.round(baseCost * Math.pow(1.35, currentLevel + i - 1));
  }
  return total;
}

/**
 * Calculates max affordable skill levels
 */
export function calculateMaxSkillLevels(
  baseCost: number,
  currentLevel: number,
  availableGold: number
): { count: number; totalCost: number } {
  let count = 0;
  let total = 0;
  let cur = currentLevel;
  while (true) {
    const cost = Math.round(baseCost * Math.pow(1.35, cur - 1));
    if (total + cost <= availableGold && count < 200) {
      total += cost;
      count++;
      cur++;
    } else {
      break;
    }
  }
  return { count: Math.max(1, count), totalCost: total };
}

/**
 * Computes skill scaling power & descriptions based on level
 */
export function getSkillData(skillId: string, level: number): {
  primaryValue: number;
  secondaryValue?: number;
  currentEffect: string;
  nextEffect: string;
} {
  switch (skillId) {
    case 'heavenly_strike': {
      const currentMult = 45 + (level - 1) * 15;
      const nextMult = 45 + level * 15;
      return {
        primaryValue: currentMult,
        currentEffect: `Gây x${currentMult} Sát Thương Chém tức thì`,
        nextEffect: `Gây x${nextMult} Sát Thương Chém (+15x)`,
      };
    }
    case 'berserker_rage': {
      const currentMult = Math.round((3.0 + (level - 1) * 0.4) * 10) / 10;
      const nextMult = Math.round((3.0 + level * 0.4) * 10) / 10;
      const currentDur = 10 + Math.floor((level - 1) / 2);
      const nextDur = 10 + Math.floor(level / 2);
      return {
        primaryValue: currentMult,
        secondaryValue: currentDur,
        currentEffect: `100% Bạo kích, Sát thương x${currentMult} trong ${currentDur}s`,
        nextEffect: `Sát thương x${nextMult} trong ${nextDur}s`,
      };
    }
    case 'hand_of_midas': {
      const currentMult = Math.round((5.0 + (level - 1) * 1.5) * 10) / 10;
      const nextMult = Math.round((5.0 + level * 1.5) * 10) / 10;
      const currentDur = 15 + Math.floor((level - 1) / 2);
      const nextDur = 15 + Math.floor(level / 2);
      return {
        primaryValue: currentMult,
        secondaryValue: currentDur,
        currentEffect: `Rơi x${currentMult} Vàng mỗi đòn trong ${currentDur}s`,
        nextEffect: `Rơi x${nextMult} Vàng trong ${nextDur}s`,
      };
    }
    case 'shadow_clone': {
      const currentRatio = Math.round((0.8 + (level - 1) * 0.2) * 100);
      const nextRatio = Math.round((0.8 + level * 0.2) * 100);
      const currentDur = 15 + Math.floor((level - 1) / 2);
      const nextDur = 15 + Math.floor(level / 2);
      return {
        primaryValue: currentRatio / 100,
        secondaryValue: currentDur,
        currentEffect: `Chém liên tục với ${currentRatio}% Tap Dmg trong ${currentDur}s`,
        nextEffect: `Chém với ${nextRatio}% Tap Dmg trong ${nextDur}s`,
      };
    }
    case 'blade_storm': {
      const currentMult = Math.round((12.0 + (level - 1) * 4.0) * 10) / 10;
      const nextMult = Math.round((12.0 + level * 4.0) * 10) / 10;
      const currentDur = 10 + Math.floor((level - 1) / 3);
      const nextDur = 10 + Math.floor(level / 3);
      return {
        primaryValue: currentMult,
        secondaryValue: currentDur,
        currentEffect: `Bão kiếm xoay chém x${currentMult} Tap Dmg mỗi 0.4s trong ${currentDur}s`,
        nextEffect: `Chém x${nextMult} Tap Dmg mỗi 0.4s trong ${nextDur}s`,
      };
    }
    case 'war_cry': {
      const currentMult = Math.round((2.5 + (level - 1) * 0.5) * 10) / 10;
      const nextMult = Math.round((2.5 + level * 0.5) * 10) / 10;
      const currentManaRestore = 30 + (level - 1) * 5;
      const currentDur = 12 + Math.floor((level - 1) / 2);
      const nextDur = 12 + Math.floor(level / 2);
      return {
        primaryValue: currentMult,
        secondaryValue: currentDur,
        currentEffect: `Tăng x${currentMult} DPS Đội (+${Math.round((currentMult - 1) * 100)}%), hồi +${currentManaRestore} MP trong ${currentDur}s`,
        nextEffect: `Tăng x${nextMult} DPS Đội, hồi +${currentManaRestore + 5} MP trong ${nextDur}s`,
      };
    }
    case 'radiant_slash': {
      const currentMult = 85 + (level - 1) * 30;
      const nextMult = 85 + level * 30;
      const currentArmorBreak = Math.min(80, 50 + (level - 1) * 3);
      const nextArmorBreak = Math.min(80, 50 + level * 3);
      return {
        primaryValue: currentMult,
        secondaryValue: currentArmorBreak,
        currentEffect: `Gây x${currentMult} Tap Dmg tức thì & Phá giáp quái (+${currentArmorBreak}% sát thương nhận) trong 8s`,
        nextEffect: `Gây x${nextMult} Tap Dmg & Phá giáp (+${nextArmorBreak}%) trong 8s`,
      };
    }
    default:
      return {
        primaryValue: 1,
        currentEffect: '',
        nextEffect: '',
      };
  }
}

/**
 * Automatic ally skill level scaling with ally level
 * Increases by 1 level every 4 ally levels (Lv.0->1, Lv.4->2, Lv.8->3, Lv.12->4...)
 */
export function getAllySkillLevel(allyLevel: number): number {
  if (allyLevel <= 0) return 1;
  return Math.max(1, Math.floor(allyLevel / 4) + 1);
}

/**
 * Computes ally skill effective power
 */
export function getAllySkillEffect(
  baseMultiplier: number,
  skillLevel: number,
  effectType: string
): { currentMult: number; label: string } {
  const currentMult = Math.round((baseMultiplier + (skillLevel - 1) * (baseMultiplier * 0.25)) * 10) / 10;
  let label = '';
  if (effectType === 'mana') {
    label = `Hồi phục ${currentMult} MP & +${skillLevel * 10}% Vàng`;
  } else if (effectType === 'quake') {
    label = `Chấn động x${currentMult} DPS & Kéo dài giờ Boss`;
  } else if (effectType === 'buff') {
    label = `Cường hóa +${Math.round(currentMult * 5)}% Hiệu ứng Đội`;
  } else if (effectType === 'cd_reduction') {
    label = `Giảm ${Math.min(6, Math.round(2 + skillLevel * 0.5))}s Cooldown toàn đội & Hồi ${Math.round(currentMult)} MP`;
  } else {
    label = `Gây x${currentMult} DPS bộc phát`;
  }
  return { currentMult, label };
}


