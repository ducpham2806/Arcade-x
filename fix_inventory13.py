with open('src/components/InventoryModal.tsx', 'r', encoding='utf-8') as f:
    lines = f.readlines()

while lines and lines[-1].strip() in ["};", ");", "</AnimatePresence>", "</div>"]:
    lines.pop()

lines.extend([
    "                </div>\n",
    "              </div>\n",
    "            </div>\n",
    "          </div>\n",
    "        </div>\n",
    "      </div>\n",
    "  );\n",
    "};\n"
])

with open('src/components/InventoryModal.tsx', 'w', encoding='utf-8') as f:
    f.writelines(lines)
