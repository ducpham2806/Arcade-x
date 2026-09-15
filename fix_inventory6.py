with open('src/components/InventoryModal.tsx', 'r', encoding='utf-8') as f:
    lines = f.readlines()

while lines and lines[-1].strip() in ["};", ");", "</div>"]:
    lines.pop()

# Add exactly 6 closing divs
lines.append("                </div>\n")
lines.append("              </div>\n")
lines.append("            </div>\n")
lines.append("          </div>\n")
lines.append("        </div>\n")
lines.append("      </div>\n")
lines.append("  );\n")
lines.append("};\n")

with open('src/components/InventoryModal.tsx', 'w', encoding='utf-8') as f:
    f.writelines(lines)
