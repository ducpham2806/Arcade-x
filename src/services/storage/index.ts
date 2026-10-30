// Public storage API. StorageService keeps the original static-method surface;
// each domain lives in its own module and calls its siblings directly.
import * as backup from './backupStore';
import * as challenges from './challengeStore';
import * as crafting from './craftingStore';
import * as launcher from './launcherStore';
import * as leaderboards from './leaderboardStore';
import * as profile from './profileStore';
import * as quests from './questStore';
import * as social from './socialStore';

export const StorageService = {
  ...profile,
  ...quests,
  ...leaderboards,
  ...challenges,
  ...launcher,
  ...backup,
  ...crafting,
  ...social,
};

export { CHEST_TYPES, ALL_DEFAULT_ITEMS } from './catalog/items';
export { DEFAULT_ACHIEVEMENTS } from './catalog/achievements';
export { DEFAULT_DAILY_QUESTS, DEFAULT_WEEKLY_QUESTS, DEFAULT_WEEKLY_MILESTONES } from './catalog/quests';
export { INITIAL_PLAYER_PROFILE, DAILY_LOGIN_REWARDS_LIST } from './catalog/profile';
export { INITIAL_LEADERBOARD, DEFAULT_DAILY_CHALLENGERS } from './catalog/leaderboard';
export { DEFAULT_SEED_FRIENDS } from './catalog/social';
export { FORGE_MASTERY_LEVELS, DEFAULT_FORGE_MASTERY } from './catalog/forge';
export type { ForgeMasteryLevelDef } from './catalog/forge';
export { getStreakMultiplier, getExpNeededForLevel, getRecent7DaysScoreHistory } from './progression';
export type { DailyScorePoint } from './progression';
export { DEFAULT_LEGENDARY_BLUEPRINTS } from '../../data/legendaryBlueprints';
