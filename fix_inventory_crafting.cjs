const fs = require('fs');
let code = fs.readFileSync('src/context/InventoryContext.tsx', 'utf-8');

// Add craftItems to interface
code = code.replace(
  '  grantItemById: (itemId: string) => boolean;',
  '  grantItemById: (itemId: string) => boolean;\n  craftItems: (itemIds: string[]) => InventoryItem | null;'
);

// Define craftItems function
const craftFunction = `
  const craftItems = useCallback((itemIds: string[]): InventoryItem | null => {
    if (itemIds.length !== 3) return null;
    
    // Simple check that all 3 items exist and have same rarity
    let canCraft = true;
    let targetRarity: Rarity | null = null;
    
    // We need to count occurrences to ensure the user has enough of each item
    const countsNeeded: Record<string, number> = {};
    itemIds.forEach(id => { countsNeeded[id] = (countsNeeded[id] || 0) + 1; });
    
    for (const [id, count] of Object.entries(countsNeeded)) {
      const item = items.find(i => i.id === id);
      if (!item || item.count < count) {
        canCraft = false;
        break;
      }
      if (!targetRarity) {
        targetRarity = item.rarity;
      } else if (item.rarity !== targetRarity) {
        canCraft = false;
        break;
      }
    }
    
    if (!canCraft || !targetRarity || targetRarity === 'legendary') return null;
    
    const nextRarityMapping: Record<Rarity, Rarity> = {
      'common': 'rare',
      'rare': 'epic',
      'epic': 'legendary',
      'legendary': 'legendary'
    };
    
    const upgradedRarity = nextRarityMapping[targetRarity];
    const candidates = ALL_DEFAULT_ITEMS.filter(i => i.rarity === upgradedRarity);
    if (candidates.length === 0) return null;
    
    const craftedCandidate = candidates[Math.floor(Math.random() * candidates.length)];
    let craftedItem: InventoryItem | null = null;
    
    setItems(prev => {
      // First decrement the crafted items
      let updated = prev.map(item => {
        if (countsNeeded[item.id]) {
          return { ...item, count: item.count - countsNeeded[item.id], equipped: (item.count - countsNeeded[item.id] === 0) ? false : item.equipped };
        }
        return item;
      });
      
      // Then add the new item
      const idx = updated.findIndex(item => item.id === craftedCandidate.id);
      if (idx >= 0) {
        updated[idx] = {
          ...updated[idx],
          count: updated[idx].count + 1,
          unlockedAt: updated[idx].unlockedAt || Date.now(),
        };
        craftedItem = updated[idx];
      } else {
        const newItem: InventoryItem = {
          ...craftedCandidate,
          count: 1,
          unlockedAt: Date.now(),
        };
        updated.push(newItem);
        craftedItem = newItem;
      }
      return updated;
    });
    
    soundEngine.play('chestOpen');
    confetti({
      particleCount: 100,
      spread: 70,
      origin: { y: 0.5 },
    });
    
    return craftedItem;
  }, [items]);
`;

code = code.replace(
  '  return (\n    <InventoryContext.Provider',
  craftFunction + '\n  return (\n    <InventoryContext.Provider'
);

code = code.replace(
  '        grantItemById,',
  '        grantItemById,\n        craftItems,'
);

fs.writeFileSync('src/context/InventoryContext.tsx', code);
