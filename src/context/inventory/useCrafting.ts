import { useCallback } from 'react';
import type { Dispatch, SetStateAction } from 'react';
import confetti from 'canvas-confetti';
import type { InventoryItem, Rarity, CraftResult, ForgeMasteryState, LegendaryBlueprint, RecipeDiscoveryLogEntry } from '../../types';
import { StorageService, ALL_DEFAULT_ITEMS, FORGE_MASTERY_LEVELS, DEFAULT_LEGENDARY_BLUEPRINTS } from '../../services/storage';
import { soundEngine } from '../../services/audio';
import type { RecipeDiscoveryResult } from '../InventoryContext';

interface CraftingDeps {
  items: InventoryItem[];
  setItems: Dispatch<SetStateAction<InventoryItem[]>>;
  forgeMastery: ForgeMasteryState;
  setForgeMastery: Dispatch<SetStateAction<ForgeMasteryState>>;
  setDiscoveredBlueprintIds: Dispatch<SetStateAction<string[]>>;
  setDiscoveryLog: Dispatch<SetStateAction<RecipeDiscoveryLogEntry[]>>;
  addCoins: (amount: number) => void;
  addGems: (amount: number) => void;
  addExp: (amount: number) => void;
}

/** Forge crafting, forge mastery progression and legendary recipe discovery. */
export function useCrafting({ items, setItems, forgeMastery, setForgeMastery, setDiscoveredBlueprintIds, setDiscoveryLog, addCoins, addGems, addExp }: CraftingDeps) {
  const craftItems = useCallback((itemIds: string[], auxItemId?: string | null): CraftResult | null => {
    if (itemIds.length !== 3) return null;
    
    // Simple check that all 3 items exist and have same rarity
    let canCraft = true;
    let targetRarity: Rarity | null = null;
    
    // We need to count occurrences to ensure the user has enough of each item
    const countsNeeded: Record<string, number> = {};
    itemIds.forEach(id => { countsNeeded[id] = (countsNeeded[id] || 0) + 1; });
    if (auxItemId) {
      countsNeeded[auxItemId] = (countsNeeded[auxItemId] || 0) + 1;
    }
    
    let auxBonus = 0;

    for (const [id, count] of Object.entries(countsNeeded)) {
      const item = items.find(i => i.id === id);
      if (!item || item.count < count) {
        canCraft = false;
        break;
      }
      if (id === auxItemId) {
         if (item.type === 'consumable' || item.id.startsWith('scroll-')) {
           auxBonus = item.bonusValue || (
             item.id === 'scroll-basic' ? 10 :
             item.id === 'scroll-medium' ? 25 :
             item.id === 'scroll-advanced' ? 50 :
             item.id === 'scroll-mythic' ? 75 :
             item.id === 'scroll-relic' ? 100 : 0
           );
         }
      } else {
        if (!targetRarity) {
          targetRarity = item.rarity;
        } else if (item.rarity !== targetRarity) {
          canCraft = false;
          break;
        }
      }
    }
    
    if (!canCraft || !targetRarity || targetRarity === 'eternal') return null;
    
    const nextRarityMapping: Record<Rarity, Rarity> = {
      'common': 'uncommon',
      'uncommon': 'rare',
      'rare': 'epic',
      'epic': 'legendary',
      'legendary': 'mythic',
      'mythic': 'relic',
      'relic': 'masterwork',
      'masterwork': 'eternal',
      'eternal': 'eternal'
    };
    
    const baseSuccessRates: Record<Rarity, number> = {
      'common': 100,
      'uncommon': 80,
      'rare': 60,
      'epic': 40,
      'legendary': 25,
      'mythic': 10,
      'relic': 5,
      'masterwork': 1,
      'eternal': 0
    };

    const upgradedRarity = nextRarityMapping[targetRarity];
    const normalCandidates = ALL_DEFAULT_ITEMS.filter(i => i.rarity === upgradedRarity && i.type !== 'consumable');
    if (normalCandidates.length === 0) return null;

    const baseRate = baseSuccessRates[targetRarity] || 100;
    const finalSuccessRate = Math.min(100, baseRate + auxBonus);
    
    const isSuccess = (Math.random() * 100) <= finalSuccessRate;

    // Check for Critical Crafting (Unlocked at Mastery Level 3+, yields a LEGENDARY item!)
    let isCritical = false;
    let chosenCandidate = null;

    if (isSuccess) {
      if (forgeMastery.criticalUnlocked && Math.random() < forgeMastery.criticalRate) {
        const legendaryCandidates = ALL_DEFAULT_ITEMS.filter(i => i.rarity === 'legendary' && i.type !== 'consumable');
        if (legendaryCandidates.length > 0) {
          chosenCandidate = legendaryCandidates[Math.floor(Math.random() * legendaryCandidates.length)];
          isCritical = true;
        }
      }

      if (!chosenCandidate) {
        chosenCandidate = normalCandidates[Math.floor(Math.random() * normalCandidates.length)];
      }
    }
    
    let craftedItem: InventoryItem | null = null;
    
    if (isSuccess && chosenCandidate) {
      const existingIdx = items.findIndex(item => item.id === chosenCandidate!.id);
      if (existingIdx >= 0) {
        craftedItem = {
          ...items[existingIdx],
          count: items[existingIdx].count + 1,
          unlockedAt: items[existingIdx].unlockedAt || Date.now(),
        };
      } else {
        craftedItem = {
          ...chosenCandidate!,
          count: 1,
          unlockedAt: Date.now(),
        };
      }
    }
    
    setItems(prev => {
      // First decrement the crafted items and aux item
      let updated = prev.map(item => {
        if (countsNeeded[item.id]) {
          return { ...item, count: item.count - countsNeeded[item.id], equipped: (item.count - countsNeeded[item.id] === 0) ? false : item.equipped };
        }
        return item;
      });
      
      // Then add the new item if success
      if (isSuccess && chosenCandidate) {
        const idx = updated.findIndex(item => item.id === chosenCandidate!.id);
        if (idx >= 0) {
          updated[idx] = {
            ...updated[idx],
            count: updated[idx].count + 1,
            unlockedAt: updated[idx].unlockedAt || Date.now(),
          };
        } else {
          const newItem: InventoryItem = {
            ...chosenCandidate!,
            count: 1,
            unlockedAt: Date.now(),
          };
          updated.push(newItem);
        }
      }
      return updated;
    });

    // Calculate Forge Mastery EXP (you get 20% exp even on failure)
    const expByRarity: Record<Rarity, number> = {
      common: 25,
      uncommon: 50,
      rare: 100,
      epic: 200,
      legendary: 400,
      mythic: 600,
      relic: 800,
      masterwork: 1000,
      eternal: 1500,
    };
    let masteryExpGained = expByRarity[targetRarity] || 35;
    if (!isSuccess) {
      masteryExpGained = Math.floor(masteryExpGained * 0.2);
    }

    let didLevelUpMastery = false;
    const nextMastery: ForgeMasteryState = {
      ...forgeMastery,
      exp: forgeMastery.exp + masteryExpGained,
      totalCrafts: forgeMastery.totalCrafts + 1,
      criticalCraftsCount: isCritical ? forgeMastery.criticalCraftsCount + 1 : forgeMastery.criticalCraftsCount,
    };

    // Check level-up progression
    while (nextMastery.level < FORGE_MASTERY_LEVELS.length) {
      const currentLevelDef = FORGE_MASTERY_LEVELS.find(l => l.level === nextMastery.level);
      if (!currentLevelDef || nextMastery.exp < currentLevelDef.expNeeded) break;

      nextMastery.exp -= currentLevelDef.expNeeded;
      nextMastery.level += 1;
      didLevelUpMastery = true;

      const nextLevelDef = FORGE_MASTERY_LEVELS.find(l => l.level === nextMastery.level) || currentLevelDef;
      nextMastery.title = nextLevelDef.title;
      nextMastery.expNeeded = nextLevelDef.expNeeded;
      nextMastery.criticalUnlocked = nextLevelDef.criticalUnlocked;
      nextMastery.criticalRate = nextLevelDef.criticalRate;
    }

    setForgeMastery(nextMastery);
    StorageService.saveForgeMastery(nextMastery);
    
    if (isSuccess) {
      if (isCritical) {
        soundEngine.play('powerup');
        confetti({
          particleCount: 160,
          spread: 90,
          origin: { y: 0.5 },
        });
      } else {
        soundEngine.play('craft');
        confetti({
          particleCount: 100,
          spread: 70,
          origin: { y: 0.5 },
        });
      }
    } else {
      soundEngine.play('error');
    }

    if (didLevelUpMastery) {
      soundEngine.play('levelUp');
    }
    
    return {
      success: isSuccess,
      item: craftedItem || undefined,
      isCritical,
      baseUpgradedRarity: upgradedRarity,
      masteryExpGained,
      newMasteryLevel: nextMastery.level,
      didLevelUpMastery,
    };
  }, [items, forgeMastery]);

  const clearDiscoveryLog = useCallback(() => {
    StorageService.clearDiscoveryLog();
    setDiscoveryLog([]);
  }, []);

  const discoverRecipe = useCallback(
    (ingredientIds: string[]): RecipeDiscoveryResult | null => {
      if (!ingredientIds || ingredientIds.length < 2) return null;

      // Find the items from inventory
      const usedIngredients: InventoryItem[] = [];
      const tempItems = [...items];

      for (const id of ingredientIds) {
        const itemIdx = tempItems.findIndex(i => i.id === id && i.count > 0);
        if (itemIdx === -1) return null; // Missing required ingredient
        usedIngredients.push(tempItems[itemIdx]);
        tempItems[itemIdx] = {
          ...tempItems[itemIdx],
          count: tempItems[itemIdx].count - 1,
        };
      }

      // Update inventory items (remove consumed items)
      const updatedInventory = tempItems.filter(i => i.count > 0);
      setItems(updatedInventory);
      StorageService.saveInventory(updatedInventory);

      // Calculate discovery chance:
      // Base: 25%
      // +10% per uncommon
      // +20% per rare
      // + (forgeMastery.level * 3)%
      let chance = 0.25;
      usedIngredients.forEach(item => {
        if (item.rarity === 'uncommon') chance += 0.10;
        if (item.rarity === 'rare') chance += 0.20;
      });
      chance += (forgeMastery.level || 1) * 0.03;
      chance = Math.min(0.85, chance);

      const roll = Math.random();
      const isSuccess = roll <= chance;

      // Undiscovered blueprints
      const currentUnlocked = StorageService.loadDiscoveredBlueprintIds();
      const availableBlueprints = DEFAULT_LEGENDARY_BLUEPRINTS.filter(
        bp => !currentUnlocked.includes(bp.id)
      );

      let discoveredBlueprint: LegendaryBlueprint | undefined;
      let message = '';
      let coinsEarned = 0;
      let gemsEarned = 0;
      let expEarned = 0;

      if (isSuccess && availableBlueprints.length > 0) {
        // Pick one randomly
        const picked = availableBlueprints[Math.floor(Math.random() * availableBlueprints.length)];
        discoveredBlueprint = picked;
        const newUnlockedList = [...currentUnlocked, picked.id];
        StorageService.saveDiscoveredBlueprintIds(newUnlockedList);
        setDiscoveredBlueprintIds(newUnlockedList);

        coinsEarned = 500;
        gemsEarned = 20;
        expEarned = 200;
        message = `Khám phá thành công! Tìm ra ${picked.name}`;

        addCoins(coinsEarned);
        addGems(gemsEarned);
        addExp(expEarned);

        soundEngine.play('win');
        confetti({
          particleCount: 160,
          spread: 90,
          origin: { y: 0.5 },
          colors: ['#f59e0b', '#fbbf24', '#fef08a', '#f97316', '#ffd700'],
        });
      } else if (isSuccess && availableBlueprints.length === 0) {
        // Master alchemist: already discovered all blueprints!
        coinsEarned = 1000;
        gemsEarned = 50;
        expEarned = 350;
        message = 'Khai phá Đỉnh Cao Bí Thuật! Nhận kho báu Tinh Hoa Giả Kim Thượng Cổ.';

        addCoins(coinsEarned);
        addGems(gemsEarned);
        addExp(expEarned);

        soundEngine.play('win');
        confetti({
          particleCount: 120,
          spread: 80,
          origin: { y: 0.5 },
        });
      } else {
        // Failure: transmutes into Mystic Alchemical Essence
        coinsEarned = 150;
        gemsEarned = 5;
        expEarned = 60;
        message = 'Thử nghiệm thất bại trong việc tạo bản thiết kế mới, ngưng tụ thành Tinh Hoa Giả Kim.';

        addCoins(coinsEarned);
        addGems(gemsEarned);
        addExp(expEarned);

        soundEngine.play('craft');
      }

      // Add log entry
      const logEntry: RecipeDiscoveryLogEntry = {
        id: `log-${Date.now()}-${Math.random().toString(36).substring(2, 7)}`,
        timestamp: Date.now(),
        ingredients: usedIngredients.map(item => ({
          id: item.id,
          name: item.name,
          icon: item.icon,
          rarity: item.rarity,
        })),
        success: isSuccess,
        discoveredBlueprint,
        rewardDescription: message,
        rewardCoins: coinsEarned,
        rewardGems: gemsEarned,
        rewardExp: expEarned,
      };

      const newLog = StorageService.addDiscoveryLogEntry(logEntry);
      setDiscoveryLog(newLog);

      return {
        success: isSuccess,
        blueprint: discoveredBlueprint,
        message,
        coinsEarned,
        gemsEarned,
        expEarned,
      };
    },
    [items, forgeMastery, addCoins, addGems, addExp]
  );

  return { craftItems, clearDiscoveryLog, discoverRecipe };
}
