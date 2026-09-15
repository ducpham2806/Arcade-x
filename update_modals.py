import re

for filename in ['src/components/InventoryModal.tsx', 'src/components/CraftingModal.tsx']:
    with open(filename, 'r', encoding='utf-8') as f:
        content = f.read()

    # Add import if missing
    if "import { getRaritySlotStyle, RarityBadge } from '../utils/rarity';" not in content:
        content = content.replace("import { getRarityInfo, getRaritySlotBoxStyle } from '../utils/rarity';", "import { getRarityInfo, getRaritySlotBoxStyle, getRaritySlotStyle, RarityBadge } from '../utils/rarity';")
    
    # Remove local getRaritySlotStyle
    content = re.sub(r'const getRaritySlotStyle = \(rarity: Rarity.*?return base;\n  };\n', '', content, flags=re.DOTALL)
    
    # Remove local getRarityBadge
    content = re.sub(r'const getRarityBadge = \(rarity: Rarity\).*?</span>\n    \);\n  };\n', '', content, flags=re.DOTALL)

    # Change getRarityBadge(...) to <RarityBadge rarity={...} />
    content = re.sub(r'\{getRarityBadge\((.*?)\)\}', r'<RarityBadge rarity={\1} />', content)

    with open(filename, 'w', encoding='utf-8') as f:
        f.write(content)
