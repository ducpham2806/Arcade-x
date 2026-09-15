import { ChamberArchetype, MapSizePreset, ProceduralGenerationOptions } from './types';

export interface GameMatchRecord {
  id: string;
  timestamp: number;
  mode: string;
  levelId?: number;
  floor?: number;
  won: boolean;
  turnsTaken: number;
  parTurns: number;
  mummiesDestroyed: number;
  gridSizeStr: string; // e.g. "6x6"
  scoreEarned: number;
  starsEarned: number; // 0, 1, 2, 3
}

export interface MummyAdaptiveSettings {
  enabled: boolean;
  dynamicGridScaling: boolean;
  dynamicMummyPacing: boolean;
  assistBonusReverts: boolean;
  subtleParTuning: boolean;
}

export interface MummyAdaptiveProfile {
  skillRating: number; // 800 - 2600 (base: 1200)
  skillTier: string;
  skillTierIcon: string;
  skillTierColor: string;
  totalGamesPlayed: number;
  totalLevelsCleared: number;
  totalMummiesTrapped: number;
  currentWinStreak: number;
  highestWinStreak: number;
  winRate: number; // 0 to 100%
  recentWinRate: number; // last 10 games
  avgMovesPerGame: number;
  avgMovesDeltaVsPar: number; // negative = faster than par, positive = slower
  starDistribution: {
    threeStars: number;
    twoStars: number;
    oneStar: number;
    defeats: number;
  };
  modeBreakdown: Record<
    string,
    {
      played: number;
      won: number;
      bestScore: number;
    }
  >;
  history: GameMatchRecord[];
  settings: MummyAdaptiveSettings;
  lastUpdated: number;
}

const ADAPTIVE_STORAGE_KEY = 'mummy_escape_adaptive_analytics_v2';

const DEFAULT_SETTINGS: MummyAdaptiveSettings = {
  enabled: true,
  dynamicGridScaling: true,
  dynamicMummyPacing: true,
  assistBonusReverts: true,
  subtleParTuning: true,
};

export const INITIAL_ADAPTIVE_PROFILE: MummyAdaptiveProfile = {
  skillRating: 1200,
  skillTier: 'Nhà Thám Hiểm Lăng Mộ',
  skillTierIcon: '🧭',
  skillTierColor: '#f59e0b',
  totalGamesPlayed: 0,
  totalLevelsCleared: 0,
  totalMummiesTrapped: 0,
  currentWinStreak: 0,
  highestWinStreak: 0,
  winRate: 0,
  recentWinRate: 0,
  avgMovesPerGame: 0,
  avgMovesDeltaVsPar: 0,
  starDistribution: {
    threeStars: 0,
    twoStars: 0,
    oneStar: 0,
    defeats: 0,
  },
  modeBreakdown: {
    campaign: { played: 0, won: 0, bestScore: 0 },
    turn_limit: { played: 0, won: 0, bestScore: 0 },
    time_attack: { played: 0, won: 0, bestScore: 0 },
    endless: { played: 0, won: 0, bestScore: 0 },
    custom_chamber: { played: 0, won: 0, bestScore: 0 },
  },
  history: [],
  settings: DEFAULT_SETTINGS,
  lastUpdated: Date.now(),
};

/**
 * Calculates Skill Tier title, badge icon, and color based on Elo/MMR rating.
 */
export function getSkillTierInfo(rating: number): {
  title: string;
  icon: string;
  color: string;
  badgeClass: string;
} {
  if (rating < 1000) {
    return {
      title: 'Học Đồ Kim Tự Tháp',
      icon: '📜',
      color: '#94a3b8',
      badgeClass: 'bg-slate-800 text-slate-300 border-slate-600',
    };
  }
  if (rating < 1300) {
    return {
      title: 'Nhà Khảo Cổ Cẩn Trọng',
      icon: '🧭',
      color: '#38bdf8',
      badgeClass: 'bg-sky-950 text-sky-300 border-sky-600',
    };
  }
  if (rating < 1650) {
    return {
      title: 'Chiến Thuật Gia Lăng Mộ',
      icon: '⚔️',
      color: '#a855f7',
      badgeClass: 'bg-purple-950 text-purple-300 border-purple-600',
    };
  }
  if (rating < 2000) {
    return {
      title: 'Bậc Thầy Giải Đố Pharaoh',
      icon: '👑',
      color: '#f59e0b',
      badgeClass: 'bg-amber-950 text-amber-300 border-amber-500',
    };
  }
  return {
    title: 'Vị Thần Sông Nile (Grandmaster)',
    icon: '⚡',
    color: '#10b981',
    badgeClass: 'bg-emerald-950 text-emerald-300 border-emerald-400 animate-pulse',
  };
}

