import re

with open('src/utils/rarity.ts', 'r', encoding='utf-8') as f:
    content = f.read()

if "export const getRaritySlotStyle =" not in content:
    content += """

export const getRaritySlotStyle = (rarity: Rarity, isEquipped: boolean = false, isSelected: boolean = false): string => {
  let base = 'relative group transition-all duration-200 aspect-square rounded-xl flex items-center justify-center select-none ';
  
  if (isSelected) {
    base += 'ring-2 ring-white scale-105 z-20 shadow-[0_0_20px_rgba(255,255,255,0.5)] ';
  } else {
    base += 'hover:scale-[1.04] active:scale-95 cursor-pointer ';
  }

  return base;
};
"""
    with open('src/utils/rarity.ts', 'w', encoding='utf-8') as f:
        f.write(content)
