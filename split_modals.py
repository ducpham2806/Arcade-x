import re

with open('src/components/CraftingModal.tsx', 'r', encoding='utf-8') as f:
    content = f.read()

# Change component name
content = content.replace("export const InventoryModal = ", "export const CraftingModal = ")
content = content.replace("export const InventoryModal:", "export const CraftingModal:")

with open('src/components/CraftingModal.tsx', 'w', encoding='utf-8') as f:
    f.write(content)

