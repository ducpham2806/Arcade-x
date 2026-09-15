const fs = require('fs');
let code = fs.readFileSync('src/components/InventoryModal.tsx', 'utf-8');

code = code.replace(
  `  const { items, chestCounts, openChest, equipItem, unequipItem, craftItems } = useInventory();
  const { setActiveModal } = useGame();`,
  `  const { items, chestCounts, openChest, equipItem, unequipItem, craftItems } = useInventory();
  const { setActiveModal, reportQuestProgress } = useGame();`
);

code = code.replace(
  `    const result = openChest(type);
    if (result) {
      setOpeningResult(result);
      setSelectedSlot(null);
    }`,
  `    const result = openChest(type);
    if (result) {
      setOpeningResult(result);
      setSelectedSlot(null);
      reportQuestProgress('quest-open-chest', 1);
    }`
);

fs.writeFileSync('src/components/InventoryModal.tsx', code);
