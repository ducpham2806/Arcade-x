import re

with open('src/App.tsx', 'r', encoding='utf-8') as f:
    content = f.read()

content = content.replace("import { InventoryModal } from './components/InventoryModal';", "import { InventoryModal } from './components/InventoryModal';\nimport { CraftingModal } from './components/CraftingModal';")
content = content.replace("{(activeModal === 'inventory' || activeModal === 'crafting') && (\n          <InventoryModal initialTab={activeModal === 'crafting' ? 'forge' : 'inventory'} />\n        )}", "{activeModal === 'inventory' && <InventoryModal />}\n        {activeModal === 'crafting' && <CraftingModal initialTab='forge' />}")

content = content.replace("{(activeModal === 'inventory' || activeModal === 'crafting') && (\n        <InventoryModal initialTab={activeModal === 'crafting' ? 'forge' : 'inventory'} />\n      )}", "{activeModal === 'inventory' && <InventoryModal />}\n      {activeModal === 'crafting' && <CraftingModal initialTab='forge' />}")

with open('src/App.tsx', 'w', encoding='utf-8') as f:
    f.write(content)