/**
 * Load Adaptive Profile from persistent storage.
 */
export function loadAdaptiveProfile(): MummyAdaptiveProfile {
  try {
    const raw = localStorage.getItem(ADAPTIVE_STORAGE_KEY);
    if (!raw) return { ...INITIAL_ADAPTIVE_PROFILE };

    const parsed = JSON.parse(raw);
    return {
      ...INITIAL_ADAPTIVE_PROFILE,
      ...parsed,
      settings: {
        ...DEFAULT_SETTINGS,
        ...(parsed.settings || {}),
      },
      starDistribution: {
        ...INITIAL_ADAPTIVE_PROFILE.starDistribution,
        ...(parsed.starDistribution || {}),
      },
      modeBreakdown: {
        ...INITIAL_ADAPTIVE_PROFILE.modeBreakdown,
        ...(parsed.modeBreakdown || {}),
      },
    };
  } catch (e) {
    console.warn('Failed to load mummy adaptive profile:', e);
    return { ...INITIAL_ADAPTIVE_PROFILE };
  }
}

/**
 * Save Adaptive Profile to persistent storage.
 */
export function saveAdaptiveProfile(profile: MummyAdaptiveProfile): void {
  try {
    localStorage.setItem(ADAPTIVE_STORAGE_KEY, JSON.stringify(profile));
  } catch (e) {
    console.warn('Failed to save mummy adaptive profile:', e);
  }
}

/**
 * Updates Adaptive Profile settings.
 */
export function updateAdaptiveSettings(
  partialSettings: Partial<MummyAdaptiveSettings>
): MummyAdaptiveProfile {
  const profile = loadAdaptiveProfile();
  profile.settings = { ...profile.settings, ...partialSettings };
  profile.lastUpdated = Date.now();
  saveAdaptiveProfile(profile);
  return profile;
}

/**
 * Records a completed game match into history and recalibrates skill rating & adaptive metrics.
 */
