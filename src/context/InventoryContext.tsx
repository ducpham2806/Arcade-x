import React, { createContext, useContext, useState, useEffect, useCallback, useRef } from 'react';
import {
  InventoryItem,
  Rarity,
  ChestTypeInfo,
  CraftResult,
  ForgeMasteryState,
  LegendaryBlueprint,
  RecipeDiscoveryLogEntry,
} from '../types';
import {
  StorageService,
  CHEST_TYPES,
  ALL_DEFAULT_ITEMS,
  DEFAULT_FORGE_MASTERY,
} from '../services/storage';
import { usePlayer } from './PlayerContext';
import { soundEngine } from '../services/audio';
import { getItemSlot } from '../utils/rarity';
import confetti from 'canvas-confetti';
import { SHOP_THEMES, ShopTheme, convertThemeToInventoryItem } from '../data/shopThemes';
import { SupabaseService, type CloudInventoryData } from '../services/supabase';
import { hapticService } from '../services/haptics';
import { ELO_TITLE_MILESTONES } from '../utils/eloRankSystem';
import { useCrafting } from './inventory/useCrafting';
import { useShallowStable } from './useShallowStable';

export interface ChestOpenResult {
  chestType: 'common' | 'rare' | 'epic' | 'legendary';
  coins: number;
  gems: number;
  item: InventoryItem | null;
  isNewItem: boolean;
  hasLuckBuffActive?: boolean;
}

export interface RecipeDiscoveryResult {
  success: boolean;
  blueprint?: LegendaryBlueprint;
  message: string;
  coinsEarned: number;
  gemsEarned: number;
  expEarned: number;
}

interface InventoryContextType {
  items: InventoryItem[];
  chestCounts: Record<'common' | 'rare' | 'epic' | 'legendary', number>;
  forgeMastery: ForgeMasteryState;
  discoveredBlueprintIds: string[];
  discoveryLog: RecipeDiscoveryLogEntry[];
  addChest: (type: 'common' | 'rare' | 'epic' | 'legendary', count?: number) => void;
  openChest: (type: 'common' | 'rare' | 'epic' | 'legendary') => ChestOpenResult | null;
  buyChestWithCurrency: (type: 'common' | 'rare' | 'epic' | 'legendary', currency: 'coins' | 'gems', cost: number) => boolean;
  equipItem: (itemId: string) => void;
  unequipItem: (itemId: string) => void;
  getEquippedSkinForGame: (gameId: string) => InventoryItem | undefined;
  getEquippedTitle: () => string;
  getEquippedAvatar: () => string;
  isItemOwned: (itemId: string) => boolean;
  grantItemById: (itemId: string, count?: number) => boolean;
  purchaseShopTheme: (themeId: string) => { success: boolean; message: string; theme?: ShopTheme };
  craftItems: (itemIds: string[], auxItemId?: string | null) => CraftResult | null;
  discoverRecipe: (ingredientIds: string[]) => RecipeDiscoveryResult | null;
  clearDiscoveryLog: () => void;
  cloudSyncStatus: 'idle' | 'syncing' | 'synced' | 'error';
  lastCloudSyncTime: number | null;
  manualSyncInventory: () => Promise<boolean>;
}

const CHEST_COUNT_STORAGE_KEY = 'arcadex_chest_counts';

const InventoryContext = createContext<InventoryContextType | null>(null);

