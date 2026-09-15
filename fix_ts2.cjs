const fs = require('fs');
let code = fs.readFileSync('src/components/InventoryModal.tsx', 'utf-8');

code = code.replace(
  '{item.equipped && !(item as any).isChest && (',
  '{(item as any).equipped && !(item as any).isChest && ('
);

code = code.replace(
  '!selectedSlot.isChest',
  '!(selectedSlot as any).isChest'
);

code = code.replace(
  'selectedSlot.isChest ?',
  '(selectedSlot as any).isChest ?'
);

code = code.replace(
  'selectedSlot.chestType',
  '(selectedSlot as any).chestType'
);

fs.writeFileSync('src/components/InventoryModal.tsx', code);