export function recordMatchResult(data: {
  won: boolean;
  turnsTaken: number;
  parTurns: number;
  mummiesDestroyed: number;
  scoreEarned: number;
  mode: string;
  gridSize: { cols: number; rows: number };
  levelId?: number;
  floor?: number;
}): MummyAdaptiveProfile {
  const profile = loadAdaptiveProfile();

  let stars = 0;
  if (data.won) {
    if (data.turnsTaken <= data.parTurns) {
      stars = 3;
    } else if (data.turnsTaken <= data.parTurns + 4) {
      stars = 2;
    } else {
      stars = 1;
    }
  }

  const matchRecord: GameMatchRecord = {
    id: `mummy-match-${Date.now()}-${Math.random().toString(36).substr(2, 6)}`,
    timestamp: Date.now(),
    mode: data.mode,
    levelId: data.levelId,
    floor: data.floor,
    won: data.won,
    turnsTaken: data.turnsTaken,
    parTurns: data.parTurns,
    mummiesDestroyed: data.mummiesDestroyed,
    gridSizeStr: `${data.gridSize.cols}x${data.gridSize.rows}`,
    scoreEarned: data.scoreEarned,
    starsEarned: stars,
  };

  // Prepend to history (keep maximum 40 most recent games)
  profile.history = [matchRecord, ...profile.history.slice(0, 39)];
  profile.totalGamesPlayed += 1;
  profile.totalMummiesTrapped += data.mummiesDestroyed;

  if (data.won) {
    profile.totalLevelsCleared += 1;
    profile.currentWinStreak += 1;
    if (profile.currentWinStreak > profile.highestWinStreak) {
      profile.highestWinStreak = profile.currentWinStreak;
    }
  } else {
    profile.currentWinStreak = 0;
  }

  // Update star distribution
  if (!data.won) {
    profile.starDistribution.defeats += 1;
  } else if (stars === 3) {
    profile.starDistribution.threeStars += 1;
  } else if (stars === 2) {
    profile.starDistribution.twoStars += 1;
  } else {
    profile.starDistribution.oneStar += 1;
  }

  // Update mode breakdown
  const mKey = data.mode || 'campaign';
  if (!profile.modeBreakdown[mKey]) {
    profile.modeBreakdown[mKey] = { played: 0, won: 0, bestScore: 0 };
  }
  profile.modeBreakdown[mKey].played += 1;
  if (data.won) profile.modeBreakdown[mKey].won += 1;
  profile.modeBreakdown[mKey].bestScore = Math.max(
    profile.modeBreakdown[mKey].bestScore || 0,
    data.scoreEarned
  );

  // Calculate Overall & Recent Win Rates
  const totalMatches = profile.history.length;
  const totalWins = profile.history.filter((m) => m.won).length;
  profile.winRate = Math.round((totalWins / Math.max(1, totalMatches)) * 100);

  const recentTen = profile.history.slice(0, 10);
  const recentWins = recentTen.filter((m) => m.won).length;
  profile.recentWinRate = Math.round((recentWins / Math.max(1, recentTen.length)) * 100);

  // Calculate Average Moves & Delta
  const movesSum = profile.history.reduce((acc, m) => acc + m.turnsTaken, 0);
  profile.avgMovesPerGame = Math.round((movesSum / Math.max(1, totalMatches)) * 10) / 10;

  const deltaSum = profile.history.reduce((acc, m) => acc + (m.turnsTaken - m.parTurns), 0);
  profile.avgMovesDeltaVsPar = Math.round((deltaSum / Math.max(1, totalMatches)) * 10) / 10;

  // Recalculate Dynamic Elo / Skill Rating
  let ratingShift = 0;
  if (data.won) {
    ratingShift += 25;
    if (stars === 3) ratingShift += 15; // 3-star bonus
    if (data.turnsTaken < data.parTurns) ratingShift += 10; // Speed bonus
    if (data.mummiesDestroyed > 0) ratingShift += data.mummiesDestroyed * 5;
    if (profile.currentWinStreak >= 3) ratingShift += 10; // Streak bonus
  } else {
    ratingShift -= 20;
    if (data.turnsTaken < 5) ratingShift -= 10; // Rapid early defeat
  }

  profile.skillRating = Math.max(700, Math.min(2800, profile.skillRating + ratingShift));

  // Update Skill Tier
  const tierInfo = getSkillTierInfo(profile.skillRating);
  profile.skillTier = tierInfo.title;
  profile.skillTierIcon = tierInfo.icon;
  profile.skillTierColor = tierInfo.color;
  profile.lastUpdated = Date.now();

  saveAdaptiveProfile(profile);
  return profile;
}

/**
 * Computes Adaptive Difficulty Modifiers for procedural chambers, endless mode, or hints.
 */
export interface AdaptiveDifficultyTuning {
  adjustedGridSize: MapSizePreset;
  recommendedArchetype?: ChamberArchetype;
  mummySpawnMultiplier: number;
  extraMummyAllowed: boolean;
  favorFastRedMummy: boolean;
  bonusRevertCharges: number;
  parAdjustment: number;
  difficultyLabel: string;
  difficultyDescription: string;
  appliedMultiplierPercent: number; // e.g. +20% or -15%
}

