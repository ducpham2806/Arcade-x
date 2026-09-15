const fs = require('fs');
let code = fs.readFileSync('src/components/InventoryModal.tsx', 'utf-8');

code = code.replace(
  '{item.equipped && !item.isChest && (',
  '{item.equipped && !(item as any).isChest && ('
);
code = code.replace(
  '{item.equipped && !item.isChest && (',
  '{item.equipped && !(item as any).isChest && ('
); // in case there are multiple, but just one

code = code.replace(
  'const chestVirtualItems = chestTypes.filter(type => chestCounts[type] > 0).map(type => ({',
  'const chestVirtualItems = chestTypes.filter(type => chestCounts[type] > 0).map(type => ({\n    equipped: false,'
);

fs.writeFileSync('src/components/InventoryModal.tsx', code);
