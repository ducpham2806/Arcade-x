import type { InventoryItem, PlayerProfile, Achievement, ForgeMasteryState } from '../../types';
import { DEFAULT_ACHIEVEMENTS } from './catalog/achievements';
import { DEFAULT_FORGE_MASTERY } from './catalog/forge';
import { ALL_DEFAULT_ITEMS } from './catalog/items';
import { INITIAL_PLAYER_PROFILE } from './catalog/profile';
import { STORAGE_KEYS } from './keys';

export function loadProfile(): PlayerProfile {
  try {
    const data = localStorage.getItem(STORAGE_KEYS.PROFILE);
    if (data) {
      const parsed = JSON.parse(data);
      return { ...INITIAL_PLAYER_PROFILE, ...parsed };
    }
  } catch {
    // ignore
  }
  return INITIAL_PLAYER_PROFILE;
}

export function saveProfile(profile: PlayerProfile): void {
  try {
    localStorage.setItem(STORAGE_KEYS.PROFILE, JSON.stringify(profile));
  } catch {
    // ignore
  }
}

export function isOnboardingCompleted(): boolean {
  try {
    return localStorage.getItem(STORAGE_KEYS.ONBOARDING_COMPLETED) === 'true';
  } catch {
    return false;
  }
}

export function setOnboardingCompleted(completed: boolean): void {
  try {
    localStorage.setItem(STORAGE_KEYS.ONBOARDING_COMPLETED, completed ? 'true' : 'false');
  } catch {
    // ignore
  }
}

export function loadInventory(): InventoryItem[] {
  try {
    const data = localStorage.getItem(STORAGE_KEYS.INVENTORY);
    if (data) {
      const parsed: InventoryItem[] = JSON.parse(data);
      // Merge with any new items that might have been added to defaults
      const existingIds = new Set(parsed.map(i => i.id));
      const missingDefaults = ALL_DEFAULT_ITEMS.filter(d => !existingIds.has(d.id)).map(item => ({ ...item, count: 0, equipped: false }));
      return [...parsed, ...missingDefaults];
    }
  } catch {
    // ignore
  }
  return ALL_DEFAULT_ITEMS;
}

export function saveInventory(items: InventoryItem[]): void {
  try {
    localStorage.setItem(STORAGE_KEYS.INVENTORY, JSON.stringify(items));
  } catch {
    // ignore
  }
}

export function loadAchievements(): Achievement[] {
  try {
    const data = localStorage.getItem(STORAGE_KEYS.ACHIEVEMENTS);
    if (data) {
      const parsed: Achievement[] = JSON.parse(data);
      const existingIds = new Set(parsed.map(a => a.id));
      const missing = DEFAULT_ACHIEVEMENTS.filter(d => !existingIds.has(d.id));
      
      // Ensure rewardTitle and rarity are injected into parsed achievements
      const mergedParsed = parsed.map(p => {
        const def = DEFAULT_ACHIEVEMENTS.find(d => d.id === p.id);
        const updated = { ...p };
        if (def && def.rewardTitle && !updated.rewardTitle) {
          updated.rewardTitle = def.rewardTitle;
        }
        if (def && def.rarity && !updated.rarity) {
          updated.rarity = def.rarity;
        }
        return updated;
      });
      
      return [...mergedParsed, ...missing];
    }
  } catch {
    // ignore
  }
  return DEFAULT_ACHIEVEMENTS;
}

export function saveAchievements(achievements: Achievement[]): void {
  try {
    localStorage.setItem(STORAGE_KEYS.ACHIEVEMENTS, JSON.stringify(achievements));
  } catch {
    // ignore
  }
}

export function loadForgeMastery(): ForgeMasteryState {
  try {
    const data = localStorage.getItem(STORAGE_KEYS.FORGE_MASTERY);
    if (data) {
      const parsed = JSON.parse(data);
      return { ...DEFAULT_FORGE_MASTERY, ...parsed };
    }
  } catch {
    // ignore
  }
  return DEFAULT_FORGE_MASTERY;
}

export function saveForgeMastery(state: ForgeMasteryState): void {
  try {
    localStorage.setItem(STORAGE_KEYS.FORGE_MASTERY, JSON.stringify(state));
  } catch {
    // ignore
  }
}