export function computeAdaptiveTuning(
  profile: MummyAdaptiveProfile = loadAdaptiveProfile(),
  floorNumber: number = 1
): AdaptiveDifficultyTuning {
  if (!profile.settings.enabled) {
    return {
      adjustedGridSize: '6x6',
      mummySpawnMultiplier: 1.0,
      extraMummyAllowed: false,
      favorFastRedMummy: false,
      bonusRevertCharges: 0,
      parAdjustment: 0,
      difficultyLabel: 'Tiêu Chuẩn (Mặc Định)',
      difficultyDescription: 'Hệ thống tự cân bằng đang tạm tắt. Đang dùng độ khó tiêu chuẩn.',
      appliedMultiplierPercent: 0,
    };
  }

  const { recentWinRate, currentWinStreak, skillRating, avgMovesDeltaVsPar } = profile;

  // Case 1: Player is Struggling (Win Rate < 40% or 3 consecutive losses)
  if (recentWinRate < 40 || profile.history.slice(0, 3).every((m) => !m.won && profile.history.length >= 3)) {
    return {
      adjustedGridSize: floorNumber <= 3 ? '5x5' : '6x6',
      recommendedArchetype: 'labyrinth', // open corridors for simpler dodging
      mummySpawnMultiplier: 0.75,
      extraMummyAllowed: false,
      favorFastRedMummy: false,
      bonusRevertCharges: profile.settings.assistBonusReverts ? 1 : 0,
      parAdjustment: profile.settings.subtleParTuning ? 2 : 0, // +2 par turns leniency
      difficultyLabel: 'Trợ Lực (Adaptive Assist)',
      difficultyDescription: 'Hệ thống nhận thấy thử thách đang gắt gao. Giảm tốc độ xác ướp và hỗ trợ thêm 1 lần Revert.',
      appliedMultiplierPercent: -20,
    };
  }

  // Case 2: High Mastery / Dominating (>75% win rate, streak >= 3, or Elo > 1650)
  if (recentWinRate >= 75 || currentWinStreak >= 3 || skillRating >= 1650) {
    const useLarge = floorNumber >= 3 && profile.settings.dynamicGridScaling;
    return {
      adjustedGridSize: useLarge ? (floorNumber >= 6 ? '8x8' : '7x7') : '6x6',
      recommendedArchetype: 'gauntlet_of_traps',
      mummySpawnMultiplier: 1.35,
      extraMummyAllowed: profile.settings.dynamicMummyPacing,
      favorFastRedMummy: true,
      bonusRevertCharges: 0,
      parAdjustment: profile.settings.subtleParTuning && avgMovesDeltaVsPar < -1 ? -1 : 0,
      difficultyLabel: 'Thử Thách Thượng Cấp (Pharaoh Fury)',
      difficultyDescription: 'Bạn đang thi đấu xuất sắc! Tăng mật độ xác ướp đỏ và mở rộng kích thước lăng mộ để duy trì cao độ.',
      appliedMultiplierPercent: +25,
    };
  }

  // Case 3: Balanced Flow (Standard balanced difficulty)
  return {
    adjustedGridSize: floorNumber >= 5 ? '7x7' : '6x6',
    mummySpawnMultiplier: 1.0,
    extraMummyAllowed: false,
    favorFastRedMummy: false,
    bonusRevertCharges: 0,
    parAdjustment: 0,
    difficultyLabel: 'Cân Bằng Chuẩn (Optimal Flow)',
    difficultyDescription: 'Độ khó đang thích ứng hoàn hảo với kỹ năng hiện tại của bạn.',
    appliedMultiplierPercent: 0,
  };
}

/**
 * Injects adaptive difficulty settings into procedural chamber generation options.
 */
export function getAdaptiveProceduralOptions(
  baseOptions: ProceduralGenerationOptions = {}
): ProceduralGenerationOptions {
  const profile = loadAdaptiveProfile();
  if (!profile.settings.enabled) return baseOptions;

  const floor = baseOptions.floor || 1;
  const tuning = computeAdaptiveTuning(profile, floor);

  let mummyCount = baseOptions.mummyCount;
  if (mummyCount === undefined) {
    mummyCount = Math.max(1, Math.min(4, Math.floor(1 + floor * 0.45)));
    if (tuning.extraMummyAllowed && floor >= 2) {
      mummyCount += 1;
    }
  }

  return {
    ...baseOptions,
    sizePreset: baseOptions.sizePreset || (profile.settings.dynamicGridScaling ? tuning.adjustedGridSize : '6x6'),
    mummyCount,
    archetype: baseOptions.archetype || tuning.recommendedArchetype || 'labyrinth',
    mummyDifficulty: tuning.favorFastRedMummy ? 'hard' : 'normal',
    trapDensity: baseOptions.trapDensity || (tuning.appliedMultiplierPercent > 0 ? 'high' : 'medium'),
  };
}