export const InventoryProvider: React.FC<{ children: React.ReactNode }> = ({ children }) => {
  const { profile, addCoins, addGems, addExp, spendCoins, spendGems, updateAvatar, updateTitle } = usePlayer();
  const [items, setItems] = useState<InventoryItem[]>(() => StorageService.loadInventory());
  const [forgeMastery, setForgeMastery] = useState<ForgeMasteryState>(() => StorageService.loadForgeMastery());
  const [discoveredBlueprintIds, setDiscoveredBlueprintIds] = useState<string[]>(() =>
    StorageService.loadDiscoveredBlueprintIds()
  );
  const [discoveryLog, setDiscoveryLog] = useState<RecipeDiscoveryLogEntry[]>(() =>
    StorageService.loadDiscoveryLog()
  );
  const [chestCounts, setChestCounts] = useState<Record<'common' | 'rare' | 'epic' | 'legendary', number>>(() => {
    try {
      const data = localStorage.getItem(CHEST_COUNT_STORAGE_KEY);
      if (data) return JSON.parse(data);
    } catch {
      // ignore
    }
    return { common: 2, rare: 1, epic: 0, legendary: 0 };
  });

  const [cloudSyncStatus, setCloudSyncStatus] = useState<'idle' | 'syncing' | 'synced' | 'error'>('idle');
  const [lastCloudSyncTime, setLastCloudSyncTime] = useState<number | null>(null);

  const [cloudReady, setCloudReady] = useState(false);
  const currentInventory = { items, chestCounts, forgeMastery, discoveredBlueprintIds };
  const revisionRef = useRef<{ updatedAt: number; dirty: boolean; fingerprint: string }>(null);
  if (!revisionRef.current) {
    let metadata = { updatedAt: 0, dirty: false };
    try { metadata = JSON.parse(localStorage.getItem('arcadex_inventory_sync_v1') || 'null') || metadata; } catch { /* initial inventory */ }
    revisionRef.current = { ...metadata, fingerprint: JSON.stringify(currentInventory) };
  }
  const persistRevision = () => localStorage.setItem('arcadex_inventory_sync_v1', JSON.stringify({
    updatedAt: revisionRef.current!.updatedAt, dirty: revisionRef.current!.dirty,
  }));

  // Persist local changes before accepting asynchronous cloud snapshots. A smaller
  // quantity is a real consumption, not something to merge back with Math.max.
  useEffect(() => {
    const fingerprint = JSON.stringify({ items, chestCounts, forgeMastery, discoveredBlueprintIds });
    if (fingerprint !== revisionRef.current!.fingerprint) {
      revisionRef.current = { fingerprint, updatedAt: Math.max(Date.now(), revisionRef.current!.updatedAt + 1), dirty: true };
    }
    StorageService.saveInventory(items);
    localStorage.setItem(CHEST_COUNT_STORAGE_KEY, JSON.stringify(chestCounts));
    StorageService.saveForgeMastery(forgeMastery);
    StorageService.saveDiscoveredBlueprintIds(discoveredBlueprintIds);
    persistRevision();
  }, [items, chestCounts, forgeMastery, discoveredBlueprintIds]);

  useEffect(() => {
    let mounted = true;
    setCloudReady(false);
    const applyCloud = (data: CloudInventoryData | null) => {
      if (!mounted || !data) return;
      const updatedAt = data.stateUpdatedAt ?? data.updatedAt ?? 0;
      if (updatedAt <= revisionRef.current!.updatedAt) return;
      const next = {
        items: Array.isArray(data.items) ? data.items : StorageService.loadInventory(),
        chestCounts: data.chestCounts ? { common: 0, rare: 0, epic: 0, legendary: 0, ...data.chestCounts } : chestCounts,
        forgeMastery: data.forgeMastery ?? forgeMastery,
        discoveredBlueprintIds: data.discoveredBlueprintIds ?? discoveredBlueprintIds,
      };
      revisionRef.current = { updatedAt, dirty: false, fingerprint: JSON.stringify(next) };
      // Write immediately as well as updating React, so an immediate reload is safe.
      StorageService.saveInventory(next.items);
      localStorage.setItem(CHEST_COUNT_STORAGE_KEY, JSON.stringify(next.chestCounts));
      StorageService.saveForgeMastery(next.forgeMastery);
      StorageService.saveDiscoveredBlueprintIds(next.discoveredBlueprintIds);
      persistRevision();
      setItems(next.items);setChestCounts(next.chestCounts);setForgeMastery(next.forgeMastery);setDiscoveredBlueprintIds(next.discoveredBlueprintIds);
      setCloudSyncStatus('synced');setLastCloudSyncTime(Date.now());
    };
    SupabaseService.loadInventoryFromCloud(profile.id).then(applyCloud).finally(() => { if (mounted) setCloudReady(true); });
    const unsubscribe = SupabaseService.subscribeToCloudInventory(profile.id, applyCloud);
    return () => { mounted = false; unsubscribe(); };
  }, [profile.id]);

  const syncInventory = useCallback(async (): Promise<boolean> => {
    if (!profile.id) return false;
    if (!revisionRef.current!.dirty) return true;
    const revision = revisionRef.current!.updatedAt;
    setCloudSyncStatus('syncing');
    const ok = await SupabaseService.syncInventoryToCloud(profile.id, items, chestCounts,
      forgeMastery, discoveredBlueprintIds, revision);
    if (ok && revisionRef.current!.updatedAt === revision) {
      revisionRef.current!.dirty = false;
      persistRevision();
      setCloudSyncStatus('synced');setLastCloudSyncTime(Date.now());
    } else if (!ok) setCloudSyncStatus('error');
    return ok;
  }, [profile.id, items, chestCounts, forgeMastery, discoveredBlueprintIds]);

  useEffect(() => {
    if (!cloudReady || !revisionRef.current!.dirty) return;
    const timer = setTimeout(() => { void syncInventory(); }, 5000);
    return () => clearTimeout(timer);
  }, [cloudReady, syncInventory]);

  useEffect(() => {
    const retry = () => { if (cloudReady && !document.hidden && navigator.onLine && revisionRef.current!.dirty) void syncInventory(); };
    window.addEventListener('online', retry);
    document.addEventListener('visibilitychange', retry);
    return () => { window.removeEventListener('online', retry); document.removeEventListener('visibilitychange', retry); };
  }, [cloudReady, syncInventory]);

  const manualSyncInventory = useCallback(async () => {
    const ok = await syncInventory();
    if (ok) hapticService.claimReward();
    return ok;
  }, [syncInventory]);

  const addChest = useCallback((type: 'common' | 'rare' | 'epic' | 'legendary', count: number = 1) => {
    setChestCounts(prev => ({
      ...prev,
      [type]: (prev[type] || 0) + count,
    }));
    soundEngine.play('coin');
  }, []);

  const buyChestWithCurrency = useCallback((type: 'common' | 'rare' | 'epic' | 'legendary', currency: 'coins' | 'gems', cost: number): boolean => {
    const success = currency === 'coins' ? spendCoins(cost) : spendGems(cost);
    if (success) {
      addChest(type, 1);
      return true;
    }
    return false;
  }, [spendCoins, spendGems, addChest]);

  const openChest = useCallback((type: 'common' | 'rare' | 'epic' | 'legendary'): ChestOpenResult | null => {
    if ((chestCounts[type] || 0) <= 0) return null;

    const chestConfig: ChestTypeInfo = CHEST_TYPES[type];
    
    // Decrement chest
    setChestCounts(prev => ({
      ...prev,
      [type]: Math.max(0, (prev[type] || 0) - 1),
    }));

    // Random coins & gems
    const coins = Math.floor(Math.random() * (chestConfig.maxCoins - chestConfig.minCoins + 1)) + chestConfig.minCoins;
    const gems = Math.floor(Math.random() * (chestConfig.maxGems - chestConfig.minGems + 1)) + chestConfig.minGems;
    
    addCoins(coins);
    addGems(gems);
    addExp(40);

    // Roll for item with Luck Buff (+10% drop chance & +10% high-tier drop weight)
    let droppedItem: InventoryItem | null = null;
    let isNew = false;

    const hasLuckBuff = Boolean(profile.stats?.hasPermanentLuckBuff || (profile.stats?.dailyStreak && profile.stats.dailyStreak >= 7));
    const effectiveDropChance = hasLuckBuff 
      ? Math.min(1.0, chestConfig.itemDropChance * 1.10) 
      : chestConfig.itemDropChance;

    const shouldDropItem = Math.random() <= effectiveDropChance;
    if (shouldDropItem) {
      // High-tier items get 10% boosted weight if Luck Buff is active
      const adjustedRarities = chestConfig.possibleRarities.map(r => {
        const isHighTier = ['epic', 'legendary', 'mythic', 'relic', 'masterwork', 'eternal'].includes(r.rarity);
        return {
          rarity: r.rarity,
          weight: hasLuckBuff && isHighTier ? r.weight * 1.10 : r.weight,
        };
      });

      const totalWeight = adjustedRarities.reduce((sum, r) => sum + r.weight, 0);
      let randomWeight = Math.random() * totalWeight;
      let selectedRarity: Rarity = adjustedRarities[0].rarity;

      for (const r of adjustedRarities) {
        if (randomWeight < r.weight) {
          selectedRarity = r.rarity;
          break;
        }
        randomWeight -= r.weight;
      }

      // Filter catalog for items with selected rarity
      const candidates = ALL_DEFAULT_ITEMS.filter(i => i.rarity === selectedRarity);
      if (candidates.length > 0) {
        const candidate = candidates[Math.floor(Math.random() * candidates.length)];
        
        const existingIdx = items.findIndex(item => item.id === candidate.id);
        const existing = existingIdx >= 0 ? items[existingIdx] : null;
        isNew = existing ? existing.count === 0 : true;

        if (existing) {
          droppedItem = {
            ...existing,
            count: existing.count + 1,
            unlockedAt: existing.unlockedAt || Date.now(),
          };
        } else {
          droppedItem = {
            ...candidate,
            count: 1,
            unlockedAt: Date.now(),
          };
        }
        
        setItems(prev => {
          const idx = prev.findIndex(item => item.id === candidate.id);
          if (idx >= 0) {
            const updated = [...prev];
            updated[idx] = {
              ...updated[idx],
              count: updated[idx].count + 1,
              unlockedAt: updated[idx].unlockedAt || Date.now(),
            };
            return updated;
          } else {
            return [...prev, {
              ...candidate,
              count: 1,
              unlockedAt: Date.now(),
            }];
          }
        });
      }
    }

    if (type === 'legendary' || type === 'epic') {
      hapticService.chestLegendary();
    } else {
      hapticService.openChest();
    }
    soundEngine.play('chestOpen');
    confetti({
      particleCount: type === 'legendary' ? 120 : type === 'epic' ? 80 : 50,
      spread: 70,
      origin: { y: 0.5 },
    });

    return {
      chestType: type,
      coins,
      gems,
      item: droppedItem,
      isNewItem: isNew,
      hasLuckBuffActive: hasLuckBuff,
    };
  }, [items, chestCounts, profile.stats, addCoins, addGems, addExp]);

  const grantItemById = useCallback((itemId: string, addCount: number = 1): boolean => {
    const defaultItem = ALL_DEFAULT_ITEMS.find(i => i.id === itemId);
    if (!defaultItem) return false;

    setItems(prev => {
      const idx = prev.findIndex(item => item.id === itemId);
      if (idx >= 0) {
        const updated = [...prev];
        updated[idx] = {
          ...updated[idx],
          count: (updated[idx].count || 0) + addCount,
          unlockedAt: updated[idx].unlockedAt || Date.now(),
        };
        return updated;
      } else {
        const newItem: InventoryItem = {
          ...defaultItem,
          count: addCount,
          unlockedAt: Date.now(),
        };
        return [...prev, newItem];
      }
    });
    return true;
  }, []);

  const equipItem = useCallback((itemId: string) => {
    soundEngine.play('click');

    // 1. Resolve target item outside of state updater to prevent side-effects in render cycle
    let targetItem: InventoryItem | null = null;
    const found = items.find(i => i.id === itemId);
    if (found) {
      targetItem = { ...found };
    } else {
      // Check SHOP_THEMES
      const theme = SHOP_THEMES.find(t => t.id === itemId);
      if (theme) {
        targetItem = {
          ...convertThemeToInventoryItem(theme),
          equipped: true,
          count: 1,
          unlockedAt: Date.now(),
        };
      } else {
        // Check ALL_DEFAULT_ITEMS
        const def = ALL_DEFAULT_ITEMS.find(d => d.id === itemId);
        if (def) {
          targetItem = {
            ...def,
            equipped: true,
            count: Math.max(1, def.count || 1),
            unlockedAt: Date.now(),
          };
        } else {
          // Check ELO_TITLE_MILESTONES
          const milestone = ELO_TITLE_MILESTONES.find(m => m.id === itemId || m.title === itemId);
          if (milestone) {
            updateTitle(milestone.title);
            soundEngine.play('powerup');
            return;
          }
        }
      }
    }

    if (!targetItem) return;

    // 2. Call external PlayerProvider state updaters cleanly outside render phase
    if (targetItem.type === 'avatar') {
      updateAvatar(targetItem.icon);
    } else if (targetItem.type === 'title') {
      updateTitle(targetItem.name);
    }

    const resolvedItem = targetItem;
    const targetSlot = getItemSlot(resolvedItem);

    // 3. Pure state update for Inventory items
    setItems(prev => {
      let existsInPrev = false;
      const updated = prev.map(item => {
        if (item.id === resolvedItem.id) {
          existsInPrev = true;
          return { ...item, equipped: true, count: Math.max(1, item.count || 1) };
        }

        // If equipping a skin for a specific game
        if (resolvedItem.type === 'skin' && resolvedItem.gameId) {
          if (item.type === 'skin' && item.gameId === resolvedItem.gameId) {
            return { ...item, equipped: false };
          }
          return item;
        }

        // Standard slot check
        const currentSlot = getItemSlot(item);
        if (currentSlot === targetSlot) {
          return { ...item, equipped: false };
        }
        return item;
      });

      if (!existsInPrev) {
        updated.push({ ...resolvedItem, equipped: true });
      }

      return updated;
    });

    soundEngine.play('powerup');
  }, [items, updateAvatar, updateTitle]);

  const unequipItem = useCallback((itemId: string) => {
    soundEngine.play('click');
    setItems(prev => prev.map(item => item.id === itemId ? { ...item, equipped: false } : item));
  }, []);

  const getEquippedSkinForGame = useCallback((gameId: string): InventoryItem | undefined => {
    return items.find(i => i.gameId === gameId && i.equipped && i.count > 0);
  }, [items]);

  const getEquippedTitle = useCallback((): string => {
    const titleItem = items.find(i => i.type === 'title' && i.equipped && i.count > 0);
    return titleItem ? titleItem.name : 'Tân Binh Arcade';
  }, [items]);

  const getEquippedAvatar = useCallback((): string => {
    const avatarItem = items.find(i => i.type === 'avatar' && i.equipped && i.count > 0);
    return avatarItem ? avatarItem.icon : '👾';
  }, [items]);

  const isItemOwned = useCallback((itemId: string): boolean => {
    const item = items.find(i => i.id === itemId);
    return !!item && item.count > 0;
  }, [items]);

  const purchaseShopTheme = useCallback((themeId: string): { success: boolean; message: string; theme?: ShopTheme } => {
    const theme = SHOP_THEMES.find(t => t.id === themeId);
    if (!theme) {
      return { success: false, message: 'Giao diện không tồn tại trong Arcade Shop!' };
    }

    const currentOwned = items.some(i => i.id === themeId && i.count > 0);
    if (currentOwned) {
      return { success: false, message: 'Bạn đã sở hữu giao diện này rồi!' };
    }

    if (profile.coins < theme.priceCoins) {
      soundEngine.play('error');
      return {
        success: false,
        message: `Bạn cần ${theme.priceCoins.toLocaleString()} Arcade Coins nhưng hiện chỉ có ${profile.coins.toLocaleString()} Xu!`,
      };
    }

    const spent = spendCoins(theme.priceCoins);
    if (!spent) {
      soundEngine.play('error');
      return { success: false, message: 'Giao dịch không thành công, vui lòng kiểm tra lại số dư!' };
    }

    // Play victory sound & launch celebratory confetti
    soundEngine.play('levelUp');
    try {
      confetti({
        particleCount: 80,
        spread: 70,
        origin: { y: 0.6 },
        colors: ['#06b6d4', '#f59e0b', '#ec4899', '#10b981', '#8b5cf6'],
      });
    } catch {
      // ignore in environments without canvas
    }

    setItems(prev => {
      const existingIdx = prev.findIndex(i => i.id === themeId);
      const updated = prev.map(item => {
        // Unequip any previous skin for this specific game
        if (item.type === 'skin' && item.gameId === theme.gameId) {
          return { ...item, equipped: false };
        }
        return item;
      });

      if (existingIdx >= 0) {
        updated[existingIdx] = {
          ...updated[existingIdx],
          count: 1,
          equipped: true,
          unlockedAt: Date.now(),
        };
        return updated;
      } else {
        const newItem = convertThemeToInventoryItem(theme);
        newItem.equipped = true;
        newItem.count = 1;
        newItem.unlockedAt = Date.now();
        return [...updated, newItem];
      }
    });

    return {
      success: true,
      message: `Chúc mừng bạn đã sở hữu thành công "${theme.name}"! Giao diện đã được tự động trang bị cho ${theme.gameTitle}.`,
      theme,
    };
  }, [items, profile.coins, spendCoins]);


  const { craftItems, clearDiscoveryLog, discoverRecipe } = useCrafting({
    items, setItems, forgeMastery, setForgeMastery, setDiscoveredBlueprintIds, setDiscoveryLog, addCoins, addGems, addExp,
  });

  // Stable while every field is unchanged, so useInventory() consumers (GameWrapper) do not
  // re-render on unrelated PlayerContext updates such as coin or exp changes.
  const value = useShallowStable<InventoryContextType>({
    items, chestCounts, forgeMastery, discoveredBlueprintIds, discoveryLog, addChest,
    openChest, buyChestWithCurrency, equipItem, unequipItem, getEquippedSkinForGame, getEquippedTitle,
    getEquippedAvatar, isItemOwned, grantItemById, purchaseShopTheme, craftItems, discoverRecipe,
    clearDiscoveryLog, cloudSyncStatus, lastCloudSyncTime, manualSyncInventory,
  });

  return (
    <InventoryContext.Provider value={value}>
      {children}
    </InventoryContext.Provider>
  );
};

export const useInventory = (): InventoryContextType => {
  const context = useContext(InventoryContext);
  if (!context) {
    throw new Error('useInventory must be used within InventoryProvider');
  }
  return context;
};


