with open('src/components/InventoryModal.tsx', 'r', encoding='utf-8') as f:
    lines = f.readlines()

while lines and lines[-1].strip() in ["};", ");", "</div>"]:
    lines.pop()

# Add exactly 2 closing divs? Wait, I will just run my div counter and add exactly the right number.
div_count = 0
for line in lines:
    div_count += line.count("<div")
    div_count -= line.count("</div")

print(f"I need {div_count} closing divs")

for i in range(div_count):
    lines.append("      </div>\n")
lines.append("    </div>\n")
lines.append("  );\n")
lines.append("};\n")

with open('src/components/InventoryModal.tsx', 'w', encoding='utf-8') as f:
    f.writelines(lines)
