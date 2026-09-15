with open('src/components/InventoryModal.tsx', 'r', encoding='utf-8') as f:
    lines = f.readlines()

while lines and not lines[-1].strip().startswith("};"):
    lines.pop()

lines[-1] = "      </div>\n    </div>\n  );\n};\n"

with open('src/components/InventoryModal.tsx', 'w', encoding='utf-8') as f:
    f.writelines(lines)
