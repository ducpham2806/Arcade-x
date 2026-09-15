import re

with open('src/components/InventoryModal.tsx', 'r', encoding='utf-8') as f:
    content = f.read()

# 1. Remove all Crafting/Forge states if possible, or just ignore for now and focus on the UI.
# 2. Fix the getRaritySlotBoxStyle and getRaritySlotStyle and getRarityBadge to use SharedRarity
# wait, actually, they can just use the local ones, but I'll import SharedRarity in other files for the "throughout the system" part!
# wait, no, "Implement a consistent rarity-based border visual for all items throughout the system" 
# I should export them from `SharedRarity` and use them in ALL items.

content = content.replace("const getRarityBadge = (rarity: Rarity) => {", "export const _getRarityBadge = (rarity: Rarity) => {")
content = content.replace("const getRaritySlotStyle = (rarity: Rarity, isEquipped: boolean, isSelected: boolean) => {", "export const _getRaritySlotStyle = (rarity: Rarity, isEquipped: boolean, isSelected: boolean) => {")

