import type { RecipeDiscoveryLogEntry } from '../../types';
import { DEFAULT_LEGENDARY_BLUEPRINTS } from '../../data/legendaryBlueprints';
import { STORAGE_KEYS } from './keys';

// --- RECIPE DISCOVERY & LEGENDARY BLUEPRINTS ---
export function loadDiscoveredBlueprintIds(): string[] {
  try {
    const data = localStorage.getItem(STORAGE_KEYS.BLUEPRINTS);
    if (data) {
      return JSON.parse(data);
    }
  } catch {
    // ignore
  }
  return ['bp-infinity-edge']; // Player starts with 1 unlocked blueprint for exploration!
}

export function saveDiscoveredBlueprintIds(blueprintIds: string[]): void {
  try {
    localStorage.setItem(STORAGE_KEYS.BLUEPRINTS, JSON.stringify(blueprintIds));
  } catch {
    // ignore
  }
}

export function unlockBlueprint(blueprintId: string): boolean {
  const current = loadDiscoveredBlueprintIds();
  if (!current.includes(blueprintId)) {
    const updated = [...current, blueprintId];
    saveDiscoveredBlueprintIds(updated);
    return true;
  }
  return false;
}

export function loadDiscoveryLog(): RecipeDiscoveryLogEntry[] {
  try {
    const data = localStorage.getItem(STORAGE_KEYS.DISCOVERY_LOG);
    if (data) {
      return JSON.parse(data);
    }
  } catch {
    // ignore
  }
  // Seed with an inspiring initial entry if empty
  return [
    {
      id: 'log-welcome-discovery',
      timestamp: Date.now() - 3600000 * 2,
      ingredients: [
        { id: 'mat-cyber-alloy', name: 'Hợp Kim Cyber Titan', icon: '🔩', rarity: 'common' },
        { id: 'mat-neon-battery', name: 'Pin Lăng Kính Neon', icon: '🔋', rarity: 'common' },
        { id: 'skin-runner-emerald', name: 'Giáp Sinh Tồn Emerald', icon: '🎽', rarity: 'uncommon' },
      ],
      success: true,
      discoveredBlueprint: DEFAULT_LEGENDARY_BLUEPRINTS[0],
      rewardDescription: 'Phát hiện cổ thư thất truyền! Bản Thiết Kế Gươm Thần Vô Cực đã mở khóa.',
      rewardCoins: 500,
      rewardGems: 20,
      rewardExp: 150,
    },
  ];
}

export function saveDiscoveryLog(log: RecipeDiscoveryLogEntry[]): void {
  try {
    localStorage.setItem(STORAGE_KEYS.DISCOVERY_LOG, JSON.stringify(log.slice(0, 50))); // Keep last 50 entries
  } catch {
    // ignore
  }
}

export function addDiscoveryLogEntry(entry: RecipeDiscoveryLogEntry): RecipeDiscoveryLogEntry[] {
  const current = loadDiscoveryLog();
  const updated = [entry, ...current].slice(0, 50);
  saveDiscoveryLog(updated);
  return updated;
}

export function clearDiscoveryLog(): void {
  try {
    localStorage.removeItem(STORAGE_KEYS.DISCOVERY_LOG);
  } catch {
    // ignore
  }
}
