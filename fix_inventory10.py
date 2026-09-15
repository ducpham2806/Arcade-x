import re

with open('src/components/InventoryModal.tsx', 'r', encoding='utf-8') as f:
    lines = f.readlines()

while lines and lines[-1].strip() in ["};", ");", "</div>", "<AnimatePresence>"]:
    lines.pop()

# Let's count properly:
# <div... but NOT <div.../>
div_count = 0
for line in lines:
    divs = len(re.findall(r'<div[^>]*>', line))
    self_closing_divs = len(re.findall(r'<div[^>]*/>', line))
    closing_divs = len(re.findall(r'</div>', line))
    
    div_count += divs
    div_count -= self_closing_divs
    div_count -= closing_divs

print(f"I need {div_count} closing divs")

for i in range(div_count):
    lines.append("      </div>\n")
lines.append("  );\n")
lines.append("};\n")

with open('src/components/InventoryModal.tsx', 'w', encoding='utf-8') as f:
    f.writelines(lines)
