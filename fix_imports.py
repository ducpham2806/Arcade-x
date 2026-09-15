with open('src/components/CraftingModal.tsx', 'r', encoding='utf-8') as f:
    content = f.read()

content = content.replace("import { getRarityInfo, getRaritySlotBoxStyle, RARITIES, RARITY_ORDER } from '../utils/rarity';", "import { getRarityInfo, getRaritySlotBoxStyle, RARITIES, RARITY_ORDER, getRaritySlotStyle, RarityBadge } from '../utils/rarity';")
content = content.replace("import { getRarityInfo, RARITIES, RARITY_ORDER } from '../utils/rarity';", "import { getRarityInfo, RARITIES, RARITY_ORDER, getRaritySlotStyle, RarityBadge, getRaritySlotBoxStyle } from '../utils/rarity';")
content = content.replace("Gamepad2, ", "")
content = content.replace("} from 'lucide-react';", ", Gamepad2 } from 'lucide-react';")
if "import confetti from 'canvas-confetti';" not in content:
    content = content.replace("import React,", "import confetti from 'canvas-confetti';\nimport React,")
content = content.replace("soundEngine.play('chest')", "soundEngine.play('powerup')")

with open('src/components/CraftingModal.tsx', 'w', encoding='utf-8') as f:
    f.write(content)

with open('src/components/InventoryModal.tsx', 'r', encoding='utf-8') as f:
    inv_content = f.read()
inv_content = inv_content.replace("import { getRarityInfo, getRaritySlotBoxStyle, RARITIES, RARITY_ORDER } from '../utils/rarity';", "import { getRarityInfo, getRaritySlotBoxStyle, RARITIES, RARITY_ORDER, getRaritySlotStyle, RarityBadge } from '../utils/rarity';")
with open('src/components/InventoryModal.tsx', 'w', encoding='utf-8') as f:
    f.write(inv_content)
