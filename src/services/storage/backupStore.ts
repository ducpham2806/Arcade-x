import { loadLeaderboards } from './leaderboardStore';
import { loadAchievements, loadForgeMastery, loadInventory, loadProfile, saveAchievements, saveForgeMastery, saveInventory, saveProfile } from './profileStore';
import { loadDailyQuests, saveDailyQuests } from './questStore';

export function exportData(): string {
  return exportDataBackup();
}

export function importData(jsonStr: string): boolean {
  return importDataBackup(jsonStr);
}

export function clearAll(): void {
  try {
    localStorage.clear();
  } catch {
    // ignore
  }
}

export function exportDataBackup(): string {
  const backup = {
    profile: loadProfile(),
    inventory: loadInventory(),
    achievements: loadAchievements(),
    dailyQuests: loadDailyQuests(),
    leaderboards: loadLeaderboards(),
    forgeMastery: loadForgeMastery(),
    timestamp: Date.now(),
  };
  return JSON.stringify(backup, null, 2);
}

export function importDataBackup(jsonStr: string): boolean {
  try {
    const data = JSON.parse(jsonStr);
    if (data.profile) saveProfile(data.profile);
    if (data.inventory) saveInventory(data.inventory);
    if (data.achievements) saveAchievements(data.achievements);
    if (data.dailyQuests) saveDailyQuests(data.dailyQuests);
    if (data.forgeMastery) saveForgeMastery(data.forgeMastery);
    return true;
  } catch {
    return false;
  }
}
